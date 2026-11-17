// Montador XLSX: uma aba por seção que tem tabela.
import ExcelJS from "exceljs";
import { cor } from "../interface/tokens";
import { linhaDeVersoes, TEXTO_MINUTA, type DocumentoExportavel } from "./modelo";

const argb = (nome: string) => `FF${cor(nome)}`;

/** Nome de aba válido no Excel: até 31 caracteres, sem : \ / ? * [ ], e sem repetir. */
export function nomeDeAba(titulo: string, usados: Set<string>): string {
  const base =
    titulo
      .replace(/[:\\/?*[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 28) || "Planilha";
  let nome = base;
  for (let i = 2; usados.has(nome.toLowerCase()); i++) nome = `${base.slice(0, 27)} ${i}`;
  usados.add(nome.toLowerCase());
  return nome;
}

export async function gerarXlsx(doc: DocumentoExportavel, logo: ArrayBuffer): Promise<Blob> {
  const livro = new ExcelJS.Workbook();
  livro.creator = "Raio-X do Projeto";
  livro.created = doc.geradoEm;
  const idLogo = livro.addImage({ buffer: logo, extension: "jpeg" });
  const usados = new Set<string>();

  for (const s of doc.secoes) {
    if (!s.tabela) continue;
    const aba = livro.addWorksheet(nomeDeAba(s.titulo, usados));
    aba.addImage(idLogo, { tl: { col: 0, row: 0 }, ext: { width: 180, height: 30 } });
    aba.getRow(1).height = 28;

    const linhasTopo: [string, string, boolean][] = [
      [doc.titulo, "navy", true],
      [`${doc.projeto} · ${s.titulo}`, "navy700", true],
      [linhaDeVersoes(doc), "ink", false],
    ];
    if (doc.minuta) linhasTopo.unshift([TEXTO_MINUTA, "vinho", true]);
    let linha = 2;
    for (const [texto, nomeCor, negrito] of linhasTopo) {
      const c = aba.getCell(linha, 1);
      c.value = texto;
      c.font = { name: "Arial", size: 10, bold: negrito, color: { argb: argb(nomeCor) } };
      linha++;
    }
    linha++;

    const t = s.tabela;
    const cab = aba.getRow(linha);
    t.colunas.forEach((c, i) => {
      const cel = cab.getCell(i + 1);
      cel.value = c;
      cel.font = { name: "Arial", size: 10, bold: true, color: { argb: argb("white") } };
      cel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb("navy") } };
    });
    const borda = { style: "thin" as const, color: { argb: argb("bd") } };
    for (const valores of t.linhas) {
      linha++;
      const r = aba.getRow(linha);
      valores.forEach((v, i) => {
        const cel = r.getCell(i + 1);
        const numero = /^\d+$/.test(v) ? Number(v) : null;
        cel.value = numero ?? v;
        cel.font = { name: "Arial", size: 10, color: { argb: argb("txt") } };
        cel.alignment = { vertical: "top", wrapText: true };
        cel.border = { top: borda, bottom: borda, left: borda, right: borda };
      });
    }
    const larguras = t.larguras ?? t.colunas.map(() => 1);
    larguras.forEach((l, i) => {
      aba.getColumn(i + 1).width = Math.max(10, Math.round(l * 12));
    });
  }

  if (!livro.worksheets.length) {
    const aba = livro.addWorksheet("Leitura");
    aba.getCell(1, 1).value = "Nenhum documento lido.";
  }
  const buffer = await livro.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
