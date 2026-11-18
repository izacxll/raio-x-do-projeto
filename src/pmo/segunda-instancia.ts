// Segunda instância (decisão 0057): a chamada separada que confere cada resposta do PMO antes da etapa seguinte.
// Vai só a skill (sem as referências da etapa), os documentos e a resposta. O código confere as evidências que ela
// cita, como faz com toda citação; achado com evidência não conferida continua visível, marcado.
import textoSkill from "../../.claude/skills/pmo/SKILL.md?raw";
import type { DocumentoLido, SegundaInstanciaDossie } from "../dossie/esquema";
import { citacaoValeComoFato, conferirCitacao } from "./citacoes";
import { diferencasDaResposta, documentosCitados, pedidoDaRodadaSeguinte } from "./segunda-rodada";
import { type IdentidadeDoCaso, identidadeEmTexto } from "./identidade-do-caso";
import { formatarTapRevisado, type TapRevisado } from "./tap-revisado";
import { skillDaEtapa, textoDeSistema } from "./montagem";
import type {
  AchadoSegundaInstancia,
  GravidadeSegunda,
  RespostaSegundaInstancia,
  TipoAchadoSegunda,
} from "./schemas/segunda-instancia";

export const NOME_TIPO_SEGUNDA: Record<TipoAchadoSegunda, string> = {
  erro_de_fato: "erro de fato",
  faltou: "o que faltou",
  incoerencia_entre_etapas: "incoerência entre etapas",
  rotulo_errado: "rótulo errado",
};

export const NOME_GRAVIDADE_SEGUNDA: Record<GravidadeSegunda, string> = {
  alta: "alta",
  media: "média",
  baixa: "baixa",
};

/**
 * Rodada da próxima conferência do passo (decisão 0059): a mesma, se a resposta conferida é a mesma; a seguinte, se a
 * resposta do passo mudou desde a última conferência. Nas premissas, também a seguinte se o TAP revisado que foi no
 * pedido mudou (decisão 0068; conferência antiga, sem a versão do TAP, não conta como mudança).
 */
export function proximaRodada(
  anterior: { deResposta: string; deAnterior?: string; rodada?: number } | undefined,
  respostaEm: string,
  versaoDoTap?: string,
): number {
  if (!anterior) return 1;
  const r = anterior.rodada ?? 1;
  return conferenciaVelha(anterior, respostaEm, versaoDoTap) ? r + 1 : r;
}

/**
 * A conferência guardada ainda vale? Vale para a mesma resposta do passo e, nas premissas, para o mesmo TAP revisado.
 * Devolve o motivo quando não vale.
 */
export function conferenciaVelha(
  guardada: { deResposta: string; deAnterior?: string } | undefined,
  respostaEm: string,
  versaoDoTap?: string,
): "sem-conferencia" | "resposta-mudou" | "tap-mudou" | "tap-ausente" | undefined {
  if (!guardada) return "sem-conferencia";
  if (guardada.deResposta !== respostaEm) return "resposta-mudou";
  if (guardada.deAnterior === undefined || guardada.deAnterior === versaoDoTap) return undefined;
  return versaoDoTap === undefined ? "tap-ausente" : "tap-mudou";
}

/** Chave da conferência no dossiê: "2:conteudo", "4:cronograma". */
export function chaveDaSegundaInstancia(etapa: number, passo: string): string {
  return `${etapa}:${passo}`;
}

/** Texto de sistema da segunda instância: só a skill, sem as referências da etapa. */
export function sistemaDaSegundaInstancia(etapa?: number): string {
  // com a etapa, o SKILL.md recortado para ela (decisão 0064), como no pedido do passo conferido
  return textoDeSistema([
    etapa
      ? { titulo: `SKILL.md (etapa ${etapa})`, texto: skillDaEtapa(etapa) }
      : { titulo: "SKILL.md", texto: textoSkill },
  ]);
}

/**
 * Pedido da segunda instância (decisões 0057 e 0059). Leva o pedido do passo conferido, como foi ao PMO: o esqueleto do
 * código (números R e C, contas e datas) e a lista do que o passo exige. A rubrica é essa lista, nem mais nem menos.
 * No topo, a identidade do caso (decisão 0066): o revisor confere que tudo é deste caso antes de achar. Nas premissas,
 * depois do pedido do passo, o TAP revisado pelo GP (decisão 0068): é com ele que se confere a coerência.
 */
