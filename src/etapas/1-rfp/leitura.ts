// Etapa 1 pelo método (docs/estudos/metodo-etapa-1.md, decisão 0034): a leitura da RFP em 8 seções, na ordem da
// decisão do gerente. Cada item passa no teste "isto muda uma decisão do gerente ou algo que a FGV terá de fazer,
// entregar, cumprir ou pagar?"; o que não passa fica fora (legislação além do regime, órgãos sem papel, números
// soltos, faixas da pontuação, mapa página a página) e só aparece contado em "fora da leitura".
// A leitura é montada a partir da análise por código (as extrações continuam as mesmas: as etapas 2 a 5 usam os
// itens pelo id). Item que repete um item da análise usa o mesmo id: a revisão do GP fica no dossiê como antes.
import type { AnaliseRfpDossie, Rotulo } from "../../dossie/esquema";
import { NOME_ACHADO_DINHEIRO, type TipoAchadoDinheiro } from "../../extracao/rfp/dinheiro";
import type { ItemAnalise, OrigemItem, SituacaoItem } from "../../extracao/rfp/item";
import { localizarTodos } from "../../extracao/rfp/localizar";
import { ehPaginaDeModelo } from "../../extracao/rfp/clausulas";
import { ehObrigacaoEspecifica, NOME_TEMA_OBRIGACAO, ORDEM_TEMAS } from "../../extracao/rfp/obrigacoes";
import { RE_POR_PROPONENTE } from "../../extracao/rfp/requisitos-rfp";
import { perfisDoRequisito } from "../../extracao/requisitos";
import { NOME_PREMISSA, type CodigoPremissa, type Impacto } from "../../regras/premissas-rfp";
import { encontrarDatas, formatarData, diasEntre, soData } from "../../texto/datas";
import { normalizarTermo } from "../../regras/busca";
import { tirarAcentos } from "../../texto/normalizar";
import { limparEspacos } from "../../texto/frase";
import {
  cruzarRfp,
  prazosSemTermoInicial,
  sinaisDeEstudoSensivel,
  type Cruzamento,
} from "../../regras/cruzamentos-rfp";
import type { AnaliseRfp } from "./analisar-rfp";
import { estadoDoItem, requisitoComoItem } from "./revisao";

export type SecaoLeitura =
  | "uma-pagina"
  | "fazer-e-entregar"
  | "prazos"
  | "dinheiro"
  | "julgamento"
  | "habilitacao"
  | "atencao"
  | "nao-se-aplica";

export const SECOES_LEITURA: { id: SecaoLeitura; titulo: string; pergunta: string }[] = [
  {
    id: "uma-pagina",
    titulo: "Em uma página",
    pergunta:
      "O que é, quem pode participar, tamanho, prazo, valor, como se ganha, a situação das datas e o que mais pesa.",
  },
  {
    id: "fazer-e-entregar",
    titulo: "O que a contratada teria de fazer e entregar",
    pergunta:
      "Entregas e obrigações de quem executa, agrupadas por tema, com o número R de cada requisito; o que é vedado.",
  },
  {
    id: "prazos",
    titulo: "Prazos e marcos",
    pergunta:
      "As datas do certame e os prazos da execução, contados do marco; as obrigações recorrentes e as de encerramento.",
  },
  {
    id: "dinheiro",
    titulo: "Dinheiro",
    pergunta:
      "Teto, cronograma de desembolso ou de medição, a condição de cada pagamento, o que retém ou glosa e a contrapartida.",
  },
  {
    id: "julgamento",
    titulo: "Como é julgado e o que entregar",
    pergunta:
      "Critérios com o máximo de cada um, o peso do preço, eliminação, desempate e o que vai na proposta.",
  },
  {
    id: "habilitacao",
    titulo: "Habilitação",
    pergunta: "Os documentos, linha a linha da lista do edital; quem entrega e em que prazo.",
  },
  {
    id: "atencao",
    titulo: "Pontos de atenção",
    pergunta:
      "Brechas e dependências, cada uma com a premissa crítica (PC1 a PC8) e a pergunta de esclarecimento sugerida.",
  },
  {
    id: "nao-se-aplica",
    titulo: "O que não se aplica a esta modalidade",
    pergunta: "Exigências típicas de outra modalidade que este documento não traz.",
  },
];

export interface TabelaItem {
  colunas: string[];
  linhas: string[][];
}

export interface ItemLeitura {
  /** Id da revisão do GP: o mesmo do item da análise quando é um só; "leitura:…" quando junta vários. */
  id: string;
  secao: SecaoLeitura;
  rotulo: Rotulo;
  nome: string;
  texto: string;
  origem?: OrigemItem;
  situacao: SituacaoItem;
  nota?: string;
  pergunta?: string;
  /** Tema da obrigação (seção 2). */
  tema?: string;
  premissa?: CodigoPremissa;
  porquePesa?: string;
  impacto?: Impacto;
  /** Linhas consolidadas no item (parcelas, documentos, critérios), cada uma com a página. */
  tabela?: TabelaItem;
  /** Número R, quando o item é um requisito. */
  numero?: string;
  /** Item da leitura do PMO (Sugestão até o GP revisar; o código conferiu as citações e os números). */
  doPmo?: boolean;
  /** O código achou na página a citação do item do PMO. */
  citacaoConferida?: boolean;
  /** Trava do código sobre o item do PMO: citação, valor ou conta não conferidos. */
  trava?: "citacao-nao-conferida" | "citacao-fraca" | "valor-nao-conferido" | "conta-do-pmo";
}

export interface LeituraRfp {
  /**
   * Chave de modalidade (decisão 0042): o código reconhece, o GP confirma. Sem modalidade no documento, fica "não
   * identificada" até o GP escolher (decisão 0054); o código não supõe licitação.
   */
  modalidade: "parceria" | "licitacao" | "contratacao-direta" | "nao-identificada";
  itens: ItemLeitura[];
  /** O que o código procurou e não achou, por seção: "não localizado pelo código — conferir no documento". */
  naoLocalizados: Partial<Record<SecaoLeitura, string[]>>;
  /** O que ficou fora por não passar no teste do método, contado por motivo. */
  foraDaLeitura: { motivo: string; quantos: number }[];
  /** Páginas sem texto legível, por documento. */
  ilegiveis: string[];
  /** "codigo": só o esqueleto (o que vai no pedido ao PMO); "pmo": com a leitura do PMO, conferida. */
  fonte: "codigo" | "pmo";
  /** Com a leitura do PMO: o que o código leu em cada seção e não ficou na leitura (recolhido na tela). */
  doCodigo: Partial<Record<SecaoLeitura, ItemLeitura[]>>;
  /** Cruzamentos obrigatórios X1 a X6 (decisão 0046), com o estado e as ocorrências. */
  cruzamentos: Cruzamento[];
}

const UTIL: SituacaoItem[] = ["localizado", "calculado"];
const util = (i?: ItemAnalise): i is ItemAnalise => Boolean(i && UTIL.includes(i.situacao));
const pag = (o?: OrigemItem) => (o ? `p. ${o.pagina}` : "—");
const curto = (t: string, n = 110) => {
  const s = t.replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  const corte = s.lastIndexOf(" ", n);
  return `${s.slice(0, corte > 30 ? corte : n)}…`;
};
/** Sem o número do item na frente e sem o começo do item seguinte, quando a frase o pegou ("… 17.7. Para…"). */
const semNumeroDoItem = (t: string) =>
  t
    .replace(/^(?:\d{1,2}(?:\.\d{1,2}){0,4}\.?|[a-z]\)|[IVX]{1,5}\s*[-–.)])\s*/, "")
    .replace(/\s\d{1,2}\.\d{1,2}(?:\.\d{1,2}){0,3}\.?\s+[A-ZÀ-Ý].*$/, "")
    .trim();

function doItem(i: ItemAnalise, secao: SecaoLeitura, extra: Partial<ItemLeitura> = {}): ItemLeitura {
  return {
    id: i.id,
    secao,
    rotulo: i.rotulo,
    nome: i.nome,
    texto: i.texto,
    origem: i.origem,
    situacao: i.situacao,
    nota: i.nota,
    pergunta: i.pergunta,
    ...extra,
  };
}

/** Normas que regem a contratação: as do regime (licitação ou parceria) e as citadas no objeto. */
const RE_NORMA_DO_REGIME =
  /lei-(?:14\.133|8\.666|13\.019|13\.303|13\.204|10\.520)|decreto-(?:57\.575|8\.726|11\.948|10\.024)/;

