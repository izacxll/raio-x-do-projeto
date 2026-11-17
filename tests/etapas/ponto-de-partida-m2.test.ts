// Correções do ponto de partida da etapa 2 achadas no teste externo (issue da M2): hipótese legal na contratação
// direta, data do fecho fora das brechas e os pontos de atenção da leitura do PMO entre as brechas.
import { describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { analiseInicial } from "../../src/etapas/1-rfp/revisao";
import { montarPontoDePartida, pontoDePartidaEmTexto } from "../../src/etapas/2-proposta/ponto-de-partida";
import { RespostaLeituraRfp } from "../../src/pmo/schemas/leitura-rfp";
import { ehDataDoFecho, encontrarDatas } from "../../src/texto/datas";
import { documentoLido } from "./rfp-ajudantes";

const HOJE = new Date(2026, 10, 16);
const PAGINAS = [
  "1. OBJETO: Contratação de serviços para estudo de impacto de evento.\nO evento será realizado no período de 08/11/2025 a 07/01/2026.",
  "Vantajosidade não se confunde com menor preço, mas com a obtenção do serviço que melhor satisfaça a Administração.\nPortanto, a modalidade a ser adotada para esta prestação de serviço, será INEXIGIBILIDADE de Licitação com base no Art. 74, III.",
  "3.3. O prazo de vigência da contratação será de 06 (seis) meses contado da data de assinatura do contrato.\n18.8. O reajuste será realizado por apostilamento.\nCidade do Interior, 08 de setembro de 2025.",
];

describe("ponto de partida da etapa 2 (correções do teste externo)", () => {
  it("contratação direta: hipótese legal no lugar de critério de julgamento", () => {
    const docs = [documentoLido(PAGINAS)];
    const texto = pontoDePartidaEmTexto(montarPontoDePartida(docs, undefined, HOJE));
    expect(texto).not.toMatch(/Menor preço/);
    expect(texto).toMatch(/Hipótese legal \(contratação direta\): Inexigibilidade/);
  });

  it("a data do fecho do documento não vira brecha de evento com data fixa", () => {
    const fecho = PAGINAS[2] ?? "";
    const d = encontrarDatas(fecho).at(-1);
    expect(d && ehDataDoFecho(fecho, d)).toBe(true);
    const a = analisarRfp([documentoLido(PAGINAS)], HOJE);
    const ce15 = a.itens.filter((i) => i.id.startsWith("brechas:CE15"));
    expect(ce15.some((i) => /08\/09\/2025/.test(i.nome))).toBe(false);
    expect(ce15.some((i) => /08\/11\/2025/.test(i.nome))).toBe(true);
  });

  it("os pontos de atenção da leitura do PMO entram nas brechas, com o id etapa-1:<id>", () => {
    const docs = [documentoLido(PAGINAS)];
    const a = analisarRfp(docs, HOJE);
    const base = analiseInicial(a, HOJE);
    const resposta = RespostaLeituraRfp.parse({
      itens: [
        {
          id: "a7",
          secao: "atencao",
          nome: "Data do evento fixa",
          texto: "O evento tem data fixa e o campo depende dele.",
          rotulo: "sugestao",
          fontes: [
            {
              doc: "rfp",
              pagina: 1,
              trecho: "O evento será realizado no período de 08/11/2025 a 07/01/2026.",
            },
          ],
          requisitos: [],
          tema: "",
          premissa: "PC4",
          porquePesa: "O campo não se repete.",
          pergunta: "Sugere-se perguntar se o início pode atrasar.",
          impacto: 1,
        },
      ],
    });
    const ponto = montarPontoDePartida(
      docs,
      { ...base, leituraPmo: { resposta, modelo: "teste", em: "" } },
      HOJE,
    );
    const b = ponto.brechas.find((x) => x.id === "etapa-1:a7");
    expect(b?.nome).toBe("PC4 · Data do evento fixa");
    expect(b?.perguntaFinal).toMatch(/início pode atrasar/);
    expect(pontoDePartidaEmTexto(ponto)).toMatch(/id etapa-1:a7/);
  });
});
