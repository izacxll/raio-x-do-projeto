// Requisitos numerados da RFP (etapa 1, passo 3): cada R é uma entrega ou obrigação de quem executa (decisão 0054)
// — produtos e entregáveis, os itens do objeto e o levantamento exigido, a equipe-chave (um R só, com a lista dos
// perfis), quantidades, local, condições do objeto, obrigações, a forma de entrega e o sigilo com a cessão dos
// produtos. Cada um ganha um número (R01, R02…) que acompanha o projeto até a conferência (etapa 5).
// Requisitos técnicos e funcionais em texto corrido ficam para o GP incluir: o código não os separa nesta versão.
import { normalizarTermo } from "../../regras/busca";
import { ehCampoEmBranco, limparEspacos, MARCA_DE_ITEM } from "../../texto/frase";
import { compactar, tirarAcentos } from "../../texto/normalizar";
import { extrairRequisitos, type Requisito } from "../requisitos";
import type { DocumentoRfp } from "./item";
import { ehObrigacaoEspecifica, extrairObrigacoes, NOME_TEMA_OBRIGACAO } from "./obrigacoes";
import { localizarTodos } from "./localizar";
import { faixasDoTema, type MapaRfp } from "./mapa";

const PAPEIS =
  "coordenador(?:\\(?a\\)?)?(?: geral| tecnico| de campo| executivo)?|gestor(?:a)? (?:de projeto|do projeto|tecnico)|gerente(?: de projeto| do projeto)?|consultor(?:a)?(?: senior| pleno| junior)?|especialista|analista|pesquisador(?:a)?|assistente social|assistente|tecnico(?:a)?|supervisor(?:a)?|facilitador(?:a)?|assessor(?:a)?|engenheir[oa]|arquitet[oa]|advogad[oa]|economista|estatistic[oa]|psicolog[oa]|sociolog[oa]|pedagog[oa]|antropolog[oa]|cientista de dados|desenvolvedor(?:a)?|designer|jornalista|profissional de nivel superior|profissional";
const RE_PAPEL = new RegExp(`^(?:(\\d{1,2})\\s*(?:\\([a-z ]+\\)\\s*)?)?(${PAPEIS})\\b`);
const RE_QUALIFICACAO =
  /\bperfil\b|graduac|formacao|nivel superior|superior completo|experiencia|pos-graduac|especializac|mestrad|doutorad|registro no|anos de atuacao|curso superior|bacharel|licenciatura/;
const RE_PAGINA_DE_EQUIPE =
  /equipe[ -](?:tecnica|minima|chave|de trabalho|profissional|executora)|qualificacao (?:tecnica|profissional)|perfil profissional|perfis profissionais|profissionais (?:exigidos|minimos)/;

/** Título de seção em caixa alta ("SIGILO E DIREITOS DE PROPRIEDADE"): a lista da equipe acaba antes dele. */
const RE_TITULO_DE_SECAO = /^[A-ZÀ-Ý0-9][A-ZÀ-Ý0-9 ,.ºª/()–-]{6,}$/;

interface PerfilAchado {
  papel: string;
  descricao: string;
  pagina: number;
  documento: string;
}

