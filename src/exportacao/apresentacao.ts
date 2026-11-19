// Resultado da etapa no padrão de apresentação da FGV Projetos (decisão 0089). Transforma o documento do resultado
// (capa de decisão, quadros, corpo e anexo, decisão 0084) em texto institucional para o gestor:
// - os rótulos saem de cada linha e ficam visíveis por seção (CLAUDE.md, seção 1): "Do documento" vira a referência
//   discreta "(TR, p. 4)" no fim da frase; as sugestões do PMO ficam em texto normal, com uma nota no início da seção;
//   as decisões do GP vão para o quadro "Para o GP decidir";
// - as marcas ○ e ◊ e os avisos do código vão para o anexo de revisão, por seção;
// - o que é do funcionamento do app (placar, segunda instância, seções do código) vai para o anexo técnico, e os termos
//   internos saem do corpo;
// - seções numeradas, tabelas com legenda "Tabela N.M – título".
import type { CapaDeDecisao } from "./capa-de-decisao";
import { escolherAlertas, MAXIMO_DE_DECISOES } from "./capa-de-decisao";
import { impactoPeloTexto, NOME_IMPACTO } from "../pmo/fila";
import type {
  CapaDoDocumento,
  DecisaoNoQuadro,
  Destaque,
  DocumentoExportavel,
  Secao,
  Tabela,
} from "./modelo";

export interface ContextoDaApresentacao {
  capa?: CapaDeDecisao;
  /** "TR" ou "edital": como a referência ao documento da etapa 1 aparece no fim da frase. */
  nomeDaRfp: string;
  tituloDoEstudo: string;
  contratante?: string;
  etapa: number;
  nomeDaEtapa: string;
  destaques: Destaque[];
}

/** Item no formato das linhas atuais: marcas, número C, rótulo entre colchetes, texto e avisos entre parênteses. */
interface ItemLido {
  marcas: string;
  numero: string;
  rotulo: "documento" | "sugestao" | "decisao" | "nao-conferida";
  referencia?: string;
  texto: string;
  avisos: string[];
}

const AVISO = /(?:citação|número sem fonte|valor não conferido|redação a conferir|não localizado|conferir)/i;

/** Lê uma linha de item; undefined quando a linha não é item (texto corrido, título de grupo). */
export function lerItem(linha: string, nomeDaRfp: string): ItemLido | undefined {
  const m = /^(?<marcas>[○◊]+ )?(?<num>C\d+ — )?\[(?<rot>[^\]]+)\](?: \[Alerta\])? (?<resto>.*)$/s.exec(
    linha.trim(),
  );
  if (!m?.groups) return undefined;
  const rot = m.groups.rot!;
  let resto = m.groups.resto!.trim();
  const avisos: string[] = [];
  // os avisos do código ficam no fim, entre parênteses
  const fim = /\s\(([^()]*)\)$/.exec(resto);
  if (fim && AVISO.test(fim[1]!)) {
    avisos.push(...fim[1]!.split(/;\s*/));
    resto = resto.slice(0, fim.index).trim();
  }
  let rotulo: ItemLido["rotulo"] = "sugestao";
  let referencia: string | undefined;
  if (/^Decisão do GP/i.test(rot)) rotulo = "decisao";
  else if (/citação não conferida/i.test(rot)) rotulo = "nao-conferida";
  else if (/^Do documento/i.test(rot)) {
    rotulo = "documento";
    const pag = /p\. (\d+)/.exec(rot)?.[1];
    const doc = /proposta/i.test(rot)
      ? "proposta"
      : /\bTAP\b/.test(rot)
        ? "TAP"
        : /contrato/i.test(rot)
          ? "contrato"
          : /\bPGP\b/.test(rot)
            ? "plano"
            : nomeDaRfp;
    referencia = pag ? `${doc}, p. ${pag}` : doc;
  }
  return {
    marcas: (m.groups.marcas ?? "").trim(),
    numero: (m.groups.num ?? "").replace(/ — $/, ""),
    rotulo,
    referencia,
    texto: limparTermosInternos(resto),
    avisos,
  };
}

/**
 * Tira do corpo os termos do funcionamento do app: "código" vira "a ferramenta", "dossiê" vira "arquivo do projeto" e
 * as referências internas entre parênteses (ids de itens, QU-nn) saem. As tabelas e o anexo técnico os mantêm.
 */
