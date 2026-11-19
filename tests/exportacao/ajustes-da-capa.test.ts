// Ajustes da capa (decisão 0087): risco pelo evento e pelo efeito; conflito sobre a régua de prazo no mínimo média.
import { describe, expect, it } from "vitest";
import { eventoEEfeito } from "../../src/exportacao/capas";
import { gravidadeDoConflitoDeRegua } from "../../src/etapas/5-conferencia/leitura-pmo";

describe("risco numa linha", () => {
  it("o evento e o efeito, sem a causa nem a situação", () => {
    expect(
      eventoEEfeito(
        "Causa: o documento não dá prazo ao contratante. Evento: a entrega dos dados atrasa. Efeito: o primeiro produto atrasa. Situação: aberto.",
      ),
    ).toBe("a entrega dos dados atrasa → o primeiro produto atrasa");
  });

  it("sem as marcas, o começo do texto", () => {
    expect(eventoEEfeito("Atraso na entrega dos dados pelo contratante.")).toBe(
      "Atraso na entrega dos dados pelo contratante.",
    );
  });
});

describe("conflito sobre a régua de prazo", () => {
  const achado = (tipo: "conflituoso" | "vago", titulo: string) => ({ tipo, titulo, descricao: "" });
  it("teto numa parte e referência noutra, com o prazo: sobe de baixa para média", () => {
    expect(
      gravidadeDoConflitoDeRegua(
        achado("conflituoso", "Os 6 meses são teto numa parte e referência noutra"),
        "baixa",
      ),
    ).toBe("média");
  });
  it("sem prazo no texto, ou outro tipo, ou já mais grave: fica como está", () => {
    expect(gravidadeDoConflitoDeRegua(achado("conflituoso", "Dois nomes para o mesmo comitê"), "baixa")).toBe(
      "baixa",
    );
    expect(gravidadeDoConflitoDeRegua(achado("vago", "Prazo de 6 meses a definir"), "baixa")).toBe("baixa");
    expect(gravidadeDoConflitoDeRegua(achado("conflituoso", "Teto de 6 meses"), "grave")).toBe("grave");
  });
});
