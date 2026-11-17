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
      "Os casos de inexigibilidade e de dispensa de licitação estão nos artigos 74 e 75 da Lei 14.133/21.",
      "Assim, esta contratação será INEXIGIBILIDADE de licitação, com base no Art. 74, III, da Lei nº 14.133/2021.",
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
  let a: ReturnType<typeof analisarRfp>;
  beforeAll(async () => {
    const doc = await lerPdf(TR, "tr.pdf");
    a = analisarRfp([doc], HOJE);
    l = montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE);
  });

  it("modalidade: inexigibilidade (art. 74, III), com o objeto da p. 1", () => {
    expect(l.modalidade).toBe("contratacao-direta");
    expect(ler(l, "leitura:regime")?.origem?.pagina).toBe(7);
    expect(ler(l, "identificacao:objeto")?.origem?.pagina).toBe(1);
  });

  it("3 parcelas em valor contra produto, somando o valor global (X5)", () => {
    const linhas = ler(l, "leitura:dinheiro:desembolso")?.tabela?.linhas ?? [];
    expect(linhas).toHaveLength(3);
    for (const x of linhas) expect(x[1]).toMatch(/R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}/);
    expect(l.cruzamentos.find((c) => c.codigo === "X5")?.estado).toBe("confere");
  });

  it("os 3 produtos e a meta de questionários válidos são requisitos", () => {
    const rs = l.itens.filter((i) => i.numero).map((i) => i.nome);
    expect(rs.filter((n) => /Produto \d/.test(n))).toHaveLength(3);
    expect(rs.some((n) => /\d+ questionários válidos/.test(n))).toBe(true);
  });

  it("os dois e-mails diferentes (X4), a vedação com o campo (X3) e a janela até o evento (X2)", () => {
    const x = (c: string) => l.cruzamentos.find((y) => y.codigo === c);
    expect(x("X4")?.estado).toBe("diverge");
    expect(x("X3")?.estado).toBe("para-o-pmo");
    expect(x("X2")?.estado).toBe("em-aberto");
    expect(x("X2")?.resultado).toMatch(/Janela entre o início e o marco: \d+ dias úteis/);
  });

  it("contratante achado no corpo (prefeitura e secretaria); a cláusula de responsabilidade não é R", () => {
    expect(ler(l, "identificacao:objeto")).toBeDefined();
    const textoDoContratante = ler(l, "identificacao:objeto")?.texto ?? "";
    expect(textoDoContratante).toMatch(
      /Contratante: (?:Prefeitura Municipal|Município) de [^.]+ — Secretaria de /,
    );
    expect(l.itens.filter((i) => i.numero && /qualquer erro na Proposta/.test(i.texto))).toEqual([]);
  });

  it("aceite pela nota fiscal (p. 10) e a FGV fora dos órgãos citados", () => {
    const r = a.itens.find((i) => i.id === "condicoes:recebimento");
    expect(r?.texto).toMatch(/^Sem cláusula própria de recebimento/);
    expect(r?.origem?.pagina).toBe(10);
    expect(a.itens.filter((i) => i.id.startsWith("partes:unidade:fundacao-getulio"))).toEqual([]);
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
      "1. OBJETO: Estudo de impacto de evento.\nO evento será previsto para o período de 07/11/2026 a 06/01/2027, na praça central.",
      "8.1 O início da execução será em 21 de setembro de 2026;\n3.3. A vigência será de 06 (seis) meses, contados da divulgação no portal.",
    ];
    const a = analisarRfp([documentoLido(paginas)], HOJE);
    const dossie = analiseInicial(a, HOJE);
    const l = montarLeituraRfp(a, dossie, HOJE);
    const janela = /(\d+) dias úteis/.exec(
      l.cruzamentos.find((c) => c.codigo === "X2")?.resultado ?? "",
    )?.[1];
    expect(janela).toBeDefined();
    const fonte = {
      doc: "rfp" as const,
      pagina: 2,
      trecho: "8.1 O início da execução será em 21 de setembro de 2026",
    };
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

describe("números que pedem fonte: referências não são valores", () => {
  it('numeração da lista e "seção 7" saem; valor fica', async () => {
    const { numerosQuePedemFonte } = await import("../../src/etapas/1-rfp/leitura-pmo");
    expect(numerosQuePedemFonte("1) dados sem prazo; 2) pagamento; ver seção 7")).toEqual([]);
    expect(numerosQuePedemFonte("Repassar no prazo de 30 dias (ver seção 7).")).toEqual(["30"]);
  });
});

describe("contratante no corpo e cláusula padrão de responsabilidade (pedido da responsável)", () => {
  it("acha o contratante no corpo do documento, com a secretaria", () => {
    const { a } = leitura([
      "TERMO DE REFERÊNCIA\n1. OBJETO: Contratação de serviços para estudo técnico.",
      "3.2. O contrato será assinado na sede da Prefeitura Municipal de Vila Exemplo – MG, na Rua Um, nº 1.",
      "A Secretaria de Turismo e Cultura conduz as ações de turismo da cidade.",
    ]);
    const c = a.itens.find((i) => i.id === "identificacao:contratante");
    expect(c?.texto).toBe("Prefeitura Municipal de Vila Exemplo — Secretaria de Turismo e Cultura");
  });

  it('"ficar responsável por qualquer erro na proposta" não é requisito', () => {
    const { l } = leitura([
      "1. OBJETO: Estudo técnico.\n2.3.1 Produto 1: Metodologia",
      "5. DAS OBRIGAÇÕES DA CONTRATADA:\n5.2. Ficar responsável por qualquer erro na Proposta, entregando os produtos como pede este Termo;",
    ]);
    expect(l.itens.filter((i) => i.numero && /qualquer erro na Proposta/.test(i.texto))).toEqual([]);
  });
});

describe("aceite pela nota fiscal e a contratada fora das partes (pedido da responsável)", () => {
  it("sem cláusula de recebimento, o aceite é a aprovação da nota fiscal por quem fiscaliza", () => {
    const { a } = leitura([
      "1. OBJETO: Contratação da Fundação Getúlio Vargas – FGV para um estudo técnico.\n2.3.1 Produto 1: Metodologia",
      "11. PAGAMENTO\n11.1 Cada uma das três parcelas é paga contra a nota fiscal aprovada pelo responsável pela fiscalização, assim:",
    ]);
    const r = a.itens.find((i) => i.id === "condicoes:recebimento");
    expect(r?.situacao).toBe("localizado");
    expect(r?.texto).toBe(
      "Sem cláusula própria de recebimento no documento: o aceite é a aprovação da nota fiscal pelo responsável pela fiscalização, sem prazo para a análise e sem recebimento provisório e definitivo.",
    );
    expect(r?.origem?.pagina).toBe(2);
  });

  it("com recebimento provisório e definitivo, vale a cláusula, não a nota fiscal", () => {
    const { a } = leitura([
      "1. OBJETO: Estudo técnico.",
      "O recebimento provisório se dará em até 5 dias. O pagamento mediante nota fiscal aprovada pelo fiscal do contrato.",
    ]);
    expect(a.itens.find((i) => i.id === "condicoes:recebimento")?.texto).toMatch(/recebimento provisório/);
  });

  it("a contratada (FGV) não entra nos órgãos citados", () => {
    const { a } = leitura([
      "1. OBJETO: Contratação da Fundação Getúlio Vargas – FGV para Estudo Técnico.\nA Fundação Getúlio Vargas para Estudo Técnico entrega os produtos.",
      "A Secretaria de Turismo e Cultura acompanha a execução. A Secretaria de Turismo e Cultura aprova.",
    ]);
    const orgaos = a.itens.filter((i) => i.id.startsWith("partes:unidade:")).map((i) => i.texto);
    expect(orgaos.some((o) => /Getúlio Vargas/.test(o))).toBe(false);
    expect(orgaos).toContain("Secretaria de Turismo e Cultura");
  });
});
