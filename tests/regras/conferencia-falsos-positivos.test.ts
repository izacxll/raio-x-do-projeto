// Falsos positivos da etapa 5 apontados no teste da responsável com um plano de trabalho (decisão 0033, itens 5
// e 8), o tipo de plano e os problemas que a revisão independente da fase achou. Todos os exemplos são inventados.
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

describe("mapa: trocado o plano, o mapa volta à proposta do código", () => {
  const proposta: ParteNoMapa[] = [
    { codigo: "A1", situacao: "titulo", titulo: "Escopo", paginaInicial: 2, paginaFinal: 3, cobertura: 1 },
    { codigo: "A2", situacao: "conteudo", cobertura: 0.6 },
    { codigo: "A3", situacao: "nao-localizada", cobertura: 0 },
  ];

  it("as partes do arquivo anterior voltam à proposta; as dispensadas ficam", () => {
    const guardado: ParteConfirmada[] = [
      { codigo: "A1", situacao: "nao-existe", confirmadaPeloGp: true },
      { codigo: "A2", situacao: "dispensada", justificativa: "não se aplica" },
      { codigo: "A3", situacao: "presente", paginaInicial: 9 },
    ];
    const m = sincronizarMapa(guardado, proposta);
    expect(m.map((p) => p.situacao)).toEqual(["presente", "dispensada", "nao-existe"]);
    expect(m[0]?.paginaInicial).toBe(2);
  });
});

describe("tipo de plano", () => {
  const proposta = proporMapa(paginas(["1. Plano de gerenciamento de configuração\nVersões."]), PARTES_PGP);

  it("no plano de trabalho, as partes só do PGP vêm dispensadas; de volta ao PGP, voltam à proposta", () => {
    const inicial = confirmacaoInicial(proposta);
    const plano = aplicarTipoPlano(inicial, "plano-trabalho", proposta);
    for (const codigo of PARTES_SO_DO_PGP) {
      const p = plano.find((x) => x.codigo === codigo);
      expect(p?.situacao, codigo).toBe("dispensada");
      expect(p?.justificativa).toBe(JUSTIFICATIVA_PLANO_DE_TRABALHO);
    }
    expect(plano.find((x) => x.codigo === "A1")).toEqual(inicial.find((x) => x.codigo === "A1"));
    expect(aplicarTipoPlano(plano, "pgp", proposta).find((x) => x.codigo === "A12")?.situacao).toBe(
      "presente",
    );
  });

  it("não passa por cima do GP nem da dispensa da etapa 4", () => {
    const inicial = confirmacaoInicial(proposta).map((p) =>
      p.codigo === "A12"
        ? { ...p, confirmadaPeloGp: true }
        : p.codigo === "B10"
          ? {
              codigo: "B10",
              situacao: "dispensada" as const,
              justificativa: "Dispensada pelo GP na etapa 4: projeto curto.",
            }
          : p,
    );
    const plano = aplicarTipoPlano(inicial, "plano-trabalho", proposta);
    expect(plano.find((x) => x.codigo === "A12")?.situacao).toBe("presente");
    const de_volta = aplicarTipoPlano(plano, "pgp", proposta);
    expect(de_volta.find((x) => x.codigo === "B10")?.justificativa).toMatch(/etapa 4/);
  });
});

describe("aquisições (A9) não é contratação de pessoal", () => {
  const a9 = buscarParte("A9");
  if (!a9) throw new Error("ficha A9");

  it("contratação pela CLT não conta para o plano de aquisições", () => {
    const so = paginas([
      "A contratação de pessoal será pela CLT. A contratação da equipe técnica tem prazo de 30 dias; a assinatura dos contratos de trabalho cabe ao jurídico.",
    ]);
    const comCompras = paginas([
      "As aquisições de material gráfico serão feitas com fornecedor escolhido por cotação de três orçamentos, com preço global e aceite na entrega.",
    ]);
    expect(coberturaDaParte(so, a9)).toBeLessThan(coberturaDaParte(comCompras, a9));
    expect(proporMapa(so, PARTES_PGP).find((p) => p.codigo === "A9")?.situacao).toBe("nao-localizada");
  });

  it('"seleção de agentes" sozinha também não conta (sem CLT no trecho)', () => {
    const so = paginas([
      "A seleção de agentes comunitários terá cotação de currículos e contratação com assinatura do termo.",
    ]);
    expect(coberturaDaParte(so, a9)).toBe(0);
  });
});

