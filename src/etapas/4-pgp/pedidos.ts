// Pedido de cada passo do PMO na etapa 4 (ordem da decisão 0007). Vai depois da skill e dos documentos (RFP, TAP e
// proposta, com cache). As fichas das partes do passo vão aqui, só as que o GP marcou para gerar.
import { questoesDoCodigo, questoesEmTexto } from "./questoes";
import { ehNumeroDeCompromisso } from "../2-proposta/compromissos";
import type { PgpDossie } from "../../dossie/esquema";
import { PARTES_PGP } from "../../dominio/skill";
import { dispensaDasFichas, fichasDasPartes } from "../../pmo/montagem";
import type { PassoPgp } from "../../pmo/schemas/pgp";
import { pontoDePartidaEmTexto } from "../2-proposta/ponto-de-partida";
import { premissasEmTexto } from "../3-tap/pedidos";
import type { EntradaPgp } from "./entrada";
import { PASSOS_PGP } from "./passos";
import { nomeDaParte, partesAGerar } from "./pgp";
import { destinoDaParte, fundidasDeTextoEm, LIMITES_DO_PORTE, NUCLEO_PEQUENO } from "./porte";
import { cronogramaDoPgp, custosDoPgp } from "./calculos";
import { textoDasHorasTotais } from "../2-proposta/preco";
import { INSTRUCAO_MARCOS, linhaDoTempoEmTexto, linhaDosDados } from "../linha-do-tempo";

const REGRAS = `Regras deste pedido (além da skill):
- Responda só com o objeto JSON do passo, no schema enviado.
- "rotulo" usa: documento | sugestao | decisao_gp. Item "documento" sempre com fonte: doc "rfp" (RFP e anexos), "tap" ou "proposta", página do arquivo e trecho literal. No TAP e na proposta do dossiê, cada "página" é uma seção. O app confere cada trecho; o que não for achado vira "citação não conferida".
- Sugestão em redação condicional ("sugere-se", "uma opção é", "recomenda-se avaliar"). Nada de valores, prazos, quantidades, cadências numéricas ou nomes que não estejam nos documentos: escreva "não informado no documento — a definir pelo GP".
- Valores, reservas, nomes da equipe e cadência das reuniões são decisao_gp.
- Em cada item, "ficha" é o item do conteúdo mínimo que ele cobre (A7.2, B27.13…). Cubra o conteúdo mínimo de cada parte, deixando de fora, com o motivo, o que a ficha diz ser dispensável para este projeto. Adapte ao porte: o PMBOK é guia, não checklist.
- Contas, datas, caminho crítico, marcos e totais são do código: não calcule.
- Autoconferência (decisão 0044): em "autoconferencia", marque CADA item do conteúdo mínimo das fichas das partes deste passo como "presente" (onde: o id do item que o cobre), "dispensado" (motivo: a condição da ficha que vale para o projeto) ou "decisao_gp" (motivo). Marca "decisao_gp" sempre com motivo: sem motivo, ela conta como incompleta. Não existe "ausente": o que faltaria, gere. Porte pequeno reduz partes, não a cobertura de uma parte mantida. Cadência de reuniões e relatórios é decisao_gp, com sugestão.
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

Requisitos da RFP (a lista de R da etapa 1, uma só do início ao fim; use estes números): ${e.ponto.listaDeR.map((r) => `${r.numero} (${r.rotulo})`).join("; ") || "nenhum"}.${e.ponto.rDescartados.length ? ` Descartados pelo GP na etapa 1 (não são R; se o documento os traz, entram como restrição ou observação): ${e.ponto.rDescartados.join(", ")}.` : ""}
Premissas críticas que se aplicam (decisão do GP): ${premissasEmTexto(premissas)}.
${p.abordagem ? `Abordagem escolhida pelo GP: ${p.abordagem}.` : ""}
${linhaDoPorte(p)}`;
}

