# Pontos de atenção

## Erros encontrados e corrigidos durante a análise

| Erro | Como apareceu | Correção | Lição para o código |
|---|---|---|---|
| "Exclusões ausentes" contado como achado certo na primeira conferência | Busca por "exclusões" não achou a lista, que vinha como "temas e atividades que não estão incluídos" | O problema real era o conteúdo da lista (outro tipo de projeto), não a falta | Sinônimos de exclusão: "não estão incluídos", "não fazem parte", "não contempla"; depois, conferir se a lista tem relação com o objeto |
| Adaptação da etapa 4 dispensava durações, rede e calendários | Análise feita sem abrir "Quando dispensar" das fichas | Em porte grande, B8 não se dispensa; B16 e B13 recomendados; A12 fundida | A adaptação lê a seção "Quando dispensar" de cada ficha, por porte **e** tipo |
| Alerta de caixa no pico da etapa 2 exagerado | Comparação parcela a parcela sem o acumulado | Pelo acumulado, a folga fica positiva, diminui ao longo da execução e só zera no fim | Caixa é sempre acumulado, com a folga em cada parcela |
| Métodos escritos antes de abrir as fichas | Uso só de `checklist.md` e `licitacoes.md` | Revisão com `experiencia.md` e as fichas acrescentou 6 pontos na etapa 1 e itens nas etapas 2 a 4 | O PMO sempre carrega as referências da etapa (SKILL.md, seção 5) antes de analisar |

## Tensões com a especificação

| Tema | Especificação | Análise | Sugestão |
|---|---|---|---|
| Requisitos da etapa 1 | Cada exigência vira um R | Consolidar números do mesmo tema | Manter os R para cada obrigação, entrega ou meta (não para cada número) e consolidar só na apresentação |
| Entrada da etapa 3 | RFP + proposta | Contrato assinado mudou o resultado | Contrato como entrada opcional com prioridade |
| Preço da etapa 2 | Horas × valor-hora | Parceria com equipe se paga por parcela | Estrutura de preço pelo tipo de contrato; acrescentar à ficha `prop-preco` |
| Adaptação da etapa 4 | Por porte | Por porte e tipo | Tabela de adaptação com as duas dimensões |
| Régua da etapa 5 | 51 partes do PGP | Tipo de plano | Já na decisão 0033; estender à autoconferência da etapa 4 |

## A validar com a responsável pelo projeto
1. Ordem de impacto dos pontos de atenção na etapa 1.
2. Estrutura de preço para operação contínua (ficha `prop-preco`).
3. Regra de gravidade para conflitos entre partes (etapa 5).
4. Se a camada "tipo" vira um módulo comum às cinco etapas.
5. Se os gatilhos com número (dias, percentuais, folga) entram como campos obrigatórios da etapa 4, com valor do GP.
