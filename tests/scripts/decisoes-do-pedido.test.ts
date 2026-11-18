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
    expect(decisoesDoPedido(1, "leitura-rfp", decisoes)).toEqual({ modalidade: "licitacao" });
    expect(decisoesDoPedido(3, "tap", decisoes)).toEqual({ modalidade: "licitacao" });
    expect(decisoesDoPedido(4, "escopo", decisoes)).toEqual({
      modalidade: "licitacao",
      porte: "pequeno",
      caracteristicas: "beneficiarios=nao,campo=nao",
      pcs: "PC1,PC3",
    });
    expect(decisoesDoPedido(4, "segunda-escopo", decisoes)).toEqual({});
  });

  it("a etapa pode vir em texto (do nome do arquivo)", () => {
    expect(decisoesDoPedido("4", "escopo", decisoes)).toEqual(decisoesDoPedido(4, "escopo", decisoes));
  });

  it("abordagem e partes a gerar não entram: valem na importação", () => {
    const usadas = decisoesDoPedido(4, "escopo", decisoes);
    expect(usadas).not.toHaveProperty("gerar");
    expect(Object.values(usadas)).not.toContain("B");
  });

  it("as características em texto são as que a exportação aceita, sem acento e em ordem", () => {
    const texto = caracteristicasEmTexto(decisoes.caracteristicas);
    expect(texto).toBe("beneficiarios=nao,campo=nao");
    expect(lerCaracteristicas(texto)).toEqual({ campo: false, beneficiarios: false });
    expect(caracteristicasEmTexto("subcontratacao=Não informada")).toBe("subcontratacao=nao informada");
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
    const com = (mudanca: object) =>
      decisoesQueMudaram(antes, decisoesDoPedido(4, "escopo", { ...decisoes, ...mudanca }));
    expect(com({ abordagem: "A", gerar: "A1" })).toEqual([]);
    expect(com({ porte: "médio" })).toEqual(["porte"]);
    expect(com({ caracteristicas: undefined })).toEqual(["caracteristicas"]);
    // a mesma decisão escrita de outro jeito não conta como mudança
    expect(com({ caracteristicas: { beneficiarios: false, campo: false } })).toEqual([]);
    expect(com({ caracteristicas: "campo=não; beneficiarios=nao" })).toEqual([]);
  });
});
