# 0029 — Plano de gerenciamento com o PMO (F4), construído sem a chave

- **Data:** 13/11/2026
- **Status:** aceita (o teste com a chave fica pendente)
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (detalha a seção 5, etapa 4, da especificação e as decisões 0007, 0013, 0021, 0026, 0027 e 0028)

## Contexto

A F4 implementa a etapa 4 (PGP) no esquema da F2 e da F3 (decisão 0026): tudo o que não depende da chave construído e testado com a API simulada; respostas do PMO gravadas para a RFP pública da OEI, para os testes e para o modo demonstração.

## Decisão

### Entrada
- **RFP** (obrigatória), **TAP** (o PDF aprovado pelo GP ou o TAP da etapa 3 no dossiê) e, se houver, a **proposta** (PDF ou a da etapa 2). Documento gerado na ferramenta vira documento "lido", uma página por seção (`etapas/documento-virtual.ts`, o mesmo da F3), para o PMO citar e o código conferir. Sem TAP, o PMO não é chamado.

### Os passos, na ordem da decisão 0007, em seis pedidos ao PMO
1. **Adaptação, ciclo de vida e abordagem** (passos 1 e 2): para cada uma das 51 partes, essencial, recomendado ou dispensável, com uma linha de justificativa; abordagem, fases e o texto de A17 e A18. Vai ao PMO só a seção "Quando dispensar" de cada ficha (as 51 inteiras passariam de 100 mil tokens). **O GP marca o que gerar e escolhe a abordagem**; a sugestão do PMO vem marcada por padrão.
2. **Escopo** (passo 3): A1, A2, B22, B17, A13 e a EAP com o dicionário. O código monta a **matriz de rastreabilidade (B23)**: cada requisito da RFP até o TAP, a EAP e o cronograma.
3. **Atividades, recursos e cronograma** (passos 4 a 6): atividades com durações em três pontos, perfis, horas e RACI, e os textos de A3, A6, B4, B26, B32 (e B1, B12, B13, B24, B25, se marcados). O código monta a lista de atividades (B2), as durações (B8), o cronograma (B15), a rede (B16), os marcos (B11) com a conferência contra os marcos do TAP, a linha de base do cronograma (A14) e as designações (B18, nomes do GP).
4. **Riscos, custos e premissas** (passos 7 a 9): o registro dos riscos (B27, cada premissa crítica vira risco com resposta e gatilho), A8 (com o tratamento das premissas críticas, A8.12), A4 e as premissas novas (B3). O código monta as estimativas de custos (B6: horas × valor-hora do GP) e a linha de base dos custos (A15: pessoal + contingência; o orçamento soma a reserva gerencial, fora da linha de base), e confere o orçamento com os recursos do TAP ou o preço da proposta. Tributos e indiretos ficam no preço (etapa 2).
5. **Demais planos e documentos** (passo 10): A5, A7, A9, A10, A11 (com o modo de reajustar escopo, prazo e metas se uma premissa crítica falhar, A11.12), A12, B14, B20, B31.
6. **Linha de base da medição e documentos de execução** (passos 11 e 12): A16, os indicadores e os modelos iniciais (B5, B7, B9, B10, B19, B21, B28, B30, B33), sem inventar acontecimentos.

- **Cache:** as fichas das partes vão no pedido de cada passo, e não na instrução de sistema; assim o prefixo (skill, PMBOK 7, checklist, experiência, licitações e os documentos) é o mesmo nos seis passos e fica no cache.
- Só as partes que o GP marcou entram nos pedidos.

### Autoconferência (passo 13, código)
- O plano gerado (a mesma minuta que é exportada, com cada parte sob o título "N. Nome da parte", que o mapa reconhece) passa por `conferirPlano`, as regras da etapa 5. O que o GP dispensou na adaptação fica "dispensada" no mapa e não conta como ausente.
- **Características do projeto:** as que o GP confirma na tela; antes disso, uma sugestão do código (porte pelo número de produtos e pelo prazo; campo pelo "formato remoto" da RFP; abordagem e fases da adaptação; subcontratação da etapa 1).
- **Decisões pendentes à parte:** o vago cujo trecho é "a definir pelo GP" é decisão que só o GP preenche; a tela conta esses trechos separados dos vagos de verdade.
- Com o plano gravado da OEI e as características de um projeto pequeno e remoto, a autoconferência acha 6 pontos (1 grave) e 34 decisões pendentes: proporcional ao porte.

### Ligação com a etapa 5
- A conferência do plano (etapa 5) passa a usar, quando a etapa 4 está no dossiê, o que o GP dispensou (entra como "dispensada", com a justificativa), as características e as premissas críticas da etapa 4, como pede a especificação.

### Regras melhoradas no caminho
- **Etapa 5:** o requisito também é achado no plano pelo número R e pelo rótulo "Produto N" (a descrição da RFP pode vir partida da tabela de duas colunas).
- **Redação:** "se… então…" conta como redação condicional (é a forma do risco escrito como condição, skill, princípio 5).
- **Exportação:** o parágrafo de cada item do PMO mostra os números R que ele atende.
- **Desempenho:** a análise da RFP (pura) fica guardada para os mesmos documentos no mesmo dia; as telas das etapas 2 a 4 a pediam várias vezes a cada mudança.

### Tela, dossiê e saídas
- A tela da etapa 4 tem a conexão, os documentos usados, as premissas críticas, os seis passos (com a tabela da adaptação, a EAP e a rastreabilidade, o cronograma e os marcos, as designações, os custos e os indicadores), a autoconferência e as saídas.
- O dossiê ganha o campo `pgp` (respostas, o que gerar, abordagem, revisões, valores do GP, premissas críticas, características e uso). O formato continua na versão 1.
- **Saídas:** plano (DOCX e PDF), registros, cronograma e matrizes (XLSX: adaptação, marcos, cronograma, durações, atividades, designações, custos, riscos, premissas, rastreabilidade, EAP, fases e indicadores), EAP e diagrama de rede em SVG (desenhados pelo código) e o **pacote .zip** com tudo e o índice das partes (geradas e dispensadas). O `fflate` passa a ser dependência do app (MIT, empacotado no build).
- **Demonstração** (decisão 0027) também na etapa 4: entra com a proposta e o TAP gravados.

### Testes sem a chave
- Respostas do PMO para o PGP da OEI (`tests/fixtures/gerados/pgp-oei/`): adaptação das 51 partes, cada parte marcada escrita pelo PMO ou montada pelo código, todas as citações achadas, sem número sem fonte, redação condicional; cronograma, marcos (o P2 passa do marco do TAP e é apontado), custos, rastreabilidade completa; autoconferência com as premissas críticas nos três lugares e nenhum dispensado como ausente; saídas; fumaça no navegador na demonstração, com o pacote .zip.
- A fumaça roda com dois processos em paralelo: cada teste das etapas com o PMO lê uma RFP de 56 páginas no navegador.

### Versão
A F4 fecha com a tag **v0.7.0** (decisão 0026).

## Consequências
- O teste com a chave pode pedir ajuste dos schemas (os seis passos têm saídas grandes; os limites de saída estão em `config/modelo.ts`).
- Ficam para depois: distribuição dos custos no tempo (curva S) e o cronograma de desembolso pelas parcelas do contrato; edição das tabelas do código na tela (hoje o GP edita os itens do PMO e os valores); o diagrama de rede com datas.
