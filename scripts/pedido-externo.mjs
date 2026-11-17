// Testar sem a chave (o Claude do claude.ai faz o papel do PMO): exportar o pedido de um passo e importar a resposta.
// Uso:
//   npm run exportar-pedido -- --etapa 1 --passo leitura-rfp --rfp <arquivo> [--dossie <arquivo>] [--saida <pasta>]
//   npm run importar-resposta -- --etapa 1 --passo leitura-rfp --arquivo <resposta.json> --dossie <arquivo>
// A pasta de saída padrão é ../pedidos-raio-x/, fora do repositório. Pedido de plano real nunca vai para o Git.
import { spawnSync } from "node:child_process";
import { resolve, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";

const modo = process.argv[2];
const args = {};
for (let i = 3; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--"))
    args[a.slice(2)] =
      process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : "sim";
}
const raiz = resolve(fileURLToPath(new URL("../", import.meta.url)));
const dentro = (p) => {
  const rel = relative(raiz, resolve(p));
  return !(rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel));
};
if (!args.etapa || !args.passo) {
  console.error("Faltam --etapa e --passo (ex.: --etapa 1 --passo leitura-rfp).");
  process.exit(1);
}
const saida = args.saida ?? resolve(raiz, "../pedidos-raio-x");
if (modo === "exportar" && !args.rfp && !args.dossie) {
  console.error(
    "Falta --rfp <arquivo> (o nome de uma RFP pública de tests/fixtures/rfps-publicas/ ou um caminho).",
  );
  process.exit(1);
}
if (modo === "importar" && (!args.arquivo || !args.dossie)) {
  console.error("Faltam --arquivo <resposta.json> e --dossie <arquivo .dossie.json>.");
  process.exit(1);
}
if (dentro(saida) && !resolve(saida).includes(`${sep}tests${sep}fixtures${sep}gerados`))
  console.warn("Aviso: a saída está dentro do projeto. Pedido de plano real nunca vai para o Git.");
const env = {
  ...process.env,
  RAIO_X_MODO: modo,
  RAIO_X_ETAPA: args.etapa,
  RAIO_X_PASSO: args.passo,
  RAIO_X_RFP: args.rfp ?? "",
  RAIO_X_DOSSIE: args.dossie ? resolve(args.dossie) : "",
  RAIO_X_ARQUIVO: args.arquivo ? resolve(args.arquivo) : "",
  RAIO_X_SAIDA: saida,
};
delete env.ANTHROPIC_API_KEY;
const r = spawnSync("npx", ["vitest", "run", "tests/pmo/pedido-externo.test.ts", "--silent=false"], {
  stdio: "inherit",
  shell: true,
  env,
});
process.exit(r.status ?? 1);
