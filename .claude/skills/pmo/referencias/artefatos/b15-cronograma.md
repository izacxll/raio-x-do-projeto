---
codigo: B15
nome: Cronograma do projeto
tipo: documento do projeto
etapas: [2, 4, 5]
gravidade: média
categoria: tempo
sinonimos: ["cronograma", "cronograma de execução", "cronograma de atividades", "cronograma físico", "cronograma físico-financeiro", "Gantt", "gráfico de Gantt", "plano de trabalho detalhado"]
versao: 0.2.0
---

# B15 — Cronograma do projeto

## Para que serve
É "uma saída de um modelo de cronograma que apresenta a conexão de atividades com datas, durações, marcos e recursos planejados" (PMBOK 6, 6.5.3.2, p. 217, PDF 253). Também comunica e gere expectativas (p. 175, PDF 211). Pode ser de marcos, resumido ou detalhado, em tabela, Gantt ou rede (p. 217–219, PDF 253–255). As datas e o caminho crítico são calculados pelo código, não pelo PMO.

## Conteúdo mínimo
- **B15.1** Cada atividade tem data de início e data de término planejadas
  - fonte: PMBOK 6, 6.5.3.2, p. 217 (PDF 253)
  - sinais: "início" | "término" | "data de início" | "data de término" | colunas de datas por linha | barras por período
  - confere: código
  - dispensa: nunca
