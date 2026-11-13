// Extração dos requisitos da RFP (primeira versão, construída na F5 e reaproveitada na F1).
// Nesta versão, só os produtos e entregáveis rotulados ("Produto 1 – Plano de trabalho").
// O que o código não acha, o GP acrescenta na tela: requisito não localizado pelo código nunca vira "ausente".
import type { PaginaLida } from "../dossie/esquema";
import { normalizarTermo, trechoEmVolta } from "../regras/busca";

export interface Requisito {
  /** R01, R02… O número não muda se o GP editar a lista; requisito novo ganha o próximo. */
  numero: string;
  /** "Produto 1", "Entregável 3". */
  rotulo: string;
  descricao: string;
  pagina: number;
  trecho: string;
  origem: "codigo" | "gp";
}

const ROMANOS: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
};

const RE_PRODUTO =
  /^\s*(produto|entreg[aá]vel)\s*(?:n[º°.o]?\s*)?(\d{1,2}|[ivx]{1,4})\b\s*[-–—:.)]\s*(.{3,})$/i;

function numeroDoRotulo(n: string): number {
  return /^\d+$/.test(n) ? Number(n) : (ROMANOS[n.toLowerCase()] ?? 0);
}

/** Junta a palavra partida no fim da linha ("traba-" + "lho") e limpa espaços. */
function limparDescricao(texto: string): string {
  return (
    texto
      .replace(/\s+/g, " ")
      // colunas numéricas da tabela que vêm grudadas na descrição (prazo em dias, percentual)
      .replace(/(?:\s+\d+(?:[.,]\d+)?\s*%?)+\s*$/, "")
      .trim()
  );
}

export function extrairRequisitos(paginas: PaginaLida[]): Requisito[] {
  const vistos = new Map<string, Requisito>();
  for (const p of paginas) {
    if (p.origem === "nao-verificavel") continue;
    const linhas = p.texto.split(/\r?\n/);
    let posicao = 0;
    linhas.forEach((linha, i) => {
      const inicio = posicao;
      posicao += linha.length + 1;
      const m = RE_PRODUTO.exec(linha.replace(/\t+/g, " "));
      if (!m?.[1] || !m[2] || !m[3]) return;
      const numero = numeroDoRotulo(m[2]);
      if (!numero) return;
      const tipo = /^produto/i.test(m[1]) ? "Produto" : "Entregável";
      const chave = `${tipo} ${numero}`;
      // a descrição pode continuar na linha seguinte quando termina partida ("Plano de traba-")
      let descricao = m[3];
      const seguinte = linhas[i + 1];
      if (/-\s*$/.test(descricao) && seguinte) descricao = descricao.replace(/-\s*$/, "") + seguinte.trim();
      descricao = limparDescricao(descricao);
      const anterior = vistos.get(chave);
      // fica a primeira ocorrência, salvo se a seguinte trouxer a descrição mais completa
      if (anterior && anterior.descricao.length >= descricao.length) return;
      vistos.set(chave, {
        numero: anterior?.numero ?? "",
        rotulo: chave,
        descricao,
        pagina: anterior?.pagina ?? p.numero,
        trecho: anterior?.trecho ?? trechoEmVolta(p.texto, inicio, linha.length, 20),
        origem: "codigo",
      });
    });
  }
  return [...vistos.values()]
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR", { numeric: true }))
    .map((r, i) => ({ ...r, numero: `R${String(i + 1).padStart(2, "0")}` }));
}

/** Termos para procurar o requisito em outro documento: o rótulo e o começo da descrição. */
export function termosDoRequisito(r: Requisito): string[] {
  const termos = [r.descricao.split(/[,;(]/)[0] ?? r.descricao];
  const palavras = normalizarTermo(termos[0] ?? "").split(" ");
  // descrição longa: as 5 primeiras palavras bastam para achar o produto citado de forma resumida
  if (palavras.length > 5) termos.push(palavras.slice(0, 5).join(" "));
  return termos.filter((t) => normalizarTermo(t).length >= 8);
}
