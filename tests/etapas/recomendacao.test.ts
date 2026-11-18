// Recomendação de participar ou não (decisão 0086): sugestão do PMO, com motivo, condições e os itens que a sustentam;
// o código confere os itens; a decisão continua só do GP.
import { describe, expect, it } from "vitest";
import type { AnaliseRfpDossie } from "../../src/dossie/esquema";
import { recomendacaoDoDossie, recomendacaoEmTexto } from "../../src/etapas/1-rfp/recomendacao";
import { RespostaLeituraRfp } from "../../src/pmo/schemas/leitura-rfp";

const item = (id: string) => ({
  id,
  secao: "atencao" as const,
  nome: "Ponto inventado",
  texto: "Texto inventado.",
  rotulo: "sugestao" as const,
  fontes: [],
  requisitos: [],
  tema: "",
  premissa: "" as const,
  porquePesa: "",
  pergunta: "",
  impacto: 1,
});

function analise(resposta: unknown): AnaliseRfpDossie {
  return {
    participacao: { decisao: "a-decidir" },
    leituraPmo: { resposta: RespostaLeituraRfp.parse(resposta), modelo: "teste", em: "2026-11-18" },
  } as unknown as AnaliseRfpDossie;
}

describe("recomendação de participar ou não", () => {
  it("as respostas gravadas antes da decisão 0086 continuam válidas, sem recomendação", () => {
    const r = RespostaLeituraRfp.parse({ cruzamentos: [], autoconferencia: [], itens: [item("a1")] });
    expect(r.recomendacao).toBeNull();
    expect(recomendacaoDoDossie(analise(r))).toBeUndefined();
  });

  it("sempre como sugestão do PMO, com motivo, condições e os itens conferidos", () => {
    const a = analise({
      cruzamentos: [],
      autoconferencia: [],
      itens: [item("a1"), item("a2")],
      recomendacao: {
        sugestao: "participar_com_condicoes",
        motivo: "Sugere-se participar se o prazo de execução for informado.",
        condicoes: ["resposta sobre o prazo de execução"],
        itens: ["pmo:a1", "a2", "a9"],
      },
    });
    const c = recomendacaoDoDossie(a)!;
    expect(c.itens).toEqual(["pmo:a1", "a2"]);
    expect(c.semItem).toEqual(["a9"]);
    const t = recomendacaoEmTexto(c);
    expect(t).toMatch(/^Sugestão do PMO: participar com condições\./);
    expect(t).toMatch(/Condições: resposta sobre o prazo de execução\./);
    expect(t).toMatch(/Itens citados que não estão na leitura: a9; conferir/);
    // a decisão do GP não muda
    expect(a.participacao.decisao).toBe("a-decidir");
  });
});
