// Pontos de atenção da RFP pelas premissas críticas (método da etapa 1, seção 3.7). Cada padrão do texto liga o
// trecho a uma premissa crítica (PC1 a PC8 do checklist.md da skill), com o motivo e a pergunta de esclarecimento
// sugerida, por modelo de texto e em redação condicional. Também entram, sem premissa, a pressão de preço,
// "esclarecimentos não suspendem os prazos" e as restrições operacionais; e as proteções que o texto dá à
// contratada, numa linha só. O código acha o padrão; quem decide o que perguntar é o GP.
import { ehDoCertame, lerClausulas, trechoDaClausula, type Clausula } from "../extracao/rfp/clausulas";
import type { DocumentoRfp, OrigemItem } from "../extracao/rfp/item";
import type { MapaRfp } from "../extracao/rfp/mapa";
import { normalizarTermo } from "./busca";

export type CodigoPremissa = "PC1" | "PC2" | "PC3" | "PC4" | "PC5" | "PC6" | "PC7" | "PC8";

export const NOME_PREMISSA: Record<CodigoPremissa, string> = {
  PC1: "Dados e informações do contratante chegam no prazo",
  PC2: "Sistemas que não são da FGV funcionam",
  PC3: "O contratante aprova e decide no prazo",
  PC4: "O projeto começa na data prevista",
  PC5: "Prioridades e interlocutores do contratante se mantêm",
  PC6: "Parceiros, órgãos e participantes fazem a sua parte",
  PC7: "A equipe prevista dá conta do volume",
  PC8: "O escopo não cresce sem aditivo",
};

/** Ordem de impacto (método, seção 3.1): caixa, dependência do contratante, preço, prazo, escopo. */
export type Impacto = 1 | 2 | 3 | 4 | 5 | 6;

export interface PontoDeAtencao {
  id: string;
  premissa?: CodigoPremissa;
  nome: string;
  /** O que o texto diz (o trecho, curto). */
  texto: string;
  porquePesa: string;
  pergunta: string;
  impacto: Impacto;
  origem: OrigemItem;
  /** Outras páginas onde o mesmo padrão aparece. */
  outrasPaginas: number[];
}

interface Padrao {
  id: string;
  premissa?: CodigoPremissa;
  nome: string;
  re: RegExp;
  /** A cláusula que já traz o prazo não é ponto (a dependência tem data). */
  semPrazo?: boolean;
  /** Só conta se a cláusula também casar com isto. */
  junto?: RegExp;
  /** Vale também nas cláusulas do certame (proposta, julgamento, habilitação). Sem isto, só na execução. */
  noCertame?: boolean;
  porquePesa: string;
  pergunta: string;
  impacto: Impacto;
}

const PRAZO =
  /\b(?:no prazo de|em ate|ate|dentro de|antecedencia de)\s+\d{1,3}\s*(?:\([^)]{1,25}\)\s*)?(?:dias?|horas?|meses)\b/;

