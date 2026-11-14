// Saídas da etapa 4: o plano (DOCX e PDF), os registros, o cronograma e as matrizes (XLSX). O mesmo plano, como
// documento "lido", passa pelas regras da etapa 5 (autoconferência). Cada parte que o GP marcou sai com um título
// próprio ("N. Nome da parte"), que o mapa do PGP reconhece; as tabelas das contas são do código.
import type { Dossie, PgpDossie } from "../dossie/esquema";
import { cronogramaDoPgp, custosDoPgp, marcosDoPgp, rastrear, textoDaData } from "../etapas/4-pgp/calculos";
import { montarEntradaPgp, type EntradaPgp } from "../etapas/4-pgp/entrada";
import { NOME_PASSO_PGP, ordemDaParte, passoDaParte } from "../etapas/4-pgp/passos";
import { contarPendentesPgp, itensDoPgp, nomeDaParte, partesAGerar, pgpInicial } from "../etapas/4-pgp/pgp";
import { duracaoEsperada } from "../etapas/2-proposta/cronograma";
import { itensValidos, paragrafoDoItem, type ItemConferido } from "../pmo/itens";
import { camposDoDossie, type DocumentoExportavel, type Secao, type Tabela } from "./modelo";

const A_DEFINIR = "a definir pelo GP";
const reais = (v?: number) =>
  v === undefined ? A_DEFINIR : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const NOME_PROB = { baixa: "baixa", media: "média", alta: "alta" } as const;
const NOME_IMPACTO = { baixo: "baixo", medio: "médio", alto: "alto" } as const;

interface Contexto {
  p: PgpDossie;
  e: EntradaPgp;
  itens: ItemConferido[];
  todos: ItemConferido[];
  pendentes: number;
}

function preparar(dossie: Dossie, hoje: Date): Contexto {
  const p = dossie.pgp ?? pgpInicial();
  const e = montarEntradaPgp(dossie, hoje);
  const todos = itensDoPgp(p, e.documentos);
  return { p, e, todos, itens: itensValidos(p.revisoes, todos), pendentes: contarPendentesPgp(p, todos) };
}

