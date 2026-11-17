// Correções do esqueleto da etapa 1 (decisão 0048), a partir dos testes externos de 16/11/2026: casos fixos da SMPED
// (edital público, roda no CI) e do TR municipal de contratação direta (fora do Git: só roda na máquina da
// responsável, com o arquivo em referencias/). Os casos sintéticos garantem as mesmas regras no CI sem o TR.
import { existsSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { montarLeituraRfp, type LeituraRfp } from "../../src/etapas/1-rfp/leitura";
import { analiseInicial } from "../../src/etapas/1-rfp/revisao";
import { fraseEmVolta } from "../../src/texto/frase";
import { lerPdf, lerRfpPublica } from "../ajudantes/rfp-publica";
import { documentoLido } from "./rfp-ajudantes";

const HOJE = new Date(2026, 10, 16);
const TR = "referencias/estudos-externos/tr-contratacao-direta/tr-contratacao-direta.pdf";

function ler(l: LeituraRfp, id: string) {
  return l.itens.find((i) => i.id === id);
}
function textoDe(l: LeituraRfp, id: string): string {
  const i = ler(l, id);
  return i ? [i.texto, ...(i.tabela?.linhas.flat() ?? [])].join(" ") : "";
}
function leitura(paginas: string[]) {
  const a = analisarRfp([documentoLido(paginas)], HOJE);
  return { a, l: montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE) };
}

describe("regras novas, em casos sintéticos (CI)", () => {
  it("o ponto de abreviação não fecha a frase (Av. Dr.)", () => {
    const t =
      "9.1 Fica designado a Praça Central e a Av. Dr. Silva como local da prestação do serviço. Outro.";
    expect(fraseEmVolta(t, t.indexOf("Silva"))).toMatch(/^9\.1 Fica designado.*Silva como local/);
  });

  it("contratação direta declarada fora das primeiras páginas; a explicação da lei não conta", () => {
    const { l } = leitura([
      "TERMO DE REFERÊNCIA\n1. OBJETO: Contratação de serviços para estudo técnico do município.",
      "Texto de apoio.",
      "Mais texto.",
      "A Lei 14.133/21 elenca nos artigos 74 e 75, respectivamente, os casos de inexigibilidade e dispensa de licitação.",
      "Portanto, a modalidade a ser adotada para esta prestação de serviço, será INEXIGIBILIDADE de Licitação com base no Art. 74, III, da Lei nº 14.133/2021.",
    ]);
    expect(l.modalidade).toBe("contratacao-direta");
    expect(textoDe(l, "leitura:regime")).toMatch(/^Inexigibilidade/);
    expect(ler(l, "leitura:como-se-ganha")?.nome).toBe("Como é escolhida");
    expect(ler(l, "leitura:direta:sustenta")).toBeDefined();
    expect(l.naoLocalizados.julgamento ?? []).not.toContain("tabela de critérios");
    expect(textoDe(l, "identificacao:objeto")).toMatch(/Contratação de serviços para estudo técnico/);
  });

  it("parcelas em valor no texto: percentual e soma × valor global (X5) são do código", () => {
    const { l } = leitura([
      "1. OBJETO: Estudo técnico.\n2.3.1 Produto 1: Metodologia do estudo\n2.3.2 Produto 2: Relatório final",
      "10.1. O valor da contratação corresponde a R$ 100.000,00 (cem mil reais).\n11.1 O pagamento será efetuado em duas parcelas:\na) 1ª parcela, no valor de R$ 40.000,00 (quarenta mil reais), contra a entrega do Produto 1;\nb) 2ª parcela, no valor de R$ 60.000,00 (sessenta mil reais), contra a entrega do Produto 2.",
    ]);
    expect(textoDe(l, "leitura:dinheiro:desembolso")).toMatch(
      /R\$\s?40\.000,00 \(40%\).*R\$\s?60\.000,00 \(60%\)/,
    );
    expect(l.cruzamentos.find((c) => c.codigo === "X5")?.estado).toBe("confere");
  });

  it("e-mails quase iguais divergem (X4)", () => {
    const { l } = leitura([
      "Enviar para contato@prefeitura.gov.br a assinatura.",
      "As informações deverão ser enviadas para contatos@prefeitura.gov.br.",
    ]);
    expect(l.cruzamentos.find((c) => c.codigo === "X4")?.estado).toBe("diverge");
  });

  it("os seis cruzamentos saem sempre registrados", () => {
    const { l } = leitura(["1. OBJETO: Estudo técnico."]);
    expect(l.cruzamentos.map((c) => c.codigo)).toEqual(["X1", "X2", "X3", "X4", "X5", "X6"]);
  });
});

