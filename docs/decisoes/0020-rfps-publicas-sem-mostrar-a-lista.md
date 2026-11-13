# 0020 — RFPs públicas de teste entram no Git sem a lista ser mostrada antes

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto

## Contexto

A especificação (seção 11) pedia que a lista de RFPs públicas de teste fosse mostrada à responsável pelo projeto antes do commit.

## Decisão

- As RFPs públicas de teste podem ir para o Git **sem mostrar a lista antes**, desde que cada arquivo tenha **fonte (link) e data do download** no `README.md` de `tests/fixtures/rfps-publicas/`.
- Continua valendo: só documentos publicados oficialmente (portal de compras, diário oficial, site do órgão); nada privado; nenhuma referência ao caso da prova de conceito.
- Um teste (`tests/leitura/rfps-publicas.test.ts`) falha se algum PDF da pasta não aparecer no README.

## Consequências

- O `CLAUDE.md` deixa de exigir a lista antes do commit.
- O conjunto da F0 tem 8 RFPs (pregão, concorrência, chamamento, credenciamento, dispensa escaneada e um edital longo com anexos).
