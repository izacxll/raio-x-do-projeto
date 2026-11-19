// A capa de decisão de cada etapa (decisão 0085), montada só por código a partir do dossiê. A da etapa 1 está em
// relatorio-rfp.ts (ela usa a leitura que o relatório já monta); aqui ficam as das etapas 2 a 5 e a escolha pela etapa.
// A capa não entra nas peças que vão ao cliente ou são assinadas (a proposta, o TAP e o PGP): ela vai no resultado da
// etapa, na tela e nos documentos que são só do GP (a análise da RFP e o relatório de conformidade).
import type { Dossie } from "../dossie/esquema";
import { analisarRfp } from "../etapas/1-rfp/analisar-rfp";
import { leituraDoDossie } from "../etapas/1-rfp/leitura-pmo";
import { numerarCompromissos } from "../etapas/2-proposta/compromissos";
import { montarMinuta } from "../etapas/2-proposta/minuta";
import { montarPontoDePartida } from "../etapas/2-proposta/ponto-de-partida";
import { calcularPreco, conferirValor, horasEsperadas, lerValorEmReais } from "../etapas/2-proposta/preco";
import { conferirTap } from "../etapas/3-tap/conferencia-tap";
import { compararRfpEProposta, pedeDecisao } from "../etapas/3-tap/divergencias";
import { dadosDaProposta, montarEntradaTap } from "../etapas/3-tap/entrada";
import { itensDaEtapa3, tapInicial } from "../etapas/3-tap/tap";
import { itensDaProposta } from "../etapas/2-proposta/proposta";
import { itensDoPgp, partesAGerar } from "../etapas/4-pgp/pgp";
import { numerosDaFila, revisavelDoConferido } from "../pmo/fila";
import { autoconferir, separarDecisoesPendentes } from "../etapas/4-pgp/autoconferencia";
import { cronogramaDoPgp, custosDoPgp, marcosDoPgp } from "../etapas/4-pgp/calculos";
import { montarEntradaPgp } from "../etapas/4-pgp/entrada";
import { reguaQueMudouEmTexto, reguasQueMudaram } from "../etapas/4-pgp/reguas";
import { resultadoDaEtapa5 } from "../etapas/5-conferencia/resultado";
import type { ResultadoVereditos } from "../etapas/5-conferencia/candidatos";
import type { AchadoPmoConferido } from "../etapas/5-conferencia/leitura-pmo";
import { itensValidos, rotuloDoItem, textoFinal } from "../pmo/itens";
import { ordenarAchados } from "../regras/conferencia";
import {
  comPrefixo,
  curto,
  duracaoCurta,
  limitar,
  NAO_LOCALIZADO,
  type CapaDeDecisao,
} from "./capa-de-decisao";
import { quadroDasPremissasCriticas, quadroDaEquipe, quadroDoCronograma, quadroDosProdutos } from "./quadros";
import { eventoEEfeito, reguaDosMarcos } from "./capa-regras";
export { eventoEEfeito } from "./capa-regras";
import type { Alerta, Destaque, NumeroChave } from "./modelo";
import { capaDaRfp } from "./relatorio-rfp";
import { contar, plural } from "../texto/plural";

const A_DEFINIR = "a definir pelo GP";
const reais = (v?: number) =>
  v === undefined ? A_DEFINIR : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBr = (d?: Date) => (d ? d.toLocaleDateString("pt-BR") : "—");

/** O bloco da duração (dias úteis pela conta da ferramenta), com a data de término quando há início. */
function destaqueDaDuracao(c?: { total: number; dataFim?: Date }, substitui?: string): Destaque {
  if (!c || !(c.total > 0))
    return { valor: "—", rotulo: "Duração", explicacao: "cronograma ainda não calculado" };
  return {
    valor: String(Math.round(c.total)),
    rotulo: "Dias úteis",
    explicacao: c.dataFim ? `de duração, até ${dataBr(c.dataFim)}` : "de duração (sem data de início)",
    ...(substitui ? { substitui } : {}),
  };
}

/** O bloco da vigência do TAP: a do contrato, quando houver; senão, o prazo da RFP. */
function destaqueDaVigencia(doContrato?: string, daRfp?: string): Destaque {
  const contrato = duracaoCurta(doContrato);
  if (contrato) return { valor: contrato, rotulo: "Vigência", explicacao: "do contrato assinado" };
  const rfp = duracaoCurta(daRfp);
  if (rfp) return { valor: rfp, rotulo: "Prazo", explicacao: "da RFP; sem o contrato assinado" };
  return { valor: "—", rotulo: "Prazo", explicacao: "não localizado: conferir no documento" };
}

/** O bloco dos recursos financeiros (TAP.7, decisão do GP): o valor em reais que o GP escreveu, se houver. */
function destaqueDosRecursos(recursos?: string): Destaque {
  const texto = recursos?.trim();
  if (!texto)
    return {
      valor: "A definir",
      rotulo: "Valor",
      explicacao: "recursos financeiros, decisão do GP",
      substitui: "Recursos financeiros",
    };
  const emReais = /R\$\s*[\d.]+(?:,\d{2})?/.exec(texto)?.[0];
  // sem o valor em reais, o bloco diz só "Definidos" e o texto do GP fica na tabela
  return emReais
    ? {
        valor: emReais,
        rotulo: "Valor",
        explicacao: "recursos financeiros, decididos pelo GP",
        substitui: "Recursos financeiros",
      }
    : {
        valor: "Definidos",
        rotulo: "Valor",
        explicacao: "recursos financeiros: o texto do GP está na tabela",
      };
}

