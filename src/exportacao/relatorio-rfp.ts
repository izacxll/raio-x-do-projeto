// Saídas da etapa 1: "Análise da RFP" (DOCX e PDF), lista de requisitos e quadro de prazos (XLSX), checklist
// de habilitação (XLSX) e perguntas de esclarecimento (DOCX). Cabeçalho de minuta enquanto houver item pendente.
import type { Dossie, RevisaoItem } from "../dossie/esquema";
import { NOME_SECAO, ORDEM_SECOES, type AnaliseRfp } from "../etapas/1-rfp/analisar-rfp";
import { contarPendentes, ehRevisavel, estadoDoItem, itensFinais, textoFinal } from "../etapas/1-rfp/revisao";
import type { ItemAnalise } from "../extracao/rfp/item";
import type { DocumentoExportavel, Secao } from "./modelo";

const NOME_ROTULO = {
  documento: "Do documento",
  sugestao: "Sugestão",
  "decisao-gp": "Decisão do GP",
} as const;
const NOME_ESTADO = {
  pendente: "Pendente",
  aceito: "Aceito",
  editado: "Editado",
  descartado: "Descartado",
} as const;
const NOME_PARTICIPACAO = {
  "a-decidir": "a decidir pelo GP",
  participar: "participar",
  "nao-participar": "não participar",
} as const;

function origem(i: ItemAnalise): string {
  return i.origem ? `${i.origem.documento}, p. ${i.origem.pagina}` : "—";
}

function estado(i: ItemAnalise, revisoes: Record<string, RevisaoItem>): string {
  return ehRevisavel(i) ? NOME_ESTADO[estadoDoItem(revisoes, i.id)] : "—";
}

function base(dossie: Dossie, titulo: string, subtitulo: string, minuta: boolean, agora: Date) {
  return {
    titulo,
    subtitulo,
    projeto: dossie.projeto.nome.trim() || "Projeto sem nome",
    minuta,
    geradoEm: agora,
    versaoApp: dossie.versaoApp,
    versaoSkill: dossie.versaoSkill,
  };
}

function preparar(dossie: Dossie, analise: AnaliseRfp) {
  const a = dossie.analiseRfp;
  if (!a) throw new Error("a análise da RFP ainda não foi feita");
  const itens = itensFinais(analise, a);
  return { a, itens, pendentes: contarPendentes(itens, a.revisoes) };
}

function tabelaGeral(itens: ItemAnalise[], revisoes: Record<string, RevisaoItem>): Secao["tabela"] {
  const extras = [...new Set(itens.flatMap((i) => Object.keys(i.campos ?? {})))].filter(
    (c) => c !== "Trecho",
  );
  return {
    colunas: ["Item", "Conteúdo", ...extras, "Rótulo", "Origem", "Trecho do documento", "Estado"],
    larguras: [1.6, 3.2, ...extras.map(() => 1.1), 1, 1.1, 3.2, 0.9],
    linhas: itens.map((i) => [
      i.nome,
      `${textoFinal(i, revisoes)}${i.nota ? `\n(${i.nota})` : ""}`,
      ...extras.map((c) => i.campos?.[c] ?? ""),
      NOME_ROTULO[i.rotulo],
      origem(i),
      i.origem?.trecho ?? "",
      estado(i, revisoes),
    ]),
  };
}

export function montarAnaliseRfp(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, itens, pendentes } = preparar(dossie, analise);
  const secoes: Secao[] = [
    {
      titulo: "Decisão do GP: participar ou não",
      paragrafos: [
        `Decisão: ${NOME_PARTICIPACAO[a.participacao.decisao]}.${a.participacao.justificativa ? ` Justificativa: ${a.participacao.justificativa}` : ""}`,
        "Os pontos de atenção abaixo são insumo para a decisão, nunca a decisão.",
        `${pendentes} itens ainda sem revisão do GP.`,
      ],
    },
  ];
  for (const s of ORDEM_SECOES) {
    const daSecao = itens.filter((i) => i.secao === s);
    if (!daSecao.length) continue;
    if (s === "brechas") {
      secoes.push({
        titulo: NOME_SECAO[s],
        paragrafos: [
          "Brechas do texto (o que está contraditório, em aberto ou transfere responsabilidade), não riscos do projeto. Cada uma traz uma pergunta de esclarecimento sugerida, por modelo de texto.",
        ],
        tabela: {
          colunas: ["Nº", "Tipo", "Brecha", "O que o código viu", "Trecho", "Pergunta sugerida", "Estado"],
          larguras: [0.5, 1.2, 2.4, 2.6, 2.8, 3.2, 0.9],
          linhas: daSecao.map((i, k) => [
            String(k + 1),
            i.campos?.Tipo ?? "",
            i.nome,
            i.texto,
            `${origem(i)}: ${i.origem?.trecho ?? ""}`,
            textoFinal(i, a.revisoes),
            estado(i, a.revisoes),
          ]),
        },
      });
      continue;
    }
    secoes.push({ titulo: NOME_SECAO[s], tabela: tabelaGeral(daSecao, a.revisoes) });
  }
  secoes.push({
    titulo: "O que o código não pôde conferir",
    paragrafos: [
      'Não achado não é ausente: o que aparece como "não localizado pelo código" pode estar no documento com outra redação. Página sem texto legível deixa o item "não verificável".',
      ...analise.documentos
        .filter((d) => d.ilegiveis.length)
        .map((d) => `${d.rotulo}: páginas sem texto legível ${d.ilegiveis.join(", ")}.`),
      `Itens não localizados: ${
        itens
          .filter((i) => i.situacao === "nao-localizado")
          .map((i) => i.nome)
          .join("; ") || "nenhum"
      }.`,
    ],
    tabela: {
      colunas: ["Regra", "O que procura", "Resultado", "Detalhe"],
      larguras: [1.2, 3, 1.3, 4],
      linhas: analise.regras.map((r) => [
        r.regra,
        r.nome,
        r.estado === "achado"
          ? "achado"
          : r.estado === "nao-verificavel"
            ? "não verificável"
            : "não identificado",
        r.motivo,
      ]),
    },
  });
  return {
    ...base(
      dossie,
      "Análise da RFP",
      "Leitura da solicitação de proposta feita por código, com a página de cada item. A ferramenta sugere; quem decide é o GP.",
      pendentes > 0,
      agora,
    ),
    secoes,
  };
}

