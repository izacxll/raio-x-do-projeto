// Normalização de texto para comparar trechos sem depender de acento, caixa ou espaços.

// origem: App-final-4.jsx, rpBase, linha 1450
/** Minúsculas e sem acento, letra por letra: o texto mantém o comprimento e as posições. */
export function tirarAcentos(texto: string): string {
  return String(texto).replace(/[\s\S]/g, (ch) => (ch.normalize("NFKD")[0] ?? ch).toLowerCase()[0] ?? ch);
}

// origem: App-final-4.jsx, rpCompacto, linha 1451
/** Só letras e números, sem acento e em minúsculas: base para conferir se um trecho está no texto. */
export function compactar(texto: string): string {
  return tirarAcentos(texto).replace(/[^a-z0-9]/g, "");
}

// origem: App-final-4.jsx, RP_CARIMBO, linha 1454
/** Carimbos de assinatura eletrônica que o leitor de PDF cola no meio do texto. */
const CARIMBO_ASSINATURA =
  /D4Sign\s+[0-9a-f-]{20,}\s*-\s*Para confirmar as assinaturas acesse\s+\S+|Documento assinado eletronicamente, conforme MP 2\.200-2\/01[^\n]*/gi;

export function limparCarimbos(texto: string): string {
  return texto.replace(CARIMBO_ASSINATURA, " ");
}
