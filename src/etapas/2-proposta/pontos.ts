// Etapa 2, seção 1 do método (estratégia), parte do código: onde estão os pontos. Separa os critérios de texto (o
// avaliador lê) dos de documento (atestado, tempo de experiência, currículo comprovado), que não se ganham escrevendo
// e viram a pergunta "a FGV tem?"; lê a regra do preço (índice, pontos por desconto, menor preço, sem preço) e monta
// a tabela de pontos por preço. As contas são do código; os pesos e a fórmula vêm do edital, com a página.
import type { AnaliseRfp } from "../1-rfp/analisar-rfp";
import type { ItemAnalise, OrigemItem } from "../../extracao/rfp/item";
import { localizarTodos } from "../../extracao/rfp/localizar";
import { tirarAcentos } from "../../texto/normalizar";

export type TipoCriterio = "texto" | "documento" | "misto";

export interface CriterioPontos {
  chave: string;
  descricao: string;
  maximo?: number;
  tipo: TipoCriterio;
  motivo: string;
  origem?: OrigemItem;
}

const RE_DOCUMENTO =
  /\b(?:comprova\w*|atestados?|certid\w+|curricul\w+|anos? de (?:experiencia|atuacao|existencia)|tempo de (?:experiencia|atuacao|existencia)|portfolio|auditori\w+|titulacao|formacao (?:minima|academica)|mestrado|doutorado|pesquisas? de precos?|orcamentos?|cotac\w+|experiencia (?:institucional|da (?:osc|organizacao|empresa|proponente|entidade)|na (?:realizacao|execucao|elaboracao)|em (?:projetos|pesquisa|parcerias))|qualificacao e experiencia)\b/;
const RE_TEXTO =
  /\b(?:metodolog\w+|estrategia|compreensao|entendimento|plano de trabalho|cronograma|metas|riscos?|inovacao|acessibilidade|abordagem|linguagem|interlocucao|acoes do projeto|beneficiarios|conhecimento|vulnerabilidade|compatibilidade entre|viabilidade|proposta tecnica)\b/;

export function tipoDoCriterio(descricao: string): { tipo: TipoCriterio; motivo: string } {
  const t = tirarAcentos(descricao).toLowerCase();
  const doc = RE_DOCUMENTO.exec(t);
  const txt = RE_TEXTO.exec(t);
  if (doc && txt)
    return {
      tipo: "misto",
      motivo: `pede texto ("${txt[0]}") e comprovação ("${doc[0]}")`,
    };
  if (doc) return { tipo: "documento", motivo: `ganha-se com documento ("${doc[0]}"), não escrevendo` };
  return {
    tipo: "texto",
    motivo: txt ? `o avaliador lê ("${txt[0]}")` : "o avaliador lê o texto da proposta",
  };
}

const util = (i?: ItemAnalise) => Boolean(i && (i.situacao === "localizado" || i.situacao === "calculado"));
const numero = (s?: string) => (s ? Number(s.replace(",", ".")) : undefined);

/**
 * Os critérios de pontuação de primeiro nível: os pontuados por letra (A a M) ou os quesitos numerados ("1.", "2.").
 * Subitens ficam na tabela do edital (a estratégia trabalha no nível que o avaliador soma).
 */
export function criteriosDaRfp(analise: AnaliseRfp): CriterioPontos[] {
  const itens = analise.itens;
  const pontuados = itens.filter((i) => i.id.startsWith("julgamento:criterio-pontuado:") && util(i));
  const fonte = pontuados.length
    ? pontuados.map((i) => ({
        chave: i.nome.replace(/^Critério\s*/, ""),
        descricao: i.texto,
        maximo: numero(i.campos?.Pontos),
        origem: i.origem,
      }))
    : itens
        .filter(
          (i) => i.id.startsWith("julgamento:pontuacao:") && util(i) && /^\d{1,2}\.\s/.test(i.texto.trim()),
        )
        .map((i) => ({
          chave: i.texto.trim().split(/\s/)[0]?.replace(/\.$/, "") ?? "",
          descricao: i.texto.replace(/^\d{1,2}\.\s*/, "").replace(/\s*\d+\s*pontos?\s*$/i, ""),
          maximo: numero(i.campos?.Pontos),
          origem: i.origem,
        }));
  return fonte.map((c) => ({ ...c, ...tipoDoCriterio(c.descricao) }));
}

export interface OndeEstaoOsPontos {
  criterios: CriterioPontos[];
  texto: number;
  documento: number;
  misto: number;
  total: number;
}

export function ondeEstaoOsPontos(criterios: CriterioPontos[]): OndeEstaoOsPontos {
  const soma = (t: TipoCriterio) =>
    criterios.filter((c) => c.tipo === t).reduce((s, c) => s + (c.maximo ?? 0), 0);
  return {
    criterios,
    texto: soma("texto"),
    documento: soma("documento"),
    misto: soma("misto"),
    total: criterios.reduce((s, c) => s + (c.maximo ?? 0), 0),
  };
}

