---
codigo: B17
nome: Especificação do escopo do projeto
tipo: documento do projeto
etapas: [4, 5]
gravidade: média
categoria: escopo
sinonimos: ["declaração do escopo do projeto", "declaração do escopo", "especificação do escopo", "escopo do projeto", "descrição do escopo", "escopo detalhado", "definição do escopo"]
versao: 0.1.0
---

# B17 — Especificação do escopo do projeto

## Para que serve
"A descrição do escopo do projeto, das principais entregas, premissas e restrições" (PMBOK 6, glossário, p. 709, PDF 745). A tradução também a chama de **declaração do escopo do projeto** (5.3.3.1, p. 154, PDF 190). Detalha o que o TAP traz em alto nível (Tabela 5-1, p. 155, PDF 191) e é a base para julgar se um pedido está dentro ou fora do escopo: quanto mais claro o que se faz e o que se exclui, mais controlável o escopo (p. 154). A versão aprovada integra a linha de base (A13). Não é o TR nem a especificação do trabalho de uma aquisição (`pmbok6.md`, seção 6).

## Conteúdo mínimo
- **B17.1** Descrição do escopo do produto: o que será produzido, elaborando o que o TAP e os requisitos dizem
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); Tabela 5-1, p. 155 (PDF 191)
  - sinais: "escopo do produto" | "descrição do escopo" | "objeto" | "escopo do projeto"
  - confere: código
  - dispensa: nunca
- **B17.2** Entregas listadas como produtos verificáveis, inclusive as de gerenciamento que forem contratuais (plano de trabalho, relatórios)
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); Rework RW-036 (https://resources.rework.com/libraries/project-management/project-deliverables) e RW-003 (https://resources.rework.com/libraries/project-management/project-scope-statement)
  - sinais: "entregas" | "produtos" | "Produto 1" | "P1" | tabela de produtos
  - confere: código
  - dispensa: nunca
- **B17.3** Critério de aceitação para cada entrega
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); PMBOK 7, 2.6, p. 84–85 (PDF 179–180); Rework RW-064 (https://resources.rework.com/libraries/project-management/acceptance-criteria)
  - sinais: "critérios de aceitação" | "critério de aceite" | "será considerado aceito" | "condições de aceite" | coluna de critério na tabela de produtos
  - confere: código
  - dispensa: nunca
- **B17.4** Critérios verificáveis (passa ou não passa): conteúdo mínimo, formato, base usada, validação; sem "a contento" ou "satisfatório" e sem contrariar o TR
  - fonte: PMBOK 6, glossário, p. 704 (PDF 740); PMBOK 7, 2.6, p. 82–83 (PDF 177–178); Rework RW-064; `checklist.md` 4
  - sinais: quantidades, formatos e condições explícitas no critério; "a contento", "satisfatório", "adequado" indicam critério vago
  - confere: só PMO
  - dispensa: nunca
- **B17.5** Exclusões explícitas, em lista própria
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); PMBOK 7, glossário, p. 242 (PDF 337); Rework RW-003 e RW-030 (https://resources.rework.com/libraries/project-management/scope-creep); `checklist.md` 5
  - sinais: "exclusões" | "fora do escopo" | "não faz parte do escopo" | "não está incluído" | "não contempla" | "não inclui"
  - confere: código
  - dispensa: nunca
- **B17.6** As exclusões cobrem o trabalho que o contratante pode supor incluído (implantação, capacitação extra, nova rodada de campo) e o que cabe ao contratante
  - fonte: Rework RW-003 (observação do leitor); `checklist.md` 3 e 5; `experiencia.md` §7
  - sinais: "implantação" | "capacitação adicional" | "cabe ao contratante" | "obrigações do contratante"
  - confere: só PMO
  - dispensa: nunca
- **B17.7** Limites de volume: quantidades por entrega (oficinas, municípios, entrevistas, rodadas de revisão), sem "entre outros" ou "quantas forem necessárias"
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190) (grau de detalhe); `checklist.md` 1 e 5; `experiencia.md` §7
  - sinais: números por entrega | "até" | "no máximo" | "rodadas de revisão"; "entre outros", "conforme demanda", "quando necessário" indicam falta de limite
  - confere: só PMO
  - dispensa: nunca
- **B17.8** Premissas do escopo, no texto ou por referência ao registro de premissas (B3)
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); 5.4.3.1, p. 161 (PDF 197); Rework RW-003
  - sinais: "premissas" | "pressupõe-se" | "considera-se que" | "registro de premissas"
  - confere: código
  - dispensa: nunca
