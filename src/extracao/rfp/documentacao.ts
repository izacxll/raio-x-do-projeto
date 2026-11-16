// Habilitação linha a linha (método da etapa 1, seção 3.6; sprint de regras da decisão 0032, regra 1): cada
// linha numerada da lista de documentos do edital ("DOCUMENTAÇÃO OBRIGATÓRIA", "a) Registro comercial…") vira
// um documento do checklist, com a página. Em parceria, a lista fica na fase de celebração. Também: quem entrega
// (todos ou só o mais bem classificado). O catálogo de 31 documentos continua valendo para o grupo.
import { normalizarTermo } from "../../regras/busca";
import { limparEspacos } from "../../texto/frase";
import { lerClausulas, trechoDaClausula, type Clausula } from "./clausulas";
import type { DocumentoRfp, OrigemItem } from "./item";
import type { MapaRfp } from "./mapa";

export interface DocumentoDaLista {
  numero: string;
  /** A lista de onde veio (o título da seção do edital): editais com duas listas (a da OSC e a da rede). */
  lista: string;
  /** O nome do documento, sem o endereço do site e sem o número. */
  texto: string;
  origem: OrigemItem;
}

export interface ListaDeDocumentos {
  documentos: DocumentoDaLista[];
  /** "Só a mais bem classificada", "todas as proponentes", com o trecho. */
  quemEntrega?: { texto: string; origem: OrigemItem };
}

/** Começo de linha que nomeia um documento. */
const RE_DOCUMENTO =
  /^(?:(?:cnd|crf|fgts|inss|cadin|cents|fdc)\b[^a-z]{0,6}){0,3}(?:comprovante|comprovacao|certidao|certidoes|certificado|declarac|estatuto|ata de (?:eleicao|assembleia|posse|constituicao|fundacao)|relacao|ficha|copia|prova\b|prova de|balanco|atestado|registro|inscricao|alvara|contrato social|ato constitutivo|documento|curriculo|cartao|demonstrac|ccmei|decreto de autorizacao|indicacao|termo de)/;
/** Seção onde a lista fica: habilitação, celebração ou "documentação obrigatória". */
const RE_SECAO_DA_LISTA =
  /habilita|celebracao|documentacao obrigatoria|comprovacao das exigencias|documentos (?:exigidos|necessarios|obrigatorios)/;
const RE_SO_O_PRIMEIRO =
  /\b(?:somente|apenas|exclusivamente) (?:a|o|da|do) (?:proponente|licitante|osc|organizacao|entidade)\b.{0,40}\b(?:vencedor|selecionad|classificad|primeir|arrematante|mais bem)\w*|\b(?:a|o) (?:proponente|licitante|osc|organizacao(?: da sociedade civil)?) (?:classificad[oa]|selecionad[oa]|vencedor[a]?|arrematante|mais bem classificad[oa])\b.{0,80}\b(?:devera|deverao) (?:enviar|apresentar|encaminhar)/;

function textoDoDocumento(c: Clausula): string {
  return limparEspacos(
    c.texto
      .replace(/^(?:\d{1,2}(?:\.\d{1,2}){0,4}\.?|[a-z]\)|[IVX]{1,5}\s*[-–.)])\s*/, "")
      // o endereço do site e o e-mail que o edital põe embaixo de cada certidão não são o documento
      .replace(/\s*(?:Site|E-mail|Endereço eletrônico)\s*[-:–].*$/i, ""),
  );
}

function naSecaoDaLista(c: Clausula): boolean {
  const titulo = normalizarTermo(c.secao?.titulo ?? "");
  return RE_SECAO_DA_LISTA.test(titulo) || c.secao?.tema === "habilitacao";
}

export function extrairListaDeDocumentos(docs: DocumentoRfp[], mapa: MapaRfp): ListaDeDocumentos {
  const documentos: DocumentoDaLista[] = [];
  const vistos = new Set<string>();
  let quemEntrega: ListaDeDocumentos["quemEntrega"];
  const clausulas = lerClausulas(docs, mapa);
  // alíneas depois de um item que termina em dois-pontos ("20 Comprovantes de experiência [...], podendo ser
  // admitidos, sem prejuízo de outros:") são exemplos daquele item, não documentos da lista
  let alineasSaoExemplos = false;
  for (const c of clausulas) {
    if (!naSecaoDaLista(c) || c.noModelo) continue;
    if (/^\d/.test(c.numero)) alineasSaoExemplos = /:\s*$/.test(c.texto);
    else if (/^[a-z]\)?$/i.test(c.numero) && alineasSaoExemplos) continue;
    const corpo = normalizarTermo(textoDoDocumento(c));
    if (!quemEntrega && RE_SO_O_PRIMEIRO.test(normalizarTermo(c.texto))) {
      const trecho = trechoDaClausula(c, 260);
      quemEntrega = { texto: trecho, origem: { documento: c.doc.rotulo, pagina: c.pagina, trecho } };
    }
    // só linha de lista (com número ou letra) que começa pelo nome de um documento
    if (!c.numero || !RE_DOCUMENTO.test(corpo)) continue;
    const texto = textoDoDocumento(c);
    // o texto inteiro: certidões que só mudam no fim ("Tribunal de Contas da União", "do Estado", "do
    // Município") são documentos diferentes; a repetição é o mesmo documento no corpo e no anexo
    const chave = corpo;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    const trecho = trechoDaClausula({ ...c, texto: `${c.numero} ${texto}`.trim() }, 260);
    documentos.push({
      numero: c.numero,
      lista: c.secao?.titulo ?? "",
      texto: texto.length > 220 ? `${texto.slice(0, texto.lastIndexOf(" ", 220))}…` : texto,
      origem: { documento: c.doc.rotulo, pagina: c.pagina, trecho },
    });
  }
  return { documentos: documentos.slice(0, 40), quemEntrega };
}
