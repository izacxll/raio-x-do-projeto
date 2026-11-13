// As cinco etapas do app, como na página "03 · O fluxo" da apresentação (seção 5.0 da especificação).
// A estrutura aceita uma etapa seguinte (a "etapa 6", ainda a definir): basta acrescentar um item à lista.
// O conteúdo dela não é inventado aqui.

export type NumeroEtapa = 1 | 2 | 3 | 4 | 5;

export type PapelDocumento = "rfp" | "anexo-rfp" | "proposta" | "tap" | "pgp";

export interface DocumentoPedido {
  papel: PapelDocumento;
  nome: string;
  obrigatorio: boolean;
  /** Aceita mais de um PDF (anexos). */
  varios?: boolean;
  observacao?: string;
}

export interface SaidaEtapa {
  nome: string;
  formatos: ("DOCX" | "PDF" | "XLSX")[];
}

export interface Etapa {
  numero: NumeroEtapa;
  nome: string;
  nomeCurto: string;
  resumoEntrada: string;
  /** Etapas 2, 3 e 4 usam o PMO (API do Claude, com a chave do GP). As etapas 1 e 5 rodam só com código. */
  usaPmo: boolean;
  /** Fase do plano em que a etapa fica pronta. Uso interno: nunca aparece na tela (o GP não conhece as fases). */
  fase: string;
  documentos: DocumentoPedido[];
  ferramentaFaz: string[];
  saidas: SaidaEtapa[];
}

export const ETAPAS: Etapa[] = [
  {
    numero: 1,
    nome: "Leitura da RFP",
    nomeCurto: "RFP",
    resumoEntrada: "entra: RFP em PDF",
    usaPmo: false,
    fase: "F1",
    documentos: [
      {
        papel: "rfp",
        nome: "RFP, edital, pregão, chamamento ou dispensa",
        obrigatorio: true,
        observacao: "O documento principal da solicitação de proposta.",
      },
      {
        papel: "anexo-rfp",
        nome: "Anexos da RFP",
        obrigatorio: false,
        varios: true,
        observacao:
          "Termo de referência, minuta de contrato, planilha de preços, quando vierem em PDFs separados.",
      },
    ],
    ferramentaFaz: [
      "Desmembra requisitos, prazos e habilitação, sempre com a página",
      "Aponta lacunas e trechos com mais de uma leitura",
      "Sugere perguntas para o pedido de esclarecimento",
    ],
    saidas: [
      { nome: "Análise da RFP", formatos: ["DOCX", "PDF"] },
      { nome: "Lista de requisitos e quadro de prazos", formatos: ["XLSX"] },
      { nome: "Checklist de habilitação", formatos: ["XLSX"] },
      { nome: "Perguntas de esclarecimento", formatos: ["DOCX"] },
    ],
  },
  {
    numero: 2,
    nome: "Proposta do fornecedor",
    nomeCurto: "Proposta",
    resumoEntrada: "entra: RFP + análise",
    usaPmo: true,
    fase: "F2",
    documentos: [
      { papel: "rfp", nome: "RFP", obrigatorio: true },
      {
        papel: "anexo-rfp",
        nome: "Anexos da RFP",
        obrigatorio: false,
        varios: true,
      },
    ],
    ferramentaFaz: [
      "Duas ou três abordagens técnicas, com prós e contras",
      "SOW, cronograma e estrutura de preço, sem valor inventado",
      "Matriz que liga cada requisito ao ponto da proposta que o atende",
    ],
    saidas: [
      { nome: "Minuta da proposta", formatos: ["DOCX", "PDF"] },
      { nome: "Planilha de preço", formatos: ["XLSX"] },
    ],
  },
  {
    numero: 3,
    nome: "Termo de abertura (TAP)",
    nomeCurto: "TAP",
    resumoEntrada: "entra: RFP + proposta",
    usaPmo: true,
    fase: "F3",
    documentos: [
      { papel: "rfp", nome: "RFP", obrigatorio: true },
      { papel: "proposta", nome: "Proposta final do gerente", obrigatorio: true },
    ],
    ferramentaFaz: [
      "Os 12 elementos do TAP, cada um com a origem",
      "Divergências entre a RFP e a proposta",
      "Campos que só o gerente preenche, como patrocinador e nível de autoridade",
    ],
    saidas: [{ nome: "Termo de abertura do projeto", formatos: ["DOCX", "PDF"] }],
  },
  {
    numero: 4,
    nome: "Plano de gerenciamento (PGP)",
    nomeCurto: "PGP",
    resumoEntrada: "entra: RFP + TAP",
    usaPmo: true,
    fase: "F4",
    documentos: [
      { papel: "rfp", nome: "RFP", obrigatorio: true },
      { papel: "tap", nome: "TAP aprovado", obrigatorio: true },
    ],
    ferramentaFaz: [
      "Quais dos 18 componentes e 33 documentos este projeto precisa",
      "Cada parte do plano, na ordem em que uma depende da outra",
      "Rastreabilidade dos requisitos da RFP ao TAP e ao PGP",
    ],
    saidas: [
      { nome: "Planos do PGP", formatos: ["DOCX", "PDF"] },
      { nome: "Registros, cronograma e matrizes", formatos: ["XLSX"] },
    ],
  },
  {
    numero: 5,
    nome: "Conferência do plano",
    nomeCurto: "Conferência",
    resumoEntrada: "entra: PGP + TAP + RFP",
    usaPmo: false,
    fase: "F5",
    documentos: [
      { papel: "pgp", nome: "PGP do gerente", obrigatorio: true },
      {
        papel: "tap",
        nome: "TAP",
        obrigatorio: false,
        observacao: "Recomendado: é base para conferir o que o plano deixou de fora.",
      },
      {
        papel: "rfp",
        nome: "RFP",
        obrigatorio: false,
        observacao: "Recomendada: os requisitos dela também entram na conferência.",
      },
    ],
    ferramentaFaz: [
      "O que está vago, conflituoso ou ausente, por tempo, custo, escopo e domínios do PMBOK 7",
      "A gravidade pela parte do plano: grave, média ou baixa",
      "Cada achado com o trecho e a página, e um ajuste que o gerente acata ou descarta",
    ],
    saidas: [
      { nome: "Relatório de conformidade", formatos: ["DOCX", "PDF"] },
      { nome: "Lista de achados", formatos: ["XLSX"] },
    ],
  },
];

export function buscarEtapa(numero: number): Etapa | undefined {
  return ETAPAS.find((e) => e.numero === numero);
}

export const NOME_PAPEL: Record<PapelDocumento, string> = {
  rfp: "RFP",
  "anexo-rfp": "Anexo da RFP",
  proposta: "Proposta",
  tap: "TAP",
  pgp: "PGP",
};
