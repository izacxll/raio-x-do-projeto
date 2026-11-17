// Montador DOCX (formato padrão, por ser editável).
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { cor } from "../interface/tokens";
import { linhaDeVersoes, TEXTO_MINUTA, type DocumentoExportavel, type Tabela } from "./modelo";

const FONTE = "Arial";

function tabelaDocx(t: Tabela): Table {
  const larguras = t.larguras ?? t.colunas.map(() => 1);
  const soma = larguras.reduce((a, b) => a + b, 0);
  const pct = larguras.map((l) => Math.round((l / soma) * 100));
  const celula = (texto: string, i: number, cabecalho: boolean) =>
    new TableCell({
      width: { size: pct[i] ?? 10, type: WidthType.PERCENTAGE },
      shading: cabecalho ? { type: ShadingType.CLEAR, fill: cor("navy"), color: "auto" } : undefined,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: texto,
              font: FONTE,
              size: 18,
              bold: cabecalho,
              color: cabecalho ? cor("white") : cor("txt"),
            }),
          ],
        }),
      ],
    });
  const borda = { style: BorderStyle.SINGLE, size: 4, color: cor("bd") };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borda,
      bottom: borda,
      left: borda,
      right: borda,
      insideHorizontal: borda,
      insideVertical: borda,
    },
    rows: [
      new TableRow({ tableHeader: true, children: t.colunas.map((c, i) => celula(c, i, true)) }),
      ...t.linhas.map((l) => new TableRow({ children: l.map((c, i) => celula(c, i, false)) })),
    ],
  });
}

export async function gerarDocx(doc: DocumentoExportavel, logo: ArrayBuffer): Promise<Blob> {
  const cabecalho: Paragraph[] = [
    new Paragraph({
      children: [new ImageRun({ type: "jpg", data: logo, transformation: { width: 180, height: 30 } })],
    }),
  ];
  if (doc.minuta) {
    cabecalho.push(
      new Paragraph({
        spacing: { before: 120 },
        children: [
          new TextRun({ text: TEXTO_MINUTA, font: FONTE, size: 18, bold: true, color: cor("vinho") }),
        ],
      }),
    );
  }

  const corpo: (Paragraph | Table)[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: doc.titulo, font: FONTE, size: 40, bold: true, color: cor("navy") })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: doc.projeto, font: FONTE, size: 24, bold: true, color: cor("navy700") }),
      ],
    }),
  ];
  if (doc.subtitulo) {
    corpo.push(
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({ text: doc.subtitulo, font: FONTE, size: 20, color: cor("txt") })],
      }),
    );
  }
  for (const s of doc.secoes) {
    corpo.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 120 },
        children: [new TextRun({ text: s.titulo, font: FONTE, size: 26, bold: true, color: cor("navy") })],
      }),
    );
    for (const p of s.paragrafos ?? []) {
      corpo.push(
        new Paragraph({ children: [new TextRun({ text: p, font: FONTE, size: 20, color: cor("txt") })] }),
      );
    }
    if (s.tabela) {
      corpo.push(new Paragraph({ text: "" }));
      corpo.push(tabelaDocx(s.tabela));
    }
  }

  const documento = new Document({
    creator: "Raio-X do Projeto",
    title: doc.titulo,
    sections: [
      {
        headers: { default: new Header({ children: cabecalho }) },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `${linhaDeVersoes(doc)} · página `,
                    font: FONTE,
                    size: 16,
                    color: cor("ink"),
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONTE, size: 16, color: cor("ink") }),
                ],
              }),
            ],
          }),
        },
        children: corpo,
      },
    ],
  });
  return Packer.toBlob(documento);
}