export function pedidoSegundaInstancia(
  etapa: number,
  passo: string,
  resposta: unknown,
  pedidoDoPasso = "",
  {
    identidade,
    tapRevisado,
    anterior,
  }: {
    identidade?: IdentidadeDoCaso;
    tapRevisado?: TapRevisado;
    /** A conferência da rodada anterior (decisão 0071): os achados dela vão no pedido, para o revisor ver se saíram. */
    anterior?: { rodada: number; resposta: RespostaSegundaInstancia };
  } = {},
): string {
  return `# Segunda instância — conferência da resposta da etapa ${etapa}, passo ${passo}
${identidade ? `\n${identidadeEmTexto(identidade)}\n` : ""}
Você é a segunda instância (revisão em camadas; a rubrica fixa vai abaixo, em "O que procurar"). Outra chamada produziu a resposta abaixo a partir do pedido do passo, que também vai abaixo, com o esqueleto do código. Confira a resposta contra os documentos acima, contra o esqueleto e contra o que o pedido do passo exige, **antes** de o GP aprovar e de a próxima etapa começar. Você não reescreve a resposta: aponta o que precisa mudar.

## Pedido do passo conferido (como foi ao PMO, com o esqueleto do código)
${pedidoDoPasso.trim() ? `<pedido-do-passo>\n${pedidoDoPasso.trim()}\n</pedido-do-passo>` : "(o pedido do passo não veio: confira só contra os documentos e a skill, e diga isso em conferido)"}
${tapRevisado ? `\n${formatarTapRevisado(tapRevisado)}\n` : ""}${anterior ? `\n${achadosDaRodadaAnterior(anterior)}\n` : ""}
## Resposta a conferir (JSON)
\`\`\`json
${JSON.stringify(resposta, null, 2)}
\`\`\`

# O que procurar
A régua é o pedido do passo: o que ele exige, nem mais nem menos. Item do método ou das fichas que o pedido não pediu não é falta.
1. erro_de_fato: o que a resposta afirma e o documento não diz, ou diz diferente (número, prazo, data, quem faz, o que se entrega); número, R, C, conta ou data que não bate com o esqueleto do código; citação que não prova a frase.
2. faltou: o que o pedido do passo exige (as seções, os campos e a autoconferência da lista "O que fazer" e das regras dele) e a resposta não trouxe.
3. incoerencia_entre_etapas: a resposta contradiz o esqueleto e as contas do código, ou o que veio das etapas anteriores e está nos documentos (proposta, TAP)${tapRevisado ? " ou no TAP revisado acima" : ""}, ou contradiz a si mesma. Só conta o que está neste pedido: não aponte incoerência com versão que não veio nele.
4. rotulo_errado: rótulo ou premissa errados: "documento" sem trecho que prove a frase; sugestão escrita como fato; decisão do GP preenchida como fato; premissa crítica no lugar errado; nome de pessoa.

# Como responder
- achados: um por problema, com tipo, gravidade (alta só quando muda escopo, prazo, preço, caixa, aceite ou quem executa; media: o GP precisa corrigir antes de aprovar; baixa: redação ou rastreabilidade), onde (o id do item, a parte ou a seção), texto, evidencias (doc, página do arquivo e trecho literal; [] quando o problema é a falta) e sugestao em redação condicional.
- conferido: o que você conferiu e passou, em frases curtas (inclusive os números R e C e as contas do esqueleto). Aparece sempre.
- Precisão antes de cobertura: só aponte o que muda uma decisão do GP ou o que a FGV terá de fazer, entregar, cumprir ou pagar. Não refaça as contas do código: use as do esqueleto. Achado sobre número ou conta diz em que linha do esqueleto ele se apoia, porque o GP o confere no placar antes de corrigir.
- Responda só com o objeto JSON, no schema enviado. Listas sem conteúdo ficam com [].`;
}

/** Os achados da rodada anterior no pedido completo (decisão 0071): o revisor diz se cada um foi resolvido. */
function achadosDaRodadaAnterior(a: { rodada: number; resposta: RespostaSegundaInstancia }): string {
  return [
    `## Achados da rodada ${a.rodada} (a resposta abaixo foi corrigida depois deles)`,
    ...(a.resposta.achados.length
      ? a.resposta.achados.map(
          (x) =>
            `- ${x.id} · ${NOME_GRAVIDADE_SEGUNDA[x.gravidade]} · ${NOME_TIPO_SEGUNDA[x.tipo]} · ${x.onde}: ${x.texto}${x.sugestao ? ` Sugestão: ${x.sugestao}` : ""}`,
        )
      : ["- nenhum"]),
    `Diga em "conferido" quais deles foram resolvidos; o não resolvido volta como achado, com o id dele no começo do "onde".`,
  ].join("\n");
}

/** O pedido da segunda instância e os documentos que vão com ele. */
export interface PedidoDaSegunda {
  pedido: string;
  documentos: DocumentoLido[];
  rodada: number;
  /** Rodada seguinte só com o diff, os achados anteriores e as páginas citadas (decisão 0071). */
  compacta: boolean;
  /** Quantos itens mudaram desde a rodada anterior (só na compacta). */
  itensQueMudaram?: number;
}

