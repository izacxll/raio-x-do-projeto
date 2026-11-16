// Modo demonstração (decisão 0027): mostra as etapas com o PMO sem a chave da API, com as respostas do PMO gravadas
// para a RFP pública da OEI (tests/fixtures/gerados/). Nenhuma chamada à IA sai do navegador neste modo.
// O resto do fluxo é o de verdade: conferência das citações, cronograma, preço, revisão do GP e saídas.
// O PDF da RFP é servido pelo próprio site (copiado de tests/fixtures/rfps-publicas/ antes do dev e do build).
import type { z } from "zod";
import type { DocumentoLido } from "../dossie/esquema";

export const TEXTO_DEMONSTRACAO = "Demonstração com respostas gravadas, sem chamada à IA";

/** Nome com que a resposta gravada aparece no lugar do modelo. */
export const MODELO_GRAVADO = "resposta gravada (demonstração)";

export const RFP_DEMONSTRACAO = "concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf";
export const NOME_PROJETO_DEMONSTRACAO = "Demonstração — concorrência pública da OEI";

/** Escolhas do GP com que as respostas gravadas foram feitas: as seguintes partem delas. */
export const ABORDAGEM_GRAVADA = "B";

/** Pasta de cada etapa em tests/fixtures/gerados/. */
const PASTA: Record<number, string> = {
  1: "rfp-oei",
  2: "proposta-oei",
  3: "tap-oei",
  4: "pgp-oei",
  5: "leitura-oei",
};

const gravadas = import.meta.glob("../../tests/fixtures/gerados/{proposta,tap,pgp,leitura,rfp}-oei/*.json", {
  import: "default",
});

/** Resposta gravada de um passo, validada pelo mesmo schema da resposta da API. */
export async function respostaGravada<S extends z.ZodType>(
  etapa: 1 | 2 | 3 | 4 | 5,
  passo: string,
  schema: S,
): Promise<z.infer<S>> {
  const caminho = `../../tests/fixtures/gerados/${PASTA[etapa]}/${passo}.json`;
  const carregar = gravadas[caminho];
  if (!carregar) throw new Error(`Resposta gravada não encontrada: etapa ${etapa}, passo ${passo}.`);
  return schema.parse(await carregar()) as z.infer<S>;
}

/**
 * O plano de trabalho inventado da demonstração da etapa 5 (decisão 0037): fictício, sobre o edital público da OEI,
 * com erros plantados. Vira um documento "lido" (uma página por bloco de texto), como um PDF lido no navegador.
 */
/** Nome do arquivo do plano inventado: a resposta gravada só vale para ele. */
export const PLANO_DEMONSTRACAO = "plano-de-trabalho-demonstracao.pdf";

export async function planoDaDemonstracao(): Promise<DocumentoLido> {
  const carregar = gravadas["../../tests/fixtures/gerados/leitura-oei/plano-demonstracao.json"];
  if (!carregar) throw new Error("Plano da demonstração não encontrado.");
  const plano = (await carregar()) as { nomeArquivo: string; paginas: string[] };
  const paginas = plano.paginas.map((texto, k) => ({
    numero: k + 1,
    origem: "texto" as const,
    texto,
    caracteres: texto.length,
  }));
  return {
    id: crypto.randomUUID(),
    papel: "pgp",
    nomeArquivo: plano.nomeArquivo,
    tamanhoBytes: 0,
    totalPaginas: paginas.length,
    lidoEm: new Date().toISOString(),
    paginas,
  };
}

/** O contrato inventado da demonstração da etapa 3 (decisão 0041): fictício, sobre o edital público da OEI. */
export async function contratoDaDemonstracao(): Promise<DocumentoLido | undefined> {
  const carregar = gravadas["../../tests/fixtures/gerados/tap-oei/contrato-teste.json"];
  if (!carregar) return undefined;
  const c = (await carregar()) as { nomeArquivo: string; paginas: string[] };
  const paginas = c.paginas.map((texto, k) => ({
    numero: k + 1,
    origem: "texto" as const,
    texto,
    caracteres: texto.length,
  }));
  return {
    id: crypto.randomUUID(),
    papel: "contrato",
    nomeArquivo: c.nomeArquivo,
    tamanhoBytes: 0,
    totalPaginas: paginas.length,
    lidoEm: new Date().toISOString(),
    paginas,
  };
}

/** Lê o PDF da RFP da demonstração, servido pelo próprio site, com a leitura de verdade. */
export async function lerRfpDaDemonstracao(
  aoProgredir?: (pagina: number, total: number) => void,
): Promise<DocumentoLido> {
  const url = `${import.meta.env.BASE_URL}vendor/demonstracao/${RFP_DEMONSTRACAO}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`não foi possível baixar a RFP da demonstração (${r.status}).`);
  const arquivo = new File([await r.blob()], RFP_DEMONSTRACAO, { type: "application/pdf" });
  const { lerPdfNoNavegador } = await import("../leitura/navegador");
  const lido = await lerPdfNoNavegador(arquivo, {
    aoProgredir: (p) => aoProgredir?.(p.pagina, p.total),
  });
  return {
    id: crypto.randomUUID(),
    papel: "rfp",
    nomeArquivo: RFP_DEMONSTRACAO,
    tamanhoBytes: arquivo.size,
    totalPaginas: lido.totalPaginas,
    lidoEm: new Date().toISOString(),
    paginas: lido.paginas,
  };
}
