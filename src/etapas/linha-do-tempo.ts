// Linha do tempo do código (decisão 0057; SKILL.md, seção 3, "Linha do tempo antes de fechar"): início, cada entrega
// com e sem a análise do cliente, marcos fixos e fim da vigência, com a conta de cada marco (cabe ou não cabe). Vai no
// pedido da EAP (etapa 2), do TAP (etapa 3) e do cronograma (etapa 4); o PMO devolve a conferência dele
// (conferenciaDosMarcos) e o código a confere contra a própria conta. As datas e as contas são sempre do código.
import type { DocumentoLido, PropostaDossie } from "../dossie/esquema";
import type { ConferenciaMarco } from "../pmo/schemas/comum";
import { inicioFixo } from "../regras/cruzamentos-rfp";
import { formatarData, somarDiasCorridos, somarDiasUteis } from "../texto/datas";
import {
  calcularCronograma,
  conferirPrazosDosProdutos,
  primeiroDiaUtil,
  type Cronograma,
  type SituacaoPrazo,
} from "./2-proposta/cronograma";
import type { PontoDePartida, PrazoEmDias } from "./2-proposta/ponto-de-partida";
import type { DadosProposta } from "./3-tap/entrada";

export interface MarcoDaLinha {
  /** "inicio", "P1", "fixa:2.3", "vigencia". */
  id: string;
  texto: string;
  /** Linha de referência (o início): não se confere. */
  referencia?: boolean;
  situacao: SituacaoPrazo;
}

export interface ProdutoDaLinha {
  id: string;
  nome: string;
  /** Conferência do prazo do produto (conta do código), quando há prazo no documento. */
  situacao?: SituacaoPrazo;
  texto?: string;
}

export interface EntradaLinha {
  inicio?: Date;
  /** "decisão do GP" ou "data do documento (RFP, p. 1), a confirmar pelo GP". */
  origemInicio?: string;
  prazo?: PrazoEmDias;
  aprovacaoDias?: number;
  cronograma?: Cronograma;
  produtos?: ProdutoDaLinha[];
}

const NOME_SITUACAO: Record<SituacaoPrazo, string> = {
  cabe: "cabe",
  "nao-cabe": "não cabe",
  "nao-conferido": "não conferido pelo código",
};

export function linhaDoTempo(x: EntradaLinha): MarcoDaLinha[] {
  const crono = x.cronograma;
  const cal = crono?.calendario;
  const inicio = x.inicio ? primeiroDiaUtil(x.inicio, cal) : undefined;
  const data = (diaUtil: number) =>
    inicio && diaUtil > 0 ? ` (${formatarData(somarDiasUteis(inicio, diaUtil - 1, cal))})` : "";
  const fimVigencia =
    inicio && x.prazo && x.prazo.unidade !== "dias úteis"
      ? somarDiasCorridos(inicio, x.prazo.dias)
      : undefined;
  const out: MarcoDaLinha[] = [
    {
      id: "inicio",
      referencia: true,
      situacao: "nao-conferido",
      texto: inicio
        ? `Início: ${formatarData(inicio)} (${x.origemInicio ?? "decisão do GP"}).`
        : "Início não informado (decisão do GP): a conta sai em dias úteis contados do início.",
    },
  ];
  for (const p of x.produtos ?? []) {
    const atividades = (crono?.atividades ?? []).filter((a) => a.produto === p.id);
    if (!atividades.length) {
      out.push({
        id: p.id,
        situacao: p.situacao ?? "nao-conferido",
        texto: `${p.id} ${p.nome}: ${p.texto ?? "sem atividades na EAP ainda"}.`,
      });
      continue;
    }
    const entregas = atividades.filter((a) => !a.analise);
    const semAnalise = Math.max(
      ...(entregas.length ? entregas : atividades).map((a) => a.fimMaisCedo - a.aprovacao),
    );
    const comAnalise = Math.max(...atividades.map((a) => a.fimMaisCedo));
    const depoisDaVigencia =
      fimVigencia && inicio && comAnalise > 0
        ? somarDiasUteis(inicio, comAnalise - 1, cal) > fimVigencia
        : false;
    const situacao: SituacaoPrazo =
      p.situacao === "nao-cabe" || depoisDaVigencia
        ? "nao-cabe"
        : p.situacao === "cabe" || (fimVigencia && inicio)
          ? "cabe"
          : "nao-conferido";
    out.push({
      id: p.id,
      situacao,
      texto: `${p.id} ${p.nome}: entrega no dia útil ${semAnalise}${data(semAnalise)} sem a análise do cliente; aprovado no dia útil ${comAnalise}${data(comAnalise)} com a análise${
        x.aprovacaoDias === undefined
          ? " (tempo de aprovação não informado pelo GP: a conta está sem ele)"
          : ""
      }${p.texto ? `. Prazo do produto: ${p.texto}` : ""}${depoisDaVigencia ? ". Passa do fim da vigência" : ""}.`,
    });
  }
  for (const f of crono?.datasFixas ?? [])
    out.push({
      id: `fixa:${f.atividade}`,
      situacao: f.cabe ? "cabe" : "nao-cabe",
      texto: `Marco fixo da atividade ${f.atividade}: ${formatarData(f.inicio)} a ${formatarData(f.fim)}; as atividades anteriores terminam ${
        f.fimPredecessoras ? `em ${formatarData(f.fimPredecessoras)}` : "sem data (falta o início)"
      }${f.folgaCorrida !== undefined ? `, folga de ${f.folgaCorrida} dia(s) corrido(s)` : ""}${f.semAprovacao ? " (sem o tempo de aprovação do cliente)" : ""}.`,
    });
  out.push({
    id: "vigencia",
    situacao: crono?.conferenciaPrazo.situacao ?? "nao-conferido",
    texto: `Fim da vigência: ${
      fimVigencia
        ? formatarData(fimVigencia)
        : x.prazo
          ? x.prazo.texto
          : "prazo de execução não localizado pelo código"
    }.${crono ? ` ${crono.conferenciaPrazo.texto}` : " O cronograma ainda não existe: a conta sai depois da EAP."}`,
  });
  return out;
}

