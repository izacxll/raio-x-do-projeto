# 0049 — Leituras gravadas externas

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (16/11/2026)

## Contexto

A responsável testou a skill PMO 0.2.0 nas cinco etapas fora do app, no claude.ai, com o edital público da SMPED e com um TR municipal de contratação direta (estudo de impacto de evento). As saídas foram feitas pelo Claude seguindo a skill, não por uma pessoa. O TR traz nomes de servidores e um CPF na assinatura digital.

## Decisão

1. **Saídas de outro Claude são "leitura gravada externa"**, nunca gabarito humano: servem de evidência de onde a skill falha ou fica rasa. Quando entram num placar, ficam numa coluna separada do gabarito.
2. **Ficam fora do Git**, em `referencias/estudos-externos/<caso>/`: as saídas, os JSONs, o pedido de melhorias e o documento original. O TR não vai para `tests/fixtures/rfps-publicas/`, mesmo publicado, por ter nomes e CPF.
3. **No Git, o caso aparece só como "TR municipal de contratação direta (estudo de impacto de evento)"**, sem o nome da cidade, do evento ou de pessoas, e sem trechos literais que o identifiquem numa busca; datas do caso também ficam de fora.
4. **Testes com o documento fora do Git** rodam só na máquina da responsável e são pulados quando o arquivo não existe.

## Consequências

- Antes de mexer, o histórico do Git foi conferido: nenhum desses arquivos nem os nomes, o CPF ou a cidade aparecem em commit algum.
- Os pedidos das etapas para repetir o teste no claude.ai também ficam fora do Git, porque levam o texto do documento.
