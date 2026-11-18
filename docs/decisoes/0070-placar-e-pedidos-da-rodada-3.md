# 0070 — Placar e pedidos da rodada 3

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável (pedido do fechamento da rodada 3, itens 2 e 3e)

## Contexto

O teste externo da rodada 3 fechou a etapa 4 nos dois casos. Seis lições eram do código, e não da skill: o código dizia "cabe" para um marco cuja data já tinha passado; não avisava quando o encerramento (devolução e descarte de dados) vinha antes do último aceite; marcava como vago um trecho que só reproduzia o termo de referência; comparava as premissas novas com o registro inicial só pelo texto; deixava a regra das questões (QU-nn) no fim do pedido de execução, onde ela se perdia; e dava o A2.8 como ausente. Faltava também medir os tokens de cada pedido para comparar antes e depois dos cortes.

## Decisão

1. **Data fixa vencida = "não confirmável".** Com a data de hoje (a da tela ou da exportação), o marco fixo cuja janela começou antes de hoje sai como "não confirmável", e não como "cabe": a conta do código só mede o intervalo a partir do início informado. Se o início do documento já passou, ou se o caminho crítico passa por marco vencido, a vigência também fica "não confirmável". No TAP, o marco vencido vira divergência própria, separada da conta (lição 69). Sem a data de hoje (os testes com data fixa), nada muda.
2. **Encerramento antes do último aceite: aviso.** A atividade de encerramento, de devolução, guarda ou descarte de dados que começa antes do fim do último aceite (análise do contratante ou aprovação do cliente) recebe um aviso, pela conta do código. Encerramento da coleta ou do campo não conta.
3. **Vago que reproduz o documento não é do plano.** Se a expressão vaga, com as duas palavras vizinhas, está no texto do edital ou do TAP, a autoconferência e a etapa 5 não a marcam como vago do plano (já era assim para o trecho entre aspas).
4. **Premissa nova parecida com o registro inicial: aviso.** Além da regra por premissa crítica e origem, o placar aponta, como aviso, a premissa nova que tem a mesma premissa crítica (ou nenhuma nas duas) e metade ou mais das palavras-chave de uma linha do registro inicial, com pelo menos cinco em comum. O código compara palavras; o sentido é do PMO e do GP. Calibrado nos dois casos (1 aviso, plausível, nos dois registros finais).
5. **Regra das QU no topo do pedido de execução:** "um item por QU-nn, com o mesmo número, sem renumerar, sem juntar e sem resumir", com o número de questões, logo depois do cabeçalho.
6. **A2.8 era regra estreita, não falta.** Os dois planos diziam quem responde pelos requisitos e como relata o andamento, com palavras que os sinais da ficha não tinham. O código ganha os sinônimos "responde pelos requisitos", "andamento dos requisitos" e "relata o andamento".
7. **Tokens de cada pedido no placar e na conferência:** a primeira linha diz quantos tokens o pedido tinha (sistema, documentos e pedido), lidos do pedido exportado ao lado da resposta.

## Consequências

- Na cópia do caso de contratação direta, a autoconferência dos planos caiu de 3 achados para 1 (saíram os dois "em tempo hábil" do TR e o A2.8), e o cronograma passou a dizer "não confirmável" para o início e o evento já vencidos.
- `SituacaoPrazo` ganhou "nao-confirmavel"; a tela e os documentos usam um só nome para cada situação.
- Toda regra nova entrou com teste (`tests/etapas/rodada-3-placar.test.ts`).
