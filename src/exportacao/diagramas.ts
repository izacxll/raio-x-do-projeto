// Diagramas da etapa 4 em SVG, montados pelo código: a EAP (projeto → produtos → pacotes) e o diagrama de rede
// (atividades em colunas pela ordem de dependência, setas das predecessoras, caminho crítico destacado).
import type { Cronograma } from "../etapas/2-proposta/cronograma";
import { cor } from "../interface/tokens";
import type { PacoteEap } from "../pmo/schemas/pgp";
import type { AtividadeEap } from "../pmo/schemas/proposta";

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Quebra o texto em linhas de até `largura` caracteres (no máximo `max` linhas). */
function linhas(texto: string, largura: number, max = 3): string[] {
  const out: string[] = [];
  let atual = "";
  for (const p of texto.split(/\s+/)) {
    if ((atual + " " + p).trim().length > largura) {
      if (atual) out.push(atual);
      atual = p;
    } else atual = (atual + " " + p).trim();
  }
  if (atual) out.push(atual);
  if (out.length > max) return [...out.slice(0, max - 1), `${out[max - 1]}…`];
  return out;
}

function caixa(x: number, y: number, w: number, h: number, texto: string[], destaque = false): string {
  const borda = destaque ? cor("vinho") : cor("navy");
  const t = texto
    .map(
      (l, k) =>
        `<text x="${x + w / 2}" y="${y + 18 + k * 14}" text-anchor="middle" font-family="Arial" font-size="11" fill="#${cor("navy950")}">${esc(l)}</text>`,
    )
    .join("");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#${cor("white")}" stroke="#${borda}" stroke-width="${destaque ? 2.5 : 1.2}"/>${t}`;
}

const envolver = (w: number, h: number, corpo: string, titulo: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>${esc(titulo)}</title><rect width="100%" height="100%" fill="#${cor("white")}"/>${corpo}</svg>\n`;

export function svgDaEap(projeto: string, pacotes: PacoteEap[]): string {
  const produtos = [...new Set(pacotes.map((p) => p.produto))];
  const W = 170;
  const H = 52;
  const gap = 20;
  const largura = Math.max(produtos.length * (W + gap) + gap, W + 2 * gap);
  const maxPacotes = Math.max(1, ...produtos.map((pr) => pacotes.filter((p) => p.produto === pr).length));
  const altura = 40 + H + 50 + H + 30 + maxPacotes * (H + 14) + 20;
  const raizX = largura / 2 - W / 2;
  let corpo = caixa(raizX, 20, W, H, linhas(projeto || "Projeto", 24, 3), true);
  produtos.forEach((pr, i) => {
    const x = gap + i * (W + gap);
    const y = 20 + H + 50;
    corpo += `<path d="M${largura / 2} ${20 + H} V${y - 25} H${x + W / 2} V${y}" fill="none" stroke="#${cor("navy")}"/>`;
    corpo += caixa(x, y, W, H, [pr]);
    pacotes
      .filter((p) => p.produto === pr)
      .forEach((p, k) => {
        const yy = y + H + 30 + k * (H + 14);
        corpo += `<path d="M${x + 10} ${y + H} V${yy + H / 2} H${x + 20}" fill="none" stroke="#${cor("navy")}"/>`;
        corpo += caixa(x + 20, yy, W - 20, H, linhas(`${p.id} ${p.nome}`, 22, 3));
      });
  });
  return envolver(largura, altura, corpo, "Estrutura analítica do projeto");
}

export function svgDaRede(crono: Cronograma, atividades: AtividadeEap[]): string {
  const pred = new Map(atividades.map((a) => [a.id, a.predecessoras]));
  // coluna: o nível de dependência (maior caminho de predecessoras até a atividade)
  const nivel = new Map<string, number>();
  const porId = new Map(crono.atividades.map((a) => [a.id, a]));
  const nivelDe = (id: string, pilha = new Set<string>()): number => {
    if (nivel.has(id)) return nivel.get(id)!;
    if (pilha.has(id)) return 0;
    pilha.add(id);
    const a = porId.get(id);
    const ps = (pred.get(id) ?? []).filter((p) => porId.has(p));
    const n = a && ps.length ? 1 + Math.max(...ps.map((p) => nivelDe(p, pilha))) : 0;
    nivel.set(id, n);
    return n;
  };
  crono.atividades.forEach((a) => nivelDe(a.id));
  const colunas = new Map<number, string[]>();
  for (const a of crono.atividades)
    colunas.set(nivel.get(a.id)!, [...(colunas.get(nivel.get(a.id)!) ?? []), a.id]);
  const W = 150;
  const H = 62;
  const gx = 50;
  const gy = 18;
  const nCol = Math.max(1, colunas.size);
  const nLin = Math.max(1, ...[...colunas.values()].map((c) => c.length));
  const largura = 30 + nCol * (W + gx);
  const altura = 50 + nLin * (H + gy) + 30;
  const pos = new Map<string, { x: number; y: number }>();
  [...colunas.entries()].forEach(([c, ids]) =>
    ids.forEach((id, k) => pos.set(id, { x: 20 + c * (W + gx), y: 40 + k * (H + gy) })),
  );
  let corpo = `<text x="20" y="24" font-family="Arial" font-size="12" fill="#${cor("navy950")}">Diagrama de rede — em destaque, o caminho crítico (conta do código). Total: ${crono.total} dias úteis.</text>`;
  for (const a of crono.atividades)
    for (const p of pred.get(a.id) ?? []) {
      const de = pos.get(p);
      const para = pos.get(a.id);
      if (!de || !para) continue;
      const critica = a.critica && porId.get(p)?.critica;
      corpo += `<path d="M${de.x + W} ${de.y + H / 2} C${de.x + W + gx / 2} ${de.y + H / 2} ${para.x - gx / 2} ${para.y + H / 2} ${para.x} ${para.y + H / 2}" fill="none" stroke="#${critica ? cor("vinho") : cor("ink")}" stroke-width="${critica ? 2 : 1}"/>`;
    }
  for (const a of crono.atividades) {
    const p = pos.get(a.id)!;
    corpo += caixa(
      p.x,
      p.y,
      W,
      H,
      [...linhas(`${a.id} ${a.nome}`, 22, 2), `${a.duracao} d · folga ${a.folga}`],
      a.critica,
    );
  }
  return envolver(largura, altura, corpo, "Diagrama de rede");
}
