// "Sugerir, nunca afirmar" no código: o que o PMO devolve passa por estas conferências antes de aparecer na tela.
// - sugestão com frase afirmativa, ordem ou parecer → "redação a conferir";
// - valor, prazo, percentual ou quantidade que não está nos documentos → "número sem fonte — conferir";
// - item "do documento" sem citação conferida → vira "citação não conferida" e nunca aparece como fato.
import type { DocumentoLido } from "../dossie/esquema";
import { encontrarDatas, formatarData } from "../texto/datas";
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

/** Número com unidade, como chave para comparar ("34 dias úteis" → "34dias"). */
const chaveDoNumero = (a: string) =>
  `${soDigitos(a)}${semAcentoMinusculo(a)
    .replace(/[\d.,\s]/g, "")
    .slice(0, 4)}`;
/** Datas de um texto, numéricas ou por extenso ("3 de março de 2027"), em dd/mm/aaaa. */
const datasDoTexto = (t: string) => encontrarDatas(t).map((d) => formatarData(d.data));
/** O que o item diz que é conta do código ("… (conta do código)"): esses números não precisam estar no trecho. */
const frasesDaConta = (texto: string) =>
  texto.split(/(?<=[.;,])\s+/).filter((f) => /conta do c[oó]digo/i.test(f));

/**
 * Termos-chave de um item (SKILL.md, princípio 15; decisões 0057 e 0058): os números com unidade, as datas
 * (numéricas ou por extenso) e a periodicidade ("trimestral"). Os números e datas que vêm do esqueleto do código
 * (`ignorar`) ou de uma frase "conta do código" saem. Sem nenhum termo, valem as palavras longas do item.
 */
export function termosChaveDoItem(texto: string, ignorar = ""): { termos: string[]; palavras: string[] } {
  const t = semAcentoMinusculo(texto);
  const daConta = frasesDaConta(texto).join(" ");
  const numerosIgnorados = new Set(
    [...(ignorar.match(NUMEROS_SENSIVEIS) ?? []), ...(daConta.match(NUMEROS_SENSIVEIS) ?? [])].map(
      chaveDoNumero,
    ),
  );
  const datasIgnoradas = new Set([...datasDoTexto(ignorar), ...datasDoTexto(daConta)]);
  const termos = [
    ...(texto.match(NUMEROS_SENSIVEIS) ?? [])
      .filter((a) => !numerosIgnorados.has(chaveDoNumero(a)))
      .map(soDigitos)
      .filter(Boolean),
    ...datasDoTexto(texto)
      .filter((d) => !datasIgnoradas.has(d))
      .map((d) => `data:${d}`),
    ...[...t.matchAll(new RegExp(PERIODICIDADE.source, "g"))].map((m) => (m[1] ? `per:${m[1]}` : "")),
  ].filter(Boolean);
  const palavras = [...new Set(t.match(/[a-z]{7,}/g) ?? [])].filter((p) => !PALAVRAS_VAZIAS.has(p));
  return { termos: [...new Set(termos)], palavras };
}

/**
 * O trecho citado prova o item? Procura em todos os trechos do item: cada termo-chave tem de estar em algum deles;
 * sem termo-chave, basta uma palavra longa do item (pelo radical) ou, quando o item fala de e-mail ou telefone, o
 * endereço ou o número no trecho. É aviso, não erro (decisão 0058).
 */
export function citacaoProvaOItem(texto: string, trechos: string[], ignorar = ""): boolean {
  if (!trechos.length) return true;
  const juntos = trechos.join(" ");
  const base = semAcentoMinusculo(juntos);
  const digitos = base.replace(/(\d)[.,\s](?=\d)/g, "$1");
  const datas = new Set(datasDoTexto(juntos));
  const { termos, palavras } = termosChaveDoItem(texto, ignorar);
  if (termos.length)
    return termos.every((x) =>
      /^\d+$/.test(x)
        ? digitos.includes(x)
        : x.startsWith("data:")
          ? datas.has(x.slice(5))
          : periodicidadeNoTexto(x.slice(4), base),
    );
  // todos os números e datas do item vêm do esqueleto ou de uma conta do código: não há o que o trecho prove
  if (termosChaveDoItem(texto).termos.length) return true;
  const t = semAcentoMinusculo(texto);
  if (/\be-?mails?\b/.test(t) && /[\w.-]+@[\w.-]+\.[a-z]{2,}/.test(base)) return true;
  if (/\btelefone/.test(t) && /\(?\d{2}\)?\s?\d[\d.\s-]{6,}/.test(base)) return true;
  return !palavras.length || palavras.some((p) => base.includes(p.slice(0, Math.max(6, p.length - 3))));
}

export interface ConferenciaItem {
  /** Uma por fonte, na mesma ordem. */
  citacoes: ResultadoCitacao[];
  /** "Do documento" só vale como fato se ao menos uma citação foi achada pelo código. */
  citacaoNaoConferida: boolean;
  /**
   * "Do documento" cujos trechos não trazem o termo-chave do item: "citação a conferir". É aviso, não erro: não
   * conta entre os fatos sem citação (decisões 0057 e 0058).
   */
  citacaoNaoProva?: boolean;
  redacaoAConferir: boolean;
  numerosSemFonte: string[];
}

export function conferirItem(item: ItemPmo, documentos: DocumentoLido[]): ConferenciaItem {
  const citacoes = item.fontes.map((f) => conferirCitacao(f, documentos));
  const algumaVale = citacoes.some(citacaoValeComoFato);
  // o termo-chave é procurado em todos os trechos do item (decisão 0058)
  const trechos = item.fontes.map((f) => f.trecho);
  return {
    citacoes,
    citacaoNaoConferida: item.rotulo === "documento" && !algumaVale,
    citacaoNaoProva: item.rotulo === "documento" && algumaVale && !citacaoProvaOItem(item.texto, trechos),
    redacaoAConferir: item.rotulo === "sugestao" && sugestaoSemCondicional(item.texto),
    numerosSemFonte: item.rotulo === "documento" ? [] : numerosSemFonte(item.texto, item, documentos),
  };
}
