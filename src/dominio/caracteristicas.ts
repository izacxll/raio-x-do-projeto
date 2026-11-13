// Características do projeto, confirmadas pelo GP na tela do mapa do PGP (decisão 0013).
// São o vocabulário das condições de dispensa das fichas (_modelo.md da skill).

export interface Caracteristicas {
  porte: "pequeno" | "médio" | "grande";
  abordagem: "preditiva" | "adaptativa" | "híbrida";
  fases: "uma" | "várias";
  campo: boolean;
  beneficiarios: boolean;
  subcontratacao: "permitida" | "vedada" | "não informada";
  dadosPessoais: boolean;
  frentes: "uma" | "várias";
  contratante: "público" | "privado";
  pagamento: "por produto" | "por medição" | "de outra forma";
}

/** Valores conservadores: com eles, quase nada é dispensado, e o GP ajusta na tela. */
export const CARACTERISTICAS_PADRAO: Caracteristicas = {
  porte: "grande",
  abordagem: "preditiva",
  fases: "várias",
  campo: true,
  beneficiarios: true,
  subcontratacao: "não informada",
  dadosPessoais: true,
  frentes: "várias",
  contratante: "público",
  pagamento: "por produto",
};

/** As expressões permitidas em "dispensa" e se cada uma vale para o projeto. */
export function expressoes(c: Caracteristicas): Record<string, boolean> {
  return {
    "porte pequeno": c.porte === "pequeno",
    "porte médio": c.porte === "médio",
    "porte grande": c.porte === "grande",
    "abordagem preditiva": c.abordagem === "preditiva",
    "abordagem adaptativa": c.abordagem === "adaptativa",
    "abordagem híbrida": c.abordagem === "híbrida",
    "uma fase": c.fases === "uma",
    "várias fases": c.fases === "várias",
    "com campo": c.campo,
    "sem campo": !c.campo,
    "com beneficiários": c.beneficiarios,
    "sem beneficiários": !c.beneficiarios,
    "subcontratação permitida": c.subcontratacao === "permitida",
    "subcontratação vedada": c.subcontratacao === "vedada",
    "subcontratação não informada": c.subcontratacao === "não informada",
    "com dados pessoais": c.dadosPessoais,
    "sem dados pessoais": !c.dadosPessoais,
    "uma frente": c.frentes === "uma",
    "várias frentes": c.frentes === "várias",
    "contratante público": c.contratante === "público",
    "contratante privado": c.contratante === "privado",
    "pagamento por produto": c.pagamento === "por produto",
    "pagamento por medição": c.pagamento === "por medição",
    "pagamento de outra forma": c.pagamento === "de outra forma",
  };
}

export type ResultadoDispensa = { dispensavel: boolean; motivo: string } | { erro: string };

/**
 * Avalia uma condição de dispensa ("nunca", "porte pequeno", "porte pequeno e sem campo", "porte pequeno ou uma fase").
 * "e" liga mais forte que "ou". Expressão desconhecida é erro (o teste das fichas acusa).
 */
export function avaliarDispensa(condicao: string, c: Caracteristicas): ResultadoDispensa {
  const texto = condicao.trim();
  if (!texto || texto === "nunca") return { dispensavel: false, motivo: "" };
  const valores = expressoes(c);
  for (const alternativa of texto.split(/\s+ou\s+/)) {
    const termos = alternativa.split(/\s+e\s+/).map((t) => t.trim());
    for (const t of termos) if (!(t in valores)) return { erro: `expressão desconhecida: "${t}"` };
    if (termos.every((t) => valores[t])) return { dispensavel: true, motivo: alternativa };
  }
  return { dispensavel: false, motivo: "" };
}
