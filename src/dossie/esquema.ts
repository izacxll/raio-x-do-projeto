// Esquema do dossiê do projeto (<projeto>.dossie.json, decisão 0010).
// Um JSON único com o que foi lido, sugerido e decidido em todas as etapas.
// O dossiê NUNCA guarda a chave da API: o esquema não tem campo para ela, e campos desconhecidos são
// descartados na leitura e na gravação (z.object remove chaves que não estão no esquema).
import { z } from "zod";
import { comCamposNovos, RespostaConteudo, RespostaEap, RespostaEstrategia } from "../pmo/schemas/proposta";
import { RespostaPremissas, RespostaTap, comCamposNovosTap } from "../pmo/schemas/tap";
import { RespostaLeitura } from "../pmo/schemas/leitura";
import { RespostaSegundaEtapa5 } from "../pmo/schemas/segunda-etapa-5";
import { RespostaLeituraRfp } from "../pmo/schemas/leitura-rfp";
import { RespostaSegundaInstancia } from "../pmo/schemas/segunda-instancia";
import {
  RespostaAdaptacao,
  RespostaCronogramaGuardada,
  RespostaEscopo,
  RespostaExecucao,
  RespostaPlanos,
  RespostaRiscos,
} from "../pmo/schemas/pgp";

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

export const PapelDocumento = z.enum(["rfp", "anexo-rfp", "proposta", "contrato", "tap", "pgp"]);

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
  // decisão 0043; dossiês anteriores não têm o campo e ficam no valor conservador
  exposicao: z.enum(["sensível", "comum"]).default("sensível"),
});

export const ParteDoMapa = z.object({
  codigo: z.string(),
  situacao: z.enum(["presente", "dispensada", "nao-existe"]),
  paginaInicial: z.number().int().positive().optional(),
  paginaFinal: z.number().int().positive().optional(),
  posicaoTitulo: z.number().int().nonnegative().optional(),
  justificativa: z.string().optional(),
  confirmadaPeloGp: z.boolean().optional(),
});

export const RequisitoDossie = z.object({
  numero: z.string(),
  rotulo: z.string(),
  descricao: z.string(),
  pagina: z.number().int().nonnegative(),
  trecho: z.string(),
  origem: z.enum(["codigo", "gp"]),
  /** Sem tipo, é produto (dossiês da F5). */
  tipo: z
    .enum(["produto", "atividade", "equipe", "quantidade", "local", "condicao", "obrigacao", "outro"])
    .optional(),
  documento: z.string().optional(),
  /** Na equipe-chave: os perfis exigidos (um requisito só, com a lista). */
  perfis: z.array(z.string()).optional(),
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
  /**
   * Decisão do GP: a modalidade, quando o documento não a diz (sem edital, critério de julgamento, sessão nem artigo
   * de inexigibilidade ou dispensa; decisão 0054). Nunca é preenchida pela ferramenta.
   */
  modalidade: z.enum(["licitacao", "contratacao-direta", "parceria"]).optional(),
  /** Decisão do GP: participar ou não. Nunca é preenchida pela ferramenta. */
  participacao: z.object({
    decisao: DecisaoParticipacao,
    justificativa: z.string().optional(),
  }),
  executadaEm: z.string().optional(),
  /** Leitura do PMO (decisão 0035): a resposta, o modelo e o uso. Sem ela, a tela mostra o esqueleto do código. */
  leituraPmo: z.object({ resposta: RespostaLeituraRfp, modelo: z.string(), em: z.string() }).optional(),
  modeloPmo: z.string().optional(),
  usoPmo: z
    .array(
      z.object({
        passo: z.string(),
        modelo: z.string(),
        entrada: z.number().int().nonnegative(),
        saida: z.number().int().nonnegative(),
        escritaCache: z.number().int().nonnegative(),
        leituraCache: z.number().int().nonnegative(),
        custoUsd: z.number().nonnegative().optional(),
        em: z.string(),
      }),
    )
    .optional(),
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
  /** PGP completo (interno) ou plano de trabalho / proposta para o cliente (decisão 0033). */
  tipoPlano: z.enum(["pgp", "plano-trabalho"]).optional(),
  /** Id do documento do plano a que o mapa se refere: trocado o plano, o mapa volta à proposta do código. */
  pgpId: z.string().optional(),
  caracteristicas: CaracteristicasProjeto,
  mapa: z.array(ParteDoMapa),
  premissasAplicaveis: z.record(z.string(), z.boolean()),
  requisitos: z.array(RequisitoDossie),
  /** Próximo número de requisito: número de requisito removido não é reaproveitado. */
  proximoRequisito: z.number().int().positive(),
  decisoes: z.record(z.string(), DecisaoAchado),
  executadaEm: z.string().optional(),
  /** Leitura opcional do PMO (F5b, decisão 0013): a resposta, o modelo e o uso. As decisões ficam em "pmo:…". */
  leituraPmo: z.object({ resposta: RespostaLeitura, modelo: z.string(), em: z.string() }).optional(),
  /**
   * Segunda instância leve (decisão 0077): a revisão dos vereditos "falso" e "regra_errada" e das premissas críticas.
   * Vale para a leitura cujo "em" está em deLeitura; com outra leitura, fica velha.
   */
  segundaLeve: z
    .object({ resposta: RespostaSegundaEtapa5, modelo: z.string(), em: z.string(), deLeitura: z.string() })
    .optional(),
  modeloPmo: z.string().optional(),
  usoPmo: z
    .array(
      z.object({
        passo: z.string(),
        modelo: z.string(),
        entrada: z.number().int().nonnegative(),
        saida: z.number().int().nonnegative(),
        escritaCache: z.number().int().nonnegative(),
        leituraCache: z.number().int().nonnegative(),
        custoUsd: z.number().nonnegative().optional(),
        em: z.string(),
      }),
    )
    .optional(),
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
  /** Feriados municipais (aaaa-mm-dd) que o GP informa; os nacionais o código já desconta. */
  feriados: z.array(z.string()).optional(),
  valoresHora: z.record(z.string(), z.number().nonnegative()),
  despesas: z.array(z.object({ descricao: z.string(), valor: z.number().nonnegative().optional() })),
  indiretosPct: z.number().min(0).max(100).optional(),
  tributosPct: z.number().min(0).max(99.99).optional(),
  reserva: z.number().nonnegative().optional(),
  precoFinal: z.number().nonnegative().optional(),
  /** Nomes da equipe, pelo id do perfil: só o GP preenche. */
  nomes: z.record(z.string(), z.string()),
  /** Operação contínua: custo mensal de cada função (salário, encargos e benefícios), decisão do GP. */
  custoMensal: z.record(z.string(), z.number().nonnegative()).optional(),
  /** Mês em que entra cada parcela sem prazo no documento (pelo rótulo da parcela), decisão do GP. */
  mesesParcelas: z.record(z.string(), z.number().int().positive()).optional(),
});
export type ParametrosProposta = z.infer<typeof ParametrosProposta>;