/** Os perfis da equipe exigida: da página que abre a seção de equipe até o título da seção seguinte. */
function perfisDaEquipe(docs: DocumentoRfp[]): PerfilAchado[] {
  const out: PerfilAchado[] = [];
  const vistos = new Set<string>();
  for (const doc of docs) {
    // as linhas do documento inteiro: o perfil no fim de uma página tem a qualificação na seguinte
    const linhas = linhasDoDocumento(doc);
    const paginasQueAbrem = new Set(
      doc.paginas.filter((p) => RE_PAGINA_DE_EQUIPE.test(normalizarTermo(p.texto))).map((p) => p.numero),
    );
    let naSecao = false;
    for (let i = 0; i < linhas.length; i++) {
      {
        const pagina = linhas[i]!.pagina;
        if (!naSecao && !paginasQueAbrem.has(pagina)) continue;
        naSecao = true;
        const original = linhas[i]!.texto;
        const titulo = original.trim();
        // a seção de equipe acaba no título seguinte em caixa alta que não é da equipe (só depois de achar perfil)
        if (
          out.length &&
          RE_TITULO_DE_SECAO.test(titulo) &&
          !RE_PAGINA_DE_EQUIPE.test(normalizarTermo(titulo)) &&
          !RE_PAPEL.test(normalizarTermo(titulo))
        ) {
          break;
        }
        const limpa = limparEspacos(original.replace(/\t+/g, " "))
          .replace(/^(?:\d{1,2}(?:\.\d{1,2})*\.?|[a-z]\)|[IVX]{1,4}\s*[-–.)])\s*/, "")
          .replace(MARCA_DE_ITEM, "");
        const n = normalizarTermo(limpa);
        const m = RE_PAPEL.exec(n);
        if (!m?.[2] || limpa.length > 400) continue;
        const junto = normalizarTermo(`${limpa} ${linhas[i + 1]?.texto ?? ""} ${linhas[i + 2]?.texto ?? ""}`);
        // "1 (um) Coordenador(a) Geral" (com a quantidade) vale sozinho; sem ela, precisa da qualificação perto
        if (!m[1] && !RE_QUALIFICACAO.test(junto)) continue;
        // definição copiada da lei ("considera-se de notória especialização o profissional ou a empresa cujo
        // conceito…", art. 74, § 3º) não é equipe exigida
        if (/notoria especializacao|considera-se|para os fins desta lei|cujo conceito/.test(junto)) continue;
        // o nome do papel: sem a quantidade na frente e sem a qualificação que vem depois
        const papel =
          limpa
            .replace(/^\d{1,2}\s*(?:\([^)]*\)\s*)?/, "")
            .split(/[:;,–—]|\s-\s|\s(?=formação|Formação|FORMAÇÃO|experiência|Experiência|com\s|que\s)/)[0]
            ?.trim()
            // até 80 caracteres, sem cortar palavra
            .replace(/^(.{0,80})(?:\s.*)?$/, "$1")
            .replace(/[.;:]$/, "") || m[2];
        // "Do profissional indicado…" (a frase que apresenta o perfil) não é nome de perfil
        if (/^(?:do|da|de|o|a|os|as)\s/i.test(papel)) continue;
        const chave = normalizarTermo(papel).replace(/[^a-z]/g, "");
        // o mesmo papel em outra tabela ("Coordenador(a) Geral trado", com a coluna vizinha colada) é repetição
        if ([...vistos].some((v) => v.startsWith(chave) || chave.startsWith(v))) continue;
        vistos.add(chave);
        const seguinte = linhas[i + 1]?.texto.trim() ?? "";
        const continua = /\w$|,$/.test(limpa) && seguinte && !RE_PAPEL.test(normalizarTermo(seguinte));
        const descricao = limparEspacos(`${limpa}${continua ? ` ${seguinte}` : ""}`).slice(0, 300);
        out.push({
          papel: `${papel.charAt(0).toUpperCase()}${papel.slice(1)}`,
          descricao,
          pagina,
          documento: doc.rotulo,
        });
      }
    }
  }
  return out.slice(0, 20);
}

/** A equipe-chave como um requisito só (decisão 0054), com a lista dos perfis; o trecho é o do primeiro perfil. */
function equipe(docs: DocumentoRfp[]): Omit<Requisito, "numero">[] {
  const perfis = perfisDaEquipe(docs);
  const primeiro = perfis[0];
  if (!primeiro) return [];
  const n = perfis.length;
  return [
    {
      rotulo: `Equipe-chave (${n} ${n === 1 ? "perfil" : "perfis"})`,
      descricao: perfis.map((x) => x.papel).join("; "),
      pagina: primeiro.pagina,
      trecho: primeiro.descricao,
      origem: "codigo",
      tipo: "equipe",
      documento: primeiro.documento,
      perfis: perfis.map((x) => x.papel),
    },
  ];
}

// ---------- itens do objeto, levantamento e produtos nomeados (decisão 0054) ----------

interface LinhaDoDocumento {
  texto: string;
  pagina: number;
}

const linhasDoDocumento = (doc: DocumentoRfp): LinhaDoDocumento[] =>
  doc.paginas
    .filter((p) => p.origem !== "nao-verificavel")
    .flatMap((p) => p.texto.split("\n").map((texto) => ({ texto: texto.trim(), pagina: p.numero })));

