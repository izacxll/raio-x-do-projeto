// Recomendação de participar ou não (decisão 0086): sugestão do PMO na leitura da RFP, com motivo, condições e os itens
// que a sustentam. O código confere como confere os outros textos do PMO:
// - os itens citados existem na leitura e o GP não os descartou;
// - número sem fonte no documento vira aviso ("valor não conferido");
// - redação sem marca condicional ou com afirmação vira "redação a conferir".
// A decisão continua só do GP (participacao.decisao), e a ferramenta nunca a preenche.
import type { AnaliseRfpDossie, DocumentoLido } from "../../dossie/esquema";
import { numerosSemFonte, sugestaoSemCondicional } from "../../pmo/redacao";
import type { RecomendacaoParticipacao } from "../../pmo/schemas/leitura-rfp";
import { estadoDoItem } from "./revisao";

export const NOME_RECOMENDACAO: Record<RecomendacaoParticipacao["sugestao"], string> = {
  participar: "participar",
  participar_com_condicoes: "participar com condições",
  nao_participar: "não participar",
  sem_base: "sem base no documento para recomendar",
};

export interface RecomendacaoConferida {
  recomendacao: RecomendacaoParticipacao;
  /** Nomes dos itens citados que estão na leitura e que o GP não descartou. */
  itens: string[];
  /** Ids citados que não estão na leitura: aviso, não fato. */
  semItem: string[];
  /** Ids citados que o GP descartou: saem do apoio. */
  descartados: string[];
  numerosSemFonte: string[];
  redacaoAConferir: boolean;
}

/**
 * A recomendação da leitura do PMO guardada, conferida; undefined sem leitura ou sem recomendação. Os documentos são os
 * da etapa 1 (onde os números do motivo e das condições são procurados).
 */
export function recomendacaoDoDossie(
  a: AnaliseRfpDossie | undefined,
  documentos: DocumentoLido[] = [],
): RecomendacaoConferida | undefined {
  const r = a?.leituraPmo?.resposta;
  if (!a || !r?.recomendacao) return undefined;
  const rec = r.recomendacao;
  const semPrefixo = (id: string) => id.replace(/^pmo:/, "");
  const porId = new Map(r.itens.map((i) => [i.id, i]));
  const citados = rec.itens.map(semPrefixo);
  const existentes = citados.filter((id) => porId.has(id));
  const descartados = existentes.filter((id) => estadoDoItem(a.revisoes, `pmo:${id}`) === "descartado");
  const texto = [rec.motivo, ...rec.condicoes].join(" ");
  return {
    recomendacao: rec,
    itens: existentes.filter((id) => !descartados.includes(id)).map((id) => porId.get(id)!.nome),
    semItem: citados.filter((id) => !porId.has(id)),
    descartados,
    numerosSemFonte: numerosSemFonte(texto, { fontes: [] }, documentos),
    redacaoAConferir: rec.sugestao !== "sem_base" && sugestaoSemCondicional(rec.motivo),
  };
}

/** A recomendação numa linha, sempre como sugestão do PMO, com os avisos do código. */
export function recomendacaoEmTexto(c: RecomendacaoConferida): string {
  const r = c.recomendacao;
  const avisos = [
    c.redacaoAConferir ? "redação a conferir" : "",
    c.numerosSemFonte.length ? `número sem fonte — conferir: ${c.numerosSemFonte.join(", ")}` : "",
    c.semItem.length ? `itens citados que não estão na leitura: ${c.semItem.join(", ")}` : "",
    c.descartados.length ? `itens descartados pelo GP fora do apoio: ${c.descartados.join(", ")}` : "",
  ].filter(Boolean);
  return [
    `Sugestão do PMO: ${NOME_RECOMENDACAO[r.sugestao]}.`,
    r.motivo.trim(),
    r.condicoes.length ? `Condições: ${r.condicoes.join("; ")}.` : "",
    c.itens.length ? `Pontos que a sustentam: ${c.itens.join("; ")}.` : "",
    avisos.length ? `(${avisos.join("; ")}.)` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
