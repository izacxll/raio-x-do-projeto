// Fumaça da etapa 4 (PGP) com o PMO simulado pela rota do Playwright (decisão 0053): a RFP pública da OEI passa pelas
// etapas 2 e 3 e chega à 4 no mesmo dossiê, com as respostas gravadas. O GP dispensa uma parte e preenche valores; a
// autoconferência roda as regras da etapa 5; o pacote .zip sai com o índice, o plano, os registros e os diagramas.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { expect, test } from "@playwright/test";
import { CHAVE, conectarChave, gravada, simularPmo } from "./pmo-simulado";

const RFP = "tests/fixtures/rfps-publicas/concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf";
const PASSOS = ["adaptacao", "escopo", "cronograma", "riscos", "planos", "execucao"];
/** A ordem dos pedidos do teste e a resposta gravada de cada um. */
const FILA: [string, string][] = [
  ["proposta-oei", "estrategia"],
  ["proposta-oei", "conteudo"],
  ["proposta-oei", "eap"],
  ["tap-oei", "tap"],
  ["tap-oei", "premissas"],
  ...PASSOS.map((p): [string, string] => ["pgp-oei", p]),
];

test("etapa 4 com o PMO simulado: adaptação, seis passos, contas, autoconferência e pacote", async ({
  page,
}) => {
  const erros: string[] = [];
  const deFora: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("request", (r) => {
    const u = r.url();
    if (u.startsWith("http://localhost") || u.startsWith("data:") || u.startsWith("blob:")) return;
    if (u.startsWith("https://api.anthropic.com/")) return;
    deFora.push(u);
  });
  let k = 0;
  const passos = await simularPmo(page, () => {
    const [pasta, nome] = FILA[k++] ?? ["", ""];
    return { passo: nome, texto: gravada(pasta, nome) };
  });

  // etapas 2 e 3 no mesmo dossiê, com as escolhas das gravações (abordagem B, PC3)
  await page.goto("./#/etapa/2");
  await page.getByTestId("enviar-rfp").setInputFiles(RFP);
  await expect(page.getByText("Ponto de partida (código, da etapa 1)")).toBeVisible({ timeout: 90_000 });
  await conectarChave(page);
  await page.getByTestId("pedir-estrategia").click();
  await page.getByTestId("abordagens").getByText("B — Pesquisa documental com escuta").click();
  await page.getByLabel(/PC3/).check();
  await page.getByTestId("pedir-conteudo").click();
  await expect(page.getByRole("heading", { name: "Seção 3 — Compreensão do objeto" })).toBeVisible();
  await page.getByTestId("pedir-eap").click();
  await expect(page.getByTestId("cronograma")).toBeVisible();
  await page.goto("./#/etapa/3");
  await page.getByTestId("pedir-tap").click();
  await expect(page.getByTestId("decisoes-gp")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("pedir-premissas").click();
  await expect(page.locator('[data-passo="premissas"]')).toContainText("Resposta de");

  await page.goto("./#/etapa/4");
  await expect(page.getByTestId("fonte-tap")).toContainText("TAP da etapa 3 (dossiê)", { timeout: 90_000 });
  for (const passo of PASSOS) {
    await page.getByTestId(`pedir-${passo}`).click();
    await expect(page.locator(`[data-passo="${passo}"]`)).toContainText("Resposta de", { timeout: 30_000 });
    if (passo === "adaptacao") {
      await expect(page.getByTestId("adaptacao")).toBeVisible();
      // decisão do GP: dispensar o termo de nomeação da equipe, que o PMO sugeriu gerar
      await page.getByLabel("Gerar B32").uncheck();
    }
  }
  expect(passos).toEqual(FILA.map(([, n]) => n));
  await expect(page.getByTestId("rastreabilidade")).toContainText("R06");
  await expect(page.getByTestId("marcos")).toContainText("não cabe");
  await page.getByLabel("Aprovação de cada produto (dias úteis, decisão do GP)").fill("5");
  // decisão 0092: a reserva de contingência é dada risco a risco, e o plano soma
  const reservas = page.getByLabel(/^Reserva do risco /);
  for (let k = 0; k < (await reservas.count()); k++) await reservas.nth(k).fill("5000");

  await page.getByTestId("autoconferir").click();
  await expect(page.getByTestId("resultado-autoconferencia")).toContainText(
    /decis(?:ão|ões) do GP pendentes?/,
  );
  expect(
    await page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"),
  ).toBe(true);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pacote completo · ZIP" }).click();
  const zip = readFileSync(await (await download).path());
  const arquivos = unzipSync(new Uint8Array(zip));
  expect(Object.keys(arquivos).sort()).toEqual(
    ["eap.svg", "indice.txt", "plano.docx", "plano.pdf", "rede.svg", "registros.xlsx"].sort(),
  );
  // decisão 0091: o índice diz para onde foi a parte que o GP tirou (fundida numa gerada ou dispensada, com o motivo)
  expect(strFromU8(arquivos["indice.txt"]!)).toMatch(
    /B32 Termo de nomeação da equipe: (?:fundida em A6|dispensada: )/,
  );
  expect(zip.includes(Buffer.from(CHAVE))).toBe(false);

  expect(deFora).toEqual([]);
  expect(erros).toEqual([]);
});
