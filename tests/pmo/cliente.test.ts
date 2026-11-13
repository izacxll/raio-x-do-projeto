// Cliente da API, sem chave real: o fetch é trocado por respostas simuladas no formato da API.
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { chamarPmo, ErroPmo, lerResposta, testarChave, traduzirErro } from "../../src/pmo/cliente";
import { corpoErro, fetchSimulado } from "../ajudantes/api-simulada";

// montada por partes: a verificação do repositório barra texto com cara de chave
const CHAVE = ["sk", "ant", "teste", "x".repeat(32)].join("-");
const Schema = z.object({ ok: z.boolean(), itens: z.array(z.string()) });

function pedido(fetch: typeof globalThis.fetch) {
  return chamarPmo(
    {
      chave: CHAVE,
      modelo: "claude-opus-5-5",
      passo: "estrategia",
      sistema: "SKILL",
      documentos: "=== Página 1 ===\ntexto",
      pedido: "faça o passo",
      schema: Schema,
    },
    { fetch },
  );
}

describe("chamada ao PMO", () => {
  it("lê a resposta estruturada, o uso e o custo", async () => {
    const api = fetchSimulado([
      {
        texto: JSON.stringify({ ok: true, itens: ["a"] }),
        uso: { entrada: 1000, saida: 2000, escritaCache: 50000 },
      },
    ]);
    const r = await pedido(api.fetch);
    expect(r.resposta).toEqual({ ok: true, itens: ["a"] });
    expect(r.uso).toEqual({ entrada: 1000, saida: 2000, escritaCache: 50000, leituraCache: 0 });
    // 1000 × 4 + 2000 × 20 + 50000 × 5, por milhão
    expect(r.custo).toBeCloseTo(0.294, 6);
  });

  it("manda a skill e os documentos com cache, o schema na saída estruturada e o esforço explícito", async () => {
    const api = fetchSimulado([{ texto: JSON.stringify({ ok: true, itens: [] }) }]);
    await pedido(api.fetch);
    const [p] = api.pedidos;
    expect(p?.url).toMatch(/^https:\/\/api\.anthropic\.com\/v1\/messages/);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- corpo da requisição lido como JSON livre
    const corpo = p?.corpo as Record<string, any>;
    expect(corpo.model).toBe("claude-opus-5-5");
    expect(corpo.stream).toBe(true);
    expect(corpo.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(corpo.messages[0].content[0].cache_control).toEqual({ type: "ephemeral" });
    expect(corpo.messages[0].content[1].cache_control).toBeUndefined();
    expect(corpo.output_config.effort).toBe("high");
    expect(corpo.output_config.format.type).toBe("json_schema");
    expect(corpo.output_config.format.schema.properties.itens).toBeDefined();
    // parâmetros que dão erro 400 nesses modelos
    expect(corpo.temperature).toBeUndefined();
    expect(corpo.tool_choice).toBeUndefined();
    expect(corpo.thinking).toBeUndefined();
    // o SDK 1.x manda a chave no cabeçalho de autorização
    expect(p?.headers["authorization"] ?? p?.headers["x-api-key"]).toContain(CHAVE);
    expect(p?.headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
  });

  it("chave recusada vira mensagem em português, sem a chave no texto", async () => {
    const api = fetchSimulado([
      { status: 401, corpo: corpoErro("authentication_error", `invalid x-api-key ${CHAVE}`) },
    ]);
    const e = await pedido(api.fetch).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErroPmo);
    expect((e as ErroPmo).tipo).toBe("chave");
    expect((e as ErroPmo).message).toMatch(/chave da API não foi aceita/);
    expect(JSON.stringify(e)).not.toContain(CHAVE);
  });

  it("créditos esgotados mandam falar com o administrador", async () => {
    const api = fetchSimulado([
      {
        status: 400,
        corpo: corpoErro("invalid_request_error", "Your credit balance is too low to access the API."),
      },
    ]);
    const e = (await pedido(api.fetch).catch((x: unknown) => x)) as ErroPmo;
    expect(e.tipo).toBe("creditos");
    expect(e.oQueFazer).toMatch(/administrador do Claude da FGV/);
  });

  it("resposta cortada e recusa não viram resultado", async () => {
    const cortada = fetchSimulado([{ texto: '{"ok": true, "itens": ["a"', stopReason: "max_tokens" }]);
    expect(((await pedido(cortada.fetch).catch((x: unknown) => x)) as ErroPmo).tipo).toBe("cortada");
    const recusa = fetchSimulado([{ texto: "", stopReason: "refusal" }]);
    expect(((await pedido(recusa.fetch).catch((x: unknown) => x)) as ErroPmo).tipo).toBe("recusa");
  });

  it("organização sem o modelo de reserva: tenta uma vez sem ele", async () => {
    const api = fetchSimulado([
      {
        status: 400,
        corpo: corpoErro("invalid_request_error", "fallbacks: not enabled for this organization"),
      },
      { texto: JSON.stringify({ ok: true, itens: [] }) },
    ]);
    await pedido(api.fetch);
    expect(api.pedidos[0]?.corpo.fallbacks).toBe("default");
    expect(api.pedidos[1]?.corpo.fallbacks).toBeUndefined();
  });

  it("JSON fora do schema vira erro de formato", () => {
    expect(() => lerResposta('{"ok": "sim"}', Schema)).toThrow(/não seguiu o formato/);
    expect(() => lerResposta("texto solto", Schema)).toThrow(/fora do formato/);
  });

  it("erro desconhecido não expõe a chave", () => {
    expect(traduzirErro(new Error(`falhou com ${CHAVE}`)).message).not.toContain(CHAVE);
  });
});

describe("testar a chave", () => {
  it("chamada mínima e mensagem de sucesso", async () => {
    const api = fetchSimulado([{ texto: "OK" }]);
    const r = await testarChave(CHAVE, "claude-opus-5-5", { fetch: api.fetch });
    expect(r.ok).toBe(true);
    expect(api.pedidos[0]?.corpo.max_tokens).toBeLessThanOrEqual(512);
  });

  it("sobrecarga é avisada em português", async () => {
    const api = fetchSimulado([
      { status: 529, corpo: corpoErro("overloaded_error", "Overloaded") },
      { status: 529, corpo: corpoErro("overloaded_error", "Overloaded") },
      { status: 529, corpo: corpoErro("overloaded_error", "Overloaded") },
      { status: 529, corpo: corpoErro("overloaded_error", "Overloaded") },
    ]);
    const r = await testarChave(CHAVE, "claude-opus-5-5", { fetch: api.fetch });
    expect(r.ok).toBe(false);
    expect(r.mensagem).toMatch(/sobrecarregada/);
  }, 60000);
});
