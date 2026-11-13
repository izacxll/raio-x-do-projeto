---
codigo: B32
nome: Termo de nomeação da equipe
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: equipe
sinonimos: ["termo de nomeação da equipe", "termo de abertura da equipe", "termo de abertura da equipe do projeto", "termo de constituição da equipe", "acordo de trabalho da equipe", "regras básicas da equipe", "team charter", "combinados da equipe", "código de conduta da equipe"]
versao: 0.1.0
---

# B32 — Termo de nomeação da equipe

## Para que serve
É o *team charter*: o "documento que define os valores, acordos e diretrizes operacionais para a equipe" (PMBOK 6, 9.1.3.2, p. 319, PDF 355), com as expectativas de comportamento. **Não tem nomes**; os nomes ficam nas designações da equipe (B18) (decisão 0011). O PMBOK 7 o chama de termo de abertura da equipe do projeto (2.2, p. 19, PDF 114). As regras básicas reduzem conflitos (PMBOK 6, p. 348, PDF 384).

## Conteúdo mínimo
- **B32.1** Valores da equipe
  - fonte: PMBOK 6, 9.1.3.2, p. 319 (PDF 355)
  - sinais: "valores" | "princípios" | "conduta" | "ética"
  - confere: código
  - dispensa: nunca
- **B32.2** Diretrizes de comunicação interna: canais, prazos de resposta e o que precisa ficar por escrito
  - fonte: PMBOK 6, 9.1.3.2, p. 319 (PDF 355); Rework RW-110 (https://resources.rework.com/libraries/productivity/async-communication-best-practices)
  - sinais: "comunicação" | "canal" | "prazo de resposta" | "por escrito" | "e-mail" | "mensagem"
  - confere: código
  - dispensa: nunca
- **B32.3** Critérios e processo de tomada de decisão, com o que a equipe decide e o que sobe ao GP ou ao contratante
  - fonte: PMBOK 6, 9.1.3.2, p. 319 (PDF 355); PMBOK 7, 2.2, p. 27–28 (PDF 122–123)
  - sinais: "tomada de decisão" | "como decidimos" | "escalonamento" | "consenso" | "quem decide"
  - confere: código
  - dispensa: nunca
- **B32.4** Processo de resolução de conflitos, em degraus (entre os membros, com o GP, procedimento formal)
  - fonte: PMBOK 6, 9.1.3.2, p. 319 (PDF 355); 9.5, p. 348 (PDF 384); PMBOK 7, 2.2, p. 29 (PDF 124)
  - sinais: "conflito" | "resolução de conflitos" | "divergência" | "mediação"
  - confere: código
  - dispensa: nunca
- **B32.5** Diretrizes de reuniões: pauta prévia, quem decide, horário, ata com ações, responsável e prazo
  - fonte: PMBOK 6, 9.1.3.2, p. 319 (PDF 355) e 10.2, p. 386 (PDF 422); Rework RW-109 (https://resources.rework.com/libraries/productivity/pointless-meetings)
  - sinais: "pauta" | "ata" | "encaminhamentos" | "etiqueta de reunião" | "pontualidade"
  - confere: código
  - dispensa: nunca
- **B32.6** Acordos de trabalho: horários, registro das decisões, uso das ferramentas e sigilo das informações
  - fonte: PMBOK 6, 9.1.3.2, p. 319–320 (PDF 355–356); Rework RW-110
  - sinais: "acordos da equipe" | "regras básicas" | "registro de decisões" | "sigilo" | "confidencialidade"
  - confere: código
  - dispensa: nunca
- **B32.7** Sem lista de nomes; remissão ao B18 para quem é quem
  - fonte: decisão 0011; PMBOK 6, 9.3.3.2, p. 334 (PDF 370)
  - sinais: ausência de tabela nominal | remissão às designações da equipe
  - confere: código
  - dispensa: nunca
- **B32.8** Feito ou validado pela própria equipe, revisto periodicamente e usado para integrar quem chega
  - fonte: PMBOK 6, 9.1.3.2, p. 320 (PDF 356)
  - sinais: "validado pela equipe" | "revisão" | "integração de novos membros"
  - confere: só PMO
  - dispensa: nunca
- **B32.9** Regras de integração para equipe mista ou distante (FGV, subcontratada, servidores, equipe de campo)
  - fonte: PMBOK 7, 2.2, p. 19 (PDF 114); PMBOK 6, 9.3.2.4, p. 333 (PDF 369); `checklist.md` 11 (TC19)
  - sinais: "uma só equipe" | "equipe de campo" | "encontro presencial" | "protocolo" | "equipe remota"
  - confere: código
  - dispensa: sem campo e subcontratação vedada

## Perguntas de qualidade
- As regras são da equipe deste projeto, ou um texto genérico que ninguém vai seguir? (PMBOK 6, p. 320, PDF 356)
- O termo diz quais decisões a equipe toma sozinha e quais escalam, com alternativas analisadas? (PMBOK 7, p. 27–28, PDF 122–123)
- Equipe de campo distante da coordenação tem rotina de contato e encontro presencial? (checklist 11, TC19; `experiencia.md` §5)
- As regras de comunicação interna são coerentes com o A7 (reuniões internas)? (A7.9)
- Decisões e aprovações ficam registradas em canal formal, e não só em aplicativo de mensagens? (Rework RW-110, adaptação do leitor)

## Erros comuns
- **Confundir com o B18 e encher de nomes.** O termo traz combinados; quem é quem fica no B18 (decisão 0011).
- Texto copiado de outro projeto, escrito pelo GP sozinho (PMBOK 6, p. 320, PDF 356).
- Reunião sem pauta, sem decisor e sem ações com dono (Rework RW-109).
- Chat para tudo, misturando coordenação rápida com decisão (Rework RW-110).
- Equipe de várias organizações sem mecanismo de integração (PMBOK 7, 2.2, sinais do domínio da equipe).

## Quando dispensar a parte inteira
O PMBOK 7 liga o rigor ao porte (3.2, p. 133, PDF 228) e dá como exemplo de remoção o fim das atas numa equipe pequena, estável e que se comunica bem (3.3, p. 135, PDF 230). Em porte pequeno, pode virar meia página dentro do A6, com decisão, conflitos, reuniões e comunicação interna.
Linha para a tela: "Combinados da equipe em meia página no plano de recursos: porte pequeno (PMBOK 7, p. 133)."

## Ligações
- **Vem de:** 9.1 (saída), com A6 e a cultura da FGV (políticas de RH, conduta).
- **Vai para:** 9.4 (como a equipe opera) e 9.5 (como decidir, reunir e resolver conflitos) (p. 340 e 347, PDF 376 e 383); A7 (reuniões internas e canais); B9 (questões da equipe). Atualizado em 9.4.
- Não confundir com o TAP (termo de abertura do projeto) nem com o B18.

## Modelo de redação
```
1. Valores: [sugeridos a partir da política da FGV — validar com a equipe].
2. Comunicação interna: canais por tipo de mensagem; prazo de resposta [a definir pelo GP]; o que vai por escrito.
3. Decisões: a equipe decide [...]; sobe ao GP [...]; sobe ao contratante [...], com alternativas.
4. Conflitos: entre os envolvidos → com o GP → procedimento formal.
5. Reuniões: pauta prévia, decisor, horário, ata com ação | responsável | prazo.
6. Acordos: horários, registro das decisões, ferramentas, sigilo dos dados.
7. Equipe mista ou de campo: [rotina de contato, encontro presencial].
8. Revisão: [a cada fase ou quando entra gente nova]. Quem é quem: ver B18.
```

## Fontes
- PMBOK 6: 9.1.3.2, p. 319–320 (PDF 355–356); 9.3, p. 333–334 (PDF 369–370); 9.4, p. 340 (PDF 376); 9.5, p. 347–348 (PDF 383–384); 10.2, p. 386 (PDF 422).
- PMBOK 7: 2.2, p. 19 e 27–29 (PDF 114 e 122–124); 3.2, p. 133 (PDF 228); 3.3, p. 135 (PDF 230).
- Rework: RW-109 e RW-110 (links nos itens).
- `checklist.md` 11; `experiencia.md` §5; decisão 0011.
