---
codigo: TAP
nome: Termo de abertura do projeto
tipo: termo de abertura
etapas: [3, 5]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["termo de abertura", "TAP", "project charter", "charter do projeto"]
versao: 0.2.0
---

# TAP — Termo de abertura do projeto

## Para que serve
Documento "que autoriza formalmente a existência de um projeto" e dá ao GP autoridade para aplicar recursos da organização (PMBOK 6, 4.1.3.1, p. 81, PDF 117). Não é contrato: em projeto externo, o contrato é o acordo, e o TAP firma o compromisso interno (p. 77, PDF 113). Na etapa 5, os 12 elementos são a base do "ausente" de nível (a) (decisão 0013). **Decisão do GP** em TAP.7, TAP.11 e TAP.12: o PMO só sugere redação (`decisao_gp`), nunca preenche nome, valor ou alçada como fato.

## TAP.1 — Finalidade do projeto
- **TAP1.1** Finalidade: o problema ou a necessidade do contratante que o projeto atende, em poucas frases
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); Rework RW-002 (https://resources.rework.com/libraries/project-management/project-charter)
  - sinais: "finalidade" | "justificativa" | "propósito" | "contexto" | "necessidade"
  - confere: código
  - dispensa: nunca
- **TAP1.2** Diz o resultado esperado (benefício público ou social), não só os produtos, com base no objeto da RFP
  - fonte: PMBOK 6, 4.1, p. 78 (PDF 114); PMBOK 7, Padrão, p. 34–36 (PDF 61–63); Rework RW-002, observação do leitor
  - sinais: "resultado esperado" | "benefício" | "objeto" | página da RFP
  - confere: só PMO
  - dispensa: nunca

## TAP.2 — Objetivos mensuráveis e critérios de sucesso
- **TAP2.1** Objetivos listados, cada um com um critério de sucesso (indicador e meta)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 1.2.6.4, p. 34 (PDF 70)
  - sinais: "objetivo" | "critério de sucesso" | "indicador" | "meta" | tabela objetivo x critério
  - confere: código
  - dispensa: nunca
- **TAP2.2** Objetivo verificável por terceiros; métrica que a RFP não traz vem marcada como sugestão
  - fonte: PMBOK 6, 1.2.6.4, p. 35 (PDF 71); Rework RW-002; SKILL.md, etapa 3
  - sinais: número, prazo ou condição observável junto do objetivo | "sugestão"
  - confere: só PMO
  - dispensa: nunca

## TAP.3 — Requisitos de alto nível
- **TAP3.1** Requisitos de alto nível, cada um com o número R da etapa 1
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 5.2, p. 140 (PDF 176); SKILL.md, princípio 9
  - sinais: "requisito" | "R01" | "R02" | número R junto de cada requisito
  - confere: código
  - dispensa: nunca

## TAP.4 — Descrição de alto nível, limites e entregas-chave
- **TAP4.1** Descrição de alto nível do que o projeto fará
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117)
  - sinais: "descrição do projeto" | "escopo" | "objeto" | "visão geral"
  - confere: código
  - dispensa: nunca
- **TAP4.2** Entregas-chave (produtos do contrato) listadas
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 4.1, p. 80 (PDF 116)
  - sinais: "produto" | "entrega" | "entregável" | "P1" | lista numerada de produtos
  - confere: código
  - dispensa: nunca
- **TAP4.3** Limites: o que fica fora, incluindo as exclusões da proposta
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); Rework RW-002; `checklist.md` PC8; CTR2, CTR3 (exclusão)
  - sinais: "fora do escopo" | "não inclui" | "não faz parte" | "exclusões" | "limites"
  - confere: código
  - dispensa: nunca

## TAP.5 — Risco geral do projeto
- **TAP5.1** Risco geral: as principais fontes de incerteza do projeto como um todo
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); glossário, p. 723 (PDF 759)
  - sinais: "risco geral" | "principais riscos" | "riscos" | "exposição"
  - confere: código
  - dispensa: nunca
- **TAP5.2** Resume as brechas da etapa 1 e as premissas críticas que se aplicam (PC1 a PC8), com a origem; brecha não vira risco
  - fonte: SKILL.md, etapa 3 e princípio 8; `checklist.md` (PC1 a PC8)
  - sinais: "brecha" | "premissa crítica" | página da RFP
  - confere: só PMO
  - dispensa: nunca

