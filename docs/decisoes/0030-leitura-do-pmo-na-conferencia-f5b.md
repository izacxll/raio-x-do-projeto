# 0030 — Leitura opcional do PMO na conferência (F5b), construída sem a chave

- **Data:** 13/11/2026
- **Status:** aceita (o teste com a chave fica pendente)
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (detalha a decisão 0013, seção 4, e a seção 3 da skill, etapa 5)

## Contexto

A decisão 0013 prevê uma leitura do PMO na etapa 5, opcional, com custo à vista, cujos achados são sempre sugestão e passam por travas de código. A responsável pediu a F5b depois da F3 e da F4, no mesmo esquema (decisão 0026).

## Decisão

- **Onde:** na tela da etapa 5, depois do resultado da conferência por código. A etapa 5 continua funcionando sem chave; a leitura só é chamada quando o GP clica, com a estimativa de custo antes e o uso real depois (guardado no dossiê, `conferencia.usoPmo`).
- **O que vai à API:** `SKILL.md`, `checklist.md` e `experiencia.md` (instrução de sistema, com cache); o texto do PGP, do TAP e da RFP, página a página (com cache); e o pedido, com as características do projeto, as premissas críticas confirmadas, **o que o código já apontou** (para o PMO não repetir) e **só o conteúdo mínimo e as perguntas de qualidade** das partes presentes no mapa (SKILL.md, seção 5).
- **Resposta:** cada achado com tipo (vago, conflituoso ou ausente), parte do PGP, item do conteúdo mínimo, evidência dos dois lados (doc, página, trecho literal), sugestão em redação condicional e, no ausente, os termos que o código deve procurar.
- **Travas, todas em código** (`etapas/5-conferencia/leitura-pmo.ts`):
  - todo achado do PMO é **Sugestão**, marcado "leitura do PMO";
  - cada trecho é procurado na página; sem nenhum achado, o achado fica **"citação não conferida"** e não vale como fato;
  - **ausente** só vale depois de o código procurar no plano inteiro os termos do PMO e os sinais do item da ficha: se achar, o achado é **rebaixado** e mostra onde o item está;
  - **gravidade e categoria pela parte do PGP** (regra fixa, decisões 0008 e 0009), nunca pelo PMO;
  - o achado que o código já tinha apontado na mesma parte é marcado;
  - sugestão sem redação condicional ganha o aviso "redação a conferir".
- **Decisão do GP** em cada achado do PMO (procede ou não, com justificativa), guardada junto das decisões do código, com o prefixo `pmo:`.
- **Saídas:** o relatório de conformidade (DOCX e PDF) ganha a seção "Leitura do PMO (sugestões)" e a lista de achados (XLSX), a aba "Leitura do PMO". O achado do PMO sem decisão mantém o cabeçalho de minuta.
- **Demonstração:** a leitura não tem resposta gravada na demonstração (a etapa 5 recebe o PGP do GP); a tela diz isso.
- Sai como **v0.8.0** (decisão 0026).

### Testes sem a chave
- Resposta gravada para o plano de teste da etapa 5 (`tests/fixtures/gerados/conferencia/politicas-mulheres/leitura-pmo.json`), escrita no Claude Code seguindo a skill: três vagos interpretativos com as citações achadas pelo código, um ausente que o código acha no plano (rebaixado, com a página) e um ausente que o código também não acha (vale como sugestão); gravidade pela parte; citação falsa plantada vira "não conferida"; seção no relatório e aba na lista.
- Fumaça no navegador com a API simulada: custo antes, botão parado sem a chave, achados como sugestão com "citação não conferida", decisão do GP, uso registrado e a seção no relatório, sem a chave.

## Consequências
- Quando a leitura do PMO achar algo que o código não acha, avalia-se se uma regra pegaria (CLAUDE.md, seção 2). A fase P (caso real) mede essa diferença.
- O teste com a chave pode pedir ajuste do schema e do tamanho do pedido em planos grandes (o conteúdo mínimo das partes presentes vai inteiro).
