// Compromissos da proposta numerados (decisão 0047): premissas, obrigações do contratante, exclusões, compromissos de
// método (sigilo, revisão interna, régua metodológica: os itens da minuta com ficha PROP-METODOLOGIA.9 a .11) e limites
// de volume recebem um número C (C01, C02…), como os R. O número que o PMO escreveu no começo do item ("C20 — Sigilo:")
// vale; os outros recebem os números livres, na ordem da resposta, para não colidir com os do texto da minuta. Cada C tem destino no TAP:
// premissa e obrigação do contratante vão para o registro de premissas; exclusão e limite de volume, para os limites
// (TAP.4). O PMO cita o número no item que o leva ("requisitos": ["C03"]); sem a citação, o código procura pela
// premissa crítica ou pelo texto parecido e marca como provável.
import { normalizarTermo } from "../../regras/busca";
import type { ItemPmo } from "../../pmo/schemas/comum";
import type { RespostaConteudo } from "../../pmo/schemas/proposta";
import type { PremissaRegistro, RespostaTap } from "../../pmo/schemas/tap";

export type TipoCompromisso = "premissa" | "obrigacao" | "exclusao" | "metodo" | "limite";

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
  metodo: "compromisso de método",
  limite: "limite de volume",
};

/** Onde cada tipo vai no TAP. */
export const DESTINO_NO_TAP: Record<TipoCompromisso, string> = {
  premissa: "registro de premissas",
  obrigacao: "registro de premissas (depende do contratante)",
  exclusao: "limites (TAP.4)",
  metodo: "descrição, entregas ou critérios de aceite (TAP.3 e TAP.5)",
  limite: "limites (TAP.4)",
};

const RE_NUMERO_C = /^C\d{2,}$/;

/** "C03" é número de compromisso, não de requisito. */
export function ehNumeroDeCompromisso(n: string): boolean {
  return RE_NUMERO_C.test(n.trim());
}

/** Item da minuta que é compromisso de método: a ficha PROP-METODOLOGIA.9 a .11, ou o número C que o PMO lhe deu. */
const RE_FICHA_METODO = /^PROP-METODOLOGIA\.(?:9|10|11)$/;
const RE_C_NO_INICIO = /^\s*(C\d{2,})\s*[—–:-]\s*/;

export function numerarCompromissos(c: RespostaConteudo): Compromisso[] {
  const metodo = c.estrutura.flatMap((secao, si) =>
    secao.itens.flatMap((item, ii) =>
      RE_FICHA_METODO.test((item.ficha ?? "").trim()) || RE_C_NO_INICIO.test(item.texto)
        ? [
            {
              tipo: "metodo" as const,
              idItem: `conteudo:estrutura:${si}:${ii}`,
              texto: item.texto.replace(RE_C_NO_INICIO, ""),
              doPmo: RE_C_NO_INICIO.exec(item.texto)?.[1],
            },
          ]
        : [],
    ),
  );
  const lista: (Omit<Compromisso, "numero"> & { doPmo?: string })[] = [
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
    ...metodo,
    ...c.limitesVolume.map((x, k) => ({
      tipo: "limite" as const,
      idItem: `conteudo:limitesVolume:${k}`,
      texto: x.texto,
    })),
  ];
  // o número que o PMO deu vale (sem repetição); os outros recebem os números livres, na ordem da lista
  const usados = new Set<string>();
  const doPmo = lista.map((x) => {
    if (!x.doPmo || usados.has(x.doPmo)) return undefined;
    usados.add(x.doPmo);
    return x.doPmo;
  });
  let proximo = 1;
  const livre = () => {
    for (;;) {
      const n = `C${String(proximo++).padStart(2, "0")}`;
      if (!usados.has(n)) {
        usados.add(n);
        return n;
      }
    }
  };
  return lista
    .map((x, k) => {
      const semDoPmo: Omit<Compromisso, "numero"> = {
        tipo: x.tipo,
        idItem: x.idItem,
        texto: x.texto,
        ...(x.premissaCritica ? { premissaCritica: x.premissaCritica } : {}),
      };
      return { ...semDoPmo, numero: doPmo[k] ?? livre() };
    })
    .sort((a, b) => Number(a.numero.slice(1)) - Number(b.numero.slice(1)));
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
    // o compromisso de método não tem lugar fixo no TAP: vale o texto parecido em qualquer parte
    const esperado =
      compromisso.tipo === "exclusao" || compromisso.tipo === "limite"
        ? "limites"
        : compromisso.tipo === "metodo"
          ? ""
          : "registro";
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

/** Item do plano (etapa 4) onde um C pode estar: a parte e o item, com o texto e os números citados. */
export interface ItemDoPlano {
  parte: string;
  item: ItemPmo;
}

/**
 * Destino de cada C no plano (decisão 0047): o item que cita o número, em "requisitos" ou no próprio texto ("dados
 * (C08)"). C sem destino no plano é o que a etapa 5 cobra como ausente.
 */
export function destinosNoPlano(cs: Compromisso[], itens: ItemDoPlano[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const c of cs) {
    const onde = itens
      .filter(
        (x) =>
          x.item.requisitos.some((n) => n.trim() === c.numero) || numerosCitados(x.item.texto).has(c.numero),
      )
      .map((x) => `${x.parte}, item ${x.item.id}`);
    out.set(c.numero, [...new Set(onde)]);
  }
  return out;
}

/** Números C citados num texto: "C10", "(C11)" e intervalos "C08 a C15" (todos os do meio). */
export function numerosCitados(texto: string): Set<string> {
  const out = new Set<string>();
  const num = (n: number) => `C${String(n).padStart(2, "0")}`;
  for (const m of texto.matchAll(/(?<![A-Za-z0-9])C(\d{2,})(?:\s*(?:a|até|-|–)\s*C(\d{2,}))?(?![0-9])/g)) {
    const ini = Number(m[1]);
    const fim = m[2] ? Number(m[2]) : ini;
    for (let n = ini; n <= Math.min(fim, ini + 99); n++) out.add(num(n));
  }
  return out;
}
