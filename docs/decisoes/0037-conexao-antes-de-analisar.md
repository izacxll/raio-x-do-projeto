# 0037 — Nenhuma etapa analisa sem a conexão com o Claude

- **Data:** 16/11/2026
- **Status:** aceita; a demonstração como alternativa à conexão saiu com a decisão 0053
- **Quem decidiu:** responsável pelo projeto
- **Muda:** o item 5 da decisão 0035 ("sem chave, as etapas 1 e 5 mostram o esqueleto do código, com o aviso 'leitura parcial por código'")

## Contexto

Pela decisão 0035, o PMO lê e o código monta o esqueleto e confere. Sem a chave, as etapas 1 e 5 ainda mostravam o esqueleto sozinho, com o aviso "leitura parcial por código". Um esqueleto sem a leitura não é a saída que o método pede (leitura e decisão, não inventário), e mostrá-lo como resultado convida o gerente a usar a metade da análise.

## Decisão

1. **Nenhuma etapa analisa sem a conexão com o Claude.** Nas etapas 1 e 5, como já era nas etapas 2 a 4, a tela pede a conexão antes de "Analisar a RFP" e de "Conferir o plano". Sem a chave, as opções são conectar ou ver a demonstração.
2. **Sai o aviso "leitura parcial por código"**, e o esqueleto deixa de aparecer sozinho. "Analisar a RFP" monta o esqueleto e pede a leitura do PMO numa ação só; "Conferir o plano" roda a conferência por código e a leitura do PMO juntas. O resultado só aparece com a leitura, conferida pelo código.
3. **O código continua igual por dentro:** monta o esqueleto que vai no pedido e confere depois cada citação, número e requisito R (decisão 0035). Os testes e o placar do esqueleto continuam.
4. **A leitura dos PDFs continua no navegador.** O texto só vai à API quando o GP pede a análise, e a tela avisa antes, com o custo estimado.
5. **Demonstração em todas as etapas**, inclusive a 5: um plano de trabalho inventado sobre o edital público da OEI, com erros plantados (parcelas diferentes das do edital com frase de conformidade falsa, fases que somam mais meses que a vigência, sem registro de premissas, mudanças sem aditivo, produtos sem aceite, aprovação sem prazo e exclusões de outro tipo de projeto), e a resposta gravada do PMO (`tests/fixtures/gerados/leitura-oei/`).

## Consequências

- Dossiê de uma versão anterior com a análise da etapa 1 sem a leitura do PMO: as revisões e os requisitos R continuam, e a tela pede a leitura antes de mostrar a análise. Na etapa 5, o resultado guardado sem a leitura também espera a leitura.
- Os exportados da etapa 1 só saem depois da leitura. Se um dossiê sem ela chegar à exportação, o documento diz "sem a leitura do PMO".
- CLAUDE.md, README, guia do gerente, arquitetura e `docs/tecnico/` passam a dizer que toda etapa precisa da conexão (ou da demonstração).
- O roteiro da etapa 5 com um plano real (`docs/estudos/roteiro-etapa-5-plano-real.md`) roda sem a chave só para medir o código; com a chave, faz a leitura.
