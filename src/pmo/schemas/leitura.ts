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

export const RespostaLeitura = z.object({
  achados: z.array(AchadoPmo),
  observacoes: z.array(ItemPmo),
});
export type RespostaLeitura = z.infer<typeof RespostaLeitura>;
