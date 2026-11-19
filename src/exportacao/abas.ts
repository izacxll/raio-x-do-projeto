// Nome das abas da planilha (XLSX), num módulo leve: o plano (DOCX) diz em que aba está cada registro sem carregar o
// gerador da planilha.

/** Nome de aba válido no Excel: até 31 caracteres, sem : \ / ? * [ ], e sem repetir. */
export function nomeDeAba(titulo: string, usados: Set<string>): string {
  const base =
    titulo
      .replace(/[:\\/?*[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 28) || "Planilha";
  let nome = base;
  for (let i = 2; usados.has(nome.toLowerCase()); i++) nome = `${base.slice(0, 27)} ${i}`;
  usados.add(nome.toLowerCase());
  return nome;
}

/** As abas da planilha, na ordem das seções com tabela (o mesmo que o gerador faz). */
export function abasDasSecoes(secoes: { titulo: string; tabela?: unknown }[]): string[] {
  const usados = new Set<string>();
  return secoes.filter((s) => s.tabela).map((s) => nomeDeAba(s.titulo, usados));
}
