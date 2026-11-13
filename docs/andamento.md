# Andamento

Atualizado em 13/11/2026.

## Onde estamos

**Fase atual: Fundação** (branch `fase/fundacao`). Organização do repositório antes da skill PMO: `CLAUDE.md`, este arquivo, decisões 0001 a 0009, README, CHANGELOG, `.gitignore`, modelos de issue e PR e rótulos.

## Fases

| Fase | O que é | Situação | Tag |
|---|---|---|---|
| Fundação | Organização do repositório e decisões do plano | em andamento | — |
| S | Skill PMO, como rascunho para aprovação | a fazer | v0.1.0 |
| P | Prova de conceito com um caso real de política pública, sem código do app | a fazer | v0.2.0 |
| F0 | Esqueleto, identidade visual, fluxo de tela, leitura de PDF, dossiê, exportação básica | a fazer | v0.3.0 |
| F5 | Etapa 5: conferência do PGP (só código) | a fazer | v0.4.0 |
| F1 | Etapa 1: leitura da RFP (só código) | a fazer | v0.5.0 |
| F2 | Etapa 2: proposta, com o PMO; tela da chave; comparação de modelos | a fazer | v0.6.0 |
| F3 | Etapa 3: TAP, com o PMO | a fazer | v0.7.0 |
| F4 | Etapa 4: PGP, com o PMO | a fazer | v0.8.0 |
| MVP | Critérios de aceite da seção 14 | a fazer | v1.0.0 |

## Decisões pendentes

- **Modelo padrão da API:** Opus 5.5 é provisório; a escolha final sai da comparação Opus 5.5 × Sonnet 5.5 na F2 (decisão 0002).
- **Na fase P:** confirmar se os três PDFs do caso real são do mesmo contrato, antes de abrir qualquer um.
- **Na F0:** receber a apresentação HTML (identidade visual) e o logo da FGV Projetos.

## Próximo passo

1. A responsável pelo projeto revisa e aprova o PR de Fundação; merge na `main`.
2. Fase S: criar as pastas que faltam em `referencias/` (`identidade/`, `casos/`, `modelos/`, `rework/`, `pmbok/notas/`), avisar antes da 1ª onda de leitura do PMBOK e começar a leitura do Rework.
