// Identificação da RFP (etapa 1, passo 2): instrumento, modalidade, contratante, objeto, processo, valor
// estimado e legislação citada. Tudo "Do documento", com página e trecho; o que o código não acha fica
// "não localizado pelo código — conferir no documento".
import { normalizarTermo } from "../../regras/busca";
import { fraseEmVolta, limparEspacos } from "../../texto/frase";
import { campoDaCapa, lerCapa, type CampoDaCapa } from "./capa";
import { itemSemAchado, type DocumentoRfp, type ItemAnalise } from "./item";
import { localizarPrimeiro, localizarTodos, origemDe } from "./localizar";
import { faixasDoTema, type MapaRfp } from "./mapa";

const MAX_OBJETO = 600;

function itemDaCapa(
  doc: DocumentoRfp,
  c: CampoDaCapa,
  id: string,
  nome: string,
  texto = c.valor,
): ItemAnalise {
  const pagina = doc.originais.find((p) => p.numero === c.pagina);
  const trecho = pagina
    ? limparEspacos(pagina.texto.slice(c.posicao, c.posicao + 60 + c.valor.length + 40)).slice(0, 400)
    : c.valor;
  return {
    id,
    secao: "identificacao",
    rotulo: "documento",
    nome,
    texto: texto.length > MAX_OBJETO ? `${texto.slice(0, MAX_OBJETO).replace(/\s+\S*$/, "")}…` : texto,
    origem: { documento: doc.rotulo, pagina: c.pagina, trecho },
    situacao: "localizado",
  };
}

/** Como o documento se chama: a primeira linha de título do instrumento na abertura. */
const RE_INSTRUMENTO =
  /^(?:edital|aviso (?:de )?(?:contratacao direta|dispensa|licitacao)|chamamento publico|credenciamento|termo de referencia|solicitacao de propostas?|carta[- ]convite|pregao|concorrencia|dispensa|inexigibilidade|selecao publica|convocacao|manifestacao de interesse|request for proposals?)\b/;

function instrumento(docs: DocumentoRfp[]): ItemAnalise {
  for (const doc of docs) {
    for (const p of doc.originais.slice(0, 2)) {
      let pos = 0;
      for (const l of p.texto.split("\n")) {
        const inicio = pos;
        pos += l.length + 1;
        const linha = l.trim();
        if (linha.length < 5 || linha.length > 120) continue;
        if (RE_INSTRUMENTO.test(normalizarTermo(linha))) {
          return {
            id: "identificacao:instrumento",
            secao: "identificacao",
            rotulo: "documento",
            nome: "Instrumento",
            texto: linha,
            origem: {
              documento: doc.rotulo,
              pagina: p.numero,
              trecho: limparEspacos(p.texto.slice(inicio, inicio + 160)),
            },
            situacao: "localizado",
            nota: "Como o próprio documento se denomina.",
          };
        }
      }
    }
  }
  return itemSemAchado(docs, {
    id: "identificacao:instrumento",
    secao: "identificacao",
    nome: "Instrumento",
  });
}

/** Modalidades na ordem de busca: a mais específica antes da genérica. */
export const MODALIDADES: [string, RegExp][] = [
  ["Pregão eletrônico", /\bpregao eletronico\b|\bpregao,? na forma eletronica\b/],
  ["Pregão presencial", /\bpregao presencial\b/],
  ["Concorrência eletrônica", /\bconcorrencia eletronica\b/],
  ["Concorrência", /\bconcorrencia\b/],
  ["Pregão", /\bpregao\b/],
  ["Chamamento público", /\bchamamento publico\b/],
  ["Credenciamento", /\bcredenciamento\b/],
  [
    "Dispensa de licitação",
    /\bdispensa (?:de licitacao|eletronica)\b|\baviso de (?:contratacao direta|dispensa)\b/,
  ],
  ["Inexigibilidade", /\binexigibilidade\b/],
  ["Diálogo competitivo", /\bdialogo competitivo\b/],
  ["Concurso", /\bconcurso\b/],
  ["Leilão", /\bleilao\b/],
  ["Tomada de preços", /\btomada de precos\b/],
  ["Convite", /\bcarta[- ]convite\b|\bmodalidade convite\b/],
  ["Manifestação de interesse", /\bmanifestacao de interesse\b/],
];

