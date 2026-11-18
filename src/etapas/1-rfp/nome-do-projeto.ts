// Nome do projeto sugerido a partir da RFP (instrumento e objeto), por código. É sugestão: o GP aceita, edita
// ou escreve outro no cabeçalho. Enquanto o GP não dá nome, os documentos exportados usam a sugestão com o aviso.
import type { OrigemItem } from "../../extracao/rfp/item";
import type { AnaliseRfp } from "./analisar-rfp";

export interface NomeSugerido {
  nome: string;
  /** De onde saíram as partes do nome (instrumento e objeto). */
  origens: OrigemItem[];
}

const TAMANHO_OBJETO = 70;

/** Caixa alta inteira ("EDITAL DE PREGÃO ELETRÔNICO") vira caixa de frase, mantendo siglas curtas. */
function semCaixaAlta(texto: string): string {
  const letras = texto.match(/[A-Za-zÀ-ÿ]/g) ?? [];
  const maiusculas = texto.match(/[A-ZÀ-Ý]/g) ?? [];
  if (!letras.length || maiusculas.length / letras.length < 0.7) return texto;
  // palavra com número ("1/2026/SNP-MCID") fica como está
  return texto
    .split(/(\s+)/)
    .map((p) => (/\d/.test(p) ? p : p.toLowerCase()))
    .join("")
    .replace(/^./, (c) => c.toUpperCase());
}

/** "Edital de Chamamento Público SMPED nº 001/2025" → "Chamamento SMPED nº 001/2025". */
export function instrumentoCurto(instrumento: string): string {
  return semCaixaAlta(instrumento.trim())
    .replace(/^edital\s+(?:de\s+|do\s+)?/i, "")
    .replace(/^(chamamento)\s+p[uú]blico\b/i, "$1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/**
 * O objeto sem a fórmula de abertura ("O TERMO DE FOMENTO terá por objeto o…", "Contratação de empresa
 * especializada para…"), na primeira oração e com até 70 caracteres, sem cortar palavra.
 */
export function objetoCurto(objeto: string): string {
  let t = objeto
    // "desenvolvi- mento": a palavra partida na quebra de linha
    .replace(/([a-zà-ÿ])- ([a-zà-ÿ])/g, "$1$2")
    .replace(/^\s*\d{1,2}(?:\.\d{1,2})*\.?\s*/, "")
    .replace(/^o objeto (?:da|do|deste|desta) (?:presente |deste |desta )?\S+ [eé] (?:a |o |as |os )?/i, "")
    .replace(/^registro de pre[cç]os? (?:para|visando [aà])\s+(?:a |o )?(?:eventual |futura )?/i, "")
    .replace(/^objeto\s*:\s*/i, "")
    .replace(
      /^(?:o|a)\s+(?:presente\s+)?(?:termo de (?:fomento|colabora[cç][aã]o)|edital|contrato|licita[cç][aã]o|chamamento(?: p[uú]blico)?|parceria|presente)\s+(?:ter[aá]|tem)\s+(?:por|como)\s+objeto\s+(?:o|a|os|as)?\s*/i,
      "",
    )
    .replace(
      /^(?:constitui|[eé])\s+objeto\s+(?:deste|desta|do presente|da presente)\s+[^,:]*?[,:]?\s+(?:a|o|as|os)?\s*/i,
      "",
    )
    .replace(
      // "Contratação de empresa…" e "Contratar pessoa jurídica especializada para…" (decisão 0084)
      /^(?:contrata[cç][aã]o d[eao]s?|contratar)\s+(?:uma?\s+)?(?:empresa|pessoa jur[ií]dica|institui[cç][aã]o|consultoria)(?:\s+especializad[ao]s?)?\s+(?:para|de|em|na|no|nas|nos)\s+(?:a |o |as |os )?/i,
      "",
    );
  t = t.split(/[;.](?:\s|$)/)[0] ?? t;
  t = semCaixaAlta(t.trim());
  if (t.length > TAMANHO_OBJETO) t = `${t.slice(0, TAMANHO_OBJETO).replace(/[\s,]+\S*$/, "")}…`;
  return t.replace(/^./, (c) => c.toUpperCase());
}

/** O título do instrumento quando diz algo; senão, a modalidade com o número do edital, se houver. */
function instrumentoDoNome(
  instrumento: string | undefined,
  modalidade: string | undefined,
): string | undefined {
  const curto = instrumento ? instrumentoCurto(instrumento) : undefined;
  if (curto && /^[A-Za-zÀ-ÿ]{3,}/.test(curto) && !/^edital$/i.test(curto) && !/^n[º°o.]/i.test(curto))
    return curto;
  const numero = instrumento && /n[º°o.]*\s*\d[\d./-]*\d/i.exec(instrumento)?.[0].replace(/\.$/, "");
  if (!modalidade) return curto;
  return numero ? `${modalidade} ${numero.replace(/^N/, "n")}` : modalidade;
}

export function sugerirNomeProjeto(analise: AnaliseRfp): NomeSugerido | undefined {
  const achado = (id: string) =>
    analise.itens.find((i) => i.id === id && (i.situacao === "localizado" || i.situacao === "calculado"));
  const instrumento = achado("identificacao:instrumento");
  const objeto = achado("identificacao:objeto");
  if (!instrumento && !objeto) return undefined;
  const modalidade = achado("identificacao:modalidade");
  const o = objeto && objetoCurto(objeto.texto);
  const i = instrumentoDoNome(instrumento?.texto, modalidade?.texto);
  const nome = o && i ? `${o} (${i})` : (o ?? i ?? "");
  if (!nome.trim()) return undefined;
  return {
    nome,
    origens: [instrumento?.origem, objeto?.origem].filter((x): x is OrigemItem => Boolean(x)),
  };
}

/** Como o nome sugerido aparece nos documentos enquanto o GP não dá nome ao projeto. */
export function nomeSugeridoNoCabecalho(sugestao: NomeSugerido): string {
  return `${sugestao.nome} — nome sugerido pela ferramenta, a confirmar pelo GP`;
}
