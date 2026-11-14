// Etapa 1 — Leitura e análise da RFP, só com código. Junta os passos 1 a 11 da especificação numa análise,
// recalculada a partir do texto: as decisões do GP ficam no dossiê, ligadas ao id estável de cada item.
import type { DocumentoLido } from "../../dossie/esquema";
import type { Requisito } from "../../extracao/requisitos";
import { extrairHabilitacao } from "../../extracao/rfp/habilitacao";
import { extrairIdentificacao } from "../../extracao/rfp/identificacao";
import {
  prepararDocumento,
  type DocumentoRfp,
  type ItemAnalise,
  type SecaoAnalise,
} from "../../extracao/rfp/item";
import { extrairJulgamento } from "../../extracao/rfp/julgamento";
import { mapearRfp, NOME_TEMA, type MapaRfp } from "../../extracao/rfp/mapa";
import { extrairPartesInteressadas } from "../../extracao/rfp/partes-interessadas";
import { extrairPrazos } from "../../extracao/rfp/prazos";
import { extrairRequisitosRfp } from "../../extracao/rfp/requisitos-rfp";
import { extrairTemas, valorDoTema } from "../../extracao/rfp/temas";
import { aplicarRegrasRfp, type EstadoRegra } from "../../regras/brechas-rfp";

export const NOME_SECAO: Record<SecaoAnalise, string> = {
  atencao: "Pontos de atenção para participar ou não",
  identificacao: "Identificação",
  mapa: "Mapa do documento",
  requisitos: "Requisitos",
  prazos: "Prazos",
  julgamento: "Julgamento",
  habilitacao: "Habilitação",
  apresentacao: "Forma de apresentação",
  condicoes: "Condições contratuais",
  partes: "Partes interessadas citadas",
  brechas: "Vagos e brechas",
};

export const ORDEM_SECOES: SecaoAnalise[] = [
  "atencao",
  "identificacao",
  "mapa",
  "requisitos",
  "prazos",
  "julgamento",
  "habilitacao",
  "apresentacao",
  "condicoes",
  "partes",
  "brechas",
];

export interface AnaliseRfp {
  documentos: DocumentoRfp[];
  mapa: MapaRfp;
  itens: ItemAnalise[];
  /** Requisitos que o código extraiu agora. Os que valem são os guardados no dossiê (com os números fixos). */
  requisitosDoCodigo: Requisito[];
  regras: EstadoRegra[];
}

export function documentosDaRfp(documentos: DocumentoLido[]): DocumentoRfp[] {
  const rfp = documentos.filter((d) => d.papel === "rfp");
  const anexos = documentos.filter((d) => d.papel === "anexo-rfp");
  return [
    ...rfp.map((d) => prepararDocumento(d.id, "RFP", d.paginas)),
    ...anexos.map((d) => prepararDocumento(d.id, `Anexo: ${d.nomeArquivo}`, d.paginas)),
  ];
}

function itensDoMapa(mapa: MapaRfp): ItemAnalise[] {
  return mapa.secoes.map((s) => ({
    id: `mapa:${s.docId}:${s.pagina}:${s.posicao}`,
    secao: "mapa",
    rotulo: "documento",
    nome: s.tipo === "anexo" ? "Anexo" : s.anexo ? `Seção (${s.anexo})` : "Seção do corpo",
    texto: s.titulo,
    campos: {
      Páginas: s.pagina === s.paginaFinal ? String(s.pagina) : `${s.pagina} a ${s.paginaFinal}`,
      Tema: s.tema ? NOME_TEMA[s.tema] : "—",
    },
    origem: { documento: s.documento, pagina: s.pagina, trecho: s.titulo },
    situacao: "localizado",
  }));
}

const NOTA_ATENCAO = "Insumo para a decisão de participar. Quem decide é o GP.";

