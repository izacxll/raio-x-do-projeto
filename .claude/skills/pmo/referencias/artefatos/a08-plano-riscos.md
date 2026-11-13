---
codigo: A8
nome: Plano de gerenciamento dos riscos
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: incerteza
sinonimos: ["plano de riscos", "plano de gerenciamento de riscos", "plano de gestão de riscos", "gestão de riscos", "gerenciamento de riscos", "metodologia de riscos"]
versao: 0.1.0
---

# A8 — Plano de gerenciamento dos riscos

## Para que serve
Descreve "como as atividades de gerenciamento de riscos serão estruturadas e executadas" (PMBOK 6, glossário, p. 719, PDF 755): método, papéis, escalas, limites, reservas e cadência de revisão, na medida do porte e da importância do projeto (11.1, p. 401, PDF 437). Não é a lista de riscos (B27) nem a lista de brechas do Raio-X.

## Conteúdo mínimo
- **A8.1** Abordagem e metodologia: como os riscos serão identificados, analisados e tratados, e o nível de detalhe escolhido para o porte
  - fonte: PMBOK 6, 11.1.3.1, p. 405 (PDF 441); adaptação, p. 400 (PDF 436)
  - sinais: "metodologia" | "abordagem" | "oficina de riscos" | "lista de verificação" | "pré-mortem" | "simplificado"
  - confere: código
  - dispensa: nunca
- **A8.2** Papéis e responsabilidades: quem conduz o processo, quem responde por cada risco e quem decide sobre as reservas
  - fonte: PMBOK 6, 11.1.3.1, p. 405 (PDF 441)
  - sinais: "papéis e responsabilidades" | "responsável pelo risco" | "dono do risco" | tabela de papéis
  - confere: código
  - dispensa: nunca
- **A8.3** Protocolo de uso das reservas de contingência e gerencial: quem aciona e em que condição
  - fonte: PMBOK 6, 11.1.3.1, p. 405 (PDF 441) e 11.5, p. 439 (PDF 475); PMBOK 7, 2.8, p. 127 (PDF 222)
  - sinais: "reserva de contingência" | "reserva gerencial" | "reserva de gerenciamento" | "acionamento" | "uso da reserva"
  - confere: código
  - dispensa: porte pequeno
- **A8.4** Prazos e frequência: quando os riscos são revistos e quais atividades de riscos entram no cronograma
  - fonte: PMBOK 6, 11.1.3.1, p. 405 (PDF 441) e 11.7, p. 457 (PDF 493)
  - sinais: "revisão dos riscos" | "semanal" | "quinzenal" | "mensal" | "a cada fase" | "reunião de status"
  - confere: código
  - dispensa: nunca
- **A8.5** Categorias dos riscos, numa estrutura analítica dos riscos ou numa lista simples
  - fonte: PMBOK 6, 11.1.3.1, p. 405–406 (PDF 441–442), Fig. 11-4
  - sinais: "categoria" | "estrutura analítica dos riscos" | "EAR" | "técnico" | "externo"
  - confere: código
  - dispensa: porte pequeno
- **A8.6** Apetite e limites dos riscos, mensuráveis para cada objetivo (prazo, custo, qualidade)
  - fonte: PMBOK 6, 11.1.3.1, p. 407 (PDF 443) e p. 398 (PDF 434); PMBOK 7, 2.8, p. 122 (PDF 217)
  - sinais: "apetite" | "limites dos riscos" | "tolerância" | "limiar" | "exposição aceitável"
  - confere: código
  - dispensa: porte pequeno
