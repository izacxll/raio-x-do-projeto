// Capa de decisão de cada etapa (decisão 0085): a página 1 do resultado, montada só por código a partir do que a etapa
// já calculou. O que é a etapa; o que o GP precisa decidir agora (no máximo 5, por impacto); os números-chave; de 3 a 5
// alertas (os que mudam preço, prazo, caixa, aceite ou quem executa primeiro); o que mudou desde a etapa anterior. Depois
// da capa, os quadros (o resultado em forma visual). Nada aqui é decisão: o que vem do PMO continua sugestão, e o que o
// código não achou é "não localizado pelo código — conferir no documento".
import type { Alerta, Destaque, NumeroChave, Secao } from "./modelo";

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
  /** Os 3 ou 4 números da capa do documento, em bloco grande (decisão 0089). */
  destaques?: Destaque[];
}

/** Os números-chave que não estão nos blocos grandes: a tabela não repete o bloco (decisão 0089). */
export function numerosForaDosDestaques(c: CapaDeDecisao): NumeroChave[] {
  const nosBlocos = new Set(
    (c.destaques ?? []).slice(0, 4).flatMap((d) => (d.substitui ? [d.substitui] : [])),
  );
  return c.numeros.filter((n) => !nosBlocos.has(n.rotulo));
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

/** O texto até um limite, sem cortar palavra (sem cortar frase: para as contas, que dizem o resultado no fim). */
export function limitar(texto: string, limite = 220): string {
  const t = texto.replace(/\s+/g, " ").trim();
  return t.length > limite ? `${t.slice(0, limite).replace(/[\s,]+\S*$/, "")}…` : t;
}

/**
 * Texto curto para a capa: a primeira frase, até um limite, sem cortar palavra. A frase termina em ponto seguido de
 * maiúscula ou do fim: "p. 14" e "art. 75" não cortam.
 */
/** "12 (doze) meses, contados da assinatura" → "12 meses": só o número e a unidade, como o documento diz. */
export function duracaoCurta(texto?: string): string | undefined {
  const m = /(\d+)\s*(?:\([^)]*\)\s*)?(dias? úteis|dias? corridos|dias?|meses|mês|anos?|semanas?)/i.exec(
    texto ?? "",
  );
  return m ? `${m[1]} ${m[2]!.toLowerCase()}` : undefined;
}

export function curto(texto: string, limite = 160): string {
  const t = texto.replace(/\s+/g, " ").trim();
  const frase = (/^.*?\.(?=\s+[A-ZÀ-Ý"“(]|$)/.exec(t)?.[0] ?? t).trim().replace(/[;,:]$/, ".");
  const base = frase.length >= 20 ? frase : t;
  return limitar(base, limite);
}

/** "Rótulo: texto", sem repetir o rótulo quando o texto já começa com ele ("Cronograma: Cronograma: …"). */
export function comPrefixo(rotulo: string, texto: string): string {
  return texto.toLowerCase().startsWith(rotulo.toLowerCase()) ? texto : `${rotulo}: ${texto}`;
}
