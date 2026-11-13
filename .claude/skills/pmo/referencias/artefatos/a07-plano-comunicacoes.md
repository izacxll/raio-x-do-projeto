---
codigo: A7
nome: Plano de gerenciamento das comunicações
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: partes interessadas
sinonimos: ["plano de comunicação", "plano de comunicações", "plano de gerenciamento de comunicações", "plano de gestão das comunicações", "matriz de comunicação", "gestão da comunicação", "plano de reuniões", "governança e comunicação"]
versao: 0.2.0
---

# A7 — Plano de gerenciamento das comunicações

## Para que serve
Descreve "como, quando e por quem as informações sobre o projeto são administradas e disseminadas" (PMBOK 6, glossário, p. 719, PDF 755). O PMBOK diz o que ele **contém**, numa lista fechada de 14 itens (10.1.3.1, p. 377, PDF 413), cobertos por A7.1 a A7.12. Falha típica na FGV: plano só com o cliente, sem as reuniões internas (`experiencia.md` §8).

## Conteúdo mínimo
- **A7.1** Público e requisitos de comunicação de cada parte interessada ou grupo (necessidades e expectativas) — itens 1 e 8 do PMBOK
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413)
  - sinais: "público" | "parte interessada" | "destinatário" | "para quem" | coluna de público
  - confere: código
  - dispensa: nunca
- **A7.2** Informação a comunicar e motivo, com formato, idioma, nível de detalhe e glossário dos termos — itens 2, 4 e 12
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413); PMBOK 7, 2.4.4, p. 64 (PDF 159)
  - sinais: "conteúdo" | "o quê" | "por quê" | "objetivo" | "formato" | "glossário"
  - confere: código
  - dispensa: nunca
- **A7.3** Frequência e prazo de cada comunicação, e da confirmação ou resposta quando houver — item 5
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413)
  - sinais: "semanal" | "quinzenal" | "mensal" | "por marco" | "a cada entrega" | "prazo de resposta"
  - confere: código
  - dispensa: nunca
- **A7.4** Responsável por emitir cada comunicação — item 6
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413); Rework RW-021 (https://resources.rework.com/libraries/project-management/communication-plan)
  - sinais: "responsável" | "emissor" | "quem comunica" | coluna de responsável preenchida em toda linha
  - confere: código
  - dispensa: nunca
- **A7.5** Quem autoriza liberar informação confidencial, e as restrições legais e contratuais — itens 7 e 14
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413); 10.1.2.3, p. 371 (PDF 407)
  - sinais: "confidencial" | "sigilo" | "autoriza a divulgação" | "LGPD" | "restrições"
  - confere: código
  - dispensa: nunca
- **A7.6** Canais e tecnologias, separando o canal formal com o contratante (ofício, protocolo) do técnico — item 9
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413); 10.1.2.5, p. 374 (PDF 410); Rework RW-021 e RW-110 (adaptação do leitor)
  - sinais: "canal" | "meio" | "ofício" | "e-mail" | "reunião" | "painel" | "repositório"
  - confere: código
  - dispensa: nunca
- **A7.7** Escalonamento: o que sobe, a quem e em que prazo, fora da cadência normal — item 3
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413); Rework RW-021
  - sinais: "escalonamento" | "escalação" | "urgente" | "nível 1" | "nível 2"
  - confere: código
  - dispensa: nunca
- **A7.8** Reuniões com o cliente, com cadência e responsável: abertura, comitê ou acompanhamento, apresentação de produtos — item 13
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413); `checklist.md` CP12 e PC3 (CE16); `experiencia.md` §8; Rework RW-020 (https://resources.rework.com/libraries/project-management/project-kickoff-meeting)
  - sinais: "reunião de abertura" | "reunião de partida" | "comitê" | "reunião de acompanhamento" | "apresentação do produto"
  - confere: código
  - dispensa: nunca
- **A7.9** Reuniões internas da equipe, com cadência e responsável, incluindo a integração das frentes
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413) (item 13; reuniões da equipe); `checklist.md` PC7 e CP12; `experiencia.md` §8; Rework RW-070 (https://resources.rework.com/libraries/project-management/agile-ceremonies)
  - sinais: "reunião interna" | "reunião da equipe" | "alinhamento" | "integração das frentes"
  - confere: código
  - dispensa: nunca
- **A7.10** Lista dos relatórios e fluxo de autorização do que vai ao contratante — item 13
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413); 10.2.1.3, p. 382 (PDF 418)
  - sinais: "relatório de andamento" | "relatório mensal" | "fluxo de aprovação" | diagrama de fluxo
  - confere: código
  - dispensa: nunca
