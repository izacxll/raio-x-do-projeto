---
codigo: A4
nome: Plano de gerenciamento dos custos
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: custo
sinonimos: ["plano de custos", "plano de gerenciamento de custos", "gestão de custos", "gerenciamento dos custos", "gestão financeira do projeto", "plano financeiro", "metodologia de custos"]
versao: 0.2.0
---

# A4 — Plano de gerenciamento dos custos

## Para que serve
Componente que diz "como os custos serão planejados, estruturados e controlados" (PMBOK 6, glossário, p. 719, PDF 755). Sai de 7.1 (p. 235, PDF 271), com base no TAP (recursos pré-aprovados e requisitos de aprovação) e nos planos do cronograma e dos riscos. Não é a estimativa (B6) nem a linha de base (A15): é a regra do jogo para as duas.

## Conteúdo mínimo
- **A4.1** Unidades de medida de cada tipo de recurso (horas de pessoal por perfil, diárias, moeda)
  - fonte: PMBOK 6, 7.1.3.1, p. 238 (PDF 274); 7.2, p. 241 (PDF 277)
  - sinais: "unidade de medida" | "horas" | "homem-hora" | "hora técnica" | "diária" | "R$"
  - confere: código
  - dispensa: nunca
- **A4.2** Método de estimativa: horas × perfil × valor-hora mais despesas, e a técnica usada (bottom-up, análoga, paramétrica, três pontos)
  - fonte: PMBOK 6, 7.2, p. 241 e 244–245 (PDF 277 e 280–281); Rework RW-014 (https://resources.rework.com/libraries/project-management/project-cost-estimation)
  - sinais: "bottom-up" | "valor-hora" | "perfil" | "horas por atividade" | "análoga" | "paramétrica" | "três pontos"
  - confere: código
  - dispensa: nunca
- **A4.3** Nível de precisão (arredondamento) e de exatidão (faixa aceita, compatível com a fase do documento)
  - fonte: PMBOK 6, 7.1.3.1, p. 238 (PDF 274); 7.2, p. 241 (PDF 277)
  - sinais: "precisão" | "arredondamento" | "exatidão" | "faixa" | "±" | "ordem de grandeza" | "definitiva"
  - confere: código
  - dispensa: porte pequeno
- **A4.4** Estrutura do orçamento ligada à EAP: custos agregados por pacote ou produto (contas de controle) e código contábil ou centro de custo
  - fonte: PMBOK 6, 7.1.3.1, p. 238–239 (PDF 274–275); 7.3, p. 252 (PDF 288)
  - sinais: "conta de controle" | "centro de custo" | "por produto" | "por pacote de trabalho" | "EAP" | "código"
  - confere: código
  - dispensa: nunca
- **A4.5** Tratamento das reservas: contingência dentro da linha de base, ligada ao registro dos riscos; gerencial fora, usada só por mudança aprovada. Valores: Decisão do GP
  - fonte: PMBOK 6, 7.2, p. 245 (PDF 281); 7.3, p. 252 (PDF 288); PMBOK 7, 2.4.2.4, p. 62–63 (PDF 157–158)
  - sinais: "reserva de contingência" | "reserva gerencial" | "reserva de gerenciamento" | "decisão do GP" | "uso da reserva"
  - confere: código
  - dispensa: nunca
- **A4.6** Limites de controle: desvio admitido antes de agir (percentual sobre a linha de base) e o que se faz quando é ultrapassado
  - fonte: PMBOK 6, 7.1.3.1, p. 238 (PDF 274); PMBOK 7, 2.7.5, p. 113–114 (PDF 208–209)
  - sinais: "limite de controle" | "tolerância" | "desvio" | "variação" | "semáforo" | "plano de exceção"
  - confere: código
  - dispensa: porte pequeno
- **A4.7** Regras de medição do desempenho: critério de progresso por produto ou pacote (0/100, marcos ponderados, % completo) e forma de calcular a ENT
  - fonte: PMBOK 6, 7.1.3.1, p. 238–239 (PDF 274–275); Rework RW-015 (https://resources.rework.com/libraries/project-management/earned-value-management)
  - sinais: "valor agregado" | "0/100" | "marcos ponderados" | "percentual completo" | "ENT" | "IDC"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **A4.8** Formato e frequência dos relatórios de custos, separando o interno (FGV) do que vai ao contratante
  - fonte: PMBOK 6, 7.1.3.1, p. 239 (PDF 275); Rework RW-022 (https://resources.rework.com/libraries/project-management/project-status-report)
  - sinais: "relatório de custos" | "orçado × realizado" | "previsto × realizado" | "mensal" | "frequência"
  - confere: código
  - dispensa: nunca
- **A4.9** Ligação com as regras do contrato: evento de faturamento (entrega ou aceite), cronograma de desembolso e índice de reajuste, quando houver
  - fonte: PMBOK 6, 7.3, p. 253 e 256 (PDF 289 e 292); `licitacoes.md` 2.6; `checklist.md` PC3
  - sinais: "cronograma de desembolso" | "físico-financeiro" | "parcela" | "nota fiscal" | "pagamento" | "reajuste" | "medição"
  - confere: código
  - dispensa: nunca
- **A4.10** Procedimento de registro dos custos reais (apontamento de horas, despesas) e quem aprova gastos
  - fonte: PMBOK 6, 7.1.1, p. 237 (PDF 273); 7.1.3.1, p. 239 (PDF 275)
  - sinais: "apontamento de horas" | "registro de horas" | "timesheet" | "custo real" | "aprovação de despesas"
  - confere: código
  - dispensa: nunca
- **A4.11** Formalidade proporcional: se estimar e orçar são fundidos e se haverá valor agregado, com o motivo
  - fonte: PMBOK 6, p. 231 e 234 (PDF 267 e 270); X5.4, p. 681 (PDF 717)
  - sinais: "simplificado" | "sem valor agregado" | "porte"
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O plano diz em que evento a FGV fatura (entrega ou aceite) e quanto do trabalho fica sem pagamento até a primeira parcela? (PC3; `experiencia.md` §1; Rework RW-078, observação do leitor)
- A contingência está ligada a riscos do B27, e a reserva gerencial tem dono e condição de uso? Valores ficam com o GP (SKILL.md, princípio 1).
- A definição de custo (só diretos ou com indiretos) é a mesma no orçamento e no acompanhamento? (PMBOK 6, p. 261, PDF 297)
- A exatidão declarada é coerente com a fase? Proposta e plano não estão no mesmo ponto do cone (Rework RW-040).

## Erros comuns
- Acompanhar só o gasto, sem olhar o trabalho que ele comprou (PMBOK 6, p. 259, PDF 295; Rework RW-015).
- Reserva escondida nas horas, sem linha nem regra de uso (PMBOK 6, p. 245, PDF 281).
- Misturar estimativa e preço negociado sem registrar a diferença (Rework RW-014).

## Quando dispensar a parte inteira
Não se dispensa: todo contrato tem valor e pagamento. Em porte pequeno, estimar e orçar podem ser um processo só (PMBOK 6, p. 231, PDF 267), e o A4 vira seção curta junto ao A15: unidade, método, reservas, relatório e ligação com o pagamento, sem valor agregado.
Linha para a tela: "Custos simplificados, junto com a linha de base: porte pequeno (PMBOK 6, p. 231 e 234)."

## Ligações
- **Vem de:** 7.1, com TAP7 e TAP9 (p. 236, PDF 272), A3 e A8; proposta (planilha de preço, horas por perfil); cláusulas de pagamento, medição e reajuste da RFP.
- **Vai para:** 7.2 (B6, B4), 7.3 (A15), 7.4 (B7); A16; B27 (contingência); A11; A7 (relatórios).

## Modelo de redação
```
1. Unidades: pessoal em [horas por perfil]; despesas em reais.
2. Método: sugere-se bottom-up por produto: horas × perfil × valor-hora [decisão do GP] + despesas.
3. Exatidão: [faixa, a definir pelo GP], compatível com [fase].
4. Estrutura: custos por [produto/pacote da EAP]; centro de custo [a definir pelo GP].
5. Reservas: contingência ligada aos riscos do B27; gerencial fora da linha de base, uso por mudança aprovada. Valores: decisão do GP.
6. Limites de controle: [a definir pelo GP]; ao ultrapassar → [ação].
7. Medição: critério [0/100 por produto aprovado / outro]; valor agregado [sim/não, motivo].
8. Relatórios: interno e ao contratante, [frequência]. Horas registradas em [ferramenta].
9. Contrato: faturamento contra [entrega/aceite] ([cláusula, página]); reajuste [índice ou não informado].
```

## Fontes
- PMBOK 6: 7.1, p. 235–239 (PDF 271–275); 7.2, p. 241–245 (PDF 277–281); 7.3, p. 252–256 (PDF 288–292); 7.4, p. 259–261 (PDF 295–297); p. 231 e 234 (PDF 267 e 270); X5.4, p. 681 (PDF 717); glossário, p. 719 (PDF 755).
- PMBOK 7: 2.4.2.4, p. 62–63 (PDF 157–158); 2.7.5, p. 113–114 (PDF 208–209).
- Rework: RW-014, RW-015, RW-022 (links nos itens); RW-040 (https://resources.rework.com/libraries/project-management/cone-of-uncertainty); RW-078 (https://resources.rework.com/libraries/deal-closing/payment-terms).
- `licitacoes.md` 2.6; `checklist.md` (PC3); `experiencia.md` §1.
