// Etapa 2: os itens que o PMO devolveu, achatados com um id estável (a revisão do GP fica no dossiê por ele), cada
// um com a conferência do código (citação, redação, números sem fonte). Também a avaliação de uma resposta, usada
// na comparação de modelos (decisão 0002).
import type { DocumentoLido, PropostaDossie, RevisaoItem, EstadoItem } from "../../dossie/esquema";
import { MODELO_PADRAO } from "../../config/modelo";
import type { RespostaPmo } from "../../pmo/cliente";
import { conferirItem, type ConferenciaItem } from "../../pmo/redacao";
import { citacaoValeComoFato } from "../../pmo/citacoes";
import type { ItemPmo } from "../../pmo/schemas/comum";
import type { RespostaConteudo, RespostaEap, RespostaEstrategia } from "../../pmo/schemas/proposta";
import type { Requisito } from "../../extracao/requisitos";

export function propostaInicial(modelo: string = MODELO_PADRAO): PropostaDossie {
  return {
    modelo,
    premissasAplicaveis: {},
    revisoes: {},
    parametros: { valoresHora: {}, despesas: [], nomes: {} },
    uso: [],
  };
}

export type PassoProposta = "estrategia" | "conteudo" | "eap";

export interface ItemProposta {
  /** "estrategia:comoSeraAvaliada:0", "conteudo:estrutura:2:1"… estável enquanto a resposta não muda. */
  id: string;
  passo: PassoProposta;
  /** Onde o item fica na proposta (para a tela e a exportação). */
  grupo: string;
  item: ItemPmo;
  /** Texto extra que vem junto (consequência da premissa, prazo da obrigação). */
  complemento?: string;
  conferencia: ConferenciaItem;
}

export const NOME_GRUPO: Record<string, string> = {
  comoSeraAvaliada: "Como a proposta será avaliada",
  ondeEstaoOsPontos: "Onde estão os pontos",
  observacoes: "Observações do PMO",
  exclusoes: "Exclusões",
  premissas: "Premissas",
  restricoes: "Restrições",
  obrigacoesContratante: "Obrigações do contratante",
  despesas: "Despesas a considerar",
  reservas: "Riscos que pedem reserva",
  estrategiasPreco: "Estratégias de preço",
};

export function itensDaEstrategia(e: RespostaEstrategia, docs: DocumentoLido[]): ItemProposta[] {
  const out: ItemProposta[] = [];
  for (const grupo of ["comoSeraAvaliada", "ondeEstaoOsPontos", "observacoes"] as const)
    e[grupo].forEach((item, k) =>
      out.push({
        id: `estrategia:${grupo}:${k}`,
        passo: "estrategia",
        grupo: NOME_GRUPO[grupo] ?? grupo,
        item,
        conferencia: conferirItem(item, docs),
      }),
    );
  return out;
}

export function itensDoConteudo(c: RespostaConteudo, docs: DocumentoLido[]): ItemProposta[] {
  const out: ItemProposta[] = [];
  c.estrutura.forEach((s, i) =>
    s.itens.forEach((item, k) =>
      out.push({
        id: `conteudo:estrutura:${i}:${k}`,
        passo: "conteudo",
        grupo: `Seção ${i + 1} — ${s.titulo}`,
        item,
        conferencia: conferirItem(item, docs),
      }),
    ),
  );
  for (const grupo of ["exclusoes", "restricoes"] as const)
    c[grupo].forEach((item, k) =>
      out.push({
        id: `conteudo:${grupo}:${k}`,
        passo: "conteudo",
        grupo: NOME_GRUPO[grupo] ?? grupo,
        item,
        conferencia: conferirItem(item, docs),
      }),
    );
  c.premissas.forEach((p, k) =>
    out.push({
      id: `conteudo:premissas:${k}`,
      passo: "conteudo",
      grupo: NOME_GRUPO.premissas ?? "Premissas",
      item: p.item,
      complemento: `${p.premissaCritica ? `Premissa crítica ${p.premissaCritica}. ` : ""}Se não se confirmar: ${p.consequencia}`,
      conferencia: conferirItem(p.item, docs),
    }),
  );
  c.obrigacoesContratante.forEach((o, k) =>
    out.push({
      id: `conteudo:obrigacoesContratante:${k}`,
      passo: "conteudo",
      grupo: NOME_GRUPO.obrigacoesContratante ?? "Obrigações do contratante",
      item: o.item,
      complemento: `Prazo: ${o.prazo}`,
      conferencia: conferirItem(o.item, docs),
    }),
  );
  return out;
}

export function itensDaEap(eap: RespostaEap, docs: DocumentoLido[]): ItemProposta[] {
  const out: ItemProposta[] = [];
  for (const grupo of ["despesas", "reservas", "estrategiasPreco"] as const)
    eap[grupo].forEach((item, k) =>
      out.push({
        id: `eap:${grupo}:${k}`,
        passo: "eap",
        grupo: NOME_GRUPO[grupo] ?? grupo,
        item,
        conferencia: conferirItem(item, docs),
      }),
    );
  return out;
}

