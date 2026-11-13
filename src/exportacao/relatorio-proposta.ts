// Saídas da etapa 2: minuta da proposta técnica (DOCX e PDF), planilha de preço (XLSX), matriz de atendimento e
// checklist de envio (XLSX) e perguntas de esclarecimento (DOCX). Cada trecho leva o rótulo (do documento,
// sugestão, decisão do GP); "do documento" sem citação conferida sai como "citação não conferida", nunca como fato.
// Cabeçalho de minuta enquanto houver item pendente. Sem preço nem nomes quando o GP não preencheu.
import type { DocumentoLido, Dossie, PropostaDossie } from "../dossie/esquema";
import { conferirMinuta } from "../etapas/2-proposta/conferencia-final";
import { calcularCronograma, conferirPrazosDosProdutos } from "../etapas/2-proposta/cronograma";
import { calcularPreco, conferirValor, lerValorEmReais } from "../etapas/2-proposta/preco";
import type { PontoDePartida } from "../etapas/2-proposta/ponto-de-partida";
import {
  contarPendentesProposta,
  estadoDe,
  itensDaProposta,
  textoFinalProposta,
  type ItemProposta,
} from "../etapas/2-proposta/proposta";
import { formatarData } from "../texto/datas";
import type { DocumentoExportavel, Secao } from "./modelo";

const ROTULO = { documento: "Do documento", sugestao: "Sugestão", decisao_gp: "Decisão do GP" } as const;
const A_DEFINIR = "a definir pelo GP";

function base(dossie: Dossie, titulo: string, subtitulo: string, minuta: boolean, agora: Date) {
  return {
    titulo,
    subtitulo,
    projeto: dossie.projeto.nome.trim() || "Projeto sem nome",
    minuta,
    geradoEm: agora,
    versaoApp: dossie.versaoApp,
    versaoSkill: dossie.versaoSkill,
  };
}

/** Rótulo visível de um item, com a página conferida ou o aviso de citação não conferida. */
export function rotuloDoItem(i: ItemProposta): string {
  if (i.item.rotulo === "documento") {
    if (i.conferencia.citacaoNaoConferida) return "[Do documento — citação não conferida]";
    const k = i.conferencia.citacoes.findIndex(
      (c) => c.estado !== "nao-conferida" && c.estado !== "nao-verificavel",
    );
    const pagina = i.conferencia.citacoes[k]?.pagina;
    return `[Do documento${pagina ? `, p. ${pagina}` : ""}]`;
  }
  return `[${ROTULO[i.item.rotulo]}]`;
}

function paragrafo(i: ItemProposta, p: PropostaDossie): string {
  const avisos = [
    i.conferencia.redacaoAConferir ? "redação a conferir" : "",
    i.conferencia.numerosSemFonte.length
      ? `número sem fonte — conferir: ${i.conferencia.numerosSemFonte.join(", ")}`
      : "",
    estadoDe(p.revisoes, i.id) === "pendente" ? "pendente de revisão do GP" : "",
  ].filter(Boolean);
  return `${rotuloDoItem(i)} ${textoFinalProposta(i, p.revisoes)}${i.complemento ? ` ${i.complemento}` : ""}${avisos.length ? ` (${avisos.join("; ")})` : ""}`;
}

function preparar(dossie: Dossie, docs: DocumentoLido[]) {
  const p = dossie.proposta;
  if (!p) throw new Error("a proposta ainda não foi começada");
  const itens = itensDaProposta(p, docs).filter((i) => estadoDe(p.revisoes, i.id) !== "descartado");
  return { p, itens, pendentes: contarPendentesProposta(p, itensDaProposta(p, docs)) };
}

