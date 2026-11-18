# 0061 — Compromissos de método no TAP, numeração e faixas

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), na rodada 3 do teste externo, na etapa 3

## Contexto

No teste externo:

- o pedido do TAP listava, em "compromissos que este passo leva", só as exclusões e os limites, mas o placar cobrava destino também para os compromissos de método (sigilo, dados pessoais, revisão interna, régua);
- uma minuta tinha 4 compromissos de método e só 3 receberam número C: o protocolo de campo veio com a ficha do campo (PROP-METODOLOGIA.7), e o código só reconhecia as fichas PROP-METODOLOGIA.9 a .11;
- a minuta escrevia as faixas de C à mão ("limites C20 a C24"), e, pela numeração do app, parte dessa faixa era de compromissos de método;
- na autoconferência, "decisao_gp" sem motivo contava como marca incompleta, mas o pedido não dizia isso com todas as letras.

## Decisão

1. **Todo compromisso de método recebe C:** é compromisso de método o item com a ficha PROP-METODOLOGIA.9 a .11, o que começa por um número C dado pelo PMO ou o que começa por "Compromisso de método". A ficha PROP-METODOLOGIA.12 (quantidades do campo) não é compromisso.
2. **O pedido do TAP leva os compromissos de método**, com o destino esperado: descrição, entrega que ele protege ou aceite (TAP4.1, TAP4.2 ou TAP.9). O código procura o destino também na aprovação (TAP.9). Enquanto não há contrato, o compromisso é "prometido na proposta".
3. **A faixa de cada tipo é do código.**
   - O pedido do conteúdo diz a ordem da numeração (premissas, obrigações do contratante, exclusões, compromissos de método, limites de volume) e pede que o PMO não escreva faixas.
   - A minuta ganha o item "Compromissos numerados (faixas pelo código)".
   - Faixa escrita no texto do PMO com o tipo errado vira alerta nesse item.
4. **"decisao_gp" sempre com motivo:** a frase vai no pedido das quatro etapas com autoconferência. A regra da marca incompleta continua a mesma.

## Consequências

- Num dossiê já em andamento, o compromisso de método que passa a ser reconhecido muda os números dos limites de volume que vêm depois dele. A ordem da numeração não mudou, para não mexer nos outros números.
- **Alarmes nos testes (dados inventados):**
  - numeração: 1 compromisso que ficava sem número passa a ter;
  - faixas: 1 acerto e 0 alarme falso;
  - pedido do TAP: o destino do compromisso de método deixa de ser cobrado sem ter sido pedido;
  - decisao_gp: a regra não muda, então nenhum alarme a mais ou a menos.
