// Segunda instância leve da etapa 5 (decisão 0077): confere os vereditos "falso" e "regra_errada" do PMO contra a
// página citada e as premissas críticas que se aplicam. Tudo é Sugestão: quem decide é o GP.
import { z } from "zod";
import { FontePmo } from "./comum";

export const RevisaoDeVeredito = z.object({
  /** Id do achado do código, como veio no pedido. */
  achado: z.string(),
  /**
   * confirma: o veredito do PMO vale (o trecho cobre o item inteiro, ou a regra errou mesmo);
   * derruba: o trecho não cobre o item (ou a regra acertou): o achado vale;
   * em_parte: o trecho cobre só parte do item: o achado vale, com a parte que falta;
   * sem_base: as páginas enviadas não bastam para julgar: o veredito do PMO fica como está.
   */
  revisao: z.enum(["confirma", "derruba", "em_parte", "sem_base"]),
  /** Obrigatória em "em_parte" e "derruba": o que do item a evidência não cobre. */
  parteQueFalta: z.string(),
  motivo: z.string(),
  evidencias: z.array(FontePmo),
});
export type RevisaoDeVeredito = z.infer<typeof RevisaoDeVeredito>;

export const RevisaoDePremissa = z.object({
  /** PC1…PC8. */
  codigo: z.string(),
  /**
   * tratada: escrita como premissa (o que se assume, de quem depende, consequência) nos três lugares (B3, B27 com
   * gatilho, A11 com reajuste); so_citada: o assunto aparece, sem a premissa escrita ou fora de algum dos lugares;
   * nao_localizada: não aparece nas linhas enviadas (não achado não é ausente: conferir no documento).
   */
  situacao: z.enum(["tratada", "so_citada", "nao_localizada"]),
  /** Os lugares em que falta (B3, B27, A11), ou "". */
  falta: z.string(),
  motivo: z.string(),
  evidencias: z.array(FontePmo),
});
export type RevisaoDePremissa = z.infer<typeof RevisaoDePremissa>;

export const RespostaSegundaEtapa5 = z.object({
  vereditos: z.array(RevisaoDeVeredito),
  premissas: z.array(RevisaoDePremissa),
  /** O que foi conferido e passou (sempre aparece). */
  conferido: z.array(z.string()),
});
export type RespostaSegundaEtapa5 = z.infer<typeof RespostaSegundaEtapa5>;
