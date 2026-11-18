// Nome do projeto sugerido a partir da RFP (instrumento e objeto): sugestão editável, nunca o nome sem o GP.
import { describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { instrumentoCurto, objetoCurto, sugerirNomeProjeto } from "../../src/etapas/1-rfp/nome-do-projeto";
import { camposDoDossie } from "../../src/exportacao/modelo";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

describe("partes do nome", () => {
  it('instrumento sem "Edital de" e sem "Público"', () => {
    expect(instrumentoCurto("Edital de Chamamento Público SMPED nº 001/2025")).toBe(
      "Chamamento SMPED nº 001/2025",
    );
    expect(instrumentoCurto("EDITAL DE PREGÃO ELETRÔNICO Nº 16/2026")).toBe("Pregão eletrônico nº 16/2026");
  });

  it("objeto sem a fórmula de abertura, na primeira oração e curto", () => {
    expect(objetoCurto("2.1 O TERMO DE FOMENTO terá por objeto o desenvolvimento de ações culturais.")).toBe(
      "Desenvolvimento de ações culturais",
    );
    expect(
      objetoCurto("Contratação de empresa especializada para a prestação de serviços de recepção."),
    ).toBe("Prestação de serviços de recepção");
    expect(
      objetoCurto("O objeto da presente licitação é a CONTRATAÇÃO DE EMPRESA PARA CONSULTORIA EM GESTÃO."),
    ).toBe("Consultoria em gestão");
    expect(objetoCurto("Prestação de serviços de desenvolvi- mento de subsídios técnicos.")).toBe(
      "Prestação de serviços de desenvolvimento de subsídios técnicos",
    );
    // decisão 0084: o verbo no infinitivo também sai do nome
    expect(
      objetoCurto(
        "Contratar uma pessoa jurídica especializada para o desenho do plano diretor de tecnologia.",
      ),
    ).toBe("Desenho do plano diretor de tecnologia");
    // a fórmula vai só até "especializada" e a preposição: não corta no primeiro "de" longe dela (revisão de código, 0084)
    expect(
      objetoCurto("Contratação de consultoria especializada na elaboração do plano diretor de tecnologia"),
    ).toBe("Elaboração do plano diretor de tecnologia");
    // contratação direta da FGV (decisão 0085)
    expect(
      objetoCurto(
        "Contratação dos serviços da Fundação Getulio Vargas para a avaliação do programa de merenda",
      ),
    ).toBe("Avaliação do programa de merenda");
    expect(objetoCurto("Contratar empresa especializada na prestação de serviços de apoio")).toBe(
      "Prestação de serviços de apoio",
    );
    expect(objetoCurto("a".repeat(5) + " " + "palavra ".repeat(20)).endsWith("…")).toBe(true);
  });
});

describe("no edital de termo de fomento (SMPED)", () => {
  it("sugere o nome pelo objeto (2.1) e pelo instrumento, com a origem", async () => {
    const hoje = new Date(2026, 10, 13);
    const doc = await lerRfpPublica("chamamento-publico-termo-fomento-smped-sp-2025.pdf", hoje);
    const a = analisarRfp([doc], hoje);
    const s = sugerirNomeProjeto(a);
    expect(s?.nome).toBe(
      "Desenvolvimento de ações em temáticas de políticas públicas diversas… (Chamamento SMPED nº 001/2025)",
    );
    expect(s?.origens.map((o) => o.pagina)).toEqual([1, 1]);

    // sem nome do GP, o documento exportado leva a sugestão com o aviso; com nome, o nome do GP
    const d = criarDossieVazio();
    d.documentos.push(doc);
    expect(camposDoDossie(d).projeto).toMatch(/— nome sugerido pela ferramenta, a confirmar pelo GP$/);
    d.projeto.nome = "Projeto do GP";
    expect(camposDoDossie(d).projeto).toBe("Projeto do GP");
  }, 120000);

  it('sem RFP no dossiê, continua "Projeto sem nome"', () => {
    expect(camposDoDossie(criarDossieVazio()).projeto).toBe("Projeto sem nome");
  });
});
