// Autoconferência (decisão 0044): o teste que reprova. Item de ficha de parte essencial sem marca é falha; "ausente"
// não é estado aceito; a parte com item sem marca volta ao PMO sozinha, não o bloco inteiro.
import { describe, expect, it } from "vitest";
import { PARTES_PGP } from "../../src/dominio/skill";
import type { PgpDossie } from "../../src/dossie/esquema";
import { autoconferenciaDaLeitura, SECOES_AUTOCONFERENCIA_ETAPA_1 } from "../../src/etapas/1-rfp/leitura-pmo";
import { conferirAutoconferenciaDoPgp, itensEsperadosDoPgp } from "../../src/etapas/4-pgp/autoconferencia";
import { pgpInicial } from "../../src/etapas/4-pgp/pgp";
import { conferirAutoconferencia, partesARegenerar } from "../../src/pmo/autoconferencia";
import { ItemAutoconferencia, type ItemAutoconferencia as Marca } from "../../src/pmo/schemas/comum";
import { RespostaLeituraRfp } from "../../src/pmo/schemas/leitura-rfp";
import { RespostaPlanos, RespostaRiscos } from "../../src/pmo/schemas/pgp";

const presente = (item: string): Marca => ({ item, estado: "presente", onde: `id-${item}`, motivo: "" });
const itensDe = (codigo: string) =>
  PARTES_PGP.find((p) => p.codigo === codigo)?.itens.map((i) => i.codigo) ?? [];

describe("autoconferência do PMO (decisão 0044)", () => {
  it("passa quando todo item esperado tem marca completa", () => {
    const r = conferirAutoconferencia(["A8.1", "A8.2"], [presente("A8.1"), presente("A8.2")]);
    expect(r.ok).toBe(true);
  });

  it("reprova item sem marca e marca incompleta", () => {
    const r = conferirAutoconferencia(
      ["A8.1", "A8.2", "A8.3"],
      [presente("A8.1"), { item: "A8.2", estado: "dispensado", onde: "", motivo: "" }],
    );
    expect(r.ok).toBe(false);
    expect(r.semMarca).toEqual(["A8.3"]);
    expect(r.incompletas).toEqual(["A8.2"]);
  });

  it('"ausente" não é estado aceito', () => {
    expect(
      ItemAutoconferencia.safeParse({ item: "A8.7", estado: "ausente", onde: "", motivo: "" }).success,
    ).toBe(false);
  });

  it("espera todos os itens das partes mantidas, inclusive os que a ficha dispensa em porte pequeno", () => {
    const esperados = itensEsperadosDoPgp({ A8: true, B27: true, A3: false });
    // A8.5 é dispensável em porte pequeno: continua esperado, para o PMO marcar "dispensado" com o motivo
    expect(esperados).toEqual(expect.arrayContaining(["A8.5", "A8.7", "A8.8", "B27.3", "B27.11"]));
    expect(esperados.some((i) => i.startsWith("A3."))).toBe(false);
  });

  it("reprova o PGP com item de parte essencial sem marca e regenera só aquela parte", () => {
    const a8 = itensDe("A8");
    const b27 = itensDe("B27");
    const p: PgpDossie = {
      ...pgpInicial(),
      gerar: { A8: true, B27: true },
      riscos: {
        modelo: "teste",
        em: "2026-11-16",
        resposta: RespostaRiscos.parse({
          textos: [],
          riscos: [],
          premissas: [],
          observacoes: [],
          // falta A8.7 (escalas de probabilidade e impacto): o caso do plano curto do teste externo
          autoconferencia: [...a8.filter((i) => i !== "A8.7"), ...b27].map(presente),
        }),
      },
    };
    const r = conferirAutoconferenciaDoPgp(p);
    expect(r.ok).toBe(false);
    expect(r.semMarca).toEqual(["A8.7"]);
    expect(r.regenerar).toEqual(["A8"]);
  });

  it("aceita o PGP quando cada item está presente, dispensado com motivo ou é decisão do GP", () => {
    const a7 = itensDe("A7");
    const p: PgpDossie = {
      ...pgpInicial(),
      gerar: { A7: true },
      planos: {
        modelo: "teste",
        em: "2026-11-16",
        resposta: RespostaPlanos.parse({
          textos: [],
          observacoes: [],
          autoconferencia: a7.map((item, k): Marca =>
            k === 0
              ? { item, estado: "decisao_gp", onde: "", motivo: "cadência das reuniões: decisão do GP" }
              : k === a7.length - 1
                ? { item, estado: "dispensado", onde: "", motivo: "porte pequeno (ficha)" }
                : presente(item),
          ),
        }),
      },
    };
    expect(conferirAutoconferenciaDoPgp(p).ok).toBe(true);
  });

  it("respostas gravadas antigas, sem o campo, continuam válidas (o campo vem vazio)", () => {
    expect(RespostaPlanos.parse({ textos: [], observacoes: [] }).autoconferencia).toEqual([]);
  });

  it("partes a regenerar saem do código do item", () => {
    expect(
      partesARegenerar({ semMarca: ["A8.7", "B27.3"], incompletas: ["A8.2"], sobrando: [], ok: false }),
    ).toEqual(["A8", "B27"]);
  });

  it("etapa 1: as 8 seções e os cruzamentos X1 a X6 são obrigatórios", () => {
    const r = autoconferenciaDaLeitura(
      RespostaLeituraRfp.parse({
        itens: [],
        cruzamentos: [{ codigo: "X1", estado: "feito", resultado: "confere", itens: [] }],
        autoconferencia: SECOES_AUTOCONFERENCIA_ETAPA_1.slice(0, 7).map(presente),
      }),
    );
    expect(r.semMarca).toEqual(["etapa-1:secao-8"]);
    expect(r.cruzamentosSemRegistro).toEqual(["X2", "X3", "X4", "X5", "X6"]);
  });
});
