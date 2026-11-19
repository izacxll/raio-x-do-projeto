// Saídas da etapa 4 montadas com as respostas gravadas do PMO na RFP da OEI: o plano, os registros (XLSX), os
// diagramas (SVG) e o índice do pacote.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { beforeAll, describe, expect, it } from "vitest";
import { propostaGravada, tapGravado } from "../ajudantes/gravadas";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { Dossie as EsquemaDossie, type Dossie, type PgpDossie } from "../../src/dossie/esquema";
import { gerarSugerido, pgpInicial } from "../../src/etapas/4-pgp/pgp";
import { svgsDoPgp } from "../../src/exportacao/diagramas-pgp";
import { gerarDocx } from "../../src/exportacao/docx";
import { TEXTO_MINUTA } from "../../src/exportacao/modelo";
import { indiceDoPacote, montarPgp, montarRegistrosPgp } from "../../src/exportacao/relatorio-pgp";
import { SCHEMAS_PGP, type PassoPgp } from "../../src/pmo/schemas/pgp";
import { lerRfpPublica } from "../ajudantes/rfp-publica";
import { CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { gerarPeloPorte } from "../../src/etapas/4-pgp/porte";
import { pgpComoDocumento } from "../../src/etapas/4-pgp/autoconferencia";
import { abasDasSecoes } from "../../src/exportacao/abas";
import { paginasEstimadas } from "../../src/exportacao/paginas";

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
    // decisão 0092: o B27 ganhou as colunas da reserva e do marco; a premissa crítica é a última
    expect(riscos.colunas.slice(-3)).toEqual(["Reserva", "Marco", "Premissa crítica"]);
    expect(riscos.linhas.some((l) => l[l.length - 1] === "PC3")).toBe(true);
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
    // decisão 0091: o índice diz para onde foi a parte (fundida numa gerada ou dispensada, com o motivo)
    expect(indice).toMatch(/A9 Plano de gerenciamento das aquisições: (?:dispensada: |fundida em )/);
    expect(indice).toContain("A8 Plano de gerenciamento dos riscos: gerada");
  });
});

describe("porte pequeno: registros só na planilha (decisão 0096)", () => {
  const pequeno = (): Dossie => {
    const caracteristicas = { ...CARACTERISTICAS_PADRAO, porte: "pequeno" as const };
    const p = dossie.pgp!;
    return {
      ...dossie,
      pgp: {
        ...p,
        sugestaoPeloPorte: caracteristicas,
        gerar: gerarPeloPorte(p.adaptacao!.resposta, caracteristicas),
      },
    };
  };

  it("no plano, cada registro é uma tabela-resumo com a aba da planilha onde está inteiro", () => {
    const d = pequeno();
    const plano = montarPgp(d, HOJE);
    const abas = abasDasSecoes(montarRegistrosPgp(d, HOJE).secoes);
    const registros = plano.secoes.filter((s) => /^Parte B\d+ do plano\.$/.test(s.paragrafos?.[0] ?? ""));
    expect(registros.length).toBeGreaterThan(0);
    for (const s of registros) {
      const nota = s.paragrafos!.find((x) => /registro completo fica só na planilha/.test(x));
      expect(nota, s.titulo).toBeDefined();
      const aba = /aba "([^"]+)"/.exec(nota!)?.[1];
      expect(aba && abas.includes(aba), `${s.titulo}: aba ${aba}`).toBe(true);
      expect(s.tabela!.linhas.length).toBeLessThanOrEqual(5);
    }
    // o B27 é uma seção só (sem continuação), com os riscos de impacto alto primeiro
    const b27 = registros.find((s) => s.paragrafos![0] === "Parte B27 do plano.")!;
    const iImpacto = b27.tabela!.colunas.findIndex((x) => /^impacto/i.test(x));
    expect(b27.tabela!.linhas[0]![iImpacto]).toBe("alto");
    expect(plano.secoes.some((s) => s.titulo.startsWith(`${b27.titulo} (continuação)`))).toBe(false);
    expect(plano.secoes[0]!.paragrafos!.some((x) => /decisão 0096/.test(x))).toBe(true);
    expect(indiceDoPacote(d)).toMatch(/completos só em registros\.xlsx/);
  });

  it("a planilha leva os itens do PMO de cada registro, e a autoconferência lê o plano completo", () => {
    const d = pequeno();
    const planilha = montarRegistrosPgp(d, HOJE);
    expect(planilha.secoes.some((s) => /^B27 .* — itens$/.test(s.titulo))).toBe(true);
    const completo = pgpComoDocumento(d, HOJE)
      .paginas.map((x) => x.texto)
      .join(" ");
    expect(completo).not.toMatch(/registro completo fica só na planilha/);
  });

  it("o plano do porte pequeno fica menor que o mesmo plano com os registros inteiros", () => {
    const d = pequeno();
    const resumo = paginasEstimadas(montarPgp(d, HOJE));
    const inteiro = paginasEstimadas(montarPgp(d, HOJE, { registrosCompletos: true }));
    expect(resumo).toBeLessThan(inteiro);
  });

  it("no porte médio, os registros continuam inteiros no plano", () => {
    const caracteristicas = { ...CARACTERISTICAS_PADRAO, porte: "médio" as const };
    const p = dossie.pgp!;
    const d = {
      ...dossie,
      pgp: {
        ...p,
        sugestaoPeloPorte: caracteristicas,
        gerar: gerarPeloPorte(p.adaptacao!.resposta, caracteristicas),
      },
    };
    const plano = montarPgp(d, HOJE);
    expect(
      plano.secoes.some((s) => s.paragrafos?.some((x) => /registro completo fica só na planilha/.test(x))),
    ).toBe(false);
  });
});
