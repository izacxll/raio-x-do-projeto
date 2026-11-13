// O que a conferência (etapa 5) devolve: achados e verificações sem achado.
import type { Gravidade } from "../dominio/fichas";

export type TipoAchado = "vago" | "conflituoso" | "ausente";

export interface Evidencia {
  documento: "pgp" | "tap" | "rfp" | "ficha";
  /** Página do arquivo PDF; ausente quando a evidência é uma ficha da skill. */
  pagina?: number;
  /** Trecho literal do documento, ou o texto do item da ficha. */
  trecho: string;
  /** Rótulo para a tela: "PGP, p. 12", "Ficha A8 (A8.12)". */
  rotulo: string;
}

export interface Achado {
  /** Identificador estável: regra, parte e chave do achado. */
  id: string;
  tipo: TipoAchado;
  /** Regra de código que gerou o achado (ver src/regras/). */
  regra: string;
  /** Parte do PGP que decide a gravidade. */
  parte: string;
  /** Todas as partes envolvidas (o achado fica com a gravidade mais alta entre elas). */
  partes: string[];
  gravidade: Gravidade;
  categoria: string;
  /** Como a categoria foi dada: pelo que foi comparado (regra 1) ou pela parte (regra 2) (decisão 0008). */
  origemCategoria: "comparado" | "parte";
  titulo: string;
  descricao: string;
  /** Evidência dos dois lados: o que foi exigido ou dito em outro lugar, e o que o plano diz (ou não diz). */
  evidencias: Evidencia[];
  /** Sugestão de ajuste, por modelo de texto, em redação condicional. */
  sugestao: string;
}

export type EstadoVerificacao =
  "ok" | "achado" | "nao-verificavel" | "nao-conferido" | "dispensavel" | "dispensado-gp";

/** Cada verificação feita, com ou sem achado: o relatório mostra o que o código não pôde conferir. */
export interface Verificacao {
  id: string;
  /** Item de ficha (A7.3), parte (A7), premissa (PC3) ou requisito (R04). */
  alvo: string;
  descricao: string;
  estado: EstadoVerificacao;
  detalhe: string;
}

export const ORDEM_GRAVIDADE: Record<Gravidade, number> = { grave: 3, média: 2, baixa: 1 };

/** Frase padrão para o que o código não encontrou (regra "não achado não é ausente", seção 2). */
export const NAO_LOCALIZADO = "não localizado pelo código — conferir no documento";
