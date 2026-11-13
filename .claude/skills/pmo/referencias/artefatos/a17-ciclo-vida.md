---
codigo: A17
nome: Descrição do ciclo de vida do projeto
tipo: componente do plano
etapas: [4, 5]
gravidade: baixa
categoria: abordagem de desenvolvimento e ciclo de vida
sinonimos: ["ciclo de vida", "ciclo de vida do projeto", "fases do projeto", "etapas do projeto", "fases e marcos", "estrutura de fases"]
versao: 0.2.0
---

# A17 — Descrição do ciclo de vida do projeto

## Para que serve
Descreve "a série de fases pelas quais um projeto passa, do início ao término" (PMBOK 6, glossário, p. 702, PDF 738), com os atributos de cada fase e as revisões entre elas (1.2.4, p. 18–21, PDF 54–57). Fase é um conjunto de atividades que culmina em uma ou mais entregas (glossário, p. 710, PDF 746). Não confundir com a abordagem de desenvolvimento (A18): ciclo de vida diz **quais fases**; abordagem diz **como as entregas são feitas** (PMBOK 7, Guia, p. 49, PDF 144).

## Conteúdo mínimo
- **A17.1** Fases nomeadas, em ordem, cobrindo do início ao encerramento
  - fonte: PMBOK 6, 1.2.4.1, p. 18–19 (PDF 54–55); PMBOK 7, Tab. 2-5, p. 50 (PDF 145)
  - sinais: "fase 1" | "etapa 1" | "fase de" | "iniciação" | "mobilização" | "encerramento" | tabela ou figura com a sequência das fases
  - confere: código
  - dispensa: nunca
- **A17.2** Entregas ou produtos que fecham cada fase
  - fonte: PMBOK 6, glossário, p. 710 (PDF 746); 1.2.4.2, p. 20 (PDF 56)
  - sinais: "produto" | "entrega" | "ao final da fase" | coluna de entregas por fase
  - confere: código
  - dispensa: nunca
- **A17.3** Duração ou datas de cada fase
  - fonte: PMBOK 6, 1.2.4.2, p. 20 (PDF 56)
  - sinais: "duração" | "mês 1 a mês 3" | "semanas" | datas de início e fim por fase
  - confere: código
  - dispensa: uma fase
- **A17.4** Critérios de entrada de cada fase (aprovações, documentos ou insumos que precisam existir)
  - fonte: PMBOK 6, 1.2.4.2, p. 20 (PDF 56)
  - sinais: "critério de entrada" | "pré-requisito" | "condição para início" | "após a aprovação do produto"
  - confere: código
  - dispensa: uma fase
- **A17.5** Critérios de saída de cada fase, ligados a aceite, obrigação contratual ou meta
  - fonte: PMBOK 6, 1.2.4.2, p. 20 (PDF 56); PMBOK 7, 2.3, p. 42 (PDF 137)
  - sinais: "critério de saída" | "critério de conclusão" | "aceite" | "aprovação do produto" | "termo de recebimento"
  - confere: código
  - dispensa: nunca
- **A17.6** Revisão ao fim de cada fase: quem decide e quais decisões são possíveis (seguir, seguir com ajustes, repetir, encerrar)
  - fonte: PMBOK 6, 1.2.4.3, p. 21 (PDF 57); glossário, p. 723 (PDF 759)
  - sinais: "revisão de fase" | "ponto de decisão" | "portão" | "gate" | "aprovação para a fase seguinte" | "go/no-go"
  - confere: código
  - dispensa: uma fase
- **A17.7** Recursos previstos por fase (equipe que entra e sai, equipamentos)
  - fonte: PMBOK 6, 1.2.4.2, p. 20 (PDF 56)
  - sinais: "equipe da fase" | "mobilização" | "desmobilização" | recursos por fase
  - confere: código
  - dispensa: porte pequeno
- **A17.8** Fases sobrepostas ou repetidas quando entregas diferentes têm ritmos diferentes, com o motivo
  - fonte: PMBOK 7, Tab. 2-5, p. 50 (PDF 145) e Tab. 2-4, p. 46 (PDF 141); PMBOK 6, X3.1, p. 666 (PDF 702)
  - sinais: "em paralelo" | "sobreposição" | "simultaneamente" | "ciclos" | "ondas" | "lotes"
  - confere: só PMO
  - dispensa: uma fase ou uma frente
- **A17.9** Encerramento como fase própria: aceite final, lições aprendidas, liberação da equipe, arquivamento
  - fonte: PMBOK 6, 4.7, p. 123 (PDF 159); PMBOK 7, 2.3, p. 42 e 47 (PDF 137 e 142)
  - sinais: "encerramento" | "relatório final" | "lições aprendidas" | "aceite final" | "termo de encerramento"
  - confere: código
  - dispensa: nunca
