# Raio-X do Projeto

Ferramenta web para **gerentes de projeto da FGV Projetos**. Apoia o ciclo que vai da leitura de uma solicitação de proposta até a conferência do Plano de Gerenciamento do Projeto:

1. **Leitura da RFP** — o que o gerente precisa saber para decidir se participa, em 8 seções: em uma página; o que a contratada teria de fazer e entregar; prazos; dinheiro; julgamento e o que vai na proposta; habilitação; pontos de atenção com a premissa crítica e a pergunta de esclarecimento; o que não se aplica à modalidade.
2. **Proposta** — minuta da proposta técnica e de preço que responde à RFP.
3. **Termo de Abertura (TAP)** — os 12 elementos do termo, a partir da RFP e da proposta.
4. **Plano de Gerenciamento (PGP)** — o plano adaptado ao porte e ao tipo do projeto.
5. **Conferência do plano** — aponta o que está vago, conflituoso ou ausente, com categoria e gravidade.

A ferramenta **prepara minutas e aponta problemas; quem decide é sempre o gerente do projeto.** Todo conteúdo vem rotulado como *Do documento* (com página e trecho), *Sugestão* ou *Decisão do GP*, e nada é inventado: o que o documento não informa aparece como "a definir pelo GP".

**O PMO lê; o código monta e confere** (decisão 0035). Em todas as etapas, a leitura é do PMO (o Claude, com a skill PMO): o que pesa e por quê, a redação, a estratégia. O código monta antes o esqueleto (páginas, números, datas, contas, o que as regras acharam) e confere depois cada citação, número e prazo que o PMO devolve. Cada etapa segue o seu método (`docs/estudos/metodo-etapa-<n>.md`, decisão 0034).

> **Situação (16/11/2026):** a `main` está na v0.8.3. A etapa 1 pelo método (fase M1) está em revisão (PR #45), e as etapas 2 a 5 passam pelo método nas fases M2 a M5. Veja o andamento em [`docs/andamento.md`](docs/andamento.md).

## Como usar

O app roda no navegador: **https://izacxll.github.io/raio-x-do-projeto/**. Os PDFs são lidos na sua própria máquina.

O que cada etapa faz hoje. **Nenhuma etapa analisa sem a conexão com o Claude** (decisão 0037): sem a chave, nada é analisado. O site não tem modo de demonstração (decisão 0053).

| Etapa | O que faz (com a conexão) |
|---|---|
| 1 — Leitura da RFP | "Analisar a RFP": o código monta o esqueleto nas 8 seções, o PMO lê a RFP a partir dele e o código confere cada citação, número e requisito R antes de mostrar |
| 2 — Proposta | Estratégia e abordagens, conteúdo técnico e SOW, EAP e equipe pelo PMO; cronograma, preço e matriz de atendimento pelo código |
| 3 — TAP | Os 12 elementos e o registro de premissas pelo PMO; divergências RFP × proposta e conferência do TAP pelo código |
| 4 — PGP | Adaptação decidida pelo GP e as partes do plano pelo PMO; cronograma, marcos, custos, rastreabilidade, diagramas e a autoconferência pelas regras da etapa 5 pelo código |
| 5 — Conferência | "Conferir o plano": a conferência por código e a leitura do PMO juntas; o código confere cada citação do PMO, procura no plano o que ele diz estar ausente e dá a gravidade pela parte do plano |

- **A chave da API** é pedida ao administrador do Claude da FGV, que a cria no Claude Console; o login do claude.ai não serve. Ela fica só no seu navegador, durante a sessão. Os PDFs são lidos no navegador; o texto deles só vai para a API do Claude, pela organização da FGV, quando você pede a análise, e a tela avisa antes, com o custo estimado.
- O trabalho é salvo num arquivo de **dossiê** (`<projeto>.dossie.json`), que você guarda e reabre quando quiser. O dossiê nunca guarda a chave.

O guia completo está em [`docs/guia-do-gerente.md`](docs/guia-do-gerente.md).

## Como rodar localmente

Precisa do Node.js 22 ou mais novo.

```powershell
npm install
npm run dev          # abre em http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `npm test` | Testes de unidade e a leitura das RFPs públicas de teste |
| `npm run build` | Build de produção em `dist/` (com a checagem de tipos) |
| `npm run test:fumaca` | Testes no navegador sobre o build (rode `npx playwright install chromium` uma vez) |
| `npm run lint` / `npm run verificar-formato` | ESLint e Prettier |
| `npm run verificar-repositorio` | A verificação do repositório público que o CI faz (decisão 0010) |
| `npm run comparar-modelos` | Compara o Opus 5.5 e o Sonnet 5.5 na etapa 2 (gasta crédito; a chave fica num arquivo fora do repositório, indicado por `RAIO_X_ARQUIVO_CHAVE`; passo a passo em [`docs/tecnico/07-configuracao.md`](docs/tecnico/07-configuracao.md#chave-da-api-nos-scripts-locais-powershell)). **Nunca** use `ANTHROPIC_API_KEY`: com ela no terminal, o Claude Code cobra o uso dele nessa chave |

## Como publicar

A `main` é publicada no GitHub Pages a cada merge (`.github/workflows/publicar.yml`). Para testar uma fase antes do merge, o mesmo workflow pode ser disparado à mão na branch da fase (decisão 0018).

## Onde fica cada coisa

| Pasta ou arquivo | O que tem |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Regras de trabalho do projeto: princípios, código × PMO, repositório e segurança |
| [`docs/andamento.md`](docs/andamento.md) | Fase atual, decisões pendentes e próximo passo |
| [`docs/decisoes/`](docs/decisoes/) | Uma decisão por arquivo |
| `.claude/skills/pmo/` | Skill PMO: a leitura do PMO em todas as etapas |
| [`docs/guia-do-gerente.md`](docs/guia-do-gerente.md) | Como usar, com e sem chave |
| [`docs/estudos/`](docs/estudos/) | Métodos das etapas, o rastro das regras de cada etapa e o roteiro da etapa 5 com um plano real |
| [`docs/arquitetura.md`](docs/arquitetura.md) | Código × PMO, pastas, fluxo das etapas, dossiê, segurança e testes |
| [`docs/tecnico/`](docs/README.md) | Documentação técnica com diagramas: arquitetura, dependências, integrações, modelo de dados, fluxos, configuração, build e pontos de atenção |
| [`docs/identidade-visual.md`](docs/identidade-visual.md) | Cores, fonte, componentes e etiquetas |
| [`src/`](src/) | Código do app |
| [`tests/`](tests/) | Testes; RFPs públicas de teste em `tests/fixtures/rfps-publicas/` |
| [`scripts/`](scripts/) | Cópia dos arquivos de leitura para o site e verificação do repositório |
| `referencias/` | Material de referência e documentos confidenciais — **fora do Git** |

## Licença

Ainda não definida. A escolha é da FGV.
