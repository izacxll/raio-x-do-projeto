---
codigo: B21
nome: Relatório de qualidade
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: entrega
sinonimos: ["relatório da qualidade", "relatórios de qualidade", "relatório de controle da qualidade", "relatório de não conformidades", "balanço da qualidade"]
versao: 0.1.0
---

# B21 — Relatório de qualidade

## Para que serve
Reúne as questões de qualidade, as ações corretivas recomendadas e o resumo das conclusões do controle da qualidade, e pode trazer recomendações de melhoria (PMBOK 6, 8.2.3.1, p. 296, PDF 332; glossário, p. 722, PDF 758). Sai de 8.2 e é uma das duas saídas da área usadas pelas outras (p. 272, PDF 308). **Só ganha conteúdo na execução:** no PGP sai como modelo inicial (decisão 0007, passo 12).

## Conteúdo mínimo
- **B21.1** Período e produtos cobertos
  - fonte: PMBOK 6, 8.2.3.1, p. 296 (PDF 332); Rework RW-022 (https://resources.rework.com/libraries/project-management/project-status-report)
  - sinais: "período" | "produtos avaliados" | "referente a"
  - confere: código
  - dispensa: nunca
- **B21.2** Resumo das conclusões do controle da qualidade (produtos aprovados, devolvidos, rodadas)
  - fonte: PMBOK 6, 8.2.3.1, p. 296 (PDF 332); glossário, p. 722 (PDF 758)
  - sinais: "resumo" | "aprovados" | "devolvidos" | "rodadas" | "conclusões"
  - confere: código
  - dispensa: nunca
- **B21.3** Problemas de qualidade levantados pela equipe ou pelo contratante
  - fonte: PMBOK 6, 8.2.3.1, p. 296 (PDF 332)
  - sinais: "problemas de qualidade" | "não conformidades" | "questões"
  - confere: código
  - dispensa: nunca
- **B21.4** Ações corretivas recomendadas, com responsável
  - fonte: PMBOK 6, 8.2.3.1, p. 296 (PDF 332)
  - sinais: "ação corretiva" | "recomendação" | "retrabalho" | "responsável"
  - confere: código
  - dispensa: nunca
- **B21.5** Recomendações de melhoria de processo ou produto, a partir do padrão das devoluções (causa-raiz)
  - fonte: PMBOK 6, 8.2.3.1, p. 296 (PDF 332); 8.2.2, p. 292 (PDF 328); Rework RW-107 (https://resources.rework.com/libraries/process-management/qa-vs-qc)
  - sinais: "melhoria" | "causa-raiz" | "padrão" | "lição"
  - confere: código
  - dispensa: porte pequeno
- **B21.6** Destinatários e uso: relatório de desempenho, comitê, aceite e encerramento
  - fonte: PMBOK 6, p. 272 (PDF 308); Parte 2, quadro das saídas (B21 usado em 10.2, 4.5, 5.5 e 4.7; pmbok6.md)
  - sinais: "destinatários" | "relatório de desempenho" | "comitê" | "encaminhado a"
  - confere: código
  - dispensa: nunca
- **B21.7** No PGP, modelo sem acontecimentos inventados
  - fonte: decisão 0007, passo 12; SKILL.md, etapa 4
  - sinais: "a preencher" | "modelo" | campos em branco
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O relatório leva a uma decisão ou ação com dono, ou só descreve? (PMBOK 6, p. 296, PDF 332; Rework RW-022)
- Distingue o relatório interno do que vai ao contratante? (Rework RW-022, observação do leitor)
- Puxa os dados do B19, sem recontar à mão? (PMBOK 6, p. 291, PDF 327)

## Erros comuns
- Relatório "verde" que esconde devoluções repetidas (Rework RW-022, "teatro de status"; RW-107).
- Recomendação sem responsável nem prazo (Rework RW-022).
- Modelo inicial com problemas fictícios (decisão 0007, passo 12).

## Quando dispensar a parte inteira
Em porte pequeno, pode ser uma seção "qualidade" do relatório de status ou de desempenho (B14): produtos aprovados e devolvidos e ações. O PMBOK 7 manda remover o que custa sem agregar valor (3.3, p. 135, PDF 230) e evitar artefato que duplica esforço (p. 155, PDF 250).
Linha para a tela: "Qualidade como seção do relatório de status: porte pequeno (PMBOK 7, p. 135 e 155)."

## Ligações
- **Vem de:** 8.2, com A5, B19, B20 e B28 (p. 290–291, PDF 326–327).
- **Vai para:** 10.2 (B14, comunicações); 4.5; 5.5 (aceite); 12.3; 4.7 (encerramento); B10 (lições); A11 (se gerar solicitação de mudança).

## Modelo de redação
```
Relatório de qualidade — modelo inicial (a preencher na execução)
Período: [ ]   Produtos cobertos: [ ]
1. Resumo do controle (do B19): aprovados [ ], devolvidos [ ], rodadas por produto [ ].
2. Problemas de qualidade: [ ]
3. Ações corretivas recomendadas: | Ação | Responsável | Prazo |
4. Melhorias de processo (padrão das devoluções, causa): [ ]
Destinatários: [conforme A7]; frequência: [a definir pelo GP].
```

## Fontes
- PMBOK 6: p. 272 (PDF 308); 8.2, p. 290–296 (PDF 326–332); glossário, p. 722 (PDF 758).
- PMBOK 7: 3.3, p. 135 (PDF 230); seção 4, p. 155 (PDF 250); artefatos, p. 190 (PDF 285).
- Rework: RW-022, RW-107 (links nos itens).
- Decisão 0007.
