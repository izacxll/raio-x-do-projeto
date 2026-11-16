# Placar da fase M1 — etapa 1 pelo método

Feito em 16/11/2026 pelo teste `tests/etapas/metodo-etapa-1.test.ts` (roda a cada `npm test`), com os editais públicos da SMPED (chamamento para termo de fomento, parceria) e da OEI (concorrência técnica e preço, licitação). Hoje = 16/11/2026.

## Como se mede

- **Gabarito:** a leitura feita pelo PMO na estrutura do método, 50 itens nas seções 1 a 7 de cada edital (`tests/fixtures/gerados/rfp-smped/` e `rfp-oei/`, `gabarito-metodo-etapa-1.json`). Cada item tem página, trecho literal (todos achados pelo código na página) e de 1 a 3 "chaves", expressões que o item precisa ter.
- **Antes:** a análise da v0.8.3 (inventário), com os requisitos daquela versão.
- **Depois:** o esqueleto do código na estrutura nova, sem a leitura do PMO. É o que a tela mostra sem a chave, com o aviso "leitura parcial por código".
- **Item coberto:** algum item da saída tem a maioria das chaves do item do gabarito (2 de 3, 1 de 2). "Pleno": todas as chaves.
- **Item que passa no teste do método:** casa com algum item do gabarito. O que não casa é o que a saída mostra e o PMO não mostraria.
- **Número sem fonte:** número do texto de um item que não está no trecho, na tabela nem na página citada (contas do código ficam de fora: são conferidas pela regra que as fez).

## Resultado

| | SMPED antes | SMPED depois | OEI antes | OEI depois |
|---|---|---|---|---|
| Itens na tela | 122 | 40 cartões + 16 R | 183 | 39 cartões + 16 R |
| Passam no teste do método | 40 | 34 | 81 | 36 |
| Não passam | 82 | 6 | 102 | 3 |
| Gabarito coberto (maioria das chaves) | 15 de 50 | 28 de 50 | 30 de 50 | 35 de 50 |
| Gabarito coberto por inteiro | 5 | 12 | 9 | 20 |
| Números sem fonte | — | 0 | — | 0 |
| Citações da leitura não conferidas | — | 0 | — | 0 |

Cobertura por seção (itens do gabarito cobertos na seção certa):

| Seção | SMPED (gabarito / antes / depois) | OEI (gabarito / antes / depois) |
|---|---|---|
| 1. Em uma página | 9 / 5 / 5 | 8 / 6 / 5 |
| 2. O que fazer e entregar | 9 / 1 / 2 | 11 / 3 / 4 |
| 3. Prazos | 7 / 4 / 5 | 4 / 1 / 1 |
| 4. Dinheiro | 6 / 2 / 3 | 5 / 4 / 3 |
| 5. Julgamento | 4 / 0 / 3 | 6 / 4 / 5 |
| 6. Habilitação | 4 / 0 / 2 | 5 / 3 / 2 |
| 7. Pontos de atenção | 11 / 3 / 3 | 11 / 9 / 7 |

Na coluna "antes", a cobertura conta o item em qualquer seção (a v0.8.3 não tinha as seções do método).

## Com a leitura do PMO (gravada)

- A leitura gravada vem do próprio gabarito, então ela não mede a qualidade do PMO de verdade: isso só com a chave (decisão 0035).
- O que ela mede são as travas, endurecidas depois da revisão independente:
  - todo item do PMO é Sugestão, com a marca "citação conferida" quando o código acha o trecho na página;
  - o número vale só se estiver no trecho conferido, na cláusula em volta dele (até 400 caracteres de cada lado) ou no esqueleto da mesma seção; a página inteira não vale mais;
  - soma, acumulado, "sobram" e contas parecidas deixam o item "conta feita pelo PMO".
- Com a leitura gravada, a tela fica com 50 cartões + 16 R (SMPED) e 51 cartões + 16 R (OEI). As travas marcaram 13 e 16 itens: contas do próprio PMO (datas a partir de hoje, dias que sobram da vigência, percentuais acumulados) e números tirados de outra página sem citá-la. É o que se espera: o GP confere esses itens antes de aceitar.
- Erros plantados: citação inventada; número trocado (R$ 250.000); números pequenos e comuns ("45 dias", "12 parcelas de 8%", "7 profissionais e 3 produtos"); R que não existe (R99); conta do PMO ("faltam 413 dias", "somam 55% (25% + 30%)"); item "Do documento" sem fonte; item marcado "decisão do GP" pelo PMO. As travas pegaram todos, e nenhum item do PMO aparece como "Do documento" nem como "Decisão do GP".

## O que o esqueleto ainda não pega (fica para a leitura do PMO)

- Cruzar trechos distantes: na SMPED, a "parcela única" (6.7.8 e 8.6) contra o repasse mensal do Quadro 11 da minuta.
- Obrigações escritas no meio de uma frase sobre outro assunto (os formulários de satisfação da SMPED, 6.6).
- A ordem de impacto fina dos pontos de atenção e o "por que pesa" escrito para o caso.
- As datas que o documento não traz (a publicação do edital da SMPED): o código diz que são contadas de marcos sem data e pede para conferir.
