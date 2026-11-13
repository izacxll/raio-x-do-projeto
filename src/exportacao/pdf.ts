// Montador PDF (pdfmake), com a fonte Arimo, que tem as mesmas medidas da Arial (decisão 0001).
import pdfMake from "pdfmake/build/pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { cor } from "../interface/tokens";
import { linhaDeVersoes, TEXTO_MINUTA, type DocumentoExportavel } from "./modelo";

let fontesProntas = false;

function registrarFontes(): void {
  if (fontesProntas) return;
  const pasta = new URL(`${import.meta.env.BASE_URL}vendor/fontes/`, window.location.href).href;
  pdfMake.addFonts({
    Arimo: {
      normal: `${pasta}Arimo_400Regular.ttf`,
      bold: `${pasta}Arimo_700Bold.ttf`,
      italics: `${pasta}Arimo_400Regular_Italic.ttf`,
      bolditalics: `${pasta}Arimo_700Bold_Italic.ttf`,
    },
  });
  fontesProntas = true;
}

function paraDataUrl(logo: ArrayBuffer): string {
  let bin = "";
  const bytes = new Uint8Array(logo);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i] ?? 0);
  return `data:image/jpeg;base64,${btoa(bin)}`;
}

export async function gerarPdf(doc: DocumentoExportavel, logo: ArrayBuffer): Promise<Blob> {
  registrarFontes();
  const hex = (nome: string) => `#${cor(nome)}`;
  const conteudo: Content[] = [
    { text: doc.titulo, fontSize: 20, bold: true, color: hex("navy"), margin: [0, 0, 0, 4] },
    { text: doc.projeto, fontSize: 12, bold: true, color: hex("navy700"), margin: [0, 0, 0, 8] },
  ];
  if (doc.subtitulo)
    conteudo.push({ text: doc.subtitulo, fontSize: 10, color: hex("txt"), margin: [0, 0, 0, 12] });

  for (const s of doc.secoes) {
    conteudo.push({ text: s.titulo, fontSize: 13, bold: true, color: hex("navy"), margin: [0, 14, 0, 6] });
    for (const p of s.paragrafos ?? [])
      conteudo.push({ text: p, fontSize: 10, color: hex("txt"), margin: [0, 0, 0, 3] });
    if (s.tabela) {
      const t = s.tabela;
      const larguras = t.larguras ?? t.colunas.map(() => 1);
      const soma = larguras.reduce((a, b) => a + b, 0);
      conteudo.push({
        margin: [0, 8, 0, 0],
        table: {
          headerRows: 1,
          widths: larguras.map((l) => `${((l / soma) * 100).toFixed(1)}%`),
          body: [
            t.colunas.map((c) => ({
              text: c,
              bold: true,
              color: hex("white"),
              fillColor: hex("navy"),
              fontSize: 9,
            })),
            ...t.linhas.map((l) => l.map((c) => ({ text: c, fontSize: 9, color: hex("txt") }))),
          ],
        },
        layout: {
          hLineColor: () => hex("bd"),
          vLineColor: () => hex("bd"),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
        },
      });
    }
  }

  const definicao: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, doc.minuta ? 78 : 62, 40, 48],
    defaultStyle: { font: "Arimo", fontSize: 10 },
    info: { title: doc.titulo, creator: "Raio-X do Projeto" },
    header: (): Content => {
      const pilha: Content[] = [{ image: paraDataUrl(logo), width: 150 }];
      if (doc.minuta) {
        pilha.push({
          text: TEXTO_MINUTA,
          fontSize: 9,
          bold: true,
          color: hex("vinho"),
          margin: [0, 6, 0, 0],
        });
      }
      return { margin: [40, 22, 40, 0], stack: pilha };
    },
    footer: (pagina, total) => ({
      margin: [40, 16, 40, 0],
      text: `${linhaDeVersoes(doc)} · página ${pagina} de ${total}`,
      fontSize: 8,
      color: hex("ink"),
    }),
    content: conteudo,
  };
  return pdfMake.createPdf(definicao).getBlob();
}
