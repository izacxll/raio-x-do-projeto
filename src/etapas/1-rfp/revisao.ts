// Revisão do GP na etapa 1: cada item da análise tem estado (pendente, aceito, editado, descartado), guardado no
// dossiê pelo id. Os requisitos ficam guardados no dossiê com o número fixo: é a lista que segue para a
// proposta, o TAP, o PGP e a conferência.
import type { AnaliseRfpDossie, EstadoItem, RevisaoItem } from "../../dossie/esquema";
import type { ItemAnalise } from "../../extracao/rfp/item";
import type { Requisito, TipoRequisito } from "../../extracao/requisitos";
import type { AnaliseRfp } from "./analisar-rfp";

export const NOME_TIPO_REQUISITO: Record<TipoRequisito, string> = {
  produto: "Produto ou entregável",
  equipe: "Equipe mínima",
  quantidade: "Quantidade",
  local: "Local",
  outro: "Incluído pelo GP",
};

export function analiseInicial(analise: AnaliseRfp, agora = new Date()): AnaliseRfpDossie {
  return {
    requisitos: analise.requisitosDoCodigo,
    proximoRequisito: analise.requisitosDoCodigo.length + 1,
    revisoes: {},
    participacao: { decisao: "a-decidir" },
    executadaEm: agora.toISOString(),
  };
}

export function idDoRequisito(r: Pick<Requisito, "numero">): string {
  return `requisito:${r.numero}`;
}

export function requisitoComoItem(r: Requisito): ItemAnalise {
  const doCodigo = r.origem === "codigo";
  return {
    id: idDoRequisito(r),
    secao: "requisitos",
    rotulo: doCodigo ? "documento" : "decisao-gp",
    nome: `${r.numero} · ${r.rotulo}`,
    texto: r.descricao,
    campos: { Número: r.numero, Tipo: NOME_TIPO_REQUISITO[r.tipo ?? "produto"] },
    origem: doCodigo ? { documento: r.documento ?? "RFP", pagina: r.pagina, trecho: r.trecho } : undefined,
    situacao: "localizado",
    nota: doCodigo ? undefined : "Incluído pelo GP.",
  };
}

/** Os itens da análise com os requisitos do dossiê no lugar dos que o código acabou de extrair. */
export function itensFinais(analise: AnaliseRfp, dossie: AnaliseRfpDossie): ItemAnalise[] {
  return [
    ...analise.itens.filter((i) => i.secao !== "requisitos"),
    ...dossie.requisitos.map(requisitoComoItem),
  ];
}

/** O mapa é informativo (ajuda a navegar); todo o resto passa pela revisão do GP. */
export function ehRevisavel(i: ItemAnalise): boolean {
  return i.secao !== "mapa";
}

export function estadoDoItem(revisoes: Record<string, RevisaoItem>, id: string): EstadoItem {
  return revisoes[id]?.estado ?? "pendente";
}

/** O texto que vale: o editado pelo GP, ou a pergunta (nas brechas), ou o conteúdo do item. */
export function textoFinal(i: ItemAnalise, revisoes: Record<string, RevisaoItem>): string {
  const r = revisoes[i.id];
  if (r?.estado === "editado" && r.textoEditado?.trim()) return r.textoEditado;
  return i.pergunta ?? i.texto;
}

export function contarPendentes(itens: ItemAnalise[], revisoes: Record<string, RevisaoItem>): number {
  return itens.filter((i) => ehRevisavel(i) && estadoDoItem(revisoes, i.id) === "pendente").length;
}

/** Requisitos que seguem para a etapa 5: os não descartados, com a descrição editada pelo GP. */
export function requisitosValidos(dossie: AnaliseRfpDossie): Requisito[] {
  return dossie.requisitos
    .filter((r) => estadoDoItem(dossie.revisoes, idDoRequisito(r)) !== "descartado")
    .map((r) => {
      const rev = dossie.revisoes[idDoRequisito(r)];
      return rev?.estado === "editado" && rev.textoEditado?.trim()
        ? { ...r, descricao: rev.textoEditado }
        : r;
    });
}

/** Requisito novo incluído pelo GP: ganha o próximo número, e o número nunca é reaproveitado. */
export function incluirRequisito(
  dossie: AnaliseRfpDossie,
  rotulo: string,
  descricao: string,
): AnaliseRfpDossie {
  const numero = `R${String(dossie.proximoRequisito).padStart(2, "0")}`;
  const novo: Requisito = {
    numero,
    rotulo: rotulo.trim() || "Requisito",
    descricao: descricao.trim(),
    pagina: 0,
    trecho: "",
    origem: "gp",
    tipo: "outro",
  };
  return {
    ...dossie,
    requisitos: [...dossie.requisitos, novo],
    proximoRequisito: dossie.proximoRequisito + 1,
    // incluído pelo GP já está revisado por ele
    revisoes: { ...dossie.revisoes, [idDoRequisito(novo)]: { estado: "aceito" } },
  };
}
