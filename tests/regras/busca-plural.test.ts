// Busca dos sinais das fichas com singular e plural (teste externo do TR): "feriados municipais" acha
// "feriado municipal", "Critérios de entrada" acha "critério de entrada". Minúsculas e acentos já eram ignorados.
import { describe, expect, it } from "vitest";
import { formasDaPalavra, procurar } from "../../src/regras/busca";

const pagina = (texto: string) => [{ numero: 1, origem: "texto" as const, texto, caracteres: texto.length }];

describe("busca com singular e plural", () => {
  it("acha o termo no plural e no singular, sem acento e sem diferença de maiúscula", () => {
    expect(procurar(pagina("Campo com os feriados municipais."), ["feriado municipal"])).toHaveLength(1);
    expect(procurar(pagina("Critérios de entrada: a fase 1 começa…"), ["critério de entrada"])).toHaveLength(
      1,
    );
    expect(procurar(pagina("As ações de engajamento."), ["ação de engajamento"])).toHaveLength(1);
    expect(procurar(pagina("O fator de risco."), ["fatores de risco"])).toHaveLength(1);
  });

  it("não cria achado novo: preposição, número e palavra curta ficam como estão", () => {
    expect(formasDaPalavra("de")).toBe("de");
    expect(formasDaPalavra("pc1")).toBe("pc1");
    expect(procurar(pagina("PC10 e PC12."), ["PC1"])).toHaveLength(0);
    expect(procurar(pagina("O registro de risco."), ["registro dos riscos"])).toHaveLength(0);
  });
});
