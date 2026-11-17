# 0059 — Segunda instância com o pedido do passo e limite de rodadas

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), na rodada 3 do teste externo, depois da etapa 1

## Contexto

Na etapa 1, a segunda instância não conseguiu conferir os números R, porque o esqueleto do código não ia no pedido dela. Ela também cobrou itens do método (chave de modalidade, prazos com armadilha, estudo sensível, art. 72) que o pedido da etapa 1 não pede: ele pede só as 8 seções.

Para seguir depois de corrigir uma resposta, o GP tinha de esperar um novo pedido da segunda instância e salvar de novo a resposta antiga dela. E não havia limite de rodadas.

## Decisão

1. **O pedido da segunda instância leva o pedido do passo conferido**, como foi ao PMO, com o esqueleto do código (números R e C, contas e datas) e a lista do que o passo exige.
2. **A régua é o pedido do passo, nem mais nem menos.** Item do método ou das fichas que o pedido não pediu não é falta. O número, o R, o C, a conta ou a data que não bate com o esqueleto é erro de fato.
3. **Rodadas por passo:**
   - cada conferência do passo é uma rodada: a rodada sobe quando a resposta do passo muda e fica a mesma quando a mesma resposta é conferida de novo;
   - a rodada fica no dossiê e aparece na tela, no `conferencia-*.md` e no PARADO.md do teste externo.
4. **Limite (teste externo):**
   - na rodada 1 com achado de gravidade alta, o GP corrige a resposta do passo (vem a rodada 2) ou segue;
   - da rodada 2 em diante, o vigia não exporta outra conferência sozinho. Ele espera a decisão do GP no `decisoes-do-gp.json`: `"seguir"` ou `"maisUmaRodada"`;
   - "mais uma rodada" só vale se o arquivo de decisões foi salvo depois da última conferência.
5. **"Seguir" vale para a resposta mais recente do passo:** com o passo em `"seguir"`, a resposta corrigida segue direto para o próximo passo, e o `conferencia-*.md` registra que o GP seguiu com os achados da rodada anterior.

## Consequências

- O pedido da segunda instância fica maior: leva o pedido do passo, com o esqueleto e, na etapa 4, as fichas das partes.
- Na tela, a conferência mostra a rodada. O limite de rodadas é do teste externo; no app, o GP decide se confere de novo.
- O vigia, reiniciado sem `--inicio`, importa a resposta salva enquanto estava parado.
