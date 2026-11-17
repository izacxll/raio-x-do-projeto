// Registro das questões (B9) montado pelo código: uma linha QU-nn para cada ponto da etapa 1 com pergunta (pontos
// de atenção da leitura do PMO e brechas do código, sem os descartados pelo GP) e para cada divergência de texto do
// TAP sem decisão do GP. Cada linha leva a origem (etapa-1:aN, o id da brecha ou dvN). O PMO completa tipo,
// prioridade, responsável e data-alvo; a conferência aponta questão sem origem e origem sem questão.
import type { ItemConferido } from "../../pmo/itens";
import type { EntradaPgp } from "./entrada";

export interface QuestaoDoCodigo {
  numero: string;
  /** etapa-1:a6, brechas:…, dv2 */
  origem: string;
  texto: string;
}

/** Linhas do B9 na ordem: os pontos da etapa 1, depois as divergências do TAP. Número fixo pela ordem. */
export function questoesDoCodigo(e: EntradaPgp): QuestaoDoCodigo[] {
  const daEtapa1 = e.ponto.brechas
    .filter((b) => b.perguntaFinal.trim())
    // o ponto que juntou a brecha do código do mesmo assunto leva as duas origens ("etapa-1:a4 + brechas:…")
    .map((b) => ({ origem: [b.id, ...(b.junta ?? [])].join(" + "), texto: b.perguntaFinal.trim() }));
  const doTap = (e.divergenciasTapPendentes ?? []).map((d) => ({ origem: d.id, texto: d.texto }));
  return [...daEtapa1, ...doTap].map((x, k) => ({ ...x, numero: `QU-${String(k + 1).padStart(2, "0")}` }));
}

export function questoesEmTexto(qs: QuestaoDoCodigo[]): string {
  return qs.map((q) => `- ${q.numero} (origem ${q.origem}): ${q.texto}`).join("\n");
}

const RE_QU = /\bQU-(\d{2,})\b/g;

export interface ConferenciaQuestoes {
  /** QU do código e o item do B9 que a completa. */
  linhas: { questao: QuestaoDoCodigo; itens: string[] }[];
  /** Origem sem questão: QU do código que nenhum item do B9 traz. */
  semItem: string[];
  /** Questão sem origem: QU que o B9 traz e o código não registrou, sem fonte no item. */
  semOrigem: string[];
}

/** Confere o B9 escrito pelo PMO contra as linhas do código. */
export function conferirQuestoes(qs: QuestaoDoCodigo[], itens: ItemConferido[]): ConferenciaQuestoes {
  const doB9 = itens.filter((i) => i.grupo.startsWith("B9 —"));
  const citadas = doB9.map((i) => ({
    i,
    numeros: [...i.item.texto.matchAll(RE_QU)].map((m) => `QU-${m[1]!.padStart(2, "0")}`),
  }));
  const conhecidas = new Set(qs.map((q) => q.numero));
  const linhas = qs.map((q) => ({
    questao: q,
    itens: citadas.filter((c) => c.numeros.includes(q.numero)).map((c) => c.i.item.id),
  }));
  const semOrigem = [
    ...new Set(
      citadas
        .filter((c) => !c.i.item.fontes.length)
        .flatMap((c) => c.numeros.filter((n) => !conhecidas.has(n))),
    ),
  ];
  return { linhas, semItem: linhas.filter((l) => !l.itens.length).map((l) => l.questao.numero), semOrigem };
}
