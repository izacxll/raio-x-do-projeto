// Schemas dos três passos do PMO na etapa 2 (SKILL.md, etapa 2; fichas prop-*).
// 1. estratégia: como o contratante avalia, 2 ou 3 abordagens, destino das brechas, premissas críticas;
// 2. conteúdo técnico da abordagem escolhida: entendimento, objetivos, metodologia, SOW, obrigações do contratante;
// 3. EAP, estimativas em três pontos, equipe, horas, RACI, despesas e reservas a considerar.
import { z } from "zod";
import { EstimativaTresPontos, FontePmo, ItemPmo, RotuloPmo, ItemAutoconferencia } from "./comum";

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
  /** O que a abordagem muda no resultado (equipe, desconto, subcontratar, alcance), não só na redação. */
  mudaOResultado: z.string(),
  /** O risco principal, inclusive o de eliminação. */
  riscoPrincipal: z.string(),
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
  /** Autoconferência (decisão 0044): cada item do método ou das fichas usado, com o estado. */
  autoconferencia: z.array(ItemAutoconferencia).default([]),
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

/** Prazo de entrega do produto como o documento diz (com a fonte, que o código confere), ou null se não diz. */
export const PrazoProduto = z.object({
  dias: z.number(),
  contagem: z.enum(["dias corridos", "dias úteis", "não informada"]),
  /** De onde se conta ("após a assinatura do contrato"). */
  aPartirDe: z.string(),
  fonte: FontePmo,
});
export type PrazoProduto = z.infer<typeof PrazoProduto>;

export const ProdutoSow = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string(),
  requisitos: z.array(z.string()),
  criteriosAceite: z.array(z.string()),
  fontes: z.array(FontePmo),
  prazo: PrazoProduto.nullable(),
});
export type ProdutoSow = z.infer<typeof ProdutoSow>;

export const PremissaSow = z.object({
  item: ItemPmo,
  /** PC1 a PC8, quando é premissa crítica; senão, vazio. */
  premissaCritica: z.string(),
  /** O que acontece se a premissa não se confirmar (PROP-SOW.11). */
  consequencia: z.string(),
  /** De quem depende (o contratante, a rede, o público). */
  dependeDe: z.string(),
  /** Até quando; prazo que o documento não dá é "a definir pelo GP". */
  ateQuando: z.string(),
  /** Como se reajusta: aditivo, prorrogação, revisão de metas (com a proteção do edital, se houver). */
  reajuste: z.string(),
});

export const ObrigacaoContratante = z.object({
  item: ItemPmo,
  /** Prazo como o documento diz, ou "não informado no documento — a definir pelo GP". */
  prazo: z.string(),
});

/** Fase ou módulo da metodologia (método da etapa 2, seção 2.1): objetivo, atividades, quem faz, entrega e duração. */
export const FaseMetodologia = z.object({
  nome: z.string(),
  objetivo: z.string(),
  atividades: z.array(z.string()),
  quemFaz: z.string(),
  entrega: z.string(),
  /** Duração como texto, com a base ("meses 1 e 2, a mobilização que o edital prevê"). */
  duracao: z.string(),
  /** Meses da fase, para o código conferir a soma contra a vigência; 0 quando a fase corre em paralelo. */
  meses: z.number(),
});
export type FaseMetodologia = z.infer<typeof FaseMetodologia>;

/** Meta ou indicador: os do edital (Do documento), nunca metas novas. */
export const MetaProposta = z.object({
  item: ItemPmo,
  indicador: z.string(),
  formula: z.string(),
  meioDeAfericao: z.string(),
});
export type MetaProposta = z.infer<typeof MetaProposta>;

/** Linha da matriz de riscos da proposta: gatilho e dono (método da etapa 2, seção 2.1). */
export const RiscoProposta = z.object({
  item: ItemPmo,
  gatilho: z.string(),
  dono: z.string(),
  resposta: z.string(),
  premissaCritica: z.string(),
});
export type RiscoProposta = z.infer<typeof RiscoProposta>;

