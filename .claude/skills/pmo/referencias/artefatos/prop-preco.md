---
codigo: PROP-PRECO
nome: Proposta de preço e memória de cálculo
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["proposta de preço", "proposta comercial", "planilha de preços", "composição de custos", "memória de cálculo", "orçamento", "cronograma físico-financeiro"]
versao: 0.3.2
---

# PROP-PRECO — Proposta de preço e memória de cálculo

## Para que serve
Organiza o preço de baixo para cima, a partir das horas da EAP e das despesas, para o **código** fazer todas as contas com a tabela de valor-hora do GP (SKILL.md, princípio 6; especificação da etapa 2, passo 7). O PMO não soma nem multiplica: lista as categorias, os parâmetros e os riscos que pedem reserva. Estimativas por pacote, agregadas para cima, são as mais detalhadas (PMBOK 6, 7.2, p. 244, PDF 280). **Valor-hora, reserva e preço final são Decisão do GP.** Numa licitação, o edital manda: modelo da planilha, validade e pagamento vêm dele (Rework RW-076, adaptação). **A estrutura do preço segue o tipo de projeto** (SKILL.md, seção 3; método da etapa 2, 3.6): horas × valor-hora na consultoria por produtos (PROP-PRECO.1 a .5); folha da equipe mês a mês e despesas por natureza na operação contínua (PROP-PRECO.12 e .13), e, na parceria da Lei 13.019, pela ficha `prop-parceria`; planilha do edital, item a item, no preço por posto ou item (PROP-PRECO.7).

## Conteúdo mínimo
- **PROP-PRECO.1** Memória de cálculo de baixo para cima: horas por perfil e por pacote da EAP × valor-hora, com as contas feitas pelo código (consultoria por produtos; na operação contínua, PROP-PRECO.13)
  - fonte: PMBOK 6, 7.2, bottom-up, p. 244 (PDF 280); Rework RW-014; SKILL.md, princípio 6
  - sinais: "memória de cálculo" | "horas" | "valor-hora" | tabela perfil × horas × valor
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.2** Valor-hora de cada perfil vindo da tabela do GP; sem ela, o campo fica em branco
  - fonte: SKILL.md, princípios 1 e 2; especificação da etapa 2, passo 7
  - sinais: "valor-hora" | "a definir pelo GP" | "decisão do GP" | célula vazia
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.3** Despesas diretas por categoria (viagens, diárias, campo, logística, materiais, serviços de terceiros), com quantidade e unidade e valor a definir pelo GP
  - fonte: PMBOK 6, 7.2, p. 241 (PDF 277) (cobertura de todos os recursos); Rework RW-014 (categorias)
  - sinais: "despesas" | "viagens" | "diárias" | "passagens" | "logística" | "materiais"
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.4** Despesas de campo por território, com a base de quantidade (deslocamentos, dias, equipe)
  - fonte: `experiencia.md` §5; SKILL.md, etapa 2, passo 7
  - sinais: nome do território ou município | "por território" | "deslocamentos" | "dias de campo"
  - confere: código
  - dispensa: sem campo
