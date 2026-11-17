// O que foi dentro de um pedido ao PMO (teste externo): as seções e o tamanho de cada uma, os arquivos da skill
// (SKILL.md, referências, fichas inteiras ou só o conteúdo mínimo, artigos do Rework, método da etapa) e a
// comparação com a tabela "O que carregar em cada etapa" (SKILL.md, seção 5). O que a tabela manda e não foi sai
// como FALTA, e o pedido não é exportado até corrigir.
import { estimarTokens } from "../../src/pmo/montagem";

export interface ConteudoDoPedido {
  texto: string;
  faltas: string[];
}

const tam = (s: string) =>
  `${s.length.toLocaleString("pt-BR")} caracteres, ~${estimarTokens(s).toLocaleString("pt-BR")} tokens`;

/** Blocos `<arquivo nome="…">` do texto de sistema. */
function arquivosDoSistema(sistema: string): { nome: string; texto: string }[] {
  return [...sistema.matchAll(/<arquivo nome="([^"]+)">\n([\s\S]*?)\n<\/arquivo>/g)].map((m) => ({
    nome: m[1] ?? "",
    texto: m[2] ?? "",
  }));
}

/** Seções do pedido (títulos markdown de nível 1 a 3, fora de blocos de ficha). */
function secoesDoPedido(pedido: string): { titulo: string; texto: string }[] {
  const linhas = pedido.split("\n");
  const secoes: { titulo: string; texto: string[] }[] = [{ titulo: "(antes do primeiro título)", texto: [] }];
  let dentroDeFicha = false;
  for (const l of linhas) {
    if (/^<ficha /.test(l)) dentroDeFicha = true;
    if (!dentroDeFicha && /^#{1,3} /.test(l)) secoes.push({ titulo: l.replace(/^#+ /, ""), texto: [] });
    secoes.at(-1)!.texto.push(l);
    if (/^<\/ficha>/.test(l)) dentroDeFicha = false;
  }
  return secoes
    .filter((s) => s.texto.join("\n").trim())
    .map((s) => ({ titulo: s.titulo, texto: s.texto.join("\n") }));
}

/** A linha da tabela da seção 5 da SKILL.md para a etapa. */
function linhaDaTabela(skill: string, etapa: number): string {
  const sec = skill.slice(skill.indexOf("## 5. O que carregar em cada etapa"));
  return sec.split("\n").find((l) => l.startsWith(`| ${etapa} —`)) ?? "";
}

export function conteudoDoPedido(opcoes: {
  etapa: number;
  passo: string;
  sistema: string;
  documentos: string;
  pedido: string;
  schema: string;
  skill: string;
}): ConteudoDoPedido {
  const { etapa, passo, sistema, documentos, pedido, schema, skill } = opcoes;
  const arquivos = arquivosDoSistema(sistema);
  const nomes = arquivos.map((a) => a.nome);
  // segunda instância (decisão 0057): só a skill, os documentos e a resposta a conferir; a tabela da seção 5 não vale
  if (passo.startsWith("segunda-")) {
    const faltas: string[] = [];
    const conferencias: string[] = [];
    const confere = (oQue: string, ok: boolean) => {
      conferencias.push(`- ${ok ? "ok" : "**FALTA**"} · ${oQue}`);
      if (!ok) faltas.push(oQue);
    };
    confere("só a SKILL.md no texto de sistema", nomes.length === 1 && nomes[0] === "SKILL.md");
    confere("documentos do passo", /^=== Página /m.test(documentos));
    confere("resposta a conferir no pedido", /## Resposta a conferir/.test(pedido));
    const texto = [
      `# O que foi no pedido — etapa ${etapa}, passo ${passo} (segunda instância)`,
      "",
      `- Texto de sistema: ${tam(sistema)} (${nomes.join(", ") || "nenhum arquivo"})`,
      `- Documentos: ${tam(documentos)}`,
      `- Pedido (com a resposta a conferir): ${tam(pedido)}`,
      `- Schema JSON da resposta: ${tam(schema)}`,
      "",
      ...conferencias,
      "",
      faltas.length ? `**FALTA: ${faltas.join("; ")}.**` : "Nada faltando.",
    ].join("\n");
    return { texto: `${texto}\n`, faltas };
  }
  const fichasInteiras = [...pedido.matchAll(/<ficha parte="([^"]+)">/g)].map((m) => m[1] ?? "");
  // "### A7 — nome" seguido de "## Conteúdo mínimo" (etapa 5) ou só do "Quando dispensar" (adaptação da etapa 4)
  const cabecalhos = [...pedido.matchAll(/^### ([AB]\d{1,2}) — .+$/gm)].map((m) => ({
    codigo: m[1] ?? "",
    pos: m.index ?? 0,
  }));
  const fichasConteudoMinimo = cabecalhos
    .filter((c) => /^## Conteúdo mínimo/m.test(pedido.slice(c.pos, c.pos + 400)))
    .map((c) => c.codigo);
  const fichasSoDispensa = cabecalhos
    .filter((c) => !fichasConteudoMinimo.includes(c.codigo))
    .filter((c) => !/^## Conteúdo mínimo/m.test(pedido.slice(c.pos, c.pos + 400)))
    .map((c) => c.codigo);
  const metodo = /<metodo>|## Método da etapa/.test(pedido);
  // artigos do Rework: os citados nas fichas que foram dentro, e se o texto do artigo foi junto
  const textoFichas = [
    ...arquivos.filter((a) => a.nome.includes("artefatos/")).map((a) => a.texto),
    ...[...pedido.matchAll(/<ficha parte="[^"]+">\n([\s\S]*?)\n<\/ficha>/g)].map((m) => m[1] ?? ""),
  ].join("\n");
  const citadosRework = [...new Set([...textoFichas.matchAll(/\bRW-\d{3}\b/g)].map((m) => m[0]))];
  const reworks = arquivos.filter((a) => a.nome.startsWith("referencias/rework.md"));
  // o rework.md resume os artigos por tema ("**Artigos.** RW-071 (…); RW-072 (…)"): o artigo foi junto quando o
  // trecho do Rework que foi no pedido traz o id dele (as fichas citam o id, mas não trazem o resumo)
  const textoDoRework = reworks.map((a) => a.texto).join("\n");
  const artigoJunto = (id: string) => new RegExp(`\\b${id}\\b`).test(textoDoRework);
  const reworkFaltando = citadosRework.filter((id) => !artigoJunto(id));

  // ---------- comparação com a tabela da seção 5 ----------
  const linha = linhaDaTabela(skill, etapa);
  const faltas: string[] = [];
  const conferencias: string[] = [];
  const confere = (oQue: string, ok: boolean, obs = "") => {
    conferencias.push(`- ${ok ? "ok" : "**FALTA**"} · ${oQue}${obs ? ` — ${obs}` : ""}`);
    if (!ok) faltas.push(oQue);
  };
  const temArquivo = (n: string) =>
    nomes.some((x) => x === `referencias/${n}` || x.startsWith(`referencias/${n} `));
  const temFicha = (prefixo: string) => nomes.some((x) => x.startsWith(`referencias/artefatos/${prefixo}`));
  confere("SKILL.md", nomes.includes("SKILL.md"));
  for (const ref of [...linha.matchAll(/`([a-z0-9-]+\.md)`/g)].map((m) => m[1] ?? ""))
    confere(ref, temArquivo(ref));
  if (etapa === 1) confere("método da etapa 1 no pedido", metodo);
  if (etapa === 2) {
    for (const f of [
      "prop-estrategia",
      "prop-estrutura",
      "prop-entendimento",
      "prop-metodologia",
      "prop-sow",
      "prop-eap-cronograma",
      "prop-equipe",
      "prop-preco",
      "prop-matriz-atendimento",
    ])
      confere(`ficha ${f}`, temFicha(f));
    for (const f of ["a13", "b08", "b04", "b18"]) confere(`ficha ${f}`, temFicha(`${f}-`));
    conferencias.push(
      `- condicional · ficha prop-parceria (só no regime de parceria): ${temFicha("prop-parceria") ? "foi" : "não foi"}`,
    );
  }
  if (etapa === 3)
    for (const f of ["tap", "b03", "b31"]) confere(`ficha ${f}`, temFicha(f === "tap" ? "tap." : `${f}-`));
  if (etapa === 4) {
    if (passo === "adaptacao")
      confere(
        'seção "Quando dispensar" das fichas, para a adaptação',
        fichasSoDispensa.length > 0,
        `${fichasSoDispensa.length} partes`,
      );
    confere(
      "fichas inteiras das partes do passo",
      fichasInteiras.length > 0,
      fichasInteiras.join(", ") || "nenhuma",
    );
  }
  // em toda etapa que leva fichas inteiras, o artigo do Rework que elas citam vai com o resumo (o tema do rework.md)
  if (etapa >= 2 && etapa <= 4)
    confere(
      "artigos do rework.md citados nas fichas, com o resumo",
      reworkFaltando.length === 0,
      citadosRework.length
        ? `citados: ${citadosRework.join(", ")}${reworkFaltando.length ? `; sem o resumo: ${reworkFaltando.join(", ")}` : ""}`
        : "nenhum citado",
    );
  if (etapa === 5) {
    confere(
      "fichas das partes do mapa, só o conteúdo mínimo e as perguntas de qualidade",
      fichasConteudoMinimo.length > 0,
      `${fichasConteudoMinimo.length} partes`,
    );
    confere(
      "nenhuma ficha inteira (só o conteúdo mínimo)",
      fichasInteiras.length === 0,
      fichasInteiras.join(", "),
    );
  }

  const linhas = [
    `# O que foi no pedido — etapa ${etapa}, passo ${passo}`,
    "",
    "## Seções e tamanhos",
    `- Texto de sistema: ${tam(sistema)}`,
    ...arquivos.map((a) => `  - \`${a.nome}\`: ${tam(a.texto)}`),
    `- Documentos (texto dos PDFs, página a página): ${tam(documentos)}; ${(documentos.match(/^=== Página /gm) ?? []).length} páginas`,
    `- Pedido: ${tam(pedido)}`,
    ...secoesDoPedido(pedido).map((s) => `  - ${s.titulo}: ${tam(s.texto)}`),
    `- Schema JSON da resposta: ${tam(schema)}`,
    `- **Total de entrada: ~${(estimarTokens(sistema) + estimarTokens(documentos) + estimarTokens(pedido)).toLocaleString("pt-BR")} tokens**`,
    "",
    "## Arquivos da skill que foram dentro",
    ...nomes.map((n) => `- ${n} (inteiro, no texto de sistema)`),
    ...(fichasInteiras.length ? [`- Fichas inteiras no pedido: ${fichasInteiras.join(", ")}`] : []),
    ...(fichasConteudoMinimo.length
      ? [`- Fichas só com o conteúdo mínimo e as perguntas de qualidade: ${fichasConteudoMinimo.join(", ")}`]
      : []),
    ...(fichasSoDispensa.length
      ? [`- Fichas só com "Quando dispensar": ${fichasSoDispensa.join(", ")}`]
      : []),
    `- Artigos do Rework citados nas fichas: ${citadosRework.join(", ") || "nenhum"}${reworkFaltando.length ? ` (sem o resumo no trecho do rework.md que foi junto: ${reworkFaltando.join(", ")})` : ""}`,
    `- Método da etapa no pedido: ${metodo ? "sim" : etapa === 1 ? "não" : "não (esperado: a tabela da seção 5 só manda o da etapa 1; nas etapas 2 a 5, o método está na seção da etapa na SKILL.md)"}`,
    "",
    "## Comparação com a tabela da seção 5 da SKILL.md",
    `Linha da tabela: ${linha.replace(/^\| /, "").replace(/ \|$/, "") || "(não achada)"}`,
    "",
    ...conferencias,
    "",
    faltas.length
      ? `**FALTA: ${faltas.join("; ")}. O pedido não foi exportado; corrigir antes.**`
      : "Nada faltando em relação à tabela.",
  ];
  return { texto: `${linhas.join("\n")}\n`, faltas };
}
