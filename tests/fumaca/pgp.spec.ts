// Fumaça da etapa 4 (PGP) na demonstração: sem chave e sem nenhuma chamada externa. Os seis passos carregam as
// respostas gravadas; o GP dispensa uma parte, preenche valores; a autoconferência roda as regras da etapa 5; o
// pacote .zip sai com o índice, o plano, os registros e os diagramas, com o aviso de demonstração.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { expect, test } from "@playwright/test";

const AVISO = "Demonstração com respostas gravadas, sem chamada à IA";
const PASSOS = ["adaptacao", "escopo", "cronograma", "riscos", "planos", "execucao"];

test("etapa 4 em demonstração: adaptação, seis passos, contas, autoconferência e pacote", async ({
  page,
}) => {
  const erros: string[] = [];
  const deFora: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith("http://localhost") && !u.startsWith("data:") && !u.startsWith("blob:")) deFora.push(u);
  });

  await page.goto("./#/etapa/4");
  await page.getByTestId("ver-demonstracao").click();
  await expect(page.getByTestId("aviso-demonstracao")).toContainText(AVISO, { timeout: 90_000 });
  await expect(page.getByTestId("fonte-tap")).toContainText("TAP da etapa 3 (dossiê)", { timeout: 90_000 });

  for (const passo of PASSOS) {
    await page.getByTestId(`pedir-${passo}`).click();
    await expect(page.locator(`[data-passo="${passo}"]`)).toContainText("Resposta gravada (demonstração)");
    if (passo === "adaptacao") {
      await expect(page.getByTestId("adaptacao")).toBeVisible();
      // decisão do GP: dispensar o termo de nomeação da equipe, que o PMO sugeriu gerar
      await page.getByLabel("Gerar B32").uncheck();
    }
  }
  await expect(page.getByTestId("rastreabilidade")).toContainText("R10");
  await expect(page.getByTestId("marcos")).toContainText("não cabe");
  await page.getByLabel("Aprovação de cada produto (dias úteis, decisão do GP)").fill("5");
  await page.getByLabel("Reserva de contingência (R$, decisão do GP)").fill("10000");

  await page.getByTestId("autoconferir").click();
  await expect(page.getByTestId("resultado-autoconferencia")).toContainText("decisão do GP ainda vazia");
  expect(
    await page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"),
  ).toBe(true);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pacote completo · ZIP" }).click();
  const arquivos = unzipSync(new Uint8Array(readFileSync(await (await download).path())));
  expect(Object.keys(arquivos).sort()).toEqual(
    ["eap.svg", "indice.txt", "plano.docx", "plano.pdf", "rede.svg", "registros.xlsx"].sort(),
  );
  expect(strFromU8(arquivos["indice.txt"]!)).toContain("B32 Termo de nomeação da equipe: dispensada pelo GP");
  const docx = unzipSync(arquivos["plano.docx"]!);
  const cabecalho = Object.entries(docx)
    .filter(([n]) => /word\/header\d*\.xml$/.test(n))
    .map(([, c]) => strFromU8(c))
    .join(" ");
  expect(cabecalho).toContain(AVISO);

  expect(deFora).toEqual([]);
  expect(erros).toEqual([]);
});
