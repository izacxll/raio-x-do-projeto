// Trava "redação a conferir" ajustada pela medição do alarme falso (decisão 0093) e checagem do rótulo misto.
// Exemplos inventados, no formato dos itens do PMO.
import { describe, expect, it } from "vitest";
import { conferirItem, rotuloMisto, sugestaoSemCondicional } from "../../src/pmo/redacao";
import type { ItemPmo } from "../../src/pmo/schemas/comum";

const item = (rotulo: ItemPmo["rotulo"], texto: string): ItemPmo =>
  ({ rotulo, texto, fontes: [], requisitos: [], ficha: "" }) as unknown as ItemPmo;

describe("trava da redação (decisão 0093)", () => {
  it("continua marcando a escolha afirmada como fato", () => {
    expect(
      sugestaoSemCondicional("Reuniões quinzenais com o contratante, conduzidas pelo coordenador."),
    ).toBe(true);
    expect(sugestaoSemCondicional("A FGV deve entregar o relatório em 10 dias.")).toBe(true);
  });

  it("aceita as formas condicionais que a lista antiga não pegava", () => {
    for (const t of [
      "A cadência pode ser mensal.",
      "Data de início a definir.",
      "Os números finais são decisão do GP.",
      "Valores sugeridos pela equipe, a confirmar.",
      "O requisito ganha número quando o GP aceitar.",
      "Caso o contratante atrase, o prazo se desloca.",
    ])
      expect(sugestaoSemCondicional(t), t).toBe(false);
  });

  it("linha de estrutura ou modelo não é marcada", () => {
    for (const t of [
      "Campos: quem pediu, descrição, impacto.",
      "Status: aberta, em análise, decidida.",
      "Escala: baixa, média, alta.",
    ])
      expect(sugestaoSemCondicional(t), t).toBe(false);
  });

  it("registro de riscos e de premissas fica fora da trava", () => {
    const risco = item("sugestao", "Atraso na entrega dos dados pelo contratante.");
    expect(conferirItem(risco, []).redacaoAConferir).toBe(true);
    expect(conferirItem(risco, [], { registro: true }).redacaoAConferir).toBe(false);
  });
});

describe("rótulo misto (decisão 0093)", () => {
  it("item do documento com sugestão ou decisão do GP dentro é marcado", () => {
    expect(rotuloMisto(item("documento", "A vigência é de 12 meses; sugere-se prever prorrogação."))).toBe(
      true,
    );
    expect(rotuloMisto(item("documento", "Prazo de análise de 10 dias; data final a definir pelo GP."))).toBe(
      true,
    );
    expect(rotuloMisto(item("documento", "A vigência é de 12 meses."))).toBe(false);
    expect(rotuloMisto(item("sugestao", "Sugere-se prever prorrogação."))).toBe(false);
  });
});
