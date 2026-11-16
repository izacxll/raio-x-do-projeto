// Julgamento (etapa 1, passo 5): critério, modo de disputa, pesos ou fórmula e a tabela de pontuação técnica.
import { normalizarTermo } from "../../regras/busca";
import { limparEspacos } from "../../texto/frase";
import { campoDaCapa, lerCapa } from "./capa";
import { itemSemAchado, type DocumentoRfp, type ItemAnalise } from "./item";
import { localizarPrimeiro, localizarTodos, origemDe } from "./localizar";
import { faixasDoTema, type MapaRfp } from "./mapa";

export const CRITERIOS: [string, RegExp][] = [
  ["Técnica e preço", /tecnica e preco/],
  ["Melhor técnica", /melhor tecnica/],
  ["Maior desconto", /maior desconto/],
  ["Maior retorno econômico", /maior retorno economico/],
  ["Maior lance", /maior lance/],
  ["Menor preço", /menor preco/],
  ["Melhor conteúdo artístico", /melhor conteudo artistico/],
];

function nomeDoCriterio(texto: string): string | undefined {
  const n = normalizarTermo(texto);
  return CRITERIOS.find(([, re]) => re.test(n))?.[0];
}

/** Critério de uma tabela de pontuação com coluna de níveis ("(A) Apresentação…" | "REGULAR – 5 pontos…"). */
export interface CriterioPontuado {
  letra: string;
  descricao: string;
  /** Maior pontuação entre os níveis do critério (conta do código). */
  maximo: number;
  /** "REGULAR 5; PARCIAL 2; IRREGULAR 0" */
  niveis: string;
  doc: DocumentoRfp;
  pagina: number;
  trecho: string;
}

/** Nível da coluna de pontuação: palavra em maiúsculas seguida de traço e "N pontos". */
const RE_NIVEL =
  /(?:^|\s|(?<=[a-zà-ú.,;)]))((?:REGULAR|PARCIAL|IRREGULAR|INSUFICIENTE|SUFICIENTE|ÓTIMO|OTIMO|BOM|EXCELENTE|RUIM|PLENO|ATENDE(?: PARCIALMENTE| PLENAMENTE)?|NÃO ATENDE|NAO ATENDE))\s*[-–—:]\s*(.*)$/;
const RE_LETRA = /^\(?([A-Z])\)\s+(.*)$/;

/** O texto do nível depois dos pontos: "4 ou 3 pontos: parcial demonstração de" → "parcial demonstração de". */
function textoDoNivel(resto: string): string {
  return resto.replace(/^[^:]*:\s*/, "").trim();
}

/**
 * Lê a tabela de critérios com duas colunas que o leitor de PDF cola na mesma linha: à esquerda o critério,
 * que começa com a letra entre parênteses e continua nas linhas de baixo; à direita os níveis ("REGULAR – 5
 * pontos", "PARCIAL – 4 ou 3 ou 2 ou 1 pontos", "IRREGULAR – 0 pontos"), que podem vir antes da linha da letra.
 */
