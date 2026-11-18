# 0071 — Segunda instância mais barata e igual nas duas pontas

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável (pedido do fechamento da rodada 3, itens 3a a 3c e 4)

## Contexto

No teste externo da rodada 3, cada revisor da segunda instância relia de 230 a 320 mil caracteres por rodada, inclusive na rodada 2, que só precisa ver se os achados da rodada 1 foram resolvidos. A responsável ficou sem tokens. Além disso, o app não mandava ao revisor da rodada 2 os achados da rodada 1, que no teste externo iam à mão: o teste só vale como calibração se as duas pontas forem iguais.

## Decisão

1. **Rodada 2 em diante, pedido compacto.** Vão os achados da rodada anterior, o que ela conferiu e passou, só os itens da resposta que mudaram (antes e depois, pelo id de cada item) e só as páginas dos documentos citadas nesses achados e itens. O texto de sistema (a skill da etapa) continua. O revisor diz se cada achado foi resolvido, procura erro novo só no que mudou e não reconfere o resto. Vale quando a resposta mudou e a conferência anterior guardou a resposta que leu (campo `conferiu` no dossiê); nas premissas, também é preciso que o TAP revisado seja o mesmo. Sem isso, vai o pedido completo, agora com os achados da rodada anterior.
2. **O GP pode pedir tudo de novo:** "conferir a resposta inteira" no app; `--completa` na exportação.
3. **Rodada 1 só com achados baixos (ou nenhum): seguir com a correção, sem rodada 2**, por padrão. O GP pede a rodada 2 mesmo assim com `"rodada2ComBaixos": true` (ou a lista dos passos) nas decisões do GP. No app, a tela sugere seguir.
4. **Modelo mais barato na rodada 2, como opção do GP.** No app, a tela da rodada seguinte oferece o modelo da etapa ou o Claude Sonnet 5.5 (o único outro modelo com preço na tabela). No teste externo, `"modeloRodada2"` nas decisões do GP vira `--modelo-segunda` e uma linha no cabeçalho do pedido; quem lança o revisor usa esse modelo.
5. **Paridade:** app e teste externo montam o pedido pela mesma função (`montarPedidoDaSegunda`). A tabela de `docs/papeis.md` mostra o que cada ponta faz.

## Consequências

- Medido numa cópia do caso fiscal (fora do Git), com 3 itens corrigidos depois da rodada anterior: o pedido da segunda instância da execução caiu de ~55 mil para ~15 mil tokens (−72%); 7 páginas citadas.
- O dossiê cresce com a resposta conferida de cada passo (a mesma que já está nele, uma vez a mais).
- Conferência antiga, sem `conferiu`, continua valendo; a rodada seguinte dela vai completa.
- A conferência do conteúdo do pedido aceita a rodada compacta (achados anteriores e diff, com as páginas citadas, que podem ser zero).
- Os tokens de cada pedido ficam no placar e na conferência (decisão 0070), para comparar antes e depois.
