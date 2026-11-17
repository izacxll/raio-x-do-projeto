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

/** Chave da conferência no dossiê: "2:conteudo", "4:cronograma". */
export function chaveDaSegundaInstancia(etapa: number, passo: string): string {
  return `${etapa}:${passo}`;
}

/** Texto de sistema da segunda instância: só a skill, sem as referências da etapa. */
export function sistemaDaSegundaInstancia(): string {
  return textoDeSistema([{ titulo: "SKILL.md", texto: textoSkill }]);
}

export function pedidoSegundaInstancia(etapa: number, passo: string, resposta: unknown): string {
  return `# Segunda instância — conferência da resposta da etapa ${etapa}, passo ${passo}

Você é a segunda instância (SKILL.md, seção 3, "Conferência por uma segunda instância"). Outra chamada, com o mesmo método, produziu a resposta abaixo. Confira-a contra os documentos acima e contra a skill, **antes** de o GP aprovar e de a próxima etapa começar. Você não reescreve a resposta: aponta o que precisa mudar.

## Resposta a conferir (JSON)
\`\`\`json
${JSON.stringify(resposta, null, 2)}
\`\`\`

# O que procurar
1. erro_de_fato: o que a resposta afirma e o documento não diz, ou diz diferente (número, prazo, data, quem faz, o que se entrega); citação que não prova a frase.
2. faltou: o que o método e as fichas pedem para este passo e a resposta não trouxe (requisito R sem destino, compromisso C sem destino, premissa crítica que se aplica e não está escrita, linha do tempo sem conferência dos marcos, aceite sem ajuste e nova análise, campo sem quantidade antes do preço).
3. incoerencia_entre_etapas: a resposta contradiz o que veio das etapas anteriores e está nos documentos (proposta, TAP), ou contradiz a si mesma (marco que não cabe tratado como se coubesse, abordagem que reduz um R apresentada como equivalente).
4. rotulo_errado: "documento" sem trecho que prove a frase; sugestão escrita como fato; decisão do GP preenchida como fato.

# Como responder
- achados: um por problema, com tipo, gravidade (alta: muda preço, prazo, escopo ou quem executa, ou afirma como fato o que o documento não diz; media: o GP precisa corrigir antes de aprovar; baixa: redação ou rastreabilidade), onde (o id do item, a parte ou a seção), texto, evidencias (doc, página do arquivo e trecho literal; [] quando o problema é a falta) e sugestao em redação condicional.
- conferido: o que você conferiu e passou, em frases curtas. Aparece sempre.
- Precisão antes de cobertura: só aponte o que muda uma decisão do GP ou o que a FGV terá de fazer, entregar, cumprir ou pagar. Não repita o que o código já confere (citação na página, contas, datas).
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
): string {
  return [
    `# Segunda instância — etapa ${etapa}, passo ${passo}`,
    "",
    `Achados: ${res.achados.length} (alta: ${res.altas}). Todo achado é Sugestão: quem decide é o GP.`,
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
