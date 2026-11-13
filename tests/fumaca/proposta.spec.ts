// Fumaça da etapa 2 sem chave real: a API do Claude é simulada pela rota do Playwright, com as respostas do PMO
// geradas no Claude Code para a RFP pública da OEI. Confere o fluxo inteiro e que a chave não sai do navegador
// (nem para o dossiê, nem para os exportados).
import { readFileSync } from "node:fs";
import { expect, test, type Route } from "@playwright/test";
import { corpoJson, corpoSse } from "../ajudantes/api-simulada";

const RFP = "tests/fixtures/rfps-publicas/concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf";
const resposta = (n: string) => readFileSync(`tests/fixtures/gerados/proposta-oei/${n}.json`, "utf-8");
// montada por partes: a verificação do repositório barra texto com cara de chave
const CHAVE = ["sk", "ant", "fumaca", "y".repeat(32)].join("-");
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "POST, OPTIONS",
};

test("etapa 2: chave, três passos do PMO, decisões do GP, contas, conferência e saídas", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  const passos: string[] = [];
  const deFora: string[] = [];
  page.on("request", (r) => {
    const u = r.url();
    if (
      !u.startsWith("http://localhost") &&
      !u.startsWith("data:") &&
      !u.startsWith("blob:") &&
      !u.startsWith("https://api.anthropic.com/")
    )
      deFora.push(u);
  });

  await page.route("https://api.anthropic.com/**", async (route: Route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const corpo = JSON.parse(req.postData() ?? "{}") as {
      stream?: boolean;
      messages: { content: unknown }[];
    };
    const texto = JSON.stringify(corpo.messages);
    if (!corpo.stream)
      return route.fulfill({
        status: 200,
        headers: { ...CORS, "content-type": "application/json" },
        body: corpoJson("OK"),
      });
    const passo = texto.includes("passo 2: estratégia")
      ? "estrategia"
      : texto.includes("passo 4: conteúdo")
        ? "conteudo"
        : "eap";
    passos.push(passo);
    return route.fulfill({
      status: 200,
      headers: { ...CORS, "content-type": "text/event-stream" },
      body: corpoSse({ texto: resposta(passo), uso: { entrada: 3000, saida: 6000, escritaCache: 60000 } }),
    });
  });

  await page.goto("./#/etapa/2");
  await page.getByLabel("Nome do projeto").fill("Fumaça proposta");
  await page.getByTestId("enviar-rfp").setInputFiles(RFP);
  await expect(page.getByText("Ponto de partida (código, da etapa 1)")).toBeVisible({ timeout: 90_000 });
  await expect(page.getByTestId("custo-estrategia")).toContainText("US$");
  await expect(page.getByTestId("pedir-estrategia")).toBeDisabled();

  // chave: só na sessão; o teste faz uma chamada mínima
  await page.getByLabel("Chave da API").fill(CHAVE);
  await page.getByRole("button", { name: "Usar esta chave" }).click();
  await page.getByRole("button", { name: /Testar com o/ }).click();
  await expect(page.getByRole("status")).toContainText("Chave aceita");
  expect(await page.evaluate(() => JSON.stringify(sessionStorage))).toContain(CHAVE);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(CHAVE);

  // passo 1: estratégia; o GP escolhe a abordagem e confirma premissas críticas
  await page.getByTestId("pedir-estrategia").click();
  await expect(page.getByTestId("abordagens")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("abordagens").getByText("B — Pesquisa documental com escuta").click();
  await page.getByLabel(/PC3/).check();

  // passo 2: conteúdo técnico
  await page.getByTestId("pedir-conteudo").click();
  await expect(page.getByRole("heading", { name: "Seção 2 — Compreensão do objeto" })).toBeVisible({
    timeout: 30_000,
  });

  // passo 3: EAP; o código monta o cronograma e o GP preenche um valor
  await page.getByTestId("pedir-eap").click();
  await expect(page.getByTestId("cronograma")).toBeVisible({ timeout: 30_000 });
  await page.getByLabel("Aprovação de cada produto (dias úteis, decisão do GP)").fill("10");
  await expect(page.getByText(/Total: \d+ dias úteis/)).toBeVisible();
  await expect(page.getByTestId("preco-calculado")).toHaveText("a definir pelo GP");
  await expect(page.getByTestId("matriz")).toContainText("R05");
  await expect(page.getByTestId("uso").locator("tbody tr")).toHaveCount(3);
  expect(passos).toEqual(["estrategia", "conteudo", "eap"]);

  // saídas
  for (const [botao, ext] of [
    ["Proposta técnica · DOCX", "docx"],
    ["Planilha de preço · XLSX", "xlsx"],
    ["Matriz de atendimento e checklist de envio · XLSX", "xlsx"],
    ["Perguntas de esclarecimento · DOCX", "docx"],
  ]) {
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: botao }).click();
    const arquivo = await download;
    expect(arquivo.suggestedFilename().endsWith(`.${ext}`)).toBe(true);
    expect(readFileSync(await arquivo.path()).includes(Buffer.from(CHAVE))).toBe(false);
  }

  // dossiê sem a chave
  const salvar = page.waitForEvent("download");
  await page.getByRole("button", { name: /Salvar projeto/ }).click();
  const dossie = readFileSync(await (await salvar).path(), "utf-8");
  expect(dossie).not.toContain(CHAVE);
  expect(JSON.parse(dossie).proposta.abordagem.id).toBe("B");

  await page.getByTestId("esquecer-chave").click();
  expect(await page.evaluate(() => JSON.stringify(sessionStorage))).not.toContain(CHAVE);
  await expect(page.getByTestId("pedir-estrategia")).toBeDisabled();
  expect(deFora).toEqual([]);
  expect(erros).toEqual([]);
});