export function limparTermosInternos(texto: string): string {
  const id = String.raw`(?:QU-\d+|[a-z]{1,3}\d+(?:_\d+)?|[A-Z]\d{1,2}\.\d+|dv\d+)`;
  // a troca mantém a maiúscula do começo ("Pela conta do código" → "Pelo cálculo da ferramenta")
  const trocar = (novo: string) => (achado: string) =>
    /^[A-ZÀ-Ý]/.test(achado) ? novo.charAt(0).toUpperCase() + novo.slice(1) : novo;
  return (
    texto
      .replace(new RegExp(String.raw`\s*\((?:ver |cf\. )?${id}(?:\s*(?:,|e|;|a)\s*${id})*\)`, "g"), "")
      // "Risco sk01: …" no texto corrido vira "Risco: …" (o id fica nas tabelas)
      .replace(/\bRisco [a-z]{1,3}\d+:/g, "Risco:")
      .replace(/\bpela conta do código\b/gi, trocar("pelo cálculo da ferramenta"))
      .replace(/\bconta do código\b/gi, trocar("cálculo da ferramenta"))
      .replace(/\bpelo código\b/gi, trocar("pela ferramenta"))
      .replace(/\bdo código\b/gi, trocar("da ferramenta"))
      .replace(/\bo código\b/gi, trocar("a ferramenta"))
      .replace(/\bdossiê(?!\p{L})/giu, trocar("arquivo do projeto"))
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

/** Seção que é do funcionamento do app: vai para o anexo técnico. */
export function secaoTecnica(s: Secao): boolean {
  return (
    s.parte === "anexo" ||
    /\((?:código)\)\s*$|placar|segunda instância|autoconferência|situação da minuta|como ler|vereditos do pmo|o que o código|achados do código|travas|cruzamentos|decisão do gp: participar|fora da leitura|capa: resumo e decisões/i.test(
      s.titulo,
    )
  );
}

/** Colunas que são do funcionamento do app (rótulo, estado de revisão): saem das tabelas do corpo. */
const COLUNA_INTERNA = /^(rótulo|estado|revisão do gp|situação \(código\))$/i;

function tabelaDoCorpo(t: Tabela, legenda: string): Tabela {
  const manter = t.colunas.map((c) => !COLUNA_INTERNA.test(c.trim()));
  const limpar = (c: string) =>
    limparTermosInternos(c.replace(/^[○◊]+\s*/, "").replace(/^\[[^\]]+\]\s*/, ""));
  return {
    ...t,
    colunas: t.colunas.filter((_, i) => manter[i]),
    larguras: t.larguras?.filter((_, i) => manter[i]),
    linhas: t.linhas.map((l) => l.filter((_, i) => manter[i]).map(limpar)),
    legenda,
  };
}

/** Uma decisão do GP para o quadro, com o impacto pelo texto (decisão 0088). */
function decisaoDoQuadro(texto: string, opcoes?: string): DecisaoNoQuadro {
  return {
    decisao: texto.replace(/\.$/, ""),
    ...(opcoes ? { opcoes } : {}),
    impacto: NOME_IMPACTO[impactoPeloTexto(texto)] ?? "outro",
  };
}

const NOTA_SUGESTAO = "Conteúdo sugerido pelo PMO, salvo quando a frase traz a referência ao documento.";

/** Uma seção do corpo no padrão: itens sem rótulo por linha, decisões no quadro, marcas para a revisão. */
function secaoDoCorpo(s: Secao, numero: number, nomeDaRfp: string, revisao: string[]): Secao {
  const paragrafos: string[] = [];
  const decisoes: DecisaoNoQuadro[] = [];
  let temSugestao = false;
  for (const p of s.paragrafos ?? []) {
    const i = lerItem(p, nomeDaRfp);
    if (!i) {
      if (!/^Parte [AB]\d+ do plano\.$/.test(p)) paragrafos.push(limparTermosInternos(p));
      continue;
    }
    if (i.marcas || i.avisos.length || i.rotulo === "nao-conferida")
      revisao.push(
        `${numero}. ${s.titulo.replace(/^\d+\.\s*/, "")} — ${i.texto.length > 110 ? `${i.texto.slice(0, 110)}…` : i.texto.replace(/\.$/, "")}: ${[
          i.marcas.includes("○") ? "pendente de revisão do GP" : "",
          i.marcas.includes("◊") ? "redação a conferir" : "",
          i.rotulo === "nao-conferida" ? "citação não conferida" : "",
          ...i.avisos,
        ]
          .filter(Boolean)
          .join("; ")}.`,
      );
    if (i.rotulo === "decisao") {
      decisoes.push(decisaoDoQuadro(i.texto));
      continue;
    }
    if (i.rotulo !== "documento") temSugestao = true;
    const numeroC = i.numero ? `**${i.numero}** — ` : "";
    paragrafos.push(`• ${numeroC}${i.texto}${i.referencia ? ` (${i.referencia})` : ""}`);
  }
  return {
    titulo: `${numero}. ${s.titulo.replace(/^\d+\.\s*/, "")}`,
    parte: "corpo",
    ...(temSugestao ? { nota: NOTA_SUGESTAO } : {}),
    ...(decisoes.length ? { decisoes } : {}),
    ...(s.alertas ? { alertas: s.alertas } : {}),
    paragrafos,
    ...(s.tabela
      ? { tabela: tabelaDoCorpo(s.tabela, `Tabela ${numero}.1 – ${s.titulo.replace(/^\d+\.\s*/, "")}`) }
      : {}),
  };
}

/**
 * O documento do resultado no padrão de apresentação. "corpo" são as seções do resultado da etapa (sem as da capa), e
 * "tecnico" as do processo; na etapa 4, "resumoDoPlano" substitui o plano no corpo (o plano inteiro vai ao anexo).
 */
export function apresentar(
  doc: DocumentoExportavel,
  corpo: Secao[],
  tecnico: Secao[],
  ctx: ContextoDaApresentacao,
  resumoDoPlano?: Secao,
): DocumentoExportavel {
  const secoes: Secao[] = [];
  const revisao: string[] = [];
  const c = ctx.capa;
  // 1. o que decidir: o que é, o quadro das decisões (as 5 primeiras), os alertas e o que mudou
  if (c) {
    secoes.push({
      titulo: "1. O que decidir",
      parte: "capa",
      abertura: c.oQueE,
      decisoes: c.decidir.slice(0, MAXIMO_DE_DECISOES).map((d) => decisaoDoQuadro(limparTermosInternos(d))),
      alertas: escolherAlertas(c.alertas).map((a) => ({ ...a, texto: limparTermosInternos(a.texto) })),
    });
    secoes.push({
      titulo: "Números-chave",
      nivel: 2,
      parte: "capa",
      numeros: c.numeros.map((n) => ({
        rotulo: limparTermosInternos(n.rotulo),
        valor: limparTermosInternos(n.valor),
      })),
    });
    secoes.push({
      titulo: "O que mudou desde a etapa anterior",
      nivel: 2,
      parte: "capa",
      paragrafos: c.mudou.map((m) => `• ${limparTermosInternos(m)}`),
    });
    // 2. o resultado em quadros
    if (c.quadros.length) {
      secoes.push({ titulo: "2. Resultado em quadros", parte: "quadros", paragrafos: [] });
      c.quadros.forEach((q, k) =>
        secoes.push({
          titulo: q.titulo,
          nivel: 2,
          parte: "quadros",
          paragrafos: (q.paragrafos ?? []).map(limparTermosInternos),
          ...(q.tabela
            ? {
                tabela: {
                  ...q.tabela,
                  linhas: q.tabela.linhas.map((l) => l.map(limparTermosInternos)),
                  legenda: `Tabela 2.${k + 1} – ${q.titulo}`,
                },
              }
            : {}),
        }),
      );
    }
  }
  // 3 em diante: o corpo, só o que é útil ao gestor
  let numero = c ? (c.quadros.length ? 3 : 2) : 1;
  const doCorpo = resumoDoPlano ? [resumoDoPlano] : corpo.filter((s) => !secaoTecnica(s));
  const paraOTecnico = resumoDoPlano ? corpo : corpo.filter((s) => secaoTecnica(s));
  for (const s of doCorpo) {
    const nova = secaoDoCorpo(s, numero, ctx.nomeDaRfp, revisao);
    if (!nova.paragrafos?.length && !nova.tabela && !nova.decisoes?.length) continue;
    secoes.push(nova);
    numero++;
  }
  // anexos: a revisão do GP (marcas e avisos por seção) e o técnico (processo, seções do código, plano inteiro)
  secoes.push({
    titulo: "A. Revisão do GP: o que ainda está pendente",
    parte: "anexo",
    paragrafos: [
      "Itens que o GP ainda não revisou (pendente), sugestões com redação a conferir e avisos da conferência automática, por seção.",
      ...(revisao.length ? revisao.map((r) => `• ${r}`) : ["Nenhuma pendência nas seções do corpo."]),
    ],
  });
  secoes.push({
    titulo: "B. Anexo técnico",
    parte: "anexo",
    paragrafos: [
      "O funcionamento da ferramenta, para auditoria: a conferência automática de cada passo, a revisão independente e as seções montadas pelo cálculo.",
    ],
  });
  for (const s of [...paraOTecnico, ...tecnico]) secoes.push({ ...s, parte: "anexo", nivel: 2 });
  const capa: CapaDoDocumento = {
    titulo: ctx.tituloDoEstudo,
    ...(ctx.contratante ? { contratante: ctx.contratante } : {}),
    etapa: `Etapa ${ctx.etapa} · ${ctx.nomeDaEtapa}`,
    destaques: ctx.destaques,
  };
  return { ...doc, secoes, apresentacao: capa };
}
