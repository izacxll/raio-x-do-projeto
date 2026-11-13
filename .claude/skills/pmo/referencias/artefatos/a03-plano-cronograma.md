---
codigo: A3
nome: Plano de gerenciamento do cronograma
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: tempo
sinonimos: ["plano de cronograma", "plano de gerenciamento de cronograma", "gestão do cronograma", "gerenciamento do cronograma", "gerenciamento do tempo", "plano de gerenciamento do tempo", "metodologia de cronograma"]
versao: 0.2.0
---

# A3 — Plano de gerenciamento do cronograma

## Para que serve
Componente que "estabelece os critérios e as atividades para o desenvolvimento, monitoramento e controle do cronograma" (PMBOK 6, 6.1.3.1, p. 181, PDF 217). Diz como o cronograma é montado, calculado, mantido e conferido; não é o cronograma (B15). Formal ou informal, conforme o porte.

## Conteúdo mínimo
- **A3.1** Metodologia de cronograma (caminho crítico, ágil ou híbrida) e ferramenta usada
  - fonte: PMBOK 6, 6.1.3.1, p. 182 (PDF 218); PMBOK 7, artefatos, p. 187 (PDF 282)
  - sinais: "metodologia" | "caminho crítico" | "MS Project" | "ferramenta de cronograma" | "planilha" | "sprint" | "híbrida"
  - confere: código
  - dispensa: nunca
- **A3.2** Unidade de medida e forma de contagem das durações (dias úteis ou corridos, semanas)
  - fonte: PMBOK 6, 6.1.3.1, p. 182 (PDF 218)
  - sinais: "dias úteis" | "dias corridos" | "semanas" | "unidade de medida" | "horas"
  - confere: código
  - dispensa: nunca
- **A3.3** Nível de exatidão aceito para as estimativas de duração (faixa)
  - fonte: PMBOK 6, 6.1.3.1, p. 182 (PDF 218); 6.4, p. 201 (PDF 237); PMBOK 7, 2.4.2.2, p. 55–57 (PDF 150–152)
  - sinais: "exatidão" | "faixa" | "três pontos" | "otimista" | "pessimista" | "±"
  - confere: código
  - dispensa: porte pequeno
