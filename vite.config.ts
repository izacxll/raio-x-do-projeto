/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const pacote = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  version: string;
};
const skill = readFileSync(new URL("./.claude/skills/pmo/SKILL.md", import.meta.url), "utf8");
const versaoSkill = /^versao:\s*(\S+)/m.exec(skill)?.[1] ?? "desconhecida";

/**
 * Content-Security-Policy do site publicado (decisões 0001 e 0003).
 * Conexão só com o próprio site e com a API do Claude; nenhum script de terceiros.
 * 'wasm-unsafe-eval' permite compilar o WebAssembly do OCR e do pdf.js, e só isso.
 * Vai numa <meta> porque o GitHub Pages não deixa configurar cabeçalhos; só no build,
 * porque o servidor de desenvolvimento do Vite precisa de scripts e conexões próprias.
 */
export const POLITICA_SEGURANCA = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "worker-src 'self' blob:",
  "connect-src 'self' https://api.anthropic.com",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

function politicaDeSeguranca(): Plugin {
  return {
    name: "politica-de-seguranca",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "<!-- csp -->",
        `<meta http-equiv="Content-Security-Policy" content="${POLITICA_SEGURANCA}" />`,
      );
    },
  };
}

export default defineConfig(({ command }) => ({
  // Endereço no GitHub Pages: https://izacxll.github.io/raio-x-do-projeto/
  base: command === "build" ? "/raio-x-do-projeto/" : "/",
  plugins: [react(), politicaDeSeguranca()],
  define: {
    __VERSAO_APP__: JSON.stringify(pacote.version),
    __VERSAO_SKILL__: JSON.stringify(versaoSkill),
  },
  build: { chunkSizeWarningLimit: 1500 },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    testTimeout: 60000,
    // sem isto, o Vitest troca o CSS por texto vazio, inclusive no import ?raw de tokens.css
    css: { include: [/tokens\.css/] },
  },
}));
