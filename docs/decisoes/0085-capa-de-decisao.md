# 0085 — Capa de decisão e quadros de cada etapa

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026, bloco 1 do pente fino)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

Com as partes da decisão 0084 (capa, quadros, corpo e anexo), faltava o conteúdo da capa e dos quadros. As duas revisões do teste externo pediram:
- a página 1 com o que o gerente decide;
- as páginas 2 e 3 com o resultado em forma visual;
- alertas vermelhos para o que muda preço, prazo, caixa ou aceite.

## Decisão

1. **A capa é montada só por código, a partir do dossiê** (`src/exportacao/capas.ts`; etapa 1 em `relatorio-rfp.ts`). Ela é a mesma na tela e no Word e tem:
   - o que é a etapa;
   - o que o GP precisa decidir agora (no máximo 5);
   - os números-chave;
   - de 3 a 5 alertas, os altos primeiro;
   - o que mudou desde a etapa anterior.
2. **Os quadros de cada etapa:**
   - **Etapa 1:** ficha da RFP (objeto, prazo, valor, entregas, julgamento, habilitação, datas) e as perguntas antes do preço, pela ordem do impacto. O que o código não achou fica "não localizado pelo código — conferir no documento", com a leitura do PMO ao lado, como sugestão. Prazo e valor não localizados viram um alerta alto.
   - **Etapa 2:** produtos × equipe × horas (horas esperadas por produto, conta do código) e os compromissos de método.
   - **Etapa 3:** o TAP em uma página e as divergências a decidir.
   - **Etapa 4:** a linha do tempo dos marcos, os 5 riscos principais (probabilidade × impacto, com resposta, gatilho e reserva) e a RACI resumida. As partes B (registros) vão para o anexo do resultado.
   - **Etapa 5:** o veredito sugerido do plano, por regra fixa:
     - não apto com algum achado grave que se sustenta;
     - apto com ressalvas com achado médio;
     - apto com só achados baixos ou nenhum.
     O GP decide. Vêm também o semáforo das partes (as sem achado numa linha só) e o que corrigir antes de assinar. Contam os achados do código que o PMO sustentou e os da leitura do PMO que o código validou, menos os que o GP disse que não procedem.
3. **A capa não entra nas peças em si:** a proposta (vai ao cliente), o TAP e o PGP (são aprovados). Ela vai no resultado da etapa, na tela e nos documentos que são só do GP (análise da RFP e relatório de conformidade).
4. **Nome sugerido:** sai também a fórmula de abertura da contratação direta da FGV.

## Medição (os 10 documentos do teste externo, fora do Git; páginas no Word)

| Etapa | Antes (total) | Depois (total) | Depois, antes do anexo |
|---|---|---|---|
| 1 | 14 e 14 | 16 e 16 | 13 e 13 |
| 2 | 17 e 20 | 20 e 22 | 13 e 14 |
| 3 | 24 e 24 | 25 e 25 | 17 e 15 |
| 4 | 66 e 72 | 66 e 73 | 56 e 62 |
| 5 | 1 e 1 | 5 e 5 | 4 e 4 |

O total quase não muda, porque o formato reorganiza e não corta. O que muda é a leitura: o gerente decide pela página 1, vê o resultado nas páginas 2 e 3, e o processo e os registros completos estão no anexo. A etapa 5 passa a ter resultado. O volume da etapa 4 vem dos próprios planos (partes A) e só cai com o PGP enxuto por porte (bloco 3 do pente fino).

## Consequências

- O "o que mudou" é o que o código consegue comparar (requisitos, abordagem, compromissos, contrato, divergências, marcos, riscos, réguas). Não é uma comparação de texto entre etapas.
- A recomendação de participar ou não (etapa 1) vem noutra decisão: precisa de campo novo no pedido ao PMO.
