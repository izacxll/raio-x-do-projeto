---
codigo: B2
nome: Lista de atividades
tipo: documento do projeto
etapas: [2, 4, 5]
gravidade: baixa
categoria: tempo
sinonimos: ["lista de atividades", "relação de atividades", "atividades do projeto", "plano de atividades", "descrição das atividades", "atividades por produto", "detalhamento das atividades"]
versao: 0.1.0
---

# B2 — Lista de atividades

## Para que serve
Relaciona as atividades do cronograma que produzem as entregas, cada uma com identificador e descrição do trabalho clara o bastante para a equipe saber o que fazer (PMBOK 6, 6.2.3.1, p. 185, PDF 221; glossário, p. 715, PDF 751). Nasce da decomposição dos pacotes de trabalho da EAP (A13); a decomposição aqui termina em atividades, não em entregas (p. 185). É a base para sequenciar (B16), estimar (B8) e programar (B15).

## Conteúdo mínimo
- **B2.1** Todo pacote de trabalho da EAP tem ao menos uma atividade, e toda atividade pertence a um pacote
  - fonte: PMBOK 6, 6.2, p. 185 (PDF 221); 5.4, p. 161 (PDF 197) (regra dos 100%)
  - sinais: atividades agrupadas por produto ou pacote | código da EAP por linha | "produto" | "pacote de trabalho"
  - confere: código
  - dispensa: nunca
- **B2.2** Identificador único por atividade, derivado da EAP
  - fonte: PMBOK 6, 6.2.3.1, p. 185 (PDF 221); Fig. 6-21, p. 219 (PDF 255)
  - sinais: "ID" | numeração hierárquica (1.1.1, 1.1.2) | sufixos por atividade
  - confere: código
  - dispensa: nunca
- **B2.3** Descrição do escopo de trabalho de cada atividade, suficiente para a equipe entender o que fazer
  - fonte: PMBOK 6, 6.2.3.1, p. 185 (PDF 221); glossário, p. 715 (PDF 751); PMBOK 7, artefatos, p. 192 (PDF 287)
  - sinais: coluna "descrição" | "escopo da atividade" | texto por atividade
  - confere: só PMO
  - dispensa: nunca
