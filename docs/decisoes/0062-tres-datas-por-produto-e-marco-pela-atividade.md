# 0062 — Três datas por produto e marco conferido pela atividade da EAP

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), na rodada 3 do teste externo, na etapa 3

## Contexto

No teste externo, a conta da linha do tempo estava certa, mas os rótulos confundiam: a própria responsável leu errado.

- Na linha do tempo do TAP, a "entrega" de cada produto era o fim da atividade de ajuste, e não a primeira entrega; a "aprovação" era o fim da nova inspeção. Cada produto aparecia "aprovado" cerca de 6 dias úteis depois da "entrega", e a inspeção de até 10 dias úteis sumia da leitura.
- O texto dizia "sem a aprovação do cliente" e "a conta está sem ele" mesmo quando a rede já tinha as análises do contratante.
- O placar acusou divergência obrigatória num marco do contratante (autorização antes do campo), comparando-o com a entrega do produto final, quando a rede já punha a autorização antes do campo.

## Decisão

1. **Três datas por produto**, na linha do tempo (pedidos da EAP, do TAP e do cronograma) e nos marcos do TAP:
   - primeira entrega: o fim do que vem antes da primeira análise do contratante;
   - fim da inspeção: o fim dessa primeira análise;
   - termo definitivo (aprovação): o fim do ciclo de aceite (ajuste, nova análise, termo).
   A conta não muda.
2. **O texto diz de onde vem a aprovação:**
   - com o ciclo de aceite na EAP: "as análises do contratante já estão na conta";
   - sem ele: "aprovação sem data", quando o GP não informou o tempo de aprovação, ou a aprovação com o tempo do GP.
   O "sem a aprovação do cliente" sai quando a rede tem as análises.
3. **O marco do TAP é comparado com a atividade da EAP que ele representa** (pelas palavras do marco), e não com a entrega do produto.
   - "Antes de <evento>" sem data: a atividade do marco tem de terminar antes de a do evento começar, pela rede.
   - Sem a atividade do marco ou a do evento, o marco fica "não conferido pelo código", sem alarme.
   - Com data ou "dentro da vigência", vale a data da atividade do marco; sem ela, a do produto, como antes.

## Consequências

- **Alarmes nos testes (dados inventados):**
  - linha do tempo: 2 leituras enganosas a menos por produto (a "entrega" no fim do ajuste e o "a conta está sem ele");
  - marcos: 1 alarme falso evitado (a autorização antes do campo) e 0 alarme perdido (a rede que põe a autorização depois do campo continua divergência obrigatória);
  - o marco sem atividade na EAP passa a "não conferido", em vez de divergência.
- A troca do tempo de aprovação pelo prazo de inspeção do documento, quando o GP não o informa, ficou de fora: a conta da EAP já usa as durações de análise com a base no documento.
