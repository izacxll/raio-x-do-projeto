// Cláusulas da RFP: o texto de cada página partido nos itens numerados ("7.1", "a)", "1 Comprovante…") e nos
// parágrafos, com a página, a posição e a seção do mapa em que cada um fica. Base das regras do método da etapa 1
// (obrigações da contratada, dinheiro, documentação linha a linha): elas leem a cláusula inteira, não a frase
// solta, e sabem se a cláusula é do certame ou da execução.
import { limparEspacos } from "../../texto/frase";
import { tirarAcentos } from "../../texto/normalizar";
import type { DocumentoRfp } from "./item";
import { secaoDaPosicao, type MapaRfp, type SecaoRfp } from "./mapa";

export interface Clausula {
  doc: DocumentoRfp;
  pagina: number;
  /** Posição do começo da cláusula no texto da página. */
  posicao: number;
  /** "7.1", "a)", "12" ou vazio (parágrafo sem número). */
  numero: string;
  /** Texto da cláusula na página, com acentos e os espaços colapsados (sem atravessar a página). */
  texto: string;
  /** O mesmo texto sem acento e em minúsculas, para as expressões. */
  normal: string;
  secao?: SecaoRfp;
  /** A cláusula fica num anexo (termo de referência, minuta). */
  noAnexo: boolean;
}

/** Começo de item: "7.1", "7.1.2.", "12.", "a)", "IV -", "1 Comprovante" (lista numerada sem ponto). */
const RE_INICIO =
  /^(?:(\d{1,2}(?:\.\d{1,2}){1,4}\.?)|(\d{1,2}[.)])|([a-z]\))|([IVX]{1,5}\s*[-–.)])|(\d{1,2})(?=\s+[A-ZÀ-Ý]))\s*/;
const RE_TITULO = /^(?:CL[AÁ]USULA|ANEXO|CAP[IÍ]TULO|SE[CÇ][AÃ]O)\b/;

const cache = new WeakMap<DocumentoRfp, { mapa: MapaRfp; clausulas: Clausula[] }>();

/** As cláusulas de todos os documentos, na ordem do texto. */
export function lerClausulas(docs: DocumentoRfp[], mapa: MapaRfp): Clausula[] {
  return docs.flatMap((d) => clausulasDoDocumento(d, mapa));
}

function clausulasDoDocumento(doc: DocumentoRfp, mapa: MapaRfp): Clausula[] {
  const guardado = cache.get(doc);
  if (guardado && guardado.mapa === mapa) return guardado.clausulas;
  const out: Clausula[] = [];
  const inicioAnexos = mapa.inicioAnexos.get(doc.id) ?? Infinity;
  for (const p of doc.paginas) {
    if (p.origem === "nao-verificavel" || !p.texto.trim()) continue;
    let atual: { posicao: number; numero: string; linhas: string[] } | undefined;
    const fechar = () => {
      if (!atual) return;
      const texto = limparEspacos(atual.linhas.join(" "));
      if (texto.length >= 12)
        out.push({
          doc,
          pagina: p.numero,
          posicao: atual.posicao,
          numero: atual.numero,
          texto,
          normal: tirarAcentos(texto),
          secao: secaoDaPosicao(mapa, doc.id, p.numero, atual.posicao),
          noAnexo: p.numero >= inicioAnexos,
        });
      atual = undefined;
    };
    let posicao = 0;
    for (const linha of p.texto.split("\n")) {
      const limpa = linha.trim();
      const m = RE_INICIO.exec(limpa);
      // linha curta sem ponto final fecha o parágrafo (título, célula de tabela)
      const titulo =
        RE_TITULO.test(limpa) ||
        (limpa.length > 0 && limpa.length < 50 && limpa === limpa.toUpperCase() && /[A-ZÀ-Ý]{4}/.test(limpa));
      if (m || titulo || !atual) {
        fechar();
        if (limpa)
          atual = {
            posicao,
            numero: (m?.[1] ?? m?.[2] ?? m?.[3] ?? m?.[4] ?? m?.[5] ?? "").trim(),
            linhas: [limpa],
          };
        if (titulo) fechar();
      } else if (limpa) atual.linhas.push(limpa);
      posicao += linha.length + 1;
    }
    fechar();
  }
  cache.set(doc, { mapa, clausulas: out });
  return out;
}

/** Trecho literal da cláusula para citar: até `maximo` caracteres, sem cortar palavra. */
export function trechoDaClausula(c: Clausula, maximo = 320): string {
  if (c.texto.length <= maximo) return c.texto;
  const corte = c.texto.lastIndexOf(" ", maximo);
  return `${c.texto.slice(0, corte > 40 ? corte : maximo)}…`;
}

/** Temas do mapa que são do certame (proposta, julgamento, habilitação): o que vale só até a assinatura. */
export const TEMAS_DO_CERTAME = new Set([
  "participacao",
  "esclarecimento",
  "proposta",
  "julgamento",
  "habilitacao",
  "recursos",
]);

export function ehDoCertame(c: Clausula): boolean {
  return !c.noAnexo && Boolean(c.secao?.tema && TEMAS_DO_CERTAME.has(c.secao.tema));
}
