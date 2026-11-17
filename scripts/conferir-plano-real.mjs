// Roteiro da etapa 5 sobre um plano real (docs/estudos/roteiro-etapa-5-plano-real.md). Roda na máquina da
// responsável: os PDFs e o resumo ficam fora do repositório, e o resumo tem só números. A chave, quando houver, vem
// de um arquivo fora do repositório (RAIO_X_ARQUIVO_CHAVE); ANTHROPIC_API_KEY nunca é lida nem repassada.
import { spawnSync } from "node:child_process";

if (process.env.ANTHROPIC_API_KEY)
  console.warn(
    "Aviso: ANTHROPIC_API_KEY está definida neste terminal. Ela não é usada aqui, mas faz o Claude Code cobrar o uso dele nessa chave. Remova com: Remove-Item Env:ANTHROPIC_API_KEY",
  );
if (!process.env.RAIO_X_PLANO) {
  console.error(
    'Falta o plano. No PowerShell: $env:RAIO_X_PLANO = "C:\caminho\fora\do\projeto\plano.pdf"; npm run conferir-plano-real',
  );
  process.exit(1);
}
if (!process.env.RAIO_X_ARQUIVO_CHAVE)
  console.warn("Sem RAIO_X_ARQUIVO_CHAVE: roda só a conferência por código, sem a leitura do PMO.");
const env = { ...process.env, CONFERIR_PLANO_REAL: "sim" };
delete env.ANTHROPIC_API_KEY;
const r = spawnSync("npx", ["vitest", "run", "tests/pmo/plano-real.test.ts", "--silent=false"], {
  stdio: "inherit",
  shell: true,
  env,
});
process.exit(r.status ?? 1);
