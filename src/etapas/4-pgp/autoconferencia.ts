// Etapa 4, passo 13 (código): autoconferência. Antes da exportação, o plano gerado passa pelas regras da etapa 5
// (vago, conflituoso, ausente; gravidade pela parte; categoria pela regra fixa). O que o GP dispensou na adaptação
// fica "dispensada" no mapa e não conta como ausente. O que as regras acharem aparece para o GP corrigir.
import { CARACTERISTICAS_PADRAO, type Caracteristicas } from "../../dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../dominio/skill";
import type { DocumentoLido, Dossie, PgpDossie } from "../../dossie/esquema";
import {
  conferirAutoconferencia,
  partesARegenerar,
  type ResultadoAutoconferencia,
} from "../../pmo/autoconferencia";
import type { ItemAutoconferencia } from "../../pmo/schemas/comum";
import { montarPgp } from "../../exportacao/relatorio-pgp";
import type { Achado } from "../../regras/achado";
import { conferirPlano, type ResultadoConferencia } from "../../regras/conferencia";
import { confirmacaoInicial, proporMapa, type ParteConfirmada } from "../../regras/mapa-pgp";
import { documentoDeExportavel } from "../documento-virtual";
import type { EntradaPgp } from "./entrada";
import { pgpInicial } from "./pgp";
import { NOME_PASSO_PGP, passoDaParte } from "./passos";

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

/** Partes cujo passo ainda não foi pedido ao PMO: na página só há o título e "A gerar". */
export function partesNaoGeradas(p: PgpDossie): Set<string> {
  return new Set(
    PARTES_PGP.map((x) => x.codigo).filter((c) => {
      const passo = passoDaParte(c);
      return passo !== undefined && !p[passo.passo];
    }),
  );
}

/**
 * Conferência do plano gerado pelas regras da etapa 5. Parte cujo passo ainda não foi pedido não é cobrada: a
 * verificação dela fica "não conferido" e os achados só dela saem (voltam quando o passo for respondido).
 */
export function autoconferir(dossie: Dossie, e: EntradaPgp, agora = new Date()): ResultadoConferencia {
  const p = dossie.pgp ?? pgpInicial();
  const r = conferirTodoOPlano(dossie, e, agora);
  const naoGeradas = partesNaoGeradas(p);
  if (!naoGeradas.size) return r;
  const daParte = (id: string) => /[:]([AB]\d+)(?:\.\d+)?$/.exec(id)?.[1];
  return {
    achados: r.achados.filter((a) => !a.partes.every((x) => naoGeradas.has(x))),
    verificacoes: r.verificacoes.map((v) => {
      const parte = daParte(v.id);
      return parte && naoGeradas.has(parte) && v.estado === "achado"
        ? {
            ...v,
            estado: "nao-conferido" as const,
            detalhe: `Parte ${parte} ainda não gerada (passo "${NOME_PASSO_PGP[passoDaParte(parte)!.passo]}" não pedido ao PMO).`,
          }
        : v;
    }),
  };
}

function conferirTodoOPlano(dossie: Dossie, e: EntradaPgp, agora: Date): ResultadoConferencia {
  const pgp = pgpComoDocumento(dossie, agora);
  const p = dossie.pgp ?? pgpInicial();
  return conferirPlano({
    planoDaFerramenta: true,
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

// ---------- Autoconferência do PMO, item a item das fichas (decisão 0044) ----------

/**
 * Itens esperados na autoconferência do PMO: todos os itens das fichas das partes que o GP manteve (as que ele
 * dispensou não entram). Item que a condição de dispensa da ficha tira para o projeto continua esperado: o PMO o
 * marca como "dispensado", com o motivo. Porte pequeno reduz partes, não a cobertura das partes mantidas.
 */
export function itensEsperadosDoPgp(gerar: Record<string, boolean>): string[] {
  return PARTES_PGP.filter((p) => gerar[p.codigo] === true).flatMap((p) => p.itens.map((i) => i.codigo));
}

/** As marcas de autoconferência de todos os passos do PGP que o PMO já respondeu. */
export function marcasDoPgp(p: PgpDossie): ItemAutoconferencia[] {
  return [p.adaptacao, p.escopo, p.cronograma, p.riscos, p.planos, p.execucao].flatMap(
    (r) => r?.resposta.autoconferencia ?? [],
  );
}

/**
 * Confere a autoconferência do PMO no PGP: item sem marca ou com marca incompleta volta ao PMO, num pedido só da
 * parte dele ("ausente" não é estado final de item de parte essencial).
 */
export function conferirAutoconferenciaDoPgp(
  p: PgpDossie,
): ResultadoAutoconferencia & { regenerar: string[] } {
  const r = conferirAutoconferencia(itensEsperadosDoPgp(p.gerar), marcasDoPgp(p));
  return { ...r, regenerar: partesARegenerar(r) };
}
