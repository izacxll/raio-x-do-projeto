// Os registros do plano (partes B) no anexo do resultado (decisão 0085), num módulo à parte para a capa e a estimativa
// de páginas usarem sem ciclo de import.
import type { Secao } from "./modelo";

/**
 * Etapa 4: as partes B do plano (os documentos do projeto: registros, listas, matrizes) vão inteiras para o anexo; o
 * corpo fica com os planos (partes A) e o que os resume está nos quadros (decisão 0085). A seção da parte começa com
 * "Parte Bn do plano."; as continuações herdam.
 */
export function registrosNoAnexo(secoes: Secao[]): Secao[] {
  let doRegistro = false;
  return secoes.map((x) => {
    const parte = /^Parte ([AB])\d+ do plano\.$/.exec(x.paragrafos?.[0] ?? "")?.[1];
    if (parte) doRegistro = parte === "B";
    else if (!/\(continuação\)$/.test(x.titulo)) doRegistro = false;
    return doRegistro ? { ...x, parte: "anexo" as const } : x;
  });
}
