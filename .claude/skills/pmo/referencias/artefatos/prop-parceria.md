---
codigo: PROP-PARCERIA
nome: Plano de trabalho da parceria (Lei 13.019/2014)
tipo: parte da proposta
etapas: [2, 5]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["plano de trabalho", "plano de trabalho da parceria", "proposta da OSC", "previsão de receitas e despesas", "cronograma de desembolso", "quadro de metas e indicadores"]
versao: 0.3.2
---

# PROP-PARCERIA — Plano de trabalho da parceria (Lei 13.019/2014)

## Para que serve
Numa parceria com organização da sociedade civil (termo de colaboração ou de fomento), a proposta **é** o plano de trabalho que a administração avalia e que passa a fazer parte do termo. O conteúdo vem do art. 22 da Lei 13.019/2014 e do modelo do edital (`licitacoes.md` §4). O preço não é horas × valor-hora: é a **folha da equipe mês a mês e as despesas por natureza**, distribuídas nas parcelas de repasse do cronograma de desembolso do edital (método da etapa 2, 3.6). Esta ficha complementa as demais `prop-*` (estratégia, estrutura, SOW, equipe) e substitui, na parceria, a estrutura de preço da `prop-preco`. Na etapa 5, os itens do art. 22 são a base do "ausente" de um plano de trabalho de parceria (decisão 0033). **Salários, encargos, valores das despesas e qualquer diferença em relação ao edital são Decisão do GP.**

## Conteúdo mínimo
- **PROP-PARCERIA.1** Descrição da realidade objeto da parceria, com o nexo entre ela, as atividades e as metas
  - fonte: Lei 13.019/2014, art. 22, I (`licitacoes.md` §4); PMBOK 6, 4.1.3.1, p. 81 (PDF 117) (finalidade)
  - sinais: "diagnóstico" | "descrição da realidade" | "nexo" | "justificativa" | "contexto"
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.2** Metas a atingir e atividades a executar, as do edital com as mesmas palavras e números, sem acrescentar metas
  - fonte: Lei 13.019/2014, art. 22, II (`licitacoes.md` §4); método da etapa 2, 3.5
  - sinais: "metas" | "meta" | "atividades" | quadro de metas com a página do edital
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.3** Parâmetros para aferir o cumprimento das metas: indicador, fórmula, fonte de verificação e periodicidade de cada meta, os do edital
  - fonte: Lei 13.019/2014, art. 22, IV (`licitacoes.md` §4); PMBOK 6, 8.1.3.2, p. 287 (PDF 323) (métricas)
  - sinais: "indicador" | "fórmula de cálculo" | "fonte de verificação" | "meio de verificação" | "periodicidade" | tabela meta × indicador × fonte
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.4** Forma de execução das atividades e de cumprimento das metas: método, territórios, rotina da equipe, sistemas que o edital obriga a usar
  - fonte: Lei 13.019/2014, art. 22, III (`licitacoes.md` §4); ficha `prop-metodologia`
  - sinais: "forma de execução" | "metodologia" | "estratégia de execução" | "rotina"
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.5** Previsão de receitas e despesas por natureza, no formato da tabela do edital (pessoal e encargos, equipamentos, deslocamento, material, serviços de terceiros, custos indiretos), cada linha com a memória de cálculo
  - fonte: Lei 13.019/2014, art. 22, II-A, e art. 46 (`licitacoes.md` §4); PMBOK 6, 7.2, p. 241 (PDF 277) (cobertura de todos os recursos)
  - sinais: "previsão de receitas e despesas" | "natureza de despesa" | "elemento de despesa" | "memória de cálculo" | tabela natureza × valor
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.6** Folha da equipe mês a mês ao longo da vigência: cada função com a quantidade em cada mês (a rampa de contratação), salário e encargos como Decisão do GP; totais e soma pelo código
  - fonte: Lei 13.019/2014, art. 46, I (`licitacoes.md` §4: a equipe pode ser paga); método da etapa 2, 3.6; `checklist.md` PC7
  - sinais: "folha" | "remuneração da equipe" | "encargos" | "mês a mês" | tabela função × mês
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.7** Sem valor-hora e sem taxa de administração: o repasse paga despesas do plano de trabalho; custos indiretos só como despesa com memória de cálculo e ligada ao objeto, nunca como percentual sobre o total
  - fonte: Lei 13.019/2014, art. 46 (`licitacoes.md` §4); método da etapa 2, 3.6 e seção 4; conferir o edital, que costuma vedar taxa de administração
  - sinais: "valor-hora", "taxa de administração" indicam estrutura de outro tipo de contrato | memória de cálculo dos custos indiretos
  - confere: só PMO
  - dispensa: nunca
