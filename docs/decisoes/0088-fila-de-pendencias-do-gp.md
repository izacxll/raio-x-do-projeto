# 0088 — Fila de pendências do GP: decisão, a conferir e aceite em lote

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026, bloco 2 do pente fino)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

As duas revisões do teste externo apontaram cerca de 380 "pendentes de revisão do GP" soltos na etapa 4, que não são revisáveis. O que é decisão do GP de verdade sumia no meio. Dois problemas:
- o botão "Aceitar os N pendentes" aceitava tudo de uma vez, até as decisões do GP e os itens com aviso do código;
- no teste externo, o GP "seguiu com correção" sem ver o que mudou na correção.

## Decisão

1. **Quatro classes para cada item pendente** (`src/pmo/fila.ts`):
   - **decisão do GP:** o rótulo "Decisão do GP" ou "a definir pelo GP" no texto;
   - **a conferir:** o código deixou um aviso (citação não conferida, citação a conferir, número sem fonte, redação a conferir, travas da etapa 1);
   - **do documento:** com a citação conferida e sem aviso;
   - **sugestão sem aviso.**
2. **Aceite em lote, sempre por um clique do GP** (CLAUDE.md, seção 1: nada vai para a versão final sem passar pelo GP):
   - só "do documento" e "sugestão sem aviso" podem ir em lote;
   - decisão do GP e item com aviso nunca vão em lote;
   - o botão de cada passo e o de cada seção da etapa 1 seguem a mesma regra.

   O pedido de "sugestão aceita por padrão" virou esse aceite em lote: não há aceite automático.
3. **Fila de pendências no topo da tela de cada etapa:**
   - as decisões do GP e os itens a conferir, ordenados por impacto: caixa ou preço, prazo, aceite, quem executa e o resto;
   - o impacto vem da etapa quando ela o dá (seção 7 da etapa 1) ou do texto;
   - o prazo da decisão: antes do esclarecimento, de enviar a proposta, da reunião de abertura, de aprovar o plano, de assinar;
   - um clique leva ao item.
4. **Capa:** o número "Fila do GP" (decisões, a conferir, aceitáveis em lote) e até quando decidir.
5. **Etapa 5:** o GP também escolhe a gravidade dos achados da leitura do PMO, como já fazia nos do código.
6. **"Seguir com correção" (teste externo):**
   - o placar do código já roda sobre a resposta corrigida;
   - agora ele também diz o que mudou desde a resposta que a segunda instância conferiu (itens alterados, novos e removidos), para o GP ver antes de seguir.

## Ajustes da revisão de código

- **Etapa 1:** o item que o PMO marcou como decisão do GP (a marca fica na nota, "a decidir pelo GP") é decisão, nunca vai em lote. O que o código não localizou vai a conferir. O requisito incluído pelo próprio GP não fica pendente como decisão. O impacto da etapa 1 é levado para a escala da fila.
- **As decisões que não são item** contam na fila e na capa: participar ou não, a modalidade, a abordagem, a versão que vale em cada divergência e a aprovação do TAP.
- **A fila leva o foco ao item,** não só a rolagem.
- **O cartão do achado do PMO mostra a gravidade escolhida pelo GP.** O relatório de conformidade passa a usá-la com a decisão 0087.

## Consequências

- O total de pendentes não muda; muda o que o GP olha um a um. No PGP do teste, as decisões e os itens a conferir são uma parte pequena dos 385.
- O impacto pelo texto é uma regra simples, pela primeira dimensão que o texto toca; ele ordena a fila e não decide nada.
