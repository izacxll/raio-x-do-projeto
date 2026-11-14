// F5b (decisão 0013): leitura opcional do PMO na conferência, com a resposta gravada para o plano de teste da etapa 5
// (tests/fixtures/gerados/conferencia/politicas-mulheres/leitura-pmo.json). Confere as travas, todas em código:
// citação na página, ausente procurado no plano inteiro (e rebaixado se achado), gravidade e categoria pela parte.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { conferirLeitura, pedidoLeitura } from "../../src/etapas/5-conferencia/leitura-pmo";
import { RespostaLeitura } from "../../src/pmo/schemas/leitura";
import type { Achado } from "../../src/regras/achado";
import { paginasDoTexto } from "./erros-plantados.test";

const PASTA = new URL("../fixtures/gerados/conferencia/politicas-mulheres/", import.meta.url);
const pgp: DocumentoLido = {
  id: "pgp",
  papel: "pgp",
  nomeArquivo: "plano.md",
  tamanhoBytes: 1,
  totalPaginas: 25,
  lidoEm: "",
  paginas: paginasDoTexto(readFileSync(new URL("plano.md", PASTA), "utf-8")),
};
const resposta = RespostaLeitura.parse(JSON.parse(readFileSync(new URL("leitura-pmo.json", PASTA), "utf-8")));

describe("leitura do PMO na conferência (travas do código)", () => {
  const conferidos = conferirLeitura(resposta, { pgp }, []);
  const de = (id: string) => conferidos.find((a) => a.id === id)!;

  it("as citações do PMO são achadas na página do plano", () => {
    for (const id of ["pmo-1", "pmo-2", "pmo-3"]) {
      expect(de(id).situacao, id).toBe("valido");
      expect(de(id).citacoes[0]?.estado, id).toBe("conferida");
    }
  });

  it("ausente que o código acha no plano é rebaixado e mostra onde está", () => {
    expect(de("pmo-4").situacao).toBe("rebaixado");
    expect(de("pmo-4").localizadoEm?.pagina).toBe(11);
  });

  it("ausente que o código também não acha continua valendo como sugestão", () => {
    expect(de("pmo-5").situacao).toBe("valido");
  });

  it("gravidade e categoria pela parte do plano, nunca pelo PMO", () => {
    expect(de("pmo-1").gravidade).toBe("baixa"); // B18: designações da equipe (tabela da especificação)
    expect(de("pmo-2").gravidade).toBe("grave");
    expect(de("pmo-3").gravidade).toBe("grave");
    expect(de("pmo-2").categoria).not.toBe("—");
  });

  it("citação que não está no plano fica 'não conferida'", () => {
    const falsa = {
      ...resposta,
      achados: [
        {
          ...resposta.achados[0]!,
          id: "falsa",
          evidencias: [
            {
              doc: "pgp" as const,
              pagina: 11,
              trecho: "a equipe trabalha em regime de dedicação exclusiva integral",
            },
          ],
        },
      ],
    };
    expect(conferirLeitura(falsa, { pgp }, [])[0]?.situacao).toBe("citacao-nao-conferida");
  });

  it("achado que o código já apontou na mesma parte é marcado", () => {
    const doCodigo = {
      id: "vago:A8:x",
      tipo: "vago",
      parte: "A8",
      descricao: "",
      titulo: "",
    } as unknown as Achado;
    expect(
      conferirLeitura(resposta, { pgp }, [doCodigo]).find((a) => a.id === "pmo-2")?.jaApontadoPeloCodigo,
    ).toBe("vago:A8:x");
  });

  it("o pedido leva o que o código já apontou e o conteúdo mínimo só das partes presentes", () => {
    const p = pedidoLeitura({
      partesPresentes: ["A8", "B27"],
      caracteristicas: CARACTERISTICAS_PADRAO,
      premissasAplicaveis: { PC3: true },
      achadosDoCodigo: [{ tipo: "ausente", parte: "A7", titulo: "Reuniões internas" } as unknown as Achado],
      temTap: true,
      temRfp: false,
    });
    expect(p).toContain("ausente · A7 · Reuniões internas");
    expect(p).toContain("### A8 —");
    expect(p).toContain("## Perguntas de qualidade");
    expect(p).not.toContain("### A5 —");
    expect(p).toContain("PC3");
  });
});

describe("leitura do PMO no relatório de conformidade", () => {
  it("sai numa seção própria, como sugestão, e mantém a minuta até o GP decidir", async () => {
    const { montarRelatorioConformidade, montarListaAchados } =
      await import("../../src/exportacao/relatorio-conformidade");
    const { criarDossieVazio } = await import("../../src/dossie/arquivo");
    const leitura = conferirLeitura(resposta, { pgp }, []);
    const dossie = criarDossieVazio();
    const doc = montarRelatorioConformidade(dossie, [], [], new Date(2026, 10, 13), leitura);
    const secao = doc.secoes.find((s) => s.titulo === "Leitura do PMO (sugestões)")!;
    expect(secao.tabela!.linhas).toHaveLength(5);
    expect(secao.tabela!.linhas.find((l) => l[0] === "PMO-4")?.[4]).toMatch(/rebaixado/);
    expect(doc.minuta).toBe(true);
    expect(montarListaAchados(dossie, [], new Date(), leitura).secoes.map((s) => s.titulo)).toContain(
      "Leitura do PMO",
    );
  });
});
