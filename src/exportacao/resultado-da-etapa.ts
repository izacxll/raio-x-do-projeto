// Resultado de uma etapa para apresentação (decisões 0072 e 0084): quando uma etapa fecha, um documento com o resultado
// da etapa primeiro (os mesmos relatórios que a tela exporta, sem o prefixo do relatório em cada seção) e, no anexo, o
// processo: as seções do código, o placar resumido e as conferências da segunda instância (achados e o que o GP
// decidiu). Gerado fora do Git, a partir do dossiê e dos arquivos do teste externo; o documento sai sempre como minuta,
// porque o GP do teste não revisou item a item.
import type { Dossie } from "../dossie/esquema";
import { analisarRfp } from "../etapas/1-rfp/analisar-rfp";
import { montarPontoDePartida } from "../etapas/2-proposta/ponto-de-partida";
import {
  camposDoDossie,
  MARCA_PENDENTE,
  type DocumentoExportavel,
  type ParteDoDocumento,
  type Secao,
} from "./modelo";
import { montarPgp } from "./relatorio-pgp";
import { montarPropostaTecnica } from "./relatorio-proposta";
import { montarAnaliseRfp } from "./relatorio-rfp";
import { montarRegistroPremissas, montarTap } from "./relatorio-tap";
import { montarRelatorioConformidade } from "./relatorio-conformidade";
import { resultadoDaEtapa5 } from "../etapas/5-conferencia/resultado";
import { capaDaEtapa } from "./capas";
import { curto, secoesDaCapa } from "./capa-de-decisao";
import { apresentar, lerItem } from "./apresentacao";

export const NOME_DA_ETAPA: Record<number, string> = {
  1: "Leitura da RFP",
  2: "Proposta",
  3: "Termo de abertura (TAP)",
  4: "Plano de gerenciamento do projeto (PGP)",
  5: "Conferência do plano",
};

/** O que o teste externo deixou de cada passo: o placar da importação e a conferência da segunda instância. */
export interface ArquivosDoPasso {
  passo: string;
  /** Conteúdo do resposta-*.placar.md, ou undefined. */
  placar?: string;
  /** Conteúdo do conferencia-*.md, ou undefined (a etapa 5 não tem segunda instância). */
  conferencia?: string;
}