const RE_ROMANO_NO_INICIO = /^([IVX]{1,5})\s*[.)–-]\s+(.+)$/;
const ROMANO: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
};
/** Frase que abre a lista do que a contratada deve fazer ("devendo, para tanto:", "compreenderão:"). */
const RE_ABRE_LISTA = /\b(?:devendo|devera|deverao|compreend\w*|consist\w*|abrang\w*|contempl\w*)\b[^.]*:$/;

/**
 * Os itens do objeto em algarismos romanos, logo depois da frase que abre a lista ("devendo, para tanto:"), que
 * pode passar para a página seguinte. Só a primeira lista do documento: as repetições mais adiante (o detalhamento
 * de cada item, os produtos que repetem os itens) não viram R de novo.
 */
function itensDoObjeto(doc: DocumentoRfp): Omit<Requisito, "numero">[] {
  const linhas = linhasDoDocumento(doc);
  // a primeira frase que abre lista e é seguida pelos itens I, II…; as que abrem outra coisa ("compreenderão:"
  // seguido de texto corrido) passam
  for (let abre = 0; abre < linhas.length; abre++) {
    if (!RE_ABRE_LISTA.test(tirarAcentos(linhas[abre]!.texto.toLowerCase()))) continue;
    const itens = itensDepoisDe(linhas, abre);
    if (itens.length >= 2)
      return itens.map((x) => ({
        rotulo: `Item ${x.romano} do objeto`,
        descricao: limparEspacos(x.texto).replace(/[;.]$/, ""),
        pagina: x.pagina,
        trecho: x.trecho,
        origem: "codigo" as const,
        tipo: "atividade" as const,
        documento: doc.rotulo,
      }));
  }
  return [];
}

function itensDepoisDe(
  linhas: LinhaDoDocumento[],
  abre: number,
): { romano: string; texto: string; pagina: number; trecho: string }[] {
  const itens: { romano: string; texto: string; pagina: number; trecho: string }[] = [];
  for (let i = abre + 1; i < linhas.length; i++) {
    const l = linhas[i]!;
    if (!l.texto) continue;
    const m = RE_ROMANO_NO_INICIO.exec(l.texto);
    if (m?.[1] && ROMANO[m[1]] === itens.length + 1) {
      itens.push({ romano: m[1], texto: m[2] ?? "", pagina: l.pagina, trecho: l.texto });
      continue;
    }
    // a lista acaba no primeiro título em caixa alta ou na primeira linha que não continua o item
    if (!itens.length || RE_TITULO_DE_SECAO.test(l.texto)) break;
    const ultimo = itens.at(-1)!;
    if (/[;.]$/.test(ultimo.texto)) break;
    ultimo.texto = `${ultimo.texto} ${l.texto}`;
  }
  return itens;
}

/**
 * O levantamento exigido ("Levantamento, análise e compilação de documentos…"), com a análise comparativa quando o
 * documento a pede ("análise comparativa com outras experiências").
 */
function levantamento(doc: DocumentoRfp): Omit<Requisito, "numero">[] {
  const linhas = linhasDoDocumento(doc);
  const k = linhas.findIndex((l) => /^levantamento\b/.test(normalizarTermo(l.texto)));
  if (k < 0) return [];
  let texto = linhas[k]!.texto;
  for (let i = k + 1; i < linhas.length && !/:\s*$/.test(texto) && texto.length < 300; i++)
    texto = `${texto} ${linhas[i]!.texto}`;
  texto = limparEspacos(texto.replace(/\s*como:?\s*$/, "").replace(/:\s*$/, ""));
  const comparativa = linhas.find((l) => /analise comparativa/.test(normalizarTermo(l.texto)));
  const extra = comparativa
    ? `; ${comparativa.texto.replace(/^.*?(an[aá]lise comparativa)/i, (_, a: string) => a.charAt(0).toUpperCase() + a.slice(1))}`
    : "";
  return [
    {
      rotulo: comparativa ? "Levantamento e análise comparativa" : "Levantamento",
      descricao: `${texto}${extra}`.replace(/[;.]$/, ""),
      pagina: linhas[k]!.pagina,
      trecho: linhas[k]!.texto,
      origem: "codigo",
      tipo: "atividade",
      documento: doc.rotulo,
    },
  ];
}

