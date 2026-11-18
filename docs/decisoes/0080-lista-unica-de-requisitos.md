# 0080 — Uma lista de R só, do início ao fim

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido de 18/11/2026), com a causa apurada pelo Claude Code

## Contexto

No caso fiscal do teste externo, a proposta falava em 14 requisitos, e a lista que ia em alguns pedidos tinha 12: R13 e R14 apareciam em uns passos e sumiam em outros. A conferência do TAP chegou a dizer que R13 e R14 "não estão na lista da etapa 1 (descartados pelo GP ou inexistentes)".

**Causa:** nenhum R foi descartado. Os 14 estão no dossiê da etapa 1, mas o ponto de partida da etapa 2 dividia a lista em duas, as entregas (12) e as obrigações (R13 e R14, do tipo "obrigação", decisão 0054). A minuta usava as duas. A conferência do TAP, as divergências, os pedidos do TAP e do PGP, a rastreabilidade e a autoconferência da etapa 4 usavam só a primeira, como se fosse a lista inteira.

## Decisão

1. **O ponto de partida ganha `listaDeR`:** todos os R válidos da etapa 1 (entregas e obrigações), na ordem do número. Ela é a régua de "R da lista" em todos os pedidos e conferências. Os filtros por tipo (produto, equipe) continuam onde são por tipo.
2. **O pedido diz quais R o GP descartou na etapa 1:** "não são R; se o documento os traz, entram como restrição ou observação". Assim ninguém os trata como R nem como inexistentes.
3. **Na conferência do TAP,** a entrega tem de estar nos requisitos de alto nível (TAP.3). A obrigação basta estar em qualquer item do TAP (limite, premissa ou requisito), porque costuma ir para os limites. A mensagem separa uma da outra.

## Consequências

- Na cópia do caso fiscal (fora do Git), o pedido do escopo passou a listar R13 e R14, e o falso "descartado" sumiu da conferência do TAP.
- As respostas gravadas da OEI, anteriores a esta decisão, não citam as obrigações em nenhum item do TAP. A conferência agora aponta isso, e os testes foram ajustados ao comportamento novo.
