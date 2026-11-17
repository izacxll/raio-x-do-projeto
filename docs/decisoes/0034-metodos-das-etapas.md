# 0034 — Métodos das etapas 1 a 5 passam a valer

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto

## Contexto

A responsável analisou à mão, item por item, um caso real de parceria (Lei 13.019/2014; fora do Git): o chamamento, a proposta, o termo assinado e o plano de trabalho. Comparou com o que o app devolve hoje. Encontrou dois problemas que atravessam as cinco etapas:

- **Inventário no lugar de leitura:** as etapas devolvem tudo o que acham no documento (todas as leis, todos os órgãos, cada número solto, cada parte do PGP), e não o que o gerente precisa decidir ou fazer. Na etapa 1, um chamamento real deu 107 itens e deixou de fora as condições de repasse e as dependências do contratante. Na etapa 5, um plano de trabalho real deu 84 achados, e só 12 se sustentaram.
- **Uma régua só:** todo projeto é medido como consultoria por produtos, e todo plano como PGP interno completo. Uma parceria com equipe de campo, paga por parcelas de repasse, recebe valor-hora, EAP com horas, diagrama de rede e as 51 partes do PGP.

Daí saíram cinco métodos, um por etapa, em `docs/estudos/metodo-etapa-1.md` a `metodo-etapa-5.md`. Cada um diz para que serve a etapa, o teste de cada item, a estrutura da saída, as regras de cada seção, o que não entra, o que é código e o que é PMO, e o critério de aceite.

## Decisão

### 1. Precedência

1. Os **métodos** prevalecem sobre o que as etapas fazem hoje e sobre a seção 5 da especificação onde os dois divergem.
2. Eles **complementam** a especificação e as decisões 0032 (leitura do PMO na etapa 1) e 0033 (etapa 5 por tipo de plano). O que a especificação e as decisões dizem e o método não trata continua valendo.
3. O princípio "sugerir, nunca afirmar" (CLAUDE.md, seção 1) e a divisão código × PMO (seção 2) não mudam.

### 2. O que muda em todas as etapas

- **Teste de cada item.** Cada etapa tem uma pergunta que todo item precisa passar ("isto muda uma decisão do gerente ou algo que a FGV terá de fazer, entregar, cumprir ou pagar?", na etapa 1). Item que não passa não entra.
- **Saída na ordem da decisão do gerente**, com a estrutura de seções do método, na tela e nos documentos exportados.
- **Tipo de contrato e de projeto como entrada de todas as etapas:** consultoria por produtos, operação contínua (parceria com equipe de campo, paga por parcela ou posto) ou híbrido; licitação ou parceria. O tipo muda o vocabulário, o preço (etapa 2), a adaptação e o acompanhamento (etapa 4) e a régua da conferência (etapa 5).
- **Contrato ou termo assinado** como entrada opcional da etapa 3, com prioridade sobre a proposta e a RFP.

### 3. O que muda em cada etapa

