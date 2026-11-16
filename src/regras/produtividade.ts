// Quadro de equipe × produtividade (métodos das etapas 2 a 5): o volume previsto ÷ pessoas ÷ dias úteis comparado ao
// teto que o próprio documento escreve ("no máximo 6 visitas por dia"). Passar do teto é alerta na etapa 2,
// divergência na 3, premissa crítica PC7 na 4 e achado grave na 5. As contas são do código; o volume e o quadro vêm
// do documento ou da proposta (Sugestão do PMO ou decisão do GP), nunca de um número inventado aqui.
import type { DocumentoRfp, OrigemItem } from "../extracao/rfp/item";
import { localizarTodos } from "../extracao/rfp/localizar";

/** Dias úteis num mês, para a conta (sem feriados: a tela pede para conferir). */
export const DIAS_UTEIS_POR_MES = 21;

export interface TetoProdutividade {
  /** Quantas unidades por pessoa no período. */
  quantidade: number;
  /** "visitas", "atendimentos"… como o documento escreve (sem acento). */
  unidade: string;
  por: "dia" | "semana" | "mes";
  /** "teto" quando o documento limita (máximo, até, não pode exceder); "media" quando só diz quanto se espera. */
  tipo: "teto" | "media";
  origem: OrigemItem;
}

// só unidades de atividade de quem executa: "até 200 famílias por mês" é meta do programa, não teto por pessoa
const UNIDADES =
  "visitas?|atendimentos?|entrevistas?|questionarios?|acompanhamentos?|abordagens?|oficinas?|sessoes?|aulas?|encontros?";
const NUM = "(\\d{1,3}(?:,\\d)?)(?:\\s*\\([a-z ]+\\))?";
const POR =
  "(?:por|ao|a cada|\\/)\\s*(?:agente|profissional|tecnico|pessoa|entrevistador|visitador|educador|orientador|trabalhador)?\\s*(?:(?:por|ao)\\s*)?(dia|semana|mes)\\b";
const RE_TETO = new RegExp(
  `\\b(?:no maximo|maximo de|limite de|teto de|ate|nao (?:podera|devera|pode|deve) (?:exceder|ultrapassar|superar)(?: o limite de)?)\\s+${NUM}\\s+(${UNIDADES})\\s+(?:diari[oa]s|${POR})`,
);
const RE_MEDIA = new RegExp(
  `\\b(?:media de|em media|cerca de|produtividade (?:media |esperada |minima )?de)\\s+${NUM}\\s+(${UNIDADES})\\s+(?:diari[oa]s|${POR})`,
);

function periodo(m: RegExpExecArray): TetoProdutividade["por"] {
  const p = m[3];
  return p === "semana" ? "semana" : p === "mes" ? "mes" : "dia";
}

/** Os tetos (e as médias) de produtividade que o documento escreve, com a página e o trecho. */
export function extrairTetos(docs: DocumentoRfp[]): TetoProdutividade[] {
  const out: TetoProdutividade[] = [];
  for (const [re, tipo] of [
    [RE_TETO, "teto"],
    [RE_MEDIA, "media"],
  ] as const)
    for (const l of localizarTodos(docs, new RegExp(re.source, "g"))) {
      const m = new RegExp(re.source).exec(l.termo);
      if (!m?.[1] || !m[2]) continue;
      const quantidade = Number(m[1].replace(",", "."));
      if (!quantidade) continue;
      const repetido = out.some(
        (t) => t.origem.pagina === l.pagina && t.quantidade === quantidade && t.unidade === m[2],
      );
      if (!repetido)
        out.push({
          quantidade,
          unidade: m[2],
          por: periodo(m),
          tipo,
          origem: { documento: l.doc.rotulo, pagina: l.pagina, trecho: l.frase },
        });
    }
  // o teto vem antes da média: é a régua
  return out.sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === "teto" ? -1 : 1));
}

/** Teto por pessoa por dia útil. */
export function tetoPorDia(t: Pick<TetoProdutividade, "quantidade" | "por">): number {
  return t.por === "dia"
    ? t.quantidade
    : t.por === "semana"
      ? t.quantidade / 5
      : t.quantidade / DIAS_UTEIS_POR_MES;
}

