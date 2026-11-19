// Páginas de um documento exportado, estimadas sem abrir o Word (decisão 0091): o texto corrido e as tabelas pelos
// caracteres, mais as linhas de tabela e os títulos. A fórmula foi calibrada com os planos da etapa 4 do teste externo
// (cerca de 55 a 60 páginas no Word); é estimativa, para o limite do porte, e a medição de verdade é no Word.
import type { DocumentoExportavel } from "./modelo";
import { registrosNoAnexo } from "./registros-no-anexo";

const CARACTERES_POR_PAGINA_DE_TEXTO = 3500;
const CARACTERES_POR_PAGINA_DE_TABELA = 3000;
const PAGINA_POR_LINHA_DE_TABELA = 0.01;
const PAGINA_POR_SECAO = 0.1;

export function paginasEstimadas(doc: Pick<DocumentoExportavel, "secoes">): number {
  let paginas = 0;
  for (const s of doc.secoes) {
    paginas += PAGINA_POR_SECAO;
    paginas += (s.paragrafos ?? []).join(" ").length / CARACTERES_POR_PAGINA_DE_TEXTO;
    if (s.tabela) {
      paginas += s.tabela.linhas.flat().join(" ").length / CARACTERES_POR_PAGINA_DE_TABELA;
      paginas += s.tabela.linhas.length * PAGINA_POR_LINHA_DE_TABELA;
    }
  }
  return Math.max(1, Math.round(paginas));
}

/**
 * Páginas do corpo do plano: os planos (partes A) e o que vem antes deles, sem os registros (partes B, que vão para o
 * anexo, decisão 0085) nem a lista das partes dispensadas e as observações. É o que o limite do porte mede (decisão 0091).
 */
export function paginasDoCorpoDoPlano(doc: Pick<DocumentoExportavel, "secoes">): number {
  const corpo = registrosNoAnexo(doc.secoes).filter(
    (s) => s.parte !== "anexo" && !/^(Partes dispensadas pelo GP|Observações do PMO)$/.test(s.titulo),
  );
  return paginasEstimadas({ secoes: corpo });
}
