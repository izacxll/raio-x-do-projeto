---
codigo: B13
nome: Calendários do projeto
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: tempo
sinonimos: ["calendário do projeto", "calendário de trabalho", "calendário", "dias úteis", "jornada de trabalho", "calendário de campo"]
versao: 0.1.0
---

# B13 — Calendários do projeto

## Para que serve
O calendário do projeto "identifica os dias úteis e os turnos disponíveis para as atividades programadas" (PMBOK 6, 6.5.3.4, p. 220, PDF 256). Separa períodos de trabalho dos indisponíveis, pode haver mais de um e pode ser atualizado. Sem ele, o código não converte durações em datas. Não é o calendário dos recursos (B25), que diz quando cada pessoa está disponível (p. 199, PDF 235).

## Conteúdo mínimo
- **B13.1** Dias e períodos de trabalho do projeto (semana de trabalho)
  - fonte: PMBOK 6, 6.5.3.4, p. 220 (PDF 256); glossário, p. 701 (PDF 737); PMBOK 7, artefatos, p. 192 (PDF 287)
  - sinais: "dias úteis" | "segunda a sexta" | "semana de trabalho" | "calendário do projeto"
  - confere: código
  - dispensa: nunca
- **B13.2** Períodos indisponíveis para trabalho declarados (feriados, recessos, pausas)
  - fonte: PMBOK 6, 6.5.3.4, p. 220 (PDF 256). O livro fala em períodos indisponíveis sem listá-los; feriado e recesso são sinais práticos, não do PMBOK.
  - sinais: "feriado" | "feriados" | "recesso" | "ponto facultativo" | "períodos indisponíveis"
  - confere: código
  - dispensa: nunca
- **B13.3** Forma de contagem (dias úteis ou corridos) igual à do contrato
  - fonte: PMBOK 6, 6.1.3.1, p. 182 (PDF 218) (unidades de medida); `licitacoes.md` 2.3 (contagem do documento)
  - sinais: "dias úteis" | "dias corridos" | "conforme o contrato" | "conforme o edital"
  - confere: código
  - dispensa: nunca
- **B13.4** Mais de um calendário quando os regimes de trabalho diferem (equipe de campo, equipe do contratante)
  - fonte: PMBOK 6, 6.5.3.4, p. 220 (PDF 256)
  - sinais: "calendário de campo" | "calendário do contratante" | "calendários" no plural | regimes diferentes descritos
  - confere: código
  - dispensa: porte pequeno e sem campo
- **B13.5** Indicação de qual calendário cada atividade usa
  - fonte: PMBOK 6, 6.2.3.2, p. 186 (PDF 222) (atributo "calendário designado")
  - sinais: coluna "calendário" na lista de atividades | "usa o calendário de"
  - confere: código
  - dispensa: porte pequeno
- **B13.6** Turnos ou jornada, quando o trabalho tem horários próprios (campo, eventos, atendimento)
  - fonte: PMBOK 6, 6.5.3.4, p. 220 (PDF 256)
  - sinais: "turno" | "jornada" | "horário" | "fim de semana" | "noturno"
  - confere: código
  - dispensa: porte pequeno ou sem campo
- **B13.7** Sazonalidade que afeta o campo (chuva, calendário escolar, safra) refletida em períodos indisponíveis ou restritos
  - fonte: checklist 11 (TC21; "calendário com sazonalidade"); experiencia.md §5
  - sinais: "período chuvoso" | "sazonalidade" | "calendário escolar" | "safra" | "férias escolares"
  - confere: código
  - dispensa: sem campo
- **B13.8** Calendário administrativo e político do contratante (eleição, troca de gestão, encerramento do exercício) considerado
  - fonte: checklist 7 e 9 (CE16, CE17); experiencia.md §1
  - sinais: "eleição" | "período eleitoral" | "troca de gestão" | "fim do exercício" | "recesso do órgão"
  - confere: só PMO
  - dispensa: contratante privado
- **B13.9** Coerência com os calendários dos recursos (B25) e regra de atualização
  - fonte: PMBOK 6, 6.4, p. 199 (PDF 235); 6.5.3.4, p. 220 (PDF 256); 6.6, p. 225 (PDF 261)
  - sinais: "calendário dos recursos" | "disponibilidade" | "férias da equipe" | "atualizado"
  - confere: só PMO
  - dispensa: porte pequeno

## Perguntas de qualidade
- A contagem de dias do calendário é a mesma do contrato? Se o contrato fala em dias corridos e o plano em úteis, há conflito (checklist 1).
- O período de execução cruza eleição ou troca de gestão do nível do contratante? O calendário e o B27 registram isso? (checklist 9)
- Há períodos em que o contratante não analisa nem decide (recesso, fim de exercício)? (checklist 7)
- Se há campo: chuva, calendário escolar ou outras sazonalidades estão no calendário? (checklist 11)
- As durações em dias úteis foram convertidas em datas por este calendário, e não por outro? (a conversão é do código)

## Erros comuns
- Calendário único para equipes com regimes diferentes (PMBOK 6, p. 220, PDF 256).
- Contagem do plano diferente da do contrato (checklist 1; `licitacoes.md` 2.3).
- Sazonalidade de campo fora do calendário (checklist 11; experiencia.md §5).
- Confundir calendário do projeto com o dos recursos (PMBOK 6, p. 199 e 220, PDF 235 e 256).
- Calendário político ignorado quando a decisão depende da gestão em exercício (experiencia.md §1).

## Quando dispensar a parte inteira
Como documento à parte, dispensável em porte pequeno e sem campo: uma linha no A3 basta ("dias úteis, segunda a sexta, feriados nacionais e locais"; feriados locais a definir pelo GP). Com campo ou várias frentes em regimes diferentes, recomenda-se.
Linha para a tela: "Calendário numa linha do plano do cronograma: porte pequeno e sem campo (PMBOK 6, p. 220)."

## Ligações
- **Vem de:** 6.5 (saída), usando APO de 6.4 e 6.5 (p. 199 e 209, PDF 235 e 245); A3 (unidades); contrato (contagem); B25.
- **Vai para:** 6.6 (previsões; p. 225, PDF 261); B15 e A14 (conversão de durações em datas); B1 (calendário de cada atividade); B27 (calendário político, sazonalidade).

## Modelo de redação
```
Calendário principal: [dias de trabalho]; contagem em [dias úteis/corridos], conforme [cláusula, página].
Períodos indisponíveis: feriados [nacionais; locais a definir pelo GP]; recessos [a definir pelo GP].
Calendário de campo (se houver): [dias, turnos]; sazonalidade [período, local — a confirmar].
Calendário do contratante: períodos sem análise ou decisão [a confirmar com o contratante];
eleição ou troca de gestão no período: [sim/não; datas a conferir pelo GP].
```

## Fontes
- PMBOK 6: 6.1.3.1, p. 182 (PDF 218); 6.2.3.2, p. 186 (PDF 222); 6.4, p. 199 (PDF 235); 6.5, p. 209 e 220 (PDF 245 e 256); 6.6, p. 225 (PDF 261); glossário, p. 701 (PDF 737).
- PMBOK 7: artefatos, calendário do projeto, p. 192 (PDF 287).
- `checklist.md` (1, 7, 9, 11); `experiencia.md` §1 e §5; `licitacoes.md` 2.3.
