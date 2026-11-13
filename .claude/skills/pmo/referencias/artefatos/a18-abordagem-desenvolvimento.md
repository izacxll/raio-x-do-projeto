---
codigo: A18
nome: Abordagem de desenvolvimento
tipo: componente do plano
etapas: [4, 5]
gravidade: baixa
categoria: abordagem de desenvolvimento e ciclo de vida
sinonimos: ["abordagem de desenvolvimento", "abordagem de gerenciamento", "abordagem de gestão", "modelo de gestão do projeto", "abordagem preditiva", "abordagem híbrida", "abordagem ágil"]
versao: 0.2.0
---

# A18 — Abordagem de desenvolvimento

## Para que serve
Diz como o produto, serviço ou resultado será desenvolvido: preditiva, iterativa, incremental, adaptativa (ágil) ou híbrida (PMBOK 6, 4.2.3.1, p. 88, PDF 124; glossário, p. 698, PDF 734). O PMBOK 7 a define como "um método usado para criar e desenvolver o produto, serviço ou resultado durante o ciclo de vida do projeto" (Guia, p. 33, PDF 128) e pede a escolha por entrega, justificada. Não é a metodologia técnica da proposta (pesquisa, diagnóstico, oficinas): é o modo de planejar e entregar.

## Conteúdo mínimo
- **A18.1** Abordagem declarada com o nome do tipo (preditiva, iterativa, incremental, adaptativa ou híbrida)
  - fonte: PMBOK 6, 1.2.4.1, p. 19 (PDF 55); glossário, p. 698 (PDF 734)
  - sinais: "preditiva" | "cascata" | "iterativa" | "incremental" | "adaptativa" | "ágil" | "híbrida"
  - confere: código
  - dispensa: nunca
- **A18.2** Abordagem por entrega ou frente, quando as entregas são de naturezas diferentes
  - fonte: PMBOK 7, Tab. 2-4, p. 46 (PDF 141) e Tab. 2-5, p. 50 (PDF 145); PMBOK 6, X3.1, p. 666 (PDF 702)
  - sinais: tabela com colunas de entrega (ou frente) e abordagem | "para o produto" | "para a frente"
  - confere: código
  - dispensa: uma frente
- **A18.3** Cadência de cada entrega: única, múltipla, periódica ou contínua
  - fonte: PMBOK 7, 2.3, p. 33–34 (PDF 128–129)
  - sinais: "entrega única" | "entregas parciais" | "mensal" | "por produto" | "versões" | calendário de entregas
  - confere: código
  - dispensa: nunca
- **A18.4** Justificativa pelos fatores do produto (certeza dos requisitos, estabilidade do escopo, regulação), do projeto (envolvimento das partes, prazo) e da organização (estrutura, cultura, equipe)
  - fonte: PMBOK 7, 2.3.4, p. 39–41 (PDF 134–136); PMBOK 6, X5.1, p. 679 (PDF 715)
  - sinais: "porque" | "em razão de" | "requisitos definidos" | "escopo fixado no termo de referência" | "incerteza"
  - confere: só PMO
  - dispensa: nunca
- **A18.5** Restrições do edital ou do contrato que impõem método, ritos ou ciclo, e como a abordagem as respeita
  - fonte: PMBOK 7, Guia 3, p. 133 e 139 (PDF 228 e 234); experiencia.md §1
  - sinais: "conforme o termo de referência" | "exigido pelo edital" | "plano de trabalho aprovado" | "ritos contratuais"
  - confere: só PMO
  - dispensa: nunca
- **A18.6** Parte adaptativa: duração das iterações, backlog e quem prioriza do lado do cliente
  - fonte: PMBOK 6, X3.3.4, p. 671 (PDF 707) (lista inferida nas notas); PMBOK 7, 2.3, p. 38 (PDF 133)
  - sinais: "iteração" | "sprint" | "ciclo de duas semanas" | "backlog" | "dono do produto" | "representante do contratante"
  - confere: código
  - dispensa: abordagem preditiva