## TAP.6 — Resumo do cronograma de marcos
- **TAP6.1** Marcos principais, cada um com data ou prazo contado de um evento ("assinatura + 30 dias")
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 6.1, p. 180 (PDF 216); glossário, p. 705 (PDF 741)
  - sinais: "marco" | "cronograma de marcos" | "dias após" | "a partir da assinatura" | "ordem de serviço" | tabela de marcos com datas
  - confere: código
  - dispensa: nunca
- **TAP6.2** Marcos dentro dos prazos da RFP e iguais aos do cronograma da proposta (a conta é do código)
  - fonte: SKILL.md, etapa 3 e princípio 6; `checklist.md` PC4; Rework RW-025 (https://resources.rework.com/libraries/project-management/milestone-chart)
  - sinais: datas ou prazos com página da RFP e da proposta
  - confere: código
  - dispensa: nunca
- **TAP6.3** Cada marco é resultado concluído (entrega, aprovação, decisão), com o evento de referência explícito; entram os que dependem do contratante
  - fonte: PMBOK 6, glossário, p. 715 (PDF 751); Rework RW-025; `experiencia.md` §1 e §2
  - sinais: "aprovado" | "entregue" | "assinado" | "aceite"
  - confere: só PMO
  - dispensa: nunca

## TAP.7 — Recursos financeiros pré-aprovados
- **TAP7.1** Recursos financeiros pré-aprovados, preenchidos pelo GP ou "a definir pelo GP" (Decisão do GP)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); SKILL.md, princípio 1
  - sinais: "recursos financeiros" | "orçamento" | "valor global" | "R$" | "a definir pelo GP"
  - confere: código
  - dispensa: nunca
- **TAP7.2** Valor igual ao da proposta e do contrato, com documento e página
  - fonte: SKILL.md, etapa 3; Rework RW-002, observação do leitor
  - sinais: valor em R$ | "conforme proposta" | "valor do contrato"
  - confere: código
  - dispensa: nunca

## TAP.8 — Partes interessadas-chave
- **TAP8.1** Partes interessadas-chave, com o papel de cada uma (detalhe no B31)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 13.1, p. 509 (PDF 545)
  - sinais: "partes interessadas" | "contratante" | "secretaria" | tabela com nome e papel
  - confere: código
  - dispensa: nunca
- **TAP8.2** Quem decide do lado do contratante (no setor público, gestor e fiscal do contrato), nominal ou "a definir pelo GP"
  - fonte: `checklist.md` PC3 (CE16); `experiencia.md` §1; `licitacoes.md` 2.6
  - sinais: "gestor do contrato" | "fiscal do contrato" | "ponto focal" | "comitê"
  - confere: código
  - dispensa: nunca

## TAP.9 — Requisitos para aprovação do projeto
- **TAP9.1** O que constitui sucesso (pode remeter ao TAP.2)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117)
  - sinais: "requisitos para aprovação" | "critérios de aprovação" | "sucesso"
  - confere: código
  - dispensa: nunca
- **TAP9.2** Quem decide se o projeto teve sucesso e quem aceita os produtos (no contrato público, recebimento provisório e definitivo)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); `licitacoes.md` 2.6 (Lei 14.133/2021, art. 140)
  - sinais: "aceite" | "recebimento provisório" | "recebimento definitivo" | "comissão"
  - confere: código
  - dispensa: nunca
- **TAP9.3** Quem autoriza o encerramento
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 4.7, p. 124 (PDF 160)
  - sinais: "autoriza o encerramento" | "termo de recebimento definitivo" | "aprovação final"
  - confere: código
  - dispensa: nunca
- **TAP9.4** Aprovação ligada à cláusula de aceite da RFP, com o prazo de análise do contratante ou "não informado no documento"
  - fonte: SKILL.md, etapa 3; `checklist.md` PC3 (CTR5); `experiencia.md` §1
  - sinais: "prazo de análise" | "dias úteis" | "aprovação tácita" | cláusula com página
  - confere: só PMO
  - dispensa: nunca

