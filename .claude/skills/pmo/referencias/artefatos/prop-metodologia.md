---
codigo: PROP-METODOLOGIA
nome: Abordagem e metodologia
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["metodologia", "abordagem metodológica", "plano de trabalho", "estratégia de execução", "método", "procedimentos técnicos"]
versao: 0.1.0
---

# PROP-METODOLOGIA — Abordagem e metodologia

## Para que serve
Descreve **como** a FGV vai executar a abordagem que o GP escolheu (PROP-ESTRATEGIA): fases, métodos, técnicas, participação do contratante e controle da qualidade. É a "ponte" entre a situação atual e a desejada, organizada pelos requisitos do contratante (Rework RW-071). A adequação da abordagem e do plano de trabalho ao TR é critério típico de seleção (PMBOK 6, 12.1, p. 478–479, PDF 514–515).

## Conteúdo mínimo
- **PROP-METODOLOGIA.1** Parte da abordagem escolhida pelo GP e diz qual é
  - fonte: SKILL.md, etapa 2, passo 2; especificação da etapa 2 (decisões do GP)
  - sinais: "abordagem" | nome da abordagem escolhida em PROP-ESTRATEGIA
  - confere: código
  - dispensa: nunca
- **PROP-METODOLOGIA.2** Fases ou etapas do trabalho, cada uma com o produto que gera e o critério de conclusão
  - fonte: PMBOK 6, 1.2.4.1, p. 18–19 (PDF 54–55); Rework RW-075 (fases com critério de conclusão)
  - sinais: "fase" | "etapa" | "produto" | "conclusão" | tabela fase × produto
  - confere: código
  - dispensa: nunca
- **PROP-METODOLOGIA.3** Métodos e técnicas nomeados para cada fase (levantamento, análise, campo, oficinas, validação), com a justificativa pelo objeto
  - fonte: `checklist.md` 2 (CP9: método adequado ao objeto); Rework RW-075 (consultoria: metodologia e entregas)
  - sinais: "entrevistas" | "oficinas" | "análise documental" | "pesquisa" | "grupo focal" | "porque" | "justifica-se"
  - confere: código
  - dispensa: nunca
- **PROP-METODOLOGIA.4** Cada requisito técnico do TR é tratado por um passo do método, com o número R
  - fonte: Rework RW-071 (organizar pelos requisitos do cliente); PMBOK 6, 12.2, p. 487 (PDF 523); SKILL.md, princípio 9
  - sinais: "R01" | "R02" | número R junto da descrição do passo
  - confere: código
  - dispensa: nunca
- **PROP-METODOLOGIA.5** Método realista para o preço e o prazo: não promete técnica, alcance ou intensidade de campo que a EAP e o preço não cobrem
  - fonte: Rework RW-071 (não prometer o que não se entrega); PMBOK 6, 4.1.3.1, p. 81 (PDF 117)
  - sinais: quantidades do método iguais às de PROP-SOW e PROP-EAP
  - confere: só PMO
  - dispensa: nunca
- **PROP-METODOLOGIA.6** Participação do contratante e de terceiros no método (validações, dados, mobilização), remetendo às obrigações do PROP-SOW
  - fonte: Rework RW-075 (exigências de colaboração do cliente); PMBOK 6, 12.1, TR, p. 478 (PDF 514); `checklist.md` 3 e 8
  - sinais: "validação com o contratante" | "dados fornecidos" | "mobilização" | "ver obrigações do contratante"
  - confere: código
  - dispensa: nunca
- **PROP-METODOLOGIA.7** Trabalho de campo: territórios, logística, deslocamento, segurança e plano para clima e acesso
  - fonte: `checklist.md` 11 (TC18 a TC22); `experiencia.md` §5
  - sinais: "campo" | "território" | "deslocamento" | "logística" | "segurança" | "municípios"
  - confere: código
  - dispensa: sem campo
- **PROP-METODOLOGIA.8** Mobilização e adesão de beneficiários: quem mobiliza, com que meios, e o tratamento do cadastro
  - fonte: `checklist.md` 12 (TB23, TB24); `experiencia.md` §6
  - sinais: "mobilização" | "adesão" | "divulgação" | "cadastro" | "beneficiários"
  - confere: código
  - dispensa: sem beneficiários
