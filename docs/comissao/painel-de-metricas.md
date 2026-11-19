# Painel de métricas

Os números do teste externo, por versão da skill PMO. Cada linha nova entra quando um caso completo roda numa versão nova (ver o [plano de validação](plano-de-validacao.md)). Só contagens: nada dos documentos dos casos.

## Os casos medidos

| Caso | Modalidade | Tipo | Produtos | Etapas rodadas |
|---|---|---|---|---|
| 1 | licitação | consultoria por produtos (diagnóstico de gestão pública) | 6 | 1 a 5 |
| 2 | contratação direta | estudo com pesquisa de campo | 3 | 1 a 5 |

Rodada 3 do teste externo (17 e 18/11/2026), com a skill da série 0.3 (0.3.3 a 0.3.5, ajustada entre as etapas pelas lições).

## Qualidade

| Métrica | Caso 1 | Caso 2 | Fonte |
|---|---|---|---|
| Citações conferidas pelo código na página | 583 | 596 | placar de cada passo |
| Citações não achadas na página | 0 | 1 | placar |
| Citações fracas (menos de 6 palavras) | 5 | 4 | placar |
| Achados da segunda instância na última rodada de cada passo | 108 (8 altos, 47 médios, 53 baixos) | 79 (6 altos, 37 médios, 36 baixos) | conferência de cada passo |
| Rótulo errado (um dos achados acima) | 29 | 28 | conferência |
| Passos com achado alto na última rodada | 5 de 11 | 4 de 11 | conferência |
| Rodadas da segunda instância por passo | 2 (até 4) | 2 (até 3) | conferência |
| Etapa 5: achados que se sustentam no plano da ferramenta | 1 (baixo, leitura do PMO) | 1 (grave, leitura do PMO) | resultado da etapa 5 |
| Lições registradas na rodada (viram regra da skill ou do código) | 206, nos dois casos | | registro de lições |

Nenhum achado alto segue sem correção ou sem "seguir" explícito do GP (decisões 0059 e 0060).

## Alarmes falsos das travas do código

| Trava | Antes | Depois | Decisão |
|---|---|---|---|
| Etapa 5, candidatos do código no plano gerado pelo app | 16 de 20 falsos num caso; 32 nos dois planos | 0 candidatos falsos nos dois planos | 0076 |
| Etapa 5, vereditos "falso" conferidos pela segunda instância leve | — | 2 de 31 derrubados; 1 achado do PMO confirmado | 0077 |
| Etapa 1, "citação não prova a frase" | 8 de 10 falsos | virou aviso, fora da contagem de erros | 0058 |
| Etapas 2 a 4, "redação a conferir" | — | 276 avisos no plano de um caso; medir a taxa é o próximo passo | 0088 |

## Custo e tempo

| Métrica | Caso 1 | Caso 2 |
|---|---|---|
| Passos do PMO (5 etapas) | 13 | 13 |
| Pedidos da segunda instância | 12 | 12 |
| Tokens de entrada (último pedido de cada passo) | 901.598 | 977.044 |
| Tokens de entrada da segunda instância (última rodada) | 584.040 | 651.777 |
| Tokens de saída (estimados pelo tamanho das respostas) | ~180 mil | ~166 mil |
| Custo estimado sem cache (preço do app para o Opus 5.5: US$ 4 por milhão de entrada e US$ 20 por milhão de saída) | ~US$ 9,55 | ~US$ 9,84 |
| Tempo de relógio do teste (inclui as esperas entre os passos) | 24,2 h | 24,2 h |

O custo é um **piso**:
- a pasta de cada passo guarda só o último pedido exportado;
- as rodadas anteriores da segunda instância e os passos refeitos não entram.

O teste rodou pelo claude.ai, sem a API, então não há fatura a conferir.

**Custo por projeto completo, com o cache (bloco 5 do pente fino, decisão 0095).** A simulação cobra, pelos preços da API para o Opus 5.5, todos os pedidos do teste: os dos passos e os da segunda instância, inclusive as rodadas anteriores. Cada pedido entra com o tamanho que tinha e na hora em que foi feito. O cache só conta quando o mesmo prefixo (skill e documentos) foi usado dentro do tempo de vida.

| Configuração | TR fiscal (31 pedidos) | TR de contratação direta (40 pedidos) |
|---|---|---|
| Sem cache | US$ 12,09 (R$ 69) | US$ 15,16 (R$ 87) |
| Cache de 5 minutos (o app até a decisão 0095) | US$ 12,66 (R$ 73) | US$ 16,66 (R$ 96) |
| **Cache de 1 hora no prefixo estável (agora)** | **US$ 11,37 (R$ 65)** | **US$ 14,70 (R$ 84)** |

- **Cache de 5 minutos:** encarecia, porque o intervalo mediano entre pedidos foi de 9 a 10 minutos. A escrita custa 1,25 × a entrada e quase nunca era lida.
- **Cache de 1 hora:** o prefixo é lido do cache em cerca de metade dos pedidos. O custo cai de 10% a 12% contra o app de antes e de 3% a 6% contra o sem cache.
- **Saída:** o maior peso é a saída (cerca de 230 mil a 245 mil tokens por projeto, US$ 20 por milhão). A saída não tem cache.
- **Câmbio:** PTAX de venda de 16/11/2026, R$ 5,7324 por dólar (conferir no Banco Central no dia).
- **Medição com a fatura:** a medição real, com a chave da API, fica para a próxima rodada do teste. A tela de cada etapa já mostra, em cada chamada, a escrita e a leitura do cache que a API devolve.

## Leitura para o gerente

Páginas no Word, nos dois casos (decisões 0084 e 0085):

| Etapa | Antes do formato novo | O que vem antes do anexo, agora |
|---|---|---|
| 1 | 14 e 14 | 13 e 13 |
| 2 | 17 e 20 | 13 e 14 |
| 3 | 24 e 24 | 17 e 15 |
| 4 | 66 e 72 | 15 e 16 |
| 5 | 1 e 1 | 4 e 4 |

Pendências do GP no plano (etapa 4), nos dois casos (decisão 0088):
- 385 e 380 itens pendentes;
- desses, 70 e 67 são decisões do GP;
- 37 e 41 podem ser aceitos em lote;
- o resto tem aviso do código ("a conferir").

## Próximas linhas

A cada versão da skill, um caso completo do [plano de validação](plano-de-validacao.md) entra com as mesmas colunas. O gabarito de regressão (`tests/pmo/gabarito/`, na CI, com casos disfarçados) garante que uma regra nova não estraga outra.
