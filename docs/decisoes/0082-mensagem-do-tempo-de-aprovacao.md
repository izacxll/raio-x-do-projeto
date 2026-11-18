# 0082 — A mensagem do tempo de aprovação do cliente

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido de 18/11/2026)

## Contexto

O placar do cronograma dizia "Tempo de aprovação do cliente não informado: o cronograma está sem ele" mesmo quando a análise do cliente já estava na EAP como atividade. Isso fazia parecer que a conta não tinha as análises.

## Decisão

A mensagem diz o que a conta tem e o que falta, como o código faz:
- **as análises do contratante que já são atividades da rede** estão na conta, com a duração estimada; o tempo de aprovação informado pelo GP, quando vier, **troca** essa duração (não soma);
- **depois das entregas marcadas "com aprovação do cliente"**, o tempo de aprovação é um **tempo extra** que a conta ainda não tem; com ele, o cronograma fica mais longo.

O título do placar da EAP diz o mesmo. A conta não muda.

Revisão de código: a análise com data fixa não entra na promessa de troca (a janela manda); "pode ficar mais longo" só se a entrega estiver no caminho crítico; o aviso da data fixa ("a conta está sem o tempo de aprovação") passa a valer só para entregas com aprovação depois, não para a análise que já é atividade; concordância por quantidade.
