import { describe, expect, it } from "vitest";
import { CARACTERISTICAS_PADRAO, type Caracteristicas } from "../../src/dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import type { PaginaLida } from "../../src/dossie/esquema";
import { extrairPrazosTotais, prazoPrincipal } from "../../src/extracao/prazos";
import { extrairRequisitos, type Requisito } from "../../src/extracao/requisitos";
import { conferirPlano, resumirAchados, type EntradaConferencia } from "../../src/regras/conferencia";
import {
  confirmacaoInicial,
  encontrarTitulos,
  parteDaPosicao,
  proporMapa,
  type ParteConfirmada,
} from "../../src/regras/mapa-pgp";

function paginas(textos: string[]): PaginaLida[] {
  return textos.map((texto, i) => ({ numero: i + 1, origem: "texto", texto, caracteres: texto.length }));
}

/** Mapa com só as partes indicadas presentes (com páginas); o resto dispensado pelo GP. */
function mapa(presentes: Record<string, [number, number] | null>): ParteConfirmada[] {
  return PARTES_PGP.map((p) => {
    if (!(p.codigo in presentes)) return { codigo: p.codigo, situacao: "dispensada" as const };
    const faixa = presentes[p.codigo];
    return faixa
      ? { codigo: p.codigo, situacao: "presente" as const, paginaInicial: faixa[0], paginaFinal: faixa[1] }
      : { codigo: p.codigo, situacao: "nao-existe" as const };
  });
}

const NENHUMA_PREMISSA = Object.fromEntries(PREMISSAS_CRITICAS.map((p) => [p.codigo, false]));

function entrada(parcial: Partial<EntradaConferencia> & { pgp: PaginaLida[] }): EntradaConferencia {
  return {
    partes: PARTES_PGP,
    premissas: PREMISSAS_CRITICAS,
    mapa: mapa({}),
    caracteristicas: CARACTERISTICAS_PADRAO,
    premissasAplicaveis: NENHUMA_PREMISSA,
    requisitos: [],
    ...parcial,
  };
}

describe("vago", () => {
  it("acha 'oportunamente' e dá a gravidade da parte onde está", () => {
    const pgp = paginas([
      "3. Plano de gerenciamento do cronograma\nO cronograma será revisto oportunamente.",
    ]);
    const r = conferirPlano(entrada({ pgp, mapa: mapa({ A3: [1, 1] }) }));
    const vago = r.achados.filter((a) => a.tipo === "vago");
    expect(vago).toHaveLength(1);
    expect(vago[0]).toMatchObject({
      parte: "A3",
      gravidade: "grave",
      categoria: "tempo",
      regra: "vago:oportunamente",
    });
    expect(vago[0]?.evidencias[0]).toMatchObject({ documento: "pgp", pagina: 1 });
  });

  it("não acusa texto com prazo verificável", () => {
    const pgp = paginas(["3. Plano de gerenciamento do cronograma\nO cronograma é revisto a cada 15 dias."]);
    expect(
      conferirPlano(entrada({ pgp, mapa: mapa({ A3: [1, 1] }) })).achados.filter((a) => a.tipo === "vago"),
    ).toEqual([]);
  });

  it("trecho fora das partes do mapa fica com gravidade baixa", () => {
    const pgp = paginas(["Apresentação\nAs reuniões ocorrerão quando necessário."]);
    expect(conferirPlano(entrada({ pgp })).achados[0]).toMatchObject({ parte: "—", gravidade: "baixa" });
  });
});

describe("conflituoso", () => {
  it("acha texto de outro documento colado no plano", () => {
    const pgp = paginas([
      "Especificação do escopo\nConforme previsto neste Termo de Referência, o produto será entregue.",
    ]);
    const r = conferirPlano(entrada({ pgp, mapa: mapa({ B17: [1, 1] }) }));
    expect(r.achados.filter((a) => a.tipo === "conflituoso")).toEqual([
      expect.objectContaining({
        tipo: "conflituoso",
        regra: "texto-de-outro-documento",
        parte: "B17",
        gravidade: "média",
      }),
    ]);
  });

  it("acha prazo total diferente do edital e do TAP, com categoria tempo", () => {
    const pgp = paginas(["Cronograma do projeto\nO prazo de execução é de 06 (seis) meses."]);
    const rfp = paginas(["1.4 O prazo de vigência da contratação é de até 04 (quatro) meses."]);
    const tap = paginas(["Prazo de execução de 4 meses, contados da assinatura."]);
    const r = conferirPlano(entrada({ pgp, rfp, tap, mapa: mapa({ B15: [1, 1] }) }));
    const conflito = r.achados.find((a) => a.regra === "prazo-total");
    expect(conflito).toMatchObject({
      parte: "B15",
      gravidade: "média",
      categoria: "tempo",
      origemCategoria: "comparado",
    });
    expect(conflito?.evidencias.map((e) => e.documento)).toEqual(["pgp", "rfp", "tap"]);
  });

  it("não acusa prazo igual", () => {
    const pgp = paginas(["Cronograma do projeto\nPrazo de execução de 04 (quatro) meses."]);
    const rfp = paginas(["O prazo de vigência é de 4 meses."]);
    const r = conferirPlano(entrada({ pgp, rfp, mapa: mapa({ B15: [1, 1] }) }));
    expect(r.achados.filter((a) => a.tipo === "conflituoso")).toEqual([]);
  });
});

