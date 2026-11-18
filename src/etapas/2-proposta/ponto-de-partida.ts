// Etapa 2, passo 1 (código): o ponto de partida vem da etapa 1. Requisitos numerados, julgamento e pontuação,
// forma de apresentação (modelo obrigatório, planilha, limite de páginas), valor estimado, prazos, habilitação e
// brechas com a pergunta sugerida. Sem o dossiê da etapa 1, a leitura da RFP roda aqui antes (especificação).
import type { AnaliseRfpDossie, DocumentoLido } from "../../dossie/esquema";
import type { Requisito } from "../../extracao/requisitos";
import type { ItemAnalise, OrigemItem } from "../../extracao/rfp/item";
import { lerNumero } from "../../texto/datas";
import { tirarAcentos } from "../../texto/normalizar";
import { analisarRfp, type AnaliseRfp } from "../1-rfp/analisar-rfp";
import { analiseInicial, estadoDoItem, itensFinais, requisitosValidos, textoFinal } from "../1-rfp/revisao";
import { leituraDoDossie } from "../1-rfp/leitura-pmo";

export interface PrazoEmDias {
  dias: number;
  /** "dias úteis", "dias corridos", "meses"… como o documento diz. */
  unidade: string;
  origem?: OrigemItem;
  texto: string;
}

export interface PontoDePartida {
  /** A etapa 1 já estava no dossiê (com a revisão do GP), ou foi rodada agora. */
  daEtapa1: boolean;
  analise: AnaliseRfp;
  requisitos: Requisito[];
  /**
   * Obrigações de quem executa com número R (método da etapa 1, decisão 0034). Seguem à parte: a proposta, o TAP e
   * o plano ainda trabalham com as entregas (as fases M2 a M4 levam as obrigações a cada um).
   */
  obrigacoes: Requisito[];
  /**
   * A lista de R, uma só do início ao fim (decisão 0080): todos os requisitos válidos da etapa 1, entregas e
   * obrigações, na ordem do número. É a régua de "R da lista" em todos os pedidos e conferências.
   */
  listaDeR: Requisito[];
  /** Os números R que o GP descartou na etapa 1: o pedido diz que eles saíram, para ninguém os tratar como R. */
  rDescartados: string[];
  identificacao: ItemAnalise[];
  julgamento: ItemAnalise[];
  apresentacao: ItemAnalise[];
  habilitacao: ItemAnalise[];
  prazos: ItemAnalise[];
  /** Brechas e vagos da etapa 1 que o GP não descartou, com a pergunta (ou o texto editado por ele). */
  brechas: Brecha[];
  condicoes: ItemAnalise[];
  modeloObrigatorio?: ItemAnalise;
  planilhaDoEdital?: ItemAnalise;
  limitePaginas?: { paginas: number; item: ItemAnalise };
  valorEstimado?: ItemAnalise;
  entregaDaProposta?: ItemAnalise;
  validadeDaProposta?: ItemAnalise;
  limiteEsclarecimento?: ItemAnalise;
  /** Vigência ou prazo de execução, para conferir o cronograma. */
  prazoExecucao?: PrazoEmDias;
}

const localizado = (i?: ItemAnalise) =>
  i && i.situacao !== "nao-localizado" && i.situacao !== "nao-verificavel" && i.situacao !== "nao-se-aplica"
    ? i
    : undefined;

/** "12 meses", "180 dias" → dias (meses × 30 e anos × 365, marcados como conversão do código). */
export function prazoEmDias(item: ItemAnalise): PrazoEmDias | undefined {
  const n = lerNumero(item.texto);
  if (!n) return undefined;
  const t = tirarAcentos(item.texto);
  const contagem = item.campos?.Contagem ?? "";
  if (/mes/.test(t)) return { dias: n * 30, unidade: "meses", origem: item.origem, texto: item.texto };
  if (/ano/.test(t)) return { dias: n * 365, unidade: "anos", origem: item.origem, texto: item.texto };
  return { dias: n, unidade: contagem || "dias", origem: item.origem, texto: item.texto };
}

