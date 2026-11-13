---
codigo: B30
nome: Previsões do cronograma
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: tempo
sinonimos: ["previsões do cronograma", "previsão do cronograma", "previsão de término", "data prevista de término", "projeção do cronograma", "tendência do cronograma", "término previsto"]
versao: 0.2.0
---

# B30 — Previsões do cronograma

## Para que serve
Estimativas de datas e condições futuras feitas com o que se sabe na data do status, a partir do desempenho passado e do esperado, considerando as ações corretivas; podem trazer indicadores de valor agregado e a situação das reservas (PMBOK 6, 6.6, p. 228, PDF 264; glossário, p. 720, PDF 756). **Só nasce na execução** (6.6; Padrão, cap. 5, p. 613–632, PDF 649–668). Na etapa 4 sai como modelo vazio, sem acontecimentos inventados (SKILL.md, etapa 4).

## Conteúdo mínimo
- **B30.1** Data de status (data dos dados) e versão da previsão
  - fonte: PMBOK 6, 6.6, p. 228 (PDF 264) (atualizadas e republicadas); Fig. 6-21, p. 219 (PDF 255)
  - sinais: "data de status" | "data dos dados" | "posição em" | "previsão revisada em" | "versão"
  - confere: código
  - dispensa: nunca
- **B30.2** Data prevista de término do projeto e de cada marco contratual, ao lado da data da linha de base (A14) e do prazo do contrato
  - fonte: PMBOK 6, 6.6, p. 226–228 (PDF 262–264); PMBOK 7, 2.7, p. 104–105 (PDF 199–200)
  - sinais: "término previsto" | "data prevista" | "linha de base" | "variação" | colunas previsto × planejado
  - confere: código
  - dispensa: nunca
- **B30.3** Base da previsão: método (opinião, tendência, valor agregado, simulação) e ações corretivas consideradas
  - fonte: PMBOK 6, 6.6, p. 228 (PDF 264); PMBOK 7, 2.7, p. 104–105 (PDF 199–200)
  - sinais: "com base em" | "tendência" | "ritmo atual" | "considerando a ação" | "método de previsão"
  - confere: código
  - dispensa: nunca
- **B30.4** Reserva de cronograma remanescente e quanto já foi consumido
  - fonte: PMBOK 6, 6.6, p. 228 (PDF 264); 6.6, p. 224 (PDF 260) (uso da reserva); A3.7
  - sinais: "reserva remanescente" | "contingência consumida" | "saldo de reserva" | "buffer"
  - confere: código
  - dispensa: porte pequeno
