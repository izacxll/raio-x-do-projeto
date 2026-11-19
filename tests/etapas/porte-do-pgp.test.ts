// PGP enxuto por porte (decisão 0091): o núcleo do porte pequeno, a parte fundida na hospedeira (com a ficha no pedido
// e os itens na autoconferência), a dispensada com o motivo, o limite de partes e de páginas. Com a adaptação gravada
// da OEI (RFP pública).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARACTERISTICAS_PADRAO, type Caracteristicas } from "../../src/dominio/caracteristicas";
import { PARTES_PGP } from "../../src/dominio/skill";
import { pgpInicial } from "../../src/etapas/4-pgp/pgp";
import { itensEsperadosDoPgp } from "../../src/etapas/4-pgp/autoconferencia";
import {
  destinoDaParte,
  fundidasDeTexto,
  fundidasEm,
  gerarPeloPorte,
  LIMITES_DO_PORTE,
  NUCLEO_PEQUENO,
} from "../../src/etapas/4-pgp/porte";
import { justificativaDaEtapa4 } from "../../src/etapas/5-conferencia/dispensas";
import { paginasEstimadas } from "../../src/exportacao/paginas";
import type { PgpDossie } from "../../src/dossie/esquema";
import { RespostaAdaptacao } from "../../src/pmo/schemas/pgp";

const adaptacao = RespostaAdaptacao.parse(
  JSON.parse(readFileSync(new URL("../fixtures/gerados/pgp-oei/adaptacao.json", import.meta.url), "utf-8")),
);
const comPorte = (porte: Caracteristicas["porte"], extra: Partial<Caracteristicas> = {}): PgpDossie => {
  const caracteristicas = { ...CARACTERISTICAS_PADRAO, porte, ...extra };
  return {
    ...pgpInicial(),
    caracteristicas,
    adaptacao: { resposta: adaptacao, modelo: "teste", em: "" },
    gerar: gerarPeloPorte(adaptacao, caracteristicas),
  };
};
const geradas = (p: PgpDossie) => Object.values(p.gerar).filter(Boolean).length;

describe("plano enxuto por porte (decisão 0091)", () => {
  it("porte pequeno: o núcleo de 14 partes, 15 com a subcontratação permitida", () => {
    const p = comPorte("pequeno", { subcontratacao: "vedada" });
    expect(
      Object.keys(p.gerar)
        .filter((c) => p.gerar[c])
        .sort(),
    ).toEqual([...NUCLEO_PEQUENO].sort());
    const [min, max] = LIMITES_DO_PORTE.pequeno.partes;
    expect(geradas(p)).toBeGreaterThanOrEqual(min);
    expect(geradas(p)).toBeLessThanOrEqual(max);
    expect(geradas(comPorte("pequeno", { subcontratacao: "permitida" }))).toBe(15);
  });

  it("porte pequeno: cada parte fora do núcleo diz para onde foi", () => {
    const p = comPorte("pequeno");
    expect(destinoDaParte("B17", p)).toEqual({ tipo: "fundida", em: "A13" });
    expect(destinoDaParte("B11", p)).toEqual({ tipo: "fundida", em: "A3" });
    const b16 = destinoDaParte("B16", p);
    expect(b16.tipo).toBe("dispensada");
    expect(b16.tipo === "dispensada" && b16.motivo).toMatch(/porte pequeno/);
    // nenhuma parte fica sem destino
    for (const f of PARTES_PGP) expect(destinoDaParte(f.codigo, p).tipo).toMatch(/gerada|fundida|dispensada/);
    expect(fundidasEm("A13", p)).toEqual(expect.arrayContaining(["A1", "B17", "B22", "B23"]));
    // a que o PMO disse ser dispensável não é fundida: fica dispensada, com o motivo dele
    if (adaptacao.partes.find((x) => x.codigo === "A2")?.recomendacao === "dispensavel")
      expect(destinoDaParte("A2", p).tipo).toBe("dispensada");
    expect(justificativaDaEtapa4("B17", p)).toMatch(/^Fundida na etapa 4 em A13/);
  });

  it("porte pequeno: os itens das fundidas de texto continuam esperados na autoconferência", () => {
    const p = comPorte("pequeno");
    const esperados = itensEsperadosDoPgp(p.gerar, fundidasDeTexto(p));
    expect(esperados.some((i) => i.startsWith("B17."))).toBe(true);
    // a tabela do código (B11) fundida não entra: quem a faz é o código
    expect(esperados.some((i) => i.startsWith("B11."))).toBe(false);
  });

  it("porte médio: o recomendado com hospedeira gerada vai fundido; o grande fica como era", () => {
    const medio = comPorte("médio");
    const grande = comPorte("grande");
    expect(geradas(medio)).toBeLessThan(geradas(grande));
    expect(geradas(grande)).toBe(adaptacao.partes.filter((x) => x.recomendacao !== "dispensavel").length);
    for (const x of adaptacao.partes.filter((y) => y.recomendacao === "essencial"))
      expect(medio.gerar[x.codigo]).toBe(true);
  });

  it("páginas estimadas: texto e tabela pelos caracteres", () => {
    const texto = "x".repeat(35000);
    expect(paginasEstimadas({ secoes: [{ titulo: "a", paragrafos: [texto] }] })).toBe(10);
    expect(paginasEstimadas({ secoes: [] })).toBe(1);
  });
});
