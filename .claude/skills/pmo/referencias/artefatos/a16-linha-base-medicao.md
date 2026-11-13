---
codigo: A16
nome: Linha de base da medição do desempenho
tipo: componente do plano
etapas: [4, 5]
gravidade: média
categoria: medição
sinonimos: ["linha de base integrada", "LMD", "PMB", "baseline integrada", "medição do desempenho", "indicadores de desempenho", "indicadores de acompanhamento", "painel de indicadores", "valor agregado"]
versao: 0.2.0
---

# A16 — Linha de base da medição do desempenho

## Para que serve
Junta escopo, cronograma e custos aprovados numa só referência: "Escopo, cronograma e linhas de base de custo integrados usados para comparação para gerenciar, medir e controlar a execução do projeto" (PMBOK 6, glossário, p. 714, PDF 750). Nasce em 4.2 (p. 88, PDF 124; X1.5, p. 642, PDF 678) e é usada em 5.6, 6.6 e 7.4. Aqui entram também os indicadores de acompanhamento (PMBOK 7, 2.7, p. 93–115, PDF 188–210).

## Conteúdo mínimo
- **A16.1** Remete às três linhas de base aprovadas (A13, A14, A15), com versão e data comuns
  - fonte: PMBOK 6, 4.2.3.1, p. 88 (PDF 124); glossário, p. 714 (PDF 750); PMBOK 7, artefatos, p. 188 (PDF 283); Rework RW-029 (https://resources.rework.com/libraries/project-management/project-baseline)
  - sinais: "linha de base da medição do desempenho" | "LMD" | "linha de base integrada" | "linha de base do escopo" | "linha de base do cronograma" | "linha de base dos custos"
  - confere: código
  - dispensa: nunca
- **A16.2** Critério de medição do progresso de cada produto ou pacote, fixado antes (0/100, 50/50, marcos ponderados, % físico; em consultoria, produto aprovado)
  - fonte: PMBOK 6, 7.4, p. 261 (PDF 297); 7.1.3.1, p. 238–239 (PDF 274–275); Rework RW-015 (https://resources.rework.com/libraries/project-management/earned-value-management)
  - sinais: "critério de medição" | "0/100" | "50/50" | "marcos ponderados" | "% concluído" | "produto aprovado"
  - confere: código
  - dispensa: nunca
- **A16.3** Valor planejado (VP) distribuído no tempo por produto ou pacote
  - fonte: PMBOK 6, 7.4, p. 261 (PDF 297); 7.3.3.1, p. 254 (PDF 290)
  - sinais: "valor planejado" | "VP" | "curva S" | "planejado acumulado"
  - confere: código
  - dispensa: porte pequeno
- **A16.4** Indicadores de valor agregado (VC, VPR, IDC, IDP) e da previsão (ENT), com a data dos dados; as contas são do código
  - fonte: PMBOK 6, 7.4, p. 262–265 e Tab. 7-1, p. 267 (PDF 298–301 e 303); PMBOK 7, 2.7.2, p. 100 e 104 (PDF 195 e 199)
  - sinais: "IDC" | "IDP" | "VA" | "CR" | "VC" | "VPR" | "ENT" | "data dos dados"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **A16.5** Forma simples de comparar planejado e real: custo planejado × real por período e produtos aprovados × previstos (ou burnup de produtos)
  - fonte: PMBOK 6, 7.4, p. 262 (PDF 298); PMBOK 7, 2.7.2, p. 100 (PDF 195); Rework RW-068 (https://resources.rework.com/libraries/project-management/burnup-chart)
  - sinais: "planejado × realizado" | "previsto × realizado" | "burnup" | "produtos aprovados" | "marcos cumpridos"
  - confere: código
  - dispensa: nunca
- **A16.6** Indicadores com meta, fórmula, fonte do dado, responsável e periodicidade, ligados aos objetivos do TAP e aos requisitos, incluindo pelo menos um de antecipação
  - fonte: PMBOK 7, 2.7.1.1, p. 95–96 (PDF 190–191); p. 97 (PDF 192); Rework RW-114 (https://resources.rework.com/libraries/productivity/set-tiered-goals-and-metrics)
  - sinais: tabela de indicadores com colunas de meta, fórmula, fonte, responsável e frequência | "indicador" | "KPI" | "meta"
  - confere: código
  - dispensa: nunca
- **A16.7** Limites por dimensão (prazo, custo, escopo) e plano de exceção: quem é acionado quando o limite é rompido
  - fonte: PMBOK 7, 2.7.5, p. 113–114 (PDF 208–209); PMBOK 6, 7.1.3.1, p. 238 (PDF 274)
  - sinais: "tolerância" | "limite" | "semáforo" | "gatilho" | "escalonamento" | "plano de exceção"
  - confere: código
  - dispensa: porte pequeno
- **A16.8** Cadência da medição e onde o resultado aparece (relatório de desempenho, painel, B7)
  - fonte: PMBOK 6, 7.4, p. 261 (PDF 297); PMBOK 7, 2.7.3, p. 106–110 (PDF 201–205)
  - sinais: "mensal" | "quinzenal" | "data de status" | "painel" | "relatório de desempenho"
  - confere: código
  - dispensa: nunca
- **A16.9** Revisão da linha de base só por mudança aprovada; nova linha de base só com variação severa, registrada
  - fonte: PMBOK 6, 7.4, p. 269 (PDF 305); Rework RW-015 e RW-029
  - sinais: "nova linha de base" | "rebaseline" | "mudança aprovada" | "revisão da linha de base"
  - confere: código
  - dispensa: nunca
- **A16.10** VP, VA e CR com a mesma definição de custo e a mesma unidade (horas ou reais)
  - fonte: PMBOK 6, 7.4, p. 261 (PDF 297)
  - sinais: "custos diretos" | "horas" | "mesma base"
  - confere: só PMO
  - dispensa: porte pequeno ou porte médio

## Perguntas de qualidade
- O critério de progresso foi fixado antes, ou o "% concluído" fica a critério de quem informa? (Rework RW-015)
- Os indicadores medem o que o TAP promete (produtos aceitos, prazos contratuais) ou só produção? Há métrica de vaidade? (PMBOK 7, p. 97 e 111–112, PDF 192 e 206–207)
- Metas do projeto (produtos entregues e aceitos) estão separadas de metas da política, que a FGV não controla sozinha? (Rework RW-114, observação do leitor)
- O limite rompido aciona alguém com nome de papel e prazo? (PMBOK 7, p. 114, PDF 209)
- Quem calcula IDC, IDP e ENT é o código; o plano só define fórmulas e dados (SKILL.md, princípio 6).

## Erros comuns
- Valor agregado começado tarde ou com critérios de % misturados (Rework RW-015).
- Refazer a linha de base a cada desvio, apagando a variação (Rework RW-029; PMBOK 6, p. 269, PDF 305).
- Ler a VPR como dias e esquecer o caminho crítico (PMBOK 6, p. 263, PDF 299; Rework RW-015).
- Só indicadores de espera, sem nenhum que antecipe problema (PMBOK 7, p. 95–96, PDF 190–191).

## Quando dispensar a parte inteira
O valor agregado completo serve sobretudo a projetos preditivos e muito grandes (PMBOK 7, p. 104, PDF 199); sem ele, compara-se planejado e real (PMBOK 6, p. 262, PDF 298). Em porte pequeno, o A16 pode ser fundido ao A4 ou ao A7: critério de progresso por produto, tabela planejado × real e os indicadores do TAP.
Linha para a tela: "Medição simplificada, sem valor agregado, junto com custos e comunicações: porte pequeno (PMBOK 7, p. 104; PMBOK 6, p. 262)."

## Ligações
- **Vem de:** 4.2 (X1.5); A13, A14 e A15; A4 e A3 (regras de medição; p. 182 e 238, PDF 218 e 274); TAP2 (objetivos e critérios de sucesso); requisitos R.
- **Vai para:** 5.6, 6.6 e 7.4 (comparação); B7 e B30 (previsões); A7 e B14 (relatórios e painel); A11 (mudança de linha de base); B27 (desvio que vira risco).

## Modelo de redação
```
1. Linhas de base integradas: A13 v[n], A14 v[n], A15 v[n], aprovadas em [data].
2. Progresso: sugere-se [0/100 por produto aprovado / marcos ponderados], porque [motivo].
3. Comparação: [valor agregado: VP, VA, CR, IDC, IDP, ENT / planejado × real e produtos aprovados × previstos].
4. Indicadores:
   | Indicador | Fórmula | Meta | Fonte do dado | Responsável | Frequência | Ligação (TAP/R) |
   Metas e limites: a definir pelo GP quando a RFP não fixar.
5. Limites e exceção: ao passar de [limite, a definir pelo GP] → [quem é acionado, em quanto tempo].
6. Cadência: [frequência]; resultado no [relatório/painel].
7. Revisão: só por mudança aprovada (A11).
```

## Fontes
- PMBOK 6: 4.2.3.1, p. 88 (PDF 124); 7.1.3.1, p. 238–239 (PDF 274–275); 7.4, p. 261–269 (PDF 297–305); X1.5, p. 642 (PDF 678); glossário, p. 714 (PDF 750).
- PMBOK 7: 2.7, p. 93–115 (PDF 188–210); artefatos, p. 188 (PDF 283).
- Rework: RW-015, RW-029, RW-068, RW-114 (links nos itens); RW-115 (https://resources.rework.com/libraries/productivity/measurement-continuous-improvement).
