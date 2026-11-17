// Montagem do pedido ao PMO: a skill (fonte única, importada no build com ?raw) vai como instrução de sistema, com
// cache; o texto dos documentos vai uma vez, também com cache; depois, o pedido do passo, que muda a cada chamada.
// Ordem pensada para o cache (prefixo igual entre os passos): skill → documentos → pedido.
import textoSkill from "../../.claude/skills/pmo/SKILL.md?raw";
import textoChecklist from "../../.claude/skills/pmo/referencias/checklist.md?raw";
import textoExperiencia from "../../.claude/skills/pmo/referencias/experiencia.md?raw";
import textoLicitacoes from "../../.claude/skills/pmo/referencias/licitacoes.md?raw";
import textoPmbok7 from "../../.claude/skills/pmo/referencias/pmbok7.md?raw";
import textoRework from "../../.claude/skills/pmo/referencias/rework.md?raw";
import type { DocumentoLido } from "../dossie/esquema";

const fichas = import.meta.glob("../../.claude/skills/pmo/referencias/artefatos/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function ficha(nomeArquivoSemExtensao: string): string {
  const achada = Object.entries(fichas).find(([c]) => c.endsWith(`/${nomeArquivoSemExtensao}.md`));
  if (!achada) throw new Error(`Ficha da skill não encontrada: ${nomeArquivoSemExtensao}`);
  return achada[1];
}

/**
 * Os temas do rework.md (seções 1 a 5; o quadro de cobertura fica fora), cada um com o resumo e a lista dos artigos
 * que ele cobre ("**Artigos.** RW-071 (…); RW-072 (…)"). Seção com subseções vira um tema por subseção.
 */
