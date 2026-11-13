// Ponto único de exportação. Os montadores são carregados só quando o GP pede o arquivo,
// para a tela inicial abrir rápido (as bibliotecas de DOCX, XLSX e PDF são grandes).
import urlLogo from "../interface/ativos/logo-fgv-projetos.jpg";
import { nomeParaArquivo } from "../texto/nome-arquivo";
import { baixarArquivo, type DocumentoExportavel } from "./modelo";

export type FormatoExportacao = "docx" | "pdf" | "xlsx";

let logoCache: Promise<ArrayBuffer> | null = null;
function carregarLogo(): Promise<ArrayBuffer> {
  logoCache ??= fetch(urlLogo).then((r) => {
    if (!r.ok) throw new Error("não foi possível carregar o logo");
    return r.arrayBuffer();
  });
  return logoCache;
}

export async function exportar(doc: DocumentoExportavel, formato: FormatoExportacao, nomeBase: string) {
  const logo = await carregarLogo();
  let blob: Blob;
  if (formato === "docx") blob = await (await import("./docx")).gerarDocx(doc, logo);
  else if (formato === "pdf") blob = await (await import("./pdf")).gerarPdf(doc, logo);
  else blob = await (await import("./xlsx")).gerarXlsx(doc, logo);
  const nome = `${nomeParaArquivo(doc.projeto) || "projeto"}-${nomeBase}.${formato}`;
  baixarArquivo(blob, nome);
  return nome;
}