- **A3.4** Regras de construção da rede: toda atividade com predecessora e sucessora, sem ciclos, marcos com duração zero, antecipações e esperas sem substituir a lógica
  - fonte: PMBOK 6, 6.3, p. 188, 190 e 193 (PDF 224, 226 e 229); 6.2, p. 186 (PDF 222); Rework RW-027 (https://resources.rework.com/libraries/project-management/task-dependencies)
  - sinais: "predecessora" | "sucessora" | "dependência" | "duração zero" | "TI" | "término para início"
  - confere: código
  - dispensa: nunca
- **A3.5** Como o cronograma é calculado e a partir de que evento as datas são contadas (assinatura, ordem de serviço)
  - fonte: PMBOK 6, 6.5, p. 207 (PDF 243); `checklist.md` PC4; experiencia.md §2
  - sinais: "a partir da ordem de serviço" | "a partir da assinatura" | "data de início" | "D+" | "contados de"
  - confere: código
  - dispensa: nunca
- **A3.6** Análise e aprovação do contratante e dependências externas entram na rede como atividades com duração
  - fonte: PMBOK 6, 6.3, p. 191–192 (PDF 227–228); `checklist.md` PC1, PC3 e PC6; Rework RW-052 (https://resources.rework.com/libraries/project-management/critical-path-method)
  - sinais: "prazo de análise" | "aprovação do contratante" | "validação" | "dependência externa" | "recebimento dos dados"
  - confere: código
  - dispensa: nunca
- **A3.7** Contingência de cronograma explícita: onde fica (por atividade, por fase ou antes de cada entrega) e quem autoriza o uso
  - fonte: PMBOK 6, 6.4, p. 202 (PDF 238); 6.6, p. 224 (PDF 260); Rework RW-024 (https://resources.rework.com/libraries/project-management/critical-chain-project-management)
  - sinais: "contingência" | "reserva de cronograma" | "folga" | "pulmão" | "buffer" | "uso da reserva"
  - confere: código
  - dispensa: nunca
- **A3.8** Conferência contra os prazos da RFP ou do contrato e os marcos do TAP, e conduta se houver folga negativa
  - fonte: PMBOK 6, 6.1, p. 180 (PDF 216); 6.5, p. 210 e 215 (PDF 246 e 251); Rework RW-056 (https://resources.rework.com/libraries/project-management/float-and-slack)
  - sinais: "prazo contratual" | "termo de referência" | "marcos do TAP" | "folga negativa" | "compressão" | "paralelismo"
  - confere: código
  - dispensa: nunca
- **A3.9** Frequência de atualização e registro do andamento
  - fonte: PMBOK 6, 6.1.3.1, p. 182 (PDF 218); 6.6, p. 224 (PDF 260)
  - sinais: "atualização" | "semanal" | "quinzenal" | "mensal" | "data de status"
  - confere: código
  - dispensa: nunca
- **A3.10** Limites de controle: desvio tolerado antes de agir
  - fonte: PMBOK 6, 6.1.3.1, p. 182 (PDF 218); PMBOK 7, 2.7.5, p. 113–114 (PDF 208–209)
  - sinais: "limite de controle" | "tolerância" | "desvio" | "variação" | "semáforo"
  - confere: código
  - dispensa: porte pequeno
- **A3.11** Regras de medição do desempenho (critério de % completo, valor agregado, VPR, IDP)
  - fonte: PMBOK 6, 6.1.3.1, p. 182 (PDF 218)
  - sinais: "valor agregado" | "VPR" | "IDP" | "% completo" | "critério de medição"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **A3.12** Nível de detalhe proporcional ao porte e, se houver ondas sucessivas, o horizonte de cada onda e quando se replaneja
  - fonte: PMBOK 6, 6.1, p. 181 (PDF 217); 6.2, p. 184–185 (PDF 220–221); Rework RW-037 (https://resources.rework.com/libraries/project-management/rolling-wave-planning)
  - sinais: "ondas sucessivas" | "onda" | "replanejamento" | "nível de detalhe" | "pacote de planejamento"
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O plano diz de que evento as datas são contadas, e esse evento tem data? (PC4)
- O tempo do contratante para analisar e aprovar entra como atividade, ou o plano supõe aprovação instantânea? (PC3; experiencia.md §1)
- As dependências de terceiros (dados, agendas, pareceres) têm prazo e aparecem na rede? (PC1 e PC6)
- A contingência está visível e tem regra de uso, ou ficou escondida nas durações? (PMBOK 6, p. 202, PDF 238; Rework RW-024)
- O plano diz o que fazer se o cálculo der folga negativa frente a um prazo do contrato? Quem calcula é o código (SKILL.md, princípio 6).

## Erros comuns
- Plano copiado de outro projeto, sem a contagem do contrato (conflituoso, CP8).
- Aprovação do cliente fora da rede; o cronograma estoura nas aprovações (experiencia.md §1).
- Comprimir fora do caminho crítico ou paralelizar dependência rígida (PMBOK 6, p. 215, PDF 251; Rework RW-016).
- Nivelar recurso movendo prazo contratual sem aprovação formal (Rework RW-009, https://resources.rework.com/libraries/project-management/resource-leveling-vs-smoothing).
- Ondas sucessivas como desculpa para não planejar (Rework RW-037).

## Quando dispensar a parte inteira
Não se dispensa: todo projeto da FGV tem prazos contratuais. Em porte pequeno, 6.2 a 6.5 podem ser um só processo (PMBOK 6, p. 175, PDF 211) e o A3 vira seção curta junto ao B15: metodologia, contagem, aprovações, contingência e atualização.
Linha para a tela: "Cronograma simplificado, junto com o cronograma: porte pequeno (PMBOK 6, p. 175 e 181)."

## Ligações
- **Vem de:** 6.1, com TAP (TAP.6, marcos), A1 e A18 (p. 180, PDF 216); prazos da RFP e da proposta; `checklist.md` PC1, PC3, PC4 e PC6.
- **Vai para:** 6.2 a 6.6, 7.1 e 11.2; B16, B15, B11, B13, A14; A8 (reserva; p. 202, PDF 238); A7 (relatórios); A11 (mudança de linha de base).

## Modelo de redação
```
1. Metodologia: sugere-se [caminho crítico/híbrida], porque [motivo]; ferramenta [a definir pelo GP].
2. Contagem: durações em [dias úteis/corridos], conforme [cláusula da RFP, página]; datas a partir de [evento].
3. Regras da rede: predecessora e sucessora em toda atividade; marcos com duração zero;
   análise do contratante como atividade, com prazo [do contrato ou a definir pelo GP].
4. Contingência: [por fase/antes de cada entrega]; uso autorizado por [a definir pelo GP].
5. Conferência: o cronograma é comparado com os prazos da RFP e os marcos do TAP; folga negativa → [ação].
6. Atualização: [frequência a definir pelo GP]; limites de controle [a definir pelo GP].
```

## Fontes
- PMBOK 6: 6.1, p. 179–182 (PDF 215–218); 6.2, p. 184–186 (PDF 220–222); 6.3, p. 188–193 (PDF 224–229); 6.4, p. 201–202 (PDF 237–238); 6.5, p. 207–215 (PDF 243–251); 6.6, p. 224 (PDF 260); p. 175 (PDF 211).
- PMBOK 7: 2.4.2.2, p. 55–57 (PDF 150–152); 2.7.5, p. 113–114 (PDF 208–209); artefatos, p. 187 (PDF 282).
- Rework: RW-016 (https://resources.rework.com/libraries/project-management/fast-tracking-vs-crashing); RW-009, RW-024, RW-027, RW-037, RW-052, RW-056 (links nos itens e nos erros).
- `checklist.md` (CP8, PC1, PC3, PC4, PC6); `experiencia.md` §1 e §2.
