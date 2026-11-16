// Etapa 3 pelo método (docs/estudos/metodo-etapa-3.md, seção 2; decisão 0041): o contrato ou termo assinado como
// entrada, com prioridade sobre a proposta e a RFP. O código lê dele o que compara: o valor, a vigência, o cronograma
// de desembolso, a cláusula que torna a proposta ou o plano de trabalho "parte integrante" e quem acompanha (gestor,
// fiscal, comissão). O que não acha fica "não localizado pelo código — conferir no documento".
import type { DocumentoLido } from "../../dossie/esquema";
import { extrairDesembolso, type Desembolso } from "../../extracao/rfp/dinheiro";
import { prepararDocumento, type DocumentoRfp, type OrigemItem } from "../../extracao/rfp/item";
import { localizarTodos, origemDe } from "../../extracao/rfp/localizar";
import { prazosDeExecucao } from "../../extracao/rfp/prazos";
import { vigenciaEmMeses } from "../../regras/vigencia";

export interface LidoDoContrato {
  doc: DocumentoRfp;
  valor?: { valor: number; origem: OrigemItem };
  vigencia?: { texto: string; meses?: number; origem: OrigemItem };
  desembolso: Desembolso;
  /** A proposta ou o plano de trabalho é parte integrante: então também obriga. */
  parteIntegrante?: OrigemItem;
  /** Quem acompanha e aprova do lado do contratante (gestor, fiscal, comissão), como o contrato escreve. */
  quemAcompanha: OrigemItem[];
}

const RE_VALOR =
  /\bvalor (?:total|global|do (?:contrato|termo|ajuste|repasse)|estimado)\b[^.;]{0,120}?r\$\s*[\d.]+(?:,\d{1,2})?/;
const RE_PARTE_INTEGRANTE =
  /\b(?:plano de trabalho|proposta)[^.;]{0,80}\bparte integrante\b|\bparte integrante\b[^.;]{0,80}\b(?:plano de trabalho|proposta)\b/;
const RE_QUEM =
  /\b(?:gestor(?:a)? d[ao] (?:parceria|contrato|termo)|fiscal d[oe] contrato|comissao de (?:monitoramento|fiscalizacao|avaliacao))\b/;

function reais(texto: string): number | undefined {
  const m = /R\$\s*([\d.]+(?:,\d{1,2})?)(\s*(?:mil|milh|bilh))?/i.exec(texto);
  if (!m?.[1] || m[2]) return undefined;
  const v = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

export function lerContrato(contrato: DocumentoLido): LidoDoContrato {
  const doc = prepararDocumento(contrato.id, "Contrato", contrato.paginas);
  const docs = [doc];
  const v = localizarTodos(docs, RE_VALOR)[0];
  const valor = v ? reais(v.frase) : undefined;
  const p = prazosDeExecucao(docs).find((x) => x.tipo === "vigencia" || x.tipo === "execucao");
  const parte = localizarTodos(docs, RE_PARTE_INTEGRANTE)[0];
  const quem = localizarTodos(docs, RE_QUEM).slice(0, 3);
  return {
    doc,
    valor: v && valor ? { valor, origem: origemDe(v) } : undefined,
    vigencia: p
      ? {
          texto: p.valor,
          meses: vigenciaEmMeses(p.valor),
          origem: { documento: "Contrato", pagina: p.loc.pagina, trecho: p.loc.frase },
        }
      : undefined,
    desembolso: extrairDesembolso(docs),
    parteIntegrante: parte ? origemDe(parte) : undefined,
    quemAcompanha: quem.map((l) => origemDe(l)),
  };
}
