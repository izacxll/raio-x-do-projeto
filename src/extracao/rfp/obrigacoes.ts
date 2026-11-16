// O que a contratada teria de fazer (método da etapa 1, seção 3.2): cláusulas em que quem executa (a contratada,
// a OSC, a parceira) tem verbo de obrigação, e os itens das listas "obrigações da contratada" / "compete à
// parceira". Agrupadas por tema; vedações numa linha própria; obrigações com prazo ou periodicidade seguem
// também para os prazos. Só cláusulas da execução: o que a proponente entrega no certame é proposta ou
// habilitação, não obrigação de quem executa.
import { normalizarTermo } from "../../regras/busca";
import { tirarAcentos } from "../../texto/normalizar";
import { ehDoCertame, lerClausulas, trechoDaClausula, type Clausula } from "./clausulas";
import type { DocumentoRfp, OrigemItem } from "./item";
import type { MapaRfp } from "./mapa";

export type TemaObrigacao =
  | "entregas"
  | "equipe"
  | "rotina"
  | "equipamentos"
  | "sistemas"
  | "relatorios"
  | "prestacao-de-contas"
  | "gestao-financeira"
  | "governanca"
  | "dados"
  | "comunicacao"
  | "outras";

export const NOME_TEMA_OBRIGACAO: Record<TemaObrigacao, string> = {
  entregas: "Entregas e execução do objeto",
  equipe: "Equipe",
  rotina: "Rotina de trabalho e atendimento",
  equipamentos: "Equipamentos, materiais e insumos",
  sistemas: "Sistemas e plataformas do contratante",
  relatorios: "Relatórios",
  "prestacao-de-contas": "Prestação de contas",
  "gestao-financeira": "Gestão financeira",
  governanca: "Governança, fiscalização e reuniões",
  dados: "Dados pessoais e sigilo",
  comunicacao: "Comunicação e divulgação",
  outras: "Outras obrigações",
};

/** Ordem de leitura dos temas na seção 2. */
export const ORDEM_TEMAS: TemaObrigacao[] = [
  "entregas",
  "equipe",
  "rotina",
  "equipamentos",
  "sistemas",
  "relatorios",
  "prestacao-de-contas",
  "gestao-financeira",
  "governanca",
  "dados",
  "comunicacao",
  "outras",
];

/** Tema pela primeira expressão que casa (ordem importa: prestação de contas antes de relatório). */
const TEMAS: [TemaObrigacao, RegExp][] = [
  ["dados", /dados pessoais|\blgpd\b|sigilo|confidencial|protecao de dados/],
  [
    "prestacao-de-contas",
    /prestacao de contas|prestar contas|demonstrativo|extrato bancario|conciliacao bancaria|comprovantes? de (?:pagamento|despesa|recolhimento)|notas? fisca/,
  ],
  [
    "gestao-financeira",
    /conta (?:bancaria|corrente|especifica)|contrapartida|devolver|restituir|aplicacao financeira|rendimentos?|orcamentos? de|pesquisa de (?:mercado|precos?)|saldo|recursos (?:da parceria|financeiros|repassados)|despesas?|encargos|tributos|impostos/,
  ],
  ["relatorios", /relatorios?/],
  ["sistemas", /\bsistemas?\b|plataforma|aplicativo|software/],
  [
    "equipe",
    /equipe|quadro (?:tecnico|de pessoal|profissional)|em seu quadro|profissiona(?:l|is)|pessoal|empregad|colaborador|coordenador|substitui|contratac\w* de (?:pessoal|profissionais)|trabalhistas|vinculo empregaticio|cargos?\b/,
  ],
  ["equipamentos", /equipamentos?|materia(?:l|is)|insumos?|veiculos?|uniformes?|computador|celular/],
  [
    "comunicacao",
    /divulga|marca|logotipo|logomarca|publicidade|placa|identidade visual|imprensa|redes sociais/,
  ],
  [
    "governanca",
    /gestor|fiscal|comissao|monitoramento|reunioes?|livre acesso|visitas? in loco|preposto|supervisor|informar|comunicar/,
  ],
  [
    "rotina",
    /atendimento|jornada|horario|visitas?|deslocamento|presencia(?:l|is)|in loco|campo|beneficiarios|participantes|gratuit/,
  ],
  ["entregas", /produtos?|entrega|execu(?:tar|cao) do objeto|plano de trabalho|metas?|atividades|servicos/],
];

/** Quem executa como sujeito ou destinatário da obrigação. */
const RE_EXECUTOR =
  /\b(?:contratad[ao]|parceir[ao]|osc|organizac\w+ da sociedade civil|proponente (?:selecionad|vencedor)\w*|licitante vencedor\w*|executor\w*)\b/;