export function itensDaProposta(p: PropostaDossie, docs: DocumentoLido[]): ItemProposta[] {
  return [
    ...(p.estrategia ? itensDaEstrategia(p.estrategia.resposta, docs) : []),
    ...(p.conteudo ? itensDoConteudo(p.conteudo.resposta, docs) : []),
    ...(p.eap ? itensDaEap(p.eap.resposta, docs) : []),
  ];
}

export function estadoDe(revisoes: Record<string, RevisaoItem>, id: string): EstadoItem {
  return revisoes[id]?.estado ?? "pendente";
}

/** O texto que vale: o editado pelo GP, ou o do PMO. */
export function textoFinalProposta(i: ItemProposta, revisoes: Record<string, RevisaoItem>): string {
  const r = revisoes[i.id];
  return r?.estado === "editado" && r.textoEditado?.trim() ? r.textoEditado : i.item.texto;
}

/**
 * Pendências que mantêm o cabeçalho de minuta: item sem revisão, abordagem não escolhida, decisões do GP do preço.
 */
export function contarPendentesProposta(p: PropostaDossie, itens: ItemProposta[]): number {
  let n = itens.filter((i) => estadoDe(p.revisoes, i.id) === "pendente").length;
  if (p.estrategia && !p.abordagem) n++;
  return n;
}

/** Guarda o uso de uma chamada no dossiê (tokens e valor, nunca a chave). */
export function registrarUso(p: PropostaDossie, passo: string, r: RespostaPmo<unknown>): PropostaDossie {
  return {
    ...p,
    uso: [
      ...p.uso,
      {
        passo,
        modelo: r.modelo,
        entrada: r.uso.entrada,
        saida: r.uso.saida,
        escritaCache: r.uso.escritaCache,
        leituraCache: r.uso.leituraCache,
        custoUsd: r.custo,
        em: r.em,
      },
    ],
  };
}

// ---------- avaliação de uma resposta (comparação de modelos, decisão 0002) ----------

export interface AvaliacaoResposta {
  itens: number;
  sugestoes: number;
  /** Sugestões com redação condicional e sem afirmação ÷ sugestões. */
  aderencia: number;
  /** Números (valor, prazo, percentual, quantidade) sem fonte: tem de ser zero. */
  numerosSemFonte: number;
  citacoes: number;
  citacoesConferidas: number;
  /** Itens "do documento" com citação que o código não achou. */
  fatosSemCitacao: number;
  /** Requisitos (R) citados ao menos uma vez ÷ requisitos da etapa 1. */
  cobertura: number;
  requisitosNaoCobertos: string[];
}

export function avaliarItens(
  itens: ItemProposta[],
  requisitos: Requisito[],
  outrosRequisitos: string[] = [],
): AvaliacaoResposta {
  const sugestoes = itens.filter((i) => i.item.rotulo === "sugestao");
  const citacoes = itens.flatMap((i) => i.conferencia.citacoes);
  const citados = new Set([...itens.flatMap((i) => i.item.requisitos), ...outrosRequisitos]);
  const naoCobertos = requisitos.map((r) => r.numero).filter((n) => !citados.has(n));
  return {
    itens: itens.length,
    sugestoes: sugestoes.length,
    aderencia: sugestoes.length
      ? sugestoes.filter((i) => !i.conferencia.redacaoAConferir).length / sugestoes.length
      : 1,
    numerosSemFonte: itens.reduce((s, i) => s + i.conferencia.numerosSemFonte.length, 0),
    citacoes: citacoes.length,
    citacoesConferidas: citacoes.filter(citacaoValeComoFato).length,
    fatosSemCitacao: itens.filter((i) => i.conferencia.citacaoNaoConferida).length,
    cobertura: requisitos.length ? (requisitos.length - naoCobertos.length) / requisitos.length : 1,
    requisitosNaoCobertos: naoCobertos,
  };
}

/** Requisitos citados fora dos itens rotulados (abordagens, produtos, atividades, perfis). */
export function requisitosCitadosForaDosItens(
  p: Pick<PropostaDossie, "estrategia" | "conteudo" | "eap">,
): string[] {
  return [
    ...(p.estrategia?.resposta.abordagens.flatMap((a) => a.requisitos) ?? []),
    ...(p.conteudo?.resposta.produtos.flatMap((x) => x.requisitos) ?? []),
    ...(p.eap?.resposta.atividades.flatMap((a) => a.requisitos) ?? []),
    ...(p.eap?.resposta.perfis.map((x) => x.requisito).filter(Boolean) ?? []),
  ];
}
