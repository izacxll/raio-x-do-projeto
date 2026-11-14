// Pedido de cada passo do PMO na etapa 4 (ordem da decisão 0007). Vai depois da skill e dos documentos (RFP, TAP e
// proposta, com cache). As fichas das partes do passo vão aqui, só as que o GP marcou para gerar.
import type { PgpDossie } from "../../dossie/esquema";
import { PARTES_PGP } from "../../dominio/skill";
import { dispensaDasFichas, fichasDasPartes } from "../../pmo/montagem";
import type { PassoPgp } from "../../pmo/schemas/pgp";
import { pontoDePartidaEmTexto } from "../2-proposta/ponto-de-partida";
import { premissasEmTexto } from "../3-tap/pedidos";
import type { EntradaPgp } from "./entrada";
import { PASSOS_PGP } from "./passos";
import { nomeDaParte, partesAGerar } from "./pgp";

const REGRAS = `Regras deste pedido (além da skill):
- Responda só com o objeto JSON do passo, no schema enviado.
- "rotulo" usa: documento | sugestao | decisao_gp. Item "documento" sempre com fonte: doc "rfp" (RFP e anexos), "tap" ou "proposta", página do arquivo e trecho literal. No TAP e na proposta do dossiê, cada "página" é uma seção. O app confere cada trecho; o que não for achado vira "citação não conferida".
- Sugestão em redação condicional ("sugere-se", "uma opção é", "recomenda-se avaliar"). Nada de valores, prazos, quantidades, cadências numéricas ou nomes que não estejam nos documentos: escreva "não informado no documento — a definir pelo GP".
- Valores, reservas, nomes da equipe e cadência das reuniões são decisao_gp.
- Em cada item, "ficha" é o item do conteúdo mínimo que ele cobre (A7.2, B27.13…). Cubra o conteúdo mínimo de cada parte, deixando de fora, com o motivo, o que a ficha diz ser dispensável para este projeto. Adapte ao porte: o PMBOK é guia, não checklist.
- Contas, datas, caminho crítico, marcos e totais são do código: não calcule.
- Campos de texto sem conteúdo ficam com "" e listas sem conteúdo ficam com [].`;

function cabecalho(e: EntradaPgp, p: PgpDossie, titulo: string): string {
  const premissas = p.premissasAplicaveis ?? e.premissasAnteriores;
  const tap =
    e.fonteTap === "pdf"
      ? "O TAP aprovado pelo GP vem em PDF (doc: tap)."
      : e.fonteTap === "dossie"
        ? "O TAP vem da etapa 3, do dossiê (doc: tap; cada página é uma seção)."
        : "Não há TAP: use a RFP e marque o que depender dele como a definir pelo GP.";
  return `# Etapa 4 — Plano de gerenciamento do projeto · ${titulo}

${tap} ${e.fonteProposta === "nenhuma" ? "Não há proposta." : "A proposta também vai (doc: proposta)."}

Requisitos da RFP (use estes números): ${e.ponto.requisitos.map((r) => `${r.numero} (${r.rotulo})`).join("; ") || "nenhum"}.
Premissas críticas que se aplicam (decisão do GP): ${premissasEmTexto(premissas)}.
${p.abordagem ? `Abordagem escolhida pelo GP: ${p.abordagem}.` : ""}`;
}

function partesDoPasso(passo: PassoPgp, p: PgpDossie): string[] {
  const gerar = new Set(partesAGerar(p));
  return (PASSOS_PGP.find((x) => x.passo === passo)?.textos ?? []).filter((c) => gerar.has(c));
}

function listaDePartes(codigos: string[]): string {
  return codigos.length
    ? codigos.map((c) => `- ${c} — ${nomeDaParte(c)}`).join("\n")
    : "- nenhuma (o GP dispensou)";
}

function resumoDoEscopo(p: PgpDossie): string {
  const eap = p.escopo?.resposta.eap ?? [];
  return eap.length
    ? eap.map((x) => `- ${x.id} ${x.nome} (produto ${x.produto}; ${x.requisitos.join(", ")})`).join("\n")
    : "- (EAP ainda não feita)";
}

