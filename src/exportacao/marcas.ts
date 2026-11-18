// Marcas dos itens nos documentos exportados (decisão 0084), sem dependências: usadas pela exportação e por
// src/pmo/itens.ts.
/**
 * Marcas no lugar do texto repetido em cada item (decisão 0084): o item pendente de revisão do GP leva ○, e a sugestão
 * com redação a conferir leva ◊ (o △ não existe na fonte do PDF). A capa traz a legenda e a contagem.
 */
export const MARCA_PENDENTE = "○";
export const MARCA_REDACAO = "◊";
export interface ContagemDeMarcas {
  pendentes: number;
  redacaoAConferir: number;
}

/** A legenda das marcas, com a contagem; vazia quando nenhum item tem marca. */
export function legendaDasMarcas(m?: ContagemDeMarcas): string {
  if (!m || (!m.pendentes && !m.redacaoAConferir)) return "";
  const partes = [
    m.pendentes ? `${MARCA_PENDENTE} pendente de revisão do GP: ${m.pendentes} item(ns)` : "",
    m.redacaoAConferir ? `${MARCA_REDACAO} redação a conferir: ${m.redacaoAConferir} item(ns)` : "",
  ].filter(Boolean);
  return `Marcas: ${partes.join(" · ")}.`;
}

/** O prefixo das marcas de um item ("○ ", "○◊ " ou ""). */
export function marcasDoItem(pendente: boolean, redacaoAConferir: boolean): string {
  const m = `${pendente ? MARCA_PENDENTE : ""}${redacaoAConferir ? MARCA_REDACAO : ""}`;
  return m ? `${m} ` : "";
}

/** Conta as marcas no começo dos parágrafos e das células (cada texto conta uma vez por marca). */
export function contarMarcas(textos: string[]): ContagemDeMarcas {
  const m = { pendentes: 0, redacaoAConferir: 0 };
  for (const t of textos) {
    const prefixo = /^[○◊]+/.exec(t.trimStart())?.[0] ?? "";
    if (prefixo.includes(MARCA_PENDENTE)) m.pendentes++;
    if (prefixo.includes(MARCA_REDACAO)) m.redacaoAConferir++;
  }
  return m;
}