- **A17.10** Atos formais do contrato tratados como marcos do ciclo: assinatura ou ordem de serviço, aceite dos produtos, recebimento definitivo
  - fonte: licitacoes.md 2.6 (Lei 14.133, art. 140); Rework RW-054 (https://resources.rework.com/libraries/project-management/project-life-cycle), observação do leitor
  - sinais: "ordem de serviço" | "assinatura do contrato" | "recebimento provisório" | "recebimento definitivo" | "aceite"
  - confere: código
  - dispensa: contratante privado

## Perguntas de qualidade
- Os prazos das fases contam do mesmo marco (ordem de serviço) ou misturam datas fixas e prazos relativos? (PC4; experiencia.md §2)
- O critério de saída diz quem aceita e em que prazo? Fase que "termina com a entrega", sem aceite, não fecha (PC3).
- Há reunião de início em cada fase, no projeto com várias fases? (PMBOK 6, p. 86, PDF 122)
- Na revisão de cada fase, revêm-se o TAP, os critérios de sucesso e as partes interessadas? (PMBOK 6, Parte 2, p. 562, PDF 598)
- Expansão por ondas ou territórios aparece como fases repetidas, com a gestão crescendo junto? (PC7; experiencia.md §4)
- Piloto seguido de expansão: o portão entre os dois é um produto com aceite do órgão? (Rework RW-039, observação do leitor)

## Erros comuns
- Ciclo que acaba na "entrega final", sem aceite nem encerramento (inferência das notas a partir do PMBOK 7, Tab. 2-5, p. 50, PDF 145: todo o trabalho, até o encerramento, deve estar nas fases).
- Fases sem critério de saída, ou revisão de fase que vira reunião de status (Rework RW-039).
- Confundir fases do ciclo de vida com grupos de processos: planejamento e execução não são fases (PMBOK 6, p. 18 e 23, PDF 54 e 59).
- Confundir ciclo de vida com abordagem (PMBOK 7, p. 49, PDF 144).
- Impor fases rígidas a requisitos que ainda vão mudar (Rework RW-026).
- Planejar em ondas sem dono nem data para detalhar a próxima onda (Rework RW-037, https://resources.rework.com/libraries/project-management/rolling-wave-planning).

## Quando dispensar a parte inteira
Não se dispensa: está no núcleo da adaptação, "nem que num parágrafo" (pmbok7.md, seção 3, item 2). Em projeto de uma fase, basta o parágrafo com início, execução e encerramento, o critério de saída e o aceite final; A17.3, A17.4, A17.6 e A17.8 ficam dispensáveis. Pode ser fundido com o A18 numa seção "Ciclo de vida e abordagem".
Linha para a tela: "Ciclo de vida num parágrafo, junto com a abordagem: uma fase (PMBOK 6, p. 20; PMBOK 7, p. 50)."

## Ligações
- **Vem de:** 4.2 (nasce lá pelo X1.5; PMBOK 6, p. 642, PDF 678); TAP (TAP6 marcos e TAP10 critérios de término); produtos e prazos do TR; A18 (a abordagem e a cadência determinam as fases; PMBOK 7, p. 33, PDF 128).
- **Vai para:** 5.1 (A1 e A2 usam o ciclo de vida; PMBOK 6, Parte 2, pmbok6.md tabela); B11 (marcos de fim de fase); B15; A6 (recursos por fase); A9 (aquisição por fase; PMBOK 7, p. 46, PDF 141); B10 (lições a cada fase).

## Modelo de redação
```
1. Fases: Fase | Objetivo | Entregas | Duração (contada da ordem de serviço) | Entrada | Saída (aceite de quem, prazo) | Revisão
   Prazos: conforme o TR; o que não estiver lá fica a definir pelo GP.
2. Revisão de fase: decide [papel na FGV e no contratante]; opções: seguir, seguir com ajustes, repetir parte, encerrar.
3. Fases em paralelo (se houver): [quais e por quê].
4. Marcos do contrato: assinatura/ordem de serviço, aceites por produto, recebimento definitivo.
5. Encerramento: aceite final, relatório final, lições aprendidas, liberação da equipe, arquivamento.
```

## Fontes
- PMBOK 6: 1.2.4, p. 18–21 (PDF 54–57); 4.2, p. 86 (PDF 122); 4.7, p. 123 (PDF 159); Parte 2, p. 562 (PDF 598); X1.5, p. 642 (PDF 678); X3.1, p. 666 (PDF 702); glossário, p. 702, 710 e 723 (PDF 738, 746 e 759).
- PMBOK 7: Guia 2.3, p. 32–50 (PDF 127–145), em especial p. 33, 42, 46, 47, 49 e Tab. 2-5.
- Rework: RW-054 (https://resources.rework.com/libraries/project-management/project-life-cycle); RW-039 (https://resources.rework.com/libraries/project-management/stage-gate-process); RW-037 (link no item de erros); RW-026 (https://resources.rework.com/libraries/project-management/prince2-methodology).
- `licitacoes.md` 2.6; `checklist.md` (PC3, PC4, PC7); `experiencia.md` §2 e §4; `pmbok7.md` seções 3 e 6.