/** Linha de markdown em texto corrido: sem marcadores, negrito nem crase. */
function semMarkdown(l: string): string {
  return l
    .replace(/^#+\s*/, "")
    .replace(/^\s*[-*]\s+/, "• ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

/**
 * O placar resumido: o começo (tokens, citações, achados) e as linhas de título e de resumo de cada bloco, até um
 * limite. O placar inteiro fica na pasta do caso.
 */
export function placarResumido(placar: string, limite = 40): string[] {
  const linhas = placar.split("\n").filter((l) => l.trim());
  const titulo = (l: string) => /^#{1,3}\s/.test(l);
  // o começo vai até o primeiro bloco (no máximo 6 linhas); de cada bloco, o título e a primeira linha
  const k0 = linhas.findIndex((l, k) => k > 0 && titulo(l));
  const comeco = Math.min(6, k0 < 0 ? 6 : k0);
  const resumo = linhas.filter((l, k) => k < comeco || titulo(l) || (k > 0 && titulo(linhas[k - 1] ?? "")));
  const saida = resumo.slice(0, limite).map(semMarkdown);
  if (resumo.length > limite) saida.push(`(… mais ${resumo.length - limite} linha(s) no placar completo)`);
  return saida;
}

/** Os blocos do conferencia-*.md: cabeçalho, achados, conferido e as decisões do GP. */
export function lerConferenciaEmBlocos(texto: string): {
  cabecalho: string[];
  achados: string[];
  conferido: string[];
  decisoes: string[];
} {
  const out = {
    cabecalho: [] as string[],
    achados: [] as string[],
    conferido: [] as string[],
    decisoes: [] as string[],
  };
  let atual: keyof typeof out = "cabecalho";
  for (const l of texto.split("\n")) {
    if (/^## Achados/.test(l)) atual = "achados";
    else if (/^## O que foi conferido/.test(l)) atual = "conferido";
    else if (/^## Decisão do GP/.test(l)) {
      atual = "decisoes";
      out.decisoes.push(semMarkdown(l));
    } else if (l.trim() && !/^# /.test(l)) out[atual].push(semMarkdown(l));
  }
  return out;
}

/** As seções do código (título terminado em "(código)") são do processo: vão para o anexo (decisão 0084). */
export function parteDaSecao(s: Secao): ParteDoDocumento {
  return /\(código\)\s*$/.test(s.titulo) ? "anexo" : (s.parte ?? "corpo");
}

/**
 * O resultado final da etapa: os relatórios que a tela exporta, sem o prefixo do relatório em cada seção (decisão
 * 0084). Na etapa 3, as premissas ficam só no registro de premissas, não também no TAP. Na etapa 5, o relatório de
 * conformidade, calculado como na tela.
 */
function resultadoFinal(dossie: Dossie, etapa: number, agora: Date): Secao[] {
  const docs = dossie.documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
  const secoes = (d: DocumentoExportavel): Secao[] => d.secoes.map((x) => ({ ...x, parte: parteDaSecao(x) }));
  if (etapa === 1) return secoes(montarAnaliseRfp(dossie, analisarRfp(docs, agora), agora));
  // a proposta, o TAP e o PGP são as peças em si: a capa do GP vai antes delas só aqui (decisão 0085)
  const capa = etapa >= 2 && etapa <= 4 ? capaDaEtapa(dossie, etapa, agora) : undefined;
  const comCapa = (s: Secao[]) => (capa && s.length ? [...secoesDaCapa(capa), ...s] : s);
  if (etapa === 2) {
    if (!dossie.proposta) return [];
    return comCapa(
      secoes(
        montarPropostaTecnica(dossie, montarPontoDePartida(docs, dossie.analiseRfp, agora), docs, agora),
      ),
    );
  }
  if (etapa === 3) {
    if (!dossie.tap) return [];
    // o registro de premissas no DOCX: a coluna da revisão do GP com a marca, como os outros itens
    const registro = secoes(montarRegistroPremissas(dossie, agora)).map((x) =>
      x.tabela
        ? {
            ...x,
            tabela: {
              ...x.tabela,
              linhas: x.tabela.linhas.map((l) =>
                l.map((c, k) => (k === l.length - 1 && c === "pendente" ? `${MARCA_PENDENTE} pendente` : c)),
              ),
            },
          }
        : x,
    );
    const linhasDoRegistro = registro.reduce((n, x) => n + (x.tabela?.linhas.length ?? 0), 0);
    // as premissas ficam só no registro; do TAP fica a decisão do GP sobre as premissas críticas
    const tap = secoes(montarTap(dossie, agora)).map((x) =>
      linhasDoRegistro && /^Premissas e restrições/.test(x.titulo)
        ? {
            ...x,
            paragrafos: [
              `${linhasDoRegistro} premissas e restrições no registro de premissas, adiante.`,
              ...(x.paragrafos ?? []).filter((p) => p.startsWith("Premissas críticas que se aplicam")),
            ],
          }
        : x,
    );
    return comCapa(linhasDoRegistro ? [...tap, ...registro] : tap);
  }
  if (etapa === 4) return dossie.pgp ? comCapa(registrosNoAnexo(secoes(montarPgp(dossie, agora)))) : [];
  if (etapa === 5) {
    const r = resultadoDaEtapa5(dossie);
    if (!r) return [];
    return secoes(
      montarRelatorioConformidade(dossie, r.vereditos.contam, r.verificacoes, agora, r.leitura, r.vereditos),
    );
  }
  return [];
}

/**
 * Etapa 4: as partes B do plano (os documentos do projeto: registros, listas, matrizes) vão inteiras para o anexo; o
 * corpo fica com os planos (partes A) e o que os resume está nos quadros (decisão 0085). A seção da parte começa com
 * "Parte Bn do plano."; as continuações herdam.
 */
export function registrosNoAnexo(secoes: Secao[]): Secao[] {
  let doRegistro = false;
  return secoes.map((x) => {
    const parte = /^Parte ([AB])\d+ do plano\.$/.exec(x.paragrafos?.[0] ?? "")?.[1];
    if (parte) doRegistro = parte === "B";
    else if (!/\(continuação\)$/.test(x.titulo)) doRegistro = false;
    return doRegistro ? { ...x, parte: "anexo" as const } : x;
  });
}

/** A leitura do PMO da etapa 5 foi feita para outro plano (o id do plano guardado não é o do documento atual). */
function leituraDeOutroPlano(dossie: Dossie): boolean {
  const pgp = dossie.documentos.find((d) => d.papel === "pgp");
  const conf = dossie.conferencia;
  return Boolean(conf?.leituraPmo && pgp && conf.pgpId && conf.pgpId !== pgp.id);
}

/**
 * O documento de resultado da etapa (decisão 0072): como ler, o placar resumido e as conferências de cada passo e,
 * por fim, o resultado final da etapa.
 */
export function montarResultadoDaEtapa(
  dossie: Dossie,
  etapa: number,
  passos: ArquivosDoPasso[],
  { caso, agora = new Date() }: { caso: string; agora?: Date },
): DocumentoExportavel {
  const processo: Secao[] = [
    {
      titulo: "Como ler este documento",
      parte: "anexo",
      paragrafos: [
        `Resultado da etapa ${etapa} (${NOME_DA_ETAPA[etapa] ?? ""}) no teste externo, caso ${caso}, gerado quando todos os passos da etapa fecharam (com "seguir" do GP ou sem achado pendente).`,
        "O resultado da etapa vem primeiro, como a tela o exporta. Neste anexo, para cada passo: o placar resumido (o que o código conferiu na resposta do PMO) e a conferência da segunda instância (achados, o que passou e a decisão do GP).",
        "Os rótulos valem como na tela: Do documento (com página e trecho), Sugestão e Decisão do GP. Tudo do PMO e da segunda instância é Sugestão; quem decide é o GP.",
      ],
    },
  ];
  for (const p of passos) {
    if (p.placar)
      processo.push({
        titulo: `Passo ${p.passo}: placar resumido`,
        parte: "anexo",
        paragrafos: placarResumido(p.placar),
      });
    if (p.conferencia) {
      const c = lerConferenciaEmBlocos(p.conferencia);
      processo.push({
        titulo: `Passo ${p.passo}: segunda instância`,
        parte: "anexo",
        paragrafos: [
          ...c.cabecalho,
          "Achados:",
          ...(c.achados.length ? c.achados : ["• nenhum"]),
          "O que foi conferido e passou:",
          ...(c.conferido.length ? c.conferido : ["• (não informado)"]),
          ...(c.decisoes.length ? ["O que o GP decidiu e o que foi corrigido:", ...c.decisoes] : []),
        ],
      });
    }
    if (!p.placar && !p.conferencia)
      processo.push({
        titulo: `Passo ${p.passo}`,
        parte: "anexo",
        paragrafos: ["Sem placar nem conferência na pasta do caso."],
      });
  }
  const final = resultadoFinal(dossie, etapa, agora);
  const secoes: Secao[] = [
    ...(final.length
      ? final
      : [
          {
            titulo: "Resultado da etapa",
            paragrafos: [
              etapa !== 5
                ? "O dossiê não tem o resultado desta etapa."
                : leituraDeOutroPlano(dossie)
                  ? "A leitura do PMO no dossiê é de outro plano (o documento do plano mudou depois dela): a tela a descarta, e a etapa 5 fica sem resultado até a leitura ser refeita (decisão 0037)."
                  : "O dossiê não tem a leitura do PMO da conferência: sem ela, a etapa 5 não tem resultado (decisão 0037).",
            ],
          },
        ]),
    ...processo,
  ];
  return {
    titulo: `Resultado da etapa ${etapa} — ${NOME_DA_ETAPA[etapa] ?? ""}`,
    subtitulo: `Teste externo, caso ${caso}`,
    ...camposDoDossie(dossie, etapa),
    minuta: true,
    geradoEm: agora,
    secoes,
  };
}

/**
 * Etapa 4 no padrão de apresentação: o corpo traz os planos em resumo (uma linha por parte A: o que o plano estabelece,
 * pelo primeiro item, e quantos itens tem); o plano inteiro e os registros vão para o anexo (decisão 0089).
 */
export function resumoDosPlanos(secoes: Secao[], nomeDaRfp: string): Secao {
  const linhas: string[][] = [];
  for (let k = 0; k < secoes.length; k++) {
    const s = secoes[k]!;
    const codigo = /^Parte (A\d+) do plano\.$/.exec(s.paragrafos?.[0] ?? "")?.[1];
    if (!codigo) continue;
    const itens = (s.paragrafos ?? []).map((p) => lerItem(p, nomeDaRfp)).filter((i) => i !== undefined);
    const primeiro = itens.find((i) => i.rotulo !== "decisao") ?? itens[0];
    linhas.push([
      s.titulo.replace(/^\d+\.\s*/, ""),
      primeiro ? curto(primeiro.texto, 200) : "a gerar",
      String(itens.length),
      String(itens.filter((i) => i.rotulo === "decisao").length),
    ]);
  }
  return {
    titulo: "Os planos em resumo",
    paragrafos: [
      "O que cada plano estabelece, pelo primeiro item; o texto inteiro de cada plano e os registros estão no anexo técnico.",
    ],
    tabela: {
      colunas: ["Plano", "O que estabelece", "Itens", "Decisões do GP"],
      larguras: [2.2, 6, 0.8, 1],
      linhas,
    },
  };
}

/**
 * O resultado da etapa no padrão de apresentação da FGV Projetos (decisão 0089): capa com o título do estudo e os
 * números-chave, sumário, "o que decidir", os quadros, o corpo sem rótulo por linha e os anexos de revisão e técnico.
 */
export function montarResultadoApresentado(
  dossie: Dossie,
  etapa: number,
  passos: ArquivosDoPasso[],
  opcoes: { caso: string; agora?: Date },
): DocumentoExportavel {
  const agora = opcoes.agora ?? new Date();
  const base = montarResultadoDaEtapa(dossie, etapa, passos, { ...opcoes, agora });
  const capa = capaDaEtapa(dossie, etapa, agora);
  const docs = dossie.documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
  const analise = docs.length ? analisarRfp(docs, agora) : undefined;
  const item = (id: string) => analise?.itens.find((i) => i.id === id);
  const instrumento = item("identificacao:instrumento")?.texto ?? "";
  const nomeDaRfp = /^\s*(?:termo de refer[eê]ncia|TR)\b/i.test(instrumento) ? "TR" : "edital";
  const contratante = item("identificacao:contratante")?.texto;
  const corpo = base.secoes.filter((s) => (s.parte ?? "corpo") === "corpo");
  const tecnico = base.secoes.filter((s) => s.parte === "anexo");
  return apresentar(
    { ...base, titulo: `Resultado da etapa ${etapa}`, subtitulo: undefined },
    corpo,
    tecnico,
    {
      capa,
      nomeDaRfp,
      // o título do estudo, sem o aviso de nome sugerido nem o instrumento entre parênteses
      tituloDoEstudo: base.projeto.replace(/\s+—\s+nome sugerido.*$/, "").replace(/\s*\([^)]*\)\s*$/, ""),
      ...(contratante ? { contratante: curto(contratante, 80) } : {}),
      etapa,
      nomeDaEtapa: NOME_DA_ETAPA[etapa] ?? "",
      destaques: capa?.destaques ?? [],
    },
    etapa === 4 && dossie.pgp ? resumoDosPlanos(corpo, nomeDaRfp) : undefined,
  );
}