function modalidade(docs: DocumentoRfp[], doInstrumento: ItemAnalise): ItemAnalise {
  const base = { id: "identificacao:modalidade", secao: "identificacao" as const, nome: "Modalidade" };
  const nome = (texto: string) => MODALIDADES.find(([, re]) => re.test(texto))?.[0];
  // 1º: o título do instrumento ("EDITAL DE PREGÃO ELETRÔNICO Nº 16/2026")
  const peloTitulo =
    doInstrumento.situacao === "localizado" ? nome(normalizarTermo(doInstrumento.texto)) : undefined;
  if (peloTitulo && doInstrumento.origem)
    return {
      ...base,
      rotulo: "documento",
      texto: peloTitulo,
      origem: doInstrumento.origem,
      situacao: "localizado",
    };
  // 2º: "na modalidade X" ou "modalidade: X"
  const explicita = localizarPrimeiro(
    docs,
    /\bmodalidade(?: de)?:?\s+(?:pregao eletronico|pregao presencial|pregao(?:,? na forma eletronica)?|concorrencia eletronica|concorrencia|chamamento publico|credenciamento|dispensa|inexigibilidade|dialogo competitivo|concurso|leilao|tomada de precos|convite)\b/,
  );
  const abertura = (d: DocumentoRfp) => new Set(d.paginas.slice(0, 3).map((p) => p.numero));
  const faixas = new Map(docs.map((d) => [d.id, abertura(d)]));
  if (explicita) {
    const n = nome(explicita.termo);
    if (n)
      return { ...base, rotulo: "documento", texto: n, origem: origemDe(explicita), situacao: "localizado" };
  }
  // 3º: a primeira modalidade citada nas três primeiras páginas
  for (const [n, re] of MODALIDADES) {
    const l = localizarPrimeiro(docs, re, faixas);
    if (l) return { ...base, rotulo: "documento", texto: n, origem: origemDe(l), situacao: "localizado" };
  }
  return itemSemAchado(docs, base);
}

const RE_ORGAO =
  /^(?:prefeitura|municipio de|camara municipal|governo d|ministerio|secretaria|fundacao|universidade|instituto|agencia|tribunal|assembleia|companhia|empresa|organizacao|conselho|autarquia|servico|banco|caixa|coordenacao|comissao|departamento|superintendencia|a uniao)\b/;
/** Ordem de preferência: o órgão que contrata antes da unidade que conduz. */
const PREFERENCIA = [
  /^(?:prefeitura|municipio|ministerio|governo|fundacao|universidade|organizacao|instituto|agencia|tribunal|companhia|empresa|banco|caixa|autarquia)/,
  /./,
];

function contratante(docs: DocumentoRfp[], capa: CampoDaCapa[]): ItemAnalise {
  const base = { id: "identificacao:contratante", secao: "identificacao" as const, nome: "Contratante" };
  const doc = docs[0];
  const c = campoDaCapa(
    capa,
    /^(?:contratante|orgao (?:contratante|gerenciador)|unidade (?:compradora|contratante))\b/,
  );
  if (doc && c) return { ...itemDaCapa(doc, c, base.id, base.nome), nota: "Quadro da capa." };
  for (const d of docs) {
    const p = d.originais[0];
    if (!p) continue;
    const linhas = p.texto.split("\n").slice(0, 12);
    for (const pref of PREFERENCIA) {
      let pos = 0;
      for (const l of linhas) {
        const inicio = pos;
        pos += l.length + 1;
        const n = normalizarTermo(l);
        if (l.trim().length < 6 || l.trim().length > 140 || !RE_ORGAO.test(n) || !pref.test(n)) continue;
        return {
          ...base,
          rotulo: "documento",
          texto: limparEspacos(l.replace(/\s+-\s+CNPJ.*$/i, "")),
          origem: {
            documento: d.rotulo,
            pagina: p.numero,
            trecho: limparEspacos(p.texto.slice(inicio, inicio + 160)),
          },
          situacao: "localizado",
          nota: "Primeira linha da abertura que nomeia um órgão: conferir se é o contratante.",
        };
      }
    }
  }
  const tornaPublico = localizarPrimeiro(docs, /\btorna(?:-se)? publico\b/);
  if (tornaPublico)
    return {
      ...base,
      rotulo: "documento",
      texto: tornaPublico.frase,
      origem: origemDe(tornaPublico),
      situacao: "localizado",
      nota: "Frase de abertura do documento: conferir quem é o contratante.",
    };
  return itemSemAchado(docs, base);
}

