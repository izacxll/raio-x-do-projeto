// Decisões do GP que entram na exportação de um passo do teste externo (decisão 0069). O vigia (fora do Git) usa este
// módulo para montar os argumentos da exportação e para saber quando o pedido já exportado ficou velho: o GP mudou no
// decisoes-do-gp.json uma decisão que o pedido usa (modalidade, porte, características, premissas críticas).
// A abordagem e as partes a gerar não entram: valem na importação (da estratégia e da adaptação), não na exportação.

/** Minúsculas, sem acento e sem espaço nas pontas: "Não" e "nao" são o mesmo valor. */
const simples = (t) => String(t).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

/**
 * As características em texto, como a exportação aceita ("beneficiarios=nao,campo=nao"): sem acento (vai na linha de
 * comando), com as chaves em ordem, para que a mesma decisão escrita de outro jeito (objeto ou texto, outra ordem) dê o
 * mesmo texto.
 */
export function caracteristicasEmTexto(c) {
  if (!c) return "";
  const pares =
    typeof c === "string"
      ? c
          .split(/[,;]/)
          .map((x) => x.split("=").map(simples))
          .filter(([k]) => k)
      : Object.entries(c).map(([k, v]) => [
          simples(k),
          v === true ? "sim" : v === false ? "nao" : simples(v),
        ]);
  return pares
    .map(([k, v = ""]) => `${k}=${v}`)
    .sort()
    .join(",");
}

/**
 * As decisões que a exportação do passo usa, do decisoes-do-gp.json: a modalidade em todas as etapas (na 1, quando o
 * documento não a diz; decisão 0054); porte, características e premissas críticas nas etapas 4 e 5. A segunda
 * instância confere a resposta guardada e não usa nenhuma.
 */
export function decisoesDoPedido(etapa, passo, d = {}) {
  const n = Number(etapa);
  const usadas = {};
  if (String(passo).startsWith("segunda-")) return usadas;
  if (d.modalidade) usadas.modalidade = String(d.modalidade);
  if (n >= 4) {
    if (d.porte) usadas.porte = String(d.porte);
    const c = caracteristicasEmTexto(d.caracteristicas);
    if (c) usadas.caracteristicas = c;
    if (d.pcs) usadas.pcs = String(d.pcs);
  }
  return usadas;
}

/** Os argumentos da exportação para as decisões usadas (--modalidade, --porte, --caracteristicas, --pcs). */
export function argumentosDasDecisoes(usadas) {
  return Object.entries(usadas).flatMap(([k, v]) => [`--${k}`, v]);
}

/** As decisões que mudaram entre a exportação e agora (nome de cada uma); [] se nada mudou. */
export function decisoesQueMudaram(antes = {}, agora = {}) {
  const chaves = [...new Set([...Object.keys(antes), ...Object.keys(agora)])].sort();
  return chaves.filter((k) => (antes[k] ?? "") !== (agora[k] ?? ""));
}