export function lerTabelaDeNiveis(
  docs: DocumentoRfp[],
  faixas?: Map<string, Set<number>>,
): CriterioPontuado[] {
  const out: CriterioPontuado[] = [];
  for (const d of docs) {
    const faixa = faixas?.get(d.id);
    if (faixas && !faixa) continue;
    let atual: (CriterioPontuado & { pontos: number[]; lista: string[] }) | undefined;
    let pendentes: { nome: string; pontos: number[] }[] = [];
    const fechar = () => {
      if (atual && atual.pontos.length) {
        const { pontos, lista, ...resto } = atual;
        out.push({ ...resto, maximo: Math.max(...pontos), niveis: lista.join("; ") });
      }
      atual = undefined;
    };
    // os textos completos dos níveis ("parcial demonstração de atendimento do critério."): servem para tirar
    // do critério o pedaço do nível que o leitor de PDF colou na linha de baixo
    const completos = d.paginas
      .filter((p) => !faixa || faixa.has(p.numero))
      .flatMap((p) => p.texto.split("\n"))
      .map((l) => RE_NIVEL.exec(l.replace(/\t+/g, " ").trim())?.[2] ?? "")
      .filter((t) => /\.\s*$/.test(t))
      .map(textoDoNivel);
    let incompleto: string | undefined;
    for (const p of d.paginas) {
      if (faixa && !faixa.has(p.numero)) continue;
      const linhas = p.texto.split("\n");
      linhas.forEach((original, i) => {
        const linha = original.replace(/\t+/g, " ").trim();
        if (!linha) return;
        const nivel = RE_NIVEL.exec(linha);
        const esquerda = (nivel ? linha.slice(0, nivel.index) : linha).trim();
        const nivelInfo = nivel?.[1]
          ? {
              nome: nivel[1],
              pontos: [...(nivel[2] ?? "").matchAll(/(\d{1,3})\s*(?=ou|pontos?|pts|\s|$)/g)]
                .map((m) => Number(m[1]))
                .filter((n) => n <= 100),
            }
          : undefined;
        // linha do total ou fim da tabela
        if (/^(?:pontua[cç][aã]o|nota) (?:m[aá]xima|total)/i.test(linha) || /^\d+(?:\.\d+)+\s/.test(linha)) {
          fechar();
          pendentes = [];
          return;
        }
        const letra = RE_LETRA.exec(esquerda);
        if (letra?.[1]) {
          fechar();
          atual = {
            letra: letra[1],
            descricao: letra[2] ?? "",
            maximo: 0,
            niveis: "",
            doc: d,
            pagina: p.numero,
            trecho: linha,
            pontos: pendentes.flatMap((x) => x.pontos),
            lista: pendentes.map((x) => `${x.nome} ${Math.max(...x.pontos, 0)}`),
          };
          pendentes = [];
        } else if (atual && esquerda) {
          // continuação do critério; o fim do texto do nível anterior ("…parcial demonstração de" +
          // "atendimento do critério.") vem colado no fim da linha e sai daqui
          let resto = esquerda;
          if (incompleto) {
            const completo = completos.find((c) => c.startsWith(incompleto ?? "") && c !== incompleto);
            const falta = completo?.slice(incompleto.length).trim();
            if (falta && resto.endsWith(falta)) resto = resto.slice(0, -falta.length).trim();
          }
          if (resto) atual.descricao += ` ${resto}`;
        }
        incompleto = nivel?.[2] && !/\.\s*$/.test(nivel[2]) ? textoDoNivel(nivel[2]) : undefined;
        if (nivelInfo?.pontos.length) {
          // nível sem critério na linha, com a letra na linha de baixo: é do critério seguinte quando o atual já
          // tem esse nível ("REGULAR" de novo); senão, é o último nível do atual ("IRREGULAR")
          const proxima = (linhas[i + 1] ?? "").replace(/\t+/g, " ").trim();
          const jaTem = atual?.lista.some((n) => n.startsWith(`${nivelInfo.nome} `));
          if (!esquerda && RE_LETRA.test(proxima) && (!atual || jaTem)) {
            pendentes.push(nivelInfo);
            return;
          }
          if (atual) {
            atual.pontos.push(...nivelInfo.pontos);
            atual.lista.push(`${nivelInfo.nome} ${Math.max(...nivelInfo.pontos)}`);
          } else pendentes.push(nivelInfo);
        }
      });
    }
    fechar();
  }
  return out
    .filter((c) => c.niveis)
    .map((c) => ({ ...c, descricao: limparEspacos(c.descricao).replace(/\s+([.,;])/g, "$1") }));
}

/** Os critérios da tabela, a pontuação máxima e a mínima, e a soma das máximas conferida pelo código. */
function itensDaTabela(
  docs: DocumentoRfp[],
  faixas: Map<string, Set<number>> | undefined,
  tabela: CriterioPontuado[],
): ItemAnalise[] {
  const itens: ItemAnalise[] = tabela.map((c) => ({
    id: `julgamento:criterio-pontuado:${c.letra}`,
    secao: "julgamento",
    rotulo: "documento",
    nome: `Critério (${c.letra})`,
    texto: c.descricao,
    campos: { Pontos: String(c.maximo), Níveis: c.niveis },
    origem: { documento: c.doc.rotulo, pagina: c.pagina, trecho: `(${c.letra}) ${c.descricao}` },
    situacao: "localizado",
    nota: "Pontos: o maior nível do critério, lido da coluna de pontuação.",
  }));
  const soma = tabela.reduce((s, c) => s + c.maximo, 0);
  const maxima = localizarPrimeiro(
    docs,
    /\b(?:pontuacao|nota) (?:maxima|total)\b[^.;]{0,30}?\b(\d{1,4})\s*(?:\([a-z ]+\)\s*)?pontos\b/,
    faixas,
  );
  const nMaxima = maxima
    ? Number(/(\d{1,4})\s*(?:\([a-z ]+\)\s*)?pontos/.exec(maxima.termo)?.[1])
    : undefined;
  itens.push({
    id: "julgamento:pontuacao-maxima",
    secao: "julgamento",
    rotulo: "documento",
    nome: "Pontuação máxima",
    texto: nMaxima
      ? `${nMaxima} pontos; a soma das máximas dos critérios dá ${soma}${soma === nMaxima ? " (confere)" : " (não confere: conferir a tabela)"}`
      : `soma das máximas dos critérios: ${soma} pontos (o documento não traz a pontuação máxima em número)`,
    campos: { Pontos: String(nMaxima ?? soma) },
    origem: maxima ? origemDe(maxima) : undefined,
    situacao: nMaxima ? "localizado" : "calculado",
    nota: "Soma feita pelo código.",
  });
  const minima = localizarPrimeiro(
    docs,
    /\b(?:pontuacao|nota)\b[^.;]{0,40}\b(?:inferior a|menor (?:que|do que)|abaixo de)\s+(\d{1,4})\s*(?:\([a-z ]+\)\s*)?pontos\b|\b(?:pontuacao|nota) minima\b[^.;]{0,30}?\b(\d{1,4})\s*(?:\([a-z ]+\)\s*)?pontos\b/,
    faixas,
  );
  const m = minima && /(\d{1,4})\s*(?:\([a-z ]+\)\s*)?pontos/.exec(minima.termo);
  if (minima && m?.[1])
    itens.push({
      id: "julgamento:pontuacao-minima",
      secao: "julgamento",
      rotulo: "documento",
      nome: "Pontuação mínima (abaixo dela, eliminada)",
      texto: `${m[1]} pontos`,
      campos: { Pontos: m[1] },
      origem: origemDe(minima),
      situacao: "localizado",
    });
  return itens;
}

