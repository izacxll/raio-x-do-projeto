// Decisões do GP que entram na exportação de um passo do teste externo (decisão 0069).
import { describe, expect, it } from "vitest";
import {
  argumentosDasDecisoes,
  caracteristicasEmTexto,
  decisoesDoPedido,
  decisoesQueMudaram,
  // @ts-expect-error: script em JavaScript puro, sem tipos
} from "../../scripts/decisoes-do-pedido.mjs";
import { lerCaracteristicas } from "../../src/dominio/caracteristicas";

const decisoes = {
  modalidade: "licitacao",
  abordagem: "B",
  porte: "pequeno",
  pcs: "PC1,PC3",
  gerar: "A1,A3",
  caracteristicas: { campo: false, beneficiarios: false },
};

describe("decisões do pedido", () => {
  it("cada etapa usa só as decisões que a exportação dela lê", () => {
    expect(decisoesDoPedido(1, "leitura-rfp", decisoes)).toEqual({});
    expect(decisoesDoPedido(3, "tap", decisoes)).toEqual({ modalidade: "licitacao" });
    expect(decisoesDoPedido(4, "escopo", decisoes)).toEqual({
      modalidade: "licitacao",
      porte: "pequeno",
      caracteristicas: "campo=não,beneficiarios=não",
      pcs: "PC1,PC3",
      gerar: "A1,A3",
    });
    expect(decisoesDoPedido(5, "leitura", decisoes)).not.toHaveProperty("gerar");
    expect(decisoesDoPedido(4, "segunda-escopo", decisoes)).toEqual({});
  });

  it("a abordagem não entra: vale na importação da estratégia", () => {
    expect(Object.values(decisoesDoPedido(4, "escopo", decisoes))).not.toContain("B");
  });

  it("as características em texto são as que a exportação aceita", () => {
    expect(lerCaracteristicas(caracteristicasEmTexto(decisoes.caracteristicas))).toEqual({
      campo: false,
      beneficiarios: false,
    });
    expect(caracteristicasEmTexto("campo=sim")).toBe("campo=sim");
    expect(caracteristicasEmTexto(undefined)).toBe("");
  });

  it("vira argumentos da exportação", () => {
    expect(argumentosDasDecisoes({ porte: "médio", pcs: "PC1" })).toEqual([
      "--porte",
      "médio",
      "--pcs",
      "PC1",
    ]);
  });

  it("o pedido fica velho só quando muda uma decisão que ele usa", () => {
    const antes = decisoesDoPedido(4, "escopo", decisoes);
    expect(decisoesQueMudaram(antes, decisoesDoPedido(4, "escopo", { ...decisoes, abordagem: "A" }))).toEqual(
      [],
    );
    expect(decisoesQueMudaram(antes, decisoesDoPedido(4, "escopo", { ...decisoes, porte: "médio" }))).toEqual(
      ["porte"],
    );
    const semCaracteristicas = { ...decisoes, caracteristicas: undefined };
    expect(decisoesQueMudaram(antes, decisoesDoPedido(4, "escopo", semCaracteristicas))).toEqual([
      "caracteristicas",
    ]);
    expect(
      decisoesQueMudaram(decisoesDoPedido(3, "tap", {}), decisoesDoPedido(3, "tap", { porte: "x" })),
    ).toEqual([]);
  });
});
