// Etapa 4 (código): o que sai de conta, nunca do modelo. Cronograma (rede, caminho crítico, datas), marcos com a
// conferência contra a RFP e o TAP, custos com os valores do GP (linha de base com a contingência, orçamento com a
// reserva gerencial) e a matriz de rastreabilidade RFP → TAP → PGP.
import type { ParametrosPgp, PgpDossie } from "../../dossie/esquema";
import { formatarData, somarDiasUteis } from "../../texto/datas";
import { calcularCronograma, primeiroDiaUtil, type Cronograma } from "../2-proposta/cronograma";
import { calcularPreco, lerValorEmReais, type Preco } from "../2-proposta/preco";
import { diasDoTexto } from "../3-tap/divergencias";
import type { EntradaPgp } from "./entrada";

export function inicioDe(par: ParametrosPgp): Date | undefined {
  return par.inicio ? new Date(`${par.inicio}T00:00:00`) : undefined;
}

export function cronogramaDoPgp(p: PgpDossie, e: EntradaPgp): Cronograma | undefined {
  const c = p.cronograma?.resposta;
  if (!c) return undefined;
  return calcularCronograma(c.atividades, {
    aprovacaoDias: p.parametros.aprovacaoDias,
    inicio: inicioDe(p.parametros),
    prazoRfp: e.ponto.prazoExecucao,
  });
}

export interface MarcoCalculado {
  produto: string;
  /** Entrega em dias úteis (sem a aprovação) e aprovação (com o tempo do GP). */
  entrega: number;
  aprovacao: number;
  dataEntrega?: Date;
  dataAprovacao?: Date;
  /** Prazo do marco no TAP, quando houver ("até 30 dias após a assinatura"). */
  prazoTap?: string;
  situacao: "cabe" | "nao-cabe" | "nao-conferido";
  texto: string;
}

/**
 * Lista de marcos (B11): a entrega e a aprovação de cada produto, a partir do cronograma. A conferência é contra o
 * prazo do marco no TAP (contado em dias corridos da assinatura, a leitura mais apertada quando a contagem não é dita).
 */
export function marcosDoPgp(p: PgpDossie, e: EntradaPgp, crono: Cronograma): MarcoCalculado[] {
  const inicio = inicioDe(p.parametros);
  const produtos = [...new Set(crono.atividades.map((a) => a.produto))];
  return produtos.map((produto) => {
    const doProduto = crono.atividades.filter((a) => a.produto === produto);
    const entrega = Math.max(...doProduto.map((a) => a.fimMaisCedo - a.aprovacao));
    const aprovacao = Math.max(...doProduto.map((a) => a.fimMaisCedo));
    const data = (d: number) =>
      inicio && d > 0 ? somarDiasUteis(primeiroDiaUtil(inicio), d - 1) : undefined;
    const marcoTap = e.marcosTap.find((m) => m.produto === produto);
    const dias = marcoTap ? diasDoTexto(marcoTap.prazo) : undefined;
    const base = {
      produto,
      entrega,
      aprovacao,
      dataEntrega: data(entrega),
      dataAprovacao: data(aprovacao),
      prazoTap: marcoTap?.prazo,
    };
    if (dias === undefined)
      return {
        ...base,
        situacao: "nao-conferido" as const,
        texto: marcoTap
          ? "Prazo do marco no TAP sem número de dias: conferir."
          : "Sem marco do TAP para este produto.",
      };
    // dias úteis → corridos: com o início do GP, pela data; sem ele, aproximação de 5 dias úteis por semana
    const dataEntrega = base.dataEntrega;
    const corridos =
      inicio && dataEntrega
        ? Math.round((dataEntrega.getTime() - primeiroDiaUtil(inicio).getTime()) / 86_400_000) + 1
        : Math.ceil((entrega * 7) / 5);
    const conta = inicio ? `${corridos} dias corridos` : `cerca de ${corridos} dias corridos (aproximação)`;
    return {
      ...base,
      situacao: corridos <= dias ? ("cabe" as const) : ("nao-cabe" as const),
      texto: `Entrega em ${conta}; marco do TAP: ${marcoTap!.prazo}.`,
    };
  });
}

