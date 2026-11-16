# 0041 — Etapa 3 pelo método (fase M3)

- **Data:** 16/11/2026
- **Status:** aceita (escolhas de implementação dentro das decisões 0034, 0035 e 0037; a responsável confere no teste da fase)
- **Quem decidiu:** Claude Code, em nome da responsável

## Contexto

A fase M3 aplica o método da etapa 3 (`docs/estudos/metodo-etapa-3.md`) e o rastro de `docs/estudos/engenharia-reversa/07-regras-etapa-3.md`. O TAP parte do que foi **assinado**. As divergências entre a RFP, a proposta e o contrato vêm primeiro, porque o resto depende de qual versão vale.

## Decisão

1. **O contrato ou termo assinado é uma entrada opcional da etapa 3, com prioridade sobre a proposta e a RFP:**
   - é um papel novo de documento ("contrato"), que o PMO cita como `doc: "contrato"`;
   - o código lê dele o valor, a vigência, o cronograma de desembolso, a cláusula de "parte integrante" e quem acompanha (`src/etapas/3-tap/contrato.ts`);
   - o que não acha fica "não localizado pelo código — conferir".
2. **Divergências novas por código** (`divergencias-metodo.ts`), além das de requisito, prazo e valor:
   - **valor** nos três documentos;
   - **parcelas** parcela a parcela (quantidade, percentual, prazo), entre RFP, proposta e contrato, com a soma em 100%;
   - **frase de conformidade:** a proposta diz "em conformidade com o item X" perto do desembolso, e as parcelas não conferem;
   - **duração × vigência:** as fases da proposta, ou o maior trimestre que ela cita, contra a vigência do contrato ou da RFP;
   - **equipe com regra diferente:** mínimo na RFP × limite na proposta;
   - **quadro de equipe × produtividade:** o mesmo cálculo da etapa 2.

   Cada divergência traz o lado do contrato, a **versão sugerida** e **o que fazer**. Com contrato, a versão sugerida é a dele. O GP passa a poder escolher "vale o contrato".
3. **Divergências de texto do PMO** (campo novo `divergenciasTexto` no pedido dos 12 elementos):
   - frase de conformidade que não confere;
   - proteção da proposta × cláusula do contrato;
   - quem aprova e em que prazo;
   - término;
   - orçamento × obrigação.

   São sempre Sugestão e o GP revisa cada uma. Dossiês e gravações antigas abrem com o campo vazio.
4. **Os 12 elementos e o registro de premissas pelo método:**
   - o pedido traz o teste de cada item;
   - o contrato prevalece;
   - produto que a proposta acrescentou é compromisso, com aceite;
   - os marcos ficam dentro da vigência;
   - a aprovação e o término são ligados às cláusulas;
   - o registro segue a ordem do método: primeiro o que a proposta escreveu, depois as premissas críticas que faltam, depois as restrições, com quem valida.
5. **Conferência do TAP:**
   - valor e parcelas iguais ao contrato, somando 100%;
   - marcos dentro da vigência (a do contrato, quando houver);
   - toda entrega-chave com critério de aceite;
   - toda divergência com versão escolhida.
6. **Tela e exportado:**
   - as divergências vêm primeiro, com a coluna do contrato, a sugestão e o que fazer;
   - as divergências de texto do PMO têm seção própria;
   - "O que vem dos documentos" traz o que o código leu do contrato.
7. **Testes:**
   - o contrato assinado não é público, então cada caso (SMPED e OEI) tem um **contrato inventado** para teste, com divergências plantadas (`tests/fixtures/gerados/tap-*/contrato-teste.json`);
   - a demonstração da etapa 3 abre com o contrato da OEI;
   - gabaritos e leituras gravadas feitos pelo Claude Code seguindo a skill.

## Consequências

- Placar em `docs/estudos/placar-m3-etapa-3.md`, com 10 itens para a responsável conferir antes do merge.
- A etapa 4 (fase M4) recebe as divergências decididas e o registro de premissas na ordem do método.
- A skill 0.3.0 (PR próprio) já descreve o contrato como entrada da etapa 3 (bloco TAP-DV da ficha `tap`).