/** O tamanho do plano pelo porte (decisão 0091): quantas partes e até quantas páginas. */
function linhaDoPorte(p: PgpDossie): string {
  const porte = p.caracteristicas?.porte;
  if (!porte || !p.adaptacao) return "";
  const partes = partesAGerar(p).length;
  const paginas = LIMITES_DO_PORTE[porte].paginas;
  // o orçamento por parte, em meias páginas (as tabelas do código contam no total)
  const porParte = Math.max(0.5, Math.round((paginas / Math.max(1, partes)) * 2) / 2);
  return `Porte do projeto (decisão do GP): ${porte}. Plano enxuto (decisão 0091): ${partes} partes geradas, o plano inteiro em até ${paginas} páginas, cerca de ${String(porParte).replace(".", ",")} página por parte com as tabelas. Uma linha por item da ficha que vale para o projeto; não repita o que outra parte ou o TAP já diz.`;
}

/** As partes do passo com as fundidas nelas (decisão 0091): a ficha da fundida vai junto, e a hospedeira cobre o conteúdo mínimo dela. */
function comFundidas(partes: string[], p: PgpDossie): string[] {
  return [...partes, ...partes.flatMap((c) => fundidasDeTextoEm(c, p))];
}

function partesDoPasso(passo: PassoPgp, p: PgpDossie): string[] {
  const gerar = new Set(partesAGerar(p));
  return (PASSOS_PGP.find((x) => x.passo === passo)?.textos ?? []).filter((c) => gerar.has(c));
}

/**
 * Partes do passo que o GP marcou, cada uma com as partes fundidas nela (decisão 0091), e, à parte, as que não se
 * escrevem como parte própria: a fundida (vai dentro da hospedeira) e a dispensada, com o motivo.
 */
function listaDePartes(codigos: string[], passo: PassoPgp, p: PgpDossie): string {
  const marcadas = codigos.length
    ? codigos
        .map((c) => {
          const fundidas = fundidasDeTextoEm(c, p);
          return `- ${c} — ${nomeDaParte(c)}${fundidas.length ? ` (inclui o conteúdo mínimo de ${fundidas.map((x) => `${x} — ${nomeDaParte(x)}`).join("; ")}: uma linha por item que vale, com a ficha do item, por exemplo ${fundidas[0]}.1)` : ""}`;
        })
        .join("\n")
    : "- nenhuma (o GP dispensou)";
  const fora = (PASSOS_PGP.find((x) => x.passo === passo)?.textos ?? []).filter((c) => !codigos.includes(c));
  return fora.length
    ? `${marcadas}\n\nNão escreva como parte própria (a fundida vai dentro da hospedeira acima; a dispensada não se escreve):\n${fora
        .map((c) => {
          const d = destinoDaParte(c, p);
          return `- ${c} — ${nomeDaParte(c)}: ${d.tipo === "fundida" ? `fundida em ${d.em}` : d.tipo === "dispensada" ? `dispensada — ${d.motivo}` : "gerada"}`;
        })
        .join("\n")}`
    : marcadas;
}

function resumoDoEscopo(p: PgpDossie): string {
  const eap = p.escopo?.resposta.eap ?? [];
  return eap.length
    ? eap.map((x) => `- ${x.id} ${x.nome} (produto ${x.produto}; ${x.requisitos.join(", ")})`).join("\n")
    : "- (EAP ainda não feita)";
}

/**
 * O cronograma do plano (passo cronograma da etapa 4), com o pacote, as predecessoras e a duração de cada atividade:
 * é ele que vale daqui em diante, não o da proposta. Sem as predecessoras, quem confere não vê, por exemplo, se o
 * encerramento vem depois do aceite (decisão 0081). A duração é a da conta do código (a esperada dos três pontos, o
 * tempo de aprovação do GP na análise do contratante, os dias úteis da janela na data fixa), e o aceite aparece de
 * um jeito ou de outro: atividade de análise do contratante, ou entrega com aprovação do cliente depois.
 */
