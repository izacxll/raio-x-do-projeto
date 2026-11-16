// Caixa (métodos das etapas 2 e 4): parcelas ou medições (percentual e mês) × curva de custo mês a mês, sempre pelo
// acumulado. A folga de cada parcela é o recebido até ela menos o custo acumulado até a véspera da parcela seguinte
// (o ponto mais apertado daquele trecho). Conta do código; a curva de custo vem do GP (valores) ou, sem eles, da
// rampa de pessoas ou das horas do cronograma, como aproximação dita na tela. Nenhum valor é inventado aqui.
import type { OrigemItem } from "../extracao/rfp/item";
import { tirarAcentos } from "../texto/normalizar";

export interface ParcelaCaixa {
  rotulo: string;
  percentual: number;
  /** Mês (1 = primeiro mês de execução) em que o dinheiro entra; undefined = prazo não informado. */
  mes?: number;
  prazo?: string;
  origem?: OrigemItem;
}

/**
 * Mês em que a parcela entra, pelo prazo escrito: "30 dias" → 1, "75 dias" → 3, "após 3 meses" → 3, "D+210" → 7.
 * Sem número de dias ou meses, undefined (o código não supõe: o GP informa).
 */
export function mesDoPrazo(prazo: string | undefined): number | undefined {
  if (!prazo) return undefined;
  const t = tirarAcentos(prazo).toLowerCase();
  const d = /(?:d\s*\+\s*)?(\d{1,4})\s*(?:\([a-z ]+\)\s*)?(dias|meses|mes)?/.exec(t);
  if (!d?.[1]) return undefined;
  const n = Number(d[1]);
  if (d[2]?.startsWith("mes")) return Math.max(1, n);
  if (d[2] === "dias" || /d\s*\+/.test(t)) return Math.max(1, Math.ceil(n / 30));
  return undefined;
}

export interface MesCaixa {
  mes: number;
  /** Percentual do valor recebido até o fim do mês. */
  recebido: number;
  /** Percentual do custo total gasto até o fim do mês. */
  custo: number;
  /** recebido − custo, em pontos percentuais. */
  folga: number;
}

export interface FolgaParcela {
  parcela: ParcelaCaixa;
  /** Percentual recebido até esta parcela (acumulado). */
  recebidoAte: number;
  /** Mês da véspera da parcela seguinte (ou o último mês). */
  ateMes: number;
  custoAte: number;
  folga: number;
}

export interface Caixa {
  meses: MesCaixa[];
  parcelas: FolgaParcela[];
  /** Parcelas sem mês: ficam fora da conta, e a tela pede o mês ao GP. */
  semMes: ParcelaCaixa[];
  /** O mês de menor folga. */
  maisApertado?: MesCaixa;
  /** O primeiro mês em que o custo acumulado passa do recebido. */
  primeiroNegativo?: MesCaixa;
  /** A parcela que cobre o mês de maior custo, com a fatia dela. */
  pico?: { mes: number; custoNoMes: number; parcela?: ParcelaCaixa };
  texto: string;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * @param custoMensal custo de cada mês de execução (R$ ou pesos: pessoas no mês, horas no mês); só a proporção
 * importa. O tamanho do vetor é o número de meses de execução.
 */
export function calcularCaixa(parcelas: ParcelaCaixa[], custoMensal: number[]): Caixa {
  const semMes = parcelas.filter((p) => p.mes === undefined);
  const comMes = parcelas
    .filter((p): p is ParcelaCaixa & { mes: number } => p.mes !== undefined)
    .sort((a, b) => a.mes - b.mes);
  const totalCusto = custoMensal.reduce((s, c) => s + Math.max(0, c), 0);
  const n = Math.max(custoMensal.length, ...comMes.map((p) => p.mes), 0);
  if (!n || totalCusto <= 0 || !comMes.length)
    return {
      meses: [],
      parcelas: [],
      semMes,
      texto: !comMes.length
        ? "Sem parcela com mês conhecido: o caixa não foi calculado (o mês de cada parcela é decisão do GP quando o documento não diz)."
        : "Sem curva de custo: o caixa não foi calculado.",
    };
  const meses: MesCaixa[] = [];
  let recebido = 0;
  let custo = 0;
  for (let m = 1; m <= n; m++) {
    recebido += comMes.filter((p) => p.mes === m).reduce((s, p) => s + p.percentual, 0);
    custo += (Math.max(0, custoMensal[m - 1] ?? 0) / totalCusto) * 100;
    meses.push({ mes: m, recebido: r1(recebido), custo: r1(custo), folga: r1(recebido - custo) });
  }
  const folgas: FolgaParcela[] = comMes.map((p, i) => {
    const proxima = comMes[i + 1];
    const ateMes = proxima ? Math.max(p.mes, proxima.mes - 1) : n;
    const mesAte = meses[ateMes - 1] as MesCaixa;
    const recebidoAte = r1(comMes.slice(0, i + 1).reduce((s, x) => s + x.percentual, 0));
    return { parcela: p, recebidoAte, ateMes, custoAte: mesAte.custo, folga: r1(recebidoAte - mesAte.custo) };
  });
  const maisApertado = [...meses].sort((a, b) => a.folga - b.folga || a.mes - b.mes)[0];
  const primeiroNegativo = meses.find((m) => m.folga < 0);
  const custos = custoMensal.map((c, i) => ({ mes: i + 1, c: (Math.max(0, c) / totalCusto) * 100 }));
  const maior = [...custos].sort((a, b) => b.c - a.c || a.mes - b.mes)[0];
  const parcelaDoPico = maior ? [...comMes].reverse().find((p) => p.mes <= maior.mes) : undefined;
  const pico = maior ? { mes: maior.mes, custoNoMes: r1(maior.c), parcela: parcelaDoPico } : undefined;
  const partes = [
    `Pelo acumulado, a menor folga é de ${maisApertado?.folga ?? 0} pontos percentuais no mês ${maisApertado?.mes ?? "—"}`,
    primeiroNegativo
      ? `o custo passa do recebido a partir do mês ${primeiroNegativo.mes} (folga de ${primeiroNegativo.folga} p.p.)`
      : "o recebido fica sempre à frente do custo",
  ];
  if (semMes.length) partes.push(`${semMes.length} parcela(s) sem mês ficaram fora da conta`);
  return {
    meses,
    parcelas: folgas,
    semMes,
    maisApertado,
    primeiroNegativo,
    pico,
    texto: `${partes.join("; ")}.`,
  };
}
