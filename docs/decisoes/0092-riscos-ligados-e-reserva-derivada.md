# 0092 — Cada risco liga resposta, reserva e marco; a contingência deriva dos riscos

- **Data:** 19/11/2026
- **Status:** aceita (bloco 3 do pente fino, pedido da responsável em 19/11/2026)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

O registro de riscos (B27) já trazia resposta, gatilho, responsável e a marca "pede reserva". Faltavam duas coisas:
- **Marco:** nada dizia qual entrega cada risco ameaça.
- **Contingência:** a reserva de contingência era um valor único do GP, sem ligação com os riscos que a pedem.

Nos dois casos do teste externo havia 20 e 22 riscos, 12 e 13 de impacto alto e 6 que pedem reserva em cada um. Nenhum tinha marco, e a contingência não estava informada.

## Decisão

1. **Marco do risco:**
   - Cada risco do B27 ganha o campo `marco`: o produto (P1…) cujo marco ele ameaça, da lista do cronograma do plano, ou vazio quando o risco é do projeto todo.
   - O PMO preenche, e o código confere se o produto existe no cronograma. Quando não existe, fica "P9 (não localizado no cronograma)".
   - A resposta gravada antes, sem o campo, continua válida, com o marco vazio.
2. **Reserva por risco:**
   - O GP dá o valor da reserva de cada risco que pede reserva (`reservasPorRisco`). O valor é Decisão do GP; o PMO não escreve valor.
   - A reserva fica guardada com o texto do risco. Se o passo de riscos for refeito e o mesmo id vier com outro risco, o valor não passa para ele: a reserva precisa ser dada de novo, e o plano avisa.
   - Id repetido conta uma vez só e é avisado.
3. **Contingência derivada:**
   - **Regra:** a reserva de contingência do plano é a soma das reservas dos riscos marcados, pela conta do código.
   - **Falta o valor de algum risco marcado:** a contingência fica a definir, com os riscos que faltam. A linha de base não fecha.
   - **Nenhum risco pede reserva:** a contingência é zero.
   - **Dossiê antigo, só com o valor único:** ele vale enquanto nenhum risco tiver valor próprio, e o plano diz que ainda não foi dado risco a risco. A tela mostra esse valor, com um botão para apagá-lo. Se nenhum risco pedir reserva, ele não entra, e o plano avisa.
4. **No plano e na tela:**
   - o B27 traz as colunas Reserva (o valor, "a definir pelo GP" ou "não pede") e Marco;
   - a tabela de custos (A15) mostra cada risco com a reserva e o marco, e a soma;
   - a tela tem um campo de reserva por risco;
   - o marco aparece conferido em todo lugar (B27, A15, tela, capa e pedidos seguintes): "P9 (não localizado no cronograma)" ou "do projeto todo";
   - a capa da etapa 4 mostra o marco e o valor da reserva nos 5 riscos principais e alerta o risco de impacto alto ligado a um marco que não está no cronograma. O risco do projeto todo (marco vazio, como o pedido permite) não é alertado.
5. **No pedido do passo de riscos:**
   - pede o marco de cada risco;
   - diz, para qualquer parte que cubra o A4 (própria ou fundida), que a contingência é a soma das reservas, pela conta do código, sem valor escrito. Numa parceria, a contingência é margem de prazo e remanejamento (ficha A4);
   - nos passos seguintes, a lista dos riscos traz a resposta, a reserva e o marco.

## Medição (os dois casos do teste externo, respostas já gravadas; fora do Git)

| Caso | Riscos | Impacto alto | Pedem reserva | Com marco (antes) | Contingência (antes) |
|---|---|---|---|---|---|
| TR fiscal | 20 | 12 | 6 | 0 | não informada |
| Contratação direta | 22 | 13 | 6 | 0 | não informada |

**Depois, com as respostas já gravadas:**
- os riscos aparecem "do projeto todo", porque o campo do marco não existia;
- a tabela de custos lista os 6 riscos que pedem reserva, cada um "a definir pelo GP";
- a contingência fica a definir até o GP dar os 6 valores.

O marco preenchido vem da próxima rodada do PMO com o pedido novo.

## Consequências

- O valor global da contingência fica no esquema só para o dossiê antigo.
- A skill (`etapas/etapa-4.md`) não muda neste PR, e a regra vai no pedido. Mudança na skill espera a aprovação da responsável.
