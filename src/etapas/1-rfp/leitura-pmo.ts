// Etapa 1, leitura do PMO (decisões 0032 e 0035): o PMO lê a RFP na estrutura do método, a partir do esqueleto do
// código; o código confere depois. Travas:
// - todo item do PMO é Sugestão; a citação é procurada na página indicada, e a que não é achada deixa o item
//   "citação não conferida" (nunca aparece como fato);
// - todo número do texto é relido nos trechos conferidos e no esqueleto da mesma seção; o que não está lá deixa o
//   item "valor não conferido"; soma, acumulado ou "sobram" deixam "conta feita pelo PMO";
// - número R que não está na lista do dossiê é tirado do item (o PMO não cria requisito);
// - as contas (datas × hoje, soma das parcelas, caixa) continuam do código: os itens calculados do esqueleto ficam.
import textoMetodo from "../../../docs/estudos/metodo-etapa-1.md?raw";
import type { AnaliseRfpDossie, DocumentoLido } from "../../dossie/esquema";
import {
  conferirAutoconferencia,
  cruzamentosSemRegistro,
  type ResultadoAutoconferencia,
} from "../../pmo/autoconferencia";
import { citacaoValeComoFato, conferirCitacao, type ResultadoCitacao } from "../../pmo/citacoes";
import type { ItemLeituraRfpPmo, RespostaLeituraRfp } from "../../pmo/schemas/leitura-rfp";
import type { CodigoPremissa, Impacto } from "../../regras/premissas-rfp";
import { citacaoProvaOItem } from "../../pmo/redacao";
import { tirarAcentos } from "../../texto/normalizar";
import type { AnaliseRfp } from "./analisar-rfp";
import {
  montarLeituraRfp,
  SECOES_LEITURA,
  type ItemLeitura,
  type LeituraRfp,
  type SecaoLeitura,
} from "./leitura";
import { estadoDoItem } from "./revisao";

export type TravaPmo = "citacao-nao-conferida" | "citacao-fraca" | "valor-nao-conferido" | "conta-do-pmo";

/** Aviso que não conta como erro (decisão 0058): o trecho pode não provar a frase. */
export type AvisoPmo = "citacao-a-conferir";

export const NOME_AVISO: Record<AvisoPmo, string> = {
  "citacao-a-conferir":
    "aviso: citação a conferir — os trechos podem não trazer o termo-chave do item (data, número ou periodicidade)",
};

export const NOME_TRAVA: Record<TravaPmo, string> = {
  "citacao-nao-conferida": "citação não conferida — não vale como fato",
  "citacao-fraca":
    "citação fraca — o trecho é curto demais para provar o que o item diz; conferir no documento",
  "valor-nao-conferido": "valor não conferido — o número não está no trecho citado",
  "conta-do-pmo": "conta feita pelo PMO — conferir; as contas são do código",
};

export interface ItemPmoConferido {
  item: ItemLeituraRfpPmo;
  citacoes: ResultadoCitacao[];
  trava?: TravaPmo;
  /** Aviso que não conta como erro (decisão 0058). */
  aviso?: AvisoPmo;
  /** Números do texto que o código não achou nos trechos conferidos nem no esqueleto da mesma seção. */
  numerosSemFonte: string[];
  /** Números R citados pelo PMO que não existem no dossiê (tirados do item). */
  requisitosInexistentes: string[];
}

const normal = (t: string) => tirarAcentos(t).replace(/\s+/g, " ");

/**
 * Números que pedem fonte: tira só o que é referência, não valor (página, número R, PC, número de item, de
 * artigo ou de cláusula do edital). Contagens ("5 produtos", "12 parcelas") também pedem fonte.
 */
