// Saídas da etapa 1 pelo método (decisões 0034 e 0035): "Análise da RFP" (DOCX e PDF) nas 8 seções, requisitos e
// prazos (XLSX), checklist de habilitação linha a linha (XLSX) e perguntas de esclarecimento (DOCX), estas com a
// premissa crítica de cada ponto. A tela só exporta depois da leitura do PMO (decisão 0037); um dossiê sem ela sai marcado como "sem a leitura do PMO". Cabeçalho de
// minuta enquanto houver item pendente.
import type { AnaliseRfpDossie, Dossie, RevisaoItem } from "../dossie/esquema";
import type { AnaliseRfp } from "../etapas/1-rfp/analisar-rfp";
import {
  montarLeituraRfp,
  NOME_MODALIDADE,
  SECOES_LEITURA,
  type ItemLeitura,
  type LeituraRfp,
} from "../etapas/1-rfp/leitura";
import { requisitosValidos } from "../etapas/1-rfp/revisao";
import { NOME_RECOMENDACAO, recomendacaoDoDossie, recomendacaoEmTexto } from "../etapas/1-rfp/recomendacao";
import { curto, duracaoCurta, NAO_LOCALIZADO, secoesDaCapa, type CapaDeDecisao } from "./capa-de-decisao";
import { numerosDaFila, revisavelDaLeitura } from "../pmo/fila";
import { camposConfirmadosPeloPmo, type CampoQuePesa } from "./capa-regras";
import type { Alerta, Destaque } from "./modelo";
import {
  contarPendentesDaLeitura,
  itensRevisaveis,
  leituraDoDossie,
  NOME_AVISO,
  NOME_TRAVA,
} from "../etapas/1-rfp/leitura-pmo";
import { estadoDoItem } from "../etapas/1-rfp/revisao";
import { compactar } from "../texto/normalizar";
import { camposDoDossie, MARCA_PENDENTE, type DocumentoExportavel, type Secao } from "./modelo";
import { contar, plural } from "../texto/plural";

/** Rótulos curtos, para caber na coluna sem quebrar a palavra. */
const NOME_ROTULO = {
  documento: "Documento",
  sugestao: "Sugestão",
  "decisao-gp": "Decisão do GP",
} as const;
const NOME_ESTADO = {
  pendente: "Pendente",
  aceito: "Aceito",
  editado: "Editado",
  descartado: "Descartado",
} as const;
const NOME_PARTICIPACAO = {
  "a-decidir": "a decidir pelo GP",
  participar: "participar",
  "nao-participar": "não participar",
} as const;

export const AVISO_LEITURA_PARCIAL =
  "Sem a leitura do PMO: só o esqueleto que o código montou (páginas, números, datas, contas e o que as regras acham por padrão de texto). Peça a análise com o PMO antes de usar este documento.";

function base(dossie: Dossie, titulo: string, subtitulo: string, minuta: boolean, agora: Date) {
  return {
    titulo,
    subtitulo,
    ...camposDoDossie(dossie, 1),
    minuta,
    geradoEm: agora,
  };
}

function preparar(dossie: Dossie, analise: AnaliseRfp, agora: Date) {
  const a = dossie.analiseRfp;
  if (!a) throw new Error("a análise da RFP ainda não foi feita");
  const leitura = leituraDoDossie(analise, a, dossie.documentos, agora);
  return { a, leitura, pendentes: contarPendentesDaLeitura(leitura, a) };
}

function origem(i: ItemLeitura): string {
  return i.origem ? `${i.origem.documento}, p. ${i.origem.pagina}` : "—";
}

/**
 * Origem e trecho numa célula só. O trecho que repete o conteúdo da linha, ou o trecho da linha anterior, não
 * é impresso de novo: fica a indicação de onde ele está.
 */
export function origemETrecho(
  i: { origem?: ItemLeitura["origem"] },
  conteudo: string,
  anterior?: { origem?: ItemLeitura["origem"] },
): string {
  if (!i.origem) return "—";
  const onde = `${i.origem.documento}, p. ${i.origem.pagina}`;
  const trecho = compactar(i.origem.trecho);
  if (!trecho) return onde;
  const texto = compactar(conteudo);
  if (
    texto.includes(trecho) ||
    (texto.length >= 30 && trecho.includes(texto) && trecho.length - texto.length <= 12)
  )
    return `${onde} (o trecho é o conteúdo)`;
  if (
    anterior?.origem &&
    anterior.origem.pagina === i.origem.pagina &&
    compactar(anterior.origem.trecho) === trecho
  )
    return `${onde} (mesmo trecho da linha de cima)`;
  return `${onde}: ${i.origem.trecho}`;
}

