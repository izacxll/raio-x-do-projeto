// A chave da API do GP (decisão 0003): só no sessionStorage desta aba ("só nesta sessão").
// Nunca no código, no repositório, no dossiê, nos documentos exportados nem em logs.
// "Lembrar neste navegador" (localStorage) fica desativado: no GitHub Pages, a origem é compartilhada com os
// outros sites da mesma conta.

const CHAVE_SESSAO = "raio-x-do-projeto:chave-api";

/** Formato de uma chave da API da Anthropic. Só para avisar erro de cópia; quem valida é a API (botão "Testar"). */
export const FORMATO_CHAVE = /^sk-ant-[A-Za-z0-9_-]{20,}$/;

function armazenamento(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

export function lerChave(): string | null {
  try {
    return armazenamento()?.getItem(CHAVE_SESSAO) ?? null;
  } catch {
    return null;
  }
}

export function guardarChave(chave: string): void {
  armazenamento()?.setItem(CHAVE_SESSAO, chave.trim());
  avisar();
}

export function esquecerChave(): void {
  try {
    armazenamento()?.removeItem(CHAVE_SESSAO);
  } catch {
    // sem armazenamento: não há o que esquecer
  }
  avisar();
}

/** Mostra só o começo e o fim, para o GP reconhecer qual chave está em uso. */
export function mascararChave(chave: string): string {
  return chave.length <= 16 ? "•••" : `${chave.slice(0, 10)}…${chave.slice(-4)}`;
}

/** Tira de um texto qualquer coisa com cara de chave (mensagens de erro, registros). */
export function semChave(texto: string): string {
  return texto.replace(/sk-ant-[A-Za-z0-9_-]{8,}/g, "[chave omitida]");
}

// avisa as telas quando a chave muda (guardar, esquecer)
const ouvintes = new Set<() => void>();
function avisar() {
  for (const f of ouvintes) f();
}
export function aoMudarChave(f: () => void): () => void {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}
