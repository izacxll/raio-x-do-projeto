---
codigo: PROP-PRECO
nome: Proposta de preço e memória de cálculo
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["proposta de preço", "proposta comercial", "planilha de preços", "composição de custos", "memória de cálculo", "orçamento", "cronograma físico-financeiro"]
versao: 0.2.0
---

# PROP-PRECO — Proposta de preço e memória de cálculo

## Para que serve
Organiza o preço de baixo para cima, a partir das horas da EAP e das despesas, para o **código** fazer todas as contas com a tabela de valor-hora do GP (SKILL.md, princípio 6; especificação da etapa 2, passo 7). O PMO não soma nem multiplica: lista as categorias, os parâmetros e os riscos que pedem reserva. Estimativas por pacote, agregadas para cima, são as mais detalhadas (PMBOK 6, 7.2, p. 244, PDF 280). **Valor-hora, reserva e preço final são Decisão do GP.** Numa licitação, o edital manda: modelo da planilha, validade e pagamento vêm dele (Rework RW-076, adaptação).

## Conteúdo mínimo
- **PROP-PRECO.1** Memória de cálculo de baixo para cima: horas por perfil e por pacote da EAP × valor-hora, com as contas feitas pelo código
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
- Erro de conta ou de formato na planilha, que pode desclassificar (Rework RW-076, adaptação).

## Quando dispensar a parte inteira
Não se dispensa quando o edital pede preço. Em porte pequeno, a memória de cálculo pode ser uma tabela só, com horas, despesas e parâmetros.
Linha para a tela: "Preço em tabela única com parâmetros: porte pequeno."

## Ligações
- **Vem de:** PROP-EQUIPE (horas); PROP-EAP; PROP-METODOLOGIA (campo); PROP-ESTRATEGIA.8 (reserva); etapa 1 (planilha, valor estimado, regra de exequibilidade, pagamento); tabela de valor-hora do GP.
- **Vai para:** planilha XLSX; PROP-MATRIZ; TAP7; A4, A15 e B6 na etapa 4.

## Modelo de redação
```
1. Pessoal: | Perfil | Horas (PROP-EQUIPE) | Valor-hora (tabela do GP) | Subtotal (código) |
2. Despesas: | Categoria | Território | Quantidade | Unidade | Valor unitário (GP) | Subtotal (código) |
3. Parâmetros: tributos [a definir pelo GP]; indiretos [a definir pelo GP].
4. Reserva sugerida: | Risco (origem) | Por que pede reserva | Valor (decisão do GP) |
5. Planilha do edital: [modelo, doc, p.]. Desembolso: [regra do edital, doc, p.].
6. Conferências (código): valor estimado [doc, p.]; exequibilidade [regra, doc, p.].
Preço final: decisão do GP.
```

## Fontes
- PMBOK 6: 7.2, p. 241, 244 e 245 (PDF 277, 280 e 281); 11.5, p. 439 e 443 (PDF 475 e 479); 12.1, p. 479 (PDF 515); 12.2, p. 485 (PDF 521); 12.3, p. 494 (PDF 530).
- Rework: RW-014 (https://resources.rework.com/libraries/project-management/project-cost-estimation); RW-071 (https://resources.rework.com/libraries/deal-closing/proposal-development); RW-073 (https://resources.rework.com/libraries/deal-closing/pricing-strategies); RW-074 (https://resources.rework.com/libraries/deal-closing/pricing-negotiation); RW-076 (https://resources.rework.com/libraries/deal-closing/quote-generation); RW-078 (https://resources.rework.com/libraries/deal-closing/payment-terms).
- `licitacoes.md` 2.5, 2.6 e 2.9; `checklist.md` PC3; `experiencia.md` §5; SKILL.md, princípios 1, 2 e 6, etapa 2.
