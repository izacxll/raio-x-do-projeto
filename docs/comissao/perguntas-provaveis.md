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

- **Custo estimado:** de US$ 11,37 a US$ 16,66 por projeto completo (5 etapas, com a segunda instância), ou de R$ 65 a R$ 96. Os números estão no [painel de métricas](painel-de-metricas.md), que é a fonte única deles; esta resposta só os resume.
  - **Como foi estimado:** com todos os pedidos dos dois casos do teste e o preço da API para o Opus 5.5. Não é fatura: o teste rodou pelo claude.ai.
  - **Câmbio:** PTAX de venda de 16/11/2026, R$ 5,7324, conferida no Banco Central em 19/11/2026.
  - **Cache:** o cache de 5 minutos que o app usava encarecia o projeto, porque os passos ficam a cerca de 10 minutos um do outro. O de 1 hora, em uso desde a decisão 0095, economiza de 10% a 12%.
  - **O que falta:** a medição com a fatura da API vem na próxima rodada do teste.
- **Economia:** depende das horas de PMO por projeto hoje, um número que vem da FGV. Para comparar: um projeto do teste passou por 13 passos do PMO e 12 revisões. Ao fim de cada etapa, o gerente recebe uma capa de decisão de uma página, o resultado em quadros e uma fila de pendências por impacto.

## Funciona fora destes dois casos?

Ainda não está provado, e é preciso dizer isso.
- **Hoje:** as regras vêm de 2 casos (uma licitação e uma contratação direta), com 206 lições.
  - **Cada lição da skill tem marca** (decisão 0094): 41 são regra geral, 16 são regra geral vista num caso só e 10 vieram de um caso só, a confirmar em outros TRs.
  - **Exemplos:** disfarçados.
  - **Regressão:** o gabarito na CI impede que uma regra nova estrague outra.
- **Para provar:** o [plano de validação](plano-de-validacao.md) roda de 5 a 10 TRs publicados, variados por modalidade, tipo, porte e campo. Ele mede cobertura, precisão, alarmes falsos, páginas, custo e tempo, e tem critério de pronto: cobertura de 80%, precisão de 70% e nenhum achado real perdido entre versões.
