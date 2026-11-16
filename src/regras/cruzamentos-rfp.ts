// Cruzamentos obrigatórios da etapa 1 (decisão 0046): trechos distantes que podem se contradizer. O código faz as
// contas e as listas (X1, X2, X4, X5, X6); o PMO compara e completa (X1, X2, X3). Cada cruzamento sai registrado,
// com o estado e as ocorrências, e o que diverge ou fica em aberto vira ponto de atenção na seção 7.
// Também aqui: o prazo sem termo inicial (decisão 0045) e os sinais de estudo sensível (decisão 0043).
import type { Desembolso } from "../extracao/rfp/dinheiro";
import type { DocumentoRfp, ItemAnalise, OrigemItem } from "../extracao/rfp/item";
import { localizarTodos, type Localizado } from "../extracao/rfp/localizar";
import { diasEntre, ehDiaUtil, encontrarDatas, formatarData, soData } from "../texto/datas";
import { limparEspacos } from "../texto/frase";
import { tirarAcentos } from "../texto/normalizar";
import { normalizarTermo } from "./busca";

export type CodigoCruzamento = "X1" | "X2" | "X3" | "X4" | "X5" | "X6";
export type EstadoCruzamento = "confere" | "diverge" | "em-aberto" | "para-o-pmo" | "nao-se-aplica";

export interface Cruzamento {
  codigo: CodigoCruzamento;
  nome: string;
  /** Quem faz a conta ou a comparação (SKILL.md, seção 3). */
  quem: "código" | "PMO" | "código e PMO";
  estado: EstadoCruzamento;
  /** O que o código achou, em redação de código (contas e listas) ou condicional (o que o PMO confere). */
  resultado: string;
  ocorrencias: OrigemItem[];
  /** Pergunta sugerida, quando diverge ou fica em aberto. */
  pergunta?: string;
}

export const NOME_CRUZAMENTO: Record<CodigoCruzamento, string> = {
  X1: "Forma e condição de pagamento em todos os lugares",
  X2: "Data de início × vigência × marcos fixos",
  X3: "Quem executa × vedações",
  X4: "Contatos e canais repetidos",
  X5: "Valor global × soma das parcelas",
  X6: "Prazos de um mesmo marco em itens diferentes",
};

const util = (i?: ItemAnalise) => Boolean(i && (i.situacao === "localizado" || i.situacao === "calculado"));
const origem = (l: Localizado): OrigemItem => ({
  documento: l.doc.rotulo,
  pagina: l.pagina,
  trecho: l.frase,
});
const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const paginas = (os: OrigemItem[]) => [...new Set(os.map((o) => o.pagina))].join(", ");

// ---------- X1 · forma e condição de pagamento ----------

/** Pagamento ao longo do tempo: mês a mês, proporcional à execução, cronograma de desembolso com meses. */
const RE_PAGAMENTO_DISTRIBUIDO =
  /\b(?:parcelas? mensa\w*|mes a mes|repasses? mensa\w*|cronograma de (?:desembolso|receitas e despesas)|empenh\w*[^.;]{0,60}\bproporcional\w*|proporcional\w*[^.;]{0,40}\b(?:execucao|empenho|cronograma))\b/;

function x1(desembolso: Desembolso, docs: DocumentoRfp[]): Cruzamento {
  const distribuido = localizarTodos(docs, RE_PAGAMENTO_DISTRIBUIDO).slice(0, 4).map(origem);
  const base = { codigo: "X1" as const, nome: NOME_CRUZAMENTO.X1, quem: "código e PMO" as const };
  if (desembolso.unica && distribuido.length)
    return {
      ...base,
      estado: "diverge",
      resultado: `O documento fala em parcela única (p. ${desembolso.unica.pagina}) e em pagamento distribuído ao longo do tempo ou proporcional (p. ${paginas(distribuido)}). O código só lista: a leitura diz qual vale para quê.`,
      ocorrencias: [desembolso.unica, ...distribuido],
      pergunta:
        "Sugere-se perguntar se o repasse é feito em parcela única ou conforme o cronograma de desembolso mensal (ou proporcional ao empenho), e qual item prevalece.",
    };
  const ocorrencias = [
    ...(desembolso.unica ? [desembolso.unica] : []),
    ...desembolso.parcelas.map((p) => p.origem),
    ...distribuido,
  ];
  if (!ocorrencias.length)
    return {
      ...base,
      estado: "para-o-pmo",
      resultado:
        "Forma de pagamento não localizada pelo código — conferir no documento; a leitura procura a condição de cada pagamento em todos os lugares.",
      ocorrencias,
    };
  return {
    ...base,
    estado: "para-o-pmo",
    resultado: `O código achou a forma de pagamento em ${ocorrencias.length} trecho(s) (p. ${paginas(ocorrencias)}), sem contradição de forma. A leitura confere a condição de cada pagamento (entrega, aceite, aprovação) nesses trechos e na minuta.`,
    ocorrencias,
  };
}

