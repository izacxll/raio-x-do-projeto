// Testar sem a chave: o Claude do claude.ai faz o papel do PMO (pedido da responsável, 16/11/2026).
// - exportar: grava, fora do Git, um .md com exatamente o que o app mandaria à API num passo do PMO (texto de
//   sistema, mensagem do usuário com o texto dos PDFs e o pedido, schema JSON da resposta) e um dossiê para importar.
// - importar: valida a resposta no schema, grava no dossiê como resposta do PMO, roda as travas do código e mede
//   contra o gabarito do Claude Code, numa seção "leitura independente". O gabarito nunca vai no pedido.
// Só roda pelos scripts npm run exportar-pedido / importar-resposta (RAIO_X_MODO=exportar|importar).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { criarDossieVazio, lerDossie, serializarDossie } from "../../src/dossie/arquivo";
import type { Dossie, DocumentoLido } from "../../src/dossie/esquema";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { leituraDoDossie, NOME_TRAVA, pedidoLeituraRfp } from "../../src/etapas/1-rfp/leitura-pmo";
import { analiseInicial } from "../../src/etapas/1-rfp/revisao";
import {
  estimarTokens,
  referenciasEtapa1,
  referenciasEtapa2,
  referenciasEtapa3,
  referenciasEtapa4,
  referenciasEtapa5,
  textoDeSistema,
  textoDosDocumentos,
} from "../../src/pmo/montagem";
import { RespostaLeituraRfp } from "../../src/pmo/schemas/leitura-rfp";
import { CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import type { PgpDossie } from "../../src/dossie/esquema";
import { citacaoEhFraca } from "../../src/etapas/1-rfp/leitura-pmo";
import { esqueletoEmTexto, montarMinuta } from "../../src/etapas/2-proposta/minuta";
import { pedidoConteudo, pedidoEap, pedidoEstrategia } from "../../src/etapas/2-proposta/pedidos";
import { montarPontoDePartida } from "../../src/etapas/2-proposta/ponto-de-partida";
import { propostaInicial } from "../../src/etapas/2-proposta/proposta";
import { compararRfpEProposta } from "../../src/etapas/3-tap/divergencias";
import { dadosDosDocumentos } from "../../src/etapas/3-tap/do-documento";
import { montarEntradaTap } from "../../src/etapas/3-tap/entrada";
import { pedidoPremissas, pedidoTap } from "../../src/etapas/3-tap/pedidos";
import { tapInicial } from "../../src/etapas/3-tap/tap";
import { montarEntradaPgp } from "../../src/etapas/4-pgp/entrada";
import { PASSOS_PGP } from "../../src/etapas/4-pgp/passos";
import { PEDIDOS_PGP } from "../../src/etapas/4-pgp/pedidos";
import { passoAnterior, pgpInicial } from "../../src/etapas/4-pgp/pgp";
import { conferirLeitura, pedidoLeitura } from "../../src/etapas/5-conferencia/leitura-pmo";
import { conferirAutoconferencia, partesARegenerar } from "../../src/pmo/autoconferencia";
import { citacaoValeComoFato, conferirCitacao } from "../../src/pmo/citacoes";
import type { FontePmo, ItemAutoconferencia } from "../../src/pmo/schemas/comum";
import { RespostaLeitura } from "../../src/pmo/schemas/leitura";
import { SCHEMAS_PGP, type PassoPgp } from "../../src/pmo/schemas/pgp";
import { SCHEMAS } from "../../src/pmo/schemas/proposta";
import { SCHEMAS_TAP } from "../../src/pmo/schemas/tap";
import { conferirPlano } from "../../src/regras/conferencia";
import { confirmacaoInicial, proporMapa } from "../../src/regras/mapa-pgp";
import { tirarAcentos } from "../../src/texto/normalizar";
import { lerPdf } from "../ajudantes/ler-pdf";
import { lerRfpPublica, PASTA_RFPS } from "../ajudantes/rfp-publica";

const env = process.env;
const MODO = env.RAIO_X_MODO;
const etapa = Number(env.RAIO_X_ETAPA ?? "0");
const passo = env.RAIO_X_PASSO ?? "";
const HOJE = new Date();

/** Gabaritos dos editais públicos de teste, por nome do PDF. */
const GABARITOS: Record<string, string> = {
  "chamamento-publico-termo-fomento-smped-sp-2025.pdf": "rfp-smped",
  "concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf": "rfp-oei",
};

async function lerRfp(arg: string): Promise<DocumentoLido> {
  if (existsSync(join(PASTA_RFPS, arg))) return lerRfpPublica(arg, HOJE);
  if (!existsSync(arg)) throw new Error(`RFP não encontrada: ${arg}`);
  return lerPdf(resolve(arg), "rfp", HOJE);
}

interface Passo {
  sistema: string;
  documentos: string;
  pedido: string;
  schema: z.ZodType;
}

/** Passos de cada etapa, na ordem: o seguinte só sai depois de importar a resposta do anterior. */
const PASSOS: Record<number, string[]> = {
  1: ["leitura-rfp"],
  2: ["estrategia", "conteudo", "eap"],
  3: ["tap", "premissas"],
  4: ["adaptacao", "escopo", "cronograma", "riscos", "planos", "execucao"],
  5: ["leitura"],
};

function precisa(cond: unknown, oQue: string): asserts cond {
  if (!cond) throw new Error(`Antes deste passo: ${oQue}.`);
}

/** Etapa 5: o plano a conferir entra no dossiê como documento "pgp" na exportação (decisão 0037: o mesmo do app). */
function entradaDaConferencia(d: Dossie) {
  const pgp = d.documentos.find((x) => x.papel === "pgp");
  precisa(pgp, "exporte com --plano <arquivo.pdf> (o plano a conferir)");
  const tap = d.documentos.find((x) => x.papel === "tap");
  const rfp = d.documentos.find((x) => x.papel === "rfp");
  const mapa = confirmacaoInicial(proporMapa(pgp.paginas, PARTES_PGP));
  const caracteristicas = d.pgp?.caracteristicas ?? CARACTERISTICAS_PADRAO;
  const premissasAplicaveis = d.tap?.premissasAplicaveis ?? d.proposta?.premissasAplicaveis ?? {};
  const resultado = conferirPlano({
    pgp: pgp.paginas,
    tap: tap?.paginas,
    rfp: rfp?.paginas,
    partes: PARTES_PGP,
    premissas: PREMISSAS_CRITICAS,
    mapa,
    caracteristicas,
    premissasAplicaveis,
    requisitos: [],
  });
  return { pgp, tap, rfp, mapa, caracteristicas, premissasAplicaveis, achados: resultado.achados };
}

function montarPasso(d: Dossie): Passo {
  const docs = d.documentos.filter((x) => x.papel === "rfp" || x.papel === "anexo-rfp");
  if (!PASSOS[etapa]?.includes(passo))
    throw new Error(
      `Passo "${passo}" não existe na etapa ${etapa}. Passos: ${PASSOS[etapa]?.join(", ") ?? "—"}.`,
    );
  if (etapa === 2) {
    const ponto = montarPontoDePartida(docs, d.analiseRfp, HOJE);
    const p = d.proposta ?? propostaInicial();
    const minuta = montarMinuta(ponto, p, docs, d.analiseRfp);
    const esqueleto = esqueletoEmTexto(minuta);
    const base = { sistema: textoDeSistema(referenciasEtapa2()), documentos: textoDosDocumentos(docs) };
    if (passo === "estrategia")
      return { ...base, pedido: pedidoEstrategia(ponto, esqueleto), schema: SCHEMAS.estrategia };
    const e = p.estrategia?.resposta;
    precisa(e && p.abordagem, "importe a estratégia (a abordagem escolhida vem dela ou de --abordagem)");
    if (passo === "conteudo")
      return {
        ...base,
        pedido: pedidoConteudo(
          ponto,
          e,
          p.abordagem.id,
          p.abordagem.justificativa,
          p.premissasAplicaveis,
          esqueleto,
        ),
        schema: SCHEMAS.conteudo,
      };
    const c = p.conteudo?.resposta;
    precisa(c, "importe o conteúdo");
    return {
      ...base,
      pedido: pedidoEap(ponto, e, p.abordagem.id, c, esqueleto, minuta.tipo.projeto),
      schema: SCHEMAS.eap,
    };
  }
  if (etapa === 3) {
    const entrada = montarEntradaTap(d, HOJE);
    precisa(
      entrada.fonte !== "nenhuma",
      "importe a proposta da etapa 2 (ou ponha o PDF da proposta no dossiê)",
    );
    const t = d.tap ?? tapInicial();
    const premissas = t.premissasAplicaveis ?? d.proposta?.premissasAplicaveis ?? {};
    const base = {
      sistema: textoDeSistema(referenciasEtapa3()),
      documentos: textoDosDocumentos(entrada.documentos),
    };
    if (passo === "tap")
      return {
        ...base,
        pedido: pedidoTap(
          entrada,
          dadosDosDocumentos(entrada),
          compararRfpEProposta(entrada),
          t.divergencias,
          premissas,
        ),
        schema: SCHEMAS_TAP.tap,
      };
    precisa(t.tap, "importe o TAP");
    return {
      ...base,
      pedido: pedidoPremissas(entrada, t.tap.resposta, premissas),
      schema: SCHEMAS_TAP.premissas,
    };
  }
  if (etapa === 4) {
    const entrada = montarEntradaPgp(d, HOJE);
    precisa(entrada.fonteTap !== "nenhuma", "importe o TAP da etapa 3 (ou ponha o PDF do TAP no dossiê)");
    const p = d.pgp ?? pgpInicial();
    const anterior = passoAnterior(passo as PassoPgp);
    precisa(!anterior || p[anterior], `importe o passo "${anterior}"`);
    return {
      sistema: textoDeSistema(referenciasEtapa4()),
      documentos: textoDosDocumentos(entrada.documentos),
      pedido: PEDIDOS_PGP[passo as PassoPgp](entrada, p),
      schema: SCHEMAS_PGP[passo as PassoPgp],
    };
  }
  if (etapa === 5) {
    const c = entradaDaConferencia(d);
    return {
      sistema: textoDeSistema(referenciasEtapa5()),
      documentos: textoDosDocumentos([c.pgp, ...(c.tap ? [c.tap] : []), ...(c.rfp ? [c.rfp] : [])]),
      pedido: pedidoLeitura({
        partesPresentes: c.mapa.filter((m) => m.situacao === "presente").map((m) => m.codigo),
        caracteristicas: c.caracteristicas,
        premissasAplicaveis: c.premissasAplicaveis,
        achadosDoCodigo: c.achados,
        temTap: Boolean(c.tap),
        temRfp: Boolean(c.rfp),
      }),
      schema: RespostaLeitura,
    };
  }
  if (etapa === 1 && passo === "leitura-rfp") {
    const analise = analisarRfp(docs, HOJE);
    const base = d.analiseRfp ?? analiseInicial(analise, HOJE);
    // o pedido parte do esqueleto do código, sem leitura anterior do PMO: como na tela
    const esqueleto = leituraDoDossie(analise, { ...base, leituraPmo: undefined }, docs, HOJE);
    return {
      sistema: textoDeSistema(referenciasEtapa1()),
      documentos: textoDosDocumentos(docs),
      pedido: pedidoLeituraRfp(esqueleto, HOJE),
      schema: RespostaLeituraRfp,
    };
  }
  throw new Error(
    `Etapa ${etapa}, passo "${passo}": ainda não disponível neste script (por ora, etapa 1, passo leitura-rfp).`,
  );
}

describe.skipIf(MODO !== "exportar")("exportar o pedido de um passo do PMO", () => {
  it("grava o pedido (.md) e o dossiê fora do Git", async () => {
    const saida = resolve(env.RAIO_X_SAIDA ?? "../pedidos-raio-x");
    mkdirSync(saida, { recursive: true });
    let dossie: Dossie;
    if (env.RAIO_X_DOSSIE && existsSync(env.RAIO_X_DOSSIE)) {
      const r = lerDossie(readFileSync(env.RAIO_X_DOSSIE, "utf8"), env.RAIO_X_DOSSIE);
      if (!r.ok) throw new Error(r.erro);
      dossie = r.dossie;
    } else {
      const rfp = await lerRfp(env.RAIO_X_RFP ?? "");
      dossie = { ...criarDossieVazio(HOJE), documentos: [rfp] };
      if (etapa === 1) dossie = { ...dossie, analiseRfp: analiseInicial(analisarRfp([rfp], HOJE), HOJE) };
    }
    // etapa 5: o plano a conferir (o PGP da etapa 4 exportado em PDF, ou outro) entra no dossiê como "pgp"
    if (etapa === 5 && env.RAIO_X_PLANO) {
      const plano = await lerPdf(resolve(env.RAIO_X_PLANO), "pgp", HOJE);
      dossie = { ...dossie, documentos: [...dossie.documentos.filter((x) => x.papel !== "pgp"), plano] };
    }
    const p = montarPasso(dossie);
    const schema = zodOutputFormat(p.schema).schema;
    const tokens = estimarTokens(p.sistema) + estimarTokens(p.documentos) + estimarTokens(p.pedido);
    const base = basename(dossie.documentos.find((x) => x.papel === "rfp")?.nomeArquivo ?? "rfp", ".pdf");
    const nome = `etapa-${etapa}-${passo}-${base}`;
    const md = `# Pedido ao PMO — etapa ${etapa}, passo ${passo}

- RFP: ${base}.pdf
- Gerado em ${HOJE.toLocaleString("pt-BR")} pelo app (npm run exportar-pedido), com exatamente o que iria à API.
- **Estimativa: cerca de ${tokens.toLocaleString("pt-BR")} tokens de entrada** (4 caracteres por token; sistema ${estimarTokens(p.sistema).toLocaleString("pt-BR")}, documentos ${estimarTokens(p.documentos).toLocaleString("pt-BR")}, pedido ${estimarTokens(p.pedido).toLocaleString("pt-BR")}).

## Como usar no claude.ai
1. Cole o bloco "Texto de sistema" como instrução do projeto (ou no início da conversa).
2. Cole a "Mensagem do usuário" (o texto dos PDFs e o pedido, nesta ordem).
3. Peça que a resposta seja **só o objeto JSON**, no schema do fim. Salve a resposta num arquivo .json.
4. Importe: \`npm run importar-resposta -- --etapa ${etapa} --passo ${passo} --arquivo <resposta.json> --dossie "${join(saida, `${nome}.dossie.json`)}"\`

O gabarito do Claude Code não está neste pedido: a leitura tem de ser independente.

## Texto de sistema
\`\`\`\`text
${p.sistema}
\`\`\`\`

## Mensagem do usuário
\`\`\`\`text
${p.documentos}

${p.pedido}
\`\`\`\`

## Schema JSON da resposta
\`\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`\`
`;
    writeFileSync(join(saida, `${nome}.md`), md);
    writeFileSync(join(saida, `${nome}.dossie.json`), serializarDossie(dossie, HOJE));
    console.log(
      `Pedido: ${join(saida, `${nome}.md`)}\nDossiê: ${join(saida, `${nome}.dossie.json`)}\nTokens de entrada: cerca de ${tokens}`,
    );
    expect(md.length).toBeGreaterThan(1000);
  }, 120_000);
});

const normal = (t: string) => tirarAcentos(t).toLowerCase().replace(/\s+/g, " ");

/** Todas as fontes citadas numa resposta do PMO, onde quer que estejam (itens, partes, riscos). */
function coletarFontes(x: unknown): FontePmo[] {
  if (Array.isArray(x)) return x.flatMap(coletarFontes);
  if (!x || typeof x !== "object") return [];
  const o = x as Record<string, unknown>;
  const aqui =
    typeof o.trecho === "string" && typeof o.pagina === "number" && typeof o.doc === "string"
      ? [o as FontePmo]
      : [];
  return [...aqui, ...Object.values(o).flatMap(coletarFontes)];
}

describe.skipIf(MODO !== "importar")("importar a resposta do PMO (leitura independente)", () => {
  it("valida, grava no dossiê, roda as travas e mede contra o gabarito", async () => {
    const arqDossie = env.RAIO_X_DOSSIE ?? "";
    const r = lerDossie(readFileSync(arqDossie, "utf8"), arqDossie);
    if (!r.ok) throw new Error(r.erro);
    let dossie = r.dossie;
    const p = montarPasso(dossie);
    const bruto = readFileSync(env.RAIO_X_ARQUIVO ?? "", "utf8")
      .replace(/^\uFEFF/, "")
      .trim();
    // aceita a resposta com a cerca de código ```json … ``` que o claude.ai costuma pôr em volta
    const json = bruto.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    const v = p.schema.safeParse(JSON.parse(json));
    if (!v.success) {
      const erros = v.error.issues.slice(0, 15).map((i) => `- ${i.path.join(".")}: ${i.message}`);
      console.log(`A resposta não segue o schema do passo:\n${erros.join("\n")}`);
      throw new Error("resposta fora do schema");
    }
    const linhas: string[] = [];
    if (etapa === 1) {
      const docs = dossie.documentos.filter((x) => x.papel === "rfp" || x.papel === "anexo-rfp");
      const analise = analisarRfp(docs, HOJE);
      const base = dossie.analiseRfp ?? analiseInicial(analise, HOJE);
      const salva = {
        ...base,
        leituraPmo: {
          resposta: v.data as z.infer<typeof RespostaLeituraRfp>,
          modelo: "claude.ai (leitura independente)",
          em: HOJE.toISOString(),
        },
      };
      dossie = { ...dossie, analiseRfp: salva };
      const leitura = leituraDoDossie(analise, salva, docs, HOJE);
      const doPmo = leitura.itens.filter((i) => i.doPmo);
      const travados = doPmo.filter((i) => i.trava);
      linhas.push(
        `# Leitura independente — etapa 1, ${basename(docs[0]?.nomeArquivo ?? "")}`,
        "",
        `Resposta importada em ${HOJE.toLocaleString("pt-BR")}. Itens do PMO: ${doPmo.length}; com aviso das travas do código: ${travados.length}.`,
        "",
        "## Avisos das travas, um por um",
        ...(travados.length
          ? travados.map(
              (i) =>
                `- ${NOME_TRAVA[i.trava!]} · ${i.secao} · ${i.nome}: ${i.texto.slice(0, 200)}${i.origem ? ` (p. ${i.origem.pagina})` : ""}`,
            )
          : ["- nenhum"]),
      );
      const pasta = GABARITOS[basename(docs[0]?.nomeArquivo ?? "")];
      if (pasta) {
        const g = JSON.parse(
          readFileSync(
            new URL(`../fixtures/gerados/${pasta}/gabarito-metodo-etapa-1.json`, import.meta.url),
            "utf8",
          ),
        ) as { secoes: Record<string, { id: string; nome: string; chaves: string[] }[]> };
        const textos = leitura.itens.map((i) => ({
          secao: i.secao,
          doPmo: Boolean(i.doPmo),
          texto: normal(
            [
              i.nome,
              i.texto,
              i.origem?.trecho ?? "",
              i.pergunta ?? "",
              ...(i.tabela?.linhas.flat() ?? []),
            ].join(" "),
          ),
        }));
        const casa = (chaves: string[], t: string) =>
          chaves.filter((c) => new RegExp(c).test(t)).length >= Math.ceil(chaves.length / 2);
        const todos = Object.entries(g.secoes).flatMap(([s, itens]) =>
          itens.map((i) => ({ ...i, secao: s })),
        );
        const cobertos = todos.filter((gi) => textos.some((t) => casa(gi.chaves, t.texto)));
        const pmoCobre = todos.filter((gi) => textos.some((t) => t.doPmo && casa(gi.chaves, t.texto)));
        const naoPassam = textos.filter((t) => t.doPmo && !todos.some((gi) => casa(gi.chaves, t.texto)));
        linhas.push(
          "",
          "## Placar contra o gabarito do Claude Code (leitura independente)",
          "",
          "O gabarito foi feito pelo Claude Code seguindo a skill; esta leitura foi feita fora do app, sem o gabarito no pedido.",
          "",
          `- Gabarito coberto pela leitura completa (esqueleto + PMO): ${cobertos.length} de ${todos.length}`,
          `- Gabarito coberto por itens do PMO: ${pmoCobre.length} de ${todos.length}`,
          `- Itens do PMO que não casam com o gabarito: ${naoPassam.length} de ${doPmo.length}`,
          "",
          "Por seção (gabarito / coberto):",
          ...Object.entries(g.secoes).map(
            ([s, itens]) =>
              `- ${s}: ${itens.length} / ${itens.filter((gi) => cobertos.includes({ ...gi, secao: s } as never) || textos.some((t) => casa(gi.chaves, t.texto))).length}`,
          ),
          "",
          "Faltam:",
          ...todos.filter((gi) => !cobertos.includes(gi)).map((gi) => `- ${gi.secao} · ${gi.id} ${gi.nome}`),
        );
      }
    }
    if (etapa >= 2) {
      let decisaoGp = "";
      const guardada = {
        resposta: v.data,
        modelo: "claude.ai (leitura independente)",
        em: HOJE.toISOString(),
      };
      if (etapa === 2) {
        const atual = dossie.proposta ?? propostaInicial();
        let proposta = { ...atual, [passo]: guardada } as typeof atual;
        if (passo === "estrategia") {
          // decisões do GP com o padrão do teste: --abordagem, ou a primeira sugerida; PC que o PMO não descartou
          const e = v.data as z.infer<typeof SCHEMAS.estrategia>;
          const id = env.RAIO_X_ABORDAGEM || e.abordagens[0]?.id;
          proposta = {
            ...proposta,
            abordagem: id
              ? { id, justificativa: "Escolhida para o teste externo (decisão do GP simulada)." }
              : undefined,
            premissasAplicaveis: Object.fromEntries(
              e.premissasCriticas.filter((x) => x.aplica !== "nao").map((x) => [x.codigo, true]),
            ),
          };
          decisaoGp = `Abordagem para os passos seguintes: ${id ?? "nenhuma"} (troque com --abordagem).`;
        }
        dossie = { ...dossie, proposta };
      }
      if (etapa === 3) dossie = { ...dossie, tap: { ...(dossie.tap ?? tapInicial()), [passo]: guardada } };
      if (etapa === 4) {
        let pgp = { ...(dossie.pgp ?? pgpInicial()), [passo]: guardada } as PgpDossie;
        if (passo === "adaptacao") {
          // decisão do GP com o padrão do teste: --gerar "A1,A3,…", ou tudo o que o PMO não marcou como dispensável
          const a = v.data as z.infer<typeof SCHEMAS_PGP.adaptacao>;
          const escolhidas = env.RAIO_X_GERAR
            ? new Set(env.RAIO_X_GERAR.split(",").map((x) => x.trim()))
            : undefined;
          pgp = {
            ...pgp,
            abordagem: a.abordagem,
            gerar: Object.fromEntries(
              a.partes.map((s) => [
                s.codigo,
                escolhidas ? escolhidas.has(s.codigo) : s.recomendacao !== "dispensavel",
              ]),
            ),
          };
        }
        dossie = { ...dossie, pgp };
      }
      // as citações são procuradas nos documentos que foram no pedido: na etapa 3 e na 4, a proposta e o TAP do
      // dossiê entram como documentos montados pelo app; na 5, o plano conferido
      const docsDoPedido =
        etapa === 3
          ? montarEntradaTap(dossie, HOJE).documentos
          : etapa === 4
            ? montarEntradaPgp(dossie, HOJE).documentos
            : dossie.documentos;
      const fontes = coletarFontes(v.data);
      const citacoes = fontes.map((f) => ({ f, c: conferirCitacao(f, docsDoPedido) }));
      const naoAchadas = citacoes.filter((x) => !citacaoValeComoFato(x.c));
      const fracas = citacoes.filter((x) => citacaoValeComoFato(x.c) && citacaoEhFraca(x.f.trecho));
      linhas.push(
        `# Leitura independente — etapa ${etapa}, passo ${passo}`,
        "",
        `Resposta importada em ${HOJE.toLocaleString("pt-BR")}. Citações: ${fontes.length}; não achadas na página: ${naoAchadas.length}; fracas (menos de 6 palavras): ${fracas.length}.`,
        ...(decisaoGp ? ["", decisaoGp] : []),
        ...naoAchadas
          .slice(0, 20)
          .map((x) => `- não achada · p. ${x.f.pagina}: "${x.f.trecho.slice(0, 120)}"`),
      );
      const marcas = (v.data as { autoconferencia?: ItemAutoconferencia[] }).autoconferencia ?? [];
      if (etapa === 4) {
        const esperados = PARTES_PGP.filter(
          (x) =>
            dossie.pgp?.gerar[x.codigo] &&
            PASSOS_PGP.find((y) => y.passo === passo)?.textos.includes(x.codigo),
        ).flatMap((x) => x.itens.map((i) => i.codigo));
        const r = conferirAutoconferencia(esperados, marcas);
        linhas.push(
          "",
          `## Autoconferência (decisão 0044): ${r.ok ? "completa" : "com falha"}`,
          `- itens esperados: ${esperados.length}; marcados: ${marcas.length}`,
          `- sem marca: ${r.semMarca.join(", ") || "nenhum"}`,
          `- marca incompleta: ${r.incompletas.join(", ") || "nenhuma"}`,
          `- partes que voltariam ao PMO: ${partesARegenerar(r).join(", ") || "nenhuma"}`,
        );
      } else if (etapa < 5)
        linhas.push("", `## Autoconferência (decisão 0044): ${marcas.length} item(ns) marcados`);
      if (etapa === 5) {
        const c = entradaDaConferencia(dossie);
        const conferidos = conferirLeitura(v.data as z.infer<typeof RespostaLeitura>, c, c.achados);
        const porSituacao = (s: string) => conferidos.filter((x) => x.situacao === s).length;
        linhas.push(
          "",
          `Achados do código: ${c.achados.length}. Achados do PMO: ${conferidos.length} (válidos ${porSituacao("valido")}, rebaixados ${porSituacao("rebaixado")}, citação não conferida ${porSituacao("citacao-nao-conferida")}).`,
        );
      }
    }
    writeFileSync(arqDossie, serializarDossie(dossie, HOJE));
    const relatorio = join(
      dirname(resolve(env.RAIO_X_ARQUIVO ?? "")),
      `${basename(env.RAIO_X_ARQUIVO ?? "resposta", ".json")}.placar.md`,
    );
    writeFileSync(relatorio, `${linhas.join("\n")}\n`);
    console.log(`${linhas.join("\n")}\n\nDossiê atualizado: ${arqDossie}\nRelatório: ${relatorio}`);
  }, 120_000);
});
