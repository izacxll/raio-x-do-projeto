---
codigo: B27
nome: Registro dos riscos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: incerteza
sinonimos: ["registro de riscos", "matriz de riscos", "mapa de riscos", "planilha de riscos", "riscos identificados", "RAID"]
versao: 0.2.0
---

# B27 — Registro dos riscos

## Para que serve
"Um repositório no qual são registradas as saídas de processos de gerenciamento dos riscos" (PMBOK 6, glossário, p. 721, PDF 757). Cada linha é um risco individual: evento ou condição incerta que, se ocorrer, afeta um objetivo (p. 397, PDF 433). Pode ser enxuto ou extenso conforme o porte (p. 417, PDF 453). Fato já ocorrido vai para o registro das questões (B9); brecha do texto não é risco.

## Conteúdo mínimo
- **B27.1** Cada risco com identificador único e descrição clara
  - fonte: PMBOK 6, 11.2.3.1, p. 417 (PDF 453)
  - sinais: "ID do risco" | "RK01" | "risco 1" | "descrição do risco" | tabela com uma linha por risco
  - confere: código
  - dispensa: nunca
- **B27.2** Causa e efeito escritos separados do evento de risco
  - fonte: PMBOK 6, 11.2.3.1, p. 417 (PDF 453)
  - sinais: "causa" | "efeito" | "consequência" | colunas de causa e efeito
  - confere: código
  - dispensa: porte pequeno
