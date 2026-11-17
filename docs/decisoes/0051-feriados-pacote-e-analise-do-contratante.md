# 0051 — Feriados no cronograma, pacote da EAP em cada atividade e a atividade de análise do contratante

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (16/11/2026), a partir do teste externo do TR municipal de contratação direta (estudo de impacto de evento)

## Contexto

No teste da etapa 4, três contas do cronograma ficaram frágeis:

- os dias úteis descontavam só sábados e domingos, e feriados nacionais caíam no caminho do último produto;
- a atividade ligava ao pacote da EAP só pelo nome ("EAP 1.3"), e o código não sabia dizer se todo pacote tinha atividade;
- a análise e o aceite do contratante vinham como atividade própria, marcada com `aprovacaoCliente`; com o tempo de aprovação do GP, o código somaria esse tempo por cima da própria análise.

## Decisão

1. **Feriados.** As contas do cronograma (etapas 2, 3 e 4) descontam os feriados nacionais e os municipais que o GP informa.
   - Nacionais, pela lei: 01/01, 21/04, 01/05, 07/09, 12/10, 02/11, 15/11, 20/11 (Lei 14.759/2023) e 25/12, mais a Sexta-feira Santa (móvel, pela Páscoa).
   - Carnaval e Corpus Christi são ponto facultativo e não entram: o GP os informa como municipais quando valerem no local.
   - Municipais: campo "Feriados municipais" ao lado do início previsto, nas etapas 2 e 4 (dd/mm/aaaa, separados por vírgula). Data ilegível é apontada.
   - As outras contas de dias úteis do app (prazos da etapa 1, cruzamentos) continuam só sem sábados e domingos, com o aviso para conferir feriados.
2. **Pacote obrigatório.** Cada atividade do cronograma da etapa 4 traz o `pacote` (código da EAP do passo de escopo, "2.1"). É obrigatório no pedido ao PMO e na importação. O código aponta atividade sem pacote, pacote que não existe, atividade num pacote de outro produto e pacote sem atividade. Dossiê antigo abre com o pacote vazio, que a conferência aponta.
3. **Análise do contratante.** Campo `analiseDoContratante` na atividade: ela é a própria análise e aceite do contratante. Com o tempo de aprovação do GP, o código troca a duração dela por esse tempo, e não soma por cima. `aprovacaoCliente` continua valendo para a entrega cujo produto o contratante aprova, sem atividade de análise própria: o código soma o tempo depois dela.

## Consequências

- No caso do teste, a janela do campo passa de 43 para 40 dias úteis (três feriados em dia de semana); a janela em dias corridos não muda.
- O pedido do cronograma da etapa 4 pede o pacote e explica os dois campos de aprovação; o pedido da EAP da etapa 2 explica os dois campos.
- Parte do plano cujo passo ainda não foi pedido ao PMO não é cobrada na autoconferência da etapa 4: fica "não conferido", sem achado.
