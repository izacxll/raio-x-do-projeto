---
codigo: A1
nome: Plano de gerenciamento do escopo
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: escopo
sinonimos: ["plano do escopo", "plano de gestão do escopo", "gerenciamento do escopo", "gestão do escopo", "controle do escopo", "gerenciamento do escopo e dos requisitos"]
versao: 0.1.0
---

# A1 — Plano de gerenciamento do escopo

## Para que serve
"Um componente do plano de gerenciamento do projeto ou programa que descreve como o escopo será definido, desenvolvido, monitorado, controlado e validado" (PMBOK 6, glossário, p. 719, PDF 755). Diz **como** se chega à especificação do escopo (B17), à EAP e à linha de base (A13), como as entregas são aceitas e o que acontece com pedido fora do escopo. O **que** será entregue fica no B17 e no A13. Pode ser formal ou informal, amplo ou detalhado (5.1.3.1, p. 137, PDF 173).

## Conteúdo mínimo
- **A1.1** Como a especificação do escopo (B17) será preparada: a partir de quais documentos (TR, proposta, TAP) e com quem
  - fonte: PMBOK 6, 5.1.3.1, p. 137 (PDF 173); 5.2, p. 140 (PDF 176)
  - sinais: "especificação do escopo" | "declaração do escopo" | "definição do escopo" | "termo de referência" | "a partir da proposta"
  - confere: código
  - dispensa: porte pequeno
- **A1.2** Como a EAP será montada a partir da especificação: organização (por produto ou por fase), nível de decomposição e codificação
  - fonte: PMBOK 6, 5.1.3.1, p. 137 (PDF 173); 5.4, p. 157–160 (PDF 193–196)
  - sinais: "EAP" | "estrutura analítica" | "decomposição" | "pacote de trabalho" | "por produto" | "por fase"
  - confere: código
  - dispensa: porte pequeno
