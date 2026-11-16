# 0046 — Cruzamentos obrigatórios nas etapas 1 e 5

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido de 16/11/2026); Claude Code (a redação)

## Contexto

Os erros mais graves dos dois testes estavam em trechos distantes que se contradizem:

- na SMPED: "parcela única" (itens 6.7.8 e 8.6) × quadro de desembolso mês a mês e cláusula da minuta × empenho proporcional (item 8.2);
- no TR municipal de contratação direta: vigência × fim do evento; dois e-mails diferentes para a mesma finalidade.

A leitura achou alguns por acaso e deixou outros passar.

## Decisão

1. **Lista fixa de cruzamentos** que a leitura sempre faz e registra, cada um como `feito` (com o resultado: confere, diverge, ou o que ficou em aberto) ou `nao_se_aplica` (com o motivo):

   | # | Cruzamento | Quem faz a conta |
   |---|---|---|
   | X1 | Forma e condição de pagamento em todos os lugares em que aparecem | PMO lê; código lista as ocorrências |
   | X2 | Data de início × vigência × marcos fixos | código (datas); PMO (qual vale para quê) |
   | X3 | Quem executa × vedações (subcontratação, profissionais da inexigibilidade) | PMO |
   | X4 | Contatos e canais repetidos (e-mails, endereços, setores) | código lista; PMO diz se diverge |
   | X5 | Valor global × soma das parcelas | código |
   | X6 | Prazos de um mesmo marco em itens diferentes | código lista; PMO compara |

2. **Na etapa 1**, a lista vale para a RFP. **Na etapa 5**, vale entre o plano e o contrato, o TAP e a RFP.
3. Um cruzamento que diverge vira item da seção 7 (etapa 1) ou achado `conflituoso` (etapa 5).
4. O registro dos cruzamentos entra na autoconferência da etapa (decisão 0044).

## Consequências

- `SKILL.md` (etapas 1 e 5); métodos das etapas 1 e 5.
- Código: o esqueleto da etapa 1 passa a levar X4, X5 e as ocorrências de X1 e X6; o schema, o campo `cruzamentos` (decisão 0048).
