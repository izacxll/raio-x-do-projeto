import { describe, expect, it } from "vitest";
// @ts-expect-error: script em JavaScript puro, sem tipos
import { verificarCaminhos, verificarConteudo } from "../../scripts/verificar-repositorio.mjs";

describe("verificação do repositório (decisão 0010)", () => {
  it("aceita os arquivos permitidos", () => {
    expect(
      verificarCaminhos([
        "tests/fixtures/rfps-publicas/pregao.pdf",
        "tests/fixtures/gerados/proposta.docx",
        "tests/fixtures/gerados/lista.xlsx",
        "tests/fixtures/gerados/exemplo.dossie.json",
        "src/interface/ativos/logo-fgv-projetos.jpg",
        "src/main.tsx",
      ]),
    ).toEqual([]);
  });

  it("acusa PDF, DOCX, XLSX, ZIP e dossiê fora das pastas permitidas", () => {
    const problemas = verificarCaminhos([
      "docs/plano.pdf",
      "tests/fixtures/gerados/rfp.PDF",
      "saida.docx",
      "tests/fixtures/rfps-publicas/planilha.xlsx",
      "pacote.zip",
      "projeto.dossie.json",
    ]);
    expect(problemas).toHaveLength(6);
  });

  it("acusa DOC e XLS em qualquer lugar e qualquer arquivo de referencias/", () => {
    expect(
      verificarCaminhos(["tests/fixtures/gerados/a.doc", "b.XLS", "referencias/identidade/logo.jpg"]),
    ).toHaveLength(3);
  });

  it("acusa arquivos de segredo", () => {
    expect(verificarCaminhos([".env", ".env.local", "chave.pem", "id_rsa"])).toHaveLength(4);
  });

  it("acusa texto com cara de chave", () => {
    const chave = "sk-" + "ant-api03-" + "A".repeat(40);
    expect(verificarConteudo("a.ts", `const k = "${chave}"`)).toHaveLength(1);
    expect(verificarConteudo("a.ts", "const k = sessionStorage.getItem('chave')")).toHaveLength(0);
  });
});
