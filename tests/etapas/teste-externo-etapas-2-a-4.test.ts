// Correções do teste externo (etapas 1 a 4): Rework nos pedidos, compromissos de método numerados, trava de valor sem
// ids e normas, contratante pela sigla com a UF, portaria de quem assina fora da legislação, "capacidade de
// pagamento" fora do pagamento e a matriz com uma seção para vários critérios. Dados inventados.
import { describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { numerosQuePedemFonte } from "../../src/etapas/1-rfp/leitura-pmo";
import { numerarCompromissos } from "../../src/etapas/2-proposta/compromissos";
import { conferirMinuta } from "../../src/etapas/2-proposta/conferencia-final";
import type { PontoDePartida } from "../../src/etapas/2-proposta/ponto-de-partida";
import {
  artigosCitados,
  fichasDasPartes,
  referenciasEtapa2,
  referenciasEtapa3,
  referenciasEtapa4,
} from "../../src/pmo/montagem";
import type { RespostaConteudo, RespostaEstrategia } from "../../src/pmo/schemas/proposta";
import { documentoLido } from "./rfp-ajudantes";

const HOJE = new Date(2026, 10, 17);

describe("Rework nos pedidos (SKILL.md, seção 5)", () => {
  const PARTES = [
    ...Array.from({ length: 18 }, (_, i) => `A${i + 1}`),
    ...Array.from({ length: 33 }, (_, i) => `B${i + 1}`),
  ];
  it.each([
    ["2", referenciasEtapa2(), ""],
    ["3", referenciasEtapa3(), ""],
    ["4", referenciasEtapa4(), fichasDasPartes(PARTES)],
  ])("etapa %s: todo artigo citado nas fichas vai com o resumo do tema", (_, blocos, extra) => {
    const fichas = blocos
      .filter((b) => b.titulo.includes("artefatos/"))
      .map((b) => b.texto)
      .join("\n");
    const rework = blocos
      .filter((b) => b.titulo.startsWith("referencias/rework.md"))
      .map((b) => b.texto)
      .join("\n");
    const faltam = artigosCitados(`${fichas}\n${extra}`).filter(
      (id) => !new RegExp(`\\b${id}\\b`).test(rework),
    );
    expect(faltam).toEqual([]);
  });
});

describe("compromissos de método (decisão 0047)", () => {
  const item = (texto: string, ficha = "") => ({
    id: "x",
    texto,
    rotulo: "sugestao" as const,
    motivo: "",
    fontes: [],
    alternativas: [],
    requisitos: [],
    ficha,
  });
  const c = {
    estrutura: [
      {
        codigo: "4",
        titulo: "Metodologia",
        criterio: "",
        itens: [
          item("O método segue as etapas do termo."),
          item("C04 — Sigilo: os dados recebidos ficam restritos à equipe.", "PROP-METODOLOGIA.9"),
          item("Revisão interna de cada relatório antes da entrega.", "PROP-METODOLOGIA.10"),
        ],
      },
    ],
    premissas: [{ item: item("Os dados chegam no prazo."), premissaCritica: "PC1" }],
    obrigacoesContratante: [{ item: item("Fornecer os dados.") }],
    exclusoes: [item("Implementar as melhorias.")],
    limitesVolume: [item("Até duas rodadas de ajuste.")],
  } as unknown as RespostaConteudo;

  it("o de método entra com o número que o PMO deu; os outros, nos números livres", () => {
    const cs = numerarCompromissos(c);
    expect(cs.map((x) => `${x.numero}:${x.tipo}`)).toEqual([
      "C01:premissa",
      "C02:obrigacao",
      "C03:exclusao",
      "C04:metodo",
      "C05:metodo",
      "C06:limite",
    ]);
    expect(cs.find((x) => x.numero === "C04")?.texto).toMatch(/^Sigilo:/);
  });
});

describe("trava de valor: ids de itens e números de norma não são valor", () => {
  it("(a1), a2, a3, f14 e Lei 14.133 ficam de fora", () => {
    expect(
      numerosQuePedemFonte("Ler primeiro (a1); depois a2, a3 e f14; Lei 14.133, art. 74; Lei nº 8.666/1993."),
    ).toEqual([]);
    expect(numerosQuePedemFonte("Entregar em 30 dias (a1).")).toEqual(["30"]);
  });
});

describe("ponto de partida: contratante, portaria e pagamento", () => {
  const a = analisarRfp(
    [
      documentoLido([
        "TERMO DE REFERÊNCIA\nOBJETO\nEstudo das contas do ente.\nO estudo explica o indicador federal CAPAG (Capacidade de Pagamento), sem tratar de parcelas.",
        "SIGILO\nA SEPLAG-RJ terá a propriedade dos produtos.\nO presente segue assinado.\nFulano de Tal\nChefe do Departamento de Planejamento\nPortaria nº 12 de março de 2026\nMatrícula nº 000",
      ]),
    ],
    HOJE,
  );
  const item = (id: string) => a.itens.find((i) => i.id === id);

  it("a sigla do órgão com a UF vira o contratante provável", () => {
    expect(item("identificacao:contratante")?.texto).toBe("SEPLAG-RJ");
    expect(item("identificacao:contratante")?.situacao).toBe("localizado");
  });

  it("a portaria de quem assina não é legislação; 'capacidade de pagamento' não é pagamento", () => {
    expect(a.itens.filter((i) => i.id.startsWith("identificacao:norma:portaria"))).toEqual([]);
    expect(item("condicoes:pagamento")?.situacao).not.toBe("localizado");
  });
});

describe("matriz: uma seção para vários critérios", () => {
  const ponto = {
    requisitos: [
      {
        numero: "R01",
        rotulo: "Equipe-chave (2 perfis)",
        descricao: "Coordenador Geral; Analista Contábil",
        pagina: 1,
        trecho: "",
        origem: "codigo",
        tipo: "equipe",
        perfis: ["Coordenador Geral", "Analista Contábil"],
      },
    ],
    apresentacao: [],
    habilitacao: [],
  } as unknown as PontoDePartida;
  const criterio = (nome: string, trecho = "") => ({
    criterio: nome,
    oQuePontua: "",
    pontuacaoMaxima: "",
    fontes: trecho ? [{ doc: "rfp", pagina: 6, trecho }] : [],
  });
  const e = {
    criterios: [
      criterio("Coordenador Geral", "Pontuação da equipe: Coordenador Geral, até 10 pontos"),
      criterio("Analista Contábil", "Pontuação da equipe: Analista Contábil, até 5 pontos"),
      criterio("Metodologia"),
      criterio("Cronograma"),
    ],
  } as unknown as RespostaEstrategia;
  const secao = (titulo: string, crit: string) => ({ codigo: "", titulo, criterio: crit, itens: [] });

  it("a seção de equipe responde aos perfis; a lista com ponto e vírgula vale para cada critério", () => {
    const c = {
      estrutura: [
        secao("Equipe técnica", "Equipe-chave (dois perfis pontuados)"),
        secao("Método e prazo", "Metodologia; Cronograma"),
      ],
      produtos: [],
      exclusoes: [],
      premissas: [],
      restricoes: [],
      obrigacoesContratante: [],
    } as unknown as RespostaConteudo;
    const m = conferirMinuta(ponto, e, c, undefined);
    const doCriterio = m.matriz.filter((x) => x.tipo === "criterio");
    expect(doCriterio.map((x) => `${x.chave}:${x.situacao}`)).toEqual([
      "Coordenador Geral:atendido",
      "Analista Contábil:atendido",
      "Metodologia:atendido",
      "Cronograma:atendido",
    ]);
  });

  it("perfil sem 'pontuação' no trecho é perfil mínimo, não critério pontuado (decisão 0057)", () => {
    const so = {
      criterios: [
        criterio("Coordenador Geral", "Coordenador Geral com experiência mínima de cinco anos"),
        criterio("Analista Contábil", "Pontuação da equipe: Analista Contábil, até 5 pontos"),
      ],
    } as unknown as RespostaEstrategia;
    const c = {
      estrutura: [secao("Equipe técnica", "Equipe-chave")],
      produtos: [],
      exclusoes: [],
      premissas: [],
      restricoes: [],
      obrigacoesContratante: [],
    } as unknown as RespostaConteudo;
    const m = conferirMinuta(ponto, so, c, undefined);
    expect(m.matriz.filter((x) => x.tipo === "criterio").map((x) => x.chave)).toEqual(["Analista Contábil"]);
  });
});
