// Etapa 5 (decisão 0052): achado do código é candidato até o veredito do PMO. O código monta a lista (ausente, vago e
// conflituoso, com o id), o PMO dá um veredito para cada um, e o código confere o veredito:
// - "sustenta" conta no total;
// - "falso" precisa do trecho do plano onde está o conteúdo, procurado na página (e dito se está fora da parte);
// - "nao_se_aplica" e "regra_errada" precisam do motivo;
// - sem veredito (ou veredito incompleto), o achado fica à parte como "candidato sem veredito" e não conta.
// A dispensa que só o plano declara também é candidata: "cabe" mantém a dispensa; "nao_cabe" devolve a parte à
// conferência, e os achados do código para ela (os condicionais, mandados no mesmo pedido) entram como candidatos.
import type { DocumentoLido } from "../../dossie/esquema";
import { citacaoValeComoFato, conferirCitacao, type ResultadoCitacao } from "../../pmo/citacoes";
import type { RespostaLeitura, VereditoCandidato } from "../../pmo/schemas/leitura";
import type { Achado } from "../../regras/achado";
import { conferirPlano, type EntradaConferencia, type ResultadoConferencia } from "../../regras/conferencia";
import { paginasDaParte, type ParteConfirmada, type ParteNoMapa } from "../../regras/mapa-pgp";
import { dispensasCandidatas, ehDispensaCandidata, mapaComDispensasDevolvidas } from "./dispensas";
import { regiaoDoAusente } from "./leitura-pmo";

export type SituacaoCandidato = "sustenta" | "falso" | "nao-se-aplica" | "regra-errada" | "sem-veredito";

export const NOME_SITUACAO_CANDIDATO: Record<SituacaoCandidato, string> = {
  sustenta: "o PMO confirmou",
  falso: "falso: o plano tem o conteúdo",
  "nao-se-aplica": "não se aplica a este projeto",
  "regra-errada": "regra errada",
  "sem-veredito": "candidato sem veredito do PMO",
};

export interface CandidatoConferido {
  achado: Achado;
  situacao: SituacaoCandidato;
  veredito?: VereditoCandidato;
  /** No "falso": a conferência de cada trecho citado. */
  citacoes: ResultadoCitacao[];
  /** O que a conferência do veredito aponta (citação não conferida, trecho fora da parte, veredito incompleto). */
  avisos: string[];
  /** Achado de uma parte cuja dispensa (declarada só no plano) o PMO disse que não cabe. */
  daDispensa?: string;
  /** O achado voltou a contar pela segunda instância leve (decisão 0077): o que ela disse. */
  revisadoPelaSegunda?: string;
}

export type SituacaoDispensa = "cabe" | "nao-cabe" | "sem-veredito";

export interface DispensaConferida {
  parte: string;
  justificativa: string;
  situacao: SituacaoDispensa;
  motivo: string;
  avisos: string[];
}

export interface ResultadoVereditos {
  /** Os achados que contam: os do código que o PMO confirmou. */
  contam: Achado[];
  /** Todos os candidatos, com a situação (os que contam e os que ficam à parte). */
  candidatos: CandidatoConferido[];
  dispensas: DispensaConferida[];
  /** Partes que voltaram à conferência (dispensa que não cabe). */
  partesDevolvidas: string[];
  /** Vereditos com id que não está na lista do pedido. */
  desconhecidos: string[];
}

/**
 * Achados do código que só aparecem se as dispensas candidatas não couberem: os da conferência com as partes
 * devolvidas que não estão na conferência normal, por parte.
 */
export function achadosCondicionais(
  base: Achado[],
  semDispensas: Achado[],
  partes: string[],
): Map<string, Achado[]> {
  const ids = new Set(base.map((a) => a.id));
  const out = new Map<string, Achado[]>(partes.map((p) => [p, []]));
  for (const a of semDispensas) {
    if (ids.has(a.id)) continue;
    const parte = partes.find((p) => a.parte === p || a.partes.includes(p));
    if (parte) out.get(parte)!.push(a);
  }
  return out;
}

export interface ConferenciaComCandidatos {
  resultado: ResultadoConferencia;
  /** Dispensas declaradas só no plano (candidatas), com a justificativa. */
  dispensas: { parte: string; justificativa: string }[];
  /** Achados do código se a dispensa candidata não couber, por parte. */
  condicionais: Map<string, Achado[]>;
}

/**
 * A conferência por código com os candidatos: a normal e, se há dispensa declarada só no plano, também a conferência
 * com essas partes devolvidas, para mandar ao PMO os achados que valem se a dispensa não couber. App e script usam
 * esta função.
 */
