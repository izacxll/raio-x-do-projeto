// Habilitação (etapa 1, passo 6): os documentos exigidos, transformados em checklist. O catálogo segue os
// grupos da Lei 14.133/2021 (arts. 62 a 70) e o que a Lei 13.019/2014 pede às organizações da sociedade civil.
// Item do catálogo que o código não acha não entra na lista: não achado não é ausente (o resumo avisa).
import { type DocumentoRfp, type ItemAnalise } from "./item";
import { localizarPrimeiro, localizarTodos, origemDe } from "./localizar";
import { faixasDoTema, type MapaRfp } from "./mapa";

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
    re: /\bfazenda (?:publica )?municipal\b/,
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
    re: /\breserva de cargos\b|\bpessoa com deficiencia\b/,
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
    re: /\brelevancia publica e social\b|\bpatrimonio liquido (?:seja )?transferido\b/,
  },
];

export function extrairHabilitacao(docs: DocumentoRfp[], mapa: MapaRfp): ItemAnalise[] {
  const faixas = faixasDoTema(mapa, "habilitacao", "participacao");
  const itens: ItemAnalise[] = [];
  for (const d of CATALOGO_HABILITACAO) {
    // primeiro nas seções de habilitação; se não houver, no documento inteiro
    const l = (faixas && localizarPrimeiro(docs, d.re, faixas)) ?? localizarPrimeiro(docs, d.re);
    if (!l) continue;
    const vezes = localizarTodos(docs, d.re).length;
    itens.push({
      id: `habilitacao:${d.id}`,
      secao: "habilitacao",
      rotulo: "documento",
      nome: d.nome,
      texto: l.frase,
      campos: { Grupo: d.grupo, Citações: String(vezes) },
      origem: origemDe(l),
      situacao: "localizado",
      nota:
        faixas && !faixas.get(l.doc.id)?.has(l.pagina)
          ? "Citado fora da seção de habilitação: conferir se é exigência."
          : undefined,
    });
  }
  return itens;
}
