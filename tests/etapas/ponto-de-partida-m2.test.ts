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
  "1. OBJETO: Contratação de serviços para estudo de impacto de evento.\nO evento será previsto para o período de 07/11/2026 a 06/01/2027.",
  "Vantajosidade não se confunde com menor preço, mas com a obtenção do serviço que melhor satisfaça a Administração.\nPortanto, a modalidade a ser adotada para esta prestação de serviço, será INEXIGIBILIDADE de Licitação com base no Art. 74, III.",
  "3.3. O prazo de vigência da contratação será de 06 (seis) meses contado da data de assinatura do contrato.\n18.8. O reajuste será realizado por apostilamento.\nCidade do Interior, 04 de setembro de 2026.",
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
    expect(ce15.some((i) => /04\/09\/2026/.test(i.nome))).toBe(false);
    expect(ce15.some((i) => /07\/11\/2026/.test(i.nome))).toBe(true);
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
              trecho: "O evento será previsto para o período de 07/11/2026 a 06/01/2027.",
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

describe("regra do preço na contratação direta", () => {
  it("não procura pontuação do preço: pede a justificativa de preço", async () => {
    const { criteriosDaRfp, regraDoPreco, textoDaRegraPreco } =
      await import("../../src/etapas/2-proposta/pontos");
    const a = analisarRfp([documentoLido(PAGINAS)], HOJE);
    const regra = regraDoPreco(a, criteriosDaRfp(a));
    expect(regra.tipo).toBe("contratacao-direta");
    expect(textoDaRegraPreco(regra)).toMatch(/justificativa de preço/);
  });
});

describe("brechas do ponto de partida: junção, proteções, destino e requisitos", () => {
  const ponto = (id: string, trecho: string, nome = "Ponto") => ({
    id,
    secao: "brechas" as const,
    rotulo: "sugestao" as const,
    nome,
    texto: nome,
    origem: { documento: "RFP", pagina: 1, trecho },
    situacao: "localizado" as const,
    perguntaFinal: "",
  });

  it("ponto da leitura e brecha do código do mesmo trecho viram um item, com os ids juntados", async () => {
    const { juntarBrechas, idsDaBrecha } = await import("../../src/etapas/2-proposta/ponto-de-partida");
    const trecho = "O não cumprimento em tempo hábil da Ordem de Serviço acarretará notificação";
    const codigo = { ...ponto("brechas:vago:rfp:5", trecho), perguntaFinal: "Solicita-se informar o prazo." };
    const outra = ponto("brechas:outra", "Texto que não tem nada a ver com o anterior, outra cláusula");
    const r = juntarBrechas(
      [codigo, outra],
      [ponto("etapa-1:a10", trecho, "Ordem de serviço em tempo hábil")],
    );
    expect(r.map((b) => b.id)).toEqual(["brechas:outra", "etapa-1:a10"]);
    const a10 = r.find((b) => b.id === "etapa-1:a10");
    expect(a10 && idsDaBrecha(a10)).toEqual(["etapa-1:a10", "brechas:vago:rfp:5"]);
    expect(a10?.perguntaFinal).toMatch(/informar o prazo/);
  });

  it("junta também com o número do item na frente do trecho, e pela página citada com o mesmo assunto", async () => {
    const { juntarBrechas, idsDaBrecha } = await import("../../src/etapas/2-proposta/ponto-de-partida");
    const trecho = "O não cumprimento em tempo hábil da Ordem de Serviço acarretará notificação";
    const prazo = ponto("brechas:vago:rfp:5", trecho);
    const campo = {
      ...ponto("brechas:CTR2-campo:19", "Não será permitida subcontratação do objeto"),
      origem: { documento: "RFP", pagina: 19, trecho: "Não será permitida subcontratação do objeto" },
      nome: "O documento veda a subcontratação e prevê atividade de campo",
      texto: "O documento veda a subcontratação e prevê atividade de campo pela equipe.",
    };
    const a10 = ponto("etapa-1:a10", `3.6. ${trecho}`, "Ordem de serviço em tempo hábil");
    const a4 = {
      ...ponto("etapa-1:a4", "a equipe aplica a pesquisa", "Pesquisa de campo × quem pode atuar"),
      texto: "A vedação de subcontratação pode alcançar a atividade de campo.",
      nota: "Também nas p. 19.",
    };
    const outroComA19 = {
      ...a4,
      id: "etapa-1:a9",
      nome: "Outro ponto",
      texto: "Subcontratação e campo, de novo.",
    };
    const r = juntarBrechas([prazo, campo], [a10, a4, outroComA19]);
    expect(r.map((b) => b.id)).toEqual(["etapa-1:a10", "etapa-1:a4", "etapa-1:a9"]);
    expect(idsDaBrecha(r[0]!)).toEqual(["etapa-1:a10", "brechas:vago:rfp:5"]);
    expect(idsDaBrecha(r[1]!)).toEqual(["etapa-1:a4", "brechas:CTR2-campo:19"]);
    // a brecha do código entra num ponto só
    expect(r[2]?.junta).toBeUndefined();
  });

  it("só o pedido da estratégia pede destino para cada brecha", async () => {
    const docs = [documentoLido(PAGINAS)];
    const p = montarPontoDePartida(docs, undefined, HOJE);
    expect(pontoDePartidaEmTexto(p, { pedirDestino: true })).toMatch(/dê um destino a cada um pelo id/);
    expect(pontoDePartidaEmTexto(p)).toMatch(/os destinos já foram dados na estratégia/);
  });

  it("a lista de requisitos traz também as obrigações (a mesma contagem do esqueleto)", () => {
    const docs = [
      documentoLido([
        ...PAGINAS,
        "5. DAS OBRIGAÇÕES DA CONTRATADA:\n5.1. Comunicar ao Contratante, no prazo máximo de 72 (setenta e duas) horas, os motivos que impossibilitem o cumprimento do prazo previsto, com a devida comprovação;",
      ]),
    ];
    const p = montarPontoDePartida(docs, undefined, HOJE);
    const texto = pontoDePartidaEmTexto(p);
    for (const r of [...p.requisitos, ...p.obrigacoes]) expect(texto).toContain(`- ${r.numero} · `);
  });
});

describe("duração da fase a definir (null)", () => {
  it("o schema aceita null e a soma contra a vigência não é feita", async () => {
    const { FaseMetodologia } = await import("../../src/pmo/schemas/proposta");
    const fase = FaseMetodologia.parse({
      nome: "Campo",
      objetivo: "",
      atividades: [],
      quemFaz: "",
      entrega: "",
      duracao: "a definir pelo GP",
      meses: null,
    });
    expect(fase.meses).toBeNull();
  });
});
