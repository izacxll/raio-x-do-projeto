// Características corrigidas pelo GP fora da tela, na exportação do teste externo (decisão 0069).
import { describe, expect, it } from "vitest";
import { lerCaracteristicas, VALORES_CARACTERISTICAS } from "../../src/dominio/caracteristicas";

describe("lerCaracteristicas", () => {
  it("lê chave=valor, com ou sem acento, sim e não, vírgula ou ponto e vírgula", () => {
    expect(lerCaracteristicas("campo=não, beneficiarios=nao; porte=medio;exposicao=comum")).toEqual({
      campo: false,
      beneficiarios: false,
      porte: "médio",
      exposicao: "comum",
    });
    expect(lerCaracteristicas("dadosPessoais=sim, subcontratacao=nao informada")).toEqual({
      dadosPessoais: true,
      subcontratacao: "não informada",
    });
    expect(lerCaracteristicas("")).toEqual({});
  });

  it("chave ou valor fora da lista é erro, com a lista no texto", () => {
    expect(() => lerCaracteristicas("tamanho=pequeno")).toThrow(/não existe\. Use: porte, abordagem/);
    expect(() => lerCaracteristicas("porte=enorme")).toThrow(/Use: pequeno, médio, grande/);
    expect(() => lerCaracteristicas("campo=talvez")).toThrow(/Use: sim, não/);
  });

  it("aceita todo valor da lista (a tela usa a mesma)", () => {
    for (const [chave, valores] of Object.entries(VALORES_CARACTERISTICAS))
      for (const v of valores as readonly (string | boolean)[])
        expect(lerCaracteristicas(`${chave}=${v === true ? "sim" : v === false ? "não" : v}`)).toEqual({
          [chave]: v,
        });
  });
});
