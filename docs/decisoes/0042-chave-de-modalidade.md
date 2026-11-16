# 0042 — Chave de modalidade: licitação, contratação direta ou parceria

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido e ok de 16/11/2026); Claude Code (a redação)

## Contexto

Dois testes da skill 0.2.0 feitos fora do app (leituras gravadas externas, decisão 0047) mostraram que as etapas pressupõem licitação com pontuação:

- num **TR municipal de contratação direta (estudo de impacto de evento)**, por inexigibilidade (art. 74, III, da Lei 14.133), as seções de julgamento e de habilitação da etapa 1 ficaram quase vazias, e metade das fichas PROP-ESTRATEGIA e PROP-ESTRUTURA não se aplicava. A justificativa de notória especialização do TR descrevia áreas que não eram o objeto, e ninguém tratou isso como problema;
- no **edital da SMPED** (parceria, Lei 13.019), plano de trabalho e metas ocupam o lugar de produtos e pontuação, com glosa por meta não cumprida e prestação de contas recorrente.

O mesmo TR dizia "Conforme objeto da proposta": a proposta da FGV veio antes do TR. Na contratação direta isso é comum, e as "perguntas de esclarecimento" viram ajustes na minuta do contrato antes da assinatura.

## Decisão

1. **A etapa 1 começa pela chave de modalidade**, com três caminhos:

   | | Licitação | Contratação direta | Parceria |
   |---|---|---|---|
   | Lei | 14.133 e outras | 14.133, art. 72 a 75 | 13.019 |
   | Como se escolhe | julgamento e pontuação | hipótese legal (inexigibilidade ou dispensa) | seleção do chamamento |
   | O que sustenta a escolha | a nota | notória especialização **no objeto**, justificativa de preço e documentos do art. 72 | o plano de trabalho e a capacidade da OSC |
   | O que se entrega | proposta técnica e de preço | proposta (às vezes anterior ao TR) e os documentos | plano de trabalho (art. 22) |
   | Dinheiro | preço, medição, pagamento por produto | preço, pagamento por produto | repasse, desembolso, glosa, prestação de contas |
   | O que vira pergunta | esclarecimento no prazo do edital | ajuste na minuta antes da assinatura | esclarecimento no prazo do chamamento |

   O código reconhece a modalidade pelos documentos; o GP confirma.
2. **Cada etapa troca o bloco conforme a modalidade:**
   - na etapa 1, as seções 5 (como se escolhe) e 6 (habilitação);
   - na etapa 2, a estratégia (PROP-ESTRATEGIA.1 e .11) e a estrutura;
   - nas etapas 3 a 5, o vocabulário e o que não se aplica.
3. **Notória especialização descrita fora do objeto** é `conflituoso`: texto de outro projeto (CP8). Vira pergunta: a FGV tem como comprovar experiência no objeto?
4. **Quando o TR vem da proposta** ("conforme a proposta", "conforme objeto da proposta"), a etapa 1 lê o TR como minuta a ajustar antes da assinatura.

## Consequências

- `SKILL.md` (seção 3, "Modalidade"), métodos das etapas 1 e 2, `prop-estrategia` (.1 reescrito e .11 novo).
- O código da etapa 1 passa a ter a terceira modalidade (contratação direta), com as seções 5 e 6 próprias: branch de correção da etapa 1 (decisão 0048).
- A modalidade não vira característica de dispensa das fichas do PGP: o que muda no plano é pouco e o texto do item já cobre (ex.: A11.9 e A11.10 valem para licitação e contratação direta).