/** O texto que vale: o editado pelo GP ou o do item. */
function textoFinal(i: ItemLeitura, revisoes: Record<string, RevisaoItem>): string {
  const r = revisoes[i.id];
  if (r?.estado === "editado" && r.textoEditado?.trim() && !i.pergunta) return r.textoEditado;
  return i.texto;
}

function perguntaFinal(i: ItemLeitura, revisoes: Record<string, RevisaoItem>): string {
  const r = revisoes[i.id];
  if (r?.estado === "editado" && r.textoEditado?.trim()) return r.textoEditado;
  return i.pergunta ?? "";
}

function marcas(i: ItemLeitura): string {
  return [i.trava ? NOME_TRAVA[i.trava] : "", i.aviso ? NOME_AVISO[i.aviso] : ""].filter(Boolean).join("; ");
}

function tabelaDaSecao(itens: ItemLeitura[], revisoes: Record<string, RevisaoItem>): Secao["tabela"] {
  return {
    colunas: ["Item", "Conteúdo", "Rótulo", "Origem e trecho", "Estado"],
    larguras: [1.6, 4.2, 0.9, 3.4, 0.9],
    linhas: itens.map((i, k) => {
      const texto = textoFinal(i, revisoes);
      const extras = [
        i.porquePesa ? `Por que pesa: ${i.porquePesa}` : "",
        i.pergunta ? `Pergunta sugerida: ${perguntaFinal(i, revisoes)}` : "",
        i.nota ?? "",
        marcas(i) ? `(${marcas(i)})` : "",
      ].filter(Boolean);
      return [
        `${i.premissa ? `${i.premissa} · ` : ""}${i.nome}`,
        [texto, ...extras].join("\n"),
        NOME_ROTULO[i.rotulo],
        i.trava === "citacao-nao-conferida" && i.origem
          ? `Trecho citado pelo PMO, não achado na p. ${i.origem.pagina}: ${i.origem.trecho}`
          : origemETrecho(i, texto, itens[k - 1]),
        estadoDoItem(revisoes, i.id) === "pendente"
          ? `${MARCA_PENDENTE} Pendente`
          : NOME_ESTADO[estadoDoItem(revisoes, i.id)],
      ];
    }),
  };
}

function secoesDaLeitura(leitura: LeituraRfp, revisoes: Record<string, RevisaoItem>): Secao[] {
  const out: Secao[] = [];
  SECOES_LEITURA.forEach((s, n) => {
    const itens = leitura.itens.filter((i) => i.secao === s.id);
    const naoAchou = leitura.naoLocalizados[s.id];
    if (!itens.length && !naoAchou?.length) return;
    out.push({
      titulo: `${n + 1}. ${s.titulo}`,
      paragrafos: [
        s.pergunta,
        ...(naoAchou?.length
          ? [`Não localizado pelo código — conferir no documento: ${naoAchou.join("; ")}.`]
          : []),
      ],
      tabela: itens.length ? tabelaDaSecao(itens, revisoes) : undefined,
    });
    // o detalhe consolidado (parcelas, documentos, critérios, obrigações) vem logo depois, um quadro por item
    for (const i of itens.filter((x) => x.tabela?.linhas.length && x.secao !== "habilitacao"))
      out.push({
        titulo: `${i.nome} — detalhe`,
        tabela: { colunas: i.tabela?.colunas ?? [], linhas: i.tabela?.linhas ?? [] },
      });
  });
  return out;
}

/** Os documentos da etapa 1 (RFP e anexos), onde os números do PMO são procurados. */
const docsDaRfp = (dossie: Dossie) =>
  dossie.documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");

