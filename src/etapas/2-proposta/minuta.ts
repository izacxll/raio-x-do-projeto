// Etapa 2 pelo método (docs/estudos/metodo-etapa-2.md, decisões 0034, 0035 e 0038): a minuta da proposta que ganha
// pontos e protege a FGV. Duas partes:
// - as 9 seções do método (0 capa, 1 estratégia, 2 estrutura, 3 escopo, 4 premissas críticas, 5 metas, equipe e
//   cronograma, 6 preço, 7 matriz e checklist, 8 decisões do GP), com o que o código calcula e o que o PMO sugere;
// - a minuta redigida por inteiro, na ordem do modelo do edital: cada seção é texto que vai ao cliente, e seção só
//   descrita ("nesta seção, descrever…") ou vazia é alerta.
// O código monta e confere (pontos, preço pelo tipo de contrato, caixa, produtividade, duração × vigência, matriz);
// o PMO redige. Nenhum número é inventado: o que o edital não dá fica "a definir pelo GP".
import type { AnaliseRfpDossie, DocumentoLido, PropostaDossie, Rotulo } from "../../dossie/esquema";
import type { OrigemItem } from "../../extracao/rfp/item";
import { localizarTodos, origemDe } from "../../extracao/rfp/localizar";
import { extrairEstruturaDoEdital, type EstruturaDoEdital } from "../../extracao/rfp/modelo-proposta";
import { conferirItem, type ConferenciaItem } from "../../pmo/redacao";
import type { ItemPmo } from "../../pmo/schemas/comum";
import type { SecaoProposta } from "../../pmo/schemas/proposta";
import { normalizarTermo } from "../../regras/busca";
import { calcularCaixa, fmtPp, mesDoPrazo, type Caixa, type ParcelaCaixa } from "../../regras/caixa";
import { NOME_PREMISSA, type CodigoPremissa } from "../../regras/premissas-rfp";
import {
  conferirProdutividade,
  extrairTetos,
  type ConferenciaProdutividade,
  type PeriodoQuadro,
} from "../../regras/produtividade";
import { conferirDuracao, vigenciaEmMeses, type ConferenciaDuracao } from "../../regras/vigencia";
import { tirarAcentos } from "../../texto/normalizar";
import { montarLeituraRfp, type TabelaItem } from "../1-rfp/leitura";
import { analiseInicial } from "../1-rfp/revisao";
import { conferirMinuta, type ConferenciaFinal } from "./conferencia-final";
import type { PontoDePartida } from "./ponto-de-partida";
import {
  criteriosDaRfp,
  ondeEstaoOsPontos,
  regraDoPreco,
  tabelaPontosPorPreco,
  textoDaRegraPreco,
  type OndeEstaoOsPontos,
  type RegraPreco,
  type TabelaPontosPreco,
} from "./pontos";
import { calcularFolha, type FolhaMensal } from "./preco-parceria";
import {
  NOME_TIPO_CONTRATO,
  NOME_TIPO_PROJETO,
  sugerirTipo,
  type TipoContrato,
  type TipoProjeto,
  type TipoSugerido,
} from "./tipo";

export type SecaoMetodoProposta =
  | "capa"
  | "estrategia"
  | "estrutura"
  | "escopo"
  | "premissas"
  | "metas-equipe"
  | "preco"
  | "matriz"
  | "decisoes";

export const SECOES_PROPOSTA: { id: SecaoMetodoProposta; titulo: string; pergunta: string }[] = [
  {
    id: "capa",
    titulo: "Capa: resumo e decisões",
    pergunta: "Estratégia escolhida, preço, riscos e o que o GP decide. A minuta vem depois, inteira.",
  },
  {
    id: "estrategia",
    titulo: "Estratégia em uma página",
    pergunta:
      "Onde estão os pontos, em que critério concentrar o texto e as abordagens que mudam o resultado.",
  },
  {
    id: "estrutura",
    titulo: "Estrutura da proposta",
    pergunta: "O modelo do edital, seção por seção, com o critério que cada uma alimenta.",
  },
  {
    id: "escopo",
    titulo: "Escopo",
    pergunta:
      "O que a contratada faz, as exclusões próprias do objeto e o que fica com o contratante, com prazo.",
  },
  {
    id: "premissas",
    titulo: "Premissas críticas escritas",
    pergunta:
      "Cada ponto de atenção da etapa 1 como premissa: o que se assume, de quem depende, consequência e reajuste.",
  },
  {
    id: "metas-equipe",
    titulo: "Metas ou produtos, equipe e cronograma",
    pergunta:
      "O que o edital fixa, o que o código calcula e o que é decisão do GP; o quadro contra a produtividade.",
  },
  {
    id: "preco",
    titulo: "Preço",
    pergunta: "A estrutura de custo do tipo de contrato, a tabela de pontos por preço e o caixa.",
  },
  {
    id: "matriz",
    titulo: "Matriz de atendimento e checklist de envio",
    pergunta: "Cada exigência e critério ligados à seção que responde; o que enviar, como e até quando.",
  },
  { id: "decisoes", titulo: "Decisões do GP", pergunta: "A lista do que só o GP decide." },
];

export interface ItemMinuta {
  id: string;
  secao: SecaoMetodoProposta;
  rotulo: Rotulo;
  nome: string;
  texto: string;
  origem?: OrigemItem;
  tabela?: TabelaItem;
  nota?: string;
  /** Conferência do código que não fecha (produtividade, duração, PC sem premissa, seção sem critério…). */
  alerta?: boolean;
  /** Item que veio do PMO (Sugestão até o GP revisar), com a conferência das citações e dos números. */
  doPmo?: boolean;
  conferencia?: ConferenciaItem;
}

