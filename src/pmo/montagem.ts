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
  return [
    { titulo: "SKILL.md", texto: textoSkill },
    { titulo: "referencias/licitacoes.md", texto: textoLicitacoes },
    { titulo: "referencias/checklist.md", texto: textoChecklist },
    { titulo: "referencias/experiencia.md", texto: textoExperiencia },
    { titulo: "referencias/rework.md (seção 4, proposta)", texto: secaoPropostaDoRework() },
    ...FICHAS_ETAPA_2.map((f) => ({ titulo: `referencias/artefatos/${f}.md`, texto: ficha(f) })),
  ];
}

/** Fichas da etapa 3 (SKILL.md, seção 5): o TAP, o registro de premissas e o de partes interessadas. */
export const FICHAS_ETAPA_3 = ["tap", "b03-registro-premissas", "b31-registro-partes-interessadas"];

/** O que vai como instrução de sistema na etapa 3. */
export function referenciasEtapa3(): BlocoTexto[] {
  return [
    { titulo: "SKILL.md", texto: textoSkill },
    { titulo: "referencias/checklist.md", texto: textoChecklist },
    { titulo: "referencias/experiencia.md", texto: textoExperiencia },
    ...FICHAS_ETAPA_3.map((f) => ({ titulo: `referencias/artefatos/${f}.md`, texto: ficha(f) })),
  ];
}

/**
 * O que vai como instrução de sistema na etapa 4 (SKILL.md, seção 5). As fichas das partes vão no pedido de cada
 * passo, e não aqui: assim o prefixo (skill + documentos) é o mesmo nos seis passos e fica no cache.
 */
export function referenciasEtapa4(): BlocoTexto[] {
  return [
    { titulo: "SKILL.md", texto: textoSkill },
    { titulo: "referencias/pmbok7.md", texto: textoPmbok7 },
    { titulo: "referencias/checklist.md", texto: textoChecklist },
    { titulo: "referencias/experiencia.md", texto: textoExperiencia },
    { titulo: "referencias/licitacoes.md", texto: textoLicitacoes },
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
