// Fumaça da leitura opcional do PMO na conferência (F5b) com a API simulada pela rota do Playwright. Um edital
// público faz as vezes de plano: o teste é do fluxo e das travas na tela (sugestão, citação não conferida, decisão do
// GP, uso registrado, chave fora do relatório), não da qualidade da leitura.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { expect, test, type Route } from "@playwright/test";
import { corpoJson, corpoSse } from "../ajudantes/api-simulada";

const PGP = "tests/fixtures/rfps-publicas/credenciamento-osc-educacao-empreendedora-memp-2026.pdf";
const LEITURA = readFileSync(
  "tests/fixtures/gerados/conferencia/politicas-mulheres/leitura-pmo.json",
  "utf-8",
);
const CHAVE = ["sk", "ant", "fumaca", "w".repeat(32)].join("-");
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "POST, OPTIONS",
};

test("etapa 5: leitura do PMO opcional, com as travas do código e a decisão do GP", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  const chamadas: string[] = [];
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
    chamadas.push(JSON.stringify(corpo.messages).includes("leitura do PMO (opcional)") ? "leitura" : "outro");
    return route.fulfill({
      status: 200,
      headers: { ...CORS, "content-type": "text/event-stream" },
      body: corpoSse({ texto: LEITURA, uso: { entrada: 4000, saida: 3000, escritaCache: 30000 } }),
    });
  });

  await page.goto("./#/etapa/5");
  await page.getByTestId("enviar-pgp").setInputFiles(PGP);
  await expect(page.getByText("Mapa do plano", { exact: true })).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Conferir o plano" }).click();
  await expect(page.getByTestId("custo-leitura")).toContainText("US$");
  await expect(page.getByTestId("pedir-leitura")).toBeDisabled();

  await page.getByLabel("Chave da API").fill(CHAVE);
  await page.getByRole("button", { name: "Usar esta chave" }).click();
  await page.getByTestId("pedir-leitura").click();
  await expect(page.getByTestId("leitura-pmo")).toBeVisible({ timeout: 30_000 });
  expect(chamadas).toEqual(["leitura"]);
  // as citações são de outro plano: o código não as acha neste documento
  await expect(page.getByTestId("achado-pmo-pmo-1")).toContainText("citação não conferida");
  await expect(page.getByTestId("achado-pmo-pmo-1")).toContainText("leitura do PMO");
  await page.getByLabel("O achado pmo-1 procede?").selectOption("nao");
  await expect(page.getByTestId("uso")).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Relatório DOCX" }).click();
  const xml = strFromU8(
    unzipSync(new Uint8Array(readFileSync(await (await download).path())))["word/document.xml"]!,
  );
  expect(xml).toContain("Leitura do PMO (sugestões)");
  expect(xml).not.toContain(CHAVE);
  expect(erros).toEqual([]);
});
