---
codigo: B5
nome: Registro das mudanças
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: trabalho do projeto
sinonimos: ["registro de mudanças", "log de mudanças", "controle de solicitações de mudança", "histórico de mudanças", "registro de alterações", "change log"]
versao: 0.2.0
---

# B5 — Registro das mudanças

## Para que serve
"Uma lista abrangente das mudanças apresentadas durante o projeto e seu status atual" (PMBOK 6, glossário, p. 721, PDF 757). Guarda a decisão sobre cada solicitação, aprovada, adiada ou rejeitada (4.6, p. 120, PDF 156); o PMBOK 7 o lista entre os registros do projeto (Guia 4.6, p. 185, PDF 280). O formato vem do A11. Na etapa 4 entra como **modelo inicial**, sem inventar pedidos (decisão 0007, passo 12); por isso o código confere as colunas, não as linhas.

## Conteúdo mínimo
- **B5.1** Identificador único e data de cada solicitação
  - fonte: PMBOK 6, 4.6, p. 120 (PDF 156); Rework RW-028 (https://resources.rework.com/libraries/project-management/change-control-process)
  - sinais: "nº" | "ID" | "SM-01" | "CR-" | "data da solicitação" | colunas de número e data
  - confere: código
  - dispensa: nunca
- **B5.2** Quem pediu e descrição da mudança, com a justificativa
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132); Rework RW-028
  - sinais: "solicitante" | "descrição" | "justificativa" | "motivo"
  - confere: código
  - dispensa: nunca
- **B5.3** Tipo: ação corretiva, ação preventiva, reparo de defeito ou atualização; ou a dimensão afetada (escopo, prazo, custo)
  - fonte: PMBOK 6, 4.3, p. 96 (PDF 132); Rework RW-028
  - sinais: "tipo" | "categoria" | "corretiva" | "preventiva" | "escopo" | "prazo" | "custo"
  - confere: código
  - dispensa: porte pequeno
- **B5.4** Impacto estimado: prazo, custo, recursos e riscos (e escopo e qualidade, quando couber)
  - fonte: PMBOK 6, 4.6, p. 117 (PDF 153); PMBOK 7, Tab. 2-7, p. 79 (PDF 174)
  - sinais: "impacto" | "impacto no prazo" | "impacto no custo" | "dias" | "riscos"
  - confere: código
  - dispensa: nunca
- **B5.5** Decisão (aprovada, adiada ou rejeitada), data e quem decidiu
  - fonte: PMBOK 6, 4.6, p. 115 e 120 (PDF 151 e 156)
  - sinais: "decisão" | "aprovada" | "adiada" | "rejeitada" | "data da decisão" | "aprovado por"
  - confere: código
  - dispensa: nunca
- **B5.6** Status atual de cada solicitação (aberta, em análise, decidida, implementada, encerrada)
  - fonte: PMBOK 6, glossário, p. 721 (PDF 757); 4.3, p. 92 (PDF 128)
  - sinais: "status" | "situação" | "aberta" | "em análise" | "implementada" | "encerrada"
  - confere: código
  - dispensa: nunca
- **B5.7** Implementação: responsável, data e documentos ou linhas de base atualizados
  - fonte: PMBOK 6, 4.6, p. 117 e 120 (PDF 153 e 156); Rework RW-032 (https://resources.rework.com/libraries/project-management/integrated-change-control)
  - sinais: "responsável pela implementação" | "data de implementação" | "documentos atualizados" | "nova versão"
  - confere: código
  - dispensa: porte pequeno
- **B5.8** Efeito contratual: termo aditivo, apostila ou sem efeito no contrato, com o número do instrumento
  - fonte: licitacoes.md 2.7 (Lei 14.133, arts. 124 e 136); Rework RW-028, observação do leitor
  - sinais: "aditivo" | "termo aditivo nº" | "apostila" | "sem alteração contratual" | coluna de instrumento
  - confere: código
  - dispensa: contratante privado

## Perguntas de qualidade
- Os pedidos feitos em reunião ou por e-mail pelo contratante também entram, mesmo os "pequenos"? (PMBOK 6, p. 115, PDF 151; Rework RW-028, observação do leitor)
- Muitas mudanças de escopo cedo indicam escopo mal definido ou partes desalinhadas; o registro é revisto para achar esse padrão? (Rework RW-028; PMBOK 7, Tab. 2-2, p. 15, PDF 110)
- Rodada de revisão além do limite contratado aparece como mudança? (PC8)
- O registro conversa com o A11 (mesmos estados e alçadas) e com o B27 (risco criado pela mudança)? (Rework RW-032)

## Erros comuns
- Registrar só as aprovadas; rejeições e adiamentos somem e o pedido volta (PMBOK 6, p. 120, PDF 156; Rework RW-032).
- Misturar pedidos de mudança com questões: a questão é um problema já ocorrido e pode gerar um pedido, mas não é ele (Rework RW-028 e RW-032).
- Atualizar o registro em lote, semanas depois (Rework RW-032).
- Preencher o modelo da etapa 4 com mudanças fictícias (decisão 0007, passo 12; SKILL.md, princípio 2).

## Quando dispensar a parte inteira
Não se dispensa quando existe controle formal de mudanças (PMBOK 7, Tab. 2-6, p. 68, PDF 163: o registro prova que o processo é aplicado). Em porte pequeno, pode ser uma tabela curta dentro do A11 (B5.1, B5.2, B5.4, B5.5, B5.6 e, com contratante público, B5.8): o nível de controle acompanha o porte (PMBOK 6, p. 115, PDF 151). Não deve ser fundido com o registro das questões (Rework RW-032). Na parte adaptativa, o backlog cumpre esse papel (PMBOK 6, X3.3.4, p. 671, PDF 707).
Linha para a tela: "Registro das mudanças como tabela curta no plano de mudanças: porte pequeno (PMBOK 6, p. 115)."

## Ligações
- **Vem de:** 4.6, que o mantém (nunca é saída própria nos quadros; pmbok6.md, tabela); A11 (formato, estados, alçadas); solicitações saídas de 4.3, 4.5 e de quase todos os processos.
- **Vai para:** 4.3 (implementar as aprovadas); 4.7 (encerramento; Parte 2, pmbok6.md, tabela); 13.1, 13.2 e 13.3 (partes interessadas); 10.2; A13, A14 e A15 (linhas de base revistas); B10 (padrões de mudança viram lição).

## Modelo de redação
```
Nº | Data | Solicitante | Descrição e justificativa | Tipo | Impacto (prazo, custo, recursos, riscos) | Decisão | Data e decisor | Status | Implementação (responsável, data, documentos) | Instrumento contratual
Modelo inicial: sem linhas; preencher na execução. Estados e alçadas conforme o A11.
```

## Fontes
- PMBOK 6: 4.3, p. 92 e 96 (PDF 128 e 132); 4.6, p. 115–120 (PDF 151–156); X3.3.4, p. 671 (PDF 707); glossário, p. 721 (PDF 757).
- PMBOK 7: Tab. 2-2, p. 15 (PDF 110); Tab. 2-6, p. 68 (PDF 163); Tab. 2-7, p. 79 (PDF 174); Guia 4.6, p. 185 (PDF 280).
- Rework: RW-028 e RW-032 (links nos itens).
- `licitacoes.md` 2.7; `checklist.md` (PC8); decisão 0007.
