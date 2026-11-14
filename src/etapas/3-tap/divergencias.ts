// Etapa 3, passo 1 (código): divergências entre a RFP e a proposta, requisito a requisito (R01, R02…): produtos e
// equipe; e o prazo e o valor. Cada divergência vai para o GP decidir qual vale. O que o código não acha na proposta
// fica "não localizado na proposta pelo código — conferir", nunca "ausente".
import type { DocumentoLido } from "../../dossie/esquema";
import { termosDoRequisito, type Requisito } from "../../extracao/requisitos";
import { prazosDeExecucao } from "../../extracao/rfp/prazos";
import { prepararDocumento } from "../../extracao/rfp/item";
import { normalizarTermo, procurar } from "../../regras/busca";
import { lerNumero } from "../../texto/datas";
import { lerValorEmReais } from "../2-proposta/preco";
import { prazoEmDias, type PrazoEmDias } from "../2-proposta/ponto-de-partida";
import { valorNaProposta, type EntradaTap } from "./entrada";

export type TemaDivergencia = "produto" | "equipe" | "prazo" | "valor";
export type SituacaoDivergencia = "igual" | "diferente" | "so-na-rfp" | "so-na-proposta" | "nao-conferido";

export interface LadoDivergencia {
  texto: string;
  /** "RFP, p. 19", "proposta, p. 3", "proposta (dossiê), P1"… */
  onde?: string;
}

export interface Divergencia {
  /** "produto:R01", "equipe:R06", "produto-proposta:P6", "prazo", "valor". */
  id: string;
  tema: TemaDivergencia;
  requisito?: string;
  rfp: LadoDivergencia;
  proposta: LadoDivergencia;
  situacao: SituacaoDivergencia;
  /** Explicação por modelo de texto, em redação condicional. */
  observacao: string;
}

export const NOME_SITUACAO_DIVERGENCIA: Record<SituacaoDivergencia, string> = {
  igual: "a proposta segue a RFP",
  diferente: "diferente — o GP decide qual vale",
  "so-na-rfp": "não localizado na proposta pelo código — conferir",
  "so-na-proposta": "só na proposta — o GP decide se fica",
  "nao-conferido": "não conferido pelo código",
};

/** Precisa de decisão do GP: diferente, ou presente só de um lado. */
export function pedeDecisao(d: Divergencia): boolean {
  return d.situacao === "diferente" || d.situacao === "so-na-rfp" || d.situacao === "so-na-proposta";
}

const ondeRfp = (r: Requisito) => (r.pagina ? `${r.documento ?? "RFP"}, p. ${r.pagina}` : "incluído pelo GP");
const nomeProposta = (e: EntradaTap) => (e.fonte === "pdf" ? "proposta" : "proposta (dossiê)");

function requisitoNaProposta(r: Requisito, e: EntradaTap): LadoDivergencia | undefined {
  // proposta do dossiê: a ligação pelo número R é explícita (produto do SOW ou perfil da equipe)
  if (e.dados) {
    if (r.tipo === "equipe") {
      const perfil = e.dados.perfis.find((x) => x.requisito === r.numero);
      if (perfil) return { texto: perfil.nome, onde: `${nomeProposta(e)}, equipe` };
    } else {
      const produto = e.dados.produtos.find((x) => x.requisitos.includes(r.numero));
      if (produto) return { texto: `${produto.id} — ${produto.nome}`, onde: `${nomeProposta(e)}, SOW` };
    }
  }
  // proposta em PDF (ou sem a ligação no dossiê): o número R ou os termos do requisito no texto
  if (!e.proposta) return undefined;
  // o rótulo "Produto 2" também vale: a descrição pode vir partida da tabela de duas colunas da RFP
  const rotulo = /^produto \d+$/i.test(r.rotulo.trim()) ? [r.rotulo.trim()] : [];
  const achado =
    procurar(e.proposta.paginas, [r.numero], { primeira: true })[0] ??
    procurar(e.proposta.paginas, termosDoRequisito(r), { primeira: true })[0] ??
    procurar(e.proposta.paginas, rotulo, { primeira: true })[0];
  return achado
    ? { texto: achado.trecho.trim(), onde: `${nomeProposta(e)}, p. ${achado.pagina}` }
    : undefined;
}