/**
 * Monta o pedido da segunda instância, igual no app e no teste externo (decisões 0057, 0059 e 0071):
 * - rodada 1, ou sem a resposta conferida guardada: o pedido completo (pedido do passo, esqueleto, documentos);
 * - rodada seguinte com a resposta mudada (e, nas premissas, o mesmo TAP revisado): o pedido compacto, com os achados
 *   da rodada anterior, o que mudou na resposta e só as páginas citadas;
 * - "completa": o pedido completo, com os achados da rodada anterior.
 */
export function montarPedidoDaSegunda(o: {
  etapa: number;
  passo: string;
  resposta: unknown;
  respostaEm: string;
  pedidoDoPasso: string;
  documentos: DocumentoLido[];
  identidade?: IdentidadeDoCaso;
  tapRevisado?: TapRevisado;
  guardada?: SegundaInstanciaDossie;
  completa?: boolean;
}): PedidoDaSegunda {
  const { etapa, passo, resposta, respostaEm, guardada, tapRevisado, identidade } = o;
  const rodada = proximaRodada(guardada, respostaEm, tapRevisado?.versao);
  const velha = conferenciaVelha(guardada, respostaEm, tapRevisado?.versao);
  const mesmoTap =
    !tapRevisado || guardada?.deAnterior === undefined || guardada.deAnterior === tapRevisado.versao;
  if (!o.completa && guardada && velha === "resposta-mudou" && guardada.conferiu !== undefined && mesmoTap) {
    const dif = diferencasDaResposta(guardada.conferiu, resposta);
    return {
      pedido: pedidoDaRodadaSeguinte(etapa, passo, rodada, guardada.resposta, dif, { identidade }),
      documentos: documentosCitados(o.documentos, guardada.resposta.achados, dif),
      rodada,
      compacta: true,
      itensQueMudaram: dif.length,
    };
  }
  const anterior =
    guardada && velha && velha !== "sem-conferencia"
      ? { rodada: guardada.rodada ?? 1, resposta: guardada.resposta }
      : undefined;
  return {
    pedido: pedidoSegundaInstancia(etapa, passo, resposta, o.pedidoDoPasso, {
      identidade,
      tapRevisado,
      anterior,
    }),
    documentos: o.documentos,
    rodada,
    compacta: false,
  };
}

export interface AchadoConferido extends AchadoSegundaInstancia {
  /** Ao menos uma evidência achada pelo código no documento (ou nenhuma evidência, quando o achado é a falta). */
  evidenciaConferida: boolean;
}

export interface ResultadoSegundaInstancia {
  achados: AchadoConferido[];
  altas: number;
  conferido: string[];
}

export function conferirSegundaInstancia(
  r: RespostaSegundaInstancia,
  documentos: DocumentoLido[],
): ResultadoSegundaInstancia {
  const ordem: Record<GravidadeSegunda, number> = { alta: 0, media: 1, baixa: 2 };
  const achados = r.achados
    .map((a) => ({
      ...a,
      evidenciaConferida:
        !a.evidencias.length || a.evidencias.some((f) => citacaoValeComoFato(conferirCitacao(f, documentos))),
    }))
    .sort((a, b) => ordem[a.gravidade] - ordem[b.gravidade]);
  return { achados, altas: achados.filter((a) => a.gravidade === "alta").length, conferido: r.conferido };
}

/** A conferência em texto (o arquivo conferencia-*.md do teste externo e a exportação). */
export function segundaInstanciaEmTexto(
  etapa: number,
  passo: string,
  res: ResultadoSegundaInstancia,
  rodada = 1,
): string {
  return [
    `# Segunda instância — etapa ${etapa}, passo ${passo}, rodada ${rodada}`,
    "",
    `Achados: ${res.achados.length} (alta: ${res.altas}, média: ${res.achados.filter((a) => a.gravidade === "media").length}). Todo achado é Sugestão: quem decide é o GP.`,
    "",
    "## Achados",
    ...(res.achados.length
      ? res.achados.map(
          (a) =>
            `- **${NOME_GRAVIDADE_SEGUNDA[a.gravidade]}** · ${NOME_TIPO_SEGUNDA[a.tipo]} · ${a.onde}: ${a.texto}${a.sugestao ? ` Sugestão: ${a.sugestao}` : ""}${
              a.evidencias.length
                ? ` (${a.evidencias.map((f) => `${f.doc}, p. ${f.pagina}`).join("; ")}${a.evidenciaConferida ? "" : "; evidência não conferida pelo código"})`
                : ""
            }`,
        )
      : ["- nenhum"]),
    "",
    "## O que foi conferido e passou",
    ...(res.conferido.length ? res.conferido.map((x) => `- ${x}`) : ["- (não informado)"]),
  ].join("\n");
}
