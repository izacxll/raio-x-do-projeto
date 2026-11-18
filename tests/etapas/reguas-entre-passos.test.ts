// Régua corrigida num passo da etapa 4 que não chegou às partes geradas antes (decisão 0078). Exemplos inventados.
import { describe, expect, it } from "vitest";
import type { PgpDossie } from "../../src/dossie/esquema";
import { mencoesDeRegua, reguaQueMudouEmTexto, reguasQueMudaram } from "../../src/etapas/4-pgp/reguas";

const texto = (codigo: string, t: string) => ({
  textos: [{ codigo, itens: [{ id: `${codigo}-1`, texto: t }] }],
});
const pgp = (r: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(r).map(([k, v]) => [k, { resposta: v }])) as unknown as PgpDossie;

describe("menções de régua", () => {
  it("classifica teto e referência na mesma oração; ambígua não conta", () => {
    expect(mencoesDeRegua("Os 6 meses das fases são teto até o contrato.", "adaptacao", "A17")).toEqual([
      expect.objectContaining({ quantidade: "6 meses", classe: "teto" }),
    ]);
    expect(mencoesDeRegua("Cabe só contra a referência da proposta (6 meses).", "cronograma", "")).toEqual([
      expect.objectContaining({ quantidade: "6 meses", classe: "referencia" }),
    ]);
    expect(mencoesDeRegua("Os 6 meses não são teto.", "cronograma", "")[0]?.classe).toBe("referencia");
    expect(mencoesDeRegua("Os 6 meses são referência e teto.", "cronograma", "")).toEqual([]);
    expect(mencoesDeRegua("A fase dura 6 meses.", "cronograma", "")).toEqual([]);
  });

  it("negação do teto é referência; Termo de Referência não é régua (revisão de código)", () => {
    for (const t of [
      "Os 6 meses são referência, não teto.",
      "Os 6 meses não são mais teto.",
      "Os 6 meses deixam de ser teto.",
      "Os 6 meses não são um limite.",
    ])
      expect(mencoesDeRegua(t, "cronograma", "")[0]?.classe).toBe("referencia");
    expect(
      mencoesDeRegua("Execução em 6 meses, conforme o Termo de Referência (p. 3).", "cronograma", ""),
    ).toEqual([]);
  });
});

describe("o mais novo é a resposta salva por último", () => {
  it("adaptação refeita depois do cronograma: a correção dela vale, e o aviso aponta o cronograma", () => {
    const p = {
      adaptacao: { resposta: texto("A17", "Os 6 meses são só referência."), em: "2026-11-18T12:00:00Z" },
      cronograma: { resposta: texto("A14", "Os 6 meses são teto."), em: "2026-11-18T10:00:00Z" },
    } as unknown as PgpDossie;
    const r = reguasQueMudaram(p);
    expect(r).toHaveLength(1);
    expect(r[0]!.antes.passo).toBe("cronograma");
    expect(r[0]!.depois.passo).toBe("adaptacao");
  });
});

describe("régua que mudou entre os passos", () => {
  it("teto na adaptação e referência no cronograma: aviso na parte que ficou para trás", () => {
    const r = reguasQueMudaram(
      pgp({
        adaptacao: texto("A17", "Os 6 meses das fases da proposta são teto até o contrato."),
        cronograma: texto("A14", "Sem régua: cabe só contra a referência da proposta (6 meses)."),
      }),
    );
    expect(r).toHaveLength(1);
    expect(r[0]!.antes).toMatchObject({ passo: "adaptacao", classe: "teto", onde: "A17 A17-1" });
    expect(reguaQueMudouEmTexto(r[0]!)).toMatch(
      /Régua de 6 meses: "teto" em .* \(A17 A17-1\) e "referência" em/,
    );
  });

  it("a correção já chegou, ou a régua não mudou: sem aviso", () => {
    expect(
      reguasQueMudaram(
        pgp({
          adaptacao: texto("A17", "Os 6 meses são referência, não teto."),
          cronograma: texto("A14", "Cabe só contra a referência da proposta (6 meses)."),
        }),
      ),
    ).toEqual([]);
    expect(
      reguasQueMudaram(
        pgp({
          adaptacao: texto("A17", "Os 6 meses são teto."),
          cronograma: texto("A14", "O prazo de 6 meses é o limite do contrato."),
        }),
      ),
    ).toEqual([]);
  });
});