## TAP.10 — Critérios de término
- **TAP10.1** Condições para encerrar o projeto (produtos aceitos, recebimento definitivo, pendências resolvidas)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 4.7, p. 123 (PDF 159); Rework RW-035 (https://resources.rework.com/libraries/project-management/project-closure)
  - sinais: "critérios de término" | "critérios de encerramento" | "encerramento" | "conclusão"
  - confere: código
  - dispensa: nunca
- **TAP10.2** Condições para cancelar ou suspender, ligadas às cláusulas de extinção ou rescisão
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 1.2.1, p. 5 (PDF 41); 4.7, p. 123 (PDF 159); `licitacoes.md` 2.6
  - sinais: "cancelamento" | "rescisão" | "extinção" | "suspensão" | "encerramento antecipado"
  - confere: código
  - dispensa: nunca
- **TAP10.3** Critérios de término de cada fase
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); revisão de fase, p. 21 (PDF 57); Rework RW-035
  - sinais: "fase" | "etapa" | "critério de saída" | "passagem de fase"
  - confere: código
  - dispensa: uma fase

## TAP.11 — Gerente do projeto designado, responsabilidade e nível de autoridade
- **TAP11.1** GP designado, ou "a definir pelo GP" (Decisão do GP)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); 4.1, p. 77 (PDF 113)
  - sinais: "gerente do projeto" | "coordenador" | "coordenador geral" | "a definir pelo GP"
  - confere: código
  - dispensa: nunca
- **TAP11.2** Responsabilidade e nível de autoridade do GP: o que decide (equipe, gastos, mudanças) e o que escala (Decisão do GP)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); Tab. 2-1, p. 47 (PDF 83); PMBOK 7, Padrão, p. 12 (PDF 39)
  - sinais: "nível de autoridade" | "autoridade" | "alçada" | "responsabilidades" | "escalonamento"
  - confere: código
  - dispensa: nunca

## TAP.12 — Patrocinador ou quem autoriza o TAP
- **TAP12.1** Nome e cargo do patrocinador ou de quem autoriza o TAP, ou "a definir pelo GP" (Decisão do GP)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); glossário, p. 718 (PDF 754)
  - sinais: "patrocinador" | "autorizado por" | "aprovado por" | "a definir pelo GP"
  - confere: código
  - dispensa: nunca
- **TAP12.2** Autoridade do patrocinador: o que decide além da alçada do GP e a rota de escalonamento (Decisão do GP)
  - fonte: PMBOK 6, 4.1.3.1, p. 81 (PDF 117); PMBOK 7, X2, p. 207–208 (PDF 302–303)
  - sinais: "patrocinador" junto de "decide" | "escalonamento"
  - confere: só PMO
  - dispensa: nunca
- **TAP12.3** Aprovação do TAP com assinatura e data
  - fonte: PMBOK 6, 4.1, p. 77 (PDF 113); Rework RW-002
  - sinais: "assinatura" | "aprovação" | "data" | linhas de assinatura
  - confere: código
  - dispensa: nunca

## TAP-PR — Premissas e restrições de alto nível (fora dos 12 elementos)
- **TAP-PR.1** Premissas e restrições de alto nível no TAP, ou remissão ao registro de premissas (B3)
  - fonte: PMBOK 6, 4.1.3.2, p. 81 (PDF 117); 5.1, p. 135 (PDF 171)
  - sinais: "premissa" | "restrição" | "pressupõe-se" | "ver registro de premissas"
  - confere: código
  - dispensa: nunca
- **TAP-PR.2** Premissas críticas que se aplicam ao projeto (PC1 a PC8), escritas com a consequência, ou remissão ao B3 onde elas estão
  - fonte: decisão 0021; `checklist.md` (PC1 a PC8)
  - sinais: "premissa crítica" | "premissas críticas" | "premissa" junto de "caso não" | "se não"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- O sucesso mede o resultado, e não só prazo, custo e "entregar o produto X"? (PMBOK 7, p. 34–36, PDF 61–63)
- As premissas da proposta estão no TAP ou no B3, com a origem? Qual restrição é menos negociável? (PC1 a PC8; Rework RW-007)
- Quem decide do lado do contratante está nomeado, e o tempo de decisão dele aparece nos marcos? (PC3, CE16; experiencia.md §1)
- Algum marco está sem data ou contado de evento sem data? O PMO aponta; a conta é do código (PC4).
- Terceiros de quem o projeto depende e beneficiários estão entre as partes-chave? (PC1 e PC6; Rework RW-006)
- Quem patrocina na FGV e quem responde do lado do contratante? (Rework RW-002, observação do leitor)

