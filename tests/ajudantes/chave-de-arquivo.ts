// Chave da API para os scripts locais (comparação de modelos, roteiros com chave): lida de um arquivo FORA do
// repositório, indicado por RAIO_X_ARQUIVO_CHAVE. Nunca de ANTHROPIC_API_KEY: com essa variável no terminal, o
// Claude Code passa a cobrar o próprio uso nela. A chave nunca é impressa nem gravada.
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(fileURLToPath(new URL("../../", import.meta.url)));

export function caminhoForaDoRepositorio(caminho: string, raiz = RAIZ): boolean {
  const rel = relative(realpathSync(raiz), realpathSync(caminho));
  return rel.startsWith("..") || isAbsolute(rel);
}

/** A chave do arquivo indicado por RAIO_X_ARQUIVO_CHAVE, ou undefined se a variável não estiver definida. */
export function lerChaveDeArquivo(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const caminho = env.RAIO_X_ARQUIVO_CHAVE;
  if (!caminho) return undefined;
  if (!existsSync(caminho)) throw new Error(`RAIO_X_ARQUIVO_CHAVE aponta para um arquivo que não existe.`);
  if (!caminhoForaDoRepositorio(caminho))
    throw new Error(
      "O arquivo da chave está dentro da pasta do projeto: mova-o para fora (ex.: %USERPROFILE%\\.raio-x\\).",
    );
  const chave = readFileSync(caminho, "utf8")
    .replace(/^\uFEFF/, "")
    .trim();
  if (!chave || /\s/.test(chave)) throw new Error("O arquivo da chave deve ter só a chave, numa linha.");
  return chave;
}