export function conferirComCandidatos(
  e: EntradaConferencia,
  proposta: ParteNoMapa[],
): ConferenciaComCandidatos {
  const resultado = conferirPlano(e);
  const candidatas = dispensasCandidatas(e.mapa);
  const partes = candidatas.map((p) => p.codigo);
  const condicionais = partes.length
    ? achadosCondicionais(
        resultado.achados,
        conferirPlano({ ...e, mapa: mapaComDispensasDevolvidas(e.mapa, proposta, new Set(partes)) }).achados,
        partes,
      )
    : new Map<string, Achado[]>();
  return {
    resultado,
    dispensas: candidatas.map((p) => ({ parte: p.codigo, justificativa: p.justificativa ?? "" })),
    condicionais,
  };
}

function conferirUm(
  a: Achado,
  v: VereditoCandidato | undefined,
  mapa: ParteConfirmada[],
  documentos: DocumentoLido[],
): Omit<CandidatoConferido, "daDispensa"> {
  if (!v) return { achado: a, situacao: "sem-veredito", citacoes: [], avisos: [] };
  const incompleto = (falta: string) => ({
    achado: a,
    situacao: "sem-veredito" as const,
    veredito: v,
    citacoes: [],
    avisos: [`veredito "${v.veredito}" sem ${falta}: fica como candidato`],
  });
  if (v.veredito === "sustenta")
    return { achado: a, situacao: "sustenta", veredito: v, citacoes: [], avisos: [] };
  if (v.veredito === "nao_se_aplica" || v.veredito === "regra_errada") {
    if (!v.motivo.trim()) return incompleto(v.veredito === "regra_errada" ? "a causa" : "o motivo");
    return {
      achado: a,
      situacao: v.veredito === "regra_errada" ? "regra-errada" : "nao-se-aplica",
      veredito: v,
      citacoes: [],
      avisos: [],
    };
  }
  // falso: o trecho do plano onde está o conteúdo, procurado na página
  if (!v.evidencias.length) return incompleto("o trecho do plano");
  const citacoes = v.evidencias.map((f) => conferirCitacao(f, documentos));
  const avisos: string[] = [];
  if (!citacoes.some(citacaoValeComoFato))
    avisos.push("citação não conferida: o trecho não foi achado na página");
  const regiao = regiaoDoAusente(a.parte, mapa);
  if (regiao) {
    const paginas = new Set(
      [...regiao].flatMap((c) => [...(paginasDaParte(mapa.find((p) => p.codigo === c)) ?? [])]),
    );
    const fora = citacoes
      .map((c, k) => c.pagina ?? v.evidencias[k]?.pagina ?? 0)
      .filter((pg) => pg && !paginas.has(pg));
    if (fora.length && fora.length === citacoes.length)
      avisos.push(`o trecho está fora da parte ${a.parte} (p. ${[...new Set(fora)].join(", ")})`);
  }
  return { achado: a, situacao: "falso", veredito: v, citacoes, avisos };
}

/** Confere os vereditos do PMO sobre os achados do código e sobre as dispensas declaradas só no plano. */
export function conferirVereditos(
  r: RespostaLeitura,
  base: Achado[],
  condicionais: Map<string, Achado[]>,
  mapa: ParteConfirmada[],
  documentos: DocumentoLido[],
): ResultadoVereditos {
  const dispensas: DispensaConferida[] = mapa.filter(ehDispensaCandidata).map((p) => {
    const v = r.dispensas.find((d) => d.parte === p.codigo);
    const justificativa = p.justificativa ?? "";
    if (!v) return { parte: p.codigo, justificativa, situacao: "sem-veredito", motivo: "", avisos: [] };
    if (v.veredito === "nao_cabe" && !v.motivo.trim())
      return {
        parte: p.codigo,
        justificativa,
        situacao: "sem-veredito",
        motivo: "",
        avisos: ['"não cabe" sem o motivo: a dispensa fica como o plano declara'],
      };
    return {
      parte: p.codigo,
      justificativa,
      situacao: v.veredito === "cabe" ? "cabe" : "nao-cabe",
      motivo: v.motivo,
      avisos: [],
    };
  });
  const partesDevolvidas = dispensas.filter((d) => d.situacao === "nao-cabe").map((d) => d.parte);
  const lista: { a: Achado; daDispensa?: string }[] = [
    ...base.map((a) => ({ a })),
    ...partesDevolvidas.flatMap((p) => (condicionais.get(p) ?? []).map((a) => ({ a, daDispensa: p }))),
  ];
  const candidatos = lista.map(({ a, daDispensa }) => ({
    ...conferirUm(
      a,
      r.vereditos.find((v) => v.achado === a.id),
      mapa,
      documentos,
    ),
    ...(daDispensa ? { daDispensa } : {}),
  }));
  const conhecidos = new Set([...base, ...[...condicionais.values()].flat()].map((a) => a.id));
  return {
    contam: candidatos.filter((c) => c.situacao === "sustenta").map((c) => c.achado),
    candidatos,
    dispensas,
    partesDevolvidas,
    desconhecidos: r.vereditos.filter((v) => !conhecidos.has(v.achado)).map((v) => v.achado),
  };
}
