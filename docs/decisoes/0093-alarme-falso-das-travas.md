# 0093 — Alarme falso das travas: a "redação a conferir" ajustada pela medição, e o rótulo misto

- **Data:** 19/11/2026
- **Status:** aceita (bloco 4 do pente fino, pedido da responsável em 19/11/2026)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

A responsável pediu três coisas:
- medir a taxa de alarme falso de cada trava do código, a começar pela "redação a conferir", que gera quase todo o "a conferir" da etapa 4;
- rebaixar a aviso a trava que errar mais do que acertar;
- fazer a checagem de rótulo pelo código: o "do documento" com sugestão misturada.

## Medição (os dois casos do teste externo, etapas 2 a 4; dados fora do Git)

**Quanto cada trava marca**, em 1.139 itens:

| Trava | Itens marcados |
|---|---|
| redação a conferir | 701 (62% dos itens; na etapa 4, 84% das Sugestões) |
| citação em outra página | 19 |
| citação a conferir | 10 |
| número sem fonte | 2 (limites legais citados de memória: alarme correto) |
| citação não conferida | 0 |

Todos os 701 vinham da falta de marca condicional. Nenhum vinha de frase afirmativa.

**Alarme falso da "redação a conferir"**, numa amostra estratificada de 80 itens (60 da etapa 4 e 20 das etapas 2 e 3):
- Um classificador independente aplicou uma rubrica fixa. Na dúvida, contava como "precisa de conferência".
- **Resultado:** 41 precisam de conferência e 39 são alarme falso, uma taxa de **48,75%**. Na etapa 4, foram 46,7%; nas etapas 2 e 3, 55%.
- **Os alarmes falsos:**
  - 19 de estrutura ou modelo (campos, escalas, títulos de risco);
  - 14 que só descrevem o documento ou a causa de um risco;
  - 6 já em forma condicional, que a lista não conhecia ("pode", "a definir", "decisão do GP", "a confirmar", "sugerid-").

## Decisão

1. **A trava continua "a conferir"**, sem rebaixamento: ela acertava um pouco mais do que errava (41 a 39).
2. **Regras novas, para cortar os alarmes falsos:**
   - **Formas condicionais a mais:** "pode", "a definir", "decisão do GP", "sugerido", "sugere", "a confirmar", o GP que confirma, decide, aceita ou aprova, "quando houver", "caso" e "depende de".
   - **Linha de estrutura ou modelo fora da trava:** "Campos:", "Colunas:", "Status:", "Situação…:", "Probabilidade:", "Impacto:", "Categorias:", "Escala:", "Fases:", "Dicionário:" e afins.
   - **Registros de riscos e de premissas fora da trava:** o texto é condição futura ou suposição por natureza.
3. **Rótulo misto:**
   - O item "Do documento" com sugestão ou decisão do GP dentro ("…; sugere-se…", "a definir pelo GP") recebe o aviso "rótulo misto: há sugestão dentro do item do documento". Ele vai para "a conferir" e nunca é aceito em lote.
   - Os pedidos das etapas 2 a 4 dizem que o item "documento" traz só o que o trecho diz, e a sugestão vai num item à parte.

## Resultado

**Na amostra usada para desenhar as regras:** o alarme falso caiu de 48,8% para 33,3%, e as marcas, de 80 para 54. Perderam-se 5 alarmes verdadeiros, todos limítrofes.

**Validação numa amostra nova de 40 itens ainda marcados**, com outro classificador e a mesma rubrica:
- **Resultado:** 24 precisam de conferência e 16 são alarme falso, uma taxa de **40%**. A trava acerta 60%.
- **Padrões que sobram para a próxima rodada:**
  - rótulo seguido só de uma lista de nomes ("Estados: …");
  - remissão a outra parte do plano ("levadas ao B3", "na RACI").

**Nos dois casos inteiros:** de 701 para 579 marcas (−17%). Na etapa 4, de 276 para 225 e de 270 para 220.

**Rótulo misto:** 5 dos 159 itens "Do documento" (3%).

## Consequências

- O GP revisa menos itens à toa. A trava continua pegando a escolha afirmada como fato.
- As travas pequenas (citação a conferir, citação em outra página) ficam como estão até haver amostra para medir.