- **A1.3** Como a linha de base do escopo (A13) será aprovada, por quem, e como será mantida (versões; mudança só por solicitação aprovada)
  - fonte: PMBOK 6, 5.1.3.1, p. 137 (PDF 173); 5.4.3.1, p. 161 (PDF 197); Rework RW-029 (https://resources.rework.com/libraries/project-management/project-baseline)
  - sinais: "linha de base do escopo" | "aprovação do escopo" | "versão aprovada" | "controle de versões" | "revisão da linha de base"
  - confere: código
  - dispensa: nunca
- **A1.4** Como as entregas serão aceitas formalmente: quem aceita do lado do contratante, com que documento e com que grau de formalidade
  - fonte: PMBOK 6, 5.1.3.1, p. 137 (PDF 173); 5.5, p. 165–166 (PDF 201–202); `licitacoes.md` 2.6 (Lei 14.133/2021, art. 140)
  - sinais: "aceite" | "aceitação" | "termo de aceite" | "recebimento provisório" | "recebimento definitivo" | "fiscal do contrato" | "gestor do contrato"
  - confere: código
  - dispensa: nunca
- **A1.5** Prazo de análise do contratante e limite de rodadas de revisão por produto; o que acontece com a entrega recusada
  - fonte: PMBOK 6, 5.5, p. 166 (PDF 202); `checklist.md` 4 e 5; `experiencia.md` §1 e §7; Rework RW-036 (https://resources.rework.com/libraries/project-management/project-deliverables)
  - sinais: "prazo de análise" | "dias úteis para análise" | "rodadas de revisão" | "rodada de ajustes" | "aprovação tácita" | "versão final"
  - confere: código
  - dispensa: nunca
- **A1.6** Como o escopo será controlado: comparação com a linha de base, quem decide do lado do contratante e caminho do pedido fora do escopo até o plano de mudanças (A11)
  - fonte: PMBOK 6, 5.6, p. 168–169 (PDF 204–205); PMBOK 7, 2.6, p. 85–87 (PDF 180–182); Rework RW-030 (https://resources.rework.com/libraries/project-management/scope-creep)
  - sinais: "controle do escopo" | "fora do escopo" | "solicitação de mudança" | "mudança de escopo" | "aditivo" | "plano de mudanças"
  - confere: código
  - dispensa: nunca
- **A1.7** Ritmo de detalhamento coerente com o ciclo de vida (A17, A18): tudo detalhado no início, ou por fase, onda ou iteração, com a data de detalhar cada parte
  - fonte: PMBOK 6, p. 131 e 133 (PDF 167 e 169); 5.4, p. 160 (PDF 196); PMBOK 7, 2.4, p. 54 (PDF 149); Rework RW-037 (https://resources.rework.com/libraries/project-management/rolling-wave-planning)
  - sinais: "ondas sucessivas" | "elaboração progressiva" | "detalhado no início da fase" | "iteração" | "backlog"
  - confere: só PMO
  - dispensa: abordagem preditiva e uma fase
- **A1.8** Revisão interna antes do envio (controle da qualidade) separada do aceite do contratante: "pronto" não é "aceito"
  - fonte: PMBOK 6, 5.5, p. 164 (PDF 200); Rework RW-036
  - sinais: "revisão interna" | "revisão técnica" | "controle da qualidade" | "antes do envio" | "verificação"
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- O plano diz quem aceita cada produto, com que documento e em quanto tempo? Se o TR não fixa prazo de análise, isso virou pergunta de esclarecimento ou premissa? (checklist 4; `licitacoes.md` 2.6)
- Há limite de rodadas de revisão, e o que passa dele vira pedido de mudança? (checklist 5)
- Pedido feito em reunião ou oficina tem caminho escrito até o A11, com resposta de impacto em prazo e custo? (Rework RW-030)
- O ritmo de detalhamento bate com a abordagem do A18? Plano "ágil" com escopo fechado e entrega única no fim tem perfil preditivo (inferência das notas a partir da Fig. X3-1, PMBOK 6, p. 666, PDF 702).
- O plano descreve processo, ou só copia a lista de produtos? (p. 137 × p. 154)

## Erros comuns
- Plano que repete o escopo e não diz como aceitar nem como controlar (PMBOK 6, p. 137, PDF 173: o plano é o "como").
- Aceite sem prazo nem critério, com pagamento preso ao aceite (checklist 4; experiencia.md §1).
- Revisões sem limite com preço fixo (checklist 5; experiencia.md §7).
- Acréscimo "pequeno" absorvido sem decisão formal; banho de ouro tratado como qualidade (Rework RW-030).
- Linha de base fixada antes de o escopo estabilizar, ou ajustada ao realizado sem pedido de mudança (Rework RW-029).

## Quando dispensar a parte inteira
Não se dispensa: todo projeto precisa de algum controle de mudanças (PMBOK 6, p. 168, PDF 204) e de linha de base do escopo (4.2, p. 83, PDF 119). Mas pode ser curto e informal (p. 137, PDF 173). Em porte pequeno, vira uma seção "Escopo e requisitos" junto com o A2, com aceite, revisões e controle; A1.1 e A1.2 ficam implícitos no B17 e na EAP.
Linha para a tela: "Escopo e requisitos numa seção só, com aceite e controle de mudanças: porte pequeno (PMBOK 6, p. 137)."

## Ligações
- **Vem de:** 5.1, com TAP (TAP3, TAP4 e TAP9; p. 135, PDF 171), A5, A17 e A18 (p. 135); proposta (PROP-SOW: produtos, aceite, exclusões, revisões); TR e contrato (recebimento, alterações).
- **Vai para:** 5.2 a 5.6; B17, A13, B22, B23; A3 (6.1); A9 (12.1); A11; B15 (prazos de análise viram atividade e folga na rede).
- Requisitos R sobre aprovação dos produtos, recebimento, revisões ou forma de entrega caem aqui.

## Modelo de redação
```
1. Definição: sugere-se partir do TR [item, p.], da proposta e do TAP; B17 aprovado por [a definir pelo GP].
2. EAP por [produto do TR | fase], até pacotes de trabalho; códigos 1, 1.1, 1.1.1.
3. Linha de base: aprovada por [papel no contratante e na FGV]; versão e data; muda só via A11.
4. Aceite: | Produto | Quem aceita | Documento | Prazo de análise | Rodadas de revisão |
   Prazo e rodadas conforme o TR; se o TR não fixa: a definir pelo GP (sugere-se esclarecimento).
5. Revisão interna FGV antes de cada envio: [responsável a definir pelo GP].
6. Controle: pedido fora do escopo registrado por escrito e levado ao A11, com impacto em prazo e custo.
7. Detalhamento: [tudo no início | por fase ou onda, com datas].
```

## Fontes
- PMBOK 6: cap. 5, p. 131–137 (PDF 167–173); 5.2, p. 140 (PDF 176); 5.4, p. 157–161 (PDF 193–197); 5.5, p. 164–166 (PDF 200–202); 5.6, p. 168–169 (PDF 204–205); 4.2, p. 83 (PDF 119); X3, p. 666 (PDF 702); glossário, p. 719 (PDF 755).
- PMBOK 7: 2.4, p. 54 (PDF 149); 2.6, p. 85–87 (PDF 180–182); plano do escopo, p. 187 (PDF 282).
- Rework: RW-029, RW-030, RW-036, RW-037 (links nos itens).
- `checklist.md` (4, 5); `experiencia.md` §1, §7 e §9; `licitacoes.md` 2.6 e 2.7.
