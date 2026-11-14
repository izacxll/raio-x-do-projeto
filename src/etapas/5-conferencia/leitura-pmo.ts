// Etapa 5, F5b (decisão 0013): leitura opcional do PMO na conferência, com as travas todas em código.
// - Todo achado do PMO é Sugestão, marcado como "leitura do PMO".
// - O código confere cada trecho citado na página; sem nenhum achado, o achado fica "citação não conferida".
// - "Ausente" do PMO só vale depois de o código procurar o item no plano inteiro: se achar, o achado é rebaixado e
//   mostra onde o item está.
// - Gravidade (pela parte do PGP) e categoria (pela parte, decisão 0008) são do código, nunca do PMO.
import type { Gravidade } from "../../dominio/fichas";
import { buscarParte } from "../../dominio/skill";
import type { Caracteristicas } from "../../dominio/caracteristicas";
import type { DocumentoLido } from "../../dossie/esquema";
import { citacaoValeComoFato, conferirCitacao, type ResultadoCitacao } from "../../pmo/citacoes";
import { conteudoMinimoDasFichas } from "../../pmo/montagem";
import { sugestaoSemCondicional } from "../../pmo/redacao";
import type { AchadoPmo, RespostaLeitura } from "../../pmo/schemas/leitura";
import type { Achado } from "../../regras/achado";
import { procurar, procurarSinais } from "../../regras/busca";

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

/** O código procura o item que o PMO diz estar ausente: os termos dele e os sinais do item da ficha. */
function procurarAusente(a: AchadoPmo, pgp: DocumentoLido): { pagina: number; trecho: string } | undefined {
  const porTermos = a.termosProcurados.length
    ? procurar(pgp.paginas, a.termosProcurados, { primeira: true })[0]
    : undefined;
  if (porTermos) return { pagina: porTermos.pagina, trecho: porTermos.trecho.trim() };
  const item = buscarParte(a.parte)?.itens.find((i) => i.codigo === a.item);
  if (!item || (!item.termos.length && !item.compostos.length)) return undefined;
  const sinal = procurarSinais(pgp.paginas, item);
  return sinal ? { pagina: sinal.pagina, trecho: sinal.trecho.trim() } : undefined;
}

export function conferirLeitura(
  r: RespostaLeitura,
  docs: { pgp: DocumentoLido; tap?: DocumentoLido; rfp?: DocumentoLido },
  achadosDoCodigo: Achado[],
): AchadoPmoConferido[] {
  const documentos = [docs.pgp, ...(docs.tap ? [docs.tap] : []), ...(docs.rfp ? [docs.rfp] : [])];
  return r.achados.map((a) => {
    const citacoes = a.evidencias.map((f) => conferirCitacao(f, documentos));
    const algumaVale = citacoes.some(citacaoValeComoFato);
    const localizadoEm = a.tipo === "ausente" ? procurarAusente(a, docs.pgp) : undefined;
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
      jaApontadoPeloCodigo: repetido?.id,
      redacaoAConferir: sugestaoSemCondicional(a.sugestao),
    };
  });
}

const REGRAS = `Regras deste pedido (além da skill):
- Responda só com o objeto JSON, no schema enviado.
- Aponte só o que depende de interpretação e as regras de código não pegam (a lista delas vai abaixo). Não repita o que o código já apontou.
- Cada achado é vago, conflituoso ou ausente, com a parte do PGP (A1…B33), o item do conteúdo mínimo quando houver e a evidência dos dois lados: doc "pgp", "tap" ou "rfp", página do arquivo e trecho literal. O app confere cada trecho; o que não for achado vira "citação não conferida".
- "Ausente" só depois de procurar no plano inteiro, inclusive nas seções gerais. Em termosProcurados, ponha os termos que o código deve procurar antes de aceitar o achado (se achar, ele rebaixa).
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
  return `# Etapa 5 — Conferência do plano · leitura do PMO (opcional)

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
1. Leia o PGP, o TAP e a RFP e aponte o que depende de interpretação. Exemplos: equipe pequena demais para o volume; critério de aceite que não dá para medir; plano de riscos que não conversa com o cronograma; premissa crítica escrita de forma que não dá para verificar.
2. Confira os itens "só PMO" do conteúdo mínimo e a qualidade das premissas críticas escritas (PC1 a PC8). A premissa crítica que se aplica e não está no plano é ausente.
3. observacoes: o que mais você achou, com fonte, que não é vago, conflituoso nem ausente.

${REGRAS}`;
}
