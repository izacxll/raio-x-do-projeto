// Prepara o dossiê de demonstração para a etapa pedida (decisão 0027): as etapas anteriores entram com as respostas
// gravadas e as escolhas com que elas foram feitas, como se o GP tivesse passado por elas.
import { useDossie } from "../dossie/store";
import type { PropostaDossie, TapDossie } from "../dossie/esquema";
import { tapInicial } from "../etapas/3-tap/tap";
import { RespostaPremissas, RespostaTap } from "../pmo/schemas/tap";
import { propostaInicial } from "../etapas/2-proposta/proposta";
import { RespostaConteudo, RespostaEap, RespostaEstrategia } from "../pmo/schemas/proposta";
import {
  ABORDAGEM_GRAVADA,
  contratoDaDemonstracao,
  MODELO_GRAVADO,
  planoDaDemonstracao,
  respostaGravada,
} from "./demonstracao";

/** Premissas críticas confirmadas na gravação da proposta (as que o conteúdo técnico gravado escreve no SOW). */
export const PREMISSAS_GRAVADAS = { PC1: true, PC3: true, PC6: true, PC8: true };

/** A proposta gravada inteira (os três passos), com a abordagem e as premissas da gravação. */
export async function propostaGravada(): Promise<PropostaDossie> {
  const em = new Date().toISOString();
  const [estrategia, conteudo, eap] = await Promise.all([
    respostaGravada(2, "estrategia", RespostaEstrategia),
    respostaGravada(2, "conteudo", RespostaConteudo),
    respostaGravada(2, "eap", RespostaEap),
  ]);
  return {
    ...propostaInicial(MODELO_GRAVADO),
    estrategia: { resposta: estrategia, modelo: MODELO_GRAVADO, em },
    abordagem: { id: ABORDAGEM_GRAVADA, justificativa: "Escolha feita na gravação da demonstração." },
    premissasAplicaveis: { ...PREMISSAS_GRAVADAS },
    conteudo: { resposta: conteudo, modelo: MODELO_GRAVADO, em },
    eap: { resposta: eap, modelo: MODELO_GRAVADO, em },
  };
}

/** O TAP gravado (os 12 elementos e o registro de premissas), com as premissas críticas da gravação. */
export async function tapGravado(): Promise<TapDossie> {
  const em = new Date().toISOString();
  const [tap, premissas] = await Promise.all([
    respostaGravada(3, "tap", RespostaTap),
    respostaGravada(3, "premissas", RespostaPremissas),
  ]);
  return {
    ...tapInicial(MODELO_GRAVADO),
    tap: { resposta: tap, modelo: MODELO_GRAVADO, em },
    premissas: { resposta: premissas, modelo: MODELO_GRAVADO, em },
  };
}

export async function prepararEtapasAnteriores(etapa: 1 | 2 | 3 | 4 | 5): Promise<void> {
  if (etapa === 1 || etapa === 2) return;
  const { guardarProposta, guardarTap, guardarDocumento } = useDossie.getState();
  // etapa 5: o plano inventado, com erros plantados, na caixa do plano (decisão 0037)
  if (etapa === 5) {
    guardarDocumento(await planoDaDemonstracao(), false);
    return;
  }
  guardarProposta(await propostaGravada());
  // etapa 3: o contrato inventado, que prevalece sobre a proposta e a RFP (decisão 0041)
  if (etapa === 3) {
    const contrato = await contratoDaDemonstracao();
    if (contrato) guardarDocumento(contrato, false);
  }
  if (etapa === 4) guardarTap(await tapGravado());
}
