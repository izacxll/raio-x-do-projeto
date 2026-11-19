// PGP enxuto por porte (decisão 0091). O porte diz quantas partes o plano tem e quantas páginas; o que sai de uma parte
// não some: ou vai fundido numa parte hospedeira (uma linha por item da ficha que vale para o projeto), ou fica
// dispensado com o motivo. Base: PMBOK 7, adaptação (pmbok7.md da skill, seção 3): plano detalhado é ineficiente em
// projeto menor (Guia 2.4.9, p. 67) e, no porte pequeno, A1 a A5 e A8 são seções curtas de um PGP único.
import type { Caracteristicas } from "../../dominio/caracteristicas";
import type { PgpDossie } from "../../dossie/esquema";
import type { RespostaAdaptacao } from "../../pmo/schemas/pgp";
import { PASSOS_PGP } from "./passos";

type Porte = Caracteristicas["porte"];

/** Partes geradas e páginas do plano (corpo, sem os registros em planilha) por porte. */
export const LIMITES_DO_PORTE: Record<Porte, { partes: [number, number]; paginas: number }> = {
  pequeno: { partes: [10, 15], paginas: 15 },
  médio: { partes: [16, 30], paginas: 30 },
  grande: { partes: [31, 51], paginas: 50 },
};

/**
 * O núcleo do porte pequeno: um PGP único em 14 partes (15 com aquisições, quando a subcontratação é permitida). O
 * núcleo da skill (A13 com o aceite, cronograma e marcos, custos, riscos, premissas, partes interessadas, equipe, ciclo
 * de vida) mais A1 a A5 e A8 como seções curtas, as mudanças (contratante público), o registro de questões (as QU do
 * código) e a medição como quadro simples.
 */
export const NUCLEO_PEQUENO = [
  "A17",
  "A13",
  "A3",
  "A6",
  "A8",
  "A4",
  "A5",
  "A7",
  "A11",
  "B31",
  "B27",
  "B3",
  "B9",
  "A16",
] as const;

/**
 * Onde vai o conteúdo de cada parte fundida. As partes escritas pelo PMO se fundem numa parte do mesmo passo (o pedido
 * manda a ficha da fundida junto com a da hospedeira); as tabelas do código (marcos, cronograma, custos, RACI,
 * rastreabilidade) saem dentro da seção da hospedeira.
 */
export const HOSPEDEIRA: Record<string, string> = {
  // adaptação
  A18: "A17",
  // escopo
  A1: "A13",
  A2: "A13",
  B17: "A13",
  B22: "A13",
  B23: "A13",
  // cronograma e recursos
  B4: "A3",
  B13: "A3",
  B2: "A3",
  B8: "A3",
  B11: "A3",
  B15: "A3",
  A14: "A3",
  B12: "A6",
  B18: "A6",
  B26: "A6",
  B32: "A6",
  // custos
  B6: "A4",
  A15: "A4",
  // planos
  A10: "B31",
  A12: "A11",
  B14: "A7",
  B20: "A5",
  // execução: registro único de questões, mudanças e lições; medição com qualidade e riscos
  B5: "B9",
  B10: "B9",
  B19: "A16",
  B21: "A16",
  B28: "A16",
};

/** Dispensadas no porte pequeno, com o motivo (o livro e a condição). */
export const DISPENSADAS_NO_PEQUENO: Record<string, string> = {
  B1: "porte pequeno: os atributos das atividades ficam na lista do cronograma (A3); plano detalhado é ineficiente em projeto menor (PMBOK 7, Guia 2.4.9, p. 67)",
  B7: "porte pequeno: previsão por valor agregado serve a projetos preditivos muito grandes (PMBOK 7, Guia, p. 104)",
  B16: "porte pequeno: a rede fica como a tabela de predecessoras do cronograma (A3)",
  B24: "porte pequeno, equipe pequena: a estrutura analítica dos recursos não agrega ao quadro do A6",
  B25: "porte pequeno, equipe estável: os calendários dos recursos ficam no A6",
  B29: "porte pequeno: os dados do cronograma são as tabelas do A3",
  B30: "porte pequeno: previsão por valor agregado serve a projetos preditivos muito grandes (PMBOK 7, Guia, p. 104)",
  B33: "porte pequeno, sem entrega testável: o aceite de cada produto fica no A13",
};

/** As partes do porte pequeno que dependem das características. */
function nucleoDoPequeno(c: Caracteristicas): string[] {
  return [...NUCLEO_PEQUENO, ...(c.subcontratacao === "permitida" ? ["A9"] : [])];
}

/** O passo do PMO que escreve a parte (só as partes de texto). */
function passoDaParteDeTexto(codigo: string): string | undefined {
  return PASSOS_PGP.find((x) => x.textos.includes(codigo))?.passo;
}

