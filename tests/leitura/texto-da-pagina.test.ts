import { describe, expect, it } from "vitest";
import { montarLinhas } from "../../src/leitura/texto-da-pagina";

const p = (str: string, x: number, y: number, width = str.length * 5, height = 10) => ({
  str,
  transform: [10, 0, 0, 10, x, y],
  width,
  height,
});

describe("montarLinhas", () => {
  it("junta pedaços da mesma altura numa linha e ordena de cima para baixo", () => {
    const t = montarLinhas([p("segunda", 0, 100), p("Primeira", 0, 200), p("linha", 42, 200)]);
    expect(t).toBe("Primeira linha\nsegunda");
  });

  it("vira tabulação um vão grande (coluna de tabela)", () => {
    const t = montarLinhas([p("Item", 0, 100, 20), p("R$ 10,00", 300, 100)]);
    expect(t).toBe("Item\tR$ 10,00");
  });

  it("não insere espaço entre pedaços colados", () => {
    expect(montarLinhas([p("pala", 0, 100, 20), p("vra", 20, 100)])).toBe("palavra");
  });

  it("ignora o que não é texto", () => {
    expect(montarLinhas([{ type: "beginMarkedContent" }, p("ok", 0, 0)])).toBe("ok");
  });
});