const RE_TITULO_PRODUTOS = /^(?:d[oa]s\s+)?(?:produtos|entregas|entregaveis)(?:\s+esperados)?\s*:?$/;
const RE_NOME_DE_PRODUTO =
  /^(?:relatorio|plano|documento|caderno|guia|estudo|mapa|painel|nota tecnica|manual|base de dados|modelo|sumario)\b/;

/**
 * Produtos nomeados numa seção "Dos produtos" ("Relatório de Diagnóstico Fiscal:", "• Relatório de …:"), quando o
 * documento não os numera ("Produto 1"). O nome é o que vem antes dos dois-pontos.
 */
function produtosNomeados(doc: DocumentoRfp): Omit<Requisito, "numero">[] {
  const linhas = linhasDoDocumento(doc);
  const ini = linhas.findIndex((l) => RE_TITULO_PRODUTOS.test(normalizarTermo(l.texto)));
  if (ini < 0) return [];
  const out: Omit<Requisito, "numero">[] = [];
  for (let i = ini + 1; i < linhas.length; i++) {
    const l = linhas[i]!;
    if (RE_TITULO_DE_SECAO.test(l.texto)) break;
    const sem = l.texto
      .replace(MARCA_DE_ITEM, "")
      .replace(/^[•·-]\s*/, "")
      .trim();
    const m = /^([^:]{8,120}):\s*(.*)$/.exec(sem);
    if (!m?.[1] || !RE_NOME_DE_PRODUTO.test(normalizarTermo(m[1]))) continue;
    const nome = limparEspacos(m[1]);
    const resto = limparEspacos(`${m[2] ?? ""} ${m[2] ? "" : (linhas[i + 1]?.texto ?? "")}`);
    out.push({
      rotulo: nome,
      descricao: resto ? `${nome}: ${resto}` : nome,
      pagina: l.pagina,
      trecho: l.texto,
      origem: "codigo",
      tipo: "produto",
      documento: doc.rotulo,
    });
  }
  return out;
}

// ---------- forma de entrega e sigilo (decisão 0054), no fim da lista ----------

const RE_ENTREGA_DIGITAL =
  /\b(?:entrega d[oa]s? (?:produtos|relatorios|documentos)|produtos)\b[^.;]{0,40}\b(?:por|em) (?:meio|formato|midia) digital\b/;
const RE_SIGILO =
  /segredos? comercia\w* e confidencia\w*|\bsigilo (?:e|das|sobre)\b|tratar como confidencia\w*/;
const RE_CESSAO =
  /\bpropriedade\b[^.;]{0,25}\bsobre\b[^.;]{0,15}\bprodutos\b|direitos? patrimonia\w* (?:de|sobre) todos|cessao (?:total )?dos direitos (?:patrimoniais|autorais) (?:sobre|dos) (?:os )?produtos/;

/** A frase a partir de "A entrega dos produtos…" (sem o título da seção que a frase pegou antes). */
const daEntrega = (frase: string) => {
  const i = frase.search(/(?:\bA\s+)?\bentrega\s+d[oa]s?\s+(?:produtos|relat|document)/i);
  const desde = (i > 0 ? frase.slice(i) : frase).trim();
  // só a frase da entrega, até o primeiro ponto e vírgula
  return desde.split(";")[0]!.trim();
};

function entregaESigilo(docs: DocumentoRfp[]): Omit<Requisito, "numero">[] {
  const out: Omit<Requisito, "numero">[] = [];
  const digital = localizarTodos(docs, RE_ENTREGA_DIGITAL)[0];
  if (digital)
    out.push({
      rotulo: "Entrega em meio digital",
      descricao: daEntrega(digital.frase),
      pagina: digital.pagina,
      trecho: daEntrega(digital.frase),
      origem: "codigo",
      tipo: "obrigacao",
      documento: digital.doc.rotulo,
    });
  const sigilo = localizarTodos(docs, RE_SIGILO)[0];
  const cessao = localizarTodos(docs, RE_CESSAO)[0];
  const primeiro = cessao ?? sigilo;
  if (primeiro)
    out.push({
      rotulo: sigilo && cessao ? "Sigilo e cessão dos produtos" : sigilo ? "Sigilo" : "Cessão dos produtos",
      descricao: [cessao?.frase, sigilo?.frase].filter(Boolean).join(" "),
      pagina: primeiro.pagina,
      trecho: primeiro.frase,
      origem: "codigo",
      tipo: "obrigacao",
      documento: primeiro.doc.rotulo,
    });
  return out;
}