/** Tabelas que o código monta para cada parte (com o que os passos do PMO devolveram). */
function tabelasDoCodigo(codigo: string, c: Contexto): { paragrafos?: string[]; tabela?: Tabela }[] {
  const { p, e } = c;
  const cr = p.cronograma?.resposta;
  const crono = cronogramaDoPgp(p, e);
  const out: { paragrafos?: string[]; tabela?: Tabela }[] = [];
  const conta = "Tabela montada pelo código (conta do código, não do modelo).";
  if (codigo === "A13" && p.escopo)
    out.push({
      tabela: {
        colunas: ["Pacote", "Produto", "Requisitos", "Dicionário", "Critério de aceite"],
        larguras: [2, 1, 1, 4, 3],
        linhas: p.escopo.resposta.eap.map((x) => [
          `${x.id} ${x.nome}`,
          x.produto,
          x.requisitos.join(", "),
          x.descricao,
          x.criterioDeAceite,
        ]),
      },
    });
  if (codigo === "A17" && p.adaptacao)
    out.push({
      paragrafos: [`Abordagem: [Decisão do GP] ${p.abordagem ?? p.adaptacao.resposta.abordagem}.`],
      tabela: {
        colunas: ["Fase", "Entregas", "Critério de saída"],
        larguras: [2, 2, 4],
        linhas: p.adaptacao.resposta.fases.map((f) => [f.nome, f.entregas.join(", "), f.criterioDeSaida]),
      },
    });
  if (codigo === "B23" && p.escopo)
    out.push({
      paragrafos: [conta],
      tabela: {
        colunas: ["Requisito", "Descrição (RFP)", "TAP", "EAP", "Atividades", "Situação"],
        larguras: [1, 3, 3, 2, 2, 1],
        linhas: rastrear(p, e).map((r) => [
          r.requisito,
          r.descricao,
          r.tap.join("; ") || "—",
          r.eap.join("; ") || "—",
          r.atividades.join("; ") || "—",
          r.situacao === "rastreado"
            ? "rastreado"
            : r.situacao === "sem-eap"
              ? "sem pacote na EAP"
              : "sem atividade",
        ]),
      },
    });
  if (cr && crono) {
    if (codigo === "B2")
      out.push({
        paragrafos: [conta],
        tabela: {
          colunas: ["ID e atividade", "Produto", "Predecessoras", "Requisitos"],
          larguras: [4, 1, 2, 2],
          linhas: cr.atividades.map((a) => [
            `${a.id} ${a.nome}`,
            a.produto,
            a.predecessoras.join(", ") || "—",
            a.requisitos.join(", "),
          ]),
        },
      });
    if (codigo === "B8")
      out.push({
        paragrafos: [
          "Duração esperada = (otimista + 4 × mais provável + pessimista) ÷ 6, em dias úteis (conta do código).",
        ],
        tabela: {
          colunas: ["Atividade", "Otimista", "Mais provável", "Pessimista", "Esperada", "Base"],
          larguras: [3, 1, 1, 1, 1, 4],
          linhas: cr.atividades.map((a) => [
            `${a.id} ${a.nome}`,
            String(a.duracao.otimista),
            String(a.duracao.mais_provavel),
            String(a.duracao.pessimista),
            String(duracaoEsperada(a.duracao.otimista, a.duracao.mais_provavel, a.duracao.pessimista)),
            a.duracao.base,
          ]),
        },
      });
    if (codigo === "B15" || codigo === "B16")
      out.push({
        paragrafos: [
          `${conta} Total: ${crono.total} dias úteis${crono.dataFim ? `, até ${textoDaData(crono.dataFim)}` : ""}. ${crono.conferenciaPrazo.texto}`,
          ...crono.problemas,
          "A aprovação de cada produto é dependência externa, a cargo do contratante: o tempo dela é decisão do GP.",
          ...(codigo === "B16" ? ["O diagrama de rede vai em imagem (SVG) no pacote do plano."] : []),
        ],
        tabela: {
          colunas: ["Atividade", "Duração", "Aprovação", "Início", "Fim", "Folga", "Caminho crítico"],
          larguras: [4, 1, 1, 1, 1, 1, 1],
          linhas: crono.atividades.map((a) => [
            `${a.id} ${a.nome}`,
            String(a.duracao),
            a.aprovacao ? String(a.aprovacao) : "—",
            a.dataInicio ? textoDaData(a.dataInicio) : `dia ${a.inicioMaisCedo + 1}`,
            a.dataFim ? textoDaData(a.dataFim) : `dia ${a.fimMaisCedo}`,
            String(a.folga),
            a.critica ? "sim" : "",
          ]),
        },
      });
    if (codigo === "B11")
      out.push({
        paragrafos: [
          conta,
          "Cada marco tem duração 0 dias: é o evento da entrega ou da aprovação. Os marcos seguem o prazo contratual conforme o termo de referência e o TAP. A aprovação é dependência externa, a cargo do contratante.",
        ],
        tabela: {
          colunas: ["Produto", "Entrega", "Aprovação", "Marco do TAP", "Situação", "Conferência"],
          larguras: [1, 2, 2, 2, 1, 3],
          linhas: marcosDoPgp(p, e, crono).map((m) => [
            m.produto,
            m.dataEntrega ? textoDaData(m.dataEntrega) : `dia útil ${m.entrega}`,
            m.dataAprovacao ? textoDaData(m.dataAprovacao) : `dia útil ${m.aprovacao}`,
            m.prazoTap ?? "—",
            m.situacao === "cabe" ? "cabe" : m.situacao === "nao-cabe" ? "não cabe" : "não conferido",
            m.texto,
          ]),
        },
      });
    if (codigo === "A14" || codigo === "B29")
      out.push({
        paragrafos: [
          `${conta} Linha de base do cronograma: ${crono.total} dias úteis${crono.dataFim ? `, de ${p.parametros.inicio ? textoDaData(new Date(`${p.parametros.inicio}T00:00:00`)) : "—"} a ${textoDaData(crono.dataFim)}` : " (data de início a definir pelo GP)"}; caminho crítico: ${crono.caminhoCritico.join(" → ")}; desvio-padrão do caminho crítico: ${crono.desvioTotal.toFixed(1)} dias.`,
          `Tempo de aprovação de cada produto: ${p.parametros.aprovacaoDias === undefined ? A_DEFINIR : `${p.parametros.aprovacaoDias} dias úteis (decisão do GP)`}. ${crono.conferenciaPrazo.texto}`,
          "Data de referência: as datas contam a partir da data de assinatura do contrato; o prazo contratual é o da RFP e o do TAP.",
        ],
      });
    if (codigo === "B18")
      out.push({
        paragrafos: ["Nomes: decisão do GP. Papéis RACI por atividade (sugestão do PMO, revisada pelo GP)."],
        tabela: {
          colunas: ["Perfil", "Exigido pela RFP", "Nome (decisão do GP)", "Responsável (R)", "Aprova (A)"],
          larguras: [3, 1, 2, 3, 2],
          linhas: cr.perfis.map((x) => [
            x.nome,
            x.exigido ? `sim${x.requisito ? ` (${x.requisito})` : ""}` : "sugerido",
            p.parametros.nomes[x.id]?.trim() || A_DEFINIR,
            cr.raci
              .filter((r) => r.perfil === x.id && r.papel === "R")
              .map((r) => r.atividade)
              .join(", ") || "—",
            cr.raci
              .filter((r) => r.perfil === x.id && r.papel === "A")
              .map((r) => r.atividade)
              .join(", ") || "—",
          ]),
        },
      });
  }
  if (cr && (codigo === "B6" || codigo === "A15")) {
    const custos = custosDoPgp(p, e)!;
    if (codigo === "B6")
      out.push({
        paragrafos: [
          `${conta} Horas esperadas (PERT) × valor-hora do GP.`,
          "Despesas (viagens, passagens, diárias): decisão do GP, fora desta conta de horas.",
        ],
        tabela: {
          colunas: ["Perfil", "Horas", "Valor-hora (GP)", "Custo"],
          larguras: [4, 1, 2, 2],
          linhas: custos.preco.linhas.map((l) => [
            l.perfil.nome,
            String(l.horas),
            reais(l.valorHora),
            reais(l.custo),
          ]),
        },
      });
    else
      out.push({
        paragrafos: [
          conta,
          "Custos diretos: horas da equipe. Custos indiretos e tributos ficam no preço da proposta, fora desta conta.",
          "Cronograma de desembolso: a definir pelo GP com as parcelas do contrato.",
          custos.conferencia,
          ...(custos.faltando.length ? [`Falta: ${custos.faltando.join("; ")}.`] : []),
        ],
        tabela: {
          colunas: ["Conta", "Valor"],
          larguras: [4, 2],
          linhas: [
            ["Pessoal (estimativas de custos)", reais(custos.preco.pessoal)],
            [
              "Reserva de contingência (decisão do GP, dentro da linha de base)",
              reais(p.parametros.contingencia),
            ],
            ["Linha de base dos custos", reais(custos.linhaDeBase)],
            ["Reserva gerencial (decisão do GP, fora da linha de base)", reais(p.parametros.gerencial)],
            ["Orçamento do projeto", reais(custos.orcamento)],
          ],
        },
      });
  }
  if (codigo === "B27" && p.riscos)
    out.push({
      tabela: {
        colunas: [
          "Risco",
          "Categoria",
          "Prob.",
          "Impacto",
          "Resposta",
          "Gatilho",
          "Responsável",
          "Premissa crítica",
        ],
        larguras: [4, 1, 1, 1, 3, 2, 1, 1],
        linhas: p.riscos.resposta.riscos
          .filter((_, k) => c.itens.some((i) => i.id === `riscos:B27:${k}`))
          .map((r) => [
            `${r.id} ${r.item.texto}`,
            r.categoria,
            NOME_PROB[r.probabilidade],
            NOME_IMPACTO[r.impacto],
            `${r.estrategia}: ${r.resposta}`,
            r.gatilho || A_DEFINIR,
            r.responsavel || A_DEFINIR,
            r.premissaCritica || "—",
          ]),
      },
    });
  if (codigo === "B3" && (e.premissasTap.length || p.riscos))
    out.push({
      paragrafos: [
        "Parte do registro inicial da etapa 3 e acrescenta as premissas novas das estimativas e dos riscos.",
      ],
      tabela: {
        colunas: ["Premissa ou restrição", "Origem", "Premissa crítica", "Se não se confirmar", "Depende de"],
        larguras: [4, 1, 1, 3, 2],
        linhas: [
          ...e.premissasTap.map((x) => [
            x.item.texto,
            `registro inicial (${x.origem})`,
            x.premissaCritica || "—",
            x.consequencia || "—",
            x.dependeDe || A_DEFINIR,
          ]),
          ...(p.riscos?.resposta.premissas ?? [])
            .filter((_, k) => c.itens.some((i) => i.id === `riscos:B3:${k}`))
            .map((x) => [
              x.item.texto,
              `novo (${x.origem})`,
              x.premissaCritica || "—",
              x.consequencia || "—",
              x.dependeDe || A_DEFINIR,
            ]),
        ],
      },
    });
  if (codigo === "A16" && p.execucao?.resposta.indicadores.length)
    out.push({
      tabela: {
        colunas: ["Indicador", "Fórmula", "Meta", "Frequência", "Fonte"],
        larguras: [2, 3, 2, 1, 2],
        linhas: p.execucao.resposta.indicadores.map((x) => [
          x.nome,
          x.formula,
          x.meta || A_DEFINIR,
          x.frequencia,
          x.fonte,
        ]),
      },
    });
  return out;
}

