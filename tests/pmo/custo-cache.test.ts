// Custo com o cache de 1 hora no prefixo estável (decisão 0095): a escrita de 1 hora custa 2 × a entrada, a de 5
// minutos 1,25 ×, e a leitura 0,05 × no Opus 5.5.
import { describe, expect, it } from "vitest";
import { custoDoUso, estimarCusto } from "../../src/pmo/custo";

describe("custo com o cache de 1 hora (decisão 0095)", () => {
  it("separa a escrita de 1 hora da de 5 minutos", () => {
    // 10 mil escritos, dos quais 6 mil no de 1 hora: 4 mil × 5 + 6 mil × 8, por milhão
    expect(
      custoDoUso("claude-opus-5-5", {
        entrada: 0,
        saida: 0,
        escritaCache: 10000,
        escritaCache1h: 6000,
        leituraCache: 0,
      }),
    ).toBeCloseTo(0.068, 6);
    // uso antigo, sem a separação: tudo como 5 minutos
    expect(
      custoDoUso("claude-opus-5-5", { entrada: 0, saida: 0, escritaCache: 10000, leituraCache: 0 }),
    ).toBeCloseTo(0.05, 6);
  });

  it("a estimativa da primeira chamada usa a escrita de 1 hora; a seguinte, a leitura", () => {
    const e = estimarCusto("claude-opus-5-5", "riscos", 100000, 10000)!;
    // 100 mil × 8 + 10 mil × 4 = 0,84 de entrada na primeira; 100 mil × 0,2 + 10 mil × 4 = 0,06 na seguinte
    expect(e.semCache.min - e.comCache.min).toBeCloseTo(0.84 - 0.06, 6);
  });
});
