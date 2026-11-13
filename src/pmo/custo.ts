// Custo à vista (seção 6): estimativa antes de cada passo com o PMO e o uso real depois (tokens e valor).
// Todas as contas são do código.
import { SAIDA_ESPERADA, type PassoPmo } from "../config/modelo";
import { PRECOS, type PrecoModelo } from "../config/precos";

export interface UsoChamada {
  entrada: number;
  saida: number;
  escritaCache: number;
  leituraCache: number;
}

export function precoDe(modelo: string): PrecoModelo | undefined {
  return PRECOS[modelo];
}

/** Custo em US$ de uma chamada, pelo uso que a API devolveu. Modelo sem preço na tabela → undefined. */
export function custoDoUso(modelo: string, uso: UsoChamada): number | undefined {
  const p = precoDe(modelo);
  if (!p) return undefined;
  return (
    (uso.entrada * p.entrada +
      uso.saida * p.saida +
      uso.escritaCache * p.escritaCache +
      uso.leituraCache * p.leituraCache) /
    1e6
  );
}

export interface EstimativaCusto {
  tokensEntrada: number;
  saidaMin: number;
  saidaMax: number;
  /** Primeira chamada: a entrada é escrita no cache. */
  semCache: { min: number; max: number };
  /** Chamada seguinte, dentro de 5 minutos: skill e documentos lidos do cache. */
  comCache: { min: number; max: number };
}

/**
 * `tokensCacheaveis`: skill + documentos (o prefixo que se repete entre os passos); `tokensPedido`: o resto.
 */
export function estimarCusto(
  modelo: string,
  passo: PassoPmo,
  tokensCacheaveis: number,
  tokensPedido: number,
): EstimativaCusto | undefined {
  const p = precoDe(modelo);
  if (!p) return undefined;
  const { min, max } = SAIDA_ESPERADA[passo];
  const primeira = (tokensCacheaveis * p.escritaCache + tokensPedido * p.entrada) / 1e6;
  const seguinte = (tokensCacheaveis * p.leituraCache + tokensPedido * p.entrada) / 1e6;
  const saida = (n: number) => (n * p.saida) / 1e6;
  return {
    tokensEntrada: tokensCacheaveis + tokensPedido,
    saidaMin: min,
    saidaMax: max,
    semCache: { min: primeira + saida(min), max: primeira + saida(max) },
    comCache: { min: seguinte + saida(min), max: seguinte + saida(max) },
  };
}

export function formatarDolar(v: number | undefined): string {
  if (v === undefined) return "sem preço na tabela";
  return `US$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: v < 0.1 ? 3 : 2 })}`;
}

export function formatarTokens(n: number): string {
  return n.toLocaleString("pt-BR");
}
