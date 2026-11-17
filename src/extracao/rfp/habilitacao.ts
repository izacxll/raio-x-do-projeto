// Habilitação (etapa 1, passo 6): os documentos exigidos, transformados em checklist. O catálogo segue os
// grupos da Lei 14.133/2021 (arts. 62 a 70) e o que a Lei 13.019/2014 pede às organizações da sociedade civil.
// Item do catálogo que o código não acha não entra na lista: não achado não é ausente (o resumo avisa).
import { tirarAcentos } from "../../texto/normalizar";
import { type DocumentoRfp, type ItemAnalise } from "./item";
import { localizarTodos, origemDe, type Localizado } from "./localizar";
import { faixasDoTema, secaoDaPosicao, type MapaRfp, type TemaSecao } from "./mapa";

export type GrupoHabilitacao =
  | "Jurídica"
  | "Fiscal, social e trabalhista"
  | "Econômico-financeira"
  | "Técnica"
  | "Declarações"
  | "Organização da sociedade civil";

interface DocumentoExigivel {
  id: string;
  grupo: GrupoHabilitacao;
  nome: string;
  re: RegExp;
}

/** Expressões sobre o texto sem acento. */
export const CATALOGO_HABILITACAO: DocumentoExigivel[] = [
  {
    id: "ato-constitutivo",
    grupo: "Jurídica",
    nome: "Ato constitutivo, estatuto ou contrato social",
    re: /\b(?:ato constitutivo|contrato social|estatuto social)\b/,
  },
  {
    id: "registro-comercial",
    grupo: "Jurídica",
    nome: "Registro comercial ou inscrição do empresário",
    re: /\bregistro comercial\b|\binscricao (?:do ato constitutivo|no registro publico de empresas)\b/,
  },
  {
    id: "mei",
    grupo: "Jurídica",
    nome: "Certificado da condição de microempreendedor individual",
    re: /\bccmei\b|\bcertificado da condicao de microempreendedor\b/,
  },
  {
    id: "cnpj",
    grupo: "Fiscal, social e trabalhista",
    nome: "Inscrição no CNPJ",
    re: /\binscricao no cadastro nacional (?:de|da) pessoa juridica\b|\bprova de inscricao no cnpj\b|\binscricao no cnpj\b/,
  },
  {
    id: "cadastro-contribuintes",
    grupo: "Fiscal, social e trabalhista",
    nome: "Inscrição no cadastro de contribuintes estadual ou municipal",
    re: /\bcadastro de contribuintes (?:estadual|municipal|distrital)\b/,
  },
  {
    id: "fazenda-federal",
    grupo: "Fiscal, social e trabalhista",
    nome: "Regularidade com a Fazenda Federal e a Dívida Ativa da União",
    re: /\bfazenda federal\b|\bdivida ativa da uniao\b|\bcertidao conjunta\b/,
  },
  {
    id: "fazenda-estadual",
    grupo: "Fiscal, social e trabalhista",
    nome: "Regularidade com a Fazenda Estadual",
    re: /\bfazenda (?:publica )?estadual\b|\bfazenda (?:publica )?distrital\b/,
  },
  {
    id: "fazenda-municipal",
    grupo: "Fiscal, social e trabalhista",
    nome: "Regularidade com a Fazenda Municipal",
    // "Certidão Negativa de Tributos Mobiliários relativos ao Município" é a regularidade municipal
    re: /\bfazenda (?:publica )?municipal\b|\btributos (?:mobiliarios|municipais)\b|\bdebitos (?:tributarios )?(?:municipais|com o municipio)\b/,
  },
  {
    id: "fgts",
    grupo: "Fiscal, social e trabalhista",
    nome: "Regularidade com o FGTS (CRF)",
    re: /\bfgts\b|\bfundo de garantia do tempo de servico\b/,
  },
  {
    id: "cndt",
    grupo: "Fiscal, social e trabalhista",
    nome: "Certidão negativa de débitos trabalhistas (CNDT)",
    re: /\bcndt\b|\bdebitos trabalhistas\b/,
  },
  {
    id: "falencia",
    grupo: "Econômico-financeira",
    nome: "Certidão negativa de falência ou recuperação judicial",
    re: /\bfalencia\b|\brecuperacao judicial\b/,
  },
  {
    id: "balanco",
    grupo: "Econômico-financeira",
    nome: "Balanço patrimonial e demonstrações contábeis",
    re: /\bbalanco patrimonial\b|\bdemonstracoes contabeis\b/,
  },
  {
    id: "indices",
    grupo: "Econômico-financeira",
    nome: "Índices de liquidez e solvência",
    re: /\bliquidez (?:geral|corrente)\b|\bsolvencia geral\b|\bindices? contabe/,
  },
  {
    id: "capital-minimo",
    grupo: "Econômico-financeira",
    nome: "Capital social ou patrimônio líquido mínimo",
    re: /\b(?:capital social|patrimonio liquido) (?:minimo|equivalente|de no minimo|nao inferior)\b/,
  },
  {
    id: "atestado",
    grupo: "Técnica",
    nome: "Atestado de capacidade técnica",
    re: /\batestados? de capacidade tecnic|\batestados? (?:de|que comprovem?) (?:aptidao|experiencia)|\bcapacidade tecnic[oa][- ]operacional\b/,
  },
  {
    id: "registro-conselho",
    grupo: "Técnica",
    nome: "Registro em conselho profissional",
    re: /\bregistro (?:ou inscricao )?(?:n[ao] )?(?:entidade profissional|conselho)\b|\b(?:crea|cau|cra|crc|crp|cress|oab)\b/,
  },
  {
    id: "acervo",
    grupo: "Técnica",
    nome: "Certidão de acervo técnico (CAT)",
    re: /\bacervo tecnico\b|\bcat\b(?= |,|\.|\))/,
  },
  {
    id: "responsavel-tecnico",
    grupo: "Técnica",
    nome: "Profissional responsável técnico ou do quadro",
    re: /\bresponsavel tecnico\b|\bcapacidade tecnic[oa][- ]profissional\b|\bquadro permanente\b/,
  },
  {
    id: "equipe",
    grupo: "Técnica",
    nome: "Indicação ou declaração de disponibilidade da equipe",
    re: /\bdeclaracao de disponibilidade\b|\bindicacao (?:do pessoal|da equipe)\b|\brelacao (?:nominal )?da equipe\b/,
  },
  {
    id: "vistoria",
    grupo: "Técnica",
    nome: "Vistoria ou visita técnica",
    re: /\bvistoria\b|\bvisita tecnica\b/,
  },
  {
    id: "menor",
    grupo: "Declarações",
    nome: "Declaração de que não emprega menor (art. 7º, XXXIII, da Constituição)",
    re: /\bmenor(?:es)? de (?:dezoito|18)\b|\btrabalho (?:noturno, perigoso ou insalubre|infantil)\b|\bnao emprega(?:r)? menor\b/,
  },
  {
    id: "pcd",
    grupo: "Declarações",
    nome: "Declaração de reserva de cargos para pessoa com deficiência",
    // a declaração é a da reserva de cargos (Lei 14.133/2021, art. 63, IV), não qualquer menção a pessoa com
    // deficiência: o objeto pode ser sobre elas
    re: /\breserva de cargos\b|\bcargos? (?:para|a|destinad\w+ a) pessoas? com deficiencia\b|\breabilitad[oa]s? da previdencia\b/,
  },
  {
    id: "cumpre-requisitos",
    grupo: "Declarações",
    nome: "Declaração de que cumpre os requisitos de habilitação",
    re: /\bdeclaracao de que atende aos requisitos de habilitacao\b|\bcumprimento (?:dos|de) requisitos de habilitacao\b|\bcumpre (?:plenamente )?os requisitos de habilitacao\b/,
  },
  {
    id: "me-epp",
    grupo: "Declarações",
    nome: "Declaração de microempresa ou empresa de pequeno porte",
    re: /\bdeclaracao (?:de )?(?:enquadramento|me\/epp|de microempresa)\b|\bbeneficiaria da (?:lc|lei complementar)\b/,
  },
  {
    id: "impeditivo",
    grupo: "Declarações",
    nome: "Declaração de inexistência de fato impeditivo",
    re: /\bfato(?:s)? (?:superveniente|impeditivo)\b/,
  },
  {
    id: "trabalho-escravo",
    grupo: "Declarações",
    nome: "Declaração de inexistência de trabalho escravo ou degradante",
    re: /\btrabalho (?:escravo|forcado|degradante)\b|\banalogas? as? de escravo\b/,
  },
  {
    id: "custos-trabalhistas",
    grupo: "Declarações",
    nome: "Declaração de que a proposta cobre os custos trabalhistas",
    re: /\bpropostas? economicas? compreendem a integralidade dos custos\b|\bintegralidade dos custos para atendimento dos direitos trabalhistas\b/,
  },
  {
    id: "osc-existencia",
    grupo: "Organização da sociedade civil",
    nome: "Tempo mínimo de existência da organização (CNPJ)",
    re: /\b(?:no minimo|pelo menos|minimo de) (?:\d|um|dois|tres) (?:\([a-z]+\) )?anos? de existencia\b|\banos? de existencia\b/,
  },
  {
    id: "osc-experiencia",
    grupo: "Organização da sociedade civil",
    nome: "Experiência prévia no objeto da parceria",
    re: /\bexperiencia previa\b/,
  },
  {
    id: "osc-dirigentes",
    grupo: "Organização da sociedade civil",
    nome: "Relação dos dirigentes e ata de eleição",
    re: /\brelacao nominal (?:atualizada )?dos dirigentes\b|\bata de eleicao\b/,
  },
  {
    id: "osc-estatuto",
    grupo: "Organização da sociedade civil",
    nome: "Estatuto com objetivos de relevância pública e destinação do patrimônio",
    re: /\brelevancia publica e social\b|\bpatrimonio liquido (?:seja |sera )?transferido\b/,
  },
];