export function temasDoRework(texto = textoRework): { titulo: string; texto: string }[] {
  const linhas = texto.split("\n");
  const temas: { titulo: string; texto: string[] }[] = [];
  let secao = "";
  let dentro = false;
  for (const l of linhas) {
    const s = /^## (\d+)\. /.exec(l);
    if (s) {
      dentro = Number(s[1]) >= 1 && Number(s[1]) <= 5;
      secao = l.replace(/^## /, "");
      if (dentro) temas.push({ titulo: secao, texto: [l] });
      continue;
    }
    if (/^## /.test(l)) {
      dentro = false;
      continue;
    }
    if (!dentro) continue;
    if (/^### /.test(l)) {
      temas.push({ titulo: `${secao} › ${l.replace(/^### /, "")}`, texto: [`## ${secao}`, l] });
      continue;
    }
    temas.at(-1)?.texto.push(l);
  }
  return temas
    .map((t) => ({ titulo: t.titulo, texto: t.texto.join("\n").trim() }))
    .filter((t) => t.texto.split("\n").length > 1);
}

/** Os artigos do Rework citados num texto (as fichas citam "RW-022"). */
export const artigosCitados = (texto: string): string[] => [
  ...new Set([...texto.matchAll(/\bRW-\d{3}\b/g)].map((m) => m[0])),
];

/**
 * Os temas do rework.md que resumem os artigos citados (SKILL.md, seção 5: "os artigos do rework.md citados nelas").
 * Tema que já vai noutro bloco (a seção 4, na etapa 2) não se repete.
 */
export function reworkDosArtigos(ids: string[], jaIncluido = ""): string {
  const temas = temasDoRework().filter(
    (t) => ids.some((id) => new RegExp(`\\b${id}\\b`).test(t.texto)) && !jaIncluido.includes(t.texto),
  );
  return temas.map((t) => t.texto).join("\n\n");
}

/** Só a seção da proposta do rework.md (SKILL.md, seção 5). */
export function secaoPropostaDoRework(texto = textoRework): string {
  const ini = texto.indexOf("## 4. Proposta");
  const fim = texto.indexOf("\n## 5.", ini);
  return ini < 0 ? texto : texto.slice(ini, fim < 0 ? undefined : fim);
}

/** Fichas da etapa 2 (SKILL.md, seção 5): as partes da proposta e as de EAP, durações, bases e equipe. */
export const FICHAS_ETAPA_2 = [
  "prop-estrategia",
  "prop-estrutura",
  "prop-entendimento",
  "prop-metodologia",
  "prop-sow",
  "prop-eap-cronograma",
  "prop-equipe",
  "prop-preco",
  "prop-matriz-atendimento",
  "a13-linha-base-escopo",
  "b08-estimativas-duracao",
  "b04-bases-estimativas",
  "b18-designacoes-equipe",
];

export interface BlocoTexto {
  titulo: string;
  texto: string;
}

/** O que vai como instrução de sistema na etapa 2: o SKILL.md e as referências da etapa. */
export function referenciasEtapa2(): BlocoTexto[] {
  const fichasDaEtapa = FICHAS_ETAPA_2.map((f) => ({
    titulo: `referencias/artefatos/${f}.md`,
    texto: ficha(f),
  }));
  const secao4 = secaoPropostaDoRework();
  // os artigos que as fichas citam e a seção 4 não resume vão com o tema deles (SKILL.md, seção 5)
  const outros = reworkDosArtigos(artigosCitados(fichasDaEtapa.map((f) => f.texto).join("\n")), secao4);
  return [
    { titulo: "SKILL.md", texto: textoSkill },
    { titulo: "referencias/licitacoes.md", texto: textoLicitacoes },
    { titulo: "referencias/checklist.md", texto: textoChecklist },
    { titulo: "referencias/experiencia.md", texto: textoExperiencia },
    { titulo: "referencias/rework.md (seção 4, proposta)", texto: secao4 },
    ...(outros
      ? [{ titulo: "referencias/rework.md (temas dos artigos citados nas fichas)", texto: outros }]
      : []),
    ...fichasDaEtapa,
  ];
}

/** Fichas da etapa 3 (SKILL.md, seção 5): o TAP, o registro de premissas e o de partes interessadas. */
export const FICHAS_ETAPA_3 = ["tap", "b03-registro-premissas", "b31-registro-partes-interessadas"];

/** O que vai como instrução de sistema na etapa 3. */
export function referenciasEtapa3(): BlocoTexto[] {
  const fichasDaEtapa = FICHAS_ETAPA_3.map((f) => ({
    titulo: `referencias/artefatos/${f}.md`,
    texto: ficha(f),
  }));
  // os temas do rework.md que resumem os artigos citados nas fichas (SKILL.md, seção 5)
  const rework = reworkDosArtigos(artigosCitados(fichasDaEtapa.map((f) => f.texto).join("\n")));
  return [
    { titulo: "SKILL.md", texto: textoSkill },
    { titulo: "referencias/checklist.md", texto: textoChecklist },
    { titulo: "referencias/experiencia.md", texto: textoExperiencia },
    ...(rework
      ? [{ titulo: "referencias/rework.md (temas dos artigos citados nas fichas)", texto: rework }]
      : []),
    ...fichasDaEtapa,
  ];
}

/**
 * O que vai como instrução de sistema na etapa 4 (SKILL.md, seção 5). As fichas das partes vão no pedido de cada
 * passo, e não aqui: assim o prefixo (skill + documentos) é o mesmo nos seis passos e fica no cache.
 */
export function referenciasEtapa4(): BlocoTexto[] {
  // os temas do rework.md citados nas fichas do PGP (A1…B33), todos de uma vez: assim o prefixo é o mesmo nos seis
  // passos e fica no cache (SKILL.md, seção 5)
  const doPgp = Object.entries(fichas)
    .filter(([c]) => /\/[ab]\d{2}-/.test(c))
    .map(([, t]) => t)
    .join("\n");
  const rework = reworkDosArtigos(artigosCitados(doPgp));
  return [
    { titulo: "SKILL.md", texto: textoSkill },
    { titulo: "referencias/pmbok7.md", texto: textoPmbok7 },
    { titulo: "referencias/checklist.md", texto: textoChecklist },
    { titulo: "referencias/experiencia.md", texto: textoExperiencia },
    { titulo: "referencias/licitacoes.md", texto: textoLicitacoes },
    ...(rework
      ? [{ titulo: "referencias/rework.md (temas dos artigos citados nas fichas do PGP)", texto: rework }]
      : []),
  ];
}

/** Arquivo da ficha de uma parte do PGP pelo código (A1 → a01-…, B27 → b27-…). */
export function fichaDaParte(codigo: string): string | undefined {
  const m = /^([AB])(\d+)$/.exec(codigo);
  if (!m) return undefined;
  const prefixo = `/${m[1]!.toLowerCase()}${m[2]!.padStart(2, "0")}-`;
  return Object.entries(fichas).find(([c]) => c.includes(prefixo))?.[1];
}

/** As fichas inteiras das partes, para o pedido do passo. */
export function fichasDasPartes(codigos: string[]): string {
  return codigos
    .map((c) => {
      const f = fichaDaParte(c);
      return f ? `<ficha parte="${c}">\n${f.replace(/^---[\s\S]*?---\s*/, "").trim()}\n</ficha>` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

/** Só o "Quando dispensar" de cada ficha, para a adaptação (as 51 fichas inteiras passariam de 100 mil tokens). */
export function dispensaDasFichas(codigos: string[]): string {
  return codigos
    .map((c) => {
      const f = fichaDaParte(c) ?? "";
      const nome = /^nome:\s*(.+)$/m.exec(f)?.[1] ?? c;
      const ini = f.indexOf("## Quando dispensar");
      const fim = ini < 0 ? -1 : f.indexOf("\n## ", ini + 5);
      const secao =
        ini < 0
          ? "(sem a seção)"
          : f
              .slice(ini, fim < 0 ? undefined : fim)
              .replace(/^## [^\n]*\n/, "")
              .trim();
      return `### ${c} — ${nome}\n${secao}`;
    })
    .join("\n\n");
}

/** O que vai como instrução de sistema na leitura do PMO da etapa 1 (decisões 0032 e 0035). */
export function referenciasEtapa1(): BlocoTexto[] {
  return [
    { titulo: "SKILL.md", texto: textoSkill },
    { titulo: "referencias/licitacoes.md", texto: textoLicitacoes },
    { titulo: "referencias/checklist.md", texto: textoChecklist },
    { titulo: "referencias/experiencia.md", texto: textoExperiencia },
  ];
}

/** O que vai como instrução de sistema na leitura do PMO da etapa 5 (SKILL.md, seção 5). */
export function referenciasEtapa5(): BlocoTexto[] {
  return [
    { titulo: "SKILL.md", texto: textoSkill },
    { titulo: "referencias/checklist.md", texto: textoChecklist },
    { titulo: "referencias/experiencia.md", texto: textoExperiencia },
  ];
}

/** Só o conteúdo mínimo e as perguntas de qualidade de cada ficha (SKILL.md, seção 5, etapa 5). */
export function conteudoMinimoDasFichas(codigos: string[]): string {
  const secao = (f: string, titulo: string) => {
    const ini = f.indexOf(`## ${titulo}`);
    if (ini < 0) return "";
    const fim = f.indexOf("\n## ", ini + 4);
    return f.slice(ini, fim < 0 ? undefined : fim).trim();
  };
  return codigos
    .map((c) => {
      const f = fichaDaParte(c);
      if (!f) return "";
      const nome = /^nome:\s*(.+)$/m.exec(f)?.[1] ?? c;
      return [`### ${c} — ${nome}`, secao(f, "Conteúdo mínimo"), secao(f, "Perguntas de qualidade")]
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

export function textoDeSistema(blocos: BlocoTexto[]): string {
  return [
    "Você está sendo usado pelo app Raio-X do Projeto, na etapa indicada no pedido. Siga a skill abaixo à risca.",
    ...blocos.map((b) => `<arquivo nome="${b.titulo}">\n${b.texto.trim()}\n</arquivo>`),
  ].join("\n\n");
}

/**
 * Texto dos documentos, página a página ("=== Página N ===", a página do arquivo PDF), como a skill pede.
 * Página sem texto legível vai marcada: o PMO não pode citar o que o código não leu.
 */
export function textoDosDocumentos(documentos: DocumentoLido[]): string {
  const partes: string[] = [];
  for (const d of documentos) {
    const papel =
      d.papel === "anexo-rfp"
        ? "anexo da RFP (doc: rfp)"
        : d.papel === "rfp"
          ? "RFP (doc: rfp)"
          : `${d.papel === "proposta" ? "proposta" : d.papel.toUpperCase()} (doc: ${d.papel})`;
    partes.push(`<documento papel="${papel}" arquivo="${d.nomeArquivo}" paginas="${d.totalPaginas}">`);
    for (const p of d.paginas) {
      partes.push(`=== Página ${p.numero} ===`);
      partes.push(
        p.origem === "nao-verificavel"
          ? "[página sem texto legível: não citar; o que estiver nela fica 'não verificável']"
          : p.texto.trim(),
      );
    }
    partes.push("</documento>");
  }
  return partes.join("\n");
}

/** Estimativa grosseira usada só para mostrar o custo antes: 4 caracteres por token. */
export function estimarTokens(texto: string): number {
  return Math.ceil(texto.length / 4);
}