export function montarRequisitosEPrazos(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, itens } = preparar(dossie, analise);
  const req = itens.filter((i) => i.secao === "requisitos");
  const prazos = itens.filter((i) => i.secao === "prazos");
  const pendentes = contarPendentes([...req, ...prazos], a.revisoes);
  return {
    ...base(
      dossie,
      "Requisitos e prazos da RFP",
      "Lista de requisitos numerados e quadro de prazos.",
      pendentes > 0,
      agora,
    ),
    secoes: [
      {
        titulo: "Requisitos",
        tabela: {
          colunas: ["Número", "Tipo", "Requisito", "Descrição", "Origem", "Trecho", "Estado"],
          larguras: [0.8, 1.3, 1.8, 3.5, 1.1, 3, 0.9],
          linhas: req.map((i) => [
            i.campos?.Número ?? "",
            i.campos?.Tipo ?? "",
            i.nome.replace(/^R\d+ · /, ""),
            textoFinal(i, a.revisoes),
            i.origem ? origem(i) : "incluído pelo GP",
            i.origem?.trecho ?? "",
            estado(i, a.revisoes),
          ]),
        },
      },
      {
        titulo: "Prazos",
        tabela: {
          colunas: [
            "Prazo",
            "Data ou valor",
            "Momento",
            "Contagem",
            "Alerta",
            "Origem",
            "Trecho",
            "Observação",
            "Estado",
          ],
          larguras: [1.8, 2, 0.8, 1.3, 1.4, 1.1, 3, 2.5, 0.9],
          linhas: prazos.map((i) => [
            i.nome,
            textoFinal(i, a.revisoes),
            i.campos?.Momento ?? "",
            i.campos?.Contagem ?? "",
            i.campos?.Alerta ?? "",
            origem(i),
            i.origem?.trecho ?? "",
            i.nota ?? "",
            estado(i, a.revisoes),
          ]),
        },
      },
    ],
  };
}

export function montarChecklistHabilitacao(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, itens } = preparar(dossie, analise);
  const hab = itens.filter((i) => i.secao === "habilitacao");
  return {
    ...base(
      dossie,
      "Checklist de habilitação",
      "Documentos de habilitação que o código localizou na RFP. Item que não aparece aqui pode estar no documento com outra redação: conferir a seção de habilitação.",
      contarPendentes(hab, a.revisoes) > 0,
      agora,
    ),
    secoes: [
      {
        titulo: "Habilitação",
        tabela: {
          colunas: ["Grupo", "Documento", "Trecho da RFP", "Origem", "Providenciado", "Estado da revisão"],
          larguras: [1.4, 2.2, 3.6, 1.1, 1.1, 1],
          linhas: hab.map((i) => [
            i.campos?.Grupo ?? "",
            i.nome,
            textoFinal(i, a.revisoes) === i.texto ? (i.origem?.trecho ?? i.texto) : textoFinal(i, a.revisoes),
            origem(i),
            "",
            estado(i, a.revisoes),
          ]),
        },
      },
    ],
  };
}

export function montarPerguntas(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, itens } = preparar(dossie, analise);
  const brechas = itens.filter((i) => i.secao === "brechas" && i.pergunta);
  const validas = brechas.filter((i) => estadoDoItem(a.revisoes, i.id) !== "descartado");
  const pendentes = contarPendentes(brechas, a.revisoes);
  return {
    ...base(
      dossie,
      "Perguntas de esclarecimento",
      "Perguntas sugeridas a partir dos vagos e das brechas da RFP. Quais enviar é decisão do GP.",
      pendentes > 0,
      agora,
    ),
    secoes: [
      {
        titulo: "Perguntas",
        paragrafos: validas.length
          ? validas.map(
              (i, k) =>
                `${k + 1}. ${textoFinal(i, a.revisoes)} (Referência: ${origem(i)}.)${estadoDoItem(a.revisoes, i.id) === "pendente" ? " [pendente de revisão do GP]" : ""}`,
            )
          : ["Nenhuma pergunta mantida pelo GP."],
      },
    ],
  };
}
