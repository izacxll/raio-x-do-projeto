// Lições da rodada 3 do teste externo que viraram regra de código (decisão 0070). Exemplos inventados.
import { describe, expect, it } from "vitest";
import {
  calcularCronograma,
  encerramentoAntesDoAceite,
  situacaoDaDataFixa,
} from "../../src/etapas/2-proposta/cronograma";
import { pareceRepetirORegistroInicial, repeteORegistroInicial } from "../../src/etapas/4-pgp/pgp";
import type { AtividadeEap } from "../../src/pmo/schemas/proposta";
import type { PremissaRegistro } from "../../src/pmo/schemas/tap";
import { citaODocumento, textoDasFontes } from "../../src/regras/conferencia";

const est = (o: number, m: number, p: number) => ({
  otimista: o,
  mais_provavel: m,
  pessimista: p,
  base: "",
});
const atv = (id: string, pred: string[], d: number, extra: Partial<AtividadeEap> = {}): AtividadeEap => ({
  id,
  produto: "P1",
  nome: `Atividade ${id}`,
  predecessoras: pred,
  duracao: est(d, d, d),
  restricaoData: null,
  aprovacaoCliente: false,
  analiseDoContratante: false,
  requisitos: [],
  ...extra,
});
const evento = (pred: string[]): AtividadeEap =>
  atv("c1", pred, 0, {
    restricaoData: {
      inicio: "10/03/2026",
      fim: "14/03/2026",
      fonte: {
        doc: "rfp",
        pagina: 2,
        trecho: "a pesquisa será feita durante o evento de 10/03/2026 a 14/03/2026",
      },
    },
  });

describe("data fixa já vencida sai como não confirmável (lição 121)", () => {
  const rede = () => [atv("m1", [], 5), evento(["m1"]), atv("r1", ["c1"], 10)];

  it("com hoje depois da data, o marco é não confirmável, mesmo que a conta caiba", () => {
    const c = calcularCronograma(rede(), { inicio: new Date(2026, 1, 2), hoje: new Date(2026, 10, 18) });
    const f = c.datasFixas[0]!;
    expect(f.cabe).toBe(true);
    expect(f.vencida).toBe(true);
    expect(situacaoDaDataFixa(f)).toBe("nao-confirmavel");
    expect(c.problemas.join(" ")).toMatch(/Não confirmável: a atividade c1 tem data fixa .* já passou/);
  });

  it("sem hoje, ou com a data no futuro, nada muda", () => {
    const semHoje = calcularCronograma(rede(), { inicio: new Date(2026, 1, 2) });
    expect(semHoje.datasFixas[0]!.vencida).toBeUndefined();
    expect(situacaoDaDataFixa(semHoje.datasFixas[0]!)).toBe("cabe");
    const antes = calcularCronograma(rede(), { inicio: new Date(2026, 1, 2), hoje: new Date(2026, 0, 15) });
    expect(situacaoDaDataFixa(antes.datasFixas[0]!)).toBe("cabe");
  });

  it("início do documento já passado deixa a vigência não confirmável (lição 137)", () => {
    const c = calcularCronograma([atv("m1", [], 20)], {
      inicio: new Date(2026, 1, 2),
      inicioDoDocumento: "RFP, p. 1",
      prazoRfp: { dias: 120, unidade: "dias corridos", texto: "120 dias" } as never,
      hoje: new Date(2026, 10, 18),
    });
    expect(c.conferenciaPrazo.situacao).toBe("nao-confirmavel");
    expect(c.conferenciaPrazo.texto).toMatch(/só como intervalo/);
    const doGp = calcularCronograma([atv("m1", [], 20)], {
      inicio: new Date(2026, 1, 2),
      prazoRfp: { dias: 120, unidade: "dias corridos", texto: "120 dias" } as never,
      hoje: new Date(2026, 10, 18),
    });
    // início do GP (sem "inicioDoDocumento"): o GP decidiu a data, a conta vale
    expect(doGp.conferenciaPrazo.situacao).toBe("cabe");
  });
});

