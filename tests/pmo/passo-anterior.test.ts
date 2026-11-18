// Versão final do passo anterior no pedido da segunda instância (decisão 0068).
import { describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import type { Dossie } from "../../src/dossie/esquema";
import { passoAnteriorFinal, respostaGuardada } from "../../src/pmo/passo-anterior";
import { pedidoSegundaInstancia } from "../../src/pmo/segunda-instancia";

const guardado = (resposta: unknown, em: string) => ({ resposta, modelo: "m", em });

function dossie(): Dossie {
  const d = criarDossieVazio(new Date(2026, 10, 18));
  return {
    ...d,
    proposta: { estrategia: guardado({ e: 1 }, "t1"), conteudo: guardado({ c: 1 }, "t2") },
    // o TAP corrigido depois da conferência: é este que está no dossiê e que seguiu com o "seguir" do GP
    tap: { tap: guardado({ limites: ["versão final"] }, "t4") },
    pgp: { adaptacao: guardado({ a: 1 }, "t5") },
  } as unknown as Dossie;
}

describe("passo anterior", () => {
  it("é o passo de antes na mesma etapa, como está no dossiê", () => {
    const d = dossie();
    expect(passoAnteriorFinal(d, 3, "premissas")).toEqual({
      passo: "tap",
      resposta: { limites: ["versão final"] },
      em: "t4",
    });
    expect(passoAnteriorFinal(d, 2, "conteudo")?.passo).toBe("estrategia");
    expect(passoAnteriorFinal(d, 4, "escopo")?.passo).toBe("adaptacao");
  });

  it("não há no primeiro passo da etapa, nas etapas de um passo só nem sem resposta guardada", () => {
    const d = dossie();
    expect(passoAnteriorFinal(d, 3, "tap")).toBeUndefined();
    expect(passoAnteriorFinal(d, 1, "leitura-rfp")).toBeUndefined();
    expect(passoAnteriorFinal(d, 5, "leitura")).toBeUndefined();
    expect(passoAnteriorFinal(d, 4, "cronograma")).toBeUndefined();
    expect(respostaGuardada(d, 2, "eap")).toBeUndefined();
  });

  it("vai no pedido depois do pedido do passo, compacto e com o aviso de que é a que vale", () => {
    const anterior = passoAnteriorFinal(dossie(), 3, "premissas");
    const p = pedidoSegundaInstancia(3, "premissas", { r: 1 }, "pedido do passo", { anterior });
    const bloco = p.indexOf("## Versão final do passo anterior (tap), a que seguiu");
    expect(bloco).toBeGreaterThan(p.indexOf("</pedido-do-passo>"));
    expect(bloco).toBeLessThan(p.indexOf("## Resposta a conferir"));
    expect(p).toContain('{"limites":["versão final"]}');
    expect(p).toMatch(/Versões anteriores, conferências antigas e outros arquivos não valem/);
    expect(pedidoSegundaInstancia(3, "tap", {}, "pedido")).not.toMatch(/Versão final do passo anterior/);
  });
});
