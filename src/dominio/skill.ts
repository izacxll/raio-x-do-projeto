// Carrega a skill PMO no build: fichas e premissas críticas, lidas dos mesmos arquivos que o PMO usa (fonte única).
import { lerFicha, type Ficha } from "./fichas";
import { lerPremissas, type PremissaCritica } from "./premissas";

const arquivosFichas = import.meta.glob("../../.claude/skills/pmo/referencias/artefatos/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

import textoChecklist from "../../.claude/skills/pmo/referencias/checklist.md?raw";

export const FICHAS: Ficha[] = Object.entries(arquivosFichas)
  .filter(([caminho]) => !caminho.endsWith("_modelo.md"))
  .map(([caminho, texto]) => lerFicha(texto, caminho.split("/").pop() ?? caminho));

/** As 51 partes do PGP (18 componentes e 33 documentos), em ordem: A1…A18, B1…B33. */
export const PARTES_PGP: Ficha[] = FICHAS.filter((f) => /^[AB]\d+$/.test(f.codigo)).sort((a, b) => {
  const ordem = (c: string) => (c[0] === "A" ? 0 : 100) + Number(c.slice(1));
  return ordem(a.codigo) - ordem(b.codigo);
});

export const PREMISSAS_CRITICAS: PremissaCritica[] = lerPremissas(textoChecklist);

export function buscarParte(codigo: string): Ficha | undefined {
  return PARTES_PGP.find((p) => p.codigo === codigo);
}