describe("encerramento antes do aceite do último produto (lição 136)", () => {
  const aceite = (id: string, pred: string[], produto: string) =>
    atv(id, pred, 5, {
      produto,
      nome: `Análise e termo definitivo do ${produto}`,
      analiseDoContratante: true,
    });

  it("devolução e descarte de dados depois da entrega, antes do termo: aviso", () => {
    const xs = [
      atv("p1", [], 10),
      aceite("a1", ["p1"], "P1"),
      atv("p2", ["p1"], 10, { produto: "P2" }),
      aceite("a2", ["p2"], "P2"),
      atv("z1", ["p2"], 3, { produto: "GER", nome: "Encerramento: devolução da base e descarte dos dados" }),
    ];
    const c = calcularCronograma(xs);
    expect(c.problemas.join(" ")).toMatch(/Aviso: a atividade z1 .* antes do aceite do último produto \(a2/);
  });

  it("encerramento depois do último termo, ou encerramento do campo: sem aviso", () => {
    const calc = new Map([
      ["a1", { inicioMaisCedo: 10, fimMaisCedo: 15 }],
      ["z1", { inicioMaisCedo: 15, fimMaisCedo: 18 }],
      ["e1", { inicioMaisCedo: 2, fimMaisCedo: 4 }],
    ]);
    const xs = [
      aceite("a1", [], "P1"),
      atv("z1", ["a1"], 3, { nome: "Encerramento do contrato e guarda dos microdados" }),
      atv("e1", [], 2, { nome: "Encerramento da coleta de campo" }),
    ];
    expect(encerramentoAntesDoAceite(xs, calc)).toEqual([]);
  });
});

describe("vago que só reproduz o documento (item 2c)", () => {
  const fontes = textoDasFontes([
    { texto: "7.2. A falta de entrega em tempo hábil do boletim mensal gera multa à contratada." },
  ]);

  it("o plano repete o trecho do documento sem aspas: não é vago do plano", () => {
    const t = "O risco R3 prevê multa pela falta de entrega em tempo hábil, com aviso prévio.";
    expect(citaODocumento(t, t.indexOf("em tempo hábil"), "em tempo hábil".length, fontes)).toBe(true);
  });

  it("o plano usa a expressão com as próprias palavras: continua vago", () => {
    const t = "A equipe enviará o relatório em tempo hábil para a reunião.";
    expect(citaODocumento(t, t.indexOf("em tempo hábil"), "em tempo hábil".length, fontes)).toBe(false);
    expect(citaODocumento(t, t.indexOf("em tempo hábil"), "em tempo hábil".length, textoDasFontes([]))).toBe(
      false,
    );
  });
});

describe("premissa nova que repete o registro inicial com outras palavras (lição 154)", () => {
  const linha = (id: string, texto: string, extra: Partial<PremissaRegistro> = {}): PremissaRegistro => ({
    item: { id, texto, rotulo: "sugestao", motivo: "", fontes: [], alternativas: [] } as never,
    tipo: "premissa",
    origem: "estimativa",
    premissaCritica: "PC3",
    consequencia: "",
    dependeDe: "contratante",
    comoValidar: "a definir pelo GP",
    ...extra,
  });
  const inicial = [
    linha(
      "p1",
      "Sugere-se registrar que o contratante analisa cada relatório em até dez dias úteis, com uma rodada de ajuste e nova análise antes do termo definitivo.",
      { origem: "tap" },
    ),
  ];

  it("mesmo sentido e mesma PC, outra redação: aviso", () => {
    const nova = linha(
      "n1",
      "Premissa de estimativa: a análise de cada relatório pelo contratante dura até dez dias úteis, com ajuste e nova análise antes do termo.",
    );
    expect(repeteORegistroInicial(nova, inicial)).toBe(false);
    expect(pareceRepetirORegistroInicial(nova, inicial)?.linha.item.id).toBe("p1");
  });

  it("outro assunto, ou outra PC: sem aviso", () => {
    const outra = linha(
      "n2",
      "A equipe de campo usa tablets próprios, com a ferramenta de coleta licenciada pela FGV.",
    );
    expect(pareceRepetirORegistroInicial(outra, inicial)).toBeUndefined();
    const outraPc = linha(
      "n3",
      "Premissa de estimativa: a análise de cada relatório pelo contratante dura até dez dias úteis, com ajuste e nova análise antes do termo.",
      { premissaCritica: "PC6" },
    );
    expect(pareceRepetirORegistroInicial(outraPc, inicial)).toBeUndefined();
  });
});