const UNIDADES =
  "oficinas?|capacitac(?:ao|oes)|encontros?|turmas?|reunioes|reuniao|eventos?|seminarios?|workshops?|cursos?|palestras?|visitas?(?: tecnicas?)?|entrevistas?|questi(?:o)?narios(?: validos)?|horas(?:-aula| aula)|participantes|municipios|relatorios|audiencias(?: publicas)?|pessoas|vagas|atendimentos|cadernos(?: tematicos)?|publicacoes|videos|diagnosticos|estudos|pesquisas|grupos focais|rodas de conversa|servidores|profissionais|familias|criancas|adolescentes|mulheres|jovens|projetos?|propostas?";
// "até 15 (quinze) projetos", "01 (um) único projeto"
const RE_QUANTIDADE = new RegExp(
  `\\b(\\d{1,5})\\s*(?:\\(\\s*[a-z -]{2,40}\\)\\s*)?(?:unic[oa]s?\\s+)?(${UNIDADES})\\b`,
  "g",
);

const ACENTOS: [RegExp, string][] = [
  [/\bquesti(?:o)?narios\b/, "questionários"],
  [/\bvalidos\b/, "válidos"],
  [/\bcapacitac(?:ao|oes)\b/, "capacitações"],
  [/\breunioes\b/, "reuniões"],
  [/\breuniao\b/, "reunião"],
  [/\bseminarios?\b/, "seminários"],
  [/\btecnicas?\b/, "técnicas"],
  [/\bmunicipios\b/, "municípios"],
  [/\brelatorios\b/, "relatórios"],
  [/\baudiencias\b/, "audiências"],
  [/\bpublicas\b/, "públicas"],
  [/\bpublicacoes\b/, "publicações"],
  [/\bvideos\b/, "vídeos"],
  [/\bdiagnosticos\b/, "diagnósticos"],
  [/\bfamilias\b/, "famílias"],
  [/\bcriancas\b/, "crianças"],
  [/\btematicos\b/, "temáticos"],
];
function unidadeLegivel(u: string): string {
  return ACENTOS.reduce((t, [re, s]) => t.replace(re, s), u);
}

function quantidades(docs: DocumentoRfp[], mapa: MapaRfp): Omit<Requisito, "numero">[] {
  const faixas = faixasDoTema(mapa, "escopo", "objeto");
  if (!faixas) return [];
  const out: Omit<Requisito, "numero">[] = [];
  const vistos = new Set<string>();
  for (const l of localizarTodos(docs, RE_QUANTIDADE, faixas)) {
    const m = new RegExp(RE_QUANTIDADE.source).exec(l.termo);
    if (!m?.[1] || !m[2]) continue;
    const n = Number(m[1]);
    if (!n) continue;
    const antes = tirarAcentos(
      l.doc.paginas.find((p) => p.numero === l.pagina)?.texto.slice(Math.max(0, l.posicao - 12), l.posicao) ??
        "",
    );
    if (/(?:art\.?|§|lei|n[º°o.]|item|anexo|inciso)\s*$/.test(antes)) continue;
    // "01 Capacitação…" no começo da linha é número do item da tabela, não quantidade
    const pagina = l.doc.paginas.find((p) => p.numero === l.pagina)?.texto ?? "";
    const inicioDaLinha = pagina.lastIndexOf("\n", l.posicao - 1) + 1;
    if (m[1].startsWith("0") && !pagina.slice(inicioDaLinha, l.posicao).trim()) continue;
    const chave = `${n} ${m[2]}`;
    // "até 15 projetos" selecionados é o tamanho do chamamento, não entrega de quem executa (método, seção 3.1)
    if (/^(?:projetos?|propostas?)$/.test(m[2])) continue;
    // "cada proponente… apenas 01 projeto" é limite por proponente (condição), não quantidade a entregar
    if (vistos.has(chave) || RE_POR_PROPONENTE.test(normalizarTermo(l.frase))) continue;
    vistos.add(chave);
    out.push({
      // o nome é do código (com acento e sem o erro de digitação do documento); o trecho fica literal
      rotulo: `Quantidade: ${n} ${unidadeLegivel(m[2])}`,
      descricao: l.frase,
      pagina: l.pagina,
      trecho: l.frase,
      origem: "codigo",
      tipo: "quantidade",
      documento: l.doc.rotulo,
    });
  }
  return out.slice(0, 25);
}