export function montarLeituraRfp(
  analise: AnaliseRfp,
  dossie: AnaliseRfpDossie,
  hoje = new Date(),
): LeituraRfp {
  const itens = analise.itens;
  const porId = (id: string) => itens.find((i) => i.id === id);
  const comPrefixo = (p: string) => itens.filter((i) => i.id.startsWith(p));
  const parceriaNoDocumento = util(porId("identificacao:parceria"));
  const modalidadeAchada = porId("identificacao:modalidade");
  // sem modalidade no documento (sem edital, critério, sessão nem artigo de inexigibilidade ou dispensa): o código
  // não supõe licitação; fica "não identificada" até o GP escolher (decisão 0054)
  const semModalidade = !parceriaNoDocumento && !util(modalidadeAchada);
  const doGp = semModalidade ? dossie.modalidade : undefined;
  const parceria = parceriaNoDocumento || doGp === "parceria";
  // contratação direta (decisão 0042): inexigibilidade ou dispensa declarada; não há julgamento nem pontuação
  const direta =
    (!parceria &&
      util(modalidadeAchada) &&
      /^(?:Inexigibilidade|Dispensa de licitação)$/.test(modalidadeAchada.texto)) ||
    doGp === "contratacao-direta";
  const modalidade: LeituraRfp["modalidade"] = parceria
    ? "parceria"
    : direta
      ? "contratacao-direta"
      : semModalidade && !doGp
        ? "nao-identificada"
        : "licitacao";
  const naoIdentificada = modalidade === "nao-identificada";
  const out: ItemLeitura[] = [];
  const naoLocalizados: LeituraRfp["naoLocalizados"] = {};
  // na contratação direta, o que é de julgamento não se procura (vai para "não se aplica")
  const SO_DA_LICITACAO = new Set([
    "critério de julgamento",
    "tabela de critérios",
    "desempate",
    "datas do certame",
  ]);
  const naoAchado = (secao: SecaoLeitura, nome: string) => {
    if (direta && SO_DA_LICITACAO.has(nome)) return;
    (naoLocalizados[secao] ??= []).push(nome);
  };

  // ---------- 7. Pontos de atenção (primeiro: a seção 1 resume os que mais pesam) ----------
  const atencao = pontosDeAtencao(analise);
  // cruzamentos obrigatórios (decisão 0046): o que diverge ou fica em aberto vira ponto de atenção
  const cruzamentos = cruzarRfp(itens, analise.documentos, analise.desembolso);
  for (const c of cruzamentos.filter((x) => x.estado === "diverge" || x.estado === "em-aberto"))
    atencao.push({
      id: `leitura:cruzamento:${c.codigo}`,
      secao: "atencao",
      rotulo: "sugestao",
      nome: `${c.codigo} · ${c.nome}${c.estado === "diverge" ? ": trechos que não batem" : ": em aberto"}`,
      texto: c.resultado,
      origem: c.ocorrencias[0],
      situacao: "calculado",
      porquePesa:
        "Trechos distantes que dizem coisas diferentes viram disputa na execução: o fiscal cobra o que for mais exigente.",
      pergunta: c.pergunta,
      impacto: c.codigo === "X1" || c.codigo === "X5" ? 1 : c.codigo === "X2" ? 4 : 6,
    });
  // prazo sem termo inicial (decisão 0045): duas leituras, "em até" ou "com antecedência"
  const semTermo = prazosSemTermoInicial(analise.documentos)[0];
  if (semTermo)
    atencao.push({
      id: "leitura:atencao:sem-termo-inicial",
      secao: "atencao",
      rotulo: "sugestao",
      nome: "Prazo sem termo inicial",
      texto: `"${curto(semTermo.frase, 220)}" (p. ${semTermo.pagina}): o prazo não diz de quando conta. Duas leituras: em até esse prazo, contado do início; ou com essa antecedência, antes da data em que a providência é necessária.`,
      origem: { documento: semTermo.doc.rotulo, pagina: semTermo.pagina, trecho: semTermo.frase },
      situacao: "localizado",
      porquePesa: "Na leitura da antecedência, o pedido tem de sair bem antes; o cronograma muda.",
      pergunta:
        "Sugere-se perguntar se o prazo é contado do início (em até) ou é uma antecedência mínima, e de qual data.",
      impacto: 4,
    });
  // estudo sensível (decisão 0043): ponto de atenção sem premissa crítica
  const sensivel = sinaisDeEstudoSensivel(analise.documentos);
  if (sensivel)
    atencao.push({
      id: "leitura:atencao:estudo-sensivel",
      secao: "atencao",
      rotulo: "sugestao",
      nome: "Estudo sensível: resultado lido por lados em disputa",
      texto: `"${curto(sensivel.frase, 220)}" (p. ${sensivel.pagina}). O resultado pode ser contestado; sugere-se tratar a independência técnica na proposta (régua metodológica) e no plano.`,
      origem: { documento: sensivel.doc.rotulo, pagina: sensivel.pagina, trecho: sensivel.frase },
      situacao: "localizado",
      porquePesa:
        "Pedido de mudança de método ou de resultado depois da entrega, e mudança de interlocutores.",
      pergunta:
        "Sugere-se combinar por escrito que o método aprovado no primeiro produto é a régua dos resultados e quem é o interlocutor único.",
      impacto: 5,
    });
  // em ordem de impacto (caixa, dependência do contratante, preço, prazo, escopo); proteções e trechos vagos no fim
  const NO_FIM = new Set(["leitura:protecoes", "leitura:atencao:vagos"]);
  const ordem = (i: ItemLeitura) => (NO_FIM.has(i.id) ? 99 : (i.impacto ?? 9));
  atencao.sort((a, b) => ordem(a) - ordem(b));

  // ---------- 1. Em uma página ----------
  const objeto = porId("identificacao:objeto");
  const contratante = porId("identificacao:contratante");
  if (util(objeto))
    out.push(
      doItem(objeto, "uma-pagina", {
        nome: "O que é",
        texto: `${semNumeroDoItem(objeto.texto)}${util(contratante) ? ` Contratante: ${contratante.texto}.` : ""}`,
      }),
    );
  else naoAchado("uma-pagina", "objeto");

  const normas = comPrefixo("identificacao:norma:");
  const doRegime = normas.filter((n) => RE_NORMA_DO_REGIME.test(n.id));
  const modalidadeItem = porId("identificacao:modalidade");
  const parceriaItem = porId("identificacao:parceria");
  const instrumento = porId("identificacao:instrumento");
  const regime = [
    util(modalidadeItem) ? modalidadeItem.texto : undefined,
    util(parceriaItem) ? parceriaItem.texto : undefined,
  ]
    .filter(Boolean)
    .join(" — ");
  out.push({
    id: "leitura:regime",
    secao: "uma-pagina",
    rotulo: regime ? "documento" : "decisao-gp",
    nome: "Regime e modalidade",
    texto: `${
      regime ||
      (doGp
        ? `modalidade não identificada no documento; decisão do GP: ${NOME_MODALIDADE[doGp]}`
        : "modalidade não identificada no documento (sem edital, critério de julgamento, sessão nem artigo de inexigibilidade ou dispensa) — confirmar com o GP")
    }${
      parceria ? " (parceria, não licitação)" : ""
    }${doRegime.length ? `. Regido por: ${doRegime.map((n) => n.texto.replace(/\s*\(.*\)$/, "")).join("; ")}` : ""}${
      normas.length > doRegime.length ? `. Outras ${normas.length - doRegime.length} normas citadas.` : "."
    }`,
    origem: (util(parceriaItem) ? parceriaItem : util(modalidadeItem) ? modalidadeItem : instrumento)?.origem,
    situacao: regime ? "localizado" : "nao-localizado",
    // as normas do regime, com a página em que cada uma aparece (a lista inteira fica fora da leitura)
    tabela: doRegime.length
      ? {
          colunas: ["Norma do regime", "Página"],
          linhas: doRegime.map((n) => [n.texto, String(n.origem?.pagina ?? "—")]),
        }
      : undefined,
  });

  const participacao = quemPodeParticipar(analise);
  if (participacao) out.push(participacao);
  else naoAchado("uma-pagina", "quem pode participar");

  out.push(tamanho(analise, dossie));

  const execucao =
    comPrefixo("prazos:execucao:execucao:").find(util) ?? comPrefixo("prazos:execucao:vigencia:").find(util);
  if (execucao)
    out.push(
      doItem(execucao, "uma-pagina", {
        id: "leitura:prazo",
        nome: "Prazo",
        texto: `${execucao.nome}: ${execucao.texto}${marcoDoPrazo(execucao)}`,
      }),
    );
  else naoAchado("uma-pagina", "prazo de execução ou vigência");

  const valor = porId("identificacao:valor");
  if (util(valor)) out.push(doItem(valor, "uma-pagina", { nome: "Valor", texto: textoDoValor(valor) }));
  else naoAchado("uma-pagina", "valor estimado ou teto");

  const criterio = porId("julgamento:criterio");
  if (direta && modalidadeAchada) out.push(comoEEscolhidaDireta(modalidadeAchada));
  else if (util(criterio)) out.push(comoSeGanha(analise, criterio));
  else naoAchado("uma-pagina", "critério de julgamento");

  out.push(situacao(analise, hoje));

  // um por assunto: dois trechos da mesma premissa contam como um ponto
  const assuntos = new Set<string>();
  const maisPesam = atencao
    .filter((a) => a.id !== "leitura:protecoes" && a.id !== "leitura:atencao:vagos")
    .filter((a) => {
      const chave = a.premissa ?? a.nome;
      if (assuntos.has(chave)) return false;
      assuntos.add(chave);
      return true;
    })
    .slice(0, 5);
  if (maisPesam.length)
    out.push({
      id: "leitura:mais-pesam",
      secao: "uma-pagina",
      rotulo: "sugestao",
      nome: maisPesam.length === 1 ? "O ponto que mais pesa" : `Os ${maisPesam.length} pontos que mais pesam`,
      texto: maisPesam.map((a, k) => `${k + 1}. ${a.nome}, ${pag(a.origem)}`).join("; "),
      situacao: "localizado",
      nota: "Em ordem de impacto: caixa, dependência do contratante, preço, prazo, escopo. Detalhe e pergunta na seção 7. Quem decide é o GP.",
    });

  // ---------- 2. O que a contratada teria de fazer e entregar ----------
  out.push(...fazerEEntregar(analise, dossie));
  // sem nenhuma obrigação específica nem entrega, a seção 2 diz que o código não achou (não achado não é ausente)
  if (!analise.obrigacoes.some(ehObrigacaoEspecifica) && !dossie.requisitos.some((r) => r.tipo === "produto"))
    naoAchado(
      "fazer-e-entregar",
      "obrigações e entregas específicas de quem executa (podem estar em texto corrido)",
    );

  // ---------- 3. Prazos ----------
  out.push(...prazos(analise, naoAchado));

  // ---------- 4. Dinheiro ----------
  out.push(...dinheiro(analise, valor, parceria, naoAchado));

  // ---------- 5. Julgamento e entrega (na contratação direta, o que sustenta a escolha) ----------
  if (direta && modalidadeAchada) {
    out.push(...sustentaContratacaoDireta(modalidadeAchada));
    // o checklist do que vai na proposta continua valendo; critérios, desempate e eliminação não
    out.push(...julgamento(analise, naoAchado).filter((i) => i.id === "leitura:julgamento:proposta"));
  } else if (naoIdentificada) {
    // sem modalidade, o que é de julgamento não se cobra: o PMO escreve as alternativas (decisão 0054)
    out.push(alternativasDaModalidade());
    out.push(...julgamento(analise, () => undefined));
  } else out.push(...julgamento(analise, naoAchado));

  // ---------- 6. Habilitação ----------
  const daHabilitacao = habilitacao(analise, direta || naoIdentificada ? () => undefined : naoAchado);
  out.push(...daHabilitacao);
  if (direta && !daHabilitacao.some((i) => i.id === "leitura:habilitacao:lista"))
    out.push(documentosDaContratacaoDireta());

  // ---------- 7. ----------
  out.push(...atencao);

  // ---------- 8. Não se aplica ----------
  const naoSeAplica = itens.filter((i) => i.situacao === "nao-se-aplica");
  if (naoIdentificada)
    out.push({
      id: "leitura:nao-se-aplica",
      secao: "nao-se-aplica",
      rotulo: "decisao-gp",
      nome: "Depende da modalidade, não identificada",
      texto:
        "O que não se aplica depende da modalidade, que o documento não diz — confirmar com o GP antes de seguir.",
      situacao: "nao-localizado",
    });
  else if (direta)
    out.push({
      id: "leitura:nao-se-aplica",
      secao: "nao-se-aplica",
      rotulo: "documento",
      nome: `Não se aplica a contratação direta (${modalidadeAchada?.texto ?? ""})`,
      texto:
        "Sessão pública; julgamento e pontuação; desempate; garantia de proposta: não se aplica a contratação direta — conferir no documento. Cláusulas de sanção que citam licitação ou licitante são texto padrão.",
      situacao: "nao-se-aplica",
    });
  else if (naoSeAplica.length)
    out.push({
      id: "leitura:nao-se-aplica",
      secao: "nao-se-aplica",
      rotulo: "documento",
      nome: parceria ? "Não se aplica a parceria (Lei 13.019/2014)" : "Não se aplica a esta modalidade",
      texto: `${naoSeAplica.map((i) => i.nome.replace(/\s*\(.*\)$/, "")).join("; ")}: não se aplica a esta modalidade — conferir no documento.`,
      situacao: "nao-se-aplica",
    });

  return {
    modalidade,
    itens: out,
    naoLocalizados,
    foraDaLeitura: foraDaLeitura(analise, normas.length - doRegime.length),
    ilegiveis: analise.documentos
      .filter((d) => d.ilegiveis.length)
      .map((d) => `${d.rotulo}: p. ${d.ilegiveis.join(", ")}`),
    fonte: "codigo",
    doCodigo: {},
    cruzamentos,
  };
}

