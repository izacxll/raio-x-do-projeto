# 0090 — Capa com o resumo da etapa e a leitura da etapa 5 no dossiê

- **Data:** 19/11/2026
- **Status:** aceita (pedido da responsável em 19/11/2026)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

Os prints do resultado no padrão da FGV (decisão 0089) mostraram dois pontos:
- na etapa 5, o bloco "43 de 44" quebrava em duas linhas;
- sobrava espaço vazio na capa, abaixo dos blocos.

Ao gerar o resultado da etapa 5 de novo, o dossiê salvo pelo vigia na pasta do caso não tinha a leitura do PMO. O resultado saía como se a etapa não tivesse sido feita. O import só passou a gravar a leitura no dossiê com a segunda instância leve (decisão 0077, #87). O vigia importou a etapa 5 dos dois casos antes disso, com o código anterior.

## Decisão

1. **Bloco da etapa 5:** as partes em ordem aparecem como "43/44", numa linha.
2. **Resumo da etapa:**
   - Abaixo dos blocos, a capa traz o resultado da etapa numa linha, montado por código. Ele diz o que a etapa entrega e quantas decisões do GP faltam, com o prazo. Exemplos:
     - "Minuta da proposta com 6 produtos em 131 dias úteis; 30 decisões do GP antes de enviar a proposta."
     - "Veredito sugerido pela regra fixa: apto com ressalvas, com 1 achado que se sustenta (0 graves); quem decide é o GP, antes de assinar o plano."
   - A mesma linha aparece na capa da tela.
3. **Leitura da etapa 5 no dossiê:**
   - A tela e o import do teste externo usam a mesma função (`comLeituraDaEtapa5`).
   - Um teste garante que o dossiê salvo e relido guarda a leitura e o plano ligado.
   - O gerador do resultado para com uma mensagem clara quando a resposta da etapa 5 está na pasta e o dossiê está sem a leitura. Antes, ele gerava um resultado vazio.

## Consequências

- Os dossiês da etapa 5 dos dois casos do teste externo continuam sem a leitura até a resposta ser importada de novo. A pasta `pedidos/` é do vigia e da responsável. O comando está na mensagem do gerador.
