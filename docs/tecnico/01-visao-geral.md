# 01 — Visão geral

O que o Raio-X do Projeto faz, para quem e com que tecnologia, como está no código da versão 0.8.1.

## Propósito

App web para gerentes de projeto (GP) da FGV Projetos. Apoia o ciclo RFP → proposta → termo de abertura (TAP) → plano de gerenciamento (PGP) → conferência do PGP, em cinco etapas.

| Etapa | Entra | Sai | Quem trabalha |
|---|---|---|---|
| 1 — RFP | RFP e anexos (PDF) | Análise com identificação, requisitos numerados (R01…), prazos, julgamento, habilitação, condições, partes e brechas com pergunta de esclarecimento | Só código |
| 2 — Proposta | RFP (e a análise da etapa 1) | Minuta técnica e de preço, cronograma, matriz de atendimento | Código + PMO (API do Claude) |
| 3 — TAP | RFP e proposta | Termo de abertura com 12 elementos e registro de premissas | Código + PMO |
| 4 — PGP | TAP (e proposta) | Plano de gerenciamento, registros, cronograma, EAP e rede | Código + PMO |
| 5 — Conferência | PGP (e TAP, RFP) | Achados vago, conflituoso e ausente, com gravidade e categoria; leitura opcional do PMO | Código (+ PMO opcional) |

As etapas estão definidas em `src/etapas/etapas.ts` (documentos pedidos, obrigatórios e opcionais).

## Princípios que o código cumpre

- **Sugerir, nunca afirmar.** Todo item tem um de três rótulos: do documento, sugestão ou decisão do GP (`Rotulo` em `src/dossie/esquema.ts`). Cada um tem estado de revisão: pendente, aceito, editado ou descartado. Os documentos exportados levam o cabeçalho de minuta enquanto houver item pendente (`precisaDeMinuta` em `src/exportacao/modelo.ts`).
- **"Não achado não é ausente".** O que o código não acha sai como "não localizado pelo código — conferir no documento". Página ilegível deixa o item "não verificável" (`src/extracao/rfp/item.ts`).
- **Código × PMO.** Contas, datas, extração e conferência são de código. Criar e interpretar é do PMO, a API do Claude chamada com a chave do GP. A instrução do PMO é a skill em `.claude/skills/pmo/`, fonte única usada pelo Claude Code e importada no build.
- **Nada em servidor.** O app é estático; os PDFs são lidos no navegador. Só as etapas com o PMO enviam texto, direto do navegador para `api.anthropic.com`.

## Stack

| Item | Escolha | Onde |
|---|---|---|
| Linguagem | TypeScript 6 | `package.json`, `tsconfig*.json` |
| Interface | React 19, React Router 7 (HashRouter) | `src/main.tsx` |
| Estado | zustand (o próprio dossiê, só na memória da aba) | `src/dossie/store.ts` |
| Validação | zod 4 (dossiê e respostas do PMO) | `src/dossie/esquema.ts`, `src/pmo/schemas/` |
| Build | Vite 8, com a CSP injetada no `index.html` | `vite.config.ts` |
| PDF | pdf.js (texto por página) e Tesseract.js (OCR em português) | `src/leitura/` |
| Exportação | docx, pdfmake, exceljs, fflate (ZIP) | `src/exportacao/` |
| API | SDK `@anthropic-ai/sdk` no navegador | `src/pmo/cliente.ts` |
| Testes | Vitest (Node) e Playwright (Chromium) | `tests/` |
| Publicação | GitHub Pages | `.github/workflows/publicar.yml` |

As decisões estão registradas em `docs/decisoes/`: stack (0001), modelo (0002), chave (0003) e leitura de PDF (0019).

## Tamanho

Linhas de TypeScript por pasta de `src/`, contadas em 16/11/2026:

| Pasta | Linhas |
|---|---|
| `interface/` | 5.092 |
| `etapas/` | 3.548 |
| `extracao/` | 2.885 |
| `exportacao/` | 2.365 |
| `regras/` | 1.499 |
| `pmo/` | 1.450 |
| `dossie/` | 463 |
| `leitura/` | 352 |
| `texto/` | 341 |
| `dominio/` | 296 |
| `config/` | 116 |
| `demonstracao/` | 110 |

Há 36 arquivos de teste em `tests/`. A skill tem 62 arquivos de ficha em `referencias/artefatos/`.

## Referências no código

- `package.json`, `vite.config.ts`, `src/main.tsx`
- `src/etapas/etapas.ts`
- `src/dossie/esquema.ts`, `src/extracao/rfp/item.ts`, `src/exportacao/modelo.ts`
- `.claude/skills/pmo/SKILL.md`
- `CLAUDE.md` (seções 1, 2 e 5)
