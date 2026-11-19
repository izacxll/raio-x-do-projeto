// Fila de pendências do GP (decisão 0088): decisão do GP e item com aviso nunca vão em lote; a fila ordena por classe e
// por impacto (caixa ou preço, prazo, aceite, quem executa).
import { describe, expect, it } from "vitest";
import {
  aceitar,
  aceitaveisEmLote,
  classeDoItem,
  contarFila,
  filaDePendencias,
  impactoPeloTexto,
  resumoDaFila,
  revisavelDaLeitura,
  type ItemRevisavel,
} from "../../src/pmo/fila";

const item = (
  id: string,
  rotulo: ItemRevisavel["rotulo"],
  texto: string,
  avisos: string[] = [],
): ItemRevisavel => ({
  id,
  rotulo,
  texto,
  avisos,
  grupo: "g",
});

describe("classe do item", () => {
  it("decisão do GP, a conferir, do documento e sugestão", () => {
    expect(classeDoItem(item("a", "decisao", "Valor-hora"))).toBe("decisao");
    expect(classeDoItem(item("b", "sugestao", "Cadência: a definir pelo GP."))).toBe("decisao");
    expect(classeDoItem(item("c", "documento", "Prazo de 30 dias", ["citação não conferida"]))).toBe(
      "conferir",
    );
    expect(classeDoItem(item("d", "documento", "Prazo de 30 dias"))).toBe("documento");
    expect(classeDoItem(item("e", "sugestao", "Sugere-se reunião mensal"))).toBe("sugestao");
  });
});

describe("impacto pelo texto", () => {
  it("caixa ou preço, prazo, aceite, quem executa, outro", () => {
    expect(impactoPeloTexto("A parcela depende do aceite")).toBe(1);
    expect(impactoPeloTexto("O marco do segundo produto")).toBe(2);
    expect(impactoPeloTexto("Aceite pela comissão")).toBe(3);
    expect(impactoPeloTexto("Substituição de perfil da equipe")).toBe(4);
    expect(impactoPeloTexto("Canal de comunicação")).toBe(5);
  });
});

describe("fila e lote", () => {
  const itens = [
    item("s1", "sugestao", "Canal de comunicação semanal, sugere-se"),
    item("d1", "decisao", "Reserva de contingência"),
    item("c1", "sugestao", "Prazo de 45 dias", ["número sem fonte: 45 dias"]),
    item("doc1", "documento", "Prazo de 30 dias"),
    item("d2", "decisao", "Gerente do projeto"),
  ];

  it("só os pendentes; decisões primeiro, depois os a conferir, cada grupo por impacto", () => {
    const fila = filaDePendencias(itens, { s1: { estado: "aceito" } });
    expect(fila.map((i) => i.id)).toEqual(["d1", "d2", "c1", "doc1"]);
    expect(contarFila(fila)).toEqual({ decisao: 2, conferir: 1, documento: 1, sugestao: 0 });
  });

  it("em lote, nunca decisão do GP nem item com aviso", () => {
    const lote = aceitaveisEmLote(filaDePendencias(itens, {}));
    expect(lote).toEqual({ documento: ["doc1"], sugestao: ["s1"] });
    expect(aceitar({}, lote.documento)).toEqual({ doc1: { estado: "aceito" } });
  });

  it("etapa 1: trava vira aviso e o impacto da seção 7 vale", () => {
    const r = revisavelDaLeitura({
      id: "pmo:a1",
      rotulo: "sugestao",
      nome: "Sem prazo",
      texto: "O documento não traz prazo.",
      secao: "atencao",
      impacto: 1,
      trava: "citacao-fraca",
    });
    expect(r.avisos).toEqual(["citacao-fraca"]);
    expect(r.impacto).toBe(1);
    expect(classeDoItem(r)).toBe("conferir");
  });
});

describe("etapa 1: o que a revisão de código apontou (decisão 0088)", () => {
  const base = { nome: "Item", texto: "Texto.", secao: "atencao" };
  it("o item que o PMO marcou como decisão do GP é decisão, mesmo com o rótulo de sugestão", () => {
    const r = revisavelDaLeitura({
      ...base,
      id: "pmo:a9",
      rotulo: "sugestao",
      situacao: "localizado",
      nota: "O PMO marcou como decisão do GP: a decidir pelo GP.",
    });
    expect(classeDoItem(r)).toBe("decisao");
    expect(aceitaveisEmLote(filaDePendencias([r], {}))).toEqual({ documento: [], sugestao: [] });
  });

  it("o que o código não localizou vai a conferir, nunca em lote", () => {
    const r = revisavelDaLeitura({
      ...base,
      id: "leitura:situacao",
      rotulo: "documento",
      situacao: "nao-localizado",
    });
    expect(classeDoItem(r)).toBe("conferir");
  });

  it("o requisito incluído pelo próprio GP não fica como decisão pendente", () => {
    const r = revisavelDaLeitura({
      ...base,
      id: "requisito:R15",
      rotulo: "decisao-gp",
      situacao: "localizado",
    });
    expect(classeDoItem(r)).toBe("sugestao");
  });

  it("o impacto da etapa 1 na escala da fila (dependência do contratante = quem executa; prazo = prazo)", () => {
    expect(revisavelDaLeitura({ ...base, id: "x", rotulo: "sugestao", impacto: 2 }).impacto).toBe(4);
    expect(revisavelDaLeitura({ ...base, id: "y", rotulo: "sugestao", impacto: 4 }).impacto).toBe(2);
  });

  it("as decisões que não são item contam na fila", () => {
    expect(resumoDaFila([], {}, ["Participar ou não", "Confirmar a modalidade"])).toMatch(
      /^2 decisão\(ões\) do GP/,
    );
  });
});
