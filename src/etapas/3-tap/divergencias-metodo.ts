// Etapa 3 pelo método (docs/estudos/metodo-etapa-3.md, seção 4.1; decisão 0041): as divergências por código que o
// método pede além das de requisito, prazo e valor: valor nos três documentos, parcelas (ordem, percentual, prazo)
// com a frase de conformidade, duração × vigência, equipe com regra diferente (mínimo × limite) e quadro de equipe ×
// produtividade. O contrato assinado prevalece: quando há contrato, ele é a versão sugerida. As de texto (proteção ×
// cláusula, quem aprova, término, orçamento × obrigação) são da leitura do PMO.
import type { ParcelaDesembolso } from "../../extracao/rfp/dinheiro";
import { extrairDesembolso } from "../../extracao/rfp/dinheiro";
import { prepararDocumento, type OrigemItem } from "../../extracao/rfp/item";
import { localizarTodos, origemDe } from "../../extracao/rfp/localizar";
import { conferirProdutividade, extrairTetos } from "../../regras/produtividade";
import { conferirDuracao, mesesDoRotulo, vigenciaEmMeses } from "../../regras/vigencia";
import { quadroContraOTeto } from "../2-proposta/minuta";
import type { Divergencia, LadoDivergencia } from "./divergencias";
import type { EntradaTap } from "./entrada";

const onde = (o?: OrigemItem) => (o ? `${o.documento}, p. ${o.pagina}` : undefined);
const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (n: number) => `${n.toLocaleString("pt-BR")}%`;

function parcelasEmTexto(ps: ParcelaDesembolso[]): string {
  return ps.map((p, k) => `${k + 1}ª ${pct(p.percentual)}${p.prazo ? ` (${p.prazo})` : ""}`).join("; ");
}

/** Compara duas listas de parcelas, parcela a parcela: quantidade, percentual e prazo. */
export function parcelasIguais(
  a: ParcelaDesembolso[],
  b: ParcelaDesembolso[],
): { iguais: boolean; diferencas: string[] } {
  const diferencas: string[] = [];
  if (a.length !== b.length) diferencas.push(`${a.length} × ${b.length} parcelas`);
  for (let k = 0; k < Math.min(a.length, b.length); k++) {
    const x = a[k] as ParcelaDesembolso;
    const y = b[k] as ParcelaDesembolso;
    if (x.percentual !== y.percentual)
      diferencas.push(`${k + 1}ª parcela: ${pct(x.percentual)} × ${pct(y.percentual)}`);
    const dx = x.prazo?.replace(/\D/g, "");
    const dy = y.prazo?.replace(/\D/g, "");
    if (dx && dy && dx !== dy) diferencas.push(`${k + 1}ª parcela: prazo ${x.prazo} × ${y.prazo}`);
  }
  return { iguais: !diferencas.length, diferencas };
}

/** "Em conformidade com o item 5 do edital": a frase da proposta que declara seguir o edital. */
const RE_CONFORMIDADE =
  /\b(?:em conformidade com|conforme|de acordo com|segundo)\s+(?:o |a )?(?:item|subitem|clausula|anexo|quadro|tabela)\s+[\divx.]+[a-z]?(?:\s+d[oa] (?:edital|termo de referencia|chamamento|tr))?/;
const RE_DESEMBOLSO_PERTO = /\b(?:desembolso|parcelas?|repasse|pagamento|percentual)\b/;

function parcelasDaProposta(e: EntradaTap): { parcelas: ParcelaDesembolso[]; onde: string } | undefined {
  if (!e.proposta) return undefined;
  if (e.fonte === "dossie")
    // a minuta da etapa 2 usa o cronograma de parcelas do edital (decisão 0038)
    return {
      parcelas: e.ponto.analise.desembolso.parcelas,
      onde: "proposta (dossiê): as parcelas do edital",
    };
  const d = prepararDocumento(e.proposta.id, "proposta", e.proposta.paginas);
  const ps = extrairDesembolso([d]).parcelas;
  return ps.length ? { parcelas: ps, onde: onde(ps[0]?.origem) ?? "proposta" } : undefined;
}

