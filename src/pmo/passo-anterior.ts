// Versão final do passo anterior no pedido da segunda instância (decisão 0068). O pedido de um passo leva só parte do
// anterior (no registro de premissas, só os limites e o risco geral do TAP). Para conferir a coerência, o revisor ia
// buscar o anterior em outro arquivo e achava uma versão velha (a da última conferência, antes do "seguir" do GP). Com
// a versão guardada no dossiê (a que seguiu) no pedido, ele não precisa procurar.
import type { Dossie } from "../dossie/esquema";
import { PASSOS_PGP } from "../etapas/4-pgp/passos";

/** Os passos das etapas 2 a 4, na ordem do app (as etapas 1 e 5 têm um passo só). */
const PASSOS: Record<number, readonly string[]> = {
  2: ["estrategia", "conteudo", "eap"],
  3: ["tap", "premissas"],
  4: PASSOS_PGP.map((x) => x.passo),
};

export interface PassoAnterior {
  passo: string;
  resposta: unknown;
  em: string;
}

/** A resposta guardada no dossiê para o passo (a última importada ou recebida, a que vale). */
export function respostaGuardada(d: Dossie, etapa: number, passo: string): PassoAnterior | undefined {
  const g =
    etapa === 2
      ? d.proposta?.[passo as "estrategia" | "conteudo" | "eap"]
      : etapa === 3
        ? d.tap?.[passo as "tap" | "premissas"]
        : etapa === 4
          ? d.pgp?.[passo as (typeof PASSOS_PGP)[number]["passo"]]
          : undefined;
  return g ? { passo, resposta: g.resposta, em: g.em } : undefined;
}

/** O passo anterior da mesma etapa, como está no dossiê; undefined no primeiro passo ou sem resposta guardada. */
export function passoAnteriorFinal(d: Dossie, etapa: number, passo: string): PassoAnterior | undefined {
  const passos = PASSOS[etapa] ?? [];
  const k = passos.indexOf(passo);
  const anterior = k > 0 ? passos[k - 1] : undefined;
  return anterior ? respostaGuardada(d, etapa, anterior) : undefined;
}

/** O bloco do pedido: a resposta do passo anterior em JSON compacto, com o aviso de que é a que vale. */
export function passoAnteriorEmTexto(a: PassoAnterior): string {
  return `## Versão final do passo anterior (${a.passo}), a que seguiu
É esta que vale para conferir a coerência com o passo anterior. Versões anteriores, conferências antigas e outros arquivos não valem: não os procure.
\`\`\`json
${JSON.stringify(a.resposta)}
\`\`\``;
}