export function montarPontoDePartida(
  documentos: DocumentoLido[],
  etapa1?: AnaliseRfpDossie,
  hoje = new Date(),
): PontoDePartida {
  const analise = analisarRfp(documentos, hoje);
  const salva = etapa1 ?? analiseInicial(analise, hoje);
  const itens = itensFinais(analise, salva).filter(
    (i) => estadoDoItem(salva.revisoes, i.id) !== "descartado",
  );
  const daSecao = (s: ItemAnalise["secao"]) => itens.filter((i) => i.secao === s);
  const porId = (id: string) => itens.find((i) => i.id === id);
  const comPrefixo = (p: string) => itens.filter((i) => i.id.startsWith(p));

  const apresentacao = daSecao("apresentacao");
  const limite = localizado(porId("apresentacao:limite-paginas"));
  const paginas = limite ? lerNumero(limite.texto) : null;
  const vigencia = comPrefixo("prazos:execucao:execucao:")[0] ?? comPrefixo("prazos:execucao:vigencia:")[0];

  return {
    daEtapa1: Boolean(etapa1),
    analise,
    requisitos: requisitosValidos(salva).filter((r) => r.tipo !== "obrigacao"),
    obrigacoes: requisitosValidos(salva).filter((r) => r.tipo === "obrigacao"),
    listaDeR: [...requisitosValidos(salva)].sort((a, b) =>
      a.numero.localeCompare(b.numero, "pt-BR", { numeric: true }),
    ),
    rDescartados: salva.requisitos
      .map((r) => r.numero)
      .filter((n) => !requisitosValidos(salva).some((r) => r.numero === n)),
    identificacao: daSecao("identificacao"),
    julgamento: daSecao("julgamento"),
    apresentacao,
    habilitacao: daSecao("habilitacao"),
    prazos: daSecao("prazos"),
    brechas: juntarBrechas(
      daSecao("brechas").map((b) => ({ ...b, perguntaFinal: textoFinal(b, salva.revisoes) })),
      pontosDaLeitura(analise, salva, documentos, hoje),
    ),
    condicoes: daSecao("condicoes"),
    modeloObrigatorio: localizado(porId("apresentacao:modelo-proposta")),
    planilhaDoEdital: localizado(porId("apresentacao:planilha")),
    limitePaginas: limite && paginas ? { paginas, item: limite } : undefined,
    valorEstimado: localizado(porId("identificacao:valor")),
    entregaDaProposta: comPrefixo("prazos:certame:entrega")[0] ?? comPrefixo("prazos:certame:sessao")[0],
    validadeDaProposta: comPrefixo("prazos:execucao:validade:")[0],
    limiteEsclarecimento: comPrefixo("prazos:esclarecimento:")[0],
    prazoExecucao: vigencia ? prazoEmDias(vigencia) : undefined,
  };
}

/** Brecha do ponto de partida; "junta" traz os ids das brechas do código que ela absorveu (o mesmo trecho). */
export type Brecha = ItemAnalise & { perguntaFinal: string; junta?: string[] };

/** Ids pelos quais a brecha pode ter recebido destino na estratégia: o dela e os das brechas que ela junta. */
export function idsDaBrecha(b: Brecha): string[] {
  return [b.id, ...(b.junta ?? [])];
}

const compactar = (t: string) =>
  tirarAcentos(t)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/**
 * Brechas do código e pontos da leitura que tratam do mesmo trecho viram um item só, com o id do ponto da leitura e
 * os ids das brechas que ele junta (o destino é dado uma vez). Mesmo trecho: 25 letras e números seguidos do trecho
 * citado pelo ponto aparecem no texto ou no trecho da brecha.
 */
