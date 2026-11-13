---
codigo: A11
nome: Plano de gerenciamento de mudanças
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: trabalho do projeto
sinonimos: ["plano de mudanças", "plano de gerenciamento das mudanças", "controle de mudanças", "plano de controle de mudanças", "gestão de mudanças", "controle de alterações", "gestão de alterações"]
versao: 0.2.0
---

# A11 — Plano de gerenciamento de mudanças

## Para que serve
Diz como as solicitações de mudança serão autorizadas e incorporadas ao projeto (PMBOK 6, 4.2.3.1, p. 88, PDF 124): cria o comitê de controle de mudanças, fixa até onde vai a autoridade dele e descreve o sistema de controle (glossário, p. 719, PDF 755). Com contratante público, inclui o caminho até o aditivo. Não é a gestão da mudança organizacional (adoção pelo órgão; PMBOK 7, Padrão 3.12, p. 58–59, PDF 85–86).

## Conteúdo mínimo
- **A11.1** Quem aprova, adia ou rejeita mudanças (pessoa ou comitê), com a composição do CCM e a extensão da sua autoridade
  - fonte: PMBOK 6, 4.6, p. 115 e 120 (PDF 151 e 156); glossário, p. 719 (PDF 755)
  - sinais: "comitê de controle de mudanças" | "CCM" | "comitê gestor" | "aprovador" | tabela de papéis do comitê
  - confere: código
  - dispensa: nunca
