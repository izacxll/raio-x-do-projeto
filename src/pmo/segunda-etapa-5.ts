// Segunda instância leve da etapa 5 (decisão 0077). Roda só quando o PMO deu ao menos um veredito "falso" ou
// "regra_errada" a um achado que o código ainda aponta: esses vereditos tiram o achado do total, e nenhuma outra
// camada os confere. O pedido leva só esses vereditos (com o item da ficha), as páginas que eles e os achados citam,
// as páginas da parte de cada achado e, para cada premissa crítica que se aplica, os trechos do plano que a citam em
// cada lugar (B3, B27, A11). Uma rodada, no modelo mais barato por padrão. App e teste externo montam pelo mesmo
// montarSegundaEtapa5.
// A régua: o trecho cobre o item inteiro da ficha, não só o tema; cobre em parte → o achado vale, com o que falta.
import type { DocumentoLido, PaginaLida } from "../dossie/esquema";
import type { PremissaCritica } from "../dominio/premissas";
import type { Ficha } from "../dominio/fichas";
import type { CandidatoConferido, ResultadoVereditos } from "../etapas/5-conferencia/candidatos";
import type { Achado } from "../regras/achado";
import { tirarAcentos } from "../texto/normalizar";
import { citacaoValeComoFato, conferirCitacao } from "./citacoes";
import { type IdentidadeDoCaso, identidadeEmTexto } from "./identidade-do-caso";
import type { FontePmo } from "./schemas/comum";
import type { RespostaLeitura } from "./schemas/leitura";
import type { RespostaSegundaEtapa5, RevisaoDeVeredito } from "./schemas/segunda-etapa-5";

/** Parte do mapa com a faixa de páginas (o mesmo formato da conferência). */
interface ParteNaFaixa {
  codigo: string;
  situacao: string;
  paginaInicial?: number;
  paginaFinal?: number;
}

/** Até quantas páginas de cada parte vão ao revisor (controle de custo). */
const PAGINAS_POR_PARTE = 3;
/** Até quantas linhas de cada lugar (B3, B27, A11) vão para cada premissa crítica (~1 mil tokens por PC). */
const LINHAS_POR_LUGAR = 2;
const LUGARES_DA_PREMISSA = ["B3", "B27", "A11"] as const;

/**
 * Os vereditos que a segunda instância leve confere: "falso" e "regra_errada" de achados que ainda são candidatos do
 * código (veredito de achado que a conferência de agora não aponta não tira nada do total).
 */
export function vereditosAConferir(
  r: RespostaLeitura,
  candidatos: { achado: { id: string } }[],
): RespostaLeitura["vereditos"] {
  const ids = new Set(candidatos.map((c) => c.achado.id));
  return r.vereditos.filter(
    (v) => (v.veredito === "falso" || v.veredito === "regra_errada") && ids.has(v.achado),
  );
}

/** Roda só com ao menos um veredito "falso" ou "regra_errada" de achado do código (decisão 0077). */
export function deveConferirEtapa5(
  r: RespostaLeitura | undefined,
  candidatos: { achado: { id: string } }[],
): boolean {
  return Boolean(r && vereditosAConferir(r, candidatos).length);
}

/** O texto do item da ficha de um achado de conteúdo mínimo ("conteudo-minimo:A8:A8.2"), ou undefined. */
function itemDaFicha(a: Achado, partes: Ficha[]): string | undefined {
  const m = /^conteudo-minimo:([AB]\d+):([AB]\d+\.\d+)$/.exec(a.id);
  if (!m) return undefined;
  const item = partes.find((p) => p.codigo === m[1])?.itens.find((i) => i.codigo === m[2]);
  return item ? `${item.codigo} ${item.texto}` : undefined;
}

/** As páginas do plano de uma parte presente no mapa (até PAGINAS_POR_PARTE). */
function paginasDaParte(codigo: string, mapa: ParteNaFaixa[]): number[] {
  const p = mapa.find((x) => x.codigo === codigo && x.situacao === "presente");
  if (!p?.paginaInicial) return [];
  const fim = Math.min(p.paginaFinal ?? p.paginaInicial, p.paginaInicial + PAGINAS_POR_PARTE - 1);
  return Array.from({ length: fim - p.paginaInicial + 1 }, (_, k) => p.paginaInicial! + k);
}

