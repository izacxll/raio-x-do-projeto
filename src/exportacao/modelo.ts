// Modelo neutro de documento exportável: o conteúdo fica separado da formatação.
// Cada formato (DOCX, PDF, XLSX) tem o seu montador, que recebe este modelo.
import { TEXTO_DEMONSTRACAO } from "../demonstracao/demonstracao";
import type { Dossie, ItemRotulado } from "../dossie/esquema";
import { analisarRfp } from "../etapas/1-rfp/analisar-rfp";
import { nomeSugeridoNoCabecalho, sugerirNomeProjeto } from "../etapas/1-rfp/nome-do-projeto";

export { TEXTO_DEMONSTRACAO };

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
}

export interface Secao {
  titulo: string;
  paragrafos?: string[];
  tabela?: Tabela;
}

export interface DocumentoExportavel {
  titulo: string;
  subtitulo?: string;
  projeto: string;
  /** Enquanto houver item pendente, o cabeçalho de minuta continua (seção 2). */
  minuta: boolean;
  /** Modo demonstração (decisão 0027): o cabeçalho diz que as respostas são gravadas, sem chamada à IA. */
  demonstracao?: boolean;
  geradoEm: Date;
  versaoApp: string;
  versaoSkill: string;
  secoes: Secao[];
}

/**
 * O cabeçalho de minuta sai até o GP marcar todos os itens como revisados.
 * Sem nenhum item revisável, a decisão conservadora é manter o cabeçalho.
 */
export function precisaDeMinuta(itens: ItemRotulado[]): boolean {
  return itens.length === 0 || itens.some((i) => i.estado === "pendente");
}

/** Campos do cabeçalho que vêm do dossiê: projeto, versões e o aviso de demonstração. */
export function camposDoDossie(dossie: Dossie) {
  return {
    projeto: dossie.projeto.nome.trim() || nomeProvisorio(dossie),
    versaoApp: dossie.versaoApp,
    versaoSkill: dossie.versaoSkill,
    demonstracao: Boolean(dossie.demonstracao),
  };
}

export function linhaDeVersoes(doc: DocumentoExportavel): string {
  const data = doc.geradoEm.toLocaleDateString("pt-BR");
  return `Raio-X do Projeto ${doc.versaoApp} · skill PMO ${doc.versaoSkill} · gerado em ${data}`;
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