function objeto(docs: DocumentoRfp[], capa: CampoDaCapa[], mapa: MapaRfp): ItemAnalise {
  const base = { id: "identificacao:objeto", secao: "identificacao" as const, nome: "Objeto" };
  const doc = docs[0];
  const c = campoDaCapa(capa, /^objeto\b/);
  if (doc && c) return { ...itemDaCapa(doc, c, base.id, base.nome), nota: "Quadro da capa." };
  const secao = mapa.secoes.find((s) => s.tema === "objeto");
  if (secao) {
    const d = docs.find((x) => x.id === secao.docId);
    const p = d?.paginas.find((x) => x.numero === secao.pagina);
    if (d && p) {
      const depois = p.texto.indexOf("\n", secao.posicao) + 1;
      // pula a numeração do subitem ("1.1. O objeto…"): o ponto dela não é fim de frase
      const numeracao = /^\s*\d{1,2}(?:\.\d{1,2})*\.?\s*/.exec(p.texto.slice(depois))?.[0].length ?? 0;
      const frase = fraseEmVolta(p.texto, depois > 0 ? depois + numeracao : secao.posicao, MAX_OBJETO);
      return {
        ...base,
        rotulo: "documento",
        texto: frase,
        origem: { documento: d.rotulo, pagina: p.numero, trecho: frase },
        situacao: "localizado",
        nota: `Primeira frase da seção "${secao.titulo}".`,
      };
    }
  }
  const l = localizarPrimeiro(docs, /\b(?:o |tem (?:por|como) )objeto\b/);
  if (l) return { ...base, rotulo: "documento", texto: l.frase, origem: origemDe(l), situacao: "localizado" };
  return itemSemAchado(docs, base);
}

function processo(docs: DocumentoRfp[]): ItemAnalise {
  const base = { id: "identificacao:processo", secao: "identificacao" as const, nome: "Número do processo" };
  const l = localizarPrimeiro(
    docs,
    /\b(?:processo(?: administrativo| licitatorio| sei| eletronico)?|protocolo(?: digital)?)\s*(?:n[o°º.]*\s*)?[:-]?\s*\d[\d./-]{3,}/,
  );
  if (!l) return itemSemAchado(docs, base);
  const numero = /\d[\d./-]{3,}\d/.exec(l.termo)?.[0] ?? l.termo;
  return { ...base, rotulo: "documento", texto: numero, origem: origemDe(l), situacao: "localizado" };
}

function valorEstimado(docs: DocumentoRfp[], capa: CampoDaCapa[], mapa: MapaRfp): ItemAnalise {
  const base = { id: "identificacao:valor", secao: "identificacao" as const, nome: "Valor estimado" };
  const doc = docs[0];
  const c = campoDaCapa(capa, /\bvalor\b/);
  if (doc && c && /R\$/.test(c.valor)) {
    const valor = /R\$\s*[\d.]+,\d{2}/.exec(c.valor)?.[0] ?? c.valor;
    return { ...itemDaCapa(doc, c, base.id, base.nome, valor), nota: "Quadro da capa." };
  }
  const sigiloso = localizarPrimeiro(
    docs,
    /\b(?:orcamento|valor) (?:estimado )?(?:sera |tera carater )?sigiloso\b/,
  );
  if (sigiloso)
    return {
      ...base,
      rotulo: "documento",
      texto: "orçamento sigiloso",
      origem: origemDe(sigiloso),
      situacao: "localizado",
    };
  // "valor estimado… R$", e também "os recursos (ou as despesas)… estimados em R$" (seção do orçamento)
  const re =
    /\b(?:valor (?:total |global |maximo |anual |mensal )?(?:estimado|da contratacao|previsto|de referencia|maximo)|orcamento estimado|valor previsto|(?:recursos|despesas)\b[^.;]{0,120}?\bestimad[oa]s? em)\b[^.;]{0,140}?r\$ ?[\d.]+,\d{2}/;
  const l =
    localizarPrimeiro(docs, re, faixasDoTema(mapa, "orcamento", "objeto")) ?? localizarPrimeiro(docs, re);
  if (!l) return itemSemAchado(docs, base);
  const valor = /r\$ ?[\d.]+,\d{2}/.exec(l.termo)?.[0]?.replace(/^r\$ ?/, "R$ ") ?? "";
  return { ...base, rotulo: "documento", texto: valor, origem: origemDe(l), situacao: "localizado" };
}

