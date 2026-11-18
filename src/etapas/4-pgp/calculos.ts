// Etapa 4 (código): o que sai de conta, nunca do modelo. Cronograma (rede, caminho crítico, datas), marcos com a
// conferência contra a RFP e o TAP, custos com os valores do GP (linha de base com a contingência, orçamento com a
// reserva gerencial) e a matriz de rastreabilidade RFP → TAP → PGP.
import {
  destinosNoPlano,
  destinosNoTap,
  type Compromisso,
  type DestinoCompromisso,
} from "../2-proposta/compromissos";
import type { ItemConferido } from "../../pmo/itens";
import type { ParametrosPgp, PgpDossie } from "../../dossie/esquema";
import { formatarData, somarDiasUteis } from "../../texto/datas";
import {
  calcularCronograma,
  primeiroDiaUtil,
  type Cronograma,
  type SituacaoPrazo,
} from "../2-proposta/cronograma";
import { calcularPreco, lerValorEmReais, type Preco } from "../2-proposta/preco";
import { diasDoTexto } from "../3-tap/divergencias";
import type { EntradaPgp } from "./entrada";
import { inicioFixo } from "../../regras/cruzamentos-rfp";
import type { RespostaCronograma } from "../../pmo/schemas/pgp";

export function inicioDe(par: ParametrosPgp): Date | undefined {
  return par.inicio ? new Date(`${par.inicio}T00:00:00`) : undefined;
}

/**
 * Início do cronograma do plano: o do GP; sem ele, a data fixa de início do documento, a confirmar pelo GP
 * (a mesma regra da etapa 3).
 */
export function inicioDoPgp(p: PgpDossie, e: EntradaPgp): { inicio?: Date; doDocumento?: string } {
  const doGp = inicioDe(p.parametros);
  if (doGp) return { inicio: doGp };
  const fixo = inicioFixo(e.ponto.analise.documentos);
  return fixo ? { inicio: fixo.data, doDocumento: `${fixo.origem.documento}, p. ${fixo.origem.pagina}` } : {};
}

export function cronogramaDoPgp(p: PgpDossie, e: EntradaPgp): Cronograma | undefined {
  const c = p.cronograma?.resposta;
  if (!c) return undefined;
  const { inicio, doDocumento } = inicioDoPgp(p, e);
  return calcularCronograma(c.atividades, {
    aprovacaoDias: p.parametros.aprovacaoDias,
    inicio,
    inicioDoDocumento: doDocumento,
    prazoRfp: e.ponto.prazoExecucao,
    feriados: p.parametros.feriados,
    horas: c.horas,
    hoje: e.hoje,
  });
}

/**
 * RACI (B18): um só A por atividade; toda atividade com A; perfil da equipe tem de estar na lista de perfis. Linha do
 * contratante (parte "contratante") não entra na lista de equipe: é o papel dele na atividade.
 */
export function conferirRaci(c: RespostaCronograma): string[] {
  const problemas: string[] = [];
  const perfis = new Set(c.perfis.map((x) => x.id));
  const atividades = new Set(c.atividades.map((a) => a.id));
  for (const a of c.atividades) {
    const as = c.raci.filter((r) => r.atividade === a.id && r.papel === "A");
    if (as.length > 1)
      problemas.push(
        `Atividade ${a.id} com ${as.length} "A" na RACI (${as.map((r) => r.perfil).join(", ")}): deve ter um só.`,
      );
    else if (!as.length && c.raci.some((r) => r.atividade === a.id))
      problemas.push(`Atividade ${a.id} sem "A" na RACI.`);
  }
  const semLinha = c.atividades.filter((a) => !c.raci.some((r) => r.atividade === a.id)).map((a) => a.id);
  if (semLinha.length) problemas.push(`Atividades sem linha na RACI: ${semLinha.join(", ")}.`);
  const fora = [...new Set(c.raci.filter((r) => !atividades.has(r.atividade)).map((r) => r.atividade))];
  if (fora.length) problemas.push(`RACI com atividade que não existe no cronograma: ${fora.join(", ")}.`);
  const semPerfil = [
    ...new Set(c.raci.filter((r) => r.parte !== "contratante" && !perfis.has(r.perfil)).map((r) => r.perfil)),
  ];
  if (semPerfil.length)
    problemas.push(`Perfil da equipe na RACI sem estar na lista de perfis: ${semPerfil.join(", ")}.`);
  return problemas;
}