- **A7.11** Tempo e orçamento reservados às comunicações — item 10
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413)
  - sinais: "recursos para comunicação" | "orçamento" | "horas de reunião" | "eventos"
  - confere: código
  - dispensa: porte pequeno
- **A7.12** Como e quando o plano é atualizado: a cada fase ou quando mudam as partes interessadas — item 11
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413); 10.1, p. 367 (PDF 403)
  - sinais: "revisão do plano" | "a cada fase" | "atualização" | "versão"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- Quem decide no cliente aparece, com o rito e os prazos internos dele? (PC3, CE16)
- Há reunião de abertura com o contratante e reunião interna antes dela? (Rework RW-020; A7.8 e A7.9, CP12)
- As comunicações formais do contrato (entrega protocolada, relatórios, ofícios) estão no plano? (Rework RW-021, adaptação do leitor; `licitacoes.md` 2.6)
- Com campo: como a coordenação fala com a ponta, e com quantos intermediários?
- Onde as informações ficam guardadas e como são recuperadas? (PMBOK 6, p. 367, PDF 403)
- Cada reunião tem objetivo, pauta, decisor e ata com ações? (Rework RW-109; B32.5)

## Erros comuns
- Plano só com o cliente, sem reuniões internas; ou sem abertura, comitê e rito de decisão (`experiencia.md` §8).
- Linha sem responsável, ou um canal único para tudo (Rework RW-021).
- Aprovações do contratante só em aplicativo de mensagens (Rework RW-110, adaptação do leitor).
- Plano feito uma vez e nunca revisto (PMBOK 6, p. 367, PDF 403).

## Quando dispensar a parte inteira
Não se dispensa. Em porte pequeno, pode ser uma tabela única com as reuniões e o escalonamento; o PMBOK 7 dá a comunicação como exemplo de rigor que muda com o tamanho da equipe (3.2, p. 133, PDF 228).
Linha para a tela: "Comunicações numa tabela única com reuniões e escalonamento: porte pequeno (PMBOK 7, p. 133)."

## Ligações
- **Vem de:** 10.1, com TAP (TAP8), A6, A10, B22 e B31 (p. 368–369, PDF 404–405); B18; B32; governança da proposta.
- **Vai para:** B14 (10.2); 10.3; A10; B15 (atividades de comunicação, p. 378, PDF 414); B31; B9 e B27 (questões e riscos de comunicação).
- Requisitos da RFP sobre reuniões, relatórios e reunião de partida caem aqui (número R).

## Modelo de redação
```
1. Matriz: | Público | Informação e motivo | Canal | Frequência | Responsável | Formato | Confirmação |
2. Reuniões com o contratante e internas: | Reunião | Objetivo | Participantes | Cadência | Responsável |
   (abertura, comitê, apresentação de produto; alinhamento da equipe — cadência: doc, p., ou a definir pelo GP)
3. Escalonamento: | Situação | A quem | Prazo |
4. Confidencialidade: quem autoriza [decisão do GP]; restrições [contrato, doc, p.; LGPD].
5. Relatórios e fluxo de autorização: elaboração → revisão → liberação.
6. Canal formal × técnico; guarda e recuperação das informações.
7. Recursos para comunicação: [a definir pelo GP]. Glossário. Revisão a cada fase.
```

## Fontes
- PMBOK 6: 10.1, p. 366–378 (PDF 402–414); 10.2, p. 382 (PDF 418); glossário, p. 719 (PDF 755).
- PMBOK 7: 2.4.4, p. 64 (PDF 159); 3.2, p. 133 (PDF 228).
- Rework: RW-020, RW-021, RW-070 (links nos itens); RW-109 (https://resources.rework.com/libraries/productivity/pointless-meetings); RW-110 (https://resources.rework.com/libraries/productivity/async-communication-best-practices).
- `checklist.md` (PC3, PC7, CP12); `experiencia.md` §8; `licitacoes.md` 2.6; decisão 0008.
