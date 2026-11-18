// Recomendação de participar ou não (decisão 0086): sugestão do PMO na leitura da RFP, com motivo, condições e os itens
// que a sustentam. O código confere se os itens citados existem na leitura; o que não existe sai como aviso. A decisão
// continua só do GP (participacao.decisao), e a ferramenta nunca a preenche.
import type { AnaliseRfpDossie } from "../../dossie/esquema";
import type { RecomendacaoParticipacao } from "../../pmo/schemas/leitura-rfp";

export const NOME_RECOMENDACAO: Record<RecomendacaoParticipacao["sugestao"], string> = {
  participar: "participar",
  participar_com_condicoes: "participar com condições",
  nao_participar: "não participar",
  sem_base: "sem base no documento para recomendar",
};

export interface RecomendacaoConferida {
  recomendacao: RecomendacaoParticipacao;
  /** Itens citados que estão na leitura do PMO. */
  itens: string[];
  /** Itens citados que não estão na leitura: aviso, não fato. */
  semItem: string[];
}

/** A recomendação da leitura do PMO guardada, com os itens conferidos; undefined sem leitura ou sem recomendação. */
export function recomendacaoDoDossie(a?: AnaliseRfpDossie): RecomendacaoConferida | undefined {
  const r = a?.leituraPmo?.resposta;
  if (!r?.recomendacao) return undefined;
  const ids = new Set(r.itens.map((i) => i.id));
  const semPrefixo = (id: string) => id.replace(/^pmo:/, "");
  return {
    recomendacao: r.recomendacao,
    itens: r.recomendacao.itens.filter((id) => ids.has(semPrefixo(id))),
    semItem: r.recomendacao.itens.filter((id) => !ids.has(semPrefixo(id))),
  };
}

/** A recomendação numa linha, sempre como sugestão do PMO. */
export function recomendacaoEmTexto(c: RecomendacaoConferida): string {
  const r = c.recomendacao;
  return [
    `Sugestão do PMO: ${NOME_RECOMENDACAO[r.sugestao]}.`,
    r.motivo.trim(),
    r.condicoes.length ? `Condições: ${r.condicoes.join("; ")}.` : "",
    c.itens.length ? `(Pontos: ${c.itens.join(", ")}.)` : "",
    c.semItem.length ? `(Itens citados que não estão na leitura: ${c.semItem.join(", ")}; conferir.)` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