- **B2.4** Atividade nomeada como ação (verbo), distinta da entrega que ela produz
  - fonte: PMBOK 6, Fig. 6-21, p. 219 (PDF 255) (projetar, construir, testar); Rework RW-038 (https://resources.rework.com/libraries/project-management/work-package) e RW-053 (https://resources.rework.com/libraries/project-management/work-breakdown-structure)
  - sinais: verbos no infinitivo ("elaborar" | "levantar" | "realizar" | "analisar" | "revisar" | "consolidar")
  - confere: código
  - dispensa: nunca
- **B2.5** Análise e aprovação do contratante e dependências externas listadas como atividades
  - fonte: PMBOK 6, 6.3, p. 191–192 (PDF 227–228); checklist 4 e 8; Rework RW-051 (https://resources.rework.com/libraries/project-management/what-is-a-pert-chart) (passo 1, revisões e aprovações) e RW-027 (https://resources.rework.com/libraries/project-management/task-dependencies)
  - sinais: "análise do contratante" | "aprovação" | "validação" | "recebimento dos dados" | "autorização"
  - confere: código
  - dispensa: nunca
- **B2.6** Deslocamento, mobilização e logística de campo como atividades (ou parte explícita delas)
  - fonte: checklist 11; experiencia.md §5; PMBOK 6, 6.2.3.2, p. 186 (PDF 222) (local do trabalho)
  - sinais: "deslocamento" | "viagem" | "mobilização" | "logística" | "visita de campo" | "trabalho de campo"
  - confere: código
  - dispensa: sem campo
- **B2.7** Atividades de gerenciamento do projeto e de respostas aos riscos incluídas
  - fonte: PMBOK 6, 5.4, p. 161 (PDF 197) (a EAP inclui o gerenciamento); 11.5, p. 447–448 (PDF 483–484); experiencia.md §8
  - sinais: "reunião de abertura" | "gestão do projeto" | "relatório de acompanhamento" | "reunião de status" | atividade com o código do risco
  - confere: só PMO
  - dispensa: nunca
- **B2.8** Marcos identificados como marcos (duração zero), separados das atividades com duração
  - fonte: PMBOK 6, 6.2.3.3, p. 186 (PDF 222); Rework RW-038
  - sinais: "marco" | "M1" | "duração 0" | "0 dias" | losango
  - confere: código
  - dispensa: nunca
- **B2.9** Nível de detalhe proporcional e, com ondas sucessivas, trabalho distante marcado como de nível alto
  - fonte: PMBOK 6, 6.2, p. 185 (PDF 221); Rework RW-037 (https://resources.rework.com/libraries/project-management/rolling-wave-planning)
  - sinais: "onda" | "pacote de planejamento" | "a detalhar" | "detalhamento na fase"
  - confere: só PMO
  - dispensa: nunca
- **B2.10** Atividade de tamanho controlável: cabe num período de relatório, tem um responsável e um resultado verificável
  - fonte: PMBOK 6, 6.4, p. 202 (PDF 238) (decompor quando não dá para estimar com confiança); Rework RW-038 (teste das quatro perguntas) e RW-051 (dividir tarefa muito incerta)
  - sinais: atividades com duração muito maior que o período de relatório | "várias etapas" numa só linha
  - confere: só PMO
  - dispensa: porte pequeno

## Perguntas de qualidade
- Algum produto do contrato ficou sem atividade que o produza, revise e entregue? (regra dos 100%, PMBOK 6, p. 161, PDF 197)
- Cada produto tem a sequência completa: elaborar, revisar internamente, entregar, análise do contratante, ajustes, aceite? (checklist 4 e 5)
- O que depende de terceiros (dados, agendas, pareceres) aparece como atividade com dono do outro lado? (checklist 8)
- Se há campo: o deslocamento está listado, ou o tempo de viagem sumiu? (checklist 11; experiencia.md §5)
- A lista inclui as reuniões internas e de integração entre frentes? (experiencia.md §8)

## Erros comuns
- Listar entregas em vez de atividades; ou descer até tarefas individuais, inflando o cronograma (Rework RW-038 e RW-053).
- Lista copiada de outro projeto sem ajuste ao objeto (checklist 2; o PMBOK 6 cita listas de projetos anteriores como insumo da decomposição, p. 184, PDF 220, não como substituto dela).
- Aprovação do cliente fora da lista; o cronograma estoura nas aprovações (experiencia.md §1).
- Trabalho novo descoberto depois da linha de base incluído sem solicitação de mudança (PMBOK 6, p. 186, PDF 222).

## Quando dispensar a parte inteira
Em porte pequeno, a lista pode ser as linhas do próprio cronograma (B15), que já trazem ID, nome e agrupamento por produto; o PMBOK admite que a própria lista de atividades seja uma forma de apresentar o cronograma (Fig. 6-2, p. 176, PDF 212) e que 6.2 a 6.5 sejam um só processo em projeto pequeno (p. 175, PDF 211).
Linha para a tela: "Lista de atividades nas linhas do cronograma: porte pequeno (PMBOK 6, p. 175–176)."

## Ligações
- **Vem de:** 6.2, a partir da linha de base do escopo (A13: EAP, dicionário, premissas) e do A3 (nível de detalhe, ondas); proposta (EAP por produto da etapa 2); TAP (marcos).
- **Vai para:** 6.3, 6.4, 6.5 e 9.2; B1 (atributos de cada atividade), B16 (rede), B8 (durações), B15 (linhas), B26 (recursos); 4.3 (execução).
- Requisitos da RFP que listam atividades obrigatórias (oficinas, consultas, visitas) caem aqui, com o número R.

## Modelo de redação
```
Lista de atividades — versão [n]
Por produto/pacote da EAP:
  [EAP] [Produto]
    [ID] [Verbo + objeto] — descrição: [o que se faz; insumos; resultado]
    [ID] Revisão interna do [produto]
    [ID] Entrega do [produto] ao contratante            (marco, duração 0)
    [ID] Análise do contratante [prazo do contrato ou a definir pelo GP]
    [ID] Ajustes e versão final
Dependências externas: [atividade; de quem; prazo a definir pelo GP].
Gerenciamento: abertura, reuniões, relatórios [cadência a definir pelo GP].
```

## Fontes
- PMBOK 6: 5.4, p. 161 (PDF 197); 6.2, p. 184–186 (PDF 220–222); 6.3, p. 191–192 (PDF 227–228); 6.4, p. 202 (PDF 238); Fig. 6-2, p. 176 (PDF 212); Fig. 6-21, p. 219 (PDF 255); 11.5, p. 447–448 (PDF 483–484); p. 175 (PDF 211); glossário, p. 715 (PDF 751).
- PMBOK 7: artefatos, p. 192 (PDF 287).
- Rework: RW-027, RW-037, RW-038, RW-051, RW-053 (links nos itens).
- `checklist.md` (2, 4, 5, 8, 11); `experiencia.md` §1, §5 e §8.
