import { describe, expect, it } from "vitest";
import { compactar, limparCarimbos, tirarAcentos } from "../../src/texto/normalizar";
import { nomeParaArquivo, slugArquivo } from "../../src/texto/nome-arquivo";

describe("normalizar", () => {
  it("tira acentos sem mudar o comprimento", () => {
    expect(tirarAcentos("Ação Pública")).toBe("acao publica");
    expect(tirarAcentos("Ação").length).toBe(4);
  });

  it("compacta para comparar trechos", () => {
    expect(compactar("Prazo: 6 (seis) meses.")).toBe("prazo6seismeses");
  });

  it("remove carimbos de assinatura eletrônica", () => {
    const t = "Cláusula 1. Documento assinado eletronicamente, conforme MP 2.200-2/01, art. 10\nCláusula 2.";
    expect(limparCarimbos(t)).not.toContain("assinado eletronicamente");
    expect(limparCarimbos(t)).toContain("Cláusula 2.");
  });
});

describe("nome de arquivo", () => {
  it("usa o nome do projeto", () => {
    expect(nomeParaArquivo("Avaliação do Programa X")).toBe("avaliacao-do-programa-x");
  });

  it("sem nome do projeto, usa as palavras significativas do nome do PDF", () => {
    expect(nomeParaArquivo("", ["Edital-Pregao-12-2025-Saude.pdf"])).toBe("pregao-saude");
  });

  it("limita o tamanho", () => {
    expect(slugArquivo("a".repeat(100)).length).toBe(40);
  });
});
