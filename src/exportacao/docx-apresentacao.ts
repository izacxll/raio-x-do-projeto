// DOCX no padrão de apresentação dos documentos da FGV Projetos (decisão 0089): logo à direita no cabeçalho, rodapé
// centralizado em azul com o nome do documento e "página n / total", capa com o título do estudo e os números-chave em
// destaque, sumário, seções numeradas em caixa alta, subtítulos em azul, parágrafos justificados, marcador quadrado
// azul, quadro "Para o GP decidir" e tabelas com legenda. Só a forma: nenhum conteúdo de documento de referência.
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { cor } from "../interface/tokens";
import {
  linhaDeVersoes,
  secoesPorParte,
  TEXTO_MINUTA,
  type Alerta,
  type DecisaoNoQuadro,
  type DocumentoExportavel,
  type NumeroChave,
  type Secao,
  type Tabela,
} from "./modelo";

const FONTE = "Arial";
const SEM_BORDA = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const BORDA = { style: BorderStyle.SINGLE, size: 4, color: cor("bd") };

/** "não informado no TR", "não localizado pelo código…": o que falta sai em vermelho (vinho da identidade). */
const FALTA =
  /(n[aã]o informad[oa] no (?:TR|documento|edital)|n[aã]o localizad[oa] pel[oa] (?:c[oó]digo|ferramenta)[^.;)]*)/i;

/** Texto com **negrito** e as faltas em vermelho, em runs. */
function runs(
  texto: string,
  base: { size?: number; color?: string; bold?: boolean; italics?: boolean } = {},
): TextRun[] {
  const out: TextRun[] = [];
  for (const [k, pedaco] of texto.split(/\*\*/).entries()) {
    const negrito = k % 2 === 1 || base.bold;
    for (const parte of pedaco.split(FALTA)) {
      if (!parte) continue;
      const falta = FALTA.test(parte) && new RegExp(`^${FALTA.source}$`, "i").test(parte);
      out.push(
        new TextRun({
          text: parte,
          font: FONTE,
          size: base.size ?? 20,
          bold: negrito || falta,
          italics: base.italics,
          color: falta ? cor("vinho") : (base.color ?? cor("txt")),
        }),
      );
    }
  }
  return out;
}

function paragrafo(texto: string): Paragraph {
  if (texto.startsWith("• "))
    return new Paragraph({
      numbering: { reference: "marcador", level: 0 },
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 60 },
      children: runs(texto.slice(2)),
    });
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100 },
    children: runs(texto),
  });
}

function celula(
  texto: string,
  o: { cabecalho?: boolean; largura: number; faixa?: boolean; barra?: boolean; span?: number },
) {
  const cheia = o.barra && texto === "█";
  return new TableCell({
    width: { size: o.largura, type: WidthType.PERCENTAGE },
    columnSpan: o.span,
    verticalAlign: VerticalAlign.CENTER,
    shading: o.cabecalho
      ? { type: ShadingType.CLEAR, fill: cor("navy"), color: "auto" }
      : o.faixa
        ? { type: ShadingType.CLEAR, fill: cor("soft"), color: "auto" }
        : cheia
          ? { type: ShadingType.CLEAR, fill: cor("blue"), color: "auto" }
          : undefined,
    children: [
      new Paragraph({
        children: cheia
          ? []
          : runs(texto, {
              size: 17,
              bold: o.cabecalho || o.faixa,
              color: o.cabecalho ? cor("white") : o.faixa ? cor("navy") : cor("txt"),
            }),
      }),
    ],
  });
}

function tabela(t: Tabela): (Table | Paragraph)[] {
  const larguras = t.larguras ?? t.colunas.map(() => 1);
  const soma = larguras.reduce((a, b) => a + b, 0);
  const pct = larguras.map((l) => Math.max(2, Math.round((l / soma) * 100)));
  const faixas = new Set(t.faixas ?? []);
  const linhas = [
    new TableRow({
      tableHeader: true,
      children: t.colunas.map((c, i) => celula(c, { cabecalho: true, largura: pct[i] ?? 10 })),
    }),
    ...t.linhas.map(
      (l, k) =>
        new TableRow({
          children: faixas.has(k)
            ? [celula(l[0] ?? "", { faixa: true, largura: 100, span: t.colunas.length })]
            : l.map((c, i) => celula(c, { largura: pct[i] ?? 10, barra: t.barras && i > 0 })),
        }),
    ),
  ];
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: BORDA,
        bottom: BORDA,
        left: BORDA,
        right: BORDA,
        insideHorizontal: BORDA,
        insideVertical: BORDA,
      },
      rows: linhas,
    }),
    ...(t.legenda
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 200 },
            children: [
              new TextRun({ text: t.legenda, font: FONTE, size: 18, bold: true, color: cor("navy700") }),
            ],
          }),
        ]
      : [new Paragraph({ text: "" })]),
  ];
}

