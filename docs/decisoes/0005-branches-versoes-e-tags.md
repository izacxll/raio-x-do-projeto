# 0005 — Branches, versões e tags por fase

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto, a partir da proposta do plano

## Decisão

**Branches**
- A `main` está sempre funcionando e só recebe pull request. Nunca commit direto nela.
- Cada fase em `fase/<id>-<nome>` (por exemplo, `fase/s-skill-pmo`, `fase/f1-leitura-rfp`). Correções em `correcao/<nome>`.
- Ao fim de cada fase: PR com descrição → teste e ok da responsável pelo projeto → merge, tag e release feitos pelo Claude Code.

**Versões** (uma tag e uma release ao fim de cada fase):

| Fase | Tag |
|---|---|
| Fundação | sem tag |
| S — skill PMO | v0.1.0 |
| P — prova de conceito | v0.2.0 |
| F0 — esqueleto | v0.3.0 |
| F5 — conferência | v0.4.0 |
| F1 — leitura da RFP | v0.5.0 |
| F2 — proposta | v0.6.0 |
| F5b — leitura do PMO na conferência (decisão 0013) | v0.7.0 |
| F3 — TAP | v0.8.0 |
| F4 — PGP | v0.9.0 |
| MVP aceito | v1.0.0 |

A F5b foi incluída depois da aprovação do plano (decisão 0013), e as tags da F3 e da F4 subiram uma posição.

Correções entre fases aumentam o último número (v0.4.1).

**Skill PMO:** tem número de versão próprio no cabeçalho do `SKILL.md`. A versão da skill e a do app ficam registradas no dossiê e no cabeçalho de cada documento gerado.

**CHANGELOG:** atualizado em todo PR, no formato "Keep a Changelog", em português.
