// Pedido de cada passo do PMO na etapa 3. Vai depois da skill e dos documentos (RFP e proposta, com cache).
import type { DecisaoDivergencia } from "../../dossie/esquema";
import type { RespostaTap } from "../../pmo/schemas/tap";
import { pontoDePartidaEmTexto } from "../2-proposta/ponto-de-partida";
import { NOME_SITUACAO_DIVERGENCIA, type Divergencia } from "./divergencias";
import { dadosEmTexto, type DadoDoDocumento } from "./do-documento";
import type { EntradaTap } from "./entrada";

const REGRAS = `Regras deste pedido (além da skill):
- Responda só com o objeto JSON do passo, no schema enviado.
- "rotulo" usa: documento | sugestao | decisao_gp. Item "documento" sempre com fonte: doc "rfp" (RFP e anexos) ou "proposta", página do arquivo e trecho literal. Na proposta do dossiê, cada "página" é uma seção da minuta. O app confere cada trecho na página; o que não for achado vira "citação não conferida".
- Sugestão em redação condicional ("sugere-se", "uma opção é", "recomenda-se avaliar"). Nada de valores, prazos ou quantidades que não estejam nos documentos: escreva "não informado no documento — a definir pelo GP".
- GP designado, nível de autoridade, patrocinador e recursos financeiros são decisao_gp: só redação sugerida, nunca nome, valor ou alçada como fato.
- Use os números de requisito da RFP (R01, R02…). Requisito novo é sugestão, sem número.
- Campos de texto sem conteúdo ficam com "" e listas sem conteúdo ficam com [].`;

function divergenciasEmTexto(divs: Divergencia[], decisoes: Record<string, DecisaoDivergencia>): string {
  if (!divs.length) return "- nenhuma (sem proposta para comparar)";
  return divs
    .map((d) => {
      const dec = decisoes[d.id];
      const vale = dec
        ? `decisão do GP: vale ${dec.vale === "rfp" ? "a RFP" : dec.vale === "proposta" ? "a proposta" : `outra redação (${dec.texto ?? ""})`}`
        : "sem decisão do GP ainda";
      return `- ${d.id} · ${NOME_SITUACAO_DIVERGENCIA[d.situacao]} · RFP: ${d.rfp.texto}${d.rfp.onde ? ` [${d.rfp.onde}]` : ""} · proposta: ${d.proposta.texto}${d.proposta.onde ? ` [${d.proposta.onde}]` : ""} · ${vale}`;
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
  return `# Etapa 3 — Termo de abertura · os 12 elementos (ficha TAP)

A proposta é ${fonte}.

## Ponto de partida da RFP (código, etapa 1)
${pontoDePartidaEmTexto(e.ponto)}

## O que vem direto dos documentos (código)
${dadosEmTexto(dados)}

## Divergências RFP × proposta (código) e a decisão do GP
${divergenciasEmTexto(divs, decisoes)}

Premissas críticas que se aplicam (decisão do GP): ${premissasEmTexto(premissas)}

# O que fazer
Redija os 12 elementos do TAP, em alto nível (o detalhe é do plano), seguindo a ficha TAP item a item:
1. finalidade (TAP.1): o problema ou a necessidade e o resultado esperado, com a fonte.
2. objetivos (TAP.2): cada um com o critério de sucesso (indicador e meta). Se a RFP não traz a métrica, origemDaMetrica "sugestao".
3. requisitosAltoNivel (TAP.3): cada item com os números R que cobre; todos os R da RFP devem estar em algum item.
4. descricao, entregas (os produtos) e limites (TAP.4): os limites incluem as exclusões da proposta, com a fonte.
5. riscoGeral (TAP.5): as fontes de incerteza do projeto, resumidas das brechas e das premissas críticas. Brecha não vira risco: diga a origem.
6. marcos (TAP.6): cada marco é um resultado concluído (entrega, aprovação, decisão), com o prazo contado de um evento, como os documentos dizem. Use as entregas calculadas pelo código; não calcule datas.
7. recursosFinanceiros (TAP.7), gerente (TAP.11) e patrocinador (TAP.12): decisao_gp, só a redação sugerida.
8. partesInteressadas (TAP.8): papel e o que decide; quem decide do lado do contratante (gestor e fiscal) nominal ou "a definir pelo GP".
9. aprovacao (TAP.9) e termino (TAP.10): ligados às cláusulas de recebimento e de extinção da RFP, com a fonte.
10. Em cada divergência com decisão do GP, siga a decisão; sem decisão, escreva a diferença como pendente do GP.
11. observacoes: o que você achou e o código não, sempre com fonte.

${REGRAS}`;
}

export function pedidoPremissas(
  e: EntradaTap,
  tap: RespostaTap | undefined,
  premissas: Record<string, boolean>,
): string {
  const limites = tap?.limites.map((i) => `- ${i.texto}`).join("\n") || "- (TAP ainda sem limites)";
  const risco = tap?.riscoGeral.map((i) => `- ${i.texto}`).join("\n") || "- (TAP ainda sem risco geral)";
  return `# Etapa 3 — Termo de abertura · registro de premissas inicial (fichas B3 e TAP, bloco TAP-PR)

Requisitos da RFP: ${e.ponto.requisitos.map((r) => r.numero).join(", ") || "nenhum"}.

Limites do TAP:
${limites}

Risco geral do TAP:
${risco}

Premissas críticas que se aplicam (decisão do GP): ${premissasEmTexto(premissas)}

# O que fazer
1. premissas: as premissas e restrições assumidas na proposta e no TAP, cada uma numa frase verificável, com o tipo e a origem (rfp, proposta, tap ou estimativa) e a fonte com o trecho literal quando vier de documento (B3.1, B3.2, B3.3, B3.5).
2. Cada premissa crítica confirmada pelo GP sai numa linha própria, com o código (PC1…PC8), de quem depende, até quando e a consequência se não se confirmar (B3.9, TAP-PR.2).
3. Restrições do contrato: prazo final, valor, vedação de subcontratação, regras de aceite e de pagamento, com a fonte (B3.5).
4. dependeDe e comoValidar: como os documentos dizem, ou "a definir pelo GP".
5. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}
