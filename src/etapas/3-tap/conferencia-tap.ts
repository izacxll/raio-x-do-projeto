// Etapa 3, último passo (código): conferência do TAP antes de exportar. Todo elemento preenchido ou "a definir pelo
// GP"; todo requisito de alto nível ligado a um número R, e todo R da RFP coberto; marcos dentro do prazo da RFP;
// recursos iguais ao valor da proposta; citações conferidas; premissas críticas no registro, com a consequência.
import { conferirAutoconferenciaDaEtapa3, itensEsperadosDaEtapa3 } from "./autoconferencia";
import { destinosNoTap, ehNumeroDeCompromisso } from "../2-proposta/compromissos";
import type { TapDossie } from "../../dossie/esquema";
import { estadoDe, type ItemConferido } from "../../pmo/itens";
import { encontrarDatas, formatarData, somarDiasCorridos } from "../../texto/datas";
import { tirarAcentos } from "../../texto/normalizar";
import type { RespostaTap } from "../../pmo/schemas/tap";
import { conferirMarcosDoPmo, linhaDosDados } from "../linha-do-tempo";
import { lerValorEmReais } from "../2-proposta/preco";
import { diasDoTexto, pedeDecisao, type Divergencia } from "./divergencias";
import { valorNaProposta, type EntradaTap } from "./entrada";
import { ELEMENTOS_TAP } from "./tap";

export type SituacaoVerificacao = "ok" | "atencao" | "nao-conferido";

export interface VerificacaoTap {
  id: string;
  nome: string;
  situacao: SituacaoVerificacao;
  texto: string;
}

export const NOME_SITUACAO_VERIFICACAO: Record<SituacaoVerificacao, string> = {
  ok: "conferido",
  atencao: "conferir",
  "nao-conferido": "não conferido pelo código",
};

const CAMPO_DECISAO: Record<string, (keyof TapDossie["decisoes"])[]> = {
  "TAP.7": ["recursos"],
  "TAP.11": ["gerente", "autoridade"],
  "TAP.12": ["patrocinador"],
};

const RE_ANTES_DE = /\bantes d[aeo]s?\b/i;
const RE_DENTRO_DA_VIGENCIA = /dentro d[ao] (?:vigencia|prazo)/i;

/**
 * Marcos do TAP que prometem uma data ("antes de 21/09/2026", "antes do evento") ou caber na vigência: o código
 * confere pela conta do cronograma da proposta (a entrega com a aprovação do cliente). O que a conta não confirma é
 * divergência obrigatória; se o TAP já a registrou (TAP-DV), fica registrado.
 */
export function conferirMarcosPelaConta(
  e: EntradaTap,
  marcos: RespostaTap["marcos"],
  divergencias: RespostaTap["divergenciasTexto"],
  diasDaVigencia?: number,
): VerificacaoTap {
  const crono = e.dados?.cronograma;
  const fimVigencia =
    e.dados?.inicio && diasDaVigencia ? somarDiasCorridos(e.dados.inicio, diasDaVigencia) : undefined;
  const promessas = marcos.filter((m) => {
    const t = tirarAcentos(`${m.prazo} ${m.item.texto}`);
    return RE_ANTES_DE.test(t) || RE_DENTRO_DA_VIGENCIA.test(t);
  });
  const naoConfirmados: string[] = [];
  const registrados: string[] = [];
  for (const m of promessas) {
    const t = tirarAcentos(`${m.prazo} ${m.item.texto}`);
    const doProduto = (crono?.atividades ?? []).filter((a) => a.produto === m.produto && a.dataFim);
    const fim = doProduto.length
      ? new Date(Math.max(...doProduto.map((a) => (a.dataFim as Date).getTime())))
      : undefined;
    const limite = RE_ANTES_DE.test(t) ? encontrarDatas(`${m.prazo} ${m.item.texto}`)[0]?.data : undefined;
    const confirmado = limite
      ? Boolean(fim && fim < limite)
      : RE_DENTRO_DA_VIGENCIA.test(t)
        ? fim && fimVigencia
          ? fim <= fimVigencia
          : crono?.conferenciaPrazo.situacao === "cabe"
        : false;
    if (confirmado) continue;
    const nome = `${m.produto || "marco"} ("${m.prazo || m.item.texto}")`;
    const conta = fim
      ? `a conta dá ${formatarData(fim)}`
      : "a conta do cronograma não tem a data deste marco";
    const chaves = [m.produto, limite ? formatarData(limite) : ""].filter((x) => x && x.length > 1);
    const jaNoTap = divergencias.some((d) => chaves.some((k) => `${d.ponto} ${d.item.texto}`.includes(k)));
    (jaNoTap ? registrados : naoConfirmados).push(`${nome}: ${conta}`);
  }
  return {
    id: "marcos-pela-conta",
    nome: "Marcos com data ou vigência confirmados pela conta do cronograma",
    situacao: naoConfirmados.length ? "atencao" : promessas.length ? "ok" : "nao-conferido",
    texto: !promessas.length
      ? 'Nenhum marco promete data ("antes de …") ou caber na vigência.'
      : [
          naoConfirmados.length
            ? `Divergência obrigatória — a conta do cronograma não confirma: ${naoConfirmados.join("; ")}. Sugere-se registrar cada um no TAP como divergência (TAP-DV), com a conta do código.`
            : "",
          registrados.length ? `Já registrados como divergência no TAP: ${registrados.join("; ")}.` : "",
          !naoConfirmados.length && !registrados.length ? "A conta do cronograma confirma os marcos." : "",
        ]
          .filter(Boolean)
          .join(" "),
  };
}

