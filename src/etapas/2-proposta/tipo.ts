// Tipo de contrato e de projeto (decisão 0034): entrada de todas as etapas a partir da 2. O código sugere pelo que a
// etapa 1 leu (parceria ou licitação; produtos com pagamento por entrega ou equipe paga por parcela ao longo da
// vigência) e o GP confirma. O tipo muda a estrutura do preço, o vocabulário e, nas etapas 4 e 5, a régua.
import type { AnaliseRfp } from "../1-rfp/analisar-rfp";
import type { Requisito } from "../../extracao/requisitos";
import { localizarTodos } from "../../extracao/rfp/localizar";
import { contar } from "../../texto/plural";

/** Chave de modalidade (decisão 0042): licitação, contratação direta ou parceria. */
export type TipoContrato = "licitacao" | "contratacao-direta" | "parceria";
export type TipoProjeto = "produtos" | "operacao" | "hibrido";

export const NOME_TIPO_CONTRATO: Record<TipoContrato, string> = {
  licitacao: "Licitação (contrato)",
  "contratacao-direta": "Contratação direta (inexigibilidade ou dispensa; contrato)",
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
  /**
   * O documento não diz a modalidade e o GP ainda não a escolheu na etapa 1 (decisão 0054): o contrato sugerido é
   * provisório e a proposta não segue sem a escolha.
   */
  modalidadeNaoIdentificada?: boolean;
}

/** Sinais de operação contínua: equipe que trabalha mês a mês com público ou território. */
const RE_OPERACAO =
  /\b(?:atendimentos? (?:mensa|continu)\w*|equipe de campo|agentes? (?:de campo|comunitari\w+)|visitas? domiciliar\w*|turmas?|grade horaria|oficinas? (?:semanais|mensais)|postos? de trabalho|acompanhamento (?:das|de) familias|beneficiarios? (?:diretos|atendidos)|valor mensal|parcelas? mensa\w+)\b/g;

export function sugerirTipo(
  analise: AnaliseRfp,
  requisitos: Requisito[],
  /** A modalidade que o GP escolheu na etapa 1, quando o documento não a diz (decisão 0054). */
  modalidadeDoGp?: TipoContrato,
): TipoSugerido {
  const parceria = analise.itens.some(
    (i) => i.id === "identificacao:parceria" && (i.situacao === "localizado" || i.situacao === "calculado"),
  );
  const modalidade = analise.itens.find(
    (i) => i.id === "identificacao:modalidade" && (i.situacao === "localizado" || i.situacao === "calculado"),
  );
  // sem modalidade no documento, vale a escolha do GP na etapa 1; sem ela, a modalidade fica não identificada
  const semModalidade = !parceria && !modalidade;
  const doGp = semModalidade ? modalidadeDoGp : undefined;
  if (doGp === "parceria" || doGp === "contratacao-direta") {
    const base = sugerirTipo(analise, requisitos);
    return {
      ...base,
      contrato: doGp,
      motivos: [`modalidade escolhida pelo GP na etapa 1 (o documento não diz)`, ...base.motivos.slice(1)],
    };
  }
  const direta = !parceria && /^(?:Inexigibilidade|Dispensa de licitação)$/.test(modalidade?.texto ?? "");
  const motivos: string[] = [];
  motivos.push(
    parceria
      ? "o edital é de parceria (Lei 13.019/2014)"
      : direta
        ? `o documento é de contratação direta (${modalidade?.texto ?? ""})`
        : "o edital é de licitação",
  );
  const produtos = requisitos.filter((r) => r.tipo === "produto").length;
  const porEntrega = analise.desembolso.parcelas.filter((p) =>
    /produto|entrega|relatorio/i.test(p.rotulo),
  ).length;
  const sinais = new Set(localizarTodos(analise.documentos, RE_OPERACAO).map((l) => l.termo));
  const operacao = sinais.size >= 2 || (parceria && !produtos);
  if (produtos)
    motivos.push(
      `${contar(produtos, "produto", "produtos")} com número R${porEntrega ? `, pagos por entrega (${porEntrega} parcelas)` : ""}`,
    );
  if (sinais.size >= 2 || (sinais.size && !produtos))
    motivos.push(`sinais de operação contínua: ${[...sinais].slice(0, 4).join(", ")}`);
  else if (parceria && !produtos)
    motivos.push("parceria sem produtos: a equipe trabalha ao longo da vigência");
  const projeto: TipoProjeto = produtos ? (operacao ? "hibrido" : "produtos") : "operacao";
  if (semModalidade)
    motivos[0] = doGp
      ? "modalidade escolhida pelo GP na etapa 1 (o documento não diz)"
      : "modalidade não identificada no documento — escolher na etapa 1 antes de seguir";
  return {
    contrato: parceria ? "parceria" : direta ? "contratacao-direta" : "licitacao",
    projeto,
    motivos,
    ...(semModalidade && !doGp ? { modalidadeNaoIdentificada: true } : {}),
  };
}
