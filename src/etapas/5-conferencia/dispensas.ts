// Partes dispensadas que entram no mapa da etapa 5 antes de o GP confirmar: as que o GP dispensou na etapa 4 (no
// dossiê) e as que o próprio plano declara na lista "Partes dispensadas pelo GP". A especificação pede que a etapa 5
// não aponte como ausente o que o GP dispensou. O app e o script de teste usam a mesma função.
// A dispensa da etapa 4 vale direto. A que só o plano declara é candidata (decisão 0052): o PMO diz se ela cabe pelas
// condições da ficha; se não couber, a parte volta a ser conferida.
import type { PaginaLida, PgpDossie } from "../../dossie/esquema";
import type { Ficha } from "../../dominio/fichas";
import { destinoDaParte } from "../4-pgp/porte";
import {
  aplicarDispensas,
  confirmacaoInicial,
  dispensasDeclaradasNoPlano,
  type ParteConfirmada,
  type ParteNoMapa,
} from "../../regras/mapa-pgp";

/**
 * Partes que não são parte própria do plano da etapa 4, com o motivo: a dispensada, com a justificativa; a fundida
 * (decisão 0091), com a parte onde o conteúdo dela está. Código → justificativa.
 */
export function dispensasDaEtapa4(pgp: PgpDossie | undefined): Map<string, string> {
  if (!pgp) return new Map();
  return new Map(
    Object.entries(pgp.gerar)
      .filter(([, gerar]) => gerar === false)
      .map(([codigo]) => [codigo, justificativaDaEtapa4(codigo, pgp)]),
  );
}

/** "Fundida na etapa 4 em A13 (…)" ou "Dispensada pelo GP na etapa 4: motivo". */
export function justificativaDaEtapa4(codigo: string, pgp: PgpDossie): string {
  const d = destinoDaParte(codigo, pgp);
  return d.tipo === "fundida"
    ? `Fundida na etapa 4 em ${d.em} (decisão 0091): o conteúdo dela está na parte ${d.em}.`
    : `Dispensada pelo GP na etapa 4: ${d.tipo === "dispensada" ? d.motivo : ""}`.trim();
}

export const PREFIXO_DISPENSA_DO_PLANO = "Declarada dispensada pelo GP no próprio plano:";

/** A dispensa veio só da lista do plano (sem a etapa 4 do app) e o GP não mexeu nela: é candidata. */
export function ehDispensaCandidata(p: ParteConfirmada): boolean {
  return (
    p.situacao === "dispensada" &&
    !p.confirmadaPeloGp &&
    (p.justificativa ?? "").startsWith(PREFIXO_DISPENSA_DO_PLANO)
  );
}

export function dispensasCandidatas(mapa: ParteConfirmada[]): ParteConfirmada[] {
  return mapa.filter(ehDispensaCandidata);
}

/** O mapa com as partes indicadas de volta à proposta do código (a dispensa candidata que não coube). */
export function mapaComDispensasDevolvidas(
  mapa: ParteConfirmada[],
  proposta: ParteNoMapa[],
  partes: Set<string>,
): ParteConfirmada[] {
  const inicial = new Map(confirmacaoInicial(proposta).map((p) => [p.codigo, p]));
  return mapa.map((p) => (partes.has(p.codigo) ? (inicial.get(p.codigo) ?? p) : p));
}

/** Mapa inicial da etapa 5: a proposta do código com as dispensas (a da etapa 4 vale sobre a declarada no plano). */
export function mapaInicialDaConferencia(
  proposta: ParteNoMapa[],
  paginas: PaginaLida[],
  partes: Ficha[],
  pgp?: PgpDossie,
): ParteConfirmada[] {
  const declaradas = new Map(
    [...dispensasDeclaradasNoPlano(paginas, partes)].map(([c, j]) => [
      c,
      `${PREFIXO_DISPENSA_DO_PLANO} ${j}`.trim(),
    ]),
  );
  return aplicarDispensas(confirmacaoInicial(proposta), new Map([...declaradas, ...dispensasDaEtapa4(pgp)]));
}