// ---------------------------------------------------------------------------------------------------------------

function marcoDoPrazo(execucao: ItemAnalise): string {
  // sem acento e com o mesmo comprimento: o que casa é recortado do trecho original, com os acentos
  const original = (execucao.origem?.trecho ?? "").replace(/\s+/g, " ");
  const m = /a partir d[ao] (publicacao do extrato|assinatura|ordem de servico|emissao|celebracao)/i.exec(
    tirarAcentos(original),
  );
  if (!m?.[1]) return "";
  const ini = m.index + m[0].length - m[1].length;
  return `, contados a partir da ${original.slice(ini, ini + m[1].length).toLowerCase()}`;
}

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const porcento = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
/** O primeiro valor em reais do texto ("R$ 240.000,00 por projeto" → 240000). */
function valorEmReais(texto: string): number | undefined {
  const m = /R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/.exec(texto);
  return m?.[1] ? Number(m[1].replace(/\./g, "").replace(",", ".")) : undefined;
}

function textoDoValor(valor: ItemAnalise): string {
  const t = normalizarTermo(valor.origem?.trecho ?? "");
  // teto por projeto só quando o trecho fala de cada projeto ou proposta (em licitação, "valor máximo" é o global)
  if (/cada projeto|por projeto|por proposta|cada proposta/.test(t) && /\b(?:maximo|teto|ate)\b/.test(t))
    return `${valor.texto} por projeto (teto); o valor global não é declarado no trecho.`;
  return valor.texto;
}

function quemPodeParticipar(analise: AnaliseRfp): ItemLeitura | undefined {
  const docs = analise.documentos;
  const pode = localizarTodos(
    docs,
    /\b(?:poderao participar|podem participar|poderao se inscrever|estao aptas? a participar|e permitida a participacao|serao admitid[oa]s)\b/,
  )[0];
  const limite = localizarTodos(docs, RE_POR_PROPONENTE)[0];
  const experiencia = analise.itens.find((i) => i.id === "habilitacao:osc-experiencia" && util(i));
  const partes = [pode?.frase, limite?.frase]
    .filter((x): x is string => Boolean(x))
    .map((x) => curto(semNumeroDoItem(x), 220));
  if (!partes.length) return undefined;
  const origem = pode ?? limite;
  return {
    id: "leitura:participacao",
    secao: "uma-pagina",
    rotulo: "documento",
    nome: "Quem pode participar",
    texto: `${partes.join(" ")}${experiencia ? " Exige experiência prévia no objeto (ver habilitação)." : ""}`,
    origem: origem
      ? { documento: origem.doc.rotulo, pagina: origem.pagina, trecho: origem.frase }
      : undefined,
    situacao: "localizado",
    nota:
      limite && pode && limite.pagina !== pode.pagina
        ? `Limite por proponente na p. ${limite.pagina}.`
        : undefined,
  };
}

