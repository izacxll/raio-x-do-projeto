---
codigo: B28
nome: Relatório de riscos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: incerteza
sinonimos: ["relatório de riscos", "relatório de situação dos riscos", "panorama dos riscos", "risco geral do projeto", "exposição ao risco"]
versao: 0.1.0
---

# B28 — Relatório de riscos

## Para que serve
Resume os riscos individuais e o nível de **risco geral** do projeto, isto é, o efeito do conjunto das incertezas sobre os objetivos (PMBOK 6, 11.2.3.2, p. 418, PDF 454; glossário, p. 722, PDF 758). É desenvolvido progressivamente, a cada análise e revisão. No PGP sai como modelo, com a estrutura e só o que os documentos sustentam, sem inventar acontecimentos (SKILL.md, etapa 4).

## Conteúdo mínimo
- **B28.1** Avaliação do risco geral e de suas principais fontes
  - fonte: PMBOK 6, 11.2.3.2, p. 418 (PDF 454); risco geral, p. 397 (PDF 433)
  - sinais: "risco geral" | "exposição geral" | "exposição ao risco" | "fontes de risco"
  - confere: código
  - dispensa: nunca
- **B28.2** Resumo dos riscos individuais: quantas ameaças e oportunidades, por categoria
  - fonte: PMBOK 6, 11.2.3.2, p. 418 (PDF 454)
  - sinais: "número de riscos" | "ameaças" | "oportunidades" | "por categoria" | quadro com contagens
  - confere: código
  - dispensa: porte pequeno
