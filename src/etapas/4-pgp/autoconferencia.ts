// Etapa 4, passo 13 (código): autoconferência. Antes da exportação, o plano gerado passa pelas regras da etapa 5
// (vago, conflituoso, ausente; gravidade pela parte; categoria pela regra fixa). O que o GP dispensou na adaptação
// fica "dispensada" no mapa e não conta como ausente. O que as regras acharem aparece para o GP corrigir.
import { CARACTERISTICAS_PADRAO, type Caracteristicas } from "../../dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../dominio/skill";
import type { DocumentoLido, Dossie } from "../../dossie/esquema";
import { montarPgp } from "../../exportacao/relatorio-pgp";
import type { Achado } from "../../regras/achado";
import { conferirPlano, type ResultadoConferencia } from "../../regras/conferencia";
import { confirmacaoInicial, proporMapa, type ParteConfirmada } from "../../regras/mapa-pgp";
import { documentoDeExportavel } from "../documento-virtual";
import type { EntradaPgp } from "./entrada";
import { pgpInicial } from "./pgp";

export const NOME_PGP_GERADO = "Plano gerado na etapa 4";

/** O plano gerado como documento "lido": uma página por seção, com os títulos que o mapa reconhece. */
export function pgpComoDocumento(dossie: Dossie, agora = new Date()): DocumentoLido {
  return documentoDeExportavel(montarPgp(dossie, agora), {
    id: "pgp-gerado",
    papel: "pgp",
    nomeArquivo: NOME_PGP_GERADO,
    lidoEm: agora.toISOString(),
  });
}

/**
 * Características do projeto para a autoconferência: as do GP, se ele já confirmou; senão, uma sugestão do código a
 * partir da adaptação e da RFP (porte pelo número de produtos e pelo prazo; campo pelo "formato remoto"). O resto
 * fica nos valores conservadores, que dispensam pouco.
 */
export function caracteristicasDoPgp(dossie: Dossie, e: EntradaPgp): Caracteristicas {
  const p = dossie.pgp ?? pgpInicial();
  if (p.caracteristicas) return p.caracteristicas;
  const a = p.adaptacao?.resposta;
  const sub = e.ponto.condicoes.find((i) => i.id === "condicoes:subcontratacao")?.texto ?? "";
  const abordagem = p.abordagem ?? a?.abordagem;
  const produtos = e.ponto.requisitos.filter((r) => r.tipo === "produto").length;
  const dias = e.ponto.prazoExecucao?.dias;
  const porte =
    dias !== undefined && dias <= 365 && produtos <= 5
      ? "pequeno"
      : dias !== undefined && dias <= 730 && produtos <= 10
        ? "médio"
        : "grande";
  const remoto = e.rfp.some((d) =>
    d.paginas.some((pg) => /formato remoto|de forma remota|100% remot/i.test(pg.texto)),
  );
  return {
    ...CARACTERISTICAS_PADRAO,
    porte,
    campo: !remoto,
    abordagem: abordagem === "adaptativa" ? "adaptativa" : abordagem === "hibrida" ? "híbrida" : "preditiva",
    fases: (a?.fases.length ?? 0) > 1 ? "várias" : "uma",
    subcontratacao: /vedad/.test(sub)
      ? "vedada"
      : /permitid|admitid/.test(sub)
        ? "permitida"
        : "não informada",
  };
}

/** Mapa do plano gerado: o que o código acha pelo título; o que o GP dispensou fica dispensado. */
export function mapaDoPgpGerado(dossie: Dossie, pgp: DocumentoLido): ParteConfirmada[] {
  const p = dossie.pgp ?? pgpInicial();
  const justificativas = new Map(
    (p.adaptacao?.resposta.partes ?? []).map((s) => [s.codigo, s.justificativa]),
  );
  return confirmacaoInicial(proporMapa(pgp.paginas, PARTES_PGP)).map((m) =>
    p.gerar[m.codigo] === false
      ? { codigo: m.codigo, situacao: "dispensada", justificativa: justificativas.get(m.codigo) }
      : m,
  );
}

export function autoconferir(dossie: Dossie, e: EntradaPgp, agora = new Date()): ResultadoConferencia {
  const pgp = pgpComoDocumento(dossie, agora);
  const p = dossie.pgp ?? pgpInicial();
  return conferirPlano({
    pgp: pgp.paginas,
    tap: e.tap?.paginas,
    rfp: e.rfp.flatMap((d) => d.paginas),
    partes: PARTES_PGP,
    premissas: PREMISSAS_CRITICAS,
    mapa: mapaDoPgpGerado(dossie, pgp),
    caracteristicas: caracteristicasDoPgp(dossie, e),
    premissasAplicaveis: p.premissasAplicaveis ?? e.premissasAnteriores,
    requisitos: e.ponto.requisitos,
  });
}

/**
 * Separa os vagos que são decisões do GP ainda vazias ("a definir pelo GP" no trecho): no plano final eles seriam
 * vagos, mas na minuta são pendências que só o GP resolve, e a tela os mostra à parte.
 */
export function separarDecisoesPendentes(achados: Achado[]): { decisoes: Achado[]; demais: Achado[] } {
  const decisao = (a: Achado) =>
    a.tipo === "vago" && a.evidencias.some((e) => /a definir pelo GP|decis[aã]o do GP/i.test(e.trecho));
  return { decisoes: achados.filter(decisao), demais: achados.filter((a) => !decisao(a)) };
}
