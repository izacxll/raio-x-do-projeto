import { describe, expect, it } from "vitest";
import {
  avaliarDispensa,
  CARACTERISTICAS_PADRAO,
  pareceEstudoSensivel,
} from "../../src/dominio/caracteristicas";
import { FICHAS } from "../../src/dominio/skill";

describe("estudo sensível (decisão 0043)", () => {
  it("sugere sensível com sinal de disputa junto de impacto ou recursos, na mesma página", () => {
    expect(
      pareceEstudoSensivel([
        "a criação de uma Comissão de Estudo pela Câmara Municipal, com a intenção de abertura de CPI para análise dos impactos e da gestão dos recursos aplicados",
      ]),
    ).toBe(true);
  });

  it("reconhece 'CPI' como palavra, e não dentro de outra", () => {
    expect(pareceEstudoSensivel(["abertura de CPI sobre os recursos aplicados no evento"])).toBe(true);
    expect(pareceEstudoSensivel(["indicador ACPIX de avaliação do programa"])).toBe(false);
  });

  it("não marca certidão do Tribunal de Contas nem 'Câmara' sozinha", () => {
    expect(
      pareceEstudoSensivel([
        "certidão negativa do Tribunal de Contas do Estado",
        "Câmara Municipal de [município], avaliação das propostas",
      ]),
    ).toBe(false);
  });

  it("não junta sinais de páginas diferentes", () => {
    expect(
      pareceEstudoSensivel(["denúncia anônima ao canal de ética", "avaliação de impacto do programa"]),
    ).toBe(false);
  });

  it("A10.6 só se dispensa em porte pequeno de estudo comum", () => {
    const a106 = FICHAS.flatMap((f) => f.itens).find((i) => i.codigo === "A10.6");
    const pequeno = { ...CARACTERISTICAS_PADRAO, porte: "pequeno" as const };
    expect(avaliarDispensa(a106?.dispensa ?? "", { ...pequeno, exposicao: "sensível" })).toMatchObject({
      dispensavel: false,
    });
    expect(avaliarDispensa(a106?.dispensa ?? "", { ...pequeno, exposicao: "comum" })).toMatchObject({
      dispensavel: true,
    });
  });

  it("turnos do calendário (B13.6) valem sempre que há campo, mesmo em porte pequeno (decisão 0045)", () => {
    const b136 = FICHAS.flatMap((f) => f.itens).find((i) => i.codigo === "B13.6");
    const pequenoComCampo = { ...CARACTERISTICAS_PADRAO, porte: "pequeno" as const, campo: true };
    expect(avaliarDispensa(b136?.dispensa ?? "", pequenoComCampo)).toMatchObject({ dispensavel: false });
  });
});
