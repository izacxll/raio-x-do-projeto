// Fumaça do fluxo da F0: tela inicial → etapa → leitura (com OCR) → exportação → dossiê.
// Roda sobre o build (npm run build) com a Content-Security-Policy ativa: qualquer bloqueio dela falha o teste.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { CHAVE, conectarChave, gravada, simularPmo } from "./pmo-simulado";

const FIXTURES = "tests/fixtures/rfps-publicas";
const TEXTO = `${FIXTURES}/credenciamento-osc-educacao-empreendedora-memp-2026.pdf`;
const ESCANEADO = `${FIXTURES}/dispensa-escaneada-pesquisa-opiniao-nova-lima-2026.pdf`;
const RFP_OEI = `${FIXTURES}/concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf`;

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

test("etapa 1: lê PDF com texto, mostra as páginas lidas numa linha e salva para continuar depois", async ({
  page,
}) => {
  const erros = vigiarErros(page);
  await page.goto("./#/etapa/1");
  await expect(page.getByRole("heading", { name: "Leitura da RFP" })).toBeVisible();
  await page.getByLabel("Nome do projeto").fill("Teste de fumaça");

  await page.getByTestId("enviar-rfp").setInputFiles(TEXTO);
  await expect(page.locator(".envio__arquivo").first()).toContainText("credenciamento", { timeout: 60_000 });
  // a leitura é uma linha com as páginas lidas; sem tabela de leitura e sem relatório de leitura
  await expect(page.getByTestId("lido-rfp")).toContainText("páginas lidas");
  await expect(page.getByText("Resultado da leitura", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Baixar DOCX" })).toHaveCount(0);
  await expect(
    page.getByText("Arquivo do app, para reabrir aqui. Para ler, use os relatórios."),
  ).toBeVisible();

  const salvar = page.waitForEvent("download");
  await page.getByRole("button", { name: /Salvar para continuar depois/ }).click();
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
  await expect(page.getByTestId("lido-pgp")).toContainText("páginas lidas", { timeout: 200_000 });
  // sem tabela de leitura na tela: o OCR é conferido no dossiê salvo
  const salvar = page.waitForEvent("download");
  await page.getByRole("button", { name: /Salvar para continuar depois/ }).click();
  const dossie = JSON.parse(readFileSync(await (await salvar).path(), "utf8")) as {
    documentos: { paginas: { origem: string }[] }[];
  };
  expect(dossie.documentos[0]?.paginas.some((p) => p.origem === "ocr")).toBe(true);
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

test("etapa 5: sem a chave, nada é conferido; com o PMO, os achados confirmados, a decisão do GP e o relatório", async ({
  page,
}) => {
  const erros = vigiarErros(page);
  // o PMO simulado devolve a leitura gravada e confirma ("sustenta") cada achado do código listado no pedido
  const passos = await simularPmo(page, (pedido) => {
    const ids = [...pedido.matchAll(/- id `([^`]+)`/g)].map((m) => m[1]);
    const leitura = JSON.parse(gravada("conferencia/politicas-mulheres", "leitura-pmo")) as object;
    const vereditos = ids.map((achado) => ({ achado, veredito: "sustenta", evidencias: [], motivo: "" }));
    return { passo: "leitura", texto: JSON.stringify({ ...leitura, vereditos, dispensas: [] }) };
  });
  await page.goto("./#/etapa/5");
  // um edital público faz as vezes de plano: sem a conexão, o botão fica desligado e nada aparece (decisão 0037)
  await page.getByTestId("enviar-pgp").setInputFiles(TEXTO);
  await expect(page.getByText("Mapa do plano", { exact: true })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("conferir-plano")).toBeDisabled();
  await expect(page.getByRole("table", { name: "Resumo dos achados" })).toHaveCount(0);
  await conectarChave(page);
  await page.getByTestId("conferir-plano").click();
  await expect(page.getByRole("table", { name: "Resumo dos achados" })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("achado-pmo-pmo-1")).toBeVisible();
  expect(passos).toEqual(["leitura"]);
  // o primeiro achado do código confirmado pelo PMO (os do PMO têm a decisão própria, "O achado pmo-N procede?")
  const primeiro = page.locator("article.achado:not([data-testid^='achado-pmo'])").first();
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
    const arquivo = await download;
    expect(arquivo.suggestedFilename().endsWith(`.${extensao}`)).toBe(true);
    expect(readFileSync(await arquivo.path()).includes(Buffer.from(CHAVE))).toBe(false);
  }
  expect(erros).toEqual([]);
});

test("etapa 1: sem a chave, nada é analisado; com o PMO, as 8 seções, a revisão do GP e as saídas", async ({
  page,
}) => {
  const erros = vigiarErros(page);
  const passos = await simularPmo(page, () => ({
    passo: "leitura-rfp",
    texto: gravada("rfp-oei", "leitura-pmo"),
  }));
  await page.goto("./#/etapa/1");
  await page.getByTestId("enviar-rfp").setInputFiles(RFP_OEI);
  await expect(page.locator(".envio__arquivo").first()).toContainText("oei", { timeout: 90_000 });
  // decisão 0037: sem a conexão, o botão fica desligado e o esqueleto não aparece sozinho
  await expect(page.getByTestId("analisar-rfp")).toBeDisabled();
  await expect(page.getByTestId("custo-leitura-rfp")).toContainText("US$");
  await expect(page.getByText("1. Em uma página", { exact: true })).toHaveCount(0);
  await conectarChave(page);
  await page.getByTestId("analisar-rfp").click();
  await expect(page.getByText("1. Em uma página", { exact: true })).toBeVisible({ timeout: 60_000 });
  expect(passos).toEqual(["leitura-rfp"]);
  await expect(page.getByText("7. Pontos de atenção", { exact: true })).toBeVisible();
  await expect(page.locator('[data-secao="uma-pagina"]')).toContainText("Concorrência");
  await expect(page.getByTestId("requisitos-numerados")).toBeVisible();
  await page.getByLabel("Participar da disputa?").selectOption("participar");
  await page
    .locator('[data-secao="uma-pagina"] [data-testid^="item-"]')
    .first()
    .getByRole("combobox")
    .first()
    .selectOption("aceito");
  for (const [botao, extensao] of [
    ["Análise da RFP · DOCX", "docx"],
    ["Análise da RFP · PDF", "pdf"],
    ["Requisitos e prazos · XLSX", "xlsx"],
    ["Checklist de habilitação · XLSX", "xlsx"],
    ["Perguntas de esclarecimento · DOCX", "docx"],
  ]) {
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: botao }).click();
    const arquivo = await download;
    expect(arquivo.suggestedFilename().endsWith(`.${extensao}`)).toBe(true);
    expect(readFileSync(await arquivo.path()).length).toBeGreaterThan(2000);
  }
  expect(erros).toEqual([]);
});