export interface CustosPgp {
  preco: Preco;
  /** Linha de base dos custos: pessoal + contingência (A15). */
  linhaDeBase?: number;
  /** Orçamento: linha de base + reserva gerencial (fora da linha de base). */
  orcamento?: number;
  faltando: string[];
  /** Conferência do orçamento com os recursos do TAP ou o preço da proposta. */
  conferencia: string;
}

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function custosDoPgp(p: PgpDossie, e: EntradaPgp): CustosPgp | undefined {
  const c = p.cronograma?.resposta;
  if (!c) return undefined;
  const par = p.parametros;
  // no plano entram só as horas da equipe e as reservas: tributos e custos indiretos ficam no preço (etapa 2)
  const preco = calcularPreco(c.perfis, c.horas, {
    valoresHora: par.valoresHora,
    despesas: [],
    indiretosPct: 0,
    tributosPct: 0,
    reserva: 0,
  });
  const faltando = [...preco.faltando];
  if (par.contingencia === undefined) faltando.push("reserva de contingência (decisão do GP)");
  if (par.gerencial === undefined) faltando.push("reserva gerencial (decisão do GP)");
  const linhaDeBase =
    preco.pessoal !== undefined && par.contingencia !== undefined
      ? preco.pessoal + par.contingencia
      : undefined;
  const orcamento =
    linhaDeBase !== undefined && par.gerencial !== undefined ? linhaDeBase + par.gerencial : undefined;
  const referencia = (e.recursosTap && lerValorEmReais(e.recursosTap)) || e.dadosProposta?.valor;
  const deOnde =
    e.recursosTap && lerValorEmReais(e.recursosTap) ? "recursos do TAP" : "preço final da proposta";
  const conferencia =
    orcamento === undefined
      ? "Orçamento a definir pelo GP (valores-hora e reservas)."
      : !referencia
        ? "Sem valor do TAP ou da proposta para comparar."
        : orcamento > referencia
          ? `O orçamento (${reais(orcamento)}) passa do ${deOnde} (${reais(referencia)}): conferir. Tributos e custos indiretos não entram nesta conta.`
          : `O orçamento (${reais(orcamento)}) cabe no ${deOnde} (${reais(referencia)}). Tributos e custos indiretos não entram nesta conta.`;
  return { preco, linhaDeBase, orcamento, faltando, conferencia };
}

export interface LinhaRastreabilidade {
  requisito: string;
  descricao: string;
  /** Onde aparece no TAP (requisitos de alto nível), na EAP (pacotes) e no cronograma (atividades). */
  tap: string[];
  eap: string[];
  atividades: string[];
  situacao: "rastreado" | "sem-eap" | "sem-atividade";
}

/** Matriz de rastreabilidade (B23): cada requisito da RFP até o TAP, a EAP e o cronograma. */
export function rastrear(p: PgpDossie, e: EntradaPgp): LinhaRastreabilidade[] {
  const eap = p.escopo?.resposta.eap ?? [];
  const atividades = p.cronograma?.resposta.atividades ?? [];
  return e.ponto.requisitos.map((r) => {
    const tap = e.requisitosTap.filter((t) => t.requisitos.includes(r.numero)).map((t) => t.texto);
    const pacotes = eap.filter((x) => x.requisitos.includes(r.numero)).map((x) => `${x.id} ${x.nome}`);
    const ativ = atividades.filter((a) => a.requisitos.includes(r.numero)).map((a) => `${a.id} ${a.nome}`);
    return {
      requisito: r.numero,
      descricao: `${r.rotulo}: ${r.descricao}`,
      tap,
      eap: pacotes,
      atividades: ativ,
      situacao: !pacotes.length ? "sem-eap" : !ativ.length ? "sem-atividade" : "rastreado",
    };
  });
}

export function textoDaData(d?: Date): string {
  return d ? formatarData(d) : "—";
}
