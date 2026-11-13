---
codigo: PROP-ESTRATEGIA
nome: Estratégia da proposta e abordagens técnicas
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["estratégia da proposta", "abordagem técnica", "alternativas de abordagem", "critérios de julgamento", "como seremos avaliados"]
versao: 0.1.0
---

# PROP-ESTRATEGIA — Estratégia da proposta e abordagens técnicas

## Para que serve
Documento interno de decisão, que não vai ao contratante. Lê o edital do lado de quem avalia: método de seleção, critérios, pesos e onde estão os pontos (PMBOK 6, 12.1, p. 473–474 e 478–479, PDF 509–510 e 514–515). Depois oferece ao GP 2 ou 3 abordagens técnicas comparáveis. **O GP escolhe uma** (`decisao_gp`), e o resto da proposta parte dela. Também dá destino a cada brecha da etapa 1 e a cada pergunta do checklist que se aplica.

## Conteúdo mínimo
- **PROP-ESTRATEGIA.1** Critério de julgamento do edital (menor preço, técnica e preço, melhor técnica etc.), com página e trecho
  - fonte: PMBOK 6, 12.1, p. 473–474 (PDF 509–510); `licitacoes.md` 2.2
  - sinais: "critério de julgamento" | "técnica e preço" | "melhor técnica" | "menor preço" | página da RFP
  - confere: código
  - dispensa: nunca
- **PROP-ESTRATEGIA.2** Critérios de pontuação técnica, com pontos máximos e pesos de técnica e preço, como o edital os traz; ou a nota de que o edital não pontua técnica
  - fonte: PMBOK 6, 12.1, p. 478–479 (PDF 514–515); `licitacoes.md` 2.2 (técnica até 70%)
  - sinais: "pontuação técnica" | "pontos" | "peso" | "nota técnica" | "não pontua" | tabela critério × pontuação máxima
  - confere: código
  - dispensa: nunca
- **PROP-ESTRATEGIA.3** Onde estão os pontos: critérios de maior peso e o que a proposta precisa mostrar para pontuar em cada um (atestado, profissional, plano de trabalho)
  - fonte: PMBOK 6, "lado do vendedor", p. 479 (PDF 515); `licitacoes.md` 2.2 (arts. 36, § 3º, 37 e 38); Rework RW-071
  - sinais: "maior peso" | "atestado" | "experiência" | "equipe-chave" | critério ligado a evidência
  - confere: só PMO
  - dispensa: nunca
- **PROP-ESTRATEGIA.4** De 2 a 3 abordagens técnicas, cada uma descrita em poucas linhas
  - fonte: PMBOK 6, 5.3, análise de alternativas, p. 150–155 (PDF 186–191); SKILL.md, princípio 1 e etapa 2
  - sinais: "abordagem A" | "abordagem B" | "alternativa 1" | "alternativa 2"
  - confere: código
  - dispensa: nunca
- **PROP-ESTRATEGIA.5** Para cada abordagem: prós, contras, requisitos atendidos (números R), riscos e impacto em prazo e custo
  - fonte: SKILL.md, etapa 2, passo 2; PMBOK 6, 5.3, análise de decisão com critérios múltiplos, p. 150–155 (PDF 186–191)
  - sinais: "prós" | "contras" | "R01" | "riscos" | "impacto em prazo" | "impacto em custo" | tabela abordagem × colunas
  - confere: código
  - dispensa: nunca
- **PROP-ESTRATEGIA.6** Comparação sem números inventados: impacto em prazo e custo em termos relativos ou em expressões para o código calcular
  - fonte: SKILL.md, princípios 2 e 6
  - sinais: "maior" | "menor" | "a calcular" | "a definir pelo GP"; valor em R$ sem fonte indica número inventado
  - confere: só PMO
  - dispensa: nunca
- **PROP-ESTRATEGIA.7** Escolha da abordagem marcada como Decisão do GP, com campo pendente
  - fonte: SKILL.md, princípio 1; especificação da etapa 2 (decisões do GP)
  - sinais: "decisão do GP" | "abordagem escolhida" | "a definir pelo GP"
  - confere: código
  - dispensa: nunca
- **PROP-ESTRATEGIA.8** Cada brecha da etapa 1 e cada pergunta do checklist aplicável com um destino: premissa ou exclusão, folga, reserva ou pergunta de esclarecimento
  - fonte: SKILL.md, etapa 2, passo 8; `checklist.md` (introdução); PMBOK 6, 11.5, p. 442–443 (PDF 478–479)
  - sinais: "brecha" | "checklist" | "premissa" | "exclusão" | "folga" | "reserva" | "pergunta de esclarecimento" | tabela origem × destino
  - confere: código
  - dispensa: nunca
