// Recomendação de participar ou não (decisão 0086): sugestão do PMO, com motivo, condições e os itens que a sustentam;
// o código confere os itens, os números e a redação; a decisão continua só do GP.
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { describe, expect, it } from "vitest";
import type { AnaliseRfpDossie, DocumentoLido } from "../../src/dossie/esquema";
import { recomendacaoDoDossie, recomendacaoEmTexto } from "../../src/etapas/1-rfp/recomendacao";
import { RespostaLeituraRfp } from "../../src/pmo/schemas/leitura-rfp";

const item = (id: string, nome = "Ponto inventado") => ({
  id,
  secao: "atencao" as const,
  nome,
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

function analise(resposta: unknown, revisoes: Record<string, unknown> = {}): AnaliseRfpDossie {
  return {
    participacao: { decisao: "a-decidir" },
    revisoes,
    leituraPmo: { resposta: RespostaLeituraRfp.parse(resposta), modelo: "teste", em: "2026-11-18" },
  } as unknown as AnaliseRfpDossie;
}

const rfp = {
  paginas: [{ numero: 1, texto: "O prazo de execução é de 180 dias.", origem: "texto" }],
} as unknown as DocumentoLido;

describe("recomendação de participar ou não", () => {
  it("as respostas gravadas antes da decisão 0086 continuam válidas, sem recomendação", () => {
    const r = RespostaLeituraRfp.parse({ cruzamentos: [], autoconferencia: [], itens: [item("a1")] });
    expect(r.recomendacao).toBeNull();
    expect(recomendacaoDoDossie(analise(r))).toBeUndefined();
  });

  it("fora do formato, a recomendação fica de fora e a leitura vale", () => {
    const r = RespostaLeituraRfp.parse({
      cruzamentos: [],
      autoconferencia: [],
      itens: [item("a1")],
      recomendacao: { sugestao: "participar com condições", motivo: "x", condicoes: [], itens: [] },
    });
    expect(r.recomendacao).toBeNull();
    expect(r.itens).toHaveLength(1);
    // o schema que vai à API continua com o campo
    expect(JSON.stringify(zodOutputFormat(RespostaLeituraRfp).schema)).toMatch(/recomendacao/);
  });

  it("sempre como sugestão do PMO, com os nomes dos itens que a sustentam e os avisos do código", () => {
    const a = analise(
      {
        cruzamentos: [],
        autoconferencia: [],
        itens: [item("a1", "Sem prazo de pagamento"), item("a2", "Aceite sem limite"), item("a3")],
        recomendacao: {
          sugestao: "participar_com_condicoes",
          motivo: "Sugere-se participar se o contratante confirmar os 180 dias e os 12 meses de garantia.",
          condicoes: ["resposta sobre o pagamento"],
          itens: ["pmo:a1", "a2", "a3", "a9"],
        },
      },
      { "pmo:a3": { estado: "descartado" } },
    );
    const c = recomendacaoDoDossie(a, [rfp])!;
    expect(c.itens).toEqual(["Sem prazo de pagamento", "Aceite sem limite"]);
    expect(c.descartados).toEqual(["a3"]);
    expect(c.semItem).toEqual(["a9"]);
    // 180 dias está no documento; 12 meses não
    expect(c.numerosSemFonte).toEqual(["12 meses"]);
    expect(c.redacaoAConferir).toBe(false);
    const t = recomendacaoEmTexto(c);
    expect(t).toMatch(/^Sugestão do PMO: participar com condições\./);
    expect(t).toMatch(/Pontos que a sustentam: Sem prazo de pagamento; Aceite sem limite\./);
    expect(t).toMatch(/número sem fonte — conferir: 12 meses/);
    // a decisão do GP não muda
    expect(a.participacao.decisao).toBe("a-decidir");
  });

  it("motivo afirmativo, sem marca condicional: redação a conferir", () => {
    const a = analise({
      cruzamentos: [],
      autoconferencia: [],
      itens: [item("a1")],
      recomendacao: {
        sugestao: "participar",
        motivo: "A FGV deve participar.",
        condicoes: [],
        itens: ["a1"],
      },
    });
    expect(recomendacaoDoDossie(a)!.redacaoAConferir).toBe(true);
    expect(recomendacaoEmTexto(recomendacaoDoDossie(a)!)).toMatch(/redação a conferir/);
  });
});
