# 0078 — Aviso de régua corrigida que não chegou às partes geradas antes

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido de 18/11/2026; lição 204 da rodada 3)

## Contexto

No teste externo, o passo de cronograma da etapa 4 corrigiu a régua da duração ("os 8 meses da proposta são só referência, não teto"). A adaptação, gerada antes, continuou dizendo que os 8 meses eram "teto" (A17). Ninguém viu na etapa 4: só a leitura do PMO na etapa 5 pegou a divergência.

## Decisão

1. **O código procura, em todas as respostas dos passos da etapa 4, durações qualificadas** como "teto" (teto, limite, prazo máximo, não pode passar) ou como "referência" (referência, não é teto, indicativa), na mesma oração. Oração com as duas palavras é ambígua e não conta.
2. **Se a mesma duração tem uma classe no passo mais novo e outra num passo anterior, sai um aviso.** O aviso diz a parte e o item que ficaram para trás e sugere levar a nova régua para lá e salvar de novo a resposta daquele passo, ou rever o passo mais novo.
3. **É aviso, não achado.** O código compara palavras, e quem decide qual régua vale é o GP. Ele aparece na autoconferência da etapa 4 (tela) e no placar de cada passo da etapa 4 no teste externo.

## Consequências

- Calibrado nos dois casos do teste (fora do Git): 1 aviso no caso fiscal (a régua de 8 meses, A17 × cronograma, o caso da lição) e nenhum no caso de contratação direta.
- A skill PMO (decisão 0079) diz ao PMO que varra as partes geradas antes quando corrige uma régua.
- Revisão de código: a negação do teto ("não são mais teto", "deixam de ser teto", "não são um limite") conta como referência; "Termo de Referência", "data de referência" e afins não contam como régua; o passo "mais novo" é o de resposta salva por último (o passo refeito depois vale mais), e a posição do passo só desempata.
