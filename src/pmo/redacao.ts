// "Sugerir, nunca afirmar" no código: o que o PMO devolve passa por estas conferências antes de aparecer na tela.
// - sugestão com frase afirmativa, ordem ou parecer → "redação a conferir";
// - valor, prazo, percentual ou quantidade que não está nos documentos → "número sem fonte — conferir";
// - item "do documento" sem citação conferida → vira "citação não conferida" e nunca aparece como fato.
import type { DocumentoLido } from "../dossie/esquema";
import { tirarAcentos } from "../texto/normalizar";
import { citacaoValeComoFato, conferirCitacao, type ResultadoCitacao } from "./citacoes";
import type { ItemPmo } from "./schemas/comum";

/** Frases que afirmam, ordenam ou dão parecer: proibidas em sugestão (também usadas no teste da etapa 1). */
export const AFIRMATIVAS =
  /\b(?:é obrigatório|é ilegal|é nulo|está errad[oa]|a FGV deve|o GP deve|deve-se|é preciso que|certamente|com certeza|sem dúvida|parecer jurídico:)/i;

/** Marca de redação condicional. "Se… então…" é a forma do risco escrito como condição (skill, princípio 5). */
export const CONDICIONAL =
  /sugere-se|recomenda-se|uma opção|pode-se|poderia|pode ser|convém avaliar|avaliar|considerar|alternativa|a definir pelo GP|propõe-se|sugest|\bse\b[^.]{3,200}\bent[aã]o\b/i;

export function redacaoAfirmativa(texto: string): boolean {
  return AFIRMATIVAS.test(texto);
}

/** Sugestão sem nenhuma marca condicional, ou com afirmação: o GP é avisado. */
export function sugestaoSemCondicional(texto: string): boolean {
  return redacaoAfirmativa(texto) || !CONDICIONAL.test(texto);
}

// valor em reais, percentual e quantidade com unidade de prazo, esforço ou volume
const NUMEROS_SENSIVEIS =
  /R\$\s*\d[\d.,]*|\d[\d.,]*\s*%|\b\d[\d.,]*\s*(?:dias?|meses|m[eê]s|anos?|semanas?|horas?|h\b|pessoas|profissionais|participantes|oficinas|visitas|munic[ií]pios|entrevistas|question[aá]rios|turmas|vagas)/gi;

function soDigitos(s: string): string {
  return s.replace(/[^\d]/g, "");
}

/** Números sensíveis do texto que não aparecem nos trechos citados nem no texto lido dos documentos. */
export function numerosSemFonte(
  texto: string,
  item: Pick<ItemPmo, "fontes">,
  documentos: DocumentoLido[],
): string[] {
  const achados = texto.match(NUMEROS_SENSIVEIS) ?? [];
  if (!achados.length) return [];
  const base = [
    ...item.fontes.map((f) => f.trecho),
    ...documentos.flatMap((d) => d.paginas.map((p) => p.texto)),
  ].join(" ");
  const baseNorm = tirarAcentos(base).replace(/\s+/g, " ");
  const out: string[] = [];
  for (const a of achados) {
    const digitos = soDigitos(a);
    if (!digitos) continue;
    // o mesmo número com a mesma unidade (ou o valor em reais) aparece no documento?
    const unidade = tirarAcentos(a)
      .replace(/[\d.,\s]/g, "")
      .slice(0, 4);
    const re = new RegExp(
      `${digitos.split("").join("[.,]?")}\\s*(?:\\([^)]{1,30}\\)\\s*)?${unidade.replace(/[$%]/g, (c) => `\\${c}`)}`,
      "i",
    );
    const reValor = new RegExp(digitos.split("").join("[.,\\s]?"));
    const temNoDocumento = /R\$/.test(a) ? reValor.test(baseNorm) : re.test(baseNorm);
    if (!temNoDocumento) out.push(a.trim());
  }
  return [...new Set(out)];
}

const PERIODICIDADE =
  /\b(diari|seman|quinzen|mens|bimestr|trimestr|quadrimestr|semestr|anu|bien|pluriannu)(?:al|ais|almente|e|es|o|a|os|as)\b/;
