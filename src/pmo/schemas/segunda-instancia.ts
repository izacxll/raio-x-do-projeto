// Segunda instância (decisão 0057; SKILL.md, seção 3, "Revisão em camadas"): depois de cada
// resposta do PMO, uma chamada separada, com só a skill, os documentos e a resposta, devolve os achados. O GP vê antes
// de aprovar. Achado é sempre Sugestão: quem decide é o GP.
import { z } from "zod";
import { FontePmo } from "./comum";

export const TipoAchadoSegunda = z.enum([
  "erro_de_fato",
  "faltou",
  "incoerencia_entre_etapas",
  "rotulo_errado",
]);
export type TipoAchadoSegunda = z.infer<typeof TipoAchadoSegunda>;

export const GravidadeSegunda = z.enum(["alta", "media", "baixa"]);
export type GravidadeSegunda = z.infer<typeof GravidadeSegunda>;

export const AchadoSegundaInstancia = z.object({
  /** "s1", "s2"… */
  id: z.string(),
  tipo: TipoAchadoSegunda,
  /**
   * alta: muda preço, prazo, escopo ou quem executa, ou afirma como fato o que o documento não diz; media: o GP
   * precisa corrigir antes de aprovar; baixa: melhora a redação ou a rastreabilidade.
   */
  gravidade: GravidadeSegunda,
  /** Id do item da resposta, parte ou seção onde está o problema ("conteudo:premissas:2", "A11", "seção 4"). */
  onde: z.string(),
  texto: z.string(),
  /** Trechos literais do documento que mostram o problema (doc, página do arquivo e trecho). */
  evidencias: z.array(FontePmo),
  /** Ajuste sugerido, em redação condicional. */
  sugestao: z.string(),
});
export type AchadoSegundaInstancia = z.infer<typeof AchadoSegundaInstancia>;

export const RespostaSegundaInstancia = z.object({
  achados: z.array(AchadoSegundaInstancia),
  /** O que foi conferido e passou (sempre aparece, mesmo sem achados). */
  conferido: z.array(z.string()),
});
export type RespostaSegundaInstancia = z.infer<typeof RespostaSegundaInstancia>;
