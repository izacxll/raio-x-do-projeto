// Leitura de um PDF página a página: texto, OCR para as páginas sem texto e o estado de cada página.
// Independe do ambiente: recebe o documento já aberto pelo pdf.js (no navegador ou nos testes, em Node)
// e uma função de OCR opcional.
import type { PaginaLida } from "../dossie/esquema";
import { compactar, limparCarimbos } from "../texto/normalizar";
import {
  listarPaginasComImagem,
  medirImagens,
  type CodigosOperadores,
  type ListaOperadores,
} from "./imagens";
import { montarLinhas } from "./texto-da-pagina";

/** Abaixo disto (letras e números), a página é tratada como sem texto e vai para o OCR. */
export const MIN_CARACTERES_PAGINA = 30;
/** Confiança média mínima do OCR para aceitar o texto da página (0 a 100). */
export const MIN_CONFIANCA_OCR = 45;

export interface PaginaPdf {
  getTextContent(): Promise<{ items: unknown[] }>;
  getOperatorList(): Promise<ListaOperadores>;
}

export interface DocumentoPdf {
  numPages: number;
  getPage(numero: number): Promise<PaginaPdf>;
}

export interface ResultadoOcr {
  texto: string;
  confianca: number;
}

export type Reconhecer = (numeroPagina: number) => Promise<ResultadoOcr>;

export interface Progresso {
  pagina: number;
  total: number;
  fase: "texto" | "ocr";
}

export interface OpcoesLeitura {
  OPS: CodigosOperadores;
  ocr?: Reconhecer;
  aoProgredir?: (p: Progresso) => void;
  sinal?: AbortSignal;
}

function paginaSemOcr(numero: number, texto: string, caracteres: number, motivo: string): PaginaLida {
  return { numero, origem: "nao-verificavel", texto, caracteres, motivo };
}

async function lerPorOcr(
  numero: number,
  ocr: Reconhecer,
  textoOriginal: string,
  caracteresOriginais: number,
): Promise<PaginaLida> {
  try {
    const r = await ocr(numero);
    const texto = limparCarimbos(r.texto).trim();
    const caracteres = compactar(texto).length;
    const confiancaOcr = Math.round(r.confianca);
    if (caracteres >= MIN_CARACTERES_PAGINA && confiancaOcr >= MIN_CONFIANCA_OCR) {
      return { numero, origem: "ocr", texto, caracteres, confiancaOcr };
    }
    return {
      numero,
      origem: "nao-verificavel",
      texto,
      caracteres,
      confiancaOcr,
      motivo:
        caracteres < MIN_CARACTERES_PAGINA
          ? "o OCR não encontrou texto legível (página em branco, figura ou imagem de baixa qualidade)"
          : `o OCR leu a página com confiança baixa (${confiancaOcr}%)`,
    };
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    const detalhe = erro instanceof Error ? erro.message : String(erro);
    return paginaSemOcr(numero, textoOriginal, caracteresOriginais, `o OCR falhou nesta página (${detalhe})`);
  }
}

export async function lerDocumento(pdf: DocumentoPdf, opcoes: OpcoesLeitura): Promise<PaginaLida[]> {
  const paginas: PaginaLida[] = [];
  const imagensPorPagina: Record<number, string[]> = {};
  const total = pdf.numPages;

  for (let n = 1; n <= total; n++) {
    if (opcoes.sinal?.aborted) throw new DOMException("Leitura cancelada", "AbortError");
    opcoes.aoProgredir?.({ pagina: n, total, fase: "texto" });

    const pagina = await pdf.getPage(n);
    const conteudo = await pagina.getTextContent();
    const texto = limparCarimbos(montarLinhas(conteudo.items));
    const caracteres = compactar(texto).length;
    const imagens = await medirImagens(pagina, opcoes.OPS);
    if (imagens) imagensPorPagina[n] = imagens;

    if (caracteres >= MIN_CARACTERES_PAGINA) {
      paginas.push({ numero: n, origem: "texto", texto, caracteres });
    } else if (!opcoes.ocr) {
      paginas.push(paginaSemOcr(n, texto, caracteres, "página sem texto legível; o OCR não foi executado"));
    } else {
      opcoes.aoProgredir?.({ pagina: n, total, fase: "ocr" });
      paginas.push(await lerPorOcr(n, opcoes.ocr, texto, caracteres));
    }
  }

  const comImagem = new Set(listarPaginasComImagem(imagensPorPagina));
  for (const p of paginas) {
    // não deu para verificar as imagens: "pode haver", nunca "não há"
    if (comImagem.has(p.numero) || !(p.numero in imagensPorPagina)) p.temImagem = true;
  }
  return paginas;
}

export interface ResumoLeitura {
  total: number;
  texto: number;
  ocr: number;
  naoVerificaveis: number[];
  /** Páginas com texto, mas com figura ou tabela em imagem: o conteúdo da imagem não foi lido. */
  comImagem: number[];
}

export function resumirLeitura(paginas: PaginaLida[]): ResumoLeitura {
  return {
    total: paginas.length,
    texto: paginas.filter((p) => p.origem === "texto").length,
    ocr: paginas.filter((p) => p.origem === "ocr").length,
    naoVerificaveis: paginas.filter((p) => p.origem === "nao-verificavel").map((p) => p.numero),
    comImagem: paginas.filter((p) => p.temImagem && p.origem === "texto").map((p) => p.numero),
  };
}
