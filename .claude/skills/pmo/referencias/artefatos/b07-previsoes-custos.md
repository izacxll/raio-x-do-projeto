---
codigo: B7
nome: Previsões de custos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: custo
sinonimos: ["previsão de custos", "estimativa no término", "ENT", "EAC", "projeção de custos", "custo projetado", "previsão de gastos"]
versao: 0.2.0
---

# B7 — Previsões de custos

## Para que serve
Registra a estimativa no término (ENT), feita de baixo para cima ou por fórmula, e a comunica às partes interessadas (PMBOK 6, 7.4.3.2, p. 269, PDF 305). Sai de 7.4 e vai para 4.5. **Só ganha conteúdo na execução:** no PGP sai como modelo inicial, com os campos e a linha de base de referência, sem números inventados (decisão 0007, passo 12).

## Conteúdo mínimo
- **B7.1** Data dos dados e período a que a previsão se refere
  - fonte: PMBOK 6, 7.4, Tab. 7-1, p. 267 (PDF 303); 7.4.3.2, p. 269 (PDF 305)
  - sinais: "data dos dados" | "data de status" | "período de referência"
  - confere: código
  - dispensa: nunca
- **B7.2** Orçamento no término (ONT) de referência, com a versão da linha de base vigente
  - fonte: PMBOK 6, 7.4, p. 261 e 267 (PDF 297 e 303)
  - sinais: "ONT" | "orçamento no término" | "linha de base" | "versão"
  - confere: código
  - dispensa: nunca
- **B7.3** Custo real acumulado (CR) até a data, com a mesma definição de custo da linha de base
  - fonte: PMBOK 6, 7.4, p. 260–261 (PDF 296–297)
  - sinais: "custo real" | "CR" | "realizado" | "gasto até a data"
  - confere: código
  - dispensa: nunca
- **B7.4** ENT e EPT, com o método (bottom-up ou fórmula) e a premissa do cenário
  - fonte: PMBOK 6, 7.4, p. 264–265 (PDF 300–301); Rework RW-015 (https://resources.rework.com/libraries/project-management/earned-value-management)
  - sinais: "ENT" | "estimativa no término" | "EPT" | "estimativa para terminar" | "bottom-up" | "premissa"
  - confere: código
  - dispensa: nunca
- **B7.5** Variação no término (VNT) frente ao orçamento, calculada pelo código
  - fonte: PMBOK 6, 7.4, p. 262 (PDF 298); Tab. 7-1, p. 267 (PDF 303)
  - sinais: "VNT" | "variação no término" | "acima do orçamento" | "abaixo do orçamento"
  - confere: código
  - dispensa: nunca
- **B7.6** Índices IDC e IDPT, quando houver valor agregado
  - fonte: PMBOK 6, 7.4, p. 263 e 266 (PDF 299 e 302)
  - sinais: "IDC" | "IDPT" | "índice de desempenho"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **B7.7** Situação das reservas: contingência usada e restante; necessidade de reserva gerencial
  - fonte: PMBOK 6, 7.4, p. 265 (PDF 301)
  - sinais: "reserva" | "contingência utilizada" | "saldo da contingência" | "reserva gerencial"
  - confere: código
  - dispensa: nunca
- **B7.8** Encaminhamento quando a previsão passa do limite (ação corretiva, solicitação de mudança, escalonamento)
  - fonte: PMBOK 6, 7.4, p. 259 e 268 (PDF 295 e 304); PMBOK 7, 2.7.5, p. 114 (PDF 209)
  - sinais: "ação corretiva" | "solicitação de mudança" | "escalonamento" | "plano de exceção"
  - confere: código
  - dispensa: nunca
- **B7.9** No PGP, modelo sem dados inventados: campos vazios ou "a preencher na execução"
  - fonte: decisão 0007, passo 12; SKILL.md, etapa 4
  - sinais: "a preencher" | "modelo" | campos em branco
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O modelo diz quem prepara a previsão, com que frequência e para quem vai? (PMBOK 6, p. 269, PDF 305; A16.8)
- A ENT de baixo para cima é a principal, e as fórmulas servem para comparar cenários? (PMBOK 6, p. 264, PDF 300)
- Uma previsão ruim aciona alguém, ou só é registrada? (PMBOK 7, p. 114, PDF 209)
- Se a ENT supera o ONT, o modelo prevê a passagem pelo controle de mudanças (A11) e, no contrato, aditivo ou reequilíbrio? (`licitacoes.md` 2.7)

## Erros comuns
- Previsão que repete o ONT por inércia, sem olhar o trabalho restante (PMBOK 6, p. 264, PDF 300).
- Supor que o desempenho vai melhorar sem base na análise de riscos (PMBOK 6, p. 265, PDF 301).
- Acompanhar custo sem valor agregado ou sem produtos aprovados, o que mostra gasto e não progresso (Rework RW-015).
- Modelo inicial preenchido com números de exemplo, que viram falso fato (SKILL.md, princípio 2).

## Quando dispensar a parte inteira
Sem valor agregado formal, compara-se custo planejado e real (PMBOK 6, p. 262, PDF 298), e a previsão pode ser uma linha "custo previsto no término" no relatório de desempenho. Em porte pequeno, funde-se com o relatório de status (Rework RW-022: orçamento aprovado, gasto e previsão).
Linha para a tela: "Previsão de custos como linha do relatório de status: porte pequeno (PMBOK 6, p. 262; Rework RW-022)."

## Ligações
- **Vem de:** 7.4, com A4, A15, A16 e os dados de desempenho (custos autorizados, incorridos, faturados e pagos; p. 260, PDF 296).
- **Vai para:** 4.5 (Monitorar e Controlar o Trabalho); 11.4 e 11.5; A7 e B14 (relatórios); A11 (se pedir mudança de orçamento).

## Modelo de redação
```
Previsão de custos — modelo inicial (a preencher na execução)
Data dos dados: [ ]     Linha de base: A15 v[n]     ONT: [da A15]
| Item | Valor | Observação |
| Custo real acumulado (CR) | [ ] | definição de custo igual à da A15 |
| Estimativa para terminar (EPT) | [ ] | método: [bottom-up / fórmula], premissa: [ ] |
| Estimativa no término (ENT) | [código] | |
| Variação no término (VNT) | [código] | |
| IDC / IDPT (se houver valor agregado) | [código] | |
| Contingência usada / restante | [ ] | riscos R-xx do B27 |
Encaminhamento se passar do limite [a definir pelo GP]: [ação, responsável].
Frequência: [conforme A16]; destinatários: [conforme A7].
```

## Fontes
- PMBOK 6: 7.4, p. 259–269 (PDF 295–305), Tab. 7-1, p. 267 (PDF 303).
- PMBOK 7: 2.7.2, p. 104–105 (PDF 199–200); 2.7.5, p. 114 (PDF 209).
- Rework: RW-015 (link no item); RW-022 (https://resources.rework.com/libraries/project-management/project-status-report).
- Decisão 0007; `licitacoes.md` 2.7.
