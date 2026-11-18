# Documentação

Índice de toda a documentação do Raio-X do Projeto.

O Raio-X do Projeto é um app web estático, em TypeScript e React, publicado no GitHub Pages. Ele apoia o gerente de projeto da FGV Projetos no ciclo RFP → proposta → termo de abertura → plano de gerenciamento → conferência do plano.

A leitura dos PDFs, a extração, as regras, as contas e a montagem dos documentos são feitas por código, no navegador e sem servidor. A criação e a interpretação ficam com o PMO: a API do Claude chamada com a chave do próprio GP e instruída pela skill em `.claude/skills/pmo/`.

Todo conteúdo sai rotulado (do documento, sugestão ou decisão do GP) e passa pela revisão do GP.

## Para usar e acompanhar

| Documento | Conteúdo |
|---|---|
| [`guia-do-gerente.md`](guia-do-gerente.md) | Como usar, com e sem a chave da API |
| [`andamento.md`](andamento.md) | Fases concluídas, fase atual, decisões pendentes e próximo passo |
| [`decisoes/`](decisoes/README.md) | Uma decisão por arquivo, numerada, com contexto e consequências |
| [`identidade-visual.md`](identidade-visual.md) | Cores, fonte, componentes, etiquetas e documentos exportados |
| [`arquitetura.md`](arquitetura.md) | Resumo: código × PMO, pastas, fluxo de uma etapa, dossiê, segurança e testes |

## Documentação técnica (`tecnico/`)

Descreve o sistema como ele está no código (v0.8.1). Cada documento termina com os arquivos que sustentam o que diz.

| Documento | Conteúdo |
|---|---|
| [`01-visao-geral.md`](tecnico/01-visao-geral.md) | Propósito, as cinco etapas, princípios, stack e tamanho |
| [`02-arquitetura.md`](tecnico/02-arquitetura.md) | Camadas, decisões estruturais e diagrama |
| [`03-dependencias.md`](tecnico/03-dependencias.md) | Grafo entre as pastas de `src/` com os ciclos e os pacotes externos |
| [`04-integracoes.md`](tecnico/04-integracoes.md) | API do Claude, GitHub Pages e Actions, arquivos do GP |
| [`05-modelo-de-dados.md`](tecnico/05-modelo-de-dados.md) | O dossiê: entidades, diagrama ER e regras de identidade |
| [`06-fluxos.md`](tecnico/06-fluxos.md) | Leitura do PDF, etapa 1, passo do PMO, etapa 5 e exportação, com diagramas de sequência |
| [`07-configuracao.md`](tecnico/07-configuracao.md) | Modelo, preços, CSP, armazenamento no navegador e variáveis de ambiente |
| [`08-build-e-deploy.md`](tecnico/08-build-e-deploy.md) | Comandos, testes, CI e publicação |
| [`09-pontos-de-atencao.md`](tecnico/09-pontos-de-atencao.md) | Dívidas, riscos e itens a validar |

## Estudos

| Documento | Conteúdo |
|---|---|
| [`estudos/metodo-etapa-1.md`](estudos/metodo-etapa-1.md) a [`metodo-etapa-5.md`](estudos/metodo-etapa-5.md) | O método de cada etapa (decisão 0034): prevalece sobre o que a etapa faz hoje |
| [`estudos/roteiro-etapa-5-plano-real.md`](estudos/roteiro-etapa-5-plano-real.md) | Roteiro da etapa 5 sobre um plano real (`npm run conferir-plano-real`) |
