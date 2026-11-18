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
2. **A correção parte do que a tela mostra:** as do GP no dossiê; sem elas, a sugestão do código (`caracteristicasDoPgp`). O cabeçalho do pedido da etapa 4 mostra essas mesmas. A etapa 5 continua como a tela da conferência: as do GP ou o padrão conservador.
3. **O vigia reexporta o passo atual quando muda uma decisão que o pedido usa.** A regra está no Git (`scripts/decisoes-do-pedido.mjs`, com teste): a modalidade da etapa 2 em diante; porte, características e premissas críticas nas etapas 4 e 5; as partes a gerar na etapa 4. A segunda instância não usa nenhuma. A abordagem fica de fora, porque vale na importação da estratégia e não na exportação.

## Consequências

- No `decisoes-do-gp.json`, o GP grava `"caracteristicas": {"campo": false, "beneficiarios": false}` (ou o texto `"campo=não,beneficiarios=não"`).
- O vigia fica fora do Git. A versão que usa o módulo entra quando a pasta do teste for atualizada para a `main`, com a autorização da responsável.
- Mudar a abordagem depois de importar a estratégia continua pedindo que a resposta da estratégia seja salva de novo.
