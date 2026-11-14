// Modo demonstração (decisão 0027): as respostas gravadas passam pelo mesmo schema da API, e os exportados levam o
// aviso no cabeçalho.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { MODELO_GRAVADO, respostaGravada, TEXTO_DEMONSTRACAO } from "../../src/demonstracao/demonstracao";
import { propostaGravada } from "../../src/demonstracao/preparar";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { Dossie } from "../../src/dossie/esquema";
import { gerarDocx } from "../../src/exportacao/docx";
import { camposDoDossie } from "../../src/exportacao/modelo";
import { montarRelatorioLeitura } from "../../src/exportacao/relatorio-leitura";
import { RespostaEstrategia } from "../../src/pmo/schemas/proposta";

const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;

describe("modo demonstração", () => {
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

  it("o dossiê guarda o modo e os exportados levam o aviso no cabeçalho", async () => {
    const dossie = Dossie.parse({ ...criarDossieVazio(), demonstracao: true });
    expect(camposDoDossie(dossie).demonstracao).toBe(true);
    const blob = await gerarDocx(montarRelatorioLeitura(dossie), logoBuffer);
    const arquivos = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const cabecalhos = Object.entries(arquivos)
      .filter(([n]) => /word\/header\d*\.xml$/.test(n))
      .map(([, c]) => strFromU8(c))
      .join(" ");
    expect(cabecalhos).toContain(TEXTO_DEMONSTRACAO);
  });

  it("fora da demonstração, o cabeçalho não leva o aviso", async () => {
    const blob = await gerarDocx(montarRelatorioLeitura(criarDossieVazio()), logoBuffer);
    const arquivos = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const tudo = Object.values(arquivos)
      .map((c) => strFromU8(c))
      .join(" ");
    expect(tudo).not.toContain(TEXTO_DEMONSTRACAO);
  });
});
