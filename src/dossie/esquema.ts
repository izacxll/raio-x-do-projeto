// Esquema do dossiê do projeto (<projeto>.dossie.json, decisão 0010).
// Um JSON único com o que foi lido, sugerido e decidido em todas as etapas.
// O dossiê NUNCA guarda a chave da API: o esquema não tem campo para ela, e campos desconhecidos são
// descartados na leitura e na gravação (z.object remove chaves que não estão no esquema).
import { z } from "zod";
import { RespostaConteudo, RespostaEap, RespostaEstrategia } from "../pmo/schemas/proposta";
import { RespostaPremissas, RespostaTap } from "../pmo/schemas/tap";

export const FORMATO_DOSSIE = "raio-x-do-projeto/dossie";
export const VERSAO_FORMATO_DOSSIE = 1;

/** Como o texto de uma página foi obtido. "nao-verificavel": a página não tem texto legível (seção 2). */
export const OrigemPagina = z.enum(["texto", "ocr", "nao-verificavel"]);
export type OrigemPagina = z.infer<typeof OrigemPagina>;

export const PaginaLida = z.object({
  numero: z.number().int().positive(),
  origem: OrigemPagina,
  texto: z.string(),
  caracteres: z.number().int().nonnegative(),
  /** Confiança média do OCR (0 a 100), só nas páginas lidas por OCR. */
  confiancaOcr: z.number().min(0).max(100).optional(),
  /** A página tem figura ou tabela em imagem (o texto dela pode não ter sido extraído). */
  temImagem: z.boolean().optional(),
  /** Por que a página ficou "não verificável" ou foi para o OCR. */
  motivo: z.string().optional(),
});
export type PaginaLida = z.infer<typeof PaginaLida>;

export const PapelDocumento = z.enum(["rfp", "anexo-rfp", "proposta", "tap", "pgp"]);

export const DocumentoLido = z.object({
  id: z.string().min(1),
  papel: PapelDocumento,
  nomeArquivo: z.string(),
  tamanhoBytes: z.number().int().nonnegative(),
  totalPaginas: z.number().int().nonnegative(),
  lidoEm: z.string(),
  paginas: z.array(PaginaLida),
});
export type DocumentoLido = z.infer<typeof DocumentoLido>;

/** Os três rótulos visíveis de todo conteúdo (seção 2). */
export const Rotulo = z.enum(["documento", "sugestao", "decisao-gp"]);
export type Rotulo = z.infer<typeof Rotulo>;

/** Estado de revisão de cada item: nada vai para a versão final sem passar pelo GP. */
export const EstadoItem = z.enum(["pendente", "aceito", "editado", "descartado"]);
export type EstadoItem = z.infer<typeof EstadoItem>;

export const Origem = z.object({
  documentoId: z.string(),
  pagina: z.number().int().positive(),
  trecho: z.string(),
});

export const ItemRotulado = z.object({
  id: z.string().min(1),
  etapa: z.number().int().min(1).max(6),
  rotulo: Rotulo,
  estado: EstadoItem,
  texto: z.string(),
  textoEditado: z.string().optional(),
  origem: Origem.optional(),
});
export type ItemRotulado = z.infer<typeof ItemRotulado>;

// ---------- etapa 5: conferência do PGP ----------

export const CaracteristicasProjeto = z.object({
  porte: z.enum(["pequeno", "médio", "grande"]),
  abordagem: z.enum(["preditiva", "adaptativa", "híbrida"]),
  fases: z.enum(["uma", "várias"]),
  campo: z.boolean(),
  beneficiarios: z.boolean(),
  subcontratacao: z.enum(["permitida", "vedada", "não informada"]),
  dadosPessoais: z.boolean(),
  frentes: z.enum(["uma", "várias"]),
  contratante: z.enum(["público", "privado"]),
  pagamento: z.enum(["por produto", "por medição", "de outra forma"]),
});

export const ParteDoMapa = z.object({
  codigo: z.string(),
  situacao: z.enum(["presente", "dispensada", "nao-existe"]),
  paginaInicial: z.number().int().positive().optional(),
  paginaFinal: z.number().int().positive().optional(),
  posicaoTitulo: z.number().int().nonnegative().optional(),
  justificativa: z.string().optional(),
});

