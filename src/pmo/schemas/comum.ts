// Item rotulado do PMO (SKILL.md, seção 4): o mesmo formato em todos os passos.
// Os schemas viram o JSON Schema da saída estruturada da API (output_config.format) e validam a resposta.
// Sem limites numéricos nem de tamanho no schema: a API não os aceita; quem confere é o código depois.
import { z } from "zod";

export const DocFonte = z.enum(["rfp", "proposta", "tap", "pgp"]);

export const FontePmo = z.object({
  doc: DocFonte,
  /** Página do arquivo PDF (1 = primeira página do arquivo). */
  pagina: z.number().int(),
  /** Literal, como está no documento. */
  trecho: z.string(),
});
export type FontePmo = z.infer<typeof FontePmo>;

export const AlternativaPmo = z.object({
  texto: z.string(),
  pros: z.string(),
  contras: z.string(),
});

export const RotuloPmo = z.enum(["documento", "sugestao", "decisao_gp"]);
export type RotuloPmo = z.infer<typeof RotuloPmo>;

export const ItemPmo = z.object({
  id: z.string(),
  texto: z.string(),
  rotulo: RotuloPmo,
  /** Por que o PMO sugere: o trecho, a ficha, a premissa crítica. */
  motivo: z.string(),
  /** Obrigatório em "documento"; em "sugestao", quando a sugestão nasce de um trecho. */
  fontes: z.array(FontePmo),
  /** De 2 a 3, quando fizer sentido; senão, vazio. */
  alternativas: z.array(AlternativaPmo),
  /** Números R que o item atende ou afeta. */
  requisitos: z.array(z.string()),
  /** Item do conteúdo mínimo que o item cobre (PROP-SOW.4, TAP6.1…), ou vazio. */
  ficha: z.string(),
});
export type ItemPmo = z.infer<typeof ItemPmo>;

/** Estimativa em três pontos. O PMO nunca dá a média: quem calcula é o código. */
export const EstimativaTresPontos = z.object({
  otimista: z.number(),
  mais_provavel: z.number(),
  pessimista: z.number(),
  base: z.string(),
});
export type EstimativaTresPontos = z.infer<typeof EstimativaTresPontos>;