- **PROP-PRECO.5** Tributos e custos indiretos como parâmetros nomeados, com valor a definir pelo GP
  - fonte: PMBOK 6, 7.2, p. 241 (PDF 277); Rework RW-014 (não omitir indiretos); especificação da etapa 2, passo 7
  - sinais: "tributos" | "impostos" | "custos indiretos" | "BDI" | "taxa de administração" | "parâmetro"
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.6** Reserva de contingência sugerida a partir dos riscos (destinos "reserva" de PROP-ESTRATEGIA.8), cada linha com a origem; valor e forma de aparecer na planilha decididos pelo GP, conforme o edital
  - fonte: PMBOK 6, 7.2, análise de reservas, p. 245 (PDF 281); 11.5, p. 439 e 443 (PDF 475 e 479); Rework RW-014, adaptação; `licitacoes.md` 2.5
  - sinais: "reserva" | "contingência" | origem do risco | "decisão do GP"
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.7** Planilha no formato do edital (itens, quantidades, unitários, totais, tributos), quando houver modelo
  - fonte: Rework RW-076, adaptação; especificação da etapa 2, passo 7
  - sinais: "planilha" | "modelo de proposta de preço" | colunas iguais às do modelo
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.8** Desembolso como o edital define (por produto aceito, por medição), e o período sem pagamento até a primeira parcela informado ao GP
  - fonte: PMBOK 6, 12.3, p. 494 (PDF 530); Rework RW-078, adaptação; `checklist.md` PC3 (CTR5); `licitacoes.md` 2.6 (art. 145)
  - sinais: "cronograma de desembolso" | "parcela" | "primeira parcela" | "físico-financeiro"
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.9** Conferência contra o valor estimado do edital, quando divulgado, feita pelo código
  - fonte: PMBOK 6, 12.1, estimativas independentes, p. 479 (PDF 515) e 12.2, p. 485 (PDF 521); especificação da etapa 2, passo 7
  - sinais: "valor estimado" | "orçamento estimado" | "valor de referência"
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.10** Alerta de inexequibilidade só pela regra do edital, ou pela do art. 59, § 4º, se o objeto for obra ou serviço de engenharia; fora disso, sem percentual
  - fonte: `licitacoes.md` 2.9
  - sinais: "inexequível" | "exequibilidade" | regra do edital com página
  - confere: código
  - dispensa: nunca
- **PROP-PRECO.11** Estratégias de preço só como sugestão, sem âncora, desconto ou opções; preço final como Decisão do GP
  - fonte: Rework RW-073 e RW-074, adaptação; SKILL.md, etapa 2, passo 7
  - sinais: "sugere-se" | "decisão do GP" | "preço final"
  - confere: só PMO
  - dispensa: nunca
- **PROP-PRECO.12** Estrutura do preço pelo tipo de projeto: horas × valor-hora na consultoria por produtos; folha mês a mês e despesas por natureza, sem valor-hora, na operação contínua; planilha do edital no preço por posto ou item; as duas primeiras por frente, no híbrido
  - fonte: método da etapa 2, 3.6; SKILL.md, seção 3 (tipo de projeto); PMBOK 6, 7.2, p. 241 (PDF 277) (estimativa pelo tipo de recurso)
  - sinais: estrutura do preço coerente com o tipo de projeto confirmado pelo GP
  - confere: só PMO
  - dispensa: nunca
- **PROP-PRECO.13** Operação contínua: quadro de pessoal por função e mês ao longo da vigência (a rampa de contratação), com salário e encargos como Decisão do GP, e as despesas que crescem com a equipe (equipamentos, deslocamento, capacitação, reposição por rotatividade) ligadas ao quadro; totais pelo código
  - fonte: método da etapa 2, 3.6; método da etapa 4, 4.3; `experiencia.md` §4 e §5; PMBOK 6, 7.2, p. 241 (PDF 277)
  - sinais: "folha" | "mês a mês" | "encargos" | "quadro de pessoal" | "rampa" | tabela função × mês
  - confere: código
  - dispensa: pagamento por produto
- **PROP-PRECO.14** Conferências de preço feitas pelo código: tabela de pontos por preço pela regra do edital e caixa (parcelas ou medições, com percentual, prazo e condição, × custo acumulado mês a mês), com a folga em cada parcela e o ponto mais apertado
  - fonte: método da etapa 2, 3.6; ficha `a04` (caixa); `checklist.md` PC3 (pagamento preso a aprovação)
  - sinais: "pontos por preço" | "economicidade" | "caixa" | "folga" | "custo acumulado"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- Toda hora do preço vem de uma atividade da EAP, e toda atividade tem horas? (PMBOK 6, p. 244)
