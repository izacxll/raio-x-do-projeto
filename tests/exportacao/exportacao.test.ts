import { readFileSync } from "node:fs";
import ExcelJS from "exceljs";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import type { Dossie } from "../../src/dossie/esquema";
import { gerarDocx } from "../../src/exportacao/docx";
import { precisaDeMinuta, TEXTO_MINUTA } from "../../src/exportacao/modelo";
import { montarRelatorioLeitura } from "../../src/exportacao/relatorio-leitura";
import { gerarXlsx, nomeDeAba } from "../../src/exportacao/xlsx";

const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;

function dossieExemplo(): Dossie {
  const d = criarDossieVazio();
  d.projeto.nome = "Projeto de teste";
  d.documentos.push({
    id: "a",
    papel: "rfp",
    nomeArquivo: "edital.pdf",
    tamanhoBytes: 100,
    totalPaginas: 3,
    lidoEm: new Date().toISOString(),
    paginas: [
      { numero: 1, origem: "texto", texto: "Objeto", caracteres: 120 },
      { numero: 2, origem: "ocr", texto: "Prazo", caracteres: 80, confiancaOcr: 77 },
      { numero: 3, origem: "nao-verificavel", texto: "", caracteres: 0, motivo: "sem texto legível" },
    ],
  });
  return d;
}

describe("cabeçalho de minuta", () => {
  it("fica enquanto houver item pendente ou nenhum item revisado", () => {
    expect(precisaDeMinuta([])).toBe(true);
    const item = { id: "1", etapa: 1, rotulo: "sugestao" as const, texto: "x" };
    expect(precisaDeMinuta([{ ...item, estado: "pendente" }])).toBe(true);
    expect(
      precisaDeMinuta([
        { ...item, estado: "aceito" },
        { ...item, estado: "descartado" },
      ]),
    ).toBe(false);
  });
});

describe("relatório de leitura", () => {
  it("lista cada página com a forma de leitura e manda conferir as não verificáveis", () => {
    const doc = montarRelatorioLeitura(dossieExemplo());
    expect(doc.minuta).toBe(true);
    const secao = doc.secoes[0];
    expect(secao?.paragrafos?.[1]).toBe("Páginas não verificáveis: 3.");
    expect(secao?.tabela?.linhas[2]).toEqual([
      "3",
      "Não verificável",
      "0",
      "sem texto legível. Conferir no documento.",
    ]);
    expect(secao?.tabela?.linhas[1]?.[3]).toMatch(/confiança 77%/);
  });

  it("nunca diz 'não informado no documento' para o que o código não leu", () => {
    const doc = montarRelatorioLeitura(dossieExemplo());
    expect(JSON.stringify(doc)).not.toMatch(/não informado no documento/i);
  });
});

describe("DOCX", () => {
  it("gera um DOCX com o cabeçalho de minuta, o logo e as versões", async () => {
    const blob = await gerarDocx(montarRelatorioLeitura(dossieExemplo()), logoBuffer);
    const arquivos = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const nomes = Object.keys(arquivos);
    expect(nomes.some((n) => n.startsWith("word/media/"))).toBe(true);
    const cabecalhos = nomes
      .filter((n) => /^word\/header\d*\.xml$/.test(n))
      .map((n) => strFromU8(arquivos[n]!));
    expect(cabecalhos.join("")).toContain(TEXTO_MINUTA);
    const corpo = strFromU8(arquivos["word/document.xml"]!);
    expect(corpo).toContain("Relatório de leitura dos documentos");
    const rodape = nomes.filter((n) => /^word\/footer\d*\.xml$/.test(n)).map((n) => strFromU8(arquivos[n]!));
    expect(rodape.join("")).toMatch(/skill PMO \d+\.\d+\.\d+/);
  });
});

describe("XLSX", () => {
  it("gera uma aba por documento, com minuta e a tabela de páginas", async () => {
    const blob = await gerarXlsx(montarRelatorioLeitura(dossieExemplo()), logoBuffer);
    const livro = new ExcelJS.Workbook();
    await livro.xlsx.load(await blob.arrayBuffer());
    const aba = livro.worksheets[0]!;
    const valores = aba.getSheetValues().flat().map(String);
    expect(valores).toContain(TEXTO_MINUTA);
    expect(valores).toContain("Não verificável");
  });

  it("monta nomes de aba válidos e sem repetição", () => {
    const usados = new Set<string>();
    expect(nomeDeAba("RFP · edital/2025:anexo?", usados)).toBe("RFP · edital 2025 anexo");
    expect(nomeDeAba("RFP · edital/2025:anexo?", usados)).toBe("RFP · edital 2025 anexo 2");
  });
});