/**
 * As páginas que vão ao revisor: as citadas pelos vereditos conferidos, as das evidências dos achados deles e as da
 * parte de cada um desses achados (sem elas, o "regra_errada" de um ausente iria sem nenhuma página do plano).
 */
function documentosParaOsVereditos(
  documentos: DocumentoLido[],
  alvo: RespostaLeitura["vereditos"],
  achados: Achado[],
  mapa: ParteNaFaixa[],
): DocumentoLido[] {
  const citadas = new Set<string>();
  for (const v of alvo) for (const e of v.evidencias) citadas.add(`${e.doc}:${e.pagina}`);
  for (const a of achados) {
    for (const e of a.evidencias)
      if (e.documento !== "ficha" && e.pagina !== undefined) citadas.add(`${e.documento}:${e.pagina}`);
    for (const n of paginasDaParte(a.parte, mapa)) citadas.add(`pgp:${n}`);
  }
  const doc = (d: DocumentoLido) => (d.papel === "anexo-rfp" ? "rfp" : d.papel);
  return documentos
    .map((d) => ({ ...d, paginas: d.paginas.filter((p) => citadas.has(`${doc(d)}:${p.numero}`)) }))
    .filter((d) => d.paginas.length);
}

/**
 * Os trechos do plano que citam a premissa crítica em cada lugar (B3, B27, A11): até duas linhas por lugar, nas
 * páginas da parte no mapa, sem acento. O lugar sem trecho sai "não localizado pelo código" (não achado não é
 * ausente).
 */
export function trechosDaPremissa(pc: PremissaCritica, pgp: PaginaLida[], mapa: ParteNaFaixa[]): string[] {
  const norma = (t: string) => tirarAcentos(t).toLowerCase();
  const termos = [pc.codigo, ...pc.sinaisNoPlano.termos].map(norma).filter(Boolean);
  const out: string[] = [];
  for (const lugar of LUGARES_DA_PREMISSA) {
    const p = mapa.find((x) => x.codigo === lugar && x.situacao === "presente");
    const faixa = p?.paginaInicial
      ? new Set(
          Array.from(
            { length: (p.paginaFinal ?? p.paginaInicial) - p.paginaInicial + 1 },
            (_, k) => p.paginaInicial! + k,
          ),
        )
      : undefined;
    const linhas: string[] = [];
    for (const pg of pgp) {
      if (!faixa?.has(pg.numero)) continue;
      for (const l of pg.texto.split("\n"))
        if (linhas.length < LINHAS_POR_LUGAR && termos.some((x) => norma(l).includes(x)))
          linhas.push(`${lugar}, p. ${pg.numero}: ${l.trim().slice(0, 350)}`);
    }
    out.push(
      ...(linhas.length
        ? linhas
        : [
            `${lugar}: não localizado pelo código${faixa ? "" : " (parte fora do mapa)"} — conferir no documento`,
          ]),
    );
  }
  return out;
}

/** O pedido e os documentos da segunda instância leve: a mesma montagem na tela e no teste externo. */
export function montarSegundaEtapa5(o: {
  leitura: RespostaLeitura;
  candidatos: CandidatoConferido[];
  partes: Ficha[];
  premissas: PremissaCritica[];
  premissasAplicaveis: Record<string, boolean>;
  documentos: DocumentoLido[];
  mapa: ParteNaFaixa[];
  identidade?: IdentidadeDoCaso;
}): { pedido: string; documentos: DocumentoLido[]; quantos: number } {
  const alvo = vereditosAConferir(o.leitura, o.candidatos);
  const ids = new Set(alvo.map((v) => v.achado));
  const achados = o.candidatos.filter((c) => ids.has(c.achado.id)).map((c) => c.achado);
  const pgp = o.documentos.find((d) => d.papel === "pgp")?.paginas ?? [];
  return {
    pedido: pedidoSegundaEtapa5({ ...o, alvo, pgp }),
    documentos: documentosParaOsVereditos(o.documentos, alvo, achados, o.mapa),
    quantos: alvo.length,
  };
}