- **B30.5** Indicadores de prazo do valor agregado (VPR, IDP), quando o A3 os prevê
  - fonte: PMBOK 6, 6.6, p. 228 (PDF 264); 6.1.3.1, p. 182 (PDF 218); Rework RW-015 (https://resources.rework.com/libraries/project-management/earned-value-management)
  - sinais: "VPR" | "IDP" | "SPI" | "valor agregado" | "prazo agregado"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **B30.6** Previsão probabilística (por exemplo, P50 e P80) quando houver simulação
  - fonte: PMBOK 6, 6.5, p. 213–214 (PDF 249–250); Rework RW-013 (https://resources.rework.com/libraries/project-management/monte-carlo-simulation)
  - sinais: "Monte Carlo" | "P50" | "P80" | "probabilidade de cumprir" | curva S
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **B30.7** Caminho crítico e caminhos quase críticos reavaliados na previsão
  - fonte: PMBOK 6, 6.6, p. 227 (PDF 263); Rework RW-015 (o IDP não diz quais atividades atrasam o fim)
  - sinais: "caminho crítico" | "quase crítico" | "folga remanescente"
  - confere: só PMO
  - dispensa: porte pequeno
- **B30.8** Gatilho: previsão além do limite de controle leva a ação corretiva ou solicitação de mudança
  - fonte: PMBOK 6, 6.6, p. 229 (PDF 265); PMBOK 7, 2.7.5, p. 114 (PDF 209) (plano de exceção)
  - sinais: "limite de controle" | "tolerância" | "solicitação de mudança" | "escalonamento" | "plano de exceção"
  - confere: código
  - dispensa: porte pequeno
- **B30.9** Na etapa 4, só a estrutura (campos, periodicidade, onde se publica); nenhum valor de desempenho preenchido
  - fonte: SKILL.md, etapa 4; PMBOK 6, Padrão, cap. 5, p. 613–632 (PDF 649–668) (as previsões nascem no monitoramento)
  - sinais: datas previstas, variações ou índices preenchidos num plano ainda não executado
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O modelo diz de onde vêm os dados de andamento e com que frequência a previsão é refeita (A3.9)?
- A previsão compara com os prazos do contrato, e não só com a linha de base interna? (PC4)
- O atraso de aprovação do contratante aparece separado do atraso de produção? (PC3; experiencia.md §1)
- Na etapa 4: algum campo traz número ou acontecimento que só a execução poderia dar? (SKILL.md, princípio 2)

## Erros comuns
- Inventar andamento no plano; o modelo inicial é só estrutura (SKILL.md, etapa 4).
- Ler a variação de prazos do valor agregado como dias; ela vem em dinheiro ou horas (Rework RW-015).
- Olhar só o IDP e esquecer o caminho crítico: atraso pequeno em atividade crítica pesa mais que atraso grande fora dela (PMBOK 6, p. 227, PDF 263).
- Tomar o P50 como data segura ou o P80 como pior caso (Rework RW-013).
- Refazer a linha de base com frequência para a previsão parecer boa (Rework RW-015).

## Quando dispensar a parte inteira
Na etapa 4, pode ser dispensada como documento próprio: não há desempenho para prever. Basta prever no relatório de status (A7) um campo de previsão de término por marco, já que o PMBOK 7 põe previsões de prazo no relatório de status (artefatos, p. 190, PDF 285). Em porte pequeno, a previsão é essa linha no relatório durante toda a execução. As previsões de valor agregado servem sobretudo a ambiente preditivo e projeto muito grande (PMBOK 7, p. 104, PDF 199).
Linha para a tela: "Previsões no relatório de status; só na execução (PMBOK 6, p. 228; PMBOK 7, p. 104 e 190)."

## Ligações
- **Vem de:** 6.6, com B15 e B29 atualizados, A14, A16, B13, B25 e os dados de desempenho do trabalho (p. 224–225, PDF 260–261); A3 (frequência, limites de controle, regras de medição).
- **Vai para:** 4.5 (relatórios de desempenho); 11.4 (análise quantitativa dos riscos); A7 (relatório de status); 4.6 e B5 (se a previsão pedir mudança); B7 (previsões de custos, quando há valor agregado).

## Modelo de redação
```
Previsões do cronograma — modelo inicial (preenchido só na execução)
Data de status: [ ]   Versão: [ ]   Frequência: [do A3 ou a definir pelo GP]
Tabela: Marco/produto | Prazo do contrato | Linha de base (A14) | Previsto | Variação (código)
        | Causa | Ação
Base da previsão: [método]. Reserva remanescente: [ ].
Indicadores (se o A3 prevê): VPR, IDP [cálculo do código].
Gatilho: previsão além de [limite do A3] → [ação ou solicitação de mudança].
```

## Fontes
- PMBOK 6: 6.1.3.1, p. 182 (PDF 218); 6.5, p. 213–214 (PDF 249–250); Fig. 6-21, p. 219 (PDF 255); 6.6, p. 224–229 (PDF 260–265); Padrão, cap. 5, p. 613–632 (PDF 649–668); glossário, p. 720 (PDF 756).
- PMBOK 7: 2.7, p. 104–105 e 114 (PDF 199–200 e 209); artefatos, p. 190 (PDF 285); glossário, p. 250 (PDF 345).
- Rework: RW-013, RW-015 (links nos itens).
- `checklist.md` (PC3, PC4); `experiencia.md` §1; SKILL.md, princípio 2 e etapa 4.
