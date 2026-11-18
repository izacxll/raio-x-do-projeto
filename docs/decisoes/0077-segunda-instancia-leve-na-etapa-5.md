# 0077 — Segunda instância leve na etapa 5

- **Data:** 18/11/2026
- **Status:** aceita (ok da responsável em 18/11/2026, com ajustes; ver "Decisão da responsável" no fim)
- **Quem decide:** responsável pelo projeto

## Pergunta

A etapa 5 não tem segunda instância no app. Vale ter uma versão leve, no modelo mais barato, que confira:
- os vereditos "falso" e "regra_errada" do PMO contra a página que ele cita;
- uma amostra das premissas críticas?

## Por que olhar para os vereditos

Um veredito "falso" ou "regra_errada" tira um achado do código do total. Se o PMO errar, um problema real some, e nenhuma camada confere isso. O código já confere a citação do "falso" (o trecho está na página?), mas não confere se o trecho **cobre o item** da ficha: essa é a parte que pede leitura.

## Custo estimado (medido nos dois casos do teste externo, 18/11/2026)

| | Caso fiscal | Caso de contratação direta |
|---|---|---|
| Pedido da leitura do PMO na etapa 5 hoje | ~112,8 mil tokens | ~116,0 mil tokens |
| Vereditos "falso" + "regra_errada" | 19 | 12 |
| Páginas distintas citadas por eles | 14 (~15,3 mil tokens) | 12 (~14,6 mil tokens) |

Versão leve, por plano:
- texto de sistema: o núcleo da skill e a rubrica, ~8 a 14 mil tokens;
- os vereditos (o achado, o item da ficha e o motivo do PMO): ~2 a 3 mil;
- só as páginas citadas: ~15 mil;
- amostra de 3 premissas críticas (o texto de cada uma e os itens do plano que a tratam no B3, no B27 e no A11, sem as páginas inteiras): ~3 a 4 mil.

Total de entrada: **~28 a 36 mil tokens, de 25% a 30% da leitura do PMO**, mais ~2 a 4 mil de saída.

Pela tabela de preços do app (consultada em 13/11/2026; reconferir):
- Sonnet 5.5: cerca de **US$ 0,08 a 0,13** por plano;
- Opus 5.5: cerca de US$ 0,16 a 0,26.

Para comparar, uma segunda instância com o pedido inteiro da etapa 5 no Opus custaria cerca de US$ 0,60.

## Prós
- Fecha a única porta sem conferência: um veredito errado do PMO apaga um achado real em silêncio.
- É barata: um quarto do pedido, no modelo mais barato, numa rodada só.
- Tem paridade simples: a mesma montagem no app e no vigia, como a 0071.
- A amostra das premissas críticas confere o ponto mais interpretativo da etapa (premissa escrita como premissa e nos três lugares, e não só citada).

## Contras
- No plano que o próprio app gera, a decisão 0076 zerou os candidatos falsos nos dois casos: lá, quase não haveria o que conferir. O ganho maior é no plano de fora (um PGP real), onde os candidatos são muitos.
- É o mesmo modelo, ou um mais fraco: pode ter o mesmo ponto cego. O Sonnet pode errar mais ao julgar se um trecho cobre um item.
- Uma amostra de 3 premissas pode deixar passar justamente a que falha.
- É mais uma chamada e mais uma espera na tela, e a etapa 5 hoje termina na leitura.

## Sugestão (para a responsável decidir)

Se aprovar:
- rodar só quando houver ao menos um veredito "falso" ou "regra_errada";
- uma rodada, sem rodada 2;
- Sonnet como padrão;
- na amostra, as premissas críticas que o PMO deu como tratadas com menos evidência.

Medir no primeiro plano real: quantos vereditos a revisão derruba e quantos alarmes falsos ela traz.

## Decisão da responsável (18/11/2026)

Aprovada como sugerido, com um ajuste e a régua do revisor:

1. **Quando roda:** só com ao menos um veredito "falso" ou "regra_errada" de um achado que a conferência de agora ainda aponta. Veredito de achado que o código não aponta mais não tira nada do total e não vai.
2. **Uma rodada, Sonnet como padrão.** O GP pode escolher outro modelo na tela; no teste externo, `"modeloEtapa5"` nas decisões do GP.
3. **Ajuste:** em vez de uma amostra de 3, **todas as premissas críticas que se aplicam** (~1 mil tokens cada: o que se assume e os trechos do plano que a citam).
4. **Régua do revisor:** o trecho citado cobre o **item inteiro** da ficha, não só o tema. Quando cobre em parte, o veredito vira "sustenta", e o achado volta a contar com a parte que falta. Derrubado, também volta. Confirmado, fica como estava.
5. **Efeito:** a revisão volta ao resultado da etapa 5 (o total do que conta muda) e fica no dossiê, ligada à leitura que conferiu. Com uma leitura nova, ela fica velha.

## Implementação

- A tela da etapa 5 já tinha a segunda instância genérica (o pedido inteiro, ~115 mil tokens, no modelo da etapa). Ela foi **substituída** pela versão leve. No teste externo, o vigia passa a exportar o passo `segunda-leitura` da etapa 5 quando há o que conferir, com a mesma montagem da tela (`pedidoSegundaEtapa5`).
- Só vão as páginas que os vereditos e os achados citam.

## Resultado no teste externo (18/11/2026)

- Feita à mão, antes da implementação, sobre os 31 vereditos "falso" e "regra_errada" dos dois casos, ela **derrubou 2 vereditos e confirmou 1 achado do PMO**.
- Custou cerca de 85 a 90 mil tokens por caso. Foi lida por agentes, com mais contexto que o pedido do app; a estimativa do pedido do app é de 28 a 36 mil por plano.
- Depois da decisão 0076, os planos gerados pelo app não têm mais candidatos falsos, e a revisão não roda neles.
- **Medir de novo no primeiro plano de fora:** quantos vereditos ela derruba, quantos alarmes falsos traz e o custo real do pedido (o placar registra os tokens, decisão 0070).