const PALAVRAS_VAZIAS = new Set(
  "o a os as de da do das dos e em no na nos nas para por com sem que se ou um uma ao aos documento texto prazo".split(
    " ",
  ),
);
const palavras = (t: string) =>
  new Set(
    tirarAcentos(t)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 4 && !PALAVRAS_VAZIAS.has(w))
      .map((w) => w.replace(/(?:oes|aes|s)$/, "")),
  );

/**
 * A brecha do código trata do mesmo assunto que o ponto da leitura: o ponto cita a página da brecha (a dele ou
 * "Também nas p. 19") e os dois têm ao menos duas palavras de conteúdo em comum.
 */
function mesmaPaginaEAssunto(c: Brecha, p: Brecha): boolean {
  const pagina = c.origem?.pagina;
  if (!pagina) return false;
  const paginasDoPonto = new Set([
    p.origem?.pagina,
    ...[...(p.nota ?? "").matchAll(/Também nas p\. ([\d, ]+)/g)].flatMap((m) =>
      (m[1] ?? "").split(/[, ]+/).filter(Boolean).map(Number),
    ),
  ]);
  if (!paginasDoPonto.has(pagina)) return false;
  const doPonto = palavras(`${p.nome} ${p.texto}`);
  return [...palavras(`${c.nome} ${c.texto}`)].filter((w) => doPonto.has(w)).length >= 2;
}

export function juntarBrechas(doCodigo: Brecha[], daLeitura: Brecha[]): Brecha[] {
  // o ponto da leitura que já é uma brecha do código (o mesmo id) não entra de novo
  const jaListadas = new Set(doCodigo.map((c) => c.id));
  const pontos = daLeitura.filter((p) => !jaListadas.has(p.id));
  // cada brecha do código entra num ponto só: primeiro o do mesmo trecho; depois, o que cita a página e o assunto
  const dono = new Map<string, string>();
  const mesmoTrecho = (p: Brecha, c: Brecha) => {
    // o número do item na frente do trecho ("3.6. O não cumprimento…") não faz parte do texto comparado
    const trecho = compactar((p.origem?.trecho ?? "").replace(/^\s*\d+(?:\.\d+)*\.?\s*/, ""));
    const pedaco = trecho.slice(0, Math.min(40, trecho.length));
    return pedaco.length >= 25 && compactar(`${c.texto} ${c.origem?.trecho ?? ""}`).includes(pedaco);
  };
  for (const regra of [mesmoTrecho, (p: Brecha, c: Brecha) => mesmaPaginaEAssunto(c, p)])
    for (const p of pontos)
      for (const c of doCodigo) if (!dono.has(c.id) && regra(p, c)) dono.set(c.id, p.id);
  const juntados = pontos.map((p) => {
    const iguais = doCodigo.filter((c) => dono.get(c.id) === p.id);
    if (!iguais.length) return p;
    return {
      ...p,
      texto: `${p.texto} (Junta a brecha do código: ${iguais.map((c) => c.id).join(", ")}.)`,
      junta: iguais.map((c) => c.id),
      perguntaFinal: p.perguntaFinal || iguais.find((c) => c.perguntaFinal)?.perguntaFinal || "",
    };
  });
  return [...doCodigo.filter((c) => !dono.has(c.id)), ...juntados];
}

/**
 * Os pontos de atenção da leitura da etapa 1 (seção 7): os do PMO, quando a leitura dele está no dossiê, com o id
 * "etapa-1:<id do PMO>"; senão, os do código. Ficam de fora os que o GP descartou e os de citação não conferida.
 */
