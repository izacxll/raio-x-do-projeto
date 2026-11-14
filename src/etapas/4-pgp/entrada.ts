// Etapa 4: o que entra. A RFP (com a etapa 1), o TAP (o PDF aprovado pelo GP ou o TAP da etapa 3 no dossiê) e, se
// houver, a proposta (PDF ou a da etapa 2). Documento da ferramenta vira documento "lido", uma página por seção.
import type { DocumentoLido, Dossie } from "../../dossie/esquema";
import { montarTap } from "../../exportacao/relatorio-tap";
import type { MarcoTap, PremissaRegistro } from "../../pmo/schemas/tap";
import { montarPontoDePartida, type PontoDePartida } from "../2-proposta/ponto-de-partida";
import { dadosDaProposta, propostaComoDocumento, type DadosProposta } from "../3-tap/entrada";
import { documentoDeExportavel } from "../documento-virtual";

export type FonteDocumento = "pdf" | "dossie" | "nenhuma";

export const NOME_TAP_DO_DOSSIE = "TAP da etapa 3 (dossiê)";

export interface EntradaPgp {
  ponto: PontoDePartida;
  rfp: DocumentoLido[];
  fonteTap: FonteDocumento;
  tap?: DocumentoLido;
  fonteProposta: FonteDocumento;
  proposta?: DocumentoLido;
  /** RFP + TAP + proposta: o que vai ao PMO e onde o código confere as citações. */
  documentos: DocumentoLido[];
  /** Do dossiê, quando a etapa 3 foi feita nele. */
  marcosTap: MarcoTap[];
  premissasTap: PremissaRegistro[];
  /** Requisitos de alto nível do TAP, com os números R. */
  requisitosTap: { texto: string; requisitos: string[] }[];
  /** Recursos financeiros do TAP (decisão do GP na etapa 3). */
  recursosTap?: string;
  dadosProposta?: DadosProposta;
  /** Premissas críticas confirmadas nas etapas anteriores. */
  premissasAnteriores: Record<string, boolean>;
}

export function montarEntradaPgp(dossie: Dossie, hoje = new Date()): EntradaPgp {
  const rfp = dossie.documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
  const ponto = montarPontoDePartida(rfp, dossie.analiseRfp, hoje);
  const tapPdf = dossie.documentos.find((d) => d.papel === "tap");
  const tapDoDossie =
    !tapPdf && dossie.tap?.tap
      ? documentoDeExportavel(montarTap(dossie, new Date(dossie.criadoEm)), {
          id: "tap-do-dossie",
          papel: "tap",
          nomeArquivo: NOME_TAP_DO_DOSSIE,
          lidoEm: dossie.tap.tap.em,
        })
      : undefined;
  const propostaPdf = dossie.documentos.find((d) => d.papel === "proposta");
  const propostaDoDossie = propostaPdf ? undefined : propostaComoDocumento(dossie, ponto, rfp);
  const tap = tapPdf ?? tapDoDossie;
  const proposta = propostaPdf ?? propostaDoDossie;
  const t = dossie.tap;
  const valido = (id: string) => t?.revisoes[id]?.estado !== "descartado";
  return {
    ponto,
    rfp,
    fonteTap: tapPdf ? "pdf" : tapDoDossie ? "dossie" : "nenhuma",
    tap,
    fonteProposta: propostaPdf ? "pdf" : propostaDoDossie ? "dossie" : "nenhuma",
    proposta,
    documentos: [...rfp, ...(tap ? [tap] : []), ...(proposta ? [proposta] : [])],
    marcosTap: tapPdf ? [] : (t?.tap?.resposta.marcos.filter((_, k) => valido(`tap:marcos:${k}`)) ?? []),
    premissasTap: tapPdf
      ? []
      : (t?.premissas?.resposta.premissas.filter((_, k) => valido(`premissas:${k}`)) ?? []),
    requisitosTap: tapPdf
      ? []
      : (t?.tap?.resposta.requisitosAltoNivel
          .filter((_, k) => valido(`tap:requisitosAltoNivel:${k}`))
          .map((i) => ({ texto: i.texto, requisitos: i.requisitos })) ?? []),
    recursosTap: tapPdf ? undefined : t?.decisoes.recursos,
    dadosProposta: propostaPdf ? undefined : dadosDaProposta(dossie, rfp, ponto),
    premissasAnteriores: t?.premissasAplicaveis ?? dossie.proposta?.premissasAplicaveis ?? {},
  };
}
