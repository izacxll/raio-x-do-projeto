# 0014 — Como as fontes da skill PMO são lidas

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (autorizado a decidir questões técnicas e de organização)

## Contexto

A skill PMO resume o PMBOK 6 e o PMBOK 7 (mais de 1.100 páginas), a biblioteca do Rework e a legislação de contratação pública. As fontes são grandes demais para uma conversa só, e o trabalho precisa poder ser retomado se o limite de uso acabar no meio.

## Decisão

- **PMBOK:**
  - O texto dos dois PDFs é extraído por código (pypdf) para `referencias/pmbok/texto/`, com a marcação da página do PDF.
  - Os leitores leem esse texto, e não as páginas como imagem: o custo cai a cerca de um quarto.
  - Tabelas e figuras que o texto embaralhar são conferidas no PDF, renderizado em PNG com o Poppler, ou reconstruídas pelo texto, com anotação.
- **Leitura em 13 partes**, por subagentes em três ondas. Cada parte gera notas estruturadas (processos, artefatos com conteúdo item a item, sinais no texto, adaptação, página impressa e do PDF) em `referencias/pmbok/notas/`.
- **Rework:**
  - um artigo por vez, sem rajadas, na ordem da especificação;
  - um resumo por artigo em `referencias/rework/RW-NNN-*.md`;
  - o índice `_indice.md` marca o que foi lido, o que falhou e o que falta;
  - se o site bloquear, a leitura para e a lista do que falta vai para a responsável pelo projeto.
- **Legislação:** texto compilado do Planalto, com a data da consulta, em `referencias/legislacao/notas-leis.md`.
- Tudo isso fica em `referencias/`, **fora do Git**. Na skill, que vai para o Git, entra só o resumo reorganizado, com a fonte de cada item.

## Consequências

- Retomar é simples: as notas e os índices mostram o que já foi feito.
- A tradução brasileira tem variações de nome (por exemplo, "declaração" e "especificação" do escopo; "EGP" para o PMO). As fichas registram os sinônimos para o mapa do PGP reconhecer as duas formas.