const TEMAS_DA_LISTA: TemaSecao[] = ["habilitacao", "participacao"];

/**
 * Numa lista numerada sem ponto final entre os itens ("…?validar=form 10 Estatuto Social…"), o trecho começa no
 * número do item que contém o documento, não no item anterior.
 */
function itemDaLista(frase: string, termo: string): string {
  const k = tirarAcentos(frase).indexOf(termo);
  if (k <= 0) return frase;
  const inicios = [...frase.matchAll(/(?:^|\s)(\d{1,2})\s+(?=[A-ZÀ-Ý])/g)].filter((m) => (m.index ?? 0) < k);
  const ultimo = inicios.at(-1);
  if (!ultimo?.index) return frase;
  return frase.slice(ultimo.index).trim();
}

/**
 * O trecho está na lista de documentos: dentro de uma seção de habilitação ou de participação, do título até o
 * título seguinte (não só na mesma página: a página pode ter o fim de outra seção, como a justificativa).
 */
function naListaDeDocumentos(mapa: MapaRfp, l: Localizado): boolean {
  const s = secaoDaPosicao(mapa, l.doc.id, l.pagina, l.posicao);
  return Boolean(s?.tema && TEMAS_DA_LISTA.includes(s.tema));
}

const RE_EXIGENCIA_DE_PERFIL =
  /formacao academica|\bgraduacao em\b|\bgraduado em\b|\bperfil\b|anos de experiencia|experiencia (?:pratica|profissional)|pos-graduacao/;