/** Verbo ou expressão de obrigação. */
const RE_OBRIGA =
  /\b(?:devera|deverao|deve|devem|obriga-se|obrigam-se|esta obrigad[ao]|fica obrigad[ao]|compete|competira|cabe|cabera|incumbe|e responsavel|sera responsavel|responsabilizar-se|responsabiliza-se|comprometendo-se|compromete-se|sob responsabilidade|de responsabilidade d[ao])\b/;
/** Vedação a quem executa. */
const RE_VEDA =
  /\b(?:e vedad[oa]|ficam? vedad[oa]s?|sera vedad[oa]|e proibid[oa]|nao poder(?:a|ao)|e defeso|nao sera (?:permitid|admitid)[oa])\b/;
/** Título de seção ou cláusula de obrigações de quem executa. */
const RE_SECAO_OBRIGACOES =
  /obrigac\w* d[ao]s? (?:contratad|parceir|osc|organizac|executor)|compete a (?:contratad|parceir|osc)|responsabilidades d[ao]s? (?:contratad|parceir)|deveres d[ao]s? (?:contratad|parceir)/;
/** Item de lista que começa por verbo no infinitivo ("manter…", "apresentar…"). */
const RE_TAREFA = /^[a-z]{3,}(?:ar|er|ir|or)(?:-se)?\b/;
/** Periodicidade: obrigação recorrente, que também vai para os prazos. */
const RE_RECORRENTE =
  /\b(mensal(?:mente)?|bimestral(?:mente)?|trimestral(?:mente)?|quadrimestral(?:mente)?|semestral(?:mente)?|anual(?:mente)?|semanal(?:mente)?|quinzenal(?:mente)?|diari[oa](?:mente)?)\b/;
/** Prazo em dias, horas ou meses dentro da cláusula. */
const RE_PRAZO =
  /\b(?:no prazo|em ate|ate|dentro de|no maximo|antecedencia(?: minima)? de)\s+(?:de\s+)?(?:ate\s+)?\d{1,3}\s*(?:\([^)]{1,25}\)\s*)?(?:dias?|horas?|meses|mes)\b(?:\s+(?:uteis|corridos))?/;

export interface Obrigacao {
  tema: TemaObrigacao;
  vedacao: boolean;
  /** Texto da cláusula sem o número, curto. */
  texto: string;
  origem: OrigemItem;
  numero: string;
  /** "trimestral", "mensal"… quando a obrigação é periódica. */
  recorrencia?: string;
  /** "no prazo de 30 (trinta) dias", quando a cláusula traz o prazo. */
  prazo?: string;
  /** Os subitens da lista que a cláusula abre ("os seguintes documentos:"), quando houver. */
  itens?: string[];
}

/** O tema sai do começo da cláusula (o verbo e o objeto); só sem tema no começo é que vale o resto. */
function tema(normal: string): TemaObrigacao {
  for (const trecho of [normal.slice(0, 90), normal])
    for (const [t, re] of TEMAS) if (re.test(trecho)) return t;
  return "outras";
}

/** Sem o número do item na frente. */
function semNumero(texto: string): string {
  return texto.replace(/^(?:\d{1,2}(?:\.\d{1,2}){0,4}\.?|[a-z]\)|[IVX]{1,5}\s*[-–.)])\s*/, "").trim();
}

/** A administração como agente ("a CONTRATANTE deverá monitorar", "poderá a Administração"). */
const RE_ADMINISTRACAO =
  /\b(?:gestor\w*|fiscal\w*|administracao(?: publica)?|contratante|comissao|secretaria|orgao|poder publico|prefeitura|concedente|supervisor\w*)\b/;
/** Quem a proponente faz no certame (apresentar proposta, declaração), não na execução. */
const RE_ATOR_DO_CERTAME =
  /^(?:a|o|as|os) (?:proponentes?|licitantes?)\b(?! (?:selecionad|vencedor|contratad))/;
/** Quem executa como objeto da frase: "a PARCEIRA deverá ser intimada", "vedada à Administração". */
const RE_EXECUTOR_PASSIVO = /dever(?:a|ao) ser (?:intimad|notificad|comunicad|informad|cientificad|convocad)/;
const RE_VEDA_A_ADMINISTRACAO =
  /vedad[oa]s? (?:a|ao|aos|as) (?:administracao|contratante|gestor|orgao|poder publico)/;