/** Número da capa a partir de um campo da ficha: o valor curto, "não informado" (confirmado) ou "não localizado". */
function destaqueDaFicha(
  rotulo: string,
  i: ItemLeitura | undefined,
  confirmadoAusente: boolean,
  nomeDoDocumento: string,
): Destaque {
  if (confirmadoAusente)
    return { valor: "Não informado", rotulo, explicacao: `no ${nomeDoDocumento}: perguntar antes do preço` };
  if (!i || i.situacao === "nao-localizado")
    return { valor: "—", rotulo, explicacao: `não localizado: conferir no ${nomeDoDocumento}` };
  const curtoDemais = i.texto.length <= 24;
  // o prazo no bloco só com o número e a unidade ("12 meses"); o texto inteiro vai na explicação
  const duracao = rotulo === "Prazo" ? duracaoCurta(i.texto) : undefined;
  if (duracao) return { valor: duracao, rotulo, ...(curtoDemais ? {} : { explicacao: curto(i.texto, 90) }) };
  return {
    valor: curtoDemais ? i.texto : curto(i.texto, 24),
    rotulo,
    ...(curtoDemais ? {} : { explicacao: curto(i.texto, 90) }),
  };
}

/** As decisões da etapa 1 que não são item: participar ou não e a modalidade (decisão 0088). */
export function outrasDecisoesDaRfp(a: AnaliseRfpDossie): string[] {
  return [
    ...(a.participacao.decisao === "a-decidir" ? ["Participar ou não"] : []),
    ...(a.modalidade ? [] : ["Confirmar a modalidade"]),
  ];
}

/** O que, na seção "uma-pagina", o código procurou e não achou: vira alerta alto (pergunta antes do preço). */
const FALTA_QUE_PESA = ["prazo de execução ou vigência", "valor estimado ou teto"];

/**
 * Capa de decisão da etapa 1 (decisão 0085): a ficha da RFP e as perguntas antes do preço, os pontos de atenção que
 * mais pesam como alertas e as decisões do GP (participar ou não, modalidade, perguntas, premissas críticas).
 */
