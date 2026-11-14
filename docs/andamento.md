# Andamento

Atualizado em 13/11/2026 (F1 e F2 publicadas antes do teste, decisão 0026).

## Onde estamos

**F1 e F2 publicadas na `main` como v0.4.0 e v0.5.0 em 13/11/2026, antes do teste da responsável** (decisão 0026). App no ar: https://izacxll.github.io/raio-x-do-projeto/. O teste das etapas 1, 2 e 5 continua pendente; o que ele encontrar sai como v0.4.x ou v0.5.x. A etapa 2 ainda não foi testada com a chave, e a comparação Opus 5.5 × Sonnet 5.5 (`npm run comparar-modelos`, decisão 0002) espera a chave.

**Modo demonstração pronto no PR #8 (v0.5.1), aguardando o ok da responsável para o merge** (decisão 0027): na etapa 2, "Ver demonstração" abre a RFP pública da OEI com as respostas gravadas do PMO, sem chamar a API; aviso na tela e nos exportados.

**F3 (TAP com o PMO) construída sem a chave, na branch `fase/f3-tap`** (decisão 0028): divergências RFP × proposta, o que vem dos documentos, 12 elementos e registro de premissas pelo PMO, conferência do TAP, saídas e demonstração. Falta, com a chave: o teste real da etapa 3.

**Próximas fases, nesta ordem (decisão 0026):** F3 (TAP, v0.6.0), F4 (PGP, v0.7.0) e F5b (leitura do PMO na conferência, v0.8.0), cada uma com PR e prévia.

**O que a F2 entregou:** tela "Conectar ao Claude" (chave só na sessão, testar, esquecer); ponto de partida vindo da etapa 1; três passos do PMO (estratégia e abordagens; conteúdo técnico e SOW; EAP, estimativas e equipe), com o custo estimado antes e o uso real depois; escolha da abordagem e das premissas críticas pelo GP; conferência de cada citação, da redação e dos números sem fonte; cronograma PERT com caminho crítico e prazos (total e de cada produto) contra a RFP; preço com os valores do GP; matriz de atendimento e checklist de envio; quatro saídas. Decisão 0025.

**O que falta na proposta (próximas versões):** planilha de preço no formato do próprio edital; estrutura de uma proposta antiga da FGV (`referencias/modelos/`, se a responsável tiver uma); leitura, pelo código, da tabela de prazos por produto da RFP (hoje vem do PMO, conferida pela citação); vocabulário de dispensa ampliado (decisão 0016).

**F1 (leitura da RFP, só código) pronta na branch `fase/f1-leitura-rfp`, com o PR #6 aberto.** Falta o teste e o ok da responsável; depois, merge, tag **v0.4.0** e release (decisão 0024).

**O que a F1 entregou:** "Analisar a RFP" com pontos de atenção, identificação, mapa do documento (seções, cláusulas, anexos e o tema de cada uma), requisitos numerados (produtos, equipe, quantidades, local; número fixo no dossiê, que segue para a etapa 5), prazos do certame e da execução com o limite de esclarecimento calculado e o alerta, julgamento, habilitação (catálogo de 31 documentos), apresentação, condições contratuais com o valor tirado por código, partes interessadas e vagos e brechas com a pergunta de esclarecimento sugerida. Revisão item a item, decisão de participar (só do GP) e as quatro saídas (Análise DOCX/PDF, Requisitos e prazos XLSX, Checklist de habilitação XLSX, Perguntas DOCX). Testada em 8 RFPs públicas.

**O que falta na leitura da RFP (próximas versões):** requisitos técnicos e funcionais em texto corrido (o GP inclui), feriados na conta de dias úteis, produtos com código próprio em tabela ("PML-REL-01"), descrição de produto partida em duas colunas da tabela.

**A F0 (esqueleto do app) foi aprovada e publicada como v0.2.0 em 13/11/2026.** App no ar: https://izacxll.github.io/raio-x-do-projeto/ (a `main` publica a cada merge; cada push numa branch `fase/*` publica uma prévia, decisão 0018).