export const RespostaConteudo = z.object({
  /** Autoconferência (decisão 0044): cada item do método ou das fichas usado, com o estado. */
  autoconferencia: z.array(ItemAutoconferencia).default([]),
  /** Seções na ordem da proposta (modelo do edital, se houver), cada uma redigida: os itens são o texto que vai ao cliente. */
  estrutura: z.array(SecaoProposta),
  produtos: z.array(ProdutoSow),
  metodologia: z.array(FaseMetodologia),
  metas: z.array(MetaProposta),
  /** Exclusões próprias deste objeto (o que é do contratante, da rede, além do volume ou da vigência). */
  exclusoes: z.array(ItemPmo),
  limitesVolume: z.array(ItemPmo),
  premissas: z.array(PremissaSow),
  riscos: z.array(RiscoProposta),
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

/** Quadro de equipe por função e faixa de meses (operação contínua): a base da folha e da produtividade. */
export const LinhaQuadro = z.object({
  funcao: z.string(),
  quantidade: z.number(),
  deMes: z.number(),
  ateMes: z.number(),
  base: z.string(),
});
export type LinhaQuadro = z.infer<typeof LinhaQuadro>;

/** Volume previsto (visitas, atendimentos, turmas) numa faixa de meses, e a função que o executa. */
export const VolumePrevisto = z.object({
  descricao: z.string(),
  unidade: z.string(),
  quantidade: z.number(),
  deMes: z.number(),
  ateMes: z.number(),
  funcao: z.string(),
  rotulo: RotuloPmo,
  fontes: z.array(FontePmo),
});
export type VolumePrevisto = z.infer<typeof VolumePrevisto>;

export const RespostaEap = z.object({
  /** Autoconferência (decisão 0044): cada item do método ou das fichas usado, com o estado. */
  autoconferencia: z.array(ItemAutoconferencia).default([]),
  atividades: z.array(AtividadeEap),
  perfis: z.array(PerfilEquipe),
  horas: z.array(HorasPerfil),
  raci: z.array(LinhaRaci),
  /** Operação contínua: quadro mês a mês por função (vazio em consultoria por produtos). */
  quadroEquipe: z.array(LinhaQuadro),
  volumes: z.array(VolumePrevisto),
  /** Despesas a considerar (viagens, campo, logística): sem valor, que é do GP. */
  despesas: z.array(ItemPmo),
  /** Riscos que pedem reserva, para o GP decidir o valor. */
  reservas: z.array(ItemPmo),
  estrategiasPreco: z.array(ItemPmo),
});
export type RespostaEap = z.infer<typeof RespostaEap>;

// ---------- dossiês e gravações antigas ----------

/** Preenche os campos que a fase M2 acrescentou, para abrir dossiês de antes dela (decisão 0038). */
export function comCamposNovos(passo: keyof typeof SCHEMAS, dados: unknown): unknown {
  if (!dados || typeof dados !== "object") return dados;
  const d = { ...(dados as Record<string, unknown>) };
  const lista = (k: string) => {
    if (!Array.isArray(d[k])) d[k] = [];
  };
  if (passo === "estrategia" && Array.isArray(d.abordagens))
    d.abordagens = (d.abordagens as Record<string, unknown>[]).map((a) => ({
      mudaOResultado: "",
      riscoPrincipal: "",
      ...a,
    }));
  if (passo === "conteudo") {
    ["metodologia", "metas", "limitesVolume", "riscos"].forEach(lista);
    if (Array.isArray(d.premissas))
      d.premissas = (d.premissas as Record<string, unknown>[]).map((p) => ({
        dependeDe: "",
        ateQuando: "",
        reajuste: "",
        ...p,
      }));
  }
  if (passo === "eap") ["quadroEquipe", "volumes"].forEach(lista);
  return d;
}

export const SCHEMAS = {
  estrategia: RespostaEstrategia,
  conteudo: RespostaConteudo,
  eap: RespostaEap,
} as const;
