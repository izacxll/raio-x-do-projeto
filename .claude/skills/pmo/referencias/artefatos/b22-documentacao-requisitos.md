---
codigo: B22
nome: Documentação dos requisitos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: escopo
sinonimos: ["requisitos do projeto", "lista de requisitos", "registro de requisitos", "especificação de requisitos", "requisitos", "quadro de requisitos"]
versao: 0.1.0
---

# B22 — Documentação dos requisitos

## Para que serve
"Uma descrição de como os requisitos individuais atendem às necessidades de negócios do projeto" (PMBOK 6, glossário, p. 707, PDF 743). Pode começar em alto nível e ser detalhada aos poucos; vai de uma lista simples, categorizada e priorizada, a um documento extenso (5.2.3.1, p. 147, PDF 183). É a base da EAP e do planejamento de custo, cronograma, qualidade e aquisições (p. 140, PDF 176). No app, os requisitos da RFP já vêm numerados da etapa 1 (R01, R02…); o B22 os reúne, com origem, e acrescenta o que o planejamento detalhar.

## Conteúdo mínimo
- **B22.1** Cada requisito com identificador único; os da RFP com o número R da etapa 1, sem renumerar
  - fonte: PMBOK 6, 5.2, p. 148 (PDF 184) (identificador único); PMBOK 7, 2.6, p. 82–83 (PDF 177–178) (rastreabilidade); SKILL.md, princípio 9
  - sinais: "R01" | "R02" | "ID" | tabela com coluna de identificador
  - confere: código
  - dispensa: nunca