export function montarPropostaTecnica(
  dossie: Dossie,
  ponto: PontoDePartida,
  docs: DocumentoLido[],
  agora = new Date(),
): DocumentoExportavel {
  const { p, itens, pendentes } = preparar(dossie, docs);
  const secoes: Secao[] = [];
  const abordagem = p.estrategia?.resposta.abordagens.find((a) => a.id === p.abordagem?.id);
  secoes.push({
    titulo: "Situação da minuta",
    paragrafos: [
      `Abordagem técnica: ${abordagem ? `[Decisão do GP] ${abordagem.id} — ${abordagem.nome}${p.abordagem?.justificativa ? `. Justificativa: ${p.abordagem.justificativa}` : ""}` : `[Decisão do GP] ${A_DEFINIR}`}.`,
      `${pendentes} pendências de revisão do GP.`,
      "Os itens marcados [Sugestão] são propostas do PMO em redação condicional; os [Decisão do GP] só o GP preenche.",
    ],
  });
  const conteudo = p.conteudo?.resposta;
  conteudo?.estrutura.forEach((s, k) => {
    const daSecao = itens.filter((i) => i.id.startsWith(`conteudo:estrutura:${k}:`));
    secoes.push({
      titulo: `${k + 1}. ${s.titulo}`,
      paragrafos: [
        ...(s.criterio ? [`Responde ao quesito: ${s.criterio}.`] : []),
        ...(daSecao.length
          ? daSecao.map((i) => paragrafo(i, p))
          : ["(todos os itens desta seção foram descartados pelo GP)"]),
      ],
    });
  });
  if (conteudo) {
    secoes.push({
      titulo: "Escopo do trabalho (SOW): produtos e critérios de aceite",
      tabela: {
        colunas: ["Produto", "Descrição", "Requisitos", "Critérios de aceite"],
        larguras: [2, 3, 1, 3],
        linhas: conteudo.produtos.map((x) => [
          `${x.id} — ${x.nome}`,
          x.descricao,
          x.requisitos.join(", "),
          x.criteriosAceite.join("; "),
        ]),
      },
    });
    for (const grupo of ["Exclusões", "Premissas", "Restrições", "Obrigações do contratante"]) {
      const doGrupo = itens.filter((i) => i.grupo === grupo);
      if (doGrupo.length) secoes.push({ titulo: grupo, paragrafos: doGrupo.map((i) => paragrafo(i, p)) });
    }
  }
  const eap = p.eap?.resposta;
  if (eap) {
    const crono = calcularCronograma(eap.atividades, {
      aprovacaoDias: p.parametros.aprovacaoDias,
      inicio: p.parametros.inicio ? new Date(`${p.parametros.inicio}T00:00:00`) : undefined,
      prazoRfp: ponto.prazoExecucao,
    });
    secoes.push({
      titulo: "Cronograma executivo (calculado pelo código)",
      paragrafos: [
        `Duração esperada (PERT): ${crono.total} dias úteis, ${p.parametros.aprovacaoDias === undefined ? `sem o tempo de aprovação do cliente (${A_DEFINIR})` : `com ${p.parametros.aprovacaoDias} dias úteis de aprovação por produto (decisão do GP)`}. ${crono.conferenciaPrazo.texto}`,
        ...crono.problemas,
      ],
      tabela: {
        colunas: [
          "Atividade",
          "Produto",
          "Duração (dias úteis)",
          "Aprovação",
          "Início",
          "Fim",
          "Folga",
          "Crítica",
        ],
        larguras: [3, 0.8, 1, 1, 1, 1, 0.8, 0.8],
        linhas: crono.atividades.map((a) => [
          `${a.id} ${a.nome}`,
          a.produto,
          String(a.duracao),
          a.aprovacao ? String(a.aprovacao) : "—",
          a.dataInicio ? formatarData(a.dataInicio) : `dia ${a.inicioMaisCedo + 1}`,
          a.dataFim ? formatarData(a.dataFim) : `dia ${a.fimMaisCedo}`,
          String(a.folga),
          a.critica ? "sim" : "",
        ]),
      },
    });
    const prazos = conferirPrazosDosProdutos(
      crono,
      conteudo?.produtos ?? [],
      docs,
      p.parametros.inicio ? new Date(`${p.parametros.inicio}T00:00:00`) : undefined,
    );
    if (prazos.length)
      secoes.push({
        titulo: "Prazo de entrega de cada produto (conferência do código)",
        tabela: {
          colunas: ["Produto", "Conferência", "Situação"],
          larguras: [2.5, 5, 1],
          linhas: prazos.map((x) => [
            `${x.produto} — ${x.nome}`,
            x.texto,
            x.situacao === "cabe" ? "cabe" : x.situacao === "nao-cabe" ? "não cabe" : "não conferido",
          ]),
        },
      });
    secoes.push({
      titulo: "Equipe",
      tabela: {
        colunas: ["Perfil", "Exigido pela RFP", "Qualificação", "Nome"],
        larguras: [3, 1, 3, 2],
        linhas: eap.perfis.map((x) => [
          x.nome,
          x.exigido ? `sim${x.requisito ? ` (${x.requisito})` : ""}` : "sugerido",
          x.qualificacao,
          p.parametros.nomes[x.id]?.trim()
            ? `[Decisão do GP] ${p.parametros.nomes[x.id]}`
            : `[Decisão do GP] ${A_DEFINIR}`,
        ]),
      },
    });
  }
  return {
    ...base(
      dossie,
      "Proposta técnica — minuta",
      "Minuta montada a partir da RFP, com sugestões do PMO e decisões do GP.",
      pendentes > 0,
      agora,
    ),
    secoes,
  };
}

