// Testes de fumaça do fluxo, no navegador, sobre o build de produção (com a Content-Security-Policy ativa).
import { defineConfig, devices } from "@playwright/test";

const PORTA = 4173;

export default defineConfig({
  testDir: "tests/fumaca",
  timeout: 240_000,
  retries: process.env.CI ? 1 : 0,
  // cada teste das etapas com o PMO lê uma RFP de 56 páginas no navegador: mais de dois em paralelo disputam a CPU
  workers: 2,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORTA}/raio-x-do-projeto/`,
    acceptDownloads: true,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `node tests/fumaca/servidor.mjs`,
    url: `http://localhost:${PORTA}/raio-x-do-projeto/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
