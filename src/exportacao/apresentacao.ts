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
import { escolherAlertas, MAXIMO_DE_DECISOES, numerosForaDosDestaques } from "./capa-de-decisao";
import { corrigirPlurais } from "../texto/plural";
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
            : pag
              ? nomeDaRfp
              : undefined;
    // sem página, a citação não é verificável: não se põe o nome de um documento que a linha não diz. O item que a
    // própria ferramenta escreveu ("não localizado … — conferir no documento") não é citação: fica sem referência
    const daFerramenta = !pag && /não localizad/i.test(resto);
    referencia = daFerramenta
      ? undefined
      : pag
        ? `${doc}, p. ${pag}`
        : doc
          ? `${doc}, não verificável`
          : "não verificável";
  }
  return {
    marcas: (m.groups.marcas ?? "").trim(),
    numero: (m.groups.num ?? "").replace(/ — $/, ""),
    rotulo,
    referencia,
    // o trecho do documento fica como está (um "Código Civil" citado não vira "ferramenta")
    texto: rotulo === "documento" && referencia ? resto : limparTermosInternos(resto),
    avisos,
  };
}

/**
 * O sinal curto que fica no corpo quando a conferência deixou aviso: o item com citação, número ou trecho a conferir não
 * pode se ler como fato (CLAUDE.md, seção 1). O aviso inteiro vai ao anexo de revisão; "redação a conferir" só lá.
 */
export function sinalNoCorpo(i: Pick<ItemLido, "rotulo" | "avisos">): string | undefined {
  const a = i.avisos.join(" ");
  if (i.rotulo === "nao-conferida" || /citação não conferida/i.test(a)) return "citação não conferida";
  if (/citação a conferir/i.test(a)) return "citação a conferir";
  if (/número sem fonte|valor não conferido/i.test(a)) return "valor não conferido";
  if (/não localizado/i.test(a)) return "não localizado pela ferramenta — conferir no documento";
  if (/não verificável/i.test(a)) return "não verificável";
  return undefined;
}

/**
 * Tira do corpo os termos do funcionamento do app: "código" vira "a ferramenta", "dossiê" vira "arquivo do projeto" e
 * as referências internas entre parênteses (ids de itens, QU-nn) saem. As tabelas e o anexo técnico os mantêm.
 */
