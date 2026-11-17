// Compromissos da proposta numerados (decisão 0047): premissas, obrigações do contratante, exclusões e limites de
// volume recebem um número C (C01, C02…), fixo pela ordem da resposta do PMO, como os R. Cada C tem destino no TAP:
// premissa e obrigação do contratante vão para o registro de premissas; exclusão e limite de volume, para os limites
// (TAP.4). O PMO cita o número no item que o leva ("requisitos": ["C03"]); sem a citação, o código procura pela
// premissa crítica ou pelo texto parecido e marca como provável.
import { normalizarTermo } from "../../regras/busca";
import type { ItemPmo } from "../../pmo/schemas/comum";
import type { RespostaConteudo } from "../../pmo/schemas/proposta";
import type { PremissaRegistro, RespostaTap } from "../../pmo/schemas/tap";

export type TipoCompromisso = "premissa" | "obrigacao" | "exclusao" | "limite";

export interface Compromisso {
  numero: string;
  tipo: TipoCompromisso;
  /** Id do item na proposta (conteudo:premissas:0…), para a revisão do GP. */
  idItem: string;
  texto: string;
  premissaCritica?: string;
}

export const NOME_TIPO_COMPROMISSO: Record<TipoCompromisso, string> = {
  premissa: "premissa",
  obrigacao: "obrigação do contratante",
  exclusao: "exclusão",
  limite: "limite de volume",
};

/** Onde cada tipo vai no TAP. */
export const DESTINO_NO_TAP: Record<TipoCompromisso, string> = {
  premissa: "registro de premissas",
  obrigacao: "registro de premissas (depende do contratante)",
  exclusao: "limites (TAP.4)",
  limite: "limites (TAP.4)",
};

const RE_NUMERO_C = /^C\d{2,}$/;

/** "C03" é número de compromisso, não de requisito. */
export function ehNumeroDeCompromisso(n: string): boolean {
  return RE_NUMERO_C.test(n.trim());
}

export function numerarCompromissos(c: RespostaConteudo): Compromisso[] {
  const lista: Omit<Compromisso, "numero">[] = [
    ...c.premissas.map((p, k) => ({
      tipo: "premissa" as const,
      idItem: `conteudo:premissas:${k}`,
      texto: p.item.texto,
      premissaCritica: p.premissaCritica || undefined,
    })),
    ...c.obrigacoesContratante.map((o, k) => ({
      tipo: "obrigacao" as const,
      idItem: `conteudo:obrigacoesContratante:${k}`,
      texto: o.item.texto,
    })),
    ...c.exclusoes.map((x, k) => ({
      tipo: "exclusao" as const,
      idItem: `conteudo:exclusoes:${k}`,
      texto: x.texto,
    })),
    ...c.limitesVolume.map((x, k) => ({
      tipo: "limite" as const,
      idItem: `conteudo:limitesVolume:${k}`,
      texto: x.texto,
    })),
  ];
  return lista.map((x, k) => ({ ...x, numero: `C${String(k + 1).padStart(2, "0")}` }));
}

export function compromissosEmTexto(cs: Compromisso[]): string {
  return cs
    .map(
      (x) =>
        `- ${x.numero} (${NOME_TIPO_COMPROMISSO[x.tipo]}${x.premissaCritica ? `, ${x.premissaCritica}` : ""}; vai para ${DESTINO_NO_TAP[x.tipo]}): ${x.texto}`,
    )
    .join("\n");
}

export interface DestinoCompromisso {
  compromisso: Compromisso;
  /** citado: o PMO pôs o número no item; provavel: o código achou pela premissa crítica ou pelo texto; sem-destino. */
  situacao: "citado" | "provavel" | "sem-destino";
  /** "limites, item lm3" */
  onde?: string;
  texto: string;
}

