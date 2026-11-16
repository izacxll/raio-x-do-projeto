// Parceria com organização da sociedade civil (Lei 13.019/2014): termo de fomento, termo de colaboração ou
// acordo de cooperação. Não é licitação: não há sessão pública, garantia de execução, reajuste nem matriz de
// riscos; a habilitação é a "fase de celebração", a proposta é o Plano de Trabalho e as penalidades são as
// sanções do art. 73. As extrações da etapa 1 leem o documento com essa chave quando ela é reconhecida.
import { type DocumentoRfp } from "./item";
import { localizarPrimeiro, type Localizado } from "./localizar";

export interface ParceriaOsc {
  /** "Termo de fomento", "Termo de colaboração", "Acordo de cooperação" ou "Parceria (Lei 13.019/2014)". */
  instrumento: string;
  /** Onde o código reconheceu a parceria. */
  loc: Localizado;
}

const RE_TERMO = /\btermos? de (fomento|colaboracao)\b|\bacordos? de cooperacao\b/;
const RE_LEI = /\blei (?:federal )?(?:n[o°º.]*\s*)?13\.019\b/;
const RE_LICITACAO = /\bpregao\b|\bconcorrencia\b|\btomada de precos\b|\bcarta[- ]convite\b|\bleilao\b/;

/** Páginas de abertura (as três primeiras) do primeiro documento. */
function abertura(docs: DocumentoRfp[]): Map<string, Set<number>> | undefined {
  const doc = docs[0];
  if (!doc) return undefined;
  return new Map([[doc.id, new Set(doc.paginas.slice(0, 3).map((p) => p.numero))]]);
}

/**
 * Reconhece a parceria pela abertura do documento: o termo (fomento, colaboração, cooperação) ou a Lei
 * 13.019/2014 citada sem modalidade de licitação. Sem isso, as regras de licitação continuam valendo.
 */
export function parceriaOsc(docs: DocumentoRfp[]): ParceriaOsc | undefined {
  const faixas = abertura(docs);
  if (!faixas) return undefined;
  const termo = localizarPrimeiro(docs, RE_TERMO, faixas);
  const lei = localizarPrimeiro(docs, RE_LEI, faixas);
  const licitacao = localizarPrimeiro(docs, RE_LICITACAO, faixas);
  if (termo) {
    const m = RE_TERMO.exec(termo.termo);
    const instrumento =
      m?.[1] === "fomento"
        ? "Termo de fomento"
        : m?.[1] === "colaboracao"
          ? "Termo de colaboração"
          : "Acordo de cooperação";
    // a licitação que cita um termo de colaboração de passagem continua licitação
    if (!licitacao || lei) return { instrumento, loc: termo };
  }
  if (lei && !licitacao) return { instrumento: "Parceria (Lei 13.019/2014)", loc: lei };
  return undefined;
}

export const NAO_SE_APLICA_PARCERIA = "não se aplica a esta modalidade — conferir no documento";

export function notaNaoSeAplica(p: ParceriaOsc): string {
  return `${p.instrumento} com organização da sociedade civil (Lei 13.019/2014) não é licitação: o código não procura este item como exigência. Conferir no documento se ele aparece com outra forma.`;
}