/**
 * Atividades × pacotes da EAP do passo de escopo: atividade sem pacote, pacote que não existe, pacote sem atividade e
 * atividade num pacote de outro produto.
 */
export function conferirPacotes(p: PgpDossie): string[] {
  const atividades = p.cronograma?.resposta.atividades ?? [];
  const pacotes = p.escopo?.resposta.eap ?? [];
  if (!atividades.length || !pacotes.length) return [];
  const problemas: string[] = [];
  const porId = new Map(pacotes.map((x) => [x.id, x]));
  const semPacote = atividades.filter((a) => !a.pacote.trim()).map((a) => a.id);
  if (semPacote.length) problemas.push(`Atividades sem pacote da EAP: ${semPacote.join(", ")}.`);
  const inexistente = atividades.filter((a) => a.pacote.trim() && !porId.has(a.pacote.trim()));
  if (inexistente.length)
    problemas.push(
      `Atividades com pacote que não existe na EAP: ${inexistente.map((a) => `${a.id} (${a.pacote})`).join(", ")}.`,
    );
  const outroProduto = atividades.filter((a) => {
    const x = porId.get(a.pacote.trim());
    return x && x.produto !== a.produto;
  });
  if (outroProduto.length)
    problemas.push(
      `Atividades num pacote de outro produto: ${outroProduto.map((a) => `${a.id} (${a.produto}, pacote ${a.pacote} de ${porId.get(a.pacote.trim())!.produto})`).join(", ")}.`,
    );
  const usados = new Set(atividades.map((a) => a.pacote.trim()));
  const vazios = pacotes.filter((x) => !usados.has(x.id)).map((x) => `${x.id} ${x.nome}`);
  if (vazios.length) problemas.push(`Pacotes da EAP sem atividade no cronograma: ${vazios.join("; ")}.`);
  return problemas;
}

/** Papéis do contratante na RACI, por perfil ("fiscalizacao: A em m5, p5, s5"). */
export function contratanteNaRaci(c: RespostaCronograma): string[] {
  const linhas = c.raci.filter((r) => r.parte === "contratante");
  return [...new Set(linhas.map((r) => r.perfil))].map((perfil) => {
    const papeis = ["R", "A", "C", "I"]
      .map((papel) => {
        const ats = linhas.filter((r) => r.perfil === perfil && r.papel === papel).map((r) => r.atividade);
        return ats.length ? `${papel} em ${ats.join(", ")}` : "";
      })
      .filter(Boolean)
      .join("; ");
    return `${perfil}: ${papeis}`;
  });
}

export interface MarcoCalculado {
  produto: string;
  /** Entrega em dias úteis (sem a aprovação) e aprovação (com o tempo do GP). */
  entrega: number;
  aprovacao: number;
  dataEntrega?: Date;
  dataAprovacao?: Date;
  /** Prazo do marco no TAP, quando houver ("até 30 dias após a assinatura"). */
  prazoTap?: string;
  situacao: SituacaoPrazo;
  texto: string;
}

/**
 * Lista de marcos (B11): a entrega e a aprovação de cada produto, a partir do cronograma. A conferência é contra o
 * prazo do marco no TAP (contado em dias corridos da assinatura, a leitura mais apertada quando a contagem não é dita).
 */
