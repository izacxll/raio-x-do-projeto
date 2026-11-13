// Etapa 2: contas do código (cronograma e preço), conferência final e o fluxo inteiro na RFP pública da OEI,
// com as respostas do PMO geradas no Claude Code (tests/fixtures/gerados/proposta-oei/), sem chave.
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { conferirMinuta } from "../../src/etapas/2-proposta/conferencia-final";
import { calcularCronograma, duracaoEsperada } from "../../src/etapas/2-proposta/cronograma";
import { pedidoConteudo, pedidoEap, pedidoEstrategia } from "../../src/etapas/2-proposta/pedidos";
import { calcularPreco, conferirValor, lerValorEmReais } from "../../src/etapas/2-proposta/preco";
import { montarPontoDePartida, type PontoDePartida } from "../../src/etapas/2-proposta/ponto-de-partida";
import {
  avaliarItens,
  itensDaProposta,
  propostaInicial,
  requisitosCitadosForaDosItens,
} from "../../src/etapas/2-proposta/proposta";
import { RespostaConteudo, RespostaEap, RespostaEstrategia } from "../../src/pmo/schemas/proposta";
import type { AtividadeEap, HorasPerfil, PerfilEquipe } from "../../src/pmo/schemas/proposta";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const est = (o: number, m: number, p: number) => ({
  otimista: o,
  mais_provavel: m,
  pessimista: p,
  base: "teste",
});
const atv = (id: string, pred: string[], d: [number, number, number], aprov = false): AtividadeEap => ({
  id,
  produto: "P1",
  nome: `Atividade ${id}`,
  predecessoras: pred,
  duracao: est(...d),
  aprovacaoCliente: aprov,
  requisitos: [],
});

describe("cronograma (código)", () => {
  it("PERT: (o + 4m + p) / 6", () => {
    expect(duracaoEsperada(2, 3, 10)).toBe(4);
  });

  it("caminho crítico, folga e tempo de aprovação do cliente", () => {
    const c = calcularCronograma(
      [
        atv("A", [], [4, 5, 6]),
        atv("B", ["A"], [8, 10, 12], true),
        atv("C", ["A"], [2, 3, 4]),
        atv("D", ["B", "C"], [1, 1, 1]),
      ],
      { aprovacaoDias: 5 },
    );
    expect(c.problemas).toEqual([]);
    expect(c.total).toBe(5 + 10 + 5 + 1);
    expect(c.caminhoCritico).toEqual(["A", "B", "D"]);
    expect(c.atividades.find((a) => a.id === "C")?.folga).toBe(12);
  });

  it("sem o tempo de aprovação, avisa que é decisão do GP", () => {
    const c = calcularCronograma([atv("A", [], [1, 1, 1], true)]);
    expect(c.problemas.join(" ")).toMatch(/Tempo de aprovação do cliente não informado/);
  });

  it("ciclo e predecessora inexistente são apontados", () => {
    expect(
      calcularCronograma([atv("A", ["B"], [1, 1, 1]), atv("B", ["A"], [1, 1, 1])]).problemas.join(" "),
    ).toMatch(/ciclo/);
    expect(calcularCronograma([atv("A", ["Z"], [1, 1, 1])]).problemas.join(" ")).toMatch(/Z não existe/);
  });

  it("estimativa fora de ordem é apontada", () => {
    expect(calcularCronograma([atv("A", [], [5, 3, 1])]).problemas.join(" ")).toMatch(
      /otimista ≤ mais provável/,
    );
  });

  it("datas em dias úteis a partir do início informado pelo GP, e conferência com o prazo da RFP", () => {
    // segunda-feira, 4/1/2027
    const c = calcularCronograma([atv("A", [], [5, 5, 5]), atv("B", ["A"], [5, 5, 5])], {
      inicio: new Date(2027, 0, 4),
      prazoRfp: { dias: 10, unidade: "dias úteis", texto: "10 dias úteis" },
    });
    expect(c.atividades[1]?.dataInicio?.getDate()).toBe(11);
    expect(c.dataFim?.getDate()).toBe(15);
    expect(c.conferenciaPrazo.situacao).toBe("cabe");
    const passa = calcularCronograma([atv("A", [], [30, 30, 30])], {
      prazoRfp: { dias: 20, unidade: "dias corridos", texto: "20 dias" },
    });
    expect(passa.conferenciaPrazo.situacao).toBe("nao-cabe");
  });
});

describe("preço (código, com os dados do GP)", () => {
  const perfis: PerfilEquipe[] = [
    { id: "c", nome: "Coordenação", exigido: true, qualificacao: "", requisito: "", fontes: [] },
    { id: "e", nome: "Especialista", exigido: false, qualificacao: "", requisito: "", fontes: [] },
  ];
  const horas: HorasPerfil[] = [
    { atividade: "A", perfil: "c", horas: est(8, 10, 12) },
    { atividade: "B", perfil: "e", horas: est(20, 20, 20) },
    { atividade: "C", perfil: "e", horas: est(10, 13, 22) },
  ];

  it("sem a tabela do GP, os valores ficam em branco e a tela diz o que falta", () => {
    const p = calcularPreco(perfis, horas, { valoresHora: {}, despesas: [] });
    expect(p.horasTotais).toBe(10 + 20 + 14);
    expect(p.precoCalculado).toBeUndefined();
    expect(p.faltando).toEqual(
      expect.arrayContaining([
        "valor-hora de Coordenação",
        "percentual de tributos",
        "reserva de contingência",
      ]),
    );
  });

  it("conta de baixo para cima, com tributos por dentro", () => {
    const p = calcularPreco(perfis, horas, {
      valoresHora: { c: 200, e: 100 },
      despesas: [{ descricao: "viagens", valor: 1000 }],
      indiretosPct: 10,
      tributosPct: 20,
      reserva: 500,
    });
    expect(p.pessoal).toBe(10 * 200 + 34 * 100);
    expect(p.direto).toBe(5400 + 1000);
    expect(p.indiretos).toBe(640);
    expect(p.subtotal).toBe(6400 + 640 + 500);
    expect(p.precoCalculado).toBe(7540 / 0.8);
    expect(p.tributos).toBe(9425 - 7540);
    expect(p.faltando).toEqual([]);
  });

  it("valor em reais e conferência com o valor estimado do edital", () => {
    expect(lerValorEmReais("valor estimado de R$ 1.234.567,89 (um milhão…)")).toBe(1234567.89);
    expect(lerValorEmReais("orçamento sigiloso")).toBeUndefined();
    expect(conferirValor(70, 100).situacao).toBe("abaixo-75");
    expect(conferirValor(110, 100).situacao).toBe("acima");
    expect(conferirValor(90, 100).situacao).toBe("dentro");
    expect(conferirValor(90, undefined).situacao).toBe("nao-conferido");
  });
});

