// Requisitos numerados da RFP (etapa 1, passo 3): produtos e entregáveis, equipe mínima, quantidades, local e
// condições do objeto (público-alvo, limite por proponente, prazo e forma de execução, acessibilidade).
// Cada um ganha um número (R01, R02…) que acompanha o projeto até a conferência (etapa 5).
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
  /graduac|formacao|nivel superior|superior completo|experiencia|pos-graduac|especializac|mestrad|doutorad|registro no|anos de atuacao|curso superior|bacharel|licenciatura/;
const RE_PAGINA_DE_EQUIPE =
  /equipe[ -](?:tecnica|minima|chave|de trabalho|profissional|executora)|qualificacao (?:tecnica|profissional)|perfil profissional|perfis profissionais|profissionais (?:exigidos|minimos)/;

function equipe(docs: DocumentoRfp[]): Omit<Requisito, "numero">[] {
  const out: Omit<Requisito, "numero">[] = [];
  const vistos = new Set<string>();
  for (const doc of docs) {
    for (const p of doc.paginas) {
      if (p.origem === "nao-verificavel" || !RE_PAGINA_DE_EQUIPE.test(normalizarTermo(p.texto))) continue;
      const linhas = p.texto.split("\n");
      linhas.forEach((original, i) => {
        const limpa = limparEspacos(original.replace(/\t+/g, " "))
          .replace(/^(?:\d{1,2}(?:\.\d{1,2})*\.?|[a-z]\)|[IVX]{1,4}\s*[-–.)])\s*/, "")
          .replace(MARCA_DE_ITEM, "");
        const n = normalizarTermo(limpa);
        const m = RE_PAPEL.exec(n);
        if (!m?.[2] || limpa.length > 400) return;
        const junto = normalizarTermo(`${limpa} ${linhas[i + 1] ?? ""} ${linhas[i + 2] ?? ""}`);
        // "1 (um) Coordenador(a) Geral" (com a quantidade) vale sozinho; sem ela, precisa da qualificação perto
        if (!m[1] && !RE_QUALIFICACAO.test(junto)) return;
        // definição copiada da lei ("considera-se de notória especialização o profissional ou a empresa cujo
        // conceito…", art. 74, § 3º) não é equipe exigida
        if (/notoria especializacao|considera-se|para os fins desta lei|cujo conceito/.test(junto)) return;
        // o nome do papel: sem a quantidade na frente e sem a qualificação que vem depois
        const papel =
          limpa
            .replace(/^\d{1,2}\s*(?:\([^)]*\)\s*)?/, "")
            .split(/[:;,–—]|\s-\s|\s(?=formação|Formação|FORMAÇÃO|experiência|Experiência|com\s|que\s)/)[0]
            ?.trim()
            // até 80 caracteres, sem cortar palavra
            .replace(/^(.{0,80})(?:\s.*)?$/, "$1") || m[2];
        const chave = normalizarTermo(papel).replace(/[^a-z]/g, "");
        // o mesmo papel em outra tabela ("Coordenador(a) Geral trado", com a coluna vizinha colada) é repetição
        if ([...vistos].some((v) => v.startsWith(chave) || chave.startsWith(v))) return;
        vistos.add(chave);
        const seguinte = linhas[i + 1]?.trim() ?? "";
        const continua = /\w$|,$/.test(limpa) && seguinte && !RE_PAPEL.test(normalizarTermo(seguinte));
        const descricao = limparEspacos(`${limpa}${continua ? ` ${seguinte}` : ""}`).slice(0, 300);
        out.push({
          rotulo: `Equipe: ${papel.charAt(0).toUpperCase()}${papel.slice(1)}`,
          descricao,
          pagina: p.numero,
          trecho: descricao,
          origem: "codigo",
          tipo: "equipe",
          documento: doc.rotulo,
        });
      });
    }
  }
  return out.slice(0, 20);
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

/** Requisitos da RFP, numerados na ordem: produtos, equipe, quantidades, local, condições do objeto. */
export function extrairRequisitosRfp(docs: DocumentoRfp[], mapa: MapaRfp): Requisito[] {
  const produtos = docs.flatMap((d) =>
    extrairRequisitos(d.paginas).map((r) => ({ ...r, documento: d.rotulo, tipo: "produto" as const })),
  );
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
  const todos = [...comCondicoes, ...obrigacoes];
  return todos.map((r, i) => ({ ...r, numero: `R${String(i + 1).padStart(2, "0")}` }));
}
