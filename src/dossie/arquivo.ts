// Salvar e abrir o dossiê (<projeto>.dossie.json). A chave da API nunca entra aqui.
import { nomeParaArquivo } from "../texto/nome-arquivo";
import { Dossie, FORMATO_DOSSIE, VERSAO_FORMATO_DOSSIE } from "./esquema";

export const EXTENSAO_DOSSIE = ".dossie.json";

export function criarDossieVazio(agora = new Date()): Dossie {
  const data = agora.toISOString();
  return {
    formato: FORMATO_DOSSIE,
    versaoFormato: VERSAO_FORMATO_DOSSIE,
    versaoApp: __VERSAO_APP__,
    versaoSkill: __VERSAO_SKILL__,
    criadoEm: data,
    atualizadoEm: data,
    projeto: { nome: "" },
    documentos: [],
    itens: [],
  };
}

/** JSON do dossiê, passado pelo esquema: o que não é do esquema (inclusive qualquer chave) fica de fora. */
export function serializarDossie(dossie: Dossie, agora = new Date()): string {
  const limpo = Dossie.parse({
    ...dossie,
    versaoApp: __VERSAO_APP__,
    versaoSkill: __VERSAO_SKILL__,
    atualizadoEm: agora.toISOString(),
  });
  return JSON.stringify(limpo, null, 2);
}

export type ResultadoLeitura = { ok: true; dossie: Dossie } | { ok: false; erro: string };

export function lerDossie(texto: string, nomeArquivo = ""): ResultadoLeitura {
  if (nomeArquivo && !nomeArquivo.toLowerCase().endsWith(EXTENSAO_DOSSIE)) {
    return { ok: false, erro: `O arquivo precisa terminar em ${EXTENSAO_DOSSIE}.` };
  }
  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    return { ok: false, erro: "O arquivo não é um JSON válido." };
  }
  const formato = (dados as { formato?: unknown } | null)?.formato;
  if (formato !== FORMATO_DOSSIE) {
    return { ok: false, erro: "O arquivo não é um dossiê do Raio-X do Projeto." };
  }
  const versao = (dados as { versaoFormato?: unknown }).versaoFormato;
  if (typeof versao === "number" && versao > VERSAO_FORMATO_DOSSIE) {
    return {
      ok: false,
      erro: `O dossiê foi salvo por uma versão mais nova do app (formato ${versao}). Atualize a página e tente de novo.`,
    };
  }
  const r = Dossie.safeParse(dados);
  if (!r.success) {
    const caminho = r.error.issues[0]?.path.join(".") || "raiz";
    return { ok: false, erro: `O dossiê está incompleto ou foi alterado (campo: ${caminho}).` };
  }
  return { ok: true, dossie: r.data };
}

export function nomeArquivoDossie(dossie: Dossie): string {
  const base = nomeParaArquivo(
    dossie.projeto.nome,
    dossie.documentos.map((d) => d.nomeArquivo),
  );
  return `${base || "projeto"}${EXTENSAO_DOSSIE}`;
}
