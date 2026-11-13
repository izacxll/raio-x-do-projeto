# 0006 — Ficha do TAP num arquivo só, com 12 seções

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto

## Contexto

A skill PMO tem uma ficha por artefato em `.claude/skills/pmo/referencias/artefatos/`. Os 12 elementos do TAP (Anexo C) poderiam ser 12 arquivos ou um.

## Decisão

O TAP tem **uma ficha só** (`artefatos/tap.md`), com os 12 elementos como seções. Cada seção segue o modelo das demais fichas: para que serve, conteúdo mínimo, perguntas de qualidade, erros comuns, quando dispensar e fontes. O conteúdo mínimo segue o formato da decisão 0013, com itens numerados TAP.1, TAP.2…

Os 18 componentes do PGP, os 33 documentos do projeto e as partes da proposta continuam com um arquivo por artefato.

## Consequências

A etapa 3 carrega um arquivo único da skill, o que simplifica a montagem da chamada e o cache.