/** Decisão do GP: o tipo de contrato e de projeto (decisão 0034), sugerido pelo código. */
export const TipoConfirmado = z.object({
  contrato: z.enum(["licitacao", "contratacao-direta", "parceria"]),
  projeto: z.enum(["produtos", "operacao", "hibrido"]),
});
export type TipoConfirmado = z.infer<typeof TipoConfirmado>;

export const PropostaDossie = z.object({
  /** Modelo escolhido para as chamadas desta proposta. */
  modelo: z.string(),
  tipo: TipoConfirmado.optional(),
  estrategia: RespostaGuardada(
    z.preprocess((d) => comCamposNovos("estrategia", d), RespostaEstrategia),
  ).optional(),
  /** Decisão do GP: a abordagem escolhida (id) e a justificativa. */
  abordagem: z.object({ id: z.string(), justificativa: z.string().optional() }).optional(),
  /** Decisão do GP: premissas críticas que se aplicam (PC1…PC8 → sim/não). */
  premissasAplicaveis: z.record(z.string(), z.boolean()),
  conteudo: RespostaGuardada(z.preprocess((d) => comCamposNovos("conteudo", d), RespostaConteudo)).optional(),
  eap: RespostaGuardada(z.preprocess((d) => comCamposNovos("eap", d), RespostaEap)).optional(),
  /** Revisão do GP de cada item, pelo id estável (estrategia:…, conteudo:…, eap:…). */
  revisoes: z.record(z.string(), RevisaoItem),
  parametros: ParametrosProposta,
  uso: z.array(UsoPmo),
});
export type PropostaDossie = z.infer<typeof PropostaDossie>;

// ---------- etapa 3: TAP ----------

