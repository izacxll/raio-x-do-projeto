// Pedido de cada passo do PMO na etapa 3. Vai depois da skill e dos documentos (RFP e proposta, com cache).
import { compromissosEmTexto } from "../2-proposta/compromissos";
import type { DecisaoDivergencia, RevisaoItem } from "../../dossie/esquema";
import type { RespostaTap } from "../../pmo/schemas/tap";
import { pontoDePartidaEmTexto } from "../2-proposta/ponto-de-partida";
import { NOME_SITUACAO_DIVERGENCIA, type Divergencia } from "./divergencias";
import { dadosEmTexto, type DadoDoDocumento } from "./do-documento";
import type { EntradaTap } from "./entrada";
import { itensDoPassoEmTexto, type PassoEtapa3 } from "./autoconferencia";
import { INSTRUCAO_MARCOS, linhaDoTempoEmTexto, linhaDosDados } from "../linha-do-tempo";
import { estadoDe, textoRevisado } from "../../pmo/itens";
import { idDoItemTap } from "./tap";

const regras = (passo: PassoEtapa3) => `Regras deste pedido (além da skill):
- Responda só com o objeto JSON do passo, no schema enviado.
- "rotulo" usa: documento | sugestao | decisao_gp. Item "documento" sempre com fonte: doc "rfp" (RFP e anexos), "proposta" ou "contrato", página do arquivo e trecho literal. Na proposta do dossiê, cada "página" é uma seção da minuta. O app confere cada trecho na página; o que não for achado vira "citação não conferida".
- Sugestão em redação condicional ("sugere-se", "uma opção é", "recomenda-se avaliar"). Nada de valores, prazos ou quantidades que não estejam nos documentos: escreva "não informado no documento — a definir pelo GP".
- GP designado, nível de autoridade, patrocinador e recursos financeiros são decisao_gp: só redação sugerida, nunca nome, valor ou alçada como fato.
- Use os números de requisito da RFP (R01, R02…). Requisito novo é sugestão, sem número.
- Autoconferência (decisão 0044): em "autoconferencia", marque cada item ${passo === "tap" ? "dos blocos de divergências e dos elementos do TAP" : "do bloco TAP-PR e da ficha B3"} — ${itensDoPassoEmTexto(passo)} —, e só eles, como "presente" (onde: o id do item), "dispensado" (motivo) ou "decisao_gp" (motivo). Marca "decisao_gp" sempre com motivo: sem motivo, ela conta como incompleta. ${passo === "premissas" ? "Este passo não gera o resto do TAP: não marque os outros itens da ficha." : "O registro de premissas é outro passo: não marque TAP-PR nem B3."} Divergência que muda escopo, custo ou quem executa fica pendente, com a versão que mais obriga a FGV.
- Campos de texto sem conteúdo ficam com "" e listas sem conteúdo ficam com [].`;

function divergenciasEmTexto(divs: Divergencia[], decisoes: Record<string, DecisaoDivergencia>): string {
  if (!divs.length) return "- nenhuma (sem proposta para comparar)";
  return divs
    .map((d) => {
      const dec = decisoes[d.id];
      const vale = dec
        ? `decisão do GP: vale ${dec.vale === "rfp" ? "a RFP" : dec.vale === "proposta" ? "a proposta" : dec.vale === "contrato" ? "o contrato" : `outra redação (${dec.texto ?? ""})`}`
        : `sem decisão do GP ainda${d.versaoSugerida ? ` (o código sugere: ${d.versaoSugerida})` : ""}`;
      return `- ${d.id} · ${NOME_SITUACAO_DIVERGENCIA[d.situacao]} · RFP: ${d.rfp.texto}${d.rfp.onde ? ` [${d.rfp.onde}]` : ""} · proposta: ${d.proposta.texto}${d.proposta.onde ? ` [${d.proposta.onde}]` : ""}${d.contrato ? ` · contrato: ${d.contrato.texto}${d.contrato.onde ? ` [${d.contrato.onde}]` : ""}` : ""} · ${vale}`;
    })
    .join("\n");
}

export function premissasEmTexto(pcs: Record<string, boolean>): string {
  const sim = Object.entries(pcs)
    .filter(([, v]) => v)
    .map(([k]) => k);
  return sim.length
    ? sim.join(", ")
    : "nenhuma confirmada pelo GP — trate as que parecem aplicar-se como sugestão";
}

/**
 * Compromissos numerados da proposta (decisão 0047) que o passo leva: o TAP, as exclusões e os limites de volume (nos
 * limites) e os compromissos de método (descrição, entregas ou aceite; decisão 0061); o registro, as premissas e as
 * obrigações do contratante. O PMO cita o C em "requisitos" do item.
 */
