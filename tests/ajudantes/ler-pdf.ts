// Lê um PDF qualquer do disco com o mesmo código do navegador (pdf.js + leitura página a página, sem OCR).
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { lerDocumento } from "../../src/leitura/ler-documento";

const pdfjsLocal = new URL("../../node_modules/pdfjs-dist/", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  "$1",
);

export async function lerPdf(
  caminho: string,
  papel: DocumentoLido["papel"],
  lidoEm = new Date(),
): Promise<DocumentoLido> {
  const tarefa = pdfjs.getDocument({
    data: new Uint8Array(readFileSync(caminho)),
    standardFontDataUrl: pathToFileURL(join(pdfjsLocal, "standard_fonts/")).href,
    wasmUrl: pathToFileURL(join(pdfjsLocal, "wasm/")).href,
    cMapUrl: pathToFileURL(join(pdfjsLocal, "cmaps/")).href,
    verbosity: 0,
  });
  const pdf = await tarefa.promise;
  try {
    const paginas = await lerDocumento(pdf, { OPS: pdfjs.OPS });
    return {
      id: papel,
      papel,
      nomeArquivo: basename(caminho),
      tamanhoBytes: 1,
      totalPaginas: pdf.numPages,
      lidoEm: lidoEm.toISOString(),
      paginas,
    };
  } finally {
    await tarefa.destroy();
  }
}
