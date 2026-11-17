# Andamento

Atualizado em 16/11/2026. Na `main`: v0.8.3. Em revisão: PRs #44 (métodos e decisão 0035), #45 (fase M1) e #46 (métodos revisados, chave em arquivo e documentação). Em andamento: fase M2.

## Onde estamos

**Os métodos das etapas valem (decisão 0034).** A responsável escreveu um método por etapa (`docs/estudos/metodo-etapa-1.md` a `metodo-etapa-5.md`), a partir da análise à mão de um caso real de parceria (fora do Git). O rastro de cada regra está em `docs/estudos/engenharia-reversa/`. O método prevalece sobre o que a etapa faz hoje: leitura e decisão para o gerente, não inventário, com a régua pelo tipo de contrato, de projeto e de plano.

**O PMO lê; o código monta e confere (decisão 0035).** Em todas as etapas, o PMO lê a partir do esqueleto do código, e o código confere cada citação, número e prazo. **Nenhuma etapa analisa sem a conexão com o Claude (decisão 0037):** sem a chave, as opções são conectar ou ver a demonstração, que existe em todas as etapas (na 5, com um plano inventado com erros plantados). O esqueleto do código vai no pedido e não aparece sozinho.

**Fase M1 (etapa 1 pelo método), PR #45, aguarda o teste e o ok da responsável** (decisão 0036). Leitura em 8 seções, "Pedir ao PMO" com as travas, R = entregas e obrigações específicas. Placar (`docs/estudos/placar-m1-etapa-1.md`, a fonte dos números):

| | SMPED (parceria) | OEI (licitação) |
|---|---|---|
| Itens na tela | 122 → 40 cartões + 16 R | 183 → 39 cartões + 16 R |
| Cartões que não passam no teste do método | 82 → 6 | 102 → 3 |
| Gabarito coberto (maioria das chaves) | 15 → 28 de 50 | 30 → 35 de 50 |
| Números sem fonte | 0 | 0 |

Os gabaritos e as leituras gravadas foram feitos pelo Claude Code seguindo a skill: o placar mede o esqueleto do código e as travas, não a qualidade da leitura do PMO. Essa só se mede com a chave e com um gabarito da responsável (roteiro em `docs/estudos/roteiro-etapa-5-plano-real.md`).

**PR #46:** métodos revisados (sem os detalhes que identificavam o caso real) e a engenharia reversa das cinco etapas; a chave dos scripts lida de um arquivo fora do repositório (`RAIO_X_ARQUIVO_CHAVE`, nunca `ANTHROPIC_API_KEY`); documentação coerente com a 0035 e a M1; o roteiro da etapa 5 com um plano real; a decisão 0037 (conexão antes de analisar, demonstração da etapa 5).

**Correções da etapa 1 e autoconferência (decisões 0048 e 0049), branch `correcao/etapa-1-esqueleto` em cima da M3:** os erros do esqueleto que os testes externos da skill acharam na SMPED e num TR municipal de contratação direta; a contratação direta no código; os cruzamentos X1 a X6; a citação fraca; a autoconferência nos esquemas das etapas 1 a 4 e o teste que reprova. As leituras externas ficam fora do Git (`referencias/estudos-externos/`). Junto, na skill 0.3.0 (PR #52): decisões 0042 a 0047. **Atenção:** o PR #54 (M3) falha no CI por dois arquivos da própria M3 (respostas gravadas do TAP da OEI, que estão num stash local, e um espaço irregular em `tests/pmo/pedido-externo.test.ts`).

**Correções da etapa 5 (decisão 0052), PR #57 em cima do #55:** partes dispensadas no mapa da etapa 5, busca do ausente do PMO na parte apontada e achado do código como candidato até o veredito do PMO. Com ele, o teste externo do TR municipal de contratação direta fica **encerrado** (etapas 1 a 5); o resumo e as pendências ficam fora do Git, em `referencias/estudos-externos/`. Os 77 vereditos da demonstração da etapa 5 foram escritos pelo Claude Code, a revisar pelo PMO.

**Ordem de revisão dos PRs (de baixo para cima na pilha):** #44 → #45 → #46 → #53 (M2) → #54 (M3) → #55 (squash) → #57; o #52 (skill 0.3.0) sai do #46 e é revisado à parte, recebendo a regra do veredito antes de publicar.

**Fase M2 (etapa 2 pelo método), PR aberto em cima do #46, aguarda o teste e o ok da responsável** (decisão 0038): a minuta redigida por inteiro na ordem do modelo do edital, preço pelo tipo de contrato, pontos por preço, caixa, quadro de equipe × produtividade e duração × vigência por código. Placar em `docs/estudos/placar-m2-etapa-2.md`: o esqueleto do código cobre todos os itens do gabarito que são do código (28 de 28 na SMPED, 31 de 31 na OEI); com a leitura gravada, 40 de 40 e a minuta redigida por inteiro (17 e 14 seções). **Skill 0.3.0 no PR #51 (rascunho), sem publicar antes do ok.**

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
| — | Métodos revisados, chave em arquivo, documentação, roteiro da etapa 5, decisão 0037 | PR #46 | — |
| M2 | Etapa 2 pelo método | PR aberto; teste da responsável pendente | v0.10.0 |
| M3 | Etapa 3 pelo método (contrato como entrada) | a fazer | v0.11.0 |
| M4 | Etapa 4 pelo método (adaptação por porte e tipo) | a fazer | v0.12.0 |
| M5 | Etapa 5 pelo método (régua pelo tipo de plano; fases restantes da 0033) | a fazer | v0.13.0 |
| Skill 0.3.0 | Tipos de projeto e de plano, etapa 1 no SKILL.md, etapa 5 como leitura principal, proposta de parceria, PC com gatilho e reajuste, contrato, caixa (decisão 0039) | PR #51 (rascunho), mostrado antes de publicar | — |
| MVP | Critérios de aceite da seção 14 | a fazer | v1.0.0 |

O que cada fase M ainda precisa cobrir está nas issues de cada uma (rótulos `etapa-2` a `etapa-5`).

## Decisões pendentes

- **Modelo padrão da API:** Opus 5.5 é provisório; a escolha sai da comparação (`npm run comparar-modelos`, decisões 0002 e 0025), que espera a chave.
- **Ordem de impacto dos pontos de atenção** (caixa > dependência do contratante > preço > prazo): julgamento da análise, a confirmar pela responsável (engenharia reversa, `09-pontos-de-atencao.md`).
- **Gravidade dos conflitos que envolvem mais de uma parte** do plano (etapa 5) e **gatilhos com número** como campos obrigatórios da etapa 4: a validar na M4 e na M5.

## Próximo passo

1. **Responsável pelo projeto** (combinado em 16/11/2026):
   - testar a demonstração e dar os oks em ordem: #44, #45, #46 e #53; o #52 (skill 0.3.0) depois de ler o diff da skill;
   - com a chave, no dia seguinte, nesta ordem: etapas 1 e 2 na prévia; o roteiro da etapa 5 com o plano real; a comparação de modelos;
   - conferir os 10 itens do gabarito separados em cada placar antes do merge da fase.
2. **Claude Code:** fase M3 (etapa 3 pelo método, contrato como entrada), em cima da M2.
3. **Histórico do Git:** a responsável decidiu não reescrever a `main` (16/11/2026). Os arquivos atuais e o site estão sem os detalhes do caso real.

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
