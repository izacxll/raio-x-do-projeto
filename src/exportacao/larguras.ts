// Larguras das colunas das tabelas do PDF. A largura proporcional pura quebrava palavras nas colunas estreitas
// ("Do documen to", "Penden te"): aqui cada coluna tem no mínimo a largura da sua palavra mais longa, e o resto
// é dividido pelos pesos. Se nem assim couber em retrato, a página vai para paisagem.
import type { Tabela } from "./modelo";

/** Área útil da página A4 com margens de 40 pt (em pontos). */
export const LARGURA_RETRATO = 595.28 - 80;
export const LARGURA_PAISAGEM = 841.89 - 80;
/** Margem interna de cada célula do pdfmake (4 + 4) e as linhas da grade. */
const MARGEM_DA_CELULA = 9;
/** Palavra mais longa que isso (endereço de site, nome de arquivo) pode quebrar: não manda na coluna. */
const TETO_DA_PALAVRA = 95;

/** Largura aproximada de um caractere da Arimo (as medidas da Arial), em frações do corpo da fonte. */
function larguraDoCaractere(c: string): number {
  if (/[iljtfrI.,;:'!|()[\]\s]/.test(c)) return 0.3;
  if (/[mwMW]/.test(c)) return 0.86;
  if (/[A-ZÀ-Ý]/.test(c)) return 0.7;
  if (/[0-9]/.test(c)) return 0.56;
  return 0.56;
}

/** Largura do texto em pontos, com folga de 5% para a diferença entre a estimativa e a fonte. */
export function larguraDoTexto(texto: string, corpo: number): number {
  let soma = 0;
  for (const c of texto) soma += larguraDoCaractere(c);
  return soma * corpo * 1.05;
}

/**
 * A menor largura do texto da coluna: a palavra mais longa do título e das células. É largura de conteúdo: o
 * pdfmake põe a margem interna da célula por fora dela.
 */
export function larguraMinima(textos: string[], corpo: number): number {
  let maior = 0;
  for (const t of textos)
    for (const palavra of t.split(/\s+/)) maior = Math.max(maior, larguraDoTexto(palavra, corpo));
  return Math.min(maior, TETO_DA_PALAVRA) + 1;
}

/**
 * Divide a largura disponível pelos pesos, sem deixar coluna abaixo da mínima. Devolve undefined se a soma das
 * mínimas não couber.
 */
export function distribuirLarguras(
  minimas: number[],
  pesos: number[],
  disponivel: number,
): number[] | undefined {
  if (minimas.reduce((a, b) => a + b, 0) > disponivel) return undefined;
  const fixas = new Map<number, number>();
  for (;;) {
    const livres = pesos.map((p, i) => (fixas.has(i) ? 0 : p));
    const somaPesos = livres.reduce((a, b) => a + b, 0);
    const restante = disponivel - [...fixas.values()].reduce((a, b) => a + b, 0);
    const larguras = pesos.map((_, i) => fixas.get(i) ?? (restante * (livres[i] ?? 0)) / (somaPesos || 1));
    const abaixo = larguras.findIndex((l, i) => !fixas.has(i) && l < (minimas[i] ?? 0));
    if (abaixo < 0) return larguras;
    fixas.set(abaixo, minimas[abaixo] ?? 0);
  }
}

export interface PlanoDasTabelas {
  paisagem: boolean;
  /** Corpo da fonte das tabelas, em pontos. */
  corpo: number;
  /** Larguras em pontos, uma lista por tabela, na ordem recebida. */
  larguras: number[][];
}

function larguras(t: Tabela, corpo: number, disponivel: number): number[] | undefined {
  const pesos = t.larguras ?? t.colunas.map(() => 1);
  // o título vai em negrito, cerca de 10% mais largo
  const minimas = t.colunas.map((c, i) =>
    Math.max(
      larguraMinima([c], corpo) * 1.1,
      larguraMinima(
        t.linhas.map((l) => l[i] ?? ""),
        corpo,
      ),
    ),
  );
  // a margem interna de cada célula fica por fora da largura do conteúdo
  return distribuirLarguras(minimas, pesos, disponivel - t.colunas.length * MARGEM_DA_CELULA);
}

/**
 * Retrato com fonte 9 quando todas as tabelas cabem sem quebrar palavra; senão paisagem com fonte 9, e por fim
 * paisagem com fonte 8 (nesse caso, uma palavra muito longa ainda pode quebrar).
 */
export function planejarTabelas(tabelas: Tabela[]): PlanoDasTabelas {
  const tentativas: [boolean, number][] = [
    [false, 9],
    [true, 9],
    [true, 8],
  ];
  for (const [paisagem, corpo] of tentativas) {
    const disponivel = paisagem ? LARGURA_PAISAGEM : LARGURA_RETRATO;
    const todas = tabelas.map((t) => larguras(t, corpo, disponivel));
    if (todas.every(Boolean)) return { paisagem, corpo, larguras: todas as number[][] };
  }
  // não coube nem assim: proporcional em paisagem, fonte 8
  return {
    paisagem: true,
    corpo: 8,
    larguras: tabelas.map((t) => {
      const pesos = t.larguras ?? t.colunas.map(() => 1);
      const soma = pesos.reduce((a, b) => a + b, 0);
      const conteudo = LARGURA_PAISAGEM - t.colunas.length * MARGEM_DA_CELULA;
      return pesos.map((p) => (p / soma) * conteudo);
    }),
  };
}
