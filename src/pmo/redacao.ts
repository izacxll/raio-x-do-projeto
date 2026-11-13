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

/** Marca de redação condicional. */
export const CONDICIONAL =
  /sugere-se|recomenda-se|uma opção|pode-se|poderia|pode ser|convém avaliar|avaliar|considerar|alternativa|a definir pelo GP|propõe-se|sugest/i;

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

export interface ConferenciaItem {
  /** Uma por fonte, na mesma ordem. */
  citacoes: ResultadoCitacao[];
  /** "Do documento" só vale como fato se ao menos uma citação foi achada pelo código. */
  citacaoNaoConferida: boolean;
  redacaoAConferir: boolean;
  numerosSemFonte: string[];
}

export function conferirItem(item: ItemPmo, documentos: DocumentoLido[]): ConferenciaItem {
  const citacoes = item.fontes.map((f) => conferirCitacao(f, documentos));
  const algumaVale = citacoes.some(citacaoValeComoFato);
  return {
    citacoes,
    citacaoNaoConferida: item.rotulo === "documento" && !algumaVale,
    redacaoAConferir: item.rotulo === "sugestao" && sugestaoSemCondicional(item.texto),
    numerosSemFonte: item.rotulo === "documento" ? [] : numerosSemFonte(item.texto, item, documentos),
  };
}