- **A11.2** Alçadas: o que o GP decide sozinho, o que vai ao comitê e o que vai ao contratante (limiar de valor, prazo ou efeito na linha de base)
  - fonte: PMBOK 6, 4.2, p. 83 (PDF 119) e 4.6, p. 117 (PDF 153); Rework RW-028 (https://resources.rework.com/libraries/project-management/change-control-process)
  - sinais: "alçada" | "limite de aprovação" | "acima de" | "até" | "afeta a linha de base" | tabela por tipo de mudança e aprovador
  - confere: código
  - dispensa: porte pequeno
- **A11.3** Toda solicitação registrada por escrito, mesmo a que começou verbal, num formulário e no registro das mudanças (B5)
  - fonte: PMBOK 6, 4.6, p. 115 (PDF 151); Rework RW-028
  - sinais: "por escrito" | "formulário de solicitação de mudança" | "solicitação de mudança" | "registro das mudanças" | "SM-01"
  - confere: código
  - dispensa: nunca
- **A11.4** Fluxo da solicitação: pedir, registrar, analisar o impacto, decidir, comunicar, implementar e verificar
  - fonte: PMBOK 6, 4.6, p. 118–120 (PDF 154–156); Rework RW-032 (https://resources.rework.com/libraries/project-management/integrated-change-control)
  - sinais: "fluxo" | "etapas" | "análise de impacto" | "decisão" | fluxograma ou lista numerada de passos
  - confere: código
  - dispensa: nunca
- **A11.5** Análise de impacto integrada antes da decisão: escopo, prazo, custo, recursos, qualidade e novos riscos
  - fonte: PMBOK 6, 4.6, p. 117 e 120 (PDF 153 e 156); PMBOK 7, 2.5.7, p. 77 (PDF 172)
  - sinais: "impacto no prazo" | "impacto no custo" | "impacto" | "riscos da mudança" | "análise integrada"
  - confere: código
  - dispensa: nunca
- **A11.6** Só mudança aprovada altera a linha de base; o plano diz quais documentos são atualizados depois da aprovação
  - fonte: PMBOK 6, 4.2, p. 83 (PDF 119) e 4.6, p. 117 e 120 (PDF 153 e 156)
  - sinais: "linha de base" | "nova versão" | "atualização do plano" | "somente mudanças aprovadas"
  - confere: código
  - dispensa: nunca
- **A11.7** Comunicação da decisão ao solicitante e às partes afetadas, com prazo de resposta
  - fonte: PMBOK 6, 4.6, p. 120 (PDF 156); Rework RW-028
  - sinais: "comunicar a decisão" | "prazo de resposta" | "dias úteis" | "notificação" | "ata"
  - confere: código
  - dispensa: nunca
- **A11.8** Aprovação do contratante: quais mudanças exigem o aceite do cliente depois do comitê, e quem decide do lado dele
  - fonte: PMBOK 6, 4.6, p. 115 e 117 (PDF 151 e 153); experiencia.md §1
  - sinais: "gestor do contrato" | "fiscal do contrato" | "aprovação do contratante" | "anuência" | "ponto focal"
  - confere: código
  - dispensa: nunca
- **A11.9** Caminho contratual: o que vira termo aditivo, o que se resolve por apostila e o que não tem efeito no contrato
  - fonte: licitacoes.md 2.7 (Lei 14.133, arts. 124, 132 e 136); PMBOK 6, 4.6, p. 117 (PDF 153), restrições de contratação
  - sinais: "termo aditivo" | "aditivo" | "apostila" | "apostilamento" | "art. 124" | "alteração contratual"
  - confere: código
  - dispensa: contratante privado
- **A11.10** Limites legais e reequilíbrio: acréscimos e supressões até 25% do valor inicial atualizado; reequilíbrio pedido durante a vigência
  - fonte: licitacoes.md 2.7 (Lei 14.133, arts. 125, 131 e 132)
  - sinais: "25%" | "valor inicial atualizado" | "reequilíbrio" | "equilíbrio econômico-financeiro" | "art. 125"
  - confere: código
  - dispensa: contratante privado
- **A11.11** Na parte adaptativa, as mudanças entram no backlog e quem prioriza é o representante do cliente; a mudança no contrato segue A11.9
  - fonte: PMBOK 6, X3.3.4, p. 671 (PDF 707); PMBOK 7, 2.5.7, p. 76 (PDF 171)
  - sinais: "backlog" | "repriorização" | "dono do produto" | "representante do contratante"
  - confere: só PMO
  - dispensa: abordagem preditiva
- **A11.12** Como reajustar escopo, prazo e metas se uma premissa crítica falhar: quem identifica, quem decide e qual o caminho (mudança interna, ajuste com o contratante, termo aditivo)
  - fonte: decisão 0021; `checklist.md` (PC1 a PC8, campo "se não se confirmar"); PMBOK 6, 4.6, p. 113–120 (PDF 149–156) (controle integrado de mudanças)
  - sinais: "se a premissa" | "premissa não se confirmar" | "falha de premissa" | "reajuste do cronograma" | "revisão das metas" | "reequilíbrio"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- O plano dá ao pedido fora do escopo (rodada extra de revisão, produto novo pedido em oficina) um caminho escrito com resposta de impacto? (PC8)
- Quem decide do lado do contratante está nomeado por papel, com prazo? Sem instância de decisão, a mudança simples para (PC3; experiencia.md §1).
- O que depende de terceiro (dado de outro órgão que mudou) também entra como pedido de mudança? (PC1)
- Existe rito de urgência, com aprovação provisória e formulário preenchido depois? (Rework RW-028)
- O nível de controle é proporcional ao porte, ao contrato e ao contexto? (PMBOK 6, p. 115, PDF 151)

## Erros comuns
- Aprovação verbal, sem registro e sem análise de impacto (PMBOK 6, p. 115, PDF 151; Rework RW-028).
- Aprovar a mudança olhando só uma dimensão (ex.: o custo), sem o efeito no resto (Rework RW-032).
- Linha de base ajustada ao realizado, sem mudança aprovada (PMBOK 6, p. 120, PDF 156).
- Plano interno da FGV sem a ponte para o aditivo, ou aditivo pedido depois de executado o acréscimo (licitacoes.md 2.7, art. 132).
- Confundir controle de mudanças com gestão da mudança organizacional (PMBOK 7, glossário, p. 239 e 244, PDF 334 e 339).

## Quando dispensar a parte inteira
Não se dispensa: o nível de controle varia com o porte e o contrato, mas existe sempre (PMBOK 6, p. 115, PDF 151); com contratante público, é essencial (pmbok7.md, seção 3, item 10). Em porte pequeno, basta uma seção curta: aprovador único na FGV, aceite do contratante, formulário e caminho do aditivo (Rework RW-028).
Linha para a tela: "Mudanças numa seção curta, com aprovador único e caminho do aditivo: porte pequeno (PMBOK 6, p. 115; Rework RW-028)."

## Ligações
- **Vem de:** 4.2 (X1.5; PMBOK 6, p. 642, PDF 678); TAP11 (autoridade do GP); A1.6 (pedido fora do escopo); A12; limiares da organização (p. 83); cláusulas de alteração do TR e do contrato.
- **Vai para:** 4.6, 5.6, 12.3 e 13.3 (pmbok6.md, tabela); B5; A13, A14 e A15 (linhas de base); A7; B27.
- Requisitos da RFP sobre "alterações", "aditivos" ou "solicitações da contratante" caem aqui (número R).

## Modelo de redação
```
1. Quem decide: comitê de controle de mudanças composto por [papéis a definir pelo GP]; do lado do contratante, [gestor/fiscal, a confirmar].
2. Alçadas: Tipo de mudança | Quem decide | Precisa do contratante? | Instrumento (nenhum, apostila, aditivo)
   Limiares: a definir pelo GP.
3. Fluxo: solicitação escrita → registro no B5 → análise de impacto (escopo, prazo, custo, recursos, qualidade, riscos) → decisão → comunicação em [prazo a definir] → atualização das linhas de base.
4. Urgência: aprovação provisória por [papel], formulário em até [prazo a definir].
5. Contrato (contratante público): alterações nos limites do art. 125 da Lei 14.133; reequilíbrio pedido na vigência (art. 131); aditivo antes da execução (art. 132); reajuste por apostila (art. 136).
6. Parte adaptativa (se houver): mudanças no backlog, priorizadas por [representante do contratante].
```

## Fontes
- PMBOK 6: 4.2, p. 83 e 88 (PDF 119 e 124); 4.6, p. 113–120 (PDF 149–156); X1.5, p. 642 (PDF 678); X3.3.4, p. 671 (PDF 707); glossário, p. 719 (PDF 755).
- PMBOK 7: Padrão 3.12, p. 58–59 (PDF 85–86); Guia 2.5.7, p. 76–77 (PDF 171–172); glossário, p. 239 e 244 (PDF 334 e 339).
- Rework: RW-028 (https://resources.rework.com/libraries/project-management/change-control-process); RW-032 (https://resources.rework.com/libraries/project-management/integrated-change-control).
- `licitacoes.md` 2.7; `checklist.md` (PC1 a PC8); `experiencia.md` §1; `pmbok7.md` seção 3.
