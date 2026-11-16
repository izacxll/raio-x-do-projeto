# 07 — Configuração

Onde fica cada configuração do app. Não há segredos no repositório: a chave da API é do GP e vive só na aba do navegador.

## Configuração do app (no código)

| O quê | Onde | Observação |
|---|---|---|
| Modelo padrão e de comparação | `src/config/modelo.ts` (`MODELO_PADRAO`, `MODELO_COMPARACAO`) | Opus 5.5 provisório e Sonnet 5.5 (decisão 0002) |
| Esforço, limite de saída e saída esperada por passo do PMO | `src/config/modelo.ts` (`ESFORCO`, `LIMITE_SAIDA`, `SAIDA_ESPERADA`) | Um registro por passo: teste, estratégia, conteúdo, EAP, TAP, premissas, os seis do PGP e a leitura |
| Preços da API (US$ por milhão de tokens) | `src/config/precos.ts` (`PRECOS`, `PRECOS_CONSULTADOS_EM`) | Consultados em 13/11/2026; reconferir quando a FGV fechar o modelo |
| Versões no cabeçalho dos documentos | `vite.config.ts` (`__VERSAO_APP__` do `package.json`, `__VERSAO_SKILL__` do `versao:` do `SKILL.md`) | Vão também para o dossiê |
| Endereço do site | `vite.config.ts` (`base: /raio-x-do-projeto/` só no build) | GitHub Pages |
| Content-Security-Policy | `vite.config.ts` (`POLITICA_SEGURANCA`) | Injetada no `index.html` publicado; não vale no `npm run dev` |
| Estado das páginas (limiar do OCR) | `src/leitura/ler-documento.ts` | Menos de 30 letras e números vai para o OCR |

## No navegador

| Chave | Armazenamento | Onde |
|---|---|---|
| `raio-x-do-projeto:chave-api` | `sessionStorage` (só a aba atual). "Lembrar neste navegador" está desativado de propósito | `src/pmo/chave.ts` (decisão 0003) |
| O dossiê | Memória da aba (zustand). Aviso ao fechar com mudanças não salvas | `src/dossie/store.ts`, `src/main.tsx` |

## Modo demonstração

Não é uma *feature flag* de ambiente: é uma marca no próprio dossiê (`demonstracao: true`). Com ela, as etapas 2 a 4 usam as respostas gravadas do PMO em vez da API. Os documentos saem com o aviso de demonstração (`src/demonstracao/`, decisão 0027).

## Variáveis de ambiente

O app publicado não lê nenhuma. Elas só existem para ferramentas locais e para o CI:

| Variável | Quem lê | Para quê |
|---|---|---|
| `ANTHROPIC_API_KEY` | `scripts/comparar-modelos.mjs`, `tests/pmo/comparacao-modelos.test.ts` | Comparação Opus × Sonnet com a chave (gasta crédito) |
| `COMPARAR_MODELOS=sim` | `tests/pmo/comparacao-modelos.test.ts` | Trava: sem ela, o teste não gasta crédito mesmo com a chave no ambiente |
| `CI` | `playwright.config.ts` | Uma nova tentativa e saída no formato do GitHub |

`.env` e `.env.*` estão no `.gitignore`. Não há `.env.example`, porque o app não precisa de nenhum.

## Arquivos de configuração das ferramentas

| Arquivo | Para quê |
|---|---|
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | Tipos do app e dos scripts |
| `eslint.config.js` | Lint |
| `.prettierrc.json`, `.prettierignore` | Formatação |
| `playwright.config.ts` | Fumaça no Chromium, sobre o build, servido por `tests/fumaca/servidor.mjs` na porta 4173 |
| `vite.config.ts` | Build, CSP e Vitest (`tests/**/*.test.ts`, ambiente Node) |
| `.gitignore` | Barra PDF, DOCX, XLSX, ZIP e dossiê fora das pastas de teste permitidas, além de `referencias/`, segredos, `dist/` e `public/vendor/` |

## Referências no código

- `src/config/modelo.ts`, `src/config/precos.ts`
- `vite.config.ts`, `playwright.config.ts`, `.gitignore`
- `src/pmo/chave.ts`, `src/dossie/store.ts`, `src/main.tsx`
- `src/leitura/ler-documento.ts`, `src/demonstracao/demonstracao.ts`
- `scripts/comparar-modelos.mjs`, `tests/pmo/comparacao-modelos.test.ts`
