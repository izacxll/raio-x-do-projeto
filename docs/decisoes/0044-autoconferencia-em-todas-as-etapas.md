# 0044 — Autoconferência em todas as etapas; na etapa 4, porte reduz documentos, não cobertura

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (ok de 16/11/2026, com as condições dos itens 3 e 4); Claude Code (a redação)

## Contexto

No teste externo da etapa 4, a adaptação saiu certa, mas cada plano essencial ficou com 2 a 4 linhas e deixou de fora itens obrigatórios das fichas (A8.7, A8.8, B27.3, A5.7, A5.8, A7.7…). Os itens já existiam: o que faltava era a regra de cobri-los. A conferência desse plano, por sua vez, contou como ausentes itens que a própria ficha dispensa em porte pequeno (A3.10, A4.6, A8.5, A10.2, B27.11, B31.6 a B31.9), contra a proporcionalidade (decisões 0013 e 0033).

## Decisão

1. **Porte pequeno reduz documentos** (fundir e dispensar partes na adaptação), **não a cobertura** de uma parte mantida.
2. **Autoconferência antes de sair, em todas as etapas.** Cada etapa marca cada item do método ou das fichas que usou com um estado:
   - `presente`, com onde está;
   - `dispensado`, com o motivo (a condição de dispensa da ficha que vale para o projeto, ou outro motivo dito);
   - `decisao_gp`, quando o conteúdo depende de um número ou nome que só o GP dá.

   Item sem marca é falha da etapa.
3. **Na etapa 4, "ausente" não é estado final** de item de parte essencial. Item ausente obriga a gerar o conteúdo ou a marcá-lo como `dispensado` (com motivo) ou `decisao_gp`. O plano só sai com zero ausentes sem tratamento.
4. **A etapa 4 é gerada em blocos**, na ordem da decisão 0007, cada um com as fichas inteiras das suas partes e os artigos do Rework ligados a elas:
   - bloco 1: capa, adaptação, ciclo de vida e escopo (seções 0 a 3);
   - bloco 2: atividades, recursos, durações e cronograma (seções 4 a 6);
   - bloco 3: riscos, custos e premissas (seções 7 a 9);
   - bloco 4: demais planos, linha de base da medição e documentos de execução (seções 10 a 12).

   A seção 13 (autoconferência e decisões do GP) é do código. **Se a autoconferência de um bloco achar item ausente, regenera só aquela parte**, não o bloco inteiro.
5. **Cadência de reuniões e de relatórios** é `decisao_gp`, com sugestão.
6. **Teste que reprova:** um teste automático falha se algum item de ficha de uma parte essencial ficar sem marca na autoconferência. Casos fixos: SMPED e o TR municipal de contratação direta (o segundo só na máquina da responsável, porque o TR fica fora do Git).

## Consequências

- `SKILL.md` (princípio 13; etapas 1 a 5; formato de saída), métodos das etapas 1 a 5.
- Fichas: B13.6 (turnos) deixa de ser dispensável só por porte pequeno; vale sempre que há campo.
- Código: o campo `autoconferencia` nos schemas das etapas 1 a 4, o validador e o teste (decisão 0048); os blocos e a regeneração por parte no pedido da etapa 4 (fase M4).
- A conferência (etapa 5) continua respeitando as condições de dispensa: item que a ficha dispensa para o projeto nunca é ausente.