export interface ParagrafoRedigido {
  id: string;
  item: ItemPmo;
  conferencia: ConferenciaItem;
  /** O parágrafo descreve a seção em vez de escrevê-la ("nesta seção, apresentar…"). */
  soDescrito: boolean;
}

export interface SecaoRedigida {
  /** Código do modelo do edital ("QUADRO 08", "d)") ou do PMO. */
  codigo: string;
  titulo: string;
  /** Critério de pontuação que a seção alimenta (do PMO), ou vazio. */
  criterio: string;
  paragrafos: ParagrafoRedigido[];
  situacao: "redigida" | "so-descrita" | "vazia";
  /** Seção do modelo do edital (com a página) ou só do PMO. */
  doModelo: boolean;
  origem?: OrigemItem;
}

export interface ContasProposta {
  pontos: OndeEstaoOsPontos;
  regraPreco: RegraPreco;
  tabelaPreco?: TabelaPontosPreco;
  caixa?: Caixa;
  /** De onde veio a curva de custo do caixa. */
  baseDoCaixa?: string;
  produtividade?: ConferenciaProdutividade;
  duracao?: ConferenciaDuracao;
  folha?: FolhaMensal;
  conferencia: ConferenciaFinal;
}

export interface MinutaProposta {
  tipo: { contrato: TipoContrato; projeto: TipoProjeto; sugerido: TipoSugerido; confirmado: boolean };
  itens: ItemMinuta[];
  documento: SecaoRedigida[];
  estruturaDoEdital?: EstruturaDoEdital;
  contas: ContasProposta;
  /** "codigo": só o esqueleto (vai no pedido ao PMO); "pmo": com a minuta do PMO, conferida. */
  fonte: "codigo" | "pmo";
}

const A_DEFINIR = "a definir pelo GP";
const pag = (o?: { pagina: number }) => (o ? `p. ${o.pagina}` : "—");
const fmtR = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Parágrafo que descreve a seção em vez de escrevê-la (critério de aceite do método: "não há seção só descrita"). */
const RE_SO_DESCRITO =
  /^(?:nesta se[cç][aã]o|esta se[cç][aã]o|a se[cç][aã]o|aqui (?:se )?(?:deve|devem)|sugere-se (?:descrever|apresentar|incluir|detalhar|explicar|informar)|recomenda-se (?:descrever|apresentar|incluir|detalhar)|(?:descrever|apresentar|detalhar|informar|explicar|incluir) (?:aqui|nesta|a |o |os |as ))/i;

export function paragrafoSoDescrito(texto: string): boolean {
  return RE_SO_DESCRITO.test(texto.trim());
}

/** A seção do PMO que responde à seção do modelo: pelo código ("QUADRO 08", "d)") ou pelo título. */
function casaSecao(modelo: { codigo: string; titulo: string }, s: SecaoProposta): boolean {
  const cod = normalizarTermo(modelo.codigo);
  if (normalizarTermo(s.codigo) === cod || normalizarTermo(s.titulo).startsWith(cod)) return true;
  const a = normalizarTermo(modelo.titulo);
  const b = normalizarTermo(s.titulo).replace(/^(?:quadro \d+|[a-n]\))\s*[-–:]?\s*/, "");
  return Boolean(a) && (a === b || (a.length > 8 && (b.includes(a) || a.includes(b))));
}

function redigir(
  secao: SecaoProposta | undefined,
  chave: string,
  docs: DocumentoLido[],
): ParagrafoRedigido[] {
  return (secao?.itens ?? []).map((item, k) => ({
    id: `conteudo:estrutura:${chave}:${k}`,
    item,
    conferencia: conferirItem(item, docs),
    soDescrito: paragrafoSoDescrito(item.texto),
  }));
}

function situacaoDe(p: ParagrafoRedigido[]): SecaoRedigida["situacao"] {
  if (!p.length) return "vazia";
  return p.every((x) => x.soDescrito) ? "so-descrita" : "redigida";
}

/** A minuta redigida, na ordem do modelo do edital; as seções do PMO fora do modelo vêm no fim. */
export function documentoRedigido(
  estrutura: EstruturaDoEdital | undefined,
  secoesPmo: SecaoProposta[],
  docs: DocumentoLido[],
): SecaoRedigida[] {
  const usadas = new Set<number>();
  const out: SecaoRedigida[] = [];
  for (const m of estrutura?.secoes ?? []) {
    const i = secoesPmo.findIndex((s, k) => !usadas.has(k) && casaSecao(m, s));
    if (i >= 0) usadas.add(i);
    const s = i >= 0 ? secoesPmo[i] : undefined;
    const paragrafos = redigir(s, String(i), docs);
    out.push({
      codigo: m.codigo,
      titulo: m.titulo,
      criterio: s?.criterio ?? "",
      paragrafos,
      situacao: situacaoDe(paragrafos),
      doModelo: true,
      origem: m.origem,
    });
  }
  secoesPmo.forEach((s, k) => {
    if (usadas.has(k)) return;
    const paragrafos = redigir(s, String(k), docs);
    out.push({
      codigo: s.codigo,
      titulo: s.titulo,
      criterio: s.criterio,
      paragrafos,
      situacao: situacaoDe(paragrafos),
      doModelo: false,
    });
  });
  return out;
}