// Modelos de texto: sempre com o trecho e a página no item, em redação de pedido de esclarecimento.
const PADROES: Padrao[] = [
  {
    id: "pc1-fornecido",
    premissa: "PC1",
    nome: "Dado ou insumo fornecido pelo contratante, sem prazo",
    re: /\b(?:a ser(?:em)? (?:fornecid|disponibilizad|enviad|encaminhad|definid|indicad)[oa]s? pel[ao]|informacoes necessarias|diretrizes (?:graficas|visuais|editoriais)|(?:fornecid|disponibilizad)[oa]s? pel[ao] (?:contratante|administracao|secretaria|ministerio|orgao|prefeitura|smped|oei)|lista(?:s)? (?:enviada|fornecida|disponibilizada)s? pel[ao]|a contratante (?:fornecera|disponibilizara|encaminhara))\b/,
    semPrazo: true,
    porquePesa:
      "O trabalho depende de algo que a FGV não produz; sem data, o atraso do contratante vira atraso da FGV.",
    pergunta:
      "Solicita-se informar em que prazo e em que formato o contratante disponibilizará o que o trecho cita, e se o prazo da contratada será contado a partir desse recebimento.",
    impacto: 2,
  },
  {
    id: "pc2-sistema",
    premissa: "PC2",
    nome: "Sistema do contratante obrigatório",
    re: /\b(?:sistemas? (?:do|da) (?:contratante|administracao|secretaria|ministerio|prefeitura|orgao)|de forma exclusiva e obrigatoria|exclusivamente (?:no|em|por meio d[oa]) (?:sistema|plataforma)|(?:registrad|lancad|inserid)[oa]s? (?:no|em) (?:sistema|plataforma) (?:do|da|oficial|propri))\b/,
    porquePesa:
      "Metas ou registros medidos num sistema que a FGV não controla: falha ou indisponibilidade dele afeta o resultado e o pagamento.",
    pergunta:
      "Solicita-se esclarecer como será tratada a indisponibilidade do sistema indicado no trecho e se os registros feitos por outro meio nesse período serão aceitos para fins de metas e de pagamento.",
    impacto: 2,
  },
  {
    id: "pc3-aprovacao",
    premissa: "PC3",
    nome: "Aprovação ou validação do contratante sem prazo",
    re: /\b(?:apos (?:a |o )?(?:aprovacao|validacao|aceite|ateste|analise)|mediante (?:a |o )?(?:aprovacao|validacao|aceite)|a criterio d[ao] (?:contratante|administracao|gestor|secretaria)|a juizo d[ao] (?:contratante|administracao))\b/,
    semPrazo: true,
    junto:
      /\b(?:aprova|valida|aceite|ateste|atesto|analise|pagamento|repasse|produtos?|entregas?|relatorios?)/,
    porquePesa:
      "Sem prazo para o contratante aprovar, a entrega fica parada e, se o pagamento depende da aprovação, o caixa também.",
    pergunta:
      "Solicita-se informar o prazo para a análise e a aprovação citadas no trecho, quantas rodadas de ajuste estão previstas e o que acontece se o prazo não for cumprido.",
    impacto: 1,
  },
  {
    id: "pc4-marco",
    premissa: "PC4",
    nome: "Prazo contado de um marco sem data",
    re: /\b(?:a partir da (?:assinatura|publicacao|emissao|ordem de servico|celebracao)|contad[oa]s? (?:da|do) (?:assinatura|publicacao|emissao|ordem de servico|recebimento da ordem)|apos (?:a )?assina-? ?tura)\b/,
    junto: /\b(?:execu|vigencia|projeto|desenvolvid|produtos?|entrega|meses|dias)\b/,
    porquePesa:
      "O início depende de um ato do contratante sem data; se ele atrasa, o cronograma inteiro se desloca.",
    pergunta:
      "Solicita-se informar a data prevista para o marco citado no trecho e se, havendo atraso dele, os prazos da contratada serão ajustados na mesma medida.",
    impacto: 4,
  },
  {
    id: "pc4-progressiva",
    premissa: "PC4",
    nome: "Contratação ou implantação progressiva",
    re: /\b(?:contratacao progressiva|implantacao (?:progressiva|gradual|escalonada)|de forma (?:gradual|escalonada|progressiva))\b/,
    porquePesa:
      "O ritmo depende do contratante; o custo de quem já está mobilizado corre enquanto se espera.",
    pergunta:
      "Solicita-se informar o cronograma da implantação progressiva citada no trecho e como os prazos e metas serão ajustados se ele mudar.",
    impacto: 4,
  },
  {
    id: "pc6-adesao",
    premissa: "PC6",
    nome: "Resultado que depende de adesão de terceiros",
    re: /\b(?:adesao d[oa]s? (?:municipios|beneficiarios|participantes|orgaos|escolas|familias)|depende(?:ra|m)? d[ao]s? (?:municipios|orgaos|secretarias|parceiros|beneficiarios)|participacao d[oa]s? (?:municipios|orgaos|secretarias|redes)|articulacao com (?:os |as )?(?:municipios|orgaos|secretarias|redes)|pactuacao com|(?:instancia|comite) (?:de )?etica)\b/,
    porquePesa:
      "Metas que dependem de quem não está sob o controle da FGV: a falta de adesão compromete o resultado sem culpa da contratada.",
    pergunta:
      "Solicita-se esclarecer como será avaliado o cumprimento das metas citadas no trecho se a adesão ou a participação de terceiros ficar abaixo do previsto.",
    impacto: 2,
  },
  {
    id: "pc7-volume",
    premissa: "PC7",
    nome: "Equipe de referência, proporção ou volume estimado",
    re: /\b(?:equipe de referencia|na proporcao de|proporcao de \d|produtividade minima|no minimo \d{1,4} (?:visitas|atendimentos|familias|pessoas|participantes)|volume estimado|estimativa de (?:atendimentos|beneficiarios|participantes|demanda)|quantitativo estimado)\b/,
    porquePesa:
      "O dimensionamento da equipe sai de um volume que o contratante estima; se o volume real for maior, a equipe não dá conta pelo mesmo preço.",
    pergunta:
      "Solicita-se confirmar a base do volume ou da proporção citada no trecho e como serão tratados volumes acima do estimado.",
    impacto: 3,
  },
  {
    id: "pc8-aberto",
    premissa: "PC8",
    nome: "Escopo aberto",
    re: /\b(?:demais atividades|outras atividades (?:correlatas|afins|pertinentes)|atividades correlatas|e outr[oa]s que (?:se fizerem|forem) necessari|entre outr[oa]s)\b/,
    junto: /\b(?:devera|deverao|compete|cabe|cabera|obriga|obrigad[ao]|incumbe|responsavel)\b/,
    porquePesa: "Lista aberta de atividades: o que não está escrito pode ser cobrado sem aditivo.",
    pergunta:
      "Solicita-se delimitar as atividades abrangidas pela expressão em aberto do trecho, ou confirmar que o que não estiver listado dependerá de aditivo.",
    impacto: 5,
  },
  {
    id: "pc8-acrescimo",
    premissa: "PC8",
    nome: "Acréscimos obrigatórios no mesmo preço unitário",
    re: /\bacrescimos?(?: ou supressoes| e supressoes)?\b.{0,80}\b25 ?(?:%|\(vinte e cinco)/,
    porquePesa:
      "O contratante pode aumentar o volume em até 25% nas mesmas condições: a equipe tem de comportar.",
    pergunta:
      "Solicita-se confirmar como os acréscimos citados no trecho serão formalizados e se o cronograma será revisto na mesma medida.",
    impacto: 5,
  },
  {
    id: "pc8-aditivo",
    premissa: "PC8",
    nome: "Alteração só por aditivo",
    re: /\b(?:somente|so|apenas) (?:por|mediante) (?:termo )?aditivo\b/,
    porquePesa:
      "Toda mudança de meta, prazo ou escopo depende de aditivo; sem ele, a FGV executa o que estiver escrito.",
    pergunta:
      "Solicita-se informar o prazo de tramitação de aditivos e se ajustes de metas e cronograma por fato alheio à contratada podem ser feitos por apostilamento.",
    impacto: 5,
  },
];

/** Pontos sem premissa (método, seção 3.7): preço, prazos que não param, restrições. */
const OUTROS: Padrao[] = [
  {
    id: "preco-inexequivel",
    noCertame: true,
    nome: "Pressão de preço",
    re: /\b(?:inexequ\w+|valor incompativel|preco incompativel|manifestamente inexequ|desclassificad[oa]s? .{0,40}preco)\b/,
    porquePesa:
      "O edital elimina por preço baixo demais: o desconto tem um piso que precisa sair do custo real.",
    pergunta:
      "Solicita-se informar o critério objetivo usado para considerar o preço inexequível ou incompatível.",
    impacto: 3,
  },
  {
    id: "nao-suspende",
    noCertame: true,
    nome: "Esclarecimentos não suspendem os prazos",
    re: /\bnao (?:suspende|suspendem|suspendera|suspenderao|interrompe|interrompem)\b.{0,40}\bprazos?\b|\bprazos?\b.{0,60}\bnao (?:serao|sera|ficam?) suspens/,
    porquePesa:
      "As respostas podem chegar depois do prazo da proposta; a proposta precisa ser montada sem contar com elas.",
    pergunta:
      "Solicita-se confirmar a data-limite para o envio das respostas aos pedidos de esclarecimento, já que eles não suspendem os prazos.",
    impacto: 4,
  },
  {
    id: "restricao-dados",
    nome: "Restrição operacional sobre dados",
    re: /\b(?:fora do (?:pais|territorio nacional)|no exterior|servidores? (?:localizados? )?no brasil|armazenad[oa]s? em territorio nacional)\b/,
    junto: /\bdados\b/,
    porquePesa: "Restringe as ferramentas que a equipe pode usar (nuvem, sistemas de terceiros).",
    pergunta:
      "Solicita-se confirmar se ferramentas de armazenamento e processamento em nuvem com servidores fora do país podem ser usadas.",
    impacto: 6,
  },
];

/** Proteções que o texto dá à contratada: viram uma linha só, no fim dos pontos de atenção. */
const PROTECOES =
  /\b(?:prorrogacao de oficio|prorrogad[oa] de oficio|atraso na liberacao .{0,60}prorroga|justificativa suficiente|devidamente justificad[oa] .{0,40}(?:meta|cumprimento parcial)|cumprimento parcial (?:ser|seja) devidamente justificado|nao implicara (?:glosa|penalidade)|sem prejuizo .{0,20}contratada|juros de mora|parcela incontroversa|atualizacao (?:monetaria|financeira))\b/;

function semPrazoNaClausula(c: Clausula): boolean {
  return !PRAZO.test(normalizarTermo(c.texto));
}

export interface ResultadoPremissas {
  pontos: PontoDeAtencao[];
  protecoes: { texto: string; origem: OrigemItem }[];
}

/**
 * Os pontos de atenção por padrão de texto: no máximo um por padrão e por página, e no máximo `limite` por padrão,
 * na ordem do documento.
 */
export function extrairPontosDeAtencao(docs: DocumentoRfp[], mapa: MapaRfp): ResultadoPremissas {
  const clausulas = lerClausulas(docs, mapa);
  const pontos: PontoDeAtencao[] = [];
  // um ponto por padrão: a primeira ocorrência é o trecho; as outras páginas ficam listadas no ponto
  for (const p of [...PADROES, ...OUTROS]) {
    let ponto: PontoDeAtencao | undefined;
    for (const c of clausulas) {
      const normal = normalizarTermo(c.texto);
      if (!p.re.test(normal)) continue;
      if (p.junto && !p.junto.test(normal)) continue;
      if (p.semPrazo && !semPrazoNaClausula(c)) continue;
      if (!p.noCertame && ehDoCertame(c)) continue;
      if (ponto) {
        if (ponto.origem.pagina !== c.pagina && !ponto.outrasPaginas.includes(c.pagina))
          ponto.outrasPaginas.push(c.pagina);
        continue;
      }
      const trecho = trechoDaClausula(c, 280);
      ponto = {
        id: `${p.id}:${c.doc.id}:${c.pagina}:${c.posicao}`,
        premissa: p.premissa,
        nome: p.nome,
        texto: trecho,
        porquePesa: p.porquePesa,
        pergunta: p.pergunta,
        impacto: p.impacto,
        origem: { documento: c.doc.rotulo, pagina: c.pagina, trecho },
        outrasPaginas: [],
      };
    }
    if (ponto) pontos.push(ponto);
  }
  const protecoes: ResultadoPremissas["protecoes"] = [];
  const vistas = new Set<string>();
  for (const c of clausulas) {
    if (protecoes.length >= 4) break;
    const normal = normalizarTermo(c.texto);
    if (!PROTECOES.test(normal) || ehDoCertame(c)) continue;
    // a mesma proteção no edital e na minuta entra uma vez
    const chave = normal.replace(/^[\d.]+\s*/, "").slice(0, 60);
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    const trecho = trechoDaClausula(c, 240);
    protecoes.push({ texto: trecho, origem: { documento: c.doc.rotulo, pagina: c.pagina, trecho } });
  }
  return { pontos, protecoes };
}
