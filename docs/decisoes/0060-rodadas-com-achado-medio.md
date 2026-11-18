# 0060 — Rodadas da segunda instância com achado médio

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), na rodada 3 do teste externo, na etapa 3

## Contexto

Quando a segunda instância passava sem achado alto, o vigia já exportava o próximo passo. Se o GP corrigia depois os achados médios, a reentrega abria outra conferência: um passo chegou a 4 rodadas só por mudanças de texto, e o pedido seguinte saiu com a versão antiga.

## Decisão

1. **Achado médio também espera o GP.** Com achado alto ou médio na rodada, o vigia não exporta o próximo passo sem a decisão do GP: "corrigir" ou "seguir". Só achados baixos não param.
2. **Rodada 1:** a resposta corrigida vai a uma nova conferência (rodada 2). Com "seguir", a resposta salva segue para o próximo passo.
3. **Da rodada 2 em diante, a reentrega não abre rodada nova.**
   - Com o passo em "seguir" ou "corrigir", a resposta corrigida segue direto para o próximo passo, que é reexportado com a versão nova.
   - O `conferencia-*.md` registra "GP seguiu com correção".
   - Sem decisão e com achado pendente, o vigia para. "maisUmaRodada" continua abrindo outra rodada, se o arquivo de decisões foi salvo depois da última conferência (decisão 0059).
4. **A regra fica no Git, com teste** (`scripts/rodadas-da-segunda-instancia.mjs`). O vigia, que fica fora do Git, só a chama.
5. **O resumo do `conferencia-*.md` conta os médios:** "Achados: N (alta: X, média: Y)".

## Consequências

- Um passo tem no máximo 2 rodadas sem uma decisão explícita do GP.
- No caso do teste, as 4 reentregas só com achados médios teriam dado 2 rodadas: as rodadas 3 e 4 não acontecem (2 alarmes falsos a menos). A mudança não cria alarme: achado alto sem decisão continua parando.
