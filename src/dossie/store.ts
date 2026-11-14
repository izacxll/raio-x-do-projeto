// Estado do app: o próprio dossiê. Fica só na memória da aba; o GP salva o arquivo quando quiser.
// A chave da API (a partir da F2) nunca entra neste store.
import { create } from "zustand";
import type { PapelDocumento } from "../etapas/etapas";
import { criarDossieVazio } from "./arquivo";
import type { AnaliseRfpDossie, Conferencia, Dossie, DocumentoLido, PropostaDossie } from "./esquema";

interface EstadoDossie {
  dossie: Dossie;
  /** Há mudança desde o último "Salvar projeto" ou "Abrir projeto". */
  alterado: boolean;
  definirNomeProjeto: (nome: string) => void;
  guardarDocumento: (documento: DocumentoLido, varios: boolean) => void;
  removerDocumento: (id: string) => void;
  abrirDossie: (dossie: Dossie) => void;
  guardarAnaliseRfp: (analise: AnaliseRfpDossie) => void;
  guardarConferencia: (conferencia: Conferencia) => void;
  guardarProposta: (proposta: PropostaDossie) => void;
  novoProjeto: () => void;
  /** Começa um projeto de demonstração (decisão 0027) com a RFP já lida. */
  iniciarDemonstracao: (rfp: DocumentoLido, nome: string) => void;
  marcarSalvo: () => void;
}

export const useDossie = create<EstadoDossie>((set) => ({
  dossie: criarDossieVazio(),
  alterado: false,
  definirNomeProjeto: (nome) => set((s) => ({ dossie: { ...s.dossie, projeto: { nome } }, alterado: true })),
  guardarDocumento: (documento, varios) =>
    set((s) => {
      // papel de um documento só (RFP, TAP, PGP...): o novo PDF substitui o anterior
      const outros = s.dossie.documentos.filter(
        (d) => d.id !== documento.id && (varios || d.papel !== documento.papel),
      );
      return { dossie: { ...s.dossie, documentos: [...outros, documento] }, alterado: true };
    }),
  removerDocumento: (id) =>
    set((s) => ({
      dossie: { ...s.dossie, documentos: s.dossie.documentos.filter((d) => d.id !== id) },
      alterado: true,
    })),
  abrirDossie: (dossie) => set({ dossie, alterado: false }),
  guardarAnaliseRfp: (analiseRfp) => set((s) => ({ dossie: { ...s.dossie, analiseRfp }, alterado: true })),
  guardarConferencia: (conferencia) => set((s) => ({ dossie: { ...s.dossie, conferencia }, alterado: true })),
  guardarProposta: (proposta) => set((s) => ({ dossie: { ...s.dossie, proposta }, alterado: true })),
  novoProjeto: () => set({ dossie: criarDossieVazio(), alterado: false }),
  iniciarDemonstracao: (rfp, nome) =>
    set({
      dossie: { ...criarDossieVazio(), projeto: { nome }, demonstracao: true, documentos: [rfp] },
      alterado: false,
    }),
  marcarSalvo: () => set({ alterado: false }),
}));

export function documentosDoPapel(dossie: Dossie, papel: PapelDocumento): DocumentoLido[] {
  return dossie.documentos.filter((d) => d.papel === papel);
}
