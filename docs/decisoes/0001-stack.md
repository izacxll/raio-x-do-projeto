# 0001 — Stack: TypeScript + React + Vite, estática no GitHub Pages

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto, a partir da proposta do plano

## Contexto

O app processa PDFs confidenciais (RFPs, propostas, planos) e não pode gravar nada em servidor próprio. As etapas 1 e 5 rodam só com código, sem chave. O Raio-X do Plano de Trabalho, de onde parte do código é reaproveitado, é um app em React com pdf.js e Tesseract.js.

## Decisão

**TypeScript + React + Vite**, como aplicação estática publicada no **GitHub Pages** por GitHub Actions. Tudo é processado no navegador.

| Necessidade | Biblioteca (licença) | Observação |
|---|---|---|
| Leitura de PDF | `pdfjs-dist` (Apache-2.0) | Worker empacotado, servido pelo próprio site |
| OCR | `tesseract.js` + `tesseract.js-core` + dados `por` (Apache-2.0) | Com worker e servido pelo próprio site, com `workerBlobURL: false` por causa da CSP |
| DOCX | `docx` (MIT) | Formato padrão de exportação |
| XLSX | `exceljs` (MIT) | Escolhido no lugar do SheetJS, cuja versão publicada no npm está desatualizada e tem vulnerabilidade conhecida |
| PDF exportado | `pdfmake` (MIT) + fonte Arimo (Apache-2.0) | A Arimo tem as mesmas medidas da Arial; a Gotham (paga) nunca entra no repositório e a Arial não pode ser embutida |
| Diagramas | `mermaid` (MIT), carregado sob demanda, ou SVG próprio | Escolha na F4, pelo peso |
| Schemas | `zod` v4 (MIT) | Também gera o JSON Schema da saída estruturada da API |
| API do Claude | `@anthropic-ai/sdk` (MIT) | `dangerouslyAllowBrowser: true`, isolado em `src/pmo/cliente.ts` |
| Estado | `zustand` (MIT) | Um store, que é o dossiê |
| Rotas | `react-router`, com HashRouter | O GitHub Pages não tem fallback de SPA |
| .zip | `fflate` (MIT) | Etapa 4 |
| Qualidade | Vitest, Testing Library, jsdom, ESLint (typescript-eslint), Prettier, Playwright | Playwright só para testes de fumaça do fluxo |

## Consequências

- Não há servidor para manter; o dossiê é um JSON que o GP salva e reabre.
- Sem cabeçalhos HTTP próprios no Pages: a Content-Security-Policy vai numa `<meta http-equiv>` no `index.html`, e um teste confere a política no build.
- Os arquivos do OCR (núcleo, worker e dados do português) e o worker do pdf.js ficam em `public/` e são servidos pelo próprio site.
- A troca para um servidor intermediário no futuro fica simples porque a chamada à API está num módulo só.