function resumoDoCronograma(p: PgpDossie): string {
  const c = p.cronograma?.resposta;
  if (!c) return "- (cronograma ainda não feito)";
  return [
    ...c.atividades.map((a) => `- ${a.id} ${a.nome} (produto ${a.produto})`),
    `Perfis: ${c.perfis.map((x) => `${x.id} ${x.nome}`).join("; ")}`,
  ].join("\n");
}

function resumoDosRiscos(p: PgpDossie, e: EntradaPgp): string {
  const riscos = p.riscos?.resposta.riscos ?? [];
  const premissasTap = e.premissasTap.map(
    (x) => `- ${x.premissaCritica ? `${x.premissaCritica}: ` : ""}${x.item.texto}`,
  );
  return [
    "Riscos do registro (B27):",
    ...(riscos.length
      ? riscos.map((r) => `- ${r.id}${r.premissaCritica ? ` (${r.premissaCritica})` : ""}: ${r.item.texto}`)
      : ["- (registro de riscos ainda não feito)"]),
    "Premissas do registro inicial (TAP):",
    ...(premissasTap.length ? premissasTap : ["- (sem registro inicial no dossiê)"]),
  ].join("\n");
}

export function pedidoAdaptacao(e: EntradaPgp, p: PgpDossie): string {
  const codigos = PARTES_PGP.map((f) => f.codigo);
  return `${cabecalho(e, p, "passos 1 e 2: adaptação, ciclo de vida e abordagem (PMBOK 7, adaptação; fichas A17 e A18)")}

## Ponto de partida da RFP (código, etapa 1)
${pontoDePartidaEmTexto(e.ponto)}

## Quando dispensar cada parte (das fichas)
${dispensaDasFichas(codigos)}

## Fichas de A17 e A18
${fichasDasPartes(["A17", "A18"])}

# O que fazer
1. partes: para cada uma das ${codigos.length} partes acima (${codigos.join(", ")}), sugira essencial, recomendado ou dispensavel para este projeto, com justificativa de uma linha (porte, campo, subcontratação, fases, contratante). Projeto pequeno não leva tudo. Quem marca é o GP.
2. abordagem (preditiva, adaptativa ou hibrida) e fases, cada uma com as entregas (P1…) e o critério de saída.
3. textos: o texto de A17 (ciclo de vida) e A18 (abordagem de desenvolvimento), cobrindo o conteúdo mínimo das fichas.
4. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

export function pedidoEscopo(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("escopo", p);
  return `${cabecalho(e, p, "passo 3: escopo e requisitos (fichas A1, A2, B22, B17, A13)")}

Requisitos de alto nível do TAP:
${e.requisitosTap.map((r) => `- ${r.texto} (${r.requisitos.join(", ")})`).join("\n") || "- (TAP em PDF ou sem TAP: ler no documento)"}

Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes)}

${fichasDasPartes(partes)}

# O que fazer
1. textos: o texto de cada parte acima, item a item do conteúdo mínimo da ficha.
2. eap: os pacotes de trabalho por produto, com o dicionário (descrição e critério de aceite) e os números R de cada pacote. Todo requisito da RFP deve estar em algum pacote. O código monta a matriz de rastreabilidade (B23) com isto.
3. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

