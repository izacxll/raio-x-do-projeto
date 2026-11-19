# Revisor da segunda instância em outro modelo (bloco 4 do pente fino)

19/11/2026. A responsável pediu: "avalie um revisor em outro modelo nas etapas 4 e 5". Os dados ficam fora do Git. Aqui entram só as contagens.

## Como foi feito

- **Pedido:** o mesmo pedido da segunda instância que o teste externo exportou em dois passos da etapa 4: riscos, no caso do TR fiscal, e planos, no caso do TR de contratação direta.
- **Revisor:** o Claude Sonnet 5.5, como revisor independente. Ele não viu a conferência gravada nem as respostas da pasta.
- **Comparação:** com a conferência gravada do mesmo passo no teste externo.
- **Etapa 5:** sem pedido gravado da segunda instância nos dois casos, então não houve o que comparar.

## Resultado

| Passo (caso) | Gravada: achados (médios) | Sonnet 5.5: achados (médios) | Achados da gravada que o Sonnet também apontou |
|---|---|---|---|
| riscos (TR fiscal) | 6 (0) | 14 (4) | 4 de 6 |
| planos (TR de contratação direta) | 5 (2) | 17 (5) | 4 de 5 |

- **O que a gravada achou:** o Sonnet apontou 8 dos 11 achados.
- **Volume:** o Sonnet traz cerca de 2,5 a 3 vezes mais achados, e com mais achados de gravidade média.
- **Contradições:** alguns achados do Sonnet contradizem o que o código já conferiu no placar. Cada um precisaria de nova conferência pelo GP.
- **Preço:** o Sonnet 5.5 custa metade do Opus 5.5 na entrada e na saída. São US$ 2 e US$ 10 por milhão de tokens, contra US$ 4 e US$ 20.

## Leitura

- **Como revisor a mais, ao lado do de hoje:**
  - pega mais coisa;
  - também dá mais trabalho ao GP e traz mais falso alarme;
  - aperta o limite de 2 rodadas (decisão 0060).
- **No lugar do de hoje:**
  - nos achados médios, a cobertura foi parecida;
  - o custo cai pela metade;
  - a parte dos achados que contradizem o código pede antes uma calibração da rubrica.
- **Limite da amostra:** são dois passos de uma etapa, um pedido em cada. Não basta para decidir.

**Decisão pendente da responsável:** manter o revisor de hoje, trocá-lo pelo Sonnet 5.5 nas etapas 4 e 5, ou usar os dois só na etapa 4. A sugestão é rodar os dois em paralelo na próxima rodada do teste, em mais passos, e decidir depois.
