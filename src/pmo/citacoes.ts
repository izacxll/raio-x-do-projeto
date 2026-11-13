// Conferência de citações (seção 6): todo trecho citado pelo PMO é procurado no texto extraído da página indicada.
// Não encontrado → "citação não conferida", e o item nunca aparece como fato.
// Comparação literal, aproximada (sequências de 8 caracteres numa mesma janela) e por partes ("[...]", "…").
import type { DocumentoLido } from "../dossie/esquema";
import type { FontePmo } from "./schemas/comum";

export type EstadoCitacao =
  /** O trecho está na página indicada. */
  | "conferida"
  /** Quase literal (um caractere corrompido, uma palavra partida) na página indicada. */
  | "aproximada"
  /** Está no documento, mas noutra página: vale a página achada pelo código. */
  | "outra-pagina"
  /** A página indicada não tem texto legível: conferir no documento. */
  | "nao-verificavel"
  /** Não está no texto lido: nunca aparece como fato. */
  | "nao-conferida";

export interface ResultadoCitacao {
  estado: EstadoCitacao;
  /** Página onde o código achou o trecho (quando achou). */
  pagina?: number;
  /** Arquivo onde achou (RFP e anexos em PDFs separados têm cada um a sua numeração). */
  arquivo?: string;
}

// origem: App-final-4.jsx, canon, linha 1241
const canon = (t: string) =>
  String(t || "")
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// origem: App-final-4.jsx, compacto, linha 1255 — os pares que costumam virar ligadura saem dos dois lados
export const compacto = (t: string) =>
  canon(t)
    .split(" ")
    .map((w) => w.replace(/ffi|ffl|ff|fi|fl|ft|tt|ti/g, ""))
    .join("");

// origem: App-final-4.jsx, gramas, linha 1256
const gramas = (x: string, n = 8) => {
  const out: string[] = [];
  for (let i = 0; i + n <= x.length; i++) out.push(x.slice(i, i + n));
  return out;
};

/**
 * origem: App-final-4.jsx, cobertura, linha 1276 — fração das sequências de 8 caracteres do trecho que aparecem
 * numa MESMA janela contínua do texto. Sem a janela, duas frases reais de lugares diferentes coladas passariam.
 */
export function cobertura(x: string, base: string): number {
  const g = gramas(x);
  if (!g.length) return 0;
  const hits: [number, number][] = [];
  g.forEach((gr, gi) => {
    for (let pos = base.indexOf(gr); pos >= 0; pos = base.indexOf(gr, pos + 1)) hits.push([pos, gi]);
  });
  hits.sort((a, b) => a[0] - b[0]);
  const w = Math.ceil(x.length * 1.3);
  const cont = new Map<number, number>();
  let melhor = 0;
  let j = 0;
  for (let i = 0; i < hits.length; i++) {
    const [pos, gi] = hits[i] as [number, number];
    cont.set(gi, (cont.get(gi) ?? 0) + 1);
    while (pos - (hits[j] as [number, number])[0] > w) {
      const k = (hits[j] as [number, number])[1];
      if (cont.get(k) === 1) cont.delete(k);
      else cont.set(k, (cont.get(k) ?? 1) - 1);
      j++;
    }
    melhor = Math.max(melhor, cont.size);
  }
  return melhor / g.length;
}

/**
 * origem: App-final-4.jsx, conferirPartes, linha 1334 — anotações de página dentro da citação saem; a citação é
 * partida nos "[...]" e reticências, e cada parte com 12 caracteres ou mais é conferida.
 */
export function partesDaCitacao(trecho: string): string[] {
  return String(trecho)
    .replace(/^["“”'‘’]+|["“”'‘’]+$/g, "")
    .replace(/\(\s*(p|pág|pag|página|pagina)\.?\s*\d+\s*\)/gi, " ")
    .split(/\[[^\]]*\]|\.\.\.|…/)
    .map(compacto)
    .filter((x) => x.length >= 12);
}

type Nivel = "exato" | "aprox" | null;

/** origem: App-final-4.jsx, buscar, linha 1309 — trecho curto só vale exato (poucas sequências). */
function nivelNaBase(partes: string[], base: string): Nivel {
  if (partes.every((x) => base.includes(x))) return "exato";
  if (partes.every((x) => x.length >= 40 && cobertura(x, base) >= 0.8)) return "aprox";
  return null;
}

const cachePaginas = new WeakMap<DocumentoLido, string[]>();
function paginasCompactas(d: DocumentoLido): string[] {
  let p = cachePaginas.get(d);
  if (!p) {
    p = d.paginas.map((pg) => (pg.origem === "nao-verificavel" ? "" : compacto(pg.texto)));
    cachePaginas.set(d, p);
  }
  return p;
}

/** Documentos que um "doc" do PMO pode querer dizer: "rfp" cobre a RFP e os anexos em PDFs separados. */
function documentosDoDoc(doc: FontePmo["doc"], documentos: DocumentoLido[]): DocumentoLido[] {
  return documentos.filter((d) =>
    doc === "rfp" ? d.papel === "rfp" || d.papel === "anexo-rfp" : d.papel === doc,
  );
}

export function conferirCitacao(fonte: FontePmo, documentos: DocumentoLido[]): ResultadoCitacao {
  const partes = partesDaCitacao(fonte.trecho);
  const docs = documentosDoDoc(fonte.doc, documentos);
  // sem trecho conferível (curto demais) ou sem o documento citado: não dá para dar como fato
  if (!partes.length || !docs.length) return { estado: "nao-conferida" };

  // 1. na página indicada, em cada documento do papel
  let ilegivel = false;
  for (const d of docs) {
    const pg = d.paginas.find((p) => p.numero === fonte.pagina);
    if (!pg) continue;
    if (pg.origem === "nao-verificavel") {
      ilegivel = true;
      continue;
    }
    const nivel = nivelNaBase(partes, paginasCompactas(d)[fonte.pagina - 1] ?? "");
    if (nivel)
      return {
        estado: nivel === "exato" ? "conferida" : "aproximada",
        pagina: fonte.pagina,
        arquivo: d.nomeArquivo,
      };
  }
  // 2. noutra página (a página indicada pode vir deslocada): o código diz onde achou
  for (const d of docs) {
    const paginas = paginasCompactas(d);
    for (let i = 0; i < paginas.length; i++) {
      if (i + 1 === fonte.pagina) continue;
      if (nivelNaBase(partes, paginas[i] ?? ""))
        return { estado: "outra-pagina", pagina: i + 1, arquivo: d.nomeArquivo };
    }
  }
  if (ilegivel) return { estado: "nao-verificavel" };
  return { estado: "nao-conferida" };
}

export const NOME_ESTADO_CITACAO: Record<EstadoCitacao, string> = {
  conferida: "citação conferida",
  aproximada: "citação conferida (quase literal)",
  "outra-pagina": "citação achada noutra página",
  "nao-verificavel": "página sem texto legível — conferir no documento",
  "nao-conferida": "citação não conferida",
};

/** Conta como fato só o que o código achou no documento. */
export function citacaoValeComoFato(r: ResultadoCitacao): boolean {
  return r.estado === "conferida" || r.estado === "aproximada" || r.estado === "outra-pagina";
}