export function numerosQuePedemFonte(texto: string): string[] {
  const limpo = normal(texto)
    .replace(/\bp\. ?\d+(?:\s*(?:,|e|a)\s*\d+)*/g, " ")
    .replace(/\br\d{2}\b/g, " ")
    .replace(/\bpc\d\b/g, " ")
    // ids de itens e de meses citados pelo PMO ("AT-01", "UP-08", "M01", "(a1)", "a2, a3", "f14"): referência, não valor
    .replace(/\b[a-z]{1,2}-?\d{1,2}\b/g, " ")
    // número de norma ("Lei 14.133", "Lei nº 14.133/2021", "Decreto 10.024"): referência, não valor
    .replace(
      /\b(?:lei(?: complementar)?|lc|decreto(?:-lei)?|portaria|instrucao normativa|in|resolucao)(?: federal| estadual| municipal)? (?:n[º°o.]\s*)?\d[\d.]*(?:\/\d{2,4})?/gi,
      " ",
    )
    .replace(
      /\b(?:itens?|subitens?|clausulas?|art\.?|artigos?|anexos?|quadros?|tabelas?|incisos?|secao|secoes|etapas?) (?:n[º°o.]\s*)?[\d.]+[a-z]?(?:\s*(?:,|e)\s*[\d.]+)*/gi,
      " ",
    )
    // numeração da própria lista do PMO ("1) …; 2) …"): não é valor
    .replace(/(^|[\s;:(])\d{1,2}\)/g, "$1 ")
    // número de cláusula entre parênteses ou solto ("(7.12.2)", "6.7.8"): referência ao edital, não valor
    .replace(/\b\d{1,2}\.\d{1,2}\.\d{1,2}(?:\.\d{1,2})*\b/g, " ");
  return [...new Set((limpo.match(/\d[\d.,/]*\d|\d/g) ?? []).map((n) => n.replace(/[.,]$/, "")))];
}

/** O número está na base como número (não como pedaço de outro: "5" não vale por estar em "15" ou em "2025"). */
function temFonte(n: string, base: string): boolean {
  const escapado = n.replace(/[.*+?^${}()|[\]\\/]/g, (x) => `\\${x}`);
  if (new RegExp(`(?<![\\d.,])${escapado}(?![\\d]|[.,]\\d)`).test(base)) return true;
  // "200.000,00" no texto e "200000,00" ou "200.000" no edital
  const sem = n.replace(/\./g, "");
  if (
    sem.length >= 4 &&
    new RegExp(`(?<![\\d])${sem.replace(",", "[,.]?")}(?![\\d])`).test(base.replace(/(\d)\.(\d{3})/g, "$1$2"))
  )
    return true;
  // número de norma ("Portaria 757/2025" e "Portaria nº 757, de … de 2025"): o número e o ano, cada um no texto.
  // Data ("16/04/2025") não entra aqui: data que o documento não traz é conta, e conta é do código.
  const partes = n.split("/");
  return (
    partes.length === 2 &&
    (partes[1]?.length ?? 0) === 4 &&
    (partes[0]?.length ?? 0) >= 3 &&
    partes.every((x) => new RegExp(`(?<![\\d])${x.replace(/\./g, "\\.?")}(?![\\d])`).test(base))
  );
}

/**
 * Citação curta demais para provar uma afirmação: menos de 6 palavras com letras ("14.133/2021.", "conforme
 * anexos", "Lei nº"). O trecho existe na página, mas não sustenta o item.
 */
export function citacaoEhFraca(trecho: string): boolean {
  // datas e números contam como palavras: o princípio 3 manda trazer o número ou a data da afirmação
  // ("previsto para o período de 07/11/2026 a 06/01/2027" prova as datas)
  // toda palavra conta, inclusive a de uma letra ("e", "a"): "mínimo e atribuída pontuação com base" tem 6
  return (normal(trecho).match(/[a-z]+|\d[\d./,]*/gi) ?? []).length < 6;
}

