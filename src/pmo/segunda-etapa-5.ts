// Segunda instância leve da etapa 5 (decisão 0077). Roda só quando o PMO deu ao menos um veredito "falso" ou
// "regra_errada": esses vereditos tiram um achado do código do total, e nenhuma outra camada os confere. O pedido
// leva só esses vereditos (com o item da ficha), as páginas que eles citam e, para cada premissa crítica que se
// aplica, os trechos do plano que a citam (~1 mil tokens cada). Uma rodada, no modelo mais barato por padrão.
// A régua: o trecho cobre o item inteiro da ficha, não só o tema; cobre em parte → o achado vale, com o que falta.
import type { DocumentoLido, PaginaLida } from "../dossie/esquema";
import type { PremissaCritica } from "../dominio/premissas";
import type { Ficha } from "../dominio/fichas";
import type { CandidatoConferido, ResultadoVereditos } from "../etapas/5-conferencia/candidatos";
import type { Achado } from "../regras/achado";
import { type IdentidadeDoCaso, identidadeEmTexto } from "./identidade-do-caso";
import type { RespostaLeitura } from "./schemas/leitura";
import type { RespostaSegundaEtapa5, RevisaoDeVeredito } from "./schemas/segunda-etapa-5";

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

/** Roda só com ao menos um veredito "falso" ou "regra_errada" (decisão 0077). */
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

/** As páginas citadas pelos vereditos e pelas evidências dos próprios achados (na regra errada, sem citação). */
export function documentosDaSegundaEtapa5(
  documentos: DocumentoLido[],
  vereditos: RespostaLeitura["vereditos"],
  achados: Achado[],
): DocumentoLido[] {
  const citadas = new Set<string>();
  for (const v of vereditos) for (const e of v.evidencias) citadas.add(`${e.doc}:${e.pagina}`);
  for (const a of achados)
    for (const e of a.evidencias)
      if (e.documento !== "ficha" && e.pagina !== undefined) citadas.add(`${e.documento}:${e.pagina}`);
  const doc = (d: DocumentoLido) => (d.papel === "anexo-rfp" ? "rfp" : d.papel);
  return documentos
    .map((d) => ({ ...d, paginas: d.paginas.filter((p) => citadas.has(`${doc(d)}:${p.numero}`)) }))
    .filter((d) => d.paginas.length);
}

/**
 * Os trechos do plano que citam a premissa crítica (o código "PC3" ou os sinais dela), até seis linhas de até 350
 * caracteres, com a página: o revisor diz se ela está escrita como premissa nos três lugares.
 */
export function trechosDaPremissa(pc: PremissaCritica, pgp: PaginaLida[]): string[] {
  const termos = [pc.codigo, ...pc.sinaisNoPlano.termos].map((t) => t.toLowerCase());
  const out: string[] = [];
  for (const p of pgp)
    for (const l of p.texto.split("\n")) {
      const t = l.toLowerCase();
      if (out.length >= 6) return out;
      if (termos.some((x) => x && t.includes(x))) out.push(`p. ${p.numero}: ${l.trim().slice(0, 350)}`);
    }
  return out;
}