export function montarPlanilhaPreco(
  dossie: Dossie,
  ponto: PontoDePartida,
  docs: DocumentoLido[],
  agora = new Date(),
): DocumentoExportavel {
  const { p, pendentes } = preparar(dossie, docs);
  const eap = p.eap?.resposta;
  const preco = calcularPreco(eap?.perfis ?? [], eap?.horas ?? [], p.parametros);
  const reais = (v?: number) =>
    v === undefined ? A_DEFINIR : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const estimado = ponto.valorEstimado ? lerValorEmReais(ponto.valorEstimado.texto) : undefined;
  const conf = conferirValor(p.parametros.precoFinal ?? preco.precoCalculado, estimado);
  return {
    ...base(
      dossie,
      "Planilha de preço — minuta",
      "Contas do código com os valores do GP. Sem a tabela do GP, os valores ficam em branco.",
      pendentes > 0 || preco.faltando.length > 0 || p.parametros.precoFinal === undefined,
      agora,
    ),
    secoes: [
      {
        titulo: "Horas por perfil",
        paragrafos: [
          ponto.planilhaDoEdital
            ? `O edital tem planilha própria (${ponto.planilhaDoEdital.origem?.documento}, p. ${ponto.planilhaDoEdital.origem?.pagina}): transpor os valores para ela.`
            : "O código não localizou planilha de preços no edital — conferir no documento.",
          "Horas: PERT das estimativas do PMO por atividade. Valor-hora: decisão do GP.",
        ],
        tabela: {
          colunas: ["Perfil", "Horas (PERT)", "Valor-hora (GP)", "Custo"],
          larguras: [3, 1, 1, 1],
          linhas: [
            ...preco.linhas.map((l) => [l.perfil.nome, String(l.horas), reais(l.valorHora), reais(l.custo)]),
            ["Total", String(preco.horasTotais), "", reais(preco.pessoal)],
          ],
        },
      },
      {
        titulo: "Composição do preço",
        tabela: {
          colunas: ["Item", "Valor", "Origem"],
          larguras: [3, 1.5, 2],
          linhas: [
            ["Pessoal", reais(preco.pessoal), "código"],
            ...p.parametros.despesas.map((d) => [`Despesa: ${d.descricao}`, reais(d.valor), "GP"]),
            ["Custo direto", reais(preco.direto), "código"],
            [
              `Custos indiretos (${p.parametros.indiretosPct ?? "?"}%)`,
              reais(preco.indiretos),
              "percentual do GP",
            ],
            ["Reserva de contingência", reais(preco.reserva), "GP"],
            ["Subtotal", reais(preco.subtotal), "código"],
            [
              `Tributos por dentro (${p.parametros.tributosPct ?? "?"}%)`,
              reais(preco.tributos),
              "percentual do GP",
            ],
            ["Preço calculado", reais(preco.precoCalculado), "código"],
            [
              "Preço final",
              p.parametros.precoFinal === undefined
                ? `[Decisão do GP] ${A_DEFINIR}`
                : `[Decisão do GP] ${reais(p.parametros.precoFinal)}`,
              "GP",
            ],
          ],
        },
      },
      {
        titulo: "Conferência",
        paragrafos: [
          conf.texto,
          ...(preco.faltando.length ? [`Falta preencher: ${preco.faltando.join("; ")}.`] : []),
        ],
      },
    ],
  };
}