/** Decisão do GP numa divergência entre a RFP e a proposta: qual versão vale. */
export const DecisaoDivergencia = z.object({
  vale: z.enum(["rfp", "proposta", "contrato", "outra"]),
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
  tap: RespostaGuardada(z.preprocess(comCamposNovosTap, RespostaTap)).optional(),
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

// ---------- etapa 4: PGP ----------

/** Valores e escolhas da etapa 4 que só o GP preenche. Vazio = "a definir pelo GP". */
export const ParametrosPgp = z.object({
  /** Início previsto da execução (aaaa-mm-dd). */
  inicio: z.string().optional(),
  /** Dias úteis de aprovação de cada produto pelo contratante. */
  aprovacaoDias: z.number().nonnegative().optional(),
  /** Feriados municipais (aaaa-mm-dd) que o GP informa; os nacionais o código já desconta. */
  feriados: z.array(z.string()).optional(),
  valoresHora: z.record(z.string(), z.number().nonnegative()),
  /** Reserva de contingência (dentro da linha de base) e gerencial (fora dela), em R$. */
  contingencia: z.number().nonnegative().optional(),
  gerencial: z.number().nonnegative().optional(),
  /** Nomes da equipe, pelo id do perfil. */
  nomes: z.record(z.string(), z.string()),
});
export type ParametrosPgp = z.infer<typeof ParametrosPgp>;

export const PgpDossie = z.object({
  modelo: z.string(),
  adaptacao: RespostaGuardada(RespostaAdaptacao).optional(),
  escopo: RespostaGuardada(RespostaEscopo).optional(),
  cronograma: RespostaGuardada(RespostaCronogramaGuardada).optional(),
  riscos: RespostaGuardada(RespostaRiscos).optional(),
  planos: RespostaGuardada(RespostaPlanos).optional(),
  execucao: RespostaGuardada(RespostaExecucao).optional(),
  /** Decisão do GP: o que gerar (parte → sim/não). O que ele dispensar a etapa 5 não aponta como ausente. */
  gerar: z.record(z.string(), z.boolean()),
  /** Decisão do GP: abordagem do ciclo de vida (vem sugerida pelo PMO). */
  abordagem: z.enum(["preditiva", "adaptativa", "hibrida"]).optional(),
  revisoes: z.record(z.string(), RevisaoItem),
  parametros: ParametrosPgp,
  /** Decisão do GP: premissas críticas que se aplicam (vêm do TAP ou da proposta, quando houver). */
  premissasAplicaveis: z.record(z.string(), z.boolean()).optional(),
  /** Características do projeto para a autoconferência (as mesmas da etapa 5), confirmadas pelo GP. */
  caracteristicas: CaracteristicasProjeto.optional(),
  /**
   * As características com que a sugestão do que gerar foi feita pelo porte (decisão 0091): as do GP ou, sem elas, as que
   * o código sugere. Não são confirmação do GP (a etapa 5 usa só as de cima). Sem este campo (dossiê antigo), nenhuma
   * parte é tratada como fundida: o que não se gera é dispensa.
   */
  sugestaoPeloPorte: CaracteristicasProjeto.optional(),
  uso: z.array(UsoPmo),
});
export type PgpDossie = z.infer<typeof PgpDossie>;

export const Dossie = z.object({
  formato: z.literal(FORMATO_DOSSIE),
  versaoFormato: z.literal(VERSAO_FORMATO_DOSSIE),
  versaoApp: z.string(),
  versaoSkill: z.string(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
  projeto: z.object({ nome: z.string() }),
  documentos: z.array(DocumentoLido),
  itens: z.array(ItemRotulado),
  analiseRfp: AnaliseRfpDossie.optional(),
  conferencia: Conferencia.optional(),
  proposta: PropostaDossie.optional(),
  tap: TapDossie.optional(),
  pgp: PgpDossie.optional(),
  /**
   * Segunda instância (decisão 0057): a conferência de cada resposta, pela chave "etapa:passo". deResposta é o "em" da
   * resposta conferida: se a resposta mudar, a conferência fica velha e a tela pede outra.
   */
  segundaInstancia: z
    .record(
      z.string(),
      z.object({
        resposta: RespostaSegundaInstancia,
        modelo: z.string(),
        em: z.string(),
        deResposta: z.string(),
        /**
         * Versão do passo anterior que foi no pedido (decisão 0068; hoje só o TAP revisado nas premissas). Com outra
         * versão, a conferência fica velha. Sem o campo (conferência antiga), vale.
         */
        deAnterior: z.string().optional(),
        /** Rodada da conferência deste passo: sobe a cada resposta nova do passo conferida (decisão 0059). */
        rodada: z.number().int().positive().optional(),
        /**
         * A resposta do passo que esta conferência leu (decisão 0071): a rodada seguinte manda só o que mudou desde
         * ela. Sem o campo (conferência antiga), a rodada seguinte vai com o pedido completo.
         */
        conferiu: z.unknown().optional(),
      }),
    )
    .optional(),
});
export type Dossie = z.infer<typeof Dossie>;
export type SegundaInstanciaDossie = NonNullable<Dossie["segundaInstancia"]>[string];