- Os riscos com destino "reserva" entraram, e nenhuma reserva aparece sem origem? (PMBOK 6, p. 245)
- O preço sustenta o que a proposta técnica promete (campo, oficinas, revisões)? (Rework RW-071)
- A planilha permite reserva em linha própria, ou ela precisa estar nas premissas ou nos indiretos? (Rework RW-014, adaptação)
- O GP sabe quanto do trabalho fica sem pagamento até a primeira parcela, inclusive o prazo de aceite? (Rework RW-078, adaptação; PC3, CTR5)

## Erros comuns
- O PMO calculando totais ou dizendo que o preço "está alto" (SKILL.md, princípio 6).
- Omitir indiretos ou integração e revisões (Rework RW-014).
- Estimativa ancorada no valor estimado do edital, sem conta de baixo para cima (Rework RW-014).
- Deslocamento de campo fora do preço (`experiencia.md` §5).
- Horas × valor-hora ou taxa de administração numa operação contínua paga por parcela ou posto (método da etapa 2, seção 4).
- Caixa olhado parcela a parcela, sem o acumulado: o alerta no pico sai exagerado (método da etapa 4, 4.3).
- Erro de conta ou de formato na planilha, que pode desclassificar (Rework RW-076, adaptação).

## Quando dispensar a parte inteira
Não se dispensa quando o edital pede preço. Em porte pequeno, a memória de cálculo pode ser uma tabela só, com horas, despesas e parâmetros.
Linha para a tela: "Preço em tabela única com parâmetros: porte pequeno."

## Ligações
- **Vem de:** tipo de projeto (SKILL.md, seção 3); PROP-EQUIPE (horas ou quadro por função e mês); PROP-EAP; PROP-METODOLOGIA (campo); PROP-ESTRATEGIA.8 (reserva); etapa 1 (planilha, valor estimado, regra de exequibilidade, pagamento); tabela de valor-hora do GP.
- **Vai para:** planilha XLSX; PROP-MATRIZ; TAP7; A4, A15 e B6 na etapa 4.

## Modelo de redação
```
1. Pessoal: | Perfil | Horas (PROP-EQUIPE) | Valor-hora (tabela do GP) | Subtotal (código) |
2. Despesas: | Categoria | Território | Quantidade | Unidade | Valor unitário (GP) | Subtotal (código) |
3. Parâmetros: tributos [a definir pelo GP]; indiretos [a definir pelo GP].
4. Reserva sugerida: | Risco (origem) | Por que pede reserva | Valor (decisão do GP) |
5. Planilha do edital: [modelo, doc, p.]. Desembolso: [regra do edital, doc, p.].
6. Conferências (código): valor estimado [doc, p.]; exequibilidade [regra, doc, p.].
Operação contínua, no lugar do item 1:
1. Pessoal: | Função | Mês 1 | Mês 2 | ... | Mês N | Salário e encargos (decisão do GP) | Subtotal (código) |
   Despesas que crescem com a equipe: | Natureza | Base (por pessoa, por mês) | Valor (GP) |
7. Caixa e pontos (código): folga em cada parcela; ponto mais apertado; pontos por faixa de desconto.
Preço final: decisão do GP.
```

## Fontes
- PMBOK 6: 7.2, p. 241, 244 e 245 (PDF 277, 280 e 281); 11.5, p. 439 e 443 (PDF 475 e 479); 12.1, p. 479 (PDF 515); 12.2, p. 485 (PDF 521); 12.3, p. 494 (PDF 530).
- Rework: RW-014 (https://resources.rework.com/libraries/project-management/project-cost-estimation); RW-071 (https://resources.rework.com/libraries/deal-closing/proposal-development); RW-073 (https://resources.rework.com/libraries/deal-closing/pricing-strategies); RW-074 (https://resources.rework.com/libraries/deal-closing/pricing-negotiation); RW-076 (https://resources.rework.com/libraries/deal-closing/quote-generation); RW-078 (https://resources.rework.com/libraries/deal-closing/payment-terms).
- `licitacoes.md` 2.5, 2.6 e 2.9; `checklist.md` PC3; `experiencia.md` §5; SKILL.md, princípios 1, 2 e 6, etapa 2.
