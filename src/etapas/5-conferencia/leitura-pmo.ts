// Etapa 5, F5b (decisão 0013): leitura opcional do PMO na conferência, com as travas todas em código.
// - Todo achado do PMO é Sugestão, marcado como "leitura do PMO".
// - O código confere cada trecho citado na página; sem nenhum achado, o achado fica "citação não conferida".
// - "Ausente" do PMO só vale depois de o código procurar o item: na parte apontada (e, se ela foi dispensada, nas
//   partes que absorvem o conteúdo, pela justificativa), sem os trechos que o próprio achado cita como evidência, com
//   os termos que o PMO mandou (sem eles, os sinais do item da ficha). Se achar, o achado é rebaixado e mostra onde.
// - Gravidade (pela parte do PGP) e categoria (pela parte, decisão 0008) são do código, nunca do PMO.
import type { Gravidade } from "../../dominio/fichas";
import { buscarParte } from "../../dominio/skill";
import type { Caracteristicas } from "../../dominio/caracteristicas";
import type { DocumentoLido, PaginaLida } from "../../dossie/esquema";
import { citacaoValeComoFato, conferirCitacao, type ResultadoCitacao } from "../../pmo/citacoes";
import { conteudoMinimoDasFichas } from "../../pmo/montagem";
import { sugestaoSemCondicional } from "../../pmo/redacao";
import type { AchadoPmo, RespostaLeitura } from "../../pmo/schemas/leitura";
import type { Achado } from "../../regras/achado";
import { procurar, procurarSinais } from "../../regras/busca";
import {
  paginasDaParte,
  parteDaPosicao,
  partesQueAbsorvem,
  type ParteConfirmada,
} from "../../regras/mapa-pgp";

export type SituacaoAchadoPmo = "valido" | "rebaixado" | "citacao-nao-conferida";

export const NOME_SITUACAO_PMO: Record<SituacaoAchadoPmo, string> = {
  valido: "leitura do PMO (sugestão)",
  rebaixado: "rebaixado: o código achou o item no plano — conferir",
  "citacao-nao-conferida": "citação não conferida — não vale como fato",
};

export interface AchadoPmoConferido extends AchadoPmo {
  gravidade: Gravidade;
  categoria: string;
  citacoes: ResultadoCitacao[];
  situacao: SituacaoAchadoPmo;
  /** No ausente rebaixado: onde o código achou o item. */
  localizadoEm?: { pagina: number; trecho: string };
  /** No ausente: onde o código procurou ("A15, p. 13 a 14"; "plano inteiro") e com quê. */
  procuradoEm?: string;
  /** O código já tinha apontado o mesmo tipo de problema na mesma parte (id do achado do código). */
  jaApontadoPeloCodigo?: string;
  redacaoAConferir: boolean;
}

/** Gravidade e categoria pela parte do PGP (regra fixa); parte desconhecida fica baixa e sem categoria. */
function regraFixa(parte: string): { gravidade: Gravidade; categoria: string } {
  const f = buscarParte(parte);
  const gravidade = f && f.gravidade !== "não se aplica" ? f.gravidade : "baixa";
  return { gravidade, categoria: f?.categoria ?? "—" };
}

/**
 * Partes onde o código procura o ausente: a apontada e, se ela foi dispensada, as que absorvem o conteúdo (pela
 * justificativa da dispensa). Sem mapa, ou com uma delas sem páginas próprias (fundida com outra ou não localizada),
 * a busca vale no plano inteiro (undefined).
 */
export function regiaoDoAusente(parte: string, mapa: ParteConfirmada[]): Set<string> | undefined {
  if (!mapa.length) return undefined;
  const alvo = mapa.find((p) => p.codigo === parte);
  const partes = alvo?.situacao === "dispensada" ? partesQueAbsorvem(alvo) : [parte];
  if (!partes.length) return undefined;
  if (partes.some((c) => !paginasDaParte(mapa.find((p) => p.codigo === c)))) return undefined;
  return new Set(partes);
}

/** Texto compacto (só letras e números, sem acento) com a posição de cada caractere no original. */
function compactar(texto: string): { compacto: string; posicoes: number[] } {
  let compacto = "";
  const posicoes: number[] = [];
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]!.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    for (const x of c) {
      if (!/[a-z0-9]/.test(x)) continue;
      compacto += x;
      posicoes.push(i);
    }
  }
  return { compacto, posicoes };
}