const RE_LOCAL =
  /\b(?:local|locais) (?:de|da|do|das|dos) (?:execucao|prestacao|realizacao|entrega|atendimento)\b|\b(?:os servicos|as atividades) (?:serao|deverao ser) (?:prestad|executad|realizad)[oa]s (?:n[oa]s?|em)\b/;

function local(docs: DocumentoRfp[]): Omit<Requisito, "numero">[] {
  const out: Omit<Requisito, "numero">[] = [];
  const vistas = new Set<string>();
  for (const l of localizarTodos(docs, RE_LOCAL)) {
    const chave = normalizarTermo(l.frase).slice(0, 80);
    const pagina = l.doc.paginas.find((p) => p.numero === l.pagina)?.texto ?? "";
    // a vistoria "do local de execução" não diz onde o serviço é prestado; o campo do formulário em branco
    // ("Local de realização:  Horários:") é modelo a preencher
    if (
      ehCampoEmBranco(pagina, l.posicao) ||
      vistas.has(chave) ||
      l.frase.length < 25 ||
      /vistoria|avaliacao previa|desconhecimento|preposto/.test(normalizarTermo(l.frase))
    )
      continue;
    vistas.add(chave);
    out.push({
      rotulo: "Local",
      descricao: l.frase,
      pagina: l.pagina,
      trecho: l.frase,
      origem: "codigo",
      tipo: "local",
      documento: l.doc.rotulo,
    });
    if (out.length >= 3) break;
  }
  return out;
}

export const RE_POR_PROPONENTE =
  /\bcada (?:proponente|organizacao|osc|entidade|instituicao|licitante|participante)\b[^.;]{0,60}\b(?:apenas|somente|no maximo|ate|um unico|uma unica)\b/;

/**
 * Condições do objeto, com o rótulo: o que a proposta precisa respeitar sem ser produto, equipe ou número. O limite
 * por proponente (quem pode participar) e o prazo de execução (prazos) não são obrigação nem entrega: no método da
 * etapa 1 (decisão 0034) eles saem dos requisitos numerados e vão para a seção 1 e para os prazos.
 */
// o público-alvo descreve a quem o projeto atende: não é obrigação nem entrega (método da etapa 1, seção 3.2)
const CONDICOES: [string, RegExp][] = [
  [
    "Forma de execução",
    /\b(?:executad|realizad|desenvolvid|ofertad|prestad)[oa]s?\b[^.;]{0,60}\b(?:presencial|a distancia|remot[oa]|hibrid[oa]|on-?line)\b/,
  ],
  [
    "Acessibilidade",
    /\bacessibilidade\b[^.;]{0,80}\b(?:dev\w*|necessariamente|obrigatori\w*)\b|\b(?:dev\w*|necessariamente|obrigatori\w*)\b[^.;]{0,80}\bacessibilidade\b/,
  ],
];