const PALAVRAS_VAZIAS = new Set(
  "a o e de do da dos das em no na nos nas um uma para por com sem que se ao aos as os ou mas como mais menos cada sua seu suas seus".split(
    " ",
  ),
);

function palavras(t: string): Set<string> {
  return new Set(
    normalizarTermo(t)
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3 && !PALAVRAS_VAZIAS.has(w)),
  );
}

/**
 * Parte das palavras do compromisso que está no texto do item do TAP. Item que junta vários compromissos ("Fora:
 * auditoria…; pesquisa com empresas; vias extras") cobre cada um em parte: vale a partir de 40%, com 3 palavras.
 */
function cobertura(compromisso: string, item: string): number {
  const c = palavras(compromisso);
  if (!c.size) return 0;
  const i = palavras(item);
  const comuns = [...c].filter((w) => i.has(w)).length;
  return comuns >= 3 ? comuns / c.size : 0;
}

interface LugarNoTap {
  onde: string;
  item: ItemPmo;
  premissaCritica?: string;
}

function lugaresDoTap(tap?: RespostaTap, registro: PremissaRegistro[] = []): LugarNoTap[] {
  return [
    ...(tap?.limites ?? []).map((item) => ({ onde: `limites, item ${item.id}`, item })),
    ...(tap?.entregas ?? []).map((item) => ({ onde: `entregas, item ${item.id}`, item })),
    ...(tap?.descricao ?? []).map((item) => ({ onde: `descrição, item ${item.id}`, item })),
    ...(tap?.divergenciasTexto ?? []).map((d) => ({ onde: `divergências, item ${d.item.id}`, item: d.item })),
    ...registro.map((p) => ({
      onde: `registro de premissas, item ${p.item.id}`,
      item: p.item,
      premissaCritica: p.premissaCritica || undefined,
    })),
  ];
}

/** Destino de cada C no TAP: pelo número citado; sem ele, pela premissa crítica ou pelo texto (provável). */
export function destinosNoTap(
  cs: Compromisso[],
  tap?: RespostaTap,
  registro: PremissaRegistro[] = [],
): DestinoCompromisso[] {
  const lugares = lugaresDoTap(tap, registro);
  return cs.map((compromisso) => {
    const citado = lugares.filter((l) => l.item.requisitos.some((n) => n.trim() === compromisso.numero));
    if (citado.length)
      return {
        compromisso,
        situacao: "citado" as const,
        onde: citado.map((l) => l.onde).join("; "),
        texto: `No TAP: ${citado.map((l) => l.onde).join("; ")}.`,
      };
    const pelaPc = compromisso.premissaCritica
      ? lugares.find((l) => l.premissaCritica === compromisso.premissaCritica)
      : undefined;
    // primeiro no destino esperado (limites ou registro); só sem achado ali, no resto do TAP
    const melhor = (ls: LugarNoTap[]) =>
      ls
        .map((l) => ({ l, c: cobertura(compromisso.texto, l.item.texto) }))
        .filter((x) => x.c >= 0.4)
        .sort((a, b) => b.c - a.c)[0]?.l;
    const esperado = compromisso.tipo === "exclusao" || compromisso.tipo === "limite" ? "limites" : "registro";
    const pelaRedacao = melhor(lugares.filter((l) => l.onde.startsWith(esperado))) ?? melhor(lugares);
    const provavel = pelaPc ?? pelaRedacao;
    if (provavel)
      return {
        compromisso,
        situacao: "provavel" as const,
        onde: provavel.onde,
        texto: `Provável: ${provavel.onde} (${pelaPc ? `mesma premissa crítica ${compromisso.premissaCritica}` : "texto parecido"}; o PMO não citou ${compromisso.numero}) — conferir.`,
      };
    return {
      compromisso,
      situacao: "sem-destino" as const,
      texto: `Destino não localizado pelo código no TAP — conferir; o esperado é ${DESTINO_NO_TAP[compromisso.tipo]}.`,
    };
  });
}
