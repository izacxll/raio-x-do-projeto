// Comparação de modelos da decisão 0002: os três passos da etapa 2 na mesma RFP pública (OEI), com o Opus 5.5 e
// com o Sonnet 5.5, lado a lado: aderência à redação condicional, números sem fonte (tem de ser zero), citações
// conferidas, cobertura dos requisitos, tokens e valor.
// Só roda com a chave: no PowerShell, $env:ANTHROPIC_API_KEY = "<chave>"; npm run comparar-modelos
// Custo estimado de uma rodada (preços de 13/11/2026): cerca de US$ 2 a 3 somando os dois modelos.
// Saída: tests/fixtures/gerados/comparacao-modelos/ (respostas de RFP pública, sem preço nem nomes).
import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MODELO_COMPARACAO, MODELO_PADRAO, MODELOS, type IdModelo } from "../../src/config/modelo";
import type { PropostaDossie } from "../../src/dossie/esquema";
import { pedidoConteudo, pedidoEap, pedidoEstrategia } from "../../src/etapas/2-proposta/pedidos";
import { montarPontoDePartida } from "../../src/etapas/2-proposta/ponto-de-partida";
import {
  avaliarItens,
  itensDaProposta,
  propostaInicial,
  registrarUso,
  requisitosCitadosForaDosItens,
  type AvaliacaoResposta,
} from "../../src/etapas/2-proposta/proposta";
import { chamarPmo } from "../../src/pmo/cliente";
import { formatarDolar } from "../../src/pmo/custo";
import { referenciasEtapa2, textoDeSistema, textoDosDocumentos } from "../../src/pmo/montagem";
import { SCHEMAS } from "../../src/pmo/schemas/proposta";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const CHAVE = process.env.ANTHROPIC_API_KEY;
// só pelo npm run comparar-modelos: ter a chave no ambiente não basta para gastar crédito num npm test
const LIGADA = process.env.COMPARAR_MODELOS === "sim" && Boolean(CHAVE);
const RFP = "concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf";
const PASTA = new URL("../fixtures/gerados/comparacao-modelos/", import.meta.url);

interface Resultado {
  modelo: IdModelo;
  avaliacao: AvaliacaoResposta;
  proposta: PropostaDossie;
  segundos: number;
}

async function rodar(modelo: IdModelo): Promise<Resultado> {
  const doc = await lerRfpPublica(RFP);
  const ponto = montarPontoDePartida([doc], undefined, new Date());
  const base = {
    chave: CHAVE as string,
    modelo,
    sistema: textoDeSistema(referenciasEtapa2()),
    documentos: textoDosDocumentos([doc]),
  };
  const inicio = Date.now();
  let p = propostaInicial(modelo);
  const e = await chamarPmo({
    ...base,
    passo: "estrategia",
    pedido: pedidoEstrategia(ponto),
    schema: SCHEMAS.estrategia,
  });
  p = registrarUso(
    { ...p, estrategia: { resposta: e.resposta, modelo: e.modelo, em: e.em } },
    "estrategia",
    e,
  );
  // a "escolha do GP" na comparação é fixa e igual para os dois modelos: a primeira abordagem e as premissas que o
  // próprio PMO marcou como "sim"
  const abordagem = e.resposta.abordagens[0]?.id ?? "A";
  const premissas = Object.fromEntries(
    e.resposta.premissasCriticas.filter((x) => x.aplica === "sim").map((x) => [x.codigo, true]),
  );
  p = { ...p, abordagem: { id: abordagem }, premissasAplicaveis: premissas };
  const c = await chamarPmo({
    ...base,
    passo: "conteudo",
    pedido: pedidoConteudo(ponto, e.resposta, abordagem, undefined, premissas),
    schema: SCHEMAS.conteudo,
  });
  p = registrarUso({ ...p, conteudo: { resposta: c.resposta, modelo: c.modelo, em: c.em } }, "conteudo", c);
  const w = await chamarPmo({
    ...base,
    passo: "eap",
    pedido: pedidoEap(ponto, e.resposta, abordagem, c.resposta),
    schema: SCHEMAS.eap,
  });
  p = registrarUso({ ...p, eap: { resposta: w.resposta, modelo: w.modelo, em: w.em } }, "eap", w);
  const itens = itensDaProposta(p, [doc]);
  return {
    modelo,
    avaliacao: avaliarItens(itens, ponto.requisitos, requisitosCitadosForaDosItens(p)),
    proposta: p,
    segundos: Math.round((Date.now() - inicio) / 1000),
  };
}

