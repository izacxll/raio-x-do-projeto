---
codigo: B23
nome: Matriz de rastreabilidade dos requisitos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: escopo
sinonimos: ["matriz de rastreabilidade", "rastreabilidade dos requisitos", "matriz de atendimento", "matriz de requisitos", "quadro de atendimento aos requisitos"]
versao: 0.1.0
---

# B23 — Matriz de rastreabilidade dos requisitos

## Para que serve
É "uma tabela que liga os requisitos de produto desde as suas origens até as entregas que os satisfazem" (PMBOK 6, 5.2.3.2, p. 148, PDF 184). Garante que cada requisito aprovado seja entregue e ajuda a medir o impacto de mudanças (p. 148 e 169, PDF 184 e 205). No app, o encadeamento é **RFP → TAP → PGP pelos números R**: cada R da etapa 1 aparece no TAP (se for de alto nível) e no PGP, ligado ao produto da EAP e à forma de validação.

## Conteúdo mínimo
- **B23.1** Uma linha por requisito, identificada pelo número R da RFP
  - fonte: PMBOK 6, 5.2.3.2, p. 148–149 (PDF 184–185), Fig. 5-7; SKILL.md, princípio 9
  - sinais: "matriz de rastreabilidade" | "rastreabilidade" | tabela com coluna "R" e linhas R01, R02…
  - confere: código
  - dispensa: nunca
- **B23.2** Origem de cada requisito: documento e página, e a necessidade do contratante a que responde
  - fonte: PMBOK 6, 5.2.3.2, p. 148–149 (PDF 184–185); Rework RW-031 (https://resources.rework.com/libraries/project-management/requirements-traceability-matrix)
  - sinais: "origem" | "fonte" | "TR" | "edital" | "página" | coluna de origem
  - confere: código
  - dispensa: nunca
- **B23.3** Ligação com os objetivos do projeto e com os requisitos de alto nível do TAP (TAP2, TAP3)
  - fonte: PMBOK 6, 5.2.3.2, p. 148–149 (PDF 184–185); Rework RW-030 (https://resources.rework.com/libraries/project-management/scope-creep)
  - sinais: "objetivo" | "TAP" | coluna de objetivo ou de requisito de alto nível
  - confere: código
  - dispensa: porte pequeno
- **B23.4** Entrega e código da EAP que atendem a cada requisito
  - fonte: PMBOK 6, 5.2.3.2, p. 148–149 (PDF 184–185), Fig. 5-7; Rework RW-031
  - sinais: "entrega" | "produto" | "EAP" | código hierárquico (2.1, 3.2) | coluna de entrega
  - confere: código
  - dispensa: nunca
- **B23.5** Mesmo número R na RFP, no TAP e no PGP, sem requisito perdido nem renumerado
  - fonte: SKILL.md, princípio 9; decisão 0013, nível (a); PMBOK 6, p. 148 (PDF 184) (rastrear do início ao fim do ciclo de vida)
  - sinais: os números R da etapa 1 presentes na matriz
  - confere: código
  - dispensa: nunca
- **B23.6** Forma de validação e responsável pelo aceite de cada requisito
  - fonte: PMBOK 6, 5.5, p. 165 e 167 (PDF 201 e 203); Rework RW-031
  - sinais: "validação" | "como será verificado" | "evidência" | "responsável pelo aceite" | "fiscal" | coluna de validação
  - confere: código
  - dispensa: porte pequeno
- **B23.7** Situação de cada requisito e data (a iniciar, atendido, aceito, adiado, cancelado)
  - fonte: PMBOK 6, 5.2.3.2, p. 148 (PDF 184); p. 167 e 169 (PDF 203 e 205)
  - sinais: "status" | "situação" | "atendido" | "aceito" | "pendente" | "cancelado" | coluna de situação
  - confere: código
  - dispensa: nunca
- **B23.8** Rastreabilidade para trás: cada produto ou pacote da EAP aponta para um requisito ou para o gerenciamento; produto sem requisito é trabalho a mais
  - fonte: Rework RW-031 e RW-030; PMBOK 6, p. 148 (PDF 184) (cada requisito agrega valor)
  - sinais: coluna de requisitos (R) no dicionário da EAP ou na tabela de produtos
  - confere: só PMO
  - dispensa: porte pequeno
- **B23.9** Requisito sem entrega, ou atendido em parte, aparece com o motivo e o destino (exclusão, premissa, pergunta ao contratante, mudança)
  - fonte: PMBOK 6, p. 148 (PDF 184); Rework RW-031; `checklist.md` (destinos das perguntas)
  - sinais: "não atendido" | "atendido parcialmente" | "fora do escopo" | "pendente de esclarecimento" | célula de entrega vazia
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Todo R da etapa 1 está na matriz, com o mesmo número? (SKILL.md, princípio 9)
- Algum R ficou sem entrega? O motivo está escrito, ou o requisito sumiu? (Rework RW-031)
- Algum pacote da EAP não serve a requisito nem ao gerenciamento? Pode ser banho de ouro (Rework RW-030).
- A validação diz onde o requisito é atendido (seção do produto, ata, lista de presença), de um jeito que o fiscal confira? (Rework RW-031, observação do leitor; checklist 4)
- A matriz será mantida na execução, com situação atualizada a cada entrega? (Rework RW-031)

## Erros comuns
- Matriz feita uma vez e abandonada; situação atrasada em relação ao real (Rework RW-031).
- Só rastreabilidade para a frente, deixando trabalho de itens já retirados do escopo (Rework RW-031).
- Requisito vago na origem, impossível de verificar (Rework RW-031).
- Renumerar os requisitos entre RFP, TAP e PGP (SKILL.md, princípio 9).

## Quando dispensar a parte inteira
Não se dispensa quando há requisitos numerados: é por ela que se liga RFP, TAP e PGP. O PMBOK não fala em simplificar, e os atributos são "pode incluir" (p. 148, PDF 184). Em porte pequeno, pode ser a própria tabela do B22 com colunas de entrega (EAP), validação e situação, na versão enxuta do Rework RW-031.
Linha para a tela: "Rastreabilidade como colunas da lista de requisitos: porte pequeno (PMBOK 6, p. 148; Rework RW-031)."

## Ligações
- **Vem de:** 5.2, com B22; estrutura definida no A2 (A2.6); etapa 1 (lista R com página); TAP (TAP2, TAP3); proposta (matriz de atendimento ao edital, se houver); A13 (códigos da EAP).
- **Vai para:** 5.3 e 5.5 (validação e aceite); 5.6 e 4.6 (impacto de mudanças; p. 169, PDF 205); A5 (8.1); A9 (12.1); 4.3; B33; conferência da etapa 5 (cobertura dos R).

## Modelo de redação
```
| R | Requisito (resumo) | Origem (doc, p.) | Objetivo / TAP | Produto e código EAP | Validação (evidência) | Quem aceita | Situação | Data |
| R01 | ... | TR, p. [n] | TAP3 | 2.1 | [seção do produto; ata] | [a definir pelo GP] | a iniciar | — |
Requisitos sem entrega: | R | Motivo | Destino (exclusão, premissa, pergunta, mudança) |
```

## Fontes
- PMBOK 6: 5.2.3.2, p. 148–149 (PDF 184–185); 5.5, p. 165 e 167 (PDF 201 e 203); 5.6, p. 169 (PDF 205).
- PMBOK 7: 2.6, p. 83 (PDF 178); matriz de rastreabilidade, p. 189 (PDF 284).
- Rework: RW-030, RW-031 (links nos itens).
- SKILL.md, princípio 9; decisão 0013; `checklist.md` (4).
