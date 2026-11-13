// Montagem do pedido ao PMO: a skill (fonte única, importada no build com ?raw) vai como instrução de sistema, com
// cache; o texto dos documentos vai uma vez, também com cache; depois, o pedido do passo, que muda a cada chamada.
// Ordem pensada para o cache (prefixo igual entre os passos): skill → documentos → pedido.
import textoSkill from "../../.claude/skills/pmo/SKILL.md?raw";
import textoChecklist from "../../.claude/skills/pmo/referencias/checklist.md?raw";
import textoExperiencia from "../../.claude/skills/pmo/referencias/experiencia.md?raw";
import textoLicitacoes from "../../.claude/skills/pmo/referencias/licitacoes.md?raw";
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
      d.papel === "anexo-rfp" ? "anexo da RFP (doc: rfp)" : d.papel === "rfp" ? "RFP (doc: rfp)" : d.papel;
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
