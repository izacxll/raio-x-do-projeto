# 0081 — O cronograma do plano nos passos seguintes da etapa 4 e na segunda instância deles

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido de 18/11/2026)

## Contexto

No teste externo, a segunda instância do passo de planos apontou como erro uma atividade de encerramento que o passo de cronograma do plano tinha criado. O revisor só via a linha do tempo da proposta (a EAP da etapa 2). O pedido de planos não levava o cronograma do plano, e os de riscos e execução levavam só os nomes das atividades, sem as predecessoras. A segunda instância recebe o mesmo pedido do passo (decisão 0059).

## Decisão

1. **Os pedidos de riscos, planos e execução levam o cronograma do plano**, dito como "é este que vale, não o da proposta". Para cada atividade vão o id, o nome, o produto, o pacote, as predecessoras, a duração mais provável, se é a análise do contratante e a data fixa.
2. **A segunda instância desses passos vê o mesmo**, porque recebe o pedido do passo, e passa a conferir a rede do plano, e não a da proposta.

## Consequências

- No caso fiscal (cópia fora do Git), o pedido de planos subiu de ~76,9 para ~80,8 mil tokens, e o da segunda instância de planos de ~65,2 para ~70,8 mil. A rodada 2 compacta (decisão 0071) não muda, porque manda só o que mudou.
