// Lê as cores de tokens.css para a exportação (DOCX, XLSX e PDF), que não enxerga variáveis CSS.
// Assim a cor continua definida num lugar só.
import css from "./estilos/tokens.css?raw";

export function lerCores(texto: string): Record<string, string> {
  const cores: Record<string, string> = {};
  for (const m of texto.matchAll(/--([a-z0-9-]+):\s*#([0-9a-fA-F]{6})\s*;/g)) {
    if (m[1] && m[2]) cores[m[1]] = m[2].toUpperCase();
  }
  return cores;
}

const cores = lerCores(css);

/** Cor do token, em "RRGGBB" (sem #), para bibliotecas de exportação. */
export function cor(nome: string): string {
  const valor = cores[nome];
  if (!valor) throw new Error(`token de cor inexistente: --${nome}`);
  return valor;
}
