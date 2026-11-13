---
codigo: B9
nome: Registro das questões
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: trabalho do projeto
sinonimos: ["registro de questões", "registro de problemas", "log de questões", "controle de pendências", "pontos em aberto", "issue log", "RAID"]
versao: 0.2.0
---

# B9 — Registro das questões

## Para que serve
"Um documento do projeto, onde informações sobre questões são registradas e monitoradas" (PMBOK 6, glossário, p. 721, PDF 757). Questão é problema, lacuna, inconsistência ou conflito inesperado que já exige ação (4.3, p. 96, PDF 132). Risco ainda não aconteceu (B27); mudança propõe alterar a linha de base (B5). Nasce na execução (4.3); na etapa 4 entra como **modelo inicial**, sem inventar questões (decisão 0007, passo 12). Exceção: leitura do TR ainda não confirmada pelo contratante pode entrar já como questão aberta (vago, CTR7).

## Conteúdo mínimo
- **B9.1** Identificador e descrição de cada questão
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132)
  - sinais: "nº" | "ID" | "Q-01" | "I-001" | "descrição" | tabela com uma linha por questão
  - confere: código
  - dispensa: nunca
- **B9.2** Tipo de questão
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132)
  - sinais: "tipo" | "categoria" | "técnica" | "contratual" | "equipe" | "insumo"
  - confere: código
  - dispensa: porte pequeno
- **B9.3** Quem levantou e quando
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132)
  - sinais: "levantada por" | "origem" | "data de registro" | "data de abertura"
  - confere: código
  - dispensa: nunca
- **B9.4** Prioridade ou severidade
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132); Rework RW-004 (https://resources.rework.com/libraries/project-management/raid-log)
  - sinais: "prioridade" | "severidade" | "alta" | "média" | "baixa" | "crítica"
  - confere: código
  - dispensa: porte pequeno
- **B9.5** Responsável pela resolução (uma pessoa ou papel, não "a equipe")
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132) e 4.5, p. 108 (PDF 144); Rework RW-004
  - sinais: "responsável" | "dono" | coluna de responsável
  - confere: código
  - dispensa: nunca
- **B9.6** Data-alvo de resolução
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132) e 4.5, p. 108 (PDF 144)
  - sinais: "prazo" | "data-alvo" | "data limite" | "resolver até"
  - confere: código
  - dispensa: nunca
- **B9.7** Status (aberta, em andamento, resolvida, encerrada)
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132)
  - sinais: "status" | "situação" | "aberta" | "em andamento" | "resolvida" | "encerrada"
  - confere: código
  - dispensa: nunca
- **B9.8** Solução final registrada ao encerrar a questão
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132)
  - sinais: "solução" | "resolução" | "encaminhamento" | "como foi resolvida"
  - confere: código
  - dispensa: nunca
- **B9.9** Escalonamento: para quem vai a questão que não avança (comitê, patrocinador, gestor do contrato)
  - fonte: Rework RW-004; PMBOK 7, Guia 4.6, p. 185 (PDF 280), questão com responsável até a resolução
  - sinais: "escalonamento" | "escalar" | "encaminhar ao comitê" | "nível de decisão"
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- Dado, aprovação ou insumo que o contratante ou um terceiro deve e não entregou vira questão com responsável do outro lado e prazo? (PC1 e PC6)
- A leitura do TR adotada sem confirmação está registrada até o contratante responder? (vago, CTR7)
- O registro é revisto numa reunião com cadência fixa (A7), e as questões abertas há dois ciclos sobem de nível? (Rework RW-004)
- A causa de cada questão é investigada, e não só o sintoma ("falha de comunicação", "erro humano")? (Rework RW-106, https://resources.rework.com/libraries/process-management/root-cause-analysis)
- No encerramento, o registro mostra que não há questão pendente? (PMBOK 6, 4.7, p. 124, PDF 160)

## Erros comuns
- Confundir risco (ainda não ocorreu) com questão (já ocorreu) (Rework RW-004; PMBOK 6, p. 96, PDF 132).
- Misturar questões e pedidos de mudança na mesma lista (Rework RW-032, https://resources.rework.com/libraries/project-management/integrated-change-control).
- Responsável "equipe" ou sem prazo; itens resolvidos apagados em vez de arquivados (Rework RW-004).
- Encerrar a questão sem confirmar a causa (Rework RW-054, https://resources.rework.com/libraries/project-management/project-life-cycle).
- Preencher o modelo da etapa 4 com questões fictícias (decisão 0007, passo 12).

## Quando dispensar a parte inteira
Não se dispensa: é entrada do monitoramento (4.5) e do encerramento (4.7) (PMBOK 6, p. 108 e 124, PDF 144 e 160). Em porte pequeno, pode viver no RAID, numa tabela única com riscos, premissas e dependências, com as colunas B9.1, B9.3, B9.5 a B9.8 (Rework RW-004). Esse apoio é do Rework, não do PMBOK. Não fundir com o registro das mudanças (Rework RW-032).
Linha para a tela: "Questões no RAID, junto com riscos e premissas: porte pequeno (Rework RW-004)."

## Ligações
- **Vem de:** 4.3 (nasce aqui); atualizado em 4.5, 8.3, 9.5, 9.6, 10.2, 10.3, 11.6, 11.7, 13.3 e 13.4 (pmbok6.md, tabela); risco que ocorreu (B27); dependência não cumprida; leitura não confirmada de trecho vago (CTR7).
- **Vai para:** 4.5 (quem resolve o quê e quando); 4.7 (nada pendente); 11.2 (questões revelam riscos); 13.1, 13.2 e 13.4 (questões ligadas a partes interessadas; PMBOK 7, Tab. 2-2, p. 15, PDF 110); B5 (questão que gera pedido de mudança); B10 (lição).

## Modelo de redação
```
Nº | Tipo | Levantada por / data | Descrição | Prioridade | Responsável | Prazo | Status | Solução final | Escalonada para
Modelo inicial: sem linhas inventadas; exceção para leituras do TR ainda não confirmadas (vago, CTR7).
Revisão: na reunião de [cadência definida no A7]; sem avanço em [nº de ciclos a definir pelo GP], escalar para [papel].
```

## Fontes
- PMBOK 6: 4.3, p. 96 (PDF 132); 4.5, p. 108 (PDF 144); 4.7, p. 124 (PDF 160); glossário, p. 721 (PDF 757).
- PMBOK 7: Tab. 2-2, p. 15 (PDF 110); Guia 4.6, p. 185 (PDF 280).
- Rework: RW-004 (link no item B9.4); RW-032, RW-054 e RW-106 (links nas seções acima).
- `checklist.md` (PC1, PC6; vago, CTR7); decisão 0007.
