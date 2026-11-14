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
 * Etapa 3: os 12 elementos do TAP e o registro de premissas inicial. Etapa 4: os seis passos do PGP (decisão 0007).
 */
export type PassoPmo =
  | "teste"
  | "estrategia"
  | "conteudo"
  | "eap"
  | "tap"
  | "premissas"
  | "adaptacao"
  | "escopo"
  | "cronograma"
  | "riscos"
  | "planos"
  | "execucao";

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
  adaptacao: "high",
  escopo: "high",
  cronograma: "high",
  riscos: "high",
  planos: "high",
  execucao: "high",
};

/** Limite de saída de cada passo (tokens), já com a folga do raciocínio. A chamada é por streaming. */
export const LIMITE_SAIDA: Record<PassoPmo, number> = {
  teste: 512,
  estrategia: 32000,
  conteudo: 48000,
  eap: 48000,
  tap: 48000,
  premissas: 32000,
  adaptacao: 32000,
  escopo: 48000,
  cronograma: 64000,
  riscos: 48000,
  planos: 64000,
  execucao: 48000,
};

/** Saída que se espera de cada passo (tokens), só para a estimativa de custo antes da chamada. */
export const SAIDA_ESPERADA: Record<PassoPmo, { min: number; max: number }> = {
  teste: { min: 5, max: 50 },
  estrategia: { min: 4000, max: 14000 },
  conteudo: { min: 6000, max: 22000 },
  eap: { min: 6000, max: 22000 },
  tap: { min: 6000, max: 20000 },
  premissas: { min: 3000, max: 12000 },
  adaptacao: { min: 4000, max: 12000 },
  escopo: { min: 6000, max: 20000 },
  cronograma: { min: 8000, max: 28000 },
  riscos: { min: 6000, max: 20000 },
  planos: { min: 8000, max: 30000 },
  execucao: { min: 5000, max: 18000 },
};

/**
 * Documento maior que isto (tokens estimados) não é enviado inteiro: a tela pede ao GP para tirar anexos que
 * não tratam do objeto (planilhas de outros lotes, modelos de declaração). O contexto do modelo é de 1 milhão.
 */
export const LIMITE_DOCUMENTO_TOKENS = 400_000;
