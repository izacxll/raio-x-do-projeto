---
codigo: B16
nome: Diagrama de rede do cronograma do projeto
tipo: documento do projeto
etapas: [2, 4, 5]
gravidade: baixa
categoria: tempo
sinonimos: ["diagrama de rede", "rede do cronograma", "diagrama de precedência", "rede PERT", "diagrama PERT", "rede de atividades", "tabela de predecessoras", "matriz de dependências"]
versao: 0.2.0
---

# B16 — Diagrama de rede do cronograma do projeto

## Para que serve
É "uma representação gráfica das relações lógicas, também chamadas de dependências, entre as atividades do cronograma do projeto" (PMBOK 6, 6.3.3.1, p. 194, PDF 230). Sai do sequenciamento (6.3) e alimenta o cálculo do cronograma (6.5). Mostra o porquê da sequência; o Gantt mostra o quando (Rework RW-055). Pode ser figura ou tabela de predecessoras. O código monta a rede e calcula datas e folgas; o PMO escreve a lógica.

## Conteúdo mínimo
- **B16.1** Todas as atividades da lista (B2) aparecem na rede, cada uma com identificador
  - fonte: PMBOK 6, 6.3, p. 189 (PDF 225); Rework RW-055 (https://resources.rework.com/libraries/project-management/network-diagram)
  - sinais: nós ou linhas com ID (A, B, 1.1.1) | "atividade" | tabela com ID e nome
  - confere: código
  - dispensa: nunca
- **B16.2** Toda atividade tem ao menos uma predecessora e uma sucessora, exceto o início e o fim
  - fonte: PMBOK 6, 6.3, p. 188 (PDF 224); 6.3.3.1, p. 194 (PDF 230)
  - sinais: "predecessora" | "sucessora" | "Início" | "Fim" | coluna de predecessoras preenchida
  - confere: código
  - dispensa: nunca
- **B16.3** Sem ciclos e sem duas relações no mesmo par de atividades
  - fonte: PMBOK 6, 6.3, p. 190 (PDF 226); Rework RW-051 (https://resources.rework.com/libraries/project-management/what-is-a-pert-chart)
  - sinais: estrutura: a tabela de predecessoras não forma laço (verificação do código)
  - confere: código
  - dispensa: nunca
- **B16.4** Marcos como nós de duração zero
  - fonte: PMBOK 6, 6.2, p. 186 (PDF 222)
  - sinais: "marco" | "duração 0" | "0 dias" | losango
  - confere: código
  - dispensa: nunca
- **B16.5** Tempos de análise e aprovação do contratante na rede, como atividades com duração e não como espera
  - fonte: PMBOK 6, 6.3, p. 193 (PDF 229) (antecipações e esperas não substituem a lógica); `checklist.md` PC3; Rework RW-052 (https://resources.rework.com/libraries/project-management/critical-path-method)
  - sinais: "análise do contratante" | "aprovação" | "validação" | "parecer" como atividade com ID
  - confere: código
  - dispensa: nunca
- **B16.6** Dependências externas identificadas como tal (dados, agendas, autorizações de terceiros)
  - fonte: PMBOK 6, 6.3, p. 191–192 (PDF 227–228); `checklist.md` (PC1 e PC6); Rework RW-027 (https://resources.rework.com/libraries/project-management/task-dependencies)
  - sinais: "externa" | "dependência externa" | "a cargo do contratante" | "recebimento" | "disponibilização"
  - confere: código
  - dispensa: nunca
- **B16.7** Tipo de relação em cada vínculo (TI, II, TT, IT) e antecipação ou espera em dias, quando houver
  - fonte: PMBOK 6, 6.3, p. 189–193 (PDF 225–229); Rework RW-027
  - sinais: "TI" | "II" | "TT" | "IT" | "término para início" | "+ dias" | "− dias"
  - confere: código
  - dispensa: porte pequeno
- **B16.8** Dependências arbitradas documentadas, com o motivo
  - fonte: PMBOK 6, 6.3, p. 191 (PDF 227); Rework RW-027
  - sinais: "arbitrada" | "preferencial" | "por opção" | "obrigatória" | justificativa ao lado do vínculo
  - confere: só PMO
  - dispensa: porte pequeno
- **B16.9** Pontos de convergência e divergência apontados, por terem mais risco
  - fonte: PMBOK 6, 6.3.3.1, p. 194 (PDF 230); 6.5, p. 209 (PDF 245); Rework RW-055
  - sinais: "convergência" | "divergência" | atividade com várias predecessoras destacada
  - confere: só PMO
  - dispensa: porte pequeno
- **B16.10** Resumo da abordagem de sequenciamento, com as sequências incomuns descritas
  - fonte: PMBOK 6, 6.3.3.1, p. 194 (PDF 230)
  - sinais: "sequenciamento" | "lógica" | "em paralelo" | texto que explica a ordem das frentes
  - confere: só PMO
  - dispensa: porte pequeno
- **B16.11** Caminho crítico destacado, quando a rede traz datas
  - fonte: PMBOK 6, 6.5.3.2, p. 218 (PDF 254); Rework RW-052 e RW-056 (https://resources.rework.com/libraries/project-management/float-and-slack)
  - sinais: "caminho crítico" | "folga" | "folga zero" | nós destacados
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- Alguma atividade ficou solta (sem entrada ou sem saída)? O código acusa; o PMO procura a causa (PMBOK 6, p. 188, PDF 224).
- A análise do contratante está modelada como atividade, ou escondida como espera? (PC3)
- Cada dependência de terceiro tem um responsável do outro lado e um prazo? (PC1 e PC6)
- As frentes paralelas convergem num produto consolidado? Essa convergência está apontada? (Rework RW-055, observação do leitor)
- Há relações II ou TT que permitiriam sobrepor produtos sem violar a sequência de aceite do edital? (Rework RW-055)

## Erros comuns
- Desenhar a rede depois do cronograma, como enfeite (Rework RW-055).
- Usar espera no lugar de atividade, ou embutir esperas nas durações (PMBOK 6, p. 193 e 203, PDF 229 e 239).
- Usar dependência para representar falta de recurso; isso é nivelamento (Rework RW-027).
- Ignorar dependências externas (Rework RW-027; PC1 e PC6).
- Dependência circular, sinal de erro de planejamento (Rework RW-051).

## Quando dispensar a parte inteira
Como documento à parte, dispensável em porte pequeno: basta a coluna de predecessoras no B15, que o código lê como rede. Em porte médio ou grande, ou com várias frentes, recomenda-se a rede ou a tabela de predecessoras completa.
Linha para a tela: "Rede como coluna de predecessoras no cronograma: porte pequeno (PMBOK 6, p. 175 e 194)."

## Ligações
- **Vem de:** 6.3, com B2, B1, B11 e B3 (p. 188–189, PDF 224–225); A3 (método); A13.
- **Vai para:** 6.5 (cálculo de datas, caminho crítico e folgas); B15; A14; B29. Novas redes podem nascer em 6.6 (p. 230, PDF 266).
- Riscos de convergência e de dependência externa vão para o B27.

## Modelo de redação
```
Abordagem de sequenciamento: [resumo; frentes em paralelo; onde convergem].
Tabela: ID | Atividade | Predecessoras (tipo, ± dias) | Externa? (de quem) | Arbitrada? (motivo)
Atividades do contratante: análise do produto [n], prazo [do contrato ou a definir pelo GP].
Marcos: ID | Nome | Duração 0.
Caminho crítico e folgas: calculados pelo código.
```

## Fontes
- PMBOK 6: 6.2, p. 186 (PDF 222); 6.3, p. 188–194 (PDF 224–230); 6.4, p. 203 (PDF 239); 6.5, p. 209 e 218 (PDF 245 e 254); 6.6, p. 230 (PDF 266); glossário, p. 706 (PDF 742).
- PMBOK 7: 2.4.2.3, p. 59–60 (PDF 154–155); artefatos, p. 189 (PDF 284).
- Rework: RW-027, RW-051, RW-052, RW-055, RW-056 (links nos itens).
- `checklist.md` (PC1, PC3, PC6).
