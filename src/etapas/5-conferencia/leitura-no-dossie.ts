// A leitura do PMO da etapa 5 no dossiê. A tela (leitura-pmo.tsx) e o import do teste externo gravam a leitura pelos
// mesmos campos (camposDaLeituraNova); o import usa comLeituraDaEtapa5, que também liga o plano. Sem isso, o dossiê
// salvo pelo vigia ficava sem a leitura, e o resultado da etapa 5 saía vazio (decisão 0090).
import type { Dossie } from "../../dossie/esquema";
import { semRevisoesDoPmo } from "../../pmo/itens";
import { sincronizarMapa, type ParteNoMapa } from "../../regras/mapa-pgp";

type Conferencia = NonNullable<Dossie["conferencia"]>;
type Leitura = NonNullable<Conferencia["leituraPmo"]>;

/** O que a conferência precisa para começar, quando o dossiê ainda não tem uma (o mapa e a régua do plano). */
export type BaseDaConferencia = Pick<Conferencia, "caracteristicas" | "mapa" | "premissasAplicaveis">;

/**
 * Os campos que uma leitura nova muda, na tela e no import: a leitura, quando foi feita e as decisões do GP sem as
 * que eram sobre a leitura anterior (as sobre os achados do código ficam).
 */
export function camposDaLeituraNova(
  conf: Pick<Conferencia, "decisoes"> | undefined,
  leitura: Leitura,
): Pick<Conferencia, "decisoes" | "leituraPmo" | "executadaEm"> {
  return { decisoes: semRevisoesDoPmo(conf?.decisoes ?? {}), leituraPmo: leitura, executadaEm: leitura.em };
}

/**
 * O dossiê com a leitura nova e o plano ligado (pgpId). Sem conferência, ela começa da base. Com a conferência de outro
 * plano, o mesmo que a tela faz ao trocar de plano (conferencia.tsx): o mapa é sincronizado com a proposta do código
 * para o plano novo (as partes que o GP dispensou ficam dispensadas) e as decisões saem.
 */
export function comLeituraDaEtapa5(
  dossie: Dossie,
  base: BaseDaConferencia,
  pgpId: string,
  leitura: Leitura,
  /** A proposta do código para o mapa do plano novo (proporMapa); usada só quando o plano mudou. */
  proposta: ParteNoMapa[] = [],
): Dossie {
  const anterior = dossie.conferencia;
  const atual: Conferencia = !anterior
    ? { ...base, requisitos: [], proximoRequisito: 1, decisoes: {} }
    : anterior.pgpId && anterior.pgpId !== pgpId
      ? { ...anterior, mapa: sincronizarMapa(anterior.mapa, proposta), decisoes: {} }
      : anterior;
  return { ...dossie, conferencia: { ...atual, pgpId, ...camposDaLeituraNova(atual, leitura) } };
}
