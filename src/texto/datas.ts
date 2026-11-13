// Datas no texto (por extenso e numéricas) e contas de prazo. Todas as contas são feitas aqui, por código.
import { tirarAcentos } from "./normalizar";

export interface DataNoTexto {
  /** Posição no texto onde a data começa. */
  posicao: number;
  /** Tamanho do trecho da data no texto. */
  tamanho: number;
  data: Date;
}

const MESES: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

const juntar = (s: string) => s.replace(/\s/g, "");

function dataValida(ano: number, mes: number, dia: number): Date | null {
  if (ano < 2000 || ano > 2100 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  const d = new Date(ano, mes - 1, dia);
  // 31/02 vira 03/03 no Date: não é data
  return d.getMonth() === mes - 1 ? d : null;
}

// origem: App-final-4.jsx, rrDatas, linha 1675
/**
 * Datas por extenso ("26 de agosto de 2026", "1º de março de 2026") e numéricas (26/08/2026), tolerando os
 * espaços que o leitor de PDF insere ("2 6 de agost o de 20 2 6").
 */
export function encontrarDatas(texto: string): DataNoTexto[] {
  const out: DataNoTexto[] = [];
  const t = String(texto);
  for (const m of t.matchAll(
    /(\d\s?\d?)\s?[º°o]?\s+de\s+([A-Za-zçÇ]+(?:\s[a-zç]{1,4})?)\s+de\s+((?:\d\s?){3}\d)/gi,
  )) {
    const mes = MESES[tirarAcentos(m[2] ?? "").replace(/\s/g, "")];
    const d = mes ? dataValida(Number(juntar(m[3] ?? "")), mes, Number(juntar(m[1] ?? ""))) : null;
    if (d) out.push({ posicao: m.index ?? 0, tamanho: m[0].length, data: d });
  }
  for (const m of t.matchAll(/(?<![\d/])(\d\s?\d?)\s?\/\s?(\d\s?\d?)\s?\/\s?((?:\d\s?){3}\d)(?!\d)/g)) {
    const d = dataValida(Number(juntar(m[3] ?? "")), Number(juntar(m[2] ?? "")), Number(juntar(m[1] ?? "")));
    if (d) out.push({ posicao: m.index ?? 0, tamanho: m[0].trimEnd().length, data: d });
  }
  return out.sort((a, b) => a.posicao - b.posicao);
}

// origem: App-final-4.jsx, rrFmt, linha 1681
export function formatarData(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** Só a data (meia-noite), para comparar dias sem a hora. */
export function soData(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function ehDiaUtil(d: Date): boolean {
  const s = d.getDay();
  return s !== 0 && s !== 6;
}

/**
 * Soma (ou subtrai, com n negativo) dias úteis. Conta só sábados e domingos como não úteis: feriados não
 * entram, e a tela pede ao GP para conferi-los.
 */
export function somarDiasUteis(d: Date, n: number): Date {
  const r = soData(d);
  const passo = n < 0 ? -1 : 1;
  let faltam = Math.abs(n);
  while (faltam > 0) {
    r.setDate(r.getDate() + passo);
    if (ehDiaUtil(r)) faltam--;
  }
  return r;
}

export function somarDiasCorridos(d: Date, n: number): Date {
  const r = soData(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Dias corridos de `de` até `ate` (negativo se `ate` já passou). */
export function diasEntre(de: Date, ate: Date): number {
  return Math.round((soData(ate).getTime() - soData(de).getTime()) / 864e5);
}

const NUMEROS_POR_EXTENSO: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  quinze: 15,
  vinte: 20,
  trinta: 30,
  sessenta: 60,
  noventa: 90,
};

/** "3", "03", "três", "3 (três)" → 3. Número que o código não reconhece → null. */
export function lerNumero(texto: string): number | null {
  const s = tirarAcentos(texto).trim();
  const d = /\d+/.exec(s);
  if (d) return Number(d[0]);
  const p = /[a-z]+/.exec(s);
  return p ? (NUMEROS_POR_EXTENSO[p[0]] ?? null) : null;
}
