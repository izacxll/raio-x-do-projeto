// Fila de pendências do GP (decisão 0088): separa o que é decisão do GP, o que pede conferência e o que pode ser
// aceito em lote, e ordena por impacto. Nada é aceito sem o GP: o "em lote" é um clique dele, nunca automático
// (CLAUDE.md, seção 1). A decisão do GP e o item com aviso do código nunca vão em lote.
import type { RevisaoItem } from "../dossie/esquema";
import { contar } from "../texto/plural";
import { estadoDe, type ItemConferido } from "./itens";

/**
 * - decisao: só o GP preenche (rótulo "Decisão do GP" ou "a definir pelo GP" no texto);
 * - conferir: o código deixou um aviso (citação não conferida, citação a conferir, número sem fonte, redação);
 * - documento: tirado do documento, com a citação conferida e sem aviso;
 * - sugestao: sugestão do PMO sem aviso.
 */
export type ClassePendencia = "decisao" | "conferir" | "documento" | "sugestao";

export const NOME_CLASSE: Record<ClassePendencia, string> = {
  decisao: "Decisão do GP",
  conferir: "A conferir",
  documento: "Do documento, citação conferida",
  sugestao: "Sugestão sem aviso",
};

/** O item na forma comum da fila: etapa 1 (ItemLeitura) e etapas 2 a 4 (ItemConferido). */
export interface ItemRevisavel {
  id: string;
  rotulo: "documento" | "sugestao" | "decisao";
  /** Avisos do código; com algum, o item vai para "a conferir". */
  avisos: string[];
  texto: string;
  /** Onde o item está (seção, parte, passo). */
  grupo: string;
  /** Impacto que a etapa já dá (o da seção 7 da etapa 1, 1 = mais pesa); sem ele, o código estima pelo texto. */
  impacto?: number;
}

/** Ordem do impacto (decisão 0088): caixa e preço, prazo, aceite, quem executa e o resto. */
export const NOME_IMPACTO: Record<number, string> = {
  1: "caixa ou preço",
  2: "prazo",
  3: "aceite",
  4: "quem executa",
  5: "outro",
};

/** O impacto pelo texto, quando a etapa não o dá: a primeira dimensão que o texto toca, na ordem da decisão 0088. */
export function impactoPeloTexto(texto: string): number {
  const t = texto.toLowerCase();
  if (/r\$|\bpre[cç]o|\bvalor|\bcaixa|\bparcela|\bpagamento|\bdesembolso|\bglosa|\bcusto|\breserva/.test(t))
    return 1;
  if (/\bprazo|\bmarco|\bcronograma|\bvig[eê]ncia|\bdata\b|\b\d+\s*(?:dias|meses|semanas)/.test(t)) return 2;
  if (/\baceite|\baprova[cç][aã]o|\brecebimento|\bhomologa/.test(t)) return 3;
  if (/\bequipe|\bperfil|\bsubstitui|\bquem executa|\bsubcontrata|\bpatrocinador|\bgerente/.test(t)) return 4;
  return 5;
}

export function classeDoItem(i: ItemRevisavel): ClassePendencia {
  if (i.rotulo === "decisao" || /a de(?:finir|cidir) pelo GP/i.test(i.texto)) return "decisao";
  if (i.avisos.length) return "conferir";
  return i.rotulo === "documento" ? "documento" : "sugestao";
}

export interface ItemDaFila extends ItemRevisavel {
  classe: ClassePendencia;
  impactoFinal: number;
}

/** Só os pendentes, com a classe e o impacto; decisões primeiro, depois os a conferir, cada grupo por impacto. */
export function filaDePendencias(
  itens: ItemRevisavel[],
  revisoes: Record<string, RevisaoItem>,
): ItemDaFila[] {
  const ordem: ClassePendencia[] = ["decisao", "conferir", "documento", "sugestao"];
  return itens
    .filter((i) => estadoDe(revisoes, i.id) === "pendente")
    .map((i) => ({ ...i, classe: classeDoItem(i), impactoFinal: i.impacto ?? impactoPeloTexto(i.texto) }))
    .sort((a, b) => ordem.indexOf(a.classe) - ordem.indexOf(b.classe) || a.impactoFinal - b.impactoFinal);
}

/** Os pendentes que o GP pode aceitar em lote, por classe (nunca decisão nem item com aviso). */
export function aceitaveisEmLote(fila: ItemDaFila[]): { documento: string[]; sugestao: string[] } {
  return {
    documento: fila.filter((i) => i.classe === "documento").map((i) => i.id),
    sugestao: fila.filter((i) => i.classe === "sugestao").map((i) => i.id),
  };
}

/** Contagem da fila por classe, para a capa e a tela. */
export function contarFila(fila: ItemDaFila[]): Record<ClassePendencia, number> {
  const c = { decisao: 0, conferir: 0, documento: 0, sugestao: 0 };
  for (const i of fila) c[i.classe]++;
  return c;
}

