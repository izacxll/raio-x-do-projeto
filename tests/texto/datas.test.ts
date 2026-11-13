import { describe, expect, it } from "vitest";
import { diasEntre, encontrarDatas, formatarData, lerNumero, somarDiasUteis } from "../../src/texto/datas";

describe("datas no texto", () => {
  it("acha datas por extenso e numéricas, com os espaços que o leitor de PDF insere", () => {
    const t =
      "Sessão em 23/10/2026; entrega até 2 6 de agost o de 20 2 6 e assinatura em 1º de março de 2027.";
    expect(encontrarDatas(t).map((d) => formatarData(d.data))).toEqual([
      "23/10/2026",
      "26/08/2026",
      "01/03/2027",
    ]);
  });

  it("não aceita data impossível nem número de norma", () => {
    expect(encontrarDatas("31/02/2026 e Lei 14.133/2021")).toEqual([]);
  });
});

describe("contas de prazo", () => {
  it("3 dias úteis antes de uma sexta caem na terça", () => {
    expect(formatarData(somarDiasUteis(new Date(2026, 9, 23), -3))).toBe("20/10/2026");
  });

  it("dias úteis pulam o fim de semana", () => {
    // segunda 09/11/2026 − 1 dia útil = sexta 06/11/2026
    expect(formatarData(somarDiasUteis(new Date(2026, 10, 9), -1))).toBe("06/11/2026");
  });

  it("dias entre duas datas, negativos quando já passou", () => {
    expect(diasEntre(new Date(2026, 10, 13), new Date(2026, 10, 20))).toBe(7);
    expect(diasEntre(new Date(2026, 10, 13), new Date(2026, 10, 12))).toBe(-1);
  });

  it("lê número em algarismo ou por extenso", () => {
    expect(lerNumero("03")).toBe(3);
    expect(lerNumero("três")).toBe(3);
    expect(lerNumero("talvez")).toBeNull();
  });
});
