// Leitura das RFPs públicas de teste (tests/fixtures/rfps-publicas/), em Node, com o mesmo código do navegador.
// O OCR é conferido no navegador de verdade, pelo teste de fumaça (tests/fumaca/).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { lerDocumento, resumirLeitura } from "../../src/leitura/ler-documento";

const pasta = new URL("../fixtures/rfps-publicas/", import.meta.url);
const pastaLocal = pasta.pathname.replace(/^\/([A-Za-z]:)/, "$1");
const pdfjsLocal = join(pastaLocal, "../../../node_modules/pdfjs-dist/");
const PDFS = readdirSync(pastaLocal).filter((n) => n.toLowerCase().endsWith(".pdf"));

async function ler(nome: string) {
  const tarefa = pdfjs.getDocument({
    data: new Uint8Array(readFileSync(join(pastaLocal, nome))),
    standardFontDataUrl: pathToFileURL(join(pdfjsLocal, "standard_fonts/")).href,
    wasmUrl: pathToFileURL(join(pdfjsLocal, "wasm/")).href,
    cMapUrl: pathToFileURL(join(pdfjsLocal, "cmaps/")).href,
    verbosity: 0,
  });
  const pdf = await tarefa.promise;
  try {
    const paginas = await lerDocumento(pdf, { OPS: pdfjs.OPS });
    return { paginas, total: pdf.numPages };
  } finally {
    await tarefa.destroy();
  }
}

describe("RFPs públicas de teste", () => {
  it("o conjunto existe e tem README com fonte e data de cada arquivo", () => {
    expect(PDFS.length).toBeGreaterThanOrEqual(6);
    const leiame = readFileSync(join(pastaLocal, "README.md"), "utf8");
    for (const nome of PDFS) expect(leiame, `README sem ${nome}`).toContain(nome);
    expect(leiame).toMatch(/https?:\/\//);
    expect(leiame).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  for (const nome of PDFS) {
    it(`lê ${nome} página a página, sem perder nenhuma`, async () => {
      const { paginas, total } = await ler(nome);
      expect(total).toBeGreaterThan(0);
      expect(paginas.map((p) => p.numero)).toEqual(Array.from({ length: total }, (_, i) => i + 1));
      for (const p of paginas) {
        if (p.origem === "nao-verificavel") expect(p.motivo).toBeTruthy();
      }
      const r = resumirLeitura(paginas);
      if (/escaneada/.test(nome)) {
        // PDF só de imagem: sem OCR, as páginas ficam "não verificáveis", nunca "sem conteúdo"
        expect(r.naoVerificaveis.length).toBeGreaterThan(total / 2);
      } else {
        expect(r.texto).toBeGreaterThan(total / 2);
      }
    }, 120000);
  }

  it("o edital longo tem mais de 80 páginas e é lido por inteiro", async () => {
    const longo = PDFS.find((n) => /longo/.test(n));
    expect(longo).toBeTruthy();
    const { paginas, total } = await ler(longo!);
    expect(total).toBeGreaterThan(80);
    expect(paginas).toHaveLength(total);
  }, 180000);

  it("a tabela vira linhas com colunas separadas por tabulação", async () => {
    const comTabela = PDFS.find((n) => /tecnica-preco/.test(n)) ?? PDFS[0]!;
    const { paginas } = await ler(comTabela);
    expect(paginas.some((p) => p.texto.includes("\t"))).toBe(true);
  }, 120000);
});
