// Conferência do PGP (etapa 5), só com código. Decisões 0008 (categoria), 0009 (regras do Raio-X),
// 0013 (base do "ausente" em três níveis) e 0021 (premissas críticas).
// Todo achado é vago, conflituoso ou ausente; a gravidade vem da parte do PGP; a categoria, da regra fixa.
import { avaliarDispensa, type Caracteristicas } from "../dominio/caracteristicas";
import type { Ficha, Gravidade } from "../dominio/fichas";
import type { PremissaCritica } from "../dominio/premissas";
import type { PaginaLida } from "../dossie/esquema";
import { prazoPrincipal, extrairPrazosTotais, type PrazoTotal } from "../extracao/prazos";
import { termosDoRequisito, type Requisito, perfisDoRequisito } from "../extracao/requisitos";
import {
  NAO_LOCALIZADO,
  ORDEM_GRAVIDADE,
  type Achado,
  type Evidencia,
  type TipoAchado,
  type Verificacao,
} from "./achado";
import {
  normalizarTermo,
  paginasNaoVerificaveis,
  procurar,
  procurarPadrao,
  procurarSinais,
  type Ocorrencia,
} from "./busca";
import { paginasDaParte, parteDaPosicao, type ParteConfirmada } from "./mapa-pgp";
import { PADROES_VAGO } from "./vago";
import { fraseEmVolta } from "../texto/frase";

export interface EntradaConferencia {
  pgp: PaginaLida[];
  tap?: PaginaLida[];
  rfp?: PaginaLida[];
  partes: Ficha[];
  premissas: PremissaCritica[];
  mapa: ParteConfirmada[];
  caracteristicas: Caracteristicas;
  /** PC1…PC8 → se aplica ao projeto (confirmado pelo GP). */
  premissasAplicaveis: Record<string, boolean>;
  /** Requisitos da RFP (extraídos pelo código e editados pelo GP). */
  requisitos: Requisito[];
  /** PGP completo (interno) ou plano de trabalho / proposta para o cliente, escolhido pelo GP no mapa. */
  tipoPlano?: TipoPlano;
  /** O plano foi gerado pela própria ferramenta (autoconferência da etapa 4): as convenções dela valem. */
  planoDaFerramenta?: boolean;
  /**
   * Itens do conteúdo mínimo que a autoconferência da etapa 4 marcou "presente", com o texto de cada item apontado em
   * "onde" (decisão 0076). Antes de dar o item como ausente, o código procura esse texto no plano: achou, o item está
   * lá com outra redação. Só existe quando o dossiê tem a etapa 4.
   */
  presentesPelaMarca?: Record<string, string[]>;
}

export type TipoPlano = "pgp" | "plano-trabalho";

export interface ResultadoConferencia {
  achados: Achado[];
  verificacoes: Verificacao[];
}

/** Itens tratados pela regra das premissas críticas, e não pela busca genérica dos sinais. */
const ITENS_DAS_PREMISSAS = new Set(["B3.9", "B27.13", "A11.12"]);
/** Itens cujo sentido é estar na própria parte: achados fora dela não contam (a A8.12 é o tratamento no plano de riscos). */
const ITENS_ESTRITOS = new Set(["A8.12"]);
/** Onde cada premissa crítica tem de estar no plano (decisão 0021). */
const LUGARES_DA_PREMISSA = ["B3", "B27", "A11"] as const;
/** Texto de outro tipo de documento colado no plano (decisão 0009; CP8). */
const TEXTO_DE_OUTRO_DOCUMENTO =
  /\b(?:neste|no presente|deste|do presente) (?:termo de referencia|edital|instrumento convocatorio)\b|\bpresente edital\b|\bdesta licitacao\b|\b[ao]s? licitantes?\b/;

/** Parte usada quando o trecho fica fora de todas as partes do mapa (capa, introdução). */
const SEM_PARTE = "—";

/**
 * Convenções da própria ferramenta ("R01", "ID", "duração 0", "código EAP", "a definir pelo GP"): só aparecem nos
 * planos que ela gera. Num plano de outra pessoa, não são procuradas (decisão 0033, item 5).
 */
const CONVENCAO_DO_APP =
  /^(?:r\d{1,3}|id|n[oº°]|duracao 0|0 dias|codigo (?:da )?eap|a definir pelo gp|m\d|sm-\d+|cr-)$/;

/**
 * Sinônimos que valem como o sinal de itens certos (decisão 0033, item 5): o plano de trabalho escreve de outro
 * jeito a lista de relatórios, a lista da equipe, as métricas e a estimativa de custos. Tabela por código do item,
 * para não valer em item que só cita a mesma palavra (revisão independente da fase).
 */
const SINONIMOS_DO_ITEM: Record<string, string[]> = {
  "A7.10": ["relatórios trimestrais", "relatórios mensais", "relatórios semestrais", "relatório final"],
  "B18.1": ["equipe responsável", "equipe técnica", "equipe do projeto"],
  "B20.1": ["quadro de metas e indicadores", "metas e indicadores", "meios de aferição"],
  "B6.1": ["composição do custo", "composição dos custos", "memória de cálculo"],
  "B6.2": ["composição do custo", "composição dos custos", "memória de cálculo"],
  // a redação do próprio app ("O GP responde pelos requisitos e relata o andamento"): o ausente era regra estreita,
  // não falta (lição da rodada 3, item 2f)
  "A2.8": ["responde pelos requisitos", "andamento dos requisitos", "relata o andamento"],
};

