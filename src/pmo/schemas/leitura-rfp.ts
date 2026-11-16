// Schema da leitura do PMO na etapa 1 (decisões 0032 e 0035): a leitura da RFP na estrutura do método
// (docs/estudos/metodo-etapa-1.md), seção a seção. O PMO parte do esqueleto do código e não faz contas; o código
// confere depois cada citação, cada número e cada número R.
import { z } from "zod";
import { FontePmo, RotuloPmo, ItemAutoconferencia, CruzamentoPmo } from "./comum";

export const SecaoLeituraPmo = z.enum([
  "uma-pagina",
  "fazer-e-entregar",
  "prazos",
  "dinheiro",
  "julgamento",
  "habilitacao",
  "atencao",
  "nao-se-aplica",
]);

export const PremissaPmo = z.enum(["PC1", "PC2", "PC3", "PC4", "PC5", "PC6", "PC7", "PC8", ""]);

export const ItemLeituraRfpPmo = z.object({
  id: z.string(),
  secao: SecaoLeituraPmo,
  nome: z.string(),
  /** O conteúdo, como o gerente lê: consolidado, com faixas, sem um número por linha. */
  texto: z.string(),
  rotulo: RotuloPmo,
  /** Trechos literais, de uma página cada, que sustentam o item. */
  fontes: z.array(FontePmo),
  /** Números R do esqueleto que o item cobre. O PMO não cria número R. */
  requisitos: z.array(z.string()),
  /** Seção 2: tema da obrigação (equipe, relatórios, prestação de contas…), ou "". */
  tema: z.string(),
  /** Seção 7: a premissa crítica ligada ao ponto, ou "". */
  premissa: PremissaPmo,
  /** Seção 7: por que pesa, numa frase; "" nas outras seções. */
  porquePesa: z.string(),
  /** Seção 7: pergunta de esclarecimento sugerida, em redação condicional; "" nas outras seções. */
  pergunta: z.string(),
  /** Seção 7: ordem de impacto (1 = mais pesa); 0 nas outras seções. */
  impacto: z.number().int(),
});
export type ItemLeituraRfpPmo = z.infer<typeof ItemLeituraRfpPmo>;

export const RespostaLeituraRfp = z.object({
  /** Cruzamentos obrigatórios X1 a X6 (decisão 0046), registrados depois de ler. */
  cruzamentos: z.array(CruzamentoPmo).default([]),
  /** Autoconferência (decisão 0044): cada item do método ou das fichas usado, com o estado. */
  autoconferencia: z.array(ItemAutoconferencia).default([]),
  itens: z.array(ItemLeituraRfpPmo),
});
export type RespostaLeituraRfp = z.infer<typeof RespostaLeituraRfp>;