- **PROP-METODOLOGIA.9** Tratamento de dados pessoais e sigilo (quem acessa, anonimização), e separação de equipes quando houver avaliação
  - fonte: `checklist.md` 10 (CP14); PMBOK 6, 12.1, p. 470 (PDF 506) (requisitos contratuais)
  - sinais: "LGPD" | "dados pessoais" | "anonimização" | "confidencialidade" | "independência"
  - confere: código
  - dispensa: sem dados pessoais
- **PROP-METODOLOGIA.10** Controle da qualidade dos produtos (revisão interna antes da entrega) e transferência de conhecimento, se o TR pedir
  - fonte: PMBOK 6, 12.1, p. 478–479 (PDF 514–515) (critério 10, transferência de conhecimento); Rework RW-036 (pronto × aceito)
  - sinais: "revisão interna" | "controle de qualidade" | "capacitação" | "transferência de conhecimento" | "repasse"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- A metodologia responde ao critério de pontuação que a avalia, item a item? (`licitacoes.md` 2.2)
- O método foi escolhido pelo objeto ou por hábito? A justificativa diz por quê? (checklist 2, CP9)
- Toda atividade de que o método depende (divulgação, cessão de espaço, lista de beneficiários) tem responsável? Se não é da FGV, está no PROP-SOW? (checklist 3, CTR3)
- O fluxo entre fases mostra os pontos de validação do contratante? (checklist 4 e 7)
- Há texto de método reaproveitado de outra proposta, com outro público ou outro órgão? (checklist 2, CP8)

## Erros comuns
- Catálogo de técnicas sem ligação com os requisitos (Rework RW-071).
- Método que pressupõe adesão voluntária sem mobilização e sem responsável (checklist 12; `experiencia.md` §6).
- Campo sem tempo de deslocamento nem logística (`experiencia.md` §5).
- Prometer intensidade de campo ou número de oficinas que o preço não paga (Rework RW-071, erros comuns).
- Mesma equipe que orienta e depois avalia os mesmos participantes (checklist 10).

## Quando dispensar a parte inteira
Não se dispensa: a metodologia é o que a técnica pontua. Em porte pequeno, pode fundir-se com o PROP-SOW numa tabela por produto (como se faz, com que método, com que participação do contratante).
Linha para a tela: "Metodologia junto com os produtos: porte pequeno."

## Ligações
- **Vem de:** PROP-ESTRATEGIA (abordagem escolhida); PROP-ENTENDIMENTO (problema e objetivos); TR (requisitos técnicos).
- **Vai para:** PROP-SOW (produtos e obrigações); PROP-EAP (fases viram ramos e pacotes); PROP-EQUIPE (perfis por técnica); PROP-PRECO (despesas de campo); A5, A17 e A13 na etapa 4.

## Modelo de redação
```
1. Abordagem: [escolhida pelo GP]; sugere-se apresentá-la como [ponte entre situação atual e desejada].
2. Fases: | Fase | Objetivo | Métodos e técnicas | Participação do contratante | Produto | Conclusão | R |
3. Campo (se houver): territórios [doc, p.]; logística e segurança; quantidades em PROP-SOW.
4. Beneficiários (se houver): quem mobiliza [FGV ou contratante, a confirmar]; cadastro [origem, data].
5. Dados e sigilo: [tratamento proporcional]; separação de equipes, se houver avaliação.
6. Qualidade: revisão interna antes da entrega; aceite pelo contratante (ver PROP-SOW).
```

## Fontes
- PMBOK 6: 1.2.4.1, p. 18–19 (PDF 54–55); 4.1.3.1, p. 81 (PDF 117); 12.1, p. 470, 478–479 (PDF 506, 514–515); 12.2, p. 487 (PDF 523).
- Rework: RW-036 (https://resources.rework.com/libraries/project-management/project-deliverables); RW-071 (https://resources.rework.com/libraries/deal-closing/proposal-development); RW-075 (https://resources.rework.com/libraries/deal-closing/sow-creation).
- `licitacoes.md` 2.2; `checklist.md` 2, 3, 4, 7, 8, 10, 11, 12; `experiencia.md` §5 e §6; SKILL.md, etapa 2 e princípio 9.
