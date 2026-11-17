// Pedido de cada passo do PMO na etapa 2, pelo método (docs/estudos/metodo-etapa-2.md, decisão 0038). Vai depois da
// skill e dos documentos (que ficam no cache), e é o único pedaço que muda entre os passos. Leva o esqueleto do código
// (modelo do edital, pontos, preço, contas): o PMO parte dele e não refaz o que é conta. A regra de saída é a da skill
// (SKILL.md, seção 4): só o JSON do passo.
import type { RespostaConteudo, RespostaEstrategia } from "../../pmo/schemas/proposta";
import { pontoDePartidaEmTexto, type PontoDePartida } from "./ponto-de-partida";
import type { TipoProjeto } from "./tipo";

const REGRAS = `Regras deste pedido (além da skill):
- Responda só com o objeto JSON do passo, no schema enviado.
- "rotulo" usa: documento | sugestao | decisao_gp. Item "documento" sempre com fonte: doc "rfp" (vale para a RFP e para os anexos em PDFs separados), página do arquivo PDF e trecho literal. O app confere cada trecho na página; o que não for achado vira "citação não conferida".
- Sugestão em redação condicional ("sugere-se", "uma opção é", "recomenda-se avaliar"). Nada de valores, prazos ou quantidades que não estejam no documento: escreva "não informado no documento — a definir pelo GP".
- Use os números de requisito do ponto de partida (R01, R02…). Requisito novo é sugestão, sem número.
- Não faça contas (somas, acumulados, pontos por preço, caixa, produtividade): são do código, que já mandou o resultado no esqueleto.
- Autoconferência (decisão 0044): em "autoconferencia", marque cada item das fichas prop-* usadas como "presente" (onde: o id do item), "dispensado" (motivo) ou "decisao_gp" (motivo). Nenhum item sem marca. Exclusão nunca tira requisito R.
- Campos de texto sem conteúdo ficam com "" e listas sem conteúdo ficam com [].`;

const TESTE = `Teste de cada item (método da etapa 2): "isto ajuda a ganhar pontos, a cumprir uma exigência ou a proteger a FGV na execução?" Se não ajuda, não entra. Texto genérico sobre o tema, sem ligação com um critério ou uma exigência, não entra.`;

function blocoEsqueleto(esqueleto?: string): string {
  return esqueleto ? `\n\n# Esqueleto do código\n${esqueleto}` : "";
}

export function pedidoEstrategia(p: PontoDePartida, esqueleto?: string): string {
  return `# Etapa 2 — Proposta · passo: estratégia (ficha PROP-ESTRATEGIA)

Ponto de partida, tirado da RFP pelo código (etapa 1, revisada pelo GP quando houver):

${pontoDePartidaEmTexto(p, { pedirDestino: true })}${blocoEsqueleto(esqueleto)}

# O que fazer
${TESTE}
1. Como o contratante vai avaliar (comoSeraAvaliada), cada critério de pontuação com a evidência exigida e a seção da proposta que responde a ele (criterios), e onde estão os pontos (ondeEstaoOsPontos). O código já separou os pontos de texto dos de documento: concentre o texto nos de texto.
2. De 2 a 3 abordagens que **mudam o resultado**, não só a redação (equipe de referência × produtividade superior; desconto pequeno × desconto pelo custo real; executar tudo × subcontratar parte; alcance). Em cada uma: prós, contras, requisitos atendidos (números R), riscos, mudaOResultado (o que muda) e riscoPrincipal (inclusive o de eliminação). Não escolha: a escolha é do GP.
3. Um destino para cada brecha listada no ponto de partida (pelo id): premissa, exclusao, obrigacao-contratante, folga, reserva ou pergunta.
4. Para cada premissa crítica PC1 a PC8 do checklist: se parece aplicar-se (sim, nao, a-confirmar), com o motivo. Quem confirma é o GP.
5. Em observacoes: o que você achou e o código não, sempre com fonte.

${REGRAS}`;
}

