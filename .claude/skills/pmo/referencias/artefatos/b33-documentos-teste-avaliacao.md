---
codigo: B33
nome: Documentos de teste e avaliação
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: entrega
sinonimos: ["plano de testes", "documentos de teste", "roteiro de revisão", "lista de verificação dos produtos", "checklist de revisão", "plano de validação", "protocolo de avaliação"]
versao: 0.1.0
---

# B33 — Documentos de teste e avaliação

## Para que serve
Descrevem as atividades usadas para conferir se o produto atende aos objetivos de qualidade do plano (PMBOK 6, glossário, p. 707, PDF 743). Saem de 8.2, que transforma os requisitos de qualidade de 8.1 em instrumentos, e entram em 8.3 (p. 272 e 296, PDF 308 e 332). Em consultoria, são sobretudo listas de verificação por produto e o roteiro de revisão e de validação.

## Conteúdo mínimo
- **B33.1** Lista de verificação por produto que incorpora os critérios de aceite
  - fonte: PMBOK 6, 8.2.2, p. 292 (PDF 328); 8.2.3.2, p. 296 (PDF 332)
  - sinais: "lista de verificação" | "checklist" | "critérios de aceite" | itens marcáveis por produto
  - confere: código
  - dispensa: nunca
- **B33.2** Forma de verificação de cada produto (revisão por pares, conferência de dados, oficina de validação, piloto, teste de sistema), separando verificar de validar
  - fonte: PMBOK 6, 8.1.2, p. 285 (PDF 321); 8.3.2, p. 303 (PDF 339); Rework RW-045 (https://resources.rework.com/libraries/project-management/v-model)
  - sinais: "revisão por pares" | "oficina de validação" | "piloto" | "teste" | "verificação" | "validação"
  - confere: código
  - dispensa: nunca
- **B33.3** Responsável por cada verificação e, no aceite, quem do contratante participa
  - fonte: PMBOK 6, 8.2, p. 290 (PDF 326); Rework RW-045; RW-107 (https://resources.rework.com/libraries/process-management/qa-vs-qc)
  - sinais: "responsável" | "revisor" | "contratante" | "fiscal" | "área técnica"
  - confere: código
  - dispensa: nunca
- **B33.4** Requisitos (R) ligados a pelo menos uma forma de verificação (matriz de rastreabilidade detalhada)
  - fonte: PMBOK 6, 8.1, p. 280 (PDF 316); 8.2.3.2, p. 296 (PDF 332); Rework RW-045
  - sinais: "R01" | "matriz de rastreabilidade" | coluna requisito × verificação
  - confere: código
  - dispensa: porte pequeno
- **B33.5** Critérios de entrada e de saída de cada revisão: quando o produto pode ir para revisão e quando passa
  - fonte: Rework RW-045 (passo 9 e modelo de planejamento de testes)
  - sinais: "critério de entrada" | "critério de saída" | "pronto para revisão" | "aprovado para envio"
  - confere: código
  - dispensa: porte pequeno
- **B33.6** Instrumentos de coleta testados antes do uso (pré-teste de questionário ou roteiro, piloto)
  - fonte: PMBOK 6, 8.1.2, p. 285 (PDF 321) (testes de campo como exemplo de planejamento de testes); checklist 11
  - sinais: "pré-teste" | "piloto" | "teste do instrumento" | "validação do questionário"
  - confere: código
  - dispensa: sem campo
- **B33.7** Forma de verificação definida ao detalhar cada produto, não depois de pronto
  - fonte: Rework RW-045 (erros comuns); PMBOK 7, 2.6.3, p. 89 (PDF 184)
  - sinais: verificação descrita junto com o produto no A5 ou no dicionário da EAP
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Cada produto tem lista de verificação que reflete os critérios de aceite do A5? (PMBOK 6, p. 292, PDF 328)
- A revisão interna confere "atende ao TR" e a validação confere "serve ao problema"? (Rework RW-045, observação do leitor)
- O contratante participa da validação antes do produto final, ou só vê no fim? (Rework RW-045; PMBOK 7, p. 89, PDF 184)
- Há requisito sem forma de verificação? (Rework RW-045, requisitos órfãos)

## Erros comuns
- Lista de verificação genérica, sem os critérios deste contrato (PMBOK 6, p. 292, PDF 328; checklist 2).
- Aceite tratado como formalidade, com o cliente vendo o produto só no fim (Rework RW-045).
- Verificação escrita depois do produto, descrevendo o que foi feito (Rework RW-045; RW-064).

## Quando dispensar a parte inteira
Depende do setor e dos modelos da organização (PMBOK 6, p. 296, PDF 332). Em porte pequeno, a lista de verificação por produto pode ficar no A5 e o B33 deixa de existir à parte; em sistemas ou com regulador que exija evidência de teste, fica completo (Rework RW-045, quando usar).
Linha para a tela: "Listas de verificação dentro do plano da qualidade: porte pequeno (PMBOK 6, p. 296)."

## Ligações
- **Vem de:** 8.2, com A5, B20, B23 e os modelos da organização (p. 291, PDF 327); critérios de aceite da RFP e da proposta.
- **Vai para:** 8.3 (aplicação e ajuste; p. 306, PDF 342); B19 (resultados); B23 (cobertura dos R); 5.5 (aceite).

## Modelo de redação
```
Documentos de teste e avaliação — modelo inicial
| Produto | Forma de verificação (interna) | Validação (contratante) | Responsável | Entrada | Saída | Requisitos (R) |
|         | [revisão por par/conferência de dados] | [oficina/parecer] | [perfil] | [ ] | [critérios do A5] | |

Lista de verificação do produto [P]:
[ ] critério de aceite 1 (A5) ... [ ] formato do contratante  [ ] fontes citadas  [ ] revisão de linguagem
Instrumentos de campo (se houver): pré-teste em [a definir pelo GP] antes da coleta.
```

## Fontes
- PMBOK 6: p. 272 (PDF 308); 8.1, p. 280 e 285 (PDF 316 e 321); 8.2, p. 290–296 (PDF 326–332); 8.3, p. 303 e 306 (PDF 339 e 342); glossário, p. 707 (PDF 743).
- PMBOK 7: 2.6.3, p. 89 (PDF 184); artefatos, p. 187 (PDF 282) (plano de testes).
- Rework: RW-045, RW-107 (links nos itens); RW-064 (https://resources.rework.com/libraries/project-management/acceptance-criteria).
- `checklist.md` (2, 11).
