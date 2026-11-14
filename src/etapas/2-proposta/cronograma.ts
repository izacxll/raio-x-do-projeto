// Etapa 2, passo 5 (código): datas e caminho crítico a partir da EAP do PMO.
// O PMO estima em três pontos; o código calcula a duração esperada (PERT: (o + 4m + p) / 6), soma o tempo de
// aprovação do cliente (decisão do GP), faz a rede (ida e volta), acha o caminho crítico e confere contra o prazo
// da RFP. Dias úteis descontam só sábados e domingos: a tela pede para conferir feriados.
import type { DocumentoLido } from "../../dossie/esquema";
import { citacaoValeComoFato, conferirCitacao } from "../../pmo/citacoes";
import type { AtividadeEap, PrazoProduto, ProdutoSow } from "../../pmo/schemas/proposta";
import { diasEntre, somarDiasUteis, soData, ehDiaUtil } from "../../texto/datas";
import type { PrazoEmDias } from "./ponto-de-partida";

export interface AtividadeCalculada {
  id: string;
  nome: string;
  produto: string;
  /** Duração esperada (PERT), arredondada para cima, em dias úteis. */
  duracao: number;
  /** Dias úteis de aprovação do cliente somados ao fim da atividade. */
  aprovacao: number;
  /** Desvio-padrão da estimativa: (p − o) / 6. */
  desvio: number;
  inicioMaisCedo: number;
  fimMaisCedo: number;
  inicioMaisTarde: number;
  fimMaisTarde: number;
  folga: number;
  critica: boolean;
  dataInicio?: Date;
  dataFim?: Date;
}

export type SituacaoPrazo = "cabe" | "nao-cabe" | "nao-conferido";

export interface Cronograma {
  atividades: AtividadeCalculada[];
  /** Duração total em dias úteis (inclui aprovações). */
  total: number;
  /** Desvio-padrão do caminho crítico. */
  desvioTotal: number;
  caminhoCritico: string[];
  dataFim?: Date;
  problemas: string[];
  conferenciaPrazo: { situacao: SituacaoPrazo; texto: string };
}

export function duracaoEsperada(o: number, m: number, p: number): number {
  return (o + 4 * m + p) / 6;
}

function validar(atividades: AtividadeEap[]): string[] {
  const problemas: string[] = [];
  const ids = new Set<string>();
  for (const a of atividades) {
    if (ids.has(a.id)) problemas.push(`Atividade ${a.id} aparece mais de uma vez.`);
    ids.add(a.id);
  }
  for (const a of atividades) {
    const { otimista: o, mais_provavel: m, pessimista: p } = a.duracao;
    if ([o, m, p].some((x) => !Number.isFinite(x) || x < 0))
      problemas.push(`Atividade ${a.id}: duração com número inválido.`);
    else if (!(o <= m && m <= p))
      problemas.push(
        `Atividade ${a.id}: a estimativa não segue otimista ≤ mais provável ≤ pessimista (${o}, ${m}, ${p}).`,
      );
    for (const pr of a.predecessoras)
      if (!ids.has(pr)) problemas.push(`Atividade ${a.id}: predecessora ${pr} não existe na EAP.`);
  }
  return problemas;
}

/** Ordem topológica; devolve null se houver ciclo. */
function ordenar(atividades: AtividadeEap[]): AtividadeEap[] | null {
  const porId = new Map(atividades.map((a) => [a.id, a]));
  const grau = new Map(atividades.map((a) => [a.id, a.predecessoras.filter((p) => porId.has(p)).length]));
  const fila = atividades.filter((a) => grau.get(a.id) === 0);
  const ordem: AtividadeEap[] = [];
  while (fila.length) {
    const a = fila.shift() as AtividadeEap;
    ordem.push(a);
    for (const b of atividades)
      if (b.predecessoras.includes(a.id)) {
        grau.set(b.id, (grau.get(b.id) ?? 1) - 1);
        if (grau.get(b.id) === 0) fila.push(b);
      }
  }
  return ordem.length === atividades.length ? ordem : null;
}

/** O primeiro dia útil a partir de `d` (o próprio, se for útil). */
export function primeiroDiaUtil(d: Date): Date {
  const r = soData(d);
  while (!ehDiaUtil(r)) r.setDate(r.getDate() + 1);
  return r;
}

export interface ParametrosCronograma {
  /** Dias úteis que o contratante leva para aprovar um produto (decisão do GP ou prazo do documento). */
  aprovacaoDias?: number;
  /** Início previsto (decisão do GP). Sem ele, o cronograma sai em dias, sem datas. */
  inicio?: Date;
  prazoRfp?: PrazoEmDias;
}