export function marcosDoPgp(p: PgpDossie, e: EntradaPgp, crono: Cronograma): MarcoCalculado[] {
  const { inicio } = inicioDoPgp(p, e);
  const produtos = [...new Set(crono.atividades.map((a) => a.produto))];
  return produtos.map((produto) => {
    const doProduto = crono.atividades.filter((a) => a.produto === produto);
    const entrega = Math.max(...doProduto.map((a) => a.fimMaisCedo - a.aprovacao));
    const aprovacao = Math.max(...doProduto.map((a) => a.fimMaisCedo));
    const data = (d: number) =>
      inicio && d > 0
        ? somarDiasUteis(primeiroDiaUtil(inicio, crono.calendario), d - 1, crono.calendario)
        : undefined;
    const marcoTap = e.marcosTap.find((m) => m.produto === produto);
    const dias = marcoTap ? diasDoTexto(marcoTap.prazo) : undefined;
    const base = {
      produto,
      entrega,
      aprovacao,
      dataEntrega: data(entrega),
      dataAprovacao: data(aprovacao),
      prazoTap: marcoTap?.prazo,
    };
    if (dias === undefined)
      return {
        ...base,
        situacao: "nao-conferido" as const,
        texto: marcoTap
          ? "Prazo do marco no TAP sem número de dias: conferir."
          : "Sem marco do TAP para este produto.",
      };
    // dias úteis → corridos: com o início do GP, pela data; sem ele, aproximação de 5 dias úteis por semana
    const dataEntrega = base.dataEntrega;
    const corridos =
      inicio && dataEntrega
        ? Math.round(
            (dataEntrega.getTime() - primeiroDiaUtil(inicio, crono.calendario).getTime()) / 86_400_000,
          ) + 1
        : Math.ceil((entrega * 7) / 5);
    const conta = inicio ? `${corridos} dias corridos` : `cerca de ${corridos} dias corridos (aproximação)`;
    return {
      ...base,
      situacao: corridos <= dias ? ("cabe" as const) : ("nao-cabe" as const),
      texto: `Entrega em ${conta}; marco do TAP: ${marcoTap!.prazo}.`,
    };
  });
}

export interface CustosPgp {
  preco: Preco;
  /** Linha de base dos custos: pessoal + contingência (A15). */
  linhaDeBase?: number;
  /** Orçamento: linha de base + reserva gerencial (fora da linha de base). */
  orcamento?: number;
  faltando: string[];
  /** Conferência do orçamento com os recursos do TAP ou o preço da proposta. */
  conferencia: string;
  /** Riscos que pedem reserva de contingência (B27): o valor de cada um é do GP, dentro da linha de base. */
  riscosComReserva: { id: string; texto: string }[];
}

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function custosDoPgp(p: PgpDossie, e: EntradaPgp): CustosPgp | undefined {
  const c = p.cronograma?.resposta;
  if (!c) return undefined;
  const par = p.parametros;
  // no plano entram só as horas da equipe e as reservas: tributos e custos indiretos ficam no preço (etapa 2)
  const preco = calcularPreco(c.perfis, c.horas, {
    valoresHora: par.valoresHora,
    despesas: [],
    indiretosPct: 0,
    tributosPct: 0,
    reserva: 0,
  });
  const faltando = [...preco.faltando];
  const riscosComReserva = (p.riscos?.resposta.riscos ?? [])
    .filter((r) => r.pedeReserva)
    .map((r) => ({ id: r.id, texto: r.item.texto }));
  if (par.contingencia === undefined)
    faltando.push(
      `reserva de contingência (decisão do GP${riscosComReserva.length ? `; pedida pelos riscos ${riscosComReserva.map((r) => r.id).join(", ")}` : ""})`,
    );
  if (par.gerencial === undefined) faltando.push("reserva gerencial (decisão do GP)");
  const linhaDeBase =
    preco.pessoal !== undefined && par.contingencia !== undefined
      ? preco.pessoal + par.contingencia
      : undefined;
  const orcamento =
    linhaDeBase !== undefined && par.gerencial !== undefined ? linhaDeBase + par.gerencial : undefined;
  const referencia = (e.recursosTap && lerValorEmReais(e.recursosTap)) || e.dadosProposta?.valor;
  const deOnde =
    e.recursosTap && lerValorEmReais(e.recursosTap) ? "recursos do TAP" : "preço final da proposta";
  const conferencia =
    orcamento === undefined
      ? "Orçamento a definir pelo GP (valores-hora e reservas)."
      : !referencia
        ? "Sem valor do TAP ou da proposta para comparar."
        : orcamento > referencia
          ? `O orçamento (${reais(orcamento)}) passa do ${deOnde} (${reais(referencia)}): conferir. Tributos e custos indiretos não entram nesta conta.`
          : `O orçamento (${reais(orcamento)}) cabe no ${deOnde} (${reais(referencia)}). Tributos e custos indiretos não entram nesta conta.`;
  return { preco, linhaDeBase, orcamento, faltando, conferencia, riscosComReserva };
}

