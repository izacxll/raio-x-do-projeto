// Leitor das premissas críticas comuns (PC1 a PC8) do checklist.md da skill (decisão 0021).
import { lerSinais, type Sinais } from "./fichas";

export interface PremissaCritica {
  /** PC1 a PC8. */
  codigo: string;
  titulo: string;
  /** Códigos V29 de origem ("CTR4, CP13, TB24") ou "nova". */
  origemV29: string;
  assume: string;
  aplicaSe: string;
  /** Sinais de que a premissa vale para o projeto (na RFP, no TAP ou no plano). */
  sinaisAplicacao: Sinais;
  /** Sinais de que o plano tratou a premissa. */
  sinaisNoPlano: Sinais;
  ondeNoPlano: string;
}

const RE_TITULO = /^### (PC\d+) — (.+?)(?: \(([^)]*)\))?\s*$/;
const RE_CAMPO = /^- \*\*([^*]+):\*\*\s*(.*)$/;

export function lerPremissas(texto: string): PremissaCritica[] {
  const premissas: PremissaCritica[] = [];
  let atual: PremissaCritica | null = null;
  for (const linha of texto.split(/\r?\n/)) {
    const t = RE_TITULO.exec(linha);
    if (t?.[1] && t[2]) {
      atual = {
        codigo: t[1],
        titulo: t[2],
        origemV29: t[3] ?? "",
        assume: "",
        aplicaSe: "",
        sinaisAplicacao: { termos: [], compostos: [], estruturas: [] },
        sinaisNoPlano: { termos: [], compostos: [], estruturas: [] },
        ondeNoPlano: "",
      };
      premissas.push(atual);
      continue;
    }
    if (/^#{2,3} /.test(linha)) {
      atual = null;
      continue;
    }
    const c = RE_CAMPO.exec(linha);
    if (!c || !atual) continue;
    const [, nome = "", valor = ""] = c;
    if (nome === "assume") atual.assume = valor;
    else if (nome === "aplica-se") atual.aplicaSe = valor;
    else if (nome === "sinais de aplicação") atual.sinaisAplicacao = lerSinais(valor);
    else if (nome === "sinais no plano") atual.sinaisNoPlano = lerSinais(valor);
    else if (nome === "onde no plano") atual.ondeNoPlano = valor;
  }
  return premissas;
}
