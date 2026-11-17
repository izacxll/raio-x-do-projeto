// Lê uma RFP pública de teste (tests/fixtures/rfps-publicas/) com o mesmo código do navegador.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { lerDocumento } from "../../src/leitura/ler-documento";

export const PASTA_RFPS = new URL("../fixtures/rfps-publicas/", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  "$1",
);
const pdfjsLocal = join(PASTA_RFPS, "../../../node_modules/pdfjs-dist/");

export async function lerRfpPublica(nome: string, lidoEm = new Date(2026, 10, 13)): Promise<DocumentoLido> {
  return lerPdf(join(PASTA_RFPS, nome), nome, lidoEm);
}

/**
 * Lê um PDF de qualquer caminho (ex.: um documento que fica fora do Git, em referencias/), com o mesmo código do
 * navegador. Os testes que usam documentos fora do Git são pulados quando o arquivo não existe.
 */
export async function lerPdf(
  caminho: string,
  nome: string,
  lidoEm = new Date(2026, 10, 13),
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
      id: "rfp",
      papel: "rfp",
      nomeArquivo: nome,
      tamanhoBytes: 1,
      totalPaginas: pdf.numPages,
      lidoEm: lidoEm.toISOString(),
      paginas,
    };
  } finally {
    await tarefa.destroy();
  }
}