- **PROP-PARCERIA.8** Cronograma de desembolso igual ao do edital: mesma ordem, percentual, prazo e condição de cada parcela; diferença só dita e justificada, como Decisão do GP (a comparação é do código)
  - fonte: `licitacoes.md` §4; método da etapa 2, 2.1; PMBOK 6, 7.3, p. 253 e 256 (PDF 289 e 292) (requisitos de financiamento)
  - sinais: "cronograma de desembolso" | "parcela" | "repasse" | tabela parcela × percentual × prazo
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.9** Caixa: repasses acumulados × custo acumulado mês a mês, com a folga em cada parcela e o ponto mais apertado (conta do código; ficha `a04`)
  - fonte: método da etapa 2, 3.6; método da etapa 4, 4.3; `experiencia.md` §1
  - sinais: "fluxo de caixa" | "caixa" | "folga" | "repasse acumulado" | "custo acumulado"
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.10** Equipe com a regra do edital (mínimo, referência ou limite), as proporções exigidas e a regra de substituição de pessoal
  - fonte: método da etapa 3, 4.1 (equipe: quantidade e regra); ficha `prop-equipe`; PMBOK 6, 9.1.3.1, p. 318 (PDF 354); 9.3, p. 330 (PDF 366) (regra de substituição, como em A6.7)
  - sinais: "equipe mínima" | "proporção" | "substituição" | "quadro de pessoal"
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.11** Premissas críticas que se aplicam (PC1 a PC8), com a consequência e o reajuste pelo caminho da parceria: revisão do plano por aditivo ou apostila e prorrogação, inclusive de ofício quando o repasse atrasa
  - fonte: decisão 0021; `checklist.md` (PC1 a PC8, gatilho e reajuste); Lei 13.019/2014, arts. 55 e 57 (`licitacoes.md` §4)
  - sinais: "premissa" junto de "caso não" ou "se não" | "termo aditivo" | "apostila" | "prorrogação de ofício"
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.12** Monitoramento e prestação de contas: relatórios de execução do objeto, periodicidade e prazo, e quem do lado da administração analisa e em que prazo
  - fonte: Lei 13.019/2014, arts. 66 e 69 (`licitacoes.md` §4); `checklist.md` PC3
  - sinais: "prestação de contas" | "relatório de execução do objeto" | "monitoramento" | "comissão de monitoramento e avaliação"
  - confere: código
  - dispensa: nunca
- **PROP-PARCERIA.13** Frase de conformidade ("em conformidade com o item X do edital") só onde o texto confere com o item X; o que difere é dito como diferença
  - fonte: método da etapa 5, 4.2 (frase de conformidade que não confere é conflito grave); `experiencia.md` §7
  - sinais: "em conformidade com", "conforme o item" indicam que o código compara com o item citado
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O quadro de metas e indicadores é o do edital, palavra por palavra, sem meta a mais nem a menos? (art. 22, II e IV; método da etapa 2, 3.5)
- A folha mês a mês acompanha a rampa de contratação e o pico de trabalho, e o quadro fecha com a produtividade escrita (volume ÷ pessoas ÷ 21 dias úteis ≤ teto)? A conta é do código. (PC7)
- As parcelas da proposta são as do edital, na mesma ordem e percentual? Se não, o GP decidiu e a proposta diz por quê? (PROP-PARCERIA.8)
- O caixa cobre o pico de custo, ou a parcela que paga o pico tem a mesma fatia das outras? (PROP-PARCERIA.9; `experiencia.md` §1)
- Toda obrigação com custo do edital (equipamento para toda a equipe, internet no território) tem linha de despesa que a cobre? (método da etapa 5, 4.2)
- As exclusões são do objeto (o que é da rede, do contratante, dos municípios), e não de outro tipo de projeto? (método da etapa 4, 4.7; conflituoso, CP8)
- A prestação de contas e a análise da administração têm prazo, e o repasse seguinte depende dela? (PC3)