// ---------- X2 · início × vigência × marcos fixos ----------

const RE_INICIO_FIXO = /\b(?:inicia\w*|inicio d[aoe]s? (?:execucao|servicos|atividades|vigencia))\b/;
const RE_MARCO_FIXO = /(?:periodo de|de)\s*$/;

function diasUteisEntre(de: Date, ate: Date): number {
  let n = 0;
  const d = soData(de);
  while (d < soData(ate)) {
    d.setDate(d.getDate() + 1);
    if (ehDiaUtil(d)) n++;
  }
  return n;
}

function somarMeses(d: Date, meses: number): Date {
  const r = soData(d);
  r.setMonth(r.getMonth() + meses);
  return r;
}

interface Periodo {
  ini: Date;
  fim: Date;
  origem: OrigemItem;
}

/** Períodos com data fixa ("no período de 08/11/2025 a 07/01/2026"): eventos, safras, ano letivo. */
function periodosFixos(docs: DocumentoRfp[]): Periodo[] {
  const out: Periodo[] = [];
  for (const doc of docs)
    for (const p of doc.paginas) {
      const datas = encontrarDatas(p.texto);
      datas.forEach((d, k) => {
        const prox = datas[k + 1];
        if (!prox) return;
        const entre = tirarAcentos(p.texto.slice(d.posicao + d.tamanho, prox.posicao))
          .trim()
          .toLowerCase();
        const antes = tirarAcentos(p.texto.slice(Math.max(0, d.posicao - 20), d.posicao)).toLowerCase();
        if (!/^(?:a|ate)$/.test(entre) || !RE_MARCO_FIXO.test(antes) || prox.data <= d.data) return;
        out.push({
          ini: d.data,
          fim: prox.data,
          origem: {
            documento: doc.rotulo,
            pagina: p.numero,
            trecho: limparEspacos(p.texto.slice(Math.max(0, d.posicao - 40), prox.posicao + prox.tamanho)),
          },
        });
      });
    }
  return out;
}

function inicioFixo(docs: DocumentoRfp[]): { data: Date; origem: OrigemItem } | undefined {
  for (const l of localizarTodos(docs, RE_INICIO_FIXO)) {
    const pagina = l.doc.paginas.find((p) => p.numero === l.pagina)?.texto ?? "";
    const d = encontrarDatas(pagina.slice(l.posicao, l.posicao + 80))[0];
    if (d) return { data: d.data, origem: origem(l) };
  }
  return undefined;
}