function itemDoPmo(
  id: string,
  secao: SecaoMetodoProposta,
  nome: string,
  item: ItemPmo,
  docs: DocumentoLido[],
  extra: Partial<ItemMinuta> = {},
): ItemMinuta {
  const f = item.fontes[0];
  return {
    id,
    secao,
    // todo item do PMO é Sugestão até o GP revisar (decisão 0035); o "documento" conferido aparece pela citação
    rotulo:
      item.rotulo === "decisao_gp" ? "decisao-gp" : item.rotulo === "documento" ? "documento" : "sugestao",
    nome,
    texto: item.texto,
    origem: f ? { documento: "RFP", pagina: f.pagina, trecho: f.trecho } : undefined,
    doPmo: true,
    conferencia: conferirItem(item, docs),
    ...extra,
  };
}

const PCS_DO_CONTRATANTE: CodigoPremissa[] = ["PC1", "PC2", "PC3", "PC6"];

export function montarMinuta(
  ponto: PontoDePartida,
  p: PropostaDossie,
  docs: DocumentoLido[],
  etapa1?: AnaliseRfpDossie,
  hoje = new Date(),
): MinutaProposta {
  const analise = ponto.analise;
  const sugerido = sugerirTipo(analise, ponto.requisitos);
  const tipo = {
    contrato: p.tipo?.contrato ?? sugerido.contrato,
    projeto: p.tipo?.projeto ?? sugerido.projeto,
    sugerido,
    confirmado: Boolean(p.tipo),
  };
  const operacao = tipo.projeto !== "produtos";
  const e = p.estrategia?.resposta;
  const c = p.conteudo?.resposta;
  const eap = p.eap?.resposta;
  const leitura1 = montarLeituraRfp(analise, etapa1 ?? analiseInicial(analise, hoje), hoje);
  const atencao = leitura1.itens.filter((i) => i.secao === "atencao" && i.premissa);
  const estrutura = extrairEstruturaDoEdital(analise.documentos);
  const criterios = criteriosDaRfp(analise);
  const pontos = ondeEstaoOsPontos(criterios);
  const regra = regraDoPreco(analise, criterios);
  const estimado = ponto.valorEstimado ? lerReais(ponto.valorEstimado.texto) : undefined;
  const tabelaPreco = tabelaPontosPorPreco(regra, estimado);
  const vigencia = ponto.prazoExecucao ? vigenciaEmMeses(ponto.prazoExecucao.texto) : undefined;
  const itens: ItemMinuta[] = [];
  const add = (i: ItemMinuta) => itens.push(i);

  // ---------- 1. Estratégia ----------
  if (criterios.length)
    add({
      id: "minuta:estrategia:pontos",
      secao: "estrategia",
      rotulo: "documento",
      nome: "Onde estão os pontos",
      texto: `${pontos.total} pontos em ${criterios.length} critérios: ${pontos.texto} de texto (o avaliador lê), ${pontos.documento} de documento (não se ganham escrevendo)${pontos.misto ? ` e ${pontos.misto} que pedem os dois` : ""}. Conta do código sobre a tabela do edital.`,
      origem: criterios[0]?.origem,
      tabela: {
        colunas: ["Critério", "O que avalia", "Máximo", "Tipo", "Por quê", "Página"],
        linhas: criterios.map((x) => [
          x.chave,
          x.descricao.slice(0, 160),
          x.maximo !== undefined ? String(x.maximo) : "",
          x.tipo,
          x.motivo,
          String(x.origem?.pagina ?? "—"),
        ]),
      },
    });
  else
    add({
      id: "minuta:estrategia:pontos",
      secao: "estrategia",
      rotulo: "documento",
      nome: "Onde estão os pontos",
      texto: "Critérios de pontuação não localizados pelo código — conferir no documento.",
    });
  for (const x of criterios.filter((k) => k.tipo !== "texto"))
    add({
      id: `minuta:estrategia:documento:${normalizarTermo(x.chave)}`,
      secao: "estrategia",
      rotulo: "decisao-gp",
      nome: `A FGV tem? Critério ${x.chave}`,
      texto: `${x.descricao.slice(0, 200)} (${x.maximo ?? "?"} pontos): ${x.motivo}. A FGV tem o que este critério pede? Decisão do GP.`,
      origem: x.origem,
    });
  const preco = textoDaRegraPreco(regra, estimado);
  add({
    id: "minuta:estrategia:preco",
    secao: "estrategia",
    rotulo: "documento",
    nome: "Peso do preço",
    texto: preco,
    origem: regra.tipo === "indice" || regra.tipo === "desconto" ? regra.origem : undefined,
    nota: tabelaPreco?.equivalencia,
  });
  // desempate: entre as cláusulas de empate, a do julgamento (a que acaba em sorteio ou cita o art. 60), não a de ME/EPP
  const empates = localizarTodos(
    analise.documentos,
    /\b(?:em caso de empate|havendo empate|criterios? de desempate)\b/,
  )
    .map((l) => ({ l, texto: clausulaInteira(analise, origemDe(l)) ?? l.frase }))
    .filter((x) => !/microempresa|pequeno porte/i.test(x.texto.slice(0, 160)));
  const desempate = empates.find((x) => /sorteio|art(?:igo)?\.? ?60/i.test(x.texto)) ?? empates[0];
  const desempate1 = leitura1.itens.find((x) => x.id === "leitura:julgamento:desempate");
  if (desempate || desempate1)
    add({
      id: "minuta:estrategia:desempate",
      secao: "estrategia",
      rotulo: "documento",
      nome: "Desempate",
      texto: desempate?.texto ?? desempate1?.texto ?? "",
      origem: desempate ? origemDe(desempate.l) : desempate1?.origem,
    });
  const eliminacao = leitura1.itens.find((x) => x.id === "leitura:julgamento:eliminacao");
  if (eliminacao)
    add({
      id: "minuta:estrategia:eliminacao",
      secao: "estrategia",
      rotulo: "documento",
      nome: eliminacao.nome,
      texto: eliminacao.texto,
      origem: eliminacao.origem,
    });
  // nota técnica mínima: a do código da etapa 1 ou, sem ela, a que a cláusula de eliminação escreve
  const minima = analise.itens.find(
    (x) =>
      x.id === "julgamento:pontuacao-minima" && (x.situacao === "localizado" || x.situacao === "calculado"),
  );
  const minimaNaEliminacao = /(?:m[ií]nimo de|inferior a|abaixo de) (\d{1,3})\b/i.exec(
    (eliminacao?.texto ?? "").replace(/-\s+/g, ""),
  )?.[1];
  if (minima || minimaNaEliminacao)
    add({
      id: "minuta:estrategia:minima",
      secao: "estrategia",
      rotulo: "documento",
      nome: "Nota técnica mínima",
      texto: `Abaixo de ${minima ? minima.texto : `${minimaNaEliminacao} pontos`}, a proposta é eliminada.${pontos.total ? ` A técnica vale até ${pontos.total} pontos.` : ""}`,
      origem: minima?.origem ?? eliminacao?.origem,
    });
  for (const a of e?.abordagens ?? [])
    add({
      id: `minuta:estrategia:abordagem:${a.id}`,
      secao: "estrategia",
      rotulo: "sugestao",
      nome: `Abordagem ${a.id} — ${a.nome}${p.abordagem?.id === a.id ? " (escolhida pelo GP)" : ""}`,
      texto: `${a.descricao}${a.mudaOResultado ? ` O que muda no resultado: ${a.mudaOResultado}` : ""}`,
      nota: `Prós: ${a.pros.join("; ") || "—"}. Contras: ${a.contras.join("; ") || "—"}. Risco principal: ${a.riscoPrincipal || a.riscos[0] || "—"}.`,
      doPmo: true,
    });

  // ---------- 2. Estrutura ----------
  const documento = documentoRedigido(estrutura, c?.estrutura ?? [], docs);
  add({
    id: "minuta:estrutura:modelo",
    secao: "estrutura",
    rotulo: "documento",
    nome: estrutura
      ? `Modelo do edital (${estrutura.secoes.length} seções, ${estrutura.obrigatoria ? "obrigatório" : "preferencial"})`
      : "Modelo do edital",
    texto: estrutura
      ? `A minuta segue o modelo do edital, na ordem: ${estrutura.secoes.map((s) => `${s.codigo} ${s.titulo}`).join("; ")}.`
      : "O código não localizou modelo de proposta no edital — conferir no documento. Sem ele, vale a estrutura da ficha PROP-ESTRUTURA, com uma seção por critério.",
    origem: estrutura?.secoes[0]?.origem,
    tabela: documento.length
      ? {
          colunas: ["Seção", "Critério que alimenta", "Situação"],
          linhas: documento.map((s) => [
            `${s.codigo} ${s.titulo}`,
            s.criterio || (c ? "nenhum (PMO)" : "a ligar na minuta do PMO"),
            !c
              ? "a redigir"
              : s.situacao === "redigida"
                ? "redigida"
                : s.situacao === "so-descrita"
                  ? "só descrita"
                  : "não redigida",
          ]),
        }
      : undefined,
  });
  if (c) {
    const textoSemSecao = criterios.filter(
      (x) =>
        x.tipo !== "documento" &&
        !documento.some((s) => s.criterio && criterioCasa(s.criterio, x.chave, x.descricao)),
    );
    if (textoSemSecao.length)
      add({
        id: "minuta:estrutura:sem-secao",
        secao: "estrutura",
        rotulo: "sugestao",
        nome: "Critério de texto sem seção que responda",
        texto: `Nenhuma seção da minuta diz responder a: ${textoSemSecao.map((x) => x.chave).join(", ")}. Recomenda-se ligar cada critério a uma seção explícita.`,
        alerta: true,
      });
    const ruins = documento.filter((s) => s.doModelo && s.situacao !== "redigida");
    if (ruins.length)
      add({
        id: "minuta:estrutura:nao-redigidas",
        secao: "estrutura",
        rotulo: "sugestao",
        nome: "Seções do modelo não redigidas",
        texto: `${ruins.length} seção(ões) do modelo ${ruins.some((s) => s.situacao === "so-descrita") ? "só descritas ou " : ""}sem texto: ${ruins.map((s) => `${s.codigo} ${s.titulo}`).join("; ")}. Pelo método, a minuta sai redigida por inteiro.`,
        alerta: true,
      });
  }

  // ---------- 3. Escopo ----------
  const fazer = [...ponto.requisitos, ...ponto.obrigacoes];
  add({
    id: "minuta:escopo:faz",
    secao: "escopo",
    rotulo: "documento",
    nome: "O que a contratada faz (requisitos da etapa 1)",
    texto: fazer.length
      ? `${fazer.length} requisitos: ${fazer.map((r) => `${r.numero} ${r.rotulo}`).join("; ")}.`
      : "Nenhum requisito R na etapa 1 — conferir no documento.",
    tabela: fazer.length
      ? {
          colunas: ["R", "Tipo", "Requisito", "Página"],
          linhas: fazer.map((r) => [
            r.numero,
            String(r.tipo ?? ""),
            r.descricao.slice(0, 200),
            r.pagina ? String(r.pagina) : "GP",
          ]),
        }
      : undefined,
  });
  const dependencias = atencao.filter((a) => a.premissa && PCS_DO_CONTRATANTE.includes(a.premissa));
  if (dependencias.length)
    add({
      id: "minuta:escopo:contratante",
      secao: "escopo",
      rotulo: "sugestao",
      nome: "O que fica com o contratante (dos pontos de atenção)",
      texto: dependencias
        .map((a) => `${a.nome} (${a.premissa}, ${pag(a.origem)}): prazo ${A_DEFINIR}`)
        .join("; "),
      origem: dependencias[0]?.origem,
      nota: "Cada dependência vira obrigação do contratante com prazo. Prazo que o edital não dá é decisão do GP, nunca um número inventado.",
    });
  c?.exclusoes.forEach((x, k) => add(itemDoPmo(`conteudo:exclusoes:${k}`, "escopo", "Exclusão", x, docs)));
  c?.limitesVolume.forEach((x, k) =>
    add(itemDoPmo(`conteudo:limitesVolume:${k}`, "escopo", "Limite de volume", x, docs)),
  );
  c?.obrigacoesContratante.forEach((o, k) =>
    add(
      itemDoPmo(`conteudo:obrigacoesContratante:${k}`, "escopo", "Obrigação do contratante", o.item, docs, {
        nota: `Prazo: ${o.prazo || A_DEFINIR}`,
      }),
    ),
  );
  if (c && !c.exclusoes.length)
    add({
      id: "minuta:escopo:sem-exclusoes",
      secao: "escopo",
      rotulo: "sugestao",
      nome: "Exclusões",
      texto:
        "A minuta do PMO não tem exclusões explícitas. Pelo método, entram as do próprio objeto: vedações do edital, o que é do contratante ou de outro órgão, o que passa do volume ou da vigência.",
      alerta: true,
    });

  // ---------- 4. Premissas críticas ----------
  const aplicaveis = new Set<string>([
    ...atencao.map((a) => a.premissa as string),
    ...Object.entries(p.premissasAplicaveis)
      .filter(([, v]) => v)
      .map(([k]) => k),
  ]);
  for (const k of Object.entries(p.premissasAplicaveis)
    .filter(([, v]) => !v)
    .map(([k2]) => k2))
    aplicaveis.delete(k);
  const escritas = new Set((c?.premissas ?? []).map((x) => x.premissaCritica).filter(Boolean));
  for (const pc of [...aplicaveis].sort()) {
    const ponto1 = atencao.find((a) => a.premissa === pc);
    const escrita = c?.premissas.find((x) => x.premissaCritica === pc);
    add({
      id: `minuta:premissas:${pc}`,
      secao: "premissas",
      rotulo: escrita ? "sugestao" : "documento",
      nome: `${pc} — ${NOME_PREMISSA[pc as CodigoPremissa] ?? ""}`,
      texto: escrita
        ? `${escrita.item.texto} De quem depende: ${escrita.dependeDe || A_DEFINIR}. Até quando: ${escrita.ateQuando || A_DEFINIR}. Se falhar: ${escrita.consequencia || "—"}. Reajuste: ${escrita.reajuste || "—"}.`
        : `${ponto1 ? `Ponto de atenção da etapa 1: ${ponto1.nome} (${pag(ponto1.origem)}). ` : ""}${c ? "A minuta do PMO não escreve esta premissa." : "A minuta do PMO escreve a premissa com a consequência e o reajuste."}`,
      origem: ponto1?.origem,
      doPmo: Boolean(escrita),
      conferencia: escrita ? conferirItem(escrita.item, docs) : undefined,
      alerta: Boolean(c) && !escritas.has(pc),
      nota:
        escrita && (!escrita.consequencia || !escrita.reajuste)
          ? "Falta a consequência ou o reajuste (método da etapa 2, seção 3.4)."
          : undefined,
    });
  }
  const protecoes = leitura1.itens.find((i) => i.id === "leitura:protecoes");
  if (protecoes)
    add({
      id: "minuta:premissas:protecoes",
      secao: "premissas",
      rotulo: "documento",
      nome: "Proteções que o edital dá (para citar nas premissas)",
      texto: protecoes.texto,
      origem: protecoes.origem,
    });

  // ---------- 5. Metas ou produtos, equipe e cronograma ----------
  c?.metas.forEach((m, k) =>
    add(
      itemDoPmo(`conteudo:metas:${k}`, "metas-equipe", "Meta", m.item, docs, {
        nota: `Indicador: ${m.indicador || "—"}; fórmula: ${m.formula || "—"}; aferição: ${m.meioDeAfericao || "—"}.`,
      }),
    ),
  );
  const equipeR = ponto.requisitos.filter((r) => r.tipo === "equipe");
  if (equipeR.length)
    add({
      id: "minuta:metas:equipe-edital",
      secao: "metas-equipe",
      rotulo: "documento",
      nome: "Equipe que o edital fixa",
      texto: equipeR.map((r) => `${r.numero} ${r.descricao}`).join("; "),
    });
  const fases = (c?.metodologia ?? []).filter((f) => f.meses > 0);
  let duracao: ConferenciaDuracao | undefined;
  if (fases.length) {
    duracao = conferirDuracao(
      fases.map((f) => ({ rotulo: f.nome, meses: f.meses })),
      vigencia,
    );
    add({
      id: "minuta:metas:duracao",
      secao: "metas-equipe",
      rotulo: "sugestao",
      nome: "Cronograma × vigência (conta do código)",
      texto: duracao.texto,
      alerta: duracao.situacao === "passa",
      origem: ponto.prazoExecucao?.origem,
    });
  }
  let produtividade: ConferenciaProdutividade | undefined;
  const tetos = extrairTetos(analise.documentos);
  if (eap?.volumes.length) {
    const periodos: PeriodoQuadro[] = eap.volumes.map((v) => {
      const pessoas = (eap.quadroEquipe ?? [])
        .filter(
          (l) =>
            normalizarTermo(l.funcao) === normalizarTermo(v.funcao) &&
            l.deMes <= v.ateMes &&
            l.ateMes >= v.deMes,
        )
        .reduce((s, l) => s + l.quantidade, 0);
      return {
        rotulo: `${v.descricao} (meses ${v.deMes} a ${v.ateMes})`,
        meses: v.ateMes - v.deMes + 1,
        pessoas,
        volume: v.quantidade,
      };
    });
    const teto =
      tetos.find((t) =>
        eap.volumes.some((v) =>
          normalizarTermo(v.unidade).startsWith(normalizarTermo(t.unidade).slice(0, 5)),
        ),
      ) ?? tetos[0];
    produtividade = conferirProdutividade(periodos, teto);
    add({
      id: "minuta:metas:produtividade",
      secao: "metas-equipe",
      rotulo: "sugestao",
      nome: "Quadro de equipe × produtividade (conta do código)",
      texto: produtividade.texto,
      origem: teto?.origem,
      alerta: produtividade.situacao === "passa",
      nota: "Volume e quadro vêm da minuta do PMO (Sugestão); o teto, do edital. Passar do teto é alerta: a meta não fecha com este quadro.",
    });
  } else if (tetos[0])
    add({
      id: "minuta:metas:teto",
      secao: "metas-equipe",
      rotulo: "documento",
      nome: "Teto de produtividade escrito no edital",
      texto: `${tetos[0].tipo === "teto" ? "No máximo" : "Em média"} ${tetos[0].quantidade} ${tetos[0].unidade} por ${tetos[0].por === "mes" ? "mês" : tetos[0].por}. O quadro de equipe da minuta tem de fechar com ele.`,
      origem: tetos[0].origem,
    });
  if (eap?.quadroEquipe.length)
    add({
      id: "minuta:metas:quadro",
      secao: "metas-equipe",
      rotulo: "sugestao",
      nome: "Quadro de equipe (sugestão do PMO; curva de contratação é decisão do GP)",
      texto: `${eap.quadroEquipe.length} linhas por função e faixa de meses.`,
      doPmo: true,
      tabela: {
        colunas: ["Função", "Pessoas", "Do mês", "Até o mês", "Base"],
        linhas: eap.quadroEquipe.map((l) => [
          l.funcao,
          String(l.quantidade),
          String(l.deMes),
          String(l.ateMes),
          l.base,
        ]),
      },
    });

  // ---------- 6. Preço ----------
  add({
    id: "minuta:preco:estrutura",
    secao: "preco",
    rotulo: "sugestao",
    nome: `Estrutura do preço: ${NOME_TIPO_PROJETO[tipo.projeto]}`,
    texto:
      tipo.projeto === "produtos"
        ? "EAP × horas por perfil × valor-hora, mais despesas, tributos e reserva. Os valores são do GP."
        : `Folha da equipe mês a mês ao longo da vigência mais as despesas por natureza, distribuídas nas parcelas${tipo.contrato === "parceria" ? "; sem valor-hora e sem taxa de administração (parceria, Lei 13.019/2014)" : ""}. Os valores são do GP.`,
  });
  let folha: FolhaMensal | undefined;
  if (operacao && eap?.quadroEquipe.length) {
    folha = calcularFolha(eap.quadroEquipe, p.parametros.custoMensal ?? {}, p.parametros.despesas, vigencia);
    add({
      id: "minuta:preco:folha",
      secao: "preco",
      rotulo: folha.total !== undefined ? "documento" : "decisao-gp",
      nome: "Folha mês a mês e despesas por natureza (conta do código)",
      texto:
        folha.total !== undefined
          ? `Folha ${fmtR(folha.totalFolha ?? 0)} + despesas ${fmtR(folha.despesas ?? 0)} = ${fmtR(folha.total)}.${estimado ? ` Teto ou estimado do edital: ${fmtR(estimado)}.` : ""}`
          : `Falta: ${folha.faltando.join("; ")}. ${A_DEFINIR[0]?.toUpperCase()}${A_DEFINIR.slice(1)}.`,
      tabela: {
        colunas: ["Função", "Pessoas-mês", "Custo mensal (GP)", "Custo"],
        linhas: folha.funcoes.map((f) => [
          f.funcao,
          String(f.pessoasMes),
          f.custoMensal !== undefined ? fmtR(f.custoMensal) : A_DEFINIR,
          f.custo !== undefined ? fmtR(f.custo) : "—",
        ]),
      },
    });
  }
  if (tabelaPreco)
    add({
      id: "minuta:preco:pontos",
      secao: "preco",
      rotulo: "documento",
      nome: "Pontos por preço (conta do código)",
      texto: tabelaPreco.texto,
      nota: `${tabelaPreco.equivalencia ?? ""} Os cenários são hipóteses para comparar, não previsão. Recomenda-se partir do custo para o desconto; o valor final é decisão do GP.`.trim(),
      tabela: {
        colunas: tabelaPreco.colunas,
        linhas: tabelaPreco.linhas.map((l) => [
          `${l.desconto}%`,
          l.preco !== undefined ? fmtR(l.preco) : "—",
          ...l.valores.map((v) => v.toLocaleString("pt-BR")),
        ]),
      },
    });
  // caixa: parcelas do edital × curva de custo
  const parcelas: ParcelaCaixa[] = analise.desembolso.parcelas.map((x) => ({
    rotulo: x.rotulo,
    percentual: x.percentual,
    prazo: x.prazo,
    mes: p.parametros.mesesParcelas?.[x.rotulo] ?? mesDoPrazo(x.prazo),
    origem: x.origem,
  }));
  if (!parcelas.length && analise.desembolso.unica)
    parcelas.push({
      rotulo: "Parcela única",
      percentual: 100,
      mes: p.parametros.mesesParcelas?.["Parcela única"],
      origem: analise.desembolso.unica,
    });
  let caixa: Caixa | undefined;
  let baseDoCaixa: string | undefined;
  if (parcelas.length) {
    const meses = Math.max(vigencia ? Math.ceil(vigencia) : 0, ...parcelas.map((x) => x.mes ?? 0));
    const curva =
      folha?.custoPorMes ??
      (folha ? folha.pessoasPorMes : meses ? Array.from({ length: meses }, () => 1) : []);
    baseDoCaixa = folha?.custoPorMes
      ? "custo mensal da folha dado pelo GP"
      : folha
        ? "rampa de pessoas do quadro (aproximação: pessoal como a maior parte do custo)"
        : "custo igual em todos os meses da vigência (aproximação: a equipe trabalha desde o início)";
    caixa = calcularCaixa(parcelas, curva);
    add({
      id: "minuta:preco:caixa",
      secao: "preco",
      rotulo: "sugestao",
      nome: "Caixa: parcelas × custo acumulado (conta do código)",
      texto: caixa.texto,
      origem: parcelas[0]?.origem,
      alerta: Boolean(caixa.primeiroNegativo),
      nota: `Base do custo: ${baseDoCaixa}. As parcelas são as do edital${caixa.semMes.length ? `; o mês de ${caixa.semMes.map((x) => x.rotulo).join(", ")} é decisão do GP (o edital não diz)` : ""}. A minuta usa o cronograma de parcelas do edital; se mudar, a diferença tem de ser dita e justificada.`,
      tabela: caixa.parcelas.length
        ? {
            colunas: [
              "Parcela",
              "Mês",
              "Recebido até ela",
              "Custo até a véspera da seguinte",
              "Folga (p.p.)",
            ],
            linhas: caixa.parcelas.map((f) => [
              f.parcela.rotulo,
              String(f.parcela.mes ?? "—"),
              `${fmtPp(f.recebidoAte)}%`,
              `${fmtPp(f.custoAte)}% (mês ${f.ateMes})`,
              fmtPp(f.folga),
            ]),
          }
        : undefined,
    });
  }
  eap?.despesas.forEach((x, k) =>
    add(itemDoPmo(`eap:despesas:${k}`, "preco", "Despesa a considerar", x, docs)),
  );
  eap?.reservas.forEach((x, k) =>
    add(itemDoPmo(`eap:reservas:${k}`, "preco", "Risco que pede reserva", x, docs)),
  );

  // ---------- 7. Matriz e checklist ----------
  const conferencia = conferirMinuta(ponto, e, c, eap);
  const naoAtendidos = conferencia.matriz.filter((l) => l.situacao === "nao-localizado");
  add({
    id: "minuta:matriz:resumo",
    secao: "matriz",
    rotulo: "documento",
    nome: "Matriz de atendimento",
    texto: `${conferencia.matriz.length - naoAtendidos.length} de ${conferencia.matriz.length} requisitos e critérios ligados a uma seção da minuta${naoAtendidos.length ? `; sem seção: ${naoAtendidos.map((l) => l.chave).join(", ")}` : ""}.`,
    alerta: Boolean(c) && naoAtendidos.length > 0,
  });
  add({
    id: "minuta:matriz:checklist",
    secao: "matriz",
    rotulo: "documento",
    nome: "Checklist de envio",
    texto: conferencia.checklist
      .map((x) =>
        x.situacao === "nao-localizado"
          ? `${x.item} (não localizado pelo código)`
          : `${x.item}: ${x.detalhe.replace(/\s+/g, " ").slice(0, 140)}${x.origem ? ` (${x.origem})` : ""}`,
      )
      .join("; "),
    nota: conferencia.limitePaginas?.texto,
  });

  // ---------- 8. Decisões do GP ----------
  const decisoes: [string, boolean][] = [
    [
      "Participar",
      etapa1?.participacao?.decisao === "participar" || etapa1?.participacao?.decisao === "nao-participar",
    ],
    ["Tipo de contrato e de projeto", Boolean(p.tipo)],
    ["Abordagem", Boolean(p.abordagem)],
    ["Premissas críticas que se aplicam", Object.keys(p.premissasAplicaveis).length > 0],
    ["Equipe nomeada", Object.values(p.parametros.nomes).some(Boolean)],
    [
      "Curva de contratação e custos",
      operacao ? Boolean(folha?.total) : Object.keys(p.parametros.valoresHora).length > 0,
    ],
    ["Valor e desconto", p.parametros.precoFinal !== undefined],
    ["Prazos pedidos ao contratante nas premissas", false],
    ["Perguntas de esclarecimento a enviar", false],
    ["Documentos dos critérios de documento", false],
    ["Enquadramento da FGV na modalidade", false],
  ];
  add({
    id: "minuta:decisoes",
    secao: "decisoes",
    rotulo: "decisao-gp",
    nome: `Decisões do GP (${decisoes.filter(([, f]) => !f).length} pendentes)`,
    texto: decisoes.map(([d, f]) => `${d}: ${f ? "registrada" : A_DEFINIR}`).join("; "),
    tabela: {
      colunas: ["Decisão", "Situação"],
      linhas: decisoes.map(([d, f]) => [d, f ? "registrada no dossiê" : A_DEFINIR]),
    },
  });

  // ---------- 0. Capa (por último: resume as outras) ----------
  const escolhida = e?.abordagens.find((a) => a.id === p.abordagem?.id);
  const alertas = itens.filter((i) => i.alerta);
  itens.unshift(
    {
      id: "minuta:capa:tipo",
      secao: "capa",
      rotulo: tipo.confirmado ? "decisao-gp" : "sugestao",
      nome: "Tipo de contrato e de projeto",
      texto: `${NOME_TIPO_CONTRATO[tipo.contrato]}; ${NOME_TIPO_PROJETO[tipo.projeto]}.${tipo.confirmado ? " Confirmado pelo GP." : ` Sugestão do código (${sugerido.motivos.join("; ")}); o GP confirma.`}`,
    },
    {
      id: "minuta:capa:estrategia",
      secao: "capa",
      rotulo: escolhida ? "decisao-gp" : "sugestao",
      nome: "Estratégia",
      texto:
        `${escolhida ? `Abordagem ${escolhida.id} — ${escolhida.nome}.` : "Abordagem a escolher pelo GP."} ${criterios.length ? `Pontos: ${pontos.texto} de texto e ${pontos.documento} de documento.` : ""} ${preco}`.trim(),
    },
    {
      id: "minuta:capa:preco",
      secao: "capa",
      rotulo: "decisao-gp",
      nome: "Preço",
      texto: `${p.parametros.precoFinal !== undefined ? fmtR(p.parametros.precoFinal) : `Valor final ${A_DEFINIR}`}${estimado ? `; teto ou estimado do edital: ${fmtR(estimado)}` : ""}${folha?.total !== undefined ? `; custo calculado: ${fmtR(folha.total)}` : ""}${caixa?.maisApertado ? `; caixa mais apertado no mês ${caixa.maisApertado.mes} (${fmtPp(caixa.maisApertado.folga)} p.p.)` : ""}.`,
    },
    {
      id: "minuta:capa:riscos",
      secao: "capa",
      rotulo: "sugestao",
      nome: "Riscos que mais pesam",
      texto:
        [
          ...alertas
            .slice(0, 4)
            .map(
              (x) =>
                `${x.nome.replace(/ \(conta do código\)$/, "")}: ${x.texto.replace(/\s+/g, " ").slice(0, 160)}`,
            ),
          aplicaveis.size
            ? `Premissas críticas que se aplicam: ${[...aplicaveis].sort().join(", ")} (seção 4).`
            : "",
        ]
          .filter(Boolean)
          .join(" · ") || "Nenhum alerta das conferências do código.",
    },
  );
  return {
    tipo,
    itens,
    documento,
    estruturaDoEdital: estrutura,
    contas: {
      pontos,
      regraPreco: regra,
      tabelaPreco,
      caixa,
      baseDoCaixa,
      produtividade,
      duracao,
      folha,
      conferencia,
    },
    fonte: c ? "pmo" : "codigo",
  };
}

