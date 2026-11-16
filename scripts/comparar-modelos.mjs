// Roda a comparação de modelos da decisão 0002 (Opus 5.5 × Sonnet 5.5 na etapa 2), que gasta crédito da API.
// A chave fica num arquivo FORA do repositório, indicado por RAIO_X_ARQUIVO_CHAVE (passo a passo em
// docs/tecnico/07-configuracao.md). Nunca use ANTHROPIC_API_KEY: com ela no terminal, o Claude Code passa a cobrar
// o próprio uso nessa chave. Este script não lê, não imprime e não repassa essa variável.
import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(fileURLToPath(new URL("../", import.meta.url)));
const arquivo = process.env.RAIO_X_ARQUIVO_CHAVE;
const passo =
  '$env:RAIO_X_ARQUIVO_CHAVE = "$env:USERPROFILE\.raio-x\chave-api.txt"; npm run comparar-modelos';

if (process.env.ANTHROPIC_API_KEY)
  console.warn(
    "Aviso: ANTHROPIC_API_KEY está definida neste terminal. Ela não é usada aqui, mas faz o Claude Code cobrar o uso dele nessa chave. Remova com: Remove-Item Env:ANTHROPIC_API_KEY",
  );
if (!arquivo) {
  console.error(`Falta indicar o arquivo da chave. No PowerShell: ${passo}`);
  process.exit(1);
}
if (!existsSync(arquivo)) {
  console.error("RAIO_X_ARQUIVO_CHAVE aponta para um arquivo que não existe.");
  process.exit(1);
}
const rel = relative(realpathSync(raiz), realpathSync(arquivo));
if (!(rel.startsWith("..") || isAbsolute(rel))) {
  console.error(
    "O arquivo da chave está dentro da pasta do projeto: mova-o para fora (ex.: %USERPROFILE%\.raio-x\).",
  );
  process.exit(1);
}
const env = { ...process.env, COMPARAR_MODELOS: "sim" };
delete env.ANTHROPIC_API_KEY;
const r = spawnSync("npx", ["vitest", "run", "tests/pmo/comparacao-modelos.test.ts"], {
  stdio: "inherit",
  shell: true,
  env,
});
if (r.status === 0) console.log("Resultado em tests/fixtures/gerados/comparacao-modelos/resumo.md");
process.exit(r.status ?? 1);
