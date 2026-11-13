# Andamento

Atualizado em 13/11/2026.

## Onde estamos

**Fase atual: Fundação** (branch `fase/fundacao`, PR #1). É a organização do repositório antes da skill PMO:
- `CLAUDE.md` e este arquivo;
- decisões 0001 a 0010;
- README e CHANGELOG;
- `.gitignore` e `.gitattributes`;
- modelos de issue e de PR;
- rótulos.

As pastas de trabalho em `referencias/`, que ficam fora do Git, já foram criadas: `identidade/`, `casos/`, `modelos/`, `rework/` e `pmbok/notas/`.

## Fases

| Fase | O que é | Situação | Tag |
|---|---|---|---|
| Fundação | Organização do repositório e decisões do plano | em revisão (PR #1) | — |
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

- **Nome do documento B32 (team charter):** o PMBOK 6 em português usa "Termo de nomeação da equipe" e o PMBOK 7, "Termo de abertura da equipe do projeto". Falta a responsável pelo projeto escolher o nome que o app usa.
- **Modelo padrão da API:** o Opus 5.5 é provisório. A escolha final sai da comparação Opus 5.5 × Sonnet 5.5 na F2 (decisão 0002).
- **Na fase P:** confirmar se os três PDFs do caso real são do mesmo contrato, antes de abrir qualquer um deles.
- **Na F0:** receber a apresentação HTML (identidade visual) e o logo da FGV Projetos.
- **Na F0:** incluir DOCX, XLSX, ZIP, `.dossie.json`, DOC e XLS na verificação do CI (decisão 0010).

## Próximo passo

1. Merge do PR de Fundação, depois do ok da responsável pelo projeto.
2. Fase S, na branch `fase/s-skill-pmo`:
   - avisar antes da 1ª onda de leitura do PMBOK;
   - começar a leitura do Rework, um artigo por vez, com o índice em `referencias/rework/_indice.md`;
   - ler a legislação no Planalto.