function tamanho(analise: AnaliseRfp, dossie: AnaliseRfpDossie): ItemLeitura {
  // os requisitos que o GP descartou não contam
  const req = dossie.requisitos.filter(
    (r) => estadoDoItem(dossie.revisoes, `requisito:${r.numero}`) !== "descartado",
  );
  const produtos = req.filter((r) => r.tipo === "produto");
  const equipe = req.filter((r) => r.tipo === "equipe");
  const quantidades = req.filter((r) => r.tipo === "quantidade");
  const selecao = localizarTodos(
    analise.documentos,
    /\b(?:serao selecionad[oa]s|selecao de) (?:ate )?\d{1,4}\s*(?:\([a-z ]+\)\s*)?(?:projetos|propostas|organizacoes|entidades)\b/,
  )[0];
  const partes: string[] = [];
  if (selecao) partes.push(curto(semNumeroDoItem(selecao.frase), 140));
  if (produtos.length)
    partes.push(
      `${produtos.length} produto${produtos.length > 1 ? "s" : ""} (${produtos.map((r) => r.numero).join(", ")})`,
    );
  // a equipe-chave é um requisito só, com a lista dos perfis (decisão 0054)
  const nPerfis = equipe.flatMap(perfisDoRequisito).length;
  if (equipe.length)
    partes.push(
      `equipe de ${nPerfis} perfi${nPerfis > 1 ? "s" : "l"} citado${nPerfis > 1 ? "s" : ""} (${equipe.map((r) => r.numero).join(", ")})`,
    );
  if (quantidades.length)
    partes.push(
      quantidades
        .map((r) => `${r.rotulo.replace(/^Quantidade: /, "")} (${r.numero}, p. ${r.pagina})`)
        .join("; "),
    );
  const primeiro = [...produtos, ...equipe, ...quantidades].find((r) => r.pagina > 0);
  const origem = selecao
    ? { documento: selecao.doc.rotulo, pagina: selecao.pagina, trecho: selecao.frase }
    : primeiro
      ? { documento: primeiro.documento ?? "RFP", pagina: primeiro.pagina, trecho: primeiro.trecho }
      : undefined;
  return {
    id: "leitura:tamanho",
    secao: "uma-pagina",
    // consolidado pelo código: Do documento só quando há trecho que o sustente
    rotulo: origem ? "documento" : "sugestao",
    nome: "Tamanho",
    texto: partes.length ? `${partes.join("; ")}.` : "não localizado pelo código — conferir no documento",
    origem,
    situacao: partes.length ? "localizado" : "nao-localizado",
    nota:
      produtos.length || equipe.length || quantidades.length
        ? "Consolidado pelo código a partir dos requisitos numerados (seção 2)."
        : undefined,
  };
}

// ---------- Modalidade não identificada (decisão 0054) ----------

export const NOME_MODALIDADE: Record<"licitacao" | "contratacao-direta" | "parceria", string> = {
  licitacao: "licitação",
  "contratacao-direta": "contratação direta (inexigibilidade ou dispensa)",
  parceria: "parceria (Lei 13.019/2014)",
};

/** Seção 5: sem modalidade no documento, o que muda em cada alternativa, como sugestão, até o GP escolher. */
function alternativasDaModalidade(): ItemLeitura {
  return {
    id: "leitura:modalidade:alternativas",
    secao: "julgamento",
    rotulo: "sugestao",
    nome: "Modalidade não identificada: as alternativas",
    texto:
      "O documento não diz a modalidade. Sugere-se confirmar com o GP antes de seguir: na licitação, o julgamento, a pontuação e a habilitação vêm do edital; na contratação direta, a hipótese legal (art. 74 ou 75 da Lei 14.133), a justificativa de preço e os documentos do art. 72; na parceria, o chamamento e o plano de trabalho da Lei 13.019.",
    situacao: "nao-localizado",
  };
}

// ---------- Contratação direta (decisão 0042) ----------

/** Seção 1: na contratação direta não há julgamento; a escolha é a hipótese legal. */
function comoEEscolhidaDireta(modalidade: ItemAnalise): ItemLeitura {
  return doItem(modalidade, "uma-pagina", {
    id: "leitura:como-se-ganha",
    nome: "Como é escolhida",
    texto: `Contratação direta (${modalidade.texto}), sem julgamento nem pontuação. A escolha se sustenta no que a Lei 14.133 pede no art. 72: a justificativa da hipótese legal, a justificativa de preço e, na inexigibilidade, a notória especialização no objeto (seção 5).`,
  });
}

/** Seção 5: o que sustenta a contratação direta, como sugestão e pergunta. */
function sustentaContratacaoDireta(modalidade: ItemAnalise): ItemLeitura[] {
  const inexigibilidade = modalidade.texto === "Inexigibilidade";
  return [
    doItem(modalidade, "julgamento", {
      id: "leitura:direta:hipotese",
      nome: "Hipótese legal",
      texto: `${modalidade.texto}, como o documento declara. Não há sessão, pontuação nem desempate.`,
    }),
    {
      id: "leitura:direta:sustenta",
      secao: "julgamento",
      rotulo: "sugestao",
      nome: "O que sustenta a escolha",
      texto: inexigibilidade
        ? "Sugere-se conferir se a justificativa de notória especialização do documento descreve o objeto desta contratação, e não outras áreas (texto de outro projeto é conflituoso), e reunir os estudos e a equipe que a comprovam: na inexigibilidade, só os profissionais que a justificaram podem atuar (art. 74, § 4º, da Lei 14.133; conferir)."
        : "Sugere-se conferir em qual inciso do art. 75 da Lei 14.133 o documento enquadra a dispensa e se o valor ou a condição da hipótese se confirma (conferir).",
      situacao: "localizado",
      pergunta:
        "Sugere-se perguntar ao contratante se a justificativa de preço e a comprovação de experiência no objeto ficam a cargo da FGV e em que formato.",
    },
  ];
}

/** Seção 6: sem lista de documentos no documento, a pergunta (não achado não é ausente). */
function documentosDaContratacaoDireta(): ItemLeitura {
  return {
    id: "leitura:habilitacao:direta",
    secao: "habilitacao",
    rotulo: "decisao-gp",
    nome: "Documentos da contratação direta",
    texto:
      "Lista de documentos não localizada pelo código — conferir no documento. Na contratação direta, sugere-se confirmar com o contratante quais documentos ele pede (habilitação e os do art. 72 da Lei 14.133, inclusive a comprovação de notória especialização).",
    situacao: "nao-localizado",
  };
}

function comoSeGanha(analise: AnaliseRfp, criterio: ItemAnalise): ItemLeitura {
  const pesos = analise.itens.filter((i) => i.id.startsWith("julgamento:peso:") && util(i));
  const minima = analise.itens.find((i) => i.id === "julgamento:pontuacao-minima" && util(i));
  const peso = pesos[0] ? ` ${curto(semNumeroDoItem(pesos[0].texto), 160)}` : "";
  return doItem(criterio, "uma-pagina", {
    id: "leitura:como-se-ganha",
    nome: "Como se ganha",
    texto: `${criterio.texto}.${peso}${minima && !/minimo/.test(normalizarTermo(criterio.texto)) ? ` Mínimo de ${minima.texto} para não ser eliminada.` : ""}${
      minima && minima.origem && minima.origem.pagina !== criterio.origem?.pagina
        ? ` (mínimo na p. ${minima.origem.pagina})`
        : ""
    }`,
  });
}

/** As datas do certame comparadas com hoje: "o prazo já passou" ou "faltam N dias" (conta do código). */
function situacao(analise: AnaliseRfp, hoje: Date): ItemLeitura {
  const certame = analise.itens.filter(
    (i) => (i.id.startsWith("prazos:certame:") || i.id.startsWith("prazos:esclarecimento:")) && util(i),
  );
  const comData = certame
    .map((i) => ({ i, data: encontrarDatas(i.texto)[0]?.data }))
    .filter((x): x is { i: ItemAnalise; data: Date } => Boolean(x.data));
  const base = soData(hoje);
  if (!comData.length) {
    const contados = certame.filter((i) => /contad|apos|após|antes/.test(i.texto));
    return {
      id: "leitura:situacao",
      secao: "uma-pagina",
      rotulo: "documento",
      nome: "Situação (datas × hoje)",
      texto: contados.length
        ? `O documento não traz datas fixas do certame: ${contados.length} prazo${contados.length > 1 ? "s" : ""} contado${contados.length > 1 ? "s" : ""} de marcos sem data (ex.: ${curto(contados[0]?.texto ?? "", 90)}). Conferir as datas na publicação do edital.`
        : "datas do certame não localizadas pelo código — conferir no documento",
      origem: contados[0]?.origem,
      situacao: contados.length ? "calculado" : "nao-localizado",
    };
  }
  const partes = comData
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .map(({ i, data }) => {
      const d = diasEntre(base, data);
      return `${i.nome.replace(/^Limite para esclarecimentos e impugnação$/, "Esclarecimentos")}: ${formatarData(data)} — ${
        d < 0 ? `já passou (há ${-d} dias)` : d === 0 ? "é hoje" : `faltam ${d} dias`
      }`;
    });
  const ultimo = comData.at(-1);
  const passou = ultimo ? diasEntre(base, ultimo.data) < 0 : false;
  return {
    id: "leitura:situacao",
    secao: "uma-pagina",
    rotulo: "documento",
    nome: "Situação (datas × hoje)",
    texto: `${passou ? "O certame já passou. " : ""}${partes.join("; ")}.`,
    origem: comData[0]?.i.origem,
    situacao: "calculado",
    nota: `Conta do código em ${formatarData(base)}; confira feriados e as datas na publicação oficial.`,
  };
}