export function limparTermosInternos(texto: string): string {
  // ids internos ("a5", "sk01", "a5_3"); unidades como "(m2)", "(km2)" e "(m3)" não são id e ficam
  const id = String.raw`(?:QU-\d+|(?!(?:km|cm|mm|m)\d\b)[a-z]{1,3}\d+(?:_\d+)?|[A-Z]\d{1,2}\.\d+|dv\d+)`;
  // a troca mantém a maiúscula do começo ("Pela conta do código" → "Pelo cálculo da ferramenta")
  const trocar = (novo: string) => (achado: string) =>
    /^[A-ZÀ-Ý]/.test(achado) ? novo.charAt(0).toUpperCase() + novo.slice(1) : novo;
  // "código" do app: em minúscula e não seguido de nome de lei, de cadastro ou de qualificativo ("Código Civil",
  // "código CNAE", "código de conduta", "código interno" ficam)
  const codigo = String.raw`código(?!\s+(?:\p{Lu}|civil|penal|tribut|de defesa|de [ée]tica|de conduta|florestal|eleitoral|de processo|de obras|de acesso|cnae|de barras|interno|fonte))(?![\p{L}-])`;
  const app = (antes: string) => new RegExp(String.raw`(?<!\p{L})${antes}${codigo}`, "gu");
  return (
    texto
      .replace(new RegExp(String.raw`\s*\((?:ver |cf\. )?${id}(?:\s*(?:,|e|;|a)\s*${id})*\)`, "g"), "")
      // "Risco sk01: …" no texto corrido vira "Risco: …" (o id fica nas tabelas)
      .replace(/\bRisco [a-z]{1,3}\d+:/g, "Risco:")
      .replace(app("[Pp]ela conta do "), trocar("pelo cálculo da ferramenta"))
      .replace(app("[Cc]onta do "), trocar("cálculo da ferramenta"))
      .replace(app("[Pp]elo "), trocar("pela ferramenta"))
      .replace(app("[Dd]o "), trocar("da ferramenta"))
      .replace(app("[Oo] "), trocar("a ferramenta"))
      .replace(/\bdossiê(?!\p{L})/giu, trocar("arquivo do projeto"))
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

/** Seção que é do funcionamento do app: vai para o anexo técnico. */
export function secaoTecnica(s: Secao): boolean {
  return s.parte === "anexo" || secaoDoApp(s);
}

/** Seção sobre o funcionamento do app (placar, segunda instância, conferências do código), pelo título. */
function secaoDoApp(s: Secao): boolean {
  return /\((?:código)\)\s*$|placar|segunda instância|autoconferência|situação da minuta|como ler|vereditos do pmo|o que o código|achados do código|travas|cruzamentos|decisão do gp: participar|fora da leitura|capa: resumo e decisões|^passo /i.test(
    s.titulo,
  );
}

/** Colunas do estado de revisão: saem das tabelas do corpo, e o que está pendente vai ao anexo de revisão. */
const COLUNA_DE_REVISAO = /^(estado|revisão do gp)$/i;

/**
 * A tabela de uma seção do corpo. A coluna do rótulo fica (é o rótulo visível de cada linha, CLAUDE.md seção 1); a do
 * estado de revisão sai, e cada linha pendente ou com marca vai ao anexo de revisão, com o nome da seção.
 */
function tabelaDoCorpo(
  t: Tabela,
  legenda: string,
  secao: string,
  revisao: string[],
): { tabela: Tabela; temSugestao: boolean } {
  const manter = t.colunas.map((c) => !COLUNA_DE_REVISAO.test(c.trim()));
  const rotulo = t.colunas.findIndex((c) => /^rótulo$/i.test(c.trim()));
  let temSugestao = false;
  for (const l of t.linhas) {
    if (rotulo >= 0 && /sugest/i.test(l[rotulo] ?? "")) temSugestao = true;
    const pendente = l.some((c, i) => !manter[i] && /pendente|○/i.test(c));
    const marcas = l.join(" ");
    const motivos = [
      pendente || /^○/.test(l[0] ?? "") ? "pendente de revisão do GP" : "",
      /◊/.test(marcas) ? "redação a conferir" : "",
    ].filter(Boolean);
    if (motivos.length) {
      const nome = limparTermosInternos((l[0] ?? "").replace(/^[○◊]+\s*/, "").split("\n")[0]!);
      revisao.push(
        `${secao} — ${nome.length > 110 ? `${nome.slice(0, 110)}…` : nome}: ${motivos.join("; ")}.`,
      );
    }
  }
  const limpar = (c: string) => limparTermosInternos(c.replace(/^[○◊]+\s*/, ""));
  return {
    tabela: {
      ...t,
      colunas: t.colunas.filter((_, i) => manter[i]).map((c) => c.replace(/\s*\(código\)$/i, "")),
      larguras: t.larguras?.filter((_, i) => manter[i]),
      linhas: t.linhas.map((l) => l.filter((_, i) => manter[i]).map(limpar)),
      legenda,
    },
    temSugestao,
  };
}

/** Uma decisão do GP para o quadro, com o impacto pelo texto (decisão 0088); sem dimensão clara, sem impacto. */
function decisaoDoQuadro(texto: string, opcoes?: string): DecisaoNoQuadro {
  const impacto = impactoPeloTexto(texto);
  return {
    decisao: texto.replace(/\.$/, ""),
    ...(opcoes ? { opcoes } : {}),
    ...(impacto < 5 && NOME_IMPACTO[impacto] ? { impacto: NOME_IMPACTO[impacto] } : {}),
  };
}

/**
 * A decisão do GP sem a marca ○ que o texto diz estar em aberto (as linhas de decisão montadas pela ferramenta):
 * "a definir" ou "a decidir" como expressão, em qualquer ponto da linha; e, depois do nome ("Nome: texto"),
 * "pendente(s)" como palavra, pergunta ou "Decisão do GP" no fim. "Decisões do GP (N pendentes)" está em aberto só com
 * N maior que zero. Requisito incluído pelo GP ("R12 · …") não passa por aqui: sem a marca, ele já foi revisado.
 */
export function decisaoEmAberto(texto: string): boolean {
  const contagem = /^Decis(?:ão|ões) do GP \((\d+) pendentes?\)/i.exec(texto);
  if (contagem) return Number(contagem[1]) > 0;
  if (/^R\d+\s·/.test(texto)) return false;
  if (/(?<!\p{L})a (?:definir|decidir)(?!\p{L})/iu.test(texto)) return true;
  const doisPontos = texto.indexOf(": ");
  const depois = doisPontos >= 0 ? texto.slice(doisPontos + 2) : texto;
  return /(?<!\p{L})pendentes?(?!\p{L})|\?|decis(?:ão|ões) do GP\.?$/iu.test(depois);
}

/** A frase do corpo que termina com a referência ao documento ("(TR, p. 4)"). */
const REFERENCIA_NO_FIM =
  /\((?:TR|edital|proposta|TAP|contrato|plano)(?:, p\. \d+|, não verificável)[^()]*\)$/;

const NOTA_SUGESTAO = "Conteúdo sugerido pelo PMO, salvo quando a frase traz a referência ao documento.";

/** Uma seção do corpo no padrão: itens sem rótulo por linha, decisões no quadro, marcas para a revisão. */
function secaoDoCorpo(
  s: Secao,
  numero: number,
  nomeDaRfp: string,
  revisao: string[],
  /** Como a seção aparece no anexo de revisão; por padrão, o número e o título no corpo. */
  ondeNaRevisao = `${numero}. ${s.titulo.replace(/^\d+\.\s*/, "")}`,
): Secao {
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
        `${ondeNaRevisao} — ${i.texto.length > 110 ? `${i.texto.slice(0, 110)}…` : i.texto.replace(/\.$/, "")}: ${[
          i.marcas.includes("○") ? "pendente de revisão do GP" : "",
          i.marcas.includes("◊") ? "redação a conferir" : "",
          i.rotulo === "nao-conferida" ? "citação não conferida" : "",
          ...i.avisos,
        ]
          .filter(Boolean)
          .join("; ")}.`,
      );
    // a decisão ainda aberta vai ao quadro: a marcada como pendente e a que o próprio texto diz estar em aberto (as
    // linhas de decisão montadas pela ferramenta não levam a marca); só a revisada e fechada fica no texto
    if (i.rotulo === "decisao" && (i.marcas.includes("○") || decisaoEmAberto(i.texto))) {
      decisoes.push(decisaoDoQuadro(i.texto));
      continue;
    }
    if (i.rotulo === "sugestao" || i.rotulo === "nao-conferida") temSugestao = true;
    const numeroC = i.numero ? `**${i.numero}** — ` : "";
    const fim = [i.referencia, sinalNoCorpo(i)].filter(Boolean).join("; ");
    const decidido = i.rotulo === "decisao" ? "Decisão do GP: " : "";
    paragrafos.push(`• ${numeroC}${decidido}${i.texto}${fim ? ` (${fim})` : ""}`);
  }
  const tabela = s.tabela
    ? tabelaDoCorpo(
        s.tabela,
        `Tabela ${numero}.1 – ${s.titulo.replace(/^\d+\.\s*/, "")}`,
        ondeNaRevisao,
        revisao,
      )
    : undefined;
  if (tabela?.temSugestao) temSugestao = true;
  return {
    titulo: `${numero}. ${s.titulo.replace(/^\d+\.\s*/, "")}`,
    parte: "corpo",
    ...(temSugestao ? { nota: NOTA_SUGESTAO } : {}),
    ...(decisoes.length ? { decisoes } : {}),
    ...(s.alertas ? { alertas: s.alertas } : {}),
    paragrafos,
    ...(tabela ? { tabela: tabela.tabela } : {}),
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
      numeros: numerosForaDosDestaques(c).map((n) => ({
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
  // o conteúdo que foi ao anexo técnico (na etapa 4, o plano inteiro e os registros) também tem as pendências (marcas,
  // avisos, decisões) listadas na revisão; as seções do funcionamento do app não têm item
  for (const s of [...paraOTecnico, ...tecnico].filter((x) => !secaoDoApp(x)))
    secaoDoCorpo(s, 0, ctx.nomeDaRfp, revisao, `Anexo B, ${s.titulo.replace(/^\d+\.\s*/, "")}`);
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
    ...(c?.resumo ? { resumo: corrigirPlurais(limparTermosInternos(c.resumo)) } : {}),
  };
  // o cabeçalho de minuta fica enquanto houver item sem revisão do GP (nos documentos da etapa ou na revisão)
  // e enquanto houver decisão do GP em aberto no corpo
  const pendente =
    revisao.some((r) => /pendente de revisão do GP/.test(r)) ||
    secoes.some((s) => s.parte === "corpo" && (s.decisoes?.length ?? 0) > 0);
  // o placar e a conferência vêm prontos da pasta do caso, em parágrafos: os "N item(ns)" deles saem no plural certo.
  // A frase com a referência ao documento é citação e fica literal; as tabelas também (trazem trechos citados, e o
  // texto do app nelas já sai no plural certo)
  const semParenteses = secoes.map((s) => ({
    ...s,
    ...(s.paragrafos
      ? { paragrafos: s.paragrafos.map((p) => (REFERENCIA_NO_FIM.test(p) ? p : corrigirPlurais(p))) }
      : {}),
  }));
  return { ...doc, minuta: doc.minuta || pendente, secoes: semParenteses, apresentacao: capa };
}
