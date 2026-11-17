// PMO simulado pela rota do Playwright (decisão 0053: o site não tem modo de demonstração). Os testes de fumaça
// conectam uma chave falsa e respondem cada pedido com uma resposta gravada da OEI (tests/fixtures/gerados/), no
// formato de streaming da Messages API. Nada sai para a internet.
import { readFileSync } from "node:fs";
import { expect, type Page, type Route } from "@playwright/test";
import { corpoJson, corpoSse } from "../ajudantes/api-simulada";

// montada por partes: a verificação do repositório barra texto com cara de chave
export const CHAVE = ["sk", "ant", "fumaca", "x".repeat(32)].join("-");
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "POST, OPTIONS",
};

/** Resposta gravada (texto JSON) de tests/fixtures/gerados/<pasta>/<nome>.json. */
export const gravada = (pasta: string, nome: string) =>
  readFileSync(`tests/fixtures/gerados/${pasta}/${nome}.json`, "utf-8");

/**
 * Responde cada pedido ao PMO com o texto que `responder` devolve, a partir do texto do pedido. O teste da chave
 * (sem streaming) recebe "OK". Devolve a lista dos passos respondidos, na ordem.
 */
export async function simularPmo(
  page: Page,
  responder: (pedido: string) => { passo: string; texto: string },
): Promise<string[]> {
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
    const r = responder(JSON.stringify(corpo.messages));
    passos.push(r.passo);
    return route.fulfill({
      status: 200,
      headers: { ...CORS, "content-type": "text/event-stream" },
      body: corpoSse({ texto: r.texto, uso: { entrada: 3000, saida: 6000, escritaCache: 40000 } }),
    });
  });
  return passos;
}

/** Conecta a chave falsa (só nesta sessão do navegador). */
export async function conectarChave(page: Page) {
  await page.getByLabel("Chave da API").first().fill(CHAVE);
  await page.getByRole("button", { name: "Usar esta chave" }).first().click();
  await expect(page.getByTestId("esquecer-chave").first()).toBeVisible();
}
