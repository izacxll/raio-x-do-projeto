// TAP revisado no pedido da segunda instância do registro de premissas (decisão 0068). O pedido das premissas leva do
// TAP só os limites e o risco geral; para conferir a coerência, o revisor ia buscar o TAP em outro arquivo e achava uma
// versão velha (a da última conferência, antes do "seguir" do GP). Vão os itens do TAP como o GP os deixou: com o texto
// editado e sem os descartados. Só os itens: sem pendências, aprovação nem o registro de premissas, que é o conferido.
// Só neste passo: os outros já levam resumos do anterior, e mandar o passo anterior em todos não se paga.
import type { TapDossie } from "../dossie/esquema";
import { itensDoTap } from "../etapas/3-tap/tap";
import { estadoDe, itensValidos, textoFinal } from "./itens";

const ROTULO = { documento: "Do documento", sugestao: "Sugestão", decisao_gp: "Decisão do GP" } as const;
const VALE = { rfp: "vale a RFP", proposta: "vale a proposta", contrato: "vale o contrato" } as const;
const decisaoDoGp = (v?: string) => `[Decisão do GP] ${v?.trim() || "a definir pelo GP"}`;

export interface TapRevisado {
  /** O "em" da resposta do TAP usada. */
  em: string;
  /**
   * A versão que o revisor recebeu: o "em" e uma impressão do texto (editar ou descartar um item muda o texto e não o
   * "em"; aceitar sem editar não muda nada). A conferência guardada com outra versão fica velha.
   */
  versao: string;
  /** Os itens válidos, por elemento do TAP, com o texto final. */
  texto: string;
}

/** Impressão curta do texto (djb2): só para saber se mudou, não é segurança. */
function calcularImpressao(texto: string): string {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** O TAP revisado pelo GP, a partir dos itens do passo "tap"; undefined sem o TAP. */
export function montarTapRevisado(t: TapDossie | undefined): TapRevisado | undefined {
  if (!t?.tap) return undefined;
  // sem documentos: aqui só importam o id, o grupo e o texto (a citação já foi conferida na tela do TAP)
  const itens = itensValidos(t.revisoes, itensDoTap(t.tap.resposta, []));
  const grupos = new Map<string, string[]>();
  for (const i of itens) {
    // o rótulo de cada item (os três do princípio) e, se o GP ainda não revisou, a marca de pendente
    const pendente = estadoDe(t.revisoes, i.id) === "pendente" ? " (pendente de revisão do GP)" : "";
    const linha = `- [${ROTULO[i.item.rotulo]}] ${textoFinal(i, t.revisoes)}${i.complemento ? ` ${i.complemento}` : ""}${pendente}`;
    grupos.set(i.grupo, [...(grupos.get(i.grupo) ?? []), linha]);
  }
  // as decisões do GP no TAP (campos que só ele preenche e o que vale em cada divergência); a aprovação não entra
  const d = t.decisoes;
  const decisoes = [
    `- Recursos financeiros pré-aprovados: ${decisaoDoGp(d.recursos)}`,
    `- Gerente do projeto: ${decisaoDoGp(d.gerente)}`,
    `- Responsabilidade e nível de autoridade: ${decisaoDoGp(d.autoridade)}`,
    `- Patrocinador: ${decisaoDoGp(d.patrocinador)}`,
    `- Autoridade do patrocinador e escalonamento: ${decisaoDoGp(d.autoridadePatrocinador)}`,
    ...Object.entries(t.divergencias).map(
      ([id, x]) =>
        `- Divergência ${id}: [Decisão do GP] ${x.vale === "outra" ? x.texto?.trim() || "outra redação, a definir" : VALE[x.vale]}`,
    ),
  ];
  const texto = [
    ...[...grupos].map(([g, linhas]) => `### ${g}\n${linhas.join("\n")}`),
    `### Decisões do GP no TAP\n${decisoes.join("\n")}`,
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
É com este TAP que se confere a coerência do registro de premissas: com o texto que o GP editou, sem os itens que ele descartou e com as decisões dele. Item marcado "pendente de revisão do GP" ainda não foi decidido: não o trate como definitivo. Versões anteriores do TAP e conferências antigas não valem.
<tap-revisado>
${a.texto}
</tap-revisado>`;
}