## Erros comuns
- Montar o preço por horas × valor-hora, ou com taxa de administração, numa parceria que se paga por parcela e equipe (método da etapa 2, seção 4).
- Trocar a ordem ou o percentual das parcelas e dizer que está "em conformidade com o item X do edital" (método da etapa 5, 4.2).
- Acrescentar metas, produtos ou números que o edital não pede (método da etapa 2, 3.5).
- Cronograma em trimestres ou fases que somam mais meses que a vigência; mês 1 da proposta diferente do mês 1 da vigência (método da etapa 3, 4.1).
- Lista de exclusões copiada de outro tipo de projeto (`experiencia.md` §7; CP8).
- Equipe descrita como "limite de contratação" quando o edital fala em "mínimo" (método da etapa 3, 4.1).

## Quando dispensar a parte inteira
Só se usa quando o regime é parceria da Lei 13.019 (termo de colaboração ou de fomento). Em licitação, não se aplica: o preço segue a `prop-preco` e o conteúdo técnico, o modelo do edital. Numa parceria, não se dispensa: é a própria proposta. Em porte pequeno, a folha e as despesas cabem numa tabela só, com as parcelas ao lado.
Linha para a tela: "Não se aplica: licitação (preço pela ficha PROP-PRECO)."

## Ligações
- **Vem de:** etapa 1 (regime, metas e indicadores, cronograma de desembolso e condição de cada parcela, pontos de atenção); modelo de plano de trabalho do edital; PROP-ESTRATEGIA, PROP-SOW, PROP-EQUIPE; curva de contratação e custos do GP.
- **Vai para:** termo assinado (o plano de trabalho costuma ser "parte integrante"); TAP7 e as divergências da etapa 3 (TAP-DV); A4 (caixa e reservas), B26 (rampa), A16 (metas como métricas) e A11 (aditivo ou apostila) na etapa 4; base do "ausente" da etapa 5 num plano de trabalho.

## Modelo de redação
```
1. Descrição da realidade e nexo com as metas: [2-3 parágrafos; edital p. X]
2. Metas e atividades: | Meta (edital p. X) | Atividades | Indicador | Fórmula | Fonte de verificação | Periodicidade |
3. Forma de execução: [por fase ou frente: o que se faz, quem faz, onde, com que sistema]
4. Equipe: | Função | Regra do edital (mínimo/referência/limite, p. X) | Mês 1 | Mês 2 | ... | Mês N |
   Substituição de pessoal: [regra]. Produtividade: [teto do edital, p. X, ou a definir pelo GP].
5. Despesas por natureza: | Natureza (tabela do edital) | Memória de cálculo | Valor (decisão do GP) | Parcela |
   Folha: salários e encargos por função [decisão do GP]; totais pelo código.
6. Cronograma de desembolso: | Parcela | % | Prazo | Condição | Igual ao edital? (código) |
7. Caixa (código): repasse acumulado × custo acumulado; folga em cada parcela; ponto mais apertado.
8. Premissas críticas: | PC | Premissa | Consequência | Reajuste (aditivo ou apostila, art. 57; prorrogação, art. 55) |
9. Monitoramento e prestação de contas: relatórios [periodicidade, edital p. X]; análise pela administração em [prazo do edital ou a definir pelo GP].
```

## Fontes
- Lei 13.019/2014: arts. 22, 46, 55, 57, 66 e 69, como resumidos em `licitacoes.md` §4 (conferir no texto oficial antes de citar literalmente).
- PMBOK 6: 4.1.3.1, p. 81 (PDF 117); 7.2, p. 241 (PDF 277); 7.3, p. 253 e 256 (PDF 289 e 292); 8.1.3.2, p. 287 (PDF 323); 9.1.3.1, p. 318 (PDF 354); 9.3, p. 330 (PDF 366).
- Métodos das etapas 2 (2.1, 3.5, 3.6 e seção 4), 3 (4.1), 4 (4.3 e 4.7) e 5 (4.2); decisões 0021, 0033 e 0034.
- `checklist.md` (PC1 a PC8); `experiencia.md` §1 e §7; fichas `prop-preco`, `prop-equipe`, `prop-metodologia`, `a04`.
