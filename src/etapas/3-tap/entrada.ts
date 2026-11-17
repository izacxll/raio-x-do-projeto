// Etapa 3: o que entra. A RFP (com a etapa 1, revisada ou rodada aqui) e a proposta: o PDF da versão final do GP,
// quando ele enviar, ou a proposta da etapa 2 no dossiê. A proposta do dossiê vira um documento "lido" com uma
// página por seção da minuta exportada: assim o PMO a cita como cita a RFP, e o código confere a citação.
import type { DocumentoLido, Dossie } from "../../dossie/esquema";
import { montarPropostaTecnica } from "../../exportacao/relatorio-proposta";
import { documentoDeExportavel } from "../documento-virtual";
import { calcularCronograma, conferirPrazosDosProdutos, type Cronograma } from "../2-proposta/cronograma";
import { lerValorEmReais } from "../2-proposta/preco";
import { montarPontoDePartida, type PontoDePartida } from "../2-proposta/ponto-de-partida";
import { lerContrato, type LidoDoContrato } from "./contrato";
import { inicioFixo } from "../../regras/cruzamentos-rfp";
import { numerarCompromissos, type Compromisso } from "../2-proposta/compromissos";
import type { RespostaEap } from "../../pmo/schemas/proposta";

export type FonteProposta = "pdf" | "dossie" | "nenhuma";

export const NOME_PROPOSTA_DO_DOSSIE = "Proposta da etapa 2 (dossiê)";

/** Marco da proposta, calculado pelo código a partir da EAP da etapa 2. */
export interface MarcoDaProposta {
  produto: string;
  nome: string;
  /** Entrega em dias úteis desde o início (sem a aprovação). */
  fim: number;
  dataFim?: Date;
  textoConferencia: string;
  /** Entrega dentro do prazo do produto na RFP (conta do código da etapa 2). */
  situacao: "cabe" | "nao-cabe" | "nao-conferido";
}

/** O que o código tira da proposta da etapa 2, quando ela está no dossiê. */
export interface DadosProposta {
  produtos: { id: string; nome: string; requisitos: string[]; criteriosAceite: string[] }[];
  perfis: { id: string; nome: string; exigido: boolean; requisito: string }[];
  cronograma?: Cronograma;
  marcos: MarcoDaProposta[];
  /** Compromissos numerados da proposta (decisão 0047): premissas, obrigações, exclusões e limites de volume. */
  compromissos: Compromisso[];
  inicio?: Date;
  /** Onde o código leu o início, quando ele veio do documento e não do GP ("RFP, p. 1"): a confirmar pelo GP. */
  inicioDoDocumento?: string;
  /** Dias úteis de aprovação de cada produto (decisão do GP na etapa 2). */
  aprovacaoDias?: number;
  /** Preço final (decisão do GP na etapa 2). */
  valor?: number;
  /** Fases da metodologia com os meses (etapa 2 pelo método), para conferir a duração × vigência. */
  /** Meses de cada fase da proposta; null quando a duração ficou a definir pelo GP. */
  fases: { nome: string; meses: number | null }[];
  /** Operação contínua: quadro de equipe e volumes da etapa 2, para conferir a produtividade. */
  operacao?: Pick<RespostaEap, "volumes" | "quadroEquipe">;
  abordagem?: string;
}

export interface EntradaTap {
  ponto: PontoDePartida;
  rfp: DocumentoLido[];
  fonte: FonteProposta;
  proposta?: DocumentoLido;
  dados?: DadosProposta;
  /** Contrato ou termo assinado (decisão 0041): prevalece sobre a proposta e a RFP. */
  contrato?: DocumentoLido;
  lidoDoContrato?: LidoDoContrato;
  /** RFP + proposta + contrato: o que vai ao PMO e onde o código confere as citações. */
  documentos: DocumentoLido[];
}

/** A proposta do dossiê como documento: uma "página" por seção da minuta, com o texto como sai no DOCX. */
export function propostaComoDocumento(
  dossie: Dossie,
  ponto: PontoDePartida,
  rfp: DocumentoLido[],
): DocumentoLido | undefined {
  if (!dossie.proposta?.conteudo) return undefined;
  const minuta = montarPropostaTecnica(dossie, ponto, rfp, new Date(dossie.criadoEm));
  return documentoDeExportavel(minuta, {
    id: "proposta-do-dossie",
    papel: "proposta",
    nomeArquivo: NOME_PROPOSTA_DO_DOSSIE,
    lidoEm: dossie.proposta.conteudo.em,
  });
}

