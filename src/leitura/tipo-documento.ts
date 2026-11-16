// Que documento parece ser este PDF, pelo título nas primeiras linhas: serve só para avisar o GP quando o arquivo
// parece estar na caixa errada (uma proposta na caixa do PGP, um termo de referência na do TAP). Quem decide é
// o GP: o aviso não muda o papel do documento.
import type { PaginaLida } from "../dossie/esquema";
import type { PapelDocumento } from "../etapas/etapas";
import { tirarAcentos } from "../texto/normalizar";

export interface TipoProvavel {
  /** A caixa onde o documento costuma entrar. */
  papel: PapelDocumento;
  /** Como o documento se apresenta ("Termo de Referência", "Proposta técnica"). */
  nome: string;
  pagina: number;
  /** A linha do título, como está no documento. */
  linha: string;
}

/** Títulos reconhecidos, sobre a linha sem acento e em minúsculas. A primeira linha que casa decide. */
const TITULOS: [RegExp, PapelDocumento, string][] = [
  [/\btermo de abertura\b/, "tap", "Termo de abertura"],
  [/\bplano de gerenciamento\b/, "pgp", "Plano de gerenciamento"],
  [/\bplano de trabalho\b/, "pgp", "Plano de trabalho"],
  [/\bproposta (?:tecnica|comercial|de precos?)\b/, "proposta", "Proposta"],
  [/\btermo de referencia\b|\bprojeto basico\b/, "rfp", "Termo de referência"],
  [
    /\bedital\b|\bchamamento publico\b|\bpregao\b|\bconcorrencia\b|\baviso de (?:licitacao|contratacao|dispensa)\b|\bsolicitacao de propostas?\b|\brequest for proposal\b/,
    "rfp",
    "Edital ou RFP",
  ],
];

/** Linhas que podem ser título: curtas, nas primeiras linhas com texto das duas primeiras páginas. */
const LINHAS_OLHADAS = 15;
const MAX_TITULO = 120;

export function tipoProvavel(paginas: PaginaLida[]): TipoProvavel | undefined {
  for (const p of paginas.slice(0, 2)) {
    if (p.origem === "nao-verificavel") continue;
    const linhas = p.texto
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, LINHAS_OLHADAS);
    for (const linha of linhas) {
      if (linha.length > MAX_TITULO) continue;
      const n = tirarAcentos(linha);
      const t = TITULOS.find(([re]) => re.test(n));
      if (t) return { papel: t[1], nome: t[2], pagina: p.numero, linha };
    }
  }
  return undefined;
}

/** A RFP e os anexos da RFP são a mesma família: um termo de referência na caixa de anexos não é erro. */
function familia(papel: PapelDocumento): string {
  return papel === "anexo-rfp" ? "rfp" : papel;
}

/** O aviso, quando o documento parece de outra caixa; senão, undefined. */
export function caixaParece(
  caixa: PapelDocumento,
  paginas: PaginaLida[],
): (TipoProvavel & { caixaSugerida: PapelDocumento }) | undefined {
  const t = tipoProvavel(paginas);
  if (!t || familia(t.papel) === familia(caixa)) return undefined;
  // plano de trabalho também entra na caixa da proposta (é a proposta da parceria)
  if (caixa === "proposta" && t.nome === "Plano de trabalho") return undefined;
  return { ...t, caixaSugerida: t.papel };
}