function x2(itens: ItemAnalise[], docs: DocumentoRfp[]): Cruzamento {
  const base = { codigo: "X2" as const, nome: NOME_CRUZAMENTO.X2, quem: "código e PMO" as const };
  const inicio = inicioFixo(docs);
  const vigencia = itens.find((i) => i.id.startsWith("prazos:execucao:vigencia:") && util(i));
  const meses = vigencia ? Number(/(\d{1,3})\s*mes/.exec(tirarAcentos(vigencia.texto))?.[1] ?? 0) : 0;
  const marcos = inicio ? periodosFixos(docs).filter((p) => p.ini > inicio.data) : [];
  const contadaDeOutroMarco = vigencia?.origem
    ? /\b(?:publicacao|divulgacao|assinatura|portal)\b/.test(normalizarTermo(vigencia.origem.trecho))
    : false;
  if (!inicio || !marcos.length)
    return {
      ...base,
      estado: "nao-se-aplica",
      resultado: !inicio
        ? "Data fixa de início não localizada pelo código — conferir no documento."
        : "Marco externo com data fixa (evento, safra, ano letivo) depois do início não localizado pelo código — conferir no documento.",
      ocorrencias: inicio ? [inicio.origem] : [],
    };
  const primeiro = marcos.reduce((a, b) => (b.ini < a.ini ? b : a));
  const ultimo = marcos.reduce((a, b) => (b.fim > a.fim ? b : a));
  const janela = diasUteisEntre(inicio.data, primeiro.ini);
  const partes = [
    `Início em ${formatarData(inicio.data)} (p. ${inicio.origem.pagina}); marco fixo de ${formatarData(primeiro.ini)} a ${formatarData(primeiro.fim)} (p. ${primeiro.origem.pagina}).`,
    `Janela entre o início e o marco: ${janela} dias úteis (conta do código, sem feriados).`,
  ];
  if (meses) {
    const fimVigencia = somarMeses(inicio.data, meses);
    const folga = diasEntre(ultimo.fim, fimVigencia);
    partes.push(
      `Vigência de ${meses} meses${contadaDeOutroMarco ? " contada de outro marco (p. " + (vigencia?.origem?.pagina ?? "—") + ")" : ""}: se contada do início, termina em ${formatarData(fimVigencia)}, ${folga >= 0 ? `${folga} dias corridos depois` : `${-folga} dias corridos antes`} do fim do marco (${formatarData(ultimo.fim)})${contadaDeOutroMarco ? "; hipótese do código, a data real depende do outro marco" : ""}.`,
    );
  }
  return {
    ...base,
    estado: contadaDeOutroMarco ? "em-aberto" : "confere",
    resultado: `${partes.join(" ")} A leitura diz o que precisa acabar antes do marco e qual referência de início vale para quê.`,
    ocorrencias: [inicio.origem, primeiro.origem, ...(vigencia?.origem ? [vigencia.origem] : [])],
    pergunta: contadaDeOutroMarco
      ? "Sugere-se perguntar qual referência vale para quê: a data fixa de início (prazos dos produtos) ou o marco da vigência (publicação, assinatura), e a data prevista desse marco."
      : undefined,
  };
}

// ---------- X3 · quem executa × vedações ----------

const RE_VEDACAO =
  /\b(?:(?:e |sera |fica )?vedada a subcontratacao|nao sera (?:permitida|admitida) (?:a )?subcontratacao|vedada a (?:subcontratacao|atuacao de profissionais distintos))\b/;
const RE_QUEM_EXECUTA =
  /\b(?:equipe d[ao] contratad[ao]|pesquisa de campo|pesquisadores|aplicadores|equipe de campo|profissionais (?:indicados|que tenham justificado))\b/;

function x3(docs: DocumentoRfp[]): Cruzamento {
  const base = { codigo: "X3" as const, nome: NOME_CRUZAMENTO.X3, quem: "PMO" as const };
  const vedacoes = localizarTodos(docs, RE_VEDACAO).slice(0, 2).map(origem);
  const quem = localizarTodos(docs, RE_QUEM_EXECUTA).slice(0, 3).map(origem);
  if (!vedacoes.length)
    return {
      ...base,
      estado: "nao-se-aplica",
      resultado: "Vedação de subcontratação não localizada pelo código — conferir no documento.",
      ocorrencias: quem,
    };
  return {
    ...base,
    estado: "para-o-pmo",
    resultado: `Vedação na p. ${paginas(vedacoes)}${quem.length ? `; quem executa citado na p. ${paginas(quem)}` : ""}. A leitura confere primeiro se o próprio documento já diz quem executa (ex.: "levantados pela equipe da contratada") e só então pergunta o que sobra.`,
    ocorrencias: [...vedacoes, ...quem],
  };
}

// ---------- X4 · contatos e canais repetidos ----------

const RE_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

/** Distância de edição pequena (até 2), para achar "contato@" × "contatos@". */
function quaseIguais(a: string, b: string): boolean {
  if (a === b || Math.abs(a.length - b.length) > 2) return false;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i]![j] = Math.min(
        d[i - 1]![j]! + 1,
        d[i]![j - 1]! + 1,
        d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[a.length]![b.length]! <= 2;
}

