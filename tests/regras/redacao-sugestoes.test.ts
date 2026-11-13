// "Sugerir, nunca afirmar": procura, nos textos marcados como sugestão, frases afirmativas sem rótulo
// (seção 13 da especificação, testes). Vale para as perguntas da etapa 1 e para os modelos de texto do vago.
import { describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { PADROES_VAGO } from "../../src/regras/vago";
import { documentoLido } from "../etapas/rfp-ajudantes";

/** Frases que afirmam, ordenam ou dão parecer: proibidas em sugestão. */
const AFIRMATIVAS =
  /\b(?:é obrigatório|é ilegal|é nulo|está errad[oa]|a FGV deve|o GP deve|deve-se|é preciso que|certamente|com certeza|sem dúvida|parecer jurídico:)/i;
/** Uma sugestão traz a marca da redação condicional; uma pergunta pede esclarecimento. */
const CONDICIONAL = /sugere-se|recomenda-se|uma opção é|pode-se avaliar|recomenda-se avaliar/i;
const PEDIDO = /^(?:Solicita-se|O documento traz)/;

const EDITAL = documentoLido([
  "EDITAL DE PREGÃO ELETRÔNICO Nº 1/2027\n1. DO OBJETO\nA contratada apresentará relatórios oportunamente, quando necessário, entre outros.\nA Secretaria deverá fornecer os dados. O relatório será entregue em 20 dias após o recebimento dos dados.\nO pagamento será feito após a aprovação do relatório final.\nAs despesas com deslocamento e hospedagem correrão por conta da contratada.\nÉ vedada a subcontratação. A contratada fará pesquisa de campo.",
  "O prazo de vigência do contrato é de 12 (doze) meses.\nO prazo de vigência do contrato é de 6 (seis) meses.",
]);

describe("redação das sugestões", () => {
  const a = analisarRfp([EDITAL]);
  const sugestoes = a.itens.filter((i) => i.rotulo === "sugestao");

  it("o edital de teste gera sugestões de vários tipos", () => {
    expect(new Set(sugestoes.map((i) => i.campos?.Tipo)).size).toBeGreaterThanOrEqual(3);
  });

  it("toda pergunta sugerida é pedido de esclarecimento, sem afirmação", () => {
    for (const i of sugestoes.filter((x) => x.pergunta)) {
      expect(i.pergunta, i.id).toMatch(PEDIDO);
      expect(i.pergunta, i.id).not.toMatch(AFIRMATIVAS);
    }
  });

  it("os resumos marcados como sugestão usam redação condicional ou contam fatos do documento", () => {
    for (const i of sugestoes.filter((x) => !x.pergunta)) {
      expect(i.texto, i.id).not.toMatch(AFIRMATIVAS);
    }
  });

  it("os modelos de texto do vago são condicionais", () => {
    for (const p of PADROES_VAGO) {
      expect(p.sugestao, p.id).toMatch(CONDICIONAL);
      expect(p.sugestao, p.id).not.toMatch(AFIRMATIVAS);
    }
  });
});
