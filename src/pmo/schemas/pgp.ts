// Schemas da etapa 4 (PGP), na ordem da decisão 0007, em seis pedidos ao PMO. O PMO escreve o texto de cada parte
// (ParteGerada) e as estruturas que o código usa nas contas (atividades, horas, riscos, indicadores). Contas, datas,
// caminho crítico, marcos, custos e rastreabilidade são do código.
import { z } from "zod";
import { ItemPmo } from "./comum";
import { AtividadeEap, HorasPerfil, LinhaRaci, PerfilEquipe } from "./proposta";
import { PremissaRegistro } from "./tap";

/** Texto de uma parte do plano (A1…A18, B1…B33): itens rotulados, cada um com a ficha (A7.2…). */
export const ParteGerada = z.object({
  codigo: z.string(),
  itens: z.array(ItemPmo),
});
export type ParteGerada = z.infer<typeof ParteGerada>;

// ---------- passos 1 e 2: adaptação, ciclo de vida e abordagem ----------

export const SugestaoAdaptacao = z.object({
  codigo: z.string(),
  recomendacao: z.enum(["essencial", "recomendado", "dispensavel"]),
  /** Uma linha, com a base ("Quando dispensar" da ficha, PMBOK 7). */
  justificativa: z.string(),
});
export type SugestaoAdaptacao = z.infer<typeof SugestaoAdaptacao>;

export const FaseCiclo = z.object({
  nome: z.string(),
  /** Produtos (P1…) ou entregas da fase. */
  entregas: z.array(z.string()),
  criterioDeSaida: z.string(),
});
export type FaseCiclo = z.infer<typeof FaseCiclo>;

export const RespostaAdaptacao = z.object({
  partes: z.array(SugestaoAdaptacao),
  abordagem: z.enum(["preditiva", "adaptativa", "hibrida"]),
  fases: z.array(FaseCiclo),
  /** A17 e A18. */
  textos: z.array(ParteGerada),
  observacoes: z.array(ItemPmo),
});
export type RespostaAdaptacao = z.infer<typeof RespostaAdaptacao>;

// ---------- passo 3: escopo ----------

/** Pacote da EAP com o dicionário (A13). */
export const PacoteEap = z.object({
  id: z.string(),
  nome: z.string(),
  /** Produto (P1…) a que o pacote pertence. */
  produto: z.string(),
  requisitos: z.array(z.string()),
  descricao: z.string(),
  criterioDeAceite: z.string(),
});
export type PacoteEap = z.infer<typeof PacoteEap>;

export const RespostaEscopo = z.object({
  /** A1, A2, B22, B17, A13. */
  textos: z.array(ParteGerada),
  eap: z.array(PacoteEap),
  observacoes: z.array(ItemPmo),
});
export type RespostaEscopo = z.infer<typeof RespostaEscopo>;

// ---------- passos 4 a 6: atividades, recursos, durações ----------

export const RespostaCronograma = z.object({
  /** A3, A6, B1, B4, B12, B13, B24, B25, B26, B32 (as que o GP marcou). */
  textos: z.array(ParteGerada),
  /** Atividades por pacote da EAP (campo "produto" = id do pacote), com durações em três pontos. */
  atividades: z.array(AtividadeEap),
  perfis: z.array(PerfilEquipe),
  horas: z.array(HorasPerfil),
  raci: z.array(LinhaRaci),
  observacoes: z.array(ItemPmo),
});
export type RespostaCronograma = z.infer<typeof RespostaCronograma>;

// ---------- passos 7 a 9: riscos, custos e atualização das premissas ----------

export const RiscoRegistro = z.object({
  id: z.string(),
  /** O risco escrito como condição futura ("se… então…"), nunca como brecha do texto. */
  item: ItemPmo,
  categoria: z.string(),
  probabilidade: z.enum(["baixa", "media", "alta"]),
  impacto: z.enum(["baixo", "medio", "alto"]),
  estrategia: z.enum(["evitar", "mitigar", "transferir", "aceitar", "explorar", "melhorar", "compartilhar"]),
  resposta: z.string(),
  gatilho: z.string(),
  /** Papel responsável (nunca nome de pessoa). */
  responsavel: z.string(),
  /** PC1…PC8, ou "". */
  premissaCritica: z.string(),
  /** Pede reserva de contingência (o valor é do GP). */
  pedeReserva: z.boolean(),
});
export type RiscoRegistro = z.infer<typeof RiscoRegistro>;

export const RespostaRiscos = z.object({
  /** A8 e A4. */
  textos: z.array(ParteGerada),
  riscos: z.array(RiscoRegistro),
  /** B3: as premissas novas das estimativas e dos riscos (as do TAP já estão no registro inicial). */
  premissas: z.array(PremissaRegistro),
  observacoes: z.array(ItemPmo),
});
export type RespostaRiscos = z.infer<typeof RespostaRiscos>;

// ---------- passo 10: demais planos e documentos ----------

export const RespostaPlanos = z.object({
  /** A5, A7, A9, A10, A11, A12, B14, B20, B31 (as que o GP marcou). */
  textos: z.array(ParteGerada),
  observacoes: z.array(ItemPmo),
});
export type RespostaPlanos = z.infer<typeof RespostaPlanos>;

// ---------- passos 11 e 12: linha de base da medição e documentos de execução ----------

export const Indicador = z.object({
  nome: z.string(),
  /** Como se calcula (a conta é do código ou do GP na execução). */
  formula: z.string(),
  /** Meta como o documento diz, ou "a definir pelo GP". */
  meta: z.string(),
  frequencia: z.string(),
  fonte: z.string(),
});
export type Indicador = z.infer<typeof Indicador>;

export const RespostaExecucao = z.object({
  /** A16 e os modelos iniciais B5, B7, B9, B10, B19, B21, B28, B30, B33 (os que o GP marcou). */
  textos: z.array(ParteGerada),
  indicadores: z.array(Indicador),
  observacoes: z.array(ItemPmo),
});
export type RespostaExecucao = z.infer<typeof RespostaExecucao>;

export const SCHEMAS_PGP = {
  adaptacao: RespostaAdaptacao,
  escopo: RespostaEscopo,
  cronograma: RespostaCronograma,
  riscos: RespostaRiscos,
  planos: RespostaPlanos,
  execucao: RespostaExecucao,
} as const;
export type PassoPgp = keyof typeof SCHEMAS_PGP;