/** O quadro "Para o GP decidir": a decisão, as opções e o impacto, em fundo laranja-claro. */
function quadroDeDecisoes(d: DecisaoNoQuadro[]): (Table | Paragraph)[] {
  const borda = { style: BorderStyle.SINGLE, size: 8, color: cor("laranja") };
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: borda,
        bottom: borda,
        left: borda,
        right: borda,
        insideHorizontal: borda,
        insideVertical: SEM_BORDA,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: cor("laranja"), color: "auto" },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "PARA O GP DECIDIR",
                      font: FONTE,
                      size: 18,
                      bold: true,
                      color: cor("white"),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        ...d.map(
          (x) =>
            new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: cor("laranja-claro"), color: "auto" },
                  children: [
                    new Paragraph({
                      numbering: { reference: "marcador", level: 0 },
                      children: [
                        ...runs(x.decisao, { size: 19, bold: true, color: cor("laranja-txt") }),
                        ...(x.opcoes
                          ? runs(` Opções: ${x.opcoes}.`, { size: 18, color: cor("laranja-txt") })
                          : []),
                        // sem dimensão clara (caixa, prazo, aceite, quem executa), o impacto não aparece
                        ...(x.impacto
                          ? runs(` Impacto: ${x.impacto}.`, {
                              size: 18,
                              italics: true,
                              color: cor("laranja-txt"),
                            })
                          : []),
                      ],
                    }),
                  ],
                }),
              ],
            }),
        ),
      ],
    }),
    new Paragraph({ text: "", spacing: { after: 120 } }),
  ];
}

function alerta(a: Alerta): Paragraph {
  const alto = a.nivel === "alto";
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    shading: { type: ShadingType.CLEAR, fill: cor(alto ? "vinho-claro" : "laranja-claro"), color: "auto" },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: cor(alto ? "vinho" : "laranja"), space: 6 },
    },
    children: [
      new TextRun({
        text: alto ? "Alerta: " : "Atenção: ",
        font: FONTE,
        size: 20,
        bold: true,
        color: cor(alto ? "vinho" : "laranja-txt"),
      }),
      ...runs(a.texto),
    ],
  });
}

function numeros(n: NumeroChave[]): (Table | Paragraph)[] {
  return tabela({
    colunas: ["Indicador", "Valor"],
    larguras: [2, 3],
    linhas: n.map((x) => [x.rotulo, x.valor]),
  });
}

/** Os números-chave da capa em blocos grandes, azuis e centralizados, com uma linha de explicação. */
function destaques(doc: DocumentoExportavel): Table | undefined {
  const d = doc.apresentacao?.destaques.slice(0, 4) ?? [];
  if (!d.length) return undefined;
  const largura = Math.floor(100 / d.length);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: SEM_BORDA,
      bottom: SEM_BORDA,
      left: SEM_BORDA,
      right: SEM_BORDA,
      insideHorizontal: SEM_BORDA,
      insideVertical: { style: BorderStyle.SINGLE, size: 6, color: cor("soft-borda") },
    },
    rows: [
      new TableRow({
        children: d.map(
          (x) =>
            new TableCell({
              width: { size: largura, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 60 },
                  children: [
                    new TextRun({
                      text: x.valor,
                      font: FONTE,
                      // o número grande, como na capa do documento de referência; texto longo um pouco menor
                      size: x.valor.length <= 8 ? 72 : x.valor.length <= 14 ? 52 : 40,
                      bold: true,
                      color: cor("blue"),
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: x.rotulo.toUpperCase(),
                      font: FONTE,
                      size: 16,
                      bold: true,
                      color: cor("navy"),
                    }),
                  ],
                }),
                ...(x.explicacao
                  ? [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: x.explicacao, font: FONTE, size: 15, color: cor("ink") }),
                        ],
                      }),
                    ]
                  : []),
              ],
            }),
        ),
      }),
    ],
  });
}

