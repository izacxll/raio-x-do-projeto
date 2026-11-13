// Esquema do dossiê do projeto (<projeto>.dossie.json, decisão 0010).
// Um JSON único com o que foi lido, sugerido e decidido em todas as etapas.
// O dossiê NUNCA guarda a chave da API: o esquema não tem campo para ela, e campos desconhecidos são
// descartados na leitura e na gravação (z.object remove chaves que não estão no esquema).
import { z } from "zod";

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
});

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
  conferencia: Conferencia.optional(),
});
export type Dossie = z.infer<typeof Dossie>;
