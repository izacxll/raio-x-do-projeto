import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cor, lerCores } from "../../src/interface/tokens";
import { POLITICA_SEGURANCA } from "../../vite.config";

const raiz = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((n) => {
    const c = join(pasta, n);
    return statSync(c).isDirectory() ? arquivos(c) : [c];
  });
}

describe("tokens da identidade visual", () => {
  it("têm as cores da apresentação", () => {
    expect(cor("navy950")).toBe("002D4D");
    expect(cor("navy")).toBe("003A79");
    expect(cor("navy700")).toBe("0C63AA");
    expect(cor("blue")).toBe("008BC9");
    expect(cor("celeste")).toBe("73BFE8");
    expect(cor("paper")).toBe("E6EDF5");
    expect(cor("bd")).toBe("B9C7D8");
    expect(cor("txt")).toBe("3F4A57");
    expect(cor("ink")).toBe("5C5B5F");
    expect(cor("vinho")).toBe("9B0A51");
    expect(cor("laranja")).toBe("E29200");
  });

  it("lê só linhas de cor no formato combinado", () => {
    expect(lerCores("--a: #00ff00;\n--b: var(--a);")).toEqual({ a: "00FF00" });
  });

  it("acusa token inexistente", () => {
    expect(() => cor("roxo")).toThrow(/inexistente/);
  });

  it("nenhuma cor solta em CSS ou TSX fora de tokens.css", () => {
    const soltas = arquivos(join(raiz, "src"))
      .filter((c) => /\.(css|tsx?)$/.test(c) && !c.endsWith("tokens.css"))
      .filter((c) => /#[0-9a-fA-F]{6}\b/.test(readFileSync(c, "utf8")));
    expect(soltas).toEqual([]);
  });
});

describe("Content-Security-Policy", () => {
  const diretivas = Object.fromEntries(
    POLITICA_SEGURANCA.split(";").map((d) => {
      const [nome, ...valores] = d.trim().split(/\s+/);
      return [nome, valores];
    }),
  );

  it("só conecta com o próprio site e com a API do Claude", () => {
    expect(diretivas["connect-src"]).toEqual(["'self'", "https://api.anthropic.com"]);
  });

  it("não carrega script de terceiros nem permite eval", () => {
    expect(diretivas["script-src"]).toEqual(["'self'", "'wasm-unsafe-eval'"]);
    expect(POLITICA_SEGURANCA).not.toMatch(/'unsafe-eval'/);
    expect(POLITICA_SEGURANCA).not.toMatch(/https?:\/\/(?!api\.anthropic\.com)/);
  });

  it("bloqueia plugins e formulários externos", () => {
    expect(diretivas["object-src"]).toEqual(["'none'"]);
    expect(diretivas["form-action"]).toEqual(["'none'"]);
  });

  it("nenhum CDN no código do app", () => {
    const comCdn = arquivos(join(raiz, "src"))
      .filter((c) => /\.(tsx?|css|html)$/.test(c))
      .filter((c) =>
        /cdn\.jsdelivr|cdnjs|unpkg\.com|tessdata\.projectnaptha|googleapis/.test(readFileSync(c, "utf8")),
      );
    expect(comCdn).toEqual([]);
  });
});
