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
  identificacao: ItemAnalise[];
  julgamento: ItemAnalise[];
  apresentacao: ItemAnalise[];
  habilitacao: ItemAnalise[];
  prazos: ItemAnalise[];
  /** Brechas e vagos da etapa 1 que o GP não descartou, com a pergunta (ou o texto editado por ele). */
  brechas: (ItemAnalise & { perguntaFinal: string })[];
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
    identificacao: daSecao("identificacao"),
    julgamento: daSecao("julgamento"),
    apresentacao,
    habilitacao: daSecao("habilitacao"),
    prazos: daSecao("prazos"),
    brechas: [
      ...daSecao("brechas").map((b) => ({ ...b, perguntaFinal: textoFinal(b, salva.revisoes) })),
      ...pontosDaLeitura(analise, salva, documentos, hoje),
    ],
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
export function pontoDePartidaEmTexto(p: PontoDePartida): string {
  const bloco = (titulo: string, linhas: string[]) =>
    `## ${titulo}\n${linhas.length ? linhas.join("\n") : "- (nada localizado pelo código)"}`;
  return [
    bloco("Identificação", p.identificacao.map(linhaItem)),
    bloco(
      "Requisitos numerados (use estes números; requisito novo é sugestão, sem número)",
      p.requisitos.map(
        (r) =>
          `- ${r.numero} · ${r.rotulo}: ${r.descricao}${r.pagina ? ` [${r.documento ?? "RFP"}, p. ${r.pagina}]` : " [incluído pelo GP]"}`,
      ),
    ),
    bloco("Julgamento e pontuação técnica", p.julgamento.map(linhaItem)),
    bloco("Forma de apresentação (modelo obrigatório, planilha, limites)", p.apresentacao.map(linhaItem)),
    bloco("Prazos", p.prazos.map(linhaItem)),
    bloco("Condições contratuais", p.condicoes.map(linhaItem)),
    bloco(
      "Brechas, vagos e pontos de atenção da etapa 1, inclusive os da leitura do PMO (dê um destino a cada um pelo id)",
      p.brechas.map(
        (b) =>
          `- id ${b.id} · ${b.nome}: ${b.texto} → pergunta sugerida: ${b.perguntaFinal}${b.origem ? ` [${b.origem.documento}, p. ${b.origem.pagina}]` : ""}`,
      ),
    ),
  ].join("\n\n");
}
