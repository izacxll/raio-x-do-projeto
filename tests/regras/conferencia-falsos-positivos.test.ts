// Falsos positivos da etapa 5 apontados no teste da responsável com um plano de trabalho (decisão 0033, itens 5
// e 8) e o tipo de plano. Todos os exemplos são inventados.
import { describe, expect, it } from "vitest";
import { CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS, buscarParte } from "../../src/dominio/skill";
import type { PaginaLida } from "../../src/dossie/esquema";
import {
  conferirPlano,
  grupoDoAchado,
  sinaisParaOutroPlano,
  vagoQueNaoPesa,
  type EntradaConferencia,
} from "../../src/regras/conferencia";
import {
  aplicarTipoPlano,
  coberturaDaParte,
  confirmacaoInicial,
  JUSTIFICATIVA_PLANO_DE_TRABALHO,
  PARTES_SO_DO_PGP,
  proporMapa,
  sincronizarMapa,
  type ParteConfirmada,
  type ParteNoMapa,
} from "../../src/regras/mapa-pgp";

function paginas(textos: string[]): PaginaLida[] {
  return textos.map((texto, i) => ({ numero: i + 1, origem: "texto", texto, caracteres: texto.length }));
}

const NENHUMA = Object.fromEntries(PREMISSAS_CRITICAS.map((p) => [p.codigo, false]));
const dispensadas = (): ParteConfirmada[] =>
  PARTES_PGP.map((p) => ({ codigo: p.codigo, situacao: "dispensada" as const }));

function entrada(parcial: Partial<EntradaConferencia> & { pgp: PaginaLida[] }): EntradaConferencia {
  return {
    partes: PARTES_PGP,
    premissas: PREMISSAS_CRITICAS,
    mapa: dispensadas(),
    caracteristicas: CARACTERISTICAS_PADRAO,
    premissasAplicaveis: NENHUMA,
    requisitos: [],
    ...parcial,
  };
}

describe("mapa: proposta localizada não começa como 'não está no plano'", () => {
  const proposta: ParteNoMapa[] = [
    { codigo: "A1", situacao: "titulo", titulo: "Escopo", paginaInicial: 2, paginaFinal: 3, cobertura: 1 },
    { codigo: "A2", situacao: "conteudo", cobertura: 0.6 },
    { codigo: "A3", situacao: "nao-localizada", cobertura: 0 },
  ];

  it("a parte que o GP não confirmou acompanha a proposta atual", () => {
    // mapa guardado de outro plano: tudo "não existe"
    const guardado: ParteConfirmada[] = ["A1", "A2", "A3"].map((codigo) => ({
      codigo,
      situacao: "nao-existe",
    }));
    const m = sincronizarMapa(guardado, proposta);
    expect(m.map((p) => p.situacao)).toEqual(["presente", "presente", "nao-existe"]);
    expect(m[0]?.paginaInicial).toBe(2);
  });

  it("a parte confirmada pelo GP ou dispensada fica como está", () => {
    const guardado: ParteConfirmada[] = [
      { codigo: "A1", situacao: "nao-existe", confirmadaPeloGp: true },
      { codigo: "A2", situacao: "dispensada", justificativa: "não se aplica" },
      { codigo: "A3", situacao: "nao-existe" },
    ];
    expect(sincronizarMapa(guardado, proposta).map((p) => p.situacao)).toEqual([
      "nao-existe",
      "dispensada",
      "nao-existe",
    ]);
  });
});

describe("tipo de plano", () => {
  it("no plano de trabalho, as partes só do PGP vêm dispensadas; de volta ao PGP, voltam à proposta", () => {
    const proposta = proporMapa(paginas(["1. Plano de gerenciamento de configuração\nVersões."]), PARTES_PGP);
    const inicial = confirmacaoInicial(proposta);
    const plano = aplicarTipoPlano(inicial, "plano-trabalho", proposta);
    for (const codigo of PARTES_SO_DO_PGP) {
      const p = plano.find((x) => x.codigo === codigo);
      expect(p?.situacao, codigo).toBe("dispensada");
      expect(p?.justificativa).toBe(JUSTIFICATIVA_PLANO_DE_TRABALHO);
    }
    // as demais partes não mudam
    expect(plano.find((x) => x.codigo === "A1")).toEqual(inicial.find((x) => x.codigo === "A1"));
    const devolta = aplicarTipoPlano(plano, "pgp", proposta);
    expect(devolta.find((x) => x.codigo === "A12")?.situacao).toBe("presente");
  });
});

