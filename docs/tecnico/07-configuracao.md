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

## Variáveis de ambiente

O app publicado não lê nenhuma. Elas só existem para ferramentas locais e para o CI:

| Variável | Quem lê | Para quê |
|---|---|---|
| `RAIO_X_ARQUIVO_CHAVE` | `scripts/comparar-modelos.mjs`, `tests/ajudantes/chave-de-arquivo.ts` | Caminho do arquivo com a chave da API, **fora** da pasta do projeto, para os scripts que gastam crédito (seção abaixo) |
| `RAIO_X_PLANO`, `RAIO_X_RFP`, `RAIO_X_TAP`, `RAIO_X_TIPO_PLANO`, `RAIO_X_GABARITO`, `RAIO_X_SAIDA`, `RAIO_X_PCS`, `RAIO_X_MODELO`, `RAIO_X_CARACTERISTICAS` | `scripts/conferir-plano-real.mjs`, `tests/pmo/plano-real.test.ts` | Roteiro da etapa 5 sobre um plano real, com os arquivos fora do repositório e o resumo só com números (`docs/estudos/roteiro-etapa-5-plano-real.md`) |
| `COMPARAR_MODELOS=sim`, `CONFERIR_PLANO_REAL=sim` | os testes acima | Travas: sem elas, os testes não gastam crédito nem leem arquivo de fora |
| `CI` | `playwright.config.ts` | Uma nova tentativa e saída no formato do GitHub |

**Nunca use `ANTHROPIC_API_KEY` neste projeto.** Com essa variável definida no terminal, o Claude Code passa a cobrar o próprio uso nessa chave. Os scripts não a leem, não a repassam e avisam se ela estiver definida.

## Chave da API nos scripts locais (PowerShell)

No app, a chave fica só no navegador (decisão 0003). Para os scripts que chamam a API na sua máquina (hoje, `npm run comparar-modelos`), ela fica num arquivo fora do repositório:

1. **Uma vez:** crie a pasta e o arquivo, e cole a chave pelo Bloco de Notas (assim ela não fica no histórico do PowerShell):

   ```powershell
   New-Item -ItemType Directory -Force "$env:USERPROFILE\.raio-x" | Out-Null
   notepad "$env:USERPROFILE\.raio-x\chave-api.txt"
   ```

   No Bloco de Notas, cole só a chave, numa linha, salve e feche.

2. **Opcional:** deixe o arquivo legível só pelo seu usuário:

   ```powershell
   icacls "$env:USERPROFILE\.raio-x\chave-api.txt" /inheritance:r /grant:r "$($env:USERNAME):(R,W)"
   ```

3. **Em cada rodada**, na pasta do projeto:

   ```powershell
   Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
   $env:RAIO_X_ARQUIVO_CHAVE = "$env:USERPROFILE\.raio-x\chave-api.txt"
   npm run comparar-modelos
   ```

4. **Para apagar a chave da máquina:** `Remove-Item "$env:USERPROFILE\.raio-x\chave-api.txt"`.

O script recusa um arquivo dentro da pasta do projeto e nunca imprime a chave.

## Testar sem a chave: o Claude do claude.ai faz o papel do PMO

1. **Exportar o pedido de um passo:**

   ```powershell
   npm run exportar-pedido -- --etapa 1 --passo leitura-rfp --rfp chamamento-publico-termo-fomento-smped-sp-2025.pdf
   ```

   O script grava em `..\pedidos-raio-x\`, fora do repositório:
   - um `.md` com exatamente o que o app mandaria à API: o texto de sistema (a skill e o método), a mensagem do usuário (o texto dos PDFs e o pedido com o esqueleto do código) e o schema JSON da resposta, com a estimativa de tokens no topo;
   - um `.dossie.json` para a importação.

   O gabarito do Claude Code nunca vai no pedido. Por ora, só a etapa 1 (`leitura-rfp`).
2. No claude.ai, cole o texto de sistema e a mensagem e peça só o JSON. Salve a resposta num arquivo `.json`.
3. **Importar a resposta:**

   ```powershell
   npm run importar-resposta -- --etapa 1 --passo leitura-rfp --arquivo <resposta.json> --dossie <arquivo .dossie.json>
   ```

   O script:
   - valida a resposta no schema;
   - grava a resposta no dossiê como leitura do PMO;
   - roda as travas do código e mostra os avisos um por um;
   - mede contra o gabarito do Claude Code, numa seção "leitura independente".

   O relatório fica ao lado da resposta (`<resposta>.placar.md`).

Pedido de edital público pode ir depois para `tests/fixtures/gerados/`. Pedido de plano real nunca vai para o Git.

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
- `src/leitura/ler-documento.ts`
- `scripts/comparar-modelos.mjs`, `tests/pmo/comparacao-modelos.test.ts`
