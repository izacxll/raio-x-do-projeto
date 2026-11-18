// Régua corrigida num passo da etapa 4 que não chegou às partes geradas antes (decisão 0078; lição 204 da rodada 3):
// a mesma duração ("8 meses") chamada de "teto" num passo e de "referência" num passo seguinte. No teste, o
// cronograma corrigiu os 8 meses para "só referência", e a adaptação (A17) continuou dizendo "teto"; só a etapa 5
// pegou. É aviso: o código compara palavras, e quem decide qual vale é o GP.
import type { PgpDossie } from "../../dossie/esquema";
import type { PassoPgp } from "../../pmo/schemas/pgp";
import { tirarAcentos } from "../../texto/normalizar";
import { PASSOS_PGP } from "./passos";

export type ClasseDaRegua = "teto" | "referencia";

export interface MencaoDeRegua {
  /** "8 meses", "120 dias corridos". */
  quantidade: string;
  classe: ClasseDaRegua;
  passo: PassoPgp;
  /** A parte ou o item onde está (o código da parte, quando a resposta o traz). */
  onde: string;
  trecho: string;
}

export interface ReguaQueMudou {
  quantidade: string;
  /** A menção do passo mais antigo, que ficou com a classe velha. */
  antes: MencaoDeRegua;
  /** A menção do passo mais novo, com a classe corrigida. */
  depois: MencaoDeRegua;
}

const QUANTIDADE = /\b(\d+(?:[.,]\d+)?)\s*(meses|mes|dias uteis|dias corridos|dias|semanas|anos)\b/g;
const TETO =
  /\bteto\b|\blimite\b|\bprazo maximo\b|\bno maximo\b|\bnao pode passar\b|\bnao pode ultrapassar\b/;
const REFERENCIA = /\breferencia\b|\bnao (?:e|sao|serve como) teto\b|\bindicativ\w*\b/;

/** As menções de duração com qualificador ("teto" ou "referência") na mesma oração. */
export function mencoesDeRegua(texto: string, passo: PassoPgp, onde: string): MencaoDeRegua[] {
  const out: MencaoDeRegua[] = [];
  for (const oracao of texto.split(/(?<=[.;])\s+/)) {
    const t = tirarAcentos(oracao).toLowerCase();
    const referencia = REFERENCIA.test(t);
    const teto = TETO.test(t) && !/\bnao (?:e|sao|serve como) teto\b/.test(t);
    // as duas palavras na mesma oração: ambígua, não conta
    if (referencia === teto) continue;
    for (const m of t.matchAll(QUANTIDADE))
      out.push({
        quantidade: `${m[1]} ${m[2] === "mes" ? "meses" : m[2]}`,
        classe: referencia ? "referencia" : "teto",
        passo,
        onde,
        trecho: oracao.trim().slice(0, 200),
      });
  }
  return out;
}

/** Todas as menções nas respostas dos passos da etapa 4, com o código da parte mais próxima. */
function mencoesDoPgp(p: PgpDossie): MencaoDeRegua[] {
  const out: MencaoDeRegua[] = [];
  for (const { passo } of PASSOS_PGP) {
    const r = p[passo]?.resposta;
    if (!r) continue;
    const andar = (x: unknown, onde: string): void => {
      if (typeof x === "string") out.push(...mencoesDeRegua(x, passo, onde));
      else if (Array.isArray(x)) x.forEach((y) => andar(y, onde));
      else if (x && typeof x === "object") {
        const o = x as Record<string, unknown>;
        const aqui =
          typeof o.codigo === "string"
            ? o.codigo
            : typeof o.id === "string"
              ? `${onde} ${o.id}`.trim()
              : onde;
        for (const v of Object.values(o)) andar(v, aqui);
      }
    };
    andar(r, "");
  }
  return out;
}

/**
 * Cada duração cuja classe no passo mais novo é diferente da de um passo anterior: a correção não chegou lá. Uma
 * linha por duração e passo antigo.
 */
export function reguasQueMudaram(p: PgpDossie): ReguaQueMudou[] {
  const ordem = (x: PassoPgp) => PASSOS_PGP.findIndex((y) => y.passo === x);
  const porQuantidade = new Map<string, MencaoDeRegua[]>();
  for (const m of mencoesDoPgp(p))
    porQuantidade.set(m.quantidade, [...(porQuantidade.get(m.quantidade) ?? []), m]);
  const out: ReguaQueMudou[] = [];
  for (const [quantidade, ms] of porQuantidade) {
    const ultimoPasso = Math.max(...ms.map((m) => ordem(m.passo)));
    const novas = ms.filter((m) => ordem(m.passo) === ultimoPasso);
    const classesNovas = new Set(novas.map((m) => m.classe));
    // no passo mais novo a classe também está dividida: não há correção clara
    if (classesNovas.size !== 1) continue;
    const depois = novas[0]!;
    const passosVelhos = new Set<PassoPgp>();
    for (const m of ms) {
      if (ordem(m.passo) >= ultimoPasso || m.classe === depois.classe || passosVelhos.has(m.passo)) continue;
      passosVelhos.add(m.passo);
      out.push({ quantidade, antes: m, depois });
    }
  }
  return out;
}

const NOME_CLASSE: Record<ClasseDaRegua, string> = { teto: "teto", referencia: "referência" };

/** O aviso em texto, para a tela e o placar. */
export function reguaQueMudouEmTexto(r: ReguaQueMudou): string {
  const nome = (passo: PassoPgp) => PASSOS_PGP.find((x) => x.passo === passo)?.nome ?? passo;
  return `Régua de ${r.quantidade}: "${NOME_CLASSE[r.antes.classe]}" em ${nome(r.antes.passo)}${r.antes.onde ? ` (${r.antes.onde})` : ""} e "${NOME_CLASSE[r.depois.classe]}" em ${nome(r.depois.passo)}${r.depois.onde ? ` (${r.depois.onde})` : ""}. Se a correção vale, sugere-se levar a nova régua à parte gerada antes e salvar de novo a resposta daquele passo; se não, rever o passo mais novo.`;
}
