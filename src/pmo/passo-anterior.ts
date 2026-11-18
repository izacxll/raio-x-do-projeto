// TAP revisado no pedido da segunda instância do registro de premissas (decisão 0068). O pedido das premissas leva do
// TAP só os limites e o risco geral; para conferir a coerência, o revisor ia buscar o TAP em outro arquivo e achava uma
// versão velha (a da última conferência, antes do "seguir" do GP). Vai o TAP como o app o exporta: com o texto que o
// GP editou e sem o que ele descartou. Só neste passo: os outros já levam resumos do anterior, e o custo de mandar o
// passo anterior inteiro em todos (+5 a +21 mil tokens por chamada) não se paga.
import type { Dossie } from "../dossie/esquema";
import { tapDoDossieComoDocumento } from "../etapas/4-pgp/entrada";

export interface PassoAnterior {
  /** O passo de onde veio ("tap"). */
  passo: string;
  /** O "em" da resposta do passo anterior que foi usada. */
  em: string;
  /**
   * A versão que o revisor recebeu: o "em" e uma impressão do texto revisado (editar ou descartar um item do TAP muda
   * o texto e não o "em"). A conferência guardada com outra versão fica velha.
   */
  versao: string;
  /** O texto revisado, página por página, como o app o exporta. */
  texto: string;
}

/** Impressão curta do texto (djb2): só para saber se mudou, não é segurança. */
function impressao(texto: string): string {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * O TAP revisado para a segunda instância das premissas, sem o registro de premissas (é ele que está sendo conferido).
 * undefined nos outros passos ou sem o TAP no dossiê.
 */
export function passoAnteriorFinal(d: Dossie, etapa: number, passo: string): PassoAnterior | undefined {
  if (etapa !== 3 || passo !== "premissas" || !d.tap?.tap) return undefined;
  const doc = tapDoDossieComoDocumento({ ...d, tap: { ...d.tap, premissas: undefined } });
  if (!doc) return undefined;
  const texto = doc.paginas.map((p) => `=== Página ${p.numero} ===\n${p.texto.trim()}`).join("\n");
  return { passo: "tap", em: d.tap.tap.em, versao: `${d.tap.tap.em}#${impressao(texto)}`, texto };
}

/** O bloco do pedido: o TAP revisado, com a versão e o aviso de que é o que vale. */
export function passoAnteriorEmTexto(a: PassoAnterior): string {
  return `## TAP revisado pelo GP (a versão que seguiu, de ${a.em})
É com este TAP que se confere a coerência do registro de premissas: com o texto que o GP editou e sem os itens que ele descartou. Versões anteriores do TAP e conferências antigas não valem.
<tap-revisado>
${a.texto}
</tap-revisado>`;
}
