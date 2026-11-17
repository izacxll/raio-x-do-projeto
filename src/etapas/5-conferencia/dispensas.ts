// Partes dispensadas que entram no mapa da etapa 5 antes de o GP confirmar: as que o GP dispensou na etapa 4 (no
// dossiê) e as que o próprio plano declara na lista "Partes dispensadas pelo GP". A especificação pede que a etapa 5
// não aponte como ausente o que o GP dispensou. O app e o script de teste usam a mesma função.
import type { PaginaLida, PgpDossie } from "../../dossie/esquema";
import type { Ficha } from "../../dominio/fichas";
import {
  aplicarDispensas,
  confirmacaoInicial,
  dispensasDeclaradasNoPlano,
  type ParteConfirmada,
  type ParteNoMapa,
} from "../../regras/mapa-pgp";

/** Partes dispensadas pelo GP na etapa 4, com a justificativa da adaptação. Código → justificativa. */
export function dispensasDaEtapa4(pgp: PgpDossie | undefined): Map<string, string> {
  if (!pgp) return new Map();
  const justificativas = new Map(
    (pgp.adaptacao?.resposta.partes ?? []).map((s) => [s.codigo, s.justificativa]),
  );
  return new Map(
    Object.entries(pgp.gerar)
      .filter(([, gerar]) => gerar === false)
      .map(([codigo]) => [
        codigo,
        `Dispensada pelo GP na etapa 4: ${justificativas.get(codigo) ?? ""}`.trim(),
      ]),
  );
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
      `Declarada dispensada pelo GP no próprio plano: ${j}`.trim(),
    ]),
  );
  return aplicarDispensas(confirmacaoInicial(proposta), new Map([...declaradas, ...dispensasDaEtapa4(pgp)]));
}