export function resumoDoCronograma(p: PgpDossie, e: EntradaPgp): string {
  const c = p.cronograma?.resposta;
  if (!c) return "- (cronograma ainda não feito)";
  const conta = new Map((cronogramaDoPgp(p, e)?.atividades ?? []).map((a) => [a.id, a]));
  return [
    "Cronograma do plano (passo cronograma; é este que vale, não o da proposta; durações pela conta do código):",
    ...c.atividades.map((a) => {
      const k = conta.get(a.id);
      const duracao = k
        ? `${k.duracao} dias úteis`
        : `${a.duracao.mais_provavel} dias úteis (estimativa do PMO)`;
      const aceite = a.analiseDoContratante
        ? "; análise do contratante"
        : a.aprovacaoCliente
          ? `; com aprovação do cliente depois${k?.aprovacao ? ` (+${k.aprovacao} dias úteis, tempo do GP)` : " (tempo do GP ainda não informado)"}`
          : "";
      return `- ${a.id} ${a.nome} (produto ${a.produto}${a.pacote ? `, pacote ${a.pacote}` : ""}; depois de: ${a.predecessoras.join(", ") || "início"}; ${duracao}${aceite}${a.restricaoData ? `; data fixa ${a.restricaoData.inicio} a ${a.restricaoData.fim}` : ""})`;
    }),
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
1. partes: para cada uma das ${codigos.length} partes acima (${codigos.join(", ")}), sugira essencial, recomendado ou dispensavel para este projeto, com justificativa de uma linha (porte, campo, subcontratação, fases, contratante). Projeto pequeno não leva tudo: no porte pequeno, a ferramenta gera um PGP único com o núcleo (${NUCLEO_PEQUENO.join(", ")}, e A9 se a subcontratação for permitida) e funde as outras partes numa delas ou as dispensa (decisão 0091); sugira mesmo assim parte a parte. Quem marca é o GP.
2. abordagem (preditiva, adaptativa ou hibrida) e fases, cada uma com as entregas (P1…) e o critério de saída.
3. textos: o texto de A17 (ciclo de vida) e A18 (abordagem de desenvolvimento), cobrindo o conteúdo mínimo das fichas.
4. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

/**
 * Exclusões e limites de volume da proposta (números C, decisão 0047) que a especificação do escopo leva: exclusão na
 * B17.5, limite de volume na B17.7, com o C em "requisitos" do item. Sem a B17 marcada, nada a pedir.
 */
function compromissosDoEscopo(e: EntradaPgp, partes: string[]): string {
  if (!partes.includes("B17")) return "";
  const cs = (e.dadosProposta?.compromissos ?? []).filter(
    (c) => c.tipo === "exclusao" || c.tipo === "limite",
  );
  if (!cs.length) return "";
  return `Exclusões e limites de volume da proposta (números C, decisão 0047), que a especificação do escopo (B17) leva:
${cs.map((c) => `- ${c.numero} (${c.tipo === "exclusao" ? "exclusão → B17.5" : "limite de volume → B17.7"}): ${c.texto}`).join("\n")}
Cada um num item da B17 (B17.5 para as exclusões, B17.7 para os limites de volume), com o número C em "requisitos" do item que o leva, junto dos R quando houver. Exclusão nunca tira requisito. O código confere o destino de cada C no plano.

`;
}

/** Requisitos de alto nível do TAP; o R que saiu da lista na etapa 1 vai marcado, para não virar requisito do plano. */
function requisitosDoTapEmTexto(e: EntradaPgp): string {
  const daLista = new Set(e.ponto.listaDeR.map((r) => r.numero));
  return e.requisitosTap
    .map((r) => {
      const fora = r.requisitos.filter((n) => !daLista.has(n) && !ehNumeroDeCompromisso(n));
      const aviso = fora.length
        ? ` — ${fora.join(", ")} fora da lista de requisitos da RFP (descartado na etapa 1): trate como restrição, não como requisito.`
        : "";
      return `- ${r.texto} (${r.requisitos.join(", ")})${aviso}`;
    })
    .join("\n");
}

export function pedidoEscopo(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("escopo", p);
  const cobertas = comFundidas(partes, p);
  return `${cabecalho(e, p, "passo 3: escopo e requisitos (fichas A1, A2, B22, B17, A13)")}

Requisitos de alto nível do TAP:
${requisitosDoTapEmTexto(e) || "- (TAP em PDF ou sem TAP: ler no documento)"}

${compromissosDoEscopo(e, cobertas)}Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes, "escopo", p)}

${fichasDasPartes(cobertas)}

# O que fazer
1. textos: o texto de cada parte acima, item a item do conteúdo mínimo da ficha.
2. eap: os pacotes de trabalho por produto, com o dicionário (descrição e critério de aceite) e os números R de cada pacote. Toda entrega da lista de R deve estar em algum pacote; a obrigação (R do tipo obrigação) pode ficar só na especificação do escopo (B17) ou nos limites, com o número R. O código monta a matriz de rastreabilidade (B23) com isto.
3. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

export function pedidoCronograma(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("cronograma", p);
  const cobertas = comFundidas(partes, p);
  const marcos = e.marcosTap.map((m) => `- ${m.produto || "—"}: ${m.item.texto} (${m.prazo || "sem prazo"})`);
  return `${cabecalho(e, p, "passos 4 a 6: atividades, recursos e durações (fichas A3, A6, B1, B4, B26, B32 e as marcadas)")}

Pacotes da EAP (passo anterior):
${resumoDoEscopo(p)}

Marcos do TAP:
${marcos.join("\n") || "- (sem marcos do TAP no dossiê)"}

Linha do tempo do código (cronograma da proposta; decisão 0057):
${e.dadosProposta?.cronograma ? linhaDoTempoEmTexto(linhaDosDados(e.dadosProposta, e.ponto.prazoExecucao)) : "- sem o cronograma da etapa 2 no dossiê: confira os marcos pelos prazos do TAP e da RFP"}

${e.ponto.prazoExecucao ? `Prazo de execução na RFP: ${e.ponto.prazoExecucao.texto}. O código confere o cronograma contra ele e contra os marcos do TAP.` : "O código não localizou o prazo de execução na RFP."}

Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes, "cronograma", p)}

${fichasDasPartes(cobertas)}

# O que fazer
1. atividades: por pacote da EAP, com o campo "produto" = produto (P1…) e o campo "pacote" = código do pacote da lista acima ("2.1"), obrigatório; todo pacote tem ao menos uma atividade. Predecessoras e duração em três pontos em dias úteis, cada uma com a base. Atividade com data fixa (evento): restricaoData com início, fim e fonte. Se a análise e o aceite do contratante forem uma atividade própria, marque analiseDoContratante nela (o código troca a duração pelo tempo de aprovação do GP, quando houver) e não marque aprovacaoCliente na entrega anterior; sem essa atividade, marque aprovacaoCliente na entrega que o contratante aprova (o código soma o tempo depois). Não calcule datas nem o caminho crítico.
2. perfis (os exigidos pela RFP com fonte e número R, e os sugeridos), horas de cada perfil por atividade em três pontos com a base, e raci. Nunca nomes de pessoas.
3. textos: cada parte acima. O código monta a lista de atividades (B2), as durações (B8), o diagrama de rede (B16), o cronograma (B15), os marcos (B11), a linha de base do cronograma (A14) e as designações (B18).
4. observacoes: o que você achou e o código não, com fonte.
5. ${INSTRUCAO_MARCOS} Marco que não cabe vira risco no B27, com o caminho de reajuste no A11 (A11.13).

${REGRAS}`;
}

/** Prazo, data fixa com a folga até ela e horas a definir: a base dos riscos de prazo e das premissas PC3 e PC6. */
function contasDoCronograma(e: EntradaPgp, p: PgpDossie): string {
  const crono = cronogramaDoPgp(p, e);
  const custos = custosDoPgp(p, e);
  if (!crono) return "- cronograma ainda não calculado";
  const linhas = [crono.conferenciaPrazo.texto, ...crono.problemas];
  if (custos) {
    const abertas = custos.preco.linhas.filter((l) => l.horasADefinir.length);
    if (abertas.length) linhas.push(`Horas a definir pelo GP: ${textoDasHorasTotais(custos.preco)}.`);
  }
  return linhas.map((x) => `- ${x}`).join("\n");
}

export function pedidoRiscos(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("riscos", p);
  const cobertas = comFundidas(partes, p);
  const brechas = e.ponto.brechas.map((b) => `- ${b.id}: ${b.nome} — ${b.texto}`);
  return `${cabecalho(e, p, "passos 7 a 9: riscos, custos e atualização das premissas (fichas A8, B27, A4, B3)")}

${resumoDoCronograma(p, e)}

Contas do código sobre o cronograma (use; não refaça as contas):
${contasDoCronograma(e, p)}

Brechas da etapa 1 (o que o texto da RFP cria; não confundir com risco do projeto):
${brechas.join("\n") || "- nenhuma"}

${resumoDosRiscos(p, e)}

Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes, "riscos", p)}

