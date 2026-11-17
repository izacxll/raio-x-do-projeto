// Saídas da etapa 1 pelo método (decisões 0034 e 0035): "Análise da RFP" (DOCX e PDF) nas 8 seções, requisitos e
// prazos (XLSX), checklist de habilitação linha a linha (XLSX) e perguntas de esclarecimento (DOCX), estas com a
// premissa crítica de cada ponto. A tela só exporta depois da leitura do PMO (decisão 0037); um dossiê sem ela sai marcado como "sem a leitura do PMO". Cabeçalho de
// minuta enquanto houver item pendente.
import type { Dossie, RevisaoItem } from "../dossie/esquema";
import type { AnaliseRfp } from "../etapas/1-rfp/analisar-rfp";
import { SECOES_LEITURA, type ItemLeitura, type LeituraRfp } from "../etapas/1-rfp/leitura";
import { contarPendentesDaLeitura, leituraDoDossie, NOME_TRAVA } from "../etapas/1-rfp/leitura-pmo";
import { estadoDoItem } from "../etapas/1-rfp/revisao";
import { compactar } from "../texto/normalizar";
import { camposDoDossie, type DocumentoExportavel, type Secao } from "./modelo";

/** Rótulos curtos, para caber na coluna sem quebrar a palavra. */
const NOME_ROTULO = {
  documento: "Documento",
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

export const AVISO_LEITURA_PARCIAL =
  "Sem a leitura do PMO: só o esqueleto que o código montou (páginas, números, datas, contas e o que as regras acham por padrão de texto). Peça a análise com o PMO antes de usar este documento.";

function base(dossie: Dossie, titulo: string, subtitulo: string, minuta: boolean, agora: Date) {
  return {
    titulo,
    subtitulo,
    ...camposDoDossie(dossie),
    minuta,
    geradoEm: agora,
  };
}

function preparar(dossie: Dossie, analise: AnaliseRfp, agora: Date) {
  const a = dossie.analiseRfp;
  if (!a) throw new Error("a análise da RFP ainda não foi feita");
  const leitura = leituraDoDossie(analise, a, dossie.documentos, agora);
  return { a, leitura, pendentes: contarPendentesDaLeitura(leitura, a) };
}

function origem(i: ItemLeitura): string {
  return i.origem ? `${i.origem.documento}, p. ${i.origem.pagina}` : "—";
}

/**
 * Origem e trecho numa célula só. O trecho que repete o conteúdo da linha, ou o trecho da linha anterior, não
 * é impresso de novo: fica a indicação de onde ele está.
 */
export function origemETrecho(
  i: { origem?: ItemLeitura["origem"] },
  conteudo: string,
  anterior?: { origem?: ItemLeitura["origem"] },
): string {
  if (!i.origem) return "—";
  const onde = `${i.origem.documento}, p. ${i.origem.pagina}`;
  const trecho = compactar(i.origem.trecho);
  if (!trecho) return onde;
  const texto = compactar(conteudo);
  if (
    texto.includes(trecho) ||
    (texto.length >= 30 && trecho.includes(texto) && trecho.length - texto.length <= 12)
  )
    return `${onde} (o trecho é o conteúdo)`;
  if (
    anterior?.origem &&
    anterior.origem.pagina === i.origem.pagina &&
    compactar(anterior.origem.trecho) === trecho
  )
    return `${onde} (mesmo trecho da linha de cima)`;
  return `${onde}: ${i.origem.trecho}`;
}

/** O texto que vale: o editado pelo GP ou o do item. */
function textoFinal(i: ItemLeitura, revisoes: Record<string, RevisaoItem>): string {
  const r = revisoes[i.id];
  if (r?.estado === "editado" && r.textoEditado?.trim() && !i.pergunta) return r.textoEditado;
  return i.texto;
}

function perguntaFinal(i: ItemLeitura, revisoes: Record<string, RevisaoItem>): string {
  const r = revisoes[i.id];
  if (r?.estado === "editado" && r.textoEditado?.trim()) return r.textoEditado;
  return i.pergunta ?? "";
}

function marcas(i: ItemLeitura): string {
  return [
    i.doPmo ? "leitura do PMO" : "",
    i.doPmo && i.citacaoConferida && !i.trava ? "citação conferida" : "",
    i.trava ? NOME_TRAVA[i.trava] : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function tabelaDaSecao(itens: ItemLeitura[], revisoes: Record<string, RevisaoItem>): Secao["tabela"] {
  return {
    colunas: ["Item", "Conteúdo", "Rótulo", "Origem e trecho", "Estado"],
    larguras: [1.6, 4.2, 0.9, 3.4, 0.9],
    linhas: itens.map((i, k) => {
      const texto = textoFinal(i, revisoes);
      const extras = [
        i.porquePesa ? `Por que pesa: ${i.porquePesa}` : "",
        i.pergunta ? `Pergunta sugerida: ${perguntaFinal(i, revisoes)}` : "",
        i.nota ?? "",
        marcas(i) ? `(${marcas(i)})` : "",
      ].filter(Boolean);
      return [
        `${i.premissa ? `${i.premissa} · ` : ""}${i.nome}`,
        [texto, ...extras].join("\n"),
        NOME_ROTULO[i.rotulo],
        i.trava === "citacao-nao-conferida" && i.origem
          ? `Trecho citado pelo PMO, não achado na p. ${i.origem.pagina}: ${i.origem.trecho}`
          : origemETrecho(i, texto, itens[k - 1]),
        NOME_ESTADO[estadoDoItem(revisoes, i.id)],
      ];
    }),
  };
}

function secoesDaLeitura(leitura: LeituraRfp, revisoes: Record<string, RevisaoItem>): Secao[] {
  const out: Secao[] = [];
  SECOES_LEITURA.forEach((s, n) => {
    const itens = leitura.itens.filter((i) => i.secao === s.id);
    const naoAchou = leitura.naoLocalizados[s.id];
    if (!itens.length && !naoAchou?.length) return;
    out.push({
      titulo: `${n + 1}. ${s.titulo}`,
      paragrafos: [
        s.pergunta,
        ...(naoAchou?.length
          ? [`Não localizado pelo código — conferir no documento: ${naoAchou.join("; ")}.`]
          : []),
      ],
      tabela: itens.length ? tabelaDaSecao(itens, revisoes) : undefined,
    });
    // o detalhe consolidado (parcelas, documentos, critérios, obrigações) vem logo depois, um quadro por item
    for (const i of itens.filter((x) => x.tabela?.linhas.length && x.secao !== "habilitacao"))
      out.push({
        titulo: `${i.nome} — detalhe`,
        tabela: { colunas: i.tabela?.colunas ?? [], linhas: i.tabela?.linhas ?? [] },
      });
  });
  return out;
}

export function montarAnaliseRfp(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, leitura, pendentes } = preparar(dossie, analise, agora);
  const secoes: Secao[] = [
    {
      titulo: "Decisão do GP: participar ou não",
      paragrafos: [
        `Decisão: ${NOME_PARTICIPACAO[a.participacao.decisao]}.${a.participacao.justificativa ? ` Justificativa: ${a.participacao.justificativa}` : ""}`,
        "Os pontos de atenção são insumo para a decisão, nunca a decisão.",
        leitura.fonte === "codigo"
          ? AVISO_LEITURA_PARCIAL
          : `Leitura do PMO (${a.leituraPmo?.modelo ?? ""}), conferida pelo código: cada citação procurada na página e cada número no trecho citado. Tudo o que veio do PMO é sugestão.`,
        `${pendentes} itens ainda sem revisão do GP.`,
      ],
    },
    ...secoesDaLeitura(leitura, a.revisoes),
  ];
  if (leitura.foraDaLeitura.length || leitura.ilegiveis.length)
    secoes.push({
      titulo: "Fora da leitura",
      paragrafos: [
        "Pelo método da etapa 1, fica fora o que não muda uma decisão do gerente nem algo que a FGV terá de fazer, entregar, cumprir ou pagar.",
        ...leitura.foraDaLeitura.map((f) => `${f.motivo}: ${f.quantos}.`),
        ...leitura.ilegiveis.map((x) => `Páginas sem texto legível (não lidas): ${x}.`),
      ],
    });
  return {
    ...base(
      dossie,
      "Análise da RFP",
      leitura.fonte === "codigo"
        ? "Sem a leitura do PMO: só o esqueleto do código, com a página de cada item. A ferramenta sugere; quem decide é o GP."
        : "Leitura do PMO, conferida pelo código, com a página de cada item. A ferramenta sugere; quem decide é o GP.",
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
  const { a, leitura } = preparar(dossie, analise, agora);
  const req = leitura.itens.filter((i) => i.numero);
  const prazos = leitura.itens.filter((i) => i.secao === "prazos");
  const pendentes = [...req, ...prazos].filter((i) => estadoDoItem(a.revisoes, i.id) === "pendente").length;
  const linhasDePrazo = prazos.flatMap((i) =>
    i.tabela?.linhas.length
      ? i.tabela.linhas.map((l) => [
          i.nome,
          ...l.slice(0, -1).filter(Boolean).slice(0, 2),
          l.at(-1) ?? "",
          NOME_ESTADO[estadoDoItem(a.revisoes, i.id)],
        ])
      : [
          [
            i.nome,
            textoFinal(i, a.revisoes),
            "",
            String(i.origem?.pagina ?? "—"),
            NOME_ESTADO[estadoDoItem(a.revisoes, i.id)],
          ],
        ],
  );
  return {
    ...base(
      dossie,
      "Requisitos e prazos da RFP",
      "Requisitos numerados e prazos do certame e da execução.",
      pendentes > 0,
      agora,
    ),
    secoes: [
      {
        titulo: "Requisitos",
        tabela: {
          colunas: ["Número", "Requisito", "Descrição", "Origem", "Trecho", "Estado"],
          larguras: [0.8, 1.8, 3.8, 1.1, 3, 0.9],
          linhas: req.map((i) => [
            i.numero ?? "",
            i.nome.replace(/^R\d+ · /, ""),
            `${textoFinal(i, a.revisoes)}${i.nota ? `\n(${i.nota})` : ""}`,
            i.origem ? origem(i) : "incluído pelo GP",
            i.origem?.trecho ?? "",
            NOME_ESTADO[estadoDoItem(a.revisoes, i.id)],
          ]),
        },
      },
      {
        titulo: "Prazos",
        tabela: {
          colunas: ["Grupo", "Prazo", "Quanto ou regra", "Página", "Estado"],
          larguras: [1.4, 3, 2.6, 0.8, 0.9],
          linhas: linhasDePrazo.map((l) => (l.length === 5 ? l : [...l, "", "", "", ""].slice(0, 5))),
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
  const { a, leitura } = preparar(dossie, analise, agora);
  const hab = leitura.itens.filter((i) => i.secao === "habilitacao");
  const lista = hab.find((i) => i.tabela?.linhas.length && /documentos/i.test(i.nome));
  const outros = hab.filter((i) => i !== lista);
  return {
    ...base(
      dossie,
      "Checklist de habilitação",
      "Documentos de habilitação linha a linha da lista do edital, quem entrega e em que prazo. Conferir a seção de habilitação do documento.",
      hab.some((i) => estadoDoItem(a.revisoes, i.id) === "pendente"),
      agora,
    ),
    secoes: [
      ...(lista?.tabela
        ? [
            {
              titulo: lista.nome,
              tabela: {
                colunas: lista.tabela.colunas,
                linhas: lista.tabela.linhas,
                larguras: lista.tabela.colunas.length === 5 ? [0.5, 4, 1.6, 0.7, 1.1] : [0.5, 5, 0.7, 1.1],
              },
            },
          ]
        : []),
      {
        titulo: "Quem entrega, prazo e o que a FGV confere sobre si",
        tabela: {
          colunas: ["Item", "Conteúdo", "Origem", "Estado"],
          larguras: [1.8, 5, 1.2, 0.9],
          linhas: outros.map((i) => [
            i.nome,
            textoFinal(i, a.revisoes),
            origem(i),
            NOME_ESTADO[estadoDoItem(a.revisoes, i.id)],
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
  const { a, leitura } = preparar(dossie, analise, agora);
  const pontos = leitura.itens.filter(
    (i) => i.secao === "atencao" && estadoDoItem(a.revisoes, i.id) !== "descartado",
  );
  const perguntas: string[] = [];
  for (const i of pontos) {
    const pendente = estadoDoItem(a.revisoes, i.id) === "pendente" ? " [pendente de revisão do GP]" : "";
    if (i.pergunta)
      perguntas.push(
        `${perguntas.length + 1}. ${perguntaFinal(i, a.revisoes)} (${i.premissa ? `${i.premissa}; ` : ""}referência: ${origem(i)}${i.trava ? `; ${NOME_TRAVA[i.trava]}` : ""}.)${pendente}`,
      );
    // os vagos juntos num item: uma pergunta por linha da tabela
    else if (i.tabela?.colunas.includes("Pergunta sugerida"))
      for (const l of i.tabela.linhas)
        if (l[2])
          perguntas.push(`${perguntas.length + 1}. ${l[2]} (referência: RFP, p. ${l[1]}.)${pendente}`);
  }
  return {
    ...base(
      dossie,
      "Perguntas de esclarecimento",
      "Perguntas sugeridas a partir dos pontos de atenção da RFP, com a premissa crítica de cada uma. Quais enviar é decisão do GP.",
      pontos.some((i) => estadoDoItem(a.revisoes, i.id) === "pendente"),
      agora,
    ),
    secoes: [
      {
        titulo: "Perguntas",
        paragrafos: perguntas.length ? perguntas : ["Nenhuma pergunta mantida pelo GP."],
      },
    ],
  };
}
