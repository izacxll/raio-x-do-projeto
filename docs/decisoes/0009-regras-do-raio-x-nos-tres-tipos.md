# 0009 — Regras do Raio-X traduzidas em vago, conflituoso e ausente

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto, a partir da proposta do plano (com um ajuste dela: CE15 em vago)

## Contexto

Na etapa 5, todo achado é de um de três tipos, e só destes:

- **Vago:** está escrito, mas não dá para conferir (falta prazo, número, responsável ou critério, ou o trecho admite mais de uma leitura).
- **Conflituoso:** dois trechos dizem coisas diferentes, dentro do PGP ou entre o PGP, o TAP e a RFP.
- **Ausente:** a RFP, o TAP ou o próprio PGP exige, e não está no plano.

As regras sem IA do Raio-X do Plano de Trabalho usam a taxonomia V29. A taxonomia e as regras originais não mudam; aqui se define só como o resultado de cada regra aparece na etapa 5. A gravidade continua sendo a da parte do PGP.

## Decisão

| Regra do Raio-X | Tipo | Observação |
|---|---|---|
| Escopo × lista de exclusões | Conflituoso | Dentro do PGP |
| Termos de outro tipo de contrato na lista de exclusões | Conflituoso | A parte diz o que o resto do documento não diz |
| Texto de outro documento ("neste Termo de Referência") | Conflituoso | |
| CTR4 · prazo contado de obrigação do contratante | Vago | Não diz o que acontece se o contratante não cumprir |
| CTR5 · aprovação sem prazo | Vago | |
| CP13 · dependência sem prazo | Vago | |
| CP11 · teto por pessoa por dia × volume | Conflituoso | A conta não fecha |
| CE15 · data fixa dentro de prazo com início móvel | **Vago** | Sem a data de início, não dá para conferir se a data fixa cabe |
| CTR2 · vedação de subcontratação (RFP) × atividade de campo (PGP) | Conflituoso | Entre documentos |
| CTR2-multa · prazo tratado como estimativa × multa | Conflituoso | |
| CP9-datas · mesmo marco com datas diferentes (PGP × RFP ou TAP) | Conflituoso | |
| CP11-campo · atividade de campo sem linha nas estimativas de custo | Ausente | Conta na parte B6 (estimativas de custos) |
| TB23 · meta que depende de terceiros sem contingência | Ausente | Contingência no plano de riscos (A8) |
| CE17 · período de execução × data de eleição | Ausente, **só se** o registro e o plano de riscos não mencionarem eleição ou troca de gestão | Extensão: no Raio-X a regra só mostrava as datas |
| Valores com extenso divergente; contas que não fecham | Conflituoso | Dentro do documento |

## Consequências

- Cada regra mantém os três estados do Raio-X: achado; não localizado pelo código (conferir no documento); não verificável (página sem texto legível).
- Cada regra tem um caso de teste que acha e outro que não acha.
- Regra nova vinda da prova de conceito entra por nova decisão ou por atualização desta.