/** A capa da etapa, ou undefined quando a etapa ainda não tem o que mostrar (sem a leitura do PMO, decisão 0037). */
export function capaDaEtapa(dossie: Dossie, etapa: number, agora = new Date()): CapaDeDecisao | undefined {
  if (etapa === 1) {
    if (!dossie.analiseRfp?.leituraPmo) return undefined;
    const docs = dossie.documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
    const analise = analisarRfp(docs, agora);
    return capaDaRfp(
      dossie,
      analise,
      leituraDoDossie(analise, dossie.analiseRfp, dossie.documentos, agora),
      agora,
    );
  }
  if (etapa === 2) return capaDaProposta(dossie, agora);
  if (etapa === 3) return capaDoTap(dossie, agora);
  if (etapa === 4) return capaDoPgp(dossie, agora);
  if (etapa === 5) return capaDaConferencia(dossie);
  return undefined;
}

// ---------- etapa 2 ----------

/** Etapa 2: produtos × equipe × horas, compromissos de método, preço e cronograma contra o documento. */
export function capaDaProposta(dossie: Dossie, agora = new Date()): CapaDeDecisao | undefined {
  const p = dossie.proposta;
  const conteudo = p?.conteudo?.resposta;
  if (!p || !conteudo) return undefined;
  const docs = dossie.documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
  const ponto = montarPontoDePartida(docs, dossie.analiseRfp, agora);
  const minuta = montarMinuta(ponto, p, docs, dossie.analiseRfp, agora);
  const dados = dadosDaProposta(dossie, docs, ponto, agora);
  const eap = p.eap?.resposta;
  const preco = eap ? calcularPreco(eap.perfis, eap.horas, p.parametros) : undefined;
  const estimado = ponto.valorEstimado ? lerValorEmReais(ponto.valorEstimado.texto) : undefined;
  // como na tela: o preço final do GP, se houver; senão, o calculado
  const precoQueVale = p.parametros.precoFinal ?? preco?.precoCalculado;
  const valor = conferirValor(precoQueVale, estimado);
  const compromissos = numerarCompromissos(conteudo);
  const metodo = compromissos.filter((c) => c.tipo === "metodo");
  const abordagem = p.estrategia?.resposta.abordagens.find((a) => a.id === p.abordagem?.id);
  const prazo = dados?.cronograma?.conferenciaPrazo;
  const marcosForaDoPrazo = (dados?.marcos ?? []).filter((m) => m.situacao === "nao-cabe");
  const caixa = minuta.contas.caixa;
  const soDescritas = minuta.documento.filter((s) => s.situacao === "so-descrita");

  const alertas: Alerta[] = [
    ...(prazo?.situacao === "nao-cabe"
      ? [{ nivel: "alto" as const, texto: comPrefixo("Cronograma", limitar(prazo.texto, 240)) }]
      : []),
    ...marcosForaDoPrazo.map((m) => ({
      nivel: "alto" as const,
      texto: `${m.produto} — ${m.nome}: ${curto(m.textoConferencia, 180)}`,
    })),
    ...(minuta.contas.duracao?.situacao === "passa"
      ? [{ nivel: "alto" as const, texto: `Fases × vigência: ${curto(minuta.contas.duracao.texto, 180)}` }]
      : []),
    ...(caixa?.primeiroNegativo
      ? [{ nivel: "alto" as const, texto: `Caixa: ${curto(caixa.texto, 200)}` }]
      : []),
    ...(valor.situacao === "acima" || valor.situacao === "abaixo-75"
      ? [{ nivel: "alto" as const, texto: `Preço × valor estimado: ${curto(valor.texto, 180)}` }]
      : []),
    ...(preco?.faltando.length
      ? [
          {
            nivel: "medio" as const,
            texto: `O preço não fecha: falta ${preco.faltando.slice(0, 3).join("; ")}.`,
          },
        ]
      : []),
    ...(soDescritas.length
      ? [
          {
            nivel: "medio" as const,
            texto: `${contar(soDescritas.length, "seção", "seções")} da minuta ${plural(soDescritas.length, "só descrita", "só descritas")}, sem o texto redigido.`,
          },
        ]
      : []),
  ];

  const decidir = [
    ...(abordagem ? [] : ["Escolher a abordagem técnica entre as que a estratégia sugeriu."]),
    ...(preco?.faltando.length
      ? [
          `Valores do preço (valor-hora, despesas, percentuais): faltam ${preco.faltando.length} para a conta fechar.`,
        ]
      : []),
    ...(p.parametros.inicio
      ? []
      : ["Data de início e tempo de aprovação do cliente, para o cronograma da proposta."]),
    ...(marcosForaDoPrazo.length || prazo?.situacao === "nao-cabe"
      ? [
          "O que fazer com o marco que não cabe: pergunta de esclarecimento, ajuste da minuta ou premissa escrita.",
        ]
      : []),
    "Enviar ou não a proposta, depois de revisar os itens pendentes da minuta.",
  ];

  const rotuloDoPreco =
    p.parametros.precoFinal !== undefined ? "Preço final (decisão do GP)" : "Preço calculado";
  const numeros: NumeroChave[] = [
    ...numerosDaFila(
      2,
      itensDaProposta(p, docs).map(revisavelDoConferido),
      p.revisoes,
      p.abordagem ? [] : ["Escolher a abordagem técnica"],
    ),
    { rotulo: "Abordagem", valor: abordagem ? `${abordagem.id} — ${abordagem.nome}` : A_DEFINIR },
    { rotulo: "Produtos", valor: String(conteudo.produtos.length) },
    {
      rotulo: "Horas",
      valor: preco
        ? `${Math.round(preco.horasTotais).toLocaleString("pt-BR")} h esperadas${preco.linhas.some((l) => l.horasADefinir.length) ? " (+ horas a definir pelo GP)" : ""}`
        : NAO_LOCALIZADO,
    },
    { rotulo: "Perfis da equipe", valor: String(eap?.perfis.length ?? 0) },
    { rotulo: rotuloDoPreco, valor: reais(precoQueVale) },
    { rotulo: "Cronograma × prazo", valor: prazo ? limitar(prazo.texto, 160) : "não conferido" },
    {
      rotulo: "Compromissos (C)",
      valor: `${compromissos.length}, dos quais ${metodo.length} de método`,
    },
  ];

  const mudou = [
    `${contar(ponto.listaDeR.length, "requisito", "requisitos")} da etapa 1 na proposta${ponto.rDescartados.length ? `; ${plural(ponto.rDescartados.length, "descartado", "descartados")} pelo GP: ${ponto.rDescartados.join(", ")}` : ""}.`,
    ...(abordagem ? [`Abordagem escolhida pelo GP: ${abordagem.id} — ${abordagem.nome}.`] : []),
    `${contar(compromissos.length, "compromisso numerado", "compromissos numerados")} (premissas, exclusões, obrigações do contratante, método) ${plural(compromissos.length, "que precisa", "que precisam")} chegar ao TAP e ao plano.`,
  ];

  // produtos × equipe × horas: as horas esperadas (PERT, conta do código) de cada produto e quem trabalha nele
  const produtoDa = new Map((eap?.atividades ?? []).map((a) => [a.id, a.produto]));
  const nomeDoPerfil = new Map((eap?.perfis ?? []).map((x) => [x.id, x.nome]));
  const linhas = conteudo.produtos.map((prod) => {
    const horas = (eap?.horas ?? []).filter((h) => produtoDa.get(h.atividade) === prod.id);
    const total = horas.reduce((s, h) => s + horasEsperadas(h), 0);
    const aDefinir = horas.some((h) => !h.horas);
    const perfis = [...new Set(horas.map((h) => nomeDoPerfil.get(h.perfil) ?? h.perfil))];
    return [
      `${prod.id} — ${prod.nome}`,
      `${Math.round(total)}${aDefinir ? " (+ horas a definir pelo GP)" : ""}`,
      perfis.join(", ") || "—",
      prod.requisitos.join(", ") || "—",
    ];
  });
  return {
    etapa: 2,
    // os números principais (duração, entregas, valor ou horas); o resto fica na tabela (decisão 0089)
    destaques: [
      destaqueDaDuracao(dados?.cronograma),
      {
        valor: String(conteudo.produtos.length),
        rotulo: "Produtos",
        explicacao: "entregas da proposta",
        substitui: "Produtos",
      },
      precoQueVale !== undefined
        ? {
            valor: reais(precoQueVale),
            rotulo: "Preço",
            explicacao:
              p.parametros.precoFinal !== undefined ? "fixado pelo GP" : "calculado pela ferramenta",
            substitui: rotuloDoPreco,
          }
        : preco
          ? {
              valor: `${Math.round(preco.horasTotais).toLocaleString("pt-BR")} h`,
              rotulo: "Horas",
              explicacao: preco.linhas.some((l) => l.horasADefinir.length)
                ? "esperadas, + horas a definir pelo GP"
                : "esperadas, pela estimativa de três pontos",
              substitui: "Horas",
            }
          : { valor: "A definir", rotulo: "Preço", explicacao: "faltam valores do GP" },
    ],
    oQueE:
      "Etapa 2, proposta: a minuta técnica e de preço, com a abordagem, os produtos, a equipe, as horas e os compromissos que a FGV assume.",
    decidir,
    numeros,
    alertas,
    mudou,
    quadros: [
      ...[
        quadroDaEquipe(p),
        {
          titulo: "Produtos × equipe × horas",
          paragrafos: [
            "Horas esperadas por produto (três pontos, conta do código); quem trabalha em cada um.",
          ],
          tabela: {
            colunas: ["Produto", "Horas", "Perfis", "Requisitos"],
            larguras: [3, 1.2, 3, 1.2],
            linhas,
          },
        },
        quadroDosProdutos(p, dados?.marcos ?? []),
        quadroDoCronograma(dados?.cronograma),
      ].filter((x): x is NonNullable<typeof x> => x !== undefined),
      ...(metodo.length
        ? [
            {
              titulo: "Compromissos de método",
              paragrafos: [
                "O que a proposta promete sobre como o trabalho é feito: cada um precisa chegar ao TAP e ao plano.",
              ],
              tabela: {
                colunas: ["C", "Compromisso", "Premissa"],
                larguras: [0.6, 6, 1],
                linhas: metodo.map((c) => [c.numero, curto(c.texto, 220), c.premissaCritica ?? "—"]),
              },
            },
          ]
        : []),
    ],
  };
}

