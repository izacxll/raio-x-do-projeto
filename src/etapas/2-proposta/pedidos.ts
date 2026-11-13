// Pedido de cada passo do PMO na etapa 2. Vai depois da skill e dos documentos (que ficam no cache), e é o único
// pedaço que muda entre os passos. A regra de saída é a da skill (SKILL.md, seção 4): só o JSON do passo.
import type { RespostaConteudo, RespostaEstrategia } from "../../pmo/schemas/proposta";
import { pontoDePartidaEmTexto, type PontoDePartida } from "./ponto-de-partida";

const REGRAS = `Regras deste pedido (além da skill):
- Responda só com o objeto JSON do passo, no schema enviado.
- "rotulo" usa: documento | sugestao | decisao_gp. Item "documento" sempre com fonte: doc "rfp" (vale para a RFP e para os anexos em PDFs separados), página do arquivo PDF e trecho literal. O app confere cada trecho na página; o que não for achado vira "citação não conferida".
- Sugestão em redação condicional ("sugere-se", "uma opção é", "recomenda-se avaliar"). Nada de valores, prazos ou quantidades que não estejam no documento: escreva "não informado no documento — a definir pelo GP".
- Use os números de requisito do ponto de partida (R01, R02…). Requisito novo é sugestão, sem número.
- Campos de texto sem conteúdo ficam com "" e listas sem conteúdo ficam com [].`;

export function pedidoEstrategia(p: PontoDePartida): string {
  return `# Etapa 2 — Proposta · passo 2: estratégia (ficha PROP-ESTRATEGIA)

Ponto de partida, tirado da RFP pelo código (etapa 1, revisada pelo GP quando houver):

${pontoDePartidaEmTexto(p)}

# O que fazer
1. Como o contratante vai avaliar: critério de julgamento e o que pesa (comoSeraAvaliada), cada critério de pontuação técnica com a evidência exigida e a seção da proposta que responde a ele (criterios), e onde estão os pontos (ondeEstaoOsPontos).
2. De 2 a 3 abordagens técnicas de fato diferentes (método, alcance, intensidade de campo), cada uma com prós, contras, requisitos atendidos (números R), riscos e impacto em prazo e custo em termos relativos. Não escolha: a escolha é do GP.
3. Um destino para cada brecha listada no ponto de partida (pelo id): premissa, exclusao, obrigacao-contratante, folga, reserva ou pergunta.
4. Para cada premissa crítica PC1 a PC8 do checklist: se parece aplicar-se a este projeto (sim, nao, a-confirmar), com o motivo. Quem confirma é o GP.
5. Em observacoes: o que você achou e o código não (requisito novo, exigência que pesa na decisão), sempre com fonte.

${REGRAS}`;
}

function resumoAbordagem(e: RespostaEstrategia, id: string, justificativa?: string): string {
  const a = e.abordagens.find((x) => x.id === id);
  if (!a) return `Abordagem ${id} (não encontrada na estratégia).`;
  return `Abordagem escolhida pelo GP: ${a.id} — ${a.nome}
${a.descricao}
Prós: ${a.pros.join("; ")}
Contras: ${a.contras.join("; ")}
Requisitos atendidos: ${a.requisitos.join(", ")}
${justificativa ? `Justificativa do GP: ${justificativa}` : ""}`;
}

function resumoEstrategia(e: RespostaEstrategia, premissasConfirmadas: Record<string, boolean>): string {
  const criterios = e.criterios.map(
    (c) =>
      `- ${c.criterio} (${c.pontuacaoMaxima || "pontuação não informada"}) → seção "${c.secaoDaProposta}"`,
  );
  const destinos = e.destinos.map((d) => `- ${d.origem || "outra"}: ${d.destino} — ${d.texto}`);
  const pcs = Object.entries(premissasConfirmadas)
    .filter(([, v]) => v)
    .map(([k]) => k);
  return `Critérios de pontuação e a seção que responde a cada um:
${criterios.join("\n") || "- o edital não pontua técnica, ou o código e o PMO não localizaram critérios"}

Destinos das brechas (estratégia):
${destinos.join("\n") || "- nenhum"}

Premissas críticas que o GP confirmou para este projeto: ${pcs.length ? pcs.join(", ") : "nenhuma confirmada ainda — trate as 'a-confirmar' como sugestão"}`;
}