export function montarMatrizEChecklist(
  dossie: Dossie,
  ponto: PontoDePartida,
  docs: DocumentoLido[],
  agora = new Date(),
): DocumentoExportavel {
  const { p, pendentes } = preparar(dossie, docs);
  const m = conferirMinuta(ponto, p.estrategia?.resposta, p.conteudo?.resposta, p.eap?.resposta);
  return {
    ...base(
      dossie,
      "Matriz de atendimento e checklist de envio",
      "Conferência do código: cada requisito e quesito ligado ao ponto da minuta que o atende.",
      pendentes > 0,
      agora,
    ),
    secoes: [
      {
        titulo: "Matriz de atendimento",
        paragrafos: [
          "'Não localizado na minuta' quer dizer que o código não ligou o requisito a nenhuma parte da minuta: conferir.",
        ],
        tabela: {
          colunas: ["Requisito ou quesito", "Tipo", "Descrição", "Origem na RFP", "Atendido em", "Situação"],
          larguras: [1.4, 0.8, 3, 1.2, 3, 1.2],
          linhas: m.matriz.map((l) => [
            l.chave,
            l.tipo === "requisito" ? "requisito" : "quesito",
            l.descricao,
            l.origem ?? "—",
            l.atendidoEm.join("; ") || "—",
            l.situacao === "atendido" ? "atendido" : "não localizado na minuta — conferir",
          ]),
        },
      },
      {
        titulo: "Checklist de envio",
        paragrafos: m.limitePaginas ? [m.limitePaginas.texto] : [],
        tabela: {
          colunas: ["Item", "O que o código localizou", "Origem", "Situação"],
          larguras: [2, 4, 1.2, 1.4],
          linhas: m.checklist.map((c) => [
            c.item,
            c.detalhe,
            c.origem ?? "—",
            c.situacao === "a-conferir" ? "a conferir pelo GP" : "não localizado pelo código",
          ]),
        },
      },
    ],
  };
}

export function montarPerguntasProposta(
  dossie: Dossie,
  ponto: PontoDePartida,
  docs: DocumentoLido[],
  agora = new Date(),
): DocumentoExportavel {
  const { p } = preparar(dossie, docs);
  const daEstrategia = (p.estrategia?.resposta.destinos ?? []).filter((d) => d.destino === "pergunta");
  const daEtapa1 = ponto.brechas.filter((b) => !daEstrategia.some((d) => d.origem === b.id));
  const linhas = [
    ...daEstrategia.map(
      (d) => `[Sugestão] ${d.texto}${d.fontes[0] ? ` (Referência: RFP, p. ${d.fontes[0].pagina}.)` : ""}`,
    ),
    ...daEtapa1.map(
      (b) =>
        `[Sugestão] ${b.perguntaFinal}${b.origem ? ` (Referência: ${b.origem.documento}, p. ${b.origem.pagina}.)` : ""}`,
    ),
  ];
  const limite = ponto.limiteEsclarecimento;
  return {
    ...base(
      dossie,
      "Perguntas de esclarecimento",
      "Perguntas sugeridas pela etapa 1 e pela estratégia da proposta. Quais enviar é decisão do GP.",
      true,
      agora,
    ),
    secoes: [
      {
        titulo: "Prazo",
        paragrafos: [
          limite
            ? `${limite.nome}: ${limite.texto}${limite.campos?.Alerta ? ` — ${limite.campos.Alerta}` : ""}`
            : "Limite para pedir esclarecimento não localizado pelo código — conferir no documento.",
        ],
      },
      {
        titulo: "Perguntas",
        paragrafos: linhas.length ? linhas.map((l, k) => `${k + 1}. ${l}`) : ["Nenhuma pergunta sugerida."],
      },
    ],
  };
}
