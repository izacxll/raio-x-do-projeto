// Fumaça do modo demonstração (decisão 0027): sem chave, a etapa 2 abre a RFP pública da OEI, carrega as respostas
// gravadas do PMO e segue o fluxo de verdade, sem nenhuma chamada à API. O aviso fica sempre visível e vai no
// cabeçalho dos exportados.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { expect, test } from "@playwright/test";

const AVISO = "Demonstração com respostas gravadas, sem chamada à IA";

test("etapa 2 em demonstração: respostas gravadas, decisões do GP, contas e saídas sem chamar a API", async ({
  page,
}) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  const deFora: string[] = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith("http://localhost") && !u.startsWith("data:") && !u.startsWith("blob:")) deFora.push(u);
  });

  await page.goto("./#/etapa/2");
  await page.getByTestId("ver-demonstracao").click();
  await expect(page.getByTestId("aviso-demonstracao")).toContainText(AVISO, { timeout: 90_000 });
  await expect(page.getByText("Ponto de partida (código, da etapa 1)")).toBeVisible({ timeout: 90_000 });
  await expect(page.getByTestId("ver-demonstracao")).toHaveCount(0);

  await page.getByTestId("pedir-estrategia").click();
  await expect(page.getByTestId("abordagens")).toBeVisible();
  // outra abordagem: a gravação não cobre, o botão do conteúdo fica parado e explica
  await page.getByTestId("abordagens").getByText(/^A — /).click();
  await expect(page.getByTestId("gravacao-conteudo")).toContainText("escolha a B");
  await expect(page.getByTestId("pedir-conteudo")).toBeDisabled();
  await page.getByTestId("abordagens").getByText("B — Pesquisa documental com escuta").click();
  await page.getByLabel(/PC3/).check();

  await page.getByTestId("pedir-conteudo").click();
  await expect(page.getByRole("heading", { name: "Seção 2 — Compreensão do objeto" })).toBeVisible();
  await page.getByTestId("pedir-eap").click();
  await expect(page.getByTestId("cronograma")).toBeVisible();
  await page.getByLabel("Aprovação de cada produto (dias úteis, decisão do GP)").fill("10");
  await expect(page.getByText(/Total: \d+ dias úteis/)).toBeVisible();
  await expect(page.getByTestId("matriz")).toContainText("R05");
  await expect(page.getByTestId("uso")).toHaveCount(0);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Proposta técnica · DOCX" }).click();
  const arquivos = unzipSync(new Uint8Array(readFileSync(await (await download).path())));
  const cabecalho = Object.entries(arquivos)
    .filter(([n]) => /word\/header\d*\.xml$/.test(n))
    .map(([, c]) => strFromU8(c))
    .join(" ");
  expect(cabecalho).toContain(AVISO);

  const salvar = page.waitForEvent("download");
  await page.getByRole("button", { name: /Salvar projeto/ }).click();
  const dossie = JSON.parse(readFileSync(await (await salvar).path(), "utf-8"));
  expect(dossie.demonstracao).toBe(true);

  // o aviso continua em outra etapa
  await page.goto("./#/etapa/1");
  await expect(page.getByTestId("aviso-demonstracao")).toBeVisible();

  expect(deFora).toEqual([]);
  expect(erros).toEqual([]);
});
