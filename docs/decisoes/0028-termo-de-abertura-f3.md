# 0028 — Termo de abertura com o PMO (F3), construído sem a chave

- **Data:** 13/11/2026
- **Status:** aceita (o teste com a chave fica pendente)
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (detalha a seção 5, etapa 3, da especificação, a ficha TAP e as decisões 0021, 0025, 0026 e 0027)

## Contexto

A F3 implementa a etapa 3 (TAP) no esquema da F2 (decisão 0026): tudo o que não depende da chave construído e testado com a API simulada; respostas do PMO gravadas para a RFP pública da OEI, que servem aos testes e ao modo demonstração; o teste com a chave fica para quando ela chegar.

## Decisão

### Entrada
- **RFP** (obrigatória, com anexos) e a **proposta**: o PDF da versão final do GP, quando ele envia; senão, a proposta da etapa 2 no dossiê. O PDF, quando existe, vale no lugar do dossiê (a especificação diz que o GP pode ter editado a proposta fora da ferramenta).
- A **proposta do dossiê vira um documento "lido"**: uma página por seção da minuta exportada da etapa 2 (com as revisões do GP). Assim o PMO a cita como cita a RFP (`doc: "proposta"`) e o código confere a citação na "página" (seção). O texto vai ao PMO com a marca "cada página é uma seção da minuta".
- Sem proposta nenhuma, o PMO não é chamado: a tela pede o PDF ou a etapa 2.

### Código
- **Divergências RFP × proposta**, requisito a requisito (produtos e equipe, pelos números R), mais o prazo e o valor:
  - proposta do dossiê: a ligação pelo número R é explícita (produto do SOW, perfil da equipe); o prazo usa a conta do cronograma da etapa 2 contra a vigência; o valor é o preço final do GP;
  - proposta em PDF: o código procura o número R, os termos do requisito e o rótulo ("Produto 2") no texto; o prazo é a vigência ou o prazo de execução escrito na proposta; o valor, o "valor global" ou "preço total" seguido de R$;
  - o que o código não acha fica **"não localizado na proposta pelo código — conferir"**, nunca "ausente". Produto da proposta sem requisito ligado aparece como "só na proposta".
  - Onde há diferença (ou um lado só), o **GP decide** o que vale: a RFP, a proposta ou outra redação. A decisão vai no pedido ao PMO e no TAP exportado.
- **O que vem dos documentos**, com a página: contratante, objeto, modalidade, vigência, produtos (R), valor da proposta, entrega de cada produto (conta do código sobre a EAP da etapa 2, com a conferência do prazo de cada produto), recebimento e aceite, extinção, gestor, fiscal e órgãos citados.
- **Conferência do TAP**: cada um dos 12 elementos com conteúdo (os de decisão do GP saem "a definir pelo GP" quando vazios); todo requisito de alto nível com número R e todo R da RFP coberto no TAP.3; marcos dentro do prazo da RFP (prazo do marco em dias, cronograma da proposta e a entrega de cada produto); recursos iguais ao valor da proposta; citações conferidas; premissas críticas confirmadas no registro, com a consequência (TAP-PR.2).
- **Melhoria na etapa 1:** o valor estimado também é achado em "os recursos (ou as despesas)… estimados em R$" (a RFP da OEI escreve assim e o código não pegava).

### PMO
- **Dois passos:** (1) os 12 elementos (ficha TAP), com objetivos e critério de sucesso (métrica marcada como sugestão quando a RFP não traz), marcos com o prazo contado de um evento, partes com papel e o que decidem; (2) o registro de premissas inicial (fichas B3 e TAP), com tipo, origem, premissa crítica, consequência, de quem depende e como validar.
- **O que vai à API:** `SKILL.md`, `checklist.md`, `experiencia.md` e as fichas `tap`, `b03` e `b31` (SKILL.md, seção 5); o texto da RFP e da proposta, página a página; o ponto de partida da etapa 1, o que vem dos documentos, as divergências com a decisão do GP e as premissas críticas confirmadas.
- **Decisões do GP:** recursos financeiros (TAP.7), gerente e nível de autoridade (TAP.11), patrocinador e a autoridade dele (TAP.12), a aprovação do TAP (quem e quando) e as premissas críticas que se aplicam (vêm da etapa 2, quando houver). O PMO só sugere a redação.
- Mesmo cliente da API, mesmo cache, mesma conferência de citação, redação e números sem fonte da F2. O uso de cada chamada fica no dossiê (`tap.uso`).

### Tela, dossiê e saídas
- A tela da etapa 3 tem a conexão com o Claude (a chave é a mesma da sessão), a proposta usada, as premissas críticas, as divergências com a decisão do GP, o que vem dos documentos, os dois passos do PMO com a revisão item a item, os campos do GP, a conferência do TAP, a aprovação e as saídas.
- O dossiê ganha o campo `tap` (respostas, revisões, decisões nas divergências, decisões do GP, premissas críticas e uso). O formato continua na versão 1.
- **Saídas:** termo de abertura (DOCX e PDF), com as divergências, os 12 elementos, as premissas, o que veio dos documentos, a conferência e a aprovação; registro de premissas inicial (XLSX). Cabeçalho de minuta enquanto houver item pendente, divergência sem decisão ou TAP sem aprovação.
- **Modo demonstração** (decisão 0027) também na etapa 3: entra com a proposta gravada (abordagem B, premissas PC1, PC3, PC6 e PC8) e carrega as respostas gravadas do TAP.
- Os componentes de item do PMO, de passo do PMO e de uso passam a ser comuns (`interface/componentes/item-pmo.tsx` e `passo-pmo.tsx`, `pmo/itens.ts`), para a etapa 4 usar os mesmos.

### Testes sem a chave
- Respostas do PMO para o TAP da OEI (`tests/fixtures/gerados/tap-oei/`), geradas no Claude Code seguindo a skill: o teste confere que todas as citações (na RFP e na proposta do dossiê) são achadas pelo código, sem número sem fonte e com redação condicional em toda sugestão.
- Divergências com a proposta do dossiê e com uma proposta em PDF; conferência do TAP (inclusive o produto 2 da proposta gravada, cuja entrega passa do prazo da RFP); saídas; fumaça no navegador na demonstração e com a API simulada (etapa 2 → etapa 3 no mesmo dossiê, sem vazar a chave e sem rolagem horizontal).

### Versão
A F3 fecha com a tag **v0.6.0** (decisão 0026).

## Consequências
- O teste com a chave real pode pedir ajuste do schema do TAP (como na F2); o cliente da API continua o único lugar a mudar.
- Ficam para depois: comparação de datas exatas quando a proposta em PDF traz um cronograma em tabela; a equipe do PDF por perfil (hoje pelo texto do requisito); a planilha do TAP no formato da FGV, se houver um modelo em `referencias/modelos/`.