describe("ausente", () => {
  it("parte que o GP confirmou como inexistente é ausente, na gravidade dela", () => {
    const pgp = paginas(["Plano do projeto"]);
    const r = conferirPlano(entrada({ pgp, mapa: mapa({ A12: null }) }));
    expect(r.achados).toEqual([
      expect.objectContaining({ tipo: "ausente", regra: "parte-ausente", parte: "A12", gravidade: "grave" }),
    ]);
  });

  it("parte dispensada pelo GP não é ausente", () => {
    const r = conferirPlano(entrada({ pgp: paginas(["Plano"]), mapa: mapa({}) }));
    expect(r.achados).toEqual([]);
    expect(r.verificacoes.find((v) => v.alvo === "A12")?.estado).toBe("dispensado-gp");
  });

  it("não achado não é ausente: com página ilegível, o item fica não verificável", () => {
    const pgp: PaginaLida[] = [
      { numero: 1, origem: "texto", texto: "Plano do projeto", caracteres: 16 },
      { numero: 2, origem: "nao-verificavel", texto: "", caracteres: 0, motivo: "sem texto" },
    ];
    const r = conferirPlano(entrada({ pgp, mapa: mapa({ A12: null }) }));
    expect(r.achados).toEqual([]);
    expect(r.verificacoes.find((v) => v.alvo === "A12")).toMatchObject({ estado: "nao-verificavel" });
  });

  it("item do conteúdo mínimo: acha na parte, aceita fora dela e acusa quando não está em lugar nenhum", () => {
    const pgp = paginas([
      "11. Plano de gerenciamento das mudanças\nToda solicitação de mudança é registrada por escrito.",
    ]);
    const r = conferirPlano(entrada({ pgp, mapa: mapa({ A11: [1, 1] }) }));
    const ausentes = r.achados.filter((a) => a.regra === "conteudo-minimo").map((a) => a.id);
    expect(ausentes.length).toBeGreaterThan(0);
    expect(ausentes.every((id) => id.startsWith("conteudo-minimo:A11:A11."))).toBe(true);
    expect(r.verificacoes.find((v) => v.alvo === "A11.3")?.estado).toBe("ok");
  });

  it("item dispensável pelas características não vira ausente", () => {
    const pequeno: Caracteristicas = { ...CARACTERISTICAS_PADRAO, porte: "pequeno" };
    const r = conferirPlano(
      entrada({ pgp: paginas(["Plano de riscos"]), mapa: mapa({ A8: [1, 1] }), caracteristicas: pequeno }),
    );
    expect(r.verificacoes.find((v) => v.alvo === "A8.3")?.estado).toBe("dispensavel");
    expect(r.achados.some((a) => a.id.endsWith("A8.3"))).toBe(false);
  });

  it("premissa crítica que se aplica e não está no plano é ausente grave (A8 decide)", () => {
    const r = conferirPlano(
      entrada({
        pgp: paginas(["Plano sem premissas."]),
        premissasAplicaveis: { ...NENHUMA_PREMISSA, PC4: true },
      }),
    );
    expect(r.achados).toEqual([
      expect.objectContaining({
        regra: "premissa-critica",
        parte: "A8",
        gravidade: "grave",
        partes: ["A8", "B3", "B27", "A11"],
      }),
    ]);
  });

  it("premissa crítica presente no B3 e no A11, mas sem risco no B27, é ausente na parte B27", () => {
    const pgp = paginas([
      "Registro de premissas\nPC4: o projeto começa na data de início prevista, contados da ordem de serviço.",
      "Registro dos riscos\nRK01: equipe indisponível.",
      "Plano de gerenciamento das mudanças\nSe a PC4 não se confirmar, o cronograma é reajustado.",
    ]);
    const r = conferirPlano(
      entrada({
        pgp,
        mapa: mapa({ B3: [1, 1], B27: [2, 2], A11: [3, 3] }),
        premissasAplicaveis: { ...NENHUMA_PREMISSA, PC4: true },
      }),
    );
    const premissa = r.achados.filter((a) => a.regra.startsWith("premissa"));
    expect(premissa).toEqual([
      expect.objectContaining({ regra: "premissa-critica-lugar", parte: "B27", gravidade: "baixa" }),
    ]);
  });

  it("requisito da RFP fora da especificação do escopo é ausente na parte do escopo", () => {
    const req: Requisito = {
      numero: "R01",
      rotulo: "Produto 1",
      descricao: "Capacitação da Rede Intersetorial",
      pagina: 25,
      trecho: "01 Capacitação da Rede Intersetorial 24 Horas",
      origem: "codigo",
    };
    const pgp = paginas([
      "Especificação do escopo\nProduto 2: protocolo.",
      "Lista de marcos\nM1: Capacitação da Rede Intersetorial.",
    ]);
    const r = conferirPlano(entrada({ pgp, mapa: mapa({ B17: [1, 1], B11: [2, 2] }), requisitos: [req] }));
    const a = r.achados.find((x) => x.regra === "requisito");
    expect(a).toMatchObject({ parte: "B17", gravidade: "média", categoria: "escopo" });
    expect(a?.descricao).toMatch(/aparece no plano \(p\. 2\)/);
  });
});

