// Etapa 3, passo 2 (código): o que vem direto dos documentos, com a página. Contratante, objeto, valor, prazos,
// produtos, marcos, aceite, extinção e partes. O PMO recebe isto pronto e não refaz.
import type { ItemAnalise } from "../../extracao/rfp/item";
import { formatarData } from "../../texto/datas";
import { valorNaProposta, type EntradaTap } from "./entrada";

export interface DadoDoDocumento {
  id: string;
  /** Elemento do TAP a que o dado serve (TAP.1…TAP.12). */
  elemento: string;
  nome: string;
  texto: string;
  /** "RFP, p. 19", "proposta, p. 3"… */
  onde?: string;
  /** documento: tirado do texto; calculado: conta do código sobre os documentos; nao-localizado: conferir. */
  origem: "documento" | "calculado" | "nao-localizado";
}

const NAO = "não localizado pelo código — conferir no documento";

function doItem(id: string, elemento: string, nome: string, i?: ItemAnalise): DadoDoDocumento {
  if (!i || i.situacao === "nao-localizado" || i.situacao === "nao-verificavel")
    return { id, elemento, nome, texto: NAO, origem: "nao-localizado" };
  return {
    id,
    elemento,
    nome,
    texto: i.texto,
    onde: i.origem ? `${i.origem.documento}, p. ${i.origem.pagina}` : undefined,
    origem: "documento",
  };
}

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function dadosDosDocumentos(e: EntradaTap): DadoDoDocumento[] {
  const itens = e.ponto.analise.itens;
  const porId = (id: string) => itens.find((i) => i.id === id);
  const out: DadoDoDocumento[] = [
    doItem("contratante", "TAP.8", "Contratante", porId("identificacao:contratante")),
    doItem("objeto", "TAP.1", "Objeto", porId("identificacao:objeto")),
    doItem("instrumento", "TAP.4", "Instrumento e modalidade", porId("identificacao:modalidade")),
  ];
  const prazo = e.ponto.prazoExecucao;
  out.push(
    prazo
      ? {
          id: "prazo",
          elemento: "TAP.6",
          nome: "Vigência ou prazo de execução",
          texto: prazo.texto,
          onde: prazo.origem ? `${prazo.origem.documento}, p. ${prazo.origem.pagina}` : undefined,
          origem: "documento",
        }
      : {
          id: "prazo",
          elemento: "TAP.6",
          nome: "Vigência ou prazo de execução",
          texto: NAO,
          origem: "nao-localizado",
        },
  );
  for (const r of e.ponto.requisitos.filter((x) => x.tipo === "produto"))
    out.push({
      id: `produto:${r.numero}`,
      elemento: "TAP.4",
      nome: `Produto ${r.numero}`,
      texto: `${r.rotulo}: ${r.descricao}`,
      onde: r.pagina ? `${r.documento ?? "RFP"}, p. ${r.pagina}` : "incluído pelo GP",
      origem: "documento",
    });
  // valor: o da proposta (o TAP firma o valor do contrato, igual ao da proposta vencedora)
  if (e.dados) {
    out.push({
      id: "valor",
      elemento: "TAP.7",
      nome: "Valor da proposta",
      texto: e.dados.valor
        ? `${reais(e.dados.valor)} (preço final, decisão do GP na etapa 2)`
        : "preço final não preenchido na etapa 2 — a definir pelo GP",
      onde: "proposta (dossiê)",
      origem: e.dados.valor ? "documento" : "nao-localizado",
    });
  } else if (e.proposta) {
    const v = valorNaProposta(e.proposta);
    out.push(
      v
        ? {
            id: "valor",
            elemento: "TAP.7",
            nome: "Valor da proposta",
            texto: reais(v.valor),
            onde: `proposta, p. ${v.pagina}`,
            origem: "documento",
          }
        : { id: "valor", elemento: "TAP.7", nome: "Valor da proposta", texto: NAO, origem: "nao-localizado" },
    );
  }
  for (const m of e.dados?.marcos ?? [])
    out.push({
      id: `marco:${m.produto}`,
      elemento: "TAP.6",
      nome: `Entrega de ${m.produto}`,
      texto: `${m.nome}: dia útil ${m.fim} do cronograma${m.dataFim ? ` (${formatarData(m.dataFim)})` : ""}, sem a aprovação do cliente. ${m.textoConferencia}`,
      onde: "proposta (dossiê), EAP",
      origem: "calculado",
    });
  out.push(
    doItem("aceite", "TAP.9", "Recebimento e aceite", porId("condicoes:recebimento")),
    doItem("extincao", "TAP.10", "Extinção ou rescisão", porId("condicoes:extincao")),
    doItem("gestor", "TAP.8", "Gestor do contrato (trecho)", porId("partes:gestor")),
    doItem("fiscal", "TAP.8", "Fiscal do contrato (trecho)", porId("partes:fiscal")),
  );
  for (const u of itens.filter((i) => i.id.startsWith("partes:unidade:")))
    out.push(doItem(u.id, "TAP.8", "Órgão ou área citada", u));
  return out;
}

export function dadosEmTexto(dados: DadoDoDocumento[]): string {
  return dados
    .map(
      (d) =>
        `- [${d.elemento}] ${d.nome}: ${d.texto}${d.onde ? ` [${d.onde}]` : ""}${d.origem === "calculado" ? " (conta do código)" : ""}`,
    )
    .join("\n");
}
