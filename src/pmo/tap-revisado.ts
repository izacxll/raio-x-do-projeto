// TAP revisado no pedido da segunda instância do registro de premissas (decisão 0068). O pedido das premissas leva do
// TAP só os limites e o risco geral; para conferir a coerência, o revisor ia buscar o TAP em outro arquivo e achava uma
// versão velha (a da última conferência, antes do "seguir" do GP). Vão os itens do TAP como o GP os deixou: com o
// rótulo conferido (página ou "citação não conferida"), o texto editado e sem os descartados, mais os campos que só o GP
// preenche. Não vão a aprovação nem o registro de premissas, que é o conferido. Só neste passo: os outros já levam
// resumos do anterior, e mandar o passo anterior em todos não se paga.
import type { TapDossie } from "../dossie/esquema";
import { type ItemConferido, itensValidos, rotuloDoItem, textoFinal } from "./itens";

const decisaoDoGp = (v?: string) => `[Decisão do GP] ${v?.trim() || "a definir pelo GP"}`;

export interface TapRevisado {
  /** O "em" da resposta do TAP usada. */
  em: string;
  /**
   * A versão que o revisor recebeu: o "em" e uma impressão do bloco (editar ou descartar um item, ou mudar um campo do
   * GP, muda o bloco e não o "em"; aceitar sem editar e aprovar o TAP não mudam). A conferência guardada com outra
   * versão fica velha.
   */
  versao: string;
  /** Os itens válidos, por elemento do TAP, com o rótulo e o texto final, e os campos do GP. */
  texto: string;
}

/** Impressão curta do texto (djb2): só para saber se mudou, não é segurança. */
function calcularImpressao(texto: string): string {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * O TAP revisado pelo GP. `itens` são os itens da etapa 3 já conferidos contra os documentos (os da tela do TAP); só os
 * do passo "tap" entram. undefined sem o TAP.
 */
export function montarTapRevisado(t: TapDossie | undefined, itens: ItemConferido[]): TapRevisado | undefined {
  if (!t?.tap) return undefined;
  const grupos = new Map<string, string[]>();
  for (const i of itensValidos(
    t.revisoes,
    itens.filter((x) => x.passo === "tap"),
  )) {
    const linha = `- ${rotuloDoItem(i)} ${textoFinal(i, t.revisoes)}${i.complemento ? ` ${i.complemento}` : ""}`;
    grupos.set(i.grupo, [...(grupos.get(i.grupo) ?? []), linha]);
  }
  // os campos que só o GP preenche (TAP.7, TAP.11 e TAP.12); a aprovação não entra
  const d = t.decisoes;
  const campos = [
    `- Recursos financeiros pré-aprovados: ${decisaoDoGp(d.recursos)}`,
    `- Gerente do projeto: ${decisaoDoGp(d.gerente)}`,
    `- Responsabilidade e nível de autoridade: ${decisaoDoGp(d.autoridade)}`,
    `- Patrocinador: ${decisaoDoGp(d.patrocinador)}`,
    `- Autoridade do patrocinador e escalonamento: ${decisaoDoGp(d.autoridadePatrocinador)}`,
  ];
  const texto = [
    ...[...grupos].map(([g, linhas]) => `### ${g}\n${linhas.join("\n")}`),
    `### Campos do GP no TAP\n${campos.join("\n")}`,
  ].join("\n\n");
  return { em: t.tap.em, versao: `${t.tap.em}#${calcularImpressao(texto)}`, texto };
}

/** O título do bloco traz a versão: a importação da resposta do revisor lê de lá qual TAP foi no pedido. */
const TITULO = "## TAP revisado pelo GP (versão ";

/** A versão do TAP revisado que foi num pedido já exportado; undefined se o pedido não traz o bloco. */
export function lerVersaoDoTapNoPedido(pedido: string): string | undefined {
  const k = pedido.indexOf(TITULO);
  if (k < 0) return undefined;
  const fim = pedido.indexOf(",", k + TITULO.length);
  return fim < 0 ? undefined : pedido.slice(k + TITULO.length, fim);
}

/** O bloco do pedido: o TAP revisado, com a versão e o aviso de que é o que vale. */
export function formatarTapRevisado(a: TapRevisado): string {
  return `${TITULO}${a.versao}, a que seguiu)
É com este TAP que se confere a coerência do registro de premissas: com o texto que o GP editou, sem os itens que ele descartou e com os campos que só ele preenche. O rótulo de cada item vale como no resto do pedido ("citação não conferida" não é fato). Versões anteriores do TAP e conferências antigas não valem.
<tap-revisado>
${a.texto}
</tap-revisado>`;
}
