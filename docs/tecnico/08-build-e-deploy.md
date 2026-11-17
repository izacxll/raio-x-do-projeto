# 08 — Build, testes e publicação

Como rodar, testar e publicar o app.

## Requisitos

- Node 22 ou mais novo (`engines` do `package.json`); o CI usa o Node 24.
- npm. As dependências têm versão fixa e o `package-lock.json` está no repositório.

## Comandos

| Comando | Faz |
|---|---|
| `npm ci` | Instala as dependências |
| `npm run dev` | Copia os ativos de leitura para `public/vendor/` e sobe o Vite em modo de desenvolvimento (sem a CSP) |
| `npm run build` | Copia os ativos, checa os tipos (`tsc -b`) e gera `dist/` com a base `/raio-x-do-projeto/` e a CSP |
| `npm run preview` | Serve o `dist/` |
| `npm test` | Vitest: unidade e integração em Node, com as RFPs públicas reais |
| `npm run test:fumaca` | Playwright no Chromium, sobre o build, com a CSP ativa (rodar `npm run build` antes) |
| `npm run lint`, `npm run verificar-formato`, `npm run formatar` | ESLint e Prettier |
| `npm run tipos` | Só a checagem de tipos |
| `npm run verificar-repositorio` | Barra arquivo indevido no repositório público (decisão 0010) |
| `npm run comparar-modelos` | Comparação Opus × Sonnet com a chave da API (gasta crédito) |
A rodada real das etapas 2 a 4 com a chave (`npm run rodada-real`, `scripts/rodada-real.mjs`) existe só na branch `correcao/rodada-real-com-chave`, que ainda não foi integrada à `main`.

## Testes

| Tipo | Onde | Observação |
|---|---|---|
| Unidade e integração | `tests/**/*.test.ts` | Com o PDF lido pelo mesmo código do navegador (`tests/ajudantes/rfp-publica.ts`) |
| RFPs públicas | `tests/fixtures/rfps-publicas/` (9 editais, com fonte e data no README) | A etapa 1 e a leitura são testadas sobre editais reais |
| Respostas do PMO gravadas | `tests/fixtures/gerados/*-oei/` | Etapas 2 a 4 sem chave, com as citações conferidas pelo código |
| Gabarito da etapa 1 | `tests/fixtures/gerados/rfp-smped/` | Comparação item por item (está no PR #14) |
| Fumaça no navegador | `tests/fumaca/*.spec.ts` | Leitura com OCR, as cinco etapas (com o PMO simulado pela rota) e os downloads |
| API simulada | `tests/ajudantes/api-simulada.ts` | Respostas no formato de streaming, sem rede |

## Integração contínua (`.github/workflows/ci.yml`)

Roda em todo pull request e em todo push na `main`, nesta ordem:

1. verificação do repositório público;
2. lint;
3. formatação;
4. testes;
5. build (com tipos);
6. instalação do Chromium;
7. fumaça.

Se a fumaça falhar, o relatório fica como artefato por 7 dias.

## Publicação (`.github/workflows/publicar.yml`)

- A cada push na `main` e nas branches `fase/*` (prévia para a responsável testar, decisão 0018): `npm ci`, verificação do repositório, `npm run build` e deploy do `dist/` no GitHub Pages.
- Endereço: https://izacxll.github.io/raio-x-do-projeto/
- Branches `correcao/*` não publicam prévia: só depois do merge na `main`.

## Fluxo de versão (decisão 0005)

1. Branch `fase/<id>-<nome>` ou `correcao/<nome>`.
2. Pull request com descrição e CHANGELOG.
3. Teste e ok da responsável.
4. Merge na `main`, tag `vX.Y.Z` e release no GitHub.

## Referências no código

- `package.json`, `vite.config.ts`, `playwright.config.ts`
- `.github/workflows/ci.yml`, `.github/workflows/publicar.yml`
- `scripts/copiar-ativos-leitura.mjs`, `scripts/verificar-repositorio.mjs`, `scripts/comparar-modelos.mjs`
- `tests/ajudantes/`, `tests/fixtures/`, `tests/fumaca/`
