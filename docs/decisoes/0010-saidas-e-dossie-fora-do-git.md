# 0010 — Saídas do app e dossiê fora do Git; extensão `.dossie.json`

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido na revisão do PR de Fundação); a extensão foi escolhida pelo Claude Code em nome dela

## Contexto

Antes desta decisão, o `.gitignore` bloqueava só PDF. Mas o app gera DOCX, XLSX, ZIP e o dossiê, que podem conter preço, valor-hora, nomes e conteúdo de RFP privada. O repositório é público: um arquivo desses comitado por engano fica visível no histórico.

## Decisão

1. **O dossiê tem extensão própria: `.dossie.json`.**
   - O botão "Salvar projeto" grava `<nome-do-projeto>.dossie.json` (nome montado como no Raio-X, com `nomeParaArquivo`).
   - "Abrir projeto" aceita só `.dossie.json`. O conteúdo continua sendo JSON comum, com o campo de versão do formato.
2. **Ficam fora do Git em todo o repositório:** `*.docx`, `*.xlsx`, `*.zip` e `*.dossie.json`, maiúsculas incluídas.
   - **Única exceção:** `tests/fixtures/gerados/`, onde ficam as saídas geradas a partir de RFPs públicas, antes de qualquer edição de GP e sem preço nem nomes de pessoas.
   - PDF continua liberado só em `tests/fixtures/rfps-publicas/`. As saídas geradas em PDF não vão para o Git: o DOCX, que é editável, basta como exemplo.
3. **`*.doc` e `*.xls` também ficam fora, sem exceção.** São formatos antigos que só chegariam ao projeto como documentos de clientes.
4. **Na F0, a verificação automática do CI** (`scripts/verificar-repositorio.mjs`) falha se aparecer, entre os arquivos rastreados:
   - PDF fora de `tests/fixtures/rfps-publicas/`;
   - DOCX, XLSX, ZIP ou `.dossie.json` fora de `tests/fixtures/gerados/`;
   - DOC ou XLS em qualquer lugar;
   - texto com cara de chave.

## Consequências

- O `.gitignore` evita o erro local; o CI pega o que passar por `git add -f` ou por outra máquina.
- Um exemplo novo em `tests/fixtures/gerados/` precisa ser conferido antes do commit: nada de preço, valor-hora ou nomes.