- **B22.2** Descrição e origem de cada requisito: documento e página (TR, edital, contrato, proposta) ou reunião e data
  - fonte: PMBOK 6, 5.2, p. 141–143 e 148 (PDF 177–179 e 184); Rework RW-031 (https://resources.rework.com/libraries/project-management/requirements-traceability-matrix)
  - sinais: "origem" | "fonte" | "item do TR" | "cláusula" | "página" | coluna de origem
  - confere: código
  - dispensa: nunca
- **B22.3** Requisitos não ambíguos: mensuráveis e testáveis, com uma só leitura
  - fonte: PMBOK 6, 5.2.3.1, p. 147 (PDF 183); PMBOK 7, 2.6, p. 82–83 (PDF 177–178); `checklist.md` 1; Rework RW-031
  - sinais: quantidades, prazos e formatos no texto do requisito; "entre outros", "quando necessário", "adequado" indicam ambiguidade
  - confere: só PMO
  - dispensa: nunca
- **B22.4** Completos, consistentes e aceitáveis para as partes principais: sem contradição entre si nem com o TR; divergência resolvida com leitura adotada no B3
  - fonte: PMBOK 6, 5.2.3.1, p. 147 (PDF 183); PMBOK 7, 2.6, p. 82–83 (PDF 177–178); `checklist.md` 1
  - sinais: "leitura adotada" | "premissa" | "conforme esclarecimento"
  - confere: só PMO
  - dispensa: nunca
- **B22.5** Tipo de cada requisito, incluindo os de projeto (prazos, obrigações contratuais) e, se o TR pedir, os de transição (capacitação, repasse)
  - fonte: PMBOK 6, 5.2.3.1, p. 148 (PDF 184); PMBOK 7, artefatos, p. 192 (PDF 287)
  - sinais: "tipo" | "requisito de negócio" | "funcional" | "não funcional" | "requisito de projeto" | "requisito de qualidade" | "transição" | coluna de tipo
  - confere: código
  - dispensa: porte pequeno
- **B22.6** Prioridade de cada requisito (obrigatório pelo TR × acrescido ou desejável)
  - fonte: PMBOK 6, 5.2.3.1, p. 147–148 (PDF 183–184); PMBOK 7, p. 192 (PDF 287); Rework RW-063 (https://resources.rework.com/libraries/project-management/moscow-prioritization)
  - sinais: "prioridade" | "obrigatório" | "desejável" | "Must" | coluna de prioridade
  - confere: código
  - dispensa: porte pequeno
- **B22.7** Critério de aceitação ou forma de verificação de cada requisito
  - fonte: PMBOK 6, 5.2, p. 148 (PDF 184); PMBOK 7, 2.6, p. 82 (PDF 177) e p. 192 (PDF 287); Rework RW-031
  - sinais: "critério de aceitação" | "critério de aceite" | "como verificar" | "evidência" | coluna de critério
  - confere: código
  - dispensa: nunca
- **B22.8** Dono de cada requisito (quem pede e quem aceita)
  - fonte: PMBOK 6, 5.2, p. 148 (PDF 184) (proprietário); Rework RW-031
  - sinais: "proprietário" | "solicitante" | "responsável" | "quem aceita" | coluna de responsável
  - confere: código
  - dispensa: porte pequeno
- **B22.9** Requisito novo achado no planejamento entra como sugestão, sem número R, até o aceite do GP; o que exceder o contrato vai ao A11
  - fonte: SKILL.md, princípio 9; PMBOK 6, 5.3, p. 151 (PDF 187) (nem todo requisito coletado entra); Rework RW-030 (https://resources.rework.com/libraries/project-management/scope-creep) e RW-067 (https://resources.rework.com/libraries/project-management/product-backlog)
  - sinais: "proposto" | "pendente de aceite" | "sugestão" | "solicitação do contratante" | "fora do escopo"
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Todos os R da etapa 1 estão aqui, com o mesmo número e o mesmo sentido do TR? (SKILL.md, princípio 9)
- Algum requisito admite duas leituras (plural sem quantidade, "acompanhamento" sem frequência)? A leitura adotada está no B3 e há pergunta ao contratante? (checklist 1)
- Obrigações contratuais e marcos do TR aparecem como requisitos de projeto? (PMBOK 6, p. 148, PDF 184)
- Cada requisito tem como ser verificado pelo fiscal? (checklist 4)
- Há requisito que transfere à FGV algo que depende do contratante? (checklist 3)

## Erros comuns
- Requisito vago, impossível de testar (Rework RW-031).
- Renumerar ou resumir o requisito a ponto de mudar o sentido do TR (SKILL.md, princípios 3 e 9).
- Tudo "obrigatório" e nada priorizado (Rework RW-063).
- Tratar o backlog ou a lista de desejos do contratante como requisito contratado (Rework RW-067, observação do leitor).
- Esquecer requisitos não funcionais (prazos, formato, sigilo, acessibilidade) (Rework RW-031).

## Quando dispensar a parte inteira
Não se dispensa quando a RFP traz requisitos, o que é a regra. Em porte pequeno, basta a lista R01… com descrição, origem e critério (lista simples: PMBOK 6, p. 147, PDF 183), e ela pode ser a mesma tabela da B23. Em abordagem adaptativa, os requisitos formam o backlog (p. 133, PDF 169).
Linha para a tela: "Lista dos R com origem e critério, junto com a rastreabilidade: porte pequeno (PMBOK 6, p. 147)."

## Ligações
- **Vem de:** 5.2, com etapa 1 (R01…, com página), TAP3 (p. 140, PDF 176), acordos e TR (p. 141, PDF 177), proposta, B31 (quem informa requisitos), B3, A2 e A10.
- **Vai para:** B17 (5.3 escolhe os finais); A13 (base da EAP); A5 e B20 (8.1); A6 (9.1); A7 (10.1); B27 (11.2); A9 (12.1); B23; 5.5 e 5.6; 4.7 (conformidade no encerramento).

## Modelo de redação
```
| R | Requisito | Origem (doc, p.) | Tipo | Prioridade | Critério / verificação | Dono |
| R01 | [texto do TR] | TR, p. [n] | projeto | obrigatório | [conforme TR, ou a definir pelo GP] | [a definir pelo GP] |
Requisitos sugeridos (sem número até o aceite do GP): | Sugestão | Motivo | Origem |
Leituras adotadas: ver B3; perguntas ao contratante: ver B9.
```

## Fontes
- PMBOK 6: 5.2, p. 140–148 (PDF 176–184); 5.3, p. 151 (PDF 187); p. 133 (PDF 169); glossário, p. 707 (PDF 743).
- PMBOK 7: 2.6, p. 82–83 (PDF 177–178); documentação dos requisitos, p. 192 (PDF 287).
- Rework: RW-030, RW-031, RW-063, RW-067 (links nos itens).
- SKILL.md, princípios 3 e 9; `checklist.md` (1, 3, 4).
