# Plano de validação

Hoje as regras vêm de 2 casos. Este plano diz como mostrar que o Raio-X funciona fora deles, com que medidas e quando dar por pronto.

## Os casos

De 5 a 10 TRs publicados oficialmente (nada privado entra no Git; decisão 0020), escolhidos para cobrir a variedade:

| Eixo | Cobertura mínima |
|---|---|
| Modalidade | licitação (pelo menos 2), contratação direta (pelo menos 2) e parceria (pelo menos 1) |
| Tipo de projeto | consultoria por produtos, operação contínua e híbrido |
| Porte | pequeno (até ~6 meses), médio e grande |
| Campo | com pesquisa de campo e sem campo |
| Qualidade do documento | um TR completo e um com lacunas (sem prazo, sem valor ou com datas vencidas) |
| Leitura | pelo menos um PDF escaneado (OCR) |

Cada caso roda as 5 etapas, na mesma ordem do teste externo, com a segunda instância em cada passo, no máximo 2 rodadas e o "seguir" do GP.

## O que se mede em cada caso

| Métrica | Como | Meta para dar por pronto |
|---|---|---|
| Citações não achadas na página | placar do código | até 1% das citações |
| Rótulo errado ("documento" com sugestão) | segunda instância e gabarito | queda de versão para versão; nenhum alto |
| Achados reais que somem entre versões | gabarito de regressão (casos disfarçados na CI; casos reais fora do Git) | nenhum |
| Alarme falso de cada trava do código | gabarito: trava que dispara × achado que se sustenta | trava com mais alarme falso que acerto vira aviso |
| Achado alto da segunda instância que o código não pegou | conferência de cada passo | cada um vira regra proposta (CLAUDE.md, seção 2) |
| Páginas antes do anexo | Word gerado | etapa 4 em até ~20 páginas no porte pequeno |
| Tokens e custo por projeto | uso real da API (com cache) | número por porte, para comparar com as horas de PMO |
| Tempo do gerente por etapa | registro do GP | número por etapa |

Os números entram no [painel de métricas](painel-de-metricas.md), uma linha por versão da skill.

## O gabarito de cada caso

Para cada caso, o PMO da FGV (ou a responsável) marca, sem ver a saída do app, os pontos que um bom PMO não pode deixar passar:
- prazo e valor;
- marco que não cabe;
- premissa crítica;
- o que transfere responsabilidade para a FGV.

O gabarito mede a cobertura (quantos o app achou) e a precisão (quantos dos achados do app se sustentam). O caso real fica fora do Git; a versão disfarçada entra em `tests/pmo/gabarito/`.

## Critério de pronto

O Raio-X está pronto para uso amplo quando, nos casos do plano:
1. nenhum achado real de uma versão some na seguinte;
2. a cobertura do gabarito está em pelo menos 80% e a precisão em pelo menos 70%;
3. nenhuma citação "do documento" sai sem conferência, e nenhum número é criado pelo modelo (travas do código);
4. o gerente decide pela página 1 de cada etapa (capa de decisão) e confirma isso num questionário curto;
5. o custo por projeto está medido com a API e comparado com as horas de PMO de hoje.

## O que não está neste plano

- A escolha dos TRs: é da responsável. Ela escolhe pelos eixos acima.
- O número de horas de PMO de hoje: vem da FGV.
