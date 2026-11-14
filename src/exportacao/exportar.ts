// Ponto único de exportação. Os montadores são carregados só quando o GP pede o arquivo,
// para a tela inicial abrir rápido (as bibliotecas de DOCX, XLSX e PDF são grandes).
import type { Dossie } from "../dossie/esquema";
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

/** Gera o arquivo, sem baixar (o pacote .zip junta vários). */
export async function gerarArquivo(doc: DocumentoExportavel, formato: FormatoExportacao): Promise<Blob> {
  const logo = await carregarLogo();
  if (formato === "docx") return (await import("./docx")).gerarDocx(doc, logo);
  if (formato === "pdf") return (await import("./pdf")).gerarPdf(doc, logo);
  return (await import("./xlsx")).gerarXlsx(doc, logo);
}

export async function exportar(doc: DocumentoExportavel, formato: FormatoExportacao, nomeBase: string) {
  const blob = await gerarArquivo(doc, formato);
  const nome = `${nomeParaArquivo(doc.projeto) || "projeto"}-${nomeBase}.${formato}`;
  baixarArquivo(blob, nome);
  return nome;
}

/** Baixa um texto (SVG, por exemplo) com o nome do projeto. */
export function exportarTexto(
  dossie: Dossie,
  texto: string,
  nomeBase: string,
  extensao: string,
  tipo: string,
) {
  const nome = `${nomeParaArquivo(dossie.projeto.nome) || "projeto"}-${nomeBase}.${extensao}`;
  baixarArquivo(new Blob([texto], { type: tipo }), nome);
  return nome;
}

/** Pacote .zip da etapa 4: plano (DOCX e PDF), registros (XLSX), EAP e rede (SVG) e o índice das partes. */
export async function exportarPacotePgp(dossie: Dossie): Promise<string> {
  const [{ montarPgp, montarRegistrosPgp, indiceDoPacote }, { svgsDoPgp }, { zipSync, strToU8 }] =
    await Promise.all([import("./relatorio-pgp"), import("./diagramas-pgp"), import("fflate")]);
  const plano = montarPgp(dossie);
  const [docx, pdf, xlsx] = await Promise.all([
    gerarArquivo(plano, "docx"),
    gerarArquivo(plano, "pdf"),
    gerarArquivo(montarRegistrosPgp(dossie), "xlsx"),
  ]);
  const bytes = async (b: Blob) => new Uint8Array(await b.arrayBuffer());
  const svgs = svgsDoPgp(dossie);
  const arquivos: Record<string, Uint8Array> = {
    "indice.txt": strToU8(indiceDoPacote(dossie)),
    "plano.docx": await bytes(docx),
    "plano.pdf": await bytes(pdf),
    "registros.xlsx": await bytes(xlsx),
    ...(svgs.eap ? { "eap.svg": strToU8(svgs.eap) } : {}),
    ...(svgs.rede ? { "rede.svg": strToU8(svgs.rede) } : {}),
  };
  const zip = zipSync(arquivos, { level: 6 });
  const nome = `${nomeParaArquivo(dossie.projeto.nome) || "projeto"}-plano-de-gerenciamento.zip`;
  baixarArquivo(new Blob([zip as BlobPart], { type: "application/zip" }), nome);
  return nome;
}
