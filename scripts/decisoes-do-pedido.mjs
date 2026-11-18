// Decisões do GP que entram na exportação de um passo do teste externo (decisão 0069). O vigia (fora do Git) usa este
// módulo para montar os argumentos da exportação e para saber quando o pedido já exportado ficou velho: o GP mudou no
// decisoes-do-gp.json uma decisão que o pedido usa (porte, características, premissas críticas, partes, modalidade).
// A abordagem não entra: ela vale na importação da estratégia, não na exportação de um passo.

/** "campo": false → "campo=não"; texto passa como está. */
export function caracteristicasEmTexto(c) {
  if (!c) return "";
  if (typeof c === "string") return c;
  return Object.entries(c)
    .map(([k, v]) => `${k}=${v === true ? "sim" : v === false ? "não" : v}`)
    .join(",");
}

/**
 * As decisões que a exportação do passo usa, do decisoes-do-gp.json: a modalidade da etapa 2 em diante; porte,
 * características e premissas críticas nas etapas 4 e 5; as partes a gerar na etapa 4. A segunda instância confere a
 * resposta guardada e não usa nenhuma.
 */
export function decisoesDoPedido(etapa, passo, d = {}) {
  const usadas = {};
  if (String(passo).startsWith("segunda-")) return usadas;
  if (etapa >= 2 && d.modalidade) usadas.modalidade = String(d.modalidade);
  if (etapa >= 4) {
    if (d.porte) usadas.porte = String(d.porte);
    const c = caracteristicasEmTexto(d.caracteristicas);
    if (c) usadas.caracteristicas = c;
    if (d.pcs) usadas.pcs = String(d.pcs);
  }
  if (etapa === 4 && d.gerar) usadas.gerar = String(d.gerar);
  return usadas;
}

/** Os argumentos da exportação para as decisões usadas (--modalidade, --porte, --caracteristicas, --pcs, --gerar). */
export function argumentosDasDecisoes(usadas) {
  return Object.entries(usadas).flatMap(([k, v]) => [`--${k}`, v]);
}

/** As decisões que mudaram entre a exportação e agora (nome de cada uma); [] se nada mudou. */
export function decisoesQueMudaram(antes = {}, agora = {}) {
  const chaves = [...new Set([...Object.keys(antes), ...Object.keys(agora)])].sort();
  return chaves.filter((k) => (antes[k] ?? "") !== (agora[k] ?? ""));
}