export const RequisitoDossie = z.object({
  numero: z.string(),
  rotulo: z.string(),
  descricao: z.string(),
  pagina: z.number().int().nonnegative(),
  trecho: z.string(),
  origem: z.enum(["codigo", "gp"]),
  /** Sem tipo, é produto (dossiês da F5). */
  tipo: z.enum(["produto", "equipe", "quantidade", "local", "outro"]).optional(),
  documento: z.string().optional(),
});

// ---------- etapa 1: análise da RFP ----------

/** Revisão do GP sobre um item da análise, guardada pelo id estável do item. */
export const RevisaoItem = z.object({
  estado: EstadoItem,
  textoEditado: z.string().optional(),
});
export type RevisaoItem = z.infer<typeof RevisaoItem>;

export const DecisaoParticipacao = z.enum(["a-decidir", "participar", "nao-participar"]);

export const AnaliseRfpDossie = z.object({
  /** Requisitos com o número fixo: é a lista que segue para as etapas seguintes. */
  requisitos: z.array(RequisitoDossie),
  /** Próximo número de requisito: número de requisito removido não é reaproveitado. */
  proximoRequisito: z.number().int().positive(),
  /** Revisão de cada item, pelo id (requisitos: "requisito:R01"). */
  revisoes: z.record(z.string(), RevisaoItem),
  /** Decisão do GP: participar ou não. Nunca é preenchida pela ferramenta. */
  participacao: z.object({
    decisao: DecisaoParticipacao,
    justificativa: z.string().optional(),
  }),
  executadaEm: z.string().optional(),
});
export type AnaliseRfpDossie = z.infer<typeof AnaliseRfpDossie>;

/** Decisão do GP sobre um achado: procede ou não, e troca de gravidade ou categoria, sempre com justificativa. */
export const DecisaoAchado = z.object({
  procede: z.enum(["sim", "nao"]).optional(),
  justificativa: z.string().optional(),
  gravidade: z.enum(["grave", "média", "baixa"]).optional(),
  categoria: z.string().optional(),
});
export type DecisaoAchado = z.infer<typeof DecisaoAchado>;

export const Conferencia = z.object({
  caracteristicas: CaracteristicasProjeto,
  mapa: z.array(ParteDoMapa),
  premissasAplicaveis: z.record(z.string(), z.boolean()),
  requisitos: z.array(RequisitoDossie),
  /** Próximo número de requisito: número de requisito removido não é reaproveitado. */
  proximoRequisito: z.number().int().positive(),
  decisoes: z.record(z.string(), DecisaoAchado),
  executadaEm: z.string().optional(),
});
export type Conferencia = z.infer<typeof Conferencia>;

// ---------- etapa 2: proposta ----------

/** Uso de uma chamada ao PMO: tokens e valor estimado (custo à vista). Nunca a chave. */
export const UsoPmo = z.object({
  passo: z.string(),
  modelo: z.string(),
  entrada: z.number().int().nonnegative(),
  saida: z.number().int().nonnegative(),
  escritaCache: z.number().int().nonnegative(),
  leituraCache: z.number().int().nonnegative(),
  custoUsd: z.number().nonnegative().optional(),
  em: z.string(),
});
export type UsoPmo = z.infer<typeof UsoPmo>;

/** Resposta de um passo do PMO, como veio (validada pelo schema do passo), com o modelo e a data. */
const RespostaGuardada = <T extends z.ZodType>(schema: T) =>
  z.object({ resposta: schema, modelo: z.string(), em: z.string() });

export const ParametrosProposta = z.object({
  /** Início previsto da execução (aaaa-mm-dd), decisão do GP. */
  inicio: z.string().optional(),
  /** Dias úteis de aprovação de cada produto pelo contratante, decisão do GP. */
  aprovacaoDias: z.number().nonnegative().optional(),
  valoresHora: z.record(z.string(), z.number().nonnegative()),
  despesas: z.array(z.object({ descricao: z.string(), valor: z.number().nonnegative().optional() })),
  indiretosPct: z.number().min(0).max(100).optional(),
  tributosPct: z.number().min(0).max(99.99).optional(),
  reserva: z.number().nonnegative().optional(),
  precoFinal: z.number().nonnegative().optional(),
  /** Nomes da equipe, pelo id do perfil: só o GP preenche. */
  nomes: z.record(z.string(), z.string()),
});
export type ParametrosProposta = z.infer<typeof ParametrosProposta>;