describe("etapa 2 na RFP pública da OEI (respostas do PMO geradas no Claude Code)", () => {
  const ler = (n: string) =>
    JSON.parse(
      readFileSync(new URL(`../fixtures/gerados/proposta-oei/${n}.json`, import.meta.url), "utf-8"),
    ) as unknown;
  const estrategia = RespostaEstrategia.parse(ler("estrategia"));
  const conteudo = RespostaConteudo.parse(ler("conteudo"));
  const eap = RespostaEap.parse(ler("eap"));
  let doc: DocumentoLido;
  let ponto: PontoDePartida;

  beforeAll(async () => {
    doc = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
    ponto = montarPontoDePartida([doc], undefined, new Date(2026, 10, 13));
  }, 120000);

  it("o ponto de partida traz requisitos, julgamento e o prazo de execução da etapa 1", () => {
    expect(ponto.requisitos.map((r) => r.numero)).toContain("R05");
    expect(ponto.julgamento.length).toBeGreaterThan(3);
    expect(ponto.prazoExecucao).toMatchObject({ dias: 360, unidade: "meses" });
    expect(pedidoEstrategia(ponto)).toContain("R09");
  });

  it("os pedidos levam a abordagem escolhida e os produtos do passo anterior", () => {
    expect(pedidoConteudo(ponto, estrategia, "B", "mais aplicada", { PC3: true })).toMatch(
      /Abordagem escolhida pelo GP: B/,
    );
    expect(pedidoConteudo(ponto, estrategia, "B", undefined, { PC3: true })).toContain("PC3");
    expect(pedidoEap(ponto, estrategia, "B", conteudo)).toContain("P5: Guia de orientação");
  });

  it("toda citação das respostas de teste é achada pelo código no PDF", () => {
    const p = {
      ...propostaInicial(),
      estrategia: { resposta: estrategia, modelo: "teste", em: "" },
      conteudo: { resposta: conteudo, modelo: "teste", em: "" },
      eap: { resposta: eap, modelo: "teste", em: "" },
    };
    const itens = itensDaProposta(p, [doc]);
    const naoAchadas = itens.flatMap((i) =>
      i.conferencia.citacoes
        .map((c, k) => ({ id: i.id, trecho: i.item.fontes[k]?.trecho, estado: c.estado }))
        .filter((c) => c.estado === "nao-conferida"),
    );
    expect(naoAchadas).toEqual([]);
    const av = avaliarItens(itens, ponto.requisitos, requisitosCitadosForaDosItens(p));
    expect(av.numerosSemFonte).toBe(0);
    expect(av.fatosSemCitacao).toBe(0);
    expect(av.aderencia).toBe(1);
    expect(av.cobertura).toBe(1);
  });

  it("cronograma da EAP cabe nos 12 meses de vigência e passa pelo caminho crítico até o guia", () => {
    const c = calcularCronograma(eap.atividades, { aprovacaoDias: 10, prazoRfp: ponto.prazoExecucao });
    expect(c.problemas).toEqual([]);
    expect(c.caminhoCritico.at(-1)).toBe("5.3");
    expect(c.conferenciaPrazo.situacao).toBe("cabe");
  });

  it("matriz de atendimento liga todos os requisitos e os três quesitos de pontuação", () => {
    const m = conferirMinuta(ponto, estrategia, conteudo, eap);
    expect(m.matriz.filter((l) => l.situacao === "nao-localizado").map((l) => l.chave)).toEqual([]);
    expect(m.matriz.filter((l) => l.tipo === "criterio")).toHaveLength(3);
    expect(m.checklist.find((c) => c.item === "Prazo de entrega da proposta")?.situacao).toBe("a-conferir");
  });
});

describe("conferência final sem a seção de um quesito", () => {
  it("quesito sem seção fica 'não localizado na minuta', nunca ausente", async () => {
    const ler = (n: string) =>
      JSON.parse(
        readFileSync(new URL(`../fixtures/gerados/proposta-oei/${n}.json`, import.meta.url), "utf-8"),
      ) as unknown;
    const e = RespostaEstrategia.parse(ler("estrategia"));
    const c = RespostaConteudo.parse(ler("conteudo"));
    const semInstitucional = { ...c, estrutura: c.estrutura.filter((s) => !/institucional/i.test(s.titulo)) };
    const doc = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
    const ponto = montarPontoDePartida([doc], undefined, new Date(2026, 10, 13));
    const m = conferirMinuta(ponto, e, semInstitucional, undefined);
    expect(
      m.matriz.find((l) => l.chave === "Qualificação e experiência da empresa proponente")?.situacao,
    ).toBe("nao-localizado");
  }, 120000);
});
