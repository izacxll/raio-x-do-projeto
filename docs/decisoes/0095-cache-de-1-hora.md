# 0095 — Cache de prompt de 1 hora no prefixo estável

- **Data:** 19/11/2026
- **Status:** aceita (bloco 5 do pente fino, pedido da responsável em 19/11/2026)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

O app já mandava a skill (sistema) e os documentos com cache de prompt, no tempo de vida padrão de 5 minutos. A responsável pediu:
- o cache de 1 hora no prefixo estável;
- a medição antes e depois, por projeto completo;
- o custo em reais no painel da comissão.

## Medição (os dois casos do teste externo; dados fora do Git)

O teste rodou pelo claude.ai, sem fatura. Por isso a medição foi uma simulação da cobrança da API:
- **Pedidos:** todos os do teste, os dos passos e os da segunda instância, inclusive as rodadas anteriores. Cada um entra com os tokens de sistema, documentos e pedido que o app registrou e na hora em que foi feito.
- **Saída:** pelo tamanho da resposta.
- **Cache:** o prefixo (sistema e documentos) é lido do cache quando o mesmo prefixo foi usado dentro do tempo de vida.
- **Preços do Opus 5.5:** entrada US$ 4, saída US$ 20, escrita 5 min US$ 5 (1,25 ×), escrita 1 h US$ 8 (2 ×) e leitura US$ 0,20 por milhão de tokens.

| Configuração | TR fiscal (31 pedidos) | TR de contratação direta (40 pedidos) |
|---|---|---|
| Sem cache | US$ 12,09 | US$ 15,16 |
| Cache de 5 minutos (antes) | US$ 12,66 | US$ 16,66 |
| Cache de 1 hora, sistema e documentos (agora) | US$ 11,37 | US$ 14,70 |
| Cache de 1 hora só no sistema | US$ 11,49 | US$ 14,55 |

- **O cache de 5 minutos encarecia o projeto.** O intervalo mediano entre pedidos foi de 9 a 10 minutos: só 7 e 11 intervalos ficaram dentro de 5 minutos, contra 25 e 31 dentro de 1 hora. O app pagava a escrita e quase nunca lia.
- **Com o cache de 1 hora,** o prefixo inteiro é lido do cache em 17 e 20 pedidos. O custo cai de 10% a 12% contra o app de antes.
- **Cache de 1 hora só no sistema:** a diferença fica em cerca de 1% nos dois casos. No TR de contratação direta, ele sai um pouco mais barato (US$ 14,55 contra US$ 14,70), porque há chamadas cujo bloco de documentos não se repete. Por isso, a rodada compacta da segunda instância, que manda só as páginas citadas, vai com os documentos sem cache (item 1 da decisão).

## Decisão

1. **Chamada:** o sistema (a skill e as referências da etapa) e os documentos vão com `cache_control: { type: "ephemeral", ttl: "1h" }`. O pedido do passo fica fora do cache. Na rodada compacta da segunda instância (decisão 0071), os documentos são só as páginas citadas, um prefixo que não se repete: eles vão sem cache, e o sistema continua com 1 hora.
2. **Uso:**
   - o app lê a escrita no cache por tempo de vida (`usage.cache_creation.ephemeral_1h_input_tokens`) e cobra a de 1 hora a 2 × a entrada;
   - o dossiê guarda a escrita de 1 hora de cada chamada (`escritaCache1h`, opcional: dossiê antigo continua abrindo);
   - a tabela de preços ganha a escrita de 1 hora e foi reconferida em 19/11/2026;
   - a estimativa antes de cada passo usa a escrita de 1 hora na primeira chamada e a leitura nas seguintes, até 1 hora depois.
3. **Painel da comissão:** o custo por projeto completo, sem cache, com o cache de 5 minutos e com o de 1 hora, em dólar e em reais. O câmbio é a PTAX de venda de 16/11/2026, R$ 5,7324, a conferir no dia.

## Consequências

- A medição com a fatura real fica para a próxima rodada do teste com a chave da API. A tela de cada etapa já mostra a escrita e a leitura do cache de cada chamada.
- A saída não tem cache: de 230 mil a 245 mil tokens por projeto, cerca de US$ 4,6 a US$ 4,9, entre um terço e dois quintos do custo.
- A tabela acima conta todos os documentos com cache. Com a rodada compacta sem cache nos documentos, o custo real fica um pouco abaixo dela.