export function capaDaRfp(
  dossie: Dossie,
  analise: AnaliseRfp,
  leitura: LeituraRfp,
  agora = new Date(),
): CapaDeDecisao {
  const a = dossie.analiseRfp;
  if (!a) throw new Error("a análise da RFP ainda não foi feita");
  const esqueleto = montarLeituraRfp(analise, a, agora);
  const doCodigo = (id: string) => esqueleto.itens.find((i) => i.id === id);
  const valido = (i: ItemLeitura) => estadoDoItem(a.revisoes, i.id) !== "descartado";
  const atencao = leitura.itens.filter((i) => i.secao === "atencao" && valido(i));
  const perguntas = atencao.filter((i) => i.pergunta);
  const requisitos = requisitosValidos(a);
  const produtos = requisitos.filter((r) => (r.tipo ?? "produto") === "produto");
  const faltas = (esqueleto.naoLocalizados["uma-pagina"] ?? []).filter((f) => FALTA_QUE_PESA.includes(f));
  const situacao = doCodigo("leitura:situacao");
  const recomendacao = recomendacaoDoDossie(a, docsDaRfp(dossie));
  // a leitura do PMO da seção "em uma página", pelo nome do item (a conferir: é sugestão)
  const pmoSobre = (nome: RegExp) =>
    leitura.itens.find((i) => i.secao === "uma-pagina" && i.doPmo && nome.test(i.nome) && valido(i));
  const pcs = [...new Set(atencao.flatMap((i) => (i.premissa ? [i.premissa] : [])))].sort();
  const modalidadeDoGp = a.modalidade;
  const modalidade =
    modalidadeDoGp && modalidadeDoGp in NOME_MODALIDADE
      ? `${NOME_MODALIDADE[modalidadeDoGp as keyof typeof NOME_MODALIDADE]} (decisão do GP)`
      : leitura.modalidade === "nao-identificada"
        ? "não identificada no documento — a definir pelo GP"
        : `${NOME_MODALIDADE[leitura.modalidade]} (reconhecida pelo código; o GP confirma)`;

  // o que falta de prazo e valor vira um alerta só; o ponto de atenção do PMO sobre o mesmo assunto não repete
  const mesmoAssunto = (i: ItemLeitura) => faltas.length > 0 && /\b(prazo|valor)\b/i.test(i.nome);
  // as duas leituras concordam, campo a campo: o código procurou e não achou, e o PMO diz que o documento não traz
  // aquele campo e não dá número dele (decisão 0087)
  const camposFaltando = faltas.map((f) => (f.startsWith("prazo") ? "prazo" : "valor") as CampoQuePesa);
  // só a seção "em uma página": é onde o PMO diz o prazo e o valor do contrato (os pontos de atenção citam prazos de
  // outras coisas, como o da inspeção)
  const textosDoPmo = leitura.itens
    .filter((i) => i.doPmo && i.secao === "uma-pagina" && valido(i))
    .map((i) => `${i.nome}: ${i.texto}`);
  const confirmados = camposConfirmadosPeloPmo(camposFaltando, textosDoPmo);
  const naoConfirmados = faltas.filter(
    (f) => !confirmados.includes(f.startsWith("prazo") ? "prazo" : "valor"),
  );
  const nomeDoDocumento = /^\s*(?:termo de refer[eê]ncia|TR)\b/i.test(
    analise.itens.find((i) => i.id === "identificacao:instrumento")?.texto ?? "",
  )
    ? "TR"
    : "documento";
  const alertas: Alerta[] = [
    ...(faltas.length
      ? [
          {
            nivel: "alto" as const,
            texto: [
              confirmados.length
                ? `O ${nomeDoDocumento} não traz ${confirmados.join(" nem ")}: perguntar antes do preço (o código não achou, e a leitura do PMO confirma; conferir no documento).`
                : "",
              naoConfirmados.length
                ? `${naoConfirmados.join(" e ").replace(/^./, (c) => c.toUpperCase())}: ${NAO_LOCALIZADO}. Se faltar mesmo, é a primeira pergunta antes do preço.`
                : "",
            ]
              .filter(Boolean)
              .join(" "),
          },
        ]
      : []),
    ...(situacao && /já passou/i.test(situacao.texto)
      ? [{ nivel: "alto" as const, texto: curto(situacao.texto) }]
      : []),
    ...atencao
      .filter((i) => i.impacto !== undefined && i.impacto <= 4 && !mesmoAssunto(i))
      .map((i) => ({
        nivel: ((i.impacto ?? 9) <= 2 ? "alto" : "medio") as Alerta["nivel"],
        texto: `${i.nome}${i.premissa ? ` (${i.premissa})` : ""}: ${curto(i.porquePesa ?? i.texto)}${i.doPmo ? " (sugestão do PMO)" : ""}`,
      })),
  ];

  const decidir = [
    `Participar ou não: decisão do GP (hoje: ${NOME_PARTICIPACAO[a.participacao.decisao]}). ${recomendacao ? recomendacaoEmTexto(recomendacao) : "O PMO não deixou recomendação; os alertas e os pontos de atenção são o insumo."}`,
    ...(modalidadeDoGp ? [] : [`Confirmar a modalidade: ${modalidade}.`]),
    ...(perguntas.length
      ? [
          `Quais perguntas de esclarecimento enviar: ${perguntas.length} ${plural(perguntas.length, "sugerida", "sugeridas")}; as que mudam preço ou prazo estão no quadro "Perguntas antes do preço".`,
        ]
      : []),
    ...(pcs.length
      ? [`Quais premissas críticas se aplicam ao projeto: o PMO apontou ${pcs.join(", ")}.`]
      : []),
  ];

  const numeros = [
    ...numerosDaFila(1, itensRevisaveis(leitura).map(revisavelDaLeitura), a.revisoes, outrasDecisoesDaRfp(a)),
    { rotulo: "Modalidade", valor: modalidade },
    {
      rotulo: "Entregas",
      valor: produtos.length
        ? `${contar(produtos.length, "produto", "produtos")} (${produtos.map((r) => r.numero).join(", ")})`
        : NAO_LOCALIZADO,
    },
    { rotulo: "Requisitos numerados (R)", valor: String(requisitos.length) },
    {
      rotulo: "Pontos de atenção",
      valor: `${atencao.length}, ${atencao.filter((i) => (i.impacto ?? 9) <= 2).length} dos que mais pesam (caixa e dependência do contratante)`,
    },
    { rotulo: "Perguntas sugeridas", valor: String(perguntas.length) },
  ];

  // o que o código achou; o que não achou, com a leitura do PMO sobre o mesmo campo, quando houver (sugestão)
  const linhaDaFicha = (
    campo: string,
    i: ItemLeitura | undefined,
    falta?: string,
    doPmo?: RegExp,
  ): string[] => {
    const achou = i && i.situacao !== "nao-localizado";
    const pmo = !achou && doPmo ? pmoSobre(doPmo) : undefined;
    return [
      campo,
      achou
        ? i.texto
        : `${falta ? `${falta}: ` : ""}${NAO_LOCALIZADO}${pmo ? `. Leitura do PMO (sugestão): ${curto(pmo.texto, 200)}` : ""}`,
      i?.origem ? `${i.origem.documento}, p. ${i.origem.pagina}` : "—",
    ];
  };
  const habilitacao = doCodigo("leitura:habilitacao:lista");
  const ficha = {
    titulo: "Ficha da RFP",
    paragrafos: [
      "Montada pela ferramenta a partir do documento; o que ela não achou fica para conferir no documento.",
    ],
    tabela: {
      colunas: ["Campo", "Conteúdo", "Onde"],
      larguras: [1.4, 5, 1.4],
      linhas: [
        linhaDaFicha("Objeto", doCodigo("identificacao:objeto")),
        // o que as duas leituras confirmam ausente sai "não informado no TR" (decisão 0089)
        confirmados.includes("prazo")
          ? ["Prazo de execução", `não informado no ${nomeDoDocumento}`, "—"]
          : linhaDaFicha(
              "Prazo de execução",
              doCodigo("leitura:prazo"),
              "prazo de execução ou vigência",
              /prazo/i,
            ),
        confirmados.includes("valor")
          ? ["Valor", `não informado no ${nomeDoDocumento}`, "—"]
          : linhaDaFicha("Valor", doCodigo("identificacao:valor"), "valor estimado ou teto", /valor/i),
        linhaDaFicha("Entregas", doCodigo("leitura:tamanho")),
        linhaDaFicha(
          "Julgamento",
          doCodigo("leitura:como-se-ganha"),
          "critério de julgamento",
          /julgamento|modalidade/i,
        ),
        [
          "Habilitação",
          habilitacao?.tabela?.linhas.length
            ? `${contar(habilitacao.tabela.linhas.length, "documento", "documentos")} na lista do edital`
            : NAO_LOCALIZADO,
          habilitacao?.origem ? `${habilitacao.origem.documento}, p. ${habilitacao.origem.pagina}` : "—",
        ],
        linhaDaFicha("Situação das datas", situacao, undefined, /situa/i),
      ],
    },
  };
  const ordenadas = [...perguntas].sort((x, y) => (x.impacto ?? 9) - (y.impacto ?? 9));
  const quadroPerguntas = {
    titulo: "Perguntas antes do preço",
    paragrafos: [
      "Sugestões do PMO, na ordem do impacto (caixa, dependência do contratante, preço, prazo, escopo). Quais enviar é decisão do GP.",
    ],
    tabela: {
      colunas: ["#", "Pergunta sugerida", "Premissa", "Onde"],
      larguras: [0.4, 6, 0.9, 1.2],
      linhas: ordenadas
        .slice(0, 8)
        .map((i, k) => [String(k + 1), perguntaFinal(i, a.revisoes), i.premissa ?? "—", origem(i)]),
    },
  };
  return {
    etapa: 1,
    destaques: [
      destaqueDaFicha("Prazo", doCodigo("leitura:prazo"), confirmados.includes("prazo"), nomeDoDocumento),
      destaqueDaFicha(
        "Valor",
        doCodigo("identificacao:valor"),
        confirmados.includes("valor"),
        nomeDoDocumento,
      ),
      {
        valor: produtos.length ? String(produtos.length) : "—",
        rotulo: "Entregas",
        explicacao: produtos.length
          ? curto(
              `${plural(produtos.length, "produto", "produtos")}: ${produtos.map((r) => r.numero).join(", ")}`,
              60,
            )
          : NAO_LOCALIZADO,
        substitui: "Entregas",
      },
      // o veredito da etapa 1 é a recomendação de participar, que é sugestão do PMO (decisão 0086)
      ...(recomendacao
        ? [
            {
              valor:
                recomendacao.recomendacao.sugestao === "sem_base"
                  ? "Sem base"
                  : NOME_RECOMENDACAO[recomendacao.recomendacao.sugestao].replace(/^./, (x) =>
                      x.toUpperCase(),
                    ),
              rotulo: "Recomendação",
              explicacao: "sugestão do PMO; quem decide é o GP",
            },
          ]
        : []),
    ],
    oQueE:
      "Etapa 1, leitura da RFP: o que o documento pede, quanto, em quanto tempo e como se ganha, para o GP decidir se participa e o que perguntar antes do preço.",
    decidir,
    numeros,
    alertas,
    mudou: ["É a primeira etapa: não há etapa anterior."],
    quadros: [ficha, ...(ordenadas.length ? [quadroPerguntas] : [])],
  };
}