/**
 * A linha do tempo da proposta (etapa 2): antes da EAP, o início, o prazo de cada produto e a vigência; depois dela,
 * as entregas com e sem a análise do cliente, os marcos fixos e a conta de cada um.
 */
export function linhaDaProposta(
  ponto: PontoDePartida,
  prop: PropostaDossie,
  rfp: DocumentoLido[],
): MarcoDaLinha[] {
  const doGp = prop.parametros.inicio ? new Date(`${prop.parametros.inicio}T00:00:00`) : undefined;
  const fixo = doGp ? undefined : inicioFixo(ponto.analise.documentos);
  const inicio = doGp ?? fixo?.data;
  const c = prop.conteudo?.resposta;
  const eap = prop.eap?.resposta;
  const cronograma = eap
    ? calcularCronograma(eap.atividades, {
        aprovacaoDias: prop.parametros.aprovacaoDias,
        inicio,
        prazoRfp: ponto.prazoExecucao,
        feriados: prop.parametros.feriados,
      })
    : undefined;
  const conferidos = cronograma && c ? conferirPrazosDosProdutos(cronograma, c.produtos, rfp, inicio) : [];
  return linhaDoTempo({
    inicio,
    origemInicio: doGp
      ? "decisão do GP"
      : fixo
        ? `data do documento, ${fixo.origem.documento}, p. ${fixo.origem.pagina}, a confirmar pelo GP`
        : undefined,
    prazo: ponto.prazoExecucao,
    aprovacaoDias: prop.parametros.aprovacaoDias,
    cronograma,
    produtos: (c?.produtos ?? []).map((x) => {
      const k = conferidos.find((y) => y.produto === x.id);
      return {
        id: x.id,
        nome: x.nome,
        situacao: k?.situacao,
        texto: k
          ? k.texto
          : x.prazo
            ? `${x.prazo.dias} dias ${x.prazo.aPartirDe}, como o documento diz`
            : undefined,
      };
    }),
  });
}

/** A linha do tempo a partir dos dados da proposta que a etapa 3 e a 4 recebem (o cronograma da etapa 2). */
export function linhaDosDados(
  d: DadosProposta | undefined,
  prazo?: PrazoEmDias,
  cronograma: Cronograma | undefined = d?.cronograma,
): MarcoDaLinha[] {
  return linhaDoTempo({
    inicio: d?.inicio,
    origemInicio: d?.inicioDoDocumento
      ? `data do documento, ${d.inicioDoDocumento}, a confirmar pelo GP`
      : undefined,
    prazo,
    aprovacaoDias: d?.aprovacaoDias,
    cronograma,
    produtos: (d?.produtos ?? []).map((x) => {
      const k = d?.marcos.find((m) => m.produto === x.id);
      return { id: x.id, nome: x.nome, situacao: k?.situacao, texto: k?.textoConferencia };
    }),
  });
}

export function linhaDoTempoEmTexto(linha: MarcoDaLinha[]): string {
  return linha
    .map(
      (m) =>
        `- [${m.id}] ${m.texto}${m.referencia ? "" : ` → ${NOME_SITUACAO[m.situacao]} (conta do código)`}`,
    )
    .join("\n");
}

/** O que o pedido manda o PMO devolver em conferenciaDosMarcos (EAP, TAP e cronograma). */
export const INSTRUCAO_MARCOS = `conferenciaDosMarcos (linha do tempo antes de fechar; SKILL.md, seção 3): um item por marco da linha do tempo do código acima, pelo id ("P1", "fixa:<id da atividade>", "vigencia"; o início não precisa), com situacao "cabe" ou "nao_cabe" e o motivo, contando a análise do cliente de cada entrega. Na EAP, inclua um "fixa:<id>" para cada atividade com restricaoData. Marco que não cabe vira pergunta na estratégia, divergência no TAP e risco no PGP. O código confere cada um contra a conta dele: não calcule datas.`;

/**
 * A conferência dos marcos do PMO contra a conta do código: marco sem conferência do PMO e marco em que o PMO e a
 * conta discordam. Vale a conta do código.
 */
export function conferirMarcosDoPmo(doPmo: ConferenciaMarco[], linha: MarcoDaLinha[]): string[] {
  const conferiveis = linha.filter((m) => !m.referencia);
  if (!doPmo.length)
    return conferiveis.length
      ? [
          "O PMO não devolveu a conferência dos marcos (conferenciaDosMarcos): sugere-se conferir cada marco antes de fechar.",
        ]
      : [];
  const chave = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");
  const out: string[] = [];
  for (const m of conferiveis) {
    const p = doPmo.find((x) => chave(x.marco) === chave(m.id));
    if (!p) {
      out.push(`Marco ${m.id} sem conferência do PMO.`);
      continue;
    }
    if (m.situacao === "nao-conferido") continue;
    const doPmoCabe = p.situacao === "cabe";
    if (doPmoCabe !== (m.situacao === "cabe"))
      out.push(
        `Marco ${m.id}: o PMO diz "${doPmoCabe ? "cabe" : "não cabe"}" e a conta do código diz "${NOME_SITUACAO[m.situacao]}" (${m.texto}). Vale a conta do código.`,
      );
  }
  return out;
}
