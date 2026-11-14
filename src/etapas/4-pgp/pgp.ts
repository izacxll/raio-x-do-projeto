// Etapa 4: os itens que o PMO devolveu (texto das partes, riscos, premissas, observações), achatados com um id
// estável, cada um com a conferência do código. O que gerar (adaptação) e as pendências do GP.
import { MODELO_PADRAO } from "../../config/modelo";
import type { DocumentoLido, PgpDossie } from "../../dossie/esquema";
import { buscarParte } from "../../dominio/skill";
import { contarPendentes, type ItemConferido } from "../../pmo/itens";
import { conferirItem } from "../../pmo/redacao";
import type { ItemPmo } from "../../pmo/schemas/comum";
import type { ParteGerada, PassoPgp, RespostaAdaptacao } from "../../pmo/schemas/pgp";
import { PASSOS_PGP } from "./passos";

export function pgpInicial(modelo: string = MODELO_PADRAO): PgpDossie {
  return { modelo, gerar: {}, revisoes: {}, parametros: { valoresHora: {}, nomes: {} }, uso: [] };
}

export function nomeDaParte(codigo: string): string {
  return buscarParte(codigo)?.nome ?? codigo;
}

export function grupoDaParte(codigo: string): string {
  return `${codigo} — ${nomeDaParte(codigo)}`;
}

/** O que gerar, sugerido pela adaptação do PMO: essencial e recomendado entram; dispensável fica de fora. */
export function gerarSugerido(a: RespostaAdaptacao): Record<string, boolean> {
  return Object.fromEntries(a.partes.map((p) => [p.codigo, p.recomendacao !== "dispensavel"]));
}

/** Partes que o GP marcou para gerar. Sem a adaptação, nenhuma. */
export function partesAGerar(p: PgpDossie): string[] {
  return Object.entries(p.gerar)
    .filter(([, v]) => v)
    .map(([k]) => k);
}

function itensDosTextos(
  passo: PassoPgp,
  textos: ParteGerada[],
  docs: DocumentoLido[],
  out: ItemConferido[],
): void {
  for (const parte of textos)
    parte.itens.forEach((item, k) =>
      out.push({
        id: `${passo}:${parte.codigo}:${k}`,
        passo,
        grupo: grupoDaParte(parte.codigo),
        item,
        conferencia: conferirItem(item, docs),
      }),
    );
}

function itensDasObservacoes(passo: PassoPgp, obs: ItemPmo[], docs: DocumentoLido[], out: ItemConferido[]) {
  obs.forEach((item, k) =>
    out.push({
      id: `${passo}:observacoes:${k}`,
      passo,
      grupo: "Observações do PMO",
      item,
      conferencia: conferirItem(item, docs),
    }),
  );
}

const NOME_PROB = { baixa: "baixa", media: "média", alta: "alta" } as const;
const NOME_IMPACTO = { baixo: "baixo", medio: "médio", alto: "alto" } as const;

export function itensDoPgp(p: PgpDossie, docs: DocumentoLido[]): ItemConferido[] {
  const out: ItemConferido[] = [];
  for (const { passo } of PASSOS_PGP) {
    const r = p[passo]?.resposta;
    if (!r) continue;
    itensDosTextos(passo, r.textos, docs, out);
    if (passo === "riscos" && p.riscos) {
      p.riscos.resposta.riscos.forEach((x, k) =>
        out.push({
          id: `riscos:B27:${k}`,
          passo,
          grupo: grupoDaParte("B27"),
          item: x.item,
          complemento: [
            `${x.id} · ${x.categoria} · probabilidade ${NOME_PROB[x.probabilidade]}, impacto ${NOME_IMPACTO[x.impacto]}.`,
            x.premissaCritica ? `Premissa crítica ${x.premissaCritica}.` : "",
            `Resposta (${x.estrategia}): ${x.resposta || "a definir pelo GP"}.`,
            `Gatilho: ${x.gatilho || "a definir pelo GP"}.`,
            `Responsável: ${x.responsavel || "a definir pelo GP"}.`,
            x.pedeReserva ? "Pede reserva de contingência (valor do GP)." : "",
          ]
            .filter(Boolean)
            .join(" "),
          conferencia: conferirItem(x.item, docs),
        }),
      );
      p.riscos.resposta.premissas.forEach((x, k) =>
        out.push({
          id: `riscos:B3:${k}`,
          passo,
          grupo: grupoDaParte("B3"),
          item: x.item,
          complemento: [
            x.tipo === "restricao" ? "Restrição." : "Premissa.",
            x.premissaCritica ? `Premissa crítica ${x.premissaCritica}.` : "",
            x.consequencia ? `Se não se confirmar: ${x.consequencia}` : "",
            `Depende de: ${x.dependeDe || "a definir pelo GP"}.`,
          ]
            .filter(Boolean)
            .join(" "),
          conferencia: conferirItem(x.item, docs),
        }),
      );
    }
    itensDasObservacoes(passo, r.observacoes, docs, out);
  }
  return out;
}

/** Pendências que mantêm o cabeçalho de minuta: itens sem revisão do GP. */
export function contarPendentesPgp(p: PgpDossie, itens: ItemConferido[]): number {
  return contarPendentes(p.revisoes, itens);
}

/** Passo anterior que precisa estar feito para o passo pedir ao PMO. */
export function passoAnterior(passo: PassoPgp): PassoPgp | undefined {
  const k = PASSOS_PGP.findIndex((x) => x.passo === passo);
  return k > 0 ? PASSOS_PGP[k - 1]?.passo : undefined;
}