/** Faixas (início e fim no texto original) onde o trecho aparece na página. */
function faixasDoTrecho(texto: string, trecho: string): [number, number][] {
  const pagina = compactar(texto);
  const alvo = compactar(trecho).compacto;
  if (alvo.length < 8) return [];
  const faixas: [number, number][] = [];
  for (let i = pagina.compacto.indexOf(alvo); i >= 0; i = pagina.compacto.indexOf(alvo, i + 1))
    faixas.push([pagina.posicoes[i]!, pagina.posicoes[i + alvo.length - 1]!]);
  return faixas;
}

/**
 * As páginas do plano como o código as procura para um ausente: só o texto das partes da região (o resto vira
 * espaço, para as posições valerem) e sem os trechos que o achado cita como evidência no plano.
 */
export function paginasDaBusca(
  pgp: DocumentoLido,
  regiao: Set<string> | undefined,
  mapa: ParteConfirmada[],
  evidencias: AchadoPmo["evidencias"],
): PaginaLida[] {
  const doPlano = evidencias.filter((e) => e.doc === "pgp");
  return pgp.paginas.map((p) => {
    const chars = p.texto.split(""); // índices UTF-16, como as posições da busca
    const apagar = (a: number, b: number) => {
      for (let i = a; i <= b && i < chars.length; i++) if (chars[i] !== "\n") chars[i] = " ";
    };
    if (regiao) {
      let inicio = 0;
      for (const linha of p.texto.split("\n")) {
        const parte = parteDaPosicao(p.numero, inicio, mapa);
        if (!parte || !regiao.has(parte)) apagar(inicio, inicio + linha.length - 1);
        inicio += linha.length + 1;
      }
    }
    for (const e of doPlano) for (const [a, b] of faixasDoTrecho(p.texto, e.trecho)) apagar(a, b);
    return { ...p, texto: chars.join("") };
  });
}

/**
 * O código procura o item que o PMO diz estar ausente, na região do achado e sem a evidência dele: com os termos
 * que o PMO mandou; sem termos, com os sinais do item da ficha.
 */
function procurarAusente(
  a: AchadoPmo,
  pgp: DocumentoLido,
  mapa: ParteConfirmada[],
): { pagina: number; trecho: string } | undefined {
  const paginas = paginasDaBusca(pgp, regiaoDoAusente(a.parte, mapa), mapa, a.evidencias);
  const original = (o: { pagina: number; posicao: number; trecho: string }) => {
    // o trecho mostrado vem do texto original da página, não do texto com as partes apagadas
    const texto = pgp.paginas.find((p) => p.numero === o.pagina)?.texto ?? "";
    return (
      texto
        .slice(Math.max(0, o.posicao - 80), o.posicao + 120)
        .replace(/\s+/g, " ")
        .trim() || o.trecho
    );
  };
  if (a.termosProcurados.length) {
    const o = procurar(paginas, a.termosProcurados, { primeira: true })[0];
    return o ? { pagina: o.pagina, trecho: original(o) } : undefined;
  }
  const item = buscarParte(a.parte)?.itens.find((i) => i.codigo === a.item);
  if (!item || (!item.termos.length && !item.compostos.length)) return undefined;
  const sinal = procurarSinais(paginas, item);
  return sinal ? { pagina: sinal.pagina, trecho: original(sinal) } : undefined;
}

/** Onde e com quê o código procurou o ausente, para a tela e o relatório. */
export function descreverBusca(a: AchadoPmo, mapa: ParteConfirmada[]): string {
  const regiao = regiaoDoAusente(a.parte, mapa);
  const onde = regiao
    ? [...regiao]
        .map((c) => {
          const p = mapa.find((x) => x.codigo === c);
          const ini = p?.paginaInicial ?? 0;
          const fim = Math.max(ini, p?.paginaFinal ?? ini);
          return `${c}, p. ${ini === fim ? ini : `${ini} a ${fim}`}`;
        })
        .join("; ")
    : "plano inteiro";
  const com = a.termosProcurados.length
    ? `termos do PMO (${a.termosProcurados.join(", ")})`
    : a.item
      ? `sinais do item ${a.item} da ficha`
      : "sem termos";
  const sem = a.evidencias.some((e) => e.doc === "pgp") ? ", sem os trechos citados como evidência" : "";
  return `${onde}; ${com}${sem}`;
}

