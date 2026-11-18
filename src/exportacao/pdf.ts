// Montador PDF (pdfmake), com a fonte Arimo, que tem as mesmas medidas da Arial (decisão 0001).
import pdfMake from "pdfmake/build/pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { cor } from "../interface/tokens";
import { planejarTabelas } from "./larguras";
import {
  legendaDasMarcas,
  linhaDeVersoes,
  marcasDoDocumento,
  secoesPorParte,
  TEXTO_MINUTA,
  TITULO_DO_ANEXO,
  type DocumentoExportavel,
  type Tabela,
} from "./modelo";

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

  // larguras pela palavra mais longa de cada coluna; paisagem quando as tabelas não cabem em retrato
  const tabelas = doc.secoes.flatMap((s) => (s.tabela ? [s.tabela] : []));
  const plano = planejarTabelas(tabelas);
  // a ordem do plano de larguras é a de doc.secoes; as partes reordenam, então o índice vai pela seção
  const indiceDaTabela = new Map(doc.secoes.filter((s) => s.tabela).map((s, i) => [s, i] as const));
  const legenda = legendaDasMarcas(marcasDoDocumento(doc));
  const textoDaLegenda = (): Content => ({
    text: legenda,
    fontSize: 9,
    italics: true,
    color: hex("ink"),
    margin: [0, 6, 0, 6],
  });
  const grupos = secoesPorParte(doc);
  if (legenda && !grupos.some((g) => g.parte === "capa")) conteudo.push(textoDaLegenda());
  grupos.forEach((g, n) => {
    // cada parte começa numa página; o anexo leva o título dele (decisão 0084)
    let quebra = n > 0;
    if (g.parte === "anexo") {
      conteudo.push({
        text: TITULO_DO_ANEXO,
        fontSize: 14,
        bold: true,
        color: hex("navy"),
        margin: [0, 0, 0, 8],
        ...(quebra ? { pageBreak: "before" as const } : {}),
      });
      quebra = false;
    }
    for (const s of g.secoes) {
      conteudo.push({
        text: s.titulo,
        fontSize: g.parte === "anexo" ? 11 : 13,
        bold: true,
        color: hex("navy"),
        margin: [0, quebra ? 0 : 14, 0, 6],
        ...(quebra ? { pageBreak: "before" as const } : {}),
      });
      quebra = false;
      for (const a of s.alertas ?? [])
        conteudo.push({
          margin: [0, 2, 0, 2],
          table: {
            widths: ["*"],
            body: [
              [
                {
                  text: [
                    {
                      text: a.nivel === "alto" ? "Alerta: " : "Atenção: ",
                      bold: true,
                      color: hex(a.nivel === "alto" ? "vinho" : "laranja-txt"),
                    },
                    { text: a.texto, color: hex("txt") },
                  ],
                  fillColor: hex(a.nivel === "alto" ? "vinho-claro" : "laranja-claro"),
                  fontSize: 10,
                },
              ],
            ],
          },
          layout: "noBorders",
        });
      if (s.numeros?.length)
        conteudo.push({
          margin: [0, 4, 0, 4],
          table: {
            widths: ["40%", "60%"],
            body: s.numeros.map((x) => [
              { text: x.rotulo, bold: true, color: hex("navy"), fillColor: hex("soft"), fontSize: 10 },
              { text: x.valor, color: hex("txt"), fontSize: 10 },
            ]),
          },
          layout: {
            hLineColor: () => hex("bd"),
            vLineColor: () => hex("bd"),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
        });
      for (const p of s.paragrafos ?? [])
        conteudo.push({ text: p, fontSize: 10, color: hex("txt"), margin: [0, 0, 0, 3] });
      if (s.tabela) conteudo.push(tabelaPdf(s.tabela, plano.larguras[indiceDaTabela.get(s) ?? -1]));
    }
    if (g.parte === "capa" && legenda) conteudo.push(textoDaLegenda());
  });

  function tabelaPdf(t: Tabela, larguraPlanejada?: number[]): Content {
    {
      const larguras = larguraPlanejada ?? t.colunas.map(() => 50);
      return {
        margin: [0, 8, 0, 0],
        table: {
          headerRows: 1,
          widths: larguras.map((l) => Math.floor(l * 10) / 10 - 0.5),
          body: [
            t.colunas.map((c) => ({
              text: c,
              bold: true,
              color: hex("white"),
              fillColor: hex("navy"),
              fontSize: plano.corpo,
            })),
            ...t.linhas.map((l) => l.map((c) => ({ text: c, fontSize: plano.corpo, color: hex("txt") }))),
          ],
        },
        layout: {
          hLineColor: () => hex("bd"),
          vLineColor: () => hex("bd"),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
        },
      };
    }
  }

  const definicao: TDocumentDefinitions = {
    pageSize: "A4",
    pageOrientation: plano.paisagem ? "landscape" : "portrait",
    pageMargins: [40, 62 + (doc.minuta ? 16 : 0), 40, 48],
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