export function extrairJulgamento(docs: DocumentoRfp[], mapa: MapaRfp): ItemAnalise[] {
  const itens: ItemAnalise[] = [];
  const doc = docs[0];
  const capa = doc ? lerCapa(doc) : [];
  const idCriterio = "julgamento:criterio";

  // critério: o quadro da capa, ou a frase "critério de julgamento…", ou "tipo técnica e preço"
  const tipo = campoDaCapa(capa, /^tipo de licitacao/);
  const c = campoDaCapa(capa, /criterio de julgamento|^julgamento/);
  const daCapa = [tipo, c].find((x) => x && nomeDoCriterio(x.valor));
  if (doc && daCapa) {
    const p = doc.originais.find((x) => x.numero === daCapa.pagina);
    itens.push({
      id: idCriterio,
      secao: "julgamento",
      rotulo: "documento",
      nome: "Critério de julgamento",
      texto: `${nomeDoCriterio(daCapa.valor)} (${daCapa.valor})`,
      origem: {
        documento: doc.rotulo,
        pagina: daCapa.pagina,
        trecho: limparEspacos(p?.texto.slice(daCapa.posicao, daCapa.posicao + 160) ?? daCapa.valor),
      },
      situacao: "localizado",
    });
  } else {
    const l =
      localizarPrimeiro(
        docs,
        /\b(?:criterio de julgamento|julgamento pelo|tipo)\b[^.;]{0,40}?\b(?:tecnica e preco|melhor tecnica|maior desconto|maior retorno economico|maior lance|menor preco|melhor conteudo artistico)\b/,
      ) ?? localizarPrimeiro(docs, /\b(?:tecnica e preco|menor preco|maior desconto|melhor tecnica)\b/);
    const nome = l ? nomeDoCriterio(l.termo) : undefined;
    // chamamento e seleção por pontos: "a avaliação e a pontuação serão feitas com base nos critérios de
    // julgamento" (sem técnica e preço nem menor preço)
    const porPontos = nome
      ? undefined
      : localizarPrimeiro(
          docs,
          /\bpontuac\w*\b[^.;]{0,80}\bcriterios? de (?:julgamento|avaliacao|selecao|pontuacao)\b|\bcriterios? de (?:julgamento|avaliacao|selecao)\b[^.;]{0,80}\bpontu\w*/,
          faixasDoTema(mapa, "julgamento", "proposta"),
        );
    if (l && nome)
      itens.push({
        id: idCriterio,
        secao: "julgamento",
        rotulo: "documento",
        nome: "Critério de julgamento",
        texto: nome,
        origem: origemDe(l),
        situacao: "localizado",
      });
    else if (porPontos)
      itens.push({
        id: idCriterio,
        secao: "julgamento",
        rotulo: "documento",
        nome: "Critério de julgamento",
        texto: "Pontuação por critérios",
        origem: origemDe(porPontos),
        situacao: "localizado",
        nota: "Seleção pela soma de pontos dos critérios da tabela (sem disputa de preço).",
      });
    else
      itens.push(
        itemSemAchado(docs, { id: idCriterio, secao: "julgamento", nome: "Critério de julgamento" }),
      );
  }

  const modo = campoDaCapa(capa, /^modo de disputa/);
  const lModo = modo
    ? undefined
    : localizarPrimeiro(
        docs,
        /\bmodo de disputa\b[^.;]{0,30}?\b(?:aberto e fechado|fechado e aberto|aberto|fechado)\b/,
      );
  if (doc && modo)
    itens.push({
      id: "julgamento:modo",
      secao: "julgamento",
      rotulo: "documento",
      nome: "Modo de disputa",
      texto: modo.valor,
      origem: { documento: doc.rotulo, pagina: modo.pagina, trecho: `MODO DE DISPUTA: ${modo.valor}` },
      situacao: "localizado",
    });
  else if (lModo)
    itens.push({
      id: "julgamento:modo",
      secao: "julgamento",
      rotulo: "documento",
      nome: "Modo de disputa",
      texto: /aberto e fechado|fechado e aberto|aberto|fechado/.exec(lModo.termo)?.[0] ?? lModo.termo,
      origem: origemDe(lModo),
      situacao: "localizado",
    });

  // pesos e fórmula da nota final (técnica e preço)
  const faixas = faixasDoTema(mapa, "julgamento", "proposta");
  const pesos = localizarTodos(
    docs,
    /\b(?:peso|fator de ponderacao|ponderacao)\b[^.;]{0,80}?\d{1,3}(?:[.,]\d+)?\s*%?|\b\d{1,3}\s*%\s*(?:\([a-z ]+\)\s*)?(?:para|a|da|na)\s+(?:a\s+)?(?:proposta|nota|pontuacao)?\s*(?:tecnica|de preco|preco)\b|\b(?:nf|nota final|if|indice final)\s*=\s*[^.;]{5,120}/,
    faixas,
  );
  const vistas = new Set<string>();
  for (const l of pesos) {
    const chave = normalizarTermo(l.frase).slice(0, 120);
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    itens.push({
      id: `julgamento:peso:${l.pagina}:${l.posicao}`,
      secao: "julgamento",
      rotulo: "documento",
      nome: "Peso ou fórmula da nota",
      texto: l.frase,
      origem: origemDe(l),
      situacao: "localizado",
    });
    if (vistas.size >= 5) break;
  }

  // tabela de critérios com coluna de níveis (REGULAR / PARCIAL / IRREGULAR): um item por critério
  const tabela = lerTabelaDeNiveis(docs, faixas);
  if (tabela.length >= 2) {
    itens.push(...itensDaTabela(docs, faixas, tabela));
    const criterio = itens.find((i) => i.id === idCriterio);
    if (criterio?.situacao === "localizado" && criterio.texto === "Pontuação por critérios") {
      const maxima = itens.find((i) => i.id === "julgamento:pontuacao-maxima");
      const minima = itens.find((i) => i.id === "julgamento:pontuacao-minima");
      criterio.texto = `Pontuação por critérios: ${tabela.length} critérios (${tabela[0]?.letra} a ${tabela.at(-1)?.letra})${maxima ? `, máximo de ${maxima.campos?.Pontos} pontos` : ""}${minima ? `, mínimo de ${minima.campos?.Pontos} para não ser eliminada` : ""}`;
    }
    return itens;
  }

  // tabela de pontuação: linhas com "N pontos" nas seções de julgamento ou proposta técnica
  const linhasDePonto: ItemAnalise[] = [];
  for (const d of docs) {
    const faixa = faixas?.get(d.id);
    for (const p of d.paginas) {
      if (faixa && !faixa.has(p.numero)) continue;
      if (!faixa && !/pontua[cç][aã]o/i.test(p.texto)) continue;
      const linhas = p.texto.split("\n");
      let pos = 0;
      linhas.forEach((linha, i) => {
        const inicio = pos;
        pos += linha.length + 1;
        const m = /(\d{1,3}(?:[.,]\d+)?)\s*(?:\(\s*[a-zà-ú ]+\s*\)\s*)?(?:pontos?|pts)\b/i.exec(linha);
        if (!m) return;
        const letras = (linha.match(/[A-Za-zÀ-ÿ]/g) ?? []).length;
        // linha só com "7 PONTOS" (célula): junta a linha de cima, que diz o quê
        const texto = limparEspacos(letras < 20 ? `${linhas[i - 1] ?? ""} ${linha}` : linha).slice(0, 220);
        linhasDePonto.push({
          id: `julgamento:pontuacao:${p.numero}:${inicio}`,
          secao: "julgamento",
          rotulo: "documento",
          nome: /subtotal|total|maxim/i.test(texto) ? "Pontuação (total ou máximo)" : "Critério de pontuação",
          texto,
          campos: { Pontos: m[1] ?? "" },
          origem: { documento: d.rotulo, pagina: p.numero, trecho: texto },
          situacao: "localizado",
        });
      });
    }
  }
  itens.push(...linhasDePonto.slice(0, 40));
  return itens;
}
