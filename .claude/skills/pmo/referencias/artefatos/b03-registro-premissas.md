---
codigo: B3
nome: Registro de premissas
tipo: documento do projeto
etapas: [3, 4, 5]
gravidade: baixa
categoria: incerteza
sinonimos: ["registro das premissas", "premissas e restrições", "premissas", "lista de premissas", "registro de premissas e restrições", "assumption log", "RAID"]
versao: 0.1.0
---

# B3 — Registro de premissas

## Para que serve
"Um documento do projeto usado para registrar todas as premissas e restrições durante todo o ciclo de vida do projeto" (PMBOK 6, glossário, p. 721, PDF 757). Premissa é o que se toma como certo sem prova; restrição é o fator que limita a execução (p. 720 e 723, PDF 756 e 759). Nasce com o TAP (4.1.3.2, p. 81, PDF 117) e é atualizado por muitos processos. No app, nasce na etapa 3 (premissas e restrições da proposta, do TAP e da RFP) e é atualizado na etapa 4, depois de riscos e custos (decisão 0007, passo 9).

## Conteúdo mínimo
- **B3.1** Cada premissa ou restrição numerada, em frase verificável, com o tipo (premissa ou restrição)
  - fonte: PMBOK 6, 4.1.3.2, p. 81 (PDF 117); glossário, p. 720 e 723 (PDF 756 e 759); Rework RW-004 (https://resources.rework.com/libraries/project-management/raid-log)
  - sinais: "premissa" | "restrição" | "P01" | "A-001" | tabela com uma linha por item e coluna de tipo
  - confere: código
  - dispensa: nunca
- **B3.2** Origem de cada item: documento e página (RFP, proposta, TAP), estimativa, risco ou parte interessada
  - fonte: decisão 0007, passo 9; `checklist.md` 2 (etapa 3); PMBOK 6, 4.7, p. 124 (PDF 160)
  - sinais: "origem" | "fonte" | "RFP, p." | "proposta, p." | "TAP" | coluna de origem
  - confere: código
  - dispensa: nunca
- **B3.3** Premissas e restrições de alto nível herdadas da proposta e do TAP (data de início, prazos de aprovação, dados e apoio do contratante)
  - fonte: PMBOK 6, 4.1.3.2, p. 81 (PDF 117); `experiencia.md` §1 a §3; `checklist.md` 8 e 9
  - sinais: "data de início" | "ordem de serviço" | "prazo de análise" | "fornecidos pela contratante" | "disponibilização"
  - confere: código
  - dispensa: nunca
- **B3.4** Premissas novas das estimativas de duração e custo e da análise de riscos (produtividade, disponibilidade da equipe, deslocamento)
  - fonte: PMBOK 6, 6.4, p. 204 (PDF 240); 7.2, p. 247 (PDF 283); 9.2, p. 327 (PDF 363); 11.2, p. 415 (PDF 451); decisão 0007, passo 9
  - sinais: "produtividade" | "disponibilidade" | "horas por" | "estimativa" | "deslocamento"
  - confere: código
  - dispensa: nunca
- **B3.5** Restrições do contrato registradas (prazo final, valor, vedação de subcontratação, regras de aceite e pagamento)
  - fonte: PMBOK 6, glossário, p. 723 (PDF 759); FAE, p. 38–39 (PDF 74–75); `licitacoes.md` 2.6 e 2.8; `checklist.md` 3
  - sinais: "vedada a subcontratação" | "vigência" | "valor global" | "improrrogável" | cláusula com página
  - confere: só PMO
  - dispensa: nunca
- **B3.6** Situação de cada item (aberta, validada, invalidada, encerrada) e data da última revisão
  - fonte: PMBOK 6, 4.3, p. 97 (PDF 133); Rework RW-004
  - sinais: "situação" | "status" | "validada" | "não validada" | "encerrada" | "revisado em"
  - confere: código
  - dispensa: nunca
- **B3.7** Responsável e prazo para validar as premissas críticas
  - fonte: Rework RW-004
  - sinais: "responsável" | "validar até" | "confirmar com" | coluna de responsável
  - confere: código
  - dispensa: porte pequeno
- **B3.8** Premissa crítica sem base tem risco ligado no B27 (o que acontece se ela falhar)
  - fonte: PMBOK 6, 11.2, p. 415 (PDF 451); `checklist.md` 2 (etapa 4); Rework RW-004
  - sinais: "R01" | "risco associado" | "ver registro dos riscos" | coluna de risco
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Cada premissa tem base (documento, histórico, estimativa), ou é número redondo sem memória de cálculo? (checklist 2, CP9; experiencia.md §7)
- Há texto de outro projeto ou contrato (outro órgão, outro tipo de contrato)? (checklist 2, CP8)
- Premissa do contratante que pode não se confirmar, ou limitação declarada dele, como não ter quem avalie as entregas? (checklist 2, CTR1; experiencia.md §1)
- A leitura adotada de trecho ambíguo está registrada como premissa? (checklist 1)
- Dependência de terceiro tem prazo e responsável do outro lado? (checklist 8; Rework RW-004, observação do leitor)
- A data de início e o atraso na contratação estão tratados? (checklist 9)
- Premissa invalidada dispara revisão do escopo, do cronograma ou do custo? (Rework RW-003)

## Erros comuns
- Registrar só riscos e esquecer as premissas; registro parado depois da partida (Rework RW-004).
- Premissa sem origem, sem dono ou não testável ("o contratante colaborará") (Rework RW-004).
- Premissa inexata, instável ou incompleta sem risco correspondente (PMBOK 6, p. 415, PDF 451).
- Apagar a premissa invalidada em vez de encerrá-la com a situação (PMBOK 6, p. 97, PDF 133; Rework RW-004).
- "Pressupõe-se" ou "considera-se que" sem fonte (checklist 2).

## Quando dispensar a parte inteira
Nunca: o B3 nasce no 4.1 junto com o TAP, e o app o entrega na etapa 3. Em porte pequeno, basta uma lista simples, ou as linhas de premissas de um RAID junto com o B27 (Rework RW-004).
Linha para a tela: "Premissas numa lista simples ou no RAID: porte pequeno (Rework RW-004)."

## Ligações
- **Vem de:** TAP (TAP-PR) e proposta (premissas, exclusões); RFP (restrições); brechas da etapa 1 e checklist com destino "premissa"; na etapa 4, B8 e B4 (6.4, p. 204, PDF 240), B6 (7.2, p. 247, PDF 283), B26 (9.2, p. 327, PDF 363), B27 (11.2–11.5), B31 (13.1, p. 515, PDF 551: premissas sobre poder e interesse).
- **Vai para:** B27 (premissa sem base vira risco; p. 415, PDF 451); B4; B17 (5.3); monitoramento e encerramento (4.5, p. 108, PDF 144; 4.7, p. 124, PDF 160).

## Modelo de redação
```
| ID | Tipo | Descrição | Nível (alto nível/estimativa) | Origem (doc., p.) | Responsável | Validar até | Situação | Risco (B27) |
```
- Etapa 3: só o que vem da proposta, do TAP e da RFP, com página; rótulo `documento` se está escrito, `sugestao` se o PMO propõe.
- Etapa 4: acrescentar as das estimativas e dos riscos, com a origem ("B8, atividade X").
- Uma opção de frase: "Considera-se que [condição], conforme [doc., p.]. Se não se confirmar, [efeito] (ver R0n)." Prazos e responsáveis: a definir pelo GP.

## Fontes
- PMBOK 6: 4.1.3.2, p. 81 (PDF 117); 4.3, p. 97 (PDF 133); 4.5, p. 108 (PDF 144); 4.7, p. 124 (PDF 160); FAE, p. 38–39 (PDF 74–75); 6.4, p. 204 (PDF 240); 7.2, p. 247 (PDF 283); 9.2, p. 327 (PDF 363); 11.2, p. 415 (PDF 451); 13.1, p. 515 (PDF 551); glossário, p. 720, 721, 723 (PDF 756, 757, 759).
- PMBOK 7: registro de premissas, p. 185 (PDF 280); Padrão, princípio 5, p. 39 (PDF 66).
- Rework: RW-004 (link no item); RW-003 (https://resources.rework.com/libraries/project-management/project-scope-statement).
- Decisão 0007; `checklist.md` (1, 2, 3, 8, 9); `experiencia.md` §1 a §3 e §7; `licitacoes.md` 2.6 e 2.8.
