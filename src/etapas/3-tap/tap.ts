// Etapa 3: os itens que o PMO devolveu (12 elementos e registro de premissas), achatados com um id estável, cada um
// com a conferência do código. Também as pendências que mantêm o cabeçalho de minuta.
import { MODELO_PADRAO } from "../../config/modelo";
import type { DocumentoLido, TapDossie } from "../../dossie/esquema";
import { contarPendentes, type ItemConferido } from "../../pmo/itens";
import { conferirItem } from "../../pmo/redacao";
import type { ItemPmo } from "../../pmo/schemas/comum";
import type { RespostaPremissas, RespostaTap } from "../../pmo/schemas/tap";
import { pedeDecisao, type Divergencia } from "./divergencias";

export type PassoTap = "tap" | "premissas";

export function tapInicial(modelo: string = MODELO_PADRAO): TapDossie {
  return { modelo, revisoes: {}, divergencias: {}, decisoes: {}, uso: [] };
}

/** Os 12 elementos do TAP (Anexo C; ficha TAP), na ordem do documento, e os campos da resposta de cada um. */
export const ELEMENTOS_TAP: {
  codigo: string;
  nome: string;
  campos: (keyof RespostaTap)[];
  decisaoGp?: boolean;
}[] = [
  { codigo: "TAP.1", nome: "Finalidade do projeto", campos: ["finalidade"] },
  { codigo: "TAP.2", nome: "Objetivos mensuráveis e critérios de sucesso", campos: ["objetivos"] },
  { codigo: "TAP.3", nome: "Requisitos de alto nível", campos: ["requisitosAltoNivel"] },
  {
    codigo: "TAP.4",
    nome: "Descrição de alto nível, limites e entregas-chave",
    campos: ["descricao", "entregas", "limites"],
  },
  { codigo: "TAP.5", nome: "Risco geral do projeto", campos: ["riscoGeral"] },
  { codigo: "TAP.6", nome: "Resumo do cronograma de marcos", campos: ["marcos"] },
  {
    codigo: "TAP.7",
    nome: "Recursos financeiros pré-aprovados",
    campos: ["recursosFinanceiros"],
    decisaoGp: true,
  },
  { codigo: "TAP.8", nome: "Partes interessadas-chave", campos: ["partesInteressadas"] },
  { codigo: "TAP.9", nome: "Requisitos para aprovação do projeto", campos: ["aprovacao"] },
  { codigo: "TAP.10", nome: "Critérios de término e de cancelamento", campos: ["termino"] },
  {
    codigo: "TAP.11",
    nome: "Gerente do projeto designado, responsabilidade e nível de autoridade",
    campos: ["gerente"],
    decisaoGp: true,
  },
  {
    codigo: "TAP.12",
    nome: "Patrocinador ou quem autoriza o TAP",
    campos: ["patrocinador"],
    decisaoGp: true,
  },
];

const NOME_SUBGRUPO: Partial<Record<keyof RespostaTap, string>> = {
  descricao: "Descrição",
  entregas: "Entregas-chave",
  limites: "Limites (fora do escopo)",
};

export function grupoDoElemento(codigo: string, campo?: keyof RespostaTap): string {
  const e = ELEMENTOS_TAP.find((x) => x.codigo === codigo);
  const sub = campo ? NOME_SUBGRUPO[campo] : undefined;
  return `${codigo} — ${e?.nome ?? codigo}${sub ? ` · ${sub}` : ""}`;
}

export function itensDoTap(r: RespostaTap, docs: DocumentoLido[]): ItemConferido[] {
  const out: ItemConferido[] = [];
  const add = (id: string, grupo: string, item: ItemPmo, complemento?: string) =>
    out.push({ id, passo: "tap", grupo, item, complemento, conferencia: conferirItem(item, docs) });
  for (const el of ELEMENTOS_TAP)
    for (const campo of el.campos) {
      const grupo = grupoDoElemento(el.codigo, el.campos.length > 1 ? campo : undefined);
      if (campo === "objetivos")
        r.objetivos.forEach((o, k) =>
          add(
            `tap:objetivos:${k}`,
            grupo,
            o.item,
            `Critério de sucesso: ${o.criterioDeSucesso || "a definir pelo GP"} (métrica ${o.origemDaMetrica === "documento" ? "do documento" : "sugerida pelo PMO"}).`,
          ),
        );
      else if (campo === "marcos")
        r.marcos.forEach((m, k) =>
          add(`tap:marcos:${k}`, grupo, m.item, m.prazo ? `Prazo: ${m.prazo}.` : "Prazo: a definir pelo GP."),
        );
      else if (campo === "partesInteressadas")
        r.partesInteressadas.forEach((p, k) =>
          add(
            `tap:partesInteressadas:${k}`,
            grupo,
            p.item,
            `Papel: ${p.papel || "a definir pelo GP"}. Decide: ${p.decide || "a definir pelo GP"}.`,
          ),
        );
      else (r[campo] as ItemPmo[]).forEach((item, k) => add(`tap:${campo}:${k}`, grupo, item));
    }
  r.observacoes.forEach((item, k) => add(`tap:observacoes:${k}`, "Observações do PMO", item));
  return out;
}

export function itensDasPremissas(r: RespostaPremissas, docs: DocumentoLido[]): ItemConferido[] {
  const out: ItemConferido[] = r.premissas.map((p, k) => ({
    id: `premissas:${k}`,
    passo: "premissas",
    grupo: p.tipo === "restricao" ? "Restrições" : p.premissaCritica ? "Premissas críticas" : "Premissas",
    item: p.item,
    complemento: [
      p.premissaCritica ? `Premissa crítica ${p.premissaCritica}.` : "",
      p.consequencia ? `Se não se confirmar: ${p.consequencia}` : "",
      `Depende de: ${p.dependeDe || "a definir pelo GP"}.`,
      `Como validar: ${p.comoValidar || "a definir pelo GP"}.`,
    ]
      .filter(Boolean)
      .join(" "),
    conferencia: conferirItem(p.item, docs),
  }));
  r.observacoes.forEach((item, k) =>
    out.push({
      id: `premissas:observacoes:${k}`,
      passo: "premissas",
      grupo: "Observações do PMO",
      item,
      conferencia: conferirItem(item, docs),
    }),
  );
  return out;
}

export function itensDaEtapa3(t: TapDossie, docs: DocumentoLido[]): ItemConferido[] {
  return [
    ...(t.tap ? itensDoTap(t.tap.resposta, docs) : []),
    ...(t.premissas ? itensDasPremissas(t.premissas.resposta, docs) : []),
  ];
}

/** Divergências que pedem decisão do GP e ainda não têm. */
export function divergenciasSemDecisao(t: TapDossie, divergencias: Divergencia[]): Divergencia[] {
  return divergencias.filter((d) => pedeDecisao(d) && !t.divergencias[d.id]);
}

/**
 * Pendências que mantêm o cabeçalho de minuta: item sem revisão, divergência sem decisão e o TAP sem a aprovação
 * do GP (quem aprovou e quando).
 */
export function contarPendentesTap(
  t: TapDossie,
  itens: ItemConferido[],
  divergencias: Divergencia[],
): number {
  let n = contarPendentes(t.revisoes, itens) + divergenciasSemDecisao(t, divergencias).length;
  if (t.tap && !(t.decisoes.aprovadoPor?.trim() && t.decisoes.aprovadoEm)) n++;
  return n;
}
