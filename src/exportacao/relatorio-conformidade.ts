// Relatório de conformidade do PGP (etapa 5): DOCX e PDF; a lista de achados vai para o XLSX.
import type { Gravidade } from "../dominio/fichas";
import type { DecisaoAchado, Dossie } from "../dossie/esquema";
import type { Achado, Verificacao } from "../regras/achado";
import { resumirAchados } from "../regras/conferencia";
import { NOME_SITUACAO_PMO, type AchadoPmoConferido } from "../etapas/5-conferencia/leitura-pmo";
import { NOME_SITUACAO_CANDIDATO, type ResultadoVereditos } from "../etapas/5-conferencia/candidatos";
import { camposDoDossie, type DocumentoExportavel, type Secao } from "./modelo";

export const NOME_TIPO = { vago: "Vago", conflituoso: "Conflituoso", ausente: "Ausente" } as const;

/** Gravidade e categoria finais: as do código, ou as que o GP trocou (com justificativa). */
export function aplicarDecisao(
  a: Achado,
  d: DecisaoAchado | undefined,
): Achado & { decisao?: DecisaoAchado } {
  return {
    ...a,
    gravidade: (d?.gravidade as Gravidade | undefined) ?? a.gravidade,
    categoria: d?.categoria || a.categoria,
    decisao: d,
  };
}

function textoDecisao(d: DecisaoAchado | undefined): string {
  if (!d?.procede) return "Pendente";
  const base = d.procede === "sim" ? "Procede" : "Não procede";
  return d.justificativa ? `${base}: ${d.justificativa}` : base;
}

function evidencias(a: Achado): string {
  return a.evidencias.map((e) => `${e.rotulo}: "${e.trecho}"`).join("\n");
}

export function montarRelatorioConformidade(
  dossie: Dossie,
  achados: Achado[],
  verificacoes: Verificacao[],
  agora = new Date(),
  leitura: AchadoPmoConferido[] = [],
  /** Os vereditos do PMO (decisão 0052): "achados" já vem só com os confirmados; os outros vão numa seção à parte. */
  vereditos?: ResultadoVereditos,
): DocumentoExportavel {
  const decisoes = dossie.conferencia?.decisoes ?? {};
  const finais = achados.map((a) => aplicarDecisao(a, decisoes[a.id]));
  const pendentes =
    finais.filter((a) => !a.decisao?.procede).length +
    leitura.filter((a) => !decisoes[`pmo:${a.id}`]?.procede).length;
  const resumo = resumirAchados(finais);
  const conta = (estado: Verificacao["estado"]) => verificacoes.filter((v) => v.estado === estado).length;
  const dispensadas = (dossie.conferencia?.mapa ?? []).filter((p) => p.situacao === "dispensada");

  const secoes: Secao[] = [
    {
      titulo: "Resumo",
      paragrafos: [
        `${finais.length} achados: cada um é vago, conflituoso ou ausente, com a gravidade dada pela parte do plano. ${pendentes} ainda sem decisão do GP.`,
        "Ausente quer dizer não localizado pelo código no plano inteiro: conferir no documento antes de decidir.",
        ...(vereditos
          ? [
              `Só contam os achados do código que o PMO confirmou (decisão 0052) ou que a segunda instância devolveu (decisão 0077). ${vereditos.candidatos.length - vereditos.contam.length} ficaram à parte, com o veredito, na seção "Achados do código que o PMO não confirmou".`,
              ...vereditos.candidatos
                .filter((c) => c.revisadoPelaSegunda)
                .map(
                  (c) =>
                    `Voltou a contar pela segunda instância: ${c.achado.titulo}. ${c.revisadoPelaSegunda}`,
                ),
            ]
          : []),
      ],
      tabela: {
        colunas: ["Gravidade", "Vago", "Conflituoso", "Ausente"],
        larguras: [2, 1, 1, 1],
        linhas: (["grave", "média", "baixa"] as const).map((g) => [
          g.charAt(0).toUpperCase() + g.slice(1),
          String(resumo[g].vago),
          String(resumo[g].conflituoso),
          String(resumo[g].ausente),
        ]),
      },
    },
    {
      titulo: "Achados: premissas críticas, conflitos, ausentes e vagos",
      tabela: {
        colunas: [
          "Nº",
          "Gravidade",
          "Tipo",
          "Categoria",
          "Parte",
          "Achado",
          "Evidência",
          "Sugestão",
          "Decisão do GP",
        ],
        larguras: [0.6, 1, 1.1, 1.3, 0.8, 3, 3.5, 3, 1.8],
        linhas: finais.map((a, i) => [
          String(i + 1),
          a.gravidade,
          NOME_TIPO[a.tipo],
          a.categoria,
          a.parte,
          `${a.titulo}. ${a.descricao}`,
          evidencias(a),
          a.sugestao,
          textoDecisao(a.decisao),
        ]),
      },
    },
    {
      titulo: "O que o código não pôde conferir",
      paragrafos: [
        `${conta("nao-verificavel")} verificações não verificáveis (páginas sem texto legível).`,
        `${conta("nao-conferido")} itens do conteúdo mínimo dependem de interpretação ou de estrutura (tabelas, colunas) e não foram conferidos pelo código.`,
        `${conta("dispensavel")} itens dispensáveis pelas características do projeto.`,
      ],
    },
  ];
  if (leitura.length) secoes.push(secaoDaLeitura(leitura, decisoes));
  if (vereditos) secoes.push(...secoesDosVereditos(vereditos));
  if (dispensadas.length) {
    secoes.push({
      titulo: "Partes dispensadas pelo GP",
      tabela: {
        colunas: ["Parte", "Justificativa"],
        larguras: [1, 5],
        linhas: dispensadas.map((p) => [p.codigo, p.justificativa || "sem justificativa registrada"]),
      },
    });
  }

  return {
    titulo: "Relatório de conformidade do plano",
    subtitulo:
      "Conferência do PGP feita por código, contra o TAP, a RFP e o conteúdo mínimo das fichas da skill PMO. Cada achado é sugestão: quem decide se procede é o GP.",
    ...camposDoDossie(dossie),
    minuta: pendentes > 0 || finais.length === 0,
    geradoEm: agora,
    secoes,
  };
}