- **B15.2** Marcos com duração zero, entre eles as entregas e aprovações contratuais
  - fonte: PMBOK 6, 6.2, p. 186 (PDF 222); Rework RW-050 (https://resources.rework.com/libraries/project-management/what-is-a-gantt-chart)
  - sinais: "marco" | "duração 0" | "0 dias" | losango | "entrega do produto"
  - confere: código
  - dispensa: nunca
- **B15.3** Atividades ligadas à EAP (código da EAP ou agrupamento por produto ou pacote de trabalho)
  - fonte: PMBOK 6, 6.5.3.2, Fig. 6-21, p. 219 (PDF 255); Rework RW-050
  - sinais: numeração hierárquica (1.1, 1.1.1) | "produto" | "pacote de trabalho" | atividades de resumo
  - confere: código
  - dispensa: nunca
- **B15.4** Dependências visíveis (coluna de predecessoras ou setas), sem atividade solta
  - fonte: PMBOK 6, 6.3, p. 188 (PDF 224); Rework RW-027 (https://resources.rework.com/libraries/project-management/task-dependencies)
  - sinais: "predecessora" | "predecessoras" | "depende de" | "TI" | "II" | setas entre barras
  - confere: código
  - dispensa: nunca
- **B15.5** Tempos de análise e aprovação do contratante como atividades com duração
  - fonte: `checklist.md` PC3; `licitacoes.md` 2.6; Rework RW-052 (https://resources.rework.com/libraries/project-management/critical-path-method) e RW-050 (observações do leitor)
  - sinais: "análise do contratante" | "aprovação" | "validação" | "parecer" | "prazo de análise"
  - confere: código
  - dispensa: nunca
- **B15.6** Dependências externas (dados de outros órgãos, agendas, autorizações) como atividades ou marcos
  - fonte: PMBOK 6, 6.3, p. 191–192 (PDF 227–228); `checklist.md` (PC1 e PC6); experiencia.md §3
  - sinais: "recebimento dos dados" | "disponibilização" | "autorização" | "dependência externa" | "a cargo do contratante"
  - confere: código
  - dispensa: nunca
- **B15.7** Contingência explícita (linha de reserva por fase ou antes de cada entrega), não escondida nas durações
  - fonte: PMBOK 6, 6.4, p. 202 (PDF 238); Rework RW-050 e RW-024 (https://resources.rework.com/libraries/project-management/critical-chain-project-management)
  - sinais: "contingência" | "reserva de cronograma" | "folga" | "pulmão" | "buffer"
  - confere: código
  - dispensa: nunca
- **B15.8** Datas contadas de um evento definido e compatíveis com os prazos da RFP e os marcos do TAP (a conta é do código)
  - fonte: PMBOK 6, 6.1, p. 180 (PDF 216); `checklist.md` PC4; experiencia.md §2
  - sinais: "ordem de serviço" | "assinatura" | "D+" | "mês 1" | "semana 1" | datas de calendário
  - confere: código
  - dispensa: nunca
- **B15.9** Caminho crítico e folgas mostrados
  - fonte: PMBOK 6, 6.5, p. 210 e 218 (PDF 246 e 254); Rework RW-052 e RW-056 (https://resources.rework.com/libraries/project-management/float-and-slack)
  - sinais: "caminho crítico" | "crítica" | "folga" | "folga total" | barras destacadas
  - confere: código
  - dispensa: porte pequeno
- **B15.10** Responsável (pessoa ou papel) por atividade
  - fonte: PMBOK 6, 6.5.3.2, p. 217 (PDF 253) ("recursos planejados"); Rework RW-050
  - sinais: "responsável" | "recurso" | coluna de papel | iniciais por linha
  - confere: código
  - dispensa: porte pequeno
- **B15.11** Atividades de gerenciamento e de respostas a riscos incluídas (abertura, reuniões, relatórios, ações do B27)
  - fonte: PMBOK 6, 11.5, p. 447–448 (PDF 483–484); 5.4, p. 161 (PDF 197); experiencia.md §8
  - sinais: "reunião de abertura" | "relatório de acompanhamento" | "gestão do projeto" | atividade com o código do risco
  - confere: só PMO
  - dispensa: nunca
- **B15.12** Nível de apresentação adequado ao leitor (marcos para o contratante, detalhado para a equipe) e status de preliminar até os recursos serem confirmados
  - fonte: PMBOK 6, 6.5.3.2, p. 217–219 (PDF 253–255); Rework RW-025 (https://resources.rework.com/libraries/project-management/milestone-chart)
  - sinais: "cronograma de marcos" | "cronograma resumido" | "cronograma detalhado" | "preliminar" | "versão"
  - confere: só PMO
  - dispensa: porte pequeno

## Perguntas de qualidade
- Alguma atividade ou marco está sem data, ou contada de evento sem data? O PMO aponta; quem calcula é o código (PC4).
- O contratante tem prazo para analisar cada produto, e esse prazo aparece como atividade? (PC3)
- O que depende de terceiros tem prazo e aparece no cronograma? (PC1 e PC6)
- Há contingência visível antes das entregas presas a datas fixas? (experiencia.md §2)
- Se há campo: deslocamento e sazonalidade entram nas durações e no calendário (B13)?
- Se um produto começa antes do aceite do anterior (paralelismo), o risco de retrabalho está no B27? (Rework RW-016, https://resources.rework.com/libraries/project-management/fast-tracking-vs-crashing)

## Erros comuns
- Aprovação do cliente omitida: o cronograma estoura nas aprovações (experiencia.md §1).
- Prazos contados de pontos diferentes (etapa anterior × data fixa); o conflito só aparece na rede (experiencia.md §2).
- Falsa precisão: detalhe diário num plano longo; gráfico inchado que ninguém lê (Rework RW-050).
- Contingência espalhada nas tarefas, que se perde (Rework RW-024; PMBOK 6, p. 197, PDF 233, Lei de Parkinson).
- Olhar a barra mais longa em vez do caminho crítico (Rework RW-050).

## Quando dispensar a parte inteira
Nunca: todo projeto precisa de cronograma. Em porte pequeno, basta uma tabela ou Gantt simples com atividades, predecessoras, início, término, marcos, aprovações e contingência.
Linha para a tela: "Cronograma simplificado (tabela com marcos e aprovações): porte pequeno (PMBOK 6, p. 175 e 217)."

## Ligações
- **Vem de:** 6.5, com B16, B8, B4, B11, B13, B18, B25, B26 e B27 (p. 207–209, PDF 243–245); A3; A13; proposta (cronograma da etapa 2).
- **Vai para:** 6.6; 7.2 e 7.3 (custos no tempo); 9.1; 11.5; 13.2; A14 (quando aprovado); B11; B30; relatórios de status.
- Requisitos que pedem "cronograma de execução" ou "cronograma físico-financeiro" caem aqui.

## Modelo de redação
```
Cronograma — versão [n], preliminar até a confirmação das designações (B18)
Datas contadas de [evento]; unidade [dias úteis/corridos].
Tabela: ID (EAP) | Atividade | Responsável | Predecessoras | Duração (do código) | Início | Término | Marco
Inclui: análise do contratante por produto [prazo do contrato ou a definir pelo GP];
dependências externas [quais, de quem]; contingência [onde; tamanho a definir pelo GP].
Gantt resumido por produto para o contratante; detalhado para a equipe.
```

## Fontes
- PMBOK 6: 5.4, p. 161 (PDF 197); 6.1, p. 180 (PDF 216); 6.2, p. 186 (PDF 222); 6.3, p. 188–192 (PDF 224–228); 6.4, p. 197 e 202 (PDF 233 e 238); 6.5, p. 207–219 (PDF 243–255); 11.5, p. 447–448 (PDF 483–484); p. 175 (PDF 211).
- PMBOK 7: 2.4.2.3, p. 58–62 (PDF 153–157); artefatos, p. 188–189 (PDF 283–284).
- Rework: RW-016, RW-024, RW-025, RW-027, RW-050, RW-052, RW-056 (links nos itens).
- `checklist.md` (PC1, PC3, PC4, PC6); `experiencia.md` §1, §2, §3 e §8; `licitacoes.md` 2.6.