/** Texto padrão de proteção de dados e sigilo: cláusula de modelo, não compromisso vago do plano. */
const TEXTO_PADRAO = /\blgpd\b|\b13\.709\b|\bdados pessoais\b|\bconfidencialidade\b|\bsigilo\b/;
/** O plano adia o prazo para o item do edital ou do termo ("conforme o item 7.2"); citação de fonte entre parênteses não conta. */
const REFERENCIA_A_ITEM =
  /\b(?:conforme|nos termos d[oa]|previsto n[oa]|de acordo com|segundo)\s+(?:o |a )?(?:item|subitem|cl[aá]usula|art\.?|artigo)\s*\d|\b(?:conforme|previsto|nos termos d)[oa]?\s+(?:o |a )?(?:edital|termo)\b/;
/** Compromisso do plano: obrigação, prazo, entrega, rotina de gestão, equipe ou metas. */
const OBRIGACAO_PRAZO_OU_ENTREGA =
  /\b(?:deve|devem|devera|deverao|obrigad[ao]s?|compete|cabera)\b|\bprazos?\b|\bentreg\w*|\bapresent\w*|\b(?:revist|revis[aã]o|revisad|atualiz|reuni|relat[oó]rio|cronograma|premissa|registro|monitora|substitu|ajust|metas?|equipe|profissiona)\w*/;
/** Descrição de atividade oferecida ao público: o que o projeto faz para os participantes. */
const ATIVIDADE_PARA_O_PUBLICO =
  /\b(?:acesso a|orientac[aã]o|atendimento|encaminhamento|oficinas?|benefici\w*|participantes|familias|usuarios|publico)\b/;

/**
 * Vago que não pesa no plano (decisão 0033, item 5), olhando só a frase da ocorrência: texto padrão de LGPD e
 * sigilo; "oportunamente" com referência a item do edital; descrição de atividade para o público, sem compromisso
 * de quem executa ("acesso a microcrédito, quando necessário").
 */
