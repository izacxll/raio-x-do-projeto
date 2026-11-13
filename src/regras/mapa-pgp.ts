// Mapa do PGP (etapa 5, passo 1): onde está cada uma das 51 partes do plano (18 componentes e 33 documentos).
// O código propõe; o GP confirma ou corrige na tela, e só então a conferência roda. A gravidade depende deste mapa.
import type { PaginaLida } from "../dossie/esquema";
import type { Ficha } from "../dominio/fichas";
import { normalizarTermo, procurarSinais } from "./busca";

export type SituacaoProposta =
  /** Título próprio encontrado: a parte tem páginas. */
  | "titulo"
  /** Sem título próprio, mas a maior parte do conteúdo mínimo aparece no plano (parte fundida com outra). */
  | "conteudo"
  | "nao-localizada";

export interface ParteNoMapa {
  codigo: string;
  situacao: SituacaoProposta;
  /** Linha de título encontrada e a página. */
  titulo?: string;
  paginaInicial?: number;
  paginaFinal?: number;
  /** Posição do título no texto da página inicial. */
  posicaoTitulo?: number;
  /** Proporção dos itens conferíveis por código achados no plano inteiro (0 a 1). */
  cobertura: number;
}

/** Como o GP confirmou cada parte. */
export type SituacaoConfirmada = "presente" | "dispensada" | "nao-existe";

export interface ParteConfirmada {
  codigo: string;
  situacao: SituacaoConfirmada;
  /** Páginas da parte; sem elas, a parte está fundida com outra e é procurada no plano inteiro. */
  paginaInicial?: number;
  paginaFinal?: number;
  /** Posição do título na página inicial (vem do código; some se o GP mudar a página inicial). */
  posicaoTitulo?: number;
  justificativa?: string;
}

const MAX_TITULO = 110;
/** Linha de sumário: termina em número de página, com ou sem pontilhado. */
const LINHA_SUMARIO = /(\.{3,}|…{2,}|_{3,}|\s)\s*\d{1,3}\s*$/;
/** Numeração e prefixos que antecedem o nome da parte no título. */
const PREFIXO =
  /^(?:(?:\d{1,2}(?:\.\d{1,2}){0,3}\.?|[ivxlc]{1,5}[.)]|[a-z][.)]|anexo\s+[a-z0-9]{1,4}|apendice\s+[a-z0-9]{1,4}|secao\s+\d{1,2})\s*[-–—:.)]?\s*)+/;

export interface TituloEncontrado {
  codigo: string;
  pagina: number;
  linha: string;
  /** Posição da linha no texto da página. */
  posicao: number;
  /** Ordem do título no documento (página e posição). */
  ordem: number;
}

function nomesDaParte(f: Ficha): string[] {
  return [f.nome, ...f.sinonimos].map(normalizarTermo).filter((n) => n.length >= 4);
}

/** Títulos de partes do PGP encontrados no texto, fora do sumário. */
export function encontrarTitulos(paginas: PaginaLida[], partes: Ficha[]): TituloEncontrado[] {
  const nomes = partes.map((p) => ({ codigo: p.codigo, nomes: nomesDaParte(p) }));
  const achados: TituloEncontrado[] = [];
  for (const p of paginas) {
    const linhas = p.texto.split(/\r?\n/);
    const sumario = linhas.filter((l) => LINHA_SUMARIO.test(l.trim()) && l.trim().length < 140).length >= 5;
    let posicao = -1;
    linhas.forEach((original) => {
      posicao += 1;
      const inicio = posicao;
      posicao += original.length;
      const linha = original.replace(/\t+/g, " ").trim();
      if (!linha || linha.length > MAX_TITULO) return;
      if (sumario && LINHA_SUMARIO.test(linha)) return;
      const n = normalizarTermo(linha).replace(PREFIXO, "").replace(/[:.]$/, "").trim();
      if (!n) return;
      let melhor: { codigo: string; tamanho: number } | null = null;
      for (const parte of nomes) {
        for (const nome of parte.nomes) {
          // o título começa pelo nome da parte e o nome é a maior parte da linha
          if (!n.startsWith(nome)) continue;
          const resto = n.slice(nome.length);
          if (resto && /^[a-z0-9]/.test(resto)) continue;
          if (nome.length < n.length * 0.5) continue;
          if (!melhor || nome.length > melhor.tamanho)
            melhor = { codigo: parte.codigo, tamanho: nome.length };
        }
      }
      if (melhor) {
        achados.push({
          codigo: melhor.codigo,
          pagina: p.numero,
          linha,
          posicao: inicio,
          ordem: p.numero * 1e6 + inicio,
        });
      }
    });
  }
  return achados.sort((a, b) => a.ordem - b.ordem);
}

