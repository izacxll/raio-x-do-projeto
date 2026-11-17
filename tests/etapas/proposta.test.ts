// Etapa 2: contas do código (cronograma e preço), conferência final e o fluxo inteiro na RFP pública da OEI,
// com as respostas do PMO geradas no Claude Code (tests/fixtures/gerados/proposta-oei/), sem chave.
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { feriadosNacionais, pascoa } from "../../src/texto/feriados";
import { conferirMinuta } from "../../src/etapas/2-proposta/conferencia-final";
import {
  calcularCronograma,
  conferirPrazosDosProdutos,
  duracaoEsperada,
} from "../../src/etapas/2-proposta/cronograma";
import { pedidoConteudo, pedidoEap, pedidoEstrategia } from "../../src/etapas/2-proposta/pedidos";
import {
  calcularPreco,
  conferirValor,
  lerValorEmReais,
  textoDasHoras,
  textoDasHorasTotais,
} from "../../src/etapas/2-proposta/preco";
import { montarPontoDePartida, type PontoDePartida } from "../../src/etapas/2-proposta/ponto-de-partida";
import {
  avaliarItens,
  itensDaProposta,
  propostaInicial,
  requisitosCitadosForaDosItens,
} from "../../src/etapas/2-proposta/proposta";
import { LinhaRaci, RespostaConteudo, RespostaEap, RespostaEstrategia } from "../../src/pmo/schemas/proposta";
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
  restricaoData: null,
  aprovacaoCliente: aprov,
  analiseDoContratante: false,
  requisitos: [],
});