- **A8.7** Definições de probabilidade e impacto, com cada nível descrito e o impacto por objetivo (3 níveis bastam num processo simples)
  - fonte: PMBOK 6, 11.1.3.1, p. 407 (PDF 443), Tab. 11-1; Rework RW-012 (https://resources.rework.com/libraries/project-management/risk-matrix)
  - sinais: "probabilidade" | "impacto" | "baixa" | "média" | "alta" | tabela de níveis com descrição
  - confere: código
  - dispensa: nunca
- **A8.8** Matriz de probabilidade e impacto com a regra de priorização (faixas e o que se faz em cada uma)
  - fonte: PMBOK 6, 11.1.3.1, p. 408 (PDF 444), Fig. 11-5
  - sinais: "matriz de probabilidade e impacto" | "pontuação" | "prioridade" | grade com os dois eixos
  - confere: código
  - dispensa: nunca
- **A8.9** Formato do registro (B27) e do relatório de riscos (B28): campos, conteúdo e destinatários
  - fonte: PMBOK 6, 11.1.3.1, p. 408 (PDF 444)
  - sinais: "registro dos riscos" | "relatório de riscos" | "campos" | "formato"
  - confere: código
  - dispensa: nunca
- **A8.10** Acompanhamento: como as atividades de riscos são registradas e como o processo é auditado
  - fonte: PMBOK 6, 11.1.3.1, p. 408 (PDF 444) e 11.7, p. 456 (PDF 492)
  - sinais: "auditoria de riscos" | "eficácia das respostas" | "eficácia do processo"
  - confere: código
  - dispensa: porte pequeno
- **A8.11** Decisão sobre a análise quantitativa: se será feita, quando e com que recursos
  - fonte: PMBOK 6, 11.4, p. 429–430 (PDF 465–466); Rework RW-013 (https://resources.rework.com/libraries/project-management/monte-carlo-simulation)
  - sinais: "análise quantitativa" | "Monte Carlo" | "simulação" | "valor monetário esperado" | "nível de confiança"
  - confere: código
  - dispensa: porte pequeno ou porte médio

## Perguntas de qualidade
- O método pede a **causa estrutural** de cada risco, e não o sintoma? Ex.: baixa adesão atribuída às famílias quando ninguém tem a obrigação de divulgar (checklist 12).
- Todo risco prioritário terá **resposta com dono e gatilho**? (PMBOK 6, p. 439, PDF 475)
- O plano conversa com o **cronograma** (respostas viram atividades no B15) e com a **reserva** (A15, condição de uso)? (experiencia.md §8)
- As escalas usam consequências deste contrato (prazo de produto, rejeição, multa), e não um modelo copiado? (checklist 2; Rework RW-012, observação do leitor)
- Há matriz de riscos no contrato? O plano diz como os riscos alocados à contratada vão para o B27? (`licitacoes.md` 2.5)
- A análise quantitativa é exigida pelo contrato ou pelo contratante? Senão, é dispensável (PMBOK 6, p. 429, PDF 465).

## Erros comuns
- **Tratar brecha como risco.** Brecha é problema do texto (errado, em aberto ou que transfere responsabilidade à FGV); risco é condição futura da execução. A brecha pode gerar um risco no B27, mas não é ele (SKILL.md, princípio 8).
- Plano de riscos que não conversa com o cronograma nem com a reserva (experiencia.md §8).
- Escalas sem descrição de cada nível, ou copiadas sem adaptar (Rework RW-012).
- Só ameaças; "monitorar de perto" como resposta (Rework RW-011).

## Quando dispensar a parte inteira
Não se dispensa: o PMBOK autoriza **simplificar**, não omitir (PMBOK 6, p. 400, PDF 436; X5.8, p. 683, PDF 719). Em porte pequeno, pode virar uma seção "Riscos" junto com o B27: escala de 3 níveis, papéis, revisão na reunião de status e a tabela (Rework RW-004 e RW-005).
Linha para a tela: "Riscos simplificados, junto com o registro: porte pequeno (PMBOK 6, p. 400 e 407)."

## Ligações
- **Vem de:** TAP (risco geral, TAP5; PMBOK 6, p. 402, PDF 438); B31 (atitudes diante do risco); demais componentes; brechas da etapa 1; checklist; matriz de riscos do edital.
- **Vai para:** B27 e B28 (formato); A4 e A15 (contingência na linha de base dos custos; p. 248, PDF 284); A3 e B15 (atividades de riscos, reserva de cronograma; p. 202, PDF 238); A10; A5; A9.
- Requisitos da RFP que pedem "plano de riscos" ou "matriz de riscos" caem aqui (número R).

## Modelo de redação
```
1. Abordagem: sugere-se processo [simplificado/completo], porque [porte, motivo].
2. Papéis: condução [a definir pelo GP]; dono de cada risco no B27; reserva [decisão do GP].
3. Limites por objetivo (prazo, custo, qualidade): [a definir pelo GP].
4. Escalas: Nível | Probabilidade | Impacto em prazo | em custo | em qualidade
5. Matriz P x I e o que fazer em cada faixa.
6. Reservas de contingência e gerencial, com condição de uso. Valores: decisão do GP.
7. Revisão [na reunião de status/dedicada], frequência [a definir pelo GP]; a cada fase.
8. Campos do B27; conteúdo e periodicidade do B28.
9. Matriz de riscos do contrato (se houver): riscos da contratada no B27.
```

## Fontes
- PMBOK 6: cap. 11, 11.1 a 11.7, p. 397–457 (PDF 433–493); 6.4, p. 202 (PDF 238); 7.3, p. 248 (PDF 284); X5.8, p. 683 (PDF 719); glossário, p. 719 (PDF 755).
- PMBOK 7: 2.8 Incerteza, p. 116–129 (PDF 211–224).
- Rework: RW-004 (https://resources.rework.com/libraries/project-management/raid-log); RW-005 (https://resources.rework.com/libraries/project-management/risk-register); RW-011 (https://resources.rework.com/libraries/project-management/project-risk-management); RW-012 e RW-013 (links nos itens); RW-042 (https://resources.rework.com/libraries/project-management/pre-mortem).
- `licitacoes.md` 2.5; `checklist.md` (2, 12); `experiencia.md` §8 e §9.