## Erros comuns
- Tratar o TAP como contrato, ou pôr nele tarefas e alocação, que são plano (PMBOK 6, p. 77, PDF 113; Rework RW-002).
- Adiantar o detalhe do B17 e do B22, como critério de aceite por produto: o TAP fica em alto nível (Tab. 5-1, p. 155, PDF 191).
- Objetivos não mensuráveis, sem "fora do escopo" ou sem assinatura (Rework RW-002).
- Preencher GP, autoridade, patrocinador ou valor como fato; escrever brecha como risco geral (SKILL.md, princípios 1 e 8).
- Confundir "entregue" com "encerrado" (Rework RW-035).

## Quando dispensar a parte inteira
Nunca: o TAP autoriza o projeto e é a base do "ausente". Adapta-se o detalhe, que varia com a complexidade e com o que se sabe na abertura (PMBOK 6, 4.2.1.1, p. 83, PDF 119). Elemento sem informação fica "a definir pelo GP", nunca some. Em abordagem adaptativa, o TAP é revalidado a cada ciclo (X3.3.1, p. 669, PDF 705).
Linha para a tela: "TAP curto, um parágrafo por elemento: porte pequeno (PMBOK 6, p. 83)."

## Ligações
- **Vem de:** RFP e minuta do contrato (objeto, requisitos R, prazos, valor, cláusulas de aceite e de rescisão); proposta (exclusões, premissas, cronograma, equipe, valor); etapa 1 (brechas, partes); premissas críticas (`checklist.md`).
- **Nasce junto:** B3 (TAP-PR) e B31 (TAP.8).
- **Vai para:** reunião de abertura (Rework RW-020); TAP.3 e TAP.4 → B22, B17 (p. 135–152, PDF 171–188); TAP.6 → B11 (p. 180, PDF 216); TAP.7 → A4 (p. 236, PDF 272); TAP.5 → A8, B27 (p. 402, PDF 438); TAP.8 → B31 (p. 509, PDF 545); TAP.9 e TAP.10 → encerramento, 4.7 (p. 124, PDF 160).

## Modelo de redação
```
1. Finalidade: [2-3 frases; RFP p. X]
2. Objetivo | Critério de sucesso (indicador e meta) | Origem (RFP p. X ou sugestão)
3. Requisitos de alto nível: R01 ...
4. Descrição; entregas-chave; "não faz parte do escopo: ..." (proposta p. X)
5. Risco geral: [fontes; origem: brecha ou premissa crítica PCn]
6. Marco | Data ou prazo (contado de [assinatura/OS]) | Origem
7. Decisão do GP. Sugestão: "valor global conforme proposta (p. X)"
8. Parte | Papel | Decide o quê (detalhe no B31)
9. Sucesso = item 2; aceite e encerramento por [a definir pelo GP]
10. Encerra quando [...]; cancelamento ou suspensão conforme cláusula [p. X]
11. Decisão do GP. Sugestão: "o GP [a definir] decide [...] até [alçada a definir]"
12. Decisão do GP. Sugestão: "[nome e cargo a definir], que decide [...]"
Premissas e restrições (ver B3). Assinaturas e data.
```

## Fontes
- PMBOK 6: 4.1, p. 77–81 (PDF 113–117); 4.2.1.1, p. 83 (PDF 119); 4.7, p. 123–124 (PDF 159–160); 1.2.1, p. 5 (PDF 41); 1.2.6.4, p. 34–35 (PDF 70–71); p. 21 (PDF 57); Tab. 2-1, p. 47 (PDF 83); Tab. 5-1, p. 155 (PDF 191); 5.1–5.2, p. 135–140 (PDF 171–176); 6.1, p. 180 (PDF 216); 13.1, p. 509 (PDF 545); X3.3.1, p. 669 (PDF 705); glossário, p. 705, 715, 718, 723 (PDF 741, 751, 754, 759).
- PMBOK 7: Padrão, p. 12 e 34–36 (PDF 39 e 61–63); X2, p. 207–208 (PDF 302–303).
- Rework: RW-002, RW-025, RW-035 (links nos itens); RW-006 (https://resources.rework.com/libraries/project-management/stakeholder-analysis-matrix); RW-007 (https://resources.rework.com/libraries/project-management/triple-constraint); RW-020 (https://resources.rework.com/libraries/project-management/project-kickoff-meeting).
- `checklist.md` (PC1 a PC8); `experiencia.md` §1 e §2; `licitacoes.md` 2.6; SKILL.md; decisão 0013.
