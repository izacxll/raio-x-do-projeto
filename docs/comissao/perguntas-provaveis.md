# Perguntas prováveis da comissão

Respostas curtas, com os números do teste ([painel de métricas](painel-de-metricas.md)).

## Como sabem que a IA não inventa?

Porque o código confere o que a IA escreve, e nada do que ela escreve vira fato sem essa conferência.
- **Citação:** todo item "do documento" traz página e trecho literal. O código procura o trecho na página; o que não acha sai "citação não conferida" e não vale como fato. No teste, foram 1.179 citações, 1 não achada e 9 fracas.
- **Números e prazos:** o código procura no documento cada número da resposta. O que não acha sai "valor não conferido".
- **Contas:** datas, caminho crítico, horas, preço e caixa são do código, nunca do modelo.
- **Rótulos:** tudo o que o PMO escreve é sugestão. O que só o gerente decide (valor-hora, participar ou não, nomes) fica "a definir pelo GP".
- **Segunda instância:** um revisor que não viu o raciocínio confere cada passo por rubrica fixa, em até 2 rodadas. No teste, ela apontou 187 achados na última rodada, 14 deles altos, e nenhum alto seguiu sem correção ou sem o "seguir" do GP.
- **O gerente decide no fim.** Os documentos saem como minuta até ele revisar tudo.

## Quanto custa e quanto economiza?

- **Custo medido:** cerca de US$ 10 por projeto completo (5 etapas, com a segunda instância), pelo tamanho dos pedidos do teste e o preço da API para o Opus 5.5. Isso dá cerca de R$ 55 ao câmbio de exemplo de R$ 5,50. É um piso: as rodadas refeitas não entraram. O cache de prompt, que o app já usa, deve baixar a entrada dos passos seguintes; a medição com a API real é o próximo passo.
- **Economia:** depende das horas de PMO por projeto hoje, um número que vem da FGV. Para comparar: um projeto do teste passou por 13 passos do PMO e 12 revisões. Ao fim de cada etapa, o gerente recebe uma capa de decisão de uma página, o resultado em quadros e uma fila de pendências por impacto.

## Funciona fora destes dois casos?

Ainda não está provado, e é preciso dizer isso.
- **Hoje:** as regras vêm de 2 casos (uma licitação e uma contratação direta), com 206 lições. Cada lição virou regra geral, com exemplo disfarçado, e o gabarito de regressão na CI impede que uma regra nova estrague outra.
- **Para provar:** o [plano de validação](plano-de-validacao.md) roda de 5 a 10 TRs publicados, variados por modalidade, tipo, porte e campo. Ele mede cobertura, precisão, alarmes falsos, páginas, custo e tempo, e tem critério de pronto: cobertura de 80%, precisão de 70% e nenhum achado real perdido entre versões.
