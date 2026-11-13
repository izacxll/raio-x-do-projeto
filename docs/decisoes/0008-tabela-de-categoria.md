# 0008 — Tabela fixa de categoria dos achados (etapa 5)

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto, a partir da proposta do plano

## Contexto

Na conferência do PGP (etapa 5), cada achado recebe uma categoria: tempo, custo ou escopo quando for sobre eles; senão, o domínio de desempenho do PMBOK 7 que ele afeta. Como a etapa é só código, a categoria sai de duas regras fixas.

## Decisão

**Regra 1, pelo que foi comparado:** achado sobre data ou prazo → **tempo**; sobre valor → **custo**; sobre entrega ou escopo → **escopo**.

**Regra 2, se a regra 1 não se aplicar, pela parte do PGP onde está o achado** (A = componentes do plano; B = documentos do projeto):

| Categoria | Anexo A | Anexo B |
|---|---|---|
| Escopo | 1, 2, 13 | 17, 22, 23 |
| Tempo | 3, 14 | 1, 2, 8, 11, 13, 15, 16, 29, 30 |
| Custo | 4, 15 | 6, 7 |
| Partes interessadas | 7, 10 | 14, 31 |
| Equipe | 6 | 18, 24, 25, 26, 32 |
| Abordagem de desenvolvimento e ciclo de vida | 17, 18 | — |
| Planejamento | — | 4 |
| Trabalho do projeto | 9, 11, 12 | 5, 9, 10, 12 |
| Entrega | 5 | 21, 33 |
| Medição | 16 | 19, 20 |
| Incerteza | 8 | 3, 27, 28 |

**Escolhas discutidas:**
- **A7 (comunicações) em partes interessadas:** o PMBOK 7 trata comunicação também nos domínios de planejamento e de trabalho do projeto. Nos projetos da FGV, a falha típica do plano de comunicações é com o cliente.
- **B3 (registro de premissas) em incerteza:** a alternativa seria planejamento.
- **A12 (configuração) em trabalho do projeto:** a alternativa seria entrega.

## Consequências

- A tabela fica em `src/dominio/` como dado e é coberta por teste: toda parte dos Anexos A e B tem exatamente uma categoria.
- O GP pode trocar a categoria de um achado, com justificativa; a troca fica registrada no dossiê.