- **B17.9** Restrições (prazo contratual, valor, vedações do edital, regras do contratante)
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); Rework RW-003
  - sinais: "restrições" | "vedada" | "vedação" | "prazo de vigência" | "valor global" | "limite"
  - confere: código
  - dispensa: nunca
- **B17.10** Coerente com o TAP e o TR: detalha o TAP4 sem contradizer o TR e a proposta, e não se limita a repetir o TAP
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); Tabela 5-1, p. 155 (PDF 191); `licitacoes.md`, seção 1 (o edital manda); Rework RW-003 (observação do leitor)
  - sinais: "conforme o termo de referência" | "conforme a proposta" | referência a item do TR ou do TAP
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Cada produto tem critério que o fiscal consegue conferir sem interpretar? (checklist 4)
- Algum trecho admite duas leituras ("relatório" sem dizer se é por etapa; plural sem quantidade)? A leitura adotada virou premissa? (checklist 1)
- As exclusões estão escritas antes de alguém perguntar, inclusive o trabalho vizinho que o contratante pode supor incluído? (Rework RW-003; checklist 5)
- O que depende do contratante (dados, espaço, mobilização) está como premissa com prazo ou como exclusão? (checklist 3 e 8)
- Há texto de outro projeto (outro órgão, outro tipo de contrato)? (checklist 2, CP8)
- O TAP adianta detalhes que cabem aqui, ou a especificação só repete o TAP? (PMBOK 6, p. 154–155)

## Erros comuns
- Entregas escritas como atividades ("realizar oficinas") (Rework RW-003 e RW-036).
- Sem lista de exclusões (Rework RW-003 e RW-033; checklist 5).
- Critérios vagos, ou escritos depois do trabalho (Rework RW-064 e RW-036).
- "Entre outros", "quando necessário" e revisões sem limite com preço fixo (experiencia.md §7).
- Contradizer o TR, ou tratar a especificação como se fosse o contrato (Rework RW-003, observação do leitor).

## Quando dispensar a parte inteira
Não se dispensa: sem ela não há base para dizer o que está fora do escopo (PMBOK 6, p. 154, PDF 190), e ela integra a linha de base (A13). Em porte pequeno, basta uma seção curta: objeto, tabela de produtos com critério de aceitação, exclusões, premissas e restrições, podendo apontar para o B3. Em ciclo iterativo, há visão de alto nível do todo e o detalhe vem a cada iteração (p. 151, PDF 187).
Linha para a tela: "Especificação curta, com produtos, critérios e exclusões: porte pequeno (PMBOK 6, p. 154)."

## Ligações
- **Vem de:** 5.3, com TAP (TAP2, TAP4 e TAP9; p. 152, PDF 188), B22 (requisitos finais; p. 151, PDF 187), B3, B27 (respostas a riscos podem mudar o escopo; p. 152) e A1; proposta (PROP-SOW: produtos, critérios, exclusões, premissas); TR.
- **Vai para:** 5.4 (EAP) e A13; A11 (base para julgar pedidos); A5 (a lista de verificação da qualidade usa os critérios de aceitação; p. 292, PDF 328); B3 e B23 (atualizados em 5.3); B15 (aprovações e revisões na rede).
- Requisitos R de produto, de formato e de aceite caem aqui; o TAP4 é detalhado aqui.

## Modelo de redação
```
1. Objeto e escopo do produto: [conforme TR, item, p.].
2. Produtos: | Nº | Produto | Descrição | Quantidade/volume | Critério de aceitação | Requisitos (R) |
   Critérios: conforme o TR; o que o TR não fixa fica como sugestão, a definir pelo GP.
3. Fora do escopo: sugere-se listar [trabalho vizinho que o contratante pode supor incluído].
   Cabe ao contratante: [dados, espaço, mobilização], com prazo a definir pelo GP.
4. Premissas: ver B3 (as do escopo repetidas aqui).
5. Restrições: [prazo de vigência, valor, vedações do edital].
6. Revisões: até [n a definir pelo GP] rodadas por produto; além disso, pedido de mudança (A11).
```

## Fontes
- PMBOK 6: 5.3, p. 151–155 (PDF 187–191); 5.4.3.1, p. 161 (PDF 197); 8.1, p. 292 (PDF 328); glossário, p. 704 e 709 (PDF 740 e 745).
- PMBOK 7: 2.6, p. 82–85 (PDF 177–180); glossário, p. 242 (PDF 337).
- Rework: RW-003, RW-030, RW-033 (https://resources.rework.com/libraries/project-management/statement-of-work), RW-036, RW-064 (links nos itens).
- `checklist.md` (1, 2, 3, 4, 5, 8); `experiencia.md` §7; `licitacoes.md`, seção 1; `pmbok6.md`, seção 6.
