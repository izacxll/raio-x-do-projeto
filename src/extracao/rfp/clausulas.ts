// Cláusulas da RFP: o texto de cada página partido nos itens numerados ("7.1", "a)", "1 Comprovante…") e nos
// parágrafos, com a página, a posição e a seção do mapa em que cada um fica. Base das regras do método da etapa 1
// (obrigações da contratada, dinheiro, documentação linha a linha): elas leem a cláusula, não a frase solta, e
// sabem se a cláusula é do certame ou da execução e se a página é um modelo a preencher.
import { limparEspacos } from "../../texto/frase";
import { tirarAcentos } from "../../texto/normalizar";
import type { DocumentoRfp } from "./item";
import { secaoDaPosicao, type MapaRfp, type SecaoRfp } from "./mapa";

export interface Clausula {
  doc: DocumentoRfp;
  pagina: number;
  /** Posição do começo da cláusula no texto da página. */
  posicao: number;
  /** "7.1", "a)", "12" ou vazio (parágrafo sem número). */
  numero: string;
  /** Texto da cláusula na página, com acentos e os espaços colapsados (sem atravessar a página). */
  texto: string;
  /** O mesmo texto sem acento e em minúsculas, para as expressões (mesmo comprimento que `texto`). */
  normal: string;
  /** O resto da cláusula na página seguinte, quando ela atravessa a quebra ("apresentar compro-" + "vante…"). */
  continuacao?: string;
  secao?: SecaoRfp;
  /** A cláusula fica num anexo (termo de referência, minuta). */
  noAnexo: boolean;
  /** A página é um modelo ou formulário a preencher (declaração, ficha de avaliação, autorização). */
  noModelo: boolean;
}

/**
 * Começo de item: "7.1", "7.1.2.", "12.", "a)", "IV -", "1 Comprovante" (lista numerada sem ponto). O número
 * termina em espaço ou no fim da linha: "57.575/2016." no começo da linha é o fim de "Decreto nº" da linha de
 * cima, não um item novo.
 */
const RE_INICIO =
  /^(?:(\d{1,2}(?:\.\d{1,2}){1,4}\.?)(?=\s|$)|(\d{1,2}[.)])(?=\s|$)|([a-z]\))|([IVX]{1,5}\s*[-–.)])|(\d{1,2})(?=\s+[A-ZÀ-Ý]))\s*/;
const RE_TITULO = /^(?:CL[AÁ]USULA|ANEXO|CAP[IÍ]TULO|SE[CÇ][AÃ]O)\b/;

/**
 * Página de modelo a preencher: título "MODELO" no começo, campos de marcar ("( )"), linhas para preencher
 * ("____") ou marcas como "(Nome do Órgão…)". O que está nela não é obrigação nem ponto de atenção do edital.
 */
export function ehPaginaDeModelo(texto: string): boolean {
  const inicio = tirarAcentos(texto.slice(0, 400));
  if (/\bmodelo\b/.test(inicio) && !/\bmodelo de (?:gestao|execucao|contratacao)\b/.test(inicio)) return true;
  const marcar = (texto.match(/\(\s{0,2}\)/g) ?? []).length;
  const linhas = (texto.match(/_{4,}/g) ?? []).length;
  const campos = (
    texto.match(/\((?:nome|n[ºo°]|cpf|cnpj|endere[cç]o|cargo|data|local)\b[^)]{0,40}\)/gi) ?? []
  ).length;
  return marcar >= 2 || linhas >= 3 || campos >= 2;
}

const cache = new WeakMap<DocumentoRfp, { mapa: MapaRfp; clausulas: Clausula[] }>();

/** As cláusulas de todos os documentos, na ordem do texto. */
export function lerClausulas(docs: DocumentoRfp[], mapa: MapaRfp): Clausula[] {
  return docs.flatMap((d) => clausulasDoDocumento(d, mapa));
}