export function calcularCronograma(atividades: AtividadeEap[], par: ParametrosCronograma = {}): Cronograma {
  const problemas = validar(atividades);
  const vazio = (texto: string): Cronograma => ({
    atividades: [],
    total: 0,
    desvioTotal: 0,
    caminhoCritico: [],
    problemas: [...problemas, texto],
    conferenciaPrazo: { situacao: "nao-conferido", texto: "Cronograma não calculado: corrigir a EAP." },
  });
  if (!atividades.length) return vazio("A EAP não tem atividades.");
  const ordem = ordenar(atividades);
  if (!ordem) return vazio("As predecessoras formam um ciclo: uma atividade depende dela mesma.");
  if (par.aprovacaoDias === undefined && atividades.some((a) => a.aprovacaoCliente))
    problemas.push(
      "Tempo de aprovação do cliente não informado: o cronograma está sem ele. É decisão do GP (ou prazo do documento).",
    );

  const calc = new Map<string, AtividadeCalculada>();
  for (const a of ordem) {
    const { otimista: o, mais_provavel: m, pessimista: p } = a.duracao;
    const duracao = Math.ceil(duracaoEsperada(o, m, p) - 1e-9);
    const aprovacao = a.aprovacaoCliente ? (par.aprovacaoDias ?? 0) : 0;
    const inicio = Math.max(0, ...a.predecessoras.map((pr) => calc.get(pr)?.fimMaisCedo ?? 0));
    calc.set(a.id, {
      id: a.id,
      nome: a.nome,
      produto: a.produto,
      duracao,
      aprovacao,
      desvio: (p - o) / 6,
      inicioMaisCedo: inicio,
      fimMaisCedo: inicio + duracao + aprovacao,
      inicioMaisTarde: 0,
      fimMaisTarde: 0,
      folga: 0,
      critica: false,
    });
  }
  const total = Math.max(...[...calc.values()].map((a) => a.fimMaisCedo));
  for (const a of [...ordem].reverse()) {
    const c = calc.get(a.id) as AtividadeCalculada;
    const sucessoras = ordem.filter((b) => b.predecessoras.includes(a.id));
    c.fimMaisTarde = sucessoras.length
      ? Math.min(...sucessoras.map((b) => (calc.get(b.id) as AtividadeCalculada).inicioMaisTarde))
      : total;
    c.inicioMaisTarde = c.fimMaisTarde - c.duracao - c.aprovacao;
    c.folga = c.inicioMaisTarde - c.inicioMaisCedo;
    c.critica = c.folga === 0;
  }
  const lista = ordem.map((a) => calc.get(a.id) as AtividadeCalculada);
  const criticas = lista.filter((a) => a.critica).sort((a, b) => a.inicioMaisCedo - b.inicioMaisCedo);
  const desvioTotal = Math.sqrt(criticas.reduce((s, a) => s + a.desvio ** 2, 0));

  let dataFim: Date | undefined;
  if (par.inicio) {
    const inicio = primeiroDiaUtil(par.inicio);
    for (const a of lista) {
      a.dataInicio = somarDiasUteis(inicio, a.inicioMaisCedo);
      a.dataFim = a.fimMaisCedo > 0 ? somarDiasUteis(inicio, a.fimMaisCedo - 1) : inicio;
    }
    dataFim = total > 0 ? somarDiasUteis(inicio, total - 1) : inicio;
  }

  return {
    atividades: lista,
    total,
    desvioTotal,
    caminhoCritico: criticas.map((a) => a.id),
    dataFim,
    problemas,
    conferenciaPrazo: conferirPrazo(total, par, dataFim),
  };
}

function conferirPrazo(
  total: number,
  par: ParametrosCronograma,
  dataFim?: Date,
): Cronograma["conferenciaPrazo"] {
  const prazo = par.prazoRfp;
  if (!prazo)
    return {
      situacao: "nao-conferido",
      texto: "Prazo de execução da RFP não localizado pelo código — conferir no documento.",
    };
  const onde = prazo.origem ? ` (${prazo.origem.documento}, p. ${prazo.origem.pagina})` : "";
  if (prazo.unidade === "dias úteis") {
    const cabe = total <= prazo.dias;
    return {
      situacao: cabe ? "cabe" : "nao-cabe",
      texto: `Cronograma: ${total} dias úteis; prazo da RFP: ${prazo.texto}${onde}. ${cabe ? `Sobram ${prazo.dias - total} dias úteis.` : `Passa ${total - prazo.dias} dias úteis.`}`,
    };
  }
  // prazo em dias corridos, meses ou anos: compara em dias corridos
  const convertido =
    prazo.unidade === "meses" || prazo.unidade === "anos"
      ? " (meses × 30 e anos × 365, conversão do código)"
      : "";
  if (par.inicio && dataFim) {
    const corridos = diasEntre(primeiroDiaUtil(par.inicio), dataFim) + 1;
    const cabe = corridos <= prazo.dias;
    return {
      situacao: cabe ? "cabe" : "nao-cabe",
      texto: `Cronograma: ${total} dias úteis, ${corridos} dias corridos a partir do início informado pelo GP; prazo da RFP: ${prazo.texto}${onde}, ${prazo.dias} dias${convertido}. ${cabe ? `Sobram ${prazo.dias - corridos} dias corridos.` : `Passa ${corridos - prazo.dias} dias corridos.`}`,
    };
  }
  const aproximado = Math.ceil((total * 7) / 5);
  const cabe = aproximado <= prazo.dias;
  return {
    situacao: cabe ? "cabe" : "nao-cabe",
    texto: `Cronograma: ${total} dias úteis, cerca de ${aproximado} dias corridos (aproximação do código: 5 dias úteis por semana, sem feriados; informe o início para a conta com datas); prazo da RFP: ${prazo.texto}${onde}, ${prazo.dias} dias${convertido}. ${cabe ? "Cabe, pela aproximação." : "Passa, pela aproximação."}`,
  };
}

