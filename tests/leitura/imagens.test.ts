import { describe, expect, it } from "vitest";
import { listarPaginasComImagem, medirImagens } from "../../src/leitura/imagens";

const OPS = { paintImageXObject: 85, paintInlineImageXObject: 86 };

describe("imagens da página", () => {
  it("mede só imagens grandes", async () => {
    const pagina = {
      getOperatorList: async () => ({
        fnArray: [85, 85, 86],
        argsArray: [["logo", 100, 50], ["tabela", 1000, 600], [{ width: 400, height: 400 }]],
      }),
    };
    expect(await medirImagens(pagina, OPS)).toEqual(["1000×600", "400×400"]);
  });

  it("devolve null quando não dá para verificar (nunca 'não há')", async () => {
    const pagina = {
      getOperatorList: async () => {
        throw new Error("falhou");
      },
    };
    expect(await medirImagens(pagina, OPS)).toBeNull();
  });

  it("descarta a imagem que se repete em metade das páginas (logotipo)", () => {
    const porPagina = { 1: ["411×165"], 2: ["411×165"], 3: ["411×165", "900×700"], 4: ["411×165"] };
    expect(listarPaginasComImagem(porPagina)).toEqual([3]);
  });
});
