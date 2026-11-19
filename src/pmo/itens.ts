// Itens do PMO, em qualquer etapa: cada item rotulado com um id estável (a revisão do GP fica no dossiê por ele) e a
// conferência do código (citação, redação, números sem fonte). Usado nas etapas 2, 3 e 4.
import type { EstadoItem, RevisaoItem, UsoPmo } from "../dossie/esquema";
import type { RespostaPmo } from "./cliente";
import type { ConferenciaItem } from "./redacao";
import type { ItemPmo } from "./schemas/comum";
import { marcasDoItem } from "../exportacao/marcas";

export interface ItemConferido {
  /** "tap:objetivos:0", "premissas:2"… estável enquanto a resposta não muda. */
  id: string;
  passo: string;
  /** Onde o item fica no documento (para a tela e a exportação). */
  grupo: string;
  item: ItemPmo;
  /** Texto extra que vem junto (critério de sucesso, consequência da premissa). */
  complemento?: string;
  conferencia: ConferenciaItem;
}

export function estadoDe(revisoes: Record<string, RevisaoItem>, id: string): EstadoItem {
  return revisoes[id]?.estado ?? "pendente";
}

/** O texto que vale: o editado pelo GP, ou o do PMO. */
export function textoFinal(i: ItemConferido, revisoes: Record<string, RevisaoItem>): string {
  return textoRevisado(i.id, i.item.texto, revisoes);
}

/** O mesmo, pelo id e pelo texto do PMO, para quem não tem o item conferido (o pedido das premissas). */
export function textoRevisado(id: string, texto: string, revisoes: Record<string, RevisaoItem>): string {
  const r = revisoes[id];
  return r?.estado === "editado" && r.textoEditado?.trim() ? r.textoEditado : texto;
}

export function contarPendentes(revisoes: Record<string, RevisaoItem>, itens: ItemConferido[]): number {
  return itens.filter((i) => estadoDe(revisoes, i.id) === "pendente").length;
}

/** Itens que entram no documento final: os que o GP não descartou. */
export function itensValidos(revisoes: Record<string, RevisaoItem>, itens: ItemConferido[]): ItemConferido[] {
  return itens.filter((i) => estadoDe(revisoes, i.id) !== "descartado");
}

const ROTULO = { documento: "Do documento", sugestao: "Sugestão", decisao_gp: "Decisão do GP" } as const;

/** Rótulo visível de um item, com a página conferida ou o aviso de citação não conferida. */
export function rotuloDoItem(i: ItemConferido): string {
  // rótulo misto (decisão 0093, regra 15 da skill): o item que mistura documento e sugestão vale como sugestão
  if (i.item.rotulo === "documento" && i.conferencia.rotuloMisto) return `[${ROTULO.sugestao}]`;
  if (i.item.rotulo === "documento") {
    if (i.conferencia.citacaoNaoConferida) return "[Do documento — citação não conferida]";
    const k = i.conferencia.citacoes.findIndex(
      (c) => c.estado !== "nao-conferida" && c.estado !== "nao-verificavel",
    );
    const pagina = i.conferencia.citacoes[k]?.pagina;
    const doc = i.item.fontes[k]?.doc;
    const onde = doc && doc !== "rfp" ? `${doc === "proposta" ? "proposta" : doc.toUpperCase()}, ` : "";
    return `[Do documento${pagina ? `, ${onde}p. ${pagina}` : ""}]`;
  }
  return `[${ROTULO[i.item.rotulo]}]`;
}

/**
 * O item como parágrafo: marca, rótulo, texto, complemento, requisitos e avisos. Com `limite`, só o texto e o complemento
 * são encurtados: o rótulo, as marcas e os avisos de conferência sempre ficam (decisão 0096).
 */
export function paragrafoDoItem(
  i: ItemConferido,
  revisoes: Record<string, RevisaoItem>,
  limite?: number,
): string {
  const avisos = [
    i.item.rotulo === "documento" && i.conferencia.citacaoNaoProva
      ? "citação a conferir: o trecho pode não provar a frase"
      : "",
    i.conferencia.rotuloMisto ? "rótulo misto: há sugestão dentro do item do documento" : "",
    i.conferencia.numerosSemFonte.length
      ? `número sem fonte — conferir: ${i.conferencia.numerosSemFonte.join(", ")}`
      : "",
  ].filter(Boolean);
  const marcas = marcasDoItem(estadoDe(revisoes, i.id) === "pendente", i.conferencia.redacaoAConferir);
  const requisitos = i.item.requisitos.length ? ` [${i.item.requisitos.join(", ")}]` : "";
  const corpo = `${textoFinal(i, revisoes)}${i.complemento ? ` ${i.complemento}` : ""}`;
  const texto = limite && corpo.length > limite ? `${corpo.slice(0, limite - 1).trimEnd()}…` : corpo;
  return `${marcas}${rotuloDoItem(i)} ${texto}${requisitos}${avisos.length ? ` (${avisos.join("; ")})` : ""}`;
}

/** Uso de uma chamada, para o dossiê (tokens e valor, nunca a chave). */
export function usoDaChamada(passo: string, r: RespostaPmo<unknown>): UsoPmo {
  return {
    passo,
    modelo: r.modelo,
    entrada: r.uso.entrada,
    saida: r.uso.saida,
    escritaCache: r.uso.escritaCache,
    escritaCache1h: r.uso.escritaCache1h ?? 0,
    leituraCache: r.uso.leituraCache,
    custoUsd: r.custo,
    em: r.em,
  };
}

/** Revisões e decisões sobre itens do PMO ("pmo:…"): uma leitura nova não herda as da anterior (os ids se repetem). */
export function semRevisoesDoPmo<T>(registro: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(registro).filter(([id]) => !id.startsWith("pmo:")));
}
