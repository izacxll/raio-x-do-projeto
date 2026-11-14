// Etapa 3: o que entra. A RFP (com a etapa 1, revisada ou rodada aqui) e a proposta: o PDF da versão final do GP,
// quando ele enviar, ou a proposta da etapa 2 no dossiê. A proposta do dossiê vira um documento "lido" com uma
// página por seção da minuta exportada: assim o PMO a cita como cita a RFP, e o código confere a citação.
import type { DocumentoLido, Dossie } from "../../dossie/esquema";
import { montarPropostaTecnica } from "../../exportacao/relatorio-proposta";
import { calcularCronograma, conferirPrazosDosProdutos, type Cronograma } from "../2-proposta/cronograma";
import { lerValorEmReais } from "../2-proposta/preco";
import { montarPontoDePartida, type PontoDePartida } from "../2-proposta/ponto-de-partida";

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
  produtos: { id: string; nome: string; requisitos: string[] }[];
  perfis: { id: string; nome: string; exigido: boolean; requisito: string }[];
  cronograma?: Cronograma;
  marcos: MarcoDaProposta[];
  inicio?: Date;
  /** Dias úteis de aprovação de cada produto (decisão do GP na etapa 2). */
  aprovacaoDias?: number;
  /** Preço final (decisão do GP na etapa 2). */
  valor?: number;
  abordagem?: string;
}

export interface EntradaTap {
  ponto: PontoDePartida;
  rfp: DocumentoLido[];
  fonte: FonteProposta;
  proposta?: DocumentoLido;
  dados?: DadosProposta;
  /** RFP + proposta: o que vai ao PMO e onde o código confere as citações. */
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
  const paginas = minuta.secoes.map((s, k) => {
    const linhas = [
      s.titulo,
      ...(s.paragrafos ?? []),
      ...(s.tabela ? [s.tabela.colunas.join("\t"), ...s.tabela.linhas.map((l) => l.join("\t"))] : []),
    ];
    const texto = linhas.join("\n");
    return { numero: k + 1, origem: "texto" as const, texto, caracteres: texto.length };
  });
  return {
    id: "proposta-do-dossie",
    papel: "proposta",
    nomeArquivo: NOME_PROPOSTA_DO_DOSSIE,
    tamanhoBytes: 0,
    totalPaginas: paginas.length,
    lidoEm: dossie.proposta.conteudo.em,
    paginas,
  };
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
  const inicio = p.parametros.inicio ? new Date(`${p.parametros.inicio}T00:00:00`) : undefined;
  const cronograma = eap
    ? calcularCronograma(eap.atividades, {
        aprovacaoDias: p.parametros.aprovacaoDias,
        inicio,
        prazoRfp: ponto?.prazoExecucao,
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
    produtos: c.produtos.map((x) => ({ id: x.id, nome: x.nome, requisitos: x.requisitos })),
    perfis: (eap?.perfis ?? []).map((x) => ({
      id: x.id,
      nome: x.nome,
      exigido: x.exigido,
      requisito: x.requisito,
    })),
    cronograma,
    marcos,
    inicio,
    aprovacaoDias: p.parametros.aprovacaoDias,
    valor: p.parametros.precoFinal,
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
  return {
    ponto,
    rfp,
    fonte: pdf ? "pdf" : doDossie ? "dossie" : "nenhuma",
    proposta,
    dados: pdf ? undefined : dadosDaProposta(dossie, rfp, ponto),
    documentos: proposta ? [...rfp, proposta] : rfp,
  };
}
