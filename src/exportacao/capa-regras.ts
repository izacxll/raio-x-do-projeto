// Regras puras da capa de decisão (decisão 0087, com a revisão de código): quando o alerta de prazo e valor pode afirmar
// a ausência, quando os marcos estão "sem régua" e o risco numa linha. Separadas para teste.
import { diasDoTexto } from "../etapas/3-tap/divergencias";
import { curto, limitar } from "./capa-de-decisao";

export type CampoQuePesa = "prazo" | "valor";

const TERMO: Record<CampoQuePesa, string> = {
  prazo: "(?:prazos?|vig[eê]ncia|dura[cç][aã]o)",
  valor: "(?:valor(?:es)?|teto|or[cç]amento|pre[cç]o estimado)",
};
const NUMERO_DO_CAMPO: Record<CampoQuePesa, RegExp> = {
  prazo: /\b\d+\s*(?:\([^)]{1,20}\)\s*)?(?:dias|meses|m[eê]s|anos|semanas)\b/i,
  valor: /R\$\s*\d/,
};

/**
 * Os campos (prazo, valor) que a leitura do PMO confirma ausentes, campo a campo: algum texto diz que o documento não
 * traz o campo (o verbo de ausência e o termo do campo a até 40 caracteres), e nenhum texto do PMO que fala do campo
 * traz um número dele. O que não se confirma fica "não localizado pelo código".
 */
export function camposConfirmadosPeloPmo(campos: CampoQuePesa[], textosDoPmo: string[]): CampoQuePesa[] {
  return campos.filter((campo) => {
    const ausencia = new RegExp(
      `n[aã]o (?:traz|informa|fixa|define|indica|estabelece|prev[eê])\\b[^.;]{0,40}?\\b${TERMO[campo]}`,
      "i",
    );
    const doCampo = textosDoPmo.filter((t) => new RegExp(TERMO[campo], "i").test(t));
    return doCampo.some((t) => ausencia.test(t)) && !doCampo.some((t) => NUMERO_DO_CAMPO[campo].test(t));
  });
}

export type ReguaDosMarcos = "com-regua" | "sem-regua" | "nao-localizados";

/**
 * A régua dos marcos do plano: "sem régua" só quando o código tem os marcos do TAP e nenhum dá prazo em dias; sem os
 * marcos do TAP (TAP em PDF, sem TAP, descartados), eles ficam "não localizados pelo código" (não achado não é
 * ausente).
 */
export function reguaDosMarcos(prazosDoTap: string[]): ReguaDosMarcos {
  if (!prazosDoTap.length) return "nao-localizados";
  return prazosDoTap.every((p) => diasDoTexto(p) === undefined) ? "sem-regua" : "com-regua";
}

/**
 * O risco numa linha: o evento e o efeito, como o registro B27 escreve ("Causa: … Evento: … Efeito: …", com as marcas
 * em maiúscula e no começo de palavra) ou como a ficha sugere ("Por …, pode ocorrer …, afetando …"); sem nenhum dos
 * dois, o texto a partir de "pode ocorrer" ou "risco de", ou o começo.
 */
export function eventoEEfeito(texto: string, limite = 220): string {
  const t = texto.replace(/\s+/g, " ").trim();
  const marca = (nome: string) =>
    new RegExp(`(?<!\\p{L})${nome}:\\s*(.*?)\\s*(?=(?<!\\p{L})(?:Causa|Evento|Efeito|Situação):|$)`, "su")
      .exec(t)?.[1]
      ?.replace(/[.;]$/, "");
  const evento = marca("Evento");
  const efeito = marca("Efeito");
  if (evento || efeito) return limitar([evento, efeito].filter(Boolean).join(" → "), limite);
  const ficha = /pode ocorrer\s+(.*?),\s*afetando\s+(.*)$/is.exec(t);
  if (ficha) return limitar(`${ficha[1]} → ${ficha[2]!.replace(/[.;]$/, "")}`, limite);
  const desde = /(?:pode ocorrer|risco de)\s+.*/is.exec(t)?.[0];
  return curto(desde ?? t, limite);
}