function pedidoSegundaEtapa5(o: {
  alvo: RespostaLeitura["vereditos"];
  candidatos: CandidatoConferido[];
  partes: Ficha[];
  premissas: PremissaCritica[];
  premissasAplicaveis: Record<string, boolean>;
  pgp: PaginaLida[];
  mapa: ParteNaFaixa[];
  identidade?: IdentidadeDoCaso;
}): string {
  const linhaDoVeredito = (v: RespostaLeitura["vereditos"][number]) => {
    const a = o.candidatos.find((x) => x.achado.id === v.achado)?.achado;
    return [
      `- **${v.achado}** · veredito do PMO: ${v.veredito}`,
      a
        ? `  - achado do código: ${a.tipo} · ${a.parte} · ${a.titulo}`
        : "  - achado do código: (não está na lista)",
      a && itemDaFicha(a, o.partes) ? `  - item da ficha: ${itemDaFicha(a, o.partes)}` : "",
      a && !itemDaFicha(a, o.partes) ? `  - o que o código apontou: ${a.descricao}` : "",
      `  - motivo do PMO: ${v.motivo || "(sem motivo)"}`,
      ...v.evidencias.map((e) => `  - evidência do PMO: ${e.doc}, p. ${e.pagina}: "${e.trecho}"`),
    ]
      .filter(Boolean)
      .join("\n");
  };
  const pcs = o.premissas.filter((p) => o.premissasAplicaveis[p.codigo]);
  return `# Segunda instância leve — etapa 5, conferência dos vereditos do PMO
${o.identidade ? `\n${identidadeEmTexto(o.identidade)}\n` : ""}
Você é a segunda instância da etapa 5 (decisão 0077), numa rodada só. A leitura do PMO deu ${o.alvo.length} veredito(s) "falso" ou "regra_errada": cada um tira um achado do código do total, e nenhuma outra camada os confere. Acima vão as páginas que esses vereditos e os achados citam e as primeiras páginas da parte de cada achado. Abaixo, os vereditos e as premissas críticas que se aplicam, com os trechos do plano que as citam em cada lugar.

## Vereditos a conferir
${o.alvo.map(linhaDoVeredito).join("\n")}

## Premissas críticas que se aplicam (${pcs.length})
${
  pcs.length
    ? pcs
        .map((pc) =>
          [
            `- **${pc.codigo} — ${pc.titulo}.** O que se assume: ${pc.assume}`,
            ...trechosDaPremissa(pc, o.pgp, o.mapa).map((x) => `  - ${x}`),
          ].join("\n"),
        )
        .join("\n")
    : "- nenhuma"
}

# A régua
1. **Veredito "falso":** o trecho citado cobre o **item inteiro** da ficha, não só o tema. "processo de auditoria" não cobre "conclusões das auditorias". Cobre tudo → confirma. Cobre em parte → em_parte, dizendo a parte que falta. Não cobre → derruba. Item que é resultado da execução (conclusões, lições, medições) no plano inicial: confirma, se o PMO disse que não se aplica.
2. **Veredito "regra_errada":** a regra do código errou mesmo (o plano tem o conteúdo, ou o vago é pendência rastreada com marco)? Sim → confirma. Não → derruba, dizendo por que o achado vale.
3. **Sem base:** se as páginas que vieram não bastam para julgar, a revisão é sem_base, e o veredito do PMO fica como está. Nunca escolha confirma nem derruba sem ler o trecho.
4. **Premissa crítica:** tratada só se estiver escrita como premissa (o que se assume, de quem depende, consequência) nos três lugares: registro de premissas (B3), registro de riscos com gatilho (B27) e plano de mudanças com o reajuste (A11). Assunto citado sem a premissa escrita é so_citada; o que não aparece nas linhas enviadas é nao_localizada (o código não achou, não quer dizer que falta). Diga em "falta" os lugares.
5. Não reconfira o resto da leitura nem procure achado novo fora disso.

# Como responder
- vereditos: um por veredito acima, com achado (o id), revisao (confirma, derruba, em_parte ou sem_base), parteQueFalta (obrigatória em derruba e em_parte; "" nos outros), motivo (obrigatório) e evidencias (doc, página e trecho literal das páginas acima).
- premissas: uma por premissa crítica acima, com codigo, situacao (tratada, so_citada ou nao_localizada), falta, motivo e evidencias.
- conferido: o que você conferiu e passou, em frases curtas.
- Responda só com o objeto JSON, no schema enviado. Listas sem conteúdo ficam com [].`;
}

const NOME_REVISAO: Record<RevisaoDeVeredito["revisao"], string> = {
  confirma: "a segunda instância confirmou o veredito",
  derruba: "a segunda instância derrubou o veredito",
  em_parte: "a evidência cobre só parte do item",
  sem_base: "a segunda instância não teve base para julgar",
};