**F5 (conferência, só código) publicada como v0.3.0 em 13/11/2026**, junto com a skill PMO 0.2.0, **antes do teste da responsável** (decisão 0023). App no ar: https://izacxll.github.io/raio-x-do-projeto/ — etapa 5. **O teste da etapa 5 continua pendente**; o que ele encontrar sai como v0.3.1, v0.3.2 etc. A fase P (caso real) fica para depois, por decisão da responsável pelo projeto.

**Skill PMO 0.2.0 publicada** (PR #4, decisão 0021): os riscos da V29 deixam de ser lista à parte e viram 8 premissas críticas (PC1 a PC8) escritas dentro da proposta, do TAP e do plano (B3, B27, A11; tratamento no A8, grave). Na etapa 5, a premissa crítica que se aplica e não está no plano é "ausente".

**O que a F5 entregou:** mapa do PGP confirmado pelo GP; características do projeto; premissas críticas; requisitos da RFP; conferência (vago, conflituoso, ausente) com gravidade e categoria por regra fixa; decisão do GP em cada achado; relatório DOCX/PDF e lista XLSX. Teste com um plano gerado pelo PMO e 9 erros plantados: todos achados. Regras e limites na decisão 0022.

**O que falta na conferência (próximas versões):** as regras da decisão 0009 que ainda não entraram (escopo × exclusões, teto × volume, datas de marcos, eleição, valores por extenso etc.); extração de requisitos em tabela; cruzamento de datas, valores e responsáveis entre PGP, TAP e RFP.

**O que a F0 entregou:**
- tela inicial com as cinco etapas e a tela de cada etapa no fluxo da seção 5.0, com a identidade da apresentação e o logo;
- leitura de PDF no navegador: texto por página, OCR em português, estado de cada página (texto, OCR, não verificável) e aviso de imagem; tudo servido pelo próprio site (decisão 0019);
- dossiê `.dossie.json` (salvar e abrir, sem a chave);
- relatório de leitura em DOCX, PDF e XLSX, com logo, minuta e versões;
- CI com a verificação do repositório (decisão 0010), lint, formatação, testes, build e fumaça no Chromium; publicação no Pages (decisão 0018);
- 8 RFPs públicas de teste com fonte e data (decisão 0020).

**O que a F0 não tem (fica para as fases das etapas):** regras, extração de requisitos, revisão item a item (aceitar, editar, descartar), tela da chave e o leitor de tabela de preço em imagem do Raio-X.

### Fase S (concluída, v0.1.0)

**O que a skill tem** (em `.claude/skills/pmo/`, versão 0.2.0 desde a decisão 0021):

| Arquivo | Conteúdo |
|---|---|
| `SKILL.md` | Papel, princípios, passo a passo das etapas 2, 3, 4 e 5 (F5b), formato de saída e o que carregar em cada etapa |
| `referencias/pmbok6.md` | Os 49 processos, de onde vem e para onde vai cada parte do plano, adaptação, fórmulas e variantes da tradução |
| `referencias/pmbok7.md` | 12 princípios, 8 domínios (com a verificação de resultados), adaptação e artefatos × partes do plano |
| `referencias/rework.md` | Práticas por tema, a seção da proposta e o quadro de cobertura (56 dos 61 artefatos com artigo) |
| `referencias/licitacoes.md` | Leis 14.133, 8.666, 13.019 e 13.303, com artigos e os valores de 2026 (Decreto 12.807/2025) |
| `referencias/checklist.md` | Premissas críticas comuns PC1 a PC8 (V29 revisada, decisão 0021; na 0.1.0 eram 12 perguntas de risco) |
| `referencias/experiencia.md` | Onde os planos costumam falhar (só padrões gerais) |
| `referencias/artefatos/` | 61 fichas: TAP, 18 componentes, 33 documentos e 9 partes da proposta, com 608 itens de conteúdo mínimo (508 conferidos por código, 100 só pelo PMO) |

**Tamanho do pacote enviado em cada etapa** (estimativa de 4 caracteres por token):
- etapa 2: ~45 mil tokens;
- etapa 3: ~16 mil tokens;
- etapas 4 e 5: as fichas vão aos poucos (passo a passo, ou só o conteúdo mínimo), em vez dos ~100 mil tokens de todas de uma vez.

**Fontes lidas** (todas fora do Git, em `referencias/`):
- PMBOK 6 e 7: 13 partes, com as notas em `pmbok/notas/`.
- Rework: 93 artigos, com o índice em `rework/_indice.md`.
- Legislação: as quatro leis e o decreto de valores, em `legislacao/`.

## Fases

| Fase | O que é | Situação | Tag |
|---|---|---|---|
| Fundação | Organização do repositório e decisões do plano | concluída (PR #1) | — |
| S | Skill PMO 0.1.0 | concluída (PR #2; checklist aprovado) | v0.1.0 |
| F0 | Esqueleto, identidade visual com o logo, fluxo de tela, leitura de PDF, dossiê `.dossie.json`, exportação básica, CI com a verificação dos formatos | concluída (PR #3) | v0.2.0 |
| P | Prova de conceito com um caso real de política pública, sem código do app; inclui a comparação regras de código × leitura do PMO | adiada pela responsável pelo projeto (depois da F5) | a definir |
| F5 | Etapa 5: conferência do PGP só com código, com a base do "ausente" em três níveis | concluída (PR #5), teste da responsável pendente (decisão 0023) | v0.3.0 |
| F1 | Etapa 1: leitura da RFP (só código) | concluída (PR #6), teste da responsável pendente (decisão 0026) | v0.4.0 |
| F2 | Etapa 2: proposta, com o PMO; tela da chave; comparação de modelos | concluída (PR #7) sem a chave; teste da responsável, teste com a chave e comparação de modelos pendentes (decisão 0026) | v0.5.0 |
| F3 | Etapa 3: TAP, com o PMO | construída sem a chave (PR aberto); teste com a chave pendente | v0.6.0 |
| F4 | Etapa 4: PGP, com o PMO | a fazer | v0.7.0 |
| F5b | Leitura opcional do PMO na etapa 5 | a fazer | v0.8.0 |
| MVP | Critérios de aceite da seção 14 | a fazer | v1.0.0 |

## Decisões pendentes

- **Modelo padrão da API:** Opus 5.5 é provisório; a escolha final sai da comparação, que já está pronta e só espera a chave (`npm run comparar-modelos`, decisões 0002 e 0025).
- **Na fase P:** confirmar se os três PDFs do caso real são do mesmo contrato, antes de abrir qualquer um.
- **Na F5:** fechar a lista de características do projeto (porte, campo, beneficiários etc.) e a tela em que o GP as confirma.
- **Depois da F2:** ampliar o vocabulário de dispensa com as características da proposta (decisão 0016).

## Próximo passo

1. **Claude Code:** F4 (PGP), com PR e prévia; F3 pronta no PR (TAP) e F4 (PGP), com PR e prévia; se sobrar tempo, F5b.
2. **Responsável pelo projeto:** testar as etapas 1, 2 (no modo demonstração ou com a chave) e 5 na prévia; o que aparecer vira correção (v0.4.x, v0.5.x).
3. **Quando a chave da API chegar** (pedir ao administrador do Claude da FGV, no Claude Console):
   - no PowerShell, na pasta do projeto: `$env:ANTHROPIC_API_KEY = "<chave>"; npm run comparar-modelos` (custa cerca de US$ 2 a 3); o resultado fica em `tests/fixtures/gerados/comparacao-modelos/resumo.md`. A responsável escolhe o modelo e a decisão 0002 é atualizada;
   - testar a etapa 2 com a chave, numa RFP pública.
4. Na tela, nunca citar fases do plano: para o GP, o que falta é "em construção".

**Lembretes técnicos:**
- O Poppler (`pdftotext`, `pdfinfo`) não está no PATH do Git Bash; use o caminho completo ou a leitura do próprio app (`npm test` lê as RFPs de teste em Node).
- `npm run dev` e `npm run build` copiam antes os arquivos de leitura para `public/vendor/` (fora do Git).
- O `vite preview` 8 devolve 404 para scripts pedidos pelo navegador; os testes de fumaça usam `tests/fumaca/servidor.mjs`.
