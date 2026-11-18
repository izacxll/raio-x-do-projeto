// Rodada seguinte da segunda instância só com o que mudou (decisão 0071). Exemplos inventados.
import { describe, expect, it } from "vitest";
import type { DocumentoLido, SegundaInstanciaDossie } from "../../src/dossie/esquema";
import { montarPedidoDaSegunda } from "../../src/pmo/segunda-instancia";
import { diferencasDaResposta, documentosCitados } from "../../src/pmo/segunda-rodada";

const antes = {
  autoconferencia: [{ item: "A2.8", estado: "decisao_gp", onde: "a2_8", motivo: "" }],
  textos: [
    {
      codigo: "A2",
      itens: [
        { id: "a2_1", texto: "Fontes: TR e proposta.", fontes: [] },
        { id: "a2_8", texto: "O GP responde pelos requisitos.", fontes: [] },
      ],
    },
  ],
  riscos: [
    {
      id: "R1",
      gatilho: "uma semana antes",
      fontes: [{ doc: "rfp", pagina: 3, trecho: "multa por atraso" }],
    },
  ],
};
const depois = {
  autoconferencia: [{ item: "A2.8", estado: "decisao_gp", onde: "a2_8", motivo: "Cadência é do GP." }],
  textos: [
    {
      codigo: "A2",
      itens: [
        { id: "a2_1", texto: "Fontes: TR e proposta.", fontes: [] },
        { id: "a2_8", texto: "O GP responde pelos requisitos e relata o andamento.", fontes: [] },
      ],
    },
  ],
  riscos: [
    {
      id: "R1",
      gatilho: "antes da data, na antecedência que o GP decidir",
      fontes: [{ doc: "rfp", pagina: 3, trecho: "multa por atraso" }],
    },
    {
      id: "R2",
      gatilho: "aviso prévio não enviado",
      fontes: [{ doc: "rfp", pagina: 7, trecho: "aviso prévio de 48 horas" }],
    },
  ],
};

describe("diferenças da resposta, item por item", () => {
  it("mostra o item que mudou (pelo id), o novo e nada do que ficou igual", () => {
    const d = diferencasDaResposta(antes, depois);
    expect(d.map((x) => `${x.situacao} ${x.caminho}`)).toEqual(
      [
        "alterado autoconferencia[A2.8]",
        "novo riscos[R2]",
        "alterado riscos[R1]",
        "alterado textos[A2].itens[a2_8]",
      ].sort((a, b) => a.split(" ")[1]!.localeCompare(b.split(" ")[1]!)),
    );
    expect(d.find((x) => x.caminho === "textos[A2].itens[a2_8]")?.antes).toMatchObject({
      texto: "O GP responde pelos requisitos.",
    });
  });

  it("item removido aparece uma vez, sem os de dentro", () => {
    const d = diferencasDaResposta(depois, { ...depois, textos: [] });
    expect(d.map((x) => `${x.situacao} ${x.caminho}`)).toEqual(["removido textos[A2]"]);
  });
});

describe("páginas citadas", () => {
  const doc = (papel: DocumentoLido["papel"], n: number) =>
    ({
      id: papel,
      papel,
      nomeArquivo: `${papel}.pdf`,
      totalPaginas: n,
      lidoEm: "x",
      paginas: Array.from({ length: n }, (_, k) => ({
        numero: k + 1,
        texto: `página ${k + 1}`,
        origem: "texto",
      })),
    }) as unknown as DocumentoLido;

  it("só as páginas dos achados anteriores e dos itens que mudaram; documento sem citação sai", () => {
    const achados = [
      {
        id: "s1",
        tipo: "erro_de_fato" as const,
        gravidade: "media" as const,
        onde: "R1",
        texto: "x",
        evidencias: [{ doc: "rfp" as const, pagina: 5, trecho: "y" }],
        sugestao: "",
      },
    ];
    const docs = documentosCitados(
      [doc("rfp", 10), doc("tap", 4)],
      achados,
      diferencasDaResposta(antes, depois),
    );
    expect(docs.map((d) => [d.papel, d.paginas.map((p) => p.numero)])).toEqual([["rfp", [3, 5, 7]]]);
  });
});

describe("pedido da segunda instância: completo na rodada 1, compacto na seguinte", () => {
  const base = {
    etapa: 4,
    passo: "riscos",
    pedidoDoPasso: "PEDIDO-DO-PASSO-COM-ESQUELETO",
    documentos: [] as DocumentoLido[],
  };
  const guardada: SegundaInstanciaDossie = {
    resposta: {
      achados: [
        {
          id: "s1",
          tipo: "rotulo_errado",
          gravidade: "media",
          onde: "R1",
          texto: "Gatilho com número que o documento não dá.",
          evidencias: [],
          sugestao: "Sugere-se deixar a antecedência ao GP.",
        },
      ],
      conferido: ["Números R conferidos."],
    },
    modelo: "m",
    em: "2026-11-18T10:00:00Z",
    deResposta: "v1",
    rodada: 1,
    conferiu: antes,
  };

  it("rodada 1: o pedido completo, com o pedido do passo", () => {
    const m = montarPedidoDaSegunda({ ...base, resposta: antes, respostaEm: "v1" });
    expect(m.rodada).toBe(1);
    expect(m.compacta).toBe(false);
    expect(m.pedido).toContain("PEDIDO-DO-PASSO-COM-ESQUELETO");
  });

  it("rodada 2 com a resposta corrigida: só os achados da rodada 1, o diff e as páginas citadas", () => {
    const m = montarPedidoDaSegunda({ ...base, resposta: depois, respostaEm: "v2", guardada });
    expect(m.rodada).toBe(2);
    expect(m.compacta).toBe(true);
    expect(m.pedido).not.toContain("PEDIDO-DO-PASSO-COM-ESQUELETO");
    expect(m.pedido).toMatch(/## Achados da rodada 1\n- s1 · média · rótulo errado · R1/);
    expect(m.pedido).toMatch(/## O que mudou na resposta desde a rodada 1 \(4 item\(ns\)\)/);
    expect(m.pedido).toContain("- **novo** `riscos[R2]`");
    expect(m.pedido).not.toContain("a2_1");
  });

  it("--completa (ou conferência antiga, sem a resposta guardada): completo, com os achados da rodada 1", () => {
    for (const m of [
      montarPedidoDaSegunda({ ...base, resposta: depois, respostaEm: "v2", guardada, completa: true }),
      montarPedidoDaSegunda({
        ...base,
        resposta: depois,
        respostaEm: "v2",
        guardada: { ...guardada, conferiu: undefined },
      }),
    ]) {
      expect(m.compacta).toBe(false);
      expect(m.rodada).toBe(2);
      expect(m.pedido).toContain("PEDIDO-DO-PASSO-COM-ESQUELETO");
      expect(m.pedido).toMatch(
        /## Achados da rodada 1 \(a resposta abaixo foi corrigida depois deles\)\n- s1/,
      );
    }
  });
});