describe("relatório", () => {
  it("nunca escreve 'não informado no documento' sobre o que o código não achou", () => {
    const r = conferirPlano(entrada({ pgp: paginas(["Plano"]), mapa: mapa({ A1: null, A8: [1, 1] }) }));
    expect(JSON.stringify(r)).not.toMatch(/não informado no documento/i);
    expect(
      r.achados.every((a) => /não localizad[oa] pelo código/.test(a.titulo) || a.tipo !== "ausente"),
    ).toBe(true);
  });

  it("resume por gravidade e tipo", () => {
    const pgp = paginas(["3. Plano de gerenciamento do cronograma\nRevisão oportunamente e a definir."]);
    const r = conferirPlano(entrada({ pgp, mapa: mapa({ A3: [1, 1] }) }));
    expect(resumirAchados(r.achados).grave.vago).toBe(2);
  });
});

describe("mapa do PGP", () => {
  it("acha títulos fora do sumário e propõe as páginas de cada parte", () => {
    const pgp = paginas([
      "Sumário\n1. Plano de gerenciamento do escopo ........ 2\n2. Plano de gerenciamento do cronograma ...... 3\n3. Registro dos riscos .... 4\n4. Lista de marcos ..... 4\n5. Glossário ..... 5",
      "1. Plano de gerenciamento do escopo\nTexto do escopo.",
      "2. Plano de gerenciamento do cronograma\nTexto.",
      "3. Registro dos riscos\nRK01.\n4. Lista de marcos\nM1.",
    ]);
    const titulos = encontrarTitulos(pgp, PARTES_PGP);
    expect(titulos.map((t) => [t.codigo, t.pagina])).toEqual([
      ["A1", 2],
      ["A3", 3],
      ["B27", 4],
      ["B11", 4],
    ]);
    const proposta = proporMapa(pgp, PARTES_PGP);
    expect(proposta.find((p) => p.codigo === "A1")).toMatchObject({
      situacao: "titulo",
      paginaInicial: 2,
      paginaFinal: 3,
    });
    expect(proposta.find((p) => p.codigo === "A12")?.situacao).toBe("nao-localizada");
    const conf = confirmacaoInicial(proposta);
    const pos = pgp[3]?.texto.indexOf("M1") ?? 0;
    expect(parteDaPosicao(4, pos, conf)).toBe("B11");
    expect(parteDaPosicao(4, 5, conf)).toBe("B27");
  });
});

describe("extração da RFP", () => {
  it("extrai produtos rotulados, com número R e página", () => {
    const rfp = paginas([
      "Produto 1 – Plano de trabalho da consultoria 30 5%\nProduto II: Relatório diagnóstico",
      "Produto 1 – Plano de trabalho da consultoria",
    ]);
    expect(extrairRequisitos(rfp).map((r) => [r.numero, r.rotulo, r.descricao, r.pagina])).toEqual([
      ["R01", "Produto 1", "Plano de trabalho da consultoria", 1],
      ["R02", "Produto 2", "Relatório diagnóstico", 1],
    ]);
  });

  it("acha o prazo total declarado", () => {
    const p = prazoPrincipal(
      extrairPrazosTotais(paginas(["O prazo de vigência da contratação é de até 04 (quatro) meses."])),
    );
    expect(p).toMatchObject({ valor: 4, unidade: "meses", pagina: 1 });
  });
});
