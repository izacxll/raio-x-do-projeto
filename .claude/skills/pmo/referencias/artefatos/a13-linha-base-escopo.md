---
codigo: A13
nome: Linha de base do escopo
tipo: componente do plano
etapas: [2, 4, 5]
gravidade: média
categoria: escopo
sinonimos: ["baseline do escopo", "escopo aprovado", "EAP", "estrutura analítica do projeto", "WBS", "dicionário da EAP"]
versao: 0.1.0
---

# A13 — Linha de base do escopo

## Para que serve
É "a versão aprovada de uma declaração do escopo do projeto, da EAP e de seu dicionário da EAP associado" (PMBOK 6, 5.4.3.1, p. 161, PDF 197). Só muda por controle formal de mudanças e é a referência para validar e controlar o escopo e para montar cronograma, custos e recursos. A EAP decompõe entregas, não atividades (p. 157, PDF 193); o dicionário detalha cada componente (p. 162, PDF 198). Na etapa 2, a EAP por produto sustenta a proposta.

## Conteúdo mínimo
- **A13.1** Identificada como versão aprovada: quem aprovou, data e número da versão; muda só por mudança aprovada
  - fonte: PMBOK 6, 5.4.3.1, p. 161 (PDF 197); glossário, p. 715 (PDF 751); Rework RW-029 (https://resources.rework.com/libraries/project-management/project-baseline)
  - sinais: "linha de base do escopo" | "versão aprovada" | "aprovado em" | "versão" | "baseline" | quadro de aprovação com data
  - confere: código
  - dispensa: nunca
- **A13.2** Inclui a especificação do escopo aprovada (B17), no texto ou por referência
  - fonte: PMBOK 6, 5.4.3.1, p. 161 (PDF 197); Parte 2, p. 570 (PDF 606)
  - sinais: "especificação do escopo" | "declaração do escopo" | "ver seção" | seção com entregas e exclusões
  - confere: código
  - dispensa: nunca
- **A13.3** EAP hierárquica (árvore, lista indentada ou tabela), com código único em cada componente
  - fonte: PMBOK 6, 5.4, p. 157–161 (PDF 193–197); glossário, código de contas, p. 702 (PDF 738); Rework RW-053 (https://resources.rework.com/libraries/project-management/work-breakdown-structure)
  - sinais: "EAP" | "estrutura analítica do projeto" | "WBS" | numeração hierárquica (1, 1.1, 1.1.1) | lista indentada ou organograma
  - confere: código
  - dispensa: nunca
- **A13.4** Componentes da EAP são entregas (produtos verificáveis, nomeados como substantivos), não atividades
  - fonte: PMBOK 6, 5.4, p. 157 (PDF 193); Rework RW-053 e RW-036 (https://resources.rework.com/libraries/project-management/project-deliverables)
  - sinais: rótulos como "Relatório de diagnóstico" ou "Plano de trabalho"; rótulo que começa com verbo no infinitivo ("Elaborar", "Realizar") indica atividade
  - confere: só PMO
  - dispensa: nunca
- **A13.5** Ramo de gerenciamento do projeto na EAP (plano de trabalho, reuniões, relatórios de acompanhamento)
  - fonte: PMBOK 6, 5.4, p. 161 (PDF 197) (regra dos 100%); Figs. 5-12 a 5-14, p. 158–160 (PDF 194–196)
  - sinais: "gerenciamento do projeto" | "gestão do projeto" | "coordenação" | "relatórios de acompanhamento" como ramo da EAP
  - confere: código
  - dispensa: nunca
- **A13.6** Regra dos 100%: todo produto do contrato e todo trabalho necessário estão na EAP, sem omissão nem trabalho fora do escopo; o segundo nível costuma espelhar os produtos do TR
  - fonte: PMBOK 6, 5.4, p. 161 (PDF 197); Rework RW-053 (com observação do leitor)
  - sinais: produtos do TR com os mesmos nomes e números na EAP | "Produto 1" | "P1"
  - confere: só PMO
  - dispensa: nunca
- **A13.7** Último nível em pacotes de trabalho em que custo e duração possam ser estimados e gerenciados, sem descer a tarefas; entregas distantes podem ficar como pacotes de planejamento
  - fonte: PMBOK 6, 5.4, p. 158, 160 e 161 (PDF 194, 196 e 197); Rework RW-038 (https://resources.rework.com/libraries/project-management/work-package)
  - sinais: "pacote de trabalho" | "pacote de planejamento" | último nível com código
  - confere: só PMO
  - dispensa: nunca
- **A13.8** Dicionário da EAP com, para cada pacote, ao menos código, descrição do trabalho, responsável e critério de aceitação
  - fonte: PMBOK 6, 5.4.3.1, p. 162 (PDF 198); PMBOK 7, 2.6, p. 85 (PDF 180); Rework RW-038
  - sinais: "dicionário da EAP" | tabela com colunas de código, descrição, responsável e critério de aceitação
  - confere: código
  - dispensa: porte pequeno
- **A13.9** Dicionário completado pelos outros processos: premissas e restrições, marcos, atividades, recursos, estimativa de custo, requisitos da qualidade, referências técnicas e acordos
  - fonte: PMBOK 6, 5.4.3.1, p. 162 (PDF 198); 8.1 (o dicionário recebe os requisitos da qualidade; `pmbok6.md`, seção 8)
  - sinais: "premissas" | "marcos" | "recursos" | "estimativa de custo" | "requisitos da qualidade" | "referências técnicas" | colunas desses campos no dicionário
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **A13.10** Contas de controle, onde escopo, custo e prazo se integram para medir o desempenho, quando houver valor agregado
  - fonte: PMBOK 6, 5.4.3.1, p. 161 (PDF 197); glossário, p. 703 (PDF 739)
  - sinais: "conta de controle" | "código de contas" | "valor agregado"
  - confere: código
  - dispensa: porte pequeno ou porte médio

## Perguntas de qualidade
- Cada produto do TR está na EAP com o mesmo nome e número, para medição e pagamento por produto baterem com o cronograma físico-financeiro? (Rework RW-053, observação do leitor)
- Somando os filhos chega-se ao pai, sem lacuna nem sobreposição? O que ficou fora da EAP está como exclusão no B17? (PMBOK 6, p. 161; Rework RW-053)
- O que depende do contratante (dados, aprovações, mobilização) aparece como pacote ou marco, ou some da EAP? (checklist 3 e 8)
- Versão preliminar, versão revisada e versão final aceita aparecem no dicionário ou como marcos? (Rework RW-038, observação do leitor)
- A decomposição é proporcional: nem tarefas no último nível, nem produto de meses sem pacote? (PMBOK 6, p. 160; Rework RW-038)
- Se há subcontratação, a parte do terceiro tem pacote próprio? (PMBOK 6, p. 159, PDF 195)

## Erros comuns
- EAP de atividades (verbos) em vez de entregas (PMBOK 6, p. 157; Rework RW-053).
- Esquecer o gerenciamento do projeto (PMBOK 6, p. 161).
- Decompor demais, ou cedo demais entregas distantes (PMBOK 6, p. 160).
- Pacotes sobrepostos ou trabalho órfão (Rework RW-053 e RW-038).
- Ir direto ao cronograma sem EAP (Rework RW-053).
- "Linha de base elástica": ajustada ao realizado sem pedido de mudança (Rework RW-029).

## Quando dispensar a parte inteira
Não se dispensa: o plano precisa ter linha de base do escopo (PMBOK 6, 4.2, p. 83, PDF 119). Em porte pequeno, a EAP pode ser uma tabela de produtos e pacotes com responsável e critério de aceitação, que faz as vezes do dicionário. Em abordagem adaptativa, o backlog (épicos e histórias) faz o papel da linha de base (p. 131, PDF 167; p. 160, PDF 196).
Linha para a tela: "EAP em tabela, servindo de dicionário: porte pequeno (PMBOK 6, p. 83 e 161)."

## Ligações
- **Vem de:** 5.4, com B17 e B22 (p. 157, PDF 193); A1 (como montar a EAP); TAP4 (principais entregas); EAP por produto da proposta (etapa 2; PROP-SOW); TR (produtos, prazos, pagamento).
- **Vai para:** B2 e B1 (atividades por pacote, 6.2); B8, B6 e B26 (estimativas por pacote); A14, A15 e A16; B18 (dono por pacote); A5 (8.1); B27 (11.2); A9 (12.1); 5.5 e 5.6; A11 (mudança da linha de base); B23 (requisito → código da EAP).
- Requisitos R que pedem produto, relatório, oficina ou evento viram componentes da EAP.

## Modelo de redação
```
Linha de base do escopo — versão [n], aprovada em [data] por [a definir pelo GP]
1. Especificação do escopo: ver B17.
2. EAP (por produto do TR):
   1 Gerenciamento do projeto — 1.1 Plano de trabalho; 1.2 Relatórios de acompanhamento
   2 Produto 1 [nome do TR] — 2.1 [parte verificável]; 2.2 ...
   3 Produto 2 [nome do TR] — ...
3. Dicionário: | Código | Descrição | Responsável | Critério de aceitação | Requisitos (R) | Premissas | Marco |
Pacote distante: pacote de planejamento, a detalhar até [data ou marco a definir pelo GP].
```

## Fontes
- PMBOK 6: 5.4, p. 157–162 (PDF 193–198); 4.2, p. 83 (PDF 119); p. 131 (PDF 167); Parte 2, p. 570 (PDF 606); glossário, p. 702, 703 e 715 (PDF 738, 739 e 751).
- PMBOK 7: 2.6, p. 85 (PDF 180); EAP, p. 187 (PDF 282); linha de base do escopo, p. 188 (PDF 283).
- Rework: RW-029, RW-036, RW-038, RW-053 (links nos itens).
- `checklist.md` (3, 8); `pmbok6.md`, seção 8.