/** O pedido da segunda instância leve (as páginas citadas vão à parte, como documentos). */
export function pedidoSegundaEtapa5(o: {
  leitura: RespostaLeitura;
  candidatos: CandidatoConferido[];
  partes: Ficha[];
  premissas: PremissaCritica[];
  premissasAplicaveis: Record<string, boolean>;
  pgp: PaginaLida[];
  identidade?: IdentidadeDoCaso;
}): string {
  const alvo = vereditosAConferir(o.leitura, o.candidatos);
  const linhaDoVeredito = (v: RespostaLeitura["vereditos"][number]) => {
    const c = o.candidatos.find((x) => x.achado.id === v.achado);
    const a = c?.achado;
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
Você é a segunda instância da etapa 5 (decisão 0077), numa rodada só. A leitura do PMO deu ${alvo.length} veredito(s) "falso" ou "regra_errada": cada um tira um achado do código do total, e nenhuma outra camada os confere. Acima vão só as páginas que esses vereditos e os achados citam. Abaixo, os vereditos e as premissas críticas que se aplicam, com os trechos do plano que as citam.

## Vereditos a conferir
${alvo.map(linhaDoVeredito).join("\n")}

## Premissas críticas que se aplicam (${pcs.length})
${
  pcs.length
    ? pcs
        .map((pc) => {
          const t = trechosDaPremissa(pc, o.pgp);
          return [
            `- **${pc.codigo} — ${pc.titulo}.** O que se assume: ${pc.assume}`,
            ...(t.length ? t.map((x) => `  - ${x}`) : ["  - (nenhum trecho do plano cita esta premissa)"]),
          ].join("\n");
        })
        .join("\n")
    : "- nenhuma"
}

# A régua
1. **Veredito "falso":** o trecho citado cobre o **item inteiro** da ficha, não só o tema. "processo de auditoria" não cobre "conclusões das auditorias". Cobre tudo → confirma. Cobre em parte → em_parte, dizendo a parte que falta. Não cobre → derruba. Item que é resultado da execução (conclusões, lições, medições) no plano inicial: confirma, se o PMO disse que não se aplica.
2. **Veredito "regra_errada":** a regra do código errou mesmo (o plano tem o conteúdo, ou o vago é pendência rastreada com marco)? Sim → confirma. Não → derruba, dizendo por que o achado vale.
3. **Premissa crítica:** tratada só se estiver escrita como premissa (o que se assume, de quem depende, consequência) nos três lugares: registro de premissas (B3), registro de riscos com gatilho (B27) e plano de mudanças com o reajuste (A11). Assunto citado sem a premissa escrita é so_citada; diga em "falta" os lugares que faltam.
4. Não reconfira o resto da leitura nem procure achado novo fora disso. Se não der para julgar com as páginas que vieram, diga em "conferido", sem inventar.

# Como responder
- vereditos: um por veredito acima, com achado (o id), revisao (confirma, derruba ou em_parte), parteQueFalta (obrigatória em derruba e em_parte; "" em confirma), motivo e evidencias (doc, página e trecho literal das páginas acima).
- premissas: uma por premissa crítica acima, com codigo, situacao (tratada, so_citada ou ausente), falta, motivo e evidencias.
- conferido: o que você conferiu e passou, em frases curtas.
- Responda só com o objeto JSON, no schema enviado. Listas sem conteúdo ficam com [].`;
}

const NOME_REVISAO: Record<RevisaoDeVeredito["revisao"], string> = {
  confirma: "a segunda instância confirmou o veredito",
  derruba: "a segunda instância derrubou o veredito",
  em_parte: "a evidência cobre só parte do item",
};

/**
 * Aplica a revisão aos vereditos (decisão 0077): o veredito derrubado, ou que cobre só em parte, vira "sustenta" e o
 * achado volta a contar, com a parte que falta no aviso. O confirmado fica como estava.
 */
export function aplicarSegundaEtapa5(
  vd: ResultadoVereditos,
  r: RespostaSegundaEtapa5 | undefined,
): ResultadoVereditos {
  if (!r) return vd;
  const candidatos = vd.candidatos.map((c) => {
    const rev = r.vereditos.find((x) => x.achado === c.achado.id);
    if (!rev || rev.revisao === "confirma" || c.situacao === "sustenta") return c;
    return {
      ...c,
      situacao: "sustenta" as const,
      avisos: [
        ...c.avisos,
        `${NOME_REVISAO[rev.revisao]} (${c.situacao}): ${rev.motivo}${rev.parteQueFalta ? ` Falta: ${rev.parteQueFalta}` : ""}`,
      ],
    };
  });
  return {
    ...vd,
    candidatos,
    contam: candidatos.filter((c) => c.situacao === "sustenta").map((c) => c.achado),
  };
}

/** A segunda instância leve em texto (o conferencia-etapa-5-leitura-*.md do teste externo e o resumo da tela). */
export function segundaEtapa5EmTexto(r: RespostaSegundaEtapa5, antes: ResultadoVereditos): string {
  const derrubados = r.vereditos.filter((v) => v.revisao !== "confirma");
  const naoTratadas = r.premissas.filter((p) => p.situacao !== "tratada");
  return [
    "# Segunda instância — etapa 5, leitura, rodada 1 (única, decisão 0077)",
    "",
    `Vereditos conferidos: ${r.vereditos.length}; derrubados ou cobertos só em parte: ${derrubados.length} (os achados voltam a contar). Premissas críticas conferidas: ${r.premissas.length}; não tratadas por inteiro: ${naoTratadas.length}. Achados do código que contam agora: ${aplicarSegundaEtapa5(antes, r).contam.length} (antes: ${antes.contam.length}). Todo achado é Sugestão: quem decide é o GP.`,
    "",
    "## Vereditos",
    ...(r.vereditos.length
      ? r.vereditos.map(
          (v) =>
            `- **${v.revisao}** · ${v.achado}: ${v.motivo}${v.parteQueFalta ? ` Falta: ${v.parteQueFalta}` : ""}${v.evidencias.length ? ` (${v.evidencias.map((e) => `${e.doc}, p. ${e.pagina}`).join("; ")})` : ""}`,
        )
      : ["- nenhum"]),
    "",
    "## Premissas críticas",
    ...(r.premissas.length
      ? r.premissas.map(
          (p) =>
            `- **${p.situacao}** · ${p.codigo}: ${p.motivo}${p.falta ? ` Falta em: ${p.falta}` : ""}${p.evidencias.length ? ` (${p.evidencias.map((e) => `${e.doc}, p. ${e.pagina}`).join("; ")})` : ""}`,
        )
      : ["- nenhuma"]),
    "",
    "## O que foi conferido e passou",
    ...(r.conferido.length ? r.conferido.map((x) => `- ${x}`) : ["- (não informado)"]),
  ].join("\n");
}
