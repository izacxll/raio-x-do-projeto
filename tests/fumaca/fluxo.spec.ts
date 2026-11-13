// Fumaça do fluxo da F0: tela inicial → etapa → leitura (com OCR) → exportação → dossiê.
// Roda sobre o build (npm run build) com a Content-Security-Policy ativa: qualquer bloqueio dela falha o teste.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const FIXTURES = "tests/fixtures/rfps-publicas";
const TEXTO = `${FIXTURES}/credenciamento-osc-educacao-empreendedora-memp-2026.pdf`;
const ESCANEADO = `${FIXTURES}/dispensa-escaneada-pesquisa-opiniao-nova-lima-2026.pdf`;

function vigiarErros(page: Page) {
  const erros: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(m.text());
  });
  page.on("pageerror", (e) => erros.push(e.message));
  return erros;
}

test("tela inicial mostra as cinco etapas, o logo e a legenda dos rótulos", async ({ page }) => {
  const erros = vigiarErros(page);
  await page.goto("./");
  await expect(page.getByRole("heading", { name: /Em que etapa do projeto/ })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(5);
  await expect(page.getByAltText("FGV Projetos")).toBeVisible();
  await expect(page.getByText("Do documento, com a página")).toBeVisible();
  await page.getByRole("tab", { name: /Conferência do plano/ }).click();
  await expect(page.getByText("Relatório de conformidade")).toBeVisible();
  await page.getByRole("tab", { name: /Leitura da RFP/ }).click();
  for (const saida of [
    "Lista de requisitos e quadro de prazos",
    "Checklist de habilitação",
    "Perguntas de esclarecimento",
  ]) {
    await expect(page.getByText(saida, { exact: true })).toBeVisible();
  }
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(csp).toContain("connect-src 'self' https://api.anthropic.com");
  expect(erros).toEqual([]);
});

test("etapa 1: lê PDF com texto, exporta DOCX, PDF e XLSX e salva o dossiê", async ({ page }) => {
  const erros = vigiarErros(page);
  await page.goto("./#/etapa/1");
  await expect(page.getByRole("heading", { name: "Leitura da RFP" })).toBeVisible();
  await page.getByLabel("Nome do projeto").fill("Teste de fumaça");

  await page.getByTestId("enviar-rfp").setInputFiles(TEXTO);
  await expect(page.locator(".envio__arquivo").first()).toContainText("credenciamento", { timeout: 60_000 });
  await expect(page.locator(".tabela tbody tr").first()).toBeVisible();

  for (const formato of ["DOCX", "PDF", "XLSX"]) {
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: `Baixar ${formato}` }).click();
    const arquivo = await download;
    expect(arquivo.suggestedFilename()).toBe(`teste-de-fumaca-relatorio-de-leitura.${formato.toLowerCase()}`);
    const caminho = await arquivo.path();
    expect(readFileSync(caminho).length).toBeGreaterThan(2000);
  }

  const salvar = page.waitForEvent("download");
  await page.getByRole("button", { name: /Salvar projeto/ }).click();
  const dossie = await salvar;
  expect(dossie.suggestedFilename()).toBe("teste-de-fumaca.dossie.json");
  const conteudo = readFileSync(await dossie.path(), "utf8");
  expect(JSON.parse(conteudo).documentos).toHaveLength(1);

  // reabre o dossiê numa aba nova
  await page.goto("./");
  await page.reload();
  await page.getByTestId("abrir-dossie").setInputFiles({
    name: dossie.suggestedFilename(),
    mimeType: "application/json",
    buffer: Buffer.from(conteudo),
  });
  await expect(page.getByLabel("Nome do projeto")).toHaveValue("Teste de fumaça");
  expect(erros).toEqual([]);
});

test("PDF escaneado passa pelo OCR, servido pelo próprio site", async ({ page }) => {
  const erros = vigiarErros(page);
  const deFora: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://localhost") &&
      !r.url().startsWith("data:") &&
      !r.url().startsWith("blob:")
    ) {
      deFora.push(r.url());
    }
  });
  await page.goto("./#/etapa/5");
  await page.getByTestId("enviar-pgp").setInputFiles(ESCANEADO);
  await expect(page.locator(".origem--ocr").first()).toBeVisible({ timeout: 200_000 });
  await expect(page.locator(".envio__arquivo")).toHaveCount(1, { timeout: 200_000 });
  expect(deFora).toEqual([]);
  expect(erros).toEqual([]);
});

test("nenhum termo interno de construção (fases do plano) aparece para o GP", async ({ page }) => {
  const INTERNO = /\bfases?\b|\bF[0-9]b?\b|repositório/i;
  await page.goto("./");
  for (let i = 0; i < 5; i++) {
    await page.getByRole("tab").nth(i).click();
    expect(await page.locator("body").innerText(), `tela inicial, etapa ${i + 1}`).not.toMatch(INTERNO);
  }
  for (let n = 1; n <= 5; n++) {
    await page.goto(`./#/etapa/${n}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.locator("body").innerText(), `etapa ${n}`).not.toMatch(INTERNO);
  }
});

test("etapa 5: mapa, conferência, decisão do GP e exportação do relatório", async ({ page }) => {
  const erros = vigiarErros(page);
  await page.goto("./#/etapa/5");
  // um edital público faz as vezes de plano: o teste é do fluxo da tela, não das regras
  await page.getByTestId("enviar-pgp").setInputFiles(TEXTO);
  await expect(page.getByText("Mapa do plano", { exact: true })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("Premissas críticas", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Conferir o plano" }).click();
  await expect(page.getByRole("table", { name: "Resumo dos achados" })).toBeVisible();
  const primeiro = page.locator("article.achado").first();
  await expect(primeiro).toBeVisible();
  await primeiro.getByLabel("O achado procede?").selectOption("nao");
  await primeiro.getByLabel("Justificativa").fill("Teste de fumaça.");
  for (const [botao, extensao] of [
    ["Relatório DOCX", "docx"],
    ["Relatório PDF", "pdf"],
    ["Lista de achados XLSX", "xlsx"],
  ]) {
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: botao }).click();
    expect((await download).suggestedFilename().endsWith(`.${extensao}`)).toBe(true);
  }
  expect(erros).toEqual([]);
});
