// Relatório de conformidade do PGP (etapa 5): DOCX e PDF; a lista de achados vai para o XLSX.
import type { Gravidade } from "../dominio/fichas";
import type { DecisaoAchado, Dossie } from "../dossie/esquema";
import type { Achado, Verificacao } from "../regras/achado";
import { resumirAchados } from "../regras/conferencia";
import { NOME_SITUACAO_PMO, type AchadoPmoConferido } from "../etapas/5-conferencia/leitura-pmo";
import { camposDoDossie, type DocumentoExportavel, type Secao } from "./modelo";

export const NOME_TIPO = { vago: "Vago", conflituoso: "Conflituoso", ausente: "Ausente" } as const;

/** Gravidade e categoria finais: as do código, ou as que o GP trocou (com justificativa). */
export function aplicarDecisao(
  a: Achado,
  d: DecisaoAchado | undefined,
): Achado & { decisao?: DecisaoAchado } {
  return {
    ...a,
    gravidade: (d?.gravidade as Gravidade | undefined) ?? a.gravidade,
    categoria: d?.categoria || a.categoria,
    decisao: d,
  };
}

function textoDecisao(d: DecisaoAchado | undefined): string {
  if (!d?.procede) return "Pendente";
  const base = d.procede === "sim" ? "Procede" : "Não procede";
  return d.justificativa ? `${base}: ${d.justificativa}` : base;
}

function evidencias(a: Achado): string {
  return a.evidencias.map((e) => `${e.rotulo}: "${e.trecho}"`).join("\n");
}

export function montarRelatorioConformidade(
  dossie: Dossie,
  achados: Achado[],
  verificacoes: Verificacao[],
  agora = new Date(),
  leitura: AchadoPmoConferido[] = [],
): DocumentoExportavel {
  const decisoes = dossie.conferencia?.decisoes ?? {};
  const finais = achados.map((a) => aplicarDecisao(a, decisoes[a.id]));
  const pendentes =
    finais.filter((a) => !a.decisao?.procede).length +
    leitura.filter((a) => !decisoes[`pmo:${a.id}`]?.procede).length;
  const resumo = resumirAchados(finais);
  const conta = (estado: Verificacao["estado"]) => verificacoes.filter((v) => v.estado === estado).length;
  const dispensadas = (dossie.conferencia?.mapa ?? []).filter((p) => p.situacao === "dispensada");

  const secoes: Secao[] = [
    {
      titulo: "Resumo",
      paragrafos: [
        `${finais.length} achados: cada um é vago, conflituoso ou ausente, com a gravidade dada pela parte do plano. ${pendentes} ainda sem decisão do GP.`,
        "Ausente quer dizer não localizado pelo código no plano inteiro: conferir no documento antes de decidir.",
      ],
      tabela: {
        colunas: ["Gravidade", "Vago", "Conflituoso", "Ausente"],
        larguras: [2, 1, 1, 1],
        linhas: (["grave", "média", "baixa"] as const).map((g) => [
          g.charAt(0).toUpperCase() + g.slice(1),
          String(resumo[g].vago),
          String(resumo[g].conflituoso),
          String(resumo[g].ausente),
        ]),
      },
    },
    {
      titulo: "Achados, do mais grave ao menos grave",
      tabela: {
        colunas: [
          "Nº",
          "Gravidade",
          "Tipo",
          "Categoria",
          "Parte",
          "Achado",
          "Evidência",
          "Sugestão",
          "Decisão do GP",
        ],
        larguras: [0.6, 1, 1.1, 1.3, 0.8, 3, 3.5, 3, 1.8],
        linhas: finais.map((a, i) => [
          String(i + 1),
          a.gravidade,
          NOME_TIPO[a.tipo],
          a.categoria,
          a.parte,
          `${a.titulo}. ${a.descricao}`,
          evidencias(a),
          a.sugestao,
          textoDecisao(a.decisao),
        ]),
      },
    },
    {
      titulo: "O que o código não pôde conferir",
      paragrafos: [
        `${conta("nao-verificavel")} verificações não verificáveis (páginas sem texto legível).`,
        `${conta("nao-conferido")} itens do conteúdo mínimo dependem de interpretação ou de estrutura (tabelas, colunas) e não foram conferidos pelo código.`,
        `${conta("dispensavel")} itens dispensáveis pelas características do projeto.`,
      ],
    },
  ];
  if (leitura.length) secoes.push(secaoDaLeitura(leitura, decisoes));
  if (dispensadas.length) {
    secoes.push({
      titulo: "Partes dispensadas pelo GP",
      tabela: {
        colunas: ["Parte", "Justificativa"],
        larguras: [1, 5],
        linhas: dispensadas.map((p) => [p.codigo, p.justificativa || "sem justificativa registrada"]),
      },
    });
  }

  return {
    titulo: "Relatório de conformidade do plano",
    subtitulo:
      "Conferência do PGP feita por código, contra o TAP, a RFP e o conteúdo mínimo das fichas da skill PMO. Cada achado é sugestão: quem decide se procede é o GP.",
    ...camposDoDossie(dossie),
    minuta: pendentes > 0 || finais.length === 0,
    geradoEm: agora,
    secoes,
  };
}

/** Achados da leitura do PMO (F5b): sugestões, com a situação dada pelo código e a decisão do GP. */
function secaoDaLeitura(leitura: AchadoPmoConferido[], decisoes: Record<string, DecisaoAchado>): Secao {
  return {
    titulo: "Leitura do PMO (sugestões)",
    paragrafos: [
      "Leitura opcional pedida pelo GP. Todo achado é sugestão: o código conferiu as citações, procurou no plano inteiro o que o PMO apontou como ausente e aplicou a gravidade e a categoria pela parte do plano.",
    ],
    tabela: {
      colunas: [
        "Nº",
        "Gravidade",
        "Tipo",
        "Parte",
        "Situação (código)",
        "Achado",
        "Evidência",
        "Sugestão",
        "Decisão do GP",
      ],
      larguras: [0.6, 1, 1.1, 0.8, 1.8, 3, 3, 3, 1.8],
      linhas: leitura.map((a, i) => [
        `PMO-${i + 1}`,
        a.gravidade,
        NOME_TIPO[a.tipo],
        a.parte,
        NOME_SITUACAO_PMO[a.situacao],
        `${a.titulo}. ${a.descricao}${a.localizadoEm ? ` O código achou no plano, p. ${a.localizadoEm.pagina}: "${a.localizadoEm.trecho}".` : ""}`,
        a.evidencias.map((e) => `${e.doc.toUpperCase()}, p. ${e.pagina}: "${e.trecho}"`).join("\n") || "—",
        a.sugestao,
        textoDecisao(decisoes[`pmo:${a.id}`]),
      ]),
    },
  };
}

/** Lista de achados para o XLSX: uma aba com os achados do código e, se houver, outra com a leitura do PMO. */
export function montarListaAchados(
  dossie: Dossie,
  achados: Achado[],
  agora = new Date(),
  leitura: AchadoPmoConferido[] = [],
): DocumentoExportavel {
  const doc = montarRelatorioConformidade(dossie, achados, [], agora, leitura);
  const tabela = doc.secoes[1]?.tabela;
  const daLeitura = doc.secoes.find((s) => s.titulo === "Leitura do PMO (sugestões)")?.tabela;
  return {
    ...doc,
    titulo: "Lista de achados",
    secoes: [
      ...(tabela ? [{ titulo: "Achados", tabela }] : []),
      ...(daLeitura ? [{ titulo: "Leitura do PMO", tabela: daLeitura }] : []),
    ],
  };
}