function x4(docs: DocumentoRfp[]): Cruzamento {
  const base = { codigo: "X4" as const, nome: NOME_CRUZAMENTO.X4, quem: "código e PMO" as const };
  const achados = new Map<string, OrigemItem>();
  for (const doc of docs)
    for (const p of doc.paginas)
      for (const m of p.texto.matchAll(RE_EMAIL)) {
        const email = m[0].replace(/\.$/, "").toLowerCase();
        if (!achados.has(email))
          achados.set(email, {
            documento: doc.rotulo,
            pagina: p.numero,
            trecho: limparEspacos(
              p.texto.slice(Math.max(0, (m.index ?? 0) - 60), (m.index ?? 0) + m[0].length),
            ),
          });
      }
  const emails = [...achados.keys()];
  if (emails.length < 2)
    return {
      ...base,
      estado: "nao-se-aplica",
      resultado: emails.length
        ? `Um só e-mail de contato no documento (${emails[0]}).`
        : "E-mail de contato não localizado pelo código.",
      ocorrencias: [...achados.values()],
    };
  const pares: [string, string][] = [];
  emails.forEach((a, i) =>
    emails.slice(i + 1).forEach((b) => {
      const [ua, da] = a.split("@");
      const [ub, db] = b.split("@");
      if (da === db && ua && ub && quaseIguais(ua, ub)) pares.push([a, b]);
    }),
  );
  if (pares.length)
    return {
      ...base,
      estado: "diverge",
      resultado: pares
        .map(
          ([a, b]) =>
            `"${a}" (p. ${achados.get(a)?.pagina}) e "${b}" (p. ${achados.get(b)?.pagina}) diferem por poucas letras`,
        )
        .join("; ")
        .concat(": pode ser erro de digitação; conferir qual é o oficial."),
      ocorrencias: pares.flatMap(([a, b]) => [achados.get(a)!, achados.get(b)!]),
      pergunta: `Sugere-se confirmar com o contratante qual e-mail é o oficial: ${pares.map(([a, b]) => `${a} ou ${b}`).join("; ")}.`,
    };
  return {
    ...base,
    estado: "confere",
    resultado: `${emails.length} e-mails de contato, sem dois quase iguais (${emails.slice(0, 4).join(", ")}).`,
    ocorrencias: [...achados.values()].slice(0, 4),
  };
}

// ---------- X5 · valor global × soma das parcelas ----------

function x5(desembolso: Desembolso, valor?: ItemAnalise): Cruzamento {
  const base = { codigo: "X5" as const, nome: NOME_CRUZAMENTO.X5, quem: "código" as const };
  const emValor = desembolso.parcelas.length && desembolso.parcelas.every((p) => p.valor !== undefined);
  const global =
    valor && util(valor) ? /R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/.exec(valor.texto)?.[1] : undefined;
  const total = global ? Number(global.replace(/\./g, "").replace(",", ".")) : undefined;
  if (!desembolso.parcelas.length)
    return {
      ...base,
      estado: "nao-se-aplica",
      resultado: desembolso.unica
        ? "Parcela única: não há soma a conferir."
        : "Parcelas não localizadas pelo código — conferir no documento.",
      ocorrencias: desembolso.unica ? [desembolso.unica] : [],
    };
  const ocorrencias = desembolso.parcelas.map((p) => p.origem);
  if (emValor && total !== undefined) {
    const soma = desembolso.parcelas.reduce((s, p) => s + (p.valor ?? 0), 0);
    const igual = Math.abs(soma - total) < 0.01;
    return {
      ...base,
      estado: igual ? "confere" : "diverge",
      resultado: `Soma das parcelas: ${reais(soma)}; valor global: ${reais(total)} (conta do código)${igual ? "." : ": diferentes, conferir no documento."}`,
      ocorrencias: valor?.origem ? [valor.origem, ...ocorrencias] : ocorrencias,
      pergunta: igual
        ? undefined
        : "Sugere-se perguntar qual valor prevalece: o global ou a soma das parcelas.",
    };
  }
  const soma = desembolso.soma;
  return {
    ...base,
    estado: Math.abs(soma - 100) < 0.01 ? "confere" : "diverge",
    resultado: `As parcelas somam ${soma.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% (conta do código).`,
    ocorrencias,
  };
}

// ---------- X6 · prazos de um mesmo marco ----------

