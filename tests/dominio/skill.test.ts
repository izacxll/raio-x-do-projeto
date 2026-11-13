import { describe, expect, it } from "vitest";
import { avaliarDispensa, CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { lerFicha, lerSinais } from "../../src/dominio/fichas";
import { FICHAS, PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";

const GRAVES = Array.from({ length: 12 }, (_, i) => `A${i + 1}`);
const MEDIAS = ["A13", "A14", "A15", "A16", "B6", "B11", "B15", "B17"];

// Decisão 0008, regra 2
const CATEGORIAS: Record<string, string[]> = {
  escopo: ["A1", "A2", "A13", "B17", "B22", "B23"],
  tempo: ["A3", "A14", "B1", "B2", "B8", "B11", "B13", "B15", "B16", "B29", "B30"],
  custo: ["A4", "A15", "B6", "B7"],
  "partes interessadas": ["A7", "A10", "B14", "B31"],
  equipe: ["A6", "B18", "B24", "B25", "B26", "B32"],
  "abordagem de desenvolvimento e ciclo de vida": ["A17", "A18"],
  planejamento: ["B4"],
  "trabalho do projeto": ["A9", "A11", "A12", "B5", "B9", "B10", "B12"],
  entrega: ["A5", "B21", "B33"],
  medição: ["A16", "B19", "B20"],
  incerteza: ["A8", "B3", "B27", "B28"],
};

describe("partes do PGP lidas das fichas da skill", () => {
  it("são os 18 componentes e os 33 documentos, cada um uma vez", () => {
    expect(PARTES_PGP.map((p) => p.codigo)).toEqual([
      ...Array.from({ length: 18 }, (_, i) => `A${i + 1}`),
      ...Array.from({ length: 33 }, (_, i) => `B${i + 1}`),
    ]);
  });

  it("têm a gravidade da regra fixa da etapa 5", () => {
    for (const p of PARTES_PGP) {
      const esperada = GRAVES.includes(p.codigo) ? "grave" : MEDIAS.includes(p.codigo) ? "média" : "baixa";
      expect(p.gravidade, p.codigo).toBe(esperada);
    }
  });

  it("têm exatamente a categoria da decisão 0008", () => {
    for (const p of PARTES_PGP) {
      const categorias = Object.entries(CATEGORIAS)
        .filter(([, partes]) => partes.includes(p.codigo))
        .map(([c]) => c);
      expect(categorias, p.codigo).toEqual([p.categoria]);
    }
  });

  it("têm nome, sinônimos e conteúdo mínimo com fonte", () => {
    for (const p of PARTES_PGP) {
      expect(p.nome, p.codigo).toBeTruthy();
      expect(p.sinonimos.length, p.codigo).toBeGreaterThan(0);
      expect(p.itens.length, p.codigo).toBeGreaterThan(0);
      for (const i of p.itens) {
        expect(i.codigo.startsWith(`${p.codigo}.`), i.codigo).toBe(true);
        expect(i.fonte, i.codigo).toBeTruthy();
      }
    }
  });

  it("toda condição de dispensa usa só o vocabulário das características", () => {
    for (const f of FICHAS) {
      for (const i of f.itens) {
        const r = avaliarDispensa(i.dispensa, CARACTERISTICAS_PADRAO);
        expect("erro" in r ? `${i.codigo}: ${r.erro}` : "ok").toBe("ok");
      }
    }
  });

  it("todo item conferido por código tem ao menos um termo para procurar ou é só estrutural", () => {
    const semNada = FICHAS.flatMap((f) => f.itens).filter(
      (i) => i.confere === "código" && !i.termos.length && !i.estruturas.length,
    );
    expect(semNada.map((i) => i.codigo)).toEqual([]);
  });

  it("o plano de riscos trata as premissas críticas (A8.12, grave)", () => {
    const a8 = PARTES_PGP.find((p) => p.codigo === "A8");
    expect(a8?.gravidade).toBe("grave");
    expect(a8?.itens.find((i) => i.codigo === "A8.12")?.confere).toBe("código");
  });
});

describe("premissas críticas (decisão 0021)", () => {
  it("são PC1 a PC8, com sinais de aplicação e sinais no plano", () => {
    expect(PREMISSAS_CRITICAS.map((p) => p.codigo)).toEqual([
      "PC1",
      "PC2",
      "PC3",
      "PC4",
      "PC5",
      "PC6",
      "PC7",
      "PC8",
    ]);
    for (const p of PREMISSAS_CRITICAS) {
      expect(p.sinaisAplicacao.termos.length, p.codigo).toBeGreaterThan(2);
      expect(p.sinaisNoPlano.termos.length, p.codigo).toBeGreaterThan(2);
      expect(p.ondeNoPlano, p.codigo).toMatch(/B3\.9.*B27\.13.*A11\.12/);
    }
  });

  it("a PC2 é nova, sem código V29", () => {
    expect(PREMISSAS_CRITICAS[1]?.origemV29).toBe("nova");
  });
});

describe("leitor de ficha", () => {
  it("lê 'junto de' como composto e 'indicam' como estrutura", () => {
    expect(lerSinais('"premissa" junto de "dados" ou "base" | "PC1"')).toEqual({
      termos: ["PC1"],
      compostos: [
        ["premissa", "dados"],
        ["premissa", "base"],
      ],
      estruturas: [],
    });
    expect(lerSinais('"entre outros", "a definir" indicam critério vago').termos).toEqual([]);
  });

  it("separa termos e estruturas dos sinais", () => {
    expect(lerSinais('"marco" | "M1" | tabela de marcos')).toEqual({
      termos: ["marco", "M1"],
      compostos: [],
      estruturas: ["tabela de marcos"],
    });
  });

  it("lê cabeçalho e itens", () => {
    const f = lerFicha(
      [
        "---",
        "codigo: A99",
        "nome: Teste",
        "gravidade: grave",
        'sinonimos: ["um", "dois"]',
        "---",
        "## Conteúdo mínimo",
        "- **A99.1** Primeiro item",
        "  - fonte: livro, p. 1",
        '  - sinais: "x" | "y"',
        "  - confere: só PMO",
        "  - dispensa: porte pequeno",
        "## Perguntas",
        "- **não é item** texto",
      ].join("\n"),
    );
    expect(f).toMatchObject({ codigo: "A99", gravidade: "grave", sinonimos: ["um", "dois"] });
    expect(f.itens).toEqual([
      {
        codigo: "A99.1",
        texto: "Primeiro item",
        fonte: "livro, p. 1",
        termos: ["x", "y"],
        compostos: [],
        estruturas: [],
        confere: "só PMO",
        dispensa: "porte pequeno",
      },
    ]);
  });
});

describe("dispensa", () => {
  const pequeno = { ...CARACTERISTICAS_PADRAO, porte: "pequeno" as const, campo: false };
  it("avalia 'e' e 'ou'", () => {
    expect(avaliarDispensa("nunca", pequeno)).toEqual({ dispensavel: false, motivo: "" });
    expect(avaliarDispensa("porte pequeno e sem campo", pequeno)).toMatchObject({ dispensavel: true });
    expect(avaliarDispensa("porte pequeno e sem dados pessoais", pequeno)).toMatchObject({
      dispensavel: false,
    });
    expect(avaliarDispensa("uma fase ou sem campo", pequeno)).toMatchObject({
      dispensavel: true,
      motivo: "sem campo",
    });
  });
  it("acusa expressão fora do vocabulário", () => {
    expect(avaliarDispensa("porte minúsculo", pequeno)).toHaveProperty("erro");
  });
});