// ---------- regra do preço ----------

export type RegraPreco =
  | {
      tipo: "indice";
      pesoTecnica: number;
      pesoPreco: number;
      /** Quanto o índice de preço vale na nota final, como a fórmula escreve ("IP × 3"); sem fórmula, undefined. */
      multiplicador?: number;
      origem: OrigemItem;
      formula?: OrigemItem;
    }
  | { tipo: "desconto"; pontos: number; aCada: number; origem: OrigemItem }
  | { tipo: "menor-preco"; origem?: OrigemItem }
  /** Contratação direta (decisão 0042): o preço não é pontuado; precisa de justificativa (art. 72). */
  | { tipo: "contratacao-direta"; origem?: OrigemItem }
  | { tipo: "sem-preco"; criteriosDeCusto: CriterioPontos[] };

const RE_PESOS =
  /(\d{1,2})\s*%\s*(?:\([a-z ]+\)\s*)?(?:para a|a|de) (?:nota )?tecnica e (\d{1,2})\s*%\s*(?:\([a-z ]+\)\s*)?(?:para o|ao|de) preco/;
const RE_PESOS_INV = /(\d{1,2})\s*%\s*(?:para o|ao) preco e (\d{1,2})\s*%\s*(?:para a|a) tecnica/;
const RE_INDICE = /\bip\s*=\s*\(?\s*pmp\s*\/\s*pp|indice de preco\b.{0,80}menor preco/;
const RE_DESCONTO =
  /(\d{1,2}(?:,\d{1,2})?)\s*(?:\([a-z ]+\)\s*)?pontos?\s*(?:a cada|para cada|por cada|por)\s*(\d{1,2}(?:,\d{1,2})?)\s*%\s*(?:\([a-z ]+\)\s*)?(?:de desconto|abaixo|inferior|a menos)/;

const origem = (l: { doc: { rotulo: string }; pagina: number; frase: string }): OrigemItem => ({
  documento: l.doc.rotulo,
  pagina: l.pagina,
  trecho: l.frase,
});

export function regraDoPreco(analise: AnaliseRfp, criterios: CriterioPontos[]): RegraPreco {
  const docs = analise.documentos;
  const hipotese = analise.itens.find(
    (i) => i.id === "julgamento:criterio" && i.nome.startsWith("Hipótese legal"),
  );
  if (hipotese) return { tipo: "contratacao-direta", origem: hipotese.origem };
  const pesos = localizarTodos(docs, RE_PESOS)[0];
  const inv = pesos ? undefined : localizarTodos(docs, RE_PESOS_INV)[0];
  const indice = localizarTodos(docs, RE_INDICE)[0];
  if (pesos || inv) {
    const m = (pesos ? RE_PESOS : RE_PESOS_INV).exec((pesos ?? inv)?.termo ?? "");
    const a = Number(m?.[1]);
    const b = Number(m?.[2]);
    const [pesoTecnica, pesoPreco] = pesos ? [a, b] : [b, a];
    const mult = localizarTodos(docs, /\(\s*ip\s*(?:x|\*|×)\s*(\d{1,3}(?:,\d{1,2})?)\s*\)/)[0];
    const multiplicador = mult
      ? numero(/\(\s*ip\s*(?:x|\*|×)\s*(\d{1,3}(?:,\d{1,2})?)/.exec(mult.termo)?.[1])
      : undefined;
    if (pesoTecnica + pesoPreco === 100)
      return {
        tipo: "indice",
        pesoTecnica,
        pesoPreco,
        multiplicador,
        origem: origem((pesos ?? inv) as NonNullable<typeof pesos>),
        formula: indice ? origem(indice) : undefined,
      };
  }
  const desconto = localizarTodos(docs, RE_DESCONTO)[0];
  if (desconto) {
    const m = RE_DESCONTO.exec(desconto.termo);
    const pontos = numero(m?.[1]);
    const aCada = numero(m?.[2]);
    if (pontos && aCada) return { tipo: "desconto", pontos, aCada, origem: origem(desconto) };
  }
  const criterio = analise.itens.find((i) => i.id === "julgamento:criterio");
  const t = tirarAcentos(criterio?.texto ?? "").toLowerCase();
  if (/menor preco|maior desconto/.test(t) && !/tecnica/.test(t))
    return { tipo: "menor-preco", origem: criterio?.origem };
  return {
    tipo: "sem-preco",
    criteriosDeCusto: criterios.filter((c) =>
      /\b(?:precos?|gastos?|custos?|orcament\w+|cotac\w+|economicidade)\b/.test(
        tirarAcentos(c.descricao).toLowerCase(),
      ),
    ),
  };
}

export interface LinhaPontosPreco {
  /** Desconto sobre o valor estimado, em %. */
  desconto: number;
  preco?: number;
  /** Pontos de preço (escala do edital) ou índice de preço, por coluna de cenário. */
  valores: number[];
}

export interface TabelaPontosPreco {
  colunas: string[];
  linhas: LinhaPontosPreco[];
  /** Quanto 1% de preço vale em pontos técnicos (regra de índice), para comparar com o que se ganha escrevendo. */
  equivalencia?: string;
  texto: string;
}

const DESCONTOS = [0, 5, 10, 15, 20, 25];
const trunc2 = (n: number) => Math.floor(n * 100 + 1e-9) / 100;
const fmtR = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Tabela de pontos por preço, pela regra do edital. Índice (IP = menor preço ÷ preço): o resultado depende da menor
 * proposta, então as colunas são cenários (a menor proposta 10%, 20% e 30% abaixo do estimado). Pontos por desconto:
 * desconto → pontos. Os cenários são hipóteses para comparar, não previsão.
 */
export function tabelaPontosPorPreco(regra: RegraPreco, estimado?: number): TabelaPontosPreco | undefined {
  if (regra.tipo === "indice") {
    const cenarios = [10, 20, 30];
    // a escala vem da fórmula do edital ("IP × 3"); sem ela, o índice sai em % da nota de preço
    const peso = regra.multiplicador ?? 100;
    const naEscala = regra.multiplicador !== undefined;
    const linhas = DESCONTOS.map((d) => ({
      desconto: d,
      preco: estimado ? Math.round(estimado * (1 - d / 100) * 100) / 100 : undefined,
      valores: cenarios.map((c) => {
        const menor = 1 - Math.max(c, d) / 100;
        return naEscala
          ? trunc2((menor / (1 - d / 100)) * peso)
          : Math.round((menor / (1 - d / 100)) * 1000) / 10;
      }),
    }));
    // 1% acima da menor proposta: IP = 1/1,01. Em pontos técnicos (com a maior técnica = 100):
    // 1% acima da menor: perde (1 − 1/1,01) do peso do preço; 1 ponto técnico de 100 vale 1% do peso da técnica
    const equiv = Math.round(((regra.pesoPreco * (1 - 1 / 1.01)) / (regra.pesoTecnica / 100)) * 100) / 100;
    return {
      colunas: [
        "Desconto sobre o estimado",
        "Preço",
        ...cenarios.map((c) =>
          naEscala
            ? `Pontos de preço se a menor proposta for ${c}% abaixo`
            : `Índice de preço (%) se a menor proposta for ${c}% abaixo`,
        ),
      ],
      linhas,
      equivalencia: `Cada 1% de preço acima da menor proposta custa cerca de ${equiv.toLocaleString("pt-BR")} ponto técnico (com a maior nota técnica em 100). Recomenda-se comparar com o que a proposta ganha escrevendo.`,
      texto: `Técnica ${regra.pesoTecnica}% e preço ${regra.pesoPreco}%: ${naEscala ? `o preço dá até ${peso.toLocaleString("pt-BR")} na pontuação final` : `o preço vale ${regra.pesoPreco}% da nota final`}, pelo índice menor preço ÷ preço (${regra.origem.documento}, p. ${regra.origem.pagina}).`,
    };
  }
  if (regra.tipo === "desconto") {
    const linhas = DESCONTOS.map((d) => ({
      desconto: d,
      preco: estimado ? Math.round(estimado * (1 - d / 100) * 100) / 100 : undefined,
      valores: [Math.floor(d / regra.aCada) * regra.pontos],
    }));
    return {
      colunas: ["Desconto sobre o estimado", "Preço", "Pontos de preço"],
      linhas,
      texto: `${regra.pontos.toLocaleString("pt-BR")} ponto(s) a cada ${regra.aCada.toLocaleString("pt-BR")}% abaixo (${regra.origem.documento}, p. ${regra.origem.pagina}).`,
    };
  }
  return undefined;
}

export function textoDaRegraPreco(regra: RegraPreco, estimado?: number): string {
  switch (regra.tipo) {
    case "indice":
    case "desconto":
      return tabelaPontosPorPreco(regra, estimado)?.texto ?? "";
    case "menor-preco":
      return `Menor preço: o preço decide sozinho${regra.origem ? ` (${regra.origem.documento}, p. ${regra.origem.pagina})` : ""}.`;
    case "contratacao-direta":
      return `Contratação direta: o preço não é pontuado nem disputado; a proposta precisa sustentar a justificativa de preço (art. 72 da Lei 14.133; conferir)${regra.origem ? ` (${regra.origem.documento}, p. ${regra.origem.pagina})` : ""}.`;
    case "sem-preco":
      return regra.criteriosDeCusto.length
        ? `O edital não pontua preço nem desconto. O custo pesa nos critérios ${regra.criteriosDeCusto
            .map((c) => `${c.chave}${c.maximo !== undefined ? ` (${c.maximo})` : ""}`)
            .join(", ")}: ${regra.criteriosDeCusto.reduce((s, c) => s + (c.maximo ?? 0), 0)} pontos.`
        : "O código não localizou regra de pontuação do preço — conferir no documento.";
  }
}

export { fmtR as formatarReais };