function resumo(rs: Resultado[]): string {
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const linha = (nome: string, f: (r: Resultado) => string) => `| ${nome} | ${rs.map(f).join(" | ")} |`;
  const custo = (r: Resultado) => r.proposta.uso.reduce((s, u) => s + (u.custoUsd ?? 0), 0);
  const tokens = (r: Resultado, k: "entrada" | "saida" | "escritaCache" | "leituraCache") =>
    r.proposta.uso.reduce((s, u) => s + u[k], 0).toLocaleString("pt-BR");
  return [
    `# Comparação de modelos — etapa 2 na RFP pública da OEI`,
    "",
    `Rodada de ${new Date().toLocaleString("pt-BR")}. Os três passos (estratégia, conteúdo, EAP), com a mesma escolha fixa de abordagem.`,
    "",
    `| Critério | ${rs.map((r) => MODELOS[r.modelo].nome).join(" | ")} |`,
    `|---|${rs.map(() => "---").join("|")}|`,
    linha("Itens rotulados", (r) => String(r.avaliacao.itens)),
    linha("Aderência da redação condicional (sugestões)", (r) => pct(r.avaliacao.aderencia)),
    linha("Números sem fonte (tem de ser zero)", (r) => String(r.avaliacao.numerosSemFonte)),
    linha(
      "Citações conferidas pelo código",
      (r) => `${r.avaliacao.citacoesConferidas} de ${r.avaliacao.citacoes}`,
    ),
    linha("Itens 'do documento' com citação não conferida", (r) => String(r.avaliacao.fatosSemCitacao)),
    linha(
      "Cobertura dos requisitos",
      (r) =>
        `${pct(r.avaliacao.cobertura)}${r.avaliacao.requisitosNaoCobertos.length ? ` (faltam ${r.avaliacao.requisitosNaoCobertos.join(", ")})` : ""}`,
    ),
    linha(
      "Tokens de entrada / cache escrito / cache lido / saída",
      (r) =>
        `${tokens(r, "entrada")} / ${tokens(r, "escritaCache")} / ${tokens(r, "leituraCache")} / ${tokens(r, "saida")}`,
    ),
    linha("Valor estimado", (r) => formatarDolar(custo(r))),
    linha("Tempo total", (r) => `${r.segundos} s`),
    "",
    "A qualidade do texto (estratégia, abordagens, EAP) se lê nas respostas salvas nesta pasta. A escolha do modelo é da responsável pelo projeto (decisão 0002).",
  ].join("\n");
}

describe.skipIf(!LIGADA)("comparação de modelos na etapa 2 (com a chave)", () => {
  it(
    "roda os três passos com os dois modelos e salva o resultado lado a lado",
    async () => {
      const rs = await Promise.all([rodar(MODELO_PADRAO), rodar(MODELO_COMPARACAO)]);
      mkdirSync(PASTA, { recursive: true });
      for (const r of rs) {
        for (const passo of ["estrategia", "conteudo", "eap"] as const)
          writeFileSync(
            new URL(`${r.modelo}-${passo}.json`, PASTA),
            JSON.stringify(r.proposta[passo]?.resposta, null, 2),
          );
      }
      writeFileSync(new URL("resumo.md", PASTA), resumo(rs));
      for (const r of rs) expect(r.avaliacao.itens).toBeGreaterThan(0);
    },
    30 * 60 * 1000,
  );
});
