// Saídas da etapa 3: o termo de abertura (DOCX e PDF) e o registro de premissas inicial (XLSX). Cada trecho leva o
// rótulo; "do documento" sem citação conferida sai como "citação não conferida"; campos do GP vazios saem "a definir
// pelo GP". Cabeçalho de minuta enquanto houver pendência (item, divergência sem decisão, TAP sem aprovação).
import type { Dossie, TapDossie } from "../dossie/esquema";
import { conferirTap, NOME_SITUACAO_VERIFICACAO } from "../etapas/3-tap/conferencia-tap";
import { compararRfpEProposta, NOME_SITUACAO_DIVERGENCIA, pedeDecisao } from "../etapas/3-tap/divergencias";
import { dadosDosDocumentos } from "../etapas/3-tap/do-documento";
import { montarEntradaTap, NOME_PROPOSTA_DO_DOSSIE } from "../etapas/3-tap/entrada";
import { contarPendentesTap, ELEMENTOS_TAP, itensDaEtapa3, tapInicial } from "../etapas/3-tap/tap";
import { estadoDe, itensValidos, paragrafoDoItem, rotuloDoItem, textoFinal } from "../pmo/itens";
import { camposDoDossie, type DocumentoExportavel, type Secao } from "./modelo";

const A_DEFINIR = "a definir pelo GP";
const decisao = (v?: string) => `[Decisão do GP] ${v?.trim() || A_DEFINIR}`;

function preparar(dossie: Dossie, hoje: Date) {
  const t: TapDossie = dossie.tap ?? tapInicial();
  const entrada = montarEntradaTap(dossie, hoje);
  const todos = itensDaEtapa3(t, entrada.documentos);
  const itens = itensValidos(t.revisoes, todos);
  const divergencias = compararRfpEProposta(entrada);
  const pendentes = contarPendentesTap(t, todos, divergencias);
  const premissas = t.premissasAplicaveis ?? dossie.proposta?.premissasAplicaveis ?? {};
  return { t, entrada, todos, itens, divergencias, pendentes, premissas };
}

function valeDaDivergencia(t: TapDossie, id: string): string {
  const d = t.divergencias[id];
  if (!d) return "pendente do GP";
  if (d.vale === "rfp") return "[Decisão do GP] vale a RFP";
  if (d.vale === "proposta") return "[Decisão do GP] vale a proposta";
  return `[Decisão do GP] ${d.texto?.trim() || "outra redação, a definir"}`;
}

