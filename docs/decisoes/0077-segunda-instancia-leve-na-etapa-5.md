# 0077 — Segunda instância leve na etapa 5

- **Data:** 18/11/2026
- **Status:** pendente (pergunta da responsável; nada implementado)
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
