// Fumaça da etapa 3 (TAP): na demonstração (sem chave e sem nenhuma chamada externa) e com a API simulada pela rota
// do Playwright, vindo da etapa 2 no mesmo dossiê. Confere divergências, decisões do GP, conferência, aprovação,
// saídas e que a chave não sai do navegador.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { expect, test, type Page, type Route } from "@playwright/test";
import { corpoJson, corpoSse } from "../ajudantes/api-simulada";

const RFP = "tests/fixtures/rfps-publicas/concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf";
const AVISO = "Demonstração com respostas gravadas, sem chamada à IA";
const CHAVE = ["sk", "ant", "fumaca", "z".repeat(32)].join("-");
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "POST, OPTIONS",
};
const gravada = (pasta: string, n: string) =>
  readFileSync(`tests/fixtures/gerados/${pasta}/${n}.json`, "utf-8");

function vigiar(page: Page, permitirApi: boolean) {
  const erros: string[] = [];
  const deFora: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("request", (r) => {
    const u = r.url();
    if (u.startsWith("http://localhost") || u.startsWith("data:") || u.startsWith("blob:")) return;
    if (permitirApi && u.startsWith("https://api.anthropic.com/")) return;
    deFora.push(u);
  });
  return { erros, deFora };
}

async function cabecalhoDocx(page: Page, botao: string): Promise<string> {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: botao }).click();
  const arquivos = unzipSync(new Uint8Array(readFileSync(await (await download).path())));
  return Object.entries(arquivos)
    .filter(([n]) => /word\/(header\d*|document)\.xml$/.test(n))
    .map(([, c]) => strFromU8(c))
    .join(" ");
}

test("etapa 3 em demonstração: proposta gravada, divergências, 12 elementos, premissas, aprovação e saídas", async ({
  page,
}) => {
  const { erros, deFora } = vigiar(page, false);
  await page.goto("./#/etapa/3");
  await page.getByTestId("ver-demonstracao").click();
  await expect(page.getByTestId("aviso-demonstracao")).toContainText(AVISO, { timeout: 90_000 });
  await expect(page.getByTestId("fonte-proposta")).toContainText("Proposta da etapa 2 (dossiê)", {
    timeout: 90_000,
  });
  await expect(page.getByTestId("divergencias")).toContainText("R09");
  await expect(page.getByTestId("do-documento")).toContainText("Entrega de P2");

  await page.getByTestId("pedir-tap").click();
  await expect(page.getByRole("heading", { name: "TAP.6 — Resumo do cronograma de marcos" })).toBeVisible();
  await page.getByLabel("Gerente do projeto (TAP.11)").fill("Nome escolhido pelo GP");
  await page.getByTestId("pedir-premissas").click();
  await expect(page.getByRole("heading", { name: "Premissas críticas" })).toBeVisible();
  await expect(page.getByTestId("conferencia-tap")).toContainText("Marcos dentro do prazo da RFP");
  await page.getByLabel("Aprovado por").fill("Patrocinador");
  // tabelas de texto longo quebram linha: a página não rola na horizontal
  expect(
    await page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"),
  ).toBe(true);

  const xml = await cabecalhoDocx(page, "Termo de abertura · DOCX");
  expect(xml).toContain(AVISO);
  expect(xml).toContain("Nome escolhido pelo GP");
  const xlsx = page.waitForEvent("download");
  await page.getByRole("button", { name: "Registro de premissas · XLSX" }).click();
  expect((await xlsx).suggestedFilename().endsWith(".xlsx")).toBe(true);

  expect(deFora).toEqual([]);
  expect(erros).toEqual([]);
});

test("etapa 3 com a API simulada: da etapa 2 ao TAP no mesmo dossiê, com o custo e sem vazar a chave", async ({
  page,
}) => {
  const { erros, deFora } = vigiar(page, true);
  const passos: string[] = [];
  await page.route("https://api.anthropic.com/**", async (route: Route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const corpo = JSON.parse(req.postData() ?? "{}") as { stream?: boolean; messages: unknown };
    if (!corpo.stream)
      return route.fulfill({
        status: 200,
        headers: { ...CORS, "content-type": "application/json" },
        body: corpoJson("OK"),
      });
    const texto = JSON.stringify(corpo.messages);
    const [pasta, passo] = texto.includes("passo 2: estratégia")
      ? ["proposta-oei", "estrategia"]
      : texto.includes("passo 4: conteúdo")
        ? ["proposta-oei", "conteudo"]
        : texto.includes("os 12 elementos (ficha TAP)")
          ? ["tap-oei", "tap"]
          : texto.includes("registro de premissas inicial")
            ? ["tap-oei", "premissas"]
            : ["proposta-oei", "eap"];
    passos.push(passo);
    return route.fulfill({
      status: 200,
      headers: { ...CORS, "content-type": "text/event-stream" },
      body: corpoSse({
        texto: gravada(pasta, passo),
        uso: { entrada: 3000, saida: 6000, escritaCache: 40000 },
      }),
    });
  });

  await page.goto("./#/etapa/2");
  await page.getByTestId("enviar-rfp").setInputFiles(RFP);
  await expect(page.getByText("Ponto de partida (código, da etapa 1)")).toBeVisible({ timeout: 90_000 });
  await page.getByLabel("Chave da API").fill(CHAVE);
  await page.getByRole("button", { name: "Usar esta chave" }).click();
  await page.getByTestId("pedir-estrategia").click();
  await page.getByTestId("abordagens").getByText("B — Pesquisa documental com escuta").click();
  await page.getByLabel(/PC3/).check();
  await page.getByTestId("pedir-conteudo").click();
  await expect(page.getByRole("heading", { name: "Seção 2 — Compreensão do objeto" })).toBeVisible();
  await page.getByTestId("pedir-eap").click();
  await expect(page.getByTestId("cronograma")).toBeVisible();

  // etapa 3 no mesmo dossiê: a proposta vem da etapa 2, a chave continua na sessão
  await page.goto("./#/etapa/3");
  await expect(page.getByTestId("fonte-proposta")).toContainText("Proposta da etapa 2 (dossiê)");
  await expect(page.getByTestId("custo-tap")).toContainText("US$");
  await page.getByTestId("pedir-tap").click();
  await expect(page.getByTestId("decisoes-gp")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("pedir-premissas").click();
  await expect(page.getByTestId("uso").locator("tbody tr")).toHaveCount(2, { timeout: 30_000 });
  expect(passos).toEqual(["estrategia", "conteudo", "eap", "tap", "premissas"]);

  const xml = await cabecalhoDocx(page, "Termo de abertura · DOCX");
  expect(xml).not.toContain(CHAVE);
  expect(xml).not.toContain(AVISO);
  const salvar = page.waitForEvent("download");
  await page.getByRole("button", { name: /Salvar projeto/ }).click();
  const dossie = readFileSync(await (await salvar).path(), "utf-8");
  expect(dossie).not.toContain(CHAVE);
  expect(JSON.parse(dossie).tap.uso).toHaveLength(2);

  expect(deFora).toEqual([]);
  expect(erros).toEqual([]);
});
