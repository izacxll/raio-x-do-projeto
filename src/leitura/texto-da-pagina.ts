// Texto de uma página do PDF, montado por linhas a partir dos pedaços que o pdf.js devolve.
// Pedaços na mesma altura viram uma linha, da esquerda para a direita. Um espaço grande entre dois pedaços
// (coluna de tabela) vira tabulação, para a estrutura da tabela não se perder no texto.

export interface PedacoTexto {
  str: string;
  /** Matriz [a, b, c, d, x, y] do pdf.js. */
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
}

function ehPedaco(item: unknown): item is PedacoTexto {
  return typeof item === "object" && item !== null && "str" in item && "transform" in item;
}

export function montarLinhas(itens: unknown[]): string {
  const pedacos = itens.filter(ehPedaco).filter((p) => p.str.length > 0);
  if (!pedacos.length) return "";

  type Linha = { y: number; altura: number; pedacos: PedacoTexto[] };
  const linhas: Linha[] = [];
  for (const p of pedacos) {
    const y = p.transform[5] ?? 0;
    const altura = Math.abs(p.height || p.transform[3] || 10);
    // mesma linha: diferença de altura menor que metade do corpo do texto
    const linha = linhas.find((l) => Math.abs(l.y - y) <= Math.max(2, Math.min(l.altura, altura) * 0.5));
    if (linha) linha.pedacos.push(p);
    else linhas.push({ y, altura, pedacos: [p] });
  }

  linhas.sort((a, b) => b.y - a.y);
  return linhas
    .map((l) => {
      const ordenados = [...l.pedacos].sort((a, b) => (a.transform[4] ?? 0) - (b.transform[4] ?? 0));
      let texto = "";
      let fimAnterior: number | null = null;
      for (const p of ordenados) {
        const x = p.transform[4] ?? 0;
        if (fimAnterior !== null) {
          const vao = x - fimAnterior;
          const corpo = l.altura || 10;
          if (vao > corpo * 2) texto += "\t";
          else if (vao > corpo * 0.15 && !/\s$/.test(texto) && !/^\s/.test(p.str)) texto += " ";
        }
        texto += p.str;
        fimAnterior = x + p.width;
      }
      return texto.replace(/ {2,}/g, " ").trimEnd();
    })
    .filter((t) => t.trim().length > 0)
    .join("\n");
}
