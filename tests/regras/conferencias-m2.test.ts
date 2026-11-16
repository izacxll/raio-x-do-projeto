// Conferências por código da fase M2 (métodos das etapas 2 a 5): quadro de equipe × produtividade, duração × vigência,
// caixa pelo acumulado, estrutura da proposta no edital, pontos de texto × documento e a regra do preço.
import { describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import {
  criteriosDaRfp,
  ondeEstaoOsPontos,
  regraDoPreco,
  tabelaPontosPorPreco,
  tipoDoCriterio,
} from "../../src/etapas/2-proposta/pontos";
import { sugerirTipo } from "../../src/etapas/2-proposta/tipo";
import { extrairEstruturaDoEdital } from "../../src/extracao/rfp/modelo-proposta";
import { calcularCaixa, mesDoPrazo } from "../../src/regras/caixa";
import { conferirProdutividade, extrairTetos, tetoPorDia } from "../../src/regras/produtividade";
import { conferirDuracao, mesesDoRotulo, vigenciaEmMeses } from "../../src/regras/vigencia";
import { lerRfpPublica } from "../ajudantes/rfp-publica";
import { docRfp } from "../etapas/rfp-ajudantes";

const HOJE = new Date(2026, 10, 16);

describe("quadro de equipe × produtividade", () => {
  const doc = docRfp([
    "8.3 Cada agente de campo realizará no máximo 6 (seis) visitas por dia, com registro no sistema.",
    "Anexo: a equipe fará em média 25 atendimentos por semana por profissional.",
  ]);

  it("acha o teto e a média escritos, com a página", () => {
    const tetos = extrairTetos([doc]);
    expect(tetos[0]).toMatchObject({ quantidade: 6, unidade: "visitas", por: "dia", tipo: "teto" });
    expect(tetos[0]?.origem.pagina).toBe(1);
    expect(tetos.find((t) => t.tipo === "media")).toMatchObject({ quantidade: 25, por: "semana" });
    expect(tetoPorDia({ quantidade: 25, por: "semana" })).toBe(5);
  });

  it("volume ÷ pessoas ÷ (meses × 21) passa do teto: a meta não fecha", () => {
    const teto = extrairTetos([doc])[0];
    // 4.000 visitas em 1 mês com 25 agentes: 4000 / 25 / 21 = 7,6 por dia > 6
    const c = conferirProdutividade(
      [
        { rotulo: "Mês 1", meses: 1, pessoas: 25, volume: 4000 },
        { rotulo: "Mês 2", meses: 1, pessoas: 40, volume: 4000 },
      ],
      teto,
    );
    expect(c.situacao).toBe("passa");
    expect(c.pior?.rotulo).toBe("Mês 1");
    expect(c.linhas.map((l) => l.situacao)).toEqual(["passa", "cabe"]);
    expect(c.texto).toMatch(/7,6 por pessoa por dia/);
  });

  it("sem teto escrito, a conta sai mas não há régua: não conferido (o GP decide)", () => {
    const c = conferirProdutividade(
      [{ rotulo: "Trimestre 1", meses: 3, pessoas: 10, volume: 1260 }],
      undefined,
    );
    expect(c.situacao).toBe("nao-conferido");
    expect(c.texto).toMatch(/não localizou teto/);
  });

  it("volume sem ninguém para fazer passa do teto", () => {
    const c = conferirProdutividade(
      [{ rotulo: "Mês 1", meses: 1, pessoas: 0, volume: 100 }],
      extrairTetos([doc])[0],
    );
    expect(c.situacao).toBe("passa");
  });
});

describe("duração × vigência", () => {
  it("lê meses dos rótulos e da vigência", () => {
    expect(mesesDoRotulo("Trimestre 3")).toBe(3);
    expect(mesesDoRotulo("1º semestre")).toBe(6);
    expect(mesesDoRotulo("Mês 07")).toBe(1);
    expect(mesesDoRotulo("18 meses")).toBe(18);
    expect(vigenciaEmMeses("12 (doze) meses")).toBe(12);
    expect(vigenciaEmMeses("2 anos")).toBe(24);
  });

  it("os períodos que somam mais que a vigência não cabem", () => {
    const periodos = Array.from({ length: 11 }, (_, i) => ({ rotulo: `Trimestre ${i + 1}`, meses: 3 }));
    const c = conferirDuracao(periodos, 32);
    expect(c.situacao).toBe("passa");
    expect(c.soma).toBe(33);
    expect(conferirDuracao(periodos.slice(0, 10), 32).situacao).toBe("cabe");
    expect(conferirDuracao(periodos, undefined).situacao).toBe("nao-conferido");
  });
});

describe("caixa pelo acumulado", () => {
  it("mês da parcela pelo prazo escrito; sem número, o código não supõe", () => {
    expect(mesDoPrazo("30 dias")).toBe(1);
    expect(mesDoPrazo("75 dias")).toBe(3);
    expect(mesDoPrazo("após 6 meses da assinatura")).toBe(6);
    expect(mesDoPrazo("D+210")).toBe(7);
    expect(mesDoPrazo("na assinatura")).toBeUndefined();
  });

  it("folga de cada parcela até a véspera da seguinte, o ponto mais apertado e o primeiro mês negativo", () => {
    // custo uniforme em 10 meses; 5% no mês 1, 20% no 3, 20% no 5, 25% no 7, 30% no 10
    const caixa = calcularCaixa(
      [
        { rotulo: "P1", percentual: 5, mes: 1 },
        { rotulo: "P2", percentual: 20, mes: 3 },
        { rotulo: "P3", percentual: 20, mes: 5 },
        { rotulo: "P4", percentual: 25, mes: 7 },
        { rotulo: "P5", percentual: 30, mes: 10 },
        { rotulo: "sem prazo", percentual: 0 },
      ],
      Array(10).fill(1),
    );
    expect(caixa.parcelas[0]).toMatchObject({ recebidoAte: 5, ateMes: 2, custoAte: 20, folga: -15 });
    expect(caixa.primeiroNegativo?.mes).toBe(1);
    expect(caixa.maisApertado?.mes).toBe(9);
    expect(caixa.maisApertado?.folga).toBe(-20);
    expect(caixa.semMes).toHaveLength(1);
    expect(caixa.meses.at(-1)).toMatchObject({ recebido: 100, custo: 100, folga: 0 });
  });

  it("sem parcela com mês, nada é calculado", () => {
    expect(calcularCaixa([{ rotulo: "única", percentual: 100 }], [1, 1]).meses).toEqual([]);
  });
});

describe("estrutura da proposta e pontos (editais públicos)", () => {
  it("SMPED: os 17 quadros do modelo, pontos de documento separados e o edital não pontua preço", async () => {
    const a = analisarRfp([await lerRfpPublica("chamamento-publico-termo-fomento-smped-sp-2025.pdf")], HOJE);
    const e = extrairEstruturaDoEdital(a.documentos);
    expect(e?.fonte).toBe("quadros");
    expect(e?.secoes).toHaveLength(17);
    expect(e?.secoes[8]?.titulo).toBe("Metas, atividades e meios de aferição");
    const c = criteriosDaRfp(a);
    expect(c.find((x) => x.chave === "(B)")?.tipo).toBe("documento");
    expect(c.find((x) => x.chave === "(I)")?.tipo).toBe("texto");
    expect(ondeEstaoOsPontos(c).total).toBe(60);
    const r = regraDoPreco(a, c);
    expect(r.tipo).toBe("sem-preco");
    expect(r.tipo === "sem-preco" && r.criteriosDeCusto.map((x) => x.chave)).toEqual(["(C)", "(L)"]);
    expect(sugerirTipo(a, []).projeto).toBe("operacao");
  });

  it("OEI: as partes a) a n), técnica 70 × preço 30 pelo índice e a equivalência em pontos técnicos", async () => {
    const a = analisarRfp(
      [await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf")],
      HOJE,
    );
    const e = extrairEstruturaDoEdital(a.documentos);
    expect(e?.fonte).toBe("lista");
    expect(e?.obrigatoria).toBe(false);
    expect(e?.secoes.map((s) => s.codigo)).toEqual("abcdefghijklmn".split("").map((l) => `${l})`));
    const pontos = ondeEstaoOsPontos(criteriosDaRfp(a));
    expect([pontos.texto, pontos.documento]).toEqual([50, 50]);
    const r = regraDoPreco(a, criteriosDaRfp(a));
    expect(r).toMatchObject({ tipo: "indice", pesoTecnica: 70, pesoPreco: 30 });
    const t = tabelaPontosPorPreco(r, 500000);
    expect(t?.linhas[0]).toMatchObject({ desconto: 0, preco: 500000, valores: [2.7, 2.4, 2.1] });
    expect(t?.equivalencia).toMatch(/0,42 ponto técnico/);
  });

  it("pontos por desconto: a tabela segue a regra escrita", () => {
    const a = analisarRfp(
      [
        {
          id: "rfp",
          papel: "rfp",
          nomeArquivo: "rfp.pdf",
          tamanhoBytes: 1,
          totalPaginas: 1,
          lidoEm: HOJE.toISOString(),
          paginas: [
            {
              numero: 1,
              origem: "texto",
              texto: "A nota de preço será de 2 pontos a cada 3% de desconto sobre o valor de referência.",
              caracteres: 80,
            },
          ],
        },
      ],
      HOJE,
    );
    const r = regraDoPreco(a, []);
    expect(r).toMatchObject({ tipo: "desconto", pontos: 2, aCada: 3 });
    expect(tabelaPontosPorPreco(r)?.linhas.map((l) => l.valores[0])).toEqual([0, 2, 6, 10, 12, 16]);
  });

  it("critério de documento × de texto", () => {
    expect(tipoDoCriterio("Comprovação de experiência da OSC na execução de projetos").tipo).toBe(
      "documento",
    );
    expect(tipoDoCriterio("Grau de inovação do projeto").tipo).toBe("texto");
  });
});

describe("folha mês a mês (operação contínua e parceria)", () => {
  it("pessoas por mês pelo quadro; sem o custo do GP, a conta fica em branco", async () => {
    const { calcularFolha } = await import("../../src/etapas/2-proposta/preco-parceria");
    const quadro = [
      { funcao: "Coordenação", quantidade: 1, deMes: 1, ateMes: 12, base: "edital" },
      { funcao: "Educador", quantidade: 4, deMes: 2, ateMes: 12, base: "turmas" },
    ];
    const sem = calcularFolha(quadro, {}, [], 12);
    expect(sem.pessoasPorMes.slice(0, 2)).toEqual([1, 5]);
    expect(sem.total).toBeUndefined();
    expect(sem.faltando).toEqual(["custo mensal de Coordenação", "custo mensal de Educador"]);
    const com = calcularFolha(
      quadro,
      { Coordenação: 10000, Educador: 5000 },
      [{ descricao: "material", valor: 3000 }],
      12,
    );
    expect(com.totalFolha).toBe(12 * 10000 + 44 * 5000);
    expect(com.total).toBe(12 * 10000 + 44 * 5000 + 3000);
    expect(com.custoPorMes?.[0]).toBe(10000);
  });
});
