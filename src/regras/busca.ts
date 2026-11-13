// Busca de termos no texto das páginas, sem depender de acento, caixa ou quebras de linha,
// devolvendo a página e o trecho original em volta de cada ocorrência.
import type { PaginaLida } from "../dossie/esquema";
import { tirarAcentos } from "../texto/normalizar";

export interface Ocorrencia {
  pagina: number;
  termo: string;
  /** Trecho original (com acentos) em volta da ocorrência. */
  trecho: string;
  /** Posição no texto original da página. */
  posicao: number;
}

interface PaginaNormalizada {
  numero: number;
  original: string;
  normal: string;
  /** Para cada caractere de `normal`, a posição em `original`. */
  mapa: number[];
}

const cache = new WeakMap<PaginaLida, PaginaNormalizada>();

/** Minúsculas, sem acento, espaços e quebras colapsados num espaço só. */
export function normalizarTermo(texto: string): string {
  return tirarAcentos(texto).replace(/\s+/g, " ").trim();
}

function normalizarPagina(p: PaginaLida): PaginaNormalizada {
  const pronta = cache.get(p);
  if (pronta) return pronta;
  const semAcento = tirarAcentos(p.texto);
  let normal = "";
  const mapa: number[] = [];
  let espaco = false;
  for (let i = 0; i < semAcento.length; i++) {
    const ch = semAcento[i] ?? "";
    if (/\s/.test(ch)) {
      if (!espaco && normal.length) {
        normal += " ";
        mapa.push(i);
      }
      espaco = true;
    } else {
      normal += ch;
      mapa.push(i);
      espaco = false;
    }
  }
  const pronto = { numero: p.numero, original: p.texto, normal, mapa };
  cache.set(p, pronto);
  return pronto;
}

const LETRA = /[a-z0-9]/;

/**
 * Termo curto ou terminado em número exige palavra inteira ("PC1" não acha "PC10").
 * Termo com 6 letras ou mais aceita continuação no fim (radical: "condicionad" acha "condicionada").
 */
function casa(normal: string, inicio: number, termo: string): boolean {
  const antes = normal[inicio - 1];
  if (antes && LETRA.test(antes)) return false;
  const depois = normal[inicio + termo.length];
  if (!depois || !LETRA.test(depois)) return true;
  return termo.length >= 6 && /[a-z]$/.test(termo);
}

export function trechoEmVolta(original: string, posicao: number, tamanho: number, folga = 80): string {
  const ini = Math.max(0, posicao - folga);
  const fim = Math.min(original.length, posicao + tamanho + folga);
  return `${ini > 0 ? "…" : ""}${original.slice(ini, fim).replace(/\s+/g, " ").trim()}${fim < original.length ? "…" : ""}`;
}

export interface OpcoesBusca {
  /** Páginas onde procurar (números). Sem isto, todas. */
  paginas?: Set<number>;
  /** Para na primeira ocorrência de cada termo. */
  primeira?: boolean;
}

export function procurar(paginas: PaginaLida[], termos: string[], opcoes: OpcoesBusca = {}): Ocorrencia[] {
  const achados: Ocorrencia[] = [];
  const normais = termos.map((t) => [t, normalizarTermo(t)] as const).filter(([, n]) => n.length >= 2);
  for (const p of paginas) {
    if (opcoes.paginas && !opcoes.paginas.has(p.numero)) continue;
    if (p.origem === "nao-verificavel") continue;
    const pn = normalizarPagina(p);
    for (const [termo, n] of normais) {
      let de = 0;
      for (;;) {
        const i = pn.normal.indexOf(n, de);
        if (i < 0) break;
        de = i + 1;
        if (!casa(pn.normal, i, n)) continue;
        const posicao = pn.mapa[i] ?? 0;
        const fim = pn.mapa[i + n.length - 1] ?? posicao;
        achados.push({
          pagina: p.numero,
          termo,
          posicao,
          trecho: trechoEmVolta(pn.original, posicao, fim - posicao + 1),
        });
        if (opcoes.primeira) break;
      }
    }
  }
  return achados.sort((a, b) => a.pagina - b.pagina || a.posicao - b.posicao);
}

/** Páginas sem texto legível: o que estiver nelas não pode ser dado como ausente. */
export function paginasNaoVerificaveis(paginas: PaginaLida[], faixa?: Set<number>): number[] {
  return paginas
    .filter((p) => p.origem === "nao-verificavel" && (!faixa || faixa.has(p.numero)))
    .map((p) => p.numero);
}

/** Ocorrências de uma expressão regular sobre o texto normalizado das páginas (minúsculas, sem acento). */
export function procurarPadrao(paginas: PaginaLida[], re: RegExp, faixa?: Set<number>): Ocorrencia[] {
  const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  const achados: Ocorrencia[] = [];
  for (const p of paginas) {
    if (faixa && !faixa.has(p.numero)) continue;
    if (p.origem === "nao-verificavel") continue;
    const pn = normalizarPagina(p);
    for (const m of pn.normal.matchAll(global)) {
      const i = m.index ?? 0;
      const posicao = pn.mapa[i] ?? 0;
      const fim = pn.mapa[i + m[0].length - 1] ?? posicao;
      achados.push({
        pagina: p.numero,
        termo: m[0],
        posicao,
        trecho: trechoEmVolta(pn.original, posicao, fim - posicao + 1),
      });
    }
  }
  return achados;
}

/**
 * Primeira ocorrência de um conjunto de sinais: um termo simples, ou todos os termos de um composto na mesma página.
 */
export function procurarSinais(
  paginas: PaginaLida[],
  sinais: { termos: string[]; compostos?: string[][] },
  faixa?: Set<number>,
): Ocorrencia | undefined {
  const simples = procurar(paginas, sinais.termos, { paginas: faixa, primeira: true });
  const candidatos: Ocorrencia[] = simples.slice(0, 1);
  for (const composto of sinais.compostos ?? []) {
    const porTermo = composto.map((t) => procurar(paginas, [t], { paginas: faixa }));
    const paginasComTodos = [...new Set(porTermo[0]?.map((o) => o.pagina) ?? [])].filter((pg) =>
      porTermo.every((ocs) => ocs.some((o) => o.pagina === pg)),
    );
    const pg = paginasComTodos[0];
    if (pg !== undefined) candidatos.push(porTermo[0]?.find((o) => o.pagina === pg) as Ocorrencia);
  }
  return candidatos.sort((a, b) => a.pagina - b.pagina || a.posicao - b.posicao)[0];
}