/** As seções das partes que o GP marcou, em ordem, com o texto do PMO e as tabelas do código. */
function secoesDasPartes(c: Contexto): Secao[] {
  const partes = partesAGerar(c.p).sort((a, b) => ordemDaParte(a) - ordemDaParte(b));
  const secoes: Secao[] = [];
  partes.forEach((codigo, k) => {
    const titulo = `${k + 1}. ${nomeDaParte(codigo)}`;
    const doPmo = c.itens.filter(
      (i) =>
        i.grupo.startsWith(`${codigo} —`) && !i.id.startsWith("riscos:B27") && !i.id.startsWith("riscos:B3:"),
    );
    const codigoTabelas = tabelasDoCodigo(codigo, c);
    const paragrafos = [`Parte ${codigo} do plano.`, ...doPmo.map((i) => paragrafoDoItem(i, c.p.revisoes))];
    if (codigo === "B27" || codigo === "B3")
      paragrafos.push(
        ...c.itens
          .filter((i) => i.id.startsWith(codigo === "B27" ? "riscos:B27:" : "riscos:B3:"))
          .map((i) => paragrafoDoItem(i, c.p.revisoes)),
      );
    if (doPmo.length === 0 && codigoTabelas.length === 0 && !(codigo === "B27" || codigo === "B3")) {
      const passo = passoDaParte(codigo);
      paragrafos.push(
        `A gerar: o passo "${passo ? NOME_PASSO_PGP[passo.passo] : "—"}" ainda não foi pedido ao PMO.`,
      );
    }
    if (!codigoTabelas.length) secoes.push({ titulo, paragrafos });
    else
      codigoTabelas.forEach((t, j) =>
        secoes.push({
          titulo: j === 0 ? titulo : `${titulo} (continuação)`,
          paragrafos: j === 0 ? [...paragrafos, ...(t.paragrafos ?? [])] : t.paragrafos,
          tabela: t.tabela,
        }),
      );
  });
  return secoes;
}

