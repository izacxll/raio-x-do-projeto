// Os diagramas do plano a partir do dossiê da etapa 4: EAP (passo do escopo) e rede (passo do cronograma).
import type { Dossie } from "../dossie/esquema";
import { cronogramaDoPgp } from "../etapas/4-pgp/calculos";
import { montarEntradaPgp } from "../etapas/4-pgp/entrada";
import { svgDaEap, svgDaRede } from "./diagramas";

export function svgsDoPgp(dossie: Dossie): { eap?: string; rede?: string } {
  const p = dossie.pgp;
  if (!p) return {};
  const e = montarEntradaPgp(dossie);
  const crono = cronogramaDoPgp(p, e);
  return {
    eap: p.escopo ? svgDaEap(dossie.projeto.nome, p.escopo.resposta.eap) : undefined,
    rede: crono && p.cronograma ? svgDaRede(crono, p.cronograma.resposta.atividades) : undefined,
  };
}
