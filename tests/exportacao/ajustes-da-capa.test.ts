// Ajustes da capa (decisão 0087, com a revisão de código): ausência afirmada só campo a campo, com as duas leituras;
// "sem régua" só com os marcos do TAP em mãos; risco pelo evento e pelo efeito; conflito sobre a régua de prazo.
import { describe, expect, it } from "vitest";
import { camposConfirmadosPeloPmo, eventoEEfeito, reguaDosMarcos } from "../../src/exportacao/capa-regras";
import { gravidadeDoConflitoDeRegua } from "../../src/etapas/5-conferencia/leitura-pmo";

describe("prazo e valor: o PMO confirma, campo a campo", () => {
  it("afirma os dois quando o PMO diz que o documento não traz nenhum dos dois", () => {
    expect(
      camposConfirmadosPeloPmo(
        ["prazo", "valor"],
        ["Prazo e valor: o documento não traz prazo de execução, vigência nem valor estimado."],
      ),
    ).toEqual(["prazo", "valor"]);
  });

  it("não afirma o campo que o PMO deu (ou que outro item do PMO deu)", () => {
    expect(
      camposConfirmadosPeloPmo(
        ["prazo", "valor"],
        ["Prazo e valor: o documento não traz o valor estimado; vigência de 12 meses (p. 4)."],
      ),
    ).toEqual(["valor"]);
    expect(
      camposConfirmadosPeloPmo(
        ["prazo", "valor"],
        ["Prazo: o documento não traz prazo de execução.", "Valor: teto de R$ 1,2 milhão (p. 3)."],
      ),
    ).toEqual(["prazo"]);
  });

  it("verbo de ausência longe do campo, ou sobre outra coisa, não confirma", () => {
    expect(
      camposConfirmadosPeloPmo(
        ["prazo"],
        ["Prazo de impugnação: o edital não informa o endereço do protocolo."],
      ),
    ).toEqual([]);
    expect(camposConfirmadosPeloPmo(["valor"], ["Não tem reajuste."])).toEqual([]);
  });
});

describe("régua dos marcos", () => {
  it("sem os marcos do TAP, não localizados (não é ausente)", () => {
    expect(reguaDosMarcos([])).toBe("nao-localizados");
  });
  it("com os marcos do TAP sem dias, sem régua; com algum prazo em dias, com régua", () => {
    expect(reguaDosMarcos(["Não informado no documento — a definir pelo GP.", "Pela conta do código."])).toBe(
      "sem-regua",
    );
    expect(reguaDosMarcos(["até 30 dias após a assinatura", "a definir"])).toBe("com-regua");
  });
});

describe("risco numa linha", () => {
  it("as marcas do registro: o evento e o efeito, sem a causa nem a situação", () => {
    expect(
      eventoEEfeito(
        "Causa: o documento não dá prazo ao contratante. Evento: a entrega dos dados atrasa. Efeito: o primeiro produto atrasa. Situação: aberto.",
      ),
    ).toBe("a entrega dos dados atrasa → o primeiro produto atrasa");
  });
  it("marca em minúscula dentro da prosa não corta", () => {
    expect(
      eventoEEfeito(
        "Causa: falta de dados para o evento: lançamento. Evento: o diagnóstico atrasa. Efeito: o fim atrasa.",
      ),
    ).toBe("o diagnóstico atrasa → o fim atrasa");
  });
  it('a forma da ficha: "Por …, pode ocorrer …, afetando …"', () => {
    expect(
      eventoEEfeito(
        "Por falta de acesso aos sistemas, pode ocorrer atraso no levantamento, afetando o prazo do P2.",
      ),
    ).toBe("atraso no levantamento → o prazo do P2");
  });
  it("sem nenhuma forma, o começo do texto", () => {
    expect(eventoEEfeito("Atraso na entrega dos dados pelo contratante.")).toBe(
      "Atraso na entrega dos dados pelo contratante.",
    );
  });
});

describe("conflito sobre a régua de prazo", () => {
  const achado = (tipo: "conflituoso" | "vago", titulo: string) => ({ tipo, titulo });
  it("teto numa parte e referência noutra, com o prazo na mesma frase: média, com o motivo", () => {
    const r = gravidadeDoConflitoDeRegua(
      achado("conflituoso", "Os 8 meses são teto numa parte e referência noutra"),
      "baixa",
    );
    expect(r.gravidade).toBe("média");
    expect(r.motivo).toMatch(/régua de prazo/);
    expect(
      gravidadeDoConflitoDeRegua(
        achado("conflituoso", "Dois prazos para o mesmo marco: 6 (seis) meses e 180 dias"),
        "baixa",
      ).gravidade,
    ).toBe("média");
  });
  it("conflito de outra coisa, outro tipo ou já mais grave: fica como está", () => {
    expect(
      gravidadeDoConflitoDeRegua(
        achado("conflituoso", "Relatório mensal numa parte e quinzenal noutra"),
        "baixa",
      ).gravidade,
    ).toBe("baixa");
    expect(gravidadeDoConflitoDeRegua(achado("vago", "Prazo de 6 meses a definir"), "baixa").gravidade).toBe(
      "baixa",
    );
    expect(gravidadeDoConflitoDeRegua(achado("conflituoso", "Teto de 6 meses"), "grave").gravidade).toBe(
      "grave",
    );
  });
});
