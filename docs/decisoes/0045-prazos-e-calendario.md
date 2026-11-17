# 0045 — Prazos e calendário: referências de início, janela até marco fixo, campo em dias corridos

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (ok de 16/11/2026); Claude Code (a redação)

## Contexto

No TR municipal de contratação direta (estudo de impacto de evento):

- o início era uma data fixa, mas a vigência de 6 meses contava da divulgação no PNCP;
- a pesquisa de campo ficava presa a um evento de cerca de dois meses, e entre o início e o evento havia cerca de 35 dias úteis. As estimativas da própria proposta para chegar à metodologia aprovada davam 33 no mais provável e 48 no pessimista, antes da análise do contratante, e ninguém comparou;
- "repassar à Secretaria no prazo de 30 dias" não dizia de quando: "em até 30 dias" ou "com 30 dias de antecedência";
- o plano contou o campo, que acontece em noites, fins de semana e feriados, em dias úteis;
- a premissa que tirava os gastos de um evento da pesquisa do outro mudou a dependência de um produto, mas o cronograma não mudou a predecessora.

## Decisão

1. **Mais de uma referência de início** (data fixa, ordem de serviço, assinatura, publicação): o plano diz qual conta para quê (prazos dos produtos, vigência, marcos). Ficha A3, item A3.13.
2. **Marco externo fixo** (evento, safra, ano letivo, eleição): é restrição de data. O código conta os dias úteis entre o início e o marco e compara com o caminho das estimativas até as atividades que precisam acabar antes dele. O PMO não diz "o prazo é curto": ele aponta o marco e as atividades presas a ele (PROP-EAP.11, A3.13).
3. **Prazo sem termo inicial** ("no prazo de N dias" sem dizer de quando) é `vago` com duas leituras; vira pergunta na etapa 1.
4. **Campo em noites, fins de semana e feriados** usa calendário próprio, em dias corridos e turnos (B13.4 e B13.6). B13.6 deixa de ser dispensável por porte pequeno.
5. **Premissa que muda a origem de um dado muda a predecessora** da atividade que usa o dado (PROP-EAP.12).
6. **Exemplo na PC4** do `checklist.md` (janela antes de marco externo fixo), só como exemplo, sem mudar a premissa.

## Consequências

- Fichas `a03`, `b13`, `prop-eap-cronograma`; `checklist.md` (PC4, exemplo); métodos das etapas 1, 2 e 4.
- Código: a conta da janela e o sinal de prazo sem termo inicial no esqueleto da etapa 1 (decisão 0048).
- A prorrogação automática do contrato de escopo (art. 111 da Lei 14.133) já está em `licitacoes.md` 2.7. O A11.12 lembra que apostila só cabe nas hipóteses do contrato e que a prorrogação de vigência é por aditivo ou pelo art. 111, sempre pedindo conferência do jurídico.
