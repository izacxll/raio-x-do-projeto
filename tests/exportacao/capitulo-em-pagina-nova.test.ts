// Padrão de apresentação (decisão 0089): a seção marcada com novaPagina começa numa página nova; sem a marca, só a
// primeira seção de cada parte quebra a página, como antes.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { gerarDocxApresentacao } from "../../src/exportacao/docx-apresentacao";
import type { DocumentoExportavel, Secao } from "../../src/exportacao/modelo";

const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;

function documento(secoes: Secao[]): DocumentoExportavel {
  return {
    titulo: "Documento inventado",
    projeto: "Projeto inventado",
    minuta: false,
    geradoEm: new Date(2026, 10, 19),
    versaoApp: "0.0.0",
    versaoSkill: "0.0.0",
    secoes,
    apresentacao: { titulo: "Capítulos", etapa: "Teste", destaques: [] },
  };
}

const capitulos = (novaPagina?: boolean): Secao[] => [
  { titulo: "1. Primeiro", paragrafos: ["Texto do primeiro."], novaPagina },
  { titulo: "1.1 Parte do primeiro", nivel: 2, paragrafos: ["Mais texto."] },
  { titulo: "2. Segundo", paragrafos: ["Texto do segundo."], novaPagina },
  { titulo: "3. Terceiro", paragrafos: ["Texto do terceiro."], novaPagina },
];

async function quebras(doc: DocumentoExportavel): Promise<number> {
  const arquivos = unzipSync(
    new Uint8Array(await (await gerarDocxApresentacao(doc, logoBuffer)).arrayBuffer()),
  );
  return strFromU8(arquivos["word/document.xml"]!).match(/<w:pageBreakBefore\/>/g)?.length ?? 0;
}

describe("capítulo em página nova", () => {
  it("cada seção marcada começa numa página nova; a subseção não", async () => {
    expect(await quebras(documento(capitulos(true)))).toBe(3);
  });

  it("sem a marca, só a primeira seção do corpo quebra a página, como antes", async () => {
    expect(await quebras(documento(capitulos()))).toBe(1);
  });
});