/**
 * Aplica a revisão aos vereditos (decisão 0077). Só vale para os vereditos que foram pedidos (os de
 * vereditosAConferir). "derruba" e "em_parte" com motivo ou parte que falta fazem o achado voltar a contar
 * ("sustenta"), marcado em revisadoPelaSegunda; sem motivo, a revisão é ignorada, com aviso. "confirma" e "sem_base"
 * deixam o veredito do PMO como está.
 */
export function aplicarSegundaEtapa5(
  vd: ResultadoVereditos,
  r: RespostaSegundaEtapa5 | undefined,
  leitura: RespostaLeitura | undefined,
): ResultadoVereditos {
  if (!r || !leitura) return vd;
  const pedidos = new Set(vereditosAConferir(leitura, vd.candidatos).map((v) => v.achado));
  const candidatos = vd.candidatos.map((c): CandidatoConferido => {
    const rev = r.vereditos.find((x) => x.achado === c.achado.id);
    if (!rev || !pedidos.has(c.achado.id) || rev.revisao === "confirma" || rev.revisao === "sem_base")
      return c;
    if (!rev.motivo.trim() && !rev.parteQueFalta.trim())
      return {
        ...c,
        avisos: [...c.avisos, `${NOME_REVISAO[rev.revisao]}, sem motivo: a revisão foi ignorada`],
      };
    const texto = `${NOME_REVISAO[rev.revisao]} (o PMO tinha dito "${c.situacao}"): ${rev.motivo}${rev.parteQueFalta ? ` Falta: ${rev.parteQueFalta}` : ""}`;
    return { ...c, situacao: "sustenta", revisadoPelaSegunda: texto, avisos: [...c.avisos, texto] };
  });
  return {
    ...vd,
    candidatos,
    contam: candidatos.filter((c) => c.situacao === "sustenta").map((c) => c.achado),
  };
}

/** A evidência citada pela segunda instância está na página? (como toda citação, decisão 0057) */
export function evidenciaConferida(e: FontePmo, documentos: DocumentoLido[]): boolean {
  return citacaoValeComoFato(conferirCitacao(e, documentos));
}

const fontesEmTexto = (es: FontePmo[], documentos: DocumentoLido[]) =>
  es.length
    ? ` (${es.map((e) => `${e.doc}, p. ${e.pagina}${evidenciaConferida(e, documentos) ? "" : ", citação não conferida"}`).join("; ")})`
    : "";

/** A segunda instância leve em texto (o conferencia-etapa-5-leitura-*.md do teste externo). */
export function segundaEtapa5EmTexto(
  r: RespostaSegundaEtapa5,
  antes: ResultadoVereditos,
  leitura: RespostaLeitura,
  documentos: DocumentoLido[],
): string {
  const depois = aplicarSegundaEtapa5(antes, r, leitura);
  const devolvidos = depois.candidatos.filter((c) => c.revisadoPelaSegunda);
  const naoTratadas = r.premissas.filter((p) => p.situacao !== "tratada");
  return [
    "# Segunda instância — etapa 5, leitura, rodada 1 (única, decisão 0077)",
    "",
    `Vereditos conferidos: ${r.vereditos.length}; achados que voltaram a contar: ${devolvidos.length}. Premissas críticas conferidas: ${r.premissas.length}; não tratadas por inteiro: ${naoTratadas.length}. Achados do código que contam agora: ${depois.contam.length} (antes: ${antes.contam.length}). Todo achado é Sugestão: quem decide é o GP.`,
    "",
    "## Vereditos",
    ...(r.vereditos.length
      ? r.vereditos.map(
          (v) =>
            `- **${v.revisao}** · ${v.achado}: ${v.motivo}${v.parteQueFalta ? ` Falta: ${v.parteQueFalta}` : ""}${fontesEmTexto(v.evidencias, documentos)}`,
        )
      : ["- nenhum"]),
    "",
    "## Premissas críticas",
    ...(r.premissas.length
      ? r.premissas.map(
          (p) =>
            `- **${p.situacao}** · ${p.codigo}: ${p.motivo}${p.falta ? ` Falta em: ${p.falta}` : ""}${fontesEmTexto(p.evidencias, documentos)}`,
        )
      : ["- nenhuma"]),
    "",
    "## O que foi conferido e passou",
    ...(r.conferido.length ? r.conferido.map((x) => `- ${x}`) : ["- (não informado)"]),
  ].join("\n");
}
