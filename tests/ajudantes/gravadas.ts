// Respostas do PMO gravadas para a RFP pública da OEI (tests/fixtures/gerados/), só como material dos testes
// automáticos (decisão 0053: o site não tem modo de demonstração). Lidas do disco e validadas pelo mesmo schema da
// resposta da API; as etapas anteriores entram com as escolhas com que as gravações foram feitas.
import { existsSync, readFileSync } from "node:fs";
import type { z } from "zod";
import type { DocumentoLido, PropostaDossie, TapDossie } from "../../src/dossie/esquema";
import { propostaInicial } from "../../src/etapas/2-proposta/proposta";
import { tapInicial } from "../../src/etapas/3-tap/tap";
import {
  comCamposNovos,
  RespostaConteudo,
  RespostaEap,
  RespostaEstrategia,
} from "../../src/pmo/schemas/proposta";
import { comCamposNovosTap, RespostaPremissas, RespostaTap } from "../../src/pmo/schemas/tap";

/** Nome com que a resposta gravada aparece no lugar do modelo. */
export const MODELO_GRAVADO = "resposta gravada (teste)";

/** Escolha do GP com que as respostas gravadas da etapa 2 foram feitas: as seguintes partem dela. */
export const ABORDAGEM_GRAVADA = "B";

/** Premissas críticas confirmadas na gravação da proposta (as que o conteúdo técnico gravado escreve no SOW). */
export const PREMISSAS_GRAVADAS = { PC1: true, PC3: true, PC6: true, PC8: true };

/** Pasta de cada etapa em tests/fixtures/gerados/. */
const PASTA: Record<number, string> = {
  1: "rfp-oei",
  2: "proposta-oei",
  3: "tap-oei",
  4: "pgp-oei",
  5: "leitura-oei",
};

const caminho = (pasta: string, nome: string) =>
  new URL(`../fixtures/gerados/${pasta}/${nome}.json`, import.meta.url);

/** Resposta gravada de um passo, validada pelo mesmo schema da resposta da API. */
export async function respostaGravada<S extends z.ZodType>(
  etapa: 1 | 2 | 3 | 4 | 5,
  passo: string,
  schema: S,
): Promise<z.infer<S>> {
  const arq = caminho(PASTA[etapa] ?? "", passo);
  if (!existsSync(arq)) throw new Error(`Resposta gravada não encontrada: etapa ${etapa}, passo ${passo}.`);
  const dados: unknown = JSON.parse(readFileSync(arq, "utf-8"));
  // gravações de antes das fases M2 e M3 abrem com os campos novos vazios, como os dossiês
  const preenchido =
    etapa === 3 && passo === "tap"
      ? comCamposNovosTap(dados)
      : etapa === 2 && (passo === "estrategia" || passo === "conteudo" || passo === "eap")
        ? comCamposNovos(passo, dados)
        : dados;
  return schema.parse(preenchido) as z.infer<S>;
}

/** Documento inventado gravado em JSON (uma "página" por bloco de texto), como um PDF lido no navegador. */
function documentoGravado(pasta: string, nome: string, papel: DocumentoLido["papel"]): DocumentoLido {
  const d = JSON.parse(readFileSync(caminho(pasta, nome), "utf-8")) as {
    nomeArquivo: string;
    paginas: string[];
  };
  const paginas = d.paginas.map((texto, k) => ({
    numero: k + 1,
    origem: "texto" as const,
    texto,
    caracteres: texto.length,
  }));
  return {
    id: `${pasta}-${nome}`,
    papel,
    nomeArquivo: d.nomeArquivo,
    tamanhoBytes: 0,
    totalPaginas: paginas.length,
    lidoEm: new Date().toISOString(),
    paginas,
  };
}

/** O plano de trabalho inventado, com erros plantados, da leitura gravada da etapa 5. */
export const planoGravado = () => documentoGravado("leitura-oei", "plano-demonstracao", "pgp");

/** O contrato inventado da etapa 3 (decisão 0041), sobre o edital público da OEI. */
export const contratoGravado = () => documentoGravado("tap-oei", "contrato-teste", "contrato");

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
    abordagem: { id: ABORDAGEM_GRAVADA, justificativa: "Escolha feita na gravação." },
    premissasAplicaveis: { ...PREMISSAS_GRAVADAS },
    conteudo: { resposta: conteudo, modelo: MODELO_GRAVADO, em },
    eap: { resposta: eap, modelo: MODELO_GRAVADO, em },
  };
}

/** O TAP gravado (os 12 elementos e o registro de premissas). */
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
