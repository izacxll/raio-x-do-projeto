// Leitor das fichas da skill PMO (.claude/skills/pmo/referencias/artefatos/), formato da decisão 0015.
// A skill é a fonte única: o app lê o mesmo arquivo que o PMO usa (decisões 0013 e 0015).
// Aqui só se interpreta o texto; quem carrega os arquivos é ./skill.ts.

export type Gravidade = "grave" | "média" | "baixa";
export type Confere = "código" | "só PMO";

export interface ItemConteudo {
  /** Código do item: A7.1, B27.13, TAP1.1, TAP-PR.2, PROP-SOW.4. */
  codigo: string;
  texto: string;
  fonte: string;
  /** Termos entre aspas da linha "sinais" (o que o código procura). */
  termos: string[];
  /** Sinais compostos ("premissa" junto de "dados"): todos os termos na mesma página. */
  compostos: string[][];
  /** Partes da linha "sinais" sem aspas: estruturas que o código ainda não confere (tabela, coluna etc.). */
  estruturas: string[];
  confere: Confere;
  /** "nunca" ou condição com as características do projeto ("porte pequeno e sem campo"). */
  dispensa: string;
}

export interface Ficha {
  /** A1…A18, B1…B33, TAP, PROP-SOW etc. */
  codigo: string;
  nome: string;
  tipo: string;
  gravidade: Gravidade | "não se aplica";
  categoria: string;
  sinonimos: string[];
  versao: string;
  itens: ItemConteudo[];
  arquivo: string;
}

function lerCabecalho(texto: string): Record<string, string> {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texto);
  const campos: Record<string, string> = {};
  if (!m?.[1]) return campos;
  for (const linha of m[1].split(/\r?\n/)) {
    const c = /^([a-z]+):\s*(.*?)\s*(#.*)?$/.exec(linha);
    if (c?.[1]) campos[c[1]] = c[2] ?? "";
  }
  return campos;
}

function lerLista(valor: string | undefined): string[] {
  if (!valor) return [];
  try {
    const v: unknown = JSON.parse(valor);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export interface Sinais {
  termos: string[];
  compostos: string[][];
  estruturas: string[];
}

/**
 * Separa a linha "sinais" em termos (entre aspas), compostos (dois ou mais termos entre aspas na mesma parte,
 * como `"premissa" junto de "dados"`, que precisam aparecer juntos) e estruturas (sem aspas).
 */
export function lerSinais(linha: string): Sinais {
  const termos: string[] = [];
  const compostos: string[][] = [];
  const estruturas: string[] = [];
  for (const parte of linha.split("|")) {
    const p = parte.trim();
    if (!p) continue;
    const aspas = [...p.matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "").filter(Boolean);
    if (!aspas.length || /\bindica/.test(p)) {
      // sem aspas, ou termos que indicam falha ("…indicam critério vago"): não são sinal de presença
      estruturas.push(p);
    } else if (/\bjunto de\b/.test(p) && aspas.length > 1) {
      // "A" junto de "B" ou "C": A com B, ou A com C
      const [primeiro, ...outros] = aspas;
      for (const outro of outros) compostos.push([primeiro ?? "", outro]);
    } else {
      termos.push(...aspas);
    }
  }
  return { termos, compostos, estruturas };
}

const RE_ITEM = /^- \*\*([A-Z][A-Z0-9-]*\d*(?:\.\d+)?)\*\* (.+)$/;
const RE_CAMPO = /^ {2}- (fonte|sinais|confere|dispensa):\s*(.*)$/;

export function lerFicha(texto: string, arquivo = ""): Ficha {
  const cab = lerCabecalho(texto);
  const itens: ItemConteudo[] = [];
  let atual: ItemConteudo | null = null;
  for (const linha of texto.split(/\r?\n/)) {
    const item = RE_ITEM.exec(linha);
    if (item?.[1] && item[2] && /\.\d+$/.test(item[1])) {
      atual = {
        codigo: item[1],
        texto: item[2].trim(),
        fonte: "",
        termos: [],
        compostos: [],
        estruturas: [],
        confere: "código",
        dispensa: "nunca",
      };
      itens.push(atual);
      continue;
    }
    const campo = RE_CAMPO.exec(linha);
    if (campo && atual) {
      const [, nome, valor = ""] = campo;
      if (nome === "fonte") atual.fonte = valor;
      else if (nome === "sinais") Object.assign(atual, lerSinais(valor));
      else if (nome === "confere") atual.confere = valor.trim() === "só PMO" ? "só PMO" : "código";
      else if (nome === "dispensa") atual.dispensa = valor.trim() || "nunca";
      continue;
    }
    // qualquer linha fora do bloco de um item encerra o item
    if (linha.trim() && !linha.startsWith("  ")) atual = null;
  }
  const gravidade = cab.gravidade as Ficha["gravidade"];
  return {
    codigo: cab.codigo ?? "",
    nome: cab.nome ?? "",
    tipo: cab.tipo ?? "",
    gravidade: ["grave", "média", "baixa"].includes(gravidade) ? gravidade : "não se aplica",
    categoria: cab.categoria ?? "",
    sinonimos: lerLista(cab.sinonimos),
    versao: cab.versao ?? "",
    itens,
    arquivo,
  };
}
