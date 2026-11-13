---
codigo: B31
nome: Registro das partes interessadas
tipo: documento do projeto
etapas: [3, 4, 5]
gravidade: baixa
categoria: partes interessadas
sinonimos: ["registro de partes interessadas", "registro de stakeholders", "mapa de stakeholders", "mapeamento das partes interessadas", "matriz de partes interessadas", "matriz poder x interesse", "lista de partes interessadas"]
versao: 0.1.0
---

# B31 — Registro das partes interessadas

## Para que serve
"Um documento do projeto que inclui a identificação, avaliação e a classificação das partes interessadas do projeto" (PMBOK 6, glossário, p. 721, PDF 757). É a principal saída de 13.1 (p. 514, PDF 550), feita pela primeira vez antes ou junto com o TAP e refeita a cada fase (p. 507–508, PDF 543–544). Alimenta o engajamento (A10), as comunicações (A7) e a identificação dos riscos.

## Conteúdo mínimo
- **B31.1** Identificação de cada parte: nome (pessoa ou grupo), cargo, organização e papel no projeto
  - fonte: PMBOK 6, 13.1.3.1, p. 514 (PDF 550); Rework RW-006 (https://resources.rework.com/libraries/project-management/stakeholder-analysis-matrix)
  - sinais: "nome" | "cargo" | "organização" | "órgão" | "papel no projeto" | tabela com uma linha por parte
  - confere: código
  - dispensa: nunca
- **B31.2** Quem decide do lado do contratante: patrocinador e instância de decisão (no setor público, também gestor e fiscal do contrato)
  - fonte: PMBOK 6, 13.1, p. 509 (PDF 545); `checklist.md` 7 (CE16); `experiencia.md` §1
  - sinais: "patrocinador" | "gestor do contrato" | "fiscal do contrato" | "ponto focal" | "comitê" | "instância de decisão"
  - confere: código
  - dispensa: nunca
- **B31.3** Partes externas além do contratante e da equipe (reguladores, órgãos de governo, fornecedores, público afetado, beneficiários)
  - fonte: PMBOK 6, cap. 13, p. 505 (PDF 541) e Padrão, p. 550 (PDF 586); PMBOK 7, 2.1, p. 9 (PDF 104)
  - sinais: "regulador" | "órgão de controle" | "prefeitura" | "secretaria" | "fornecedor" | "beneficiários" | "sociedade civil"
  - confere: só PMO
  - dispensa: nunca
- **B31.4** Requisitos e expectativas principais de cada parte
  - fonte: PMBOK 6, 13.1.3.1, p. 514 (PDF 550)
  - sinais: "expectativas" | "requisitos" | "interesses" | "necessidades"
  - confere: código
  - dispensa: nunca
- **B31.5** Classificação: interna ou externa e poder, interesse, influência ou impacto (ou outro modelo escolhido)
  - fonte: PMBOK 6, 13.1.3.1, p. 514 (PDF 550); modelos, p. 512–513 (PDF 548–549); Rework RW-006 (https://resources.rework.com/libraries/project-management/stakeholder-analysis-matrix)
  - sinais: "interna" | "externa" | "poder" | "interesse" | "influência" | "saliência" | grade poder x interesse
  - confere: código
  - dispensa: nunca
- **B31.6** Atitude atual de cada parte: apoia, neutra ou resistente
  - fonte: PMBOK 6, 13.1, p. 512 (PDF 548); níveis em 13.2, p. 521 (PDF 557)
  - sinais: "apoio" | "apoiador" | "neutro" | "resistente" | "atitude"
  - confere: código
  - dispensa: porte pequeno
- **B31.7** Fase do ciclo de vida em que a parte tem mais influência
  - fonte: PMBOK 6, 13.1.3.1, p. 514 (PDF 550)
  - sinais: "fase de maior influência" | fase ou etapa indicada ao lado de cada parte
  - confere: código
  - dispensa: uma fase
- **B31.8** Data ou gatilho de revisão do registro (a cada fase, entrada ou saída de partes, mudança relevante)
  - fonte: PMBOK 6, cap. 13, p. 505 (PDF 541) e 13.1, p. 508 (PDF 544)
  - sinais: "atualizado em" | "versão" | "revisão" | "a cada fase" | "próxima revisão"
  - confere: código
  - dispensa: porte pequeno
- **B31.9** Partes ligadas a riscos do registro (B27)
  - fonte: PMBOK 6, 13.2, p. 519 (PDF 555); PMBOK 7, 2.1, Tab. 2-2, p. 15 (PDF 110)
  - sinais: "risco" | "R01" | "ver registro dos riscos" | coluna de riscos associados
  - confere: só PMO
  - dispensa: porte pequeno

## Perguntas de qualidade
- A lista vai além de cliente e patrocinador e inclui quem pode se opor? (PMBOK 6, p. 505, PDF 541; Rework RW-006)
- Estão nomeadas pessoas, e não só departamentos? O que o documento não traz fica "a definir pelo GP" (Rework RW-006; SKILL.md, princípio 2).
- A classificação segue o comportamento real, não só o cargo? (Rework RW-006)
- Poder, interesse e atitude atribuídos sem base são premissas e vão para o B3 (PMBOK 6, p. 515, PDF 551; checklist 2).
- Se houver campo: estruturas locais que já atuam no objeto estão listadas? (checklist 11, TC20)
- Se houver beneficiários: estão no registro, com quem os representa? (checklist 12)
- Órgãos de controle e procuradoria aparecem? (Rework RW-006, observação do leitor)

## Erros comuns
- Registro feito uma vez e nunca revisto (PMBOK 6, p. 508, PDF 544; Rework RW-006).
- Limitar a identificação a um conjunto restrito de partes (PMBOK 6, p. 505, PDF 541).
- Ignorar influenciadores informais; tratar a RACI como substituta: a RACI diz quem faz, o registro diz quem gerenciar (Rework RW-006).
- Avaliação sensível (atitude, resistência) em versão entregue ao contratante; ela deve ficar na equipe (PMBOK 7, p. 12, PDF 107).

## Quando dispensar a parte inteira
Nunca: o PMBOK não prevê dispensa do registro. Em porte pequeno, basta uma tabela simples com matriz poder x interesse (PMBOK 6, p. 512, PDF 548), que pode levar a coluna de ação do A10.
Linha para a tela: "Registro simples com matriz poder x interesse: porte pequeno (PMBOK 6, p. 512)."

## Ligações
- **Vem de:** 13.1, com TAP (partes interessadas-chave, TAP8; p. 509, PDF 545), acordos (as partes do contrato; p. 510, PDF 546), documentos de negócios, RFP e proposta. A versão inicial nasce na etapa 3, com o TAP.
- **Vai para:** A10 (13.2); A7 (10.1); A8 (11.1, atitudes diante do risco); B27 (11.2 e 11.3, possíveis responsáveis); A9 (12.1); 5.2; 8.1; 9.1. Atualizado em 12.2 e 12.3 (fornecedores; p. 496, PDF 532), 13.3 e 13.4. Premissas sobre poder e interesse vão para o B3.

## Modelo de redação
```
| Parte | Organização e cargo | Papel no projeto | Interna/externa | Expectativas | Poder | Interesse | Atitude | Fase de maior influência | Riscos (B27) |
```
- Primeiras linhas só com partes citadas na RFP, na proposta e no TAP, com a página; nome não informado: "a definir pelo GP".
- Atitude e análise em versão interna; data da versão e próxima revisão no cabeçalho.

## Fontes
- PMBOK 6: cap. 13, p. 505 (PDF 541); 13.1, p. 507–515 (PDF 543–551); 13.2, p. 519–521 (PDF 555–557); 12.3, p. 496 (PDF 532); Padrão, p. 550 (PDF 586); glossário, p. 721 (PDF 757).
- PMBOK 7: 2.1 Partes interessadas, p. 8–15 (PDF 103–110); registro das partes interessadas, p. 185 (PDF 280).
- Rework: RW-006 (link nos itens).
- `checklist.md` (2, 7, 11, 12); `experiencia.md` §1; SKILL.md, princípio 2.