/** A cláusula do documento a partir do trecho, até o próximo item numerado ("17.10.") ou 700 caracteres. */
function clausulaInteira(analise: PontoDePartida["analise"], o?: OrigemItem): string | undefined {
  if (!o) return undefined;
  const pagina = analise.documentos
    .find((d) => d.rotulo === o.documento)
    ?.paginas.find((p) => p.numero === o.pagina)?.texto;
  if (!pagina) return undefined;
  const plano = pagina.replace(/\s+/g, " ");
  const inicio = plano.indexOf(o.trecho.replace(/\s+/g, " ").slice(0, 40));
  if (inicio < 0) return undefined;
  const resto = plano.slice(inicio, inicio + 700);
  const fim = resto.slice(20).search(/\s\d{1,2}\.\d{1,2}(?:\.\d{1,2})?\.\s/);
  return (fim > 0 ? resto.slice(0, fim + 20) : resto).trim();
}

function criterioCasa(criterioDaSecao: string, chave: string, descricao: string): boolean {
  const a = normalizarTermo(criterioDaSecao);
  const k = normalizarTermo(chave).replace(/[()]/g, "");
  if (k && new RegExp(`(?:^|\\W)(?:criterio |quesito )?\\(?${k}\\)?(?:\\W|$)`).test(a)) return true;
  const d = normalizarTermo(descricao)
    .split(" ")
    .filter((w) => w.length > 6)
    .slice(0, 4);
  return d.length > 0 && d.filter((w) => a.includes(w)).length >= 2;
}