/** Item das etapas 2 a 4 na forma da fila. */
export function revisavelDoConferido(
  i: Pick<ItemConferido, "id" | "grupo" | "item" | "conferencia">,
): ItemRevisavel {
  const c = i.conferencia;
  return {
    id: i.id,
    rotulo:
      i.item.rotulo === "decisao_gp" ? "decisao" : i.item.rotulo === "documento" ? "documento" : "sugestao",
    avisos: [
      c.citacaoNaoConferida ? "citação não conferida" : "",
      c.citacaoNaoProva ? "citação a conferir" : "",
      c.redacaoAConferir ? "redação a conferir" : "",
      c.rotuloMisto ? "rótulo misto: há sugestão dentro do item do documento" : "",
      c.numerosSemFonte.length ? `número sem fonte: ${c.numerosSemFonte.join(", ")}` : "",
    ].filter(Boolean),
    texto: i.item.texto,
    grupo: i.grupo,
  };
}

/**
 * O impacto da etapa 1 (método 3.1: 1 caixa, 2 dependência do contratante, 3 preço, 4 prazo, 5 escopo, 6 outros) na
 * escala da fila (1 caixa ou preço, 2 prazo, 3 aceite, 4 quem executa, 5 outro).
 */
const IMPACTO_DA_ETAPA_1: Record<number, number> = { 1: 1, 2: 4, 3: 1, 4: 2, 5: 5, 6: 5 };

/**
 * Item da leitura da etapa 1 na forma da fila (decisão 0088, com a revisão de código):
 * - o item que o PMO marcou como decisão do GP (a marca fica na nota: "a decidir pelo GP") é decisão;
 * - o requisito R incluído pelo próprio GP não é decisão pendente: vai em lote;
 * - as travas, o aviso e o que o código não localizou viram avisos (a conferir, nunca em lote);
 * - o impacto da seção 7 vale, na escala da fila.
 */
export function revisavelDaLeitura(i: {
  id: string;
  rotulo: "documento" | "sugestao" | "decisao-gp";
  nome: string;
  texto: string;
  secao: string;
  situacao?: string;
  nota?: string;
  impacto?: number;
  trava?: string;
  aviso?: string;
}): ItemRevisavel {
  const marcadoPeloPmo = /a de(?:finir|cidir) pelo GP/i.test(i.nota ?? "");
  const requisitoDoGp = i.id.startsWith("requisito:") && i.rotulo === "decisao-gp";
  const naoLocalizado = i.situacao !== undefined && !["localizado", "calculado"].includes(i.situacao);
  return {
    id: i.id,
    rotulo: requisitoDoGp ? "sugestao" : marcadoPeloPmo || i.rotulo === "decisao-gp" ? "decisao" : i.rotulo,
    avisos: [i.trava ?? "", i.aviso ?? "", naoLocalizado ? "não localizado pelo código" : ""].filter(Boolean),
    texto: `${i.nome}: ${i.texto}`,
    grupo: i.secao,
    ...(i.impacto ? { impacto: IMPACTO_DA_ETAPA_1[i.impacto] ?? 5 } : {}),
  };
}

/** As revisões com os ids aceitos pelo GP (o aceite em lote é um clique dele). */
export function aceitar(revisoes: Record<string, RevisaoItem>, ids: string[]): Record<string, RevisaoItem> {
  const novas = { ...revisoes };
  for (const id of ids) novas[id] = { estado: "aceito" };
  return novas;
}

/** Até quando o GP decide, por etapa (decisão 0088). */
export const PRAZO_DAS_DECISOES: Record<number, string> = {
  1: "antes do prazo de pedir esclarecimento",
  2: "antes de enviar a proposta",
  3: "antes da reunião de abertura e da aprovação do TAP",
  4: "antes de aprovar o plano",
  5: "antes de assinar o plano",
};

/** A fila numa linha, para a capa: decisões (itens e as que não são item), a conferir e o que pode ir em lote. */
export function resumoDaFila(
  itens: ItemRevisavel[],
  revisoes: Record<string, RevisaoItem>,
  /** Decisões que não são item (participar, abordagem, divergências, aprovação): contam como decisão do GP. */
  outrasDecisoes: string[] = [],
): string {
  const c = contarFila(filaDePendencias(itens, revisoes));
  return `${contar(c.decisao + outrasDecisoes.length, "decisão", "decisões")} · ${c.conferir} a conferir · ${c.documento + c.sugestao} em lote`;
}

/** As duas linhas da fila nos números-chave: a fila curta e, à parte, até quando decidir (decisão 0089). */
export function numerosDaFila(
  etapa: number,
  itens: ItemRevisavel[],
  revisoes: Record<string, RevisaoItem>,
  outrasDecisoes: string[] = [],
): { rotulo: string; valor: string }[] {
  const prazo = PRAZO_DAS_DECISOES[etapa];
  return [
    { rotulo: "Fila do GP", valor: resumoDaFila(itens, revisoes, outrasDecisoes) },
    ...(prazo ? [{ rotulo: "Decidir", valor: prazo.replace(/^./, (x) => x.toUpperCase()) }] : []),
  ];
}
