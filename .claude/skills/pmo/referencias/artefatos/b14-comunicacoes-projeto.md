---
codigo: B14
nome: Comunicações do projeto
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: partes interessadas
sinonimos: ["comunicações do projeto", "relatório de status", "relatório de andamento", "relatório de acompanhamento", "relatório mensal", "ata de reunião", "modelo de ata", "boletim", "registros do projeto"]
versao: 0.1.0
---

# B14 — Comunicações do projeto

## Para que serve
São os artefatos de comunicação produzidos conforme o A7: relatórios de desempenho, situação das entregas, progresso do cronograma, custos incorridos, apresentações e o que mais as partes pedirem (PMBOK 6, 10.2.3.1, p. 387, PDF 423). Inclui os registros do projeto, como correspondência e atas (p. 388, PDF 424). Só ganha conteúdo na execução: no PGP sai **como modelo inicial**, sem acontecimentos inventados.

## Conteúdo mínimo
- **B14.1** Modelo do relatório de andamento ao contratante, com período, fase e situação geral
  - fonte: PMBOK 6, 10.2.3.1, p. 387 (PDF 423); Rework RW-022 (https://resources.rework.com/libraries/project-management/project-status-report)
  - sinais: "relatório de andamento" | "relatório de status" | "relatório mensal" | "período de referência"
  - confere: código
  - dispensa: nunca
- **B14.2** Situação de cada produto: em elaboração, entregue, em análise pelo contratante, aprovado
  - fonte: PMBOK 6, 10.2.3.1, p. 387 (PDF 423)
  - sinais: "situação das entregas" | "em análise" | "aprovado" | "entregue" | tabela de produtos
  - confere: código
  - dispensa: nunca
- **B14.3** Progresso do cronograma contra a linha de base, com os marcos
  - fonte: PMBOK 6, 10.2.3.1, p. 387 (PDF 423); Rework RW-022
  - sinais: "marcos" | "previsto" | "realizado" | "linha de base" | "atraso"
  - confere: código
  - dispensa: nunca
- **B14.4** Custos incorridos, ao menos no relatório interno da FGV
  - fonte: PMBOK 6, 10.2.3.1, p. 387 (PDF 423); Rework RW-022 (adaptação do leitor: relatório interno × relatório ao contratante)
  - sinais: "custos incorridos" | "realizado financeiro" | "orçado × realizado"
  - confere: código
  - dispensa: porte pequeno
- **B14.5** Pendências e pedidos ao contratante (dados, aprovações, decisões), com responsável e prazo
  - fonte: Rework RW-022 (seção de pedidos e decisões); `checklist.md` 7 (CE16) e 8 (CP13)
  - sinais: "pendências do contratante" | "pedidos" | "aguardando" | "decisões necessárias"
  - confere: código
  - dispensa: nunca
- **B14.6** Modelo de pauta e de ata, com decisões, ações, responsável e prazo
  - fonte: PMBOK 6, 10.2, p. 386 (PDF 422) e 10.2.3, p. 388 (PDF 424); Rework RW-020 (https://resources.rework.com/libraries/project-management/project-kickoff-meeting)
  - sinais: "pauta" | "ata" | "encaminhamentos" | "ação" | "responsável" | "prazo"
  - confere: código
  - dispensa: nunca
- **B14.7** Registro e arquivo das comunicações formais (ofícios, protocolos de entrega, aprovações por escrito)
  - fonte: PMBOK 6, 10.2.3, p. 388 (PDF 424); 10.1, p. 367 (PDF 403)
  - sinais: "protocolo" | "ofício" | "registro" | "arquivo" | "repositório"
  - confere: código
  - dispensa: nunca
- **B14.8** Situação geral com critério escrito (semáforo ou equivalente), sem manter verde depois que o risco se materializou
  - fonte: PMBOK 6, 10.2.1.3, p. 382 (PDF 418) (painéis e semáforos); Rework RW-022
  - sinais: "semáforo" | "verde" | "amarelo" | "vermelho" | critério de cada cor
  - confere: código
  - dispensa: porte pequeno
- **B14.9** Comunicações ao público ou aos beneficiários (comunicados, materiais de divulgação), quando o método depende de adesão
  - fonte: PMBOK 6, 10.1.2.5, p. 374–375 (PDF 410–411); `checklist.md` 12 (TB23)
  - sinais: "comunicado" | "divulgação" | "material informativo" | "mobilização"
  - confere: código
  - dispensa: sem beneficiários
- **B14.10** Modelo inicial sem acontecimentos inventados: só estrutura e primeiras entradas tiradas dos documentos
  - fonte: SKILL.md, etapa 4; decisão 0007
  - sinais: campos "a preencher na execução" | primeiras entradas com documento e página
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O relatório diz o que depende do contratante, com data, para proteger a FGV em caso de atraso? (Rework RW-022, adaptação do leitor; checklist 8)
- Os modelos seguem o formato e a cadência do A7 e do contrato? (A7.10; Rework RW-022)
- O relatório ao contratante e o interno estão separados (margem e esforço só no interno)? (Rework RW-022)
- Há relatório exigido pelo contrato com conteúdo mínimo que o modelo não cobre? (`licitacoes.md` 2.6)
- A ata registra decisões com data e ações com dono e prazo? (Rework RW-020; PMBOK 6, p. 386)

## Erros comuns
- "Teatro de status": relatório sempre verde até o projeto desabar (Rework RW-022).
- Relatório sem pedidos nem decisões necessárias (Rework RW-022).
- Formato que muda a cada edição (Rework RW-022).
- Ações de reunião sem responsável, fonte de conflito (PMBOK 6, p. 386, PDF 422).
- PMO preenchendo realizações ou atrasos que ainda não aconteceram (SKILL.md, princípio 2).

## Quando dispensar a parte inteira
Não se dispensa: o contrato público costuma exigir relatórios e registros formais. Em porte pequeno, basta um modelo de relatório de uma página e um de ata (Rework RW-022).
Linha para a tela: "Comunicações como modelo de relatório de uma página e de ata: porte pequeno."

## Ligações
- **Vem de:** 10.2, com A6, A7, A10, B5, B9, B10, B21, B28, B31 e os relatórios de desempenho do trabalho (4.5) (p. 381–383, PDF 417–419).
- **Vai para:** 10.3 (o que foi distribuído e o efeito); 13.4; 4.3; 4.7 (arquivo no encerramento); B10 (relatórios guardados viram lições).
- Relatórios periódicos e reunião de partida exigidos pela RFP caem aqui como modelo (número R).

## Modelo de redação
```
Relatório de andamento — período [ ] — fase [ ]
1. Situação geral: [cor] — critério: [a definir pelo GP]
2. Produtos: | Produto | Situação | Data prevista | Data real |
3. Marcos: previsto × realizado (B11, A14)
4. Custos incorridos: [só no relatório interno]
5. Riscos e questões principais (B28, B9)
6. Pendências do contratante: | Pedido | Responsável | Prazo |
7. Próximos passos

Ata — data, participantes, pauta
Decisão: ... | Ação: ... | Responsável: ... | Prazo: ...
(Conteúdo a preencher na execução; nada inventado.)
```

## Fontes
- PMBOK 6: 10.1, p. 367 (PDF 403); 10.1.2.5, p. 374–375 (PDF 410–411); 10.2, p. 381–388 (PDF 417–424).
- Rework: RW-020 e RW-022 (links nos itens).
- `checklist.md` 7, 8 e 12; `licitacoes.md` 2.6; SKILL.md, princípio 2 e etapa 4; decisão 0007.
