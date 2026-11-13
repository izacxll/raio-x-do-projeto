---
codigo: A5
nome: Plano de gerenciamento da qualidade
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: entrega
sinonimos: ["plano de qualidade", "plano da qualidade", "plano de gerenciamento de qualidade", "gestão da qualidade", "gerenciamento da qualidade", "garantia da qualidade", "controle de qualidade", "critérios de aceite"]
versao: 0.1.0
---

# A5 — Plano de gerenciamento da qualidade

## Para que serve
Descreve como políticas, procedimentos e diretrizes serão aplicados para atingir os objetivos de qualidade (PMBOK 6, 8.1.3.1, p. 286, PDF 322; glossário, p. 719, PDF 755): o que é produto aceitável, quem confere, quando e o que se faz com o que volta. Formal ou informal, conforme o projeto.

## Conteúdo mínimo
- **A5.1** Padrões aplicáveis: exigências do TR, normas técnicas, padrão de documentos do contratante, política de qualidade da FGV
  - fonte: PMBOK 6, 8.1.3.1, p. 286 (PDF 322); X5.5, p. 681 (PDF 717)
  - sinais: "padrão" | "norma" | "ABNT" | "manual" | "identidade visual" | "política de qualidade"
  - confere: código
  - dispensa: nunca
- **A5.2** Objetivos de qualidade ligados aos objetivos e critérios de sucesso do TAP
  - fonte: PMBOK 6, 8.1.1, p. 279 (PDF 315); 8.1.3.1, p. 286 (PDF 322)
  - sinais: "objetivos da qualidade" | "critério de sucesso" | "TAP"
  - confere: código
  - dispensa: nunca
- **A5.3** Critérios de aceite por produto, ligados aos da RFP (número R e página) e, se a RFP for omissa, marcados como sugestão
  - fonte: PMBOK 6, 8.1.1, p. 279 (PDF 315); glossário, p. 704 (PDF 740); PMBOK 7, 2.6.2, p. 85 (PDF 180); checklist 4
  - sinais: "critério de aceite" | "critérios de aceitação" | "R01" | tabela produto × critério
  - confere: código
  - dispensa: nunca