function divergenciaDeParcelas(e: EntradaTap): Divergencia[] {
  const rfp = e.ponto.analise.desembolso;
  const prop = parcelasDaProposta(e);
  const ctr = e.lidoDoContrato?.desembolso.parcelas;
  const out: Divergencia[] = [];
  if (!rfp.parcelas.length && !prop?.parcelas.length && !ctr?.length) return out;
  const ladoRfp: LadoDivergencia = rfp.parcelas.length
    ? { texto: parcelasEmTexto(rfp.parcelas), onde: onde(rfp.parcelas[0]?.origem) }
    : rfp.unica
      ? { texto: "parcela única", onde: onde(rfp.unica) }
      : { texto: "cronograma de desembolso não localizado na RFP pelo código — conferir" };
  const ladoProp: LadoDivergencia = prop
    ? { texto: parcelasEmTexto(prop.parcelas), onde: prop.onde }
    : { texto: "parcelas não localizadas na proposta pelo código — conferir" };
  const ladoCtr: LadoDivergencia | undefined = e.lidoDoContrato
    ? ctr?.length
      ? { texto: parcelasEmTexto(ctr), onde: onde(ctr[0]?.origem) }
      : { texto: "parcelas não localizadas no contrato pelo código — conferir" }
    : undefined;
  const difs: string[] = [];
  if (rfp.parcelas.length && prop?.parcelas.length)
    difs.push(...parcelasIguais(rfp.parcelas, prop.parcelas).diferencas.map((d) => `RFP × proposta: ${d}`));
  if (ctr?.length && prop?.parcelas.length)
    difs.push(...parcelasIguais(prop.parcelas, ctr).diferencas.map((d) => `proposta × contrato: ${d}`));
  if (ctr?.length && rfp.parcelas.length)
    difs.push(...parcelasIguais(rfp.parcelas, ctr).diferencas.map((d) => `RFP × contrato: ${d}`));
  const somas = [prop?.parcelas, ctr].filter((x): x is ParcelaDesembolso[] => Boolean(x?.length));
  for (const s of somas) {
    const soma = Math.round(s.reduce((t, p) => t + p.percentual, 0) * 100) / 100;
    if (soma !== 100) difs.push(`as parcelas somam ${pct(soma)}, não 100% (conta do código)`);
  }
  const comparou = Boolean(prop?.parcelas.length && (rfp.parcelas.length || ctr?.length));
  out.push({
    id: "parcelas",
    tema: "parcelas",
    rfp: ladoRfp,
    proposta: ladoProp,
    contrato: ladoCtr,
    situacao: !comparou ? "nao-conferido" : difs.length ? "diferente" : "igual",
    observacao: difs.length
      ? `Parcelas diferentes (parcela a parcela, conta do código): ${difs.join("; ")}. Sugere-se seguir o assinado e registrar o efeito no caixa.`
      : comparou
        ? "As parcelas são as mesmas, na mesma ordem (conta do código)."
        : "O código não tem dois cronogramas de parcelas para comparar — conferir.",
    versaoSugerida: difs.length ? (ctr?.length ? "contrato" : "rfp") : undefined,
    oQueFazer: difs.length
      ? "Confirmar por escrito com o contratante qual cronograma vale e levar à reunião de abertura."
      : undefined,
  });
  // a frase de conformidade da proposta perto do desembolso, quando as parcelas não conferem
  if (difs.some((d) => d.startsWith("RFP × proposta")) && e.proposta && e.fonte === "pdf") {
    const d = prepararDocumento(e.proposta.id, "proposta", e.proposta.paginas);
    const frase = localizarTodos([d], RE_CONFORMIDADE).find((l) =>
      RE_DESEMBOLSO_PERTO.test(l.termo + l.frase.toLowerCase()),
    );
    if (frase)
      out.push({
        id: "conformidade:parcelas",
        tema: "conformidade",
        rfp: ladoRfp,
        proposta: { texto: frase.frase, onde: onde(origemDe(frase)) },
        contrato: ladoCtr,
        situacao: "diferente",
        observacao:
          "A proposta declara seguir o edital no desembolso, mas as parcelas não conferem com ele. Frase de conformidade que não confere é divergência à parte: sugere-se corrigir a frase ou a tabela.",
        versaoSugerida: ctr?.length ? "contrato" : "rfp",
        oQueFazer: "Levar à reunião de abertura e registrar por escrito a versão que vale.",
      });
  }
  return out;
}