export function montarTap(dossie: Dossie, agora = new Date()): DocumentoExportavel {
  const { t, entrada, todos, itens, divergencias, pendentes, premissas } = preparar(dossie, agora);
  const r = t.tap?.resposta;
  const secoes: Secao[] = [
    {
      titulo: "Situação da minuta",
      paragrafos: [
        `Proposta usada: ${entrada.fonte === "pdf" ? `PDF da versão final (${entrada.proposta?.nomeArquivo})` : entrada.fonte === "dossie" ? NOME_PROPOSTA_DO_DOSSIE : "nenhuma (o TAP parte só da RFP)"}.`,
        `${pendentes} pendências do GP (revisão de itens, divergências sem decisão e a aprovação do TAP).`,
        "Os itens [Sugestão] são propostas do PMO em redação condicional; os [Decisão do GP] só o GP preenche.",
      ],
    },
  ];
  const divsDecisao = divergencias.filter(pedeDecisao);
  if (divsDecisao.length)
    secoes.push({
      titulo: "Divergências entre a RFP e a proposta",
      tabela: {
        colunas: ["Item", "RFP", "Proposta", "Situação (código)", "O que vale"],
        larguras: [1, 3, 3, 2, 2],
        linhas: divsDecisao.map((d) => [
          d.requisito ?? d.tema,
          `${d.rfp.texto}${d.rfp.onde ? ` (${d.rfp.onde})` : ""}`,
          `${d.proposta.texto}${d.proposta.onde ? ` (${d.proposta.onde})` : ""}`,
          NOME_SITUACAO_DIVERGENCIA[d.situacao],
          valeDaDivergencia(t, d.id),
        ]),
      },
    });

  for (const el of ELEMENTOS_TAP) {
    const doEl = itens.filter((i) => i.passo === "tap" && i.grupo.startsWith(`${el.codigo} —`));
    const titulo = `${el.codigo.replace("TAP.", "")}. ${el.nome}`;
    if (el.codigo === "TAP.6" && r) {
      const linhas = r.marcos
        .map((m, k) => ({ m, i: doEl.find((x) => x.id === `tap:marcos:${k}`) }))
        .filter((x) => x.i)
        .map(({ m, i }) => [
          `${rotuloDoItem(i!)} ${textoFinal(i!, t.revisoes)}`,
          m.prazo || A_DEFINIR,
          m.produto || "—",
        ]);
      secoes.push({
        titulo,
        paragrafos: [
          "Datas e prazos calculados pelo código a partir da assinatura e do cronograma da proposta.",
        ],
        tabela: { colunas: ["Marco", "Prazo", "Produto"], larguras: [4, 3, 1], linhas },
      });
      continue;
    }
    if (el.codigo === "TAP.8" && r) {
      const linhas = r.partesInteressadas
        .map((p, k) => ({ p, i: doEl.find((x) => x.id === `tap:partesInteressadas:${k}`) }))
        .filter((x) => x.i)
        .map(({ p, i }) => [
          `${rotuloDoItem(i!)} ${textoFinal(i!, t.revisoes)}`,
          p.papel || A_DEFINIR,
          p.decide || A_DEFINIR,
        ]);
      secoes.push({
        titulo,
        tabela: { colunas: ["Parte interessada", "Papel", "Decide"], larguras: [4, 2, 2], linhas },
      });
      continue;
    }
    const paragrafos = doEl.map((i) => paragrafoDoItem(i, t.revisoes));
    if (el.codigo === "TAP.7")
      paragrafos.unshift(`Recursos financeiros pré-aprovados: ${decisao(t.decisoes.recursos)}.`);
    if (el.codigo === "TAP.11")
      paragrafos.unshift(
        `Gerente do projeto: ${decisao(t.decisoes.gerente)}.`,
        `Responsabilidade e nível de autoridade: ${decisao(t.decisoes.autoridade)}.`,
      );
    if (el.codigo === "TAP.12")
      paragrafos.unshift(
        `Patrocinador: ${decisao(t.decisoes.patrocinador)}.`,
        `Autoridade do patrocinador e escalonamento: ${decisao(t.decisoes.autoridadePatrocinador)}.`,
      );
    secoes.push({ titulo, paragrafos: paragrafos.length ? paragrafos : [`${A_DEFINIR}.`] });
  }

  const doRegistro = itens.filter((i) => i.passo === "premissas" && i.grupo !== "Observações do PMO");
  const criticas = doRegistro.filter((i) => i.grupo === "Premissas críticas");
  const pcs = Object.entries(premissas)
    .filter(([, v]) => v)
    .map(([k]) => k);
  secoes.push({
    titulo: "Premissas e restrições de alto nível",
    paragrafos: [
      doRegistro.length
        ? `${doRegistro.length} premissas e restrições no registro de premissas inicial (planilha anexa).`
        : "Registro de premissas ainda não preparado: ver o registro de premissas (B3).",
      `Premissas críticas que se aplicam: [Decisão do GP] ${pcs.length ? pcs.join(", ") : A_DEFINIR}.`,
      ...criticas.map((i) => paragrafoDoItem(i, t.revisoes)),
    ],
  });

  const obs = itens.filter((i) => i.grupo === "Observações do PMO");
  if (obs.length)
    secoes.push({ titulo: "Observações do PMO", paragrafos: obs.map((i) => paragrafoDoItem(i, t.revisoes)) });

  secoes.push({
    titulo: "O que veio dos documentos (código)",
    tabela: {
      colunas: ["Elemento", "Dado", "Conteúdo", "Origem"],
      larguras: [1, 2, 5, 2],
      linhas: dadosDosDocumentos(entrada).map((d) => [
        d.elemento,
        d.nome,
        d.texto,
        d.origem === "calculado" ? `${d.onde ?? ""} (conta do código)` : (d.onde ?? "—"),
      ]),
    },
  });
  secoes.push({
    titulo: "Conferência do TAP (código)",
    tabela: {
      colunas: ["Verificação", "Situação", "Detalhe"],
      larguras: [3, 1, 5],
      linhas: conferirTap(entrada, t, todos, premissas).map((v) => [
        v.nome,
        NOME_SITUACAO_VERIFICACAO[v.situacao],
        v.texto,
      ]),
    },
  });
  secoes.push({
    titulo: "Aprovação",
    paragrafos: [
      `Aprovado por: ${decisao(t.decisoes.aprovadoPor)}.`,
      `Data: ${decisao(t.decisoes.aprovadoEm ? new Date(`${t.decisoes.aprovadoEm}T00:00:00`).toLocaleDateString("pt-BR") : undefined)}.`,
      "Assinaturas: ______________________ (patrocinador)    ______________________ (gerente do projeto)",
    ],
  });

  return {
    titulo: "Termo de abertura do projeto",
    subtitulo:
      "Minuta preparada a partir da RFP e da proposta. Os 12 elementos do PMBOK 6 (processo 4.1); o detalhe fica no plano de gerenciamento.",
    ...camposDoDossie(dossie),
    minuta: pendentes > 0 || !r,
    geradoEm: agora,
    secoes,
  };
}

export function montarRegistroPremissas(dossie: Dossie, agora = new Date()): DocumentoExportavel {
  const { t, todos, pendentes } = preparar(dossie, agora);
  const registro = t.premissas?.resposta.premissas ?? [];
  const linhas = registro.flatMap((p, k) => {
    const i = todos.find((x) => x.id === `premissas:${k}`);
    if (!i || estadoDe(t.revisoes, i.id) === "descartado") return [];
    const fonte = i.item.fontes[0];
    return [
      [
        `B3-${String(k + 1).padStart(2, "0")}`,
        p.tipo === "restricao" ? "restrição" : "premissa",
        `${rotuloDoItem(i)} ${textoFinal(i, t.revisoes)}`,
        `${p.origem}${fonte ? ` (${fonte.doc === "rfp" ? "RFP" : fonte.doc}, p. ${i.conferencia.citacoes[0]?.pagina ?? fonte.pagina})` : ""}`,
        p.premissaCritica || "—",
        p.consequencia || "—",
        p.dependeDe || A_DEFINIR,
        p.comoValidar || A_DEFINIR,
        "aberta",
        estadoDe(t.revisoes, i.id),
      ],
    ];
  });
  return {
    titulo: "Registro de premissas inicial",
    subtitulo:
      "Premissas e restrições assumidas na proposta e no TAP (ficha B3). A etapa 4 parte deste registro.",
    ...camposDoDossie(dossie),
    minuta: pendentes > 0 || !registro.length,
    geradoEm: agora,
    secoes: [
      {
        titulo: "Registro de premissas",
        tabela: {
          colunas: [
            "Nº",
            "Tipo",
            "Premissa ou restrição",
            "Origem",
            "Premissa crítica",
            "Se não se confirmar",
            "Depende de",
            "Como validar",
            "Situação",
            "Revisão do GP",
          ],
          larguras: [1, 1, 5, 2, 1, 4, 2, 3, 1, 1],
          linhas,
        },
      },
    ],
  };
}
