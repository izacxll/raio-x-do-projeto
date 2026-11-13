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
