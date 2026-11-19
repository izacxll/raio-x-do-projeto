// Padrão de apresentação (decisão 0089): o capítulo marcado com novaPagina (nível 1, fora do anexo) começa numa página
// nova; a subseção e o anexo ignoram a marca; sem a marca, só a primeira seção de cada parte quebra a página.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { apresentar } from "../../src/exportacao/apresentacao";
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

const capitulos = (novaPagina?: boolean, naSubsecao?: boolean): Secao[] => [
  { titulo: "1. Primeiro", paragrafos: ["Texto do primeiro."], novaPagina },
  { titulo: "1.1 Parte do primeiro", nivel: 2, paragrafos: ["Mais texto."], novaPagina: naSubsecao },
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
  it("cada capítulo marcado começa numa página nova", async () => {
    expect(await quebras(documento(capitulos(true)))).toBe(3);
  });

  it("a subseção marcada não quebra a página", async () => {
    expect(await quebras(documento(capitulos(true, true)))).toBe(3);
  });

  it("sem a marca, só a primeira seção do corpo quebra a página, como antes", async () => {
    expect(await quebras(documento(capitulos()))).toBe(1);
  });

  it("depois dos quadros, o primeiro capítulo marcado do corpo quebra uma vez só", async () => {
    const secoes: Secao[] = [
      { titulo: "Quadros", parte: "quadros", paragrafos: ["Quadro."] },
      { titulo: "1. Primeiro", paragrafos: ["Texto."], novaPagina: true },
      { titulo: "2. Segundo", paragrafos: ["Texto."], novaPagina: true },
    ];
    // os quadros, o primeiro e o segundo capítulo: nenhuma quebra a mais
    expect(await quebras(documento(secoes))).toBe(3);
  });

  it("no anexo, a marca não abre outra página depois do título ANEXOS", async () => {
    const secoes: Secao[] = [
      { titulo: "1. Corpo", paragrafos: ["Texto."] },
      { titulo: "A. Anexo", parte: "anexo", paragrafos: ["Texto do anexo."], novaPagina: true },
      { titulo: "A.1 Mais", parte: "anexo", nivel: 2, paragrafos: ["Mais."], novaPagina: true },
    ];
    // o corpo e o título ANEXOS
    expect(await quebras(documento(secoes))).toBe(2);
  });

  it("pelo apresentar(): a marca segue no corpo e sai no anexo técnico", () => {
    const base = documento([]);
    const corpo: Secao[] = [
      { titulo: "Primeiro", paragrafos: ["Texto."], novaPagina: true },
      { titulo: "Segundo", paragrafos: ["Texto."], novaPagina: true },
    ];
    const tecnico: Secao[] = [
      { titulo: "Placar (código)", parte: "anexo", paragrafos: ["x"], novaPagina: true },
    ];
    const d = apresentar(base, corpo, tecnico, {
      nomeDaRfp: "TR",
      tituloDoEstudo: "Estudo inventado",
      etapa: 2,
      nomeDaEtapa: "Proposta",
      destaques: [],
    });
    const doCorpo = d.secoes.filter(
      (s) => (s.parte ?? "corpo") === "corpo" && /Primeiro|Segundo/.test(s.titulo),
    );
    expect(doCorpo.map((s) => s.novaPagina)).toEqual([true, true]);
    expect(d.secoes.filter((s) => s.parte === "anexo").some((s) => s.novaPagina)).toBe(false);
  });
});
