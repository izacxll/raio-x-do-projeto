// TAP revisado na segunda instância do registro de premissas (decisão 0068), com a resposta gravada do TAP da OEI
// (pública, em tests/fixtures/gerados/).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { RevisaoItem, TapDossie } from "../../src/dossie/esquema";
import { RespostaTap } from "../../src/pmo/schemas/tap";
import { conferenciaVelha, pedidoSegundaInstancia, proximaRodada } from "../../src/pmo/segunda-instancia";
import { formatarTapRevisado, lerVersaoDoTapNoPedido, montarTapRevisado } from "../../src/pmo/tap-revisado";

const resposta = RespostaTap.parse(
  JSON.parse(readFileSync(new URL("../fixtures/gerados/tap-oei/tap.json", import.meta.url), "utf-8")),
);
const limite0 = resposta.limites[0]!.texto;
const limite1 = resposta.limites[1]!.texto;

function tap(revisoes: Record<string, Partial<RevisaoItem>> = {}): TapDossie {
  return {
    tap: { resposta, modelo: "m", em: "t4" },
    premissas: { resposta: { premissas: [] }, modelo: "m", em: "t5" },
    revisoes,
    decisoes: {},
    divergencias: {},
  } as unknown as TapDossie;
}

describe("TAP revisado", () => {
  it("leva os itens do TAP com o texto editado e sem os descartados, sem o registro de premissas", () => {
    const t = montarTapRevisado(
      tap({
        "tap:limites:0": { estado: "descartado" },
        "tap:limites:1": { estado: "editado", textoEditado: "Limite reescrito pelo GP." },
      }),
    );
    expect(t?.em).toBe("t4");
    expect(t?.texto).not.toContain(limite0);
    expect(t?.texto).not.toContain(limite1);
    expect(t?.texto).toMatch(/- \[(Do documento|Sugestão|Decisão do GP)\] Limite reescrito pelo GP\./);
    expect(t?.texto).toMatch(/^### /m);
    expect(t?.texto).not.toMatch(/Registro de premissas|pendências do GP|Aprovado por/);
    expect(montarTapRevisado(undefined)).toBeUndefined();
  });

  it("marca o item que o GP ainda não revisou e traz as decisões do GP no TAP", () => {
    const t = {
      ...tap({ "tap:limites:1": { estado: "aceito" } }),
      decisoes: { patrocinador: "Diretoria disfarçada" },
      divergencias: { "prazo:R01": { vale: "proposta" } },
    } as unknown as TapDossie;
    const texto = montarTapRevisado(t)!.texto;
    expect(texto).toContain(`${limite0} (pendente de revisão do GP)`);
    expect(texto).not.toContain(`${limite1} (pendente`);
    expect(texto).toContain("### Decisões do GP no TAP");
    expect(texto).toContain("- Patrocinador: [Decisão do GP] Diretoria disfarçada");
    expect(texto).toContain("- Gerente do projeto: [Decisão do GP] a definir pelo GP");
    expect(texto).toContain("- Divergência prazo:R01: [Decisão do GP] vale a proposta");
  });

  it("a versão muda quando o GP revisa, edita, descarta ou decide; aprovar o TAP não muda", () => {
    const base = montarTapRevisado(tap())!.versao;
    const aceito = montarTapRevisado(tap({ "tap:limites:0": { estado: "aceito" } }))!.versao;
    expect(aceito).not.toBe(base);
    expect(montarTapRevisado(tap({ "tap:limites:0": { estado: "descartado" } }))!.versao).not.toBe(base);
    const aprovado = {
      ...tap(),
      decisoes: { aprovadoPor: "GP", aprovadoEm: "2026-11-18" },
    } as unknown as TapDossie;
    expect(montarTapRevisado(aprovado)!.versao).toBe(base);
  });

  it("o pedido exportado diz qual versão do TAP levou (a importação lê de lá)", () => {
    const tapRevisado = montarTapRevisado(tap())!;
    const p = pedidoSegundaInstancia(3, "premissas", {}, "pedido", { tapRevisado });
    expect(lerVersaoDoTapNoPedido(p)).toBe(tapRevisado.versao);
    expect(lerVersaoDoTapNoPedido(pedidoSegundaInstancia(3, "tap", {}, "pedido"))).toBeUndefined();
  });

  it("vai no pedido depois do pedido do passo, com a versão, e a rubrica manda usar só o que veio", () => {
    const tapRevisado = montarTapRevisado(tap());
    const p = pedidoSegundaInstancia(3, "premissas", { r: 1 }, "pedido do passo", { tapRevisado });
    const bloco = p.indexOf(`## TAP revisado pelo GP (versão ${tapRevisado!.versao}, a que seguiu)`);
    expect(bloco).toBeGreaterThan(p.indexOf("</pedido-do-passo>"));
    expect(bloco).toBeLessThan(p.indexOf("## Resposta a conferir"));
    expect(p).toMatch(/<tap-revisado>\n### /);
    expect(p).toMatch(/ou no TAP revisado acima/);
    expect(p).toMatch(/não aponte incoerência com versão que não veio nele/);
    expect(pedidoSegundaInstancia(3, "tap", {}, "pedido")).not.toMatch(/TAP revisado/);
    expect(formatarTapRevisado(tapRevisado!)).toMatch(
      /Versões anteriores do TAP e conferências antigas não valem/,
    );
  });
});

describe("conferência velha e rodada", () => {
  const g = { deResposta: "r1", deAnterior: "t4#a", rodada: 1 };

  it("fica velha quando a resposta ou o TAP revisado mudam; conferência antiga sem a versão continua valendo", () => {
    expect(conferenciaVelha(undefined, "r1")).toBe("sem-conferencia");
    expect(conferenciaVelha(g, "r2", "t4#a")).toBe("resposta-mudou");
    expect(conferenciaVelha(g, "r1", "t4#b")).toBe("tap-mudou");
    expect(conferenciaVelha(g, "r1", "t4#a")).toBeUndefined();
    expect(conferenciaVelha({ deResposta: "r1" }, "r1", "t4#b")).toBeUndefined();
  });

  it("a rodada sobe quando o TAP revisado muda", () => {
    expect(proximaRodada(g, "r1", "t4#a")).toBe(1);
    expect(proximaRodada(g, "r1", "t4#b")).toBe(2);
    expect(proximaRodada({ deResposta: "r1", rodada: 1 }, "r1", "t4#b")).toBe(1);
  });
});