- **PROP-ESTRATEGIA.9** O destino é coerente com a natureza do problema: ambiguidade vira pergunta; obrigação do contratante vira premissa com prazo; incerteza aceita vira folga ou reserva
  - fonte: PMBOK 6, 11.5, p. 439 e 442–443 (PDF 475 e 478–479); `checklist.md` 1, 3, 4 e 8; SKILL.md, princípio 8
  - sinais: destino ao lado de cada origem, com página da RFP
  - confere: só PMO
  - dispensa: nunca
- **PROP-ESTRATEGIA.10** Perguntas de esclarecimento com a data-limite do documento, e a escolha de quais mandar como Decisão do GP
  - fonte: PMBOK 6, 12.2, reuniões com licitantes, p. 487 (PDF 523); `licitacoes.md` 2.3 (art. 164); especificação da etapa 2
  - sinais: "esclarecimento" | "impugnação" | "até" | data | "decisão do GP"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- A estratégia mira o que o avaliador pontua, ou o que a equipe gosta de fazer? (Rework RW-071)
- As abordagens são de fato diferentes (método, alcance, intensidade de campo), e não variações da mesma? (PMBOK 6, p. 150–155)
- Alguma abordagem promete o que não cabe no preço ou no prazo do edital? (Rework RW-071, erros comuns)
- O edital é de orçamento fixo ou divulga o valor estimado? A abordagem cabe nele? (PMBOK 6, p. 474, PDF 510)
- A minuta do contrato tem cláusula que muda a decisão de participar (multa, titularidade dos produtos, prazo de pagamento)? (Rework RW-077, adaptação; checklist 3)
- Brecha que não tem destino ficou sem tratamento? (checklist, introdução)

## Erros comuns
- Uma só abordagem apresentada como a única possível (SKILL.md, princípio 1).
- Estratégia de venda entre empresas aplicada à licitação: âncora, desconto, opções de preço (Rework RW-073 e RW-074, adaptação).
- Tratar brecha como risco do projeto e mandá-la só para o registro, sem premissa nem pergunta (SKILL.md, princípio 8).
- Perder o prazo de esclarecimento e ter de assumir uma leitura como premissa (checklist 1; `licitacoes.md` 2.3).
- Dizer "o prazo é curto" em vez de mostrar a conta ao código (SKILL.md, princípio 6).

## Quando dispensar a parte inteira
Não se dispensa. Em contratação direta ou porte pequeno, pode reduzir-se a uma abordagem principal com uma alternativa e a tabela de destinos.
Linha para a tela: "Estratégia curta, com uma alternativa e a tabela de destinos: porte pequeno."

## Ligações
- **Vem de:** etapa 1 (critério de julgamento, pontuação, valor estimado, prazos, requisitos R, brechas); `checklist.md`; `licitacoes.md`.
- **Vai para:** PROP-ESTRUTURA (uma seção por critério); PROP-METODOLOGIA (abordagem escolhida); PROP-SOW (premissas e exclusões); PROP-EAP (folgas); PROP-PRECO (reserva); perguntas de esclarecimento; TAP5 e B3 na etapa 3.

## Modelo de redação
```
1. Como seremos avaliados: critério [doc, p.]; pesos técnica/preço [doc, p.]
   | Critério | Pontos máx. | O que pontua | Evidência exigida | Seção da proposta |
2. Abordagens (sugestão):
   | Abordagem | Descrição | Prós | Contras | R atendidos | Riscos | Prazo | Custo |
   Abordagem escolhida: a definir pelo GP.
3. Riscos que viram proposta:
   | Origem (brecha ou checklist n) | Doc, p., trecho | Destino | Texto sugerido |
   Destinos: premissa/exclusão (PROP-SOW), folga (PROP-EAP), reserva (PROP-PRECO),
   pergunta de esclarecimento até [data do edital]. Quais mandar: decisão do GP.
```

## Fontes
- PMBOK 6: 5.3, p. 150–155 (PDF 186–191); 11.5, p. 439 e 442–443 (PDF 475 e 478–479); 12.1, p. 468, 473–474 e 478–479 (PDF 504, 509–510 e 514–515); 12.2, p. 487 (PDF 523).
- Rework: RW-071 (https://resources.rework.com/libraries/deal-closing/proposal-development); RW-073 (https://resources.rework.com/libraries/deal-closing/pricing-strategies); RW-074 (https://resources.rework.com/libraries/deal-closing/pricing-negotiation); RW-077 (https://resources.rework.com/libraries/deal-closing/terms-negotiation).
- `licitacoes.md` 2.2 e 2.3; `checklist.md` (introdução, 1, 3, 4, 8); SKILL.md, etapa 2 e princípios 1, 2, 6 e 8.
