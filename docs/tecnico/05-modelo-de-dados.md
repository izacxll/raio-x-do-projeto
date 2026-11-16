# 05 — Modelo de dados

O dossiê é o único modelo persistente do app. O núcleo dele está aqui.

O dossiê é um JSON (`<projeto>.dossie.json`) validado por zod. Ele guarda:

- o texto de cada documento lido (nunca o PDF);
- o que cada etapa produziu;
- o que o GP decidiu.

Não há banco de dados. O dossiê fica na memória da aba (`src/dossie/store.ts`) e é salvo e aberto pelo GP (`src/dossie/arquivo.ts`).

```mermaid
erDiagram
  DOSSIE ||--o{ DOCUMENTO_LIDO : "documentos"
  DOCUMENTO_LIDO ||--|{ PAGINA_LIDA : "paginas"
  DOSSIE ||--o{ ITEM_ROTULADO : "itens"
  DOSSIE ||--o| ANALISE_RFP : "analiseRfp (etapa 1)"
  ANALISE_RFP ||--o{ REQUISITO : "requisitos R01…"
  ANALISE_RFP ||--o{ REVISAO_ITEM : "revisoes por id"
  DOSSIE ||--o| PROPOSTA : "proposta (etapa 2)"
  DOSSIE ||--o| TAP : "tap (etapa 3)"
  DOSSIE ||--o| PGP : "pgp (etapa 4)"
  DOSSIE ||--o| CONFERENCIA : "conferencia (etapa 5)"
  CONFERENCIA ||--o{ PARTE_DO_MAPA : "mapa"
  CONFERENCIA ||--o{ REQUISITO : "requisitos"
  CONFERENCIA ||--o{ DECISAO_ACHADO : "decisoes por id"
  PROPOSTA ||--o{ USO_PMO : "uso"
  TAP ||--o{ USO_PMO : "uso"
  PGP ||--o{ USO_PMO : "uso"
  DOSSIE {
    string formato
    int versaoFormato
    string versaoApp
    string versaoSkill
    string projeto_nome
    bool demonstracao
  }
  DOCUMENTO_LIDO {
    string id
    enum papel "rfp, anexo-rfp, proposta, tap, pgp"
    string nomeArquivo
    int totalPaginas
  }
  PAGINA_LIDA {
    int numero
    enum origem "texto, ocr, nao-verificavel"
    string texto
    int confiancaOcr
  }
  REQUISITO {
    string numero "R01"
    string rotulo
    string descricao
    int pagina
    enum origem "codigo, gp"
    enum tipo "produto, equipe, quantidade, local, condicao, outro"
  }
  REVISAO_ITEM {
    enum estado "pendente, aceito, editado, descartado"
    string textoEditado
  }
  USO_PMO {
    string passo
    string modelo
    int entrada
    int saida
    float custoUsd
  }
```

## Entidades

| Entidade | O que guarda | Esquema |
|---|---|---|
| `Dossie` | Formato e versão (para migrar), versões do app e da skill, nome do projeto, marca de demonstração | `Dossie` |
| `DocumentoLido` | Cada PDF lido, com o papel e as páginas | `DocumentoLido` |
| `PaginaLida` | Texto da página e de onde veio: texto do PDF, OCR (com a confiança) ou não verificável (com o motivo) | `PaginaLida` |
| `ItemRotulado` | Item genérico com rótulo, estado e origem (documento, página e trecho) | `ItemRotulado` |
| `AnaliseRfpDossie` | O que fica da etapa 1: os requisitos numerados, o próximo número, as revisões por id de item e a decisão de participar | `AnaliseRfpDossie` |
| `PropostaDossie` | Respostas do PMO (estratégia, conteúdo, EAP), abordagem escolhida, premissas críticas, revisões, parâmetros do GP (valor-hora, despesas, preço final) e o uso da API | `PropostaDossie` |
| `TapDossie` | Respostas do PMO (TAP, premissas), divergências RFP × proposta decididas pelo GP, decisões (GP, patrocinador) e o uso | `TapDossie` |
| `PgpDossie` | As seis respostas do PMO, as partes a gerar, a abordagem, os parâmetros e o uso | `PgpDossie` |
| `Conferencia` | Características do projeto, mapa do PGP confirmado, premissas aplicáveis, requisitos, decisão em cada achado e a leitura do PMO | `Conferencia` |

## Regras de identidade

- A análise da RFP **não** é guardada: ela é refeita a partir do texto. Só as decisões do GP ficam, ligadas ao **id estável** de cada item (`prazos:certame:…`, `habilitacao:fgts`…). Por isso mudar a forma de um id apaga a revisão anterior daquele item (`src/etapas/1-rfp/revisao.ts`).
- Os **números R** dos requisitos são fixados no dossiê quando o GP clica em "Analisar a RFP". Requisito novo ganha o próximo número; o descartado não volta (`proximoRequisito`).
- Respostas do PMO são guardadas com o modelo e a data (`RespostaGuardada`). Assim um dossiê aberto depois não precisa chamar a API de novo.

## O que o dossiê nunca guarda

- A chave da API: o esquema não tem campo para ela, e o que não está no esquema é descartado ao salvar e ao abrir.
- O arquivo PDF: só o texto das páginas.

## Referências no código

- `src/dossie/esquema.ts` (todos os esquemas citados)
- `src/dossie/arquivo.ts`, `src/dossie/store.ts`
- `src/etapas/1-rfp/revisao.ts`
- `src/pmo/schemas/`
