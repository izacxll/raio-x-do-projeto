// Itens do PMO, em qualquer etapa: cada item rotulado com um id estável (a revisão do GP fica no dossiê por ele) e a
// conferência do código (citação, redação, números sem fonte). Usado nas etapas 2, 3 e 4.
import type { EstadoItem, RevisaoItem, UsoPmo } from "../dossie/esquema";
import type { RespostaPmo } from "./cliente";
import type { ConferenciaItem } from "./redacao";
import type { ItemPmo } from "./schemas/comum";

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
  const r = revisoes[i.id];
  return r?.estado === "editado" && r.textoEditado?.trim() ? r.textoEditado : i.item.texto;
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

/** Parágrafo de um item no documento exportado: rótulo, texto final, complemento e avisos. */
export function paragrafoDoItem(i: ItemConferido, revisoes: Record<string, RevisaoItem>): string {
  const avisos = [
    i.conferencia.redacaoAConferir ? "redação a conferir" : "",
    i.conferencia.numerosSemFonte.length
      ? `número sem fonte — conferir: ${i.conferencia.numerosSemFonte.join(", ")}`
      : "",
    estadoDe(revisoes, i.id) === "pendente" ? "pendente de revisão do GP" : "",
  ].filter(Boolean);
  return `${rotuloDoItem(i)} ${textoFinal(i, revisoes)}${i.complemento ? ` ${i.complemento}` : ""}${avisos.length ? ` (${avisos.join("; ")})` : ""}`;
}

/** Uso de uma chamada, para o dossiê (tokens e valor, nunca a chave). */
export function usoDaChamada(passo: string, r: RespostaPmo<unknown>): UsoPmo {
  return {
    passo,
    modelo: r.modelo,
    entrada: r.uso.entrada,
    saida: r.uso.saida,
    escritaCache: r.uso.escritaCache,
    leituraCache: r.uso.leituraCache,
    custoUsd: r.custo,
    em: r.em,
  };
}
