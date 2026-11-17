// Etapa 2, preço de operação contínua e de parceria (método da etapa 2, seção 3.6): a folha da equipe mês a mês ao
// longo da vigência, com o custo mensal de cada função dado pelo GP, mais as despesas por natureza. Sem valor-hora,
// sem horas na EAP; custos indiretos só como despesa com memória de cálculo, e taxa de administração conferida no edital
// e na norma local (decisão 0040). Sem os valores do GP, a conta fica em branco: o código nunca inventa
// salário, encargo nem despesa.
import type { LinhaQuadro } from "../../pmo/schemas/proposta";

export interface FolhaMensal {
  /** Pessoas por mês (índice 0 = mês 1), somando as funções. */
  pessoasPorMes: number[];
  /** Custo da folha por mês, quando o GP deu o custo de todas as funções do mês. */
  custoPorMes?: number[];
  totalFolha?: number;
  despesas?: number;
  total?: number;
  faltando: string[];
  /** Funções do quadro, com as pessoas-mês de cada uma. */
  funcoes: { funcao: string; pessoasMes: number; custoMensal?: number; custo?: number }[];
}

const arred2 = (v: number) => Math.round(v * 100) / 100;

/** Meses de execução que o quadro cobre (o maior "até o mês"), ou a vigência quando maior. */
export function mesesDoQuadro(quadro: LinhaQuadro[], vigenciaMeses?: number): number {
  return Math.max(vigenciaMeses ?? 0, ...quadro.map((l) => Math.ceil(l.ateMes)), 0);
}

export function calcularFolha(
  quadro: LinhaQuadro[],
  custoMensal: Record<string, number | undefined>,
  despesas: { descricao: string; valor?: number }[],
  vigenciaMeses?: number,
): FolhaMensal {
  const meses = mesesDoQuadro(quadro, vigenciaMeses);
  const pessoasPorMes = Array.from({ length: meses }, () => 0);
  const custoPorMes = Array.from({ length: meses }, () => 0);
  const faltando: string[] = [];
  const porFuncao = new Map<string, number>();
  let semCusto = false;
  for (const l of quadro) {
    const de = Math.max(1, Math.floor(l.deMes));
    const ate = Math.min(meses, Math.ceil(l.ateMes));
    for (let m = de; m <= ate; m++) {
      pessoasPorMes[m - 1] = (pessoasPorMes[m - 1] ?? 0) + l.quantidade;
      const c = custoMensal[l.funcao];
      if (c === undefined) semCusto = true;
      else custoPorMes[m - 1] = (custoPorMes[m - 1] ?? 0) + c * l.quantidade;
      porFuncao.set(l.funcao, (porFuncao.get(l.funcao) ?? 0) + l.quantidade);
    }
  }
  const funcoes = [...porFuncao.entries()].map(([funcao, pessoasMes]) => {
    const c = custoMensal[funcao];
    if (c === undefined) faltando.push(`custo mensal de ${funcao}`);
    return {
      funcao,
      pessoasMes,
      custoMensal: c,
      custo: c === undefined ? undefined : arred2(c * pessoasMes),
    };
  });
  const totalFolha = semCusto ? undefined : arred2(custoPorMes.reduce((s, c) => s + c, 0));
  const despesasSemValor = despesas.filter((d) => d.valor === undefined);
  for (const d of despesasSemValor) faltando.push(`valor da despesa "${d.descricao}"`);
  const totalDespesas = despesasSemValor.length
    ? undefined
    : arred2(despesas.reduce((s, d) => s + (d.valor ?? 0), 0));
  return {
    pessoasPorMes,
    custoPorMes: semCusto ? undefined : custoPorMes.map(arred2),
    totalFolha,
    despesas: totalDespesas,
    total:
      totalFolha !== undefined && totalDespesas !== undefined
        ? arred2(totalFolha + totalDespesas)
        : undefined,
    faltando,
    funcoes,
  };
}