export function montarAnaliseRfp(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, leitura, pendentes } = preparar(dossie, analise, agora);
  const recomendacao = recomendacaoDoDossie(a, docsDaRfp(dossie));
  const secoes: Secao[] = [
    // a capa de decisão e os quadros só com a leitura do PMO (decisão 0037)
    ...(leitura.fonte === "pmo" ? secoesDaCapa(capaDaRfp(dossie, analise, leitura, agora)) : []),
    {
      titulo: "Decisão do GP: participar ou não",
      paragrafos: [
        `Decisão: ${NOME_PARTICIPACAO[a.participacao.decisao]}.${a.participacao.justificativa ? ` Justificativa: ${a.participacao.justificativa}` : ""}`,
        "Os pontos de atenção são insumo para a decisão, nunca a decisão.",
        ...(recomendacao ? [`[Sugestão] ${recomendacaoEmTexto(recomendacao)}`] : []),
        leitura.fonte === "codigo"
          ? AVISO_LEITURA_PARCIAL
          : `Leitura do PMO (${a.leituraPmo?.modelo ?? ""}), conferida pelo código: cada citação procurada na página e cada número no trecho citado. Tudo o que veio do PMO é sugestão.`,
        `${pendentes} itens ainda sem revisão do GP.`,
      ],
    },
    ...secoesDaLeitura(leitura, a.revisoes),
  ];
  if (leitura.foraDaLeitura.length || leitura.ilegiveis.length)
    secoes.push({
      titulo: "Fora da leitura",
      paragrafos: [
        "Pelo método da etapa 1, fica fora o que não muda uma decisão do gerente nem algo que a FGV terá de fazer, entregar, cumprir ou pagar.",
        ...leitura.foraDaLeitura.map((f) => `${f.motivo}: ${f.quantos}.`),
        ...leitura.ilegiveis.map((x) => `Páginas sem texto legível (não lidas): ${x}.`),
      ],
    });
  return {
    ...base(
      dossie,
      "Análise da RFP",
      leitura.fonte === "codigo"
        ? "Sem a leitura do PMO: só o esqueleto do código, com a página de cada item. A ferramenta sugere; quem decide é o GP."
        : "Leitura do PMO, conferida pelo código, com a página de cada item. A ferramenta sugere; quem decide é o GP.",
      pendentes > 0,
      agora,
    ),
    secoes,
  };
}

