// Etapa 1, leitura do PMO (decisões 0032 e 0035): o PMO lê a RFP na estrutura do método, a partir do esqueleto do
// código; o código confere depois. Travas:
// - toda citação é procurada na página indicada; item "Do documento" sem citação conferida vira sugestão, e
//   item com citação que não é achada fica "citação não conferida" (nunca aparece como fato);
// - todo número do texto é relido nos trechos citados, nas páginas deles e no esqueleto; o que não está lá deixa o
//   item "valor não conferido";
// - número R que não está na lista do dossiê é tirado do item (o PMO não cria requisito);
// - as contas (datas × hoje, soma das parcelas, caixa) continuam do código: os itens calculados do esqueleto ficam.
import textoMetodo from "../../../docs/estudos/metodo-etapa-1.md?raw";
import type { AnaliseRfpDossie, DocumentoLido, Rotulo } from "../../dossie/esquema";
import { citacaoValeComoFato, conferirCitacao, type ResultadoCitacao } from "../../pmo/citacoes";
import type { ItemLeituraRfpPmo, RespostaLeituraRfp } from "../../pmo/schemas/leitura-rfp";
import type { CodigoPremissa, Impacto } from "../../regras/premissas-rfp";
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

export type TravaPmo = "citacao-nao-conferida" | "valor-nao-conferido";

export const NOME_TRAVA: Record<TravaPmo, string> = {
  "citacao-nao-conferida": "citação não conferida — não vale como fato",
  "valor-nao-conferido": "valor não conferido — o número não está no trecho citado",
};

export interface ItemPmoConferido {
  item: ItemLeituraRfpPmo;
  citacoes: ResultadoCitacao[];
  trava?: TravaPmo;
  /** Números do texto que o código não achou nos trechos, nas páginas citadas nem no esqueleto. */
  numerosSemFonte: string[];
  /** Números R citados pelo PMO que não existem no dossiê (tirados do item). */
  requisitosInexistentes: string[];
}

const normal = (t: string) => tirarAcentos(t).replace(/\s+/g, " ");

/** Números que pedem fonte: tira páginas, números R, PC, itens do edital ("item 6.7.8") e contagens. */
export function numerosQuePedemFonte(texto: string): string[] {
  const limpo = normal(texto)
    .replace(/\bp\. ?\d+(?:\s*(?:,|e|a)\s*\d+)*/g, " ")
    .replace(/\br\d{2}\b/g, " ")
    .replace(/\bpc\d\b/g, " ")
    .replace(
      /\b(?:itens?|subitens?|clausulas?|art\.?|artigos?|anexos?|quadros?|tabelas?|criterios?) (?:n[º°o.]\s*)?[\d.]+[a-z]?(?:\s*(?:,|e)\s*[\d.]+)*/g,
      " ",
    )
    .replace(
      /\b\d{1,3} (?:obrigac\w+|criterios?|parcelas|documentos|trechos|pontos que|normas|perfis?|produtos?|itens|linhas)\b/g,
      " ",
    )
    // número de cláusula entre parênteses ou solto ("(7.12.2)", "6.7.8"): referência ao edital, não valor
    .replace(/\b\d{1,2}\.\d{1,2}\.\d{1,2}(?:\.\d{1,2})*\b/g, " ");
  return [...new Set((limpo.match(/\d[\d.,/]*\d|\d/g) ?? []).map((n) => n.replace(/[.,]$/, "")))];
}

function temFonte(n: string, base: string): boolean {
  if (base.includes(n)) return true;
  const digitos = n.replace(/[^0-9]/g, "");
  // "200.000,00" no texto e "200.000" no edital
  if (digitos.length >= 2 && base.replace(/[.\s]/g, "").includes(n.replace(/[.\s]/g, ""))) return true;
  // número de norma ("Portaria 757/2025" e "Portaria nº 757, de … de 2025"): o número e o ano, cada um no texto.
  // Data ("16/04/2025") não entra aqui: data que o documento não traz é conta, e conta é do código.
  const partes = n.split("/");
  return (
    partes.length === 2 &&
    (partes[1]?.length ?? 0) === 4 &&
    (partes[0]?.length ?? 0) >= 3 &&
    partes.every((x) => new RegExp(`\\b${x.replace(/\./g, "\\.?")}\\b`).test(base))
  );
}

