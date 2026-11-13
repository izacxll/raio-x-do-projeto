// Conferência de citações e de redação do que o PMO devolve ("sugerir, nunca afirmar" no código).
import { describe, expect, it } from "vitest";
import { conferirCitacao, partesDaCitacao } from "../../src/pmo/citacoes";
import { conferirItem, numerosSemFonte, sugestaoSemCondicional } from "../../src/pmo/redacao";
import type { ItemPmo } from "../../src/pmo/schemas/comum";
import { documentoLido } from "../etapas/rfp-ajudantes";

const RFP = documentoLido(
  [
    "EDITAL\nO prazo de vigência do contrato é de 12 (doze) meses, a contar da assinatura.",
    "Os produtos serão analisados pela contratante. O pagamento é realizado somente após ateste de confor-\nmidade e aprovação pela Contratante.",
    "",
    "Os serviços serão prestados, como regra, em formato remoto. A equipe terá 4 especialistas.",
  ],
  [3],
);

const item = (p: Partial<ItemPmo>): ItemPmo => ({
  id: "x",
  texto: "",
  rotulo: "sugestao",
  motivo: "",
  fontes: [],
  alternativas: [],
  requisitos: [],
  ficha: "",
  ...p,
});

describe("conferência de citações", () => {
  it("acha a citação literal na página indicada, mesmo com hífen de fim de linha", () => {
    const r = conferirCitacao(
      {
        doc: "rfp",
        pagina: 2,
        trecho: "O pagamento é realizado somente após ateste de conformidade e aprovação pela Contratante.",
      },
      [RFP],
    );
    expect(r.estado).toBe("conferida");
  });

  it("pega uma citação falsa", () => {
    const r = conferirCitacao(
      { doc: "rfp", pagina: 2, trecho: "A contratante aprovará cada produto em até 10 dias úteis." },
      [RFP],
    );
    expect(r.estado).toBe("nao-conferida");
  });

  it("citação noutra página: diz onde achou", () => {
    const r = conferirCitacao(
      { doc: "rfp", pagina: 1, trecho: "Os serviços serão prestados, como regra, em formato remoto." },
      [RFP],
    );
    expect(r).toMatchObject({ estado: "outra-pagina", pagina: 4 });
  });

  it("página indicada sem texto legível e trecho em nenhum lugar: não verificável", () => {
    const r = conferirCitacao({ doc: "rfp", pagina: 3, trecho: "texto que só estaria na página escaneada" }, [
      RFP,
    ]);
    expect(r.estado).toBe("nao-verificavel");
  });

  it("partes separadas por [...] são conferidas em separado; duas frases de lugares diferentes coladas não passam", () => {
    expect(
      conferirCitacao(
        {
          doc: "rfp",
          pagina: 2,
          trecho: "Os produtos serão analisados pela contratante. [...] somente após ateste de conformidade",
        },
        [RFP],
      ).estado,
    ).toBe("conferida");
    expect(
      conferirCitacao(
        {
          doc: "rfp",
          pagina: 2,
          trecho: "Os produtos serão analisados pela contratante, prestados em formato remoto.",
        },
        [RFP],
      ).estado,
    ).toBe("nao-conferida");
  });

  it("anotação de página e aspas dentro da citação saem antes de conferir", () => {
    expect(partesDaCitacao('"o prazo de vigência (p. 1) do contrato"')).toEqual([
      "oprazodevigenciadocontrato",
    ]);
  });

  it("documento citado que não foi enviado: não conferida", () => {
    expect(
      conferirCitacao({ doc: "tap", pagina: 1, trecho: "O prazo de vigência do contrato" }, [RFP]).estado,
    ).toBe("nao-conferida");
  });
});

describe("redação das sugestões do PMO", () => {
  it("sugestão afirmativa ou sem condicional é marcada", () => {
    expect(sugestaoSemCondicional("A FGV deve recusar o contrato.")).toBe(true);
    expect(sugestaoSemCondicional("Limitar as revisões a duas rodadas.")).toBe(true);
    expect(sugestaoSemCondicional("Sugere-se limitar as revisões a duas rodadas.")).toBe(false);
  });

  it("item 'do documento' com citação falsa vira 'citação não conferida'", () => {
    const c = conferirItem(
      item({
        rotulo: "documento",
        texto: "Aprovação em 10 dias.",
        fontes: [{ doc: "rfp", pagina: 2, trecho: "aprovará em até 10 dias úteis" }],
      }),
      [RFP],
    );
    expect(c.citacaoNaoConferida).toBe(true);
  });
});

describe("números sem fonte", () => {
  it("prazo, valor e percentual que não estão nos documentos são apontados", () => {
    const r = numerosSemFonte(
      "Sugere-se prever 15 dias úteis de análise, reserva de 10% e R$ 50.000,00 de despesas.",
      { fontes: [] },
      [RFP],
    );
    expect(r).toEqual(expect.arrayContaining(["15 dias", "10%", "R$ 50.000,00"]));
  });

  it("número que está no documento (mesmo por extenso entre parênteses) não é apontado", () => {
    expect(numerosSemFonte("Sugere-se considerar a vigência de 12 meses.", { fontes: [] }, [RFP])).toEqual(
      [],
    );
    expect(numerosSemFonte("Recomenda-se avaliar se 4 especialistas bastam.", { fontes: [] }, [RFP])).toEqual(
      [],
    );
  });

  it("decisão do GP sem número não é apontada", () => {
    expect(numerosSemFonte("Prazo de análise: a definir pelo GP.", { fontes: [] }, [RFP])).toEqual([]);
  });
});