// ---------- prazo de cada produto ----------

export interface ConferenciaProduto {
  produto: string;
  nome: string;
  /** Entrega do produto no cronograma, em dias úteis desde o início (sem a aprovação, que vem depois). */
  fim: number;
  dataFim?: Date;
  prazo?: PrazoProduto;
  situacao: SituacaoPrazo;
  texto: string;
}

/**
 * Cada produto contra o prazo de entrega que o documento dá. O prazo vem do PMO com a fonte: só vale se a citação
 * for achada pelo código e o número estiver no trecho. Contagem não informada é tratada como dias corridos (a
 * leitura mais apertada), e a tela diz isso.
 */
export function conferirPrazosDosProdutos(
  crono: Cronograma,
  produtos: ProdutoSow[],
  documentos: DocumentoLido[],
  inicio?: Date,
): ConferenciaProduto[] {
  return produtos.map((p) => {
    const atividades = crono.atividades.filter((a) => a.produto === p.id);
    // o prazo é de entrega: a aprovação do cliente vem depois dela e não conta
    const entrega = (a: AtividadeCalculada) => a.fimMaisCedo - a.aprovacao;
    const fim = atividades.length ? Math.max(...atividades.map(entrega)) : 0;
    const dataFim =
      inicio && fim > 0
        ? somarDiasUteis(primeiroDiaUtil(inicio), fim - 1)
        : inicio
          ? primeiroDiaUtil(inicio)
          : undefined;
    const base = { produto: p.id, nome: p.nome, fim, dataFim, prazo: p.prazo ?? undefined };
    if (!atividades.length)
      return {
        ...base,
        situacao: "nao-conferido" as const,
        texto: "Nenhuma atividade da EAP ligada a este produto.",
      };
    if (!p.prazo)
      return {
        ...base,
        situacao: "nao-conferido" as const,
        texto: "Prazo do produto não informado pelo PMO — conferir no documento.",
      };
    const citacao = conferirCitacao(p.prazo.fonte, documentos);
    if (
      !citacaoValeComoFato(citacao) ||
      !p.prazo.fonte.trecho.replace(/\D/g, " ").split(" ").includes(String(p.prazo.dias))
    )
      return {
        ...base,
        situacao: "nao-conferido" as const,
        texto: `Prazo de ${p.prazo.dias} dias com citação não conferida pelo código — conferir no documento.`,
      };
    const onde = `RFP, p. ${citacao.pagina ?? p.prazo.fonte.pagina}`;
    if (p.prazo.contagem === "dias úteis") {
      const cabe = fim <= p.prazo.dias;
      return {
        ...base,
        situacao: cabe ? ("cabe" as const) : ("nao-cabe" as const),
        texto: `Entrega no dia útil ${fim}; prazo: ${p.prazo.dias} dias úteis ${p.prazo.aPartirDe} (${onde}).`,
      };
    }
    const aviso =
      p.prazo.contagem === "não informada" ? " (contagem não informada: tratada como dias corridos)" : "";
    const corridos =
      inicio && dataFim ? diasEntre(primeiroDiaUtil(inicio), dataFim) + 1 : Math.ceil((fim * 7) / 5);
    const conta =
      inicio && dataFim ? `${corridos} dias corridos` : `cerca de ${corridos} dias corridos (aproximação)`;
    const cabe = corridos <= p.prazo.dias;
    return {
      ...base,
      situacao: cabe ? ("cabe" as const) : ("nao-cabe" as const),
      texto: `Entrega em ${conta}; prazo: ${p.prazo.dias} dias ${p.prazo.aPartirDe}${aviso} (${onde}).`,
    };
  });
}