export function conferirLeituraRfp(
  r: RespostaLeituraRfp,
  documentos: DocumentoLido[],
  esqueleto: LeituraRfp,
  dossie: AnaliseRfpDossie,
  hoje = new Date(),
): ItemPmoConferido[] {
  // a data de hoje vai no pedido: o PMO pode citá-la
  const dataDeHoje = hoje.toLocaleDateString("pt-BR");
  const paginas = new Map<number, string>();
  for (const d of documentos)
    for (const p of d.paginas) paginas.set(p.numero, `${paginas.get(p.numero) ?? ""} ${normal(p.texto)}`);
  const doEsqueleto = normal(
    esqueleto.itens
      .flatMap((i) => [i.texto, i.origem?.trecho ?? "", ...(i.tabela?.linhas.flat() ?? [])])
      .join(" "),
  );
  const numeros = new Set(dossie.requisitos.map((x) => x.numero));
  return r.itens.map((item) => {
    const citacoes = item.fontes.map((f) => conferirCitacao(f, documentos));
    const alguma = citacoes.some(citacaoValeComoFato);
    const base = [
      ...item.fontes.map((f) => normal(f.trecho)),
      ...item.fontes.map((f) => paginas.get(f.pagina) ?? ""),
      doEsqueleto,
      dataDeHoje,
    ].join(" ");
    const numerosSemFonte = numerosQuePedemFonte(item.texto).filter((n) => !temFonte(normal(n), base));
    const trava: TravaPmo | undefined =
      item.fontes.length && !alguma
        ? "citacao-nao-conferida"
        : item.rotulo === "documento" && !alguma
          ? "citacao-nao-conferida"
          : numerosSemFonte.length
            ? "valor-nao-conferido"
            : undefined;
    return {
      item: { ...item, requisitos: item.requisitos.filter((x) => numeros.has(x)) },
      citacoes,
      trava,
      numerosSemFonte,
      requisitosInexistentes: item.requisitos.filter((x) => !numeros.has(x)),
    };
  });
}

const ROTULO: Record<ItemLeituraRfpPmo["rotulo"], Rotulo> = {
  documento: "documento",
  sugestao: "sugestao",
  decisao_gp: "decisao-gp",
};

/** O item do PMO na forma da leitura: "Do documento" só com citação conferida; o resto é Sugestão. */
function comoItemDaLeitura(c: ItemPmoConferido): ItemLeitura {
  const i = c.item;
  const k = c.citacoes.findIndex(citacaoValeComoFato);
  const fonte = i.fontes[k >= 0 ? k : 0];
  const conferida = k >= 0 ? c.citacoes[k] : undefined;
  const rotulo: Rotulo = i.rotulo === "documento" && (!conferida || c.trava) ? "sugestao" : ROTULO[i.rotulo];
  const outras = i.fontes.filter((_, n) => n !== k).map((f) => f.pagina);
  return {
    id: `pmo:${i.id}`,
    secao: i.secao,
    rotulo,
    nome: i.nome,
    texto: i.texto,
    origem: fonte
      ? { documento: "RFP", pagina: conferida?.pagina ?? fonte.pagina, trecho: fonte.trecho }
      : undefined,
    situacao: "localizado",
    nota:
      [
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
    trava: c.trava,
  };
}

/**
 * A leitura que a tela mostra com a resposta do PMO: em cada seção, os itens do PMO; os requisitos numerados (que
 * só o código e o GP mexem) e as contas do código ficam; o resto do esqueleto vai para "o que o código leu nesta
 * seção", recolhido.
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
    // a conta do código vale mais que a do PMO: o item do PMO com o mesmo assunto sai ("Situação (datas × hoje)")
    const assunto = (n: string) =>
      tirarAcentos(n)
        .replace(/\(.*\)/g, "")
        .trim()
        .split(/\s+/)[0] ?? "";
    const contas = new Set(ficam.filter((i) => i.situacao === "calculado").map((i) => assunto(i.nome)));
    const doPmoNaSecao = pmo.filter((i) => !contas.has(assunto(i.nome)));
    const ordenados =
      s.id === "atencao"
        ? [...doPmoNaSecao].sort((a, b) => (a.impacto ?? 6) - (b.impacto ?? 6))
        : doPmoNaSecao;
    itens.push(
      ...ficam.filter((i) => i.situacao === "calculado"),
      ...ordenados,
      ...ficam.filter((i) => i.situacao !== "calculado"),
    );
    const recolhidos = codigo.filter((i) => !ficam.includes(i));
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
- Nada inventado: o que o documento não diz fica "não informado no documento — a definir pelo GP". Sem nomes de pessoas.`;

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

Hoje: ${hoje.toLocaleDateString("pt-BR")}. Modalidade reconhecida pelo código: ${esqueleto.modalidade}.

## Método da etapa 1 (a regra desta leitura)
<metodo>
${textoMetodo.trim()}
</metodo>

## Esqueleto do código (páginas, números, contas e números R já conferidos)
${secoes.join("\n\n")}

${REGRAS}`;
}

/**
 * A leitura que vale para o dossiê: sem a leitura do PMO, o esqueleto do código ("leitura parcial por código");
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