export function montarRequisitosEPrazos(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, leitura } = preparar(dossie, analise, agora);
  const req = leitura.itens.filter((i) => i.numero);
  const prazos = leitura.itens.filter((i) => i.secao === "prazos");
  const pendentes = [...req, ...prazos].filter((i) => estadoDoItem(a.revisoes, i.id) === "pendente").length;
  const linhasDePrazo = prazos.flatMap((i) =>
    i.tabela?.linhas.length
      ? i.tabela.linhas.map((l) => [
          i.nome,
          ...l.slice(0, -1).filter(Boolean).slice(0, 2),
          l.at(-1) ?? "",
          NOME_ESTADO[estadoDoItem(a.revisoes, i.id)],
        ])
      : [
          [
            i.nome,
            textoFinal(i, a.revisoes),
            "",
            String(i.origem?.pagina ?? "—"),
            NOME_ESTADO[estadoDoItem(a.revisoes, i.id)],
          ],
        ],
  );
  return {
    ...base(
      dossie,
      "Requisitos e prazos da RFP",
      "Requisitos numerados e prazos do certame e da execução.",
      pendentes > 0,
      agora,
    ),
    secoes: [
      {
        titulo: "Requisitos",
        tabela: {
          colunas: ["Número", "Requisito", "Descrição", "Origem", "Trecho", "Estado"],
          larguras: [0.8, 1.8, 3.8, 1.1, 3, 0.9],
          linhas: req.map((i) => [
            i.numero ?? "",
            i.nome.replace(/^R\d+ · /, ""),
            `${textoFinal(i, a.revisoes)}${i.nota ? `\n(${i.nota})` : ""}`,
            i.origem ? origem(i) : "incluído pelo GP",
            i.origem?.trecho ?? "",
            NOME_ESTADO[estadoDoItem(a.revisoes, i.id)],
          ]),
        },
      },
      {
        titulo: "Prazos",
        tabela: {
          colunas: ["Grupo", "Prazo", "Quanto ou regra", "Página", "Estado"],
          larguras: [1.4, 3, 2.6, 0.8, 0.9],
          linhas: linhasDePrazo.map((l) => (l.length === 5 ? l : [...l, "", "", "", ""].slice(0, 5))),
        },
      },
    ],
  };
}

