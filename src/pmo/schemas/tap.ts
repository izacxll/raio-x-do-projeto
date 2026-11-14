// Schemas da etapa 3 (TAP): os 12 elementos (ficha TAP) e o registro de premissas inicial (ficha B3, bloco TAP-PR).
// O PMO redige; o código traz o que vem dos documentos, as divergências e confere o TAP.
import { z } from "zod";
import { ItemPmo } from "./comum";

/** TAP.2: objetivo com o critério de sucesso (indicador e meta). Métrica que a RFP não traz é sugestão. */
export const ObjetivoTap = z.object({
  item: ItemPmo,
  /** Indicador e meta, como texto. */
  criterioDeSucesso: z.string(),
  /** "documento": a métrica está na RFP ou na proposta; "sugestao": a métrica é do PMO. */
  origemDaMetrica: z.enum(["documento", "sugestao"]),
});
export type ObjetivoTap = z.infer<typeof ObjetivoTap>;

/** TAP.6: marco com o prazo contado de um evento ("assinatura + 30 dias"); a conta das datas é do código. */
export const MarcoTap = z.object({
  item: ItemPmo,
  /** Produto ou evento que o marco conclui (P1, "assinatura"…), ou "". */
  produto: z.string(),
  /** Evento de referência e prazo como o documento diz ("30 dias contados da assinatura"), ou "". */
  prazo: z.string(),
});
export type MarcoTap = z.infer<typeof MarcoTap>;

/** TAP.8: parte interessada-chave, com o papel e o que decide. */
export const ParteTap = z.object({
  item: ItemPmo,
  papel: z.string(),
  decide: z.string(),
});
export type ParteTap = z.infer<typeof ParteTap>;

export const RespostaTap = z.object({
  /** TAP.1 */
  finalidade: z.array(ItemPmo),
  /** TAP.2 */
  objetivos: z.array(ObjetivoTap),
  /** TAP.3: cada item com os números R. */
  requisitosAltoNivel: z.array(ItemPmo),
  /** TAP.4: descrição, entregas-chave e limites (com as exclusões da proposta). */
  descricao: z.array(ItemPmo),
  entregas: z.array(ItemPmo),
  limites: z.array(ItemPmo),
  /** TAP.5: risco geral, das brechas e das premissas críticas (brecha não vira risco). */
  riscoGeral: z.array(ItemPmo),
  /** TAP.6 */
  marcos: z.array(MarcoTap),
  /** TAP.7: decisão do GP; o PMO só sugere a redação. */
  recursosFinanceiros: z.array(ItemPmo),
  /** TAP.8 */
  partesInteressadas: z.array(ParteTap),
  /** TAP.9 */
  aprovacao: z.array(ItemPmo),
  /** TAP.10 */
  termino: z.array(ItemPmo),
  /** TAP.11: decisão do GP. */
  gerente: z.array(ItemPmo),
  /** TAP.12: decisão do GP. */
  patrocinador: z.array(ItemPmo),
  /** O que o PMO achou e o código não, com fonte. */
  observacoes: z.array(ItemPmo),
});
export type RespostaTap = z.infer<typeof RespostaTap>;

/** Uma linha do registro de premissas (B3): premissa ou restrição, com a origem e, se for crítica, a consequência. */
export const PremissaRegistro = z.object({
  item: ItemPmo,
  tipo: z.enum(["premissa", "restricao"]),
  /** De onde vem: "rfp", "proposta", "tap" ou "estimativa". */
  origem: z.enum(["rfp", "proposta", "tap", "estimativa"]),
  /** PC1…PC8, ou "". */
  premissaCritica: z.string(),
  /** O que acontece se não se confirmar (obrigatório nas críticas), ou "". */
  consequencia: z.string(),
  /** De quem depende ("contratante", "FGV", "terceiros"), ou "não informado no documento — a definir pelo GP". */
  dependeDe: z.string(),
  /** Como e quando validar, ou "a definir pelo GP". */
  comoValidar: z.string(),
});
export type PremissaRegistro = z.infer<typeof PremissaRegistro>;

export const RespostaPremissas = z.object({
  premissas: z.array(PremissaRegistro),
  observacoes: z.array(ItemPmo),
});
export type RespostaPremissas = z.infer<typeof RespostaPremissas>;

export const SCHEMAS_TAP = { tap: RespostaTap, premissas: RespostaPremissas } as const;
