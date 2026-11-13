# 0016 — Códigos dos itens das fichas e pendências do vocabulário de dispensa

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (detalha as decisões 0013 e 0015)

## Contexto

Durante a escrita das 61 fichas da skill PMO, apareceram três casos que o modelo de ficha não cobria.

## Decisão

1. **Códigos dos itens do conteúdo mínimo:**
   - Componentes e documentos do PGP: `A7.1`, `B27.3`.
   - TAP: a ficha tem uma seção por elemento (`TAP.1` … `TAP.12`), e os itens de cada elemento levam o número do elemento, como `TAP1.1` e `TAP9.4`. As premissas e restrições de alto nível que o livro manda o TAP incorporar ficam num bloco à parte, `TAP-PR.1`, para não virar um 13º elemento.
   - Proposta: `PROP-SOW.1`, `PROP-PRECO.3`.
   - O leitor de fichas da F5 aceita os três formatos.
2. **Identificador de risco no registro (B27):** é sugerido como `RK01`, para não se confundir com os requisitos da RFP (`R01`).
3. **O vocabulário de dispensa fica como está nesta versão.** Características que só a proposta usa (tem pontuação técnica, modelo obrigatório no edital, chamamento público) ainda não estão na tabela do `_modelo.md`. Por enquanto, os itens da proposta usam `dispensa: nunca` e explicam a condição no texto. A ampliação da tabela fica para a F2, junto com o schema da etapa 2.

## Consequências

- A conferência das fichas por script aceita os três formatos de código. O TAP é verificado por elemento, e não por uma seção única de conteúdo mínimo.
- Na F5, a tela do mapa do PGP pede as características da tabela; na F2, entram as características da proposta.
