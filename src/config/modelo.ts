// Modelo da API e esforço de cada passo do PMO: um arquivo só (decisão 0002).
// Opus 5.5 é o padrão provisório; a escolha final sai da comparação com o Sonnet 5.5 na mesma RFP pública.

export type IdModelo = "claude-opus-5-5" | "claude-sonnet-5-5";

export const MODELOS: Record<IdModelo, { nome: string }> = {
  "claude-opus-5-5": { nome: "Claude Opus 5.5" },
  "claude-sonnet-5-5": { nome: "Claude Sonnet 5.5" },
};

/** Padrão provisório (decisão 0002). */
export const MODELO_PADRAO: IdModelo = "claude-opus-5-5";

/** O outro modelo da comparação da F2. */
export const MODELO_COMPARACAO: IdModelo = "claude-sonnet-5-5";

export type Esforco = "low" | "medium" | "high" | "xhigh" | "max";

/**
 * Passos que chamam o PMO. O teste da chave é uma chamada mínima. Etapa 2: estratégia, conteúdo e EAP.
 * Etapa 3: os 12 elementos do TAP e o registro de premissas inicial.
 */
export type PassoPmo = "teste" | "estrategia" | "conteudo" | "eap" | "tap" | "premissas";

/**
 * Esforço explícito por passo: no Opus 5.5 o padrão da API é "medium", e o pensamento não pode ser desligado
 * (só o esforço controla a profundidade). Criar a estratégia, o conteúdo e a EAP pede "high".
 */
export const ESFORCO: Record<PassoPmo, Esforco> = {
  teste: "low",
  estrategia: "high",
  conteudo: "high",
  eap: "high",
  tap: "high",
  premissas: "high",
};

/** Limite de saída de cada passo (tokens), já com a folga do raciocínio. A chamada é por streaming. */
export const LIMITE_SAIDA: Record<PassoPmo, number> = {
  teste: 512,
  estrategia: 32000,
  conteudo: 48000,
  eap: 48000,
  tap: 48000,
  premissas: 32000,
};

/** Saída que se espera de cada passo (tokens), só para a estimativa de custo antes da chamada. */
export const SAIDA_ESPERADA: Record<PassoPmo, { min: number; max: number }> = {
  teste: { min: 5, max: 50 },
  estrategia: { min: 4000, max: 14000 },
  conteudo: { min: 6000, max: 22000 },
  eap: { min: 6000, max: 22000 },
  tap: { min: 6000, max: 20000 },
  premissas: { min: 3000, max: 12000 },
};

/**
 * Documento maior que isto (tokens estimados) não é enviado inteiro: a tela pede ao GP para tirar anexos que
 * não tratam do objeto (planilhas de outros lotes, modelos de declaração). O contexto do modelo é de 1 milhão.
 */
export const LIMITE_DOCUMENTO_TOKENS = 400_000;
