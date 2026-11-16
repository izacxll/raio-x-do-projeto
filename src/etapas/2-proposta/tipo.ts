// Tipo de contrato e de projeto (decisão 0034): entrada de todas as etapas a partir da 2. O código sugere pelo que a
// etapa 1 leu (parceria ou licitação; produtos com pagamento por entrega ou equipe paga por parcela ao longo da
// vigência) e o GP confirma. O tipo muda a estrutura do preço, o vocabulário e, nas etapas 4 e 5, a régua.
import type { AnaliseRfp } from "../1-rfp/analisar-rfp";
import type { Requisito } from "../../extracao/requisitos";
import { localizarTodos } from "../../extracao/rfp/localizar";

export type TipoContrato = "licitacao" | "parceria";
export type TipoProjeto = "produtos" | "operacao" | "hibrido";

export const NOME_TIPO_CONTRATO: Record<TipoContrato, string> = {
  licitacao: "Licitação (contrato)",
  parceria: "Parceria (termo de fomento, de colaboração ou acordo)",
};
export const NOME_TIPO_PROJETO: Record<TipoProjeto, string> = {
  produtos: "Consultoria por produtos",
  operacao: "Operação contínua (equipe ao longo da vigência, paga por parcela ou posto)",
  hibrido: "Híbrido (produtos e operação contínua)",
};

export interface TipoSugerido {
  contrato: TipoContrato;
  projeto: TipoProjeto;
  motivos: string[];
}

/** Sinais de operação contínua: equipe que trabalha mês a mês com público ou território. */
const RE_OPERACAO =
  /\b(?:atendimentos? (?:mensa|continu)\w*|equipe de campo|agentes? (?:de campo|comunitari\w+)|visitas? domiciliar\w*|turmas?|grade horaria|oficinas? (?:semanais|mensais)|postos? de trabalho|acompanhamento (?:das|de) familias|beneficiarios? (?:diretos|atendidos)|valor mensal|parcelas? mensa\w+)\b/g;

export function sugerirTipo(analise: AnaliseRfp, requisitos: Requisito[]): TipoSugerido {
  const parceria = analise.itens.some(
    (i) => i.id === "identificacao:parceria" && (i.situacao === "localizado" || i.situacao === "calculado"),
  );
  const motivos: string[] = [];
  motivos.push(parceria ? "o edital é de parceria (Lei 13.019/2014)" : "o edital é de licitação");
  const produtos = requisitos.filter((r) => r.tipo === "produto").length;
  const porEntrega = analise.desembolso.parcelas.filter((p) =>
    /produto|entrega|relatorio/i.test(p.rotulo),
  ).length;
  const sinais = new Set(localizarTodos(analise.documentos, RE_OPERACAO).map((l) => l.termo));
  const operacao = sinais.size >= 2 || (parceria && !produtos);
  if (produtos)
    motivos.push(
      `${produtos} produto(s) com número R${porEntrega ? `, pagos por entrega (${porEntrega} parcelas)` : ""}`,
    );
  if (sinais.size >= 2 || (sinais.size && !produtos))
    motivos.push(`sinais de operação contínua: ${[...sinais].slice(0, 4).join(", ")}`);
  else if (parceria && !produtos)
    motivos.push("parceria sem produtos: a equipe trabalha ao longo da vigência");
  const projeto: TipoProjeto = produtos ? (operacao ? "hibrido" : "produtos") : "operacao";
  return { contrato: parceria ? "parceria" : "licitacao", projeto, motivos };
}
