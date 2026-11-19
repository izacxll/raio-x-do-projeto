// A leitura do PMO da etapa 5 no dossiê, como a tela a guarda (leitura-pmo.tsx). O import do teste externo usa esta
// mesma função: sem ela, o dossiê salvo pelo vigia ficava sem a leitura e o resultado da etapa 5 saía vazio.
import type { Dossie } from "../../dossie/esquema";
import { semRevisoesDoPmo } from "../../pmo/itens";

type Conferencia = NonNullable<Dossie["conferencia"]>;

/** O que a conferência precisa para começar, quando o dossiê ainda não tem uma (o mapa e a régua do plano). */
export type BaseDaConferencia = Pick<Conferencia, "caracteristicas" | "mapa" | "premissasAplicaveis">;

/**
 * O dossiê com a leitura nova: o plano fica ligado (pgpId), e as decisões do GP sobre a leitura anterior saem (a leitura
 * nova não as herda). Uma conferência que já existe mantém o mapa, as características e as premissas dela.
 */
export function comLeituraDaEtapa5(
  dossie: Dossie,
  base: BaseDaConferencia,
  pgpId: string,
  leitura: NonNullable<Conferencia["leituraPmo"]>,
): Dossie {
  const atual: Conferencia = dossie.conferencia ?? {
    ...base,
    requisitos: [],
    proximoRequisito: 1,
    decisoes: {},
  };
  return {
    ...dossie,
    conferencia: {
      ...atual,
      pgpId,
      decisoes: semRevisoesDoPmo(atual.decisoes ?? {}),
      executadaEm: leitura.em,
      leituraPmo: leitura,
    },
  };
}