- **A5.4** Critérios de aceite verificáveis (passa ou não passa) e que não contrariam o TR
  - fonte: Rework RW-064 (https://resources.rework.com/libraries/project-management/acceptance-criteria); PMBOK 7, 2.7.1, p. 97 (PDF 192)
  - sinais: números, formatos, conteúdo mínimo, quem valida
  - confere: só PMO
  - dispensa: nunca
- **A5.5** Papéis da qualidade: quem revisa (não quem produziu), quem aprova na FGV, quem aceita no contratante
  - fonte: PMBOK 6, 8.1.3.1, p. 286 (PDF 322); 8.2, p. 290 (PDF 326); Rework RW-107 (https://resources.rework.com/libraries/process-management/qa-vs-qc)
  - sinais: "revisor" | "revisão por pares" | "responsável pela qualidade" | "fiscal" | "gestor do contrato"
  - confere: código
  - dispensa: nunca
- **A5.6** Atividades de garantia e de controle planejadas, com momento no cronograma (revisão técnica antes de cada entrega, validação com o contratante, auditoria)
  - fonte: PMBOK 6, 8.1.3.1, p. 286 (PDF 322); p. 276 (PDF 312); PMBOK 7, 2.6.3, p. 89 (PDF 184)
  - sinais: "revisão técnica" | "garantia da qualidade" | "controle da qualidade" | "validação" | "auditoria" | "antes da entrega"
  - confere: código
  - dispensa: nunca
- **A5.7** Fluxo de aceite com o contratante: prazo de análise, rodadas de revisão, recebimento provisório e definitivo, aprovação tácita se o contrato prever
  - fonte: PMBOK 6, 5.5, p. 164 (PDF 200); `licitacoes.md` 2.6; checklist 4 e 5; `experiencia.md` §1
  - sinais: "recebimento provisório" | "recebimento definitivo" | "prazo de análise" | "rodadas de revisão" | "aprovação tácita" | "termo de aceite"
  - confere: código
  - dispensa: nunca
- **A5.8** Tratamento de não conformidades e devoluções: correção, ação corretiva e registro
  - fonte: PMBOK 6, 8.1.3.1, p. 286 (PDF 322); 8.2.1, p. 290 (PDF 326); 8.3, p. 306 (PDF 342)
  - sinais: "não conformidade" | "ação corretiva" | "devolução" | "retrabalho" | "registro das questões"
  - confere: código
  - dispensa: nunca
- **A5.9** Remissão às métricas da qualidade (B20) e ao formato das medições de controle (B19)
  - fonte: PMBOK 6, 8.1.3.2, p. 287 (PDF 323); 8.3.3.1, p. 305 (PDF 341)
  - sinais: "métricas da qualidade" | "indicadores de qualidade" | "medições de controle"
  - confere: código
  - dispensa: porte pequeno
- **A5.10** Ferramentas: listas de verificação que incorporam os critérios de aceite, modelos de documento, amostragem quando couber
  - fonte: PMBOK 6, 8.2.2, p. 292 (PDF 328); 8.3, p. 303 (PDF 339)
  - sinais: "lista de verificação" | "checklist" | "modelo de documento" | "template" | "amostragem"
  - confere: código
  - dispensa: nunca
- **A5.11** Melhoria contínua: devoluções somadas e analisadas por causa-raiz; lições no B10
  - fonte: PMBOK 6, 8.1.3.1, p. 286 (PDF 322); 8.3, p. 305 (PDF 341); Rework RW-107
  - sinais: "melhoria contínua" | "causa-raiz" | "lições aprendidas" | "PDCA" | "retrospectiva"
  - confere: código
  - dispensa: porte pequeno
- **A5.12** Qualidade dos dados quando há coleta em campo ou dados pessoais: protocolo de coleta, checagem de consistência, anonimização
  - fonte: checklist 10 (etapa 4); PMBOK 6, 8.1.2, p. 285 (PDF 321); 8.3, p. 303 (PDF 339)
  - sinais: "protocolo de coleta" | "consistência" | "checagem" | "anonimização" | "LGPD"
  - confere: código
  - dispensa: sem campo e sem dados pessoais

## Perguntas de qualidade
- Cada produto do contrato tem critério de aceite, prazo de análise e responsável do lado do contratante com capacidade de avaliar? (checklist 4; `experiencia.md` §1)
- O número de rodadas de revisão está limitado? (checklist 5)
- A revisão é feita por alguém além do autor, e o controle não se reporta a quem é julgado? (Rework RW-107)
- As revisões estão ao longo do projeto, ou só no fim? O tempo delas está no cronograma e nas horas (B6.9)? (PMBOK 7, p. 89, PDF 184)

## Erros comuns
- Critério de aceite vago ("a contento do contratante"), que vira disputa no recebimento (Rework RW-064; checklist 4).
- Qualidade reduzida a uma "validação final" (PMBOK 7, p. 89, PDF 184).
- Confundir qualidade com grau: produto simples bem feito pode bastar (PMBOK 6, p. 274, PDF 310).
- Corrigir devoluções uma a uma, sem ver o padrão (Rework RW-107).

## Quando dispensar a parte inteira
Não se dispensa: todo contrato tem produtos com aceite. Em porte pequeno, plano informal e curto (PMBOK 6, p. 286, PDF 322): critérios de aceite por produto, revisor, fluxo de aceite e devoluções.
Linha para a tela: "Qualidade em formato curto, centrado nos critérios de aceite: porte pequeno (PMBOK 6, p. 286)."

## Ligações
- **Vem de:** 8.1, com TAP2, TAP4 e TAP9 (p. 279, PDF 315), A2, A8, A10, A13, B22, B23 e B27; cláusulas de aceite da RFP e da proposta.
- **Vai para:** 7.2, 8.2 e 8.3; B20, B19, B21, B33; A13 (dicionário da EAP; p. 287, PDF 323); A8; B15 (revisões na rede).
- Requisitos da RFP sobre formato e aceite dos produtos caem aqui (número R).

## Modelo de redação
```
1. Padrões: [TR, cláusula e página; normas; padrão do contratante; política da FGV].
2. Objetivos: [ligados ao TAP2].
3. Critérios de aceite:
   | Produto | Critério (verificável) | Origem (R, página) ou sugestão | Quem valida |
4. Papéis: revisor técnico [perfil, não o autor]; aprovação interna [a definir pelo GP]; aceite: [fiscal/gestor].
5. Atividades: revisão técnica antes de cada entrega; validação [oficina/parecer]; auditoria [se houver].
6. Aceite: análise em [prazo do contrato ou a definir pelo GP]; até [n] rodadas; recebimento conforme [cláusula].
7. Devoluções: registro no B9; análise de causa [frequência]; lições no B10. Métricas no B20; medições no B19.
8. Dados (se houver campo ou dados pessoais): protocolo de coleta, checagem, anonimização.
```

## Fontes
- PMBOK 6: 5.5, p. 164 (PDF 200); 8.1, p. 277–287 (PDF 313–323); 8.2, p. 290–292 (PDF 326–328); 8.3, p. 303–306 (PDF 339–342); p. 274 e 276 (PDF 310 e 312); X5.5, p. 681 (PDF 717); glossário, p. 704 e 719 (PDF 740 e 755).
- PMBOK 7: 2.6.2, p. 85 (PDF 180); 2.6.3, p. 87–91 (PDF 182–186); 2.7.1, p. 97 (PDF 192).
- Rework: RW-064, RW-107 (links nos itens); RW-065 (https://resources.rework.com/libraries/project-management/definition-of-done); RW-045 (https://resources.rework.com/libraries/project-management/v-model).
- `licitacoes.md` 2.6; `checklist.md` (4, 5, 10); `experiencia.md` §1.