describe("aquisições (A9) não é contratação de pessoal", () => {
  it("contratação pela CLT e seleção de agentes não contam para o plano de aquisições", () => {
    const a9 = buscarParte("A9");
    if (!a9) throw new Error("ficha A9");
    const so = paginas([
      "A contratação de pessoal será pela CLT, com seleção de agentes por análise de currículo e entrevista. A contratação da equipe técnica tem prazo de 30 dias; a assinatura dos contratos de trabalho cabe ao jurídico.",
    ]);
    const comCompras = paginas([
      "As aquisições de material gráfico serão feitas com fornecedor escolhido por cotação de três orçamentos, com preço global e aceite na entrega.",
    ]);
    expect(coberturaDaParte(so, a9)).toBeLessThan(coberturaDaParte(comCompras, a9));
    expect(proporMapa(so, PARTES_PGP).find((p) => p.codigo === "A9")?.situacao).toBe("nao-localizada");
  });
});

describe("sinais num plano de outra pessoa", () => {
  it("convenções do app não são procuradas", () => {
    const s = sinaisParaOutroPlano({
      texto: "Identificador de cada atividade",
      termos: ["ID", "código EAP", "R01"],
      compostos: [],
    });
    expect(s.termos).toEqual([]);
  });

  it("os sinônimos do plano de trabalho valem", () => {
    expect(
      sinaisParaOutroPlano({ texto: "Lista dos relatórios", termos: ["lista de relatórios"], compostos: [] })
        .termos,
    ).toContain("relatórios trimestrais");
    expect(
      sinaisParaOutroPlano({ texto: "Métricas da qualidade", termos: ["métrica"], compostos: [] }).termos,
    ).toContain("quadro de metas e indicadores");
  });

  it("item 'a comparação é do código' não vira ausente por busca de palavra", () => {
    const r = conferirPlano(
      entrada({
        pgp: paginas(["1. Lista de marcos\nM1 – entrega do diagnóstico."]),
        mapa: PARTES_PGP.map((p) =>
          p.codigo === "B11"
            ? { codigo: "B11", situacao: "presente" as const, paginaInicial: 1, paginaFinal: 1 }
            : { codigo: p.codigo, situacao: "dispensada" as const },
        ),
      }),
    );
    expect(r.achados.some((a) => a.titulo.startsWith("B11.5"))).toBe(false);
  });
});

describe("vagos que não pesam no plano", () => {
  it("texto padrão de LGPD, 'oportunamente' com item do edital e descrição de atividade", () => {
    expect(
      vagoQueNaoPesa("se-for-o-caso", {
        trecho: "Os dados pessoais serão tratados conforme a LGPD, se for o caso.",
      }),
    ).toBe(true);
    expect(
      vagoQueNaoPesa("oportunamente", {
        trecho: "Os relatórios serão entregues oportunamente, conforme o item 7.2 do edital.",
      }),
    ).toBe(true);
    expect(
      vagoQueNaoPesa("quando-necessario", {
        trecho: "Orientação e acesso a microcrédito, quando necessário.",
      }),
    ).toBe(true);
  });

  it("compromisso do plano continua vago", () => {
    expect(vagoQueNaoPesa("oportunamente", { trecho: "O cronograma será revisto oportunamente." })).toBe(
      false,
    );
    expect(
      vagoQueNaoPesa("quando-necessario", {
        trecho: "O registro de premissas será revisto quando necessário.",
      }),
    ).toBe(false);
  });

  it("'deste edital' num plano de trabalho que responde ao edital não é texto de outro documento", () => {
    const pgp = paginas(["1. Metodologia\nAs oficinas atendem ao objeto deste edital."]);
    const comoPlano = conferirPlano(entrada({ pgp, tipoPlano: "plano-trabalho" }));
    expect(comoPlano.achados.some((a) => a.regra === "texto-de-outro-documento")).toBe(false);
    const comoPgp = conferirPlano(entrada({ pgp }));
    expect(comoPgp.achados.some((a) => a.regra === "texto-de-outro-documento")).toBe(true);
  });
});

describe("relatório em ordem de importância", () => {
  it("premissas críticas, conflitos, ausentes e vagos", () => {
    const ordem = [
      { regra: "vago:oportunamente", tipo: "vago" as const },
      { regra: "conteudo-minimo", tipo: "ausente" as const },
      { regra: "prazo-total", tipo: "conflituoso" as const },
      { regra: "premissa-critica", tipo: "ausente" as const },
    ]
      .sort((a, b) => grupoDoAchado(a) - grupoDoAchado(b))
      .map((a) => a.regra);
    expect(ordem).toEqual(["premissa-critica", "prazo-total", "conteudo-minimo", "vago:oportunamente"]);
  });
});
