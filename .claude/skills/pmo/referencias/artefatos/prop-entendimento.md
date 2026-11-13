---
codigo: PROP-ENTENDIMENTO
nome: Entendimento do contexto, do problema e dos objetivos
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["entendimento do objeto", "compreensão do problema", "contextualização", "diagnóstico preliminar", "objetivos", "justificativa"]
versao: 0.1.0
---

# PROP-ENTENDIMENTO — Entendimento do contexto, do problema e dos objetivos

## Para que serve
Mostra ao avaliador que a FGV entendeu o problema do contratante, suas causas e o resultado esperado, com as palavras do próprio TR, antes de falar de método (Rework RW-071, "desafio e contexto"). Fixa também a **leitura do escopo** que a proposta adota: uma diferença grande entre a proposta e a estimativa do comprador costuma indicar escopo lido de outro jeito (PMBOK 6, 12.1, p. 479, PDF 515). Os objetivos daqui alimentam o TAP2.

## Conteúdo mínimo
- **PROP-ENTENDIMENTO.1** Contexto da política ou do programa, tirado do TR e do edital, com página
  - fonte: `licitacoes.md` 2.1 (TR, art. 6º, XXIII: fundamentação); Rework RW-071
  - sinais: "contexto" | "antecedentes" | "cenário" | "política" | "programa" | página da RFP
  - confere: código
  - dispensa: nunca
- **PROP-ENTENDIMENTO.2** Problema ou necessidade do contratante descrito com as causas e o impacto, sem copiar o TR em bloco
  - fonte: Rework RW-071 (usar as palavras do cliente, mostrar causas e impacto); PMBOK 6, 4.1.3.1, p. 81 (PDF 117)
  - sinais: "problema" | "necessidade" | "desafio" | "causas" | "impacto"
  - confere: só PMO
  - dispensa: nunca
- **PROP-ENTENDIMENTO.3** Fato tirado do documento vem com página e trecho; o que vem da experiência aparece como leitura da FGV, não como fato sobre o contratante
  - fonte: SKILL.md, princípios 1, 3 e 5; `experiencia.md`, introdução
  - sinais: citação com página | "entende-se que" | "a experiência indica"
  - confere: só PMO
  - dispensa: nunca
- **PROP-ENTENDIMENTO.4** Objeto e leitura do escopo adotada, inclusive a leitura escolhida para cada trecho ambíguo
  - fonte: PMBOK 6, 12.1, p. 479 (PDF 515) e 12.2, p. 485 (PDF 521); `checklist.md` 1
  - sinais: "objeto" | "entende-se como escopo" | "leitura adotada" | "interpretação"
  - confere: código
  - dispensa: nunca
- **PROP-ENTENDIMENTO.5** Objetivo geral e objetivos específicos, ligados aos números R
  - fonte: PMBOK 6, 1.2.6.4, p. 34 (PDF 70); SKILL.md, princípio 9
  - sinais: "objetivo geral" | "objetivos específicos" | "R01" | lista de objetivos
  - confere: código
  - dispensa: nunca
- **PROP-ENTENDIMENTO.6** Objetivos verificáveis; métrica que o TR não traz aparece como sugestão
  - fonte: PMBOK 6, 1.2.6.4, p. 35 (PDF 71); Rework RW-075 (meta mensurável); SKILL.md, etapa 3
  - sinais: indicador, quantidade ou condição observável junto do objetivo | "sugestão"
  - confere: só PMO
  - dispensa: nunca
- **PROP-ENTENDIMENTO.7** Partes interessadas e público afetado (órgão, áreas técnicas, parceiros, beneficiários), com a instância que decide, se o documento disser
  - fonte: Rework RW-071 (mapa de decisores e preocupações); `checklist.md` 7 e 12; `experiencia.md` §1
  - sinais: "partes interessadas" | "beneficiários" | "gestor" | "fiscal" | "secretaria" | "público-alvo"
  - confere: código
  - dispensa: nunca
- **PROP-ENTENDIMENTO.8** Limitações declaradas do contratante e condições que o método supõe (dados, rede de serviços, apoio local) aparecem como pontos de atenção, com página
  - fonte: `checklist.md` 2 (CTR1) e 8; `experiencia.md` §1 e §3
  - sinais: "não dispõe" | "corpo técnico" | "com o apoio de" | "mediante disponibilização" | "ponto de atenção"
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O avaliador reconhece o problema dele no texto, ou lê um resumo do TR? (Rework RW-071)
- O entendimento cita o que o TR pede de mais específico (território, público, prazo legal), e não só o tema geral? (Rework RW-071, customização real)
- Os objetivos prometem resultado que depende de terceiros (adesão, decisão política) sem dizer que depende? (checklist 8 e 12)
- Algum trecho afirma "não há" algo que o documento só não declara? (SKILL.md, princípio 4)
- Em chamamento com OSC, o texto traz a descrição da realidade com nexo às metas e os parâmetros para aferi-las? (`licitacoes.md` 4, Lei 13.019, art. 22)
- A leitura adotada para trechos ambíguos foi também mandada como pergunta de esclarecimento? (checklist 1; PROP-ESTRATEGIA.8)

## Erros comuns
- Copiar o TR em vez de mostrar entendimento (Rework RW-071, erros comuns).
- Falar da FGV e do método antes do problema do contratante (Rework RW-071).
- Diagnóstico com números sem fonte (SKILL.md, princípio 2; checklist 2, CP9).
- Objetivo vago ("aprimorar a gestão") sem critério observável (PMBOK 6, p. 35; Rework RW-075).
- Juízo sobre o contratante ou sobre pessoas, em vez de condição verificável (SKILL.md, princípio 5).

## Quando dispensar a parte inteira
Não se dispensa: é o que mostra que a proposta responde a este edital. Em porte pequeno, cabe em uma página com contexto, problema, objetivos e a leitura do escopo.
Linha para a tela: "Entendimento em uma página: porte pequeno."

## Ligações
- **Vem de:** RFP e TR (objeto, fundamentação, público); etapa 1 (requisitos R, brechas, trechos ambíguos); PROP-ESTRATEGIA.
- **Vai para:** PROP-METODOLOGIA (o método responde a este problema); PROP-SOW (objeto e premissas); TAP1, TAP2 e TAP8 na etapa 3; B31.

## Modelo de redação
```
1. Contexto: [síntese com as palavras do TR] (doc, p., trecho).
2. Problema e causas: [o que o documento diz]; pontos de atenção: [limitação declarada, dependência], (doc, p.).
3. Objeto e leitura do escopo: [objeto]; trechos ambíguos e a leitura adotada:
   | Trecho (doc, p.) | Leitura adotada | Pergunta de esclarecimento enviada? |
4. Objetivos: | Objetivo | Indicador ou condição verificável | R | Origem (TR ou sugestão) |
5. Partes interessadas: | Parte | Papel | Quem decide | Fonte |
```

## Fontes
- PMBOK 6: 1.2.6.4, p. 34–35 (PDF 70–71); 4.1.3.1, p. 81 (PDF 117); 12.1, p. 479 (PDF 515); 12.2, p. 485 (PDF 521).
- Rework: RW-071 (https://resources.rework.com/libraries/deal-closing/proposal-development); RW-075 (https://resources.rework.com/libraries/deal-closing/sow-creation).
- `licitacoes.md` 2.1 e 4; `checklist.md` 1, 2, 7, 8, 12; `experiencia.md` §1 e §3; SKILL.md, princípios 1 a 5 e 9.
