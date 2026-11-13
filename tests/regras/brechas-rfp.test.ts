// Cada regra de brecha da etapa 1 com um caso que acha e outro que não acha (seção 13 da especificação).
import { describe, expect, it } from "vitest";
import { mapearRfp } from "../../src/extracao/rfp/mapa";
import { aplicarRegrasRfp } from "../../src/regras/brechas-rfp";
import { docRfp } from "../etapas/rfp-ajudantes";

function rodar(textos: string[], ilegiveis: number[] = []) {
  const docs = [docRfp(textos, ilegiveis)];
  return aplicarRegrasRfp(docs, mapearRfp(docs));
}
const estadoDe = (r: ReturnType<typeof rodar>, regra: string) =>
  r.regras.find((x) => x.regra === regra)?.estado;
const daRegra = (r: ReturnType<typeof rodar>, regra: string) =>
  r.itens.filter((i) => i.campos?.Regra === regra);

const CASOS: { regra: string; acha: string[]; naoAcha: string[] }[] = [
  {
    regra: "CTR4",
    acha: [
      "A Secretaria deverá fornecer os dados cadastrais das famílias atendidas. O diagnóstico será entregue em 30 dias após o recebimento dos dados cadastrais.",
    ],
    naoAcha: [
      "O pagamento será feito em 30 dias após o recebimento da nota fiscal. A Secretaria deverá fornecer a nota de empenho.",
    ],
  },
  {
    regra: "CTR5",
    acha: [
      "O pagamento da segunda parcela será feito após a aprovação do relatório parcial pela Secretaria.",
    ],
    naoAcha: [
      "O pagamento da segunda parcela será feito após a aprovação do relatório parcial. A Secretaria terá 10 dias para a análise do relatório.",
    ],
  },
  {
    regra: "CP13",
    acha: ["A realização das oficinas depende da disponibilização das salas pela Secretaria municipal."],
    naoAcha: ["A realização das oficinas não depende de outro órgão."],
  },
  {
    regra: "CE15",
    acha: [
      "O prazo de execução será de 6 meses, contados da assinatura do contrato.\nO seminário final será realizado em 15/07/2027.",
    ],
    naoAcha: ["O prazo de execução será de 6 meses. O seminário final será realizado em 15/07/2027."],
  },
  {
    regra: "CTR2-campo",
    acha: ["É vedada a subcontratação. A contratada fará pesquisa de campo em 10 bairros."],
    naoAcha: ["É vedada a subcontratação. A contratada fará análise documental."],
  },
  {
    regra: "CE17",
    acha: [
      "DATA DA SESSÃO PÚBLICA:\nDia 10/03/2028 às 10h00.",
      "PREFEITURA MUNICIPAL. O prazo de execução dos serviços será de 12 (doze) meses.",
    ],
    naoAcha: [
      "DATA DA SESSÃO PÚBLICA:\nDia 10/03/2027 às 10h00.",
      "PREFEITURA MUNICIPAL. O prazo de execução dos serviços será de 3 (três) meses.",
    ],
  },
  {
    regra: "prazo-divergente",
    acha: [
      "O prazo de vigência do contrato é de 12 (doze) meses.",
      "O prazo de vigência do contrato é de 6 (seis) meses.",
    ],
    naoAcha: [
      "O prazo de vigência do contrato é de 12 (doze) meses.",
      "O prazo de vigência do contrato é de 12 (doze) meses.",
    ],
  },
  {
    regra: "data-divergente",
    acha: [
      "DATA DA SESSÃO PÚBLICA:\nDia 23/10/2026 às 08:30.",
      "A sessão pública será em 26/10/2026, às 9h.",
    ],
    naoAcha: [
      "DATA DA SESSÃO PÚBLICA:\nDia 23/10/2026 às 08:30.",
      "A sessão pública será em 23/10/2026, às 8h30.",
    ],
  },
  {
    regra: "encargo-logistica",
    acha: ["As despesas com deslocamento e hospedagem da equipe correrão por conta da contratada."],
    naoAcha: ["As despesas com deslocamento de 4 viagens a Brasília correrão por conta da contratada."],
  },
  {
    regra: "vago",
    acha: ["1. DO OBJETO\nA contratada apresentará relatórios oportunamente."],
    naoAcha: ["1. DO OBJETO\nA contratada apresentará relatórios mensais até o quinto dia útil."],
  },
];

describe("regras de brecha da RFP", () => {
  for (const c of CASOS) {
    it(`${c.regra}: acha no caso que tem a brecha`, () => {
      const r = rodar(c.acha);
      expect(daRegra(r, c.regra).length, JSON.stringify(r.regras)).toBeGreaterThan(0);
      expect(estadoDe(r, c.regra)).toBe("achado");
      for (const i of daRegra(r, c.regra)) {
        expect(i.rotulo).toBe("sugestao");
        expect(i.origem?.pagina).toBeGreaterThan(0);
        expect(i.pergunta).toMatch(/^(Solicita-se|O documento traz)/);
      }
    });
    it(`${c.regra}: não acha no caso sem a brecha`, () => {
      const r = rodar(c.naoAcha);
      expect(daRegra(r, c.regra)).toEqual([]);
      expect(estadoDe(r, c.regra)).toBe("nao-identificado");
    });
  }

  it("com página sem texto legível, regra sem achado fica não verificável, nunca não identificada", () => {
    const r = rodar(["A contratada fará análise documental.", ""], [2]);
    expect(r.regras.every((x) => x.estado === "nao-verificavel")).toBe(true);
    expect(r.regras.find((x) => x.regra === "CTR4")?.motivo).toMatch(/p\. 2/);
  });

  it("'torna-se necessária' não é o vago 'se necessária'", () => {
    const r = rodar(["1. DO OBJETO\nTorna-se necessária a contratação de empresa especializada."]);
    expect(daRegra(r, "vago")).toEqual([]);
  });
});
