// Duração × vigência (métodos das etapas 2 a 5): os períodos do cronograma (meses, trimestres, fases) somados cabem
// nos meses de vigência? Conta do código; os períodos vêm do documento ou da proposta.
import { tirarAcentos } from "../texto/normalizar";

export interface PeriodoCronograma {
  rotulo: string;
  meses: number;
}

/** Meses de um rótulo de período: "Trimestre 3" → 3, "1º semestre" → 6, "Mês 07" → 1, "18 meses" → 18. */
export function mesesDoRotulo(rotulo: string): number | undefined {
  const t = tirarAcentos(rotulo).toLowerCase();
  const n = /(\d{1,3})\s*(?:\([a-z ]+\)\s*)?(meses|mes|anos?|semanas)\b/.exec(t);
  if (n?.[1] && n[2]) {
    const v = Number(n[1]);
    return n[2].startsWith("ano")
      ? v * 12
      : n[2] === "semanas"
        ? v / 4
        : n[2] === "mes" && /\bmes\s*\d/.test(t)
          ? 1
          : v;
  }
  if (/\btrimestre/.test(t)) return 3;
  if (/\bquadrimestre/.test(t)) return 4;
  if (/\bsemestre/.test(t)) return 6;
  if (/\bbimestre/.test(t)) return 2;
  if (/\b(?:mes|month)\b/.test(t)) return 1;
  if (/\bano\b/.test(t)) return 12;
  return undefined;
}

export interface ConferenciaDuracao {
  situacao: "cabe" | "passa" | "nao-conferido";
  soma: number;
  vigencia?: number;
  texto: string;
}

export function conferirDuracao(
  periodos: PeriodoCronograma[],
  vigenciaMeses: number | undefined,
): ConferenciaDuracao {
  const soma = Math.round(periodos.reduce((s, p) => s + p.meses, 0) * 100) / 100;
  if (!periodos.length)
    return {
      situacao: "nao-conferido",
      soma,
      vigencia: vigenciaMeses,
      texto: "Sem períodos de cronograma para somar.",
    };
  const partes = periodos.map((p) => `${p.rotulo} (${p.meses})`).join(" + ");
  if (vigenciaMeses === undefined)
    return {
      situacao: "nao-conferido",
      soma,
      texto: `Os períodos somam ${soma} meses (${partes}); vigência não localizada pelo código — conferir no documento.`,
    };
  const cabe = soma <= vigenciaMeses;
  return {
    situacao: cabe ? "cabe" : "passa",
    soma,
    vigencia: vigenciaMeses,
    texto: cabe
      ? `Os períodos somam ${soma} meses, dentro da vigência de ${vigenciaMeses}${soma < vigenciaMeses ? ` (sobram ${Math.round((vigenciaMeses - soma) * 100) / 100})` : ""}.`
      : `Os períodos somam ${soma} meses (${partes}), mais que a vigência de ${vigenciaMeses}: o cronograma não cabe.`,
  };
}

/** Vigência em meses a partir do texto do prazo ("12 (doze) meses", "360 dias", "2 anos"). */
export function vigenciaEmMeses(texto: string): number | undefined {
  const t = tirarAcentos(texto).toLowerCase();
  const m = /(\d{1,4})\s*(?:\([a-z ]+\)\s*)?(meses|mes|anos?|dias)\b/.exec(t);
  if (!m?.[1] || !m[2]) return undefined;
  const v = Number(m[1]);
  if (m[2].startsWith("ano")) return v * 12;
  if (m[2] === "dias") return Math.round((v / 30) * 10) / 10;
  return v;
}
