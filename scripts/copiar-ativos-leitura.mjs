// Copia para public/vendor/ os arquivos que o navegador baixa em tempo de execução:
// o motor e o worker do OCR, os dados do português, os auxiliares do pdf.js, as fontes do PDF exportado e a RFP
// pública do modo demonstração.
// Tudo é servido pelo próprio site (nenhum CDN), como pede a Content-Security-Policy (decisões 0001 e 0019).
// A pasta public/vendor/ fica fora do Git: ela é refeita a partir de node_modules antes de cada dev e build.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = join(raiz, "node_modules");
const destino = join(raiz, "public", "vendor");

function copiar(origem, alvo, filtro) {
  const de = join(nm, origem);
  if (!existsSync(de)) throw new Error(`não encontrado: node_modules/${origem} (rode npm install)`);
  mkdirSync(alvo, { recursive: true });
  for (const nome of readdirSync(de)) {
    if (filtro && !filtro(nome)) continue;
    cpSync(join(de, nome), join(alvo, nome), { recursive: true });
  }
}

rmSync(destino, { recursive: true, force: true });

// OCR: worker do tesseract.js, núcleo em WebAssembly (só as variantes LSTM) e dados do português
copiar("tesseract.js/dist", join(destino, "tesseract"), (n) => n === "worker.min.js");
copiar("tesseract.js-core", join(destino, "tesseract", "nucleo"), (n) =>
  /-lstm\.(wasm\.js|js|wasm)$/.test(n),
);
copiar("@tesseract.js-data/por/4.0.0_best_int", join(destino, "tesseract", "idiomas"));

// pdf.js: decodificadores em WebAssembly (JBIG2, JPEG 2000, cores), fontes padrão e mapas de caracteres
copiar("pdfjs-dist/wasm", join(destino, "pdfjs", "wasm"), (n) => n.endsWith(".wasm") || n.endsWith(".js"));
copiar("pdfjs-dist/standard_fonts", join(destino, "pdfjs", "standard_fonts"));
copiar("pdfjs-dist/cmaps", join(destino, "pdfjs", "cmaps"));
copiar("pdfjs-dist/iccs", join(destino, "pdfjs", "iccs"));

// Fonte Arimo (SIL OFL 1.1), com as mesmas medidas da Arial, para o PDF exportado
const fontes = join(destino, "fontes");
for (const [pasta, arquivo] of [
  ["400Regular", "Arimo_400Regular.ttf"],
  ["700Bold", "Arimo_700Bold.ttf"],
  ["400Regular_Italic", "Arimo_400Regular_Italic.ttf"],
  ["700Bold_Italic", "Arimo_700Bold_Italic.ttf"],
]) {
  copiar(`@expo-google-fonts/arimo/${pasta}`, fontes, (n) => n === arquivo);
}
copiar("@expo-google-fonts/arimo", fontes, (n) => n === "LICENSE_FONT");

// Modo demonstração (decisão 0027): a RFP pública da OEI, lida pelo app com as respostas gravadas do PMO
const rfpDemonstracao = "concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf";
mkdirSync(join(destino, "demonstracao"), { recursive: true });
cpSync(
  join(raiz, "tests", "fixtures", "rfps-publicas", rfpDemonstracao),
  join(destino, "demonstracao", rfpDemonstracao),
);

console.log("ativos de leitura copiados para public/vendor/");