export interface LinhaRastreabilidade {
  requisito: string;
  descricao: string;
  /** Onde aparece no TAP (requisitos de alto nível), na EAP (pacotes) e no cronograma (atividades). */
  tap: string[];
  eap: string[];
  atividades: string[];
  situacao: "rastreado" | "sem-eap" | "sem-atividade" | "obrigacao-no-plano";
}

/** Matriz de rastreabilidade (B23): cada requisito da RFP até o TAP, a EAP e o cronograma. */
export function rastrear(p: PgpDossie, e: EntradaPgp): LinhaRastreabilidade[] {
  const eap = p.escopo?.resposta.eap ?? [];
  const atividades = p.cronograma?.resposta.atividades ?? [];
  // os itens do plano que citam cada R (sem as observações do PMO): a obrigação costuma ir para a B17 ou os limites
  const noPlano = new Set(
    (["adaptacao", "escopo", "cronograma", "riscos", "planos", "execucao"] as const).flatMap((passo) =>
      (p[passo]?.resposta.textos ?? []).flatMap((t) => t.itens.flatMap((i) => i.requisitos)),
    ),
  );
  return e.ponto.listaDeR.map((r) => {
    const tap = e.requisitosTap.filter((t) => t.requisitos.includes(r.numero)).map((t) => t.texto);
    const pacotes = eap.filter((x) => x.requisitos.includes(r.numero)).map((x) => `${x.id} ${x.nome}`);
    const ativ = atividades.filter((a) => a.requisitos.includes(r.numero)).map((a) => `${a.id} ${a.nome}`);
    return {
      requisito: r.numero,
      descricao: `${r.rotulo}: ${r.descricao}`,
      tap,
      eap: pacotes,
      atividades: ativ,
      situacao:
        r.tipo === "obrigacao" && !pacotes.length && noPlano.has(r.numero)
          ? "obrigacao-no-plano"
          : !pacotes.length
            ? "sem-eap"
            : !ativ.length
              ? "sem-atividade"
              : "rastreado",
    };
  });
}

export function textoDaData(d?: Date): string {
  return d ? formatarData(d) : "—";
}

export interface LinhaCompromisso {
  compromisso: Compromisso;
  tap: DestinoCompromisso;
  /** "B14, item b14-5": onde o plano cita o C. */
  plano: string[];
}

/**
 * Compromissos da proposta (decisão 0047) ao lado dos R na matriz (B23): o destino no TAP (citado, provável ou sem) e
 * no plano (o item que cita o número). Os itens do plano são os válidos (sem os descartados pelo GP).
 */
export function rastrearCompromissos(e: EntradaPgp, itens: ItemConferido[]): LinhaCompromisso[] {
  const cs = e.dadosProposta?.compromissos ?? [];
  if (!cs.length) return [];
  const tap = destinosNoTap(cs, e.respostaTap, e.premissasTap);
  // observação do PMO não é conteúdo do plano: não conta como destino
  const plano = destinosNoPlano(
    cs,
    itens
      .filter((i) => i.grupo !== "Observações do PMO")
      .map((i) => ({ parte: i.grupo.split(" — ")[0] ?? i.grupo, item: i.item })),
  );
  return cs.map((c, k) => {
    const t = tap[k]!;
    // o B3 do plano parte do registro inicial: o C que está no registro também está no B3, com a mesma certeza
    const noRegistro =
      t.situacao !== "sem-destino" && t.onde?.startsWith("registro de premissas")
        ? [
            `B3 (registro inicial, ${t.onde.replace("registro de premissas, ", "")}${t.situacao === "provavel" ? ", provável" : ""})`,
          ]
        : [];
    return { compromisso: c, tap: t, plano: [...noRegistro, ...(plano.get(c.numero) ?? [])] };
  });
}