function titulo(s: Secao, quebra: boolean): Paragraph {
  const nivel2 = s.nivel === 2;
  return new Paragraph({
    heading: nivel2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1,
    pageBreakBefore: quebra,
    spacing: { before: nivel2 ? 200 : quebra ? 0 : 360, after: 120 },
    children: [
      new TextRun({
        text: nivel2 ? s.titulo : s.titulo.toUpperCase(),
        font: FONTE,
        size: nivel2 ? 22 : 26,
        bold: true,
        color: cor(nivel2 ? "navy700" : "navy950"),
      }),
    ],
  });
}

export async function gerarDocxApresentacao(doc: DocumentoExportavel, logo: ArrayBuffer): Promise<Blob> {
  const capa = doc.apresentacao!;
  const nomeCurto = `${doc.titulo} — ${capa.titulo}`;
  const cabecalho = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new ImageRun({ type: "jpg", data: logo, transformation: { width: 150, height: 25 } })],
    }),
    ...(doc.minuta
      ? [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: TEXTO_MINUTA, font: FONTE, size: 14, bold: true, color: cor("vinho") }),
            ],
          }),
        ]
      : []),
  ];
  const rodape = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `${nomeCurto} · página `, font: FONTE, size: 15, color: cor("navy700") }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONTE, size: 15, color: cor("navy700") }),
        new TextRun({ text: " / ", font: FONTE, size: 15, color: cor("navy700") }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONTE, size: 15, color: cor("navy700") }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: linhaDeVersoes(doc), font: FONTE, size: 13, color: cor("ink") })],
    }),
  ];

  // capa: título do estudo, contratante, etapa, data, versões e os números-chave
  const corpo: (Paragraph | Table | TableOfContents)[] = [
    new Paragraph({
      spacing: { before: 1800 },
      children: [
        new TextRun({
          text: doc.titulo.toUpperCase(),
          font: FONTE,
          size: 22,
          bold: true,
          color: cor("blue"),
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: capa.titulo, font: FONTE, size: 48, bold: true, color: cor("navy950") }),
      ],
    }),
    ...(capa.contratante
      ? [
          new Paragraph({
            children: [new TextRun({ text: capa.contratante, font: FONTE, size: 24, color: cor("navy700") })],
          }),
        ]
      : []),
    new Paragraph({
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: `${capa.etapa} · ${doc.geradoEm.toLocaleDateString("pt-BR")}`,
          font: FONTE,
          size: 20,
          color: cor("ink"),
        }),
      ],
    }),
  ];
  const d = destaques(doc);
  if (d) corpo.push(d);
  corpo.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: "SUMÁRIO", font: FONTE, size: 26, bold: true, color: cor("navy950") })],
    }),
    new TableOfContents("Sumário", { hyperlink: true, headingStyleRange: "1-1" }),
  );

  const grupos = secoesPorParte(doc);
  let primeira = true;
  for (const g of grupos) {
    if (g.parte === "anexo") {
      corpo.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
          children: [
            new TextRun({ text: "ANEXOS", font: FONTE, size: 26, bold: true, color: cor("navy950") }),
          ],
        }),
      );
      primeira = false;
    }
    for (const s of g.secoes) {
      // cada seção numerada da capa, dos quadros e do corpo começa numa página na primeira de cada parte
      corpo.push(titulo(s, primeira || (s.nivel !== 2 && g.parte !== "anexo" && s === g.secoes[0])));
      primeira = false;
      if (s.abertura) corpo.push(paragrafo(s.abertura));
      if (s.nota)
        corpo.push(
          new Paragraph({
            spacing: { after: 120 },
            children: runs(s.nota, { size: 17, italics: true, color: cor("ink") }),
          }),
        );
      if (s.decisoes?.length) corpo.push(...quadroDeDecisoes(s.decisoes));
      for (const a of s.alertas ?? []) corpo.push(alerta(a));
      if (s.numeros?.length) corpo.push(...numeros(s.numeros));
      for (const p of s.paragrafos ?? []) corpo.push(paragrafo(p));
      if (s.tabela) corpo.push(...tabela(s.tabela));
    }
  }

  const documento = new Document({
    creator: "Raio-X do Projeto",
    title: nomeCurto,
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: FONTE, size: 20, color: cor("txt") } } },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: { font: FONTE, size: 26, bold: true, color: cor("navy950") },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: { font: FONTE, size: 22, bold: true, color: cor("navy700") },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "marcador",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "■",
              alignment: AlignmentType.LEFT,
              style: {
                run: { color: cor("blue"), size: 14 },
                paragraph: { indent: { left: 360, hanging: 260 } },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        headers: { default: new Header({ children: cabecalho }) },
        footers: { default: new Footer({ children: rodape }) },
        children: corpo,
      },
    ],
  });
  return Packer.toBlob(documento);
}