function lerReais(texto: string): number | undefined {
  const m = /R\$\s*([\d.]+(?:,\d{1,2})?)/.exec(texto);
  if (!m?.[1]) return undefined;
  const v = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

/** O texto do pedido ao PMO com o esqueleto do código (a estrutura do edital, os pontos, o preço, as contas). */
export function esqueletoEmTexto(m: MinutaProposta): string {
  const linhas = m.itens
    .filter((i) => !i.doPmo)
    .map((i) => `- [${i.secao}] ${i.nome}: ${i.texto}${i.origem ? ` (p. ${i.origem.pagina})` : ""}`);
  const modelo = m.estruturaDoEdital
    ? m.estruturaDoEdital.secoes.map(
        (s) => `- ${s.codigo} ${s.titulo}${s.instrucao ? `: ${s.instrucao}` : ""} (p. ${s.origem.pagina})`,
      )
    : ["- o código não localizou modelo no edital: use a ficha PROP-ESTRUTURA"];
  return `## Tipo (o GP confirma)\n${NOME_TIPO_CONTRATO[m.tipo.contrato]}; ${NOME_TIPO_PROJETO[m.tipo.projeto]}.\n\n## Modelo da proposta no edital (na ordem; use o código de cada seção em "codigo")\n${modelo.join("\n")}\n\n## O que o código já montou (não refaça; use)\n${linhas.join("\n")}`;
}

export { tirarAcentos as _semAcentos };