/** Conta feita pelo PMO: soma, diferença, acumulado, "sobram", "no máximo X% até…". As contas são do código. */
const RE_CONTA =
  /\d\s*[+−–=]\s*\d|\(\s*\d+\s*%?\s*\+|\b(?:acumulad[oa]s?|somam|soma de|calculad[oa]|sobram|restam|faltam \d|no maximo \d{1,3}\s*%|d\+\d)/;

export function conferirLeituraRfp(
  r: RespostaLeituraRfp,
  documentos: DocumentoLido[],
  esqueleto: LeituraRfp,
  dossie: AnaliseRfpDossie,
  hoje = new Date(),
): ItemPmoConferido[] {
  // a data de hoje vai no pedido: o PMO pode citá-la
  const dataDeHoje = hoje.toLocaleDateString("pt-BR");
  // o número vale se está no trecho que o código conferiu ou no esqueleto da mesma seção (o que o código já leu)
  const esqueletoDaSecao = new Map<string, string>();
  for (const s of SECOES_LEITURA)
    esqueletoDaSecao.set(
      s.id,
      normal(
        esqueleto.itens
          .filter((i) => i.secao === s.id)
          .flatMap((i) => [i.texto, i.nota ?? "", i.origem?.trecho ?? "", ...(i.tabela?.linhas.flat() ?? [])])
          .join(" "),
      ),
    );
  // as contas do código que não estão numa seção (os cruzamentos X1 a X6: janela, folga, soma das parcelas) valem
  // para qualquer seção: são números do código, não do PMO (decisão 0046)
  const contasDosCruzamentos = normal(esqueleto.cruzamentos.map((c) => c.resultado).join(" "));
  // o esqueleto inteiro, só para reconhecer o item que repete uma conta do código ("(conta do código)")
  const esqueletoInteiro = [...esqueletoDaSecao.values(), contasDosCruzamentos].join(" ");
  const numeros = new Set(dossie.requisitos.map((x) => x.numero));
  // o texto de cada página, sem acento e com os espaços colapsados, para achar a vizinhança do trecho citado
  const paginas = new Map<number, string>();
  for (const d of documentos)
    for (const p of d.paginas) paginas.set(p.numero, `${paginas.get(p.numero) ?? ""} ${normal(p.texto)}`);
  /**
   * A vizinhança do trecho conferido (a cláusula em que ele está, até 400 caracteres de cada lado): o PMO cita um
   * pedaço e resume os números da mesma cláusula. A página inteira não vale (qualquer número passaria).
   */
  const vizinhanca = (f: { pagina: number; trecho: string }, pagina?: number) => {
    const texto = paginas.get(pagina ?? f.pagina) ?? "";
    const trecho = normal(f.trecho).replace(/…/g, " ").trim();
    // localiza pelo texto só de letras e números (como a conferência da citação): hífen de quebra, ligadura e
    // espaço não atrapalham; depois volta à posição no texto da página
    const posicoes: number[] = [];
    let compacto = "";
    for (let i = 0; i < texto.length; i++)
      if (/[a-z0-9]/.test(texto[i] ?? "")) {
        compacto += texto[i];
        posicoes.push(i);
      }
    const comeco = trecho.replace(/[^a-z0-9]/g, "").slice(0, 30);
    const k = comeco.length >= 12 ? compacto.indexOf(comeco) : -1;
    if (k < 0) return trecho;
    const ini = posicoes[k] ?? 0;
    return texto.slice(Math.max(0, ini - 400), ini + trecho.length + 400);
  };
  return r.itens.map((item) => {
    const citacoes = item.fontes.map((f) => conferirCitacao(f, documentos));
    const alguma = citacoes.some(citacaoValeComoFato);
    const base = [
      ...item.fontes
        .map((f, k) => ({ f, c: citacoes[k] }))
        .filter(({ c }) => c && citacaoValeComoFato(c))
        .map(({ f, c }) => vizinhanca(f, c?.pagina)),
      esqueletoDaSecao.get(item.secao) ?? "",
      contasDosCruzamentos,
      dataDeHoje,
    ].join(" ");
    // ano ("2025") e número de norma ou de edital ("13046/2026") valem se estão na página citada (são do
    // cabeçalho ou da abertura, longe do trecho); valor, prazo e quantidade, só na vizinhança do trecho
    const paginasCitadas = item.fontes.map((f) => paginas.get(f.pagina) ?? "").join(" ");
    // ano solto ("2025") também vale se o esqueleto o tem (item sem fonte, como os pontos que mais pesam)
    const ehReferencia = (n: string) => /^(?:19|20)\d{2}$/.test(n) || /^\d{3,6}\/(?:19|20)\d{2}$/.test(n);
    const ehAno = (n: string) => /^(?:19|20)\d{2}$/.test(n);
    // o item que diz "conta do código" e só usa números que o esqueleto já tem repete a conta, não a faz: os
    // números dele são do código, mesmo que estejam noutra seção do esqueleto
    const repeteContaDoCodigo =
      /conta do codigo/.test(normal(item.texto).toLowerCase()) &&
      numerosQuePedemFonte(item.texto).every((n) => temFonte(normal(n), esqueletoInteiro));
    const numerosSemFonte = repeteContaDoCodigo
      ? []
      : numerosQuePedemFonte(item.texto).filter(
          (n) =>
            !temFonte(normal(n), base) &&
            !(ehReferencia(n) && temFonte(normal(n), paginasCitadas)) &&
            !(ehAno(n) && temFonte(normal(n), esqueletoInteiro)),
        );
    // citação fraca (SKILL.md, princípio 3): todas as citações achadas são curtas demais para provar o que o item
    // afirma ("14.133/2021.", "conforme anexos")
    const fraca =
      alguma &&
      item.fontes.every(
        (f, k) => !citacoes[k] || !citacaoValeComoFato(citacoes[k]) || citacaoEhFraca(f.trecho),
      );
    const trava: TravaPmo | undefined =
      item.fontes.length && !alguma
        ? "citacao-nao-conferida"
        : item.rotulo === "documento" && !alguma
          ? "citacao-nao-conferida"
          : fraca
            ? "citacao-fraca"
            : RE_CONTA.test(normal(item.texto).toLowerCase()) && !repeteContaDoCodigo
              ? "conta-do-pmo"
              : numerosSemFonte.length
                ? "valor-nao-conferido"
                : undefined;
    // sem trava, o trecho tem de trazer o termo-chave: procurado em todos os trechos do item, sem os números e as
    // datas que vêm do esqueleto do código; é aviso, não erro (decisão 0058)
    const aviso: AvisoPmo | undefined =
      !trava &&
      item.rotulo === "documento" &&
      !citacaoProvaOItem(
        item.texto,
        item.fontes.map((f) => f.trecho),
        esqueletoInteiro,
      )
        ? "citacao-a-conferir"
        : undefined;
    return {
      item: { ...item, requisitos: item.requisitos.filter((x) => numeros.has(x)) },
      citacoes,
      trava,
      aviso,
      numerosSemFonte,
      requisitosInexistentes: item.requisitos.filter((x) => !numeros.has(x)),
    };
  });
}

/**
 * O item do PMO na forma da leitura: sempre Sugestão (decisão 0035), inclusive o que o PMO marcou como "decisão do
 * GP" (só o GP decide). A citação que o código achou na página fica marcada como conferida.
 */
function comoItemDaLeitura(c: ItemPmoConferido): ItemLeitura {
  const i = c.item;
  const k = c.citacoes.findIndex(citacaoValeComoFato);
  const fonte = i.fontes[k >= 0 ? k : 0];
  const conferida = k >= 0 ? c.citacoes[k] : undefined;
  const outras = i.fontes.filter((_, n) => n !== k).map((f) => f.pagina);
  return {
    id: `pmo:${i.id}`,
    secao: i.secao,
    rotulo: "sugestao",
    nome: i.nome,
    texto: i.texto,
    origem: fonte
      ? { documento: "RFP", pagina: conferida?.pagina ?? fonte.pagina, trecho: fonte.trecho }
      : undefined,
    situacao: "localizado",
    nota:
      [
        i.rotulo === "decisao_gp" ? "O PMO marcou como decisão do GP: a decidir pelo GP." : "",
        outras.length ? `Também nas p. ${[...new Set(outras)].join(", ")}.` : "",
        i.requisitos.length ? `Requisitos: ${i.requisitos.join(", ")}.` : "",
        c.requisitosInexistentes.length
          ? `O PMO citou ${c.requisitosInexistentes.join(", ")}, que não está na lista: tirado do item.`
          : "",
        c.numerosSemFonte.length ? `Números sem fonte no trecho: ${c.numerosSemFonte.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined,
    pergunta: i.pergunta || undefined,
    tema: i.tema || undefined,
    premissa: (i.premissa || undefined) as CodigoPremissa | undefined,
    porquePesa: i.porquePesa || undefined,
    impacto: i.impacto ? (Math.min(6, Math.max(1, i.impacto)) as Impacto) : undefined,
    doPmo: true,
    citacaoConferida: Boolean(conferida),
    trava: c.trava,
    aviso: c.aviso,
  };
}

/** As contas do código que valem mais que a do PMO sobre o mesmo assunto (por id, não pelo nome). */
const CONTAS_DO_CODIGO: Record<string, RegExp> = {
  "leitura:situacao": /\bsitua[cç][aã]o\b|datas? × hoje|datas x hoje/i,
};

/**
 * A leitura que a tela mostra com a resposta do PMO: em cada seção, os itens do PMO; os requisitos numerados (que
 * só o código e o GP mexem) e as contas do código ficam; o resto do esqueleto vai para "o que o código leu nesta
 * seção", recolhido. O item do PMO que repete uma conta do código também vai para os recolhidos (nunca some).
 */
export function combinarLeitura(esqueleto: LeituraRfp, conferidos: ItemPmoConferido[]): LeituraRfp {
  const doPmo = conferidos.map(comoItemDaLeitura);
  const itens: ItemLeitura[] = [];
  const doCodigo: LeituraRfp["doCodigo"] = {};
  for (const s of SECOES_LEITURA) {
    const pmo = doPmo.filter((i) => i.secao === s.id);
    const codigo = esqueleto.itens.filter((i) => i.secao === s.id);
    if (!pmo.length) {
      itens.push(...codigo);
      continue;
    }
    // ficam os requisitos numerados e as contas do código; nos pontos de atenção, a conta (o caixa concentrado)
    // foi no esqueleto e o PMO a usa no ponto dele: não repete
    const ficam = codigo.filter(
      (i) => i.numero || (i.situacao === "calculado" && s.id !== "atencao") || i.rotulo === "decisao-gp",
    );
    const contas = ficam.filter((i) => CONTAS_DO_CODIGO[i.id]);
    const repeteConta = (i: ItemLeitura) => contas.some((c) => CONTAS_DO_CODIGO[c.id]?.test(i.nome));
    const doPmoNaSecao = pmo.filter((i) => !repeteConta(i));
    const ordenados =
      s.id === "atencao"
        ? [...doPmoNaSecao].sort((a, b) => (a.impacto ?? 6) - (b.impacto ?? 6))
        : doPmoNaSecao;
    itens.push(
      ...ficam.filter((i) => i.situacao === "calculado"),
      ...ordenados,
      ...ficam.filter((i) => i.situacao !== "calculado"),
    );
    const recolhidos = [
      ...codigo.filter((i) => !ficam.includes(i)),
      ...pmo
        .filter(repeteConta)
        .map((i) => ({ ...i, nota: `Do PMO; vale a conta do código. ${i.nota ?? ""}`.trim() })),
    ];
    if (recolhidos.length) doCodigo[s.id as SecaoLeitura] = recolhidos;
  }
  return { ...esqueleto, itens, doCodigo, fonte: "pmo" };
}

// ---------------------------------------------------------------------------------------------------------------

const REGRAS = `Regras deste pedido (além da skill e do método):
- Responda só com o objeto JSON, no schema enviado.
- Monte a leitura nas 8 seções do método, na ordem, com 30 a 50 itens nas seções 1 a 7. Cada item passa no teste do método: muda uma decisão do gerente ou algo que a FGV terá de fazer, entregar, cumprir ou pagar.
- Parta do esqueleto do código (abaixo): ele já tem páginas, números, datas, contas, a lista de documentos e os números R. Corrija o que ele leu errado, junte o que está espalhado, cruze trechos distantes e acrescente o que a regra não pega (obrigações em texto corrido, condições de pagamento, dependências do contratante).
- Não faça contas: datas × hoje, somas e o caixa vêm do esqueleto. Se precisar de uma conta que não está lá, diga o que conferir.
- Cada item "documento" tem pelo menos uma fonte: doc "rfp", página do arquivo e trecho literal de uma página só (o app procura cada trecho; o que não achar vira "citação não conferida"). Todo número do texto precisa estar num trecho citado ou no esqueleto; senão o app marca "valor não conferido".
- Números R: use só os do esqueleto, no campo requisitos. Requisito novo é sugestão (rotulo "sugestao", requisitos vazio); o GP decide se vira R.
- Seção 7: premissa (PC1 a PC8 do checklist.md, ou ""), porquePesa, pergunta em redação condicional e impacto (1 = mais pesa: caixa, dependência do contratante, preço, prazo, escopo). Termine com um item das proteções que o texto dá à contratada, se houver.
- Nas outras seções, premissa "", porquePesa "", pergunta "" e impacto 0.
- Nada inventado: o que o documento não diz fica "não informado no documento — a definir pelo GP". Sem nomes de pessoas.
- Cruzamentos (decisão 0046): registre X1 a X6 em "cruzamentos", cada um "feito" (resultado: "confere", "diverge: …" ou "em aberto: …") ou "nao_se_aplica" (com o motivo), partindo do que o código já contou (abaixo). O que diverge vira item da seção 7, e o id dele vai em "itens". Em X3, confira antes se o próprio documento já diz quem executa.
- Autoconferência (decisão 0044): em "autoconferencia", marque cada uma das 8 seções do método ("etapa-1:secao-1" a "etapa-1:secao-8") como "presente" (onde: o id de um item), "dispensado" (motivo) ou "decisao_gp" (motivo). Nenhuma seção sem marca.
- O trecho citado tem de provar o que o item afirma (número, data ou termo-chave); trecho com menos de 6 palavras vira "citação fraca".`;

function linhaDoEsqueleto(i: ItemLeitura): string {
  const onde = i.origem ? ` (p. ${i.origem.pagina})` : "";
  const tabela = i.tabela?.linhas.length
    ? `\n    ${i.tabela.linhas.map((l) => l.join(" | ")).join("\n    ")}`
    : "";
  return `- ${i.numero ? `${i.numero} · ` : ""}${i.nome}${onde}: ${i.texto}${tabela}`;
}

export function pedidoLeituraRfp(esqueleto: LeituraRfp, hoje = new Date()): string {
  const secoes = SECOES_LEITURA.map((s) => {
    const itens = esqueleto.itens.filter((i) => i.secao === s.id);
    const falta = esqueleto.naoLocalizados[s.id];
    return `### ${s.titulo} (secao: ${s.id})\n${itens.map(linhaDoEsqueleto).join("\n") || "- nada"}${
      falta?.length ? `\n- não localizado pelo código: ${falta.join("; ")}` : ""
    }`;
  });
  return `# Etapa 1 — Leitura da RFP pelo PMO

Hoje: ${hoje.toLocaleDateString("pt-BR")}. ${
    esqueleto.modalidade === "nao-identificada"
      ? "Modalidade: não identificada no documento — confirmar com o GP. O código não supõe licitação. Escreva as seções 5 (como é escolhida e o que entregar), 6 (habilitação) e 8 (o que não se aplica) com as alternativas — licitação, contratação direta (inexigibilidade ou dispensa) e parceria —, dizendo o que muda em cada uma, como sugestão."
      : `Modalidade reconhecida pelo código: ${esqueleto.modalidade}.`
  }

## Método da etapa 1 (a regra desta leitura)
<metodo>
${textoMetodo.trim()}
</metodo>

## Esqueleto do código (páginas, números, contas e números R já conferidos)
${secoes.join("\n\n")}

## Cruzamentos que o código já fez (X1 a X6; você completa e registra)
${esqueleto.cruzamentos.map((c) => `- ${c.codigo} · ${c.nome} [${c.estado}; quem: ${c.quem}]: ${c.resultado}`).join("\n") || "- nenhum"}

${REGRAS}`;
}

/**
 * A leitura que vale para o dossiê: sem a leitura do PMO, o esqueleto do código (é o que vai no pedido; a tela só mostra a leitura depois do PMO, decisão 0037);
 * com ela, os itens do PMO conferidos pelo código, com os requisitos e as contas do esqueleto.
 */
export function leituraDoDossie(
  analise: AnaliseRfp,
  dossie: AnaliseRfpDossie,
  documentos: DocumentoLido[],
  hoje = new Date(),
): LeituraRfp {
  const esqueleto = montarLeituraRfp(analise, dossie, hoje);
  if (!dossie.leituraPmo) return esqueleto;
  const docs = documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
  return combinarLeitura(
    esqueleto,
    conferirLeituraRfp(dossie.leituraPmo.resposta, docs, esqueleto, dossie, hoje),
  );
}

/** O que o GP revisa na etapa 1: os itens da leitura (os requisitos numerados entre eles). */
export function itensRevisaveis(leitura: LeituraRfp): ItemLeitura[] {
  return leitura.itens.filter((i) => i.secao !== "nao-se-aplica");
}

export function contarPendentesDaLeitura(leitura: LeituraRfp, dossie: AnaliseRfpDossie): number {
  return itensRevisaveis(leitura).filter((i) => estadoDoItem(dossie.revisoes, i.id) === "pendente").length;
}

/** As 8 seções do método, como o PMO as marca na autoconferência (decisão 0044). */
export const SECOES_AUTOCONFERENCIA_ETAPA_1 = SECOES_LEITURA.map((_, k) => `etapa-1:secao-${k + 1}`);

/** Autoconferência da leitura do PMO: seções sem marca e cruzamentos X1 a X6 sem registro (decisões 0044 e 0046). */
export function autoconferenciaDaLeitura(
  r: RespostaLeituraRfp,
): ResultadoAutoconferencia & { cruzamentosSemRegistro: string[] } {
  return {
    ...conferirAutoconferencia(SECOES_AUTOCONFERENCIA_ETAPA_1, r.autoconferencia),
    cruzamentosSemRegistro: cruzamentosSemRegistro(r.cruzamentos),
  };
}
