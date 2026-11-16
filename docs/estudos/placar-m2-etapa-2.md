# Placar da fase M2 — etapa 2 pelo método

Feito em 16/11/2026 pelo teste `tests/etapas/metodo-etapa-2.test.ts`, que roda a cada `npm test`. Usa os editais públicos da SMPED (chamamento para termo de fomento, parceria, operação contínua) e da OEI (concorrência técnica e preço, licitação, consultoria por cinco produtos).

## O que este placar mede (e o que não mede)

**Os gabaritos e as leituras gravadas foram feitos pelo Claude Code, seguindo a skill PMO**, e não por uma pessoa nem por uma leitura independente. Por isso o placar mede duas coisas:

- **o esqueleto do código**, o que vai no pedido ao PMO, contra esses gabaritos;
- **as travas do código** sobre a leitura gravada e sobre erros plantados.

Ele **não mede a qualidade da redação do PMO de verdade**. Isso só se mede com a chave e com um gabarito feito pela responsável.

## Como se mede

- **Gabarito:** 40 itens por edital, nas seções do método (capa, estratégia, estrutura, escopo, premissas críticas, metas/equipe/cronograma, preço, matriz e checklist, decisões do GP). Cada item tem página, trecho literal e de 1 a 3 "chaves", e é marcado como **do código** ou **do PMO**. A minuta tem 17 seções na SMPED (os quadros do modelo) e 14 na OEI (partes a a n).
- **Antes:** o que a v0.8.3 dava na etapa 2. Na SMPED, o ponto de partida do código. Na OEI, o ponto de partida mais a resposta do PMO gravada naquela versão (`tests/fixtures/gerados/proposta-oei/antes-m2/`).
- **Depois, só o código:** a minuta pelo método sem nenhuma resposta do PMO. É o esqueleto que vai no pedido.
- **Depois, com a leitura gravada:** a minuta com as três respostas gravadas (abordagem B).
- **Item coberto:** algum item da saída tem a maioria das chaves do item do gabarito.
- **Item que não passa no teste do método:** item da saída que não casa com nenhum item do gabarito.

## Resultado

| | SMPED antes | SMPED, só o código | SMPED, com a gravada | OEI antes | OEI, só o código | OEI, com a gravada |
|---|---|---|---|---|---|---|
| Itens na saída | 59 | 24 | 60 | 108 | 26 | 58 |
| Não passam no teste do método | 30 | 1 | 3 | 30 | 0 | 3 |
| Gabarito coberto | 28 de 40 | 38 de 40 | 40 de 40 | 33 de 40 | 37 de 40 | 40 de 40 |
| Itens do gabarito que são do código | — | 28 de 28 | — | — | 31 de 31 | — |
| Seções da minuta redigidas | — | — | 17 de 17 | — | — | 14 de 14 |
| Números sem fonte e citações não conferidas | — | 0 | 0 | — | 0 | 0 |

**O que dizem os números:**

- **Antes:** a v0.8.3 cobria parte do gabarito com inventário (de 59 a 108 itens soltos), mas não tinha a minuta redigida nem as contas do método:
  - preço pelo tipo de contrato;
  - pontos por preço;
  - caixa por parcela;
  - quadro de equipe × produtividade;
  - duração × vigência.
- **Só o código:** cobre todos os itens do gabarito marcados como "do código", em 24 a 26 itens. Na SMPED, o único item que não passa é a PC1, que o código traz da etapa 1 e o gabarito não pede.
- **Com a leitura gravada:** a minuta sai redigida por inteiro nos dois editais. O código confere cada citação na página e cada número no trecho, sem nenhum aviso.

## As travas, com erros plantados (OEI)

O teste planta quatro erros na leitura gravada, e o código pega todos:

| Erro plantado | O que o código mostra |
|---|---|
| Uma seção que só descreve ("Nesta seção, apresentar…") | "só descrita" e o alerta de seções não redigidas |
| Um número sem fonte ("37 oficinas regionais") | "valor não conferido" |
| Uma citação inventada | "citação não conferida" |
| Uma premissa crítica que se aplica e foi tirada da minuta | alerta "a minuta do PMO não escreve esta premissa" |

