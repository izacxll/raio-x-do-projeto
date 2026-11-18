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
import type { PremissaRegistro } from "../../pmo/schemas/tap";
import { tirarAcentos } from "../../texto/normalizar";

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

/**
 * Linha do B3 do passo de riscos que repete o registro inicial (etapa 3). O passo de riscos só acrescenta o que nasce
 * das estimativas (B3.4); o que vem da RFP, da proposta ou do TAP já está no registro inicial quando ele existe: sai a
 * linha com a mesma premissa crítica ou com a mesma origem e o mesmo tipo (restrição da RFP, premissa da proposta).
 * Ficam as premissas de estimativa.
 */
export function repeteORegistroInicial(x: PremissaRegistro, registroInicial: PremissaRegistro[]): boolean {
  if (x.origem === "estimativa" || !registroInicial.length) return false;
  return registroInicial.some(
    (r) =>
      (!!x.premissaCritica && r.premissaCritica === x.premissaCritica) ||
      (r.origem === x.origem && r.tipo === x.tipo),
  );
}

const PALAVRAS_VAZIAS = new Set(
  "para pelo pela pelos pelas como mais sobre entre desde cada todo toda todos todas este esta isso essa esse quando onde qual quais seja sejam pode podem deve devem sera serao antes depois ainda tambem outro outra outros outras mesmo mesma sem nos nas dos das com uma uns umas que nao sugere registrar".split(
    " ",
  ),
);

/** Radicais (5 primeiras letras) das palavras de 4 letras ou mais, sem acento e sem as palavras vazias. */
function radicais(texto: string): Set<string> {
  return new Set(
    tirarAcentos(texto)
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !PALAVRAS_VAZIAS.has(w))
      .map((w) => w.slice(0, 5)),
  );
}

/**
 * Premissa nova do passo de riscos que parece reescrever uma do registro inicial com outras palavras (lição 154 da
 * rodada 3): a mesma premissa crítica (ou nenhuma nas duas) e metade ou mais das palavras-chave em comum (5 no
 * mínimo). É aviso, não erro: o código compara palavras, o PMO e o GP conferem o sentido. Calibrado nos dois casos do
 * teste externo (1 aviso em 2 registros finais). Devolve a linha do registro inicial parecida e a parcela em comum.
 */
export function pareceRepetirORegistroInicial(
  x: PremissaRegistro,
  registroInicial: PremissaRegistro[],
): { linha: PremissaRegistro; parcela: number } | undefined {
  if (repeteORegistroInicial(x, registroInicial)) return undefined;
  const a = radicais(x.item.texto);
  let melhor: { linha: PremissaRegistro; parcela: number } | undefined;
  for (const r of registroInicial) {
    if ((x.premissaCritica || "") !== (r.premissaCritica || "")) continue;
    const b = radicais(r.item.texto);
    const comuns = [...a].filter((w) => b.has(w)).length;
    const parcela = comuns / Math.max(1, Math.min(a.size, b.size));
    if (comuns >= 5 && parcela >= 0.5 && (!melhor || parcela > melhor.parcela))
      melhor = { linha: r, parcela };
  }
  return melhor;
}

export function itensDoPgp(
  p: PgpDossie,
  docs: DocumentoLido[],
  registroInicial: PremissaRegistro[] = [],
): ItemConferido[] {
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
      p.riscos.resposta.premissas.forEach((x, k) => {
        if (repeteORegistroInicial(x, registroInicial)) return;
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
        });
      });
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