- **A18.7** Abordagem híbrida: que parte segue qual lógica e como se passa de uma à outra (o que é entregue na fronteira, quem aprova)
  - fonte: PMBOK 6, X3.1, p. 666 (PDF 702); Rework RW-041 (https://resources.rework.com/libraries/project-management/hybrid-project-management)
  - sinais: "parte preditiva" | "parte iterativa" | "versões internas" | "oficina de validação" | tabela por frente com a abordagem
  - confere: código
  - dispensa: abordagem preditiva ou abordagem adaptativa
- **A18.8** Coerência com o resto do plano: requisitos, entregas, mudanças, envolvimento das partes e riscos tratados do jeito da abordagem declarada
  - fonte: PMBOK 6, X3.1, Fig. X3-1, p. 666 (PDF 702); PMBOK 7, Tab. 2-5, p. 50 (PDF 145)
  - sinais: comparação entre A18 e A1, A3, A11, A10 (não é sinal textual)
  - confere: só PMO
  - dispensa: nunca
- **A18.9** Ritmo das revisões com o contratante compatível com o ritmo de decisão dele (comitês, pareceres)
  - fonte: Rework RW-061 (https://resources.rework.com/libraries/project-management/agile-vs-waterfall), boa prática 8; experiencia.md §1
  - sinais: "reunião de validação" | "comitê" | "mensal" | "quinzenal" | "prazo de análise"
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Os produtos têm requisitos fixados no TR e aceite documentado? Pela Fig. X3-1, isso é perfil preditivo, mesmo que o plano diga "ágil" (PMBOK 6, p. 666, PDF 702).
- A elaboração de cada produto passa por versões e oficinas com o órgão? Isso sugere híbrido: contrato preditivo, elaboração iterativa (Rework RW-041 e RW-061, observação do leitor).
- A regra de decisão foi aplicada: se dá para escrever hoje um critério de aceite que vai se manter, a parte é preditiva (Rework RW-041)?
- Abordagem adaptativa exige envolvimento intenso do cliente: o contratante tem quem participe? (PMBOK 7, p. 39–41, PDF 134–136; PC3)
- Regulação forte ou burocracia do contratante puxam para a preditiva; o plano considera isso? (PMBOK 7, p. 39–41, PDF 134–136)
- O TAP será revisto em cada ciclo na parte adaptativa? (PMBOK 6, X3.3.1, p. 669, PDF 705)
- Quadro kanban ou caixas de tempo dentro de cada produto são bem-vindos, mas não substituem o cronograma de marcos do contrato (Rework RW-048 e RW-044, observação do leitor); na preditiva, o seguir/parar entre etapas é o aceite de cada produto (Rework RW-047, observação do leitor).

## Erros comuns
- "Ágil" declarado com escopo fechado, entrega única no fim e cliente só nos marcos (inferência das notas a partir da Fig. X3-1, PMBOK 6, p. 666, PDF 702).
- Ritos ágeis num plano fixo, ou sprints sem autoridade sobre o escopo (Rework RW-041 e RW-060, https://resources.rework.com/libraries/project-management/what-is-agile-methodology).
- Uma só abordagem para entregas muito diferentes (PMBOK 7, Tab. 2-5, p. 50, PDF 145).
- "Híbrido" usado para não decidir o que é fixo e o que é fluido, ou complexidade híbrida em projeto pequeno e estável (Rework RW-041).
- Confundir abordagem com ciclo de vida (PMBOK 7, p. 49, PDF 144), ou com a metodologia técnica da proposta.
- Copiar o modo de trabalhar de outra organização sem escrever o porquê (Rework RW-062, https://resources.rework.com/libraries/project-management/disciplined-agile).

## Quando dispensar a parte inteira
Não se dispensa, mas pode ser um parágrafo: a abordagem é decisão de adaptação (PMBOK 7, Guia 3.3.1, p. 134, PDF 229) e está no núcleo (pmbok7.md, seção 3, item 2). Em porte pequeno com abordagem preditiva e uma frente, basta declarar a abordagem, a cadência e o motivo, junto com o A17.
Linha para a tela: "Abordagem num parágrafo, junto com o ciclo de vida: porte pequeno, uma frente, abordagem preditiva (PMBOK 7, p. 134)."

## Ligações
- **Vem de:** 4.2 (nasce lá pelo X1.5; PMBOK 6, p. 642, PDF 678); TR e contrato (produtos, aceite, pagamento por produto); proposta (metodologia e cronograma); fatores do produto, do projeto e da organização.
- **Vai para:** 5.1 e 6.1 (A1, A2 e A3 usam a abordagem; pmbok6.md, tabela); A17 (abordagem e cadência determinam as fases; PMBOK 7, p. 33, PDF 128); A11 (comitê na preditiva, backlog na adaptativa; PMBOK 7, p. 76–77, PDF 171–172); A8 (riscos por iteração ou em sequência; PMBOK 6, X5.8, p. 683, PDF 719); A10 e A7 (envolvimento das partes).

## Modelo de redação
```
1. Abordagem geral: sugere-se [preditiva/híbrida], porque [requisitos fixados no TR, aceite por produto, ritmo de decisão do contratante].
2. Por entrega: Produto/frente | Abordagem | Cadência | Motivo
3. Parte iterativa (se houver): ciclos de [duração a definir pelo GP]; versões internas e oficina de validação com [papel no contratante]; o que muda dentro do ciclo e o que exige o A11.
4. Restrições do contrato: [ritos, formatos e prazos exigidos pelo TR].
5. Revisão da abordagem: a cada fase (A17), se a evidência pedir.
```

## Fontes
- PMBOK 6: 1.2.4.1, p. 19 (PDF 55); 4.2, p. 88 (PDF 124); X1.5, p. 642 (PDF 678); X3.1, p. 666 (PDF 702); X3.3.1 e X3.3.4, p. 669–671 (PDF 705–707); X5.1, p. 679 (PDF 715); X5.8, p. 683 (PDF 719); glossário, p. 698 (PDF 734).
- PMBOK 7: Guia 2.3, p. 32–50 (PDF 127–145); 2.5.7, p. 76–77 (PDF 171–172); Guia 3, p. 133–139 (PDF 228–234).
- Rework: RW-041, RW-061, RW-060 e RW-062 (links nos itens e erros); RW-047 (https://resources.rework.com/libraries/project-management/waterfall-methodology-project-management); RW-044 (https://resources.rework.com/libraries/project-management/timeboxing); RW-048 (https://resources.rework.com/libraries/project-management/what-is-kanban).
- `checklist.md` (PC3); `experiencia.md` §1; `pmbok7.md` seções 3 e 6.