export interface PeriodoQuadro {
  /** "Mês 3", "Trimestre 2"… */
  rotulo: string;
  meses: number;
  /** Pessoas que fazem a atividade medida (agentes, visitadores), não a equipe inteira. */
  pessoas: number;
  /** Volume previsto no período, na unidade do teto. */
  volume: number;
}

export type SituacaoProdutividade = "cabe" | "passa" | "nao-conferido";

export interface LinhaProdutividade extends PeriodoQuadro {
  porPessoaPorDia?: number;
  situacao: SituacaoProdutividade;
}

export interface ConferenciaProdutividade {
  situacao: SituacaoProdutividade;
  linhas: LinhaProdutividade[];
  teto?: TetoProdutividade;
  /** Maior carga por pessoa por dia no quadro. */
  pior?: LinhaProdutividade;
  texto: string;
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

/**
 * Volume ÷ pessoas ÷ (meses × 21 dias úteis), período a período, contra o teto. Sem teto escrito, a conta sai mas
 * não há régua: "não conferido". Período sem pessoas e com volume passa sempre (ninguém para fazer).
 */
export function conferirProdutividade(
  periodos: PeriodoQuadro[],
  teto: TetoProdutividade | undefined,
  diasUteisPorMes = DIAS_UTEIS_POR_MES,
): ConferenciaProdutividade {
  const limite = teto ? tetoPorDia(teto) : undefined;
  const linhas: LinhaProdutividade[] = periodos.map((p) => {
    if (p.volume <= 0) return { ...p, porPessoaPorDia: 0, situacao: "cabe" };
    if (p.pessoas <= 0 || p.meses <= 0)
      return { ...p, situacao: limite === undefined ? "nao-conferido" : "passa" };
    const porPessoaPorDia = p.volume / p.pessoas / (p.meses * diasUteisPorMes);
    return {
      ...p,
      porPessoaPorDia,
      situacao: limite === undefined ? "nao-conferido" : porPessoaPorDia <= limite + 1e-9 ? "cabe" : "passa",
    };
  });
  const comConta = linhas.filter((l) => l.porPessoaPorDia !== undefined);
  const pior = [...comConta].sort((a, b) => (b.porPessoaPorDia ?? 0) - (a.porPessoaPorDia ?? 0))[0];
  const semPessoas = linhas.filter((l) => l.volume > 0 && (l.pessoas <= 0 || l.meses <= 0));
  if (!linhas.length)
    return { situacao: "nao-conferido", linhas, teto, texto: "Sem quadro de equipe e volume para conferir." };
  const onde = teto ? ` (${teto.origem.documento}, p. ${teto.origem.pagina})` : "";
  const unidade = teto?.unidade ?? "unidades";
  const conta = pior
    ? `${pior.rotulo}: ${fmt(pior.volume)} ${unidade} ÷ ${pior.pessoas} pessoas ÷ (${pior.meses} × ${diasUteisPorMes} dias úteis) = ${fmt(pior.porPessoaPorDia ?? 0)} por pessoa por dia`
    : "";
  if (limite === undefined)
    return {
      situacao: "nao-conferido",
      linhas,
      pior,
      texto: `${conta ? `${conta}. ` : ""}O código não localizou teto de produtividade escrito no documento — conferir no documento (a régua é decisão do GP).`,
    };
  const passa = linhas.filter((l) => l.situacao === "passa");
  const tetoTexto = `${teto?.tipo === "media" ? "média escrita" : "teto escrito"}: ${fmt(teto?.quantidade ?? 0)} ${unidade} por ${teto?.por === "mes" ? "mês" : teto?.por}${teto?.por !== "dia" ? ` (${fmt(limite)} por dia útil)` : ""}${onde}`;
  if (!passa.length)
    return {
      situacao: "cabe",
      linhas,
      teto,
      pior,
      texto: `${conta}; ${tetoTexto}. O quadro fecha com a produtividade.`,
    };
  return {
    situacao: "passa",
    linhas,
    teto,
    pior,
    texto: `${conta}; ${tetoTexto}. Passa do teto em ${passa.length} de ${linhas.length} períodos${
      semPessoas.length ? ` (${semPessoas.length} com volume e sem pessoas)` : ""
    }: a meta não fecha com este quadro.`,
  };
}
