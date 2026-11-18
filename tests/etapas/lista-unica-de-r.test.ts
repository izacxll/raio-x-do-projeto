// Uma lista de R só, do início ao fim (decisão 0080): o caso que motivou a decisão. Exemplos inventados.
import { describe, expect, it } from "vitest";
import { coberturaDosR } from "../../src/etapas/3-tap/conferencia-tap";

const lista = [
  { numero: "R01", tipo: "produto" },
  { numero: "R02", tipo: "produto" },
  { numero: "R13", tipo: "obrigacao" },
];
const item = (id: string, requisitos: string[]) => ({ id, item: { requisitos } });

describe("cobertura da lista de R no TAP", () => {
  it("obrigação citada no TAP.3 não vira 'descartada ou inexistente'", () => {
    const alto = [item("tap:requisitosAltoNivel:0", ["R01", "R02", "R13"])];
    const r = coberturaDosR(lista, alto, alto);
    expect(r).toEqual({ faltandoEntregas: [], faltandoObrigacoes: [], foraDaLista: [] });
  });

  it("obrigação só nos limites ou nas premissas basta", () => {
    const alto = [item("tap:requisitosAltoNivel:0", ["R01", "R02"])];
    const r = coberturaDosR(lista, alto, [...alto, item("tap:limites:2", ["R13"])]);
    expect(r.faltandoObrigacoes).toEqual([]);
    expect(r.faltandoEntregas).toEqual([]);
  });

  it("obrigação só numa observação do PMO continua sem destino; entrega fora do TAP.3 também falta", () => {
    const alto = [item("tap:requisitosAltoNivel:0", ["R01"])];
    const r = coberturaDosR(lista, alto, [
      ...alto,
      item("tap:observacoes:0", ["R13"]),
      item("premissas:observacoes:1", ["R13"]),
      item("tap:limites:0", ["R02"]),
    ]);
    expect(r.faltandoObrigacoes).toEqual(["R13"]);
    // a entrega tem de estar no TAP.3: nos limites não basta
    expect(r.faltandoEntregas).toEqual(["R02"]);
  });

  it("R no TAP.3 que não está na lista (descartado pelo GP) vai à parte; número C não", () => {
    const alto = [item("tap:requisitosAltoNivel:0", ["R01", "R02", "R13", "R07", "C04"])];
    expect(coberturaDosR(lista, alto, alto).foraDaLista).toEqual(["R07"]);
  });
});
