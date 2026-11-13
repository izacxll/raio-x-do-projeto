# 0004 — Padrão de nomes no código

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto, a partir da proposta do plano

## Contexto

A especificação pede um padrão único, com português para os termos do domínio, como no Raio-X.

## Decisão

| O quê | Padrão | Exemplo |
|---|---|---|
| Termos do domínio | português, sem acento nos identificadores | `requisito`, `achado`, `gravidade`, `dossie` |
| Funções | camelCase, começando por verbo | `extrairRequisitos`, `conferirCitacao` |
| Tipos, interfaces e componentes React | PascalCase | `Achado`, `ItemRotulado`, `CartaoEtapa` |
| Constantes | MAIÚSCULAS com sublinhado | `MAX_PAGINAS_OCR` |
| Arquivos e pastas | kebab-case | `conferir-citacao.ts`, `tabela-preco/` |
| Termos técnicos de bibliotecas | inglês, como a biblioteca usa | `props`, `useDossie`, `store` |
| Textos da interface e dos documentos | português do Brasil, com acentuação normal | "Decisão do GP" |
| Testes | mesmo nome do arquivo testado, com `.test.ts` | `conferir-citacao.test.ts` |

## Consequências

- Código copiado do Raio-X é renomeado para o padrão, com a origem anotada (`// origem: App-final-4.jsx, <função>, linha N`).
- O ESLint e o Prettier garantem a forma; o padrão de nomes é conferido na revisão do PR.
