// Detecção de figura ou tabela colada como imagem na página: o texto dela não é extraído.

// origem: App-final-4.jsx, AREA_MIN_IMG, linha 1409
/** Brasões, logos e assinaturas são pequenos; o limite de área (pixels da imagem) separa uns dos outros. */
export const AREA_MIN_IMAGEM = 50000;

export interface ListaOperadores {
  fnArray: number[];
  argsArray: unknown[][];
}

export interface CodigosOperadores {
  paintImageXObject: number;
  paintInlineImageXObject: number;
}

// origem: App-final-4.jsx, temImagemDeConteudo, linha 1413
/**
 * Tamanhos ("largura×altura") das imagens grandes da página, ou null se não deu para verificar.
 * null é tratado como "pode haver imagem", nunca como "não há".
 */
export async function medirImagens(
  pagina: { getOperatorList(): Promise<ListaOperadores> },
  OPS: CodigosOperadores,
): Promise<string[] | null> {
  const tamanhos: string[] = [];
  try {
    const ol = await pagina.getOperatorList();
    for (let i = 0; i < ol.fnArray.length; i++) {
      const fn = ol.fnArray[i];
      const a = ol.argsArray[i] ?? [];
      let w = 0;
      let h = 0;
      if (fn === OPS.paintImageXObject) {
        w = Number(a[1]) || 0;
        h = Number(a[2]) || 0;
      } else if (fn === OPS.paintInlineImageXObject) {
        const img = a[0] as { width?: number; height?: number } | undefined;
        w = img?.width ?? 0;
        h = img?.height ?? 0;
      }
      if (w * h >= AREA_MIN_IMAGEM) tamanhos.push(`${w}×${h}`);
    }
  } catch {
    return null;
  }
  return tamanhos;
}

// origem: App-final-4.jsx, paginasComImagem, linha 1430
/**
 * Páginas com imagem de conteúdo. Imagem do mesmo tamanho em pelo menos metade das páginas lidas (e em 3 ou mais)
 * é decorativa (o logotipo que se repete no cabeçalho) e não conta.
 */
export function listarPaginasComImagem(porPagina: Record<number, string[]>): number[] {
  const frequencia: Record<string, number> = {};
  for (const tamanhos of Object.values(porPagina)) {
    for (const t of new Set(tamanhos)) frequencia[t] = (frequencia[t] ?? 0) + 1;
  }
  const lidas = Object.keys(porPagina).length;
  const decorativas = new Set(
    Object.keys(frequencia).filter((t) => (frequencia[t] ?? 0) >= 3 && (frequencia[t] ?? 0) >= lidas / 2),
  );
  return Object.entries(porPagina)
    .filter(([, tamanhos]) => tamanhos.some((t) => !decorativas.has(t)))
    .map(([n]) => Number(n))
    .sort((a, b) => a - b);
}