export function conferirTap(
  e: EntradaTap,
  t: TapDossie,
  itens: ItemConferido[],
  premissasConfirmadas: Record<string, boolean>,
  divergencias: Divergencia[] = [],
): VerificacaoTap[] {
  const out: VerificacaoTap[] = [];
  const valido = (i: ItemConferido) => estadoDe(t.revisoes, i.id) !== "descartado";
  const resposta = t.tap?.resposta;
  if (!resposta) return out;

  // 1. cada elemento com conteúdo, ou marcado "a definir pelo GP" (os de decisão do GP saem assim quando vazios)
  for (const el of ELEMENTOS_TAP) {
    const doElemento = itens.filter(
      (i) => i.passo === "tap" && i.grupo.startsWith(`${el.codigo} —`) && valido(i),
    );
    const decisao = (CAMPO_DECISAO[el.codigo] ?? []).some((c) => t.decisoes[c]?.trim());
    const situacao: SituacaoVerificacao = doElemento.length || decisao || el.decisaoGp ? "ok" : "atencao";
    out.push({
      id: `elemento:${el.codigo}`,
      nome: `${el.codigo} — ${el.nome}`,
      situacao,
      texto:
        situacao === "atencao"
          ? 'Sem conteúdo: todos os itens foram descartados. Sugere-se escrever o elemento ou marcar "a definir pelo GP".'
          : el.decisaoGp && !decisao
            ? 'Decisão do GP ainda vazia: sai como "a definir pelo GP".'
            : `${doElemento.length} ${doElemento.length === 1 ? "item" : "itens"}${decisao ? " e a decisão do GP" : ""}.`,
    });
  }

  // 2. requisitos de alto nível ligados a números R, e cada R da RFP coberto
  const altoNivel = itens.filter((i) => i.id.startsWith("tap:requisitosAltoNivel:") && valido(i));
  const semNumero = altoNivel.filter((i) => !i.item.requisitos.length);
  const citados = new Set(altoNivel.flatMap((i) => i.item.requisitos));
  const faltando = e.ponto.requisitos.map((r) => r.numero).filter((n) => !citados.has(n));
  // R que saiu da lista na etapa 1 (descartado pelo GP) ou que não existe: não é requisito do TAP
  const daLista = new Set(e.ponto.requisitos.map((r) => r.numero));
  const foraDaLista = [...citados].filter((n) => !daLista.has(n) && !ehNumeroDeCompromisso(n)).sort();
  out.push({
    id: "requisitos",
    nome: "Requisitos de alto nível ligados aos números R",
    situacao: semNumero.length || faltando.length || foraDaLista.length ? "atencao" : "ok",
    texto: [
      semNumero.length ? `${semNumero.length} requisito(s) de alto nível sem número R.` : "",
      faltando.length ? `Requisitos da RFP não citados no TAP.3: ${faltando.join(", ")}.` : "",
      foraDaLista.length
        ? `${foraDaLista.join(", ")} no TAP.3 não está na lista de requisitos da etapa 1 (descartado pelo GP ou inexistente): sugere-se tratá-lo como restrição ou observação, não como requisito de alto nível.`
        : "",
      !semNumero.length && !faltando.length && !foraDaLista.length
        ? `Os ${e.ponto.requisitos.length} requisitos da RFP estão ligados.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
  });

  // 3. marcos dentro da vigência: a do contrato assinado, quando houver (decisão 0041); senão, o prazo da RFP
  const vigContrato = e.lidoDoContrato?.vigencia;
  // a mesma régua dos marcos (diasDoTexto: meses × 30, anos × 365) nos dois lados
  const diasContrato = vigContrato ? diasDoTexto(vigContrato.texto) : undefined;
  const prazo =
    diasContrato !== undefined
      ? { dias: diasContrato, texto: `${vigContrato?.texto} (contrato)` }
      : e.ponto.prazoExecucao;
  const marcos = resposta.marcos.filter((_, k) => valido({ id: `tap:marcos:${k}` } as ItemConferido));
  if (!prazo) {
    out.push({
      id: "marcos",
      nome: "Marcos dentro da vigência",
      situacao: "nao-conferido",
      texto: "Prazo de execução da RFP não localizado pelo código — conferir os marcos no documento.",
    });
  } else {
    // marco com data ("21/09/2026, data fixa do TR") é data, não prazo em dias: o número da data não é duração.
    // Ele só é conferido contra a vigência quando o início é conhecido (decisão do GP).
    const comData = marcos.filter((m) => encontrarDatas(m.prazo).length > 0);
    const emDias = marcos.filter((m) => !comData.includes(m));
    const fimVigencia = e.dados?.inicio ? somarDiasCorridos(e.dados.inicio, prazo.dias) : undefined;
    const fora = [
      ...emDias
        .map((m) => ({ m, dias: diasDoTexto(m.prazo) }))
        .filter((x) => x.dias !== undefined && x.dias > prazo.dias),
      ...(fimVigencia
        ? comData
            .filter((m) => encontrarDatas(m.prazo).some((d) => d.data > fimVigencia))
            .map((m) => ({ m, dias: undefined }))
        : []),
    ];
    const semPrazo = emDias.filter((m) => diasDoTexto(m.prazo) === undefined);
    const datasSemInicio = fimVigencia ? 0 : comData.length;
    const crono = e.dados?.cronograma?.conferenciaPrazo;
    const produtosFora = (e.dados?.marcos ?? []).filter((m) => m.situacao === "nao-cabe");
    out.push({
      id: "marcos",
      nome: "Marcos dentro da vigência",
      situacao: fora.length || produtosFora.length || crono?.situacao === "nao-cabe" ? "atencao" : "ok",
      texto: [
        fora.length
          ? `Marco(s) além da vigência (${prazo.texto}): ${fora.map((x) => x.m.prazo).join("; ")}.`
          : `Nenhum marco com prazo além de ${prazo.texto}.`,
        semPrazo.length ? `${semPrazo.length} marco(s) sem prazo em dias: conferir.` : "",
        datasSemInicio
          ? `${datasSemInicio} marco(s) com data: conferidos contra a vigência só com o início do projeto informado (decisão do GP).`
          : "",
        produtosFora.length
          ? `No cronograma da proposta, a entrega passa do prazo do produto na RFP: ${produtosFora.map((m) => `${m.produto} (${m.textoConferencia})`).join("; ")}`
          : "",
        crono ? `Cronograma da proposta: ${crono.texto}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  // 3b. marco "antes de [data]" ou "dentro da vigência" que a conta do cronograma não confirma: divergência
  // obrigatória (decisão 0057)
  out.push(conferirMarcosPelaConta(e, marcos, resposta.divergenciasTexto, prazo?.dias));
  // 3c. a conferência dos marcos do PMO contra a conta do código (decisão 0057)
  if (e.dados?.cronograma) {
    const avisos = conferirMarcosDoPmo(
      resposta.conferenciaDosMarcos,
      linhaDosDados(e.dados, e.ponto.prazoExecucao),
    );
    out.push({
      id: "conferencia-dos-marcos",
      nome: "Linha do tempo: a conferência do PMO bate com a conta do código",
      situacao: avisos.length ? "atencao" : "ok",
      texto: avisos.length ? avisos.join(" ") : "O PMO conferiu cada marco e a conta do código confirma.",
    });
  }

  // 4. recursos financeiros (decisão do GP) iguais ao valor da proposta
  const vProposta =
    e.dados?.valor ?? (e.proposta && e.fonte === "pdf" ? valorNaProposta(e.proposta)?.valor : undefined);
  const vTap = t.decisoes.recursos ? lerValorEmReais(t.decisoes.recursos) : undefined;
  out.push({
    id: "valor",
    nome: "Recursos financeiros iguais ao valor da proposta",
    situacao: vTap && vProposta ? (vTap === vProposta ? "ok" : "atencao") : "nao-conferido",
    texto:
      vTap && vProposta
        ? vTap === vProposta
          ? "O valor do TAP é igual ao da proposta."
          : "O valor do TAP é diferente do da proposta: conferir (o TAP costuma firmar o valor do contrato)."
        : !t.decisoes.recursos
          ? "Recursos financeiros a definir pelo GP."
          : "O código não tem os dois valores em reais para comparar.",
  });

  // 4b. valor e parcelas iguais ao contrato, somando 100% (método da etapa 3, seção 4.4)
  if (e.lidoDoContrato) {
    const doContrato = divergencias.filter((d) => d.id === "valor-contrato" || d.id === "parcelas");
    const diferentes = doContrato.filter((d) => d.situacao === "diferente");
    const naoConferidos = doContrato.filter((d) => d.situacao === "nao-conferido");
    out.push({
      id: "contrato",
      nome: "Valor e parcelas iguais ao contrato, somando 100%",
      situacao: diferentes.length
        ? "atencao"
        : naoConferidos.length || !doContrato.length
          ? "nao-conferido"
          : "ok",
      texto: diferentes.length
        ? diferentes.map((d) => d.observacao).join(" ")
        : naoConferidos.length || !doContrato.length
          ? "O código não achou no contrato o valor ou as parcelas para comparar — conferir no documento."
          : "O valor e as parcelas conferem com o contrato e somam 100% (conta do código).",
    });
  } else
    out.push({
      id: "contrato",
      nome: "Valor e parcelas iguais ao contrato, somando 100%",
      situacao: "nao-conferido",
      texto:
        "Sem o contrato ou termo assinado: os números do TAP ficam a confirmar contra o que for assinado.",
    });

  // 4c. toda entrega-chave com critério de aceite; produto que a proposta acrescentou é compromisso
  const produtos = e.dados?.produtos ?? [];
  const semAceite = produtos.filter((x) => !x.criteriosAceite.some((c) => c.trim()));
  const acrescentados = divergencias.filter((d) => d.situacao === "so-na-proposta" && d.tema === "produto");
  out.push({
    id: "aceite",
    nome: "Toda entrega-chave com critério de aceite",
    situacao: !produtos.length ? "nao-conferido" : semAceite.length ? "atencao" : "ok",
    texto: !produtos.length
      ? "Sem os produtos da proposta no dossiê: conferir o aceite de cada entrega no documento."
      : [
          semAceite.length
            ? `Entrega(s) sem critério de aceite: ${semAceite.map((x) => `${x.id} — ${x.nome}`).join("; ")}.`
            : `As ${produtos.length} entregas têm critério de aceite.`,
          acrescentados.length
            ? `Produto(s) que a proposta acrescentou e a RFP não pedia: compromisso assinado, entra como entrega-chave com aceite (${acrescentados.map((d) => d.proposta.texto).join("; ")}).`
            : "",
        ]
          .filter(Boolean)
          .join(" "),
  });

  // 4d. toda divergência com a versão escolhida pelo GP
  const abertas = divergencias.filter((d) => pedeDecisao(d) && !t.divergencias[d.id]);
  out.push({
    id: "divergencias",
    nome: "Toda divergência com a versão escolhida pelo GP",
    situacao: !divergencias.length ? "nao-conferido" : abertas.length ? "atencao" : "ok",
    texto: abertas.length
      ? `${abertas.length} divergência(s) sem versão escolhida: ${abertas.map((d) => d.id).join(", ")}.`
      : divergencias.length
        ? "Todas as divergências têm a versão escolhida pelo GP."
        : "Sem divergências para decidir.",
  });

  // 5. citações
  const naoConferidas = itens.filter((i) => valido(i) && i.conferencia.citacaoNaoConferida);
  const naoProvam = itens.filter((i) => valido(i) && i.conferencia.citacaoNaoProva);
  out.push({
    id: "citacoes",
    nome: "Citações conferidas na página",
    // a citação que pode não provar a frase é aviso, não erro (decisão 0058): não muda a situação
    situacao: naoConferidas.length ? "atencao" : "ok",
    texto:
      [
        naoConferidas.length
          ? `${naoConferidas.length} item(ns) "do documento" com citação não conferida: não valem como fato.`
          : "",
        naoProvam.length
          ? `Aviso: ${naoProvam.length} item(ns) "do documento" com citação a conferir (o trecho pode não trazer o termo-chave): ${naoProvam.map((i) => i.id).join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ") || "Toda citação foi achada pelo código no documento.",
  });

  // 6. premissas críticas confirmadas, no registro com a consequência (TAP-PR.2)
  const pcs = Object.entries(premissasConfirmadas)
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (!t.premissas) {
    out.push({
      id: "premissas-criticas",
      nome: "Premissas críticas no registro, com a consequência",
      situacao: "nao-conferido",
      texto: "Registro de premissas ainda não pedido ao PMO.",
    });
  } else {
    const registro = t.premissas.resposta.premissas.filter((_, k) =>
      valido({ id: `premissas:${k}` } as ItemConferido),
    );
    const sem = pcs.filter((pc) => !registro.some((p) => p.premissaCritica === pc && p.consequencia.trim()));
    out.push({
      id: "premissas-criticas",
      nome: "Premissas críticas no registro, com a consequência",
      situacao: !pcs.length ? "nao-conferido" : sem.length ? "atencao" : "ok",
      texto: !pcs.length
        ? "Nenhuma premissa crítica confirmada pelo GP."
        : sem.length
          ? `Premissa(s) crítica(s) confirmada(s) sem linha no registro com a consequência: ${sem.join(", ")}.`
          : `As premissas críticas confirmadas (${pcs.join(", ")}) estão no registro, com a consequência.`,
    });
  }

  // compromissos da proposta (decisão 0047): cada C com destino no TAP (limite ou registro de premissas)
  const cs = e.dados?.compromissos ?? [];
  if (cs.length) {
    const destinos = destinosNoTap(cs, resposta, t.premissas?.resposta.premissas);
    const sem = destinos.filter((d) => d.situacao === "sem-destino");
    const provaveis = destinos.filter((d) => d.situacao === "provavel");
    out.push({
      id: "compromissos",
      nome: "Compromissos da proposta (C) com destino no TAP",
      situacao: sem.length || provaveis.length ? "atencao" : "ok",
      texto: [
        `${destinos.length - sem.length - provaveis.length} de ${destinos.length} citados pelo PMO no item do TAP.`,
        provaveis.length
          ? `Destino provável, a conferir: ${provaveis.map((d) => d.compromisso.numero).join(", ")}.`
          : "",
        sem.length
          ? `Sem destino localizado pelo código: ${sem.map((d) => d.compromisso.numero).join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  // autoconferência do PMO, por passo: o TAP cobra os seus itens; o registro de premissas, só TAP-PR e B3
  for (const [passo, nome, r] of [
    ["tap", "TAP", t.tap?.resposta.autoconferencia],
    ["premissas", "registro de premissas", t.premissas?.resposta.autoconferencia],
  ] as const) {
    if (!r) continue;
    const a = conferirAutoconferenciaDaEtapa3(passo, r);
    out.push({
      id: `autoconferencia:${passo}`,
      nome: `Autoconferência do PMO no ${nome}`,
      situacao: a.ok ? "ok" : "atencao",
      texto: a.ok
        ? `Os ${itensEsperadosDaEtapa3(passo).length} itens do passo estão marcados.`
        : [
            a.semMarca.length ? `Sem marca: ${a.semMarca.join(", ")}.` : "",
            a.incompletas.length ? `Marca incompleta: ${a.incompletas.join(", ")}.` : "",
          ]
            .filter(Boolean)
            .join(" "),
    });
  }
  return out;
}