describe("sinais num plano de outra pessoa", () => {
  it("convenções do app não são procuradas, salvo no plano gerado pela própria ferramenta", () => {
    const item = { codigo: "B2.2", termos: ["ID", "código EAP", "R01"], compostos: [] };
    expect(sinaisParaOutroPlano(item).termos).toEqual([]);
    expect(sinaisParaOutroPlano(item, true).termos).toEqual(["ID", "código EAP", "R01"]);
  });

  it("os sinônimos valem só nos itens da tabela", () => {
    expect(
      sinaisParaOutroPlano({ codigo: "A7.10", termos: ["lista de relatórios"], compostos: [] }).termos,
    ).toContain("relatórios trimestrais");
    expect(sinaisParaOutroPlano({ codigo: "B18.1", termos: ["membros"], compostos: [] }).termos).toContain(
      "equipe responsável",
    );
    // item que só cita a mesma palavra não ganha sinônimo
    expect(sinaisParaOutroPlano({ codigo: "B27.4", termos: ["responsável"], compostos: [] }).termos).toEqual([
      "responsável",
    ]);
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

describe("vagos que não pesam no plano (olhando só a frase)", () => {
  it("texto padrão de LGPD, 'oportunamente' com item do edital e atividade para o público", () => {
    expect(
      vagoQueNaoPesa("se-for-o-caso", {
        frase: "Os dados pessoais serão tratados conforme a LGPD, se for o caso.",
      }),
    ).toBe(true);
    expect(
      vagoQueNaoPesa("oportunamente", {
        frase: "Os relatórios serão entregues oportunamente, conforme o item 7.2 do edital.",
      }),
    ).toBe(true);
    expect(
      vagoQueNaoPesa("quando-necessario", {
        frase: "Orientação e acesso a microcrédito, quando necessário.",
      }),
    ).toBe(true);
  });

  it("compromisso de quem executa continua vago", () => {
    expect(vagoQueNaoPesa("oportunamente", { frase: "O cronograma será revisto oportunamente." })).toBe(
      false,
    );
    expect(
      vagoQueNaoPesa("quando-necessario", {
        frase: "Os profissionais serão substituídos quando necessário.",
      }),
    ).toBe(false);
    expect(
      vagoQueNaoPesa("se-for-o-caso", { frase: "A coordenação ajustará as metas, se for o caso." }),
    ).toBe(false);
  });

  it("'sigilo' ou 'item' na frase vizinha não apagam o vago", () => {
    const r = conferirPlano(
      entrada({
        pgp: paginas([
          "1. Plano de gerenciamento dos riscos\nAs informações têm sigilo. O plano de riscos será atualizado oportunamente. A meta 2 segue o item 4.1.",
        ]),
        mapa: PARTES_PGP.map((p) =>
          p.codigo === "A8"
            ? { codigo: "A8", situacao: "presente" as const, paginaInicial: 1, paginaFinal: 1 }
            : { codigo: p.codigo, situacao: "dispensada" as const },
        ),
      }),
    );
    expect(r.achados.some((a) => a.regra === "vago:oportunamente")).toBe(true);
  });

  it("'deste edital' só é citação no plano de trabalho", () => {
    const pgp = paginas(["1. Metodologia\nAs oficinas atendem ao objeto deste edital."]);
    expect(
      conferirPlano(entrada({ pgp, tipoPlano: "plano-trabalho" })).achados.some(
        (a) => a.regra === "texto-de-outro-documento",
      ),
    ).toBe(false);
    expect(
      conferirPlano(entrada({ pgp, rfp: paginas(["Edital"]) })).achados.some(
        (a) => a.regra === "texto-de-outro-documento",
      ),
    ).toBe(true);
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

describe("vago: convenção do app e expressão citada entre aspas (teste externo do TR)", () => {
  it('"a definir pelo GP" e item [Decisão do GP] não são vago: vão para a verificação de decisões pendentes', () => {
    const r = conferirPlano(
      entrada({
        pgp: paginas([
          "Plano. A cadência das reuniões fica a definir pelo GP.\n[Decisão do GP] Número de vias: a definir.\nO prazo de análise: não informado no documento — a definir pelo GP.",
        ]),
      }),
    );
    expect(r.achados.filter((a) => a.regra === "vago:a-definir")).toEqual([]);
    const v = r.verificacoes.find((x) => x.id === "decisoes-do-gp-pendentes");
    expect(v?.detalhe).toMatch(/^3 decisão\(ões\) do GP pendente\(s\)/);
  });

  it('"a definir" solto continua vago; a expressão do documento entre aspas não', () => {
    const r = conferirPlano(
      entrada({
        pgp: paginas([
          "A faixa aceita fica a definir. Questão: prazo de cada ordem de serviço ('em tempo hábil'). O relatório sai em tempo hábil.",
        ]),
      }),
    );
    expect(r.achados.filter((a) => a.regra === "vago:a-definir")).toHaveLength(1);
    expect(r.achados.filter((a) => a.regra === "vago:em-tempo-habil")).toHaveLength(1);
  });
});

describe("vago dentro de trecho citado", () => {
  it("a expressão dentro de uma citação longa do documento não é vago do plano", () => {
    const r = conferirPlano(
      entrada({
        pgp: paginas([
          'QU-02: informar o prazo do trecho "se a ordem de serviço não for atendida em tempo hábil, cabe multa".\nA equipe responde em tempo hábil.',
        ]),
      }),
    );
    expect(r.achados.filter((a) => a.regra === "vago:em-tempo-habil")).toHaveLength(1);
  });
});
