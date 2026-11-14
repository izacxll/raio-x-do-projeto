// Saídas da etapa 4 montadas com as respostas gravadas do PMO na RFP da OEI: o plano, os registros (XLSX), os
// diagramas (SVG) e o índice do pacote.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { beforeAll, describe, expect, it } from "vitest";
import { propostaGravada, tapGravado } from "../../src/demonstracao/preparar";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { Dossie as EsquemaDossie, type Dossie, type PgpDossie } from "../../src/dossie/esquema";
import { gerarSugerido, pgpInicial } from "../../src/etapas/4-pgp/pgp";
import { svgsDoPgp } from "../../src/exportacao/diagramas-pgp";
import { gerarDocx } from "../../src/exportacao/docx";
import { TEXTO_MINUTA } from "../../src/exportacao/modelo";
import { indiceDoPacote, montarPgp, montarRegistrosPgp } from "../../src/exportacao/relatorio-pgp";
import { SCHEMAS_PGP, type PassoPgp } from "../../src/pmo/schemas/pgp";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const ler = (n: string) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/gerados/pgp-oei/${n}.json`, import.meta.url), "utf-8"),
  ) as unknown;
const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;
const HOJE = new Date(2026, 10, 13);

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
    projeto: { nome: "Teste PGP" },
    documentos: [rfp],
    proposta: await propostaGravada(),
    tap: await tapGravado(),
    pgp: {
      ...pgpInicial(),
      ...guardadas,
      gerar: gerarSugerido(guardadas.adaptacao!.resposta),
      parametros: { valoresHora: {}, nomes: { coord: "Nome escolhido pelo GP" } },
    },
  });
}, 120000);

describe("saídas da etapa 4", () => {
  it("plano: uma seção por parte marcada, numerada, com as dispensadas à parte, e minuta", async () => {
    const doc = montarPgp(dossie, HOJE);
    expect(doc.minuta).toBe(true);
    const titulos = doc.secoes.map((s) => s.titulo);
    expect(titulos).toContain("1. Plano de gerenciamento do escopo");
    expect(titulos.some((t) => /Registro dos riscos$/i.test(t))).toBe(true);
    expect(titulos).toContain("Partes dispensadas pelo GP");
    expect(titulos.some((t) => /aquisições/.test(t))).toBe(false);
    const xml = strFromU8(
      unzipSync(new Uint8Array(await (await gerarDocx(doc, logoBuffer)).arrayBuffer()))[
        "word/document.xml"
      ] as Uint8Array,
    );
    expect(xml).toContain("Nome escolhido pelo GP");
    expect(xml).toContain("Parte A11 do plano.");
    expect(xml).toContain("[Do documento, p. 23]");
    const cabecalho = Object.entries(
      unzipSync(new Uint8Array(await (await gerarDocx(doc, logoBuffer)).arrayBuffer())),
    )
      .filter(([n]) => /header/.test(n))
      .map(([, c]) => strFromU8(c))
      .join("");
    expect(cabecalho).toContain(TEXTO_MINUTA);
  });

  it("registros: adaptação, marcos, cronograma, riscos, premissas e rastreabilidade em abas", () => {
    const doc = montarRegistrosPgp(dossie, HOJE);
    const abas = doc.secoes.map((s) => s.titulo);
    expect(abas[0]).toBe("Adaptação");
    for (const c of ["B11", "B15", "B27", "B3", "B23", "A15"])
      expect(abas.some((a) => a.startsWith(`${c} `))).toBe(true);
    const adaptacao = doc.secoes[0]!.tabela!;
    expect(adaptacao.linhas).toHaveLength(51);
    const riscos = doc.secoes.find((s) => s.titulo.startsWith("B27 "))!.tabela!;
    expect(riscos.linhas.some((l) => l[7] === "PC3")).toBe(true);
  });

  it("diagramas em SVG: EAP com os pacotes e rede com o caminho crítico", () => {
    const { eap, rede } = svgsDoPgp(dossie);
    expect(eap).toContain("<svg");
    expect(eap).toContain("P1.1 Alinhamento e</text>");
    expect(rede).toContain("caminho crítico");
    expect(rede).toContain("5.3");
  });

  it("índice do pacote: cada parte, gerada ou dispensada pelo GP", () => {
    const indice = indiceDoPacote(dossie);
    expect(indice).toContain("A9 Plano de gerenciamento das aquisições: dispensada pelo GP");
    expect(indice).toContain("A8 Plano de gerenciamento dos riscos: gerada");
  });
});
