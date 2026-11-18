# 0086 — Recomendação de participar ou não, como sugestão do PMO (etapa 1)

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026, bloco 1 do pente fino)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

As duas revisões do teste externo apontaram que a seção "Decisão do GP: participar ou não" saía vazia ("a decidir pelo GP"), sem nenhum apoio para a decisão, que é o ponto central da etapa 1. O PMO não tinha onde responder: o schema da leitura não tinha esse campo.

## Decisão

1. **Campo novo na resposta da etapa 1:** `recomendacao`, com:
   - a sugestão: participar, participar com condições, não participar ou sem base no documento;
   - o motivo, em redação condicional;
   - as condições: o que precisa de resposta ou ir à proposta antes;
   - os ids dos itens da leitura que a sustentam.

   As respostas gravadas antes desta decisão continuam válidas, sem recomendação.
2. **É sugestão, nunca a decisão** (CLAUDE.md, seção 1). A decisão continua no campo do GP, que a ferramenta não preenche. A recomendação aparece rotulada como sugestão do PMO:
   - na capa (primeira decisão);
   - na seção da decisão no corpo;
   - na tela, ao lado da escolha do GP.
3. **O código confere a recomendação como confere os outros textos do PMO:**
   - os itens citados existem na leitura (o que não existe sai como aviso) e saem pelo nome; o que o GP descartou sai do apoio;
   - número do motivo ou das condições que não está no documento sai como "número sem fonte — conferir";
   - motivo sem redação condicional, ou afirmativo, sai como "redação a conferir";
   - sugestão fora da lista deixa a recomendação de fora, e a leitura vale (a API não força a lista).
4. **O pedido e a skill (0.3.7)** pedem a recomendação com o motivo, as condições e os itens.

## Consequências

- Um campo a mais na resposta da etapa 1: algumas dezenas de tokens de saída.
- A recomendação só aparece a partir da próxima leitura de cada caso; os casos do teste externo foram lidos antes.
- Em aberto: a recomendação não tem estado de revisão (pendente, aceita, descartada). Ela sai sempre rotulada como sugestão; se o GP quiser descartá-la, fica para a decisão sobre a fila de pendências (bloco 2 do pente fino).