export const PropostaDossie = z.object({
  /** Modelo escolhido para as chamadas desta proposta. */
  modelo: z.string(),
  estrategia: RespostaGuardada(RespostaEstrategia).optional(),
  /** Decisão do GP: a abordagem escolhida (id) e a justificativa. */
  abordagem: z.object({ id: z.string(), justificativa: z.string().optional() }).optional(),
  /** Decisão do GP: premissas críticas que se aplicam (PC1…PC8 → sim/não). */
  premissasAplicaveis: z.record(z.string(), z.boolean()),
  conteudo: RespostaGuardada(RespostaConteudo).optional(),
  eap: RespostaGuardada(RespostaEap).optional(),
  /** Revisão do GP de cada item, pelo id estável (estrategia:…, conteudo:…, eap:…). */
  revisoes: z.record(z.string(), RevisaoItem),
  parametros: ParametrosProposta,
  uso: z.array(UsoPmo),
});
export type PropostaDossie = z.infer<typeof PropostaDossie>;

// ---------- etapa 3: TAP ----------

/** Decisão do GP numa divergência entre a RFP e a proposta: qual versão vale. */
export const DecisaoDivergencia = z.object({
  vale: z.enum(["rfp", "proposta", "outra"]),
  texto: z.string().optional(),
});
export type DecisaoDivergencia = z.infer<typeof DecisaoDivergencia>;

/** Campos do TAP que só o GP preenche (TAP.7, TAP.11, TAP.12 e a aprovação). Vazio = "a definir pelo GP". */
export const DecisoesTap = z.object({
  recursos: z.string().optional(),
  gerente: z.string().optional(),
  autoridade: z.string().optional(),
  patrocinador: z.string().optional(),
  autoridadePatrocinador: z.string().optional(),
  /** Aprovação final do TAP: quem aprovou e quando (aaaa-mm-dd). */
  aprovadoPor: z.string().optional(),
  aprovadoEm: z.string().optional(),
});
export type DecisoesTap = z.infer<typeof DecisoesTap>;

export const TapDossie = z.object({
  modelo: z.string(),
  tap: RespostaGuardada(RespostaTap).optional(),
  premissas: RespostaGuardada(RespostaPremissas).optional(),
  /** Revisão do GP de cada item, pelo id estável (tap:…, premissas:…). */
  revisoes: z.record(z.string(), RevisaoItem),
  /** Decisão do GP em cada divergência, pelo id da divergência. */
  divergencias: z.record(z.string(), DecisaoDivergencia),
  decisoes: DecisoesTap,
  /** Decisão do GP: premissas críticas que se aplicam (vêm da etapa 2, quando houver). */
  premissasAplicaveis: z.record(z.string(), z.boolean()).optional(),
  uso: z.array(UsoPmo),
});
export type TapDossie = z.infer<typeof TapDossie>;

export const Dossie = z.object({
  formato: z.literal(FORMATO_DOSSIE),
  versaoFormato: z.literal(VERSAO_FORMATO_DOSSIE),
  versaoApp: z.string(),
  versaoSkill: z.string(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
  projeto: z.object({ nome: z.string() }),
  /** Modo demonstração (decisão 0027): respostas gravadas do PMO, sem chamada à IA. Vai no cabeçalho dos exportados. */
  demonstracao: z.boolean().optional(),
  documentos: z.array(DocumentoLido),
  itens: z.array(ItemRotulado),
  analiseRfp: AnaliseRfpDossie.optional(),
  conferencia: Conferencia.optional(),
  proposta: PropostaDossie.optional(),
  tap: TapDossie.optional(),
});
export type Dossie = z.infer<typeof Dossie>;
