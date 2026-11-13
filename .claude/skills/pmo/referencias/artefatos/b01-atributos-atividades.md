---
codigo: B1
nome: Atributos das atividades
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: tempo
sinonimos: ["atributos das atividades", "atributos da atividade", "dicionário das atividades", "ficha das atividades", "detalhamento das atividades", "planilha de atividades"]
versao: 0.2.0
---

# B1 — Atributos das atividades

## Para que serve
Amplia a descrição de cada atividade da lista (B2) com os dados que o cronograma precisa: lógica, recursos, datas impostas, premissas e local (PMBOK 6, 6.2.3.2, p. 186, PDF 222; glossário, p. 700, PDF 736). Começa curto (ID, EAP, nome) e se completa em 6.3, 6.4 e 6.5. Junto com marcos, atividades e premissas, forma o mínimo dos dados do cronograma (B29; p. 220, PDF 256).

## Conteúdo mínimo
- **B1.1** Cada atividade tem identificador exclusivo, código da EAP e nome
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222)
  - sinais: "ID" | "código EAP" | numeração hierárquica (1.1.1) | coluna de nome da atividade
  - confere: código
  - dispensa: nunca
- **B1.2** Predecessoras e sucessoras de cada atividade, com o tipo de relação (TI, II, TT, IT)
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222); 6.3, p. 189–190 (PDF 225–226); Rework RW-027 (https://resources.rework.com/libraries/project-management/task-dependencies)
  - sinais: "predecessora" | "sucessora" | "TI" | "II" | "TT" | "IT" | "término para início"
  - confere: código
  - dispensa: nunca
- **B1.3** Antecipações e esperas com valor, registradas na relação e fora da duração
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222); 6.3, p. 192–193 (PDF 228–229)
  - sinais: "antecipação" | "espera" | "TI + " | "II + " | "lag" | "± dias"
  - confere: código
  - dispensa: porte pequeno
- **B1.4** Categoria da dependência (obrigatória ou arbitrada, externa ou interna), com o motivo das arbitradas
  - fonte: PMBOK 6, 6.3, p. 191–192 (PDF 227–228); Rework RW-027
  - sinais: "obrigatória" | "arbitrada" | "preferencial" | "externa" | "interna" | "a cargo do contratante"
  - confere: código
  - dispensa: porte pequeno
- **B1.5** Duração estimada de cada atividade, trazida das estimativas (B8)
  - fonte: PMBOK 6, 6.4, p. 204 (PDF 240)
  - sinais: "duração" | "dias úteis" | "semanas" | coluna de duração por linha
  - confere: código
  - dispensa: nunca
- **B1.6** Requisitos de recursos ou responsável (papel) por atividade
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222); 6.5, p. 221 (PDF 257); Rework RW-038 (https://resources.rework.com/libraries/project-management/work-package)
  - sinais: "responsável" | "recurso" | "perfil" | "equipe" | coluna de papel
  - confere: código
  - dispensa: porte pequeno
- **B1.7** Datas impostas e restrições (prazo contratual, data fixa de evento, janela do contratante)
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222); 6.5, p. 210 (PDF 246); experiencia.md §2
  - sinais: "data imposta" | "não depois de" | "prazo contratual" | "data fixa" | "restrição"
  - confere: código
  - dispensa: nunca
- **B1.8** Premissas da atividade, ligadas ao registro de premissas (B3)
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222); 6.4, p. 204 (PDF 240)
  - sinais: "premissa" | "pressupõe-se" | "considera-se" | código da premissa (P01)
  - confere: código
  - dispensa: porte pequeno
- **B1.9** Local de execução e calendário designado, quando há trabalho em campo ou regimes de trabalho diferentes
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222); 6.5, p. 220 (PDF 256)
  - sinais: "local" | "município" | "território" | "campo" | "calendário" | "turno"
  - confere: código
  - dispensa: sem campo
- **B1.10** Tipo de esforço: atividade que encurta com mais gente, de duração fixa ou de nível de esforço (gestão, apoio)
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222); 6.4, p. 196 (PDF 232); PMBOK 7, 2.4.2.3, p. 62 (PDF 157)
  - sinais: "duração fixa" | "nível de esforço" | "esforço" | "contínua" | "ao longo do projeto"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **B1.11** Atributos completos antes da linha de base: nenhuma atividade só com ID e nome quando o cronograma for aprovado
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222); 6.5, p. 207 (PDF 243)
  - sinais: células vazias de predecessora, duração ou responsável; "a definir"
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Toda dependência arbitrada tem motivo escrito? Ela cria folga arbitrária e precisa ser revista se houver paralelismo (PMBOK 6, p. 191, PDF 227).
- As atividades que dependem do contratante estão marcadas como externas e ligadas a uma premissa com prazo? (PC1; Rework RW-027, observação do leitor)
- As datas impostas batem com os prazos da RFP e os marcos do TAP? O conflito aparece como folga negativa no cálculo do código (PC4).
- Se há campo: o local e o calendário de cada atividade refletem deslocamento e sazonalidade?
- O responsável é um papel único por atividade, e não "equipe"? (Rework RW-038)

## Erros comuns
- Usar dependência para representar falta de recurso; isso se resolve no nivelamento (Rework RW-027).
- Pôr TI em tudo quando II ou TT descreve melhor o trabalho, alongando o cronograma (Rework RW-027).
- Embutir espera na duração (por exemplo, prazo de análise somado à redação); a análise do contratante é atividade própria (PMBOK 6, p. 203, PDF 239; PC3).
- Premissa só na cabeça de quem montou o cronograma (PMBOK 6, p. 197, PDF 233).

## Quando dispensar a parte inteira
Em porte pequeno, os atributos podem ficar como colunas do próprio cronograma (B15): ID, EAP, nome, predecessoras, duração, responsável e premissas. O PMBOK prevê fazer 6.2 a 6.5 como um só processo em projeto pequeno (p. 175, PDF 211) e começar os atributos só com ID, EAP e nome (p. 186, PDF 222).
Linha para a tela: "Atributos como colunas do cronograma: porte pequeno (PMBOK 6, p. 175 e 186)."

## Ligações
- **Vem de:** 6.2, a partir de B2 e da linha de base do escopo (A13); completado em 6.3 (lógica), 6.4 (durações, B8 e B4) e 6.5 (recursos).
- **Vai para:** 6.3, 6.4, 6.5 e 9.2; B16 (lógica), B15 (colunas), B29 (dados mínimos); B3 (premissas).
- **Irmãos:** B2 (o que é cada atividade), B11 (marcos), B13 (calendários), B26 (recursos).

## Modelo de redação
```
Atributos das atividades — versão [n]
Tabela: ID | EAP | Atividade | Predecessoras (tipo ± antecipação/espera) | Categoria da dependência
        | Duração (do B8) | Responsável (papel) | Local | Calendário | Data imposta | Premissas (B3)
Dependências arbitradas: [motivo de cada uma].
Dependências externas: [de quem; prazo prometido ou a definir pelo GP].
Datas impostas: [cláusula da RFP, página].
```

## Fontes
- PMBOK 6: 6.2.3.2, p. 186 (PDF 222); 6.3, p. 189–193 (PDF 225–229); 6.4, p. 196–197, 203–204 (PDF 232–233, 239–240); 6.5, p. 207, 210, 220–221 (PDF 243, 246, 256–257); p. 175 (PDF 211); glossário, p. 700 (PDF 736).
- PMBOK 7: 2.4.2.3, p. 62 (PDF 157).
- Rework: RW-027, RW-038 (links nos itens).
- `checklist.md` (PC1, PC3, PC4); `experiencia.md` §2.
