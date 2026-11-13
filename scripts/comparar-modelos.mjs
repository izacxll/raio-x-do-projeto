// Roda a comparação de modelos da decisão 0002 (Opus 5.5 × Sonnet 5.5 na etapa 2), que gasta crédito da API.
// Uso no PowerShell:  $env:ANTHROPIC_API_KEY = "<chave>"; npm run comparar-modelos
// A chave fica só na variável de ambiente desta janela; nada é gravado com ela.
import { spawnSync } from "node:child_process";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Falta a chave. No PowerShell: $env:ANTHROPIC_API_KEY = "<chave>"; npm run comparar-modelos');
  process.exit(1);
}
const r = spawnSync("npx", ["vitest", "run", "tests/pmo/comparacao-modelos.test.ts"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, COMPARAR_MODELOS: "sim" },
});
if (r.status === 0) console.log("Resultado em tests/fixtures/gerados/comparacao-modelos/resumo.md");
process.exit(r.status ?? 1);
