// TAP revisado no pedido da segunda instância do registro de premissas (decisão 0068).
import { describe, expect, it, vi } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import type { Dossie } from "../../src/dossie/esquema";
import { passoAnteriorEmTexto, passoAnteriorFinal } from "../../src/pmo/passo-anterior";
import { pedidoSegundaInstancia } from "../../src/pmo/segunda-instancia";

// o TAP como o app o exporta: aqui, um texto que mostra o que entrou (o código de montagem tem testes próprios)
vi.mock("../../src/etapas/4-pgp/entrada", () => ({
  tapDoDossieComoDocumento: (d: Dossie) =>
    d.tap?.tap
      ? {
          paginas: [
            {
              numero: 1,
              texto: `limites: ${JSON.stringify((d.tap.tap.resposta as unknown as { l: string }).l)}`,
            },
            { numero: 2, texto: `premissas no TAP: ${d.tap.premissas ? "sim" : "não"}` },
          ],
        }
      : undefined,
}));

const guardado = (resposta: unknown, em: string) => ({ resposta, modelo: "m", em });

function dossie(l = "versão final"): Dossie {
  const d = criarDossieVazio(new Date(2026, 10, 18));
  return {
    ...d,
    tap: { tap: guardado({ l }, "t4"), premissas: guardado({ p: 1 }, "t5") },
  } as unknown as Dossie;
}

describe("TAP revisado nas premissas", () => {
  it("vai só na segunda instância das premissas, sem o registro que está sendo conferido", () => {
    const a = passoAnteriorFinal(dossie(), 3, "premissas");
    expect(a?.passo).toBe("tap");
    expect(a?.em).toBe("t4");
    expect(a?.texto).toContain('limites: "versão final"');
    expect(a?.texto).toContain("premissas no TAP: não");
    expect(passoAnteriorFinal(dossie(), 3, "tap")).toBeUndefined();
    expect(passoAnteriorFinal(dossie(), 2, "conteudo")).toBeUndefined();
    expect(passoAnteriorFinal(dossie(), 4, "escopo")).toBeUndefined();
    expect(passoAnteriorFinal(criarDossieVazio(), 3, "premissas")).toBeUndefined();
  });

  it("a versão muda quando o texto revisado muda, mesmo com o mesmo em", () => {
    const a = passoAnteriorFinal(dossie("um"), 3, "premissas");
    const b = passoAnteriorFinal(dossie("outro"), 3, "premissas");
    expect(a?.em).toBe(b?.em);
    expect(a?.versao).not.toBe(b?.versao);
    expect(passoAnteriorFinal(dossie("um"), 3, "premissas")?.versao).toBe(a?.versao);
  });

  it("vai no pedido depois do pedido do passo, com a data, e a rubrica manda usar só o que veio", () => {
    const anterior = passoAnteriorFinal(dossie(), 3, "premissas");
    const p = pedidoSegundaInstancia(3, "premissas", { r: 1 }, "pedido do passo", { anterior });
    const bloco = p.indexOf("## TAP revisado pelo GP (a versão que seguiu, de t4)");
    expect(bloco).toBeGreaterThan(p.indexOf("</pedido-do-passo>"));
    expect(bloco).toBeLessThan(p.indexOf("## Resposta a conferir"));
    expect(p).toMatch(/<tap-revisado>\n=== Página 1 ===/);
    expect(p).toMatch(/ou no TAP revisado acima/);
    expect(p).toMatch(/não aponte incoerência com versão que não veio nele/);
    const sem = pedidoSegundaInstancia(3, "tap", {}, "pedido");
    expect(sem).not.toMatch(/TAP revisado/);
    expect(passoAnteriorEmTexto(anterior!)).toMatch(
      /Versões anteriores do TAP e conferências antigas não valem/,
    );
  });
});