function pontosDaLeitura(
  analise: AnaliseRfp,
  salva: AnaliseRfpDossie,
  documentos: DocumentoLido[],
  hoje: Date,
): (ItemAnalise & { perguntaFinal: string })[] {
  const docs = documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
  return leituraDoDossie(analise, salva, docs, hoje)
    .itens.filter(
      (i) =>
        i.secao === "atencao" &&
        // as proteções que o texto dá à contratada não são brecha: vão para a proposta como proteção
        i.id !== "leitura:protecoes" &&
        // o agregado dos trechos vagos repete, num item só, os vagos que já estão um a um nas brechas
        i.id !== "leitura:atencao:vagos" &&
        !/^prote[cç][oõ]es\b/i.test(i.nome) &&
        estadoDoItem(salva.revisoes, i.id) !== "descartado" &&
        i.trava !== "citacao-nao-conferida",
    )
    .map((i) => ({
      id: i.doPmo ? `etapa-1:${i.id.replace(/^pmo:/, "")}` : i.id,
      secao: "brechas" as const,
      rotulo: i.rotulo,
      nome: `${i.premissa ? `${i.premissa} · ` : ""}${i.nome}`,
      texto: `${i.texto}${i.porquePesa ? ` Por que pesa: ${i.porquePesa}` : ""}`,
      origem: i.origem,
      // "Também nas p. 19": as outras páginas que o PMO citou (para juntar a brecha do código da mesma página)
      nota: i.nota,
      situacao: i.situacao,
      perguntaFinal: i.pergunta ?? "",
    }));
}

function linhaItem(i: ItemAnalise): string {
  const onde = i.origem ? ` [${i.origem.documento}, p. ${i.origem.pagina}]` : "";
  const campos = Object.entries(i.campos ?? {})
    .filter(([k]) => k !== "Trecho")
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
  return `- ${i.nome}: ${i.texto}${campos ? ` (${campos})` : ""}${onde}${i.situacao === "nao-localizado" ? " — não localizado pelo código, procurar no documento" : ""}`;
}

/** O ponto de partida em texto, para o pedido ao PMO (o PMO não precisa refazer o que o código já fez). */
export function pontoDePartidaEmTexto(p: PontoDePartida, opcoes: { pedirDestino?: boolean } = {}): string {
  const bloco = (titulo: string, linhas: string[]) =>
    `## ${titulo}\n${linhas.length ? linhas.join("\n") : "- (nada localizado pelo código)"}`;
  return [
    bloco("Identificação", p.identificacao.map(linhaItem)),
    bloco(
      "Requisitos numerados (use estes números; requisito novo é sugestão, sem número)",
      // entregas e obrigações de quem executa, todos os números R (método da etapa 1): a lista e o esqueleto contam igual
      [...p.requisitos, ...p.obrigacoes]
        .sort((a, b) => a.numero.localeCompare(b.numero, "pt-BR", { numeric: true }))
        .map(
          (r) =>
            `- ${r.numero} · ${r.tipo === "obrigacao" ? "Obrigação: " : ""}${r.rotulo}: ${r.descricao}${r.pagina ? ` [${r.documento ?? "RFP"}, p. ${r.pagina}]` : " [incluído pelo GP]"}`,
        ),
    ),
    bloco("Julgamento e pontuação técnica", p.julgamento.map(linhaItem)),
    bloco("Forma de apresentação (modelo obrigatório, planilha, limites)", p.apresentacao.map(linhaItem)),
    bloco("Prazos", p.prazos.map(linhaItem)),
    bloco("Condições contratuais", p.condicoes.map(linhaItem)),
    bloco(
      opcoes.pedirDestino
        ? "Brechas, vagos e pontos de atenção da etapa 1, inclusive os da leitura do PMO (dê um destino a cada um pelo id)"
        : "Brechas, vagos e pontos de atenção da etapa 1, inclusive os da leitura do PMO (para consulta: os destinos já foram dados na estratégia)",
      p.brechas.map(
        (b) =>
          `- id ${b.id} · ${b.nome}: ${b.texto} → pergunta sugerida: ${b.perguntaFinal}${b.origem ? ` [${b.origem.documento}, p. ${b.origem.pagina}]` : ""}`,
      ),
    ),
  ].join("\n\n");
}