const RE_NORMA =
  /\b(lei complementar|lei|decreto-lei|decreto|instrucao normativa|portaria|resolucao)(?: federal| estadual| municipal)?\s*(?:n[o°º.]*\s*)?(\d{1,3}(?:\.\d{3})*)(?:\s*\/\s*(\d{4}|\d{2})\b|,?\s+de\s+\d{1,2}[o°º]?\s+de\s+[a-z]+\s+de\s+(\d{4}))?/;

const NOME_NORMA: Record<string, string> = {
  "lei complementar": "Lei Complementar",
  lei: "Lei",
  "decreto-lei": "Decreto-Lei",
  decreto: "Decreto",
  "instrucao normativa": "Instrução Normativa",
  portaria: "Portaria",
  resolucao: "Resolução",
};

/** As leis de contratação que a skill conhece (licitacoes.md). */
export const LEIS_DE_CONTRATACAO: Record<string, string> = {
  "Lei 14.133": "licitações e contratos",
  "Lei 8.666": "licitações, contratos antigos",
  "Lei 13.019": "parcerias com organizações da sociedade civil",
  "Lei 13.303": "empresas estatais",
};

export interface NormaCitada {
  chave: string;
  nome: string;
  ocorrencias: number;
  primeira: ReturnType<typeof localizarPrimeiro>;
}

export function normasCitadas(docs: DocumentoRfp[]): NormaCitada[] {
  const porChave = new Map<
    string,
    { anos: Map<string, number>; n: number; primeira: NormaCitada["primeira"] }
  >();
  for (const l of localizarTodos(docs, new RegExp(RE_NORMA.source, "g"))) {
    const m = RE_NORMA.exec(l.termo);
    if (!m?.[1] || !m[2]) continue;
    // número curto demais (Lei 1, Portaria 7) quase sempre é item de lista, não norma
    if (m[2].replace(/\./g, "").length < 2) continue;
    const chave = `${NOME_NORMA[m[1]] ?? m[1]} ${m[2]}`;
    const anoBruto = m[3] ?? m[4];
    const ano = anoBruto
      ? anoBruto.length === 2
        ? `${Number(anoBruto) > 50 ? "19" : "20"}${anoBruto}`
        : anoBruto
      : "";
    const atual = porChave.get(chave) ?? { anos: new Map(), n: 0, primeira: l };
    atual.n++;
    if (ano) atual.anos.set(ano, (atual.anos.get(ano) ?? 0) + 1);
    porChave.set(chave, atual);
  }
  return [...porChave.entries()]
    .map(([chave, v]) => {
      const ano = [...v.anos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      return { chave, nome: ano ? `${chave}/${ano}` : chave, ocorrencias: v.n, primeira: v.primeira };
    })
    .sort((a, b) => b.ocorrencias - a.ocorrencias || a.chave.localeCompare(b.chave));
}

function legislacao(docs: DocumentoRfp[]): ItemAnalise[] {
  const normas = normasCitadas(docs).slice(0, 15);
  if (!normas.length)
    return [
      itemSemAchado(docs, {
        id: "identificacao:legislacao",
        secao: "identificacao",
        nome: "Legislação citada",
      }),
    ];
  return normas.map((n) => ({
    id: `identificacao:norma:${normalizarTermo(n.chave).replace(/\s+/g, "-")}`,
    secao: "identificacao" as const,
    rotulo: "documento" as const,
    nome: "Legislação citada",
    texto: LEIS_DE_CONTRATACAO[n.chave] ? `${n.nome} (${LEIS_DE_CONTRATACAO[n.chave]})` : n.nome,
    campos: { Citações: String(n.ocorrencias) },
    origem: n.primeira ? origemDe(n.primeira) : undefined,
    situacao: "localizado" as const,
    nota: "O que o documento cita prevalece. A ferramenta não dá parecer jurídico.",
  }));
}

export function extrairIdentificacao(docs: DocumentoRfp[], mapa: MapaRfp): ItemAnalise[] {
  const capa = docs[0] ? lerCapa(docs[0]) : [];
  const doInstrumento = instrumento(docs);
  return [
    doInstrumento,
    modalidade(docs, doInstrumento),
    contratante(docs, capa),
    objeto(docs, capa, mapa),
    processo(docs),
    valorEstimado(docs, capa, mapa),
    ...legislacao(docs),
  ];
}