// ---------- etapa 3 ----------

/** Etapa 3: o TAP em uma página e as divergências a decidir. */
export function capaDoTap(dossie: Dossie, agora = new Date()): CapaDeDecisao | undefined {
  const t = dossie.tap ?? tapInicial();
  const r = t.tap?.resposta;
  if (!r) return undefined;
  const entrada = montarEntradaTap(dossie, agora);
  const todos = itensDaEtapa3(t, entrada.documentos);
  const divergencias = compararRfpEProposta(entrada);
  const aDecidir = divergencias.filter((d) => pedeDecisao(d) && !t.divergencias[d.id]);
  const premissas = t.premissasAplicaveis ?? dossie.proposta?.premissasAplicaveis ?? {};
  const verificacoes = conferirTap(entrada, t, todos, premissas, divergencias);
  const atencao = verificacoes.filter((v) => v.situacao === "atencao");
  const pesa = (id: string) =>
    /^(marcos|marcos-pela-conta|valor|aceite|contrato|premissas-criticas)$/.test(id);
  const validos = itensValidos(t.revisoes, todos);
  const doCampo = (prefixo: string) =>
    validos
      .filter((i) => i.id.startsWith(`tap:${prefixo}:`))
      .map((i) => `${rotuloDoItem(i)} ${curto(textoFinal(i, t.revisoes), 200)}`);
  const registro = t.premissas?.resposta.premissas ?? [];

  const alertas: Alerta[] = atencao.map((v) => ({
    nivel: pesa(v.id) ? "alto" : "medio",
    texto: `${v.nome}: ${curto(v.texto, 200)}`,
  }));
  const decidir = [
    ...(aDecidir.length
      ? [
          `Qual versão vale em ${contar(aDecidir.length, "divergência", "divergências")} entre RFP, proposta e contrato (quadro "Divergências a decidir").`,
        ]
      : []),
    ...(t.decisoes.recursos?.trim() ? [] : ["Recursos financeiros do TAP (TAP.7)."]),
    ...(t.decisoes.gerente?.trim() && t.decisoes.patrocinador?.trim()
      ? []
      : ["Gerente do projeto, patrocinador e o nível de autoridade de cada um."]),
    ...(t.decisoes.aprovadoPor?.trim() ? [] : ["Aprovar o TAP (quem aprova e quando)."]),
  ];
  const numeros: NumeroChave[] = [
    ...numerosDaFila(3, todos.map(revisavelDoConferido), t.revisoes, [
      ...aDecidir.map((d) => `Versão que vale: ${d.tema}`),
      ...(t.decisoes.aprovadoPor?.trim() ? [] : ["Aprovar o TAP"]),
    ]),
    {
      rotulo: "Proposta usada",
      valor:
        entrada.fonte === "pdf"
          ? "PDF da versão final"
          : entrada.fonte === "dossie"
            ? "a da etapa 2"
            : "nenhuma",
    },
    {
      rotulo: "Contrato assinado",
      valor: entrada.contrato ? "sim (prevalece)" : "não informado — números a confirmar",
    },
    {
      rotulo: "Divergências",
      valor: `${divergencias.filter(pedeDecisao).length}, ${aDecidir.length} sem decisão do GP`,
    },
    { rotulo: "Marcos", valor: String(r.marcos.length) },
    {
      rotulo: "Premissas no registro",
      valor: `${registro.length}, ${contar(registro.filter((x) => x.premissaCritica).length, "crítica", "críticas")}`,
    },
    { rotulo: "Recursos financeiros", valor: t.decisoes.recursos?.trim() || A_DEFINIR },
  ];
  const mudou = [
    entrada.contrato
      ? "Entrou o contrato ou termo assinado: ele prevalece sobre a proposta e a RFP."
      : "Sem o contrato assinado: o TAP parte da proposta e da RFP.",
    `${contar(divergencias.filter(pedeDecisao).length, "diferença", "diferenças")} entre o que a RFP pediu, a proposta prometeu e o contrato assinou.`,
  ];
  const linha = (campo: string, textos: string[]) => [campo, textos.length ? textos.join("\n") : A_DEFINIR];
  return {
    etapa: 3,
    // os números principais (duração, entregas, valor); o resto fica na tabela (decisão 0089)
    destaques: [
      destaqueDaVigencia(entrada.lidoDoContrato?.vigencia?.texto, entrada.ponto.prazoExecucao?.texto),
      { valor: String(r.entregas.length), rotulo: "Entregas", explicacao: "entregas-chave no TAP" },
      destaqueDosRecursos(t.decisoes.recursos),
    ],
    oQueE:
      "Etapa 3, termo de abertura (TAP): o que foi assinado, em uma página, e as divergências que o GP decide antes de começar.",
    decidir,
    numeros,
    alertas,
    mudou,
    quadros: [
      {
        titulo: "TAP em uma página",
        tabela: {
          colunas: ["Campo", "Conteúdo"],
          larguras: [1.6, 6],
          linhas: [
            linha("Finalidade", doCampo("finalidade")),
            linha("Objetivos", doCampo("objetivos")),
            linha("Entregas-chave", doCampo("entregas")),
            [
              "Marcos",
              r.marcos.length
                ? r.marcos
                    .map((m) => `${m.produto ? `${m.produto}: ` : ""}${m.prazo || A_DEFINIR}`)
                    .join("\n")
                : A_DEFINIR,
            ],
            ["Recursos financeiros", t.decisoes.recursos?.trim() || A_DEFINIR],
            linha("Risco geral", doCampo("riscoGeral")),
            ["Patrocinador", t.decisoes.patrocinador?.trim() || A_DEFINIR],
            ["Gerente do projeto", t.decisoes.gerente?.trim() || A_DEFINIR],
          ],
        },
      },
      ...(aDecidir.length
        ? [
            {
              titulo: "Divergências a decidir",
              paragrafos: ["Até a resposta escrita, sugere-se seguir a versão que mais obriga a FGV."],
              tabela: {
                colunas: ["Tema", "RFP", "Proposta", "Contrato", "Sugestão"],
                larguras: [1.4, 2, 2, 2, 2],
                linhas: aDecidir.map((d) => [
                  d.tema,
                  curto(d.rfp.texto || "—", 140),
                  curto(d.proposta.texto || "—", 140),
                  curto(d.contrato?.texto || "—", 140),
                  [
                    d.versaoSugerida
                      ? `sugere-se a versão ${d.versaoSugerida === "rfp" ? "da RFP" : d.versaoSugerida === "proposta" ? "da proposta" : "do contrato"}`
                      : "",
                    d.oQueFazer ? curto(d.oQueFazer, 120) : "",
                  ]
                    .filter(Boolean)
                    .join("; ") || "—",
                ]),
              },
            },
          ]
        : []),
    ],
  };
}

