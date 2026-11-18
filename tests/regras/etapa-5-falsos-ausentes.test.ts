// Falsos alarmes da etapa 5 no plano que o próprio app gerou (decisão 0076): no teste externo, 32 candidatos do
// código e nenhum se sustentou. Exemplos inventados; os dois planos reais ficam fora do Git como regressão.
import { describe, expect, it } from "vitest";
import { avaliarDispensa, CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import type { PaginaLida } from "../../src/dossie/esquema";
import {
  aDefinirComQuandoOuOnde,
  conferirPlano,
  ligadoAQuestaoAberta,
  localizarPelaMarca,
  type EntradaConferencia,
} from "../../src/regras/conferencia";
import type { ParteConfirmada } from "../../src/regras/mapa-pgp";

function paginas(textos: string[]): PaginaLida[] {
  return textos.map((texto, i) => ({ numero: i + 1, origem: "texto", texto, caracteres: texto.length }));
}

const NENHUMA = Object.fromEntries(PREMISSAS_CRITICAS.map((p) => [p.codigo, false]));

/** Só a parte pedida presente, na página 1; as outras dispensadas. */
function entrada(parte: string, texto: string, extra: Partial<EntradaConferencia> = {}): EntradaConferencia {
  const mapa: ParteConfirmada[] = PARTES_PGP.map((p) =>
    p.codigo === parte
      ? { codigo: p.codigo, situacao: "presente" as const, paginaInicial: 1, paginaFinal: 1 }
      : { codigo: p.codigo, situacao: "dispensada" as const },
  );
  return {
    pgp: paginas([texto]),
    partes: PARTES_PGP,
    premissas: PREMISSAS_CRITICAS,
    mapa,
    caracteristicas: CARACTERISTICAS_PADRAO,
    premissasAplicaveis: NENHUMA,
    requisitos: [],
    ...extra,
  };
}

const ausentes = (e: EntradaConferencia) =>
  conferirPlano(e)
    .achados.filter((a) => a.tipo === "ausente")
    .map((a) => a.id);

describe("item marcado presente pela autoconferência da etapa 4", () => {
  const texto =
    "Plano de gerenciamento dos requisitos\nOs requisitos mantêm a numeração da etapa 1; requisito novo só ganha número quando o GP aceitar.";

  it("o texto do item apontado está no plano: não é ausente", () => {
    const sem = ausentes(entrada("A2", texto));
    expect(sem).toContain("conteudo-minimo:A2:A2.2");
    const com = ausentes(
      entrada("A2", texto, {
        presentesPelaMarca: {
          "A2.2": [
            "Os requisitos mantêm a numeração da etapa 1; requisito novo só ganha número quando o GP aceitar.",
          ],
        },
      }),
    );
    expect(com).not.toContain("conteudo-minimo:A2:A2.2");
  });

  it("a marca diz presente, mas o texto não está no plano: continua ausente", () => {
    const com = ausentes(
      entrada("A2", texto, {
        presentesPelaMarca: {
          "A2.2": ["Um texto que o plano exportado não traz, com outras palavras quaisquer."],
        },
      }),
    );
    expect(com).toContain("conteudo-minimo:A2:A2.2");
    expect(localizarPelaMarca(["curto demais"], paginas([texto]))).toBeUndefined();
  });
});

describe("formatos que o próprio app usa", () => {
  it("B27.1: o identificador do risco no formato do app (xx01 · categoria)", () => {
    const t =
      "Registro dos riscos\nrk01 · contratual / escopo · probabilidade alta, impacto alto. Causa, evento e efeito.";
    expect(ausentes(entrada("B27", t))).not.toContain("conteudo-minimo:B27:B27.1");
    expect(ausentes(entrada("B27", "Registro dos riscos\nOs riscos estão descritos abaixo."))).toContain(
      "conteudo-minimo:B27:B27.1",
    );
  });

  it("A11.1: quem decide as mudanças, com o comitê formal dispensado pelo porte", () => {
    const t =
      "Plano de gerenciamento das mudanças\nSem comitê formal (porte pequeno): o GP decide os ajustes internos; preço ou prazo, a coordenação.";
    expect(ausentes(entrada("A11", t))).not.toContain("conteudo-minimo:A11:A11.1");
    expect(
      ausentes(entrada("A11", "Plano de gerenciamento das mudanças\nAs mudanças são registradas.")),
    ).toContain("conteudo-minimo:A11:A11.1");
  });
});

describe("item condicional que não vale para o plano", () => {
  it("A14.10 (ondas sucessivas) é dispensável num plano preditivo", () => {
    const r = avaliarDispensa("porte pequeno ou uma fase ou abordagem preditiva", {
      ...CARACTERISTICAS_PADRAO,
      porte: "médio",
      abordagem: "preditiva",
    });
    expect("dispensavel" in r && r.dispensavel).toBe(true);
  });
});

describe('"a definir" com quando ou onde se define', () => {
  it("diz quando, onde ou a questão aberta: não é vago", () => {
    expect(aDefinirComQuandoOuOnde("cota por tipo — a definir antes do campo (QU-09)")).toBe(true);
    expect(aDefinirComQuandoOuOnde("abordagem padrão, a definir no P1 e no treinamento.")).toBe(true);
    expect(
      aDefinirComQuandoOuOnde("ficam a definir; a lição se confirma quando o esclarecimento for respondido"),
    ).toBe(true);
    expect(aDefinirComQuandoOuOnde("O formato do relatório é a definir.")).toBe(false);
  });

  it('"data a definir" ligada a uma questão aberta do B9 pelas palavras-chave', () => {
    const questoes = ["QU-09 — Qual a data da ordem de serviço que marca o início dos trabalhos?"];
    expect(ligadoAQuestaoAberta("Referência de início: a ordem de serviço (data a definir).", questoes)).toBe(
      true,
    );
    expect(ligadoAQuestaoAberta("O formato do relatório é a definir.", questoes)).toBe(false);
  });

  it("no plano: só o vago sem quando nem questão continua", () => {
    const t = [
      "Plano das comunicações",
      "Abordagem do pesquisador ao público, a definir no P1 e no treinamento.",
      "O formato do boletim é a definir.",
    ].join("\n");
    const vagos = conferirPlano(entrada("A7", t)).achados.filter((a) => a.tipo === "vago");
    expect(vagos).toHaveLength(1);
    expect(vagos[0]!.evidencias[0]!.trecho).toMatch(/boletim/);
  });
});
