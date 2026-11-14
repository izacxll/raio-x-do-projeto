// Saídas da etapa 3 montadas com as respostas gravadas do PMO na RFP da OEI: o TAP e o registro de premissas.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { beforeAll, describe, expect, it } from "vitest";
import { propostaGravada } from "../../src/demonstracao/preparar";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { Dossie as EsquemaDossie, type Dossie } from "../../src/dossie/esquema";
import { tapInicial } from "../../src/etapas/3-tap/tap";
import { gerarDocx } from "../../src/exportacao/docx";
import { TEXTO_MINUTA } from "../../src/exportacao/modelo";
import { montarRegistroPremissas, montarTap } from "../../src/exportacao/relatorio-tap";
import { RespostaPremissas, RespostaTap } from "../../src/pmo/schemas/tap";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const ler = (n: string) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/gerados/tap-oei/${n}.json`, import.meta.url), "utf-8"),
  ) as unknown;
const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;
const HOJE = new Date(2026, 10, 13);

let dossie: Dossie;

beforeAll(async () => {
  const rfp = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
  const tap = RespostaTap.parse(ler("tap"));
  // um item "do documento" com citação falsa, plantado: tem de sair como "citação não conferida"
  tap.termino.push({
    id: "falsa",
    texto: "O contrato termina com a entrega do quinto produto.",
    rotulo: "documento",
    motivo: "",
    fontes: [
      {
        doc: "rfp",
        pagina: 53,
        trecho: "o contrato termina automaticamente com a entrega do quinto produto",
      },
    ],
    alternativas: [],
    requisitos: [],
    ficha: "TAP10.1",
  });
  dossie = EsquemaDossie.parse({
    ...criarDossieVazio(HOJE),
    projeto: { nome: "Teste TAP" },
    documentos: [rfp],
    proposta: await propostaGravada(),
    tap: {
      ...tapInicial(),
      tap: { resposta: tap, modelo: "teste", em: "" },
      premissas: { resposta: RespostaPremissas.parse(ler("premissas")), modelo: "teste", em: "" },
      decisoes: { gerente: "Nome escolhido pelo GP" },
    },
  });
}, 120000);

const textoDocx = async (blob: Blob) =>
  strFromU8(unzipSync(new Uint8Array(await blob.arrayBuffer()))["word/document.xml"] as Uint8Array);

describe("saídas da etapa 3", () => {
  it("TAP: os 12 elementos, decisões do GP, divergências, conferência e aprovação, com minuta", async () => {
    const doc = montarTap(dossie, HOJE);
    expect(doc.minuta).toBe(true);
    const titulos = doc.secoes.map((s) => s.titulo);
    for (const n of [
      "1. Finalidade do projeto",
      "6. Resumo do cronograma de marcos",
      "12. Patrocinador ou quem autoriza o TAP",
    ])
      expect(titulos).toContain(n);
    const xml = await textoDocx(await gerarDocx(doc, logoBuffer));
    expect(xml).toContain("[Decisão do GP] Nome escolhido pelo GP");
    expect(xml).toContain("Patrocinador: [Decisão do GP] a definir pelo GP");
    expect(xml).toContain("[Do documento, p. 24]");
    expect(xml).toContain("[Do documento, proposta, p. 7]");
    expect(xml).toContain(
      "[Do documento — citação não conferida] O contrato termina com a entrega do quinto produto.",
    );
    expect(xml).toContain("Conferência do TAP (código)");
    const docxCabecalho = Object.entries(
      unzipSync(new Uint8Array(await (await gerarDocx(doc, logoBuffer)).arrayBuffer())),
    )
      .filter(([n]) => /header/.test(n))
      .map(([, c]) => strFromU8(c))
      .join("");
    expect(docxCabecalho).toContain(TEXTO_MINUTA);
  });

  it("registro de premissas: uma linha por premissa, com a premissa crítica e a consequência", () => {
    const doc = montarRegistroPremissas(dossie, HOJE);
    const linhas = doc.secoes[0]!.tabela!.linhas;
    expect(linhas).toHaveLength(9);
    const pc3 = linhas.find((l) => l[4] === "PC3")!;
    expect(pc3[5]).toMatch(/recalculados/);
    expect(linhas.find((l) => l[1] === "restrição")?.[3]).toMatch(/^rfp \(RFP, p\. \d+\)$/);
  });

  it("descartado pelo GP não sai; tudo revisado, divergências decididas e TAP aprovado tira a minuta", () => {
    const tap = dossie.tap!;
    const descartado = {
      ...dossie,
      tap: { ...tap, revisoes: { "premissas:0": { estado: "descartado" as const } } },
    };
    expect(montarRegistroPremissas(descartado, HOJE).secoes[0]!.tabela!.linhas).toHaveLength(8);
    const ids = [
      ...Object.keys(tap.tap!.resposta).flatMap((campo) => {
        const lista = (tap.tap!.resposta as Record<string, unknown[]>)[campo] ?? [];
        return lista.map((_, k) => `tap:${campo}:${k}`);
      }),
      ...tap.premissas!.resposta.premissas.map((_, k) => `premissas:${k}`),
      ...tap.premissas!.resposta.observacoes.map((_, k) => `premissas:observacoes:${k}`),
    ];
    const revisoes = Object.fromEntries(ids.map((id) => [id, { estado: "aceito" as const }]));
    const pronto = {
      ...dossie,
      tap: {
        ...tap,
        revisoes,
        decisoes: { ...tap.decisoes, aprovadoPor: "Patrocinador", aprovadoEm: "2026-11-20" },
      },
    };
    expect(montarTap(pronto, HOJE).minuta).toBe(false);
  });
});