// ---------- etapa 4 ----------

const PESO_PROB = { baixa: 1, media: 2, alta: 3 } as const;
const NOME_PROB = { baixa: "baixa", media: "média", alta: "alta" } as const;
const NOME_IMPACTO = { baixo: "baixo", medio: "médio", alto: "alto" } as const;
const PESO_IMPACTO = { baixo: 1, medio: 2, alto: 3 } as const;

/** Etapa 4: linha do tempo dos marcos, os 5 riscos principais, RACI resumida e as decisões do GP. */
export function capaDoPgp(dossie: Dossie, agora = new Date()): CapaDeDecisao | undefined {
  const p = dossie.pgp;
  if (!p?.adaptacao) return undefined;
  const e = montarEntradaPgp(dossie, agora);
  const crono = cronogramaDoPgp(p, e);
  const marcos = (crono ? marcosDoPgp(p, e, crono) : []).sort((a, b) => a.entrega - b.entrega);
  const custos = custosDoPgp(p, e);
  const mantidas = partesAGerar(p);
  const dispensadas = (p.adaptacao.resposta.partes ?? []).filter((x) => p.gerar[x.codigo] === false);
  const riscos = [...(p.riscos?.resposta.riscos ?? [])].sort(
    (a, b) =>
      PESO_PROB[b.probabilidade] * PESO_IMPACTO[b.impacto] -
      PESO_PROB[a.probabilidade] * PESO_IMPACTO[a.impacto],
  );
  const auto = autoconferir(dossie, e, agora);
  const { decisoes } = separarDecisoesPendentes(auto.achados);
  const reguas = reguasQueMudaram(p);
  const foraDoPrazo = marcos.filter((m) => m.situacao === "nao-cabe");
  const semPrazo = marcos.filter((m) => m.situacao === "nao-conferido" || m.situacao === "nao-confirmavel");
  // a régua dos marcos pelos prazos do TAP que o código tem (decisão 0087): sem eles, "não localizados", não "sem régua"
  const regua = reguaDosMarcos(e.marcosTap.map((m) => m.prazo));

  const alertas: Alerta[] = [
    ...(crono?.conferenciaPrazo.situacao === "nao-cabe"
      ? [
          {
            nivel: "alto" as const,
            texto: comPrefixo("Cronograma", limitar(crono.conferenciaPrazo.texto, 240)),
          },
        ]
      : []),
    ...foraDoPrazo.map((m) => ({ nivel: "alto" as const, texto: `${m.produto}: ${curto(m.texto, 180)}` })),
    ...(crono?.datasFixas ?? [])
      .filter((f) => !f.cabe)
      .map((f) => ({
        nivel: "alto" as const,
        texto: `Data fixa da atividade ${f.atividade}: não cabe depois das predecessoras.`,
      })),
    ...reguas.map((x) => ({ nivel: "medio" as const, texto: curto(reguaQueMudouEmTexto(x), 200) })),
    ...riscos
      .filter((x) => x.probabilidade === "alta" && x.impacto === "alto")
      .map((x) => ({ nivel: "alto" as const, texto: `Risco ${x.id}: ${eventoEEfeito(x.item.texto)}` })),
    ...(custos?.faltando.length
      ? [{ nivel: "medio" as const, texto: `Orçamento: falta ${custos.faltando.slice(0, 3).join("; ")}.` }]
      : []),
  ];
  const decidir = [
    ...(decisoes.length
      ? [
          `${contar(decisoes.length, "campo", "campos")} "a definir pelo GP" no plano (nomes, valores, cadência).`,
        ]
      : []),
    ...(custos?.faltando.length ? [`Orçamento: ${custos.faltando.slice(0, 3).join("; ")}.`] : []),
    ...(custos?.riscosComReserva.length
      ? [
          `Valor da reserva de contingência dos riscos ${custos.riscosComReserva.map((x) => x.id).join(", ")}.`,
        ]
      : []),
    ...(foraDoPrazo.length ? ["O que fazer com os marcos que não cabem no prazo do TAP."] : []),
    "Aprovar o plano depois de revisar os itens pendentes.",
  ];
  const numeros: NumeroChave[] = [
    ...numerosDaFila(4, itensDoPgp(p, e.documentos, e.premissasTap).map(revisavelDoConferido), p.revisoes),
    {
      rotulo: "Partes do plano",
      valor: `${mantidas.length} mantidas, ${dispensadas.length} dispensadas pela adaptação`,
    },
    {
      rotulo: "Duração",
      valor: crono
        ? `${Math.round(crono.total)} dias úteis${crono.dataFim ? `, até ${dataBr(crono.dataFim)}` : ""}`
        : "não conferida",
    },
    {
      rotulo: "Marcos",
      valor:
        regua === "sem-regua"
          ? `${marcos.length}, sem régua: o TAP não dá prazo em dias para nenhum`
          : regua === "nao-localizados"
            ? `${marcos.length}; marcos do TAP ${NAO_LOCALIZADO}`
            : `${marcos.length}, ${foraDoPrazo.length} fora do prazo do TAP`,
    },
    {
      rotulo: "Riscos",
      valor: `${riscos.length}, ${riscos.filter((x) => x.impacto === "alto").length} de impacto alto, ${riscos.filter((x) => x.pedeReserva).length} com reserva`,
    },
    { rotulo: "Orçamento (linha de base)", valor: reais(custos?.linhaDeBase) },
  ];
  const mudou = [
    regua === "sem-regua"
      ? `Marcos do TAP no cronograma do plano: sem régua (o TAP não dá prazo em dias); as datas são só as da conta do código.`
      : regua === "nao-localizados"
        ? `Marcos do TAP: ${NAO_LOCALIZADO} (TAP em PDF, sem TAP ou marcos descartados); as datas são só as da conta do código.`
        : `Marcos do TAP no cronograma do plano: ${marcos.filter((m) => m.situacao === "cabe").length} cabem, ${foraDoPrazo.length} não cabem e ${semPrazo.length} sem prazo em dias no TAP (a conferir).`,
    `${contar(riscos.length, "risco", "riscos")} no registro, a partir das premissas e do risco geral do TAP.`,
    ...(reguas.length
      ? [
          `${contar(reguas.length, "régua corrigida", "réguas corrigidas")} num passo e ${plural(reguas.length, "não levada", "não levadas")} às partes anteriores.`,
        ]
      : []),
  ];
  // RACI resumida: por perfil, em quantas atividades responde (R) e aprova (A)
  const raci = p.cronograma?.resposta.raci ?? [];
  const perfis = [...new Set(raci.map((l) => l.perfil))];
  const nomeDoPerfil = new Map((p.cronograma?.resposta.perfis ?? []).map((x) => [x.id, x.nome]));
  return {
    etapa: 4,
    // os números principais (duração, entregas, valor ou horas); o resto fica na tabela (decisão 0089)
    destaques: [
      destaqueDaDuracao(crono, "Duração"),
      {
        valor: String(marcos.length),
        rotulo: "Marcos",
        explicacao:
          regua === "sem-regua"
            ? "sem régua: o TAP não dá prazo em dias"
            : regua === "nao-localizados"
              ? "marcos do TAP não localizados pela ferramenta"
              : `${foraDoPrazo.length} fora do prazo do TAP`,
        substitui: "Marcos",
      },
      custos?.linhaDeBase !== undefined
        ? {
            valor: reais(custos.linhaDeBase),
            rotulo: "Orçamento",
            explicacao: "linha de base, pela conta da ferramenta",
            substitui: "Orçamento (linha de base)",
          }
        : custos?.preco && custos.preco.horasTotais > 0
          ? {
              valor: `${Math.round(custos.preco.horasTotais).toLocaleString("pt-BR")} h`,
              rotulo: "Horas",
              explicacao: custos.preco.linhas.some((l) => l.horasADefinir.length)
                ? "esperadas, + horas a definir pelo GP; orçamento a definir"
                : "esperadas; orçamento a definir pelo GP",
            }
          : {
              valor: "A definir",
              rotulo: "Orçamento",
              explicacao: "faltam valores do GP",
              substitui: "Orçamento (linha de base)",
            },
    ],
    oQueE:
      "Etapa 4, plano de gerenciamento do projeto: como executar, acompanhar e encerrar o que foi assinado, adaptado ao porte e ao tipo do projeto.",
    decidir,
    numeros,
    alertas,
    mudou,
    quadros: [
      ...[
        quadroDoCronograma(crono, "Cronograma do plano"),
        quadroDasPremissasCriticas(p, dossie.tap?.premissas?.resposta.premissas ?? []),
      ].filter((x): x is NonNullable<typeof x> => x !== undefined),
      {
        titulo: "Linha do tempo dos marcos",
        paragrafos: ["Datas pela conta do código (entrega e aprovação do cliente, com o tempo do GP)."],
        tabela: {
          colunas: ["Produto", "Entrega", "Aprovação", "Prazo no TAP", "Situação"],
          larguras: [1.2, 1.2, 1.2, 2, 3],
          linhas: marcos.map((m) => [
            m.produto,
            m.dataEntrega ? dataBr(m.dataEntrega) : `dia útil ${m.entrega}`,
            m.dataAprovacao ? dataBr(m.dataAprovacao) : `dia útil ${m.aprovacao}`,
            m.prazoTap ?? "—",
            curto(m.texto, 120),
          ]),
        },
      },
      {
        titulo: "Os 5 riscos principais",
        paragrafos: [
          "Sugestões do PMO, ordenadas pelo código por probabilidade × impacto (qualitativos, do registro). O valor da reserva é do GP.",
        ],
        tabela: {
          colunas: ["Risco", "P × I", "Resposta", "Gatilho", "Responsável", "Reserva"],
          larguras: [3, 0.9, 3, 2, 1.3, 0.9],
          linhas: riscos
            .slice(0, 5)
            .map((x) => [
              `${x.id} — ${eventoEEfeito(x.item.texto, 160)}`,
              `${NOME_PROB[x.probabilidade]} × ${NOME_IMPACTO[x.impacto]}`,
              curto(`${x.estrategia}: ${x.resposta}`, 160),
              curto(x.gatilho || "—", 120),
              curto(x.responsavel || "—", 60),
              x.pedeReserva ? "sim (valor do GP)" : "não",
            ]),
        },
      },
      ...(perfis.length
        ? [
            {
              titulo: "RACI resumida",
              tabela: {
                colunas: ["Perfil", "Responde (R)", "Aprova (A)", "Consultado (C)", "Informado (I)"],
                larguras: [3, 1, 1, 1, 1],
                linhas: perfis.map((perfil) => {
                  const conta = (papel: string) =>
                    String(raci.filter((l) => l.perfil === perfil && l.papel === papel).length);
                  return [nomeDoPerfil.get(perfil) ?? perfil, conta("R"), conta("A"), conta("C"), conta("I")];
                }),
              },
            },
          ]
        : []),
    ],
  };
}

