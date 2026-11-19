// Cada risco liga resposta, reserva e marco; a reserva de contingência deriva dos riscos marcados (decisão 0092).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contingenciaPelosRiscos, marcoDoRisco, reservaValida } from "../../src/etapas/4-pgp/calculos";
import { RespostaRiscos } from "../../src/pmo/schemas/pgp";

const riscos = [
  { id: "R1", texto: "atraso nos dados", pedeReserva: true },
  { id: "R2", texto: "troca de interlocutor", pedeReserva: false },
  { id: "R3", texto: "retrabalho no relatório", pedeReserva: true },
];
const r = (id: string, valor: number) => ({ valor, risco: riscos.find((x) => x.id === id)!.texto });

describe("reserva de contingência pelos riscos (decisão 0092)", () => {
  it("é a soma das reservas dos riscos marcados", () => {
    const c = contingenciaPelosRiscos(
      riscos,
      { R1: r("R1", 10000), R3: r("R3", 5000), R2: r("R2", 999) },
      undefined,
    );
    expect(c).toMatchObject({ valor: 15000, origem: "riscos", semValor: [] });
  });

  it("falta o valor de um risco marcado: a contingência fica a definir, com o risco que falta", () => {
    const c = contingenciaPelosRiscos(riscos, { R1: r("R1", 10000) }, undefined);
    expect(c.valor).toBeUndefined();
    expect(c.semValor).toEqual(["R3"]);
  });

  it("refeito o passo de riscos, outro risco com o mesmo id não herda a reserva", () => {
    const outro = [{ id: "R1", texto: "outro risco qualquer", pedeReserva: true }];
    expect(reservaValida(outro[0]!, { R1: r("R1", 50000) })).toBeUndefined();
    const c = contingenciaPelosRiscos(outro, { R1: r("R1", 50000) }, undefined);
    expect(c.valor).toBeUndefined();
    expect(c.avisos.join(" ")).toMatch(/R1 mudou depois que o GP deu a reserva/);
  });

  it("id repetido conta uma vez só e é avisado", () => {
    const dobrado = [...riscos, { id: "R1", texto: "atraso nos dados", pedeReserva: true }];
    const c = contingenciaPelosRiscos(dobrado, { R1: r("R1", 10000), R3: r("R3", 5000) }, undefined);
    expect(c.valor).toBe(15000);
    expect(c.avisos.join(" ")).toMatch(/repetido/);
  });

  it("nenhum risco pede reserva: zero, e o valor único antigo é avisado, não some calado", () => {
    const c = contingenciaPelosRiscos([{ id: "R2", texto: "x", pedeReserva: false }], {}, 50000);
    expect(c).toMatchObject({ valor: 0, origem: "sem-risco" });
    expect(c.avisos.join(" ")).toMatch(/valor único .* não entra/);
  });

  it("dossiê antigo, com o valor único e sem valor por risco: vale o único, marcado como global", () => {
    expect(contingenciaPelosRiscos(riscos, undefined, 20000)).toMatchObject({
      valor: 20000,
      origem: "global",
    });
    // com algum valor por risco, o único deixa de valer
    expect(contingenciaPelosRiscos(riscos, { R1: r("R1", 1) }, 20000).valor).toBeUndefined();
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
    const resp = RespostaRiscos.parse(
      JSON.parse(readFileSync(new URL("../fixtures/gerados/pgp-oei/riscos.json", import.meta.url), "utf-8")),
    );
    expect(resp.riscos.length).toBeGreaterThan(0);
    expect(resp.riscos.every((x) => typeof x.marco === "string")).toBe(true);
  });
});