/** Quem aparece primeiro na frase: quem executa ou a administração. */
function primeiroAtor(corpo: string): "executor" | "administracao" | undefined {
  const e = RE_EXECUTOR.exec(corpo)?.index ?? Infinity;
  const a = RE_ADMINISTRACAO.exec(corpo)?.index ?? Infinity;
  if (e === Infinity && a === Infinity) return undefined;
  return e <= a ? "executor" : "administracao";
}

function ehObrigacao(c: Clausula, naListaDeObrigacoes: boolean): "obrigacao" | "vedacao" | undefined {
  const corpo = normalizarTermo(semNumero(c.texto));
  if (corpo.length < 20 || RE_ATOR_DO_CERTAME.test(corpo) || RE_EXECUTOR_PASSIVO.test(corpo))
    return undefined;
  // explicação ou definição, não obrigação ("Visa-se a possibilitar…", "Considera-se…", "O contrato se extingue…")
  if (
    /^(?:visa-se|considera-se|entende-se|tem por objetivo|o contrato se extingue|eventuais alteracoes)/.test(
      corpo,
    )
  )
    return undefined;
  if (RE_VEDA_A_ADMINISTRACAO.test(corpo)) return undefined;
  const ator = primeiroAtor(corpo.slice(0, 160));
  // a administração como agente: é dever do contratante, não da contratada (na lista de obrigações da
  // contratada, o item começa pelo verbo e o contratante aparece como destinatário: "comunicar à CONTRATANTE")
  const daAdministracao = ator === "administracao" && !(naListaDeObrigacoes && RE_TAREFA.test(corpo));
  if (daAdministracao) return undefined;
  if (RE_VEDA.test(corpo) && (RE_EXECUTOR.test(corpo) || naListaDeObrigacoes)) return "vedacao";
  if (RE_EXECUTOR.test(corpo) && RE_OBRIGA.test(corpo)) return "obrigacao";
  if (naListaDeObrigacoes && RE_TAREFA.test(corpo)) return "obrigacao";
  // no objeto e no escopo, o sujeito costuma ser o projeto ("o projeto deverá ser original", "os projetos
  // deverão complementar as ações do poder público"): é o que quem executa entrega
  if (
    (c.secao?.tema === "objeto" || c.secao?.tema === "escopo") &&
    RE_SUJEITO_PROJETO.test(corpo) &&
    /\b(?:devera|deverao|deve|devem|nao podera|nao poderao)\b/.test(corpo)
  )
    return "obrigacao";
  return undefined;
}

/** "O projeto…", "As ações…", "A proposta…" como sujeito, no objeto e no escopo. */
const RE_SUJEITO_PROJETO = /^(?:o|os|a|as)\s+(?:projetos?|acoes|acao|propostas?|atividades)\b/;

/**
 * Obrigação genérica: todo plano a cumpre e a conferência não teria o que procurar ("observar a legislação",
 * "executar satisfatoriamente o objeto", "manter a regularidade fiscal"). Fica no cartão do tema, sem número R.
 */
const RE_GENERICA =
  /^(?:executar (?:satisfatoria|os servicos|o objeto)|observar(?: e respeitar)?\b|cumprir(?:,| as| os| todas| alem| durante)|manter(?:,|\s+durante)?\s+(?:toda|as condicoes|regular|durante|em compatibilidade)|responsabilizar-se (?:por (?:manter|todos|todo)|pelos vicios)|fornecer todas as informacoes|prestar (?:todo|os|todos os) esclarecimentos|atender as determinacoes|prevenir|gerir o valor|promover a organizacao|reparar|utilizar empregados|arcar com|indenizar|nos casos de|a (?:contratada|parceira|organizacao da sociedade civil) deve cumprir|alem daquelas obrigacoes|iniciar as atividades)/;

/** Verbo de entrega concreta: o que dá para procurar no plano e cobrar na execução. */
const RE_ENTREGA_CONCRETA =
  /\b(?:entregar|entregues|apresentar|disponibilizar|divulgar|garantir|guardar sigilo|manter arquivad\w*|recolher|participar de reunioes|oferecer|elaborar|enviar|encaminhar|publicar|comprovar|prestar contas|realizar a prestacao de contas|ser original|complementar|contemplar|prever recursos|intermediacao|facilitacao)\b/;
/** Prazo de execução do projeto ("no período de 12 meses"): vai para os prazos, não para os requisitos. */
const RE_PRAZO_DE_EXECUCAO =
  /\b(?:no|pelo|em|dentro do) (?:periodo|prazo) (?:maximo )?de\s+\d{1,3}\s*(?:\([^)]*\)\s*)?(?:meses|dias|anos)\b/;

