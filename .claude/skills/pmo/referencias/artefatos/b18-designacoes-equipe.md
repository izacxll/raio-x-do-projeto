---
codigo: B18
nome: Designações da equipe do projeto
tipo: documento do projeto
etapas: [2, 4, 5]
gravidade: baixa
categoria: equipe
sinonimos: ["designações da equipe", "designação da equipe", "equipe do projeto", "composição da equipe", "matriz RACI", "matriz de responsabilidades", "diretório da equipe", "quadro de equipe", "equipe técnica"]
versao: 0.1.0
---

# B18 — Designações da equipe do projeto

## Para que serve
Registra quem está na equipe, com que papel e com que responsabilidades, e pode incluir o diretório da equipe; os nomes também aparecem nos organogramas e cronogramas (PMBOK 6, 9.3.3.2, p. 334, PDF 370). Aqui fica a **matriz RACI** (9.1.2.2, p. 317, PDF 353). **Os nomes são Decisão do GP**: o PMO monta a estrutura e deixa o campo pendente. A pré-designação acontece quando a proposta ou o TAP já indicam pessoas (p. 333, PDF 369). Na proposta, o conteúdo é o da `prop-equipe`; esta ficha trata da versão do plano.

## Conteúdo mínimo
- **B18.1** Lista dos membros com papel e responsabilidades
  - fonte: PMBOK 6, 9.3.3.2, p. 334 (PDF 370)
  - sinais: tabela nome × papel × responsabilidade | "equipe do projeto" | "função"
  - confere: código
  - dispensa: nunca
- **B18.2** Nomes como Decisão do GP: campo pendente, sem nome preenchido pelo PMO
  - fonte: SKILL.md, princípio 1 e etapa 4; decisão 0011
  - sinais: "a definir pelo GP" | "decisão do GP" | campo de nome vazio
  - confere: código
  - dispensa: nunca
- **B18.3** Equipe-chave da proposta mantida, e cada profissional pontuado com papel e horas na execução
  - fonte: PMBOK 6, 9.3.2.3, p. 333 (PDF 369); `licitacoes.md` 2.2 (art. 38)
  - sinais: "equipe-chave" | perfil pontuado presente na lista e na RACI
  - confere: código
  - dispensa: nunca
- **B18.4** Um responsável principal por produto ou pacote de trabalho
  - fonte: PMBOK 6, 9.1.2.2, p. 316 (PDF 352); `checklist.md` 6 (CP10)
  - sinais: coluna "responsável" | "R" único por linha | "coordenador da frente"
  - confere: código
  - dispensa: nunca