function resumoAbordagem(e: RespostaEstrategia, id: string, justificativa?: string): string {
  const a = e.abordagens.find((x) => x.id === id);
  if (!a) return `Abordagem ${id} (não encontrada na estratégia).`;
  return `Abordagem escolhida pelo GP: ${a.id} — ${a.nome}
${a.descricao}
${a.mudaOResultado ? `O que muda no resultado: ${a.mudaOResultado}\n` : ""}Prós: ${a.pros.join("; ")}
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
  esqueleto?: string,
): string {
  const modelo = p.modeloObrigatorio
    ? `O edital tem modelo obrigatório de proposta (${p.modeloObrigatorio.origem?.documento ?? "RFP"}, p. ${p.modeloObrigatorio.origem?.pagina}): siga-o à risca, na ordem.`
    : "Siga a ordem do modelo do edital que está no esqueleto; sem ele, a ficha PROP-ESTRUTURA, com uma seção por critério de pontuação.";
  return `# Etapa 2 — Proposta · passo: a minuta redigida (fichas PROP-ESTRUTURA, PROP-ENTENDIMENTO, PROP-METODOLOGIA, PROP-SOW)

Ponto de partida:

${pontoDePartidaEmTexto(p)}

${resumoAbordagem(e, abordagem, justificativa)}

${resumoEstrategia(e, premissasConfirmadas)}${blocoEsqueleto(esqueleto)}

# O que fazer
A saída é a **minuta redigida por inteiro**, no texto que vai ao cliente; o gerente revisa e completa os campos de decisão, não escreve do zero. ${TESTE}
1. estrutura: uma entrada por seção do modelo, na ordem. ${modelo} Em "codigo", o código da seção no modelo ("QUADRO 08", "d)"); em "criterio", o critério de pontuação a que ela responde. Os itens são os **parágrafos escritos** da seção (entendimento com as palavras do edital, metodologia por fase, escopo, equipe, metas, riscos, preço com a memória), não a descrição do que a seção deveria ter: nunca "nesta seção, apresentar…". Valor, quantidade ou prazo que o edital não dá fica "a definir pelo GP".
2. metodologia: cada fase ou módulo com objetivo, atividades, quem faz, entrega, duração com a base e "meses" (0 se corre em paralelo); o código soma os meses contra a vigência.
3. produtos (quando há): o SOW, um por entregável, ligado aos números R, com critérios de aceite verificáveis e o prazo como o documento diz (null se não diz).
4. metas: só as do edital, com indicador, fórmula e meio de aferição (rotulo "documento", com fonte); não acrescente metas.
5. exclusoes **próprias deste objeto** (vedações do edital, o que é do contratante ou de outro órgão, o que passa do volume ou da vigência) — nunca lista de outro tipo de projeto; limitesVolume; restricoes.
6. premissas: uma por premissa crítica que se aplica, no formato do método: o que se assume (texto), de quem depende (dependeDe), até quando (ateQuando; "a definir pelo GP" se o edital não dá), o que acontece se falhar (consequencia) e como se reajusta (reajuste: aditivo, prorrogação, revisão de metas), citando a proteção do próprio edital com a página quando houver.
7. riscos: a matriz, cada linha com gatilho, dono, resposta e a premissa crítica ligada.
8. obrigacoesContratante: o que fica com o contratante, com o prazo como o documento diz, ou "não informado no documento — a definir pelo GP".

${REGRAS}`;
}

export function pedidoEap(
  p: PontoDePartida,
  e: RespostaEstrategia,
  abordagem: string,
  c: RespostaConteudo,
  esqueleto?: string,
  tipoProjeto: TipoProjeto = "produtos",
): string {
  const produtos = c.produtos.map((x) => `- ${x.id}: ${x.nome} (${x.requisitos.join(", ")})`).join("\n");
  const equipe = p.requisitos
    .filter((r) => r.tipo === "equipe")
    .map((r) => `- ${r.numero}: ${r.descricao}`)
    .join("\n");
  const prazo = p.prazoExecucao
    ? `Prazo de execução na RFP: ${p.prazoExecucao.texto} (${p.prazoExecucao.origem?.documento ?? "RFP"}, p. ${p.prazoExecucao.origem?.pagina}). O código vai conferir o cronograma contra ele.`
    : "O código não localizou o prazo de execução na RFP.";
  const operacao = tipoProjeto !== "produtos";
  const comoEstimar = operacao
    ? `Projeto de operação contínua${tipoProjeto === "hibrido" ? " (híbrido: os produtos têm EAP; a operação, quadro)" : ""}: o preço é a folha mês a mês mais as despesas por natureza, **sem valor-hora e sem horas na EAP**${tipoProjeto === "hibrido" ? " na parte de operação" : ""}.
1. quadroEquipe: o quadro por função e faixa de meses (deMes, ateMes), com a base de cada número (proporção do edital, volume, produtividade). É sugestão: a curva de contratação é decisão do GP.
2. volumes: o volume previsto (visitas, atendimentos, turmas) por faixa de meses, a unidade, a função que o executa e a fonte; com eles o código confere o quadro contra o teto de produtividade escrito no edital.
3. atividades, horas: ${tipoProjeto === "hibrido" ? "só para os produtos" : "deixe vazias ([])"}; raci com o contratante como "A" nas validações (um só A por linha).`
    : `Consultoria por produtos:
1. atividades: a EAP por produto (campo "produto" = id do produto do SOW), com predecessoras (ids) e duração em três pontos em dias úteis, cada uma com a base. Marque aprovacaoCliente nas atividades que terminam num produto que o contratante aprova (o código soma o tempo de aprovação depois); se a análise do contratante for uma atividade própria, marque analiseDoContratante nela e não aprovacaoCliente na entrega (o código troca a duração pelo tempo de aprovação do GP). Não calcule datas, médias, caminho crítico nem totais.
2. perfis: os exigidos pela RFP (exigido: true, com fonte e número R) e os sugeridos. Nomes de pessoas nunca: são decisão do GP.
3. horas: horas de cada perfil por atividade, em três pontos, com a base.
4. raci: quem é R, A, C e I em cada atividade (um só A por linha). quadroEquipe e volumes ficam vazios ([]).`;
  return `# Etapa 2 — Proposta · passo: EAP, equipe e o que o preço cobre (fichas PROP-EAP-CRONOGRAMA, PROP-EQUIPE, PROP-PRECO, A13, B08, B04, B18)

${resumoAbordagem(e, abordagem)}

Produtos do SOW (passo anterior):
${produtos || "- nenhum produto no SOW"}

Equipe que a RFP fixa (código):
${equipe || "- o código não localizou equipe mínima"}

${prazo}${blocoEsqueleto(esqueleto)}

# O que fazer
${comoEstimar}
5. despesas a considerar, por natureza (pessoal, viagens, campo, equipamentos, comunicação, por território), sem valor; reservas: os riscos que pedem reserva, sem valor; estrategiasPreco: como sugestão, partindo do custo para o desconto.

${REGRAS}`;
}
