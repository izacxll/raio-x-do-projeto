// Modelo neutro de documento exportável: o conteúdo fica separado da formatação.
// Cada formato (DOCX, PDF, XLSX) tem o seu montador, que recebe este modelo.
import type { Dossie, ItemRotulado } from "../dossie/esquema";
import { analisarRfp } from "../etapas/1-rfp/analisar-rfp";
import { nomeSugeridoNoCabecalho, sugerirNomeProjeto } from "../etapas/1-rfp/nome-do-projeto";
import { contarMarcas, type ContagemDeMarcas } from "./marcas";

export {
  legendaDasMarcas,
  MARCA_PENDENTE,
  MARCA_REDACAO,
  marcasDoItem,
  contarMarcas,
  type ContagemDeMarcas,
} from "./marcas";

/**
 * Sem nome dado pelo GP: o nome sugerido a partir da RFP, marcado como sugestão. Sem RFP no dossiê, "Projeto
 * sem nome".
 */
function nomeProvisorio(dossie: Dossie): string {
  if (!dossie.documentos.some((d) => d.papel === "rfp")) return "Projeto sem nome";
  const sugestao = sugerirNomeProjeto(analisarRfp(dossie.documentos));
  return sugestao ? nomeSugeridoNoCabecalho(sugestao) : "Projeto sem nome";
}

export const TEXTO_MINUTA =
  "Minuta — sugestões geradas por ferramenta, sujeitas à validação do Gerente do Projeto";

export interface Tabela {
  colunas: string[];
  linhas: string[][];
  /** Largura relativa de cada coluna (soma livre). */
  larguras?: number[];
  /** Legenda no padrão ("Tabela N.M – título"), centralizada abaixo da tabela (decisão 0089). */
  legenda?: string;
  /** Linhas que são faixa de grupo (uma célula, fundo azul-claro). */
  faixas?: number[];
  /** Colunas de barra do cronograma: célula "█" sai cheia de azul, sem texto. */
  barras?: boolean;
}

/**
 * Parte do documento (decisão 0084), sempre nesta ordem: a capa de decisão (página 1), os quadros (o resultado em forma
 * visual), o corpo (só o que é útil ao gestor) e o anexo (o processo, para auditoria). Cada parte começa numa página.
 */
export type ParteDoDocumento = "capa" | "quadros" | "corpo" | "anexo";
export const ORDEM_DAS_PARTES: ParteDoDocumento[] = ["capa", "quadros", "corpo", "anexo"];
export const TITULO_DO_ANEXO =
  "Anexo — registros completos e o processo (placar, segunda instância, rodadas e tokens), para auditoria";

/** Alerta da capa: "alto" muda preço, prazo, caixa, aceite ou quem executa; "medio" pede atenção. */
export interface Alerta {
  nivel: "alto" | "medio";
  texto: string;
}

/** Número-chave da capa (rótulo e valor, este sempre calculado pelo código ou tirado do documento). */
export interface NumeroChave {
  rotulo: string;
  valor: string;
}

export interface Secao {
  titulo: string;
  paragrafos?: string[];
  tabela?: Tabela;
  /** Sem a parte, a seção é do corpo. */
  parte?: ParteDoDocumento;
  alertas?: Alerta[];
  numeros?: NumeroChave[];
  /** Subtítulo (nível 2) dentro da seção anterior; sem ele, seção numerada (nível 1). */
  nivel?: 1 | 2;
  /** Quadro "Para o GP decidir" no início da seção (decisão 0089). */
  decisoes?: DecisaoNoQuadro[];
  /** Nota no início da seção ("conteúdo sugerido pelo PMO, salvo indicação de fonte"). */
  nota?: string;
  /** Parágrafo de abertura, antes do quadro de decisões e dos alertas. */
  abertura?: string;
  /**
   * Capítulo que começa numa página nova, para documentos com capítulos, como o material da comissão. Vale só no padrão
   * de apresentação (DOCX com `apresentacao`), na seção de nível 1 fora do anexo; o PDF e o DOCX simples a ignoram.
   * Sem ela, só a primeira seção de cada parte quebra a página.
   */
  novaPagina?: boolean;
}

/** Uma decisão do GP no quadro "Para o GP decidir": a decisão, as opções (quando houver) e o impacto. */
export interface DecisaoNoQuadro {
  decisao: string;
  opcoes?: string;
  /** O que a decisão mexe (caixa ou preço, prazo, aceite, quem executa); sem dimensão clara, fica sem impacto. */
  impacto?: string;
}

/** Número-chave da capa, em bloco grande (decisão 0089). */
export interface Destaque {
  valor: string;
  rotulo: string;
  explicacao?: string;
  /** O rótulo do número-chave que o bloco já mostra: a linha sai da tabela, sem repetir. */
  substitui?: string;
}