/** Periodicidade pelo radical ("trimestral", "trimestrais", "trimestre"): o termo-chave guarda "per:<radical>". */
const periodicidadeNoTexto = (radical: string, texto: string) =>
  new RegExp(`\\b${radical}(?:al|ais|almente|e|es|o|a|os|as)\\b`).test(texto);
const PALAVRAS_VAZIAS = new Set(
  "conforme segundo previsto prevista prever preve documento termo referencia edital contratada contratante deverao devera sobre entre durante ainda quando sempre mesmo todos todas cada outro outra outros outras partir proposta projeto servicos servico".split(
    " ",
  ),
);
const semAcentoMinusculo = (t: string) => tirarAcentos(t).toLowerCase();

/**
 * Termos-chave de um item (SKILL.md, princípio 15; decisão 0057): os números com unidade, as datas, a periodicidade
 * ("trimestral") e o que está entre aspas. Sem nenhum deles, as palavras longas do item.
 */
export function termosChaveDoItem(texto: string): { termos: string[]; palavras: string[] } {
  const t = semAcentoMinusculo(texto);
  const termos = [
    ...(texto.match(NUMEROS_SENSIVEIS) ?? []).map(soDigitos).filter(Boolean),
    ...(texto.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g) ?? []).map(soDigitos),
    ...[...t.matchAll(new RegExp(PERIODICIDADE.source, "g"))].map((m) => (m[1] ? `per:${m[1]}` : "")),
    ...[...texto.matchAll(/["“]([^"”]{3,60})["”]/g)].map((m) => semAcentoMinusculo(m[1] ?? "").trim()),
  ].filter(Boolean);
  const palavras = [...new Set(t.match(/[a-z]{7,}/g) ?? [])].filter((p) => !PALAVRAS_VAZIAS.has(p));
  return { termos: [...new Set(termos)], palavras };
}

/** O trecho citado prova o item? Cada termo-chave tem de estar num dos trechos; sem termo-chave, ao menos uma palavra longa. */
export function citacaoProvaOItem(texto: string, trechos: string[]): boolean {
  if (!trechos.length) return true;
  const base = semAcentoMinusculo(trechos.join(" "));
  const digitos = base.replace(/(\d)[.,\s](?=\d)/g, "$1");
  const { termos, palavras } = termosChaveDoItem(texto);
  if (termos.length)
    return termos.every((x) =>
      /^\d+$/.test(x)
        ? digitos.includes(x)
        : x.startsWith("per:")
          ? periodicidadeNoTexto(x.slice(4), base)
          : base.includes(x),
    );
  return !palavras.length || palavras.some((p) => base.includes(p.slice(0, Math.max(6, p.length - 3))));
}

export interface ConferenciaItem {
  /** Uma por fonte, na mesma ordem. */
  citacoes: ResultadoCitacao[];
  /** "Do documento" só vale como fato se ao menos uma citação foi achada pelo código. */
  citacaoNaoConferida: boolean;
  /** "Do documento" cujo trecho achado não traz o termo-chave do item: "citação não prova" (decisão 0057). */
  citacaoNaoProva?: boolean;
  redacaoAConferir: boolean;
  numerosSemFonte: string[];
}

export function conferirItem(item: ItemPmo, documentos: DocumentoLido[]): ConferenciaItem {
  const citacoes = item.fontes.map((f) => conferirCitacao(f, documentos));
  const algumaVale = citacoes.some(citacaoValeComoFato);
  const trechos = item.fontes
    .filter((_, k) => citacaoValeComoFato(citacoes[k] as ResultadoCitacao))
    .map((f) => f.trecho);
  return {
    citacoes,
    citacaoNaoConferida: item.rotulo === "documento" && !algumaVale,
    citacaoNaoProva: item.rotulo === "documento" && algumaVale && !citacaoProvaOItem(item.texto, trechos),
    redacaoAConferir: item.rotulo === "sugestao" && sugestaoSemCondicional(item.texto),
    numerosSemFonte: item.rotulo === "documento" ? [] : numerosSemFonte(item.texto, item, documentos),
  };
}