describe("SMPED: os erros do teste externo", () => {
  let l: LeituraRfp;
  beforeAll(async () => {
    const doc = await lerRfpPublica("chamamento-publico-termo-fomento-smped-sp-2025.pdf");
    const a = analisarRfp([doc], HOJE);
    l = montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE);
  });

  it("habilitação: os itens 7 e 8 entram; as alíneas do item 20 (exemplos) não", () => {
    const linhas = ler(l, "leitura:habilitacao:lista")?.tabela?.linhas ?? [];
    const numeros = linhas.map((x) => x[0]);
    expect(numeros).toEqual(expect.arrayContaining(["7", "8"]));
    expect(numeros.filter((n) => /^[a-z]\)?$/.test(n ?? ""))).toEqual([]);
    expect(textoDe(l, "leitura:habilitacao:lista")).toMatch(/Tribunal de Contas do Estado/);
  });

  it('"Diário Oficial" não vira obrigação diária', () => {
    expect(textoDe(l, "leitura:prazos:recorrentes")).not.toMatch(/diari/i);
  });

  it("a eliminação sai com as alíneas, sem a tabela de pontuação", () => {
    const t = textoDe(l, "leitura:julgamento:eliminacao");
    expect(t).toMatch(/Serão eliminadas as propostas: a\) Cuja pontuação for inferior a 40/);
    expect(t).not.toMatch(/Não comprovação de atendimento/);
  });

  it('os requisitos não terminam em "Decreto Municipal nº"', () => {
    const rs = l.itens.filter((i) => i.numero);
    expect(rs.filter((r) => /nº$/.test(r.texto.trim()))).toEqual([]);
    expect(rs.some((r) => /Decreto Municipal nº 57\.575\/2016/.test(r.texto))).toBe(true);
  });

  it("parcela única × desembolso mensal sai como cruzamento que não bate (X1)", () => {
    expect(l.cruzamentos.find((c) => c.codigo === "X1")?.estado).toBe("diverge");
    expect(ler(l, "leitura:cruzamento:X1")).toBeDefined();
  });

  it('sem falso estudo sensível ("denúncia" do termo) nem prazo contado da notificação', () => {
    expect(ler(l, "leitura:atencao:estudo-sensivel")).toBeUndefined();
    expect(ler(l, "leitura:atencao:sem-termo-inicial")).toBeUndefined();
  });
});

describe.skipIf(!existsSync(TR))("TR municipal de contratação direta (só na máquina da responsável)", () => {
  let l: LeituraRfp;
  beforeAll(async () => {
    const doc = await lerPdf(TR, "tr.pdf");
    const a = analisarRfp([doc], HOJE);
    l = montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE);
  });

  it("modalidade: inexigibilidade (art. 74, III), com o objeto da p. 1", () => {
    expect(l.modalidade).toBe("contratacao-direta");
    expect(ler(l, "leitura:regime")?.origem?.pagina).toBe(7);
    expect(ler(l, "identificacao:objeto")?.origem?.pagina).toBe(1);
  });

  it("3 parcelas de R$ 80.000,00 contra produto, somando o valor global (X5)", () => {
    const linhas = ler(l, "leitura:dinheiro:desembolso")?.tabela?.linhas ?? [];
    expect(linhas).toHaveLength(3);
    for (const x of linhas) expect(x[1]).toMatch(/80\.000,00/);
    expect(l.cruzamentos.find((c) => c.codigo === "X5")?.estado).toBe("confere");
  });

  it("os 3 produtos e os 400 questionários válidos são requisitos", () => {
    const rs = l.itens.filter((i) => i.numero).map((i) => i.nome);
    expect(rs.filter((n) => /Produto \d/.test(n))).toHaveLength(3);
    expect(rs.some((n) => /400 questionários válidos/.test(n))).toBe(true);
  });

  it("os dois e-mails diferentes (X4), a vedação com o campo (X3) e a janela até o evento (X2)", () => {
    const x = (c: string) => l.cruzamentos.find((y) => y.codigo === c);
    expect(x("X4")?.estado).toBe("diverge");
    expect(x("X3")?.estado).toBe("para-o-pmo");
    expect(x("X2")?.estado).toBe("em-aberto");
    expect(x("X2")?.resultado).toMatch(/Janela entre o início e o marco: \d+ dias úteis/);
  });

  it("estudo sensível e prazo sem termo inicial; sem prazo de recurso de sanção no certame", () => {
    expect(ler(l, "leitura:atencao:estudo-sensivel")).toBeDefined();
    expect(ler(l, "leitura:atencao:sem-termo-inicial")).toBeDefined();
    expect(textoDe(l, "leitura:prazos:certame")).not.toMatch(/Recursos/);
  });
});

describe("conferência dos números do PMO com as contas dos cruzamentos (decisão 0046)", () => {
  it('número que só está num cruzamento vale; conta nova com "conta do código" continua barrada', async () => {
    const { conferirLeituraRfp } = await import("../../src/etapas/1-rfp/leitura-pmo");
    const paginas = [
      "1. OBJETO: Estudo de impacto de evento.\nO evento será realizado no período de 08/11/2025 a 07/01/2026, na praça central.",
      "8.1 Iniciar-se-á em 22 de setembro de 2025;\n3.3. O prazo de vigência da contratação será de 06 (seis) meses contado do primeiro dia útil subsequente à data de divulgação no Portal.",
    ];
    const a = analisarRfp([documentoLido(paginas)], HOJE);
    const dossie = analiseInicial(a, HOJE);
    const l = montarLeituraRfp(a, dossie, HOJE);
    const janela = /(\d+) dias úteis/.exec(
      l.cruzamentos.find((c) => c.codigo === "X2")?.resultado ?? "",
    )?.[1];
    expect(janela).toBeDefined();
    const fonte = { doc: "rfp" as const, pagina: 2, trecho: "8.1 Iniciar-se-á em 22 de setembro de 2025" };
    const base = {
      secao: "prazos" as const,
      nome: "Marco fixo",
      rotulo: "sugestao" as const,
      fontes: [fonte],
      requisitos: [],
      tema: "",
      premissa: "" as const,
      porquePesa: "",
      pergunta: "",
      impacto: 0,
    };
    const c = conferirLeituraRfp(
      {
        cruzamentos: [],
        autoconferencia: [],
        itens: [
          { ...base, id: "j", texto: `Entre o início e o evento há ${janela} dias úteis (conta do código).` },
          { ...base, id: "k", texto: "As duas últimas parcelas somam 77,77% (conta do código)." },
        ],
      },
      [documentoLido(paginas)],
      l,
      dossie,
      HOJE,
    );
    expect(c.find((x) => x.item.id === "j")?.trava).toBeUndefined();
    expect(c.find((x) => x.item.id === "k")?.trava).toBe("conta-do-pmo");
  });
});
