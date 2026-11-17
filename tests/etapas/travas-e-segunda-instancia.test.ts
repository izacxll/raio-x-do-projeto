// Travas do teste externo (decisão 0057): EAP (marco que não cabe, reentrega sem nova análise, esforço não estimado,
// "antes da assinatura"), marco do TAP sem confirmação da conta, citação que não prova, data de ato ou de assinatura,
// passo refeito sem a resposta anterior, linha do tempo com a conferência dos marcos e a segunda instância.
// Dados inventados.
import { describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { citacaoEhFraca } from "../../src/etapas/1-rfp/leitura-pmo";
import { calcularCronograma, travasDaEap } from "../../src/etapas/2-proposta/cronograma";
import { propostaAntesDoPasso, propostaInicial } from "../../src/etapas/2-proposta/proposta";
import { conferirMarcosPelaConta } from "../../src/etapas/3-tap/conferencia-tap";
import type { EntradaTap } from "../../src/etapas/3-tap/entrada";
import { pgpAntesDoPasso } from "../../src/etapas/4-pgp/pedidos";
import { pgpInicial } from "../../src/etapas/4-pgp/pgp";
import { conferirMarcosDoPmo, linhaDoTempo } from "../../src/etapas/linha-do-tempo";
import { citacaoProvaOItem } from "../../src/pmo/redacao";
import type { AtividadeEap, HorasPerfil, RespostaEap } from "../../src/pmo/schemas/proposta";
import type { RespostaTap } from "../../src/pmo/schemas/tap";
import {
  conferirSegundaInstancia,
  pedidoSegundaInstancia,
  proximaRodada,
  sistemaDaSegundaInstancia,
} from "../../src/pmo/segunda-instancia";
import { ehDataDeAtoOuAssinatura, encontrarDatas } from "../../src/texto/datas";
import { documentoLido } from "./rfp-ajudantes";

const est = (o: number, m: number, p: number) => ({
  otimista: o,
  mais_provavel: m,
  pessimista: p,
  unidade: "dias úteis",
  base: "analogia",
});
const atv = (id: string, nome: string, pred: string[], extra: Partial<AtividadeEap> = {}): AtividadeEap => ({
  id,
  produto: "P1",
  nome,
  predecessoras: pred,
  duracao: est(5, 5, 5),
  restricaoData: null,
  aprovacaoCliente: false,
  analiseDoContratante: false,
  requisitos: [],
  ...extra,
});
const horas = (atividade: string, h: number | null): HorasPerfil => ({
  atividade,
  perfil: "coord",
  horas: h === null ? null : est(h, h, h),
});

describe("data de ato ou de assinatura não é situação nem prazo (item 13)", () => {
  it("portaria, decreto, carimbo e fecho são reconhecidos; prazo do certame não", () => {
    const casos: [string, boolean][] = [
      ["Chefe do Departamento de Planejamento\nPortaria nº 12 de março de 2026", true],
      ["conforme o Decreto nº 1.234, de 3 de março de 2025, e demais normas", true],
      ["Documento assinado eletronicamente em 10/02/2026", true],
      ["Cidade/UF, 18 de julho de 2026.", true],
      ["As propostas serão recebidas até 10/12/2026, às 10h.", false],
    ];
    for (const [texto, esperado] of casos) {
      const d = encontrarDatas(texto)[0]!;
      expect(ehDataDeAtoOuAssinatura(texto, d), texto).toBe(esperado);
    }
  });

  it("a data da portaria de quem assina não vira data do certame", () => {
    const a = analisarRfp(
      [
        documentoLido([
          "TERMO DE REFERÊNCIA\nOBJETO\nDiagnóstico das contas do órgão.",
          "Prazo para recursos: conforme o edital.\nFulano de Tal\nChefe do Departamento de Planejamento\nPortaria nº 12 de março de 2026",
        ]),
      ],
      new Date(2026, 10, 17),
    );
    expect(a.itens.filter((i) => i.id.startsWith("prazos:certame:")).map((i) => i.texto)).toEqual([]);
  });
});

describe("citação não prova (item 10g)", () => {
  it("o trecho tem de trazer o termo-chave do item", () => {
    expect(citacaoProvaOItem("O TR prevê relatórios trimestrais.", ["entregar relatórios periódicos"])).toBe(
      false,
    );
    expect(
      citacaoProvaOItem("O TR prevê relatórios trimestrais.", ["relatórios trimestrais de execução"]),
    ).toBe(true);
    expect(citacaoProvaOItem("Entrega em 30 dias.", ["no prazo de 30 (trinta) dias"])).toBe(true);
    expect(citacaoProvaOItem("Entrega em 45 dias.", ["no prazo de 30 (trinta) dias"])).toBe(false);
    expect(
      citacaoProvaOItem("A área técnica valida as etapas e os produtos.", [
        "Participar de reuniões periódicas",
      ]),
    ).toBe(false);
  });

  it("decisão 0058: data por extenso, e-mail, todos os trechos e números do esqueleto", () => {
    // a data do item em dd/mm/aaaa vale escrita por extenso no trecho
    expect(citacaoProvaOItem("O início é em 03/03/2027.", ["A execução começa em 3 de março de 2027."])).toBe(
      true,
    );
    // o item fala de e-mail e o trecho traz o endereço
    expect(
      citacaoProvaOItem("Os dois e-mails diferem por uma letra.", [
        "contato pelo endereço setor@orgao.gov.br",
      ]),
    ).toBe(true);
    // o termo-chave pode estar em qualquer trecho do item (radical: "equipamento" em "serviços/equipamentos")
    expect(
      citacaoProvaOItem("O recebimento fala em equipamento num serviço de relatórios.", [
        "Os itens/equipamentos entregues passam por vistoria",
        "outro trecho",
      ]),
    ).toBe(true);
    // número que vem do esqueleto do código, ou de uma frase "conta do código", não precisa estar no trecho
    expect(
      citacaoProvaOItem("Até o evento são 34 dias úteis (conta do código), e o prazo é de 30 dias.", [
        "no prazo de 30 (trinta) dias",
      ]),
    ).toBe(true);
    expect(
      citacaoProvaOItem("Termina em 22/03/2027.", ["vigência de 6 meses"], "termina em 22/03/2027"),
    ).toBe(true);
  });

  it("citação fraca conta toda palavra, inclusive a de uma letra", () => {
    expect(citacaoEhFraca("mínimo e atribuída pontuação com base:")).toBe(false);
    expect(citacaoEhFraca("conforme anexos")).toBe(true);
  });
});

describe("travas da EAP (itens 10a a 10d)", () => {
  it("reentrega sem nova conferência depois da análise do contratante", () => {
    const sem = travasDaEap([
      atv("1", "Elaborar o relatório", []),
      atv("2", "Análise do contratante", ["1"], { analiseDoContratante: true }),
      atv("3", "Ajustar e reentregar o relatório", ["2"]),
    ]);
    expect(sem.join(" ")).toMatch(/Reentrega sem nova conferência: a atividade 3/);
    const com = travasDaEap([
      atv("1", "Elaborar o relatório", []),
      atv("2", "Análise do contratante", ["1"], { analiseDoContratante: true }),
      atv("3", "Ajustar e reentregar o relatório", ["2"]),
      atv("4", "Nova análise do contratante", ["3"], { analiseDoContratante: true }),
    ]);
    expect(com.join(" ")).not.toMatch(/Reentrega sem nova conferência/);
  });

  it("atividade de campo ou de produto com 0 hora para todos os perfis; horas null são decisão do GP", () => {
    const atividades = [atv("1", "Coleta de campo", []), atv("2", "Redigir o relatório final", ["1"])];
    const t = travasDaEap(atividades, [horas("1", 0), horas("2", null)]);
    expect(t.filter((x) => x.startsWith("Esforço não estimado"))).toHaveLength(1);
    expect(t.join(" ")).toMatch(/atividade 1 \(Coleta de campo\) é de campo/);
  });

  it("'antes da assinatura' com predecessora posterior à assinatura", () => {
    const t = travasDaEap([
      atv("1", "Reunião de abertura", []),
      atv("2", "Validar o plano antes da assinatura", ["1"]),
    ]);
    expect(t.join(" ")).toMatch(/Atividade 2 .* é antes da assinatura, mas depende de 1/);
  });

  it("marco fixo: não cabe antes do marco, e a conta avisa quando falta o tempo de aprovação", () => {
    const fixa = atv("3", "Aplicação no evento", ["2"], {
      duracao: est(0, 0, 0),
      restricaoData: {
        inicio: "02/11/2026",
        fim: "06/11/2026",
        fonte: { doc: "rfp", pagina: 1, trecho: "o evento ocorre de 02/11/2026 a 06/11/2026" },
      },
    });
    const base = [
      atv("1", "Elaborar o questionário", [], { aprovacaoCliente: true }),
      atv("2", "Preparar", ["1"]),
      fixa,
    ];
    const semAprov = calcularCronograma(base, { inicio: new Date(2026, 9, 1) });
    expect(semAprov.datasFixas[0]).toMatchObject({ cabe: true, semAprovacao: true });
    expect(semAprov.problemas.join(" ")).toMatch(/sem o tempo de aprovação do cliente/);
    const comAprov = calcularCronograma(base, { inicio: new Date(2026, 9, 1), aprovacaoDias: 20 });
    expect(comAprov.datasFixas[0]).toMatchObject({ cabe: false });
    expect(comAprov.problemas.join(" ")).toMatch(/Não cabe antes do marco.*com a aprovação do cliente/);
  });
});

describe("marco do TAP sem confirmação da conta (item 10e)", () => {
  const e = {
    dados: {
      inicio: new Date(2026, 9, 1),
      cronograma: {
        atividades: [{ produto: "P1", dataFim: new Date(2026, 10, 20) }],
        conferenciaPrazo: { situacao: "cabe" },
      },
    },
  } as unknown as EntradaTap;
  const marco = (produto: string, prazo: string) =>
    ({
      produto,
      prazo,
      item: { texto: `Produto ${produto} aprovado` },
    }) as unknown as RespostaTap["marcos"][number];

  it("'antes de [data]' que a conta não confirma é divergência obrigatória", () => {
    const v = conferirMarcosPelaConta(e, [marco("P1", "antes de 10/11/2026")], [], 180);
    expect(v.situacao).toBe("atencao");
    expect(v.texto).toMatch(/Divergência obrigatória.*P1.*20\/11\/2026/);
  });

  it("confirmado pela conta, ou já registrado como divergência no TAP", () => {
    expect(conferirMarcosPelaConta(e, [marco("P1", "antes de 30/11/2026")], [], 180).situacao).toBe("ok");
    const registrada = [
      { ponto: "marco P1", item: { texto: "P1 não cabe antes de 10/11/2026" } },
    ] as unknown as RespostaTap["divergenciasTexto"];
    const v = conferirMarcosPelaConta(e, [marco("P1", "antes de 10/11/2026")], registrada, 180);
    expect(v.situacao).toBe("ok");
    expect(v.texto).toMatch(/Já registrados como divergência/);
  });
});

describe("passo refeito sem a resposta anterior (item 12a)", () => {
  it("proposta: o passo e os seguintes saem; as decisões do GP ficam", () => {
    const p = {
      ...propostaInicial(),
      estrategia: { resposta: {}, modelo: "m", em: "1" },
      abordagem: { id: "B" },
      conteudo: { resposta: {}, modelo: "m", em: "2" },
      eap: { resposta: {}, modelo: "m", em: "3" },
    } as unknown as ReturnType<typeof propostaInicial>;
    const antes = propostaAntesDoPasso(p, "conteudo");
    expect(antes.estrategia).toBeDefined();
    expect(antes.abordagem?.id).toBe("B");
    expect(antes.conteudo).toBeUndefined();
    expect(antes.eap).toBeUndefined();
  });

  it("PGP: idem", () => {
    const p = {
      ...pgpInicial(),
      adaptacao: { resposta: {}, modelo: "m", em: "1" },
      escopo: { resposta: {}, modelo: "m", em: "2" },
      riscos: { resposta: {}, modelo: "m", em: "3" },
    } as unknown as ReturnType<typeof pgpInicial>;
    const antes = pgpAntesDoPasso(p, "riscos");
    expect(antes.adaptacao).toBeDefined();
    expect(antes.escopo).toBeDefined();
    expect(antes.riscos).toBeUndefined();
  });
});

describe("linha do tempo e conferência dos marcos (item 12b)", () => {
  const crono = calcularCronograma(
    [
      atv("1", "Elaborar o relatório", []),
      atv("2", "Análise do contratante", ["1"], { analiseDoContratante: true }),
    ],
    {
      inicio: new Date(2026, 9, 1),
      aprovacaoDias: 10,
      prazoRfp: { dias: 30, unidade: "dias corridos", texto: "30 dias" },
    },
  );
  const linha = linhaDoTempo({
    inicio: new Date(2026, 9, 1),
    prazo: { dias: 30, unidade: "dias corridos", texto: "30 dias" },
    aprovacaoDias: 10,
    cronograma: crono,
    produtos: [{ id: "P1", nome: "Relatório" }],
  });

  it("início, entrega sem e com a análise do cliente e a vigência", () => {
    expect(linha.map((m) => m.id)).toEqual(["inicio", "P1", "vigencia"]);
    expect(linha[1]?.texto).toMatch(
      /entrega no dia útil 5 .* sem a análise do cliente; aprovado no dia útil 15/,
    );
  });

  it("o PMO que diverge da conta, ou que não confere um marco, é apontado", () => {
    const situacaoP1 = linha.find((m) => m.id === "P1")!.situacao;
    const contraria = situacaoP1 === "cabe" ? "nao_cabe" : "cabe";
    const avisos = conferirMarcosDoPmo([{ marco: "P1", situacao: contraria, motivo: "" }], linha);
    expect(avisos.join(" ")).toMatch(/Marco P1: o PMO diz .* Vale a conta do código/);
    expect(avisos.join(" ")).toMatch(/Marco vigencia sem conferência do PMO/);
    expect(conferirMarcosDoPmo([], linha)[0]).toMatch(/não devolveu a conferência dos marcos/);
  });

  it("o campo vem no schema da EAP, com [] em resposta antiga", () => {
    const r: Partial<RespostaEap> = { conferenciaDosMarcos: [] };
    expect(r.conferenciaDosMarcos).toEqual([]);
  });
});

describe("segunda instância (item 12c)", () => {
  it("vai só a skill no sistema e a resposta no pedido", () => {
    const s = sistemaDaSegundaInstancia();
    expect([...s.matchAll(/<arquivo nome="([^"]+)">/g)].map((m) => m[1])).toEqual(["SKILL.md"]);
    expect(pedidoSegundaInstancia(2, "conteudo", { marcador: "xyz-123" })).toMatch(/xyz-123/);
  });

  it("leva o pedido do passo, com o esqueleto, e a régua é o que ele exige (decisão 0059)", () => {
    const p = pedidoSegundaInstancia(
      1,
      "leitura-rfp",
      {},
      "# Esqueleto do código\n- R01 Relatório final\n# O que fazer\n1. as 8 seções",
    );
    expect(p).toMatch(/<pedido-do-passo>[\s\S]*R01 Relatório final[\s\S]*<\/pedido-do-passo>/);
    expect(p).toMatch(/nem mais nem menos/);
    expect(p).toMatch(/Item do método ou das fichas que o pedido não pediu não é falta/);
  });

  it("a rodada sobe só quando a resposta do passo muda (decisão 0059)", () => {
    expect(proximaRodada(undefined, "t1")).toBe(1);
    expect(proximaRodada({ deResposta: "t1", rodada: 1 }, "t1")).toBe(1);
    expect(proximaRodada({ deResposta: "t1", rodada: 1 }, "t2")).toBe(2);
    expect(proximaRodada({ deResposta: "t1" }, "t2")).toBe(2);
  });

  it("ordena por gravidade e marca a evidência que o código não achou", () => {
    const docs = [documentoLido(["O prazo de entrega é de 30 dias contados da assinatura."])];
    const r = conferirSegundaInstancia(
      {
        achados: [
          {
            id: "s1",
            tipo: "rotulo_errado",
            gravidade: "baixa",
            onde: "x",
            texto: "",
            evidencias: [],
            sugestao: "",
          },
          {
            id: "s2",
            tipo: "erro_de_fato",
            gravidade: "alta",
            onde: "y",
            texto: "",
            evidencias: [
              { doc: "rfp", pagina: 1, trecho: "O prazo de entrega é de 45 dias contados da assinatura" },
            ],
            sugestao: "",
          },
        ],
        conferido: ["requisitos R"],
      },
      docs,
    );
    expect(r.achados.map((a) => a.id)).toEqual(["s2", "s1"]);
    expect(r.altas).toBe(1);
    expect(r.achados[0]?.evidenciaConferida).toBe(false);
    expect(r.achados[1]?.evidenciaConferida).toBe(true);
  });
});