| Etapa | O que muda |
|---|---|
| 1 | De 11 passos de inventário para 8 seções (em uma página; o que fazer e entregar; prazos; dinheiro; julgamento; habilitação; pontos de atenção com a PC e a pergunta; não se aplica à modalidade), com 30 a 50 itens. Cada R é uma obrigação ou entrega, e as metas são requisitos em chamamento sem produtos. Saem a legislação além do regime, os órgãos sem papel, os números soltos, as faixas de pontuação e a leitura página a página. |
| 2 | Pontos de texto separados dos pontos de documento; abordagens que mudam o resultado; escopo com exclusões e o que fica com o contratante, com prazo; premissas críticas com consequência e reajuste; preço pela estrutura do tipo de contrato (na parceria, folha mês a mês e despesas por natureza, sem valor-hora; custos indiretos com memória de cálculo e taxa de administração conferida no edital e na norma local, decisão 0040), com a tabela de pontos por preço e o caixa. |
| 3 | O contrato ou termo assinado entra e prevalece. As divergências entre RFP, proposta e contrato vêm primeiro. Produto que a proposta acrescentou é compromisso com aceite. O registro inclui as PC que a proposta não escreveu, com quem valida. TAP em duas páginas. |
| 4 | A adaptação parte do tipo de projeto: nenhum projeto recebe as 51 partes por padrão. Operação contínua tem rampa de equipe e caixa (repasse × custo acumulado, folga por parcela) e não tem diagrama de rede nem valor agregado. PC nos três lugares, com gatilho numérico (decisão do GP) e reajuste. Acompanhamento pelo tipo. |
| 5 | A régua depende do tipo de plano (plano de trabalho: lei, edital, requisitos, PC e núcleo; PGP: a adaptação). Seis seções, com "O que está em ordem" sempre e "Não se aplica" num anexo. Precisão antes de cobertura: 10 a 25 achados num plano típico. Frase de conformidade falsa e exclusões de outro tipo de projeto são conflitos. |

### 4. Como se aplica

- **Uma fase e um PR por etapa, na ordem 1, 2, 3, 4 e 5:**

  | Fase | Etapa | Branch | Tag |
  |---|---|---|---|
  | M1 | 1 — leitura da RFP | `fase/m1-etapa-1-pelo-metodo` | v0.9.0 |
  | M2 | 2 — proposta | `fase/m2-etapa-2-pelo-metodo` | v0.10.0 |
  | M3 | 3 — TAP | `fase/m3-etapa-3-pelo-metodo` | v0.11.0 |
  | M4 | 4 — PGP | `fase/m4-etapa-4-pelo-metodo` | v0.12.0 |
  | M5 | 5 — conferência | `fase/m5-etapa-5-pelo-metodo` | v0.13.0 |

- **Cada fase entrega:**
  - a saída refeita na estrutura do método, na tela e nos documentos exportados;
  - os gabaritos dos editais públicos da SMPED e da OEI refeitos nessa estrutura; na etapa 5, um plano de trabalho inventado com erros plantados e um correto;
  - o placar antes e depois: itens que passam no teste do método, itens que não passam, cobertura das seções, números sem fonte (zero) e, na etapa 5, falsos positivos;
  - a revisão independente e os prints do Playwright antes de chamar a responsável.
- **O sprint de regras da decisão 0032 e as fases restantes da 0033** entram dentro dessas fases, já sobre a estrutura nova: o sprint e a leitura do PMO da etapa 1 na M1 (a leitura do PMO, se couber; senão, numa fase F1b logo depois); os itens 1, 2, 3, 4, 6 e 7 da 0033 na M5 (o item 6, metas como requisitos, já na M1).
- **Skill PMO 0.3.0**, num PR próprio, mostrado à responsável antes de publicar: tipos de projeto e de plano; ficha de proposta para parceria da Lei 13.019; premissa crítica com gatilho e reajuste; contrato como entrada da etapa 3; caixa como parte de custos; frase de conformidade e exclusões de outro projeto como conflito.
- **Nada do caso real** entra no repositório nem nos testes. Os gabaritos e os planos de teste são de editais públicos ou inventados.

## Consequências

- O CLAUDE.md passa a apontar para os métodos: a especificação continua a referência geral, e o método da etapa vem antes dela.
- As saídas atuais das cinco etapas mudam de estrutura. Dossiês antigos continuam abrindo; o que mudar de formato é convertido na abertura ou refeito pela etapa.
- A tabela de versões da decisão 0005 ganha as fases M1 a M5, antes do MVP (v1.0.0).
- **Correção da decisão 0033:** dos 84 achados do caso real, 12 se sustentam, não 13. O achado "exclusões ausentes" era falso (o plano tinha lista de exclusões). O problema real era outro: a lista era de outro tipo de projeto (texto de outro documento), e o método da etapa 5 trata isso como conflito.