// ---------------------------------------------------------------------------------------------------------------

function fazerEEntregar(analise: AnaliseRfp, dossie: AnaliseRfpDossie): ItemLeitura[] {
  const out: ItemLeitura[] = [];
  const requisitos = dossie.requisitos.map(requisitoComoItem).map((i): ItemLeitura => {
    const item: ItemLeitura = {
      ...doItem(i, "fazer-e-entregar"),
      numero: i.campos?.Número,
      tema: i.campos?.Tipo,
    };
    // o produto com a linha dele no cronograma de desembolso: prazo de entrega e quanto ele vale
    const n = /produto\s*(\d{1,2})/i.exec(i.nome)?.[1];
    const parcela = n
      ? analise.desembolso.parcelas.find((p) => new RegExp(`\\bproduto\\s*${n}\\b`, "i").test(p.rotulo))
      : undefined;
    if (!parcela) return item;
    return {
      ...item,
      texto: `${parcela.rotulo}. ${i.texto}`,
      nota: `Entrega${parcela.prazo ? ` em ${parcela.prazo}` : ""}; ${porcento(parcela.percentual)} do valor (cronograma de desembolso, p. ${parcela.origem.pagina}).`,
    };
  });
  out.push(...requisitos);

  const porTema = new Map<string, typeof analise.obrigacoes>();
  for (const o of analise.obrigacoes.filter((x) => !x.vedacao)) {
    const lista = porTema.get(o.tema) ?? [];
    lista.push(o);
    porTema.set(o.tema, lista);
  }
  // tema com uma obrigação só não ganha linha própria: vai para "outras obrigações" (meta de 30 a 50 itens)
  for (const [tema, lista] of [...porTema.entries()])
    if (lista.length === 1 && tema !== "outras" && tema !== "entregas") {
      porTema.set("outras", [...(porTema.get("outras") ?? []), ...lista]);
      porTema.delete(tema);
    }
  for (const tema of ORDEM_TEMAS) {
    const lista = porTema.get(tema);
    if (!lista?.length) continue;
    const primeiro = lista[0];
    if (!primeiro) continue;
    out.push({
      id: `leitura:obrigacoes:${tema}`,
      secao: "fazer-e-entregar",
      rotulo: "documento",
      nome: NOME_TEMA_OBRIGACAO[tema],
      tema,
      texto: `${lista.length} obrigaç${lista.length > 1 ? "ões" : "ão"} de quem executa: ${lista
        .slice(0, 4)
        .map((o) => `${curto(o.texto, 90)} (p. ${o.origem.pagina})`)
        .join("; ")}${lista.length > 4 ? `; e mais ${lista.length - 4} na tabela` : ""}.`,
      origem: primeiro.origem,
      situacao: "localizado",
      tabela: {
        colunas: ["R", "Obrigação", "Página"],
        linhas: lista.map((o) => [
          dossie.requisitos.find((r) => r.descricao === o.texto)?.numero ?? "—",
          `${o.texto}${o.itens?.length ? ` ${o.itens.map((x, n) => `(${n + 1}) ${curto(x, 90)}`).join("; ")}` : ""}`,
          String(o.origem.pagina),
        ]),
      },
    });
  }
  const vedacoes = analise.obrigacoes.filter((x) => x.vedacao);
  if (vedacoes[0])
    out.push({
      id: "leitura:vedacoes",
      secao: "fazer-e-entregar",
      rotulo: "documento",
      nome: "O que é vedado",
      tema: "vedacao",
      texto: vedacoes.map((o) => `${curto(o.texto, 110)} (p. ${o.origem.pagina})`).join("; "),
      origem: vedacoes[0].origem,
      situacao: "localizado",
      tabela:
        vedacoes.length > 1
          ? {
              colunas: ["Vedação", "Página"],
              linhas: vedacoes.map((o) => [curto(o.texto, 260), String(o.origem.pagina)]),
            }
          : undefined,
    });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------

function prazos(analise: AnaliseRfp, naoAchado: (s: SecaoLeitura, n: string) => void): ItemLeitura[] {
  const out: ItemLeitura[] = [];
  const itens = analise.itens;
  const certame = itens.filter(
    (i) => (i.id.startsWith("prazos:certame:") || i.id.startsWith("prazos:esclarecimento:")) && util(i),
  );
  if (certame[0])
    out.push({
      id: "leitura:prazos:certame",
      secao: "prazos",
      rotulo: "documento",
      nome: "Linha do tempo do certame",
      texto: certame
        .map((i) => `${i.nome}: ${i.texto}${i.campos?.Alerta ? ` (${i.campos.Alerta})` : ""}`)
        .join("; "),
      origem: certame[0].origem,
      situacao: certame.some((i) => i.situacao === "calculado") ? "calculado" : "localizado",
      tabela: {
        colunas: ["Evento", "Data ou regra", "Contagem", "Alerta", "Página"],
        linhas: certame.map((i) => [
          i.nome,
          i.texto,
          i.campos?.Contagem ?? "",
          i.campos?.Alerta ?? "",
          String(i.origem?.pagina ?? "—"),
        ]),
      },
      nota: "As contas de data são do código: confira feriados e a publicação oficial.",
    });
  else naoAchado("prazos", "datas do certame");

  // a validade da proposta é do certame, não da execução
  const execucao = itens.filter(
    (i) => i.id.startsWith("prazos:execucao:") && util(i) && !/proposta/i.test(i.nome),
  );
  const daMinuta = analise.obrigacoes.filter((o) => o.prazo && !o.recorrencia);
  if (execucao.length || daMinuta.length)
    out.push({
      id: "leitura:prazos:execucao",
      secao: "prazos",
      rotulo: "documento",
      nome: "Prazos da execução",
      texto: [
        ...execucao.map((i) => `${i.nome}: ${i.texto}`),
        ...daMinuta.slice(0, 4).map((o) => `${curto(o.texto, 80)}: ${o.prazo}`),
      ].join("; "),
      origem: execucao[0]?.origem ?? daMinuta[0]?.origem,
      situacao: "localizado",
      tabela: {
        colunas: ["Prazo", "Quanto", "Página"],
        linhas: [
          ...execucao.map((i) => [i.nome, i.texto, String(i.origem?.pagina ?? "—")]),
          ...daMinuta.map((o) => [curto(o.texto, 160), o.prazo ?? "", String(o.origem.pagina)]),
        ],
      },
    });
  else naoAchado("prazos", "prazo de execução ou vigência");

  const recorrentes = analise.obrigacoes.filter((o) => o.recorrencia);
  if (recorrentes[0])
    out.push({
      id: "leitura:prazos:recorrentes",
      secao: "prazos",
      rotulo: "documento",
      nome: "Obrigações recorrentes",
      texto: recorrentes
        .map((o) => `${o.recorrencia}: ${curto(o.texto, 100)} (p. ${o.origem.pagina})`)
        .join("; "),
      origem: recorrentes[0].origem,
      situacao: "localizado",
    });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------

function dinheiro(
  analise: AnaliseRfp,
  valor: ItemAnalise | undefined,
  parceria: boolean,
  naoAchado: (s: SecaoLeitura, n: string) => void,
): ItemLeitura[] {
  const out: ItemLeitura[] = [];
  if (util(valor))
    out.push(
      doItem(valor, "dinheiro", {
        id: "leitura:dinheiro:valor",
        nome: "Teto ou valor estimado",
        texto: textoDoValor(valor),
      }),
    );
  const d = analise.desembolso;
  const emValor = d.parcelas.every((p) => p.valor !== undefined);
  // X5 (decisão 0046): valor global × soma das parcelas, quando as parcelas vêm em valor
  const somaValores = emValor ? d.parcelas.reduce((s, p) => s + (p.valor ?? 0), 0) : undefined;
  const valorGlobal = util(valor) ? valorEmReais(valor.texto) : undefined;
  const confereX5 =
    somaValores !== undefined && valorGlobal !== undefined
      ? Math.abs(somaValores - valorGlobal) < 0.01
        ? ` Soma das parcelas: ${reais(somaValores)}, igual ao valor global (conta do código).`
        : ` Soma das parcelas: ${reais(somaValores)}, diferente do valor global de ${reais(valorGlobal)} (conta do código): conferir no documento.`
      : "";
  if (d.parcelas.length)
    out.push({
      id: "leitura:dinheiro:desembolso",
      secao: "dinheiro",
      rotulo: "documento",
      nome: parceria ? "Cronograma de desembolso" : "Pagamento por entrega",
      texto: `${d.parcelas.length} parcelas: ${d.parcelas.map((p) => `${curto(p.rotulo, 50)} ${p.valor !== undefined ? `${reais(p.valor)} (${porcento(p.percentual)})` : porcento(p.percentual)}${p.prazo ? ` (${p.prazo})` : ""}`).join("; ")}.${emValor ? confereX5 : ` Soma: ${porcento(d.soma)} (conta do código).`}`,
      origem: d.parcelas[0]?.origem,
      situacao: "localizado",
      tabela: {
        colunas: emValor
          ? ["Parcela ou entrega", "Valor", "Percentual (conta do código)", "Página"]
          : ["Parcela ou entrega", "Percentual", "Prazo", "Página"],
        linhas: d.parcelas.map((p) =>
          emValor
            ? [p.rotulo, reais(p.valor ?? 0), porcento(p.percentual), String(p.origem.pagina)]
            : [p.rotulo, porcento(p.percentual), p.prazo ?? "", String(p.origem.pagina)],
        ),
      },
      nota:
        !emValor && d.soma !== 100
          ? `As parcelas somam ${porcento(d.soma)}, não 100%: conferir no documento.`
          : undefined,
    });
  else if (d.unica)
    out.push({
      id: "leitura:dinheiro:desembolso",
      secao: "dinheiro",
      rotulo: "documento",
      nome: "Cronograma de desembolso",
      texto: `Parcela única: ${curto(d.unica.trecho, 200)}`,
      origem: d.unica,
      situacao: "localizado",
    });
  else naoAchado("dinheiro", "cronograma de desembolso ou de medição");

  const porTipo = (t: TipoAchadoDinheiro) => analise.dinheiro.filter((x) => x.tipo === t);
  // a condição de cada pagamento e o prazo para pagar (e o que acontece no atraso) num item só
  const condicoes = porTipo("condicao");
  const prazosDePagamento = [...porTipo("prazo-pagamento"), ...porTipo("atraso-pagamento")];
  if (condicoes[0] || prazosDePagamento[0])
    out.push({
      id: "leitura:dinheiro:condicao",
      secao: "dinheiro",
      rotulo: "documento",
      nome: condicoes[0] ? "Condição de cada pagamento" : "Prazo de pagamento e atraso",
      texto: [
        ...condicoes.map(
          (c) =>
            `${curto(c.texto, 160)} (p. ${c.origem.pagina})${c.comPrazo ? "" : " — sem prazo para o contratante cumprir a condição"}`,
        ),
        ...prazosDePagamento.map((c) => `${curto(c.texto, 150)} (p. ${c.origem.pagina})`),
      ].join("; "),
      origem: (condicoes[0] ?? prazosDePagamento[0])?.origem,
      situacao: "localizado",
      nota: condicoes.some((c) => !c.comPrazo)
        ? "Condição sem prazo para o contratante: ver o ponto de atenção da PC3 (seção 7)."
        : undefined,
    });
  if (!condicoes[0]) naoAchado("dinheiro", "condição de pagamento");

  const juntar = (tipos: TipoAchadoDinheiro[], id: string, nome: string) => {
    const lista = tipos.flatMap(porTipo);
    if (!lista[0]) return;
    out.push({
      id,
      secao: "dinheiro",
      rotulo: "documento",
      nome,
      texto: lista.map((c) => `${curto(c.texto, 150)} (p. ${c.origem.pagina})`).join("; "),
      origem: lista[0].origem,
      situacao: "localizado",
    });
  };
  juntar(["glosa"], "leitura:dinheiro:glosa", NOME_ACHADO_DINHEIRO.glosa);
  juntar(["despesa-vedada"], "leitura:dinheiro:vedadas", NOME_ACHADO_DINHEIRO["despesa-vedada"]);
  juntar(["contrapartida"], "leitura:dinheiro:contrapartida", NOME_ACHADO_DINHEIRO.contrapartida);
  juntar(["nao-obriga"], "leitura:dinheiro:nao-obriga", NOME_ACHADO_DINHEIRO["nao-obriga"]);

  // multas, garantia e reajuste: o que mexe no valor recebido, numa linha
  const contratuais = (
    [
      ["condicoes:penalidades", "Multas e sanções"],
      ["condicoes:garantia-execucao", "Garantia de execução"],
      ["condicoes:reajuste", "Reajuste"],
    ] as const
  )
    .map(([id, nome]) => ({ nome, i: analise.itens.find((x) => x.id === id) }))
    .filter((x): x is { nome: (typeof x)["nome"]; i: ItemAnalise } => util(x.i));
  const primeiraContratual = contratuais[0];
  if (primeiraContratual)
    out.push(
      doItem(primeiraContratual.i, "dinheiro", {
        id: "leitura:dinheiro:contratuais",
        nome: contratuais.map((x) => x.nome).join(", "),
        texto: contratuais.map((x) => `${x.nome}: ${x.i.texto} (p. ${x.i.origem?.pagina ?? "—"})`).join("; "),
        tabela:
          contratuais.length > 1
            ? {
                colunas: ["Condição", "O que o código leu", "Trecho", "Página"],
                linhas: contratuais.map((x) => [
                  x.nome,
                  x.i.texto,
                  x.i.campos?.Trecho ?? x.i.origem?.trecho ?? "",
                  String(x.i.origem?.pagina ?? "—"),
                ]),
              }
            : undefined,
      }),
    );
  return out;
}

// ---------------------------------------------------------------------------------------------------------------

const RE_ELIMINA =
  /\b(?:sera(?:o)? (?:desclassificad|eliminad|inabilitad)|implicara (?:a )?(?:desclassificacao|eliminacao)|causa de (?:desclassificacao|eliminacao)|nao (?:sera|serao) (?:aceit|considerad)[oa]s? (?:as )?propostas?)/;
/** Desempate como regra (com verbo ou critério), não a palavra solta ("não se considerará… de desempate"). */
const RE_DESEMPATE =
  /\b(?:(?:o|como|os) criterios? de desempate|(?:em caso|havendo|na hipotese) de empate|empate entre .{0,60}(?:sera|serao|dar-se-a|decidid|resolvid|desempate sera))\b/;

/**
 * A linha do achado e, se ela termina em dois-pontos, as alíneas que vêm depois ("a) …", "b) …"), até o próximo
 * item numerado. O texto sai das linhas da própria página: a citação continua literal.
 */
function comAlineas(l: {
  doc: AnaliseRfp["documentos"][number];
  pagina: number;
  posicao: number;
  frase: string;
}): string {
  const texto = l.doc.paginas.find((p) => p.numero === l.pagina)?.texto ?? "";
  const ini = texto.lastIndexOf("\n", l.posicao) + 1;
  const linhas = texto.slice(ini).split("\n");
  const primeira = linhas[0]?.trim() ?? "";
  if (!/:\s*$/.test(primeira)) return l.frase;
  const juntas = [primeira];
  for (const linha of linhas.slice(1)) {
    const t = linha.trim();
    if (!t || /^\d{1,2}(?:\.\d{1,2})+\.?\s/.test(t) || juntas.join(" ").length > 500) break;
    juntas.push(t);
  }
  return limparEspacos(juntas.join(" "));
}

function julgamento(analise: AnaliseRfp, naoAchado: (s: SecaoLeitura, n: string) => void): ItemLeitura[] {
  const out: ItemLeitura[] = [];
  const itens = analise.itens;
  const criterio = itens.find((i) => i.id === "julgamento:criterio");
  const pesos = itens.filter((i) => i.id.startsWith("julgamento:peso:") && util(i));
  // o critério já está na seção 1; o peso do preço, com a regra, abre o item dos critérios
  const pesoDoPreco = pesos[0]
    ? `Peso do preço: ${curto(semNumeroDoItem(pesos[0].texto), 220)} (p. ${pesos[0].origem?.pagina ?? "—"}). `
    : "";
  // critérios pontuados: uma linha por critério, com o máximo e o que dá a nota máxima (nunca uma por faixa)
  const pontuados = itens.filter((i) => i.id.startsWith("julgamento:criterio-pontuado:") && util(i));
  const blocos = itens.filter(
    (i) => i.id.startsWith("julgamento:pontuacao:") && util(i) && /^\d{1,2}\.\s/.test(i.texto.trim()),
  );
  const linhas = pontuados.length
    ? pontuados.map((i) => [
        i.nome.replace(/^Critério /, ""),
        curto(i.texto, 160),
        i.campos?.Pontos ?? "",
        (i.campos?.Níveis ?? "").split(";")[0]?.trim() ?? "",
        String(i.origem?.pagina ?? "—"),
      ])
    : blocos.map((i) => [
        i.texto.trim().split(/\s/)[0] ?? "",
        curto(i.texto.replace(/^\d{1,2}\.\s*/, ""), 160),
        i.campos?.Pontos ?? "",
        "",
        String(i.origem?.pagina ?? "—"),
      ]);
  const maxima = itens.find(
    (i) => (i.id === "julgamento:pontuacao-maxima" || /Pontuação \(total/.test(i.nome)) && util(i),
  );
  const minima = itens.find((i) => i.id === "julgamento:pontuacao-minima" && util(i));
  if (linhas.length)
    out.push({
      id: "leitura:julgamento:criterios",
      secao: "julgamento",
      rotulo: "documento",
      nome: "Critérios de pontuação",
      texto: `${pesoDoPreco}${linhas.length} critérios${maxima ? `; máximo ${maxima.texto}` : ""}${minima ? `; mínimo ${minima.texto} para não ser eliminada` : ""}. ${linhas
        .map((l) => `${l[0]} ${curto(l[1] ?? "", 60)}: ${l[2]} pts`)
        .join("; ")}.`,
      origem: (util(criterio) ? criterio : (pontuados[0] ?? blocos[0]))?.origem,
      situacao: "localizado",
      tabela: { colunas: ["Critério", "O que avalia", "Máximo", "Nota máxima", "Página"], linhas },
      nota:
        blocos.length && !pontuados.length
          ? "Só os critérios de primeiro nível; os subcritérios estão na tabela do edital."
          : undefined,
    });
  else naoAchado("julgamento", "tabela de critérios");

  const docs = analise.documentos;
  // a frase que abre a lista ("Serão eliminadas as propostas:") com as alíneas dela; sem isso, a frase curta
  // vira a janela de texto em volta, que pega o fim da tabela de pontuação
  const elimina = localizarTodos(docs, RE_ELIMINA)
    .filter((l) => !/habilita/i.test(l.frase))
    .slice(0, 3)
    .map((l) => ({ l, texto: comAlineas(l) }));
  if (elimina[0])
    out.push({
      id: "leitura:julgamento:eliminacao",
      secao: "julgamento",
      rotulo: "documento",
      nome: "Eliminação",
      texto: elimina.map((e) => `${curto(semNumeroDoItem(e.texto), 300)} (p. ${e.l.pagina})`).join("; "),
      origem: { documento: elimina[0].l.doc.rotulo, pagina: elimina[0].l.pagina, trecho: elimina[0].texto },
      situacao: "localizado",
    });
  const desempate = localizarTodos(docs, RE_DESEMPATE)[0];
  if (desempate)
    out.push({
      id: "leitura:julgamento:desempate",
      secao: "julgamento",
      rotulo: "documento",
      nome: "Desempate",
      texto: curto(semNumeroDoItem(desempate.frase), 260),
      origem: { documento: desempate.doc.rotulo, pagina: desempate.pagina, trecho: desempate.frase },
      situacao: "localizado",
    });
  else naoAchado("julgamento", "desempate");

  const apresentacao = itens.filter((i) => i.secao === "apresentacao" && util(i));
  if (apresentacao[0])
    out.push({
      id: "leitura:julgamento:proposta",
      secao: "julgamento",
      rotulo: "documento",
      nome: "O que vai na proposta (checklist)",
      texto: apresentacao.map((i) => `${i.nome}: ${curto(semNumeroDoItem(i.texto), 90)}`).join("; "),
      origem: apresentacao[0].origem,
      situacao: "localizado",
      tabela: {
        colunas: ["Item", "O que o edital pede", "Página"],
        linhas: apresentacao.map((i) => [
          i.nome,
          curto(semNumeroDoItem(i.texto), 240),
          String(i.origem?.pagina ?? "—"),
        ]),
      },
    });
  for (const i of itens.filter((x) => x.secao === "apresentacao" && x.situacao === "nao-localizado"))
    naoAchado("julgamento", i.nome.toLowerCase());
  return out;
}

// ---------------------------------------------------------------------------------------------------------------

/** O que a FGV precisa conferir sobre si mesma: enquadramento, tempo de existência, experiência, capacidade. */
const SOBRE_SI = [
  "osc-experiencia",
  "atestado",
  "capital-minimo",
  "indices",
  "osc-estatuto",
  "registro-conselho",
];

function habilitacao(analise: AnaliseRfp, naoAchado: (s: SecaoLeitura, n: string) => void): ItemLeitura[] {
  const out: ItemLeitura[] = [];
  const lista = analise.listaDeDocumentos;
  const catalogo = analise.itens.filter((i) => i.secao === "habilitacao" && util(i));
  const prazo = analise.itens.find((i) => i.id.startsWith("prazos:certame:documentos") && util(i));
  if (lista.documentos.length) {
    const primeiro = lista.documentos[0];
    out.push({
      id: "leitura:habilitacao:lista",
      secao: "habilitacao",
      rotulo: "documento",
      nome: `Documentos (${lista.documentos.length}, linha a linha da lista do edital)`,
      texto: lista.documentos.map((d) => `${d.numero} ${curto(d.texto, 70)}`).join("; "),
      origem: primeiro?.origem,
      situacao: "localizado",
      tabela: {
        // com mais de uma lista no edital (a da organização e a da rede), a coluna diz de qual é cada linha
        colunas:
          new Set(lista.documentos.map((d) => d.lista)).size > 1
            ? ["Nº", "Documento", "Lista", "Página", "Providenciado"]
            : ["Nº", "Documento", "Página", "Providenciado"],
        linhas: lista.documentos.map((d) =>
          new Set(lista.documentos.map((x) => x.lista)).size > 1
            ? [d.numero, d.texto, d.lista, String(d.origem.pagina), ""]
            : [d.numero, d.texto, String(d.origem.pagina), ""],
        ),
      },
    });
  } else if (catalogo.length)
    out.push({
      id: "leitura:habilitacao:lista",
      secao: "habilitacao",
      rotulo: "documento",
      nome: `Documentos (${catalogo.length}, pelo catálogo do código)`,
      texto: catalogo.map((i) => i.nome).join("; "),
      origem: catalogo[0]?.origem,
      situacao: "localizado",
      nota: "O código não achou a lista numerada do edital: estes são os documentos do catálogo achados no texto. Conferir a seção de habilitação.",
      tabela: {
        colunas: ["Grupo", "Documento", "Página", "Providenciado"],
        linhas: catalogo.map((i) => [i.campos?.Grupo ?? "", i.nome, String(i.origem?.pagina ?? "—"), ""]),
      },
    });
  else naoAchado("habilitacao", "lista de documentos");

  const quem = lista.quemEntrega;
  if (quem || prazo)
    out.push({
      id: "leitura:habilitacao:quem-entrega",
      secao: "habilitacao",
      rotulo: "documento",
      nome: "Quem entrega e em que prazo",
      texto: [
        quem ? curto(semNumeroDoItem(quem.texto), 220) : undefined,
        prazo ? `Prazo: ${prazo.texto}` : undefined,
      ]
        .filter(Boolean)
        .join(" "),
      origem: quem?.origem ?? prazo?.origem,
      situacao: "localizado",
    });
  const sobreSi = catalogo.filter((i) => SOBRE_SI.some((s) => i.id === `habilitacao:${s}`));
  if (sobreSi[0])
    out.push({
      id: "leitura:habilitacao:sobre-a-fgv",
      secao: "habilitacao",
      rotulo: "documento",
      nome: "O que a FGV precisa conferir sobre si",
      texto: sobreSi
        .map((i) => `${i.nome}: ${curto(semNumeroDoItem(i.texto), 110)} (p. ${i.origem?.pagina ?? "—"})`)
        .join("; "),
      origem: sobreSi[0].origem,
      situacao: "localizado",
    });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------

/** Brecha do Raio-X → premissa crítica (CLAUDE.md, seção 3: as brechas não são riscos; a premissa é a ponte). */
const PREMISSA_DA_REGRA: Record<string, CodigoPremissa | undefined> = {
  CTR4: "PC1",
  CTR5: "PC3",
  CP13: "PC1",
  CE15: "PC4",
  CE17: "PC5",
  "encargo-logistica": "PC7",
};
const IMPACTO_DA_PREMISSA: Record<CodigoPremissa, Impacto> = {
  PC1: 2,
  PC2: 2,
  PC3: 1,
  PC4: 4,
  PC5: 4,
  PC6: 2,
  PC7: 3,
  PC8: 5,
};

/**
 * Caixa concentrado no fim (conta do código sobre o cronograma de desembolso): as duas últimas parcelas somam
 * metade ou mais do valor. Vai para os pontos de atenção como o item de maior impacto (caixa).
 */
function caixaConcentrado(analise: AnaliseRfp): ItemLeitura | undefined {
  const parcelas = analise.desembolso.parcelas;
  if (parcelas.length < 3) return undefined;
  const ultimas = parcelas.slice(-2);
  const fim = Math.round(ultimas.reduce((s, p) => s + p.percentual, 0) * 100) / 100;
  if (fim < 50) return undefined;
  const antes = Math.round((analise.desembolso.soma - fim) * 100) / 100;
  const marco = parcelas.at(-3)?.prazo;
  return {
    id: "leitura:atencao:caixa",
    secao: "atencao",
    rotulo: "sugestao",
    nome: "Caixa concentrado nas últimas entregas",
    texto: `As duas últimas parcelas (${ultimas.map((p) => curto(p.rotulo, 40)).join(" e ")}) somam ${porcento(fim)} do valor${
      ultimas.every((p) => p.prazo) ? `, com prazos de ${ultimas.map((p) => p.prazo).join(" e ")}` : ""
    }; antes delas, a contratada recebe no máximo ${porcento(antes)}${marco ? ` (até ${marco})` : ""}.`,
    origem: ultimas[0]?.origem,
    situacao: "calculado",
    impacto: 1,
    porquePesa:
      "A equipe trabalha quase toda a vigência com pouco faturamento: o custo acumulado fica à frente do recebido até o fim.",
    pergunta:
      "Solicita-se avaliar a possibilidade de redistribuir os percentuais de desembolso ou de pagar parcelas intermediárias dos produtos finais.",
    nota: "Conta do código sobre a tabela de desembolso; confira os percentuais no documento.",
  };
}

function pontosDeAtencao(analise: AnaliseRfp): ItemLeitura[] {
  const out: ItemLeitura[] = [];
  // um ponto por premissa crítica: o mesmo assunto em outra página entra como "também nas p. …" no primeiro
  const porPremissa = new Map<string, ItemLeitura>();
  const ja = (premissa: string | undefined, pagina: number | undefined) => {
    if (!premissa) return false;
    const primeiro = porPremissa.get(premissa);
    if (!primeiro) return false;
    if (pagina && primeiro.origem?.pagina !== pagina && !primeiro.nota?.includes(`p. ${pagina}`))
      primeiro.nota = `${primeiro.nota ? `${primeiro.nota} ` : ""}Também na p. ${pagina}.`;
    return true;
  };
  const paginasDeModelo = new Set(
    analise.documentos.flatMap((d) =>
      d.paginas.filter((p) => ehPaginaDeModelo(p.texto)).map((p) => `${d.rotulo}:${p.numero}`),
    ),
  );
  // as brechas do Raio-X que não são só vagas
  for (const b of analise.itens.filter((i) => i.secao === "brechas" && i.campos?.Tipo !== "vago")) {
    if (b.origem && paginasDeModelo.has(`${b.origem.documento}:${b.origem.pagina}`)) continue;
    // a dependência que é da própria contratada ("a serem fornecidos pelo Contratado a seus empregados") não é
    // premissa sobre o contratante
    const trecho = normalizarTermo(b.origem?.trecho ?? "");
    if (
      /(?:fornecid|disponibilizad|providenciad)\w* pel[ao] (?:contratad|parceir)|a cargo d[ao] (?:contratad|parceir)/.test(
        trecho,
      )
    )
      continue;
    const premissa = PREMISSA_DA_REGRA[b.campos?.Regra ?? ""];
    if (ja(premissa, b.origem?.pagina)) continue;
    const item = doItem(b, "atencao", {
      premissa,
      rotulo: "sugestao",
      impacto: premissa ? IMPACTO_DA_PREMISSA[premissa] : 4,
      nota: premissa ? `Premissa crítica ${premissa}: ${NOME_PREMISSA[premissa]}.` : b.nota,
    });
    if (premissa) porPremissa.set(premissa, item);
    out.push(item);
  }
  for (const p of analise.premissas.pontos) {
    if (ja(p.premissa, p.origem.pagina)) continue;
    out.push({
      id: `atencao:${p.id}`,
      secao: "atencao",
      rotulo: "sugestao",
      nome: p.premissa ? `${p.premissa} · ${p.nome}` : p.nome,
      texto: curto(semNumeroDoItem(p.texto), 260),
      origem: p.origem,
      situacao: "localizado",
      premissa: p.premissa,
      porquePesa: p.porquePesa,
      pergunta: p.pergunta,
      impacto: p.impacto,
      nota:
        [
          p.premissa ? `Premissa crítica ${p.premissa}: ${NOME_PREMISSA[p.premissa]}.` : "",
          p.outrasPaginas.length ? `O mesmo padrão aparece também nas p. ${p.outrasPaginas.join(", ")}.` : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined,
    });
  }
  // os vagos ficam juntos num item, com a pergunta de cada um
  const vagos = analise.itens.filter((i) => i.secao === "brechas" && i.campos?.Tipo === "vago");
  if (vagos[0])
    out.push({
      id: "leitura:atencao:vagos",
      secao: "atencao",
      rotulo: "sugestao",
      nome: `Trechos vagos (${vagos.length})`,
      texto: vagos.map((v) => `${v.nome} (p. ${v.origem?.pagina ?? "—"})`).join("; "),
      origem: vagos[0].origem,
      situacao: "localizado",
      impacto: 6,
      porquePesa:
        "Palavra vaga numa obrigação, prazo ou entrega de quem executa: não dá para conferir o cumprimento.",
      tabela: {
        colunas: ["Trecho", "Página", "Pergunta sugerida"],
        linhas: vagos.map((v) => [
          curto(v.origem?.trecho ?? v.texto, 200),
          String(v.origem?.pagina ?? "—"),
          v.pergunta ?? "",
        ]),
      },
    });
  const caixa = caixaConcentrado(analise);
  if (caixa) out.push(caixa);
  const sub = analise.itens.find((i) => i.id === "condicoes:subcontratacao" && util(i));
  if (
    sub &&
    /vedad|nao (?:sera|e) (?:permitid|admitid)/.test(
      normalizarTermo(`${sub.texto} ${sub.campos?.Trecho ?? ""}`),
    )
  )
    out.push(
      doItem(sub, "atencao", {
        id: "leitura:atencao:subcontratacao",
        rotulo: "sugestao",
        nome: "Subcontratação vedada",
        texto: curto(semNumeroDoItem(sub.campos?.Trecho ?? sub.origem?.trecho ?? sub.texto), 240),
        porquePesa:
          "Tudo o que a equipe própria não fizer (diagramação, revisão, campo) precisa de autorização ou fica de fora do preço.",
        pergunta:
          "Solicita-se confirmar se a contratação de profissionais por prestação de serviços e de serviços acessórios (diagramação, revisão, tradução) é admitida, já que a subcontratação é vedada.",
        impacto: 5,
      }),
    );
  out.sort((a, b) => (a.impacto ?? 6) - (b.impacto ?? 6));
  const protecoes = analise.premissas.protecoes;
  if (protecoes[0])
    out.push({
      id: "leitura:protecoes",
      secao: "atencao",
      rotulo: "documento",
      nome: "Proteções que o texto dá à contratada",
      texto: protecoes
        .map((p) => `${curto(semNumeroDoItem(p.texto), 160)} (p. ${p.origem.pagina})`)
        .join("; "),
      origem: protecoes[0].origem,
      situacao: "localizado",
      nota: "Úteis para escrever as premissas críticas na proposta, citando a página.",
    });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------

function foraDaLeitura(analise: AnaliseRfp, outrasNormas: number): LeituraRfp["foraDaLeitura"] {
  const itens = analise.itens;
  const contar = (f: (i: ItemAnalise) => boolean) => itens.filter(f).length;
  const linhas: LeituraRfp["foraDaLeitura"] = [
    {
      motivo: "Seções do mapa do documento (navegação página a página)",
      quantos: contar((i) => i.secao === "mapa"),
    },
    { motivo: "Normas citadas além do regime da contratação", quantos: outrasNormas },
    {
      motivo: "Órgãos citados de passagem, sem papel na contratação",
      quantos: contar((i) => i.id.startsWith("partes:unidade:")),
    },
    {
      motivo: "Linhas de faixa e subcritérios da tabela de pontuação",
      quantos: contar(
        (i) => i.id.startsWith("julgamento:pontuacao:") && !/^\d{1,2}\.\s/.test(i.texto.trim()),
      ),
    },
  ];
  return linhas.filter((l) => l.quantos > 0);
}

/** Itens da leitura que o GP ainda não revisou. */
export function pendentesDaLeitura(leitura: LeituraRfp, dossie: AnaliseRfpDossie): ItemLeitura[] {
  return leitura.itens.filter((i) => estadoDoItem(dossie.revisoes, i.id) === "pendente");
}