- **B18.5** Matriz RACI por produto ou fase, com legenda e exatamente um "A" por linha
  - fonte: PMBOK 6, 9.1.2.2, p. 317 (PDF 353); Rework RW-049 (https://resources.rework.com/libraries/project-management/what-is-raci-matrix); Rework RW-059 (https://resources.rework.com/libraries/project-management/raci-template-examples)
  - sinais: "RACI" | "matriz de responsabilidades" | letras R, A, C, I | legenda
  - confere: código
  - dispensa: porte pequeno
- **B18.6** Contratante na matriz: gestor ou fiscal do contrato como "A" ou "C" no aceite de cada produto
  - fonte: PMBOK 6, 9.1.2.2, p. 317 (PDF 353) (equipes com recursos internos e externos); Rework RW-049 e RW-059 (adaptação do leitor); `checklist.md` 7 (CE16)
  - sinais: coluna "contratante" | "gestor do contrato" | "fiscal" | "ponto focal"
  - confere: código
  - dispensa: nunca
- **B18.7** Período de atuação e dedicação de cada membro (entrada, saída, horas ou percentual), coerente com o B25
  - fonte: PMBOK 6, 9.3.3.2, p. 334 (PDF 370); `checklist.md` 6 (CP10, momento de entrada)
  - sinais: "dedicação" | "período" | "entrada" | "horas/mês" | "%"
  - confere: código
  - dispensa: nunca
- **B18.8** Carga equilibrada: nenhum membro "R" em quase todas as linhas, e "C" só para quem influencia o resultado
  - fonte: Rework RW-049 e RW-059; `experiencia.md` §4
  - sinais: distribuição das letras por coluna
  - confere: só PMO
  - dispensa: porte pequeno
- **B18.9** Decisões do contratante (aceite, mudança de escopo, aprovação de instrumentos) separadas das tarefas, com um aprovador por decisão
  - fonte: Rework RW-058 (https://resources.rework.com/libraries/project-management/raci-vs-rasci-vs-daci); PMBOK 7, 2.2, p. 27–28 (PDF 122–123)
  - sinais: "DACI" | "matriz de decisões" | "aprovador" | "quem decide"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **B18.10** Diretório da equipe (contato e lotação), com o lado do contratante
  - fonte: PMBOK 6, 9.3.3.2, p. 334 (PDF 370)
  - sinais: "diretório" | "contato" | "e-mail" | "telefone"
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- A RACI bate com as obrigações da contratada e da contratante escritas no contrato e no edital? (Rework RW-059, adaptação do leitor)
- Há pessoa com responsabilidade e sem a autoridade correspondente? (PMBOK 6, p. 318–319, PDF 354–355; A6.4)
- Quem orienta e quem avalia são equipes separadas, quando a mesma frente faria as duas coisas? (checklist 10)
- Toda parte interessada da linha tem algum papel, nem que seja "I"? Alguém do B31 ficou de fora? (Rework RW-059)
- O substituto previsto para um profissional pontuado tem qualificação equivalente? (PMBOK 6, p. 330, PDF 366; `licitacoes.md` 2.2)

## Erros comuns
- Mais de um "A" por linha, ou nenhum (PMBOK 6, p. 317; Rework RW-049).
- RACI sem o contratante, que deixa o aceite sem dono (Rework RW-049, adaptação do leitor).
- PMO preenchendo nomes que só o GP pode indicar (SKILL.md, princípio 1).
- Profissional pontuado que não aparece na execução (`licitacoes.md` 2.2).
- Decisões de seguir ou parar e de orçamento forçadas em linhas de tarefa (Rework RW-059).
- Matriz montada uma vez e esquecida depois da abertura (Rework RW-059).

## Quando dispensar a parte inteira
Não se dispensa: a equipe e o responsável por produto entram nas durações e no cronograma (no PMBOK 6, as designações são entrada de 6.4 e 6.5; `pmbok6.md`, quadro dos documentos). Em porte pequeno, a RACI pode virar uma coluna de responsável no quadro de produtos; o Rework lembra que até equipes de três pessoas ganham com uma RACI enxuta (RW-058).
Linha para a tela: "Equipe com responsável por produto, sem RACI completa: porte pequeno."

## Ligações
- **Vem de:** 9.3, com A6, B26, B25, B31 (p. 330–331, PDF 366–367); PROP-EQUIPE (perfis, RACI, equipe pontuada); TAP (GP designado).
- **Vai para:** 6.4 e 6.5 (durações e cronograma); 11.5 (donos das respostas aos riscos); 12.1; 9.4 e 9.5; A7 (quem comunica); B32 (a equipe que assina os combinados, sem nomes no termo). Atualizado em 9.4 e 9.5.

## Modelo de redação
```
1. Equipe: | Papel | Nome (decisão do GP) | Responsabilidades | Dedicação | Período | Pontuado? |
2. Responsável por produto: | Produto | Responsável (papel) |
3. RACI: | Produto/fase | GP | Frente A | Frente B | Contratante (gestor/fiscal) |
   Legenda: R executa; A aprova (um por linha); C é consultado antes; I é informado depois.
4. Decisões do contratante: | Decisão | Quem conduz | Quem aprova | Prazo [doc, p.; ou a definir pelo GP] |
5. Diretório: [contatos — a preencher pelo GP].
```

## Fontes
- PMBOK 6: 9.1.2.2, p. 316–317 (PDF 352–353); 9.3, p. 330–334 (PDF 366–370).
- PMBOK 7: 2.2, p. 27–28 (PDF 122–123).
- Rework: RW-049, RW-058 e RW-059 (links nos itens).
- `checklist.md` 6, 7 e 10; `experiencia.md` §4; `licitacoes.md` 2.2; SKILL.md; decisão 0011; ficha `prop-equipe`.
