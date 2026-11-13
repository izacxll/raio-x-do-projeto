// Etapa 2, passo 7 (código, com os dados do GP): preço de baixo para cima.
// horas da EAP (PERT) × valor-hora de cada perfil + despesas + custos indiretos + reserva, e os tributos "por
// dentro" (preço = subtotal ÷ (1 − tributos)). Sem a tabela do GP, os valores ficam em branco: o código nunca
// inventa valor-hora, despesa, percentual, reserva nem preço final.
import type { HorasPerfil, PerfilEquipe } from "../../pmo/schemas/proposta";
import { duracaoEsperada } from "./cronograma";

export interface ParametrosPreco {
  /** Valor-hora de cada perfil, pelo id do perfil (decisão do GP). */
  valoresHora: Record<string, number | undefined>;
  despesas: { descricao: string; valor?: number }[];
  /** Percentuais (0 a 100), decisão do GP. */
  indiretosPct?: number;
  tributosPct?: number;
  /** Reserva de contingência em R$ (decisão do GP). */
  reserva?: number;
  /** Preço final (decisão do GP). Sem ele, a conferência usa o preço calculado. */
  precoFinal?: number;
}

export interface LinhaPerfil {
  perfil: PerfilEquipe;
  horas: number;
  valorHora?: number;
  custo?: number;
}

export interface Preco {
  linhas: LinhaPerfil[];
  horasTotais: number;
  pessoal?: number;
  despesas?: number;
  direto?: number;
  indiretos?: number;
  reserva?: number;
  subtotal?: number;
  tributos?: number;
  precoCalculado?: number;
  /** O que falta o GP preencher para a conta fechar. */
  faltando: string[];
}

const arred2 = (v: number) => Math.round(v * 100) / 100;

/** Horas de um perfil numa atividade: PERT, com uma casa decimal. */
export function horasEsperadas(h: HorasPerfil): number {
  return Math.round(duracaoEsperada(h.horas.otimista, h.horas.mais_provavel, h.horas.pessimista) * 10) / 10;
}

export function calcularPreco(perfis: PerfilEquipe[], horas: HorasPerfil[], par: ParametrosPreco): Preco {
  const faltando: string[] = [];
  const linhas: LinhaPerfil[] = perfis.map((perfil) => {
    const h = horas.filter((x) => x.perfil === perfil.id).reduce((s, x) => s + horasEsperadas(x), 0);
    const total = Math.round(h * 10) / 10;
    const valorHora = par.valoresHora[perfil.id];
    if (valorHora === undefined && total > 0) faltando.push(`valor-hora de ${perfil.nome}`);
    return {
      perfil,
      horas: total,
      valorHora,
      custo: valorHora === undefined ? undefined : arred2(total * valorHora),
    };
  });
  const horasTotais = Math.round(linhas.reduce((s, l) => s + l.horas, 0) * 10) / 10;
  const semValor = linhas.some((l) => l.horas > 0 && l.custo === undefined);
  const pessoal = semValor ? undefined : arred2(linhas.reduce((s, l) => s + (l.custo ?? 0), 0));

  const despesasSemValor = par.despesas.filter((d) => d.valor === undefined);
  for (const d of despesasSemValor) faltando.push(`valor da despesa "${d.descricao}"`);
  const despesas = despesasSemValor.length
    ? undefined
    : arred2(par.despesas.reduce((s, d) => s + (d.valor ?? 0), 0));

  if (par.indiretosPct === undefined) faltando.push("percentual de custos indiretos");
  if (par.tributosPct === undefined) faltando.push("percentual de tributos");
  if (par.reserva === undefined) faltando.push("reserva de contingência");

  const direto = pessoal !== undefined && despesas !== undefined ? arred2(pessoal + despesas) : undefined;
  const indiretos =
    direto !== undefined && par.indiretosPct !== undefined
      ? arred2((direto * par.indiretosPct) / 100)
      : undefined;
  const subtotal =
    direto !== undefined && indiretos !== undefined && par.reserva !== undefined
      ? arred2(direto + indiretos + par.reserva)
      : undefined;
  let precoCalculado: number | undefined;
  let tributos: number | undefined;
  if (subtotal !== undefined && par.tributosPct !== undefined) {
    if (par.tributosPct >= 100) faltando.push("percentual de tributos menor que 100%");
    else {
      precoCalculado = arred2(subtotal / (1 - par.tributosPct / 100));
      tributos = arred2(precoCalculado - subtotal);
    }
  }
  return {
    linhas,
    horasTotais,
    pessoal,
    despesas,
    direto,
    indiretos,
    reserva: par.reserva,
    subtotal,
    tributos,
    precoCalculado,
    faltando,
  };
}

/** "R$ 1.234.567,89" → 1234567.89. Sem valor em reais no texto → undefined. */
export function lerValorEmReais(texto: string): number | undefined {
  const m = /R\$\s*([\d.]+(?:,\d{1,2})?)/.exec(texto);
  if (!m?.[1]) return undefined;
  const v = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

export interface ConferenciaValor {
  situacao: "dentro" | "acima" | "abaixo-75" | "nao-conferido";
  texto: string;
}

/**
 * Preço × valor estimado do edital (quando divulgado). Abaixo de 75%: em obras e serviços de engenharia a Lei
 * 14.133 presume inexequível (art. 59, § 4º); nos demais serviços vale o critério do edital (licitacoes.md, 2.9).
 */
export function conferirValor(preco: number | undefined, estimado: number | undefined): ConferenciaValor {
  if (estimado === undefined)
    return {
      situacao: "nao-conferido",
      texto: "Valor estimado não localizado pelo código (ou orçamento sigiloso).",
    };
  if (preco === undefined)
    return { situacao: "nao-conferido", texto: "Preço ainda não fechado: faltam dados do GP." };
  const pct = Math.round((preco / estimado) * 1000) / 10;
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (preco > estimado)
    return {
      situacao: "acima",
      texto: `Preço de ${fmt(preco)} é ${pct}% do valor estimado (${fmt(estimado)}): acima dele. Recomenda-se conferir no edital se proposta acima do estimado é desclassificada.`,
    };
  if (pct < 75)
    return {
      situacao: "abaixo-75",
      texto: `Preço de ${fmt(preco)} é ${pct}% do valor estimado (${fmt(estimado)}). Em obras e serviços de engenharia, a Lei 14.133/2021 (art. 59, § 4º) presume inexequível abaixo de 75%; nos demais serviços, vale o critério do edital. Recomenda-se conferir o critério deste edital.`,
    };
  return {
    situacao: "dentro",
    texto: `Preço de ${fmt(preco)} é ${pct}% do valor estimado (${fmt(estimado)}).`,
  };
}