- **B28.3** Principais riscos individuais, com resposta e responsável
  - fonte: PMBOK 6, 11.3, p. 427 (PDF 463) e 11.7, p. 458 (PDF 494); Rework RW-022 (https://resources.rework.com/libraries/project-management/project-status-report)
  - sinais: "principais riscos" | "riscos prioritários" | "lista priorizada" | lista curta com responsável
  - confere: código
  - dispensa: nunca
- **B28.4** Conclusões e recomendações
  - fonte: PMBOK 6, 11.3, p. 427 (PDF 463) e 11.7, p. 458 (PDF 494)
  - sinais: "conclusão" | "conclusões" | "recomendações" | "recomenda-se"
  - confere: código
  - dispensa: nunca
- **B28.5** Resposta acordada para a exposição geral
  - fonte: PMBOK 6, 11.5, p. 445–446 e 448 (PDF 481–482 e 484)
  - sinais: "resposta ao risco geral" | "estratégia geral" | "replanejamento" | "redução de escopo"
  - confere: só PMO
  - dispensa: porte pequeno
- **B28.6** Decisões pedidas acima do GP (patrocinador, contratante), inclusive riscos escalados
  - fonte: Rework RW-022 (https://resources.rework.com/libraries/project-management/project-status-report); escalação em PMBOK 6, 11.5, p. 442 (PDF 478)
  - sinais: "escalado" | "escalar" | "decisão do patrocinador" | "pedido de decisão" | "comitê"
  - confere: código
  - dispensa: porte pequeno
- **B28.7** Tendências: o que mudou desde o relatório anterior (riscos novos, encerrados, ocorridos)
  - fonte: PMBOK 6, 11.2.3.2, p. 418 (PDF 454) e 11.4, p. 436 (PDF 472)
  - sinais: "tendência" | "evolução" | "novos riscos" | "riscos encerrados" | "período anterior"
  - confere: código
  - dispensa: porte pequeno
- **B28.8** Resultado da análise quantitativa: chance de cumprir prazo e custo, faixa de variação e reserva para um nível de confiança
  - fonte: PMBOK 6, 11.4, p. 436 (PDF 472); Rework RW-013 (https://resources.rework.com/libraries/project-management/monte-carlo-simulation)
  - sinais: "curva S" | "Monte Carlo" | "P50" | "P80" | "nível de confiança" | "tornado" | "índice de criticidade"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **B28.9** Conclusões das auditorias de riscos sobre a eficácia do processo
  - fonte: PMBOK 6, 11.7, p. 458 (PDF 494)
  - sinais: "auditoria de riscos" | "eficácia do processo" | "eficácia das respostas"
  - confere: código
  - dispensa: porte pequeno
- **B28.10** Periodicidade e destinatários, conforme o A8 e o A7
  - fonte: PMBOK 6, 11.2.3.2, p. 418 (PDF 454) e 11.1.3.1, p. 408 (PDF 444); Rework RW-022 (https://resources.rework.com/libraries/project-management/project-status-report)
  - sinais: "periodicidade" | "mensal" | "por fase" | "destinatários" | "comitê"
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- O relatório trata do **risco geral**, ou só repete a lista do registro? (PMBOK 6, p. 418, PDF 454)
- A situação é honesta: risco que se materializou não deixa o projeto "verde"? (Rework RW-022)
- As recomendações dizem o que se pede, a quem e até quando? (Rework RW-022)
- A reserva restante ainda cobre os riscos restantes? (análise de reservas, PMBOK 6, 11.7, p. 456, PDF 492)
- Há versão ao contratante separada da interna (margem, esforço), com as pendências do próprio contratante? (Rework RW-022, observação do leitor)
- Se houver análise quantitativa, o compromisso usa um percentil alto e não a mediana? (Rework RW-013)

## Erros comuns
- Chamar de relatório a cópia do registro, sem avaliação do risco geral (PMBOK 6, p. 418, PDF 454).
- "Teatro de status": tudo verde até o projeto desabar; relatório sem pedidos de decisão; formato que muda a cada edição (Rework RW-022).
- Tratar o P50 como seguro ou ler o P80 como pior caso (Rework RW-013).
- Na etapa 4, preencher tendências ou ocorrências que ainda não existem (SKILL.md, etapa 4).

## Quando dispensar a parte inteira
O PMBOK não fala em dispensa, mas trata as listas de documentos como exemplos, não requisitos (PMBOK 6, p. 558, PDF 594). Em porte pequeno, o relatório pode ser uma seção "Riscos" do relatório de status (comunicações do projeto, B14), com o risco geral e os 3 a 5 principais riscos (Rework RW-022). Sem análise quantitativa, os itens probabilísticos não se aplicam.
Linha para a tela: "Riscos como seção do relatório de status: porte pequeno (Rework RW-022; PMBOK 6, p. 558)."

## Ligações
- **Vem de:** B27 e das análises de 11.2 a 11.5; TAP5 (risco geral inicial); A8, que define conteúdo, formato e periodicidade.
- **Vai para:** 11.4 a 11.7; relatórios e comunicações do projeto (4.5, 10.2; B14); encerramento, onde confirma que não há riscos pendentes (PMBOK 6, 4.7, p. 124–125, PDF 160–161).

## Modelo de redação
```
Relatório de riscos — [período ou fase]
1. Risco geral: avaliação e principais fontes (texto curto, em redação condicional).
2. Resumo: ameaças e oportunidades abertas, por categoria (contagem feita pelo código a partir do B27).
3. Principais riscos: ID | risco | prioridade | resposta | responsável | situação
4. Mudanças desde o último relatório.
5. Decisões pedidas: o quê, a quem, até quando.
6. Conclusões e recomendações.
[Com análise quantitativa: chance de cumprir prazo e custo; reserva para o nível de confiança definido pelo GP.]
```

## Fontes
- PMBOK 6: 11.2.3.2, p. 418 (PDF 454); 11.3, p. 427 (PDF 463); 11.4, p. 436 (PDF 472); 11.5, p. 442–448 (PDF 478–484); 11.7, p. 456–458 (PDF 492–494); 4.7, p. 124–125 (PDF 160–161); Padrão, p. 558 (PDF 594); glossário, p. 722 (PDF 758).
- PMBOK 7: 4.6.7, relatório de riscos, p. 190 (PDF 285).
- Rework: RW-022 e RW-013 (links nos itens).
- SKILL.md, etapa 4.