- **B27.3** Probabilidade e impacto pelas escalas do A8, com pontuação ou prioridade
  - fonte: PMBOK 6, 11.3, p. 423 e 427 (PDF 459 e 463); Rework RW-005 (https://resources.rework.com/libraries/project-management/risk-register)
  - sinais: "probabilidade" | "impacto" | "pontuação" | "prioridade" | colunas de probabilidade e impacto
  - confere: código
  - dispensa: nunca
- **B27.4** Responsável nomeado por risco (pessoa ou papel, não "a equipe")
  - fonte: PMBOK 6, 11.3, p. 421 (PDF 457); glossário, p. 723 (PDF 759)
  - sinais: "responsável" | "dono do risco" | "responsável pelo risco" | coluna de responsável preenchida
  - confere: código
  - dispensa: nunca
- **B27.5** Estratégia de resposta e ações concretas
  - fonte: PMBOK 6, 11.5, p. 442–444 e 448 (PDF 478–480 e 484)
  - sinais: "prevenir" | "evitar" | "mitigar" | "transferir" | "aceitar" | "escalar" | "explorar" | "melhorar" | "compartilhar" | "ação"
  - confere: código
  - dispensa: nunca
- **B27.6** Gatilho ou sinal de alerta dos riscos prioritários
  - fonte: PMBOK 6, 11.2.3.1, p. 417 (PDF 453) e 11.5, p. 448 (PDF 484); Rework RW-011 (https://resources.rework.com/libraries/project-management/project-risk-management)
  - sinais: "gatilho" | "sinal de alerta" | "condição de acionamento"
  - confere: código
  - dispensa: nunca
- **B27.7** Plano de contingência ou alternativo dos riscos aceitos ativamente ou de alta prioridade, ligado à reserva
  - fonte: PMBOK 6, 11.5, p. 439, 445 e 448 (PDF 475, 481 e 484)
  - sinais: "plano de contingência" | "contingência" | "plano alternativo" | "reserva"
  - confere: código
  - dispensa: porte pequeno
- **B27.8** Produtos, marcos ou atividades afetados (referência à EAP ou ao cronograma)
  - fonte: PMBOK 6, 11.2.3.1, p. 417 (PDF 453); Rework RW-004 (https://resources.rework.com/libraries/project-management/raid-log)
  - sinais: "EAP" | "produto afetado" | "marco" | "atividade afetada" | código de produto ou pacote
  - confere: código
  - dispensa: porte pequeno
- **B27.9** Situação de cada risco e data de revisão
  - fonte: PMBOK 6, 11.2.3.1, p. 417 (PDF 453) e 11.7, p. 457–458 (PDF 493–494)
  - sinais: "status" | "situação" | "aberto" | "encerrado" | "ocorrido" | "próxima revisão" | "data de identificação"
  - confere: código
  - dispensa: nunca
- **B27.10** Riscos residuais e secundários
  - fonte: PMBOK 6, 11.5, p. 439 e 448 (PDF 475 e 484); PMBOK 7, 2.8, p. 125 (PDF 220)
  - sinais: "risco residual" | "residual" | "risco secundário"
  - confere: código
  - dispensa: porte pequeno
- **B27.11** Oportunidades, não só ameaças
  - fonte: PMBOK 6, 11.5, p. 444 (PDF 480); PMBOK 7, 2.8, p. 125 (PDF 220)
  - sinais: "oportunidade" | "risco positivo" | "explorar" | "melhorar"
  - confere: código
  - dispensa: porte pequeno
- **B27.12** Cada risco que a matriz de riscos do contrato aloca à contratada aparece com resposta
  - fonte: `licitacoes.md` 2.5 (Lei 14.133/2021, art. 6º, XXVII, e art. 103, § 5º); Rework RW-005 (https://resources.rework.com/libraries/project-management/risk-register), observação do leitor
  - sinais: "matriz de riscos do contrato" | "alocado à contratada" | referência à cláusula do contrato
  - confere: só PMO
  - dispensa: contratante privado
- **B27.13** Cada premissa crítica que se aplica ao projeto (PC1 a PC8) tem um risco ligado, com resposta e gatilho
  - fonte: decisão 0021; `checklist.md` (PC1 a PC8); PMBOK 6, 11.2, p. 415 (PDF 451) (premissa inexata gera ameaça)
  - sinais: "premissa" na coluna de causa ou de origem | "gatilho" | "PC" seguido de número | os "sinais no plano" de cada premissa no `checklist.md`
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- A causa é **estrutural** ou é sintoma? Baixa adesão atribuída à "desconfiança das famílias" quando ninguém tem a obrigação de divulgar é causa mal atribuída (PC6; experiencia.md §6).
- Cada risco prioritário tem **resposta com ação, dono e gatilho**, adequada, realista e acordada? (PMBOK 6, p. 439, PDF 475)
- As respostas estão no **cronograma** (B15) e as contingências apontam para a **reserva** (A15)? (PMBOK 6, p. 448, PDF 484; experiencia.md §8)
- Dependências de terceiros têm prazo, gatilho e alternativa? (PC1 e PC6)
- Premissas críticas sem base viraram risco? (PC1 a PC8; vago, CP9; PMBOK 6, p. 415, PDF 451)
- Contratação atrasada e calendário político estão aqui, se aplicáveis? (PC4 e PC5)

## Erros comuns
- **Lançar brecha como risco** ("a cláusula X é ambígua"). A brecha é do texto e se resolve com esclarecimento, premissa ou exclusão; o risco é a condição futura que ela pode causar. Ex.: prazo da FGV contado do recebimento de dados sem prazo para o contratante (brecha ligada à PC1) gera o risco "atraso no envio dos dados atrasa o produto" (SKILL.md, princípio 8).
- Descrição vaga ("risco de comunicação"); tudo como alto; dono "a equipe" (Rework RW-004 e RW-005).
- "Monitorar de perto" como resposta (Rework RW-011).
- Registro feito na partida e nunca revisto (Rework RW-005).
- Confundir risco (não ocorreu) com questão (já ocorreu) (Rework RW-004).
- Respostas registradas e não executadas (PMBOK 6, 11.6, p. 450, PDF 486).

## Quando dispensar a parte inteira
Nunca: todo projeto tem risco (PMBOK 6, p. 397, PDF 433). Em porte pequeno, basta uma tabela enxuta, ou um RAID com riscos, premissas, questões e dependências, na mesma seção do A8 (PMBOK 6, p. 417, PDF 453; Rework RW-004).
Linha para a tela: "Registro enxuto, junto com o plano de riscos: porte pequeno (PMBOK 6, p. 417)."

## Ligações
- **Vem de:** A8 (escalas, formato); B3 (premissa inexata gera ameaça; p. 415, PDF 451); acordos: marcos, aceite, penalidades (p. 413, PDF 449); B31; B6 e B8; brechas da etapa 1 e premissas críticas (PC1 a PC8); matriz de riscos do edital; TAP5.
- **Vai para:** B15 (atividades das respostas); A14 e A15 (reservas; p. 202 e 245, PDF 238 e 281); B18 (quem executa cada resposta); B28; B9 (risco ocorrido); A9 (risco transferido por contrato); A10 (p. 519, PDF 555).

## Modelo de redação
```
| ID | Risco | Causa | Efeito | P | I | Prioridade | Responsável | Estratégia e ações | Gatilho | Contingência/reserva | Produto ou marco | Situação | Revisão |
```
- Uma opção de redação: "Por [causa], pode ocorrer [evento], afetando [objetivo]" (o PMBOK separa causa, risco e efeito, sem dar frase pronta; p. 417).
- Na etapa 4, cada risco com a origem (brecha, matriz do contrato, premissa crítica (PC1 a PC8), premissa do B3) e rótulo `sugestao`; notas e donos: a definir pelo GP.
- Riscos de baixa prioridade numa lista de observação (PMBOK 6, p. 423, PDF 459).

## Fontes
- PMBOK 6: cap. 11, p. 397 (PDF 433); 11.2, p. 413–417 (PDF 449–453); 11.3, p. 421–427 (PDF 457–463); 11.5, p. 439–448 (PDF 475–484); 11.6, p. 450 (PDF 486); 11.7, p. 457–458 (PDF 493–494); 6.4, p. 202 (PDF 238); 7.2, p. 245 (PDF 281); 13.2, p. 519 (PDF 555); glossário, p. 721 e 723 (PDF 757 e 759).
- PMBOK 7: 2.8 Incerteza, p. 125 (PDF 220).
- Rework: RW-004, RW-005, RW-011 (links nos itens).
- `licitacoes.md` 2.5; `checklist.md` (PC1 a PC8; vago, CP9); `experiencia.md` §6 e §8.
