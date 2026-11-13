// Vago: está escrito, mas não dá para conferir (falta prazo, número, responsável ou critério).
// Padrões de texto e modelos de texto da sugestão, em redação condicional (seção 4 da especificação).
// A lista cresce com a prova de conceito e com a leitura do PMO (decisão 0013).

export interface PadraoVago {
  id: string;
  /** Expressão regular sobre o texto normalizado (minúsculas, sem acento). */
  re: RegExp;
  /** O que falta para dar para conferir. */
  falta: "prazo" | "critério" | "quantidade" | "responsável";
  sugestao: string;
}

export const PADROES_VAGO: PadraoVago[] = [
  {
    id: "oportunamente",
    re: /\boportunamente\b|\bem momento oportuno\b|\bno momento oportuno\b/,
    falta: "prazo",
    sugestao:
      'Sugere-se trocar "oportunamente" por um prazo verificável (data, dias contados de um marco ou frequência).',
  },
  {
    id: "a-definir",
    re: /\ba (?:ser )?definid[oa]s?\b|\ba definir\b/,
    falta: "critério",
    sugestao:
      'Sugere-se definir o que ficou "a definir" (data, número, responsável ou critério) ou registrar quem decide e até quando.',
  },
  {
    id: "quando-necessario",
    re: /\bquando (?:for )?necessari[oa]s?\b|\bsempre que necessari[oa]\b|\bse necessari[oa]\b/,
    falta: "prazo",
    sugestao: 'Sugere-se trocar "quando necessário" por uma frequência ou por um gatilho verificável.',
  },
  {
    id: "conforme-demanda",
    re: /\bconforme (?:a )?(?:demanda|necessidade)s?\b|\bsob demanda\b/,
    falta: "quantidade",
    sugestao:
      "Sugere-se estimar o volume (quantidade máxima ou faixa) e dizer o que acontece se a demanda passar dele (premissa crítica PC8).",
  },
  {
    id: "em-tempo-habil",
    re: /\bem tempo habil\b|\bcom antecedencia (?:suficiente|razoavel|necessaria)\b/,
    falta: "prazo",
    sugestao: 'Sugere-se trocar "em tempo hábil" por um prazo em dias contados de um marco.',
  },
  {
    id: "se-for-o-caso",
    re: /\bse for o caso\b|\bquando (?:for o caso|couber|aplicavel)\b/,
    falta: "critério",
    sugestao: "Sugere-se dizer em que caso a regra vale, com um critério verificável.",
  },
  {
    id: "entre-outros",
    re: /\bentre outr[oa]s\b|\be demais (?:atividades|acoes|produtos|servicos|tarefas)\b/,
    falta: "quantidade",
    sugestao:
      "Sugere-se fechar a lista (o que está incluído e o que não está) para o escopo ter limite (premissa crítica PC8).",
  },
  {
    id: "na-medida-do-possivel",
    re: /\b(?:sempre que|na medida do|dentro do) possivel\b/,
    falta: "critério",
    sugestao:
      "Sugere-se trocar a expressão por um compromisso verificável ou registrar a condição como premissa.",
  },
  {
    id: "a-criterio",
    re: /\ba criterio d[ao] (?:contratante|contratada|cliente|fiscal|gestor)\b/,
    falta: "critério",
    sugestao: "Sugere-se escrever o critério que será usado, para a decisão poder ser conferida.",
  },
  {
    id: "eventualmente",
    re: /\beventualmente\b|\bposteriormente definid[oa]\b/,
    falta: "critério",
    sugestao: "Sugere-se dizer em que condição isso acontece e quem decide.",
  },
];