function compromissosDoPedido(e: EntradaTap, passo: "tap" | "premissas"): string {
  const tipos = passo === "tap" ? ["exclusao", "limite", "metodo"] : ["premissa", "obrigacao"];
  const cs = (e.dados?.compromissos ?? []).filter((c) => tipos.includes(c.tipo));
  if (!cs.length) return "";
  return `
## Compromissos da proposta que este passo leva (números C, decisão 0047)
${compromissosEmTexto(cs)}
Cada um vai para o destino indicado, com o número C em "requisitos" do item que o leva (junto dos R, quando houver). O código confere o destino de cada C.
`;
}

export function pedidoTap(
  e: EntradaTap,
  dados: DadoDoDocumento[],
  divs: Divergencia[],
  decisoes: Record<string, DecisaoDivergencia>,
  premissas: Record<string, boolean>,
): string {
  const fonte =
    e.fonte === "pdf"
      ? "a proposta final do GP, em PDF (doc: proposta)"
      : "a proposta da etapa 2, do dossiê (doc: proposta; cada página é uma seção da minuta)";
  const contrato = e.contrato
    ? `O contrato ou termo assinado foi enviado (doc: contrato) e **prevalece** sobre a proposta e a RFP (decisão 0041).${e.lidoDoContrato?.parteIntegrante ? ` Ele torna a proposta ou o plano de trabalho parte integrante (contrato, p. ${e.lidoDoContrato.parteIntegrante.pagina}): a proposta também obriga.` : ""}`
    : "O contrato assinado não foi enviado: o TAP parte da proposta e da RFP, e o que depender do contrato fica a confirmar.";
  return `# Etapa 3 — Termo de abertura · os 12 elementos (ficha TAP), pelo método da etapa 3

A proposta é ${fonte}. ${contrato}

Teste de cada item (método da etapa 3): "isto está assinado, ou é algo que o GP precisa decidir ou validar antes de começar?" O resto não entra. O TAP cabe em duas páginas, mais o registro de premissas.

## Ponto de partida da RFP (código, etapa 1)
${pontoDePartidaEmTexto(e.ponto)}

## O que vem direto dos documentos (código)
${dadosEmTexto(dados)}

## Divergências RFP × proposta × contrato (código) e a decisão do GP
${divergenciasEmTexto(divs, decisoes)}
${compromissosDoPedido(e, "tap")}
## Linha do tempo do código (cronograma da proposta; decisão 0057)
${e.dados?.cronograma ? linhaDoTempoEmTexto(linhaDosDados(e.dados, e.ponto.prazoExecucao)) : "- sem o cronograma da etapa 2 no dossiê: confira os marcos pelos prazos dos documentos"}

Premissas críticas que se aplicam (decisão do GP): ${premissasEmTexto(premissas)}

# O que fazer
0. divergenciasTexto (primeiro): as divergências que só a leitura acha, entre RFP, proposta e contrato: frase de conformidade ("em conformidade com o item X") que não confere com o item X; cláusula de proteção da proposta × cláusula do contrato; quem aprova e em que prazo; critério de conclusão da proposta × término do contrato; orçamento que parece não cobrir uma obrigação. Cada uma com as citações dos dois lados, a versão sugerida (rfp, proposta, contrato) e o que fazer. Não repita as do código.
Depois, redija os 12 elementos do TAP, em alto nível (o detalhe é do plano), a partir do que foi assinado, seguindo a ficha TAP item a item:
1. finalidade (TAP.1): o problema ou a necessidade e o resultado esperado, com a fonte.
2. objetivos (TAP.2): cada um com o critério de sucesso (indicador e meta). Se a RFP não traz a métrica, origemDaMetrica "sugestao".
3. requisitosAltoNivel (TAP.3): cada item com os números R que cobre; todos os R da RFP devem estar em algum item.
4. descricao, entregas (os produtos) e limites (TAP.4): produto que a proposta acrescentou e a RFP não pedia é compromisso da proposta (assinado quando há contrato; prometido enquanto não há): entra como entrega-chave, com critério de aceite. Os limites incluem as exclusões e os limites de volume da proposta (cada um com o número C em "requisitos"), as vedações da RFP e o que é do contratante, com a fonte. Exclusão nunca tira requisito. Cada compromisso de método da proposta (sigilo, dados pessoais, revisão interna, régua metodológica, protocolo de campo) vai para a descrição, para a entrega que ele protege ou para o aceite (TAP.9), com o número C em "requisitos"; enquanto não há contrato, ele é compromisso prometido na proposta.
5. riscoGeral (TAP.5): as fontes de incerteza do projeto, resumidas das brechas e das premissas críticas. Brecha não vira risco: diga a origem.
6. marcos (TAP.6): cada marco é um resultado concluído (entrega, aprovação, decisão), com o prazo contado de um evento, como os documentos dizem, **dentro da vigência** (a do contrato, quando houver). Entram os marcos que dependem do contratante (dados recebidos, sistema liberado, plano aprovado). Use as entregas calculadas pelo código; não calcule datas.
7. recursosFinanceiros (TAP.7), gerente (TAP.11) e patrocinador (TAP.12): decisao_gp, só a redação sugerida.
8. partesInteressadas (TAP.8): papel e o que decide; do lado do contratante (gestor e fiscal), só o papel: o nome é do GP confirmar no contrato.
9. aprovacao (TAP.9): quem avalia (gestor, comissão, fiscal), quem dá o aceite e quem autoriza o encerramento, ligados às cláusulas do contrato (ou da RFP), com a fonte; prazo que o documento não dá é "a definir pelo GP". termino (TAP.10): vigência, prorrogação (pedida e de ofício), prestação de contas final, devolução de saldo e de dados, denúncia e rescisão.
10. Em cada divergência com decisão do GP, siga a decisão; sem decisão, siga o contrato quando houver e escreva a diferença como pendente do GP. Itens da RFP que o contrato mudou não entram.
11. observacoes: o que você achou e o código não, sempre com fonte.
12. ${INSTRUCAO_MARCOS} Marco do TAP que promete data ("antes de …") ou caber na vigência e que a conta não confirma é divergência obrigatória, em divergenciasTexto.

${regras("tap")}`;
}

