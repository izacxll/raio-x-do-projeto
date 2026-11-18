// Capa de decisão (decisão 0085): montada só por código, no máximo 5 decisões e 5 alertas (os altos primeiro), os
// números-chave, o que mudou e os quadros; fora das peças que vão ao cliente ou são assinadas (proposta, TAP, PGP).
// Com a RFP pública da OEI e as respostas gravadas do PMO.
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { propostaGravada, tapGravado } from "../ajudantes/gravadas";
import { lerRfpPublica } from "../ajudantes/rfp-publica";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { Dossie as EsquemaDossie, type Dossie, type PgpDossie } from "../../src/dossie/esquema";
import { gerarSugerido, pgpInicial } from "../../src/etapas/4-pgp/pgp";
import {
  curto,
  escolherAlertas,
  MAXIMO_DE_ALERTAS,
  MAXIMO_DE_DECISOES,
  secoesDaCapa,
  type CapaDeDecisao,
} from "../../src/exportacao/capa-de-decisao";
import {
  capaDaEtapa,
  capaDaProposta,
  capaDoPgp,
  capaDoTap,
  vereditoDoPlano,
} from "../../src/exportacao/capas";
import { montarPgp } from "../../src/exportacao/relatorio-pgp";
import { montarTap } from "../../src/exportacao/relatorio-tap";
import { SCHEMAS_PGP, type PassoPgp } from "../../src/pmo/schemas/pgp";

const HOJE = new Date(2026, 10, 13);
const ler = (n: string) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/gerados/pgp-oei/${n}.json`, import.meta.url), "utf-8"),
  ) as unknown;

let dossie: Dossie;

beforeAll(async () => {
  const rfp = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
  const guardadas = Object.fromEntries(
    (Object.keys(SCHEMAS_PGP) as PassoPgp[]).map((passo) => [
      passo,
      { resposta: SCHEMAS_PGP[passo].parse(ler(passo)), modelo: "teste", em: "" },
    ]),
  ) as Pick<PgpDossie, PassoPgp>;
  dossie = EsquemaDossie.parse({
    ...criarDossieVazio(HOJE),
    projeto: { nome: "Teste da capa" },
    documentos: [rfp],
    proposta: await propostaGravada(),
    tap: await tapGravado(),
    pgp: {
      ...pgpInicial(),
      ...guardadas,
      gerar: gerarSugerido(guardadas.adaptacao!.resposta),
      parametros: { valoresHora: {}, nomes: {} },
    },
  });
}, 120000);

function confereForma(c: CapaDeDecisao | undefined, etapa: number) {
  expect(c, `etapa ${etapa}`).toBeDefined();
  const capa = c!;
  expect(capa.etapa).toBe(etapa);
  expect(capa.oQueE).toMatch(new RegExp(`^Etapa ${etapa},`));
  expect(capa.numeros.length).toBeGreaterThan(0);
  expect(capa.mudou.length).toBeGreaterThan(0);
  expect(capa.quadros.length).toBeGreaterThan(0);
  const secoes = secoesDaCapa(capa);
  // capa primeiro, depois os quadros; no máximo 5 decisões e 5 alertas
  expect(secoes.map((s) => s.parte)).toEqual([
    ...secoes.filter((s) => s.parte === "capa").map(() => "capa"),
    ...secoes.filter((s) => s.parte === "quadros").map(() => "quadros"),
  ]);
  const decidir = secoes[0]!.paragrafos!.filter((p) => /^\d+\. /.test(p));
  expect(decidir.length).toBeLessThanOrEqual(MAXIMO_DE_DECISOES);
  expect(secoes.flatMap((s) => s.alertas ?? []).length).toBeLessThanOrEqual(MAXIMO_DE_ALERTAS);
  // nada de objeto impresso como texto
  expect(JSON.stringify(secoes)).not.toMatch(/\[object Object\]|undefined|NaN/);
}

describe("capa de cada etapa, com a RFP pública da OEI", () => {
  it("etapa 2: produtos × equipe × horas e o preço do GP", () => {
    const c = capaDaProposta(dossie, HOJE);
    confereForma(c, 2);
    expect(c!.quadros[0]!.titulo).toBe("Produtos × equipe × horas");
    // sem valor-hora, o preço é decisão do GP e não um número inventado
    expect(c!.numeros.find((n) => n.rotulo === "Preço calculado")?.valor).toBe("a definir pelo GP");
  });

  it("etapa 3: o TAP em uma página e as decisões do GP", () => {
    const c = capaDoTap(dossie, HOJE);
    confereForma(c, 3);
    expect(c!.quadros[0]!.titulo).toBe("TAP em uma página");
    expect(c!.decidir.some((d) => /Aprovar o TAP/.test(d))).toBe(true);
  });

  it("etapa 4: marcos, os 5 riscos principais e a RACI resumida", () => {
    const c = capaDoPgp(dossie, HOJE);
    confereForma(c, 4);
    const titulos = c!.quadros.map((q) => q.titulo);
    expect(titulos).toEqual(expect.arrayContaining(["Linha do tempo dos marcos", "Os 5 riscos principais"]));
    expect(
      c!.quadros.find((q) => q.titulo === "Os 5 riscos principais")!.tabela!.linhas.length,
    ).toBeLessThanOrEqual(5);
  });

  it("a proposta, o TAP e o PGP não levam a capa do GP (são as peças em si)", () => {
    for (const doc of [montarPgp(dossie, HOJE), montarTap(dossie, HOJE)])
      expect(doc.secoes.some((s) => s.parte === "capa" || s.parte === "quadros")).toBe(false);
  });

  it("sem a etapa feita, não há capa", () => {
    const vazio = criarDossieVazio(HOJE);
    for (const etapa of [1, 2, 3, 4, 5]) expect(capaDaEtapa(vazio, etapa, HOJE)).toBeUndefined();
  });
});

describe("regras da capa", () => {
  it("veredito do plano por regra fixa: grave = não apto; média = com ressalvas; só baixa = apto", () => {
    expect(vereditoDoPlano(["baixa", "grave"])).toBe("não apto");
    expect(vereditoDoPlano(["baixa", "média"])).toBe("apto com ressalvas");
    expect(vereditoDoPlano(["baixa"])).toBe("apto");
    expect(vereditoDoPlano([])).toBe("apto");
  });

  it("alertas: os altos primeiro, sem repetir, no máximo 5", () => {
    const a = escolherAlertas([
      { nivel: "medio", texto: "m1" },
      { nivel: "alto", texto: "a1" },
      { nivel: "alto", texto: "a1" },
      ...["a2", "a3", "a4", "a5", "a6"].map((t) => ({ nivel: "alto" as const, texto: t })),
    ]);
    expect(a.map((x) => x.texto)).toEqual(["a1", "a2", "a3", "a4", "a5"]);
  });

  it("texto curto: a primeira frase, sem cortar no ponto e vírgula nem no meio da palavra", () => {
    expect(curto("Sem prazo não há cronograma; nem caixa. Outra frase.")).toBe(
      "Sem prazo não há cronograma; nem caixa.",
    );
    expect(curto("palavra ".repeat(40), 30).endsWith("…")).toBe(true);
    expect(curto("palavra ".repeat(40), 30)).not.toMatch(/palavr…/);
  });
});