function vigenciaQueVale(e: EntradaTap): { meses?: number; lado: LadoDivergencia; doContrato: boolean } {
  const c = e.lidoDoContrato?.vigencia;
  if (c?.meses) return { meses: c.meses, lado: { texto: c.texto, onde: onde(c.origem) }, doContrato: true };
  const r = e.ponto.prazoExecucao;
  return {
    meses: r ? vigenciaEmMeses(r.texto) : undefined,
    lado: r
      ? { texto: r.texto, onde: onde(r.origem) }
      : { texto: "vigência não localizada pelo código — conferir" },
    doContrato: false,
  };
}

/** Os meses do cronograma da proposta: as fases do dossiê, ou o maior trimestre ou mês que o PDF cita. */
function mesesDaProposta(e: EntradaTap): { meses: number; texto: string; onde: string } | undefined {
  const fases = e.dados?.fases?.filter((f) => f.meses > 0) ?? [];
  if (fases.length) {
    const soma = Math.round(fases.reduce((s, f) => s + f.meses, 0) * 100) / 100;
    return {
      meses: soma,
      texto: fases.map((f) => `${f.nome} (${f.meses})`).join(" + "),
      onde: "proposta (dossiê), metodologia",
    };
  }
  if (!e.proposta || e.fonte !== "pdf") return undefined;
  const d = prepararDocumento(e.proposta.id, "proposta", e.proposta.paginas);
  const tri = localizarTodos([d], /\b(\d{1,2})[ºo°]?\s*trimestre\b|\btrimestre\s*(\d{1,2})\b/g);
  const n = Math.max(0, ...tri.map((l) => Number(/(\d{1,2})/.exec(l.termo)?.[1] ?? 0)));
  if (n) {
    const l = tri.find((x) => Number(/(\d{1,2})/.exec(x.termo)?.[1]) === n);
    return {
      meses: n * (mesesDoRotulo("trimestre") ?? 3),
      texto: `${n} trimestres (o maior que a proposta cita)`,
      onde: onde(l ? origemDe(l) : undefined) ?? "proposta",
    };
  }
  return undefined;
}

function divergenciaDeDuracao(e: EntradaTap): Divergencia | undefined {
  const prop = mesesDaProposta(e);
  if (!prop) return undefined;
  const v = vigenciaQueVale(e);
  const c = conferirDuracao([{ rotulo: "cronograma da proposta", meses: prop.meses }], v.meses);
  return {
    id: "duracao",
    tema: "duracao",
    rfp: v.doContrato
      ? { texto: e.ponto.prazoExecucao?.texto ?? "—", onde: onde(e.ponto.prazoExecucao?.origem) }
      : v.lado,
    proposta: { texto: `${prop.texto}: ${prop.meses} meses (conta do código)`, onde: prop.onde },
    contrato: v.doContrato ? v.lado : undefined,
    situacao: c.situacao === "passa" ? "diferente" : c.situacao === "cabe" ? "igual" : "nao-conferido",
    observacao:
      c.situacao === "passa"
        ? `${c.texto} Sugere-se ajustar o cronograma à vigência ${v.doContrato ? "do contrato" : "da RFP"} antes de fechar os marcos.`
        : c.texto,
    versaoSugerida: c.situacao === "passa" ? (v.doContrato ? "contrato" : "rfp") : undefined,
    oQueFazer:
      c.situacao === "passa"
        ? "Refazer o cronograma dentro da vigência e confirmar com o contratante como os meses se contam."
        : undefined,
  };
}

/** Mesma equipe com regra diferente: o edital fala em mínimo e a proposta em limite (ou o contrário). */
const RE_MINIMO =
  /\b(?:no minimo|inferior ao minimo|minimo de)\s+(?:\d+\s+)?(?:\([a-z ]+\)\s+)?(?:profission\w+|agentes?|tecnicos?|educadores?|integrantes?)/;
const RE_LIMITE =
  /\b(?:limite de contratacao|no maximo|ate o limite de)\s+(?:de\s+)?\d+\s+(?:\([a-z ]+\)\s+)?(?:profission\w+|agentes?|tecnicos?|educadores?|integrantes?)/;

