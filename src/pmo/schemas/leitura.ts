// Schema da leitura do PMO na conferência (etapa 5, F5b; decisão 0013). O PMO aponta o vago, o conflituoso e o
// ausente que dependem de interpretação; categoria e gravidade não vêm dele (regra fixa do código).
import { z } from "zod";
import { FontePmo, ItemPmo } from "./comum";

export const AchadoPmo = z.object({
  id: z.string(),
  tipo: z.enum(["vago", "conflituoso", "ausente"]),
  /** Parte do PGP onde está (ou deveria estar) o problema: A1…A18, B1…B33. */
  parte: z.string(),
  /** Item do conteúdo mínimo da ficha (A7.8…), ou "". */
  item: z.string(),
  titulo: z.string(),
  descricao: z.string(),
  /** Trechos literais dos dois lados (PGP, TAP, RFP), com a página. */
  evidencias: z.array(FontePmo),
  /** Ajuste sugerido, em redação condicional. */
  sugestao: z.string(),
  /** No ausente: os termos que o código procura no plano inteiro antes de aceitar o achado. */
  termosProcurados: z.array(z.string()),
});
export type AchadoPmo = z.infer<typeof AchadoPmo>;

/**
 * Veredito do PMO sobre um achado do código (decisão 0052): o achado do código é candidato até o veredito; só o
 * "sustenta" conta no total.
 */
export const VereditoCandidato = z.object({
  /** Id do achado do código, como veio na lista do pedido. */
  achado: z.string(),
  veredito: z.enum(["sustenta", "falso", "nao_se_aplica", "regra_errada"]),
  /** Obrigatória no "falso": onde o plano tem o conteúdo (doc "pgp", página e trecho literal). */
  evidencias: z.array(FontePmo),
  /** Obrigatório no "regra_errada" (a causa) e no "nao_se_aplica" (por quê). */
  motivo: z.string(),
});
export type VereditoCandidato = z.infer<typeof VereditoCandidato>;

/** Veredito do PMO sobre a dispensa que só o plano declara (sem a etapa 4 do app): ela cabe pelas condições da ficha? */
export const VereditoDispensa = z.object({
  parte: z.string(),
  veredito: z.enum(["cabe", "nao_cabe"]),
  /** Obrigatório no "nao_cabe": a condição da ficha que a dispensa não cumpre. */
  motivo: z.string(),
});
export type VereditoDispensa = z.infer<typeof VereditoDispensa>;

export const RespostaLeitura = z.object({
  achados: z.array(AchadoPmo),
  /** Um veredito para cada achado do código (ausente, vago e conflituoso). */
  vereditos: z.array(VereditoCandidato).default([]),
  /** Um veredito para cada dispensa declarada só no plano. */
  dispensas: z.array(VereditoDispensa).default([]),
  observacoes: z.array(ItemPmo),
});
export type RespostaLeitura = z.infer<typeof RespostaLeitura>;
