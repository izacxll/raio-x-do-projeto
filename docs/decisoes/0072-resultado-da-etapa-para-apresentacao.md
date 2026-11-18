# 0072 — Resultado da etapa para apresentação

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável (pedido do fechamento da rodada 3, item 5)

## Contexto

Para apresentar o teste externo, a responsável precisa de um documento por etapa com o que saiu de cada passo, o que o código conferiu e o que a segunda instância achou e foi corrigido. Esses dados estão espalhados em dezenas de arquivos da pasta do caso (placares, conferências, dossiê).

## Decisão

1. **Um DOCX por etapa e por caso**, `resultado-etapa-N-<caso>.docx`, montado com o exportador DOCX do app (`gerarDocx`) a partir de um modelo novo, `montarResultadoDaEtapa`:
   - como ler (os rótulos e que tudo do PMO e da segunda instância é Sugestão);
   - para cada passo, o placar resumido (o começo e a primeira linha de cada bloco) e a conferência da segunda instância (achados, o que passou e o que o GP decidiu, inclusive "seguiu com correção");
   - o resultado final da etapa, com os mesmos relatórios que a tela exporta (análise da RFP, proposta técnica, TAP e registro de premissas, PGP).
2. **Sempre minuta:** o GP do teste não revisou item a item.
3. **Fora do Git.** O script (`npm run resultado-da-etapa`) só lê a pasta do caso e grava o DOCX na pasta indicada, que não pode ficar dentro do projeto, salvo em `referencias/`. O vigia (fora do Git) chama o script quando todos os passos de uma etapa fecham.

## Consequências

- Gerados em 18/11/2026 os documentos das etapas 1 a 4 dos dois casos do teste externo, na pasta de cada caso.
- O placar completo continua na pasta do caso; o documento traz só o resumo.
