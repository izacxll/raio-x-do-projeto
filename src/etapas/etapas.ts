// As cinco etapas do app, como na página "03 · O fluxo" da apresentação (seção 5.0 da especificação).
// A estrutura aceita uma etapa seguinte (a "etapa 6", ainda a definir): basta acrescentar um item à lista.
// O conteúdo dela não é inventado aqui.

export type NumeroEtapa = 1 | 2 | 3 | 4 | 5;

export type PapelDocumento = "rfp" | "anexo-rfp" | "proposta" | "contrato" | "tap" | "pgp";

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
  /** Todas as etapas usam o PMO (API do Claude, com a chave do GP): nada é analisado sem a conexão (decisão 0037). */
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
    // decisões 0035 e 0037: o PMO lê, o código monta e confere; sem a conexão com o Claude, nada é analisado
    usaPmo: true,
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
      "Lê a RFP em 8 seções, na ordem da decisão: o que é, o que fazer, prazos, dinheiro, julgamento, habilitação, pontos de atenção",
      "Liga cada ponto de atenção a uma premissa crítica e sugere a pergunta de esclarecimento",
      "Confere cada citação e cada número na página; sem a chave, mostra o esqueleto do código",
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
      { nome: "Minuta da proposta técnica", formatos: ["DOCX", "PDF"] },
      { nome: "Planilha de preço", formatos: ["XLSX"] },
      { nome: "Matriz de atendimento e checklist de envio", formatos: ["XLSX"] },
      { nome: "Perguntas de esclarecimento", formatos: ["DOCX"] },
    ],
  },
  {
    numero: 3,
    nome: "Termo de abertura (TAP)",
    nomeCurto: "TAP",
    resumoEntrada: "entra: RFP + proposta (+ contrato assinado)",
    usaPmo: true,
    fase: "F3",
    documentos: [
      { papel: "rfp", nome: "RFP", obrigatorio: true },
      {
        papel: "anexo-rfp",
        nome: "Anexos da RFP",
        obrigatorio: false,
        varios: true,
      },
      {
        papel: "proposta",
        nome: "Proposta final do gerente",
        obrigatorio: false,
        observacao:
          "Obrigatória se a etapa 2 não foi feita neste dossiê. Se o GP editou a proposta fora da ferramenta, envie o PDF da versão final: ele vale no lugar da minuta da etapa 2.",
      },
      {
        papel: "contrato",
        nome: "Contrato ou termo assinado",
        obrigatorio: false,
        observacao:
          "Recomendado: o que foi assinado prevalece sobre a proposta e a RFP. As divergências entre os três vêm primeiro no TAP.",
      },
    ],
    ferramentaFaz: [
      "Divergências entre RFP, proposta e contrato, primeiro: valor, parcelas, frase de conformidade, duração × vigência, equipe e produtos",
      "Os 12 elementos do TAP, cada um com a origem, a partir do que foi assinado",
      "Campos que só o gerente preenche, como patrocinador e nível de autoridade",
    ],
    saidas: [
      { nome: "Termo de abertura do projeto", formatos: ["DOCX", "PDF"] },
      { nome: "Registro de premissas inicial", formatos: ["XLSX"] },
    ],
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
      {
        papel: "anexo-rfp",
        nome: "Anexos da RFP",
        obrigatorio: false,
        varios: true,
      },
      {
        papel: "tap",
        nome: "TAP aprovado",
        obrigatorio: false,
        observacao:
          "Obrigatório se a etapa 3 não foi feita neste dossiê. Se o TAP foi aprovado com mudanças fora da ferramenta, envie o PDF: ele vale no lugar do TAP da etapa 3.",
      },
      {
        papel: "proposta",
        nome: "Proposta final",
        obrigatorio: false,
        observacao:
          "Opcional: útil para cronograma, custos e escopo. Sem ela, vale a proposta da etapa 2, se houver.",
      },
    ],
    ferramentaFaz: [
      "Quais dos 18 componentes e 33 documentos este projeto precisa",
      "Cada parte do plano, na ordem em que uma depende da outra",
      "Rastreabilidade dos requisitos da RFP ao TAP e ao PGP",
    ],
    saidas: [
      { nome: "Plano de gerenciamento do projeto", formatos: ["DOCX", "PDF"] },
      { nome: "Registros, cronograma e matrizes", formatos: ["XLSX"] },
    ],
  },
  {
    numero: 5,
    nome: "Conferência do plano",
    nomeCurto: "Conferência",
    resumoEntrada: "entra: plano + TAP ou termo + RFP",
    // decisão 0037: a conferência por código e a leitura do PMO numa ação só, com a conexão
    usaPmo: true,
    fase: "F5",
    documentos: [
      { papel: "pgp", nome: "Plano (PGP ou plano de trabalho)", obrigatorio: true },
      {
        papel: "tap",
        nome: "TAP ou termo assinado",
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
      "A leitura do PMO, com cada citação conferida pelo código e o ausente procurado no plano inteiro",
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
  contrato: "Contrato ou termo assinado",
  tap: "TAP",
  pgp: "PGP",
};
