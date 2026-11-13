// Schemas dos três passos do PMO na etapa 2 (SKILL.md, etapa 2; fichas prop-*).
// 1. estratégia: como o contratante avalia, 2 ou 3 abordagens, destino das brechas, premissas críticas;
// 2. conteúdo técnico da abordagem escolhida: entendimento, objetivos, metodologia, SOW, obrigações do contratante;
// 3. EAP, estimativas em três pontos, equipe, horas, RACI, despesas e reservas a considerar.
import { z } from "zod";
import { EstimativaTresPontos, FontePmo, ItemPmo } from "./comum";

// ---------- passo 1: estratégia ----------

export const CriterioPontuacao = z.object({
  criterio: z.string(),
  /** Como o edital escreve ("até 20 pontos"); vazio se o edital não diz. Texto, não conta. */
  pontuacaoMaxima: z.string(),
  oQuePontua: z.string(),
  evidenciaExigida: z.string(),
  /** Título da seção da proposta que responde ao critério. */
  secaoDaProposta: z.string(),
  fontes: z.array(FontePmo),
});

export const Abordagem = z.object({
  /** "A", "B", "C". */
  id: z.string(),
  nome: z.string(),
  descricao: z.string(),
  pros: z.array(z.string()),
  contras: z.array(z.string()),
  requisitos: z.array(z.string()),
  riscos: z.array(z.string()),
  /** Em termos relativos ("maior que B"), nunca em número inventado. */
  impactoPrazo: z.string(),
  impactoCusto: z.string(),
});
export type Abordagem = z.infer<typeof Abordagem>;

export const DestinoBrecha = z.enum([
  "premissa",
  "exclusao",
  "obrigacao-contratante",
  "folga",
  "reserva",
  "pergunta",
]);
export type DestinoBrecha = z.infer<typeof DestinoBrecha>;

export const Destino = z.object({
  /** Id da brecha na etapa 1 (ex.: "brecha:CTR5:3"), ou vazio quando o PMO achou outra. */
  origem: z.string(),
  descricaoOrigem: z.string(),
  destino: DestinoBrecha,
  texto: z.string(),
  fontes: z.array(FontePmo),
});

export const PremissaCriticaAplicavel = z.object({
  /** PC1 a PC8. */
  codigo: z.string(),
  aplica: z.enum(["sim", "nao", "a-confirmar"]),
  motivo: z.string(),
});

export const RespostaEstrategia = z.object({
  /** Critério de julgamento e o que pesa na avaliação, com página e trecho. */
  comoSeraAvaliada: z.array(ItemPmo),
  criterios: z.array(CriterioPontuacao),
  ondeEstaoOsPontos: z.array(ItemPmo),
  abordagens: z.array(Abordagem),
  destinos: z.array(Destino),
  premissasCriticas: z.array(PremissaCriticaAplicavel),
  /** O que o PMO achou e o código não: requisitos novos (sem número), dúvidas. */
  observacoes: z.array(ItemPmo),
});
export type RespostaEstrategia = z.infer<typeof RespostaEstrategia>;

// ---------- passo 2: conteúdo técnico ----------

export const SecaoProposta = z.object({
  /** Código da ficha (PROP-ENTENDIMENTO, PROP-METODOLOGIA…) ou "EDITAL" quando segue o modelo obrigatório. */
  codigo: z.string(),
  titulo: z.string(),
  /** Critério de pontuação a que a seção responde, ou vazio. */
  criterio: z.string(),
  itens: z.array(ItemPmo),
});
export type SecaoProposta = z.infer<typeof SecaoProposta>;

export const ProdutoSow = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string(),
  requisitos: z.array(z.string()),
  criteriosAceite: z.array(z.string()),
  fontes: z.array(FontePmo),
});
export type ProdutoSow = z.infer<typeof ProdutoSow>;

export const PremissaSow = z.object({
  item: ItemPmo,
  /** PC1 a PC8, quando é premissa crítica; senão, vazio. */
  premissaCritica: z.string(),
  /** O que acontece se a premissa não se confirmar (PROP-SOW.11). */
  consequencia: z.string(),
});

export const ObrigacaoContratante = z.object({
  item: ItemPmo,
  /** Prazo como o documento diz, ou "não informado no documento — a definir pelo GP". */
  prazo: z.string(),
});

export const RespostaConteudo = z.object({
  /** Seções na ordem da proposta (modelo do edital, se houver). */
  estrutura: z.array(SecaoProposta),
  produtos: z.array(ProdutoSow),
  exclusoes: z.array(ItemPmo),
  premissas: z.array(PremissaSow),
  restricoes: z.array(ItemPmo),
  obrigacoesContratante: z.array(ObrigacaoContratante),
});
export type RespostaConteudo = z.infer<typeof RespostaConteudo>;

// ---------- passo 3: EAP, estimativas e equipe ----------

export const AtividadeEap = z.object({
  /** "1.1", "1.2"… */
  id: z.string(),
  /** Id do produto do SOW a que a atividade pertence. */
  produto: z.string(),
  nome: z.string(),
  predecessoras: z.array(z.string()),
  /** Em dias úteis. */
  duracao: EstimativaTresPontos,
  /** Termina num produto que o contratante aprova: o código soma o tempo de aprovação. */
  aprovacaoCliente: z.boolean(),
  requisitos: z.array(z.string()),
});
export type AtividadeEap = z.infer<typeof AtividadeEap>;

export const PerfilEquipe = z.object({
  id: z.string(),
  nome: z.string(),
  /** Exigido pela RFP (com fonte) ou sugerido pelo PMO. */
  exigido: z.boolean(),
  qualificacao: z.string(),
  requisito: z.string(),
  fontes: z.array(FontePmo),
});
export type PerfilEquipe = z.infer<typeof PerfilEquipe>;

export const HorasPerfil = z.object({
  atividade: z.string(),
  perfil: z.string(),
  horas: EstimativaTresPontos,
});
export type HorasPerfil = z.infer<typeof HorasPerfil>;

export const LinhaRaci = z.object({
  atividade: z.string(),
  perfil: z.string(),
  papel: z.enum(["R", "A", "C", "I"]),
});

export const RespostaEap = z.object({
  atividades: z.array(AtividadeEap),
  perfis: z.array(PerfilEquipe),
  horas: z.array(HorasPerfil),
  raci: z.array(LinhaRaci),
  /** Despesas a considerar (viagens, campo, logística): sem valor, que é do GP. */
  despesas: z.array(ItemPmo),
  /** Riscos que pedem reserva, para o GP decidir o valor. */
  reservas: z.array(ItemPmo),
  estrategiasPreco: z.array(ItemPmo),
});
export type RespostaEap = z.infer<typeof RespostaEap>;

export const SCHEMAS = {
  estrategia: RespostaEstrategia,
  conteudo: RespostaConteudo,
  eap: RespostaEap,
} as const;
