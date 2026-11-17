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
import { estimarTokens, referenciasEtapa1, textoDeSistema, textoDosDocumentos } from "../../src/pmo/montagem";
import { RespostaLeituraRfp } from "../../src/pmo/schemas/leitura-rfp";
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

function montarPasso(d: Dossie): Passo {
  const docs = d.documentos.filter((x) => x.papel === "rfp" || x.papel === "anexo-rfp");
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
    writeFileSync(arqDossie, serializarDossie(dossie, HOJE));
    const relatorio = join(
      dirname(resolve(env.RAIO_X_ARQUIVO ?? "")),
      `${basename(env.RAIO_X_ARQUIVO ?? "resposta", ".json")}.placar.md`,
    );
    writeFileSync(relatorio, `${linhas.join("\n")}\n`);
    console.log(`${linhas.join("\n")}\n\nDossiê atualizado: ${arqDossie}\nRelatório: ${relatorio}`);
  }, 120_000);
});