export function montarPgp(dossie: Dossie, agora = new Date()): DocumentoExportavel {
  const c = preparar(dossie, agora);
  const sugestoes = c.p.adaptacao?.resposta.partes ?? [];
  const dispensadas = sugestoes.filter((s) => c.p.gerar[s.codigo] === false);
  const obs = c.itens.filter((i) => i.grupo === "Observações do PMO");
  const secoes: Secao[] = [
    {
      titulo: "Situação da minuta",
      paragrafos: [
        `TAP usado: ${c.e.fonteTap === "pdf" ? `PDF (${c.e.tap?.nomeArquivo})` : c.e.fonteTap === "dossie" ? "TAP da etapa 3 (dossiê)" : "nenhum"}. Proposta: ${c.e.fonteProposta === "nenhuma" ? "nenhuma" : c.e.fonteProposta === "pdf" ? "PDF" : "da etapa 2 (dossiê)"}.`,
        `${partesAGerar(c.p).length} partes marcadas para gerar pelo GP; ${dispensadas.length} dispensadas. ${c.pendentes} pendências de revisão do GP.`,
        "Os itens [Sugestão] são propostas do PMO em redação condicional; os [Decisão do GP] só o GP preenche. As tabelas de cronograma, marcos, custos, designações e rastreabilidade são contas do código.",
      ],
    },
    ...secoesDasPartes(c),
  ];
  if (dispensadas.length)
    secoes.push({
      titulo: "Partes dispensadas pelo GP",
      paragrafos: ["Não contam como ausentes na conferência do plano (etapa 5)."],
      tabela: {
        colunas: ["Parte", "Justificativa (sugestão do PMO)"],
        larguras: [2, 5],
        linhas: dispensadas.map((d) => [`${d.codigo} ${nomeDaParte(d.codigo)}`, d.justificativa]),
      },
    });
  if (obs.length)
    secoes.push({
      titulo: "Observações do PMO",
      paragrafos: obs.map((i) => paragrafoDoItem(i, c.p.revisoes)),
    });
  return {
    titulo: "Plano de gerenciamento do projeto",
    subtitulo:
      "Minuta preparada a partir da RFP, do TAP e da proposta, adaptada ao porte do projeto (PMBOK 6, processo 4.2; PMBOK 7, adaptação).",
    ...camposDoDossie(dossie),
    minuta: c.pendentes > 0 || !c.p.adaptacao,
    geradoEm: agora,
    secoes,
  };
}