/** Achados do código que o PMO não confirmou e dispensas declaradas só no plano, com o veredito (decisão 0052). */
function secoesDosVereditos(v: ResultadoVereditos): Secao[] {
  const aParte = v.candidatos.filter((c) => c.situacao !== "sustenta");
  const out: Secao[] = [];
  if (aParte.length)
    out.push({
      titulo: "Achados do código que o PMO não confirmou",
      paragrafos: [
        "Achado do código é candidato até o veredito do PMO. Estes não contam no total: falso (o plano tem o conteúdo), não se aplica, regra errada ou sem veredito. O GP pode rever.",
      ],
      tabela: {
        colunas: ["Parte", "Tipo", "Achado do código", "Veredito", "Motivo ou trecho", "Conferência"],
        larguras: [0.8, 1.1, 3, 1.6, 3.5, 2],
        linhas: aParte.map((c) => [
          c.achado.parte,
          NOME_TIPO[c.achado.tipo],
          `${c.achado.titulo}${c.daDispensa ? ` (parte devolvida: a dispensa do ${c.daDispensa} não cabe)` : ""}`,
          NOME_SITUACAO_CANDIDATO[c.situacao],
          [
            c.veredito?.motivo ?? "",
            ...(c.veredito?.evidencias ?? []).map(
              (e) => `${e.doc.toUpperCase()}, p. ${e.pagina}: "${e.trecho}"`,
            ),
          ]
            .filter(Boolean)
            .join("\n") || "—",
          c.avisos.join("; ") || "—",
        ]),
      },
    });
  if (v.dispensas.length)
    out.push({
      titulo: "Dispensas declaradas só no plano",
      paragrafos: [
        "O plano declara estas partes como dispensadas pelo GP, sem a dispensa da etapa 4 no dossiê. O PMO disse se cada uma cabe pelas condições da ficha; a que não cabe volta a ser conferida.",
      ],
      tabela: {
        colunas: ["Parte", "Justificativa no plano", "Veredito do PMO", "Motivo"],
        larguras: [0.8, 3, 1.5, 3],
        linhas: v.dispensas.map((d) => [
          d.parte,
          d.justificativa,
          d.situacao === "cabe"
            ? "cabe"
            : d.situacao === "nao-cabe"
              ? "não cabe: a parte volta à conferência"
              : "sem veredito",
          [d.motivo, ...d.avisos].filter(Boolean).join("; ") || "—",
        ]),
      },
    });
  return out;
}

/** Achados da leitura do PMO (F5b): sugestões, com a situação dada pelo código e a decisão do GP. */
function secaoDaLeitura(leitura: AchadoPmoConferido[], decisoes: Record<string, DecisaoAchado>): Secao {
  return {
    titulo: "Leitura do PMO (sugestões)",
    paragrafos: [
      "Leitura opcional pedida pelo GP. Todo achado é sugestão: o código conferiu as citações, procurou o que o PMO apontou como ausente na parte apontada (sem os trechos que o próprio achado cita) e aplicou a gravidade e a categoria pela parte do plano.",
    ],
    tabela: {
      colunas: [
        "Nº",
        "Gravidade",
        "Tipo",
        "Parte",
        "Situação (código)",
        "Achado",
        "Evidência",
        "Sugestão",
        "Decisão do GP",
      ],
      larguras: [0.6, 1, 1.1, 0.8, 1.8, 3, 3, 3, 1.8],
      linhas: leitura.map((a, i) => [
        `PMO-${i + 1}`,
        a.gravidade,
        NOME_TIPO[a.tipo],
        a.parte,
        NOME_SITUACAO_PMO[a.situacao],
        `${a.titulo}. ${a.descricao}${a.localizadoEm ? ` O código achou no plano, p. ${a.localizadoEm.pagina}: "${a.localizadoEm.trecho}".` : ""}`,
        a.evidencias.map((e) => `${e.doc.toUpperCase()}, p. ${e.pagina}: "${e.trecho}"`).join("\n") || "—",
        a.sugestao,
        textoDecisao(decisoes[`pmo:${a.id}`]),
      ]),
    },
  };
}

/** Lista de achados para o XLSX: uma aba com os achados do código e, se houver, outra com a leitura do PMO. */
export function montarListaAchados(
  dossie: Dossie,
  achados: Achado[],
  agora = new Date(),
  leitura: AchadoPmoConferido[] = [],
  vereditos?: ResultadoVereditos,
): DocumentoExportavel {
  const doc = montarRelatorioConformidade(dossie, achados, [], agora, leitura, vereditos);
  const tabela = doc.secoes[1]?.tabela;
  const daLeitura = doc.secoes.find((s) => s.titulo === "Leitura do PMO (sugestões)")?.tabela;
  const naoConfirmados = doc.secoes.find(
    (s) => s.titulo === "Achados do código que o PMO não confirmou",
  )?.tabela;
  return {
    ...doc,
    titulo: "Lista de achados",
    secoes: [
      ...(tabela ? [{ titulo: "Achados", tabela }] : []),
      ...(daLeitura ? [{ titulo: "Leitura do PMO", tabela: daLeitura }] : []),
      ...(naoConfirmados ? [{ titulo: "Não confirmados", tabela: naoConfirmados }] : []),
    ],
  };
}
