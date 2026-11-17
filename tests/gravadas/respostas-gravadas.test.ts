// Respostas gravadas da OEI (material de teste, decisão 0053): passam pelo mesmo schema da API; o site não tem modo
// de demonstração, e o dossiê antigo que tinha o campo abre sem ele.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { Dossie } from "../../src/dossie/esquema";
import { gerarDocx } from "../../src/exportacao/docx";
import { montarRelatorioLeitura } from "../../src/exportacao/relatorio-leitura";
import { RespostaEstrategia } from "../../src/pmo/schemas/proposta";
import { MODELO_GRAVADO, propostaGravada, respostaGravada } from "../ajudantes/gravadas";

const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;

describe("respostas gravadas da OEI (material de teste)", () => {
  it("carrega a resposta gravada da etapa 2 pelo schema da API", async () => {
    const e = await respostaGravada(2, "estrategia", RespostaEstrategia);
    expect(e.abordagens.map((a) => a.id)).toEqual(["A", "B", "C"]);
  });

  it("passo sem gravação dá erro claro, nunca resposta inventada", async () => {
    await expect(respostaGravada(2, "inexistente", RespostaEstrategia)).rejects.toThrow(/não encontrada/);
  });

  it("a proposta gravada parte da abordagem B, com as premissas da gravação", async () => {
    const p = await propostaGravada();
    expect(p.abordagem?.id).toBe("B");
    expect(p.premissasAplicaveis.PC3).toBe(true);
    expect(p.conteudo?.modelo).toBe(MODELO_GRAVADO);
    expect(p.uso).toEqual([]);
  });
});

describe("sem modo de demonstração (decisão 0053)", () => {
  it("dossiê antigo com o campo de demonstração abre sem ele", () => {
    const d = Dossie.parse({ ...criarDossieVazio(), demonstracao: true });
    expect("demonstracao" in d).toBe(false);
  });

  it("os exportados não levam aviso de demonstração", async () => {
    const blob = await gerarDocx(montarRelatorioLeitura(criarDossieVazio()), logoBuffer);
    const tudo = Object.values(unzipSync(new Uint8Array(await blob.arrayBuffer())))
      .map((c) => strFromU8(c))
      .join(" ");
    expect(tudo).not.toMatch(/Demonstração com respostas gravadas/);
  });
});
