# Raio-X do Projeto

Ferramenta web para **gerentes de projeto da FGV Projetos**. Apoia o ciclo que vai da leitura de uma solicitação de proposta até a conferência do Plano de Gerenciamento do Projeto:

1. **Leitura da RFP** — desmembra o edital ou chamamento: requisitos numerados, prazos, julgamento, habilitação, condições contratuais, brechas e perguntas de esclarecimento.
2. **Proposta** — minuta da proposta técnica e de preço que responde à RFP.
3. **Termo de Abertura (TAP)** — os 12 elementos do termo, a partir da RFP e da proposta.
4. **Plano de Gerenciamento (PGP)** — o plano adaptado ao porte e ao tipo do projeto.
5. **Conferência do PGP** — aponta o que está vago, conflituoso ou ausente, com categoria e gravidade.

A ferramenta **prepara minutas e aponta problemas; quem decide é sempre o gerente do projeto.** Todo conteúdo vem rotulado como *Do documento* (com página e trecho), *Sugestão* ou *Decisão do GP*, e nada é inventado: o que o documento não informa aparece como "a definir pelo GP".

> **Situação:** em construção. Veja em que fase o projeto está em [`docs/andamento.md`](docs/andamento.md).

## Como usar

O app roda no navegador: **https://izacxll.github.io/raio-x-do-projeto/**. Os PDFs são lidos na sua própria máquina.

Hoje funcionam, sem chave: a leitura dos PDFs (com OCR nas páginas em imagem), o dossiê (salvar e abrir), a **etapa 1** (análise da RFP: requisitos numerados, prazos com o limite de esclarecimento calculado, julgamento, habilitação, condições contratuais, brechas com perguntas de esclarecimento e as quatro saídas) e a **etapa 5** (conferência do PGP). Com a chave, a **etapa 2** (proposta: estratégia e abordagens, conteúdo técnico e SOW, EAP e equipe pelo PMO; cronograma, preço e matriz de atendimento pelo código) , a **etapa 3** (TAP: os 12 elementos e o registro de premissas pelo PMO; divergências RFP × proposta e conferência do TAP pelo código) e a **etapa 4** (PGP: adaptação decidida pelo GP e as partes do plano pelo PMO; cronograma, marcos, custos, rastreabilidade, diagramas e a autoconferência pelas regras da etapa 5 pelo código). Na etapa 5, a **leitura do PMO** é opcional, com a chave. Sem a chave, as etapas com o PMO podem ser vistas no **modo demonstração**, com respostas gravadas para uma RFP pública.

- **Sem chave da API:** leitura dos PDFs, etapa 1 (leitura da RFP) e etapa 5 (conferência do PGP). Nada é enviado para fora do navegador.
- **Com a chave da API:** etapas 2, 3 e 4, que usam a inteligência do PMO (Claude). A chave é pedida ao administrador do Claude da FGV, que a cria no Claude Console; o login do claude.ai não serve. A chave fica só no seu navegador, durante a sessão, e o conteúdo dos PDFs dessas etapas é enviado à API do Claude pela organização da FGV.
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
| `npm run comparar-modelos` | Compara o Opus 5.5 e o Sonnet 5.5 na etapa 2 (gasta crédito; precisa de `$env:ANTHROPIC_API_KEY`, decisão 0025) |

## Como publicar

A `main` é publicada no GitHub Pages a cada merge (`.github/workflows/publicar.yml`). Para testar uma fase antes do merge, o mesmo workflow pode ser disparado à mão na branch da fase (decisão 0018).

## Onde fica cada coisa

| Pasta ou arquivo | O que tem |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Regras de trabalho do projeto: princípios, código × PMO, repositório e segurança |
| [`docs/andamento.md`](docs/andamento.md) | Fase atual, decisões pendentes e próximo passo |
| [`docs/decisoes/`](docs/decisoes/) | Uma decisão por arquivo |
| `.claude/skills/pmo/` | Skill PMO: a inteligência das etapas 2, 3 e 4 (fase S) |
| [`docs/guia-do-gerente.md`](docs/guia-do-gerente.md) | Como usar, com e sem chave |
| [`docs/arquitetura.md`](docs/arquitetura.md) | Código × PMO, pastas, fluxo das etapas, dossiê, segurança e testes |
| [`docs/identidade-visual.md`](docs/identidade-visual.md) | Cores, fonte, componentes e etiquetas |
| [`src/`](src/) | Código do app |
| [`tests/`](tests/) | Testes; RFPs públicas de teste em `tests/fixtures/rfps-publicas/` |
| [`scripts/`](scripts/) | Cópia dos arquivos de leitura para o site e verificação do repositório |
| `referencias/` | Material de referência e documentos confidenciais — **fora do Git** |

## Licença

Ainda não definida. A escolha é da FGV.
