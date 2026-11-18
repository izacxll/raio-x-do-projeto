// Etapa 3, passo 2 (código): o que vem direto dos documentos, com a página. Contratante, objeto, valor, prazos,
// produtos, marcos, aceite, extinção e partes. O PMO recebe isto pronto e não refaz.
import type { ItemAnalise } from "../../extracao/rfp/item";
import { formatarData } from "../../texto/datas";
import { valorNaProposta, type DadosProposta, type EntradaTap, type MarcoDaProposta } from "./entrada";

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
  if (
    !i ||
    i.situacao === "nao-localizado" ||
    i.situacao === "nao-verificavel" ||
    i.situacao === "nao-se-aplica"
  )
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

/**
 * Gestor e fiscal: só o papel, nunca o nome de pessoa que o documento traz (CLAUDE.md, seção 4; decisão 0049).
 * O nome é do GP confirmar no contrato assinado.
 */
function apenasPapel(d: DadoDoDocumento, papel: string): DadoDoDocumento {
  if (d.origem !== "documento") return d;
  return {
    ...d,
    texto: `O documento prevê o ${papel}${d.onde ? ` (${d.onde})` : ""}; o nome é do GP confirmar no contrato.`,
  };
}

/** Entrega em data quando o início é conhecido; sem ele, o marco fica sem data e o texto avisa. */
function quandoEntrega(m: MarcoDaProposta, d?: DadosProposta): string {
  return quando(m.fim, m.dataFim, d);
}

function quando(diaUtil: number, data: Date | undefined, d?: DadosProposta): string {
  const dia = `dia útil ${diaUtil} do cronograma`;
  if (!data || !d?.inicio)
    return `${dia}; sem o início do projeto informado, o marco não tem data (o início é decisão do GP na etapa 2)`;
  const base = d.inicioDoDocumento
    ? `início em ${formatarData(d.inicio)}, data do documento (${d.inicioDoDocumento}), a confirmar pelo GP`
    : `início em ${formatarData(d.inicio)}, informado pelo GP`;
  return `${formatarData(data)} (${dia}; ${base})`;
}

/**
 * As três datas do marco (decisão 0062): primeira entrega, fim da inspeção e termo definitivo, quando a EAP tem o ciclo
 * de aceite; sem ele, a entrega e o aviso sobre o tempo de aprovação. Nunca "sem a aprovação do cliente" quando a conta
 * já tem as análises do contratante.
 */
function datasDoMarco(m: MarcoDaProposta, d?: DadosProposta): string {
  const x = m.datas;
  if (!x) return `${quandoEntrega(m, d)}, sem a aprovação do cliente`;
  if (x.cicloDaEap)
    return `primeira entrega: ${quando(x.primeiraEntrega, x.dataPrimeiraEntrega, d)}; fim da inspeção do contratante: ${quando(x.fimDaInspecao ?? x.termo, x.dataFimDaInspecao, d)}; termo definitivo (aprovação): ${quando(x.termo, x.dataTermo, d)}. As análises do contratante já estão na conta (ciclo de aceite da EAP)`;
  return d?.aprovacaoDias === undefined
    ? `primeira entrega: ${quando(x.primeiraEntrega, x.dataPrimeiraEntrega, d)}. Aprovação sem data: a EAP não tem a análise do contratante e o GP não informou o tempo de aprovação`
    : `primeira entrega: ${quando(x.primeiraEntrega, x.dataPrimeiraEntrega, d)}; aprovação: ${quando(x.termo, x.dataTermo, d)}, com ${d.aprovacaoDias} dia(s) útil(eis) de aprovação (decisão do GP)`;
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
  // o contrato assinado prevalece (decisão 0041): o que o código leu dele vem antes do que a RFP dizia
  const c = e.lidoDoContrato;
  if (c) {
    const onde = (o?: { documento: string; pagina: number }) =>
      o ? `${o.documento}, p. ${o.pagina}` : undefined;
    out.push(
      c.valor
        ? {
            id: "contrato:valor",
            elemento: "TAP.7",
            nome: "Valor do contrato",
            texto: reais(c.valor.valor),
            onde: onde(c.valor.origem),
            origem: "documento",
          }
        : {
            id: "contrato:valor",
            elemento: "TAP.7",
            nome: "Valor do contrato",
            texto: NAO,
            origem: "nao-localizado",
          },
      c.vigencia
        ? {
            id: "contrato:vigencia",
            elemento: "TAP.6",
            nome: "Vigência do contrato",
            texto: c.vigencia.texto,
            onde: onde(c.vigencia.origem),
            origem: "documento",
          }
        : {
            id: "contrato:vigencia",
            elemento: "TAP.6",
            nome: "Vigência do contrato",
            texto: NAO,
            origem: "nao-localizado",
          },
    );
    if (c.parteIntegrante)
      out.push({
        id: "contrato:parte-integrante",
        elemento: "TAP.4",
        nome: "Proposta ou plano de trabalho como parte integrante",
        texto: c.parteIntegrante.trecho,
        onde: onde(c.parteIntegrante),
        origem: "documento",
      });
    for (const [k, q] of c.quemAcompanha.entries())
      out.push({
        id: `contrato:quem:${k}`,
        elemento: "TAP.9",
        nome: "Quem acompanha e aprova (contrato)",
        texto: q.trecho,
        onde: onde(q),
        origem: "documento",
      });
  }
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
      nome: `Entrega e aprovação de ${m.produto}`,
      texto: `${m.nome}: ${datasDoMarco(m, e.dados)}. ${m.textoConferencia}`,
      onde: "proposta (dossiê), EAP",
      origem: "calculado",
    });
  out.push(
    doItem("aceite", "TAP.9", "Recebimento e aceite", porId("condicoes:recebimento")),
    doItem("extincao", "TAP.10", "Extinção ou rescisão", porId("condicoes:extincao")),
    apenasPapel(
      doItem("gestor", "TAP.8", "Gestor do contrato", porId("partes:gestor")),
      "gestor do contrato",
    ),
    apenasPapel(
      doItem("fiscal", "TAP.8", "Fiscal do contrato", porId("partes:fiscal")),
      "fiscal do contrato",
    ),
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
