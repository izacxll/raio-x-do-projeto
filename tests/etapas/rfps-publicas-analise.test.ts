// Etapa 1 sobre as RFPs públicas de teste, lidas do PDF com o mesmo código do navegador. Os valores esperados
// foram conferidos à mão no texto de cada edital.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { beforeAll, describe, expect, it } from "vitest";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { analisarRfp, type AnaliseRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { lerDocumento } from "../../src/leitura/ler-documento";

const pasta = new URL("../fixtures/rfps-publicas/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const pdfjsLocal = join(pasta, "../../../node_modules/pdfjs-dist/");
const HOJE = new Date(2026, 10, 13);

async function analisar(nome: string): Promise<AnaliseRfp> {
  const tarefa = pdfjs.getDocument({
    data: new Uint8Array(readFileSync(join(pasta, nome))),
    standardFontDataUrl: pathToFileURL(join(pdfjsLocal, "standard_fonts/")).href,
    wasmUrl: pathToFileURL(join(pdfjsLocal, "wasm/")).href,
    cMapUrl: pathToFileURL(join(pdfjsLocal, "cmaps/")).href,
    verbosity: 0,
  });
  const pdf = await tarefa.promise;
  try {
    const paginas = await lerDocumento(pdf, { OPS: pdfjs.OPS });
    const doc: DocumentoLido = {
      id: "rfp",
      papel: "rfp",
      nomeArquivo: nome,
      tamanhoBytes: 1,
      totalPaginas: pdf.numPages,
      lidoEm: HOJE.toISOString(),
      paginas,
    };
    return analisarRfp([doc], HOJE);
  } finally {
    await tarefa.destroy();
  }
}

const item = (a: AnaliseRfp, id: string) => a.itens.find((i) => i.id === id);
const comPrefixo = (a: AnaliseRfp, p: string) => a.itens.filter((i) => i.id.startsWith(p));

describe("pregão de políticas para mulheres (Barra Bonita)", () => {
  let a: AnaliseRfp;
  beforeAll(async () => {
    a = await analisar("pregao-eletronico-politicas-mulheres-barra-bonita-2026.pdf");
  }, 120000);

  it("identificação e julgamento", () => {
    expect(item(a, "identificacao:modalidade")?.texto).toBe("Pregão eletrônico");
    expect(item(a, "identificacao:valor")?.texto).toBe("R$ 28.965,83");
    expect(item(a, "julgamento:criterio")?.texto).toMatch(/^Menor preço/);
    expect(a.itens.some((i) => /Lei 14\.133\/2021/.test(i.texto))).toBe(true);
  });

  it("prazos: sessão em 23/10/2026, esclarecimento até 20/10/2026, vigência de 4 meses", () => {
    expect(comPrefixo(a, "prazos:certame:sessao")[0]?.texto).toBe("23/10/2026 às 08:30");
    expect(comPrefixo(a, "prazos:esclarecimento")[0]?.texto).toMatch(/20\/10\/2026/);
    expect(a.itens.some((i) => i.nome === "Vigência" && i.texto === "4 meses")).toBe(true);
  });

  it("anexo do termo de referência separado do corpo", () => {
    expect(a.mapa.inicioAnexos.get("rfp")).toBe(22);
  });
});

describe("concorrência técnica e preço (OEI/MDHC)", () => {
  let a: AnaliseRfp;
  beforeAll(async () => {
    a = await analisar("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
  }, 120000);

  it("critério técnica e preço, com pesos e tabela de pontuação", () => {
    expect(item(a, "julgamento:criterio")?.texto).toBe("Técnica e preço");
    expect(comPrefixo(a, "julgamento:peso").some((i) => /70%/.test(i.texto))).toBe(true);
    expect(comPrefixo(a, "julgamento:pontuacao").length).toBeGreaterThan(10);
  });

  it("cinco produtos e a equipe-chave de quatro perfis", () => {
    expect(a.requisitosDoCodigo.filter((r) => r.tipo === "produto")).toHaveLength(5);
    expect(a.requisitosDoCodigo.filter((r) => r.tipo === "equipe").length).toBeGreaterThanOrEqual(4);
  });

  it("subcontratação vedada e multa achadas, com página", () => {
    expect(item(a, "condicoes:subcontratacao")?.texto).toMatch(/vedada/);
    expect(item(a, "condicoes:penalidades")?.origem?.pagina).toBeGreaterThan(0);
  });
});

describe("dispensa escaneada (Nova Lima)", () => {
  it("sem texto legível, nada vira 'não informado': tudo fica não verificável", async () => {
    const a = await analisar("dispensa-escaneada-pesquisa-opiniao-nova-lima-2026.pdf");
    const semAchado = a.itens.filter((i) => i.situacao !== "localizado");
    expect(semAchado.length).toBeGreaterThan(5);
    for (const i of a.itens) expect(i.texto).not.toMatch(/não informado/);
    for (const i of semAchado) expect(i.situacao).toBe("nao-verificavel");
    expect(a.regras.every((r) => r.estado === "nao-verificavel")).toBe(true);
  }, 120000);
});

describe("pregão longo com anexos (CAPES)", () => {
  it("analisa as 126 páginas, com sessão, processo e valor", async () => {
    const a = await analisar("pregao-eletronico-longo-anexos-capes-2026.pdf");
    expect(comPrefixo(a, "prazos:certame:sessao")[0]?.texto).toBe("10/07/2026 às 10:30");
    expect(item(a, "identificacao:processo")?.texto).toBe("23038.000564/2026-68");
    expect(item(a, "identificacao:valor")?.texto).toBe("R$ 1.904.001,72");
    expect(a.mapa.secoes.filter((s) => s.tipo === "anexo").length).toBeGreaterThan(5);
  }, 180000);
});
