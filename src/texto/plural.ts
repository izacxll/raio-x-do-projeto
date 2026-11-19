// Singular ou plural pela quantidade, sem "item(ns)" nem "decisão(ões)" no texto que o GP lê (decisão 0089).

/**
 * A palavra no singular ou no plural. Pela norma do português, o singular vale de 1 até menos de 2
 * ("1 ponto", "1,5 ponto"); zero e o resto vão no plural ("0 itens", "2 itens").
 */
export function plural(n: number, singular: string, varios: string): string {
  const a = Math.abs(n);
  return a > 0 && a < 2 ? singular : varios;
}

/** A quantidade com a palavra: "1 decisão", "6 decisões". */
export function contar(n: number, singular: string, varios: string): string {
  return `${n} ${plural(n, singular, varios)}`;
}

/** "item(ns)" → "itens", "decisão(ões)" → "decisões", "útil(eis)" → "úteis", "linha(s)" → "linhas". */
function formaPlural(palavra: string, sufixo: string): string {
  if (sufixo === "ns") return palavra.replace(/m$/, "") + "ns";
  if (sufixo === "ões") return palavra.replace(/ão$/, "") + "ões";
  if (sufixo === "eis") return palavra.replace(/il$/, "") + "eis";
  if (sufixo === "is") return palavra.replace(/l$/, "") + "is";
  return palavra + sufixo;
}

/**
 * Rede final para texto que vem pronto de fora do código do app (placar e conferência gravados na pasta do caso): cada
 * "N palavra(s)" vira singular ou plural pela quantidade, inclusive as palavras seguidas ("7 dia(s) corrido(s)").
 */
export function corrigirPlurais(texto: string): string {
  return texto.replace(
    /(\d+(?:[.,]\d+)?)((?:\s+\p{L}+\((?:s|ns|ões|eis|is)\))+)/gu,
    (_, numero: string, palavras: string) => {
      const n = Number(numero.replace(/\./g, "").replace(",", "."));
      return (
        numero +
        palavras.replace(
          /(\s+)(\p{L}+)\((s|ns|ões|eis|is)\)/gu,
          (_m, esp: string, p: string, suf: string) => {
            return esp + plural(n, p, formaPlural(p, suf));
          },
        )
      );
    },
  );
}