export function dadosDaProposta(
  dossie: Dossie,
  rfp: DocumentoLido[],
  ponto?: PontoDePartida,
): DadosProposta | undefined {
  const p = dossie.proposta;
  if (!p?.conteudo) return undefined;
  const c = p.conteudo.resposta;
  const eap = p.eap?.resposta;
  // início: o que o GP informou na etapa 2; sem ele, a data fixa de início do documento, a confirmar pelo GP
  const doGp = p.parametros.inicio ? new Date(`${p.parametros.inicio}T00:00:00`) : undefined;
  const fixo = !doGp && ponto ? inicioFixo(ponto.analise.documentos) : undefined;
  const inicio = doGp ?? fixo?.data;
  const cronograma = eap
    ? calcularCronograma(eap.atividades, {
        aprovacaoDias: p.parametros.aprovacaoDias,
        inicio,
        inicioDoDocumento: fixo ? `${fixo.origem.documento}, p. ${fixo.origem.pagina}` : undefined,
        prazoRfp: ponto?.prazoExecucao,
        feriados: p.parametros.feriados,
      })
    : undefined;
  const marcos = cronograma
    ? conferirPrazosDosProdutos(cronograma, c.produtos, rfp, inicio).map((x) => ({
        produto: x.produto,
        nome: x.nome,
        fim: x.fim,
        dataFim: x.dataFim,
        textoConferencia: x.texto,
        situacao: x.situacao,
      }))
    : [];
  return {
    produtos: c.produtos.map((x) => ({
      id: x.id,
      nome: x.nome,
      requisitos: x.requisitos,
      criteriosAceite: x.criteriosAceite,
    })),
    perfis: (eap?.perfis ?? []).map((x) => ({
      id: x.id,
      nome: x.nome,
      exigido: x.exigido,
      requisito: x.requisito,
    })),
    cronograma,
    marcos,
    compromissos: numerarCompromissos(c),
    inicio,
    inicioDoDocumento: fixo ? `${fixo.origem.documento}, p. ${fixo.origem.pagina}` : undefined,
    aprovacaoDias: p.parametros.aprovacaoDias,
    valor: p.parametros.precoFinal,
    fases: c.metodologia.map((f) => ({ nome: f.nome, meses: f.meses })),
    operacao: eap ? { volumes: eap.volumes, quadroEquipe: eap.quadroEquipe } : undefined,
    abordagem: p.abordagem?.id,
  };
}

/** Valor global escrito na proposta em PDF ("valor global", "preço total"… seguido de R$). */
export function valorNaProposta(
  doc: DocumentoLido,
): { valor: number; pagina: number; trecho: string } | undefined {
  const re = /(valor|pre[çc]o)\s+(global|total).{0,80}?(R\$\s*[\d.]+(?:,\d{1,2})?)/i;
  for (const p of doc.paginas) {
    if (p.origem === "nao-verificavel") continue;
    const m = re.exec(p.texto.replace(/\s+/g, " "));
    const valor = m?.[3] ? lerValorEmReais(m[3]) : undefined;
    if (m && valor) return { valor, pagina: p.numero, trecho: m[0] };
  }
  return undefined;
}

export function montarEntradaTap(dossie: Dossie, hoje = new Date()): EntradaTap {
  const rfp = dossie.documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
  const ponto = montarPontoDePartida(rfp, dossie.analiseRfp, hoje);
  const pdf = dossie.documentos.find((d) => d.papel === "proposta");
  const doDossie = pdf ? undefined : propostaComoDocumento(dossie, ponto, rfp);
  const proposta = pdf ?? doDossie;
  const contrato = dossie.documentos.find((d) => d.papel === "contrato");
  return {
    ponto,
    rfp,
    fonte: pdf ? "pdf" : doDossie ? "dossie" : "nenhuma",
    proposta,
    dados: pdf ? undefined : dadosDaProposta(dossie, rfp, ponto),
    contrato,
    lidoDoContrato: contrato ? lerContrato(contrato) : undefined,
    documentos: [...rfp, ...(proposta ? [proposta] : []), ...(contrato ? [contrato] : [])],
  };
}