const ASPAS = /['"\u201c\u201d\u2018\u2019\u00ab\u00bb]/;

/**
 * A expressão está entre aspas no texto, colada a elas ("prazo de cada ordem de serviço ('em tempo hábil')") ou
 * dentro de um trecho citado na mesma linha ("informar o prazo do trecho "O não cumprimento em tempo hábil…"").
 */
export function entreAspas(texto: string, posicao: number, tamanho: number): boolean {
  const antes = texto.slice(Math.max(0, posicao - 2), posicao);
  const depois = texto.slice(posicao + tamanho, posicao + tamanho + 2);
  if (ASPAS.test(antes) && ASPAS.test(depois)) return true;
  const ini = texto.lastIndexOf("\n", posicao) + 1;
  const fimLinha = texto.indexOf("\n", posicao + tamanho);
  const linhaAntes = texto.slice(ini, posicao);
  const linhaDepois = texto.slice(posicao + tamanho, fimLinha < 0 ? undefined : fimLinha);
  // aspas retas: número ímpar antes e uma depois; aspas curvas: abertura sem fechamento antes, fechamento depois
  const retas = (linhaAntes.match(/"/g) ?? []).length % 2 === 1 && linhaDepois.includes('"');
  const curvas = linhaAntes.lastIndexOf("“") > linhaAntes.lastIndexOf("”") && linhaDepois.includes("”");
  return retas || curvas;
}

/** Texto comparável: minúsculo, sem acento, só letras e números separados por um espaço. */
function soPalavras(texto: string): string {
  return normalizarTermo(texto)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Texto do edital e do TAP, comparável, para saber se o plano repete um trecho deles. */
export function textoDasFontes(paginas: { texto: string }[]): string {
  return ` ${soPalavras(paginas.map((p) => p.texto).join(" "))} `;
}

/**
 * A expressão vaga, com as duas palavras vizinhas (antes ou depois), está no edital ou no TAP (lição da rodada 3,
 * item 2c): o plano reproduz o documento ("prevê multa pela falta de entrega em tempo hábil"), e o vago é do
 * documento, não do plano. Fica para a leitura do PMO e para a pergunta ao contratante.
 */
export function citaODocumento(texto: string, posicao: number, tamanho: number, fontes: string): boolean {
  if (fontes.trim() === "") return false;
  const termo = soPalavras(texto.slice(posicao, posicao + tamanho));
  const antes = soPalavras(texto.slice(Math.max(0, posicao - 80), posicao))
    .split(" ")
    .filter(Boolean)
    .slice(-2);
  const depois = soPalavras(texto.slice(posicao + tamanho, posicao + tamanho + 80))
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);
  const comAntes = antes.length === 2 ? ` ${[...antes, termo].join(" ")} ` : "";
  const comDepois = depois.length === 2 ? ` ${[termo, ...depois].join(" ")} ` : "";
  return Boolean((comAntes && fontes.includes(comAntes)) || (comDepois && fontes.includes(comDepois)));
}

/** "a definir pelo GP", "a ser definido pelo GP", "a definir: decisão do GP": pendência do GP, convenção do app. */
export function ehDecisaoDoGp(texto: string, posicao: number): boolean {
  // o item inteiro é decisão do GP (rótulo da ferramenta no começo da linha)
  const linha = texto.slice(texto.lastIndexOf("\n", posicao) + 1, posicao);
  if (/^\s*\[Decis[aã]o do GP\]/.test(linha)) return true;
  return /^a (?:ser )?definid?[oa]?s?r?\s*(?:pelo gp|[:;,—–-]?\s*decis[aã]o do gp)/i.test(
    normalizarTermo(texto.slice(posicao, posicao + 40)),
  );
}

/**
 * "a definir" que diz quando ou onde se define (decisão 0076): "a definir antes do campo", "a definir no P1 e no
 * treinamento", "a definir até a reunião inicial"; ou a mesma frase traz a questão aberta (QU-09) ou o acontecimento
 * que a resolve ("quando o esclarecimento for respondido"). É pendência rastreada, não vago do plano.
 */
// só com um marco nomeado depois da preposição: "em conjunto com", "em momento oportuno", "no decorrer do projeto"
// e "durante a execução" continuam vagos (revisão de código da decisão 0076)
const MARCO_NOMEADO =
  "(?:p\\d+|produto \\w+|reuniao|campo|treinamento|coleta|piloto|oficina|assinatura|ordem de servico|evento|inicio|entrega|aceite|questionario|validacao|esclarecimento|qu-\\d+)";
const A_DEFINIR_COM_QUANDO_OU_ONDE = new RegExp(
  `\\ba (?:ser )?definid?[oa]?s?r? (?:antes d[oa]s?|depois d[oa]s?|apos [oa]s?|ate [oa]s?|n[oa]s?|em|durante (?:[oa]s?)?) ?(?:primeir[oa]s? |ultim[oa]s? )?${MARCO_NOMEADO}\\b`,
);
const QUANDO_SE_RESOLVE =
  /\bquando (?:o|a|os|as) [a-z]+ (?:for|forem|estiver|estiverem|chegar|chegarem|sair|sairem)\b|\bqu-\d+/;

export function aDefinirComQuandoOuOnde(frase: string): boolean {
  const t = normalizarTermo(frase).toLowerCase();
  return A_DEFINIR_COM_QUANDO_OU_ONDE.test(t) || QUANDO_SE_RESOLVE.test(t);
}

const PALAVRAS_VAZIAS_DA_QUESTAO = new Set(
  "para pelo pela pelos pelas como mais sobre entre cada este esta isso essa esse quando onde qual quais antes depois ainda tambem outro outra sem nos nas dos das com uma que nao definir sugestao cliente clientes contratante relatorio relatorios produto produtos prazo prazos entrega entregas projeto plano equipe atividade atividades dados documento resposta".split(
    " ",
  ),
);
const radicaisDe = (t: string) =>
  new Set(
    normalizarTermo(t)
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !PALAVRAS_VAZIAS_DA_QUESTAO.has(w))
      .map((w) => w.slice(0, 5)),
  );

/**
 * O "a definir" está ligado a uma questão aberta do registro de questões (B9) do próprio plano: uma linha com QU-nn
 * divide pelo menos três palavras-chave com a frase (por exemplo, "data a definir" da referência de início e a
 * questão sobre a ordem de serviço). Decisão 0076.
 */
export function ligadoAQuestaoAberta(frase: string, questoes: string[]): boolean {
  const a = radicaisDe(frase);
  return questoes.some((q) => [...radicaisDe(q)].filter((w) => a.has(w)).length >= 3);
}

/**
 * Itens que o próprio app escreve num formato que os sinais da ficha não pegam (decisão 0076):
 * - B27.1: o identificador de cada risco no formato do app ("rk01 · contratual");
 * - A11.1: o plano diz quem decide as mudanças e dispensa o comitê formal (porte pequeno).
 */
function presentePeloFormatoDoApp(
  codigo: string,
  paginas: PaginaLida[],
  faixa: Set<number> | undefined,
  planoDoApp: boolean,
): number | undefined {
  const naFaixa = paginas.filter((p) => !faixa || faixa.has(p.numero));
  for (const p of naFaixa) {
    const t = normalizarTermo(p.texto).toLowerCase();
    if (codigo === "B27.1" && /\b[a-z]{1,4}-?\d{2,3} ?· ?[a-z]/.test(t)) return p.numero;
    // A11.1: só no plano do app, e "sem comitê" e "quem decide" na mesma linha (o mesmo item)
    if (
      codigo === "A11.1" &&
      planoDoApp &&
      // as linhas do texto original: a normalização junta as quebras de linha
      p.texto
        .split("\n")
        .map((l) => normalizarTermo(l).toLowerCase())
        .some(
          (l) =>
            /\b(?:sem|dispensa\w*|nao ha)\s+(?:o\s+|de\s+|um\s+)?comite\b/.test(l) &&
            /\b(?:decide|decidem|aprova|aprovam|autoriza|autorizam)\b/.test(l),
        )
    )
      return p.numero;
  }
  return undefined;
}

/**
 * O texto de um item que a autoconferência da etapa 4 marcou "presente" está no plano (decisão 0076): procura um
 * trecho de oito palavras do começo e um do meio de cada texto. Devolve a página.
 */
export function localizarPelaMarca(textos: string[] | undefined, paginas: PaginaLida[]): number | undefined {
  if (!textos?.length) return undefined;
  const corpo = paginas.map((p) => ({ numero: p.numero, t: ` ${soPalavras(p.texto)} ` }));
  for (const texto of textos) {
    const ws = soPalavras(texto).split(" ").filter(Boolean);
    if (ws.length < 4) continue;
    const meio = Math.max(0, Math.floor(ws.length / 2) - 4);
    for (const trecho of [ws.slice(0, 8), ws.slice(meio, meio + 8)]) {
      const achou = corpo.find((p) => p.t.includes(` ${trecho.join(" ")} `));
      if (achou) return achou.numero;
    }
  }
  return undefined;
}

export function vagoQueNaoPesa(padrao: string, o: { frase: string }): boolean {
  const t = normalizarTermo(o.frase);
  if (TEXTO_PADRAO.test(t)) return true;
  if (padrao === "oportunamente" && REFERENCIA_A_ITEM.test(t)) return true;
  if (padrao === "quando-necessario" || padrao === "se-for-o-caso")
    return ATIVIDADE_PARA_O_PUBLICO.test(t) && !OBRIGACAO_PRAZO_OU_ENTREGA.test(t);
  return false;
}

export function sinaisParaOutroPlano(
  item: { codigo: string; termos: string[]; compostos: string[][] },
  planoDaFerramenta = false,
): { termos: string[]; compostos: string[][] } {
  // no plano que a própria ferramenta gerou (autoconferência da etapa 4), as convenções dela valem
  const valeNoOutroPlano = (t: string) => planoDaFerramenta || !CONVENCAO_DO_APP.test(normalizarTermo(t));
  const termos = item.termos.filter(valeNoOutroPlano);
  // só ganha sinônimo o item que já tinha sinal de verdade: o sinônimo amplia, não cria a busca
  const extras = termos.length ? (SINONIMOS_DO_ITEM[item.codigo] ?? []) : [];
  return {
    termos: [...new Set([...termos, ...extras])],
    compostos: item.compostos.filter((c) => c.every(valeNoOutroPlano)),
  };
}

export function conferirPlano(e: EntradaConferencia): ResultadoConferencia {
  const achados: Achado[] = [];
  const verificacoes: Verificacao[] = [];
  const fichas = new Map(e.partes.map((p) => [p.codigo, p]));
  const confirmadas = new Map(e.mapa.map((m) => [m.codigo, m]));
  const ilegiveis = paginasNaoVerificaveis(e.pgp);

  const gravidadeDe = (codigo: string): Gravidade => {
    const g = fichas.get(codigo)?.gravidade;
    return g === "grave" || g === "média" || g === "baixa" ? g : "baixa";
  };
  const categoriaDe = (codigo: string): string => fichas.get(codigo)?.categoria || "planejamento";
  const nomeDe = (codigo: string): string => fichas.get(codigo)?.nome ?? "trecho fora das partes do mapa";
  const presente = (codigo: string) => confirmadas.get(codigo)?.situacao === "presente";

  function registrar(a: {
    tipo: TipoAchado;
    regra: string;
    partes: string[];
    chave: string;
    titulo: string;
    descricao: string;
    evidencias: Evidencia[];
    sugestao: string;
    categoriaComparada?: "tempo" | "custo" | "escopo";
  }) {
    const partes = a.partes.length ? a.partes : [SEM_PARTE];
    // a parte mais grave decide (seção 5 da especificação, etapa 5, passo 4)
    const parte =
      [...partes].sort((x, y) => ORDEM_GRAVIDADE[gravidadeDe(y)] - ORDEM_GRAVIDADE[gravidadeDe(x)])[0] ??
      SEM_PARTE;
    achados.push({
      id: `${a.regra}:${parte}:${a.chave}`,
      tipo: a.tipo,
      regra: a.regra,
      parte,
      partes,
      gravidade: gravidadeDe(parte),
      categoria: a.categoriaComparada ?? categoriaDe(parte),
      origemCategoria: a.categoriaComparada ? "comparado" : "parte",
      titulo: a.titulo,
      descricao: a.descricao,
      evidencias: a.evidencias,
      sugestao: a.sugestao,
    });
  }

  const evidenciaPgp = (o: Ocorrencia): Evidencia => ({
    documento: "pgp",
    pagina: o.pagina,
    trecho: o.trecho,
    rotulo: `PGP, p. ${o.pagina}`,
  });
  const evidenciaFicha = (codigo: string, texto: string): Evidencia => ({
    documento: "ficha",
    trecho: texto,
    rotulo: `Conteúdo mínimo ${codigo} (skill PMO)`,
  });

  /** "Ausente" só vale com o plano inteiro legível; senão, a verificação fica "não verificável". */
  function ausenteOuNaoVerificavel(id: string, alvo: string, descricao: string, gerar: () => void) {
    if (ilegiveis.length) {
      verificacoes.push({
        id,
        alvo,
        descricao,
        estado: "nao-verificavel",
        detalhe: `Páginas sem texto legível no plano (${ilegiveis.join(", ")}): o código não pode dar o item como ausente.`,
      });
      return;
    }
    verificacoes.push({ id, alvo, descricao, estado: "achado", detalhe: NAO_LOCALIZADO });
    gerar();
  }

  // ---------- (b) partes do PGP e (c) conteúdo mínimo ----------
  for (const ficha of e.partes) {
    const conf = confirmadas.get(ficha.codigo);
    const idParte = `parte:${ficha.codigo}`;
    if (!conf || conf.situacao === "dispensada") {
      verificacoes.push({
        id: idParte,
        alvo: ficha.codigo,
        descricao: ficha.nome,
        estado: "dispensado-gp",
        detalhe: conf?.justificativa ? `Dispensado pelo GP: ${conf.justificativa}` : "Dispensado pelo GP.",
      });
      continue;
    }
    if (conf.situacao === "nao-existe") {
      ausenteOuNaoVerificavel(idParte, ficha.codigo, ficha.nome, () =>
        registrar({
          tipo: "ausente",
          regra: "parte-ausente",
          partes: [ficha.codigo],
          chave: "parte",
          titulo: `${ficha.nome}: parte não localizada pelo código — conferir no documento`,
          descricao: `A parte ${ficha.codigo} (${ficha.nome}) não foi localizada no plano, nem com título próprio nem junto de outra parte, e o GP não a marcou como dispensada no mapa.`,
          evidencias: [
            evidenciaFicha(ficha.codigo, `Parte do plano prevista: ${ficha.nome} (${ficha.tipo}).`),
          ],
          sugestao: `Sugere-se incluir a parte "${ficha.nome}" no plano ou, se ela não faz sentido para este projeto, marcá-la como dispensada no mapa, com a justificativa.`,
        }),
      );
      continue;
    }
    verificacoes.push({
      id: idParte,
      alvo: ficha.codigo,
      descricao: ficha.nome,
      estado: "ok",
      detalhe: "Parte presente no mapa.",
    });

    const faixa = paginasDaParte(conf);
    for (const item of ficha.itens) {
      const id = `item:${item.codigo}`;
      const base = { id, alvo: item.codigo, descricao: item.texto };
      const dispensa = avaliarDispensa(item.dispensa, e.caracteristicas);
      if ("dispensavel" in dispensa && dispensa.dispensavel) {
        verificacoes.push({
          ...base,
          estado: "dispensavel",
          detalhe: `Dispensável neste projeto: ${dispensa.motivo}.`,
        });
        continue;
      }
      if (ITENS_DAS_PREMISSAS.has(item.codigo)) {
        verificacoes.push({ ...base, estado: "ok", detalhe: "Conferido na regra das premissas críticas." });
        continue;
      }
      if (item.confere === "só PMO") {
        verificacoes.push({
          ...base,
          estado: "nao-conferido",
          detalhe: "Não conferido pelo código: depende de interpretação.",
        });
        continue;
      }
      // "a comparação é do código": item conferido por comparação (prazos, marcos), nunca por busca de palavra
      if (/a compara[cç][aã]o [eé] do c[oó]digo/i.test(item.texto)) {
        verificacoes.push({
          ...base,
          estado: "nao-conferido",
          detalhe:
            "Item de comparação (prazos e marcos): não é conferido por busca de palavra, e a comparação ainda não está no código.",
        });
        continue;
      }
      const sinais = sinaisParaOutroPlano(item, e.planoDaFerramenta);
      if (!sinais.termos.length && !sinais.compostos.length) {
        verificacoes.push({
          ...base,
          estado: "nao-conferido",
          detalhe: item.estruturas.length
            ? `Não conferido pelo código: o sinal é uma estrutura (${item.estruturas.join("; ")}).`
            : "Não conferido pelo código: os sinais são convenções da própria ferramenta.",
        });
        continue;
      }
      const naParte = procurarSinais(e.pgp, sinais, faixa);
      if (naParte) {
        verificacoes.push({ ...base, estado: "ok", detalhe: `Localizado na p. ${naParte.pagina}.` });
        continue;
      }
      const noPlano = faixa && !ITENS_ESTRITOS.has(item.codigo) ? procurarSinais(e.pgp, sinais) : undefined;
      if (noPlano) {
        verificacoes.push({
          ...base,
          estado: "ok",
          detalhe: `Localizado fora da parte, na p. ${noPlano.pagina}: conferir se é o lugar certo.`,
        });
        continue;
      }
      // antes do ausente (decisão 0076): o formato que o próprio app usa e a marca "presente" da etapa 4
      const peloFormato = presentePeloFormatoDoApp(
        item.codigo,
        e.pgp,
        faixa,
        Boolean(e.planoDaFerramenta || e.presentesPelaMarca),
      );
      if (peloFormato) {
        verificacoes.push({
          ...base,
          estado: "ok",
          detalhe: `Localizado na p. ${peloFormato}, no formato que o app usa (os termos da ficha não aparecem).`,
        });
        continue;
      }
      const pelaMarca = localizarPelaMarca(
        e.presentesPelaMarca?.[item.codigo],
        e.pgp.filter((p) => !faixa || faixa.has(p.numero)),
      );
      if (pelaMarca) {
        verificacoes.push({
          ...base,
          estado: "pela-marca-do-pmo",
          detalhe: `Presente pela autoconferência da etapa 4: o texto do item que ela aponta está na p. ${pelaMarca}; os termos da ficha não aparecem (redação a conferir).`,
        });
        continue;
      }
      ausenteOuNaoVerificavel(id, item.codigo, item.texto, () =>
        registrar({
          tipo: "ausente",
          regra: "conteudo-minimo",
          partes: [ficha.codigo],
          chave: item.codigo,
          titulo: `${item.codigo} ${NAO_LOCALIZADO}`,
          descricao: `${ficha.nome}: o conteúdo mínimo "${item.texto}" não foi localizado no plano (termos procurados: ${sinais.termos.join(", ")}).`,
          evidencias: [evidenciaFicha(item.codigo, `${item.texto}. Fonte: ${item.fonte}.`)],
          sugestao: `Sugere-se incluir em "${ficha.nome}": ${item.texto.charAt(0).toLowerCase()}${item.texto.slice(1)}. Se o projeto não precisa disso, recomenda-se registrar o motivo.`,
        }),
      );
    }
  }

  // ---------- premissas críticas (decisão 0021) ----------
  for (const pc of e.premissas) {
    const id = `premissa:${pc.codigo}`;
    const base = { id, alvo: pc.codigo, descricao: pc.titulo };
    if (!e.premissasAplicaveis[pc.codigo]) {
      verificacoes.push({
        ...base,
        estado: "dispensado-gp",
        detalhe: "O GP marcou que esta premissa não se aplica ao projeto.",
      });
      continue;
    }
    const sinais = { termos: [...pc.sinaisNoPlano.termos, pc.codigo], compostos: pc.sinaisNoPlano.compostos };
    const achadoNoPlano = procurarSinais(e.pgp, sinais);
    const noPlano = achadoNoPlano ? [achadoNoPlano] : [];
    const evidencia = evidenciaFicha(pc.codigo, `${pc.titulo}. Onde no plano: ${pc.ondeNoPlano}`);
    if (!noPlano.length) {
      ausenteOuNaoVerificavel(id, pc.codigo, pc.titulo, () =>
        registrar({
          tipo: "ausente",
          regra: "premissa-critica",
          partes: ["A8", ...LUGARES_DA_PREMISSA],
          chave: pc.codigo,
          titulo: `Premissa crítica ${pc.codigo} ${NAO_LOCALIZADO}`,
          descricao: `A premissa crítica "${pc.titulo}" se aplica ao projeto (confirmado pelo GP) e não foi localizada no plano. Ela deveria estar no registro de premissas (B3), no registro de riscos (B27), no plano de mudanças (A11) e no tratamento das premissas críticas do plano de riscos (A8.12).`,
          evidencias: [evidencia],
          sugestao: `Sugere-se escrever a premissa no plano: o que se assume (${pc.assume.replace(/\.$/, "")}), de quem depende, até quando e o efeito se falhar; com um risco ligado no B27 (resposta e gatilho) e o modo de reajustar escopo, prazo e metas no A11.`,
        }),
      );
      continue;
    }
    let faltou = false;
    for (const lugar of LUGARES_DA_PREMISSA) {
      if (!presente(lugar)) continue; // parte dispensada ou ausente: o achado é o da parte
      const faixa = paginasDaParte(confirmadas.get(lugar));
      if (!faixa) continue; // parte fundida com outra: o plano inteiro já foi procurado
      if (procurarSinais(e.pgp, sinais, faixa)) continue;
      faltou = true;
      ausenteOuNaoVerificavel(`${id}:${lugar}`, pc.codigo, `${pc.titulo} (${lugar})`, () =>
        registrar({
          tipo: "ausente",
          regra: "premissa-critica-lugar",
          partes: [lugar],
          chave: pc.codigo,
          titulo: `Premissa crítica ${pc.codigo} não localizada em ${nomeDe(lugar)}`,
          descricao: `A premissa crítica "${pc.titulo}" aparece no plano (p. ${noPlano[0]?.pagina}), mas não foi localizada em ${lugar} (${nomeDe(lugar)}), onde também tem de estar.`,
          evidencias: [evidenciaPgp(noPlano[0] as Ocorrencia), evidencia],
          sugestao:
            lugar === "B27"
              ? `Sugere-se registrar no B27 o risco de a premissa ${pc.codigo} não se confirmar, com resposta e gatilho.`
              : lugar === "A11"
                ? `Sugere-se dizer no plano de mudanças como reajustar escopo, prazo e metas se a premissa ${pc.codigo} falhar.`
                : `Sugere-se escrever a premissa ${pc.codigo} no registro de premissas, com responsável e prazo para validar.`,
        }),
      );
    }
    if (!faltou)
      verificacoes.push({ ...base, estado: "ok", detalhe: `Localizada (p. ${noPlano[0]?.pagina}).` });
  }

  // ---------- (a) requisitos da RFP ----------
  const lugarDoEscopo = ["B17", "A13", "A1"].find((c) => presente(c)) ?? "B17";
  const faixaEscopo = paginasDaParte(confirmadas.get(lugarDoEscopo));
  const lugarDaEquipe = ["B18", "A6", "B26"].find((c) => presente(c)) ?? "A6";
  for (const r of e.requisitos) {
    const id = `requisito:${r.numero}`;
    // o número R e o rótulo "Produto N" também valem: a descrição pode vir partida da tabela de duas colunas da RFP
    const descritivos = termosDoRequisito(r);
    const termos = descritivos.length
      ? [...descritivos, r.numero, ...(/^produto \d+$/i.test(r.rotulo.trim()) ? [r.rotulo.trim()] : [])]
      : [];
    const base = { id, alvo: r.numero, descricao: `${r.rotulo}: ${r.descricao}` };
    // quantidade, local e condição dependem de leitura (o plano pode escrever "doze oficinas", o nome do
    // município ou o público com outras palavras)
    // a obrigação de quem executa (método da etapa 1) também: a regra do plano de trabalho fica para a fase M5
    if (r.tipo === "quantidade" || r.tipo === "local" || r.tipo === "condicao" || r.tipo === "obrigacao") {
      verificacoes.push({
        ...base,
        estado: "nao-conferido",
        detalhe:
          "Quantidade, local, condição do objeto e obrigação de quem executa não são conferidos pelo código nesta versão: conferir no plano.",
      });
      continue;
    }
    if (r.tipo === "equipe") {
      // a equipe-chave é um requisito só, com a lista dos perfis (decisão 0054); cada perfil é procurado
      // as 5 primeiras palavras bastam: o plano costuma citar o perfil de forma resumida
      const achar = (perfil: string) => {
        const termo = perfil.split(/\s+/).slice(0, 5).join(" ");
        return normalizarTermo(termo).length >= 6
          ? procurar(e.pgp, [termo], { primeira: true })[0]
          : undefined;
      };
      const perfis = perfisDoRequisito(r);
      const faltam = perfis.filter((x) => !achar(x));
      const papel = faltam.join("; ");
      if (!faltam.length) {
        const primeiro = achar(perfis[0] ?? "");
        verificacoes.push({
          ...base,
          estado: "ok",
          detalhe:
            perfis.length > 1
              ? `Os ${perfis.length} perfis localizados no plano.`
              : `Perfil localizado na p. ${primeiro?.pagina}.`,
        });
        continue;
      }
      ausenteOuNaoVerificavel(id, r.numero, base.descricao, () =>
        registrar({
          tipo: "ausente",
          regra: "requisito",
          partes: [lugarDaEquipe],
          chave: r.numero,
          titulo: `${r.numero} (${papel}) ${NAO_LOCALIZADO} no plano`,
          descricao: `O perfil de equipe ${r.numero} exigido pela RFP ("${r.descricao}") não foi localizado no plano.`,
          evidencias: [
            {
              documento: "rfp",
              pagina: r.origem === "codigo" ? r.pagina : undefined,
              trecho: r.origem === "codigo" ? r.trecho : r.descricao,
              rotulo: r.origem === "codigo" ? `RFP, p. ${r.pagina}` : "Requisito incluído pelo GP",
            },
          ],
          sugestao: `Sugere-se indicar no plano quem ocupa o perfil "${papel}" (${r.numero}) e a dedicação prevista, como pede a RFP.`,
        }),
      );
      continue;
    }
    if (!termos.length) {
      verificacoes.push({
        ...base,
        estado: "nao-conferido",
        detalhe: "Descrição curta demais para o código procurar.",
      });
      continue;
    }
    const noEscopo = procurar(e.pgp, termos, { paginas: faixaEscopo, primeira: true });
    if (noEscopo.length) {
      verificacoes.push({ ...base, estado: "ok", detalhe: `Localizado na p. ${noEscopo[0]?.pagina}.` });
      continue;
    }
    const noPlano = faixaEscopo ? procurar(e.pgp, termos, { primeira: true }) : [];
    const evidenciaRfp: Evidencia = {
      documento: "rfp",
      pagina: r.origem === "codigo" ? r.pagina : undefined,
      trecho: r.origem === "codigo" ? r.trecho : r.descricao,
      rotulo: r.origem === "codigo" ? `RFP, p. ${r.pagina}` : "Requisito incluído pelo GP",
    };
    ausenteOuNaoVerificavel(id, r.numero, base.descricao, () =>
      registrar({
        tipo: "ausente",
        regra: "requisito",
        partes: [lugarDoEscopo],
        chave: r.numero,
        categoriaComparada: "escopo",
        titulo: `${r.numero} (${r.rotulo}) ${NAO_LOCALIZADO} na especificação do escopo`,
        descricao: noPlano.length
          ? `O requisito ${r.numero} da RFP ("${r.descricao}") aparece no plano (p. ${noPlano[0]?.pagina}), mas não foi localizado em ${nomeDe(lugarDoEscopo)}.`
          : `O requisito ${r.numero} da RFP ("${r.descricao}") não foi localizado no plano.`,
        evidencias: noPlano.length ? [evidenciaRfp, evidenciaPgp(noPlano[0] as Ocorrencia)] : [evidenciaRfp],
        sugestao: `Sugere-se incluir o ${r.rotulo.toLowerCase()} "${r.descricao}" em ${nomeDe(lugarDoEscopo)}, com o mesmo nome e número da RFP (${r.numero}).`,
      }),
    );
  }

  // ---------- vago ----------
  // "a definir pelo GP" é a convenção do app para decisão pendente do GP: não é vago; vai para a verificação própria
  const decisoesPendentes = new Map<string, number>();
  const fontes = textoDasFontes([...(e.rfp ?? []), ...(e.tap ?? [])]);
  // as questões abertas do próprio plano (linhas com QU-nn, em geral do B9), para o "a definir" ligado a uma delas
  const questoesDoPlano = e.pgp.flatMap((p) => p.texto.split("\n")).filter((l) => /\bQU-\d+/.test(l));
  for (const padrao of PADROES_VAGO) {
    for (const o of procurarPadrao(e.pgp, padrao.re)) {
      const texto = e.pgp.find((p) => p.numero === o.pagina)?.texto ?? "";
      if (vagoQueNaoPesa(padrao.id, { frase: fraseEmVolta(texto, o.posicao) })) continue;
      // a expressão entre aspas é citação do documento (o plano a questiona), não vago do plano
      if (entreAspas(texto, o.posicao, o.termo.length)) continue;
      const parte = parteDaPosicao(o.pagina, o.posicao, e.mapa) ?? SEM_PARTE;
      if (padrao.id === "a-definir" && ehDecisaoDoGp(texto, o.posicao)) {
        decisoesPendentes.set(parte, (decisoesPendentes.get(parte) ?? 0) + 1);
        continue;
      }
      // o plano reproduz o trecho do edital ou do TAP sem aspas: o vago é do documento, não do plano. Não vale para
      // "a definir", que é curto e comum demais para provar que o trecho veio do documento
      if (padrao.id !== "a-definir" && citaODocumento(texto, o.posicao, o.termo.length, fontes)) continue;
      // "a definir" com quando ou onde se define, ou ligado a uma questão aberta do B9 (decisão 0076): pendência
      // rastreada. Olha o item inteiro (a linha), não só a frase: o "quando" costuma vir depois de um ponto e vírgula
      if (padrao.id === "a-definir") {
        const ini = texto.lastIndexOf("\n", o.posicao) + 1;
        const fim = texto.indexOf("\n", o.posicao);
        const linha = texto.slice(ini, fim < 0 ? undefined : fim);
        const outras = questoesDoPlano.filter((q) => q !== linha);
        if (aDefinirComQuandoOuOnde(linha) || ligadoAQuestaoAberta(linha, outras)) continue;
      }
      registrar({
        tipo: "vago",
        regra: `vago:${padrao.id}`,
        partes: [parte],
        chave: `${o.pagina}:${o.posicao}`,
        titulo: `"${o.termo}" sem ${padrao.falta} verificável`,
        descricao: `Trecho de ${nomeDe(parte)} que não dá para conferir: falta ${padrao.falta}.`,
        evidencias: [evidenciaPgp(o)],
        sugestao: padrao.sugestao,
      });
    }
  }

  if (decisoesPendentes.size) {
    const total = [...decisoesPendentes.values()].reduce((a, b) => a + b, 0);
    verificacoes.push({
      id: "decisoes-do-gp-pendentes",
      alvo: "decisões do GP",
      descricao: 'Decisões do GP ainda pendentes no plano ("a definir pelo GP")',
      estado: "nao-conferido",
      detalhe: `${total} decisão(ões) do GP pendente(s), por parte: ${[...decisoesPendentes.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([p, n]) => `${p} (${n})`)
        .join(", ")}. Não é vago: é a convenção da ferramenta para o que só o GP decide.`,
    });
  }

  // ---------- conflituoso: texto de outro documento (CP8) ----------
  // "deste edital" num plano de trabalho que responde ao edital é citação, não texto copiado de outro documento
  const respondeAoEdital = e.tipoPlano === "plano-trabalho";
  for (const o of procurarPadrao(e.pgp, TEXTO_DE_OUTRO_DOCUMENTO)) {
    if (respondeAoEdital && /edital/.test(o.termo)) continue;
    const parte = parteDaPosicao(o.pagina, o.posicao, e.mapa) ?? SEM_PARTE;
    registrar({
      tipo: "conflituoso",
      regra: "texto-de-outro-documento",
      partes: [parte],
      chave: `${o.pagina}:${o.posicao}`,
      titulo: `Texto de outro documento no plano: "${o.termo}"`,
      descricao: `O trecho fala como edital ou termo de referência ("${o.termo}"), e não como plano do projeto: parece ter vindo de outro documento sem ajuste.`,
      evidencias: [evidenciaPgp(o)],
      sugestao:
        "Sugere-se reescrever o trecho como compromisso do plano (quem faz o quê e quando), sem a linguagem do edital.",
    });
  }

  // ---------- conflituoso: prazo total (PGP × RFP × TAP) ----------
  const referencias: { doc: "rfp" | "tap"; prazo: PrazoTotal }[] = [];
  const prazoRfp = e.rfp ? prazoPrincipal(extrairPrazosTotais(e.rfp)) : undefined;
  const prazoTap = e.tap ? prazoPrincipal(extrairPrazosTotais(e.tap)) : undefined;
  if (prazoRfp) referencias.push({ doc: "rfp", prazo: prazoRfp });
  if (prazoTap) referencias.push({ doc: "tap", prazo: prazoTap });
  for (const p of extrairPrazosTotais(e.pgp)) {
    const divergentes = referencias.filter((r) => r.prazo.unidade === p.unidade && r.prazo.valor !== p.valor);
    if (!divergentes.length) continue;
    const parte = parteDaPosicao(p.pagina, p.posicao, e.mapa) ?? SEM_PARTE;
    registrar({
      tipo: "conflituoso",
      regra: "prazo-total",
      partes: [parte],
      chave: `${p.pagina}:${p.posicao}`,
      categoriaComparada: "tempo",
      titulo: `Prazo total diferente: ${p.valor} ${p.unidade} no plano × ${divergentes.map((d) => `${d.prazo.valor} ${d.prazo.unidade} no ${d.doc === "rfp" ? "edital" : "TAP"}`).join(" e ")}`,
      descricao: "O plano declara um prazo total diferente do documento de referência.",
      evidencias: [
        { documento: "pgp", pagina: p.pagina, trecho: p.trecho, rotulo: `PGP, p. ${p.pagina}` },
        ...divergentes.map((d) => ({
          documento: d.doc,
          pagina: d.prazo.pagina,
          trecho: d.prazo.trecho,
          rotulo: `${d.doc === "rfp" ? "RFP" : "TAP"}, p. ${d.prazo.pagina}`,
        })),
      ],
      sugestao:
        "Sugere-se alinhar o prazo do plano ao do contrato e, se a diferença for intencional, registrá-la como mudança aprovada.",
    });
  }

  return { achados: ordenarAchados(achados), verificacoes };
}

/**
 * Ordem de importância (decisão 0033, item 8): premissas críticas, conflitos, ausentes e, por último, vagos. Dentro
 * de cada grupo, do mais grave para o mais leve e pela ordem das partes.
 */
export function grupoDoAchado(a: Pick<Achado, "regra" | "tipo">): number {
  if (a.regra.startsWith("premissa-critica")) return 0;
  return { conflituoso: 1, ausente: 2, vago: 3 }[a.tipo];
}

export function ordenarAchados(achados: Achado[]): Achado[] {
  return [...achados].sort(
    (a, b) =>
      grupoDoAchado(a) - grupoDoAchado(b) ||
      ORDEM_GRAVIDADE[b.gravidade] - ORDEM_GRAVIDADE[a.gravidade] ||
      a.parte.localeCompare(b.parte, "pt-BR", { numeric: true }),
  );
}

export function resumirAchados(achados: Achado[]): Record<Gravidade, Record<TipoAchado, number>> {
  const vazio = (): Record<TipoAchado, number> => ({ vago: 0, conflituoso: 0, ausente: 0 });
  const r: Record<Gravidade, Record<TipoAchado, number>> = { grave: vazio(), média: vazio(), baixa: vazio() };
  for (const a of achados) r[a.gravidade][a.tipo]++;
  return r;
}
