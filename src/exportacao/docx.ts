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
import {
  legendaDasMarcas,
  linhaDeVersoes,
  marcasDoDocumento,
  secoesPorParte,
  TEXTO_MINUTA,
  TITULO_DO_ANEXO,
  type Alerta,
  type DocumentoExportavel,
  type NumeroChave,
  type Tabela,
} from "./modelo";

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

/** Alerta da capa: faixa colorida, vinho no alto e laranja no médio. */
function paragrafoDeAlerta(a: Alerta): Paragraph {
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
      new TextRun({ text: a.texto, font: FONTE, size: 20, color: cor("txt") }),
    ],
  });
}

/** Números-chave em duas colunas: rótulo e valor. */
function tabelaDeNumeros(numeros: NumeroChave[]): Table {
  const borda = { style: BorderStyle.SINGLE, size: 4, color: cor("bd") };
  const celula = (texto: string, rotulo: boolean) =>
    new TableCell({
      width: { size: rotulo ? 40 : 60, type: WidthType.PERCENTAGE },
      shading: rotulo ? { type: ShadingType.CLEAR, fill: cor("soft"), color: "auto" } : undefined,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: texto,
              font: FONTE,
              size: 20,
              bold: rotulo,
              color: cor(rotulo ? "navy" : "txt"),
            }),
          ],
        }),
      ],
    });
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
    rows: numeros.map((n) => new TableRow({ children: [celula(n.rotulo, true), celula(n.valor, false)] })),
  });
}

export async function gerarDocx(doc: DocumentoExportavel, logo: ArrayBuffer): Promise<Blob> {
  // o padrão de apresentação da FGV Projetos (decisão 0089), para o resultado da etapa
  if (doc.apresentacao) return (await import("./docx-apresentacao")).gerarDocxApresentacao(doc, logo);
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
  const legenda = legendaDasMarcas(marcasDoDocumento(doc));
  const paragrafoDaLegenda = () =>
    new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: legenda, font: FONTE, size: 18, italics: true, color: cor("ink") })],
    });
  const grupos = secoesPorParte(doc);
  if (legenda && !grupos.some((g) => g.parte === "capa")) corpo.push(paragrafoDaLegenda());
  grupos.forEach((g, n) => {
    // cada parte começa numa página; o anexo leva o título dele (decisão 0084)
    let quebra = n > 0;
    if (g.parte === "anexo") {
      corpo.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: quebra,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({ text: TITULO_DO_ANEXO, font: FONTE, size: 28, bold: true, color: cor("navy") }),
          ],
        }),
      );
      quebra = false;
    }
    for (const s of g.secoes) {
      corpo.push(
        new Paragraph({
          heading: g.parte === "anexo" ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1,
          pageBreakBefore: quebra,
          spacing: { before: quebra ? 0 : 360, after: 120 },
          children: [
            new TextRun({
              text: s.titulo,
              font: FONTE,
              size: g.parte === "anexo" ? 22 : 26,
              bold: true,
              color: cor("navy"),
            }),
          ],
        }),
      );
      quebra = false;
      for (const a of s.alertas ?? []) corpo.push(paragrafoDeAlerta(a));
      if (s.numeros?.length) corpo.push(tabelaDeNumeros(s.numeros));
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
    if (g.parte === "capa" && legenda) corpo.push(paragrafoDaLegenda());
  });

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
