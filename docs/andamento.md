# Andamento

Atualizado em 16/11/2026. Na `main`: v0.8.3. Em revisão: PRs #44 (métodos e decisão 0035), #45 (fase M1) e #46 (métodos revisados, chave em arquivo e documentação). Em andamento: fase M2.

## Onde estamos

**Os métodos das etapas valem (decisão 0034).** A responsável escreveu um método por etapa (`docs/estudos/metodo-etapa-1.md` a `metodo-etapa-5.md`), a partir da análise à mão de um caso real de parceria (fora do Git). O rastro de cada regra está em `docs/estudos/engenharia-reversa/`. O método prevalece sobre o que a etapa faz hoje: leitura e decisão para o gerente, não inventário, com a régua pelo tipo de contrato, de projeto e de plano.

**O PMO lê; o código monta e confere (decisão 0035).** Em todas as etapas, o PMO lê a partir do esqueleto do código, e o código confere cada citação, número e prazo. Sem a chave, a etapa 1 mostra o esqueleto com o aviso "leitura parcial por código"; a etapa 5 faz a conferência por código (o aviso entra nela na M5); as etapas 2, 3 e 4 pedem a chave ou a demonstração.

**Fase M1 (etapa 1 pelo método), PR #45, aguarda o teste e o ok da responsável** (decisão 0036). Leitura em 8 seções, "Pedir ao PMO" com as travas, R = entregas e obrigações específicas. Placar (`docs/estudos/placar-m1-etapa-1.md`, a fonte dos números):

| | SMPED (parceria) | OEI (licitação) |
|---|---|---|
| Itens na tela | 122 → 40 cartões + 16 R | 183 → 39 cartões + 16 R |
| Cartões que não passam no teste do método | 82 → 6 | 102 → 3 |
| Gabarito coberto (maioria das chaves) | 15 → 28 de 50 | 30 → 35 de 50 |
| Números sem fonte | 0 | 0 |

Os gabaritos e as leituras gravadas foram feitos pelo Claude Code seguindo a skill: o placar mede o esqueleto do código e as travas, não a qualidade da leitura do PMO. Essa só se mede com a chave e com um gabarito da responsável (roteiro em `docs/estudos/roteiro-etapa-5-plano-real.md`).

**PR #46:** métodos revisados (sem os detalhes que identificavam o caso real) e a engenharia reversa das cinco etapas; a chave dos scripts lida de um arquivo fora do repositório (`RAIO_X_ARQUIVO_CHAVE`, nunca `ANTHROPIC_API_KEY`); documentação coerente com a 0035 e a M1; o roteiro da etapa 5 com um plano real.

**Fase M2 (etapa 2 pelo método) em andamento**, encadeada em cima do #46: a minuta redigida por inteiro, preço pelo tipo de contrato, pontos por preço, caixa e quadro de equipe × produtividade.

## Fases

| Fase | O que é | Situação | Tag |
|---|---|---|---|
| Fundação, S, F0 | Organização, skill PMO 0.1.0, esqueleto do app | concluídas (PRs #1 a #3) | v0.1.0, v0.2.0 |
| F5, F1, F2 | Conferência do PGP, leitura da RFP e proposta | concluídas (PRs #5 a #7) | v0.3.0 a v0.5.0 |
| Demonstração, F3, F4, F5b | Respostas gravadas, TAP, PGP e leitura do PMO na etapa 5 | concluídas (PRs #8 a #11) | v0.5.1 a v0.8.0 |
| Correções | Termo de fomento (0031), nome do projeto, falsos positivos da etapa 5 (0033, fase 1) | concluídas (PRs #13, #14, #43) | v0.8.1 a v0.8.3 |
| P | Prova de conceito com o caso real | **encerrada**: substituída pela análise à mão da responsável, que deu os métodos (decisão 0034) | — |
| M0 | Métodos em vigor (0034) e o PMO lê, o código confere (0035) | PR #44 | — |
| M1 | Etapa 1 pelo método | PR #45; teste da responsável pendente | v0.9.0 |
| — | Métodos revisados, chave em arquivo, documentação, roteiro da etapa 5 | PR #46 | — |
| M2 | Etapa 2 pelo método | em andamento | v0.10.0 |
| M3 | Etapa 3 pelo método (contrato como entrada) | a fazer | v0.11.0 |
| M4 | Etapa 4 pelo método (adaptação por porte e tipo) | a fazer | v0.12.0 |
| M5 | Etapa 5 pelo método (régua pelo tipo de plano; fases restantes da 0033) | a fazer | v0.13.0 |
| Skill 0.3.0 | Tipos de projeto e de plano, etapa 1 no SKILL.md, etapa 5 como leitura principal, proposta de parceria, PC com gatilho e reajuste, contrato, caixa | PR próprio, mostrado antes de publicar | — |
| MVP | Critérios de aceite da seção 14 | a fazer | v1.0.0 |

O que cada fase M ainda precisa cobrir está nas issues de cada uma (rótulos `etapa-2` a `etapa-5`).

## Decisões pendentes

- **Modelo padrão da API:** Opus 5.5 é provisório; a escolha sai da comparação (`npm run comparar-modelos`, decisões 0002 e 0025), que espera a chave.
- **Ordem de impacto dos pontos de atenção** (caixa > dependência do contratante > preço > prazo): julgamento da análise, a confirmar pela responsável (engenharia reversa, `09-pontos-de-atencao.md`).
- **Gravidade dos conflitos que envolvem mais de uma parte** do plano (etapa 5) e **gatilhos com número** como campos obrigatórios da etapa 4: a validar na M4 e na M5.

## Próximo passo

1. **Responsável pelo projeto:**
   - ok nos PRs #44, #45 e #46, e o teste da etapa 1 na prévia;
   - conferir os 10 itens do gabarito separados em cada placar antes do merge da fase;
   - com a chave: a comparação de modelos e o roteiro da etapa 5 sobre um plano real (abaixo).
2. **Claude Code:** fase M2 e o PR da skill 0.3.0 (sem publicar antes do ok).

**Com a chave da API** (pedir ao administrador do Claude da FGV, no Claude Console). A chave fica num arquivo fora do projeto; passo a passo no PowerShell em [`tecnico/07-configuracao.md`](tecnico/07-configuracao.md#chave-da-api-nos-scripts-locais-powershell). Nunca defina `ANTHROPIC_API_KEY` no terminal: com ela, o Claude Code passa a cobrar o uso dele nessa chave.

```powershell
Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
$env:RAIO_X_ARQUIVO_CHAVE = "$env:USERPROFILE\.raio-x\chave-api.txt"
npm run comparar-modelos     # cerca de US$ 2 a 3; resultado em tests/fixtures/gerados/comparacao-modelos/resumo.md
```

Na tela, nunca citar fases do plano: para o GP, o que falta é "em construção".

**Lembretes técnicos:**
- O Poppler (`pdftotext`, `pdfinfo`) não está no PATH do Git Bash; use o caminho completo ou a leitura do próprio app (`npm test` lê as RFPs de teste em Node).
- `npm run dev` e `npm run build` copiam antes os arquivos de leitura para `public/vendor/` (fora do Git).
- O `vite preview` 8 devolve 404 para scripts pedidos pelo navegador; os testes de fumaça usam `tests/fumaca/servidor.mjs`.
