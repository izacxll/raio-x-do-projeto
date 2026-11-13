// Quadro de prazos da RFP (etapa 1, passo 4): do certame (esclarecimentos, impugnação, entrega da proposta,
// sessão) e da execução (vigência, prazo de execução, validade da proposta, assinatura), com a forma de
// contagem que o documento usa e o alerta para o que está perto. As contas de data são feitas por código.
import { normalizarTermo } from "../../regras/busca";
import { diasEntre, encontrarDatas, formatarData, lerNumero, somarDiasUteis } from "../../texto/datas";
import { fraseEmVolta, limparEspacos } from "../../texto/frase";
import { tirarAcentos } from "../../texto/normalizar";
import { itemSemAchado, type DocumentoRfp, type ItemAnalise } from "./item";
import { localizarTodos, origemDe, type Localizado } from "./localizar";
import { faixasDoTema, type MapaRfp } from "./mapa";

export type EventoCertame =
  "publicacao" | "esclarecimento" | "entrega" | "sessao" | "resultado" | "recursos" | "celebracao";

export const NOME_EVENTO: Record<EventoCertame, string> = {
  publicacao: "Publicação do edital",
  esclarecimento: "Esclarecimentos e impugnação",
  entrega: "Entrega das propostas",
  sessao: "Sessão pública / abertura",
  resultado: "Resultado",
  recursos: "Recursos",
  celebracao: "Assinatura ou celebração",
};

/** Ordem importa: o primeiro evento que casa com o contexto da data fica. Sobre texto sem acento. */
const EVENTOS: [EventoCertame, RegExp][] = [
  ["esclarecimento", /esclarecimento|impugna/],
  ["recursos", /recurso|contrarraz/],
  ["resultado", /resultado|homologa|classificacao final|adjudica/],
  [
    "entrega",
    /recebimento d[aeo]s? (?:propostas|envelopes)|envio d[aeo]s? propostas|entrega d[aeo]s? (?:propostas|envelopes)|apresentacao d[aeo]s? propostas|cadastramento d[aeo]s? propostas|inscric/,
  ],
  [
    "sessao",
    /sessao publica|data da sessao|abertura|disputa|inicio d[ao] (?:julgamento|sessao)|realizacao do certame/,
  ],
  ["publicacao", /publicacao do edital|publicacao do (?:aviso|chamamento)/],
  ["celebracao", /celebracao|assinatura do (?:termo|contrato)|formalizacao/],
];

/** Data dentro de citação de norma ("Lei nº 13.019, de 31 de julho de 2014") não é prazo. */
const RE_NORMA_ANTES =
  /(?:lei|decreto|portaria|instrucao normativa|resolucao|n[o°º.]*\s*[\d./-]+,?)\s*(?:de\s*)?$/;
/** Data de assinatura eletrônica, de atualização do sistema ou de rodapé não é prazo. */
const RE_CARIMBO =
  /assinad[oa]|assinou|assinatura eletronica|editado por|atualizado em|horario oficial|sei\/|documento gerado/;