function clausulasDoDocumento(doc: DocumentoRfp, mapa: MapaRfp): Clausula[] {
  const guardado = cache.get(doc);
  if (guardado && guardado.mapa === mapa) return guardado.clausulas;
  const out: Clausula[] = [];
  const inicioAnexos = mapa.inicioAnexos.get(doc.id) ?? Infinity;
  for (const p of doc.paginas) {
    if (p.origem === "nao-verificavel" || !p.texto.trim()) continue;
    const noModelo = ehPaginaDeModelo(p.texto);
    const daPagina: Clausula[] = [];
    let atual: { posicao: number; numero: string; linhas: string[] } | undefined;
    const fechar = () => {
      if (!atual) return;
      const texto = limparEspacos(atual.linhas.join(" "));
      if (texto.length >= 12)
        daPagina.push({
          doc,
          pagina: p.numero,
          posicao: atual.posicao,
          numero: atual.numero,
          texto,
          normal: tirarAcentos(texto),
          secao: secaoDaPosicao(mapa, doc.id, p.numero, atual.posicao),
          noAnexo: p.numero >= inicioAnexos,
          noModelo,
        });
      atual = undefined;
    };
    let posicao = 0;
    let anterior = "";
    for (const linha of p.texto.split("\n")) {
      const limpa = linha.trim();
      const m = RE_INICIO.exec(limpa);
      // linha curta sem ponto final fecha o parágrafo (título, célula de tabela)
      const titulo =
        RE_TITULO.test(limpa) ||
        (limpa.length > 0 && limpa.length < 50 && limpa === limpa.toUpperCase() && /[A-ZÀ-Ý]{4}/.test(limpa));
      // parágrafo sem número termina no ponto final (ou ponto e vírgula) quando a linha seguinte começa com
      // maiúscula: sem isto, a página inteira vira uma "cláusula" só
      const fimDeParagrafo = /[.;:]$/.test(anterior) && /^[A-ZÀ-Ý]/.test(limpa);
      if (m || titulo || fimDeParagrafo || !atual) {
        fechar();
        if (limpa)
          atual = {
            posicao,
            numero: (m?.[1] ?? m?.[2] ?? m?.[3] ?? m?.[4] ?? m?.[5] ?? "").trim(),
            linhas: [limpa],
          };
        if (titulo) fechar();
      } else if (limpa) atual.linhas.push(limpa);
      if (limpa) anterior = limpa;
      posicao += linha.length + 1;
    }
    fechar();
    // a última cláusula da página anterior que termina sem pontuação continua no começo desta página
    const ultima = out.at(-1);
    const primeira = daPagina[0];
    if (
      ultima &&
      primeira &&
      ultima.pagina === p.numero - 1 &&
      !primeira.numero &&
      /[-a-zà-ÿ,]$/.test(ultima.texto)
    )
      ultima.continuacao = primeira.texto;
    out.push(...daPagina);
  }
  cache.set(doc, { mapa, clausulas: out });
  return out;
}

/** Trecho literal da cláusula para citar: até `maximo` caracteres, sem cortar palavra. */
export function trechoDaClausula(c: Clausula, maximo = 320): string {
  if (c.texto.length <= maximo) return c.texto;
  const corte = c.texto.lastIndexOf(" ", maximo);
  return `${c.texto.slice(0, corte > 40 ? corte : maximo)}…`;
}

/**
 * Trecho literal em volta do que casou (a frase que contém o padrão), para a cláusula longa: o trecho mostrado
 * sempre contém o que fez a regra disparar. Sem o padrão na cláusula, o começo dela.
 */
export function trechoEmVolta(c: Clausula, re: RegExp, maximo = 320): string {
  const m = new RegExp(re.source, re.flags.replace("g", "")).exec(c.normal);
  if (!m || c.texto.length <= maximo) return trechoDaClausula(c, maximo);
  // a frase: do último ". " antes do padrão até o próximo ". " depois dele
  const antes = Math.max(c.texto.lastIndexOf(". ", m.index), c.texto.lastIndexOf("; ", m.index));
  const ini = antes < 0 ? 0 : antes + 2;
  const depois = c.texto.slice(m.index + m[0].length).search(/[.;](?:\s|$)/);
  const fim = depois < 0 ? c.texto.length : m.index + m[0].length + depois + 1;
  const frase = c.texto.slice(ini, fim).trim();
  if (frase.length <= maximo) return frase;
  // frase longa demais: uma janela em volta do padrão, sem cortar palavra
  const de = Math.max(ini, m.index - 120);
  const ate = Math.min(fim, de + maximo);
  const recorte = c.texto.slice(de, ate);
  const a = de > ini ? recorte.indexOf(" ") + 1 : 0;
  const b = ate < fim ? recorte.lastIndexOf(" ") : recorte.length;
  return `${de > ini ? "…" : ""}${recorte.slice(a, b > a ? b : recorte.length).trim()}${ate < fim ? "…" : ""}`;
}

/** Temas do mapa que são do certame (proposta, julgamento, habilitação): o que vale só até a assinatura. */
export const TEMAS_DO_CERTAME = new Set([
  "participacao",
  "esclarecimento",
  "proposta",
  "julgamento",
  "habilitacao",
  "recursos",
]);

/** Vocabulário do certame: a cláusula que fala dele é da disputa, mesmo dentro de um anexo. */
const RE_VOCABULARIO_DO_CERTAME =
  /\b(?:licitantes?|proponentes?|propostas? (?:tecnicas?|de precos?|comerciais?)|as propostas|homologa\w*|adjudica\w*|lances?|sessao publica|envelopes?|antes da (?:assinatura|celebracao)|para (?:a )?assinatura do contrato|certame|curriculos? (?:dos?|das?) profissionais|cadastro de fornecedores|credenciamento)\b/;
/** Quem executa no presente da execução: a contratada, a parceira, a OSC já selecionada. */
const RE_EXECUCAO = /\b(?:contratad[ao]|parceir[ao]|durante a (?:execucao|vigencia)|na execucao)\b/;

export function ehDoCertame(c: Clausula): boolean {
  if (!c.noAnexo && c.secao?.tema && TEMAS_DO_CERTAME.has(c.secao.tema)) return true;
  // pelo conteúdo: "a licitante vencedora deverá…", "as propostas deverão conter…", "após a homologação"
  return RE_VOCABULARIO_DO_CERTAME.test(c.normal) && !RE_EXECUCAO.test(c.normal.slice(0, 120));
}