/** Registros, cronograma e matrizes (XLSX): uma aba por tabela. */
export function montarRegistrosPgp(dossie: Dossie, agora = new Date()): DocumentoExportavel {
  const c = preparar(dossie, agora);
  const ordem = ["B11", "B15", "B8", "B2", "B18", "B6", "A15", "B27", "B3", "B23", "A13", "A17", "A16"];
  const secoes: Secao[] = [];
  const sugestoes = c.p.adaptacao?.resposta.partes ?? [];
  if (sugestoes.length)
    secoes.push({
      titulo: "Adaptação",
      tabela: {
        colunas: ["Parte", "Sugestão do PMO", "Justificativa", "Gerar (decisão do GP)"],
        larguras: [3, 1, 5, 1],
        linhas: sugestoes.map((s) => [
          `${s.codigo} ${nomeDaParte(s.codigo)}`,
          s.recomendacao === "dispensavel" ? "dispensável" : s.recomendacao,
          s.justificativa,
          c.p.gerar[s.codigo] ? "sim" : "não",
        ]),
      },
    });
  for (const codigo of ordem)
    for (const t of tabelasDoCodigo(codigo, c))
      if (t.tabela) secoes.push({ titulo: `${codigo} ${nomeDaParte(codigo)}`, tabela: t.tabela });
  return {
    titulo: "Registros, cronograma e matrizes do plano",
    subtitulo: "Tabelas do plano de gerenciamento do projeto.",
    ...camposDoDossie(dossie),
    minuta: c.pendentes > 0 || !c.p.adaptacao,
    geradoEm: agora,
    secoes,
  };
}

/** Índice das partes do pacote (.zip): o que foi gerado, onde está e o que foi dispensado. */
export function indiceDoPacote(dossie: Dossie): string {
  const p = dossie.pgp ?? pgpInicial();
  const linhas = [
    "Plano de gerenciamento do projeto — índice do pacote",
    "",
    "plano.docx / plano.pdf: o plano, com as partes marcadas pelo GP",
    "registros.xlsx: adaptação, marcos, cronograma, durações, atividades, designações, custos, riscos, premissas, rastreabilidade, EAP, fases e indicadores",
    "eap.svg: estrutura analítica do projeto (imagem)",
    "rede.svg: diagrama de rede, com o caminho crítico (imagem)",
    "",
    "Partes:",
    ...(p.adaptacao?.resposta.partes ?? []).map(
      (s) => `${s.codigo} ${nomeDaParte(s.codigo)}: ${p.gerar[s.codigo] ? "gerada" : "dispensada pelo GP"}`,
    ),
  ];
  return linhas.join("\n");
}
