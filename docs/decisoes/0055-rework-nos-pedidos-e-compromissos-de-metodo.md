# 0055 — Rework nos pedidos e compromissos de método numerados

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), a partir do teste externo pelas etapas 1 a 4 (um TR de diagnóstico fiscal e um TR de contratação direta)

## Contexto

O teste fiel ao app parou na etapa 4. A tabela da seção 5 da SKILL.md manda levar os artigos do `rework.md` citados nas fichas, e o pedido não levava nenhum. Nas etapas 2 e 3 o buraco era o mesmo (10 de 25 e 8 de 8 artigos sem resumo), e a conferência do pedido dizia "nada faltando".

Os números C também não batiam. O código numerava só premissas, obrigações, exclusões e limites. O PMO numerou também os compromissos de método (sigilo, revisão interna, régua metodológica) e escreveu esses números na minuta. Os mesmos números ficaram com significados diferentes, e os compromissos de método não chegavam ao TAP.

## Decisão

1. **Rework nos pedidos:**
   - Cada etapa que leva fichas leva também os temas do `rework.md` que resumem os artigos citados nelas.
   - Na etapa 2, além da seção 4, vão os temas dos artigos que ela não cobre.
   - Na etapa 3, os temas citados nas fichas do TAP, do registro de premissas e do de partes interessadas.
   - Na etapa 4, os temas citados em todas as fichas do PGP, no texto de sistema, para o prefixo ficar no cache.
   - A conferência do pedido marca FALTA quando algum artigo citado vai sem o resumo.
2. **Compromissos de método também são C:** os itens da minuta com ficha PROP-METODOLOGIA.9 a .11, ou que o PMO numerou ("C20 — Sigilo: …").
   - O número que o PMO escreveu no começo do item vale.
   - Os outros recebem os números livres, na ordem: premissas, obrigações, exclusões, método e limites.
   - No TAP, o compromisso de método não tem lugar fixo: vale o texto parecido em qualquer parte.
3. **Método das etapas 2 a 5 no pedido:** como manda a tabela da seção 5, só o pedido da etapa 1 leva o método. Nas outras etapas, o método está na seção da etapa na SKILL.md, que vai no texto de sistema.
