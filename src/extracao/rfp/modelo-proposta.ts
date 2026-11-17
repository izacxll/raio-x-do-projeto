// Estrutura da proposta que o edital pede (método da etapa 2, seção 3.2): os quadros do modelo obrigatório ("QUADRO 08
// – METODOLOGIA DO PROJETO") ou a lista de partes ("organizada na seguinte estrutura: a) …; b) …"). A minuta segue
// essa ordem à risca; cada critério de pontuação precisa de uma seção que responda a ele.
import { tirarAcentos } from "../../texto/normalizar";
import type { DocumentoRfp, OrigemItem } from "./item";

export interface SecaoDoModelo {
  /** "QUADRO 08", "c)", "III". */
  codigo: string;
  titulo: string;
  /** O que o edital pede na seção, quando escreve (a linha seguinte ao título do quadro). */
  instrucao?: string;
  origem: OrigemItem;
}

export interface EstruturaDoEdital {
  fonte: "quadros" | "lista";
  secoes: SecaoDoModelo[];
  /** Obrigatória ("modelo do Anexo I") ou preferencial ("preferencialmente"). */
  obrigatoria: boolean;
}

const RE_QUADRO = /QUADRO\s+(\d{1,2})\s*[-–—]\s*([^\n]{3,90})/g;

const MINUSCULAS = new Set([
  "A",
  "AS",
  "O",
  "OS",
  "E",
  "DA",
  "DAS",
  "DE",
  "DO",
  "DOS",
  "EM",
  "NA",
  "NO",
  "COM",
  "POR",
]);

/** "IDENTIFICAÇÃO DA OSC" → "Identificação da OSC": siglas curtas ficam em maiúsculas. */
function tituloLegivel(t: string): string {
  return t
    .split(/\s+/)
    .map((p, i) => {
      if (p.length <= 4 && /^[A-Z]+$/.test(p) && !MINUSCULAS.has(p)) return p;
      const b = p.toLowerCase();
      return i === 0 ? b.charAt(0).toUpperCase() + b.slice(1) : b;
    })
    .join(" ");
}

function quadros(docs: DocumentoRfp[]): SecaoDoModelo[] {
  const vistos = new Map<number, SecaoDoModelo>();
  for (const d of docs)
    for (const p of d.paginas) {
      for (const m of p.texto.matchAll(RE_QUADRO)) {
        const n = Number(m[1]);
        const titulo = (m[2] ?? "").replace(/\s*\(.*$/, "").trim();
        // o mesmo quadro citado de novo ("conforme o Quadro 11") não é a seção
        if (!titulo || vistos.has(n) || !/^[A-ZÀ-Ý0-9 ,/–-]+$/.test(titulo)) continue;
        const depois = p.texto.slice((m.index ?? 0) + m[0].length).trim();
        const instrucao = depois.split("\n")[0]?.trim();
        vistos.set(n, {
          codigo: `QUADRO ${String(n).padStart(2, "0")}`,
          titulo: tituloLegivel(titulo),
          instrucao: instrucao && !/^QUADRO/.test(instrucao) && instrucao.length > 20 ? instrucao : undefined,
          origem: { documento: d.rotulo, pagina: p.numero, trecho: m[0].trim() },
        });
      }
    }
  return [...vistos.entries()].sort((a, b) => a[0] - b[0]).map(([, s]) => s);
}

const RE_ABRE_LISTA =
  /(?:organizad[ao],?\s*(?:preferencialmente,?\s*)?na seguinte estrutura|(?:deverá|deve) (?:conter|apresentar),?\s*(?:no mínimo|minimamente),?\s*(?:os seguintes (?:itens|tópicos|elementos))?)\s*:/i;

function lista(docs: DocumentoRfp[]): { secoes: SecaoDoModelo[]; obrigatoria: boolean } | undefined {
  for (const d of docs)
    for (const p of d.paginas) {
      const m = RE_ABRE_LISTA.exec(p.texto);
      if (!m) continue;
      const inicio = (m.index ?? 0) + m[0].length;
      // a lista pode continuar na página seguinte
      const seguinte = d.paginas.find((x) => x.numero === p.numero + 1)?.texto ?? "";
      const corpo = `${p.texto.slice(inicio)}\n${seguinte}`.slice(0, 2500);
      const secoes: SecaoDoModelo[] = [];
      let esperada = "a".charCodeAt(0);
      for (const it of corpo.matchAll(/(?:^|\n|;\s*)\s*([a-z])\)\s*([^;\n]{3,160}?)(?=;|\.|\n|$)/g)) {
        const letra = it[1] ?? "";
        if (letra.charCodeAt(0) !== esperada) {
          if (secoes.length) break;
          continue;
        }
        esperada++;
        const titulo = (it[2] ?? "").replace(/\s+e$/, "").trim();
        secoes.push({
          codigo: `${letra})`,
          titulo: titulo.charAt(0).toUpperCase() + titulo.slice(1),
          origem: { documento: d.rotulo, pagina: p.numero, trecho: `${letra}) ${titulo}` },
        });
      }
      if (secoes.length >= 3) return { secoes, obrigatoria: !/preferencialmente/i.test(m[0]) };
    }
  return undefined;
}

/** Os quadros do modelo, se houver; senão, a lista de partes; senão, undefined (a ficha PROP-ESTRUTURA vale). */
export function extrairEstruturaDoEdital(docs: DocumentoRfp[]): EstruturaDoEdital | undefined {
  const q = quadros(docs);
  if (q.length >= 3) {
    const texto = tirarAcentos(docs.flatMap((d) => d.paginas.map((p) => p.texto)).join(" ")).toLowerCase();
    return {
      fonte: "quadros",
      secoes: q,
      obrigatoria:
        /\b(?:em conformidade com o modelo|conforme (?:o )?modelo|no modelo d[oa] anexo|modelo (?:constante|obrigatorio|do anexo))\b/.test(
          texto,
        ),
    };
  }
  const l = lista(docs);
  return l ? { fonte: "lista", ...l } : undefined;
}
