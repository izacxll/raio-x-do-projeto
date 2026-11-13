// Item da análise da RFP (etapa 1). Todo item tem rótulo (seção 2), origem com página e trecho quando vem do
// documento, e uma situação que segue a regra "não achado não é ausente".
import type { PaginaLida, Rotulo } from "../../dossie/esquema";
import { paginasSemCabecalho } from "../../texto/frase";

export type SecaoAnalise =
  | "atencao"
  | "identificacao"
  | "mapa"
  | "requisitos"
  | "prazos"
  | "julgamento"
  | "habilitacao"
  | "apresentacao"
  | "condicoes"
  | "partes"
  | "brechas";

export type SituacaoItem =
  /** Achado no documento, com página e trecho. */
  | "localizado"
  /** O código não achou: "não localizado pelo código — conferir no documento". Nunca "não informado". */
  | "nao-localizado"
  /** Há páginas sem texto legível: o código não pode dizer que não está lá. */
  | "nao-verificavel"
  /** Conta feita pelo código sobre dados do documento (data limite, dias que faltam). */
  | "calculado";

export interface OrigemItem {
  /** "RFP" ou "Anexo: <arquivo>". */
  documento: string;
  pagina: number;
  trecho: string;
}

export interface ItemAnalise {
  /** Estável entre execuções: a decisão do GP fica guardada no dossiê por este id. */
  id: string;
  secao: SecaoAnalise;
  rotulo: Rotulo;
  /** Nome curto: "Modalidade", "Garantia de execução", "Sessão pública". */
  nome: string;
  /** O conteúdo: o valor extraído, o cálculo ou a descrição do que o código viu. */
  texto: string;
  /** Colunas extras (grupo, data, contagem…), na ordem em que aparecem. */
  campos?: Record<string, string>;
  origem?: OrigemItem;
  situacao: SituacaoItem;
  /** Observação do código: como a conta foi feita, o que conferir. */
  nota?: string;
  /** Pergunta de esclarecimento sugerida, por modelo de texto (só em vagos e brechas). */
  pergunta?: string;
}

/** Documento da RFP como as extrações o recebem: o cabeçalho e o rodapé repetidos já viram espaços. */
export interface DocumentoRfp {
  id: string;
  /** "RFP" ou "Anexo: <arquivo>". */
  rotulo: string;
  paginas: PaginaLida[];
  /** As páginas como foram lidas, com o cabeçalho (o nome do órgão costuma estar nele). */
  originais: PaginaLida[];
  /** Páginas sem texto legível. */
  ilegiveis: number[];
}

export function prepararDocumento(id: string, rotulo: string, paginas: PaginaLida[]): DocumentoRfp {
  return {
    id,
    rotulo,
    paginas: paginasSemCabecalho(paginas),
    originais: paginas,
    ilegiveis: paginas.filter((p) => p.origem === "nao-verificavel").map((p) => p.numero),
  };
}

export const NAO_LOCALIZADO_RFP = "não localizado pelo código — conferir no documento";

/** Situação de um item que o código não achou: com página ilegível, "não verificável". */
export function situacaoSemAchado(docs: DocumentoRfp[]): SituacaoItem {
  return docs.some((d) => d.ilegiveis.length) ? "nao-verificavel" : "nao-localizado";
}

export function notaSemAchado(docs: DocumentoRfp[]): string {
  const ilegiveis = docs.filter((d) => d.ilegiveis.length);
  if (!ilegiveis.length)
    return "O código procurou no documento inteiro e não achou; pode estar com outra redação.";
  return `Há páginas sem texto legível (${ilegiveis
    .map((d) => `${d.rotulo}, p. ${d.ilegiveis.join(", ")}`)
    .join("; ")}): o que estiver nelas não foi lido.`;
}

/** Item "não localizado pelo código" (ou "não verificável"), nunca "não informado no documento". */
export function itemSemAchado(
  docs: DocumentoRfp[],
  base: Pick<ItemAnalise, "id" | "secao" | "nome"> & Partial<ItemAnalise>,
): ItemAnalise {
  const situacao = situacaoSemAchado(docs);
  return {
    rotulo: "documento",
    texto: situacao === "nao-verificavel" ? "não verificável — conferir no documento" : NAO_LOCALIZADO_RFP,
    nota: notaSemAchado(docs),
    ...base,
    situacao,
  };
}