function x6(itens: ItemAnalise[]): Cruzamento {
  const base = { codigo: "X6" as const, nome: NOME_CRUZAMENTO.X6, quem: "código e PMO" as const };
  const prazos = itens.filter((i) => i.id.startsWith("prazos:execucao:") && util(i));
  const porNome = new Map<string, ItemAnalise[]>();
  for (const p of prazos) porNome.set(p.nome, [...(porNome.get(p.nome) ?? []), p]);
  const divergentes = [...porNome.entries()].filter(
    ([, ps]) => new Set(ps.map((p) => normalizarTermo(p.texto))).size > 1,
  );
  if (divergentes.length)
    return {
      ...base,
      estado: "diverge",
      resultado: divergentes
        .map(
          ([nome, ps]) =>
            `${nome}: ${ps.map((p) => `${p.texto} (p. ${p.origem?.pagina ?? "—"})`).join(" × ")}`,
        )
        .join("; ")
        .concat(". O código só lista: a leitura diz se são marcos diferentes ou contradição."),
      ocorrencias: divergentes.flatMap(([, ps]) => ps.flatMap((p) => (p.origem ? [p.origem] : []))),
      pergunta: "Sugere-se perguntar qual prazo vale, quando o mesmo marco aparece com prazos diferentes.",
    };
  return {
    ...base,
    estado: prazos.length ? "confere" : "nao-se-aplica",
    resultado: prazos.length
      ? `${prazos.length} prazo(s) da execução, sem o mesmo marco com dois valores.`
      : "Prazos da execução não localizados pelo código — conferir no documento.",
    ocorrencias: prazos.slice(0, 4).flatMap((p) => (p.origem ? [p.origem] : [])),
  };
}

export function cruzarRfp(itens: ItemAnalise[], docs: DocumentoRfp[], desembolso: Desembolso): Cruzamento[] {
  const valor = itens.find((i) => i.id === "identificacao:valor");
  return [x1(desembolso, docs), x2(itens, docs), x3(docs), x4(docs), x5(desembolso, valor), x6(itens)];
}

// ---------- Prazo sem termo inicial (decisão 0045) ----------

/** "No prazo de 30 (trinta) dias" sem dizer de quando conta: "em até" ou "com antecedência"? */
const RE_PRAZO_EM_DIAS =
  /\bno prazo (?:maximo )?de (?:ate )?\d{1,3}\s*(?:\([a-z -]{2,30}\)\s*)?(?:dias?|horas?)(?:\s+(?:uteis|corridos))?/;
const RE_TERMO_INICIAL =
  /\b(?:contad[oa]s?|a contar|a partir|apos|antes|anteced\w*|que antecede|do recebimento|da assinatura|da publicacao|da intimacao|da notificacao|da data|do termino|do inicio|da comunicacao|da solicitacao|do pedido)\b/;

export function prazosSemTermoInicial(docs: DocumentoRfp[]): Localizado[] {
  return localizarTodos(docs, RE_PRAZO_EM_DIAS)
    .filter((l) => {
      const n = normalizarTermo(l.frase);
      const depois = n.slice(n.indexOf(l.termo) + l.termo.length, n.indexOf(l.termo) + l.termo.length + 90);
      // "notificada a regularizar [...] no prazo de 5 dias": conta da notificação, que vem antes na frase
      const contaDeUmAto = /\b(?:notificad|comunicad|intimad|convocad|solicitad|instad)\w*/.test(n);
      return (
        !RE_TERMO_INICIAL.test(depois) && !contaDeUmAto && !/\brecurs|\bsanc|\bmulta\b|\bdefesa\b/.test(n)
      );
    })
    .slice(0, 3);
}

// ---------- Estudo sensível (decisão 0043) ----------

/**
 * Sinal forte de disputa junto de impacto, avaliação ou recursos, na mesma página. "Denúncia" não entra: na
 * parceria e no contrato ela é a forma de encerrar o termo ("rescisão ou denúncia").
 */
export function sinaisDeEstudoSensivel(docs: DocumentoRfp[]): Localizado | undefined {
  const disputa = /\bcpi\b|comissao parlamentar|comissao de estudo/;
  const assunto = /\bimpacto|avaliacao|recursos aplicados|gestao dos recursos\b/;
  return localizarTodos(docs, disputa).find((l) => {
    const pagina = normalizarTermo(l.doc.paginas.find((p) => p.numero === l.pagina)?.texto ?? "");
    return assunto.test(pagina);
  });
}
