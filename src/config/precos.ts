// Preços da API, em US$ por milhão de tokens (decisão 0002). Consultados em 13/11/2026, na referência da API
// (claude-api, tabela de modelos e cache). Reconferir em docs.claude.com quando a FGV fechar o modelo.
// Escrita no cache de 5 minutos custa 1,25 × a entrada; leitura do cache tem preço próprio.

export interface PrecoModelo {
  entrada: number;
  saida: number;
  leituraCache: number;
  escritaCache: number;
}

export const PRECOS_CONSULTADOS_EM = "13/11/2026";

export const PRECOS: Record<string, PrecoModelo> = {
  "claude-opus-5-5": { entrada: 4, saida: 20, leituraCache: 0.2, escritaCache: 5 },
  "claude-sonnet-5-5": { entrada: 2, saida: 10, leituraCache: 0.1, escritaCache: 2.5 },
};

/** Câmbio não entra: o valor fica em dólar, como a cobrança da API. */
export const MOEDA = "US$";
