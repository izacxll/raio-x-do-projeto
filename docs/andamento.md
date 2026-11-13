# Andamento

Atualizado em 13/11/2026.

## Onde estamos

**Fase atual: S — skill PMO** (branch `fase/s-skill-pmo`). Rascunho da skill em `.claude/skills/pmo/`, para aprovação antes da prova de conceito.

Leitura das fontes, com as notas em `referencias/` (fora do Git), o que permite retomar de onde parou:
- **PMBOK 6 e 7:** em ondas de subagentes, com aviso antes de cada onda; as notas ficam em `referencias/pmbok/notas/`.
- **Rework:** um artigo por vez; o índice do que foi lido e do que falta fica em `referencias/rework/_indice.md`.
- **Legislação:** textos do Planalto, com a data da consulta.

A Fundação foi concluída em 13/11/2026 (PR #1): `CLAUDE.md`, decisões 0001 a 0013, README, CHANGELOG, `.gitignore`, `.gitattributes`, modelos e rótulos.

## Fases

| Fase | O que é | Situação | Tag |
|---|---|---|---|
| Fundação | Organização do repositório e decisões do plano | concluída (PR #1) | — |
| S | Skill PMO, como rascunho para aprovação. As fichas trazem o conteúdo mínimo em itens numerados (A7.1…), com fonte, sinais no texto, quem confere (código ou só PMO) e quando dispensar (decisão 0013) | em andamento | v0.1.0 |
| P | Prova de conceito com um caso real de política pública, sem código do app. Inclui a comparação entre as regras de código e a leitura do PMO na conferência | a fazer | v0.2.0 |
| F0 | Esqueleto, identidade visual com o logo (decisão 0012), fluxo de tela, leitura de PDF, dossiê `.dossie.json`, exportação básica, CI com a verificação dos formatos (decisão 0010) | a fazer | v0.3.0 |
| F5 | Etapa 5: conferência do PGP só com código, com a base do "ausente" em três níveis | a fazer | v0.4.0 |
| F1 | Etapa 1: leitura da RFP (só código) | a fazer | v0.5.0 |
| F2 | Etapa 2: proposta, com o PMO; tela da chave; comparação de modelos | a fazer | v0.6.0 |
| F5b | Leitura opcional do PMO na etapa 5, com custo à vista e as travas da decisão 0013 | a fazer | v0.7.0 |
| F3 | Etapa 3: TAP, com o PMO | a fazer | v0.8.0 |
| F4 | Etapa 4: PGP, com o PMO | a fazer | v0.9.0 |
| MVP | Critérios de aceite da seção 14 | a fazer | v1.0.0 |

## Decisões pendentes

- **Modelo padrão da API:** o Opus 5.5 é provisório. A escolha final sai da comparação Opus 5.5 × Sonnet 5.5 na F2 (decisão 0002).
- **Na fase P:** confirmar se os três PDFs do caso real são do mesmo contrato, antes de abrir qualquer um deles.
- **Na F0:**
  - receber a apresentação HTML (identidade visual) e o logo da FGV Projetos em `referencias/identidade/`;
  - incluir DOCX, XLSX, ZIP, `.dossie.json`, DOC e XLS na verificação do CI (decisão 0010).
- **Na F5:** definir com a responsável pelo projeto as características que o GP confirma na tela do mapa (porte, campo, beneficiários, subcontratação…). As condições de dispensa do conteúdo mínimo dependem delas (decisão 0013).

## Próximo passo

1. Receber o ok da responsável pelo projeto para a 1ª onda de leitura do PMBOK.
2. Montar o índice do Rework (`referencias/rework/_indice.md`) e começar a leitura, um artigo por vez.
3. Ler a legislação no Planalto.
4. Escrever os arquivos da skill à medida que as notas ficarem prontas.
