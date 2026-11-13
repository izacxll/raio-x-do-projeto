import { describe, expect, it } from "vitest";
import { criarDossieVazio, lerDossie, nomeArquivoDossie, serializarDossie } from "../../src/dossie/arquivo";
import type { Dossie } from "../../src/dossie/esquema";

describe("dossiê", () => {
  it("salva e reabre o mesmo conteúdo", () => {
    const d = criarDossieVazio();
    d.projeto.nome = "Avaliação do programa";
    d.documentos.push({
      id: "1",
      papel: "rfp",
      nomeArquivo: "edital.pdf",
      tamanhoBytes: 10,
      totalPaginas: 1,
      lidoEm: new Date().toISOString(),
      paginas: [{ numero: 1, origem: "texto", texto: "Objeto", caracteres: 6 }],
    });
    const r = lerDossie(serializarDossie(d), "avaliacao-do-programa.dossie.json");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dossie.projeto.nome).toBe("Avaliação do programa");
      expect(r.dossie.documentos[0]?.paginas[0]?.texto).toBe("Objeto");
    }
  });

  it("nunca grava a chave da API, mesmo que ela apareça no estado", () => {
    const d = { ...criarDossieVazio(), chave: "sk-ant-api03-exemplo", chaveApi: "x" } as Dossie;
    const texto = serializarDossie(d);
    expect(texto).not.toContain("sk-ant");
    expect(texto).not.toMatch(/chave/i);
  });

  it("descarta campos desconhecidos ao abrir", () => {
    const texto = JSON.stringify({ ...JSON.parse(serializarDossie(criarDossieVazio())), chave: "segredo" });
    const r = lerDossie(texto, "x.dossie.json");
    expect(r.ok).toBe(true);
    expect(r.ok && JSON.stringify(r.dossie)).not.toContain("segredo");
  });

  it("recusa arquivo sem a extensão .dossie.json", () => {
    expect(lerDossie(serializarDossie(criarDossieVazio()), "projeto.json")).toMatchObject({ ok: false });
  });

  it("recusa JSON que não é dossiê", () => {
    expect(lerDossie('{"a":1}', "x.dossie.json")).toMatchObject({
      ok: false,
      erro: expect.stringMatching(/não é um dossiê/),
    });
  });

  it("recusa dossiê de formato mais novo, com explicação", () => {
    const texto = JSON.stringify({ ...JSON.parse(serializarDossie(criarDossieVazio())), versaoFormato: 99 });
    expect(lerDossie(texto, "x.dossie.json")).toMatchObject({
      ok: false,
      erro: expect.stringMatching(/mais nova/),
    });
  });

  it("guarda as versões do app e da skill", () => {
    const d = JSON.parse(serializarDossie(criarDossieVazio()));
    expect(d.versaoApp).toMatch(/^\d+\.\d+\.\d+$/);
    expect(d.versaoSkill).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("monta o nome do arquivo", () => {
    const d = criarDossieVazio();
    d.projeto.nome = "Avaliação do Programa";
    expect(nomeArquivoDossie(d)).toBe("avaliacao-do-programa.dossie.json");
    expect(nomeArquivoDossie(criarDossieVazio())).toBe("projeto.dossie.json");
  });
});