function divergenciaDeRegraDaEquipe(e: EntradaTap): Divergencia | undefined {
  if (!e.proposta) return undefined;
  const minimo = localizarTodos(e.ponto.analise.documentos, RE_MINIMO)[0];
  const d = prepararDocumento(e.proposta.id, "proposta", e.proposta.paginas);
  const limite = localizarTodos([d], RE_LIMITE)[0];
  if (!minimo || !limite) return undefined;
  return {
    id: "equipe-regra",
    tema: "equipe-regra",
    rfp: { texto: minimo.frase, onde: onde(origemDe(minimo)) },
    proposta: { texto: limite.frase, onde: onde(origemDe(limite)) },
    situacao: "diferente",
    observacao:
      "A RFP trata a equipe como mínimo e a proposta como limite: a mesma quantidade com regra diferente. Sugere-se registrar no TAP qual regra vale (o contrato costuma prevalecer).",
    versaoSugerida: e.contrato ? "contrato" : "rfp",
    oQueFazer: "Confirmar por escrito com o contratante.",
  };
}

function divergenciaDeProdutividade(e: EntradaTap): Divergencia | undefined {
  const eap = e.dados?.operacao;
  if (!eap?.volumes.length) return undefined;
  const docs = [...e.ponto.analise.documentos, ...(e.lidoDoContrato ? [e.lidoDoContrato.doc] : [])];
  const { periodos, teto } = quadroContraOTeto(eap, extrairTetos(docs));
  const c = conferirProdutividade(periodos, teto);
  if (c.situacao !== "passa") return undefined;
  return {
    id: "produtividade",
    tema: "produtividade",
    rfp: {
      texto: teto ? `${teto.quantidade} ${teto.unidade} por ${teto.por === "mes" ? "mês" : teto.por}` : "—",
      onde: onde(teto?.origem),
    },
    proposta: { texto: c.texto, onde: "proposta (dossiê), quadro de equipe e volumes" },
    situacao: "diferente",
    observacao:
      "O volume previsto não fecha com o quadro de equipe e o teto escrito (conta do código). Sugere-se rever o quadro ou a meta antes de começar.",
    versaoSugerida: e.contrato ? "contrato" : "rfp",
    oQueFazer: "Levar à reunião de abertura: rever o quadro, o volume ou a meta, por escrito.",
  };
}

function divergenciaDeValorNoContrato(e: EntradaTap): Divergencia | undefined {
  const c = e.lidoDoContrato?.valor;
  if (!e.lidoDoContrato) return undefined;
  const vProp = e.dados?.valor;
  const ladoCtr: LadoDivergencia = c
    ? { texto: reais(c.valor), onde: onde(c.origem) }
    : { texto: "valor não localizado no contrato pelo código — conferir" };
  const diferente = Boolean(c && vProp !== undefined && Math.abs(c.valor - vProp) > 0.009);
  return {
    id: "valor-contrato",
    tema: "valor",
    rfp: { texto: e.ponto.valorEstimado?.texto ?? "—", onde: onde(e.ponto.valorEstimado?.origem) },
    proposta: {
      texto: vProp !== undefined ? reais(vProp) : "preço final não preenchido na etapa 2 — a definir pelo GP",
    },
    contrato: ladoCtr,
    situacao: !c || vProp === undefined ? "nao-conferido" : diferente ? "diferente" : "igual",
    observacao: diferente
      ? "O valor do contrato é diferente do preço final da proposta. No TAP, vale o valor assinado; sugere-se conferir se houve negociação registrada."
      : c
        ? "Os recursos do TAP seguem o valor do contrato assinado."
        : "O código não achou o valor no contrato — conferir.",
    versaoSugerida: c ? "contrato" : undefined,
    oQueFazer: diferente ? "Confirmar o valor com o jurídico e com o contratante." : undefined,
  };
}

export function divergenciasDoMetodo(e: EntradaTap): Divergencia[] {
  if (e.fonte === "nenhuma") return [];
  return [
    ...[divergenciaDeValorNoContrato(e)],
    ...divergenciaDeParcelas(e),
    divergenciaDeDuracao(e),
    divergenciaDeRegraDaEquipe(e),
    divergenciaDeProdutividade(e),
  ].filter((d): d is Divergencia => Boolean(d));
}
