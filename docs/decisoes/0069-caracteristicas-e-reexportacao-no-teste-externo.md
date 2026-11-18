# 0069 — Características e reexportação no teste externo

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026)

## Contexto

No teste externo (lição 109 da rodada 3), dois problemas na etapa 4:

1. **As características do caso fiscal vieram erradas** (com campo, com beneficiários), e o GP não tinha como corrigi-las. A exportação só aceitava `--porte` e, ao recebê-lo, partia do padrão conservador, e não da sugestão do código que a tela da etapa 4 mostra. Na tela, o GP corrige todas.
2. **Uma decisão do GP salva depois da exportação não mudava o pedido já exportado.** Com o porte decidido depois, o pedido seguia com o porte antigo.

## Decisão

1. **`--caracteristicas "campo=não,beneficiarios=não"`** na exportação das etapas 4 e 5, com os valores da tela (`VALORES_CARACTERISTICAS`, no domínio; chave e valor sem acento também valem; chave ou valor fora da lista é erro). As características ficam no dossiê, como o porte.
2. **A correção parte do que a tela mostra.** Na etapa 4, cada exportação com porte ou características refaz a base com a sugestão do código daquele momento (`caracteristicasDoPgp`, que muda depois da adaptação) e aplica as correções do GP por cima. Na etapa 5, a base são as do dossiê ou o padrão conservador, como na tela da conferência. Só `--pcs` não mexe nas características. Sem nenhuma decisão, o cabeçalho do pedido da etapa 4 mostra a sugestão do código, com o aviso.
3. **O vigia reexporta o passo atual quando muda uma decisão que o pedido usa.** A regra está no Git (`scripts/decisoes-do-pedido.mjs`, com teste): a modalidade em todas as etapas (na 1, quando o documento não a diz); porte, características e premissas críticas nas etapas 4 e 5. A segunda instância não usa nenhuma. A mesma decisão escrita de outro jeito (objeto ou texto, outra ordem, com ou sem acento) não conta como mudança. A abordagem e as partes a gerar ficam de fora, porque valem na importação (da estratégia e da adaptação), e não na exportação.

## Consequências

- No `decisoes-do-gp.json`, o GP grava `"caracteristicas": {"campo": false, "beneficiarios": false}` (ou o texto `"campo=não,beneficiarios=não"`).
- Como a base é refeita a cada exportação, `--porte` e `--caracteristicas` vão sempre juntos na linha de comando. O vigia já passa as duas do `decisoes-do-gp.json`.
- O vigia fica fora do Git. A versão que usa o módulo entra quando a pasta do teste for atualizada para a `main`, com a autorização da responsável.
- Mudar a abordagem depois de importar a estratégia, ou as partes depois de importar a adaptação, continua pedindo que a resposta daquele passo seja salva de novo.
