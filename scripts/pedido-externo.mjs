// Testar sem a chave (o Claude do claude.ai faz o papel do PMO): exportar o pedido de um passo e importar a resposta.
// Uso:
//   npm run exportar-pedido -- --etapa 1 --passo leitura-rfp --rfp <arquivo> [--saida <pasta>]
//   npm run importar-resposta -- --etapa 1 --passo leitura-rfp --arquivo <resposta.json> --dossie <arquivo>
// Etapas 2 a 5, encadeadas pelo dossiê (cada passo só sai depois de importar o anterior):
//   npm run exportar-pedido -- --etapa 2 --passo estrategia --dossie <arquivo>   (passos: estrategia, conteudo, eap)
//   npm run importar-resposta -- --etapa 2 --passo estrategia --arquivo <r.json> --dossie <arquivo> [--abordagem B]
//   etapa 3: tap, premissas; etapa 4: adaptacao, escopo, cronograma, riscos, planos, execucao [--gerar "A1,A3,…"]
//   etapa 5: leitura, com --plano <plano.pdf> na exportação, ou --plano dossie (o PGP da etapa 4, montado pelo app;
//   grava também o PGP inteiro em DOCX na pasta de saída)
//   etapas 4 e 5: --porte pequeno|médio|grande, --caracteristicas "campo=não,beneficiarios=não" e --pcs
//   "PC1,PC3,…" na exportação (ficam no dossiê; sem eles, a sugestão do código, como na tela)
// Segunda instância (passo segunda-<passo>), decisão 0071: a rodada seguinte sai compacta (achados da anterior, o que
//   mudou e as páginas citadas); --completa pede a resposta inteira de novo; --modelo-segunda <id> grava no cabeçalho
//   o modelo que o GP escolheu para a rodada (ex.: claude-sonnet-5-5).
// Decisões do GP simuladas: a abordagem (padrão: a primeira sugerida) e as partes do PGP (padrão: as não dispensáveis).
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
if (modo === "exportar" && String(args.passo).startsWith("segunda-") && !args.dossie) {
  console.error(
    "A segunda instância confere a resposta guardada no dossiê: passe --dossie <arquivo> (o mesmo da importação), não --rfp.",
  );
  process.exit(1);
}
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
  RAIO_X_ABORDAGEM: args.abordagem ?? "",
  RAIO_X_GERAR: args.gerar ?? "",
  RAIO_X_PLANO: args.plano === "dossie" ? "dossie" : args.plano ? resolve(args.plano) : "",
  RAIO_X_PORTE: args.porte ?? "",
  RAIO_X_PCS: args.pcs ?? "",
  RAIO_X_MODALIDADE: args.modalidade ?? "",
  RAIO_X_CARACTERISTICAS: args.caracteristicas ?? "",
  RAIO_X_SEGUNDA_COMPLETA: args.completa ? "sim" : "",
  RAIO_X_MODELO_SEGUNDA: args["modelo-segunda"] ?? "",
};
delete env.ANTHROPIC_API_KEY;
const r = spawnSync("npx", ["vitest", "run", "tests/pmo/pedido-externo.test.ts", "--silent=false"], {
  stdio: "inherit",
  shell: true,
  env,
});
process.exit(r.status ?? 1);