/** Condições do objeto, nas seções de objeto e escopo (no documento inteiro, se o mapa não as achou). */
function condicoes(docs: DocumentoRfp[], mapa: MapaRfp): Omit<Requisito, "numero">[] {
  const faixas = faixasDoTema(mapa, "objeto", "escopo");
  const out: Omit<Requisito, "numero">[] = [];
  const frases = new Set<string>();
  for (const [rotulo, re] of CONDICOES) {
    const l = localizarTodos(docs, re, faixas).find((x) => {
      const pagina = x.doc.paginas.find((p) => p.numero === x.pagina)?.texto ?? "";
      const n = normalizarTermo(x.frase);
      // "poderá ser executado de forma presencial e/ou à distância" é faculdade, não obrigação
      const faculdade =
        /\bpoder(?:a|ao|ia)\b/.test(n) && !/\bdev(?:e|em|era|erao)\b|necessariamente|obrigatori/.test(n);
      return !ehCampoEmBranco(pagina, x.posicao) && !frases.has(n) && !faculdade;
    });
    if (!l) continue;
    frases.add(normalizarTermo(l.frase));
    out.push({
      rotulo,
      descricao: l.frase,
      pagina: l.pagina,
      trecho: l.frase,
      origem: "codigo",
      tipo: "condicao",
      documento: l.doc.rotulo,
    });
  }
  return out;
}

/**
 * Requisitos da RFP, numerados na ordem: produtos; quando o documento não numera os produtos, os itens do objeto, o
 * levantamento e os produtos nomeados; a equipe-chave; quantidades, local, condições do objeto, obrigações; e, no
 * fim, a forma de entrega e o sigilo com a cessão (o que já existia não muda de número).
 */
export function extrairRequisitosRfp(docs: DocumentoRfp[], mapa: MapaRfp): Requisito[] {
  const produtos = docs.flatMap((d) => {
    const numerados = extrairRequisitos(d.paginas).map((r) => ({
      ...r,
      documento: d.rotulo,
      tipo: "produto" as const,
    }));
    // sem "Produto 1": os itens do objeto, o levantamento e os produtos que o documento nomeia
    return numerados.length ? numerados : [...itensDoObjeto(d), ...levantamento(d), ...produtosNomeados(d)];
  });
  // o mesmo produto num anexo e no corpo vira um só
  const vistos = new Set<string>();
  const unicos = produtos.filter((r) => {
    if (vistos.has(r.rotulo)) return false;
    vistos.add(r.rotulo);
    return true;
  });
  const antes = [...unicos, ...equipe(docs), ...quantidades(docs, mapa), ...local(docs)];
  // a condição com a mesma frase de um requisito já listado ("os serviços serão prestados em formato remoto"
  // já é o Local) não entra de novo
  // repetida: 40 letras seguidas da frase da condição aparecem num requisito da mesma página
  const repetida = (r: Omit<Requisito, "numero">) => {
    const c = compactar(r.descricao);
    const pedacos: string[] = [];
    for (let i = 0; i + 40 <= c.length; i += 10) pedacos.push(c.slice(i, i + 40));
    return antes.some((x) => {
      const outro = compactar(x.descricao);
      return x.pagina === r.pagina && pedacos.some((p) => outro.includes(p));
    });
  };
  const comCondicoes = [...antes, ...condicoes(docs, mapa).filter((r) => !repetida(r))];
  // as obrigações específicas de quem executa (método da etapa 1, seção 3.2: cada R é uma obrigação ou entrega);
  // as genéricas ("observar a legislação") ficam só no cartão do tema
  const jaListadas = (r: Omit<Requisito, "numero">) => {
    const c = compactar(r.descricao).slice(0, 60);
    return comCondicoes.some((x) => x.pagina === r.pagina && compactar(x.descricao).includes(c));
  };
  const obrigacoes = extrairObrigacoes(docs, mapa)
    .filter(ehObrigacaoEspecifica)
    .map((o): Omit<Requisito, "numero"> => ({
      rotulo: NOME_TEMA_OBRIGACAO[o.tema],
      descricao: o.texto,
      pagina: o.origem.pagina,
      trecho: o.origem.trecho,
      origem: "codigo",
      tipo: "obrigacao",
      documento: o.origem.documento,
    }))
    .filter((r) => !jaListadas(r));
  const ate = [...comCondicoes, ...obrigacoes];
  const jaNaLista = (r: Omit<Requisito, "numero">) => {
    const c = compactar(r.trecho).slice(0, 50);
    return ate.some((x) => x.pagina === r.pagina && compactar(`${x.descricao} ${x.trecho}`).includes(c));
  };
  const todos = [...ate, ...entregaESigilo(docs).filter((r) => !jaNaLista(r))];
  return todos.map((r, i) => ({ ...r, numero: `R${String(i + 1).padStart(2, "0")}` }));
}
