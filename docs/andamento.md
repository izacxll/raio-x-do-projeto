# Andamento

Atualizado em 13/11/2026 (F0).

## Onde estamos

**Fase atual: F0 (esqueleto do app), pronta para teste** na branch `fase/f0-esqueleto` (PR aberto). Endereço do GitHub Pages: https://izacxll.github.io/raio-x-do-projeto/ — a fonte do Pages já é o GitHub Actions, mas o app só vai ao ar com o merge na `main` ou com a prévia da decisão 0018, que depende de a responsável pelo projeto liberar `fase/*` no ambiente `github-pages`.

A ordem mudou (decisão 0017): **a F0 veio antes da P**. Próxima: fase P (prova de conceito), numa conversa nova.

**O que a F0 entregou:**
- tela inicial com as cinco etapas e a tela de cada etapa no fluxo da seção 5.0, com a identidade da apresentação e o logo;
- leitura de PDF no navegador: texto por página, OCR em português, estado de cada página (texto, OCR, não verificável) e aviso de imagem; tudo servido pelo próprio site (decisão 0019);
- dossiê `.dossie.json` (salvar e abrir, sem a chave);
- relatório de leitura em DOCX, PDF e XLSX, com logo, minuta e versões;
- CI com a verificação do repositório (decisão 0010), lint, formatação, testes, build e fumaça no Chromium; publicação no Pages (decisão 0018);
- 8 RFPs públicas de teste com fonte e data (decisão 0020).

**O que a F0 não tem (fica para as fases das etapas):** regras, extração de requisitos, revisão item a item (aceitar, editar, descartar), tela da chave e o leitor de tabela de preço em imagem do Raio-X.

### Fase S (concluída, v0.1.0)

**O que a skill tem** (em `.claude/skills/pmo/`, versão 0.1.0):

| Arquivo | Conteúdo |
|---|---|
| `SKILL.md` | Papel, princípios, passo a passo das etapas 2, 3, 4 e 5 (F5b), formato de saída e o que carregar em cada etapa |
| `referencias/pmbok6.md` | Os 49 processos, de onde vem e para onde vai cada parte do plano, adaptação, fórmulas e variantes da tradução |
| `referencias/pmbok7.md` | 12 princípios, 8 domínios (com a verificação de resultados), adaptação e artefatos × partes do plano |
| `referencias/rework.md` | Práticas por tema, a seção da proposta e o quadro de cobertura (56 dos 61 artefatos com artigo) |
| `referencias/licitacoes.md` | Leis 14.133, 8.666, 13.019 e 13.303, com artigos e os valores de 2026 (Decreto 12.807/2025) |
| `referencias/checklist.md` | As 12 perguntas, cobrindo os 24 riscos da V29 |
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
| F0 | Esqueleto, identidade visual com o logo, fluxo de tela, leitura de PDF, dossiê `.dossie.json`, exportação básica, CI com a verificação dos formatos | pronta para teste (PR aberto) | v0.2.0 |
| P | Prova de conceito com um caso real de política pública, sem código do app; inclui a comparação regras de código × leitura do PMO | a fazer (depois da F0, decisão 0017) | v0.3.0 |
| F5 | Etapa 5: conferência do PGP só com código, com a base do "ausente" em três níveis | a fazer | v0.4.0 |
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

1. **Responsável pelo projeto:** escolher entre liberar a prévia (decisão 0018) ou testar localmente (`npm run dev`) e fazer o merge para o link valer; testar a F0 (roteiro na descrição do PR) e dar o ok.
2. Depois do ok: merge do PR, tag v0.2.0 e release. A publicação da `main` substitui a prévia.
3. **Vale abrir uma conversa nova** para a fase P. Ela começa lendo o `CLAUDE.md` e este arquivo.
4. Fase P: perguntar se os três PDFs do caso são do mesmo contrato; pedir que sejam salvos em `referencias/casos/<caso>/entrada/` como `1-chamamento.pdf`, `2-tap.pdf` e `3-plano.pdf`; seguir a seção 15 da especificação, com a regra contra contaminação. O app da F0 pode ser usado para ler os PDFs (nada sai do navegador), mas o que for gerado a partir deles fica fora do Git.

**Lembretes técnicos:**
- O Poppler (`pdftotext`, `pdfinfo`) não está no PATH do Git Bash; use o caminho completo ou a leitura do próprio app (`npm test` lê as RFPs de teste em Node).
- `npm run dev` e `npm run build` copiam antes os arquivos de leitura para `public/vendor/` (fora do Git).
- O `vite preview` 8 devolve 404 para scripts pedidos pelo navegador; os testes de fumaça usam `tests/fumaca/servidor.mjs`.