/**
 * O que gerar pela adaptação do PMO e pelo porte (a sugestão inicial; o GP muda na tabela):
 * - grande: tudo o que o PMO não marcou como dispensável;
 * - médio: o essencial; o recomendado com hospedeira gerada vai fundido nela;
 * - pequeno: o núcleo do porte, em qualquer caso; o resto vai fundido ou dispensado.
 */
export function gerarPeloPorte(a: RespostaAdaptacao, c?: Caracteristicas): Record<string, boolean> {
  const porte = c?.porte ?? "grande";
  if (porte === "grande")
    return Object.fromEntries(a.partes.map((p) => [p.codigo, p.recomendacao !== "dispensavel"]));
  if (porte === "pequeno") {
    const nucleo = new Set(nucleoDoPequeno(c!));
    return Object.fromEntries(a.partes.map((p) => [p.codigo, nucleo.has(p.codigo)]));
  }
  const gerar = Object.fromEntries(a.partes.map((p) => [p.codigo, p.recomendacao === "essencial"]));
  // no médio, o recomendado sem hospedeira gerada continua parte própria (não some)
  for (const p of a.partes)
    if (p.recomendacao === "recomendado" && !gerar[HOSPEDEIRA[p.codigo] ?? ""]) gerar[p.codigo] = true;
  return gerar;
}

export type DestinoDaParte =
  { tipo: "gerada" } | { tipo: "fundida"; em: string } | { tipo: "dispensada"; motivo: string };

/**
 * Para onde foi cada parte: gerada; fundida na hospedeira (quando o GP a marcou para não gerar, a hospedeira é gerada e
 * o PMO não disse que a parte é dispensável); ou dispensada, com o motivo (o do porte, ou a justificativa do PMO). A
 * parte que não está na adaptação (sem marca do GP) não é fundida.
 */
export function destinoDaParte(codigo: string, p: PgpDossie): DestinoDaParte {
  if (p.gerar[codigo]) return { tipo: "gerada" };
  const sugestao = p.adaptacao?.resposta.partes.find((x) => x.codigo === codigo);
  const porte = p.caracteristicas?.porte;
  const hospedeira = HOSPEDEIRA[codigo];
  if (porte === "pequeno" && DISPENSADAS_NO_PEQUENO[codigo])
    return { tipo: "dispensada", motivo: DISPENSADAS_NO_PEQUENO[codigo] };
  if (
    p.gerar[codigo] === false &&
    hospedeira &&
    p.gerar[hospedeira] &&
    sugestao?.recomendacao !== "dispensavel"
  )
    return { tipo: "fundida", em: hospedeira };
  return {
    tipo: "dispensada",
    motivo: sugestao?.justificativa || "dispensada pelo GP, sem motivo registrado",
  };
}

/** As partes fundidas numa hospedeira, na ordem do catálogo. */
export function fundidasEm(hospedeira: string, p: PgpDossie): string[] {
  return Object.keys(HOSPEDEIRA).filter((c) => {
    const d = destinoDaParte(c, p);
    return d.tipo === "fundida" && d.em === hospedeira;
  });
}

/** As partes de texto fundidas numa hospedeira do mesmo passo (as que o pedido daquele passo cobre). */
export function fundidasDeTextoEm(hospedeira: string, p: PgpDossie): string[] {
  const passo = passoDaParteDeTexto(hospedeira);
  return fundidasEm(hospedeira, p).filter((c) => passoDaParteDeTexto(c) === passo);
}

/** Todas as partes de texto fundidas numa hospedeira do mesmo passo: a autoconferência espera os itens delas. */
export function fundidasDeTexto(p: PgpDossie): string[] {
  return Object.keys(HOSPEDEIRA).filter((c) => {
    const d = destinoDaParte(c, p);
    const passo = passoDaParteDeTexto(c);
    return d.tipo === "fundida" && passo !== undefined && passo === passoDaParteDeTexto(d.em);
  });
}

/** A parte que se pede de novo para um item: a hospedeira, quando a parte do item foi fundida nela. */
export function parteQueEscreve(codigo: string, p: PgpDossie): string {
  const d = destinoDaParte(codigo, p);
  return d.tipo === "fundida" ? d.em : codigo;
}

/** Uma linha para a tela e o plano: "fundida em A13", "dispensada: motivo" ou "gerada". */
export function destinoEmTexto(d: DestinoDaParte): string {
  return d.tipo === "gerada"
    ? "gerada"
    : d.tipo === "fundida"
      ? `fundida em ${d.em}`
      : `dispensada: ${d.motivo}`;
}