export function conferirLeitura(
  r: RespostaLeitura,
  docs: { pgp: DocumentoLido; tap?: DocumentoLido; rfp?: DocumentoLido },
  achadosDoCodigo: Achado[],
  /** O mapa confirmado: diz onde fica a parte apontada e quem absorve as dispensadas. */
  mapa: ParteConfirmada[] = [],
): AchadoPmoConferido[] {
  const documentos = [docs.pgp, ...(docs.tap ? [docs.tap] : []), ...(docs.rfp ? [docs.rfp] : [])];
  return r.achados.map((a) => {
    const citacoes = a.evidencias.map((f) => conferirCitacao(f, documentos));
    const algumaVale = citacoes.some(citacaoValeComoFato);
    const localizadoEm = a.tipo === "ausente" ? procurarAusente(a, docs.pgp, mapa) : undefined;
    const procuradoEm = a.tipo === "ausente" ? descreverBusca(a, mapa) : undefined;
    const situacao: SituacaoAchadoPmo = localizadoEm
      ? "rebaixado"
      : a.evidencias.length && !algumaVale
        ? "citacao-nao-conferida"
        : a.tipo !== "ausente" && !a.evidencias.length
          ? "citacao-nao-conferida"
          : "valido";
    const repetido = achadosDoCodigo.find(
      (c) =>
        c.tipo === a.tipo &&
        c.parte === a.parte &&
        (!a.item || c.descricao.includes(a.item) || c.id.includes(a.item)),
    );
    return {
      ...a,
      ...regraFixa(a.parte),
      citacoes,
      situacao,
      localizadoEm,
      procuradoEm,
      jaApontadoPeloCodigo: repetido?.id,
      redacaoAConferir: sugestaoSemCondicional(a.sugestao),
    };
  });
}

const REGRAS = `Regras deste pedido (além da skill):
- Responda só com o objeto JSON, no schema enviado.
- Aponte só o que depende de interpretação e as regras de código não pegam (a lista delas vai abaixo). Não repita o que o código já apontou.
- Cada achado é vago, conflituoso ou ausente, com a parte do PGP (A1…B33), o item do conteúdo mínimo quando houver e a evidência dos dois lados: doc "pgp", "tap" ou "rfp", página do arquivo e trecho literal. O app confere cada trecho; o que não for achado vira "citação não conferida".
- "Ausente" só depois de procurar no plano inteiro, inclusive nas seções gerais. Em termosProcurados, ponha os termos que o código deve procurar antes de aceitar o achado: ele procura só esses, na parte apontada (e, se ela foi dispensada, nas partes que absorvem o conteúdo), sem os trechos que você cita como evidência; se achar, rebaixa.
- Você não dá categoria nem gravidade: o código aplica pela parte do plano.
- Sugestão de ajuste em redação condicional. Não invente valores, prazos nem quantidades.
- Proporcionalidade: o PMBOK é guia, não checklist; projeto pequeno não pode sair todo vermelho.`;

export function pedidoLeitura(opcoes: {
  partesPresentes: string[];
  caracteristicas: Caracteristicas;
  premissasAplicaveis: Record<string, boolean>;
  achadosDoCodigo: Achado[];
  temTap: boolean;
  temRfp: boolean;
}): string {
  const pcs = Object.entries(opcoes.premissasAplicaveis)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const doCodigo = opcoes.achadosDoCodigo.map((a) => `- ${a.tipo} · ${a.parte} · ${a.titulo}`);
  return `# Etapa 5 — Conferência do plano · leitura do PMO

Documentos: o PGP (doc: pgp)${opcoes.temTap ? ", o TAP (doc: tap)" : ""}${opcoes.temRfp ? " e a RFP (doc: rfp)" : ""}.
Características do projeto (confirmadas pelo GP): ${Object.entries(opcoes.caracteristicas)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join("; ")}.
Premissas críticas que se aplicam (decisão do GP): ${pcs.length ? pcs.join(", ") : "nenhuma"}.

## O que o código já apontou (não repita)
${doCodigo.join("\n") || "- nada"}

## Conteúdo mínimo e perguntas de qualidade das partes presentes no plano
${conteudoMinimoDasFichas(opcoes.partesPresentes)}

# O que fazer
1. Leia ${["o PGP", ...(opcoes.temTap ? ["o TAP"] : []), ...(opcoes.temRfp ? ["a RFP"] : [])].join(", ").replace(/, ([^,]*)$/, " e $1")} (só os documentos anexados) e aponte o que depende de interpretação. Exemplos: equipe pequena demais para o volume; critério de aceite que não dá para medir; plano de riscos que não conversa com o cronograma; premissa crítica escrita de forma que não dá para verificar.
2. Confira os itens "só PMO" do conteúdo mínimo e a qualidade das premissas críticas escritas (PC1 a PC8). A premissa crítica que se aplica e não está no plano é ausente.
3. observacoes: o que mais você achou, com fonte, que não é vago, conflituoso nem ausente.

${REGRAS}`;
}