// ---------- etapa 5 ----------

export type VereditoDoPlano = "apto" | "apto com ressalvas" | "não apto";

/**
 * O veredito do plano, por regra fixa do código (sugestão; quem decide é o GP): não apto com algum achado grave que se
 * sustenta; apto com ressalvas com achado médio; apto sem achado grave nem médio.
 */
export function vereditoDoPlano(gravidades: string[]): VereditoDoPlano {
  if (gravidades.includes("grave")) return "não apto";
  if (gravidades.includes("média")) return "apto com ressalvas";
  return "apto";
}

/** Etapa 5: veredito do plano, semáforo por parte, achados que se sustentam e o que corrigir antes de assinar. */
export function capaDaConferencia(dossie: Dossie): CapaDeDecisao | undefined {
  const r = resultadoDaEtapa5(dossie);
  return r ? capaDosVereditos(dossie, r.vereditos, r.leitura, r.documentos.pgp.nomeArquivo) : undefined;
}

/** Um achado que conta na capa: do código (confirmado pelo PMO) ou da leitura do PMO (válido). */
interface AchadoDaCapa {
  id: string;
  parte: string;
  partes: string[];
  gravidade: string;
  titulo: string;
  sugestao: string;
  daLeitura: boolean;
}

/**
 * A capa da etapa 5 com os vereditos e a leitura já calculados (o relatório de conformidade a monta assim). Contam os
 * achados do código que o PMO sustentou e os da leitura do PMO que o código validou, menos os que o GP disse que não
 * procedem.
 */
