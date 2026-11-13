# 0012 — Logo da FGV Projetos no app e nos documentos exportados

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto

## Contexto

A especificação pede a identidade visual da FGV no app e nos documentos exportados, com o logo fornecido pela responsável pelo projeto. Nunca se inventa um logo. Todo o conteúdo de `referencias/` fica fora do Git, mas o site publicado precisa do arquivo do logo.

## Decisão

- A responsável pelo projeto salva o logo da FGV Projetos em `referencias/identidade/`.
- A partir da F0, o logo aparece **no cabeçalho do app** e **nos documentos exportados** (DOCX, PDF e XLSX).
- **Só o logo é copiado para o código do app** (em `src/interface/ativos/`, com o nome em kebab-case). Ele é o **único arquivo vindo de `referencias/` que entra no Git**. A apresentação HTML, as fontes e qualquer outro material de `referencias/identidade/` continuam fora.
- O arquivo é copiado como está: sem redesenhar, recortar ou recolorir.

## Consequências

- A verificação do repositório no CI (F0) aceita esse arquivo de logo e nenhum outro vindo de `referencias/`.
- Se o logo mudar, a troca é feita copiando de novo o arquivo de `referencias/identidade/`.
