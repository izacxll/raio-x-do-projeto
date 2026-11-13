# Andamento

Atualizado em 13/11/2026 (F5 publicada como v0.3.0).

## Onde estamos

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
| F1 | Etapa 1: leitura da RFP (só código) | a fazer | v0.5.0 |
| F2 | Etapa 2: proposta, com o PMO; tela da chave; comparação de modelos | a fazer | v0.6.0 |
| F5b | Leitura opcional do PMO na etapa 5 | a fazer | v0.7.0 |
| F3 | Etapa 3: TAP, com o PMO | a fazer | v0.8.0 |
| F4 | Etapa 4: PGP, com o PMO | a fazer | v0.9.0 |
| MVP | Critérios de aceite da seção 14 | a fazer | v1.0.0 |

## Decisões pendentes

- **Modelo padrão da API:** Opus 5.5 é provisório; a escolha final sai da comparação na F2 (decisão 0002).
- **Na fase P:** confirmar se os três PDFs do caso real são do mesmo contrato, antes de abrir qualquer um.
- **Na F5:** fechar a lista de características do projeto (porte, campo, beneficiários etc.) e a tela em que o GP as confirma.
- **Na F2:** ampliar o vocabulário de dispensa com as características da proposta (decisão 0016).

## Próximo passo

1. **Responsável pelo projeto:** testar a etapa 5 no app publicado, quando puder; o que aparecer vira correção (v0.3.x).
2. **Vale abrir uma conversa nova** para a próxima fase (F1, leitura da RFP, ou a P, se a responsável quiser retomá-la).
3. Na tela, nunca citar fases do plano: para o GP, o que falta é "em construção".

**Lembretes técnicos:**
- O Poppler (`pdftotext`, `pdfinfo`) não está no PATH do Git Bash; use o caminho completo ou a leitura do próprio app (`npm test` lê as RFPs de teste em Node).
- `npm run dev` e `npm run build` copiam antes os arquivos de leitura para `public/vendor/` (fora do Git).
- O `vite preview` 8 devolve 404 para scripts pedidos pelo navegador; os testes de fumaça usam `tests/fumaca/servidor.mjs`.
