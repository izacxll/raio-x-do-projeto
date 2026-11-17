// Registro das questões (B9) montado pelo código: uma linha QU-nn para cada ponto da etapa 1 com pergunta (pontos
// de atenção da leitura do PMO e brechas do código, sem os descartados pelo GP) e para cada divergência de texto do
// TAP sem decisão do GP. Cada linha leva a origem (etapa-1:aN, o id da brecha ou dvN). O PMO completa tipo,
// prioridade, responsável, data-alvo e status; a conferência liga cada QU ao item que começa por "QU-nn —", aponta
// questão sem origem, origem sem questão e questão nova com fonte, e lê o status com as referências.
import type { ItemConferido } from "../../pmo/itens";
import type { PgpDossie } from "../../dossie/esquema";
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
/** O item que registra a questão começa por "QU-nn —"; os outros que citam o número são referência cruzada. */
const RE_DONO = /^\s*QU-(\d{2,})\b/;

const numeroQu = (n: string) => `QU-${n.padStart(2, "0")}`;

/** Ids que uma questão pode citar no status: itens do plano, atividades, riscos, pacotes, compromissos e questões. */
export function referenciasDoPlano(
  e: EntradaPgp,
  p: PgpDossie | undefined,
  itens: ItemConferido[],
  qs: QuestaoDoCodigo[] = [],
): Set<string> {
  return new Set([
    ...itens.map((i) => i.item.id),
    ...(p?.cronograma?.resposta.atividades.map((a) => a.id) ?? []),
    ...(p?.riscos?.resposta.riscos.map((r) => r.id) ?? []),
    ...(p?.escopo?.resposta.eap.map((x) => x.id) ?? []),
    ...(e.dadosProposta?.compromissos.map((c) => c.numero) ?? []),
    ...qs.map((q) => q.numero),
  ]);
}

export interface StatusQuestao {
  /** O texto depois de "Status:", como o PMO escreveu. */
  texto: string;
  estado: "aberta" | "em andamento" | "tratada" | "resolvida" | "encerrada" | "outro";
  /** Ids citados no status que o código achou no plano, na proposta ou no registro. */
  referencias: string[];
  /** Ids citados no status que o código não achou. */
  naoLocalizadas: string[];
  /** O que a conferência aponta (status sem referência, resolução sem registro). */
  avisos: string[];
}

const ESTADOS: [RegExp, StatusQuestao["estado"]][] = [
  [/^aberta/i, "aberta"],
  [/^em andamento/i, "em andamento"],
  [/^tratada/i, "tratada"],
  [/^resolvida/i, "resolvida"],
  [/^(?:encerrada|fechada|conclu[ií]da)/i, "encerrada"],
];
const RE_REFERENCIA = /\b(C\d{2}|QU-\d{2,}|[a-z]{1,3}\d+(?:-\d+)?[a-z]?|\d+\.\d+)\b/g;

/**
 * Lê o status do item da questão. Status diferente de "aberta" vale com referência que o código acha (C, item,
 * atividade, risco, pacote ou outra questão); "resolvida" ou "encerrada" com algo ainda a registrar fica com aviso.
 */
export function lerStatus(texto: string, conhecidas: Set<string>): StatusQuestao | undefined {
  const m = /\bStatus:\s*([\s\S]+)$/i.exec(texto);
  if (!m) return undefined;
  const status = m[1]!.trim();
  const estado = ESTADOS.find(([re]) => re.test(status))?.[1] ?? "outro";
  const citadas = [...new Set([...status.matchAll(RE_REFERENCIA)].map((x) => x[1]!))];
  const referencias = citadas.filter((x) => conhecidas.has(x));
  const naoLocalizadas = citadas.filter((x) => !conhecidas.has(x) && /^(?:C\d{2}|QU-|[a-z])/.test(x));
  const avisos: string[] = [];
  if (estado !== "aberta" && !referencias.length)
    avisos.push(`status "${estado}" sem referência que o código ache no plano`);
  if (naoLocalizadas.length) avisos.push(`referência não localizada: ${naoLocalizadas.join(", ")}`);
  if (
    (estado === "resolvida" || estado === "encerrada") &&
    /\b(?:falta|pendente|a registrar|a confirmar)/i.test(status)
  )
    avisos.push(
      `"${estado}" com registro pendente: conta como aberta até o registro (ata, ofício ou contrato)`,
    );
  return { texto: status, estado, referencias, naoLocalizadas, avisos };
}

export interface LinhaQuestao {
  questao: QuestaoDoCodigo;
  /** O item do B9 que registra a questão (começa por "QU-nn —"). */
  item?: string;
  /** Outros itens do B9 que citam a questão. */
  citadaEm: string[];
  status?: StatusQuestao;
}

export interface QuestaoNova {
  numero: string;
  item: string;
  /** "TAP p. 10; RFP p. 4" */
  fontes: string;
  /** A citação foi achada na página pelo código. */
  citacaoConferida: boolean;
  status?: StatusQuestao;
}

export interface ConferenciaQuestoes {
  linhas: LinhaQuestao[];
  /** Origem sem questão: QU do código sem item do B9 que a registre. */
  semItem: string[];
  /** Questão nova (número que o código não registrou) com fonte no item. */
  novas: QuestaoNova[];
  /** Questão sem origem: número novo sem fonte no item. */
  semOrigem: string[];
}

/** Confere o B9 escrito pelo PMO contra as linhas do código. */
export function conferirQuestoes(
  qs: QuestaoDoCodigo[],
  itens: ItemConferido[],
  conhecidas: Set<string> = new Set(qs.map((q) => q.numero)),
): ConferenciaQuestoes {
  const doB9 = itens.filter((i) => i.grupo.startsWith("B9 —"));
  const dono = (i: ItemConferido) => {
    const m = RE_DONO.exec(i.item.texto);
    return m ? numeroQu(m[1]!) : undefined;
  };
  const citadas = (i: ItemConferido) => [...i.item.texto.matchAll(RE_QU)].map((m) => numeroQu(m[1]!));
  const linhas = qs.map((q) => {
    const registro = doB9.find((i) => dono(i) === q.numero);
    return {
      questao: q,
      item: registro?.item.id,
      citadaEm: doB9.filter((i) => i !== registro && citadas(i).includes(q.numero)).map((i) => i.item.id),
      status: registro && lerStatus(registro.item.texto, conhecidas),
    };
  });
  const doCodigo = new Set(qs.map((q) => q.numero));
  const registrosNovos = doB9.filter((i) => {
    const n = dono(i);
    return n && !doCodigo.has(n);
  });
  const novas = registrosNovos
    .filter((i) => i.item.fontes.length)
    .map((i) => ({
      numero: dono(i)!,
      item: i.item.id,
      fontes: i.item.fontes.map((f) => `${f.doc.toUpperCase()} p. ${f.pagina}`).join("; "),
      citacaoConferida: !i.conferencia.citacaoNaoConferida,
      status: lerStatus(i.item.texto, conhecidas),
    }));
  return {
    linhas,
    semItem: linhas.filter((l) => !l.item).map((l) => l.questao.numero),
    novas,
    semOrigem: registrosNovos.filter((i) => !i.item.fontes.length).map((i) => dono(i)!),
  };
}