export function montarChecklistHabilitacao(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, leitura } = preparar(dossie, analise, agora);
  const hab = leitura.itens.filter((i) => i.secao === "habilitacao");
  const lista = hab.find((i) => i.tabela?.linhas.length && /documentos/i.test(i.nome));
  const outros = hab.filter((i) => i !== lista);
  return {
    ...base(
      dossie,
      "Checklist de habilitação",
      "Documentos de habilitação linha a linha da lista do edital, quem entrega e em que prazo. Conferir a seção de habilitação do documento.",
      hab.some((i) => estadoDoItem(a.revisoes, i.id) === "pendente"),
      agora,
    ),
    secoes: [
      ...(lista?.tabela
        ? [
            {
              titulo: lista.nome,
              tabela: {
                colunas: lista.tabela.colunas,
                linhas: lista.tabela.linhas,
                larguras: lista.tabela.colunas.length === 5 ? [0.5, 4, 1.6, 0.7, 1.1] : [0.5, 5, 0.7, 1.1],
              },
            },
          ]
        : []),
      {
        titulo: "Quem entrega, prazo e o que a FGV confere sobre si",
        tabela: {
          colunas: ["Item", "Conteúdo", "Origem", "Estado"],
          larguras: [1.8, 5, 1.2, 0.9],
          linhas: outros.map((i) => [
            i.nome,
            textoFinal(i, a.revisoes),
            origem(i),
            NOME_ESTADO[estadoDoItem(a.revisoes, i.id)],
          ]),
        },
      },
    ],
  };
}

export function montarPerguntas(
  dossie: Dossie,
  analise: AnaliseRfp,
  agora = new Date(),
): DocumentoExportavel {
  const { a, leitura } = preparar(dossie, analise, agora);
  const pontos = leitura.itens.filter(
    (i) => i.secao === "atencao" && estadoDoItem(a.revisoes, i.id) !== "descartado",
  );
  const perguntas: string[] = [];
  for (const i of pontos) {
    const pendente = estadoDoItem(a.revisoes, i.id) === "pendente" ? `${MARCA_PENDENTE} ` : "";
    if (i.pergunta)
      perguntas.push(
        `${pendente}${perguntas.length + 1}. ${perguntaFinal(i, a.revisoes)} (${i.premissa ? `${i.premissa}; ` : ""}referência: ${origem(i)}${i.trava ? `; ${NOME_TRAVA[i.trava]}` : ""}.)`,
      );
    // os vagos juntos num item: uma pergunta por linha da tabela
    else if (i.tabela?.colunas.includes("Pergunta sugerida"))
      for (const l of i.tabela.linhas)
        if (l[2])
          perguntas.push(`${pendente}${perguntas.length + 1}. ${l[2]} (referência: RFP, p. ${l[1]}.)`);
  }
  return {
    ...base(
      dossie,
      "Perguntas de esclarecimento",
      "Perguntas sugeridas a partir dos pontos de atenção da RFP, com a premissa crítica de cada uma. Quais enviar é decisão do GP.",
      pontos.some((i) => estadoDoItem(a.revisoes, i.id) === "pendente"),
      agora,
    ),
    secoes: [
      {
        titulo: "Perguntas",
        paragrafos: perguntas.length ? perguntas : ["Nenhuma pergunta mantida pelo GP."],
      },
    ],
  };
}
