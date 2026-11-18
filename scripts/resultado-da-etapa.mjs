// Documento de resultado de uma etapa do teste externo (decisão 0072), para apresentação. Fora do Git.
// Uso:
//   npm run resultado-da-etapa -- --etapa 4 --pasta <pasta pedidos/ do caso> --base <base do nome dos arquivos>
//                                 --caso <nome do caso> --saida <pasta onde gravar o .docx>
// Lê, sem gravar nada na pasta do caso: o dossiê da cadeia (etapa-1-leitura-rfp-<base>.dossie.json), os placares
// (resposta-etapa-N-<passo>-<base>.placar.md) e as conferências (conferencia-etapa-N-<passo>-<base>.md). Grava
// resultado-etapa-N-<caso>.docx na pasta de saída, que não pode ser dentro do projeto.
import { spawnSync } from "node:child_process";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--"))
    args[a.slice(2)] =
      process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : "sim";
}
for (const k of ["etapa", "pasta", "base", "caso", "saida"])
  if (!args[k]) {
    console.error(`Falta --${k}.`);
    process.exit(1);
  }
const raiz = resolve(fileURLToPath(new URL("../", import.meta.url)));
const rel = relative(raiz, resolve(args.saida));
const dentro = !(rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel));
if (dentro && !rel.startsWith(`referencias${sep}`)) {
  console.error(
    "A saída não pode ficar dentro do projeto (fora de referencias/): o resultado tem conteúdo do caso.",
  );
  process.exit(1);
}
const env = {
  ...process.env,
  RAIO_X_MODO: "resultado",
  RAIO_X_ETAPA: String(args.etapa),
  RAIO_X_PASTA: resolve(args.pasta),
  RAIO_X_BASE: args.base,
  RAIO_X_CASO: args.caso,
  RAIO_X_SAIDA: resolve(args.saida),
};
delete env.ANTHROPIC_API_KEY;
const r = spawnSync("npx", ["vitest", "run", "tests/pmo/resultado-da-etapa.test.ts", "--silent=false"], {
  stdio: "inherit",
  shell: true,
  env,
});
process.exit(r.status ?? 1);
