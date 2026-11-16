// Aviso de caixa: o arquivo parece de outra caixa (proposta na do PGP, termo de referência na do TAP).
// Só aviso: o papel do documento não muda.
import { describe, expect, it } from "vitest";
import type { PaginaLida } from "../../src/dossie/esquema";
import { caixaParece, tipoProvavel } from "../../src/leitura/tipo-documento";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const pagina = (texto: string, numero = 1): PaginaLida => ({
  numero,
  origem: "texto",
  texto,
  caracteres: texto.length,
});

describe("tipo provável pelo título", () => {
  it("reconhece proposta, termo de referência, TAP, PGP e plano de trabalho", () => {
    expect(tipoProvavel([pagina("Instituto Exemplo\nPROPOSTA TÉCNICA\nPara o edital nº 1")])?.papel).toBe(
      "proposta",
    );
    expect(tipoProvavel([pagina("ANEXO I\nTERMO DE REFERÊNCIA\n1. Objeto")])?.papel).toBe("rfp");
    expect(tipoProvavel([pagina("Termo de abertura do projeto\nProjeto Exemplo")])?.papel).toBe("tap");
    expect(tipoProvavel([pagina("Plano de gerenciamento do projeto\nVersão 1")])?.papel).toBe("pgp");
    expect(tipoProvavel([pagina("PLANO DE TRABALHO\nQuadro 1")])?.nome).toBe("Plano de trabalho");
  });

  it("sem título reconhecível, nada", () => {
    expect(tipoProvavel([pagina("Relatório mensal de atividades\nJaneiro")])).toBeUndefined();
  });
});

describe("aviso de caixa", () => {
  it("proposta na caixa do PGP e termo de referência na do TAP", () => {
    expect(caixaParece("pgp", [pagina("PROPOSTA TÉCNICA")])?.caixaSugerida).toBe("proposta");
    expect(caixaParece("tap", [pagina("TERMO DE REFERÊNCIA")])?.caixaSugerida).toBe("rfp");
  });

  it("capa de proposta que cita o pregão e modelo de anexo não enganam", () => {
    expect(
      caixaParece("proposta", [
        pagina("Pregão eletrônico nº 12/2026\nRef.: Edital nº 12/2026\nPROPOSTA TÉCNICA"),
      ]),
    ).toBeUndefined();
    expect(caixaParece("anexo-rfp", [pagina("ANEXO I\nModelo de plano de trabalho")])).toBeUndefined();
  });

  it("na caixa certa, ou em caixa da mesma família, não avisa", () => {
    expect(caixaParece("pgp", [pagina("PLANO DE TRABALHO")])).toBeUndefined();
    expect(caixaParece("anexo-rfp", [pagina("TERMO DE REFERÊNCIA")])).toBeUndefined();
    expect(caixaParece("proposta", [pagina("PLANO DE TRABALHO")])).toBeUndefined();
  });

  it("o edital público da SMPED na caixa da RFP não avisa; na do PGP, avisa", async () => {
    const d = await lerRfpPublica("chamamento-publico-termo-fomento-smped-sp-2025.pdf");
    expect(caixaParece("rfp", d.paginas)).toBeUndefined();
    expect(caixaParece("pgp", d.paginas)?.caixaSugerida).toBe("rfp");
  }, 120000);
});
