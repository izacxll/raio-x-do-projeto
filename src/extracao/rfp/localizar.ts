// Busca de padrões nos documentos da RFP, devolvendo documento, página e a frase em volta.
import { procurarPadrao } from "../../regras/busca";
import { fraseEmVolta } from "../../texto/frase";
import type { DocumentoRfp, OrigemItem } from "./item";

export interface Localizado {
  doc: DocumentoRfp;
  pagina: number;
  /** Posição no texto original da página. */
  posicao: number;
  /** O que casou (texto normalizado: minúsculas, sem acento). */
  termo: string;
  /** Frase do documento em volta da posição, com acentos. */
  frase: string;
}

/** Páginas onde procurar, por documento. Sem faixa para o documento, procura nele inteiro. */
export type Faixas = Map<string, Set<number>>;

/**
 * Todas as ocorrências de uma expressão regular sobre o texto normalizado (minúsculas, sem acento, espaços
 * colapsados). As expressões são escritas sem acento.
 */
export function localizarTodos(docs: DocumentoRfp[], re: RegExp, faixas?: Faixas): Localizado[] {
  const out: Localizado[] = [];
  for (const doc of docs) {
    if (faixas && !faixas.has(doc.id)) continue;
    const faixa = faixas?.get(doc.id);
    for (const o of procurarPadrao(doc.paginas, re, faixa)) {
      const pagina = doc.paginas.find((p) => p.numero === o.pagina);
      const frase = pagina ? fraseEmVolta(pagina.texto, o.posicao) : o.trecho;
      out.push({
        doc,
        pagina: o.pagina,
        posicao: o.posicao,
        termo: o.termo,
        // frase curta é título ("CLÁUSULA QUARTA – SUBCONTRATAÇÃO"): o trecho em volta mostra o texto
        frase: frase.length < 60 ? o.trecho : frase,
      });
    }
  }
  return out;
}

export function localizarPrimeiro(docs: DocumentoRfp[], re: RegExp, faixas?: Faixas): Localizado | undefined {
  return localizarTodos(docs, re, faixas)[0];
}

export function origemDe(l: Localizado, trecho = l.frase): OrigemItem {
  return { documento: l.doc.rotulo, pagina: l.pagina, trecho };
}

/** "RFP, p. 3" */
export function rotuloOrigem(o: OrigemItem): string {
  return `${o.documento}, p. ${o.pagina}`;
}
