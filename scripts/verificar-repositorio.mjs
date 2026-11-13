// Verificação do repositório público (decisão 0010). Roda no CI em todo pull request e na main.
// Falha se aparecer, entre os arquivos rastreados pelo Git:
//   - PDF fora de tests/fixtures/rfps-publicas/;
//   - DOCX, XLSX, ZIP ou .dossie.json fora de tests/fixtures/gerados/;
//   - DOC ou XLS em qualquer lugar;
//   - qualquer arquivo dentro de referencias/ (o logo entra copiado em src/interface/ativos/, decisão 0012);
//   - texto com cara de chave ou segredo.
// Uso: node scripts/verificar-repositorio.mjs  (ou: npm run verificar-repositorio)
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REGRAS_DE_ARQUIVO = [
  {
    teste: (c) => /\.pdf$/i.test(c) && !c.startsWith("tests/fixtures/rfps-publicas/"),
    motivo: "PDF fora de tests/fixtures/rfps-publicas/",
  },
  {
    teste: (c) => /\.(docx|xlsx|zip)$/i.test(c) && !c.startsWith("tests/fixtures/gerados/"),
    motivo: "DOCX, XLSX ou ZIP fora de tests/fixtures/gerados/",
  },
  {
    teste: (c) => /\.dossie\.json$/i.test(c) && !c.startsWith("tests/fixtures/gerados/"),
    motivo: "dossiê (.dossie.json) fora de tests/fixtures/gerados/",
  },
  { teste: (c) => /\.(doc|xls)$/i.test(c), motivo: "DOC ou XLS (formato antigo, nunca entra)" },
  { teste: (c) => /^referencias\//i.test(c), motivo: "arquivo de referencias/ (fica fora do Git)" },
  {
    teste: (c) => /(^|\/)\.env(\.|$)|\.(pem|key|p12|pfx)$|(^|\/)id_rsa/i.test(c),
    motivo: "arquivo de segredo (.env, chave privada ou certificado)",
  },
];

// Padrões de chave. Montados por partes para este arquivo não acusar a si mesmo.
const PADROES_DE_CHAVE = [
  { nome: "chave da API da Anthropic", re: new RegExp("sk-" + "ant-[A-Za-z0-9_-]{20,}") },
  { nome: "token do GitHub", re: new RegExp("\\bgh" + "[pousr]_[A-Za-z0-9]{30,}") },
  { nome: "chave da AWS", re: new RegExp("\\bAK" + "IA[0-9A-Z]{16}\\b") },
  { nome: "chave da OpenAI", re: new RegExp("\\bsk-" + "(proj-)?[A-Za-z0-9]{32,}") },
  { nome: "chave privada", re: new RegExp("-----BEGIN [A-Z ]*" + "PRIVATE KEY-----") },
  { nome: "chave do Google", re: new RegExp("\\bAI" + "za[0-9A-Za-z_-]{35}\\b") },
];

const TEXTO = /\.(ts|tsx|js|mjs|cjs|jsx|json|md|txt|yml|yaml|html|css|toml|env|ini|cfg|sh|ps1)$/i;
const LIMITE_TEXTO = 2 * 1024 * 1024;

export function verificarCaminhos(caminhos) {
  const problemas = [];
  for (const c of caminhos) {
    for (const r of REGRAS_DE_ARQUIVO) if (r.teste(c)) problemas.push(`${c}: ${r.motivo}`);
  }
  return problemas;
}

export function verificarConteudo(caminho, texto) {
  return PADROES_DE_CHAVE.filter((p) => p.re.test(texto)).map(
    (p) => `${caminho}: texto com cara de ${p.nome}`,
  );
}

function principal() {
  const caminhos = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const problemas = verificarCaminhos(caminhos);
  for (const c of caminhos) {
    if (!TEXTO.test(c) && !/(^|\/)\.[a-z]+rc$/i.test(c)) continue;
    try {
      if (statSync(c).size > LIMITE_TEXTO) continue;
      problemas.push(...verificarConteudo(c, readFileSync(c, "utf8")));
    } catch {
      // arquivo removido da pasta de trabalho mas ainda rastreado: o Git cuida dele
    }
  }
  if (problemas.length) {
    console.error("A verificação do repositório falhou:");
    for (const p of problemas) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`Repositório conferido: ${caminhos.length} arquivos rastreados, nenhum problema.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal();
}