${fichasDasPartes([...cobertas, "B27", "B3"])}

# O que fazer
1. riscos (B27): condições futuras da execução, cada uma com categoria, probabilidade e impacto qualitativos, estratégia, resposta, gatilho e responsável (papel). Cada premissa crítica que se aplica vira um risco com resposta e gatilho (B27.13). Marque pedeReserva no risco que pede reserva; o valor é do GP.
2. textos: ${soAsMarcadas(partes, { A8: "A8 (com o tratamento das premissas críticas, A8.12)", A4: "A4 (como os custos são estimados e controlados, com a reserva de contingência dentro da linha de base e a gerencial fora, valores do GP)" }) || "nenhuma parte de texto marcada neste passo"}. O código faz as estimativas de custos (B6) e a linha de base dos custos (A15).
3. premissas (B3): só as novas, que nascem das estimativas de duração e de custo e dos riscos, cada uma com a origem (B3.4). As do registro inicial do TAP já entram pelo código.
4. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

export function pedidoPlanos(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("planos", p);
  const cobertas = comFundidas(partes, p);
  return `${cabecalho(e, p, "passo 10: demais planos e documentos (as partes marcadas abaixo)")}

${resumoDoCronograma(p, e)}

${resumoDosRiscos(p, e)}

Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes, "planos", p)}

${fichasDasPartes(cobertas)}

# O que fazer
1. textos: cada parte marcada acima, item a item do conteúdo mínimo, e nenhuma parte dispensada.${exemplosDoQueNaoFalta(partes)}
2. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

/** Junta só os textos das partes marcadas ("A8 (…) e A4 (…)"). */
function soAsMarcadas(partes: string[], textos: Record<string, string>): string {
  const ok = Object.entries(textos)
    .filter(([c]) => partes.includes(c))
    .map(([, t]) => t);
  return ok.length > 1 ? `${ok.slice(0, -1).join(", ")} e ${ok.at(-1)}` : (ok[0] ?? "");
}

const NAO_PODE_FALTAR: Record<string, string> = {
  A5: "qualidade com métricas e critérios de aceite ligados aos da RFP",
  A7: "comunicações com as reuniões com o cliente e as internas da equipe (cadência e responsável: decisão do GP)",
  A9: "aquisições com o que pode ou não ser subcontratado, segundo a RFP",
  A10: "partes interessadas com a estratégia de engajamento",
  A11: "mudanças com o fluxo de alteração com o cliente, inclusive aditivos (licitacoes.md), e o modo de reajustar escopo, prazo e metas se uma premissa crítica falhar (A11.12)",
  A12: "configuração com as versões dos produtos",
};

function exemplosDoQueNaoFalta(partes: string[]): string {
  const ex = partes.filter((c) => NAO_PODE_FALTAR[c]).map((c) => NAO_PODE_FALTAR[c]);
  return ex.length ? ` Exemplos do que não pode faltar: ${ex.join("; ")}.` : "";
}

/** B9 montado pelo código: as questões com a origem; o PMO completa cada uma (não renumera nem cria sem fonte). */
function questoesDoPedido(e: EntradaPgp, partes: string[]): string {
  if (!partes.includes("B9")) return "";
  const qs = questoesDoCodigo(e);
  if (!qs.length) return "";
  return `Registro das questões (B9) que o código já montou, com a origem (ponto da etapa 1 ou divergência do TAP):
${questoesEmTexto(qs)}
No B9, escreva um item para cada QU, começando por "QU-nn —", com tipo, prioridade, responsável e data-alvo (o que o documento não dá é "a definir pelo GP"). Não renumere. Questão que já foi resolvida em outro lugar fica com status e a referência. Questão nova só com fonte, numerada depois da última.

`;
}

/**
 * A regra das questões no topo do pedido de execução (lição 188 da rodada 3): no fim, ela se perdia. Um item por
 * QU-nn, com o mesmo número, sem renumerar nem juntar.
 */
function regraDasQuestoesNoTopo(e: EntradaPgp, partes: string[]): string {
  if (!partes.includes("B9")) return "";
  const qs = questoesDoCodigo(e);
  if (!qs.length) return "";
  return `
**Antes de escrever, leia o pedido inteiro.** O código já montou o registro das questões (B9), com ${qs.length} questões (${qs[0]?.numero} a ${qs[qs.length - 1]?.numero}), mais abaixo. No B9: **um item por QU-nn, com o mesmo número, sem renumerar, sem juntar e sem resumir**. Questão ligada a outra fica com o próprio número, e cada uma fecha com a sua resposta. Marca "presente" na autoconferência só com o conteúdo escrito (situação, data de revisão, responsável).
`;
}

export function pedidoExecucao(e: EntradaPgp, p: PgpDossie): string {
  const partes = partesDoPasso("execucao", p);
  const cobertas = comFundidas(partes, p);
  return `${cabecalho(e, p, "passos 11 e 12: linha de base da medição e documentos de execução (as partes marcadas abaixo)")}
${regraDasQuestoesNoTopo(e, partes)}
${resumoDoCronograma(p, e)}

${questoesDoPedido(e, partes)}Partes a escrever neste passo (o GP marcou):
${listaDePartes(partes, "execucao", p)}

${fichasDasPartes(cobertas)}

# O que fazer
1. textos: ${partes.includes("A16") ? "A16 (como escopo, cronograma e custos são medidos juntos) e, " : ""}para cada documento de execução marcado, um modelo inicial: a estrutura e só as primeiras entradas que se puder tirar dos documentos, sem inventar acontecimentos. Parte dispensada não se escreve.
2. indicadores: os de acompanhamento (${partes.includes("A16") ? "por exemplo, de valor agregado e de prazo das entregas" : "prazo das entregas, aceite, rodadas de ajuste; sem valor agregado, porque o GP dispensou a linha de base da medição (A16)"}), com a fórmula, a meta (como o documento diz, ou "a definir pelo GP"), a frequência e a fonte do dado.
3. observacoes: o que você achou e o código não, com fonte.

${REGRAS}`;
}

/**
 * O PGP como estava antes do passo (decisão 0057): sem a resposta anterior do mesmo passo nem as dos passos seguintes.
 * As decisões do GP (partes a gerar, abordagem, parâmetros, revisões) ficam.
 */
export function pgpAntesDoPasso(p: PgpDossie, passo: PassoPgp): PgpDossie {
  const k = PASSOS_PGP.findIndex((x) => x.passo === passo);
  const sem = Object.fromEntries(PASSOS_PGP.slice(k).map((x) => [x.passo, undefined]));
  return { ...p, ...sem } as PgpDossie;
}

const antesDoPasso =
  (passo: PassoPgp, f: (e: EntradaPgp, p: PgpDossie) => string) =>
  (e: EntradaPgp, p: PgpDossie): string =>
    f(e, pgpAntesDoPasso(p, passo));

export const PEDIDOS_PGP: Record<PassoPgp, (e: EntradaPgp, p: PgpDossie) => string> = {
  adaptacao: antesDoPasso("adaptacao", pedidoAdaptacao),
  escopo: antesDoPasso("escopo", pedidoEscopo),
  cronograma: antesDoPasso("cronograma", pedidoCronograma),
  riscos: antesDoPasso("riscos", pedidoRiscos),
  planos: antesDoPasso("planos", pedidoPlanos),
  execucao: antesDoPasso("execucao", pedidoExecucao),
};
