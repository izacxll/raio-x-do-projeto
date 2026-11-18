# 0067 — Revisores em paralelo e lista de R

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026)

## Contexto

No teste externo, com dois revisores ao mesmo tempo, um teve o arquivo temporário sobrescrito pelo do outro caso. Em outro passo, dois revisores divergiram sobre um número R que não estava na lista do pedido: um cobrou como falta, o outro aceitou como observação.

## Decisão

Na skill de revisão por segunda instância:

1. **Seção 2 (rubrica):** R e C só os da lista que o pedido traz. Um R fora dela (descartado ou inexistente) não é cobrado como falta nem como erro de número; na resposta, ele vira restrição ou observação.
2. **Seção 3 (lançar o agente):** revisores em paralelo gravam os temporários numa pasta de trabalho própria, com o nome do caso. Só o JSON de saída vai para o caminho exato do caso.

## Consequências

- A regra do R aplica aos números a mesma régua da decisão 0059 (o pedido do passo, nem mais nem menos).
- O pedido da segunda instância no app não muda: ele já leva a lista de R e C do esqueleto.
