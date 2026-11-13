---
codigo: B11
nome: Lista de marcos
tipo: documento do projeto
etapas: [3, 4, 5]
gravidade: média
categoria: tempo
sinonimos: ["marcos", "marcos do projeto", "cronograma de marcos", "gráfico de marcos", "marcos contratuais", "cronograma de entregas", "datas-chave"]
versao: 0.2.0
---

# B11 — Lista de marcos

## Para que serve
Identifica todos os marcos do projeto; marco é "um ponto ou evento significativo no projeto" (PMBOK 6, 6.2.3.3, p. 186, PDF 222), com duração zero e marcado como obrigatório ou opcional. Detalha o resumo de marcos do TAP (TAP.6) e é a visão do cronograma para patrocinador e contratante (Rework RW-025). Nos contratos públicos, os marcos naturais são a entrega e o aceite de cada produto.

## Conteúdo mínimo
- **B11.1** Lista com todos os marcos, cada um com identificador e nome
  - fonte: PMBOK 6, 6.2.3.3, p. 186 (PDF 222)
  - sinais: "marco" | "M1" | "marcos" | tabela de marcos | losangos
  - confere: código
  - dispensa: nunca
- **B11.2** Cada marco tem duração zero
  - fonte: PMBOK 6, 6.2.3.3, p. 186 (PDF 222); Rework RW-025 (https://resources.rework.com/libraries/project-management/milestone-chart)
  - sinais: "duração 0" | "0 dias" | marco sem duração | losango
  - confere: código
  - dispensa: nunca
- **B11.3** Cada marco indicado como obrigatório (contratual, legal) ou opcional
  - fonte: PMBOK 6, 6.2.3.3, p. 186 (PDF 222)
  - sinais: "obrigatório" | "contratual" | "opcional" | "interno" | coluna de tipo
  - confere: código
  - dispensa: nunca
- **B11.4** Cada marco tem data ou prazo contado de um evento definido
  - fonte: PMBOK 6, 6.2.3.3, p. 186 (PDF 222); 6.3, p. 188 (PDF 224); `checklist.md` PC4
  - sinais: datas | "D+" | "dias após" | "a partir da ordem de serviço" | "mês"
  - confere: código
  - dispensa: nunca
- **B11.5** Marcos coerentes com os prazos da RFP e com os marcos do TAP (a comparação é do código)
  - fonte: PMBOK 6, 6.1, p. 180 (PDF 216); ficha `tap`, TAP6.2; experiencia.md §2
  - sinais: "conforme o termo de referência" | "prazo contratual" | mesmos nomes e prazos do TAP
  - confere: código
  - dispensa: nunca
- **B11.6** Entrega do produto e aprovação pelo contratante como marcos distintos
  - fonte: Rework RW-025 (observação do leitor); `checklist.md` PC3; experiencia.md §1
  - sinais: "entrega do produto" e "aprovação do produto" | "aceite" | "recebimento definitivo"
  - confere: código
  - dispensa: nunca
- **B11.7** Marcos de dependência externa (ordem de serviço, recebimento de dados, autorizações)
  - fonte: PMBOK 6, 6.3, p. 191–192 (PDF 227–228); `checklist.md` (PC1 e PC6); experiencia.md §3
  - sinais: "ordem de serviço" | "recebimento dos dados" | "disponibilização" | "autorização"
  - confere: código
  - dispensa: nunca
- **B11.8** Cada marco formulado como resultado concluído e verificável (cumprido ou não), não como atividade
  - fonte: Rework RW-025; PMBOK 6, 6.2.3.3, p. 186 (PDF 222)
  - sinais: "aprovado" | "entregue" | "concluído" | "assinado"; rótulo como "Fase 2" ou verbo no infinitivo indica falha
  - confere: só PMO
  - dispensa: nunca
- **B11.9** Cada marco ligado a uma entrega da EAP
  - fonte: Rework RW-025; PMBOK 6, 6.5.3.2, Fig. 6-21, p. 219 (PDF 255)
  - sinais: código da EAP ao lado do marco | "produto" | "entrega"
  - confere: código
  - dispensa: porte pequeno
- **B11.10** Marcos que disparam pagamento identificados
  - fonte: experiencia.md §1 (pagamento por produto); `checklist.md` PC3; Rework RW-025 (observação do leitor)
  - sinais: "pagamento" | "parcela" | "desembolso" | "% do valor" | cronograma físico-financeiro
  - confere: código
  - dispensa: pagamento de outra forma
- **B11.11** Um responsável por marco
  - fonte: Rework RW-025
  - sinais: "responsável" | coluna de papel | nome ou papel por marco
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- Algum marco está sem data, ou contado de evento sem data? O PMO aponta; a conta é do código (PC4).
- O aceite tem prazo do lado do contratante, e esse prazo separa "entregue" de "aprovado"? (PC3)
- Os prazos estão todos contados do mesmo ponto, ou há marco preso a data fixa e outros contados da etapa anterior? (experiencia.md §2)
- Algum marco cai em período eleitoral ou de troca de gestão do contratante? (PC5)
- A quantidade de marcos é legível para o patrocinador? (Rework RW-025)

## Erros comuns
- Tratar tarefa como marco, com duração (Rework RW-025; PMBOK 6, p. 186, PDF 222).
- Nomes vagos como "Fase 2" (Rework RW-025).
- Fundir entrega e aprovação, o que esconde o tempo do contratante (Rework RW-025, observação do leitor; experiencia.md §1).
- Marcos do plano diferentes dos do TAP ou do contrato, sem explicação (experiencia.md §2).
- Lista parada, sem atualização a cada ciclo de status (Rework RW-025).

## Quando dispensar a parte inteira
Não se dispensa como conteúdo. Em porte pequeno, a lista pode ficar dentro do B15 (linhas de marco com duração zero), sem documento à parte.
Linha para a tela: "Marcos dentro do cronograma: porte pequeno (PMBOK 6, p. 186 e 217)."

## Ligações
- **Vem de:** 6.2 (p. 186, PDF 222); TAP.6 (resumo de marcos); prazos da RFP; cronograma da proposta.
- **Vai para:** 6.3, 6.4, 6.5, 11.4 e 12.1; 4.3 e 4.5; B15 (gráfico de marcos); A14; A4 e B6 (desembolso); B14 e A7 (relatórios ao contratante). Atualizada em 6.3 e 12.1.
- Requisitos que listam produtos e prazos caem aqui (um marco por entrega e outro por aprovação).

## Modelo de redação
```
Tabela: ID | Marco (resultado concluído) | Tipo (contratual/interno) | Entrega da EAP |
        Data ou prazo (evento de referência) | Responsável | Dispara pagamento? | Fonte (RFP pág. / TAP)
Para cada produto: "Produto [n] entregue" e "Produto [n] aprovado pelo contratante".
Prazos que o documento não traz: "não informado no documento — a definir pelo GP".
```

## Fontes
- PMBOK 6: 6.1, p. 180 (PDF 216); 6.2.3.3, p. 186 (PDF 222); 6.3, p. 188–192 (PDF 224–228); 6.5.3.2, p. 217–219 (PDF 253–255); glossário, marco, p. 715 (PDF 751).
- PMBOK 7: artefatos, cronograma de marcos e roadmap, p. 184 e 188 (PDF 279 e 283).
- Rework: RW-025 (link nos itens).
- Ficha `tap` (TAP.6); `checklist.md` (PC1, PC3, PC4, PC5, PC6); `experiencia.md` §1, §2 e §3.