/**
 * Obrigação que vira requisito numerado (R): específica (não genérica), com entrega concreta, prazo ou
 * periodicidade. As outras ficam no cartão do tema; a leitura do PMO pode sugerir mais, e o GP decide.
 */
export function ehObrigacaoEspecifica(o: Obrigacao): boolean {
  if (o.vedacao) return false;
  const t = normalizarTermo(o.texto).replace(
    /^(?:a|o) (?:contratada|parceira|organizacao da sociedade civil|osc|contratado)\s+(?:devera|deve|esta obrigad[ao] a|fica obrigad[ao] a|e responsavel (?:pel[oa]s?|por))\s+/,
    "",
  );
  if (
    RE_GENERICA.test(t) ||
    /\b(?:legislacao|lei federal|normas vigentes|codigo de defesa)\b/.test(t.slice(0, 120))
  )
    return false;
  if (RE_PRAZO_DE_EXECUCAO.test(t) && !RE_ENTREGA_CONCRETA.test(t)) return false;
  return Boolean(o.recorrencia || o.prazo || o.itens?.length || RE_ENTREGA_CONCRETA.test(t.slice(0, 160)));
}

export function extrairObrigacoes(docs: DocumentoRfp[], mapa: MapaRfp): Obrigacao[] {
  const out: Obrigacao[] = [];
  const vistas = new Set<string>();
  // a lista aberta por "compete à PARCEIRA:" vale dentro da mesma seção do mapa, até 3 páginas adiante
  let listaAtiva: { secao: Clausula["secao"]; doc: string; ate: number } | undefined;
  const clausulas = lerClausulas(docs, mapa);
  for (const [k, c] of clausulas.entries()) {
    const normal = normalizarTermo(c.texto);
    // abre a lista de obrigações (o título da cláusula, ou "compete à PARCEIRA:"), que vale até a próxima
    // cláusula de número de primeiro nível
    if (RE_SECAO_OBRIGACOES.test(normal) && normal.length < 200) {
      listaAtiva = { secao: c.secao, doc: c.doc.id, ate: c.pagina + 3 };
      continue;
    }
    if (
      listaAtiva &&
      (c.doc.id !== listaAtiva.doc || c.pagina > listaAtiva.ate || c.secao !== listaAtiva.secao)
    )
      listaAtiva = undefined;
    if (ehDoCertame(c)) continue;
    const naLista = Boolean(listaAtiva) || RE_SECAO_OBRIGACOES.test(normalizarTermo(c.secao?.titulo ?? ""));
    const tipo = ehObrigacao(c, naLista);
    if (!tipo) continue;
    const texto = trechoDaClausula(c);
    // a mesma obrigação no edital ("a Organização da Sociedade Civil") e na minuta ("a PARCEIRA") entra uma vez
    const chave = normalizarTermo(semNumero(c.texto))
      .replace(
        /\b(?:a |o )?(?:organizacao da sociedade civil|osc|parceira|contratada|parceiro|contratado)\b/g,
        "#",
      )
      .slice(0, 80);
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    // sem acento e com o mesmo comprimento: o que casa no texto normal é recortado do original
    const original = semNumero(c.texto);
    const corpo = tirarAcentos(original);
    const prazo = RE_PRAZO.exec(corpo);
    out.push({
      tema: tema(corpo),
      vedacao: tipo === "vedacao",
      texto: semNumero(texto),
      origem: { documento: c.doc.rotulo, pagina: c.pagina, trecho: texto },
      numero: c.numero,
      recorrencia: RE_RECORRENTE.exec(corpo)?.[1],
      prazo: prazo ? original.slice(prazo.index, prazo.index + prazo[0].length) : undefined,
      itens: original.trim().endsWith(":") ? subitens(clausulas, k) : undefined,
    });
  }
  return out;
}

/**
 * "A PARCEIRA deverá apresentar os seguintes documentos:" — os subitens que vêm logo depois ("7.6.1 Ofício…",
 * "a) …") fazem parte da obrigação. Até 20, no mesmo documento, enquanto o número for filho do da cláusula.
 */
function subitens(clausulas: Clausula[], k: number): string[] {
  const pai = clausulas[k];
  if (!pai) return [];
  const out: string[] = [];
  for (const c of clausulas.slice(k + 1, k + 30)) {
    if (c.doc !== pai.doc) break;
    const filho = pai.numero ? c.numero.startsWith(`${pai.numero.replace(/\.$/, "")}.`) : false;
    const letra = /^[a-z]\)$/.test(c.numero);
    if (!filho && !letra) break;
    out.push(semNumero(c.texto).split(/[;:]/)[0]?.trim() ?? "");
    if (out.length >= 20) break;
  }
  return out.filter(Boolean);
}