export function extrairHabilitacao(docs: DocumentoRfp[], mapa: MapaRfp): ItemAnalise[] {
  const faixas = faixasDoTema(mapa, ...TEMAS_DA_LISTA);
  const itens: ItemAnalise[] = [];
  for (const d of CATALOGO_HABILITACAO) {
    // com seção de habilitação no mapa, só vale o trecho dentro dela: a cláusula da minuta que fala da
    // "Fazenda Municipal" ou a justificativa que fala de "pessoa com deficiência" não são a lista de documentos.
    // Sem seção no mapa, procura no documento inteiro e avisa.
    // o registro em conselho pedido a um perfil da equipe ("formação acadêmica em contabilidade, com inscrição no
    // conselho") é exigência do perfil, não documento de habilitação da empresa
    const todas = localizarTodos(docs, d.re).filter(
      (x) =>
        d.id !== "registro-conselho" || !RE_EXIGENCIA_DE_PERFIL.test(tirarAcentos(x.frase.toLowerCase())),
    );
    const l = faixas ? todas.find((x) => naListaDeDocumentos(mapa, x)) : todas[0];
    if (!l) continue;
    const vezes = todas.length;
    const trecho = itemDaLista(l.frase, l.termo);
    itens.push({
      id: `habilitacao:${d.id}`,
      secao: "habilitacao",
      rotulo: "documento",
      nome: d.nome,
      texto: trecho,
      campos: { Grupo: d.grupo, Citações: String(vezes) },
      origem: origemDe(l, trecho),
      situacao: "localizado",
      nota: faixas
        ? undefined
        : "O mapa não achou a seção de habilitação: trecho procurado no documento inteiro, conferir se é exigência.",
    });
  }
  return itens;
}
