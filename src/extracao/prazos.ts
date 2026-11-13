// Prazo total de execução ou vigência declarado num documento ("vigência de 04 (quatro) meses").
import type { PaginaLida } from "../dossie/esquema";
import { trechoEmVolta } from "../regras/busca";

export interface PrazoTotal {
  valor: number;
  unidade: "meses" | "dias";
  pagina: number;
  posicao: number;
  trecho: string;
}

const RE_PRAZO =
  /(?:prazo\s+(?:total\s+)?(?:de\s+)?(?:execu[cç][aã]o|vig[eê]ncia)|vig[eê]ncia|dura[cç][aã]o\s+(?:total\s+)?do\s+(?:projeto|contrato))[^.\n;]{0,60}?\b(\d{1,3})\s*(?:\([^)]{2,30}\)\s*)?(meses|m[eê]s|dias)/gi;

export function extrairPrazosTotais(paginas: PaginaLida[]): PrazoTotal[] {
  const prazos: PrazoTotal[] = [];
  for (const p of paginas) {
    if (p.origem === "nao-verificavel") continue;
    for (const m of p.texto.matchAll(RE_PRAZO)) {
      const valor = Number(m[1]);
      if (!valor) continue;
      prazos.push({
        valor,
        unidade: /dia/i.test(m[2] ?? "") ? "dias" : "meses",
        pagina: p.numero,
        posicao: m.index ?? 0,
        trecho: trechoEmVolta(p.texto, m.index ?? 0, m[0].length, 30),
      });
    }
  }
  return prazos;
}

/** O prazo que mais se repete no documento (o declarado), com a primeira ocorrência como evidência. */
export function prazoPrincipal(prazos: PrazoTotal[]): PrazoTotal | undefined {
  const contagem = new Map<string, { n: number; primeiro: PrazoTotal }>();
  for (const p of prazos) {
    const chave = `${p.valor} ${p.unidade}`;
    const c = contagem.get(chave);
    if (c) c.n++;
    else contagem.set(chave, { n: 1, primeiro: p });
  }
  return [...contagem.values()].sort((a, b) => b.n - a.n)[0]?.primeiro;
}