export function capaDosVereditos(
  dossie: Dossie,
  vereditos: ResultadoVereditos,
  leitura: AchadoPmoConferido[],
  nomeDoPlano: string,
): CapaDeDecisao | undefined {
  const conf = dossie.conferencia;
  if (!conf) return undefined;
  const decisao = (id: string) => conf.decisoes[id]?.procede;
  const doCodigo: AchadoDaCapa[] = ordenarAchados(vereditos.contam).map((a) => ({
    id: a.id,
    parte: a.parte,
    partes: a.partes ?? [],
    gravidade: conf.decisoes[a.id]?.gravidade ?? a.gravidade,
    titulo: a.titulo,
    sugestao: a.sugestao,
    daLeitura: false,
  }));
  const daLeitura: AchadoDaCapa[] = leitura
    .filter((a) => a.situacao === "valido" && !a.jaApontadoPeloCodigo)
    .map((a) => ({
      id: `pmo:${a.id}`,
      parte: a.parte,
      partes: [],
      gravidade: conf.decisoes[`pmo:${a.id}`]?.gravidade ?? a.gravidade,
      titulo: a.titulo,
      sugestao: a.sugestao,
      daLeitura: true,
    }));
  const todos = [...doCodigo, ...daLeitura];
  const sustentados = todos.filter((a) => decisao(a.id) !== "nao");
  const semDecisao = todos.filter((a) => !decisao(a.id));
  const veredito = vereditoDoPlano(sustentados.map((a) => a.gravidade));
  const derrubados = vereditos.candidatos.filter(
    (c) => c.situacao === "falso" || c.situacao === "nao-se-aplica",
  );
  const graves = sustentados.filter((a) => a.gravidade === "grave");
  const presentes = conf.mapa.filter((x) => x.situacao === "presente");
  const semaforo = presentes.map((parte) => {
    const daParte = sustentados.filter((a) => a.parte === parte.codigo || a.partes.includes(parte.codigo));
    const cor = daParte.some((a) => a.gravidade === "grave")
      ? "vermelho"
      : daParte.length
        ? "amarelo"
        : "verde";
    return { codigo: parte.codigo, cor, n: daParte.length };
  });
  const origem = (a: AchadoDaCapa) => (a.daLeitura ? " (leitura do PMO)" : "");
  const alertas: Alerta[] = [
    ...graves.map((a) => ({ nivel: "alto" as const, texto: `${a.parte} — ${a.titulo}${origem(a)}` })),
    ...sustentados
      .filter((a) => a.gravidade !== "grave")
      .map((a) => ({ nivel: "medio" as const, texto: `${a.parte} — ${a.titulo}${origem(a)}` })),
  ];
  const decidir = [
    `Assinar ou devolver o plano. Veredito sugerido pelo código: ${veredito} (regra fixa: grave que se sustenta = não apto; média = com ressalvas; só baixa ou nada = apto).`,
    ...(semDecisao.length
      ? [`Procede ou não: ${contar(semDecisao.length, "achado", "achados")} sem decisão do GP.`]
      : []),
    ...(graves.length
      ? [
          `O que corrigir antes de assinar: ${contar(graves.length, "achado grave", "achados graves")} (quadro "O que corrigir antes de assinar").`,
        ]
      : []),
  ];
  const conta = (g: string) => sustentados.filter((a) => a.gravidade === g).length;
  const verdes = semaforo.filter((s) => s.cor === "verde");
  const comAchado = semaforo
    .filter((s) => s.cor !== "verde")
    .sort((a, b) => (a.cor === b.cor ? 0 : a.cor === "vermelho" ? -1 : 1));
  const nomeCor = { verde: "em ordem", amarelo: "com ressalva", vermelho: "grave" } as const;
  const numeros: NumeroChave[] = [
    { rotulo: "Veredito sugerido", valor: veredito },
    {
      rotulo: "Achados que se sustentam",
      valor: `${sustentados.length} (grave ${conta("grave")}, média ${conta("média")}, baixa ${conta("baixa")}); ${sustentados.filter((a) => a.daLeitura).length} da leitura do PMO`,
    },
    { rotulo: "Candidatos do código derrubados pelo PMO", valor: String(derrubados.length) },
    {
      rotulo: "Partes do plano",
      valor: `${presentes.length} presentes: ${verdes.length} sem achado, ${semaforo.filter((s) => s.cor === "amarelo").length} com ressalva, ${semaforo.filter((s) => s.cor === "vermelho").length} com grave`,
    },
  ];
  return {
    etapa: 5,
    destaques: [
      {
        valor: veredito.replace(/^./, (x) => x.toUpperCase()),
        rotulo: "Veredito sugerido",
        explicacao: "regra fixa; quem decide é o GP",
        substitui: "Veredito sugerido",
      },
      {
        valor: String(sustentados.length),
        rotulo: "Achados",
        explicacao: `que se sustentam, ${contar(conta("grave"), "grave", "graves")}`,
      },
      {
        valor: `${verdes.length} de ${presentes.length}`,
        rotulo: "Partes em ordem",
        explicacao: "sem achado",
      },
    ],
    oQueE:
      "Etapa 5, conferência do plano: se o plano cobre o que a RFP, a proposta e o TAP pedem, na régua do tipo de plano, e o que corrigir antes de assinar.",
    decidir,
    numeros,
    alertas,
    mudou: [
      `Plano conferido: ${nomeDoPlano}.`,
      `${contar(derrubados.length, "candidato", "candidatos")} do código ${plural(derrubados.length, "derrubado", "derrubados")} pelo PMO (falso ou não se aplica); só os que se sustentam contam.`,
    ],
    quadros: [
      {
        titulo: "Semáforo por parte do plano",
        paragrafos: [
          verdes.length
            ? `Sem achado (${verdes.length}): ${verdes.map((s) => s.codigo).join(", ")}.`
            : "Nenhuma parte sem achado.",
        ],
        ...(comAchado.length
          ? {
              tabela: {
                colunas: ["Parte", "Situação", "Achados"],
                larguras: [1, 2, 1],
                linhas: comAchado.map((s) => [s.codigo, nomeCor[s.cor as keyof typeof nomeCor], String(s.n)]),
              },
            }
          : {}),
      },
      {
        titulo: "O que corrigir antes de assinar",
        paragrafos: graves.length
          ? []
          : [
              sustentados.length
                ? "Nenhum achado grave se sustenta; os de gravidade média e baixa estão nos alertas e no corpo."
                : "Nenhum achado se sustenta.",
            ],
        ...(graves.length
          ? {
              tabela: {
                colunas: ["Parte", "Achado", "Sugestão"],
                larguras: [0.8, 3, 4],
                linhas: graves.map((a) => [a.parte, `${a.titulo}${origem(a)}`, curto(a.sugestao, 220)]),
              },
            }
          : {}),
      },
    ],
  };
}