/** Local e data de assinatura do documento ("Luiz Alves/SC, 18 de julho de 2026."). */
const RE_LOCAL_E_DATA =
  /^[A-ZÀ-Ý][\wÀ-ÿ /'-]{2,50},\s*(?:em\s+)?\d{1,2}º?\s+de\s+[A-Za-zçÇ]+\s+de\s+\d{4}\.?$/;

export interface DataDoCertame {
  evento: EventoCertame;
  data: Date;
  hora?: string;
  doc: DocumentoRfp;
  pagina: number;
  posicao: number;
  frase: string;
  /** "início" ou "fim", quando a mesma linha traz um período ("das 8h do dia X até as 8h do dia Y"). */
  marco?: "início" | "fim";
}

function horaPerto(trecho: string): string | undefined {
  const m = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?(?:\s*min)?/.exec(trecho);
  if (!m?.[1] || Number(m[1]) > 23) return undefined;
  return `${m[1].padStart(2, "0")}:${m[2] ?? "00"}`;
}

export function datasDoCertame(docs: DocumentoRfp[]): DataDoCertame[] {
  const out: DataDoCertame[] = [];
  for (const doc of docs) {
    for (const p of doc.paginas) {
      if (p.origem === "nao-verificavel") continue;
      const linhas = p.texto.split("\n");
      const inicios: number[] = [];
      let pos = 0;
      for (const l of linhas) {
        inicios.push(pos);
        pos += l.length + 1;
      }
      for (const d of encontrarDatas(p.texto)) {
        const i = inicios.findLastIndex((ini) => ini <= d.posicao);
        const linha = linhas[i] ?? "";
        const semAcento = (t: string) => tirarAcentos(t);
        const antes = semAcento(p.texto.slice(Math.max(0, d.posicao - 50), d.posicao));
        if (RE_NORMA_ANTES.test(antes)) continue;
        const contextoLinha = semAcento(linha);
        if (RE_CARIMBO.test(contextoLinha) || RE_LOCAL_E_DATA.test(linha.trim())) continue;
        // o rótulo pode estar na linha de cima ("DATA DA SESSÃO PÚBLICA:" / "Dia 23/10/2026") ou, numa tabela
        // de cronograma, na de baixo ("26/03/2026 a" / "2 Envio das propostas… 26/04/2026")
        const letrasNaLinha = (linha.replace(/\d|\//g, "").match(/[a-zà-ú]{3,}/gi) ?? []).length;
        const comecaPeriodo = /\d\s+a\s*$/.test(linha.trim());
        const terminaPeriodo = /\d\s+a\s*$/.test((linhas[i - 1] ?? "").trim());
        const contextos = [contextoLinha];
        if (comecaPeriodo) contextos.push(semAcento(linhas[i + 1] ?? ""));
        else if (letrasNaLinha <= 6)
          contextos.push(semAcento(linhas[i - 1] ?? ""), semAcento(linhas[i + 1] ?? ""));
        let evento: EventoCertame | undefined;
        contextos.forEach((ctx, k) => {
          if (evento) return;
          // assinatura e publicação só valem na própria linha: na linha vizinha, costumam ser outro assunto
          evento = EVENTOS.find(
            ([e, re]) => (k === 0 || (e !== "celebracao" && e !== "publicacao")) && re.test(ctx),
          )?.[0];
        });
        if (!evento) continue;
        const datasNaLinha = encontrarDatas(linha);
        const periodo = datasNaLinha.length === 2 && /\bate\b|\ba\b/.test(contextoLinha);
        const marco = comecaPeriodo
          ? "início"
          : terminaPeriodo
            ? "fim"
            : periodo
              ? datasNaLinha[0]?.posicao === d.posicao - (inicios[i] ?? 0)
                ? "início"
                : "fim"
              : undefined;
        out.push({
          evento,
          data: d.data,
          hora: horaPerto(p.texto.slice(Math.max(0, d.posicao - 30), d.posicao + d.tamanho + 25)),
          doc,
          pagina: p.numero,
          posicao: d.posicao,
          frase: limparEspacos(
            comecaPeriodo
              ? [linha, linhas[i + 1] ?? ""].join(" ")
              : [linhas[i - 1] && letrasNaLinha <= 6 ? linhas[i - 1] : "", linha].join(" "),
          ).slice(0, 300),
          marco,
        });
      }
    }
  }
  // a mesma data do mesmo evento aparece em várias páginas: fica a primeira
  const vistos = new Set<string>();
  return out.filter((d) => {
    const chave = `${d.evento}:${formatarData(d.data)}:${d.marco ?? ""}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

export function alertaDaData(data: Date, hoje: Date): { texto: string; perto: boolean; passou: boolean } {
  const n = diasEntre(hoje, data);
  if (n < 0)
    return { texto: `já passou (há ${-n} ${-n === 1 ? "dia" : "dias"})`, perto: false, passou: true };
  if (n === 0) return { texto: "é hoje", perto: true, passou: false };
  return { texto: `faltam ${n} ${n === 1 ? "dia" : "dias"} corridos`, perto: n <= 7, passou: false };
}

export interface PrazoRelativo {
  dias: number;
  contagem: "úteis" | "corridos" | "não informada";
  base: string;
  loc: Localizado;
}

const RE_RELATIVO =
  /\bate\s+(?:o\s+)?(\d{1,2}|um|dois|tres|quatro|cinco|seis|sete|oito|nove|dez|primeiro|segundo|terceiro|quarto|quinto)\s*(?:\(\s*[a-z]+\s*\)\s*)?(?:dias?|dia)\s*(uteis|util|corridos)?\s*(?:antes|anteriores?|anterior|que antecede[m]?)\s+(?:a|da|ao|do)\s+(data|abertura|sessao|recebimento|realizacao)/g;

const ORDINAIS: Record<string, number> = { primeiro: 1, segundo: 2, terceiro: 3, quarto: 4, quinto: 5 };

/** "Até 3 dias úteis antes da data fixada para a abertura", dentro de frase de esclarecimento ou impugnação. */
export function prazosDeEsclarecimento(docs: DocumentoRfp[], mapa: MapaRfp): PrazoRelativo[] {
  const out: PrazoRelativo[] = [];
  const faixas = faixasDoTema(mapa, "esclarecimento");
  const candidatos = localizarTodos(docs, RE_RELATIVO);
  for (const l of candidatos) {
    const naSecao = faixas?.get(l.doc.id)?.has(l.pagina) ?? false;
    if (!naSecao && !/esclarecimento|impugna/i.test(tirarAcentos(l.frase))) continue;
    const m = new RegExp(RE_RELATIVO.source).exec(l.termo);
    if (!m?.[1]) continue;
    const dias = ORDINAIS[m[1]] ?? lerNumero(m[1]);
    if (!dias) continue;
    const contagem =
      /util|uteis/.test(m[2] ?? "") || /dia util/.test(l.termo)
        ? "úteis"
        : m[2] === "corridos"
          ? "corridos"
          : "não informada";
    out.push({ dias, contagem, base: m[3] ?? "data", loc: l });
  }
  return out;
}

export type TipoPrazoExecucao = "vigencia" | "execucao" | "validade" | "assinatura" | "inicio";

export const NOME_PRAZO_EXECUCAO: Record<TipoPrazoExecucao, string> = {
  vigencia: "Vigência",
  execucao: "Prazo de execução",
  validade: "Validade da proposta",
  assinatura: "Prazo para assinar o contrato",
  inicio: "Início da execução",
};

const NUM = String.raw`(\d{1,3})\s*(?:\(\s*[a-z ]{2,30}\)\s*)?`;
const RE_EXECUCAO: [TipoPrazoExecucao, RegExp][] = [
  // sem vírgula entre "vigência" e o número: "prorrogação de sua vigência, a garantia… 10 dias" é outra coisa
  ["vigencia", new RegExp(String.raw`\bvigencia\b[^.;,]{0,90}?\b${NUM}(meses|mes|dias|anos?)\b`, "g")],
  [
    "execucao",
    new RegExp(
      String.raw`\bprazo (?:total )?(?:de|para a) (?:execucao|prestacao|conclusao)\b[^.;]{0,90}?\b${NUM}(meses|mes|dias|anos?)\b`,
      "g",
    ),
  ],
  [
    "validade",
    new RegExp(
      String.raw`\bvalidade (?:minima )?d[ae] (?:sua |cada )?propostas?\b[^.;]{0,90}?\b${NUM}(dias|meses)\b`,
      "g",
    ),
  ],
  [
    "assinatura",
    new RegExp(
      String.raw`\b(?:assinar|assinatura d[eo]|retirar|aceitar)\b[^.;]{0,40}\b(?:contrato|termo|ata|instrumento)\b[^.;]{0,90}?\b${NUM}dias\b`,
      "g",
    ),
  ],
  [
    "inicio",
    /\b(?:inicio|iniciar|iniciados?)\b[^.;]{0,40}\b(?:execucao|servicos|atividades|vigencia)\b[^.;]{0,60}?\b(?:a partir d[aeo]|contad[oa]s? d[aeo]|apos (?:a|o))\s+(?:data d[aeo]\s+)?(assinatura|ordem de servico|publicacao|emissao|recebimento|celebracao)/g,
  ],
];

export interface PrazoExecucao {
  tipo: TipoPrazoExecucao;
  valor: string;
  contagem: string;
  loc: Localizado;
}

export function prazosDeExecucao(docs: DocumentoRfp[]): PrazoExecucao[] {
  const out: PrazoExecucao[] = [];
  for (const [tipo, re] of RE_EXECUCAO) {
    for (const l of localizarTodos(docs, re)) {
      const m = new RegExp(re.source).exec(l.termo);
      if (!m) continue;
      if (tipo === "inicio") {
        out.push({ tipo, valor: `a partir de: ${m[1]}`, contagem: "—", loc: l });
        continue;
      }
      const n = Number(m[1]);
      if (!n) continue;
      const unidade = (m[2] ?? "dias").replace(/^mes$/, "meses").replace(/^ano$/, "anos");
      const resto = normalizarTermo(
        fraseEmVolta(l.doc.paginas.find((p) => p.numero === l.pagina)?.texto ?? "", l.posicao),
      );
      const contagem =
        unidade !== "dias"
          ? unidade
          : /dias?\s+uteis/.test(l.termo) || /\d+\s*(?:\([^)]*\)\s*)?dias? uteis/.test(resto)
            ? "dias úteis"
            : /dias?\s+corridos/.test(l.termo) || /dias? corridos/.test(resto)
              ? "dias corridos"
              : "dias (contagem não informada no trecho)";
      out.push({ tipo, valor: `${n} ${unidade}`, contagem, loc: l });
    }
  }
  return out;
}

export function extrairPrazos(docs: DocumentoRfp[], mapa: MapaRfp, hoje: Date): ItemAnalise[] {
  const itens: ItemAnalise[] = [];
  const datas = datasDoCertame(docs);
  for (const d of datas) {
    const alerta = alertaDaData(d.data, hoje);
    const nome = `${NOME_EVENTO[d.evento]}${d.marco ? ` (${d.marco})` : ""}`;
    itens.push({
      id: `prazos:certame:${d.evento}:${formatarData(d.data)}:${d.marco ?? ""}`,
      secao: "prazos",
      rotulo: "documento",
      nome,
      texto: `${formatarData(d.data)}${d.hora ? ` às ${d.hora}` : ""}`,
      campos: { Momento: "certame", Contagem: "data fixa", Alerta: alerta.texto },
      origem: { documento: d.doc.rotulo, pagina: d.pagina, trecho: d.frase },
      situacao: "localizado",
    });
  }

  // prazo de esclarecimento e impugnação, contado da sessão (ou da entrega das propostas)
  const sessao =
    datas.find((d) => d.evento === "sessao") ??
    datas.find((d) => d.evento === "entrega" && d.marco !== "início");
  const relativos = prazosDeEsclarecimento(docs, mapa);
  const vistos = new Set<string>();
  for (const r of relativos) {
    const chave = `${r.dias}:${r.contagem}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    let texto = `até ${r.dias} ${r.dias === 1 ? "dia" : "dias"}${r.contagem === "não informada" ? "" : ` ${r.contagem}`} antes da ${r.base === "data" ? "data de abertura" : r.base}`;
    let nota = "Sem a data da sessão, o código não calcula a data limite.";
    const campos: Record<string, string> = {
      Momento: "certame",
      Contagem: r.contagem === "não informada" ? "não informada no trecho" : `dias ${r.contagem}`,
    };
    let situacao: ItemAnalise["situacao"] = "localizado";
    if (sessao) {
      const limite =
        r.contagem === "corridos"
          ? new Date(sessao.data.getFullYear(), sessao.data.getMonth(), sessao.data.getDate() - r.dias)
          : somarDiasUteis(sessao.data, -r.dias);
      const alerta = alertaDaData(limite, hoje);
      texto += `: ${formatarData(limite)} (calculado pelo código)`;
      campos.Alerta = alerta.texto;
      situacao = "calculado";
      nota = `Conta do código: ${r.dias} ${r.contagem === "corridos" ? "dias corridos" : "dias úteis"} antes de ${formatarData(sessao.data)} (${NOME_EVENTO[sessao.evento].toLowerCase()}, ${sessao.doc.rotulo}, p. ${sessao.pagina}). ${r.contagem === "corridos" ? "" : "Só sábados e domingos foram descontados: conferir feriados. "}A forma de contar (se o dia da sessão entra) deve ser conferida no documento.`;
    }
    itens.push({
      id: `prazos:esclarecimento:${chave}`,
      secao: "prazos",
      rotulo: "documento",
      nome: "Limite para esclarecimentos e impugnação",
      texto,
      campos,
      origem: origemDe(r.loc),
      situacao,
      nota,
    });
  }

  // prazos da execução: um item por tipo e valor distinto
  const execucao = prazosDeExecucao(docs);
  const distintos = new Map<string, PrazoExecucao>();
  for (const p of execucao) {
    const chave = `${p.tipo}:${p.valor}`;
    if (!distintos.has(chave)) distintos.set(chave, p);
  }
  for (const [chave, p] of distintos) {
    itens.push({
      id: `prazos:execucao:${chave}`,
      secao: "prazos",
      rotulo: "documento",
      nome: NOME_PRAZO_EXECUCAO[p.tipo],
      texto: p.valor,
      campos: { Momento: "execução", Contagem: p.contagem },
      origem: origemDe(p.loc),
      situacao: "localizado",
    });
  }

  for (const [evento, nome] of [
    ["sessao", NOME_EVENTO.sessao],
    ["esclarecimento", "Limite para esclarecimentos e impugnação"],
  ] as const) {
    const tem = itens.some(
      (i) => i.id.startsWith(`prazos:certame:${evento}`) || i.id.startsWith(`prazos:${evento}`),
    );
    if (!tem)
      itens.push(
        itemSemAchado(docs, {
          id: `prazos:sem:${evento}`,
          secao: "prazos",
          nome,
          campos: { Momento: "certame" },
        }),
      );
  }
  if (!distintos.size)
    itens.push(
      itemSemAchado(docs, {
        id: "prazos:sem:execucao",
        secao: "prazos",
        nome: "Vigência ou prazo de execução",
        campos: { Momento: "execução" },
      }),
    );
  return itens;
}
