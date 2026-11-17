// Divergências do método da etapa 3 (decisão 0041), com documentos de teste: o contrato assinado como entrada, valor
// nos três documentos, parcelas parcela a parcela, frase de conformidade, duração × vigência e regra da equipe.
import { describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { compararRfpEProposta } from "../../src/etapas/3-tap/divergencias";
import { montarEntradaTap } from "../../src/etapas/3-tap/entrada";

const HOJE = new Date(2026, 10, 16);

function doc(papel: DocumentoLido["papel"], paginas: string[]): DocumentoLido {
  return {
    id: papel,
    papel,
    nomeArquivo: `${papel}.pdf`,
    tamanhoBytes: 1,
    totalPaginas: paginas.length,
    lidoEm: HOJE.toISOString(),
    paginas: paginas.map((texto, k) => ({ numero: k + 1, origem: "texto", texto, caracteres: texto.length })),
  };
}

const RFP = doc("rfp", [
  "EDITAL DE CONCORRÊNCIA. Objeto: contratação de consultoria para elaborar dois produtos técnicos. O valor estimado da contratação é de R$ 100.000,00. O contrato terá prazo de vigência de 6 (seis) meses, a contar da data de sua assinatura.",
  "5. CRONOGRAMA DE DESEMBOLSO\nProduto 1 – Plano de trabalho 30 10%\nProduto 2 – Relatório final 150 90%\nTotal 150 100%\nA equipe deverá contar com no mínimo 5 profissionais de nível superior.",
]);
const PROPOSTA = doc("proposta", [
  "PROPOSTA TÉCNICA. Cronograma: 1º trimestre, 2º trimestre e 3º trimestre de execução.",
  "CRONOGRAMA DE DESEMBOLSO, em conformidade com o item 5 do edital:\nProduto 1 – Plano de trabalho 30 20%\nProduto 2 – Relatório final 150 80%\nA proposta prevê o limite de contratação de 5 profissionais na equipe.",
]);
const CONTRATO = doc("contrato", [
  "CONTRATO (fictício, para teste). CLÁUSULA PRIMEIRA. A proposta técnica é parte integrante deste contrato. O valor total do contrato é de R$ 95.000,00. O contrato terá vigência de 6 (seis) meses, contados da assinatura.",
  "CLÁUSULA QUARTA – DESEMBOLSO\nProduto 1 – Plano de trabalho 30 10%\nProduto 2 – Relatório final 150 90%\nO gestor do contrato acompanhará a execução.",
]);

describe("etapa 3 pelo método: contrato e divergências por código", () => {
  const dossie = { ...criarDossieVazio(HOJE), documentos: [RFP, PROPOSTA, CONTRATO] };
  const entrada = montarEntradaTap(dossie, HOJE);
  const divs = compararRfpEProposta(entrada);
  const porId = (id: string) => divs.find((d) => d.id === id);

  it("lê do contrato o valor, a vigência, as parcelas e a cláusula de parte integrante", () => {
    const c = entrada.lidoDoContrato!;
    expect(c.valor?.valor).toBe(95000);
    expect(c.vigencia?.meses).toBe(6);
    expect(c.desembolso.parcelas.map((p) => p.percentual)).toEqual([10, 90]);
    expect(c.parteIntegrante?.pagina).toBe(1);
    expect(c.quemAcompanha.length).toBeGreaterThan(0);
    expect(entrada.documentos.map((d) => d.papel)).toEqual(["rfp", "proposta", "contrato"]);
  });

  it("parcelas diferentes parcela a parcela, com o contrato como versão sugerida", () => {
    const p = porId("parcelas")!;
    expect(p.situacao).toBe("diferente");
    expect(p.observacao).toMatch(/RFP × proposta: 1ª parcela: 10% × 20%/);
    expect(p.observacao).toMatch(/proposta × contrato/);
    expect(p.versaoSugerida).toBe("contrato");
    expect(p.contrato?.texto).toMatch(/1ª 10%/);
  });

  it("a frase de conformidade da proposta que não confere é divergência à parte", () => {
    const c = porId("conformidade:parcelas")!;
    expect(c.situacao).toBe("diferente");
    expect(c.proposta.texto).toMatch(/em conformidade com o item 5/);
  });

  it("os trimestres da proposta passam da vigência do contrato", () => {
    const d = porId("duracao")!;
    expect(d.situacao).toBe("diferente");
    expect(d.proposta.texto).toMatch(/9 meses/);
    expect(d.versaoSugerida).toBe("contrato");
  });

  it("mínimo na RFP × limite na proposta é a mesma equipe com regra diferente", () => {
    expect(porId("equipe-regra")?.situacao).toBe("diferente");
  });

  it("sem o contrato, o valor do contrato não é comparado e as parcelas seguem RFP × proposta", () => {
    const e2 = montarEntradaTap({ ...criarDossieVazio(HOJE), documentos: [RFP, PROPOSTA] }, HOJE);
    const d2 = compararRfpEProposta(e2);
    expect(d2.find((d) => d.id === "valor-contrato")).toBeUndefined();
    expect(d2.find((d) => d.id === "parcelas")?.versaoSugerida).toBe("rfp");
  });

  it("correções da revisão: valor certo, trimestre do calendário, partes integrantes, mínimo × limite só com a mesma quantidade", async () => {
    const { lerContrato } = await import("../../src/etapas/3-tap/contrato");
    const { tipoProvavel } = await import("../../src/leitura/tipo-documento");
    const c = lerContrato(
      doc("contrato", [
        "TERMO DE FOMENTO (fictício). O valor mensal é de R$ 8.000,00, perfazendo o valor total de R$ 96.000,00. O plano de trabalho e a proposta são partes integrantes deste termo.",
      ]),
    );
    expect(c.valor?.valor).toBe(96000);
    expect(c.parteIntegrante).toBeDefined();
    expect(
      tipoProvavel(doc("contrato", ["TERMO DE FOMENTO Nº 12/2026\nPlano de trabalho em anexo"]).paginas)
        ?.papel,
    ).toBe("contrato");
    const prop = doc("proposta", [
      "PROPOSTA TÉCNICA. Entregas no 4º trimestre de 2027. No máximo 30 técnicos por município.",
    ]);
    const rfp = doc("rfp", [
      "EDITAL. O contrato terá prazo de vigência de 6 (seis) meses. A equipe terá no mínimo 2 profissionais.",
    ]);
    const e = montarEntradaTap({ ...criarDossieVazio(HOJE), documentos: [rfp, prop] }, HOJE);
    const d = compararRfpEProposta(e);
    expect(d.find((x) => x.id === "duracao")).toBeUndefined();
    expect(d.find((x) => x.id === "equipe-regra")).toBeUndefined();
  });
});
