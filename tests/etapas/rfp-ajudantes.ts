// Ajudantes dos testes da etapa 1: monta documentos a partir de texto, sem PDF.
import type { DocumentoLido, PaginaLida } from "../../src/dossie/esquema";
import { prepararDocumento } from "../../src/extracao/rfp/item";

export function pagina(numero: number, texto: string, ilegivel = false): PaginaLida {
  return {
    numero,
    origem: ilegivel ? "nao-verificavel" : "texto",
    texto: ilegivel ? "" : texto,
    caracteres: ilegivel ? 0 : texto.length,
    motivo: ilegivel ? "página sem texto legível" : undefined,
  };
}

export function documentoLido(textos: string[], ilegiveis: number[] = []): DocumentoLido {
  return {
    id: "rfp-teste",
    papel: "rfp",
    nomeArquivo: "rfp.pdf",
    tamanhoBytes: 1,
    totalPaginas: textos.length,
    lidoEm: "2026-11-13T00:00:00.000Z",
    paginas: textos.map((t, i) => pagina(i + 1, t, ilegiveis.includes(i + 1))),
  };
}

export function docRfp(textos: string[], ilegiveis: number[] = []) {
  const d = documentoLido(textos, ilegiveis);
  return prepararDocumento(d.id, "RFP", d.paginas);
}
