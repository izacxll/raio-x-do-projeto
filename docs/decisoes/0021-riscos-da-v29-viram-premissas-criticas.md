# 0021 — Os riscos da V29 viram premissas críticas do plano (skill PMO 0.2.0)

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (mudança de método); Claude Code, em nome dela, nos detalhes de aplicação marcados abaixo

## Contexto

Na skill PMO 0.1.0, o `checklist.md` reduzia os 24 riscos da taxonomia V29 do Raio-X do Plano de Trabalho a 12 perguntas, usadas como uma lista à parte. A maioria desses riscos, porém, é **premissa**: algo que o plano assume que vai acontecer e que, se não acontecer, obriga a refazer escopo, prazo e metas. Isso tem de estar escrito no próprio plano, e não numa lista paralela.

## Decisão

### 1. O checklist vira "premissas críticas comuns"

O `checklist.md` passa a listar 8 premissas críticas, com código próprio **PC1 a PC8** (não reaproveita códigos da V29):

| Código | Premissa crítica | Origem na V29 |
|---|---|---|
| PC1 | Dados e informações do cliente ou de outros órgãos chegam no prazo e na qualidade combinados | CTR4, CP13, TB24 |
| PC2 | Sistemas e ferramentas que não são da FGV funcionam, como um sistema do cliente que a equipe é obrigada a usar | nova (sem código na V29) |
| PC3 | O cliente aprova e decide no prazo, com critério claro e com quem tenha capacidade técnica de avaliar as entregas | CTR1, CTR5, CE16 |
| PC4 | O projeto começa na data prevista | CE15 |
| PC5 | As prioridades e os interlocutores do cliente se mantêm (eleição, troca de gestão) | CE17 |
| PC6 | Parceiros, órgãos e participantes fazem a sua parte (adesão, apoio local) | CP13, TB23, TC20 |
| PC7 | A equipe prevista dá conta do volume | CP10, CP11 |
| PC8 | O escopo não cresce sem aditivo (revisões e demandas extras limitadas) | CTR6 |

Para cada uma, o arquivo traz: o que o plano assume, os sinais no texto, o que acontece se ela não se confirmar (escopo, prazo, metas, custo) e onde ela tem de estar no plano.

### 2. Onde cada premissa crítica aparece

Cada premissa crítica que se aplica ao projeto aparece:
- **no plano (etapa 4), em três lugares:**
  - no registro de premissas (B3);
  - no registro de riscos (B27), com resposta e gatilho;
  - no plano de mudanças (A11), dizendo como reajustar escopo, prazo e metas se ela falhar;
- **na proposta (etapa 2) e no TAP (etapa 3):** já escrita, com a consequência.

As fichas ganharam os itens de conteúdo mínimo correspondentes:
- **A8.12** (plano de riscos) — tratamento das premissas críticas que se aplicam ao projeto. Como o A8 é um plano de gerenciamento, **a falta conta como grave**.
- **B3.9**, **B27.13** e **A11.12** — a premissa em cada um dos três lugares;
- **PROP-SOW.11** e **TAP-PR.2** — a premissa escrita com a consequência.

### 3. Na etapa 5

A premissa crítica que se aplica ao projeto e não está no plano é **ausente**. A gravidade segue a parte do plano (decisões 0008 e 0009): a falta do tratamento no A8 é grave.

*Detalhe decidido pelo Claude Code:* "se aplica ao projeto" sai de uma pré-marcação do código, pelos sinais de aplicação de cada premissa na RFP, no TAP e no plano, confirmada pelo GP na mesma tela em que ele confirma as características do projeto. Premissa que o GP marca como "não se aplica" não vira ausente. Na dúvida, a pré-marcação fica "se aplica" e a tela pede a confirmação.

### 4. O que não vira premissa

| V29 | Para onde vai |
|---|---|
| CTR7 (duas leituras) | Problema do texto: **vago** |
| CP9 (premissa sem base) | Problema do texto: **vago** |
| CP8 (texto de outro projeto) | Problema do texto: **conflituoso** |
| CTR2, CTR3 (o edital empurra para a FGV) | Etapa 1, como pergunta de esclarecimento; proposta, como exclusão ou obrigação do contratante |
| CP12 (gestão definida) | Conteúdo mínimo dos planos: A7.8 e A7.9 (reuniões com o cliente e internas) |
| CP14 (sigilo, LGPD, independência) | Conteúdo mínimo: A12.8, A7.5, A9.10 e PROP-METODOLOGIA.9 |
| TC18, TC19, TC21, TC22 | Saem |
| TC20, TB23, TB24 | Absorvidos em PC1 e PC6 |

As perguntas "só se houver campo" e "só se houver beneficiários" deixam de existir. As características `com campo` e `com beneficiários` continuam no vocabulário de dispensa das fichas, para outros itens.

### 5. A V29 original não muda

A V29 continua como está no Raio-X do Plano de Trabalho. Esta é a versão revisada, só para o Raio-X do Projeto.

### 6. Exemplos

Os exemplos no repositório não citam projeto nem sistema real ("um sistema de gestão do contratante", nunca o nome do sistema).

## Consequências

- Skill PMO 0.2.0. As referências "checklist N" das fichas foram trocadas pelo código da premissa (PC1 a PC8), pelo tipo do problema de texto (vago ou conflituoso, com o código V29) ou pelo item de conteúdo mínimo.
- O `CLAUDE.md` (seção 3) passa a dizer que os riscos da V29 entram como premissas críticas dentro do plano, e não como lista à parte.
- A decisão 0009 (regras do Raio-X nos três tipos) continua valendo para as regras de código; esta decisão trata do conteúdo da skill e da base do "ausente".
- Na F5, a base do "ausente" (decisão 0013) ganha um quarto conjunto: as premissas críticas que se aplicam ao projeto.