export function pedidoConteudo(
  p: PontoDePartida,
  e: RespostaEstrategia,
  abordagem: string,
  justificativa: string | undefined,
  premissasConfirmadas: Record<string, boolean>,
): string {
  const modelo = p.modeloObrigatorio
    ? `O edital tem modelo obrigatório de proposta (${p.modeloObrigatorio.origem?.documento ?? "RFP"}, p. ${p.modeloObrigatorio.origem?.pagina}): siga-o à risca na estrutura (codigo "EDITAL").`
    : "O código não localizou modelo obrigatório de proposta: use a estrutura da ficha PROP-ESTRUTURA, com uma seção por critério de pontuação.";
  return `# Etapa 2 — Proposta · passo 4: conteúdo técnico (fichas PROP-ESTRUTURA, PROP-ENTENDIMENTO, PROP-METODOLOGIA, PROP-SOW)

Ponto de partida:

${pontoDePartidaEmTexto(p)}

${resumoAbordagem(e, abordagem, justificativa)}

${resumoEstrategia(e, premissasConfirmadas)}

# O que fazer
1. estrutura: as seções da proposta técnica, em ordem. ${modelo} Cada seção traz os itens de texto (entendimento do contexto e do problema, objetivos, metodologia da abordagem escolhida), e o campo "criterio" diz a que critério de pontuação ela responde.
2. produtos: o SOW, um produto por entregável, ligado aos números R, com critérios de aceite verificáveis.
3. exclusoes explícitas, premissas e restricoes. Cada premissa crítica confirmada sai escrita com a consequência se não se confirmar (PROP-SOW.11), e a que depende do contratante também como obrigação dele (PROP-SOW.8).
4. obrigacoesContratante: o que fica com o contratante, com o prazo como o documento diz, ou "não informado no documento — a definir pelo GP".

${REGRAS}`;
}

export function pedidoEap(
  p: PontoDePartida,
  e: RespostaEstrategia,
  abordagem: string,
  c: RespostaConteudo,
): string {
  const produtos = c.produtos.map((x) => `- ${x.id}: ${x.nome} (${x.requisitos.join(", ")})`).join("\n");
  const equipe = p.requisitos
    .filter((r) => r.tipo === "equipe")
    .map((r) => `- ${r.numero}: ${r.descricao}`)
    .join("\n");
  const prazo = p.prazoExecucao
    ? `Prazo de execução na RFP: ${p.prazoExecucao.texto} (${p.prazoExecucao.origem?.documento ?? "RFP"}, p. ${p.prazoExecucao.origem?.pagina}). O código vai conferir o cronograma contra ele.`
    : "O código não localizou o prazo de execução na RFP.";
  return `# Etapa 2 — Proposta · passo 5 e 6: EAP, estimativas e equipe (fichas PROP-EAP-CRONOGRAMA, PROP-EQUIPE, A13, B08, B04, B18)

${resumoAbordagem(e, abordagem)}

Produtos do SOW (passo anterior):
${produtos || "- nenhum produto no SOW"}

Equipe mínima exigida pela RFP (código):
${equipe || "- o código não localizou equipe mínima"}

${prazo}

# O que fazer
1. atividades: a EAP por produto (campo "produto" = id do produto do SOW), com predecessoras (ids) e duração em três pontos em dias úteis, cada uma com a base. Marque aprovacaoCliente nas atividades que terminam num produto que o contratante aprova: o código soma o tempo de aprovação. Não calcule datas, médias, caminho crítico nem totais: é do código.
2. perfis: os exigidos pela RFP (exigido: true, com fonte e número R) e os sugeridos. Nomes de pessoas nunca: são decisão do GP.
3. horas: horas de cada perfil por atividade, em três pontos, com a base.
4. raci: quem é R, A, C e I em cada atividade.
5. despesas a considerar (viagens, campo, logística, por território), sem valor; reservas: os riscos que pedem reserva, sem valor; estrategiasPreco: estratégias de preço possíveis numa licitação, como sugestão.

${REGRAS}`;
}