## O que o código ainda não faz (fica para o PMO ou para as fases seguintes)

- **Ligar cada seção do modelo ao critério que ela alimenta.** É o PMO que diz, no campo "critério". O código só confere se algum critério de texto ficou sem seção.
- **Ler o quadro de equipe e os volumes da própria RFP.** Eles vêm da minuta do PMO, como sugestão. Os editais de teste não escrevem teto de produtividade, então a conferência só foi exercitada com texto de teste (`tests/regras/conferencias-m2.test.ts`).
- **Usar a curva de custo do GP no caixa.** Sem os valores do GP, o caixa usa a rampa de pessoas ou um custo igual em todos os meses, e a tela diz que é aproximação.

## Para a responsável conferir antes do merge (10 itens)

Cinco itens de cada gabarito, de seções diferentes (`tests/fixtures/gerados/proposta-smped/` e `proposta-oei/`, `gabarito-metodo-etapa-2.json`). Abra o PDF na página indicada (`tests/fixtures/rfps-publicas/`) e veja se o item está certo e se falta algo que pese. Um erro aqui quer dizer que o gabarito, e portanto o placar, precisa ser revisto.

| Edital | Item | O que o gabarito diz | Páginas |
|---|---|---|---|
| SMPED | ES-04 Pontos de documento | B (currículos comprovados, 5), C (três cotações por item, 3) e E (experiência comprovada da OSC, 5) somam 13 pontos que não se ganham escrevendo. | 4, 5, 7 |
| SMPED | EST-02 Critério de cada quadro | A em todo o plano; E e M no Quadro 03; D e I no 04; D e K no 05; G, H e I no 06; F no 07; D, J, M e H no 08; K nos Quadros 09 e 10; L no orçamento. | 4 |
| SMPED | SOW-03 O que fica com a SMPED | Liberar o repasse (prazo não informado — a definir pelo GP); publicar o extrato em até 30 dias da assinatura; definir os formulários de satisfação. | 20, 22, 24 |
| SMPED | PRC-03 Repasse e caixa | Parcela única integral (6.7.8 e 8.6) × repasse mês a mês pelo Quadro 11 (cláusula 2.3), com empenho proporcional. | 8, 17 |
| SMPED | PRE-02 PC6 — adesão do público | O público se inscreve e frequenta, e os parceiros apoiam a mobilização. Se a adesão faltar, a meta pode ser glosada; a proteção é o cumprimento parcial justificado. | 9, 20, 23 |
| OEI | ES-05 Pontos por preço | Pela fórmula do edital, com a maior nota técnica em 100: cada 1% a mais de preço custa cerca de 0,42 ponto técnico. | 38 |
| OEI | EST-02 Critério de cada seção | b) e m) → quesito 1; c) a k) → quesito 2; l) e n) → quesito 3. | 31 |
| OEI | SOW-02 Exclusões próprias do objeto | Impressão gráfica e distribuição física; escuta direta de crianças sem plano aprovado e aditivo; deslocamentos fora de Brasília (custeados pela contratante). | 21, 22 |
| OEI | PRC-04 Caixa | 55% do valor nos dois últimos produtos; até D+135 entram no máximo 45% (5, 25, 45, 70 e 100% acumulados), com a equipe trabalhando desde a assinatura. | 21 |
| OEI | PRE-01 PC3 — análise e aprovação no prazo | A contratante analisa cada produto em prazo combinado (a definir pelo GP), com quadro único de contribuições e rodadas limitadas. Se atrasar, a entrega seguinte atrasa. | 21, 47, 53 |

O conceito do projeto da SMPED (formação híbrida em acessibilidade) é uma sugestão da gravação. Em parceria, a FGV propõe o próprio projeto, e o enquadramento dela como organização da sociedade civil é decisão do GP.
