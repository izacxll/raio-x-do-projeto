// Etapa 4: os passos na ordem da decisão 0007 e as partes do plano que cada um gera. Cada parte sai de um lugar só:
// do texto do PMO, ou da conta do código (tabelas de cronograma, custos, designações e rastreabilidade).
import type { PassoPgp } from "../../pmo/schemas/pgp";

export interface PassoDaEtapa4 {
  passo: PassoPgp;
  nome: string;
  /** Partes que o PMO escreve neste passo (só as que o GP marcou para gerar). */
  textos: string[];
  /** Partes que o código monta com o que o passo devolve. */
  doCodigo: string[];
}

export const PASSOS_PGP: PassoDaEtapa4[] = [
  {
    passo: "adaptacao",
    nome: "Adaptação, ciclo de vida e abordagem",
    textos: ["A17", "A18"],
    doCodigo: [],
  },
  {
    passo: "escopo",
    nome: "Escopo e requisitos",
    textos: ["A1", "A2", "B22", "B17", "A13"],
    doCodigo: ["B23"],
  },
  {
    passo: "cronograma",
    nome: "Atividades, recursos e cronograma",
    textos: ["A3", "A6", "B1", "B4", "B12", "B13", "B24", "B25", "B26", "B32"],
    doCodigo: ["B2", "B8", "B15", "B16", "B11", "B29", "A14", "B18"],
  },
  {
    passo: "riscos",
    nome: "Riscos, custos e premissas",
    textos: ["A8", "A4"],
    doCodigo: ["B27", "B3", "B6", "A15"],
  },
  {
    passo: "planos",
    nome: "Demais planos e documentos",
    textos: ["A5", "A7", "A9", "A10", "A11", "A12", "B14", "B20", "B31"],
    doCodigo: [],
  },
  {
    passo: "execucao",
    nome: "Linha de base da medição e documentos de execução",
    textos: ["A16", "B5", "B7", "B9", "B10", "B19", "B21", "B28", "B30", "B33"],
    doCodigo: [],
  },
];

export const NOME_PASSO_PGP: Record<PassoPgp, string> = Object.fromEntries(
  PASSOS_PGP.map((p) => [p.passo, p.nome]),
) as Record<PassoPgp, string>;

/** Passo que gera a parte (pelo texto ou pela conta). */
export function passoDaParte(codigo: string): PassoDaEtapa4 | undefined {
  return PASSOS_PGP.find((p) => p.textos.includes(codigo) || p.doCodigo.includes(codigo));
}

/** Ordem das partes no plano exportado: os 18 componentes e depois os 33 documentos. */
export function ordemDaParte(codigo: string): number {
  const m = /^([AB])(\d+)$/.exec(codigo);
  if (!m) return 999;
  return (m[1] === "A" ? 0 : 100) + Number(m[2]);
}