/** Proporção dos itens conferíveis por código cujos termos aparecem no plano. */
export function coberturaDaParte(paginas: PaginaLida[], parte: Ficha): number {
  const itens = parte.itens.filter((i) => i.confere === "código" && (i.termos.length || i.compostos.length));
  if (!itens.length) return 0;
  const achados = itens.filter((i) => procurarSinais(paginas, i) !== undefined).length;
  return achados / itens.length;
}

/** Proposta do código para o mapa. */
export function proporMapa(paginas: PaginaLida[], partes: Ficha[]): ParteNoMapa[] {
  const titulos = encontrarTitulos(paginas, partes);
  // a primeira ocorrência de cada parte manda; as seguintes (citações em outros títulos) são ignoradas
  const primeiros = new Map<string, TituloEncontrado>();
  for (const t of titulos) if (!primeiros.has(t.codigo)) primeiros.set(t.codigo, t);
  const ordenados = [...primeiros.values()].sort((a, b) => a.ordem - b.ordem);
  const ultimaPagina = paginas.length ? Math.max(...paginas.map((p) => p.numero)) : 0;

  return partes.map((parte) => {
    const t = primeiros.get(parte.codigo);
    const cobertura = coberturaDaParte(paginas, parte);
    if (t) {
      const proximo = ordenados.find((o) => o.ordem > t.ordem);
      const fim = proximo ? Math.max(t.pagina, proximo.pagina) : ultimaPagina;
      return {
        codigo: parte.codigo,
        situacao: "titulo",
        titulo: t.linha,
        paginaInicial: t.pagina,
        paginaFinal: fim,
        posicaoTitulo: t.posicao,
        cobertura,
      };
    }
    return { codigo: parte.codigo, situacao: cobertura >= 0.5 ? "conteudo" : "nao-localizada", cobertura };
  });
}

/** Confirmação padrão (o que a tela mostra antes de o GP mexer). */
export function confirmacaoInicial(mapa: ParteNoMapa[]): ParteConfirmada[] {
  return mapa.map((m) => ({
    codigo: m.codigo,
    situacao: m.situacao === "nao-localizada" ? "nao-existe" : "presente",
    paginaInicial: m.paginaInicial,
    paginaFinal: m.paginaFinal,
    posicaoTitulo: m.posicaoTitulo,
  }));
}

/** Páginas de uma parte confirmada, ou undefined se ela não tem páginas próprias. */
export function paginasDaParte(p: ParteConfirmada | undefined): Set<number> | undefined {
  if (!p || p.situacao !== "presente" || !p.paginaInicial) return undefined;
  const fim = Math.max(p.paginaInicial, p.paginaFinal ?? p.paginaInicial);
  return new Set(Array.from({ length: fim - p.paginaInicial + 1 }, (_, i) => (p.paginaInicial ?? 0) + i));
}

/**
 * Parte do plano onde está um ponto do texto (página e posição): a de título mais próximo antes dele.
 * Ponto antes de todas as partes (capa, introdução) fica sem parte.
 */
export function parteDaPosicao(
  pagina: number,
  posicao: number,
  confirmadas: ParteConfirmada[],
): string | undefined {
  let melhor: { codigo: string; chave: number } | undefined;
  for (const p of confirmadas) {
    if (p.situacao !== "presente" || !p.paginaInicial) continue;
    const fim = Math.max(p.paginaInicial, p.paginaFinal ?? p.paginaInicial);
    if (pagina < p.paginaInicial || pagina > fim) continue;
    const inicio = p.paginaInicial === pagina ? (p.posicaoTitulo ?? 0) : -1;
    if (p.paginaInicial === pagina && inicio > posicao) continue;
    const chave = p.paginaInicial * 1e6 + Math.max(inicio, 0);
    if (!melhor || chave > melhor.chave) melhor = { codigo: p.codigo, chave };
  }
  return melhor?.codigo;
}
