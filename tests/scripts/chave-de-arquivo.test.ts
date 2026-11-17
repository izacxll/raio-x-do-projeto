// A chave dos scripts vem de um arquivo fora do repositório (RAIO_X_ARQUIVO_CHAVE), nunca de ANTHROPIC_API_KEY.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { lerChaveDeArquivo } from "../ajudantes/chave-de-arquivo";

const pasta = mkdtempSync(join(tmpdir(), "raio-x-chave-"));
afterAll(() => rmSync(pasta, { recursive: true, force: true }));

describe("chave em arquivo fora do repositório", () => {
  it("sem RAIO_X_ARQUIVO_CHAVE não há chave, mesmo com ANTHROPIC_API_KEY no ambiente", () => {
    expect(lerChaveDeArquivo({ ANTHROPIC_API_KEY: "sk-ant-teste" })).toBeUndefined();
  });

  it("lê a chave do arquivo, sem espaços nem BOM", () => {
    const arq = join(pasta, "chave.txt");
    writeFileSync(arq, "\uFEFFsk-ant-exemplo-123\r\n");
    expect(lerChaveDeArquivo({ RAIO_X_ARQUIVO_CHAVE: arq })).toBe("sk-ant-exemplo-123");
  });

  it("recusa arquivo que não existe, arquivo vazio e arquivo dentro do projeto", () => {
    expect(() => lerChaveDeArquivo({ RAIO_X_ARQUIVO_CHAVE: join(pasta, "nao-existe.txt") })).toThrow(
      /não existe/,
    );
    const vazio = join(pasta, "vazio.txt");
    writeFileSync(vazio, "  \n");
    expect(() => lerChaveDeArquivo({ RAIO_X_ARQUIVO_CHAVE: vazio })).toThrow(/só a chave/);
    expect(() => lerChaveDeArquivo({ RAIO_X_ARQUIVO_CHAVE: "package.json" })).toThrow(
      /dentro da pasta do projeto/,
    );
  });
});
