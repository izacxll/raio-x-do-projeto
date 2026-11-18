// Etapa 4 (PGP): entrada, respostas gravadas do PMO para a RFP pública da OEI (tests/fixtures/gerados/pgp-oei/),
// contas do código (cronograma, marcos, custos, rastreabilidade), pedidos e a autoconferência pelas regras da etapa 5.
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { propostaGravada, tapGravado } from "../ajudantes/gravadas";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import type { Dossie, PgpDossie } from "../../src/dossie/esquema";
import { avaliarItens, type ItemProposta } from "../../src/etapas/2-proposta/proposta";
import {
  autoconferir,
  ligarPeloId,
  mapaDoPgpGerado,
  partesNaoGeradas,
  pgpComoDocumento,
} from "../../src/etapas/4-pgp/autoconferencia";
import {
  rastrearCompromissos,
  conferirPacotes,
  conferirRaci,
  contratanteNaRaci,
  cronogramaDoPgp,
  custosDoPgp,
  marcosDoPgp,
  rastrear,
} from "../../src/etapas/4-pgp/calculos";
import { alertasDeDataFixa } from "../../src/exportacao/relatorio-pgp";
import { montarEntradaPgp, tapDoDossieComoDocumento, type EntradaPgp } from "../../src/etapas/4-pgp/entrada";
import { PEDIDOS_PGP } from "../../src/etapas/4-pgp/pedidos";
import { PASSOS_PGP } from "../../src/etapas/4-pgp/passos";
import {
  gerarSugerido,
  itensDoPgp,
  partesAGerar,
  pgpInicial,
  repeteORegistroInicial,
} from "../../src/etapas/4-pgp/pgp";
import { PARTES_PGP } from "../../src/dominio/skill";
import { RespostaCronogramaGuardada, SCHEMAS_PGP, type PassoPgp } from "../../src/pmo/schemas/pgp";
import {
  conferirAutoconferenciaDaEtapa3,
  itensEsperadosDaEtapa3,
} from "../../src/etapas/3-tap/autoconferencia";
import { destinosNoPlano, numerosCitados, type Compromisso } from "../../src/etapas/2-proposta/compromissos";
import { conferirQuestoes, questoesDoCodigo } from "../../src/etapas/4-pgp/questoes";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const ler = (n: string) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/gerados/pgp-oei/${n}.json`, import.meta.url), "utf-8"),
  ) as unknown;
const HOJE = new Date(2026, 10, 13);

function pgpGravado(): PgpDossie {
  const p = pgpInicial();
  const guardadas = Object.fromEntries(
    (Object.keys(SCHEMAS_PGP) as PassoPgp[]).map((passo) => [
      passo,
      { resposta: SCHEMAS_PGP[passo].parse(ler(passo)), modelo: "teste", em: "" },
    ]),
  ) as Pick<PgpDossie, PassoPgp>;
  return { ...p, ...guardadas, gerar: gerarSugerido(guardadas.adaptacao!.resposta) };
}

let dossie: Dossie;
let entrada: EntradaPgp;

beforeAll(async () => {
  const rfp = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
  dossie = {
    ...criarDossieVazio(HOJE),
    documentos: [rfp],
    proposta: await propostaGravada(),
    tap: await tapGravado(),
    pgp: pgpGravado(),
  };
  entrada = montarEntradaPgp(dossie, HOJE);
}, 120000);

describe("entrada da etapa 4", () => {
  it("TAP e proposta vêm do dossiê como documentos, com os marcos e as premissas do TAP", () => {
    expect(entrada.fonteTap).toBe("dossie");
    expect(entrada.fonteProposta).toBe("dossie");
    expect(entrada.documentos.map((d) => d.papel)).toEqual(["rfp", "tap", "proposta"]);
    expect(entrada.marcosTap.map((m) => m.produto)).toContain("P2");
    expect(entrada.premissasTap.some((p) => p.premissaCritica === "PC3")).toBe(true);
    expect(entrada.premissasAnteriores.PC6).toBe(true);
  });
});

describe("respostas gravadas do PMO na etapa 4 (OEI)", () => {
  it("adaptação cobre as 51 partes; o que é dispensável fica fora do que gerar", () => {
    const p = dossie.pgp!;
    expect(p.adaptacao!.resposta.partes.map((x) => x.codigo).sort()).toEqual(
      PARTES_PGP.map((f) => f.codigo).sort(),
    );
    expect(p.gerar.A9).toBe(false);
    expect(p.gerar.A8).toBe(true);
    expect(partesAGerar(p).length).toBe(36);
  });

  it("cada parte marcada é escrita pelo PMO ou montada pelo código, no passo dela", () => {
    const p = dossie.pgp!;
    for (const codigo of partesAGerar(p)) {
      const passo = PASSOS_PGP.find((x) => x.textos.includes(codigo) || x.doCodigo.includes(codigo))!;
      if (passo.doCodigo.includes(codigo)) continue;
      expect(
        p[passo.passo]!.resposta.textos.map((t) => t.codigo),
        codigo,
      ).toContain(codigo);
    }
  });

  it("toda citação é achada pelo código; sem número sem fonte; sugestões em redação condicional", () => {
    const itens = itensDoPgp(dossie.pgp!, entrada.documentos);
    const naoAchadas = itens.flatMap((i) =>
      i.conferencia.citacoes
        .map((c, k) => ({ id: i.id, trecho: i.item.fontes[k]?.trecho, estado: c.estado }))
        .filter((c) => c.estado === "nao-conferida"),
    );
    expect(naoAchadas).toEqual([]);
    const av = avaliarItens(itens as ItemProposta[], []);
    expect(av.numerosSemFonte).toBe(0);
    // o trecho do B31 fala das reuniões, não de quem valida os produtos: "citação a conferir", que é aviso e não
    // conta entre os fatos sem citação (decisões 0057 e 0058)
    expect(itens.filter((i) => i.conferencia.citacaoNaoProva).map((i) => i.id)).toEqual(["planos:B31:0"]);
    expect(av.fatosSemCitacao).toBe(0);
    expect(av.aderencia).toBe(1);
  });
});

describe("contas do código na etapa 4", () => {
  it("cronograma sem problemas na rede e dentro dos 12 meses", () => {
    const c = cronogramaDoPgp(dossie.pgp!, entrada)!;
    // sem o tempo de aprovação (decisão do GP), o código só avisa
    expect(c.problemas.filter((x) => !/aprovação do cliente não informado/.test(x))).toEqual([]);
    expect(c.conferenciaPrazo.situacao).toBe("cabe");
    expect(c.caminhoCritico.at(-1)).toBe("5.3");
  });

  it("marcos contra o TAP: o P2 passa do marco de 75 dias e é apontado", () => {
    const p = dossie.pgp!;
    const marcos = marcosDoPgp(p, entrada, cronogramaDoPgp(p, entrada)!);
    expect(marcos.find((m) => m.produto === "P1")?.situacao).toBe("cabe");
    expect(marcos.find((m) => m.produto === "P2")?.situacao).toBe("nao-cabe");
    expect(marcos.find((m) => m.produto === "G")?.situacao).toBe("nao-conferido");
  });

  it("custos: sem os valores do GP, a definir; com eles, linha de base e orçamento", () => {
    const p = dossie.pgp!;
    expect(custosDoPgp(p, entrada)!.orcamento).toBeUndefined();
    const valoresHora = Object.fromEntries(p.cronograma!.resposta.perfis.map((x) => [x.id, 100]));
    const comValores = {
      ...p,
      parametros: { ...p.parametros, valoresHora, contingencia: 10000, gerencial: 5000 },
    };
    const c = custosDoPgp(comValores, entrada)!;
    expect(c.linhaDeBase).toBe(c.preco.pessoal! + 10000);
    expect(c.orcamento).toBe(c.linhaDeBase! + 5000);
    expect(c.faltando).toEqual([]);
  });

  it("rastreabilidade: todo requisito da RFP chega ao TAP, à EAP e ao cronograma", () => {
    const r = rastrear(dossie.pgp!, entrada);
    expect(r.map((x) => x.requisito)).toEqual(entrada.ponto.requisitos.map((x) => x.numero));
    expect(r.filter((x) => x.situacao !== "rastreado")).toEqual([]);
    expect(r.find((x) => x.requisito === "R01")?.tap.length).toBeGreaterThan(0);
  });
});

describe("pedidos da etapa 4", () => {
  it("cada passo leva só as fichas das partes que o GP marcou", () => {
    const p = dossie.pgp!;
    const planos = PEDIDOS_PGP.planos(entrada, p);
    expect(planos).toContain('<ficha parte="A11">');
    expect(planos).not.toContain('<ficha parte="A9">');
    expect(planos).toContain("PC3");
    expect(PEDIDOS_PGP.adaptacao(entrada, p)).toContain("### B33");
    expect(PEDIDOS_PGP.cronograma(entrada, p)).toContain("P1.1 Alinhamento e plano de trabalho");
  });

  it("riscos, planos e execução levam o cronograma do plano, com as predecessoras (decisão 0081)", () => {
    const p = dossie.pgp!;
    const a = p.cronograma!.resposta.atividades.find((x) => x.predecessoras.length)!;
    for (const passo of ["riscos", "planos", "execucao"] as const) {
      const pedido = PEDIDOS_PGP[passo](entrada, p);
      expect(pedido).toContain("Cronograma do plano (passo cronograma; é este que vale, não o da proposta):");
      expect(pedido).toContain(`- ${a.id} ${a.nome} (produto ${a.produto}`);
      expect(pedido).toContain(`depois de: ${a.predecessoras.join(", ")}`);
    }
  });

  it("requisito do TAP com R fora da lista da etapa 1 vai marcado no pedido do escopo", () => {
    const e: EntradaPgp = {
      ...entrada,
      requisitosTap: [
        { texto: "Três produtos.", requisitos: ["R01"] },
        { texto: "Responder por erro na proposta.", requisitos: ["R99"] },
      ],
    };
    const pedido = PEDIDOS_PGP.escopo(e, dossie.pgp!);
    expect(pedido).toContain("- Três produtos. (R01)\n");
    expect(pedido).toContain(
      "- Responder por erro na proposta. (R99) — R99 fora da lista de requisitos da RFP (descartado na etapa 1): trate como restrição, não como requisito.",
    );
  });
});

describe("autoconferência pelas regras da etapa 5", () => {
  it("o plano gerado tem as partes marcadas com título próprio, e as dispensadas ficam dispensadas", () => {
    const pgp = pgpComoDocumento(dossie, HOJE);
    const mapa = mapaDoPgpGerado(dossie, pgp);
    const de = (c: string) => mapa.find((m) => m.codigo === c)!;
    expect(de("A8").situacao).toBe("presente");
    expect(de("A8").paginaInicial).toBeGreaterThan(0);
    expect(de("B23").situacao).toBe("presente");
    expect(de("A9").situacao).toBe("dispensada");
    expect(
      mapa.filter((m) => dossie.pgp!.gerar[m.codigo] && m.situacao !== "presente").map((m) => m.codigo),
    ).toEqual([]);
  });

  it("roda as regras da etapa 5: as premissas críticas estão nos três lugares e o dispensado não é ausente", () => {
    const r = autoconferir(dossie, entrada, HOJE);
    const ausentesDispensados = r.achados.filter(
      (a) => a.tipo === "ausente" && dossie.pgp!.gerar[a.parte] === false,
    );
    expect(ausentesDispensados).toEqual([]);
    const premissas = r.achados.filter((a) => a.tipo === "ausente" && /PC[1368]\b/.test(a.descricao));
    expect(premissas.map((a) => a.descricao)).toEqual([]);
    expect(r.verificacoes.length).toBeGreaterThan(0);
  });
});

describe("RACI e data fixa no plano (teste externo do TR)", () => {
  const cr = () => SCHEMAS_PGP.cronograma.parse(ler("cronograma"));

  it("linha do contratante passa sem perfil na lista; perfil da equipe fora da lista e dois A são apontados", () => {
    const c = cr();
    const a1 = c.atividades[0]!.id;
    const raciLimpa = c.raci.filter((r) => r.atividade !== a1);
    const okContratante = {
      ...c,
      raci: [
        ...raciLimpa,
        { atividade: a1, perfil: c.perfis[0]!.id, papel: "R" as const, parte: "equipe" as const },
        { atividade: a1, perfil: "fiscalizacao", papel: "A" as const, parte: "contratante" as const },
      ],
    };
    expect(conferirRaci(okContratante).join(" ")).not.toMatch(/fiscalizacao|"A"/);
    expect(contratanteNaRaci(okContratante)).toContain(`fiscalizacao: A em ${a1}`);
    const errado = {
      ...okContratante,
      raci: [
        ...okContratante.raci,
        { atividade: a1, perfil: "inventado", papel: "A" as const, parte: "equipe" as const },
      ],
    };
    const p = conferirRaci(errado).join(" ");
    expect(p).toContain(`Atividade ${a1} com 2 "A"`);
    expect(p).toMatch(/Perfil da equipe na RACI sem estar na lista de perfis: inventado/);
  });

  it("B3: sem folga até a data fixa, o alerta cita PC3 e PC6; com folga, mostra quantos dias", () => {
    const base = {
      atividade: "c4",
      inicio: new Date(2026, 10, 7),
      fim: new Date(2027, 0, 6),
      diasCorridos: 61,
      fimPredecessoras: new Date(2026, 10, 11),
    };
    const crono = (f: object) =>
      ({ datasFixas: [{ ...base, ...f }] }) as unknown as Parameters<typeof alertasDeDataFixa>[0];
    const [nao] = alertasDeDataFixa(crono({ folgaCorrida: -5, cabe: false }));
    expect(nao).toMatch(
      /^Alerta \(conta do código\): a atividade c4 começa na data fixa de 07\/11\/2026.*5 dia\(s\) corrido\(s\) depois.*PC3.*PC6/,
    );
    const [sim] = alertasDeDataFixa(crono({ folgaCorrida: 3, cabe: true }));
    expect(sim).toMatch(/folga de 3 dia\(s\) corrido\(s\)/);
  });
});

describe("pedido de riscos com as contas do cronograma", () => {
  it("leva o prazo e os avisos do cronograma calculados pelo código", () => {
    const pedido = PEDIDOS_PGP.riscos(entrada, dossie.pgp!);
    expect(pedido).toContain("Contas do código sobre o cronograma (use; não refaça as contas):");
    expect(pedido).toContain(cronogramaDoPgp(dossie.pgp!, entrada)!.conferenciaPrazo.texto);
  });
});

describe("pacote, parte não gerada, contingência e registro inicial (teste externo do TR)", () => {
  it("todo pacote da OEI tem atividade; sem pacote, pacote inexistente, de outro produto e vazio são apontados", () => {
    expect(conferirPacotes(dossie.pgp!)).toEqual([]);
    const cr = dossie.pgp!.cronograma!;
    const atividades = cr.resposta.atividades.map((a) =>
      a.id === "1.1"
        ? { ...a, pacote: "" }
        : a.id === "1.2"
          ? { ...a, pacote: "9.9" }
          : a.id.startsWith("5.")
            ? { ...a, pacote: "P1.1" }
            : a,
    );
    const p = conferirPacotes({
      ...dossie.pgp!,
      cronograma: { ...cr, resposta: { ...cr.resposta, atividades } },
    });
    const t = p.join(" ");
    expect(t).toMatch(/Atividades sem pacote da EAP: 1\.1\./);
    expect(t).toMatch(/pacote que não existe na EAP: 1\.2 \(9\.9\)/);
    expect(t).toMatch(/num pacote de outro produto: 5\.1 \(P5, pacote P1\.1 de P1\)/);
    expect(t).toMatch(/Pacotes da EAP sem atividade no cronograma: P5\.1 Guia de orientação/);
  });

  it("o pacote é obrigatório na resposta do PMO, mas o dossiê antigo abre com ele vazio", () => {
    const semPacote = { ...(ler("cronograma") as Record<string, unknown>) };
    semPacote.atividades = (semPacote.atividades as Record<string, unknown>[]).map((a) =>
      Object.fromEntries(Object.entries(a).filter(([k]) => k !== "pacote")),
    );
    expect(SCHEMAS_PGP.cronograma.safeParse(semPacote).success).toBe(false);
    expect(RespostaCronogramaGuardada.parse(semPacote).atividades[0]?.pacote).toBe("");
  });

  it("parte cujo passo não foi pedido fica 'não conferido', sem achado", () => {
    const semPlanos: Dossie = { ...dossie, pgp: { ...dossie.pgp!, planos: undefined } };
    const r = autoconferir(semPlanos, montarEntradaPgp(semPlanos, HOJE), HOJE);
    expect(partesNaoGeradas(semPlanos.pgp!).has("A11")).toBe(true);
    expect(r.achados.filter((a) => a.partes.every((x) => x === "A11"))).toEqual([]);
    expect(r.verificacoes.filter((v) => /:A11(\.\d+)?$/.test(v.id)).every((v) => v.estado !== "achado")).toBe(
      true,
    );
  });

  it("risco que pede reserva entra no custo como 'a definir pelo GP', nunca zero", () => {
    const c = custosDoPgp(dossie.pgp!, entrada)!;
    const comReserva = dossie.pgp!.riscos!.resposta.riscos.filter((r) => r.pedeReserva).map((r) => r.id);
    expect(c.riscosComReserva.map((r) => r.id)).toEqual(comReserva);
    if (comReserva.length) expect(c.faltando.join(" ")).toMatch(/pedida pelos riscos/);
    expect(c.linhaDeBase).toBeUndefined();
  });

  it("com o registro inicial, o que vem da RFP, da proposta ou do TAP sai do B3; a premissa de estimativa fica", () => {
    const registro = entrada.premissasTap;
    const pc = registro.find((x) => x.premissaCritica)?.premissaCritica;
    expect(pc).toBeTruthy();
    const base = registro.find((x) => x.premissaCritica === pc)!;
    // mesma premissa crítica
    expect(repeteORegistroInicial({ ...base, origem: "proposta" }, registro)).toBe(true);
    // sem premissa crítica, mas a mesma origem e o mesmo tipo que o registro já tem
    expect(repeteORegistroInicial({ ...base, premissaCritica: "" }, registro)).toBe(true);
    // estimativa é nova (B3.4), com ou sem premissa crítica
    expect(repeteORegistroInicial({ ...base, origem: "estimativa" }, registro)).toBe(false);
    // sem registro inicial, nada sai
    expect(repeteORegistroInicial({ ...base, origem: "proposta" }, [])).toBe(false);
  });

  it("autoconferência da etapa 3 por passo: o registro de premissas cobra só TAP-PR e B3", () => {
    const premissas = itensEsperadosDaEtapa3("premissas");
    expect(premissas.filter((c) => c.startsWith("TAP-PR.")).length).toBeGreaterThan(0);
    expect(premissas.every((c) => /^(?:TAP-PR|B3)\.\d+$/.test(c))).toBe(true);
    const tap = itensEsperadosDaEtapa3("tap");
    expect(tap.some((c) => /^TAP-PR\.|^B3\./.test(c))).toBe(false);
    expect(tap).toContain("TAP1.1");
    const marcas = premissas.map((item) => ({ item, estado: "presente" as const, onde: "pr1", motivo: "" }));
    expect(conferirAutoconferenciaDaEtapa3("premissas", marcas).ok).toBe(true);
  });
});

describe("compromissos no plano e partes dispensadas no pedido", () => {
  it("o C tem destino no plano quando o item o cita, no campo de números ou no texto", () => {
    const base = dossie.pgp!.escopo!.resposta.textos[0]!.itens[0]!;
    const cs: Compromisso[] = [
      { numero: "C10", tipo: "obrigacao", idItem: "a", texto: "Prestar informações" },
      { numero: "C11", tipo: "obrigacao", idItem: "b", texto: "Emitir as ordens de serviço" },
      { numero: "C01", tipo: "premissa", idItem: "c", texto: "Dados no prazo" },
    ];
    const itens = [
      {
        parte: "B14",
        item: { ...base, id: "b14-5", texto: "Pendências: informações (C10), ordens (C11).", requisitos: [] },
      },
      { parte: "A11", item: { ...base, id: "a11-2", texto: "Reajuste de prazo.", requisitos: ["C01"] } },
      { parte: "A7", item: { ...base, id: "a7-1", texto: "Canal com C100 e C1.", requisitos: [] } },
    ];
    const d = destinosNoPlano(cs, itens);
    expect(d.get("C10")).toEqual(["B14, item b14-5"]);
    expect(d.get("C11")).toEqual(["B14, item b14-5"]);
    expect(d.get("C01")).toEqual(["A11, item a11-2"]);
  });

  it("a matriz do plano tem os C, com o destino no TAP e no plano", () => {
    const linhas = rastrearCompromissos(
      entrada,
      itensDoPgp(dossie.pgp!, entrada.documentos, entrada.premissasTap),
    );
    expect(linhas.length).toBe(entrada.dadosProposta?.compromissos.length ?? 0);
    expect(linhas.every((l) => Array.isArray(l.plano) && l.tap.compromisso === l.compromisso)).toBe(true);
  });

  it("o pedido lista as partes do passo que o GP dispensou, com o motivo", () => {
    const p = { ...dossie.pgp!, gerar: { ...dossie.pgp!.gerar, A12: false } };
    const pedido = PEDIDOS_PGP.planos(entrada, p);
    expect(pedido).toMatch(/Dispensadas pelo GP neste passo[\s\S]*- A12 — /);
  });
});

describe("números C no texto do plano", () => {
  it("lê C soltos e intervalos (C08 a C15); C100 é outro número e C1 não é número C", () => {
    expect([...numerosCitados("dados (C08), C10; pendências C12 a C14; outro C100 e C1")].sort()).toEqual([
      "C08",
      "C10",
      "C100",
      "C12",
      "C13",
      "C14",
    ]);
  });
});

describe("pedidos da etapa 4 só com as partes marcadas", () => {
  it("execução sem a A16: não pede o texto dela nem indicador de valor agregado", () => {
    const p = { ...dossie.pgp!, gerar: { ...dossie.pgp!.gerar, A16: false } };
    const pedido = PEDIDOS_PGP.execucao(entrada, p);
    expect(pedido).not.toMatch(/1\. textos: A16/);
    expect(pedido).toMatch(/sem valor agregado, porque o GP dispensou a linha de base da medição \(A16\)/);
    const comA16 = PEDIDOS_PGP.execucao(entrada, {
      ...dossie.pgp!,
      gerar: { ...dossie.pgp!.gerar, A16: true },
    });
    expect(comA16).toMatch(/1\. textos: A16/);
  });

  it("planos e riscos não citam parte dispensada nos exemplos", () => {
    const p = { ...dossie.pgp!, gerar: { ...dossie.pgp!.gerar, A12: false, A4: false } };
    expect(PEDIDOS_PGP.planos(entrada, p)).not.toContain("configuração com as versões dos produtos");
    expect(PEDIDOS_PGP.riscos(entrada, p)).not.toMatch(/e A4 \(como os custos/);
  });

  it("o escopo leva as exclusões e os limites de volume (C) para a B17", () => {
    const pedido = PEDIDOS_PGP.escopo(entrada, {
      ...dossie.pgp!,
      gerar: { ...dossie.pgp!.gerar, B17: true },
    });
    const cs = (entrada.dadosProposta?.compromissos ?? []).filter((c) => c.tipo === "exclusao");
    if (cs.length) expect(pedido).toContain(`- ${cs[0]!.numero} (exclusão → B17.5)`);
    expect(
      PEDIDOS_PGP.escopo(entrada, { ...dossie.pgp!, gerar: { ...dossie.pgp!.gerar, B17: false } }),
    ).not.toContain("exclusão → B17.5");
  });
});

describe("autoconferência: item marcado pelo PMO com o id", () => {
  it("ausente da busca de termos vira 'pela marca do PMO' quando ele aponta um item que existe na parte", () => {
    const item = itensDoPgp(dossie.pgp!, entrada.documentos).find((i) => /^[AB]\d+ — /.test(i.grupo))!;
    const parte = item.grupo.split(" — ")[0]!;
    const codigo = `${parte}.99`;
    const base = {
      achados: [
        {
          id: `conteudo-minimo:${parte}:${codigo}`,
          tipo: "ausente" as const,
          regra: "conteudo-minimo",
          parte,
          partes: [parte],
          gravidade: "média" as const,
          categoria: "",
          origemCategoria: "parte" as const,
          titulo: "",
          descricao: "",
          evidencias: [],
          sugestao: "",
        },
      ],
      verificacoes: [
        { id: `item:${codigo}`, alvo: codigo, descricao: "", estado: "achado" as const, detalhe: "" },
      ],
    };
    const comMarca = (onde: string) => {
      const p = dossie.pgp!;
      const r0 = p.planos!;
      return {
        ...p,
        planos: {
          ...r0,
          resposta: {
            ...r0.resposta,
            autoconferencia: [{ item: codigo, estado: "presente" as const, onde, motivo: "" }],
          },
        },
      };
    };
    const ligado = ligarPeloId(base, comMarca(item.item.id), entrada);
    expect(ligado.achados).toEqual([]);
    expect(ligado.verificacoes[0]?.estado).toBe("pela-marca-do-pmo");
    expect(ligado.verificacoes.find((v) => v.id === "presentes-pela-marca-do-pmo")?.detalhe).toMatch(
      /^1 item\(ns\): /,
    );
    expect(ligado.verificacoes[0]?.detalhe).toMatch(/id conferido pelo código/);
    expect(ligarPeloId(base, comMarca("id-que-nao-existe"), entrada).achados).toHaveLength(1);
  });
});

describe("registro das questões (B9) montado pelo código", () => {
  const comQuestoes = () =>
    ({
      ...entrada,
      ponto: {
        ...entrada.ponto,
        brechas: [
          { ...entrada.ponto.brechas[0]!, id: "etapa-1:a6", perguntaFinal: "Qual das duas datas vale?" },
          { ...entrada.ponto.brechas[0]!, id: "etapa-1:a7", perguntaFinal: "" },
        ],
      },
      divergenciasTapPendentes: [{ id: "dv2", texto: "Quem faz o campo." }],
    }) as EntradaPgp;

  it("uma QU para cada ponto com pergunta e cada divergência sem decisão, com a origem", () => {
    const e = comQuestoes();
    expect(questoesDoCodigo(e)).toEqual([
      { numero: "QU-01", origem: "etapa-1:a6", texto: "Qual das duas datas vale?" },
      { numero: "QU-02", origem: "dv2", texto: "Quem faz o campo." },
    ]);
    const pedido = PEDIDOS_PGP.execucao(e, { ...dossie.pgp!, gerar: { ...dossie.pgp!.gerar, B9: true } });
    expect(pedido).toContain("- QU-01 (origem etapa-1:a6): Qual das duas datas vale?");
    expect(pedido).toContain('começando por "QU-nn —"');
    // a regra vem no topo, antes da lista das partes (lição 188 da rodada 3)
    const topo = pedido.indexOf("um item por QU-nn, com o mesmo número, sem renumerar");
    expect(topo).toBeGreaterThan(0);
    expect(topo).toBeLessThan(pedido.indexOf("Partes a escrever neste passo"));
    expect(pedido).toMatch(/2 questões \(QU-01 a QU-02\)/);
  });

  it("a conferência aponta origem sem questão e questão sem origem nem fonte", () => {
    const e = comQuestoes();
    const base = itensDoPgp(dossie.pgp!, entrada.documentos)[0]!;
    const itens = [
      {
        ...base,
        grupo: "B9 — Registro das questões",
        item: { ...base.item, id: "b9-2", texto: "QU-01 — Datas.", fontes: [] },
      },
      {
        ...base,
        grupo: "B9 — Registro das questões",
        item: { ...base.item, id: "b9-9", texto: "QU-09 — Nova.", fontes: [] },
      },
    ];
    const c = conferirQuestoes(questoesDoCodigo(e), itens);
    expect(c.linhas[0]?.item).toBe("b9-2");
    expect(c.semItem).toEqual(["QU-02"]);
    expect(c.semOrigem).toEqual(["QU-09"]);
  });

  it("liga pelo item que começa por QU-nn; citação em outro item não conta; questão nova com fonte; status", () => {
    const e = comQuestoes();
    const base = itensDoPgp(dossie.pgp!, entrada.documentos)[0]!;
    const b9 = (id: string, texto: string, fontes = base.item.fontes) => ({
      ...base,
      grupo: "B9 — Registro das questões",
      item: { ...base.item, id, texto, fontes },
    });
    const itens = [
      b9("b9-1", "Estrutura: QU-01 a QU-02 vêm da etapa 1; QU-03 é nova.", []),
      b9("b9-q01", "QU-01 — Datas. Status: tratada na proposta (C15); ligada à QU-02."),
      b9("b9-q02", "QU-02 — Campo. Status: resolvida pelo TR (C16); falta registrar em ata."),
      b9("b9-q03", "QU-03 — Nomes dos fiscais. Status: aberta.", [
        { doc: "tap", pagina: 10, trecho: "Gestor do contrato" },
      ]),
    ];
    const qs = questoesDoCodigo(e);
    const c = conferirQuestoes(qs, itens, new Set(["C15", ...qs.map((q) => q.numero)]));
    expect(c.linhas.map((l) => l.item)).toEqual(["b9-q01", "b9-q02"]);
    expect(c.linhas[0]?.citadaEm).toEqual(["b9-1"]);
    expect(c.linhas[1]?.citadaEm).toEqual(["b9-1", "b9-q01"]);
    expect(c.semOrigem).toEqual([]);
    expect(c.novas.map((n) => n.numero)).toEqual(["QU-03"]);
    expect(c.linhas[0]?.status).toMatchObject({
      estado: "tratada",
      referencias: ["C15", "QU-02"],
      avisos: [],
    });
    const s2 = c.linhas[1]?.status;
    expect(s2?.estado).toBe("resolvida");
    expect(s2?.naoLocalizadas).toEqual(["C16"]);
    expect(s2?.avisos.join(" ")).toMatch(/sem referência.*não localizada: C16.*registro pendente/);
  });
});

describe("TAP do dossiê como documento (etapas 4 e 5)", () => {
  it("sem TAP em PDF, vira documento; com o PDF, vale o PDF", () => {
    const doc = tapDoDossieComoDocumento(dossie);
    expect(doc?.papel).toBe("tap");
    expect(doc?.paginas.length).toBeGreaterThan(3);
    const comPdf: Dossie = { ...dossie, documentos: [...dossie.documentos, { ...doc!, id: "tap-pdf" }] };
    expect(tapDoDossieComoDocumento(comPdf)).toBeUndefined();
  });
});
