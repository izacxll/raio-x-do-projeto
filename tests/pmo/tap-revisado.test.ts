// TAP revisado na segunda instância do registro de premissas (decisão 0068), com a resposta gravada do TAP da OEI
// (pública, em tests/fixtures/gerados/).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { RevisaoItem, TapDossie } from "../../src/dossie/esquema";
import { itensDaEtapa3 } from "../../src/etapas/3-tap/tap";
import { RespostaPremissas, RespostaTap } from "../../src/pmo/schemas/tap";
import { conferenciaVelha, pedidoSegundaInstancia, proximaRodada } from "../../src/pmo/segunda-instancia";
import { formatarTapRevisado, lerVersaoDoTapNoPedido, montarTapRevisado } from "../../src/pmo/tap-revisado";

const ler = (n: string) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/gerados/tap-oei/${n}.json`, import.meta.url), "utf-8"),
  ) as unknown;
const resposta = RespostaTap.parse(ler("tap"));
const premissas = RespostaPremissas.parse(ler("premissas"));
const limite0 = resposta.limites[0]!.texto;
const limite1 = resposta.limites[1]!.texto;

function tap(revisoes: Record<string, Partial<RevisaoItem>> = {}, decisoes = {}): TapDossie {
  return {
    tap: { resposta, modelo: "m", em: "t4" },
    premissas: { resposta: premissas, modelo: "m", em: "t5" },
    revisoes,
    decisoes,
    divergencias: {},
  } as unknown as TapDossie;
}

/** Sem documentos, toda citação fica "não conferida": o rótulo tem de dizer isso, e não "Do documento" seco. */
const revisado = (t: TapDossie) => montarTapRevisado(t, itensDaEtapa3(t, []));

describe("TAP revisado", () => {
  it("leva os itens do TAP com o texto editado e sem os descartados, sem o registro de premissas", () => {
    const t = revisado(
      tap({
        "tap:limites:0": { estado: "descartado" },
        "tap:limites:1": { estado: "editado", textoEditado: "Limite reescrito pelo GP." },
      }),
    );
    expect(t?.em).toBe("t4");
    expect(t?.texto).not.toContain(limite0);
    expect(t?.texto).not.toContain(limite1);
    expect(t?.texto).toMatch(/\] Limite reescrito pelo GP\./);
    expect(t?.texto).toMatch(/^### /m);
    expect(t?.texto).not.toContain(premissas.premissas[0]!.item.texto);
    expect(t?.texto).not.toMatch(/Registro de premissas|pendências do GP|Aprovado por/);
    expect(montarTapRevisado(undefined, [])).toBeUndefined();
  });

  it("o rótulo é o da tela: citação que o código não achou não vira fato", () => {
    const texto = revisado(tap())!.texto;
    expect(texto).toContain("[Do documento — citação não conferida]");
    expect(texto).not.toMatch(/- \[Do documento\] /);
  });

  it("traz os campos que só o GP preenche", () => {
    const texto = revisado(tap({}, { patrocinador: "Diretoria disfarçada" }))!.texto;
    expect(texto).toContain("### Campos do GP no TAP");
    expect(texto).toContain("- Patrocinador: [Decisão do GP] Diretoria disfarçada");
    expect(texto).toContain("- Gerente do projeto: [Decisão do GP] a definir pelo GP");
  });

  it("a versão muda com edição, descarte ou campo do GP; aceitar sem editar e aprovar não mudam", () => {
    const base = revisado(tap())!.versao;
    expect(revisado(tap({ "tap:limites:0": { estado: "aceito" } }))!.versao).toBe(base);
    expect(revisado(tap({ "tap:limites:0": { estado: "descartado" } }))!.versao).not.toBe(base);
    expect(revisado(tap({}, { gerente: "GP disfarçado" }))!.versao).not.toBe(base);
    expect(revisado(tap({}, { aprovadoPor: "GP", aprovadoEm: "2026-11-18" }))!.versao).toBe(base);
  });

  it("o pedido exportado diz qual versão do TAP levou (a importação lê de lá)", () => {
    const tapRevisado = revisado(tap())!;
    const p = pedidoSegundaInstancia(3, "premissas", {}, "pedido", { tapRevisado });
    expect(lerVersaoDoTapNoPedido(p)).toBe(tapRevisado.versao);
    expect(lerVersaoDoTapNoPedido(pedidoSegundaInstancia(3, "tap", {}, "pedido"))).toBeUndefined();
  });

  it("vai no pedido depois do pedido do passo, com a versão, e a rubrica manda usar só o que veio", () => {
    const tapRevisado = revisado(tap());
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
    expect(conferenciaVelha(g, "r1", undefined)).toBe("tap-ausente");
    expect(conferenciaVelha(g, "r1", "t4#a")).toBeUndefined();
    expect(conferenciaVelha({ deResposta: "r1" }, "r1", "t4#b")).toBeUndefined();
  });

  it("a rodada sobe quando o TAP revisado muda", () => {
    expect(proximaRodada(g, "r1", "t4#a")).toBe(1);
    expect(proximaRodada(g, "r1", "t4#b")).toBe(2);
    expect(proximaRodada({ deResposta: "r1", rodada: 1 }, "r1", "t4#b")).toBe(1);
  });
});