function divergenciaDoRequisito(r: Requisito, e: EntradaTap): Divergencia {
  const tema: TemaDivergencia = r.tipo === "equipe" ? "equipe" : "produto";
  const rfp = { texto: `${r.rotulo}: ${r.descricao}`, onde: ondeRfp(r) };
  const naProposta = requisitoNaProposta(r, e);
  if (naProposta)
    return {
      id: `${tema}:${r.numero}`,
      tema,
      requisito: r.numero,
      rfp,
      proposta: naProposta,
      situacao: "igual",
      observacao: `O ${r.numero} aparece na proposta; sugere-se conferir se o conteúdo é o mesmo da RFP.`,
    };
  const ilegivel = e.proposta?.paginas.some((p) => p.origem === "nao-verificavel");
  return {
    id: `${tema}:${r.numero}`,
    tema,
    requisito: r.numero,
    rfp,
    proposta: {
      texto: ilegivel
        ? "não localizado pelo código; a proposta tem páginas sem texto legível — conferir no documento"
        : "não localizado na proposta pelo código — conferir no documento",
    },
    situacao: "so-na-rfp",
    observacao: `Sugere-se conferir se a proposta atende o ${r.numero}. Se não atender, o TAP pode seguir a RFP (o contrato costuma prevalecer) ou registrar a diferença como limite, conforme a decisão do GP.`,
  };
}

/** Produtos da proposta do dossiê que não se ligam a nenhum requisito da RFP. */
function produtosSoNaProposta(e: EntradaTap): Divergencia[] {
  if (!e.dados) return [];
  const numeros = new Set(e.ponto.requisitos.map((r) => r.numero));
  return e.dados.produtos
    .filter((x) => !x.requisitos.some((n) => numeros.has(n)))
    .map((x) => ({
      id: `produto-proposta:${x.id}`,
      tema: "produto" as const,
      rfp: { texto: "não localizado na RFP pelo código" },
      proposta: { texto: `${x.id} — ${x.nome}`, onde: `${nomeProposta(e)}, SOW` },
      situacao: "so-na-proposta" as const,
      observacao:
        "Produto da proposta sem requisito da RFP ligado. Sugere-se o GP avaliar se ele fica no TAP como entrega-chave ou sai.",
    }));
}

/** Prazo da proposta em PDF: vigência ou prazo de execução que ela escreve. */
function prazoNoPdf(doc: DocumentoLido): PrazoEmDias | undefined {
  const d = prepararDocumento(doc.id, "Proposta", doc.paginas);
  const p = prazosDeExecucao([d]).find((x) => x.tipo === "execucao" || x.tipo === "vigencia");
  if (!p) return undefined;
  return prazoEmDias({
    id: "proposta:prazo",
    secao: "prazos",
    nome: "Prazo",
    texto: p.valor,
    rotulo: "documento",
    situacao: "localizado",
    campos: { Contagem: p.contagem },
    origem: { documento: "proposta", pagina: p.loc.pagina, trecho: p.loc.frase },
  });
}

