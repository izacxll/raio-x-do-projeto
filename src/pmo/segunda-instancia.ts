// Segunda instância (decisão 0057): a chamada separada que confere cada resposta do PMO antes da etapa seguinte.
// Vai só a skill (sem as referências da etapa), os documentos e a resposta. O código confere as evidências que ela
// cita, como faz com toda citação; achado com evidência não conferida continua visível, marcado.
import textoSkill from "../../.claude/skills/pmo/SKILL.md?raw";
import type { DocumentoLido } from "../dossie/esquema";
import { citacaoValeComoFato, conferirCitacao } from "./citacoes";
import { textoDeSistema } from "./montagem";
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
 * resposta do passo mudou desde a última conferência.
 */
export function proximaRodada(
  anterior: { deResposta: string; rodada?: number } | undefined,
  respostaEm: string,
): number {
  if (!anterior) return 1;
  const r = anterior.rodada ?? 1;
  return anterior.deResposta === respostaEm ? r : r + 1;
}

/** Chave da conferência no dossiê: "2:conteudo", "4:cronograma". */
export function chaveDaSegundaInstancia(etapa: number, passo: string): string {
  return `${etapa}:${passo}`;
}

/** Texto de sistema da segunda instância: só a skill, sem as referências da etapa. */
export function sistemaDaSegundaInstancia(): string {
  return textoDeSistema([{ titulo: "SKILL.md", texto: textoSkill }]);
}

/**
 * Pedido da segunda instância (decisões 0057 e 0059). Leva o pedido do passo conferido, como foi ao PMO: o esqueleto do
 * código (números R e C, contas e datas) e a lista do que o passo exige. A rubrica é essa lista, nem mais nem menos.
 */
export function pedidoSegundaInstancia(
  etapa: number,
  passo: string,
  resposta: unknown,
  pedidoDoPasso = "",
): string {
  return `# Segunda instância — conferência da resposta da etapa ${etapa}, passo ${passo}

Você é a segunda instância (SKILL.md, seção 3, "Conferência por uma segunda instância"). Outra chamada produziu a resposta abaixo a partir do pedido do passo, que também vai abaixo, com o esqueleto do código. Confira a resposta contra os documentos acima, contra o esqueleto e contra o que o pedido do passo exige, **antes** de o GP aprovar e de a próxima etapa começar. Você não reescreve a resposta: aponta o que precisa mudar.

## Pedido do passo conferido (como foi ao PMO, com o esqueleto do código)
${pedidoDoPasso.trim() ? `<pedido-do-passo>\n${pedidoDoPasso.trim()}\n</pedido-do-passo>` : "(o pedido do passo não veio: confira só contra os documentos e a skill, e diga isso em conferido)"}

## Resposta a conferir (JSON)
\`\`\`json
${JSON.stringify(resposta, null, 2)}
\`\`\`

# O que procurar
A régua é o pedido do passo: o que ele exige, nem mais nem menos. Item do método ou das fichas que o pedido não pediu não é falta.
1. erro_de_fato: o que a resposta afirma e o documento não diz, ou diz diferente (número, prazo, data, quem faz, o que se entrega); número, R, C, conta ou data que não bate com o esqueleto do código; citação que não prova a frase.
2. faltou: o que o pedido do passo exige (as seções, os campos e a autoconferência da lista "O que fazer" e das regras dele) e a resposta não trouxe.
3. incoerencia_entre_etapas: a resposta contradiz o esqueleto do código ou o que veio das etapas anteriores e está nos documentos (proposta, TAP), ou contradiz a si mesma.
4. rotulo_errado: "documento" sem trecho que prove a frase; sugestão escrita como fato; decisão do GP preenchida como fato.

# Como responder
- achados: um por problema, com tipo, gravidade (alta: muda preço, prazo, escopo ou quem executa, ou afirma como fato o que o documento não diz; media: o GP precisa corrigir antes de aprovar; baixa: redação ou rastreabilidade), onde (o id do item, a parte ou a seção), texto, evidencias (doc, página do arquivo e trecho literal; [] quando o problema é a falta) e sugestao em redação condicional.
- conferido: o que você conferiu e passou, em frases curtas (inclusive os números R e C e as contas do esqueleto). Aparece sempre.
- Precisão antes de cobertura: só aponte o que muda uma decisão do GP ou o que a FGV terá de fazer, entregar, cumprir ou pagar. Não refaça as contas do código: use as do esqueleto.
- Responda só com o objeto JSON, no schema enviado. Listas sem conteúdo ficam com [].`;
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
