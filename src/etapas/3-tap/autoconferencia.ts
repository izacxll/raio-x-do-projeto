// Etapa 3: autoconferência do PMO por passo (decisão 0044). Cada passo cobra só os itens das fichas que ele gera:
// o passo do TAP, os blocos de divergências e os elementos TAP1 a TAP12; o registro de premissas inicial, o bloco
// TAP-PR e a ficha B3. O registro não gera o resto do TAP, e o TAP não gera o registro.
import { FICHAS } from "../../dominio/skill";
import { conferirAutoconferencia, type ResultadoAutoconferencia } from "../../pmo/autoconferencia";
import type { ItemAutoconferencia } from "../../pmo/schemas/comum";

export type PassoEtapa3 = "tap" | "premissas";

const DO_PASSO: Record<PassoEtapa3, (codigo: string) => boolean> = {
  tap: (c) => /^TAP(?:-DV\.|\d)/.test(c),
  premissas: (c) => /^TAP-PR\./.test(c) || /^B3\.\d/.test(c),
};

/** Itens que o PMO tem de marcar no passo, das fichas da skill (TAP-DV.1…, TAP-PR.1…, B3.1…). */
export function itensEsperadosDaEtapa3(passo: PassoEtapa3): string[] {
  return FICHAS.flatMap((f) => f.itens.map((i) => i.codigo)).filter(DO_PASSO[passo]);
}

/** Texto do pedido: os itens que este passo marca, e só eles. */
export function itensDoPassoEmTexto(passo: PassoEtapa3): string {
  const itens = itensEsperadosDaEtapa3(passo);
  return itens.length > 15
    ? `${itens.slice(0, 3).join(", ")}… ${itens.at(-1)} (${itens.length} itens)`
    : itens.join(", ");
}

export function conferirAutoconferenciaDaEtapa3(
  passo: PassoEtapa3,
  marcas: ItemAutoconferencia[],
): ResultadoAutoconferencia {
  return conferirAutoconferencia(itensEsperadosDaEtapa3(passo), marcas);
}
