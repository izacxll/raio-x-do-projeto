// Cada risco liga resposta, reserva e marco; a reserva de contingência deriva dos riscos marcados (decisão 0092).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contingenciaPelosRiscos, marcoDoRisco } from "../../src/etapas/4-pgp/calculos";
import { RespostaRiscos } from "../../src/pmo/schemas/pgp";

const riscos = [
  { id: "R1", pedeReserva: true },
  { id: "R2", pedeReserva: false },
  { id: "R3", pedeReserva: true },
];

describe("reserva de contingência pelos riscos (decisão 0092)", () => {
  it("é a soma das reservas dos riscos marcados", () => {
    expect(contingenciaPelosRiscos(riscos, { R1: 10000, R3: 5000, R2: 999 }, undefined)).toEqual({
      valor: 15000,
      origem: "riscos",
      semValor: [],
    });
  });

  it("falta o valor de um risco marcado: a contingência fica a definir, com o risco que falta", () => {
    const r = contingenciaPelosRiscos(riscos, { R1: 10000 }, undefined);
    expect(r.valor).toBeUndefined();
    expect(r.semValor).toEqual(["R3"]);
  });

  it("nenhum risco pede reserva: zero, sem inventar valor", () => {
    expect(contingenciaPelosRiscos([{ id: "R2", pedeReserva: false }], {}, 50000)).toEqual({
      valor: 0,
      origem: "sem-risco",
      semValor: [],
    });
  });

  it("dossiê antigo, com o valor único e sem valor por risco: vale o único, marcado como global", () => {
    expect(contingenciaPelosRiscos(riscos, undefined, 20000)).toEqual({
      valor: 20000,
      origem: "global",
      semValor: [],
    });
    // com algum valor por risco, o único deixa de valer
    expect(contingenciaPelosRiscos(riscos, { R1: 1 }, 20000).valor).toBeUndefined();
  });
});

describe("marco do risco (decisão 0092)", () => {
  const produtos = new Set(["P1", "P2"]);
  it("o produto que existe, o que não existe e o do projeto todo", () => {
    expect(marcoDoRisco("P2", produtos)).toBe("P2");
    expect(marcoDoRisco("P9", produtos)).toBe("P9 (não localizado no cronograma)");
    expect(marcoDoRisco("", produtos)).toBe("do projeto todo");
  });

  it("resposta gravada antiga, sem o campo, continua válida (marco vazio)", () => {
    const r = RespostaRiscos.parse(
      JSON.parse(readFileSync(new URL("../fixtures/gerados/pgp-oei/riscos.json", import.meta.url), "utf-8")),
    );
    expect(r.riscos.length).toBeGreaterThan(0);
    expect(r.riscos.every((x) => typeof x.marco === "string")).toBe(true);
  });
});