export function pedidoCronograma(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("cronograma", p);
  const marcos = e.marcosTap.map((m) => `- ${m.produto || "—"}: ${m.item.texto} (${m.prazo || "sem prazo"})`);
  return `${cabecalho(e, p, "passos 4 a 6: atividades, recursos e durações (fichas A3, A6, B1, B4, B26, B32 e as marcadas)")}

Pacotes da EAP (passo anterior):
${resumoDoEscopo(p)}

Marcos do TAP:
${marcos.join("\n") || "- (sem marcos do TAP no dossiê)"}

${e.ponto.prazoExecucao ? `Prazo de execução na RFP: ${e.ponto.prazoExecucao.texto}. O código confere o cronograma contra ele e contra os marcos do TAP.` : "O código não localizou o prazo de execução na RFP."}

Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes)}

${fichasDasPartes(partes)}

# O que fazer
1. atividades: por pacote da EAP, com o campo "produto" = produto (P1…), predecessoras e duração em três pontos em dias úteis, cada uma com a base. Marque aprovacaoCliente nas atividades que terminam num produto que o contratante aprova. Não calcule datas nem o caminho crítico.
2. perfis (os exigidos pela RFP com fonte e número R, e os sugeridos), horas de cada perfil por atividade em três pontos com a base, e raci. Nunca nomes de pessoas.
3. textos: cada parte acima. O código monta a lista de atividades (B2), as durações (B8), o diagrama de rede (B16), o cronograma (B15), os marcos (B11), a linha de base do cronograma (A14) e as designações (B18).
4. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

export function pedidoRiscos(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("riscos", p);
  const brechas = e.ponto.brechas.map((b) => `- ${b.id}: ${b.nome} — ${b.texto}`);
  return `${cabecalho(e, p, "passos 7 a 9: riscos, custos e atualização das premissas (fichas A8, B27, A4, B3)")}

Atividades e perfis (passo anterior):
${resumoDoCronograma(p)}

Brechas da etapa 1 (o que o texto da RFP cria; não confundir com risco do projeto):
${brechas.join("\n") || "- nenhuma"}

${resumoDosRiscos(p, e)}

Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes)}

${fichasDasPartes([...partes, "B27", "B3"])}

# O que fazer
1. riscos (B27): condições futuras da execução, cada uma com categoria, probabilidade e impacto qualitativos, estratégia, resposta, gatilho e responsável (papel). Cada premissa crítica que se aplica vira um risco com resposta e gatilho (B27.13). Marque pedeReserva no risco que pede reserva; o valor é do GP.
2. textos: A8 (com o tratamento das premissas críticas, A8.12) e A4 (como os custos são estimados e controlados, com a reserva de contingência dentro da linha de base e a gerencial fora, valores do GP). O código faz as estimativas de custos (B6) e a linha de base dos custos (A15).
3. premissas (B3): só as novas, que nascem das estimativas de duração e de custo e dos riscos, cada uma com a origem (B3.4). As do registro inicial do TAP já entram pelo código.
4. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

export function pedidoPlanos(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("planos", p);
  return `${cabecalho(e, p, "passo 10: demais planos e documentos (fichas A5, A7, A9, A10, A11, A12, B14, B20, B31)")}

${resumoDosRiscos(p, e)}

Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes)}

${fichasDasPartes(partes)}

# O que fazer
1. textos: cada parte acima, item a item do conteúdo mínimo. Exemplos do que não pode faltar: qualidade com métricas e critérios de aceite ligados aos da RFP; comunicações com as reuniões com o cliente e as internas da equipe (cadência e responsável: decisão do GP); aquisições com o que pode ou não ser subcontratado, segundo a RFP; partes interessadas com a estratégia de engajamento; mudanças com o fluxo de alteração com o cliente, inclusive aditivos (licitacoes.md), e o modo de reajustar escopo, prazo e metas se uma premissa crítica falhar (A11.12); configuração com as versões dos produtos.
2. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

export function pedidoExecucao(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("execucao", p);
  return `${cabecalho(e, p, "passos 11 e 12: linha de base da medição e documentos de execução (fichas A16 e as marcadas)")}

Atividades (cronograma):
${resumoDoCronograma(p)}

Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes)}

${fichasDasPartes(partes)}

# O que fazer
1. textos: A16 (como escopo, cronograma e custos são medidos juntos) e, para cada documento de execução marcado, um modelo inicial: a estrutura e só as primeiras entradas que se puder tirar dos documentos, sem inventar acontecimentos.
2. indicadores: os de acompanhamento (por exemplo, de valor agregado e de prazo das entregas), com a fórmula, a meta (como o documento diz, ou "a definir pelo GP"), a frequência e a fonte do dado.
3. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

export const PEDIDOS_PGP: Record<PassoPgp, (e: EntradaPgp, p: PgpDossie) => string> = {
  adaptacao: pedidoAdaptacao,
  escopo: pedidoEscopo,
  cronograma: pedidoCronograma,
  riscos: pedidoRiscos,
  planos: pedidoPlanos,
  execucao: pedidoExecucao,
};
