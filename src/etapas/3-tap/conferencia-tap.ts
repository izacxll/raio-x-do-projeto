// Etapa 3, último passo (código): conferência do TAP antes de exportar. Todo elemento preenchido ou "a definir pelo
// GP"; todo requisito de alto nível ligado a um número R, e todo R da RFP coberto; marcos dentro do prazo da RFP;
// recursos iguais ao valor da proposta; citações conferidas; premissas críticas no registro, com a consequência.
import type { TapDossie } from "../../dossie/esquema";
import { estadoDe, type ItemConferido } from "../../pmo/itens";
import { encontrarDatas, somarDiasCorridos } from "../../texto/datas";
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
  out.push({
    id: "requisitos",
    nome: "Requisitos de alto nível ligados aos números R",
    situacao: semNumero.length || faltando.length ? "atencao" : "ok",
    texto: [
      semNumero.length ? `${semNumero.length} requisito(s) de alto nível sem número R.` : "",
      faltando.length ? `Requisitos da RFP não citados no TAP.3: ${faltando.join(", ")}.` : "",
      !semNumero.length && !faltando.length
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
    // marco com data ("22/09/2025, data fixa do TR") é data, não prazo em dias: o número da data não é duração.
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
  out.push({
    id: "citacoes",
    nome: "Citações conferidas na página",
    situacao: naoConferidas.length ? "atencao" : "ok",
    texto: naoConferidas.length
      ? `${naoConferidas.length} item(ns) "do documento" com citação não conferida: não valem como fato.`
      : "Toda citação foi achada pelo código no documento.",
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
  return out;
}