function divergenciaDePrazo(e: EntradaTap): Divergencia {
  const r = e.ponto.prazoExecucao;
  const rfp: LadoDivergencia = r
    ? { texto: r.texto, onde: `${r.origem?.documento ?? "RFP"}, p. ${r.origem?.pagina}` }
    : { texto: "não localizado na RFP pelo código — conferir no documento" };
  if (e.dados?.cronograma) {
    const c = e.dados.cronograma;
    const proposta = {
      texto: `${c.total} dias úteis no cronograma da proposta (calculado pelo código, ${e.dados.aprovacaoDias === undefined ? "sem o tempo de aprovação do cliente, não informado pelo GP" : `com ${e.dados.aprovacaoDias} dias úteis de aprovação de cada produto, decisão do GP`})`,
      onde: `${nomeProposta(e)}, EAP`,
    };
    // a conta de "cabe" é a da etapa 2: o cronograma contra a vigência da RFP, com o início do GP quando houver
    const situacao: SituacaoDivergencia = !r
      ? "nao-conferido"
      : c.conferenciaPrazo.situacao === "nao-cabe"
        ? "diferente"
        : c.conferenciaPrazo.situacao === "cabe"
          ? "igual"
          : "nao-conferido";
    return {
      id: "prazo",
      tema: "prazo",
      rfp,
      proposta,
      situacao,
      observacao:
        situacao === "diferente"
          ? "O cronograma da proposta passa do prazo da RFP. Sugere-se o GP decidir qual vale no TAP; o prazo do contrato costuma prevalecer."
          : situacao === "igual"
            ? "O cronograma da proposta cabe no prazo da RFP (conta do código)."
            : "O código não conseguiu comparar os prazos: conferir.",
    };
  }
  const pdf = e.fonte === "pdf" && e.proposta ? prazoNoPdf(e.proposta) : undefined;
  if (!pdf)
    return {
      id: "prazo",
      tema: "prazo",
      rfp,
      proposta: { texto: "prazo não localizado na proposta pelo código — conferir no documento" },
      situacao: r ? "so-na-rfp" : "nao-conferido",
      observacao: "Sugere-se conferir o prazo da proposta e registrar no TAP o que vale.",
    };
  const proposta = { texto: pdf.texto, onde: `proposta, p. ${pdf.origem?.pagina}` };
  const igual = r && r.dias === pdf.dias;
  return {
    id: "prazo",
    tema: "prazo",
    rfp,
    proposta,
    situacao: !r ? "so-na-proposta" : igual ? "igual" : "diferente",
    observacao: igual
      ? "A proposta traz o mesmo prazo da RFP."
      : "Os prazos são diferentes. Sugere-se o GP decidir qual vale no TAP; o prazo do contrato costuma prevalecer.",
  };
}

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function divergenciaDeValor(e: EntradaTap): Divergencia {
  const est = e.ponto.valorEstimado;
  const vRfp = est ? lerValorEmReais(est.texto) : undefined;
  const rfp: LadoDivergencia =
    est && vRfp
      ? {
          texto: `valor estimado: ${reais(vRfp)}`,
          onde: `${est.origem?.documento ?? "RFP"}, p. ${est.origem?.pagina}`,
        }
      : { texto: "valor estimado não localizado na RFP pelo código (ou orçamento sigiloso)" };
  let vProposta: number | undefined;
  let proposta: LadoDivergencia;
  if (e.dados) {
    vProposta = e.dados.valor;
    proposta = vProposta
      ? { texto: `preço final: ${reais(vProposta)} (decisão do GP na etapa 2)`, onde: nomeProposta(e) }
      : { texto: "preço final não preenchido na etapa 2 — a definir pelo GP" };
  } else {
    const achado = e.proposta ? valorNaProposta(e.proposta) : undefined;
    vProposta = achado?.valor;
    proposta = achado
      ? { texto: `${reais(achado.valor)}`, onde: `proposta, p. ${achado.pagina}` }
      : { texto: "valor global não localizado na proposta pelo código — conferir no documento" };
  }
  const situacao: SituacaoDivergencia =
    vRfp && vProposta ? (vRfp === vProposta ? "igual" : "diferente") : "nao-conferido";
  return {
    id: "valor",
    tema: "valor",
    rfp,
    proposta,
    situacao,
    observacao:
      situacao === "diferente"
        ? vProposta! > vRfp!
          ? "A proposta está acima do valor estimado da RFP. Sugere-se conferir as regras do edital; no TAP, o valor que costuma valer é o do contrato assinado."
          : "A proposta está abaixo do valor estimado (o comum numa disputa). No TAP, o valor que costuma valer é o do contrato assinado, igual ao da proposta vencedora."
        : situacao === "igual"
          ? "Os valores coincidem."
          : "O código não tem os dois valores para comparar. Os recursos financeiros do TAP são decisão do GP.",
  };
}

export function compararRfpEProposta(e: EntradaTap): Divergencia[] {
  if (e.fonte === "nenhuma") return [];
  const requisitos = e.ponto.requisitos.filter((r) => r.tipo === "produto" || r.tipo === "equipe" || !r.tipo);
  return [
    ...requisitos.map((r) => divergenciaDoRequisito(r, e)),
    ...produtosSoNaProposta(e),
    divergenciaDePrazo(e),
    divergenciaDeValor(e),
  ];
}

/** Número de dias de um texto de prazo ("30 dias", "12 meses" → 360); para conferir marcos do TAP. */
export function diasDoTexto(texto: string): number | undefined {
  const t = normalizarTermo(texto);
  const n = lerNumero(texto);
  if (!n) return undefined;
  if (/\bmes/.test(t)) return n * 30;
  if (/\bano/.test(t)) return n * 365;
  if (/\bdia/.test(t)) return n;
  return undefined;
}