export function pedidoPremissas(
  e: EntradaTap,
  tap: RespostaTap | undefined,
  premissas: Record<string, boolean>,
  revisoes: Record<string, RevisaoItem> = {},
): string {
  // os limites e o risco geral como o GP os deixou: com o texto editado e sem os descartados (decisão 0068)
  const revisados = (campo: "limites" | "riscoGeral", nome: string) => {
    const itens = tap?.[campo] ?? [];
    if (!itens.length) return `- (TAP ainda sem ${nome})`;
    const validos = itens.flatMap((i, k) => {
      const id = idDoItemTap(campo, k);
      return estadoDe(revisoes, id) === "descartado" ? [] : [`- ${textoRevisado(id, i.texto, revisoes)}`];
    });
    return validos.join("\n") || `- (o GP descartou todos os itens de ${nome} do TAP)`;
  };
  const limites = revisados("limites", "limites");
  const risco = revisados("riscoGeral", "risco geral");
  return `# Etapa 3 — Termo de abertura · registro de premissas inicial (fichas B3 e TAP, bloco TAP-PR)

Requisitos da RFP (a lista de R da etapa 1, uma só do início ao fim): ${e.ponto.listaDeR.map((r) => r.numero).join(", ") || "nenhum"}.${e.ponto.rDescartados.length ? ` Descartados pelo GP na etapa 1 (não são R; se o documento os traz, entram como restrição ou observação): ${e.ponto.rDescartados.join(", ")}.` : ""}

Limites do TAP:
${limites}

Risco geral do TAP:
${risco}

Premissas críticas que se aplicam (decisão do GP): ${premissasEmTexto(premissas)}
${compromissosDoPedido(e, "premissas")}
# O que fazer
Na ordem do método da etapa 3 (seção 4.3):
1. primeiro, as premissas que a **proposta já escreveu** (dimensionamento, ritmo, produtividade), origem "proposta", rotulo "documento", com a fonte e o trecho literal (B3.1, B3.2, B3.3);
2. depois, cada premissa crítica que se aplica e a proposta **não escreveu**, numa linha própria, rotulo "sugestao", com o código (PC1…PC8), de quem depende, até quando e a consequência se não se confirmar (B3.9, TAP-PR.2);
3. restrições do contrato (ou da RFP, sem contrato): vigência, valor, sistemas obrigatórios, vedações, dados, regras de aceite e de pagamento, com a fonte (B3.5);
4. dependeDe e comoValidar: quem valida é decisão do GP; sugira que o contratante valide as que dependem dele. O que o documento não diz fica "a definir pelo GP". Esse registro é a entrada do registro de premissas (B3) da etapa 4.
5. observacoes: o que você achou e o código não, com fonte.

${regras("premissas")}`;
}
