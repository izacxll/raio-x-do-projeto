// Capa de decisão de cada etapa (decisão 0085): a página 1 do resultado, montada só por código a partir do que a etapa
// já calculou. O que é a etapa; o que o GP precisa decidir agora (no máximo 5, por impacto); os números-chave; de 3 a 5
// alertas (os que mudam preço, prazo, caixa, aceite ou quem executa primeiro); o que mudou desde a etapa anterior. Depois
// da capa, os quadros (o resultado em forma visual). Nada aqui é decisão: o que vem do PMO continua sugestão, e o que o
// código não achou é "não localizado pelo código — conferir no documento".
import type { Alerta, NumeroChave, Secao } from "./modelo";

export const MAXIMO_DE_DECISOES = 5;
export const MAXIMO_DE_ALERTAS = 5;
export const NAO_LOCALIZADO = "não localizado pelo código — conferir no documento";

export interface CapaDeDecisao {
  etapa: number;
  oQueE: string;
  decidir: string[];
  numeros: NumeroChave[];
  alertas: Alerta[];
  mudou: string[];
  quadros: Secao[];
}

/** Os alertas da capa: os altos primeiro, sem repetir, no máximo 5. */
export function escolherAlertas(alertas: Alerta[]): Alerta[] {
  const vistos = new Set<string>();
  return [...alertas.filter((a) => a.nivel === "alto"), ...alertas.filter((a) => a.nivel === "medio")]
    .filter((a) => (vistos.has(a.texto) ? false : (vistos.add(a.texto), true)))
    .slice(0, MAXIMO_DE_ALERTAS);
}

/** As seções da capa (parte "capa") e dos quadros (parte "quadros"), na ordem da decisão 0085. */
export function secoesDaCapa(c: CapaDeDecisao): Secao[] {
  const decidir = c.decidir.slice(0, MAXIMO_DE_DECISOES);
  const alertas = escolherAlertas(c.alertas);
  return [
    {
      titulo: "O que é e o que decidir agora",
      parte: "capa",
      paragrafos: [
        c.oQueE,
        ...(decidir.length
          ? decidir.map((d, k) => `${k + 1}. ${d}`)
          : ["Nada a decidir agora pelo que o código conferiu."]),
      ],
    },
    ...(c.numeros.length ? [{ titulo: "Números-chave", parte: "capa" as const, numeros: c.numeros }] : []),
    ...(alertas.length ? [{ titulo: "Alertas", parte: "capa" as const, alertas }] : []),
    {
      titulo: "O que mudou desde a etapa anterior",
      parte: "capa",
      paragrafos: c.mudou.length ? c.mudou.map((m) => `• ${m}`) : ["• Nada que o código tenha conferido."],
    },
    ...c.quadros.map((q) => ({ ...q, parte: "quadros" as const })),
  ];
}

/** Texto curto para a capa: a primeira frase, até um limite, sem cortar palavra. */
export function curto(texto: string, limite = 160): string {
  const t = texto.replace(/\s+/g, " ").trim();
  const frase = (/^.*?\.(?:\s|$)/.exec(t)?.[0] ?? t).trim().replace(/[;,:]$/, ".");
  const base = frase.length >= 20 ? frase : t;
  return base.length > limite ? `${base.slice(0, limite).replace(/[\s,]+\S*$/, "")}…` : base;
}
