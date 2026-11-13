// A frase que contém uma posição do texto, e a limpeza de cabeçalho e rodapé repetidos nas páginas.
import type { PaginaLida } from "../dossie/esquema";
import { compactar, limparCarimbos } from "./normalizar";

// origem: App-final-4.jsx, RP_MARCA, linha 1446
/** Marcador de item no começo da linha (traço, bolinha, "a)"). */
export const MARCA_DE_ITEM = /^(?:[-•▪●◦■□➢➤✓✔·*]|[-–—](?=\s)|\(?[a-z]\)(?=\s))\s*/;

// origem: App-final-4.jsx, rpLimpa, linha 1455
export function limparEspacos(s: string): string {
  return String(s).replace(/\s+/g, " ").trim();
}

// origem: App-final-4.jsx, rpFrase, linha 1507
/**
 * Frase que contém a posição i. Corta em ". " seguido de maiúscula ou número, em ";", em marcador de item e em
 * linha curta (título, célula, fim de parágrafo). Sem limite achado, começa no máximo 500 caracteres antes.
 */
export function fraseEmVolta(t: string, i: number, maximo = 400): string {
  const base = Math.max(0, i - 500);
  const antes = t.slice(base, i + 1);
  let ini = base ? base + Math.max(0, antes.search(/\s/) + 1) : 0;
  for (const re of [/\.\s+(?=[A-ZÀ-Ý0-9])/g, /;\s/g, /\n(?=[-•▪●◦■□➢➤✓✔·*-])/g, /:\s*\n/g])
    for (const m of antes.matchAll(re)) ini = Math.max(ini, base + (m.index ?? 0) + m[0].length);
  const curta = (a: number, b: number) => b - a < 70;
  for (let k = t.lastIndexOf("\n", i - 1); k >= ini && k > 0; k = t.lastIndexOf("\n", k - 1)) {
    const a0 = t.lastIndexOf("\n", k - 1) + 1;
    if (curta(a0, k)) {
      ini = Math.max(ini, k + 1);
      break;
    }
  }
  const depois = t.slice(i);
  let f = depois.search(/\.\s+(?=[A-ZÀ-Ý0-9])|;\s|\n(?=[-•▪●◦■□➢➤✓✔·*-])|\.\s*$/);
  for (let k = t.indexOf("\n", i); k > 0 && (f < 0 || k < i + f); k = t.indexOf("\n", k + 1)) {
    const a0 = t.lastIndexOf("\n", k - 1) + 1;
    if (curta(a0, k) && k > i) {
      f = k - i;
      break;
    }
  }
  const frase = limparEspacos(t.slice(ini, f < 0 ? i + 250 : i + f + 1)).replace(MARCA_DE_ITEM, "");
  return frase.length > maximo ? `${frase.slice(0, maximo).replace(/\s+\S*$/, "")}…` : frase;
}

// origem: App-final-4.jsx, rpCorpo, linha 1458
/**
 * Páginas sem o cabeçalho e o rodapé repetidos (a mesma linha, números à parte, em metade das páginas ou mais)
 * e sem os carimbos de assinatura. As linhas tiradas viram espaços do mesmo tamanho: as posições continuam
 * valendo no texto original.
 */
export function paginasSemCabecalho(paginas: PaginaLida[]): PaginaLida[] {
  const n = paginas.length;
  if (n < 3) return paginas;
  const chave = (t: string) => compactar(t.replace(/\d+/g, ""));
  const emPaginas = new Map<string, Set<number>>();
  for (const p of paginas)
    for (const l of p.texto.split("\n")) {
      const c = chave(l);
      if (c.length < 3) continue;
      if (!emPaginas.has(c)) emPaginas.set(c, new Set());
      emPaginas.get(c)?.add(p.numero);
    }
  const minimo = Math.max(3, Math.ceil(n / 2));
  const repetida = (l: string) => {
    const c = chave(l);
    if (c.length < 3) return /^[\d\s/|-]+$/.test(l.trim()) && l.trim().length > 0;
    return (emPaginas.get(c)?.size ?? 0) >= minimo;
  };
  return paginas.map((p) => {
    const texto = limparCarimbosMesmoTamanho(
      p.texto
        .split("\n")
        .map((l) => (repetida(l) ? " ".repeat(l.length) : l))
        .join("\n"),
    );
    return texto === p.texto ? p : { ...p, texto };
  });
}

function limparCarimbosMesmoTamanho(texto: string): string {
  const limpo = limparCarimbos(texto);
  if (limpo.length === texto.length) return limpo;
  // o carimbo vira um espaço só: refaz a troca mantendo o comprimento
  let saida = "";
  let i = 0;
  for (const m of texto.matchAll(
    /D4Sign\s+[0-9a-f-]{20,}\s*-\s*Para confirmar as assinaturas acesse\s+\S+|Documento assinado eletronicamente, conforme MP 2\.200-2\/01[^\n]*/gi,
  )) {
    saida += texto.slice(i, m.index) + " ".repeat(m[0].length);
    i = (m.index ?? 0) + m[0].length;
  }
  return saida + texto.slice(i);
}