function atencao(itens: ItemAnalise[], requisitos: Requisito[], docs: DocumentoRfp[]): ItemAnalise[] {
  const out: ItemAnalise[] = [];
  const copia = (id: string, nome: string, fonte: ItemAnalise | undefined, texto?: string) => {
    if (!fonte || fonte.situacao === "nao-localizado" || fonte.situacao === "nao-verificavel") return;
    out.push({
      id: `atencao:${id}`,
      secao: "atencao",
      rotulo: "documento",
      nome,
      texto: texto ?? fonte.texto,
      origem: fonte.origem,
      situacao: fonte.situacao,
      nota: fonte.nota ? `${fonte.nota} ${NOTA_ATENCAO}` : NOTA_ATENCAO,
    });
  };
  const porId = (id: string) => itens.find((i) => i.id === id);
  const primeiro = (prefixo: string) => itens.find((i) => i.id.startsWith(prefixo));

  const limite = primeiro("prazos:esclarecimento:");
  copia(
    "esclarecimento",
    "Prazo para pedir esclarecimento",
    limite,
    limite && `${limite.texto}${limite.campos?.Alerta ? ` — ${limite.campos.Alerta}` : ""}`,
  );
  const sessao = primeiro("prazos:certame:sessao") ?? primeiro("prazos:certame:entrega");
  copia(
    "sessao",
    "Data do certame",
    sessao,
    sessao && `${sessao.nome}: ${sessao.texto}${sessao.campos?.Alerta ? ` — ${sessao.campos.Alerta}` : ""}`,
  );
  copia("valor", "Valor estimado", porId("identificacao:valor"));
  copia("criterio", "Critério de julgamento", porId("julgamento:criterio"));

  const equipe = requisitos.filter((r) => r.tipo === "equipe");
  if (equipe.length)
    out.push({
      id: "atencao:equipe",
      secao: "atencao",
      rotulo: "documento",
      nome: "Equipe exigida",
      texto: `${equipe.length} ${equipe.length === 1 ? "perfil citado" : "perfis citados"}: ${equipe.map((r) => r.rotulo.replace(/^Equipe: /, "")).join("; ")}`,
      origem: {
        documento: equipe[0]?.documento ?? "RFP",
        pagina: equipe[0]?.pagina ?? 1,
        trecho: equipe[0]?.trecho ?? "",
      },
      situacao: "localizado",
      nota: NOTA_ATENCAO,
    });
  copia("atestado", "Atestado de capacidade técnica", porId("habilitacao:atestado"));
  copia("vistoria", "Vistoria ou visita técnica", porId("habilitacao:vistoria"));
  copia("garantia", "Garantia de execução", valorDoTema(itens, "garantia-execucao"));
  copia("penalidades", "Penalidades", valorDoTema(itens, "penalidades"));
  copia("subcontratacao", "Subcontratação", valorDoTema(itens, "subcontratacao"));

  const brechas = itens.filter((i) => i.secao === "brechas");
  if (brechas.length) {
    const porTipo = new Map<string, number>();
    for (const b of brechas) porTipo.set(b.campos?.Tipo ?? "", (porTipo.get(b.campos?.Tipo ?? "") ?? 0) + 1);
    const serias = brechas.filter((b) => b.campos?.Tipo !== "vago");
    const primeira = serias[0] ?? brechas[0];
    out.push({
      id: "atencao:brechas",
      secao: "atencao",
      rotulo: "sugestao",
      nome: "Brechas do texto",
      texto: `${brechas.length} pontos com pergunta de esclarecimento sugerida: ${[...porTipo.entries()].map(([t, n]) => `${n} ${t}`).join(", ")}.${
        serias.length
          ? ` Recomenda-se avaliar primeiro: ${serias
              .slice(0, 3)
              .map((b) => b.nome)
              .join("; ")}.`
          : ""
      }`,
      origem: primeira?.origem,
      situacao: "localizado",
      nota: NOTA_ATENCAO,
    });
  }
  const ilegiveis = docs.filter((d) => d.ilegiveis.length);
  if (ilegiveis.length)
    out.push({
      id: "atencao:ilegiveis",
      secao: "atencao",
      rotulo: "documento",
      nome: "Páginas sem texto legível",
      texto: ilegiveis.map((d) => `${d.rotulo}: p. ${d.ilegiveis.join(", ")}`).join("; "),
      situacao: "nao-verificavel",
      nota: "O que estiver nessas páginas não foi lido pelo código: conferir no documento antes de decidir.",
    });
  return out;
}

/**
 * A análise é pura: mesmos documentos (o mesmo objeto lido) no mesmo dia dão o mesmo resultado. As etapas 2, 3 e 4
 * a pedem várias vezes a cada mudança na tela (ponto de partida, TAP, proposta); o resultado fica guardado.
 */
const analisesFeitas = new WeakMap<DocumentoLido, { chave: string; analise: AnaliseRfp }>();

export function analisarRfp(documentos: DocumentoLido[], hoje = new Date()): AnaliseRfp {
  const primeiro = documentos[0];
  const chave = `${documentos.map((d) => `${d.id}:${d.lidoEm}:${d.papel}`).join("|")}@${hoje.toDateString()}`;
  const guardada = primeiro ? analisesFeitas.get(primeiro) : undefined;
  if (guardada && guardada.chave === chave) return guardada.analise;
  const analise = analisarRfpSemGuardar(documentos, hoje);
  if (primeiro) analisesFeitas.set(primeiro, { chave, analise });
  return analise;
}

function analisarRfpSemGuardar(documentos: DocumentoLido[], hoje: Date): AnaliseRfp {
  const docs = documentosDaRfp(documentos);
  const mapa = mapearRfp(docs);
  const identificacao = extrairIdentificacao(docs, mapa);
  const requisitosDoCodigo = extrairRequisitosRfp(docs, mapa);
  const brechas = aplicarRegrasRfp(docs, mapa);
  const itens: ItemAnalise[] = [
    ...identificacao,
    ...itensDoMapa(mapa),
    ...extrairPrazos(docs, mapa, hoje),
    ...extrairJulgamento(docs, mapa),
    ...extrairHabilitacao(docs, mapa),
    ...extrairTemas(docs, mapa),
    ...extrairPartesInteressadas(
      docs,
      identificacao.find((i) => i.id === "identificacao:contratante"),
    ),
    ...brechas.itens,
  ];
  // ids repetidos (o mesmo item em dois documentos) ganham sufixo: a decisão do GP não pode cair em dois itens
  const contagem = new Map<string, number>();
  for (const i of itens) {
    const n = contagem.get(i.id) ?? 0;
    contagem.set(i.id, n + 1);
    if (n) i.id = `${i.id}#${n + 1}`;
  }
  return {
    documentos: docs,
    mapa,
    itens: [...atencao(itens, requisitosDoCodigo, docs), ...itens],
    requisitosDoCodigo,
    regras: brechas.regras,
  };
}
