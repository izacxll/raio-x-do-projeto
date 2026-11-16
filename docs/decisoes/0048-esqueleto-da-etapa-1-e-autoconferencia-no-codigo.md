# 0048 — Esqueleto da etapa 1, citação fraca e autoconferência no código

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido e ok de 16/11/2026); Claude Code (a implementação)

## Contexto

Os testes externos da skill (decisão 0049) mostraram erros do esqueleto do código da etapa 1, no edital da SMPED e num TR municipal de contratação direta (estudo de impacto de evento), e pediram no código o que as decisões 0042 a 0047 põem na skill.

## Decisão

1. **Correções do esqueleto (SMPED):**
   - habilitação: certidões que só mudam no fim ("Tribunal de Contas da União", "do Estado", "do Município") deixam de ser tratadas como repetição; alíneas depois de um item que termina em dois-pontos são exemplos dele, não documentos;
   - "Diário Oficial" não vira obrigação diária;
   - a eliminação sai com as alíneas, sem a tabela de pontuação em volta;
   - "57.575/2016." no começo de uma linha é o fim de "Decreto Municipal nº" da linha de cima, não um item novo: os requisitos deixam de ser cortados;
   - público-alvo e "poderá ser executado" (faculdade) deixam de ser requisito R; o público-alvo continua na leitura, no cartão das obrigações.
2. **Correções do esqueleto (TR de contratação direta):**
   - título com texto na mesma linha ("1. OBJETO: Contratação de…") passa a ser título: o objeto sai da p. 1, não do texto jurídico;
   - modalidade declarada fora das três primeiras páginas ("será INEXIGIBILIDADE de licitação"); a explicação da lei ("os casos de inexigibilidade e dispensa") não conta;
   - parcelas escritas em valor no texto ("1ª parcela, no valor de R$ 80.000,00 […] contra a entrega do Produto 1"), com o percentual calculado pelo código;
   - produto com o número do item na frente ("2.3.1 Produto 1: …"); quantidade com erro de digitação ("questinários"), com o nome do item corrigido e o trecho literal;
   - definição de notória especialização copiada da lei não é equipe exigida;
   - o ponto de abreviação ("Av. Dr. Silva", "art. 74") não fecha a frase;
   - prazo de recurso contra sanção não é prazo do certame nem marco móvel da execução; "divulgação" entra como marco da vigência.
3. **Contratação direta no código** (decisão 0042): terceira modalidade na leitura ("Como é escolhida", hipótese legal, o que sustenta a escolha, documentos como pergunta, "não se aplica" próprio) e no tipo de contrato da etapa 2.
4. **Cruzamentos X1 a X6** (decisão 0046) no esqueleto (`src/regras/cruzamentos-rfp.ts`): o código lista e conta (pagamento em todos os lugares, janela entre o início e o marco fixo e folga da vigência, vedação × quem executa, e-mails quase iguais, valor × parcelas, prazos de um mesmo marco). O que diverge ou fica em aberto vira ponto de atenção; os seis vão no pedido ao PMO. Também: prazo sem termo inicial (decisão 0045) e sinal de estudo sensível (decisão 0043; "denúncia" fica de fora, porque no termo de parceria é a forma de encerrá-lo).
5. **Citação fraca:** citação conferida com menos de 6 palavras ganha a trava "citação fraca" (o trecho existe, mas não prova o item).
6. **Autoconferência no código** (decisão 0044): o campo `autoconferencia` nos esquemas das etapas 1 a 4 (e `cruzamentos` na etapa 1), com padrão vazio para as respostas gravadas antigas; o validador (`src/pmo/autoconferencia.ts`); na etapa 4, os itens esperados são todos os das fichas das partes mantidas, e o item sem marca devolve só a sua parte ao PMO. Os pedidos das etapas 1 a 4 pedem a autoconferência.
7. **Teste que reprova** (`tests/pmo/autoconferencia.test.ts`) e **casos fixos** (`tests/etapas/correcoes-etapa-1.test.ts`): a SMPED roda no CI; o TR só na máquina da responsável, pulado quando o arquivo não existe.

## Consequências

- A tela ainda não mostra a autoconferência nem os cruzamentos à parte: o resultado vai no pedido e nos pontos de atenção. A tela e a regeneração por parte entram com a etapa 4 pelo método (fase M4).
- A numeração dos compromissos C (decisão 0047) fica para as fases das etapas 2 a 5, na ordem delas.
- O gabarito antigo da SMPED (v0.8.1) passa a registrar público-alvo e "poderá ser executado" como fora dos R, pelo método.
