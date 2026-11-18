// Correções do teste externo (etapas 1 a 4): Rework nos pedidos, compromissos de método numerados, trava de valor sem
// ids e normas, contratante pela sigla com a UF, portaria de quem assina fora da legislação, "capacidade de
// pagamento" fora do pagamento e a matriz com uma seção para vários critérios. Dados inventados.
import { describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { numerosQuePedemFonte } from "../../src/etapas/1-rfp/leitura-pmo";
import { readFileSync } from "node:fs";
import {
  faixasDosCompromissos,
  faixasErradasNoTexto,
  numerarCompromissos,
} from "../../src/etapas/2-proposta/compromissos";
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

describe("compromissos de método no TAP e faixas certas (decisão 0061)", () => {
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
  // dados inventados: 2 premissas, 1 obrigação, 1 exclusão, 4 compromissos de método e 2 limites
  const c = {
    estrutura: [
      {
        codigo: "3",
        titulo: "Metodologia",
        criterio: "",
        itens: [
          item(
            "Compromissos numerados: premissas C01 a C02, obrigações C03, exclusões C04 e limites C05 a C06.",
          ),
          item(
            "Compromisso de método, protocolo de campo: pontos e turnos combinados com a área.",
            "PROP-METODOLOGIA.7",
          ),
          item(
            "Compromisso de método, dados pessoais: questionário sem identificação.",
            "PROP-METODOLOGIA.9",
          ),
          item(
            "Compromisso de método, revisão interna: revisão por quem não redigiu.",
            "PROP-METODOLOGIA.10",
          ),
          item(
            "Compromisso de método, régua: o método aceito é o critério do aceite.",
            "PROP-METODOLOGIA.11",
          ),
          item("Quantidades do campo antes do preço.", "PROP-METODOLOGIA.12"),
        ],
      },
    ],
    premissas: [
      { item: item("Os dados chegam no prazo."), premissaCritica: "PC1" },
      { item: item("O evento ocorre na data."), premissaCritica: "PC5" },
    ],
    obrigacoesContratante: [{ item: item("Fornecer os dados do ano anterior.") }],
    exclusoes: [item("Implementar as melhorias.")],
    limitesVolume: [item("Até 400 questionários válidos."), item("Uma rodada de ajuste por produto.")],
  } as unknown as RespostaConteudo;

  it("todo compromisso de método recebe C, inclusive o protocolo de campo com a ficha do campo", () => {
    const cs = numerarCompromissos(c);
    const metodo = cs.filter((x) => x.tipo === "metodo");
    // antes: 3 de 4 numerados (o protocolo de campo ficava sem C); agora, 4 de 4
    expect(metodo).toHaveLength(4);
    expect(metodo.map((x) => x.texto)).toContain(
      "Compromisso de método, protocolo de campo: pontos e turnos combinados com a área.",
    );
    // a quantidade do campo (PROP-METODOLOGIA.12) não é compromisso de método
    expect(cs.some((x) => /Quantidades do campo/.test(x.texto))).toBe(false);
  });

  it("a faixa de cada tipo sai da numeração do código", () => {
    expect(faixasDosCompromissos(numerarCompromissos(c))).toBe(
      "premissas C01 a C02; obrigações do contratante C03; exclusões C04; compromissos de método C05 a C08; limites de volume C09 a C10",
    );
  });

  it("faixa do texto do PMO com o tipo errado é apontada; a certa, não (1 acerto, 0 alarme falso)", () => {
    const cs = numerarCompromissos(c);
    const erradas = faixasErradasNoTexto(
      "Compromissos numerados: premissas C01 a C02, obrigações C03, exclusões C04 e limites C05 a C06.",
      cs,
    );
    expect(erradas).toHaveLength(1);
    expect(erradas[0]).toMatch(/limites de volume C05 a C06.*C05 é compromisso de método/);
    expect(
      faixasErradasNoTexto("Premissas C01 a C02; compromissos de método C05 a C08; limites C09 a C10.", cs),
    ).toEqual([]);
    // premissa crítica (PC1) e número de requisito não são faixa de C
    expect(faixasErradasNoTexto("As premissas críticas PC1 e PC5 valem para R01 a R03.", cs)).toEqual([]);
  });

  it("decisao_gp sempre com motivo, no pedido das quatro etapas com autoconferência", () => {
    const fontes = [
      "src/etapas/1-rfp/leitura-pmo.ts",
      "src/etapas/2-proposta/pedidos.ts",
      "src/etapas/3-tap/pedidos.ts",
      "src/etapas/4-pgp/pedidos.ts",
    ];
    for (const f of fontes)
      expect(readFileSync(new URL(`../../${f}`, import.meta.url), "utf8")).toMatch(
        /Marca "decisao_gp" sempre com motivo/,
      );
  });
});
