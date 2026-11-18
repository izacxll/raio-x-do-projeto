// Etapa 4, passo 13 (código): autoconferência. Antes da exportação, o plano gerado passa pelas regras da etapa 5
// (vago, conflituoso, ausente; gravidade pela parte; categoria pela regra fixa). O que o GP dispensou na adaptação
// fica "dispensada" no mapa e não conta como ausente. O que as regras acharem aparece para o GP corrigir.
import {
  CARACTERISTICAS_PADRAO,
  pareceEstudoSensivel,
  type Caracteristicas,
} from "../../dominio/caracteristicas";
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
import { itensDoPgp, pgpInicial } from "./pgp";
import { itensValidos, textoFinal } from "../../pmo/itens";
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
 * partir da adaptação e da RFP (porte pelo número de produtos e pelo prazo; campo pelo "formato remoto"; estudo sensível
 * pelos sinais da decisão 0043). O resto
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
    exposicao: pareceEstudoSensivel(e.rfp.flatMap((d) => d.paginas.map((pg) => pg.texto)))
      ? "sensível"
      : "comum",
  };
}

/** Mapa do plano gerado: o que o código acha pelo título; o que o GP dispensou fica dispensado. */
export function mapaDoPgpGerado(dossie: Dossie, pgp: DocumentoLido): ParteConfirmada[] {
  const p = dossie.pgp ?? pgpInicial();
  const justificativas = new Map(
    (p.adaptacao?.resposta.partes ?? []).map((s) => [s.codigo, s.justificativa]),
  );
  // parte cujo passo não foi pedido tem só o título e "A gerar": não existe ainda, e a faixa dela não é procurada
  const naoGeradas = partesNaoGeradas(p);
  return confirmacaoInicial(proporMapa(pgp.paginas, PARTES_PGP)).map((m) =>
    p.gerar[m.codigo] === false
      ? { codigo: m.codigo, situacao: "dispensada", justificativa: justificativas.get(m.codigo) }
      : naoGeradas.has(m.codigo)
        ? { codigo: m.codigo, situacao: "nao-existe" }
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
  const r = ligarPeloId(conferirTodoOPlano(dossie, e, agora), p, e);
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

/**
 * No plano da própria ferramenta, o item de conteúdo mínimo que a busca de termos não achou, mas que o PMO marcou
 * "presente" apontando um item, vale quando o código confere o id: o item existe, está na parte da ficha e não foi
 * descartado pelo GP. A busca procura termos exatos ("critério de entrada"); a redação do PMO varia ("Critérios de
 * entrada"). No plano de fora (etapa 5) não há marca, e continua valendo a busca.
 */
export function ligarPeloId(r: ResultadoConferencia, p: PgpDossie, e: EntradaPgp): ResultadoConferencia {
  const validos = itensValidos(p.revisoes, itensDoPgp(p, e.documentos, e.premissasTap));
  const parteDoItem = new Map<string, string>();
  for (const i of validos) {
    const parte = i.grupo.split(" — ")[0] ?? "";
    parteDoItem.set(i.item.id, parte);
    // risco: o PMO aponta pelo id do risco (rk9), não pelo id do item
    const k = /^riscos:B27:(\d+)$/.exec(i.id)?.[1];
    const risco = k !== undefined ? p.riscos?.resposta.riscos[Number(k)] : undefined;
    if (risco) parteDoItem.set(risco.id, "B27");
  }
  const marcas = new Map(
    marcasDoPgp(p)
      .filter((m) => m.estado === "presente")
      .map((m) => [m.item.trim(), m.onde]),
  );
  const ligados = new Map<string, string[]>();
  for (const a of r.achados) {
    const m = /^conteudo-minimo:([AB]\d+):([AB]\d+\.\d+)$/.exec(a.id);
    if (!m || a.tipo !== "ausente") continue;
    const [, parte, codigo] = m;
    const ids = (marcas.get(codigo!) ?? "")
      .split(/[\s,;]+|\ba\b/)
      .map((x) => x.trim())
      .filter(Boolean);
    const naParte = ids.filter((id) => parteDoItem.get(id) === parte);
    if (naParte.length) ligados.set(codigo!, naParte);
  }
  if (!ligados.size) return r;
  return {
    achados: r.achados.filter((a) => {
      const c = /:([AB]\d+\.\d+)$/.exec(a.id)?.[1];
      return !(a.regra === "conteudo-minimo" && c && ligados.has(c));
    }),
    verificacoes: [
      ...r.verificacoes.map((v) => {
        const c = /^item:([AB]\d+\.\d+)$/.exec(v.id)?.[1];
        const ids = c ? ligados.get(c) : undefined;
        return ids && v.estado === "achado"
          ? {
              ...v,
              estado: "pela-marca-do-pmo" as const,
              detalhe: `Presente pela marca do PMO (item ${ids.join(", ")}, id conferido pelo código), redação a conferir: os termos da ficha não aparecem.`,
            }
          : v;
      }),
      {
        id: "presentes-pela-marca-do-pmo",
        alvo: "conteúdo mínimo",
        descricao: "Itens presentes pela marca do PMO, redação a conferir",
        estado: "pela-marca-do-pmo" as const,
        detalhe: `${ligados.size} item(ns): ${[...ligados.entries()].map(([c, ids]) => `${c} (${ids.join(", ")})`).join("; ")}.`,
      },
    ],
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

/**
 * Para a etapa 5 (decisão 0076): os itens do conteúdo mínimo que a autoconferência da etapa 4 marcou "presente", com
 * o texto final (editado pelo GP, sem os descartados) de cada item apontado em "onde". O código procura esse texto no
 * plano antes de dar o item como ausente. Sem a etapa 4 no dossiê, undefined.
 */
export function presentesPelaMarcaDoDossie(p: PgpDossie | undefined): Record<string, string[]> | undefined {
  if (!p) return undefined;
  // o texto e a parte de cada item: a marca só vale com ids da parte do item, como no ligarPeloId da etapa 4
  const textoDe = new Map<string, { texto: string; parte: string }>();
  for (const i of itensValidos(p.revisoes, itensDoPgp(p, []))) {
    const texto = textoFinal(i, p.revisoes);
    textoDe.set(i.item.id, { texto, parte: i.grupo.split(" — ")[0] ?? "" });
    // risco: o PMO aponta pelo id do risco (rk9), não pelo id do item
    const k = /^riscos:B27:(\d+)$/.exec(i.id)?.[1];
    const risco = k !== undefined ? p.riscos?.resposta.riscos[Number(k)] : undefined;
    if (risco) textoDe.set(risco.id, { texto, parte: "B27" });
  }
  const out: Record<string, string[]> = {};
  for (const m of marcasDoPgp(p)) {
    if (m.estado !== "presente") continue;
    const parte = m.item.trim().split(".")[0];
    const textos = (m.onde ?? "")
      .split(/[\s,;]+|\ba\b/)
      .map((x) => textoDe.get(x.trim()))
      .filter((x) => x?.parte === parte)
      .map((x) => x!.texto);
    if (textos.length) out[m.item.trim()] = [...(out[m.item.trim()] ?? []), ...textos];
  }
  return out;
}