/** A capa do documento no padrão da FGV Projetos (decisão 0089). */
export interface CapaDoDocumento {
  /** O título do estudo (nome sugerido a partir do objeto, ou o que o GP deu). */
  titulo: string;
  contratante?: string;
  etapa: string;
  destaques: Destaque[];
  /** O resultado da etapa numa linha, abaixo dos blocos. */
  resumo?: string;
}

export interface DocumentoExportavel {
  titulo: string;
  subtitulo?: string;
  projeto: string;
  /** Enquanto houver item pendente, o cabeçalho de minuta continua (seção 2). */
  minuta: boolean;
  geradoEm: Date;
  versaoApp: string;
  versaoSkill: string;
  /** Modelo do Claude que fez a leitura da etapa, para o rodapé (decisão 0084). */
  modelo?: string;
  secoes: Secao[];
  /** Contagem das marcas dos itens; sem ela, a legenda não sai. */
  marcas?: ContagemDeMarcas;
  /** Com ela, o documento sai no padrão de apresentação da FGV Projetos: capa, sumário, seções numeradas (decisão 0089). */
  apresentacao?: CapaDoDocumento;
}

/** As seções agrupadas pela parte, na ordem das partes; a ordem dentro de cada parte é a de chegada. */
export function secoesPorParte(doc: DocumentoExportavel): { parte: ParteDoDocumento; secoes: Secao[] }[] {
  return ORDEM_DAS_PARTES.map((parte) => ({
    parte,
    secoes: doc.secoes.filter((s) => (s.parte ?? "corpo") === parte),
  })).filter((g) => g.secoes.length);
}

/**
 * O cabeçalho de minuta sai até o GP marcar todos os itens como revisados.
 * Sem nenhum item revisável, a decisão conservadora é manter o cabeçalho.
 */
export function precisaDeMinuta(itens: ItemRotulado[]): boolean {
  return itens.length === 0 || itens.some((i) => i.estado === "pendente");
}

/**
 * O modelo do Claude que fez a leitura da etapa, para o rodapé (decisão 0084): o guardado em cada passo (mais de um,
 * separados por vírgula); undefined sem leitura. O modelo da etapa no dossiê é o do seletor, para as próximas chamadas.
 */
export function modeloDaEtapa(dossie: Dossie, etapa: number): string | undefined {
  if (etapa === 1) return dossie.analiseRfp?.leituraPmo?.modelo;
  const dosPassos = (passos: ({ modelo: string } | undefined)[]) => {
    const modelos = [...new Set(passos.flatMap((x) => (x?.modelo ? [x.modelo] : [])))];
    return modelos.length ? modelos.join(", ") : undefined;
  };
  const p = dossie.proposta;
  if (etapa === 2) return dosPassos([p?.estrategia, p?.conteudo, p?.eap]);
  const t = dossie.tap;
  if (etapa === 3) return dosPassos([t?.tap, t?.premissas]);
  const g = dossie.pgp;
  if (etapa === 4)
    return dosPassos([g?.adaptacao, g?.escopo, g?.cronograma, g?.riscos, g?.planos, g?.execucao]);
  if (etapa === 5) return dossie.conferencia?.leituraPmo?.modelo;
  return undefined;
}

/** Campos do cabeçalho e do rodapé que vêm do dossiê: projeto, versões e, com a etapa, o modelo. */
export function camposDoDossie(dossie: Dossie, etapa?: number) {
  const modelo = etapa ? modeloDaEtapa(dossie, etapa) : undefined;
  return {
    projeto: dossie.projeto.nome.trim() || nomeProvisorio(dossie),
    versaoApp: dossie.versaoApp,
    versaoSkill: dossie.versaoSkill,
    ...(modelo ? { modelo } : {}),
  };
}

export function linhaDeVersoes(doc: DocumentoExportavel): string {
  const data = doc.geradoEm.toLocaleDateString("pt-BR");
  return `Raio-X do Projeto ${doc.versaoApp} · skill PMO ${doc.versaoSkill}${doc.modelo ? ` · modelo ${doc.modelo}` : ""} · gerado em ${data}`;
}

export function baixarArquivo(conteudo: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(conteudo);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** As marcas do documento: a contagem dada pelo montador ou a contada nos textos dos itens. */
export function marcasDoDocumento(doc: DocumentoExportavel): ContagemDeMarcas {
  return (
    doc.marcas ??
    contarMarcas(doc.secoes.flatMap((s) => [...(s.paragrafos ?? []), ...(s.tabela?.linhas.flat() ?? [])]))
  );
}
