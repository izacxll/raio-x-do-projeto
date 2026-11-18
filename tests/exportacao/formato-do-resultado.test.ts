// Formato do resultado (decisão 0084): partes em ordem (capa, quadros, corpo, anexo), cada uma numa página; alertas e
// números-chave na capa; marcas no lugar do texto repetido em cada item, com a legenda e a contagem; modelo no rodapé.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { gerarDocx } from "../../src/exportacao/docx";
import { parteDaSecao } from "../../src/exportacao/resultado-da-etapa";
import {
  contarMarcas,
  legendaDasMarcas,
  linhaDeVersoes,
  marcasDoDocumento,
  marcasDoItem,
  modeloDaEtapa,
  secoesPorParte,
  TITULO_DO_ANEXO,
  type DocumentoExportavel,
} from "../../src/exportacao/modelo";

const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;

function documento(): DocumentoExportavel {
  return {
    titulo: "Resultado da etapa 4",
    projeto: "Projeto inventado",
    minuta: true,
    geradoEm: new Date(2026, 10, 18),
    versaoApp: "0.0.0",
    versaoSkill: "0.3.6",
    modelo: "claude-opus-5-5",
    secoes: [
      { titulo: "Placar do passo", parte: "anexo", paragrafos: ["achados: 0"] },
      {
        titulo: "Registro de riscos",
        paragrafos: [`${marcasDoItem(true, false)}[Sugestão] Risco de atraso.`],
      },
      {
        titulo: "O que decidir agora",
        parte: "capa",
        alertas: [{ nivel: "alto", texto: "O TR não informa o prazo de execução." }],
        numeros: [{ rotulo: "Marcos", valor: "6" }],
        paragrafos: [`${marcasDoItem(true, true)}[Sugestão] Confirmar a data de início.`],
      },
      {
        titulo: "Linha do tempo",
        parte: "quadros",
        tabela: { colunas: ["Marco", "Data"], linhas: [["P1", "—"]] },
      },
    ],
  };
}

describe("partes do documento", () => {
  it("capa, quadros, corpo e anexo, nessa ordem, qualquer que seja a de chegada", () => {
    expect(secoesPorParte(documento()).map((g) => [g.parte, g.secoes.map((s) => s.titulo)])).toEqual([
      ["capa", ["O que decidir agora"]],
      ["quadros", ["Linha do tempo"]],
      ["corpo", ["Registro de riscos"]],
      ["anexo", ["Placar do passo"]],
    ]);
  });
});

describe("marcas", () => {
  it("○ para pendente e ◊ para redação a conferir, contadas no começo de cada texto", () => {
    expect(marcasDoItem(true, true)).toBe("○◊ ");
    expect(marcasDoItem(false, false)).toBe("");
    expect(contarMarcas(["○ a", "○◊ b", "c ○", "◊ d"])).toEqual({ pendentes: 2, redacaoAConferir: 2 });
    expect(marcasDoDocumento(documento())).toEqual({ pendentes: 2, redacaoAConferir: 1 });
    expect(legendaDasMarcas({ pendentes: 2, redacaoAConferir: 1 })).toBe(
      "Marcas: ○ pendente de revisão do GP: 2 item(ns) · ◊ redação a conferir: 1 item(ns).",
    );
    expect(legendaDasMarcas({ pendentes: 0, redacaoAConferir: 0 })).toBe("");
  });
});

describe("DOCX no formato novo", () => {
  it("cada parte numa página, o anexo com o título dele, alerta, legenda e modelo no rodapé", async () => {
    const doc = documento();
    expect(linhaDeVersoes(doc)).toMatch(/skill PMO 0\.3\.6 · modelo claude-opus-5-5 · gerado em/);
    const arquivos = unzipSync(new Uint8Array(await (await gerarDocx(doc, logoBuffer)).arrayBuffer()));
    const corpo = strFromU8(arquivos["word/document.xml"]!);
    // a capa vem antes do corpo, e o anexo por último
    const pos = (t: string) => corpo.indexOf(t);
    expect(pos("O que decidir agora")).toBeLessThan(pos("Linha do tempo"));
    expect(pos("Linha do tempo")).toBeLessThan(pos("Registro de riscos"));
    expect(pos("Registro de riscos")).toBeLessThan(pos(TITULO_DO_ANEXO));
    expect(pos(TITULO_DO_ANEXO)).toBeLessThan(pos("Placar do passo"));
    // quadros, corpo e anexo começam numa página nova
    expect(corpo.match(/<w:pageBreakBefore\/>/g)?.length).toBe(3);
    expect(corpo).toContain("O TR não informa o prazo de execução.");
    expect(corpo).toContain("Marcas: ○ pendente de revisão do GP: 2 item(ns)");
    const rodapes = Object.keys(arquivos)
      .filter((n) => /^word\/footer\d*\.xml$/.test(n))
      .map((n) => strFromU8(arquivos[n]!))
      .join("");
    expect(rodapes).toContain("modelo claude-opus-5-5");
  });
});

describe("modelo no rodapé: o de cada passo guardado (revisão de código, 0084)", () => {
  it("sem passo rodado, nenhum; com passos, os modelos deles, não o do seletor", () => {
    const d = criarDossieVazio(new Date(2026, 10, 18));
    expect(modeloDaEtapa(d, 4)).toBeUndefined();
    const passo = (modelo: string) => ({ resposta: {}, modelo, em: "2026-11-18" });
    const comPassos = {
      ...d,
      pgp: { modelo: "seletor", adaptacao: passo("modelo-a"), riscos: passo("modelo-b") },
    } as unknown as typeof d;
    expect(modeloDaEtapa(comPassos, 4)).toBe("modelo-a, modelo-b");
  });
});

describe("resultado da etapa: seções do código no anexo", () => {
  it("o título terminado em (código) vai para o anexo; o resto fica onde estava", () => {
    expect(parteDaSecao({ titulo: "Conferência do TAP (código)" })).toBe("anexo");
    expect(parteDaSecao({ titulo: "O código de conduta" })).toBe("corpo");
    expect(parteDaSecao({ titulo: "Ficha", parte: "quadros" })).toBe("quadros");
  });
});
