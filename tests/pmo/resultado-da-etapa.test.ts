// Resultado de uma etapa para apresentação (decisão 0072). Os testes de sempre usam texto inventado; o modo
// "resultado" (npm run resultado-da-etapa) gera o DOCX de um caso do teste externo, fora do Git.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { criarDossieVazio, lerDossie } from "../../src/dossie/arquivo";
import {
  type ArquivosDoPasso,
  lerConferenciaEmBlocos,
  montarResultadoDaEtapa,
  placarResumido,
} from "../../src/exportacao/resultado-da-etapa";

const HOJE = new Date(2026, 10, 18);

const CONFERENCIA = `# Segunda instância — etapa 4, passo riscos, rodada 2

Achados: 1 (alta: 0, média: 1). Todo achado é Sugestão: quem decide é o GP.

## Achados
- **média** · rótulo errado · R3: gatilho com número que o documento não dá. Sugestão: deixar a antecedência ao GP.

## O que foi conferido e passou
- Números R conferidos.

## Decisão do GP — 18/11/2026, 10:44:00

GP seguiu com correção: resposta corrigida depois da rodada 2, sem nova conferência. Resposta do passo: \`resposta.json\`.
`;

describe("resultado da etapa (decisão 0072)", () => {
  it("placar resumido: o começo e o resumo de cada bloco, com limite", () => {
    const placar = [
      "# Leitura independente — etapa 4, passo riscos",
      "",
      "Tokens do pedido: cerca de 80.000.",
      "## Autoconferência do plano",
      "- achados: 2 (vago 1, conflituoso 0, ausente 1)",
      "  - detalhe que não entra",
      "  - outro detalhe",
      "## Contingência pelo código",
      "- riscos que pedem reserva: R2",
    ].join("\n");
    const r = placarResumido(placar);
    expect(r).toContain("Autoconferência do plano");
    expect(r).toContain("• achados: 2 (vago 1, conflituoso 0, ausente 1)");
    expect(r).toContain("• riscos que pedem reserva: R2");
    expect(r.join(" ")).not.toContain("outro detalhe");
  });

  it("conferência em blocos: achados, conferido e o que o GP decidiu", () => {
    const c = lerConferenciaEmBlocos(CONFERENCIA);
    expect(c.achados).toEqual([
      "• média · rótulo errado · R3: gatilho com número que o documento não dá. Sugestão: deixar a antecedência ao GP.",
    ]);
    expect(c.conferido).toEqual(["• Números R conferidos."]);
    expect(c.decisoes[0]).toMatch(/^Decisão do GP — 18\/11\/2026/);
    expect(c.decisoes.join(" ")).toMatch(/GP seguiu com correção/);
  });

  it("documento: o resultado primeiro e o processo no anexo (decisão 0084); sempre minuta", () => {
    const d = montarResultadoDaEtapa(
      criarDossieVazio(HOJE),
      4,
      [{ passo: "riscos", placar: "# x\n- achados: 0", conferencia: CONFERENCIA }, { passo: "planos" }],
      { caso: "caso-inventado", agora: HOJE },
    );
    expect(d.minuta).toBe(true);
    expect(d.titulo).toBe("Resultado da etapa 4 — Plano de gerenciamento do projeto (PGP)");
    // o resultado vem antes; como ler, placar e conferência de cada passo vão para o anexo
    expect(d.secoes.map((s) => [s.titulo, s.parte ?? "corpo"])).toEqual([
      ["Resultado da etapa", "corpo"],
      ["Como ler este documento", "anexo"],
      ["Passo riscos: placar resumido", "anexo"],
      ["Passo riscos: segunda instância", "anexo"],
      ["Passo planos", "anexo"],
    ]);
    // sem a leitura do PMO, a etapa 5 diz por que não há resultado
    const e5 = montarResultadoDaEtapa(criarDossieVazio(HOJE), 5, [], { caso: "caso-inventado", agora: HOJE });
    expect(e5.secoes[0]?.paragrafos?.[0]).toMatch(/leitura do PMO da conferência/);
  });
});

// ---------- modo "resultado": gera o DOCX de um caso (fora do Git) ----------
const env = process.env;
const PASSOS: Record<number, string[]> = {
  1: ["leitura-rfp"],
  2: ["estrategia", "conteudo", "eap"],
  3: ["tap", "premissas"],
  4: ["adaptacao", "escopo", "cronograma", "riscos", "planos", "execucao"],
  5: ["leitura"],
};

describe.skipIf(env.RAIO_X_MODO !== "resultado")("gerar o resultado de uma etapa do teste externo", () => {
  it("grava resultado-etapa-N-<caso>.docx na pasta de saída", async () => {
    const etapa = Number(env.RAIO_X_ETAPA);
    const pasta = env.RAIO_X_PASTA ?? "";
    const base = env.RAIO_X_BASE ?? "";
    const caso = env.RAIO_X_CASO ?? "";
    const saida = env.RAIO_X_SAIDA ?? "";
    const arqDossie = join(pasta, `etapa-1-leitura-rfp-${base}.dossie.json`);
    const r = lerDossie(readFileSync(arqDossie, "utf8"), arqDossie);
    if (!r.ok) throw new Error(r.erro);
    const ler = (nome: string) =>
      existsSync(join(pasta, nome)) ? readFileSync(join(pasta, nome), "utf8") : undefined;
    const passos: ArquivosDoPasso[] = (PASSOS[etapa] ?? []).map((passo) => ({
      passo,
      placar: ler(`resposta-etapa-${etapa}-${passo}-${base}.placar.md`),
      conferencia: ler(`conferencia-etapa-${etapa}-${passo}-${base}.md`),
    }));
    const doc = montarResultadoDaEtapa(r.dossie, etapa, passos, { caso, agora: new Date() });
    const { gerarDocx } = await import("../../src/exportacao/docx");
    const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
    const docx = await gerarDocx(doc, logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength));
    // a mesma trava do script (decisão 0072), para quem rodar o modo direto pelo Vitest: o arquivo fica na pasta de
    // saída, e a pasta de saída fora do projeto (salvo referencias/)
    const raiz = resolve(fileURLToPath(new URL("../../", import.meta.url)));
    const rel = relative(raiz, resolve(saida));
    const dentro = !(rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel));
    if (!saida || /[\\/]|\.\./.test(caso) || (dentro && !rel.startsWith(`referencias${sep}`)))
      throw new Error("Saída dentro do projeto (fora de referencias/) ou nome do caso com barra ou '..'.");
    mkdirSync(saida, { recursive: true });
    const arq = join(saida, `resultado-etapa-${etapa}-${caso}.docx`);
    writeFileSync(arq, Buffer.from(await docx.arrayBuffer()));
    console.log(`Resultado: ${arq} (${doc.secoes.length} seções)`);
    expect(doc.secoes.length).toBeGreaterThan(1);
  }, 300_000);
});