describe("EAP com data fixa, horas a definir e o contratante na RACI (issue da M2)", () => {
  it("restrição de data: a duração é a janela em dias úteis, contada pelo código", () => {
    const campo: AtividadeEap = {
      ...atv("2", ["1"], [0, 0, 0]),
      restricaoData: {
        inicio: "07/11/2026",
        fim: "06/01/2027",
        fonte: { doc: "rfp", pagina: 1, trecho: "previsto para o período de 07/11/2026 a 06/01/2027" },
      },
    };
    const c = calcularCronograma([atv("1", [], [5, 5, 5]), campo]);
    // 07/11/2026 (sábado) a 06/01/2027 (quarta): 15 em novembro, 23 em dezembro, 5 em janeiro = 43 dias de semana,
    // menos os feriados nacionais em dia de semana (20/11, 25/12 e 01/01) = 40 dias úteis
    expect(c.atividades.find((a) => a.id === "2")?.duracao).toBe(40);
    expect(c.problemas.join(" ")).toMatch(/data fixa.*61 dias corridos \(40 úteis na rede\)/);
  });

  it("horas null não somam zero: viram pendência do GP", () => {
    const perfis = [
      { id: "ap", nome: "Aplicadores", exigido: false, qualificacao: "", requisito: "", fontes: [] },
    ];
    const p = calcularPreco(perfis, [{ atividade: "2", perfil: "ap", horas: null }], {
      valoresHora: {},
      despesas: [],
    });
    expect(p.faltando.join(" ")).toMatch(/horas de Aplicadores na atividade 2 \(decisão do GP\)/);
  });

  it("com valor-hora, horas a definir deixam o custo e o total em aberto e aparecem como tal, nunca como zero", () => {
    const perfis = [
      { id: "cc", nome: "Coordenação de campo", exigido: false, qualificacao: "", requisito: "", fontes: [] },
      { id: "ap", nome: "Aplicadores", exigido: false, qualificacao: "", requisito: "", fontes: [] },
    ];
    const p = calcularPreco(
      perfis,
      [
        { atividade: "c3", perfil: "cc", horas: est(10, 10, 10) },
        { atividade: "c4", perfil: "cc", horas: null },
        { atividade: "c3", perfil: "ap", horas: null },
        { atividade: "c4", perfil: "ap", horas: null },
      ],
      { valoresHora: { cc: 100, ap: 50 }, despesas: [] },
    );
    const [cc, ap] = p.linhas;
    expect(textoDasHoras(cc!)).toBe("10 + a definir pelo GP (c4)");
    expect(textoDasHoras(ap!)).toBe("a definir pelo GP (c3, c4)");
    expect(cc!.custo).toBeUndefined();
    expect(p.pessoal).toBeUndefined();
    expect(textoDasHorasTotais(p)).toBe(
      "10 + a definir pelo GP (Coordenação de campo: c4; Aplicadores: c3, c4)",
    );
  });

  it("o contratante entra na RACI como parte, não como perfil da equipe", () => {
    expect(
      LinhaRaci.parse({ atividade: "1", perfil: "fiscal", papel: "C", parte: "contratante" }).parte,
    ).toBe("contratante");
    expect(LinhaRaci.parse({ atividade: "1", perfil: "economista", papel: "R" }).parte).toBe("equipe");
  });
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

describe("prazo de cada produto (código)", () => {
  it("confere a entrega de cada produto da OEI contra a tabela de prazos do edital", async () => {
    const ler = (n: string) =>
      JSON.parse(
        readFileSync(new URL(`../fixtures/gerados/proposta-oei/${n}.json`, import.meta.url), "utf-8"),
      ) as unknown;
    const c = RespostaConteudo.parse(ler("conteudo"));
    const eap = RespostaEap.parse(ler("eap"));
    const doc = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
    const crono = calcularCronograma(eap.atividades, { aprovacaoDias: 10 });
    const r = conferirPrazosDosProdutos(crono, c.produtos, [doc], new Date(2027, 0, 4));
    expect(r.map((x) => x.prazo?.dias)).toEqual([30, 75, 135, 210, 300]);
    // plano de trabalho: entrega no dia útil 17 (a aprovação vem depois), dentro dos 30 dias
    expect(r[0]).toMatchObject({ fim: 17, situacao: "cabe" });
    // com 10 dias úteis de aprovação por produto, os cadernos 1 e 2 passam dos 75 dias: o código avisa
    expect(r[1]?.situacao).toBe("nao-cabe");
    expect(r[1]?.texto).toMatch(/contagem não informada: tratada como dias corridos/);
  }, 120000);

  it("prazo com número que não está no trecho citado não é usado", () => {
    const crono = calcularCronograma([atv("A", [], [5, 5, 5])]);
    const r = conferirPrazosDosProdutos(
      crono,
      [
        {
          id: "P1",
          nome: "Produto",
          descricao: "",
          requisitos: [],
          criteriosAceite: [],
          fontes: [],
          prazo: {
            dias: 45,
            contagem: "dias corridos",
            aPartirDe: "",
            fonte: { doc: "rfp", pagina: 1, trecho: "O prazo de vigência do contrato é de 12 (doze) meses" },
          },
        },
      ],
      [
        {
          id: "r",
          papel: "rfp",
          nomeArquivo: "r.pdf",
          tamanhoBytes: 1,
          totalPaginas: 1,
          lidoEm: "",
          paginas: [
            {
              numero: 1,
              origem: "texto",
              texto: "O prazo de vigência do contrato é de 12 (doze) meses.",
              caracteres: 50,
            },
          ],
        },
      ],
    );
    expect(r[0]?.situacao).toBe("nao-conferido");
  });
});

describe("data fixa com o início do projeto: o cronograma respeita o evento", () => {
  const campo = (pred: string[]): AtividadeEap => ({
    ...atv("c4", pred, [0, 0, 0]),
    restricaoData: {
      inicio: "07/11/2026",
      fim: "06/01/2027",
      fonte: { doc: "rfp", pagina: 1, trecho: "previsto para o período de 07/11/2026 a 06/01/2027;" },
    },
  });

  it("começa no primeiro dia útil da janela e as predecessoras ganham folga", () => {
    const c = calcularCronograma([atv("m1", [], [10, 10, 10]), campo(["m1"]), atv("s1", ["c4"], [5, 5, 5])], {
      inicio: new Date(2026, 8, 21),
    });
    const c4 = c.atividades.find((a) => a.id === "c4");
    expect(c4?.dataInicio?.toLocaleDateString("pt-BR")).toBe("07/11/2026");
    expect(c4?.dataFim?.toLocaleDateString("pt-BR")).toBe("06/01/2027");
    expect(c4?.folga).toBe(0);
    expect(c.atividades.find((a) => a.id === "m1")?.folga).toBeGreaterThan(0);
    expect(c.problemas.join(" ")).toMatch(
      /presa à data fixa: de 07\/11\/2026 a 06\/01\/2027, 61 dias corridos.*folga de \d+ dia\(s\) corrido/,
    );
    expect(c4?.diasCorridos).toBe(61);
  });

  it("acusa quando as predecessoras terminam depois do início da janela", () => {
    const c = calcularCronograma([atv("m1", [], [60, 60, 60]), campo(["m1"])], {
      inicio: new Date(2026, 8, 21),
    });
    expect(c.problemas.join(" ")).toMatch(/Não cabe antes do marco/);
    expect(c.datasFixas[0]).toMatchObject({ atividade: "c4", cabe: false });
    expect(c.datasFixas[0]!.folgaCorrida).toBeLessThan(0);
  });

  it("data em aaaa-mm-dd é aceita e sai em dd/mm/aaaa; a folga fica registrada para o B3", () => {
    const iso: AtividadeEap = {
      ...campo(["m1"]),
      restricaoData: { ...campo(["m1"]).restricaoData!, inicio: "2026-11-07", fim: "2027-01-06" },
    };
    const c = calcularCronograma([atv("m1", [], [30, 30, 30]), iso], { inicio: new Date(2026, 8, 21) });
    expect(c.problemas.join(" ")).toMatch(/de 07\/11\/2026 a 06\/01\/2027, 61 dias corridos/);
    expect(c.problemas.join(" ")).not.toMatch(/2026-11-07/);
    // m1: 30 dias úteis a partir de 21/09/2026, sem 12/10 e 02/11 (feriados em segunda) → termina em 03/11; folga até 07/11: 3 dias corridos
    expect(c.datasFixas[0]).toMatchObject({ atividade: "c4", cabe: true, diasCorridos: 61, folgaCorrida: 3 });
  });
});

describe("feriados e análise do contratante no cronograma (decisão 0051)", () => {
  it("feriados nacionais: os fixos, a Sexta-feira Santa móvel; Carnaval e Corpus Christi não", () => {
    const f = feriadosNacionais(2026).map((x) => x.data.toLocaleDateString("pt-BR"));
    expect(f).toEqual(
      expect.arrayContaining(["01/01/2026", "03/04/2026", "21/04/2026", "20/11/2026", "25/12/2026"]),
    );
    expect(f).not.toContain("17/02/2026"); // Carnaval
    expect(f).not.toContain("04/06/2026"); // Corpus Christi
    expect(pascoa(2025).toLocaleDateString("pt-BR")).toBe("20/04/2025");
  });

  it("feriado nacional e municipal empurram as datas; feriado ilegível é apontado", () => {
    const base = [atv("a", [], [3, 3, 3])];
    const semMunicipal = calcularCronograma(base, { inicio: new Date(2025, 10, 19) });
    // 19/11 (quarta), 20/11 é feriado, 21/11 (sexta), 24/11 (segunda)
    expect(semMunicipal.atividades[0]?.dataFim?.toLocaleDateString("pt-BR")).toBe("24/11/2025");
    const comMunicipal = calcularCronograma(base, {
      inicio: new Date(2025, 10, 19),
      feriados: ["21/11/2025", "x"],
    });
    expect(comMunicipal.atividades[0]?.dataFim?.toLocaleDateString("pt-BR")).toBe("25/11/2025");
    expect(comMunicipal.problemas.join(" ")).toMatch(/Feriado municipal ilegível \(x\)/);
  });

  it("a atividade que é a análise do contratante dura o tempo de aprovação do GP, sem somar por cima", () => {
    const analise: AtividadeEap = {
      ...atv("m5", ["m4"], [5, 10, 15]),
      analiseDoContratante: true,
      aprovacaoCliente: true,
    };
    const sem = calcularCronograma([atv("m4", [], [4, 4, 4]), analise]);
    expect(sem.total).toBe(14);
    const com = calcularCronograma([atv("m4", [], [4, 4, 4]), analise], { aprovacaoDias: 5 });
    expect(com.atividades.find((a) => a.id === "m5")).toMatchObject({ duracao: 5, aprovacao: 0 });
    expect(com.total).toBe(9);
    expect(com.problemas.join(" ")).toMatch(
      /m5 é a análise do contratante: duração trocada pelo tempo de aprovação do GP \(5 dias úteis\)/,
    );
    // a entrega com aprovacaoCliente (sem atividade de análise) continua somando o tempo depois
    const entrega = calcularCronograma([atv("m4", [], [4, 4, 4], true)], { aprovacaoDias: 5 });
    expect(entrega.total).toBe(9);
  });
});
