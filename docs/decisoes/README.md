# Decisões

Uma decisão por arquivo, numerada em ordem. Cada uma registra o contexto, o que foi decidido, as consequências e quem decidiu. Decisão substituída não é apagada: ganha o status "substituída por NNNN".

| Nº | Decisão | Status |
|---|---|---|
| [0001](0001-stack.md) | Stack: TypeScript + React + Vite, estática no GitHub Pages | aceita |
| [0002](0002-modelo-padrao.md) | Modelo da API: Opus 5.5 provisório, escolha final na F2 | provisória |
| [0003](0003-chave-da-api.md) | Chave só em `sessionStorage`; "lembrar neste navegador" desativado | aceita |
| [0004](0004-padrao-de-nomes.md) | Padrão de nomes no código | aceita |
| [0005](0005-branches-versoes-e-tags.md) | Branches, versões e tags por fase | aceita |
| [0006](0006-ficha-do-tap.md) | Ficha do TAP num arquivo só, com 12 seções | aceita |
| [0007](0007-ordem-da-etapa-4.md) | Ordem de geração das partes do PGP (etapa 4) | aceita |
| [0008](0008-tabela-de-categoria.md) | Tabela fixa de categoria dos achados (etapa 5) | aceita |
| [0009](0009-regras-do-raio-x-nos-tres-tipos.md) | Regras do Raio-X traduzidas em vago, conflituoso e ausente | aceita |

Modelo para uma nova decisão:

```markdown
# NNNN — Título

- **Data:** dd/mm/aaaa
- **Status:** proposta | aceita | provisória | substituída por NNNN
- **Quem decidiu:** responsável pelo projeto | Claude Code, em nome da responsável

## Contexto
## Decisão
## Consequências
```
