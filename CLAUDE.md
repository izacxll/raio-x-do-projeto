# CLAUDE.md — Raio-X do Projeto

App web para gerentes de projeto (GP) da FGV Projetos. Apoia o ciclo **RFP → proposta → TAP → PGP → conferência do PGP**.

**Toda conversa nova começa lendo este arquivo e `docs/andamento.md`.** A especificação completa está em `referencias/prompt-claude-code-raio-x-do-projeto.md` (fora do Git): leia a seção da fase em andamento antes de agir. As decisões já tomadas estão em `docs/decisoes/`.

## 1. Princípio inegociável: sugerir, nunca afirmar

Vale no código e na interface, não só nos prompts.

- Todo conteúdo exibido ou exportado tem um de três rótulos visíveis:
  - **Do documento:** extraído da RFP, proposta, TAP ou PGP, sempre com página e trecho.
  - **Sugestão:** redação condicional ("sugere-se", "uma opção é", "recomenda-se avaliar"); quando fizer sentido, 2 ou 3 alternativas com prós e contras.
  - **Decisão do GP:** só o GP preenche (valor-hora, GP designado, patrocinador, nível de autoridade, participar ou não etc.). A ferramenta pode sugerir redação, nunca preencher como fato.
- O que o documento não informa aparece como **"não informado no documento — a definir pelo GP"**. Nunca inventar valores, prazos, quantidades ou fatos.
- **Não achado não é ausente:** o que uma regra de código não encontra fica **"não localizado pelo código — conferir no documento"**. Página sem texto legível deixa o item **"não verificável"**.
- Cada item sugerido tem estado: pendente, aceito, editado ou descartado. Nada vai para a versão final sem passar pelo GP.
- Documentos exportados levam no cabeçalho **"Minuta — sugestões geradas por ferramenta, sujeitas à validação do Gerente do Projeto"** até o GP marcar todos os itens como revisados.
- Toda citação do PMO é procurada no texto extraído da página indicada; se não for encontrada, o item fica **"citação não conferida"** e nunca aparece como fato.
- Base legal: o que o documento cita prevalece. A skill pode sugerir lei e artigo, sempre pedindo conferência. Nunca dá parecer jurídico.

## 2. Código × PMO

**O que não precisa da inteligência do PMO é feito por código** (previsível, gratuito, testável).

| Camada | Faz | Onde |
|---|---|---|
| Código | ler PDF (texto por página, OCR, tabelas), extrair, contar, comparar, conferir, calcular, montar documentos | `src/leitura`, `src/texto`, `src/extracao`, `src/regras`, `src/exportacao` |
| PMO (API do Claude, chave do GP) | criar ou interpretar: estratégia, abordagens, conteúdo técnico, EAP, estimativas, redação do TAP e do PGP | `src/pmo` + `.claude/skills/pmo/` |

- Etapas 1 (RFP) e 5 (conferência) são **só código** e funcionam sem chave. Etapas 2, 3 e 4 usam o PMO.
- Todas as contas são feitas por código, nunca pelo modelo.
- Textos das etapas por código (sugestões, perguntas, pontos de atenção) saem de **modelos de texto** escritos junto de cada regra, em redação condicional.
- Quando o PMO achar algo que o código não achou, avalie se uma regra pegaria e proponha a regra.
- A skill PMO (`.claude/skills/pmo/`) é **fonte única**: usada pelo Claude Code e importada no build do app (`?raw`).

## 3. Brechas do Raio-X ≠ riscos do projeto

O Raio-X do Plano de Trabalho (código em `referencias/raio-x/`, fora do Git) aponta os problemas que **o próprio texto** cria: o que está escrito errado, o que ficou em aberto, o que transfere responsabilidade para a FGV. Isso são **brechas**. O **registro de riscos do PGP** (etapa 4) é outra coisa. Não misture os dois.

- Não altere o Raio-X original. Reaproveite copiando, com `// origem: App-final-4.jsx, <função>, linha N`.
- Não mude metodologia, taxonomia V29, códigos ou prompts do Raio-X sem aprovação explícita.
- Na etapa 5, a saída usa só **vago, conflituoso e ausente** e a gravidade pela parte do PGP (decisões 0008 e 0009).

## 4. Regras do repositório

- **Público.** Tudo que entra no Git (inclusive o histórico) fica visível. Antes de cada commit, confira o que vai entrar (`git diff --cached --stat`).
- **Branches:** a `main` está sempre funcionando. Cada fase em `fase/<id>-<nome>`; correções em `correcao/<nome>`. Tudo entra por pull request com descrição. **Nunca commit direto na `main`.** Ao fim de cada fase: PR → teste e ok da responsável pelo projeto → merge, tag e release (decisão 0005).
- **Commits** pequenos, em português: `tipo(escopo): descrição` (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`).
- **CHANGELOG** atualizado em todo PR. Tag e release ao fim de cada fase.
- **Rótulos:** `etapa-1` a `etapa-5`, `pmo`, `regras`, `leitura`, `exportacao`, `documentacao`.
- **Nomes** (decisão 0004): domínio em português, sem acento nos identificadores; funções em camelCase com verbo; tipos e componentes em PascalCase; arquivos em kebab-case.
- **Decisões:** toda decisão tomada pela responsável pelo projeto ou por você em nome dela vira um arquivo em `docs/decisoes/`.
- **Documentos de teste:** público pode, confidencial nunca.
  - RFPs publicadas oficialmente → `tests/fixtures/rfps-publicas/`, com fonte e data no README da pasta. Mostrar a lista antes de comitar.
  - Saídas geradas a partir delas, antes de qualquer edição de GP e sem preço nem nomes → `tests/fixtures/gerados/`.
  - **Nunca no Git:** RFP privada não publicada; documentos escritos por pessoas da FGV (TAPs, planos, o caso da prova de conceito); versões finais do GP; qualquer documento interno. Ficam em `referencias/`, assim como o que for gerado a partir deles.
  - O caso real da prova de conceito nunca é identificado no Git: em `docs/` ele é só "um caso real de política pública".
- **Nada indevido no Git:** build, `node_modules`, chaves, PDFs fora de `tests/fixtures/rfps-publicas/`. O CI falha se aparecer PDF fora dessa pasta ou texto com cara de chave.
- **Licença:** nenhuma até a FGV decidir. Não adicione.
- A fonte Gotham é paga: nunca inclua os arquivos dela. O logo da FGV Projetos vem da responsável pelo projeto; não invente um.

## 5. Segurança e confidencialidade

- Cada GP usa a própria chave da API (organização da FGV no Claude Console). A chave fica **só no navegador** de quem usa: nunca no código, no repositório, no dossiê, nos exportados ou em logs.
- Chave em `sessionStorage` ("só nesta sessão"). "Lembrar neste navegador" está **desativado** por causa da origem compartilhada do GitHub Pages (decisão 0003). Botão "Esquecer a chave" sempre visível.
- Chamada direta do navegador à API (SDK com `dangerouslyAllowBrowser: true`), isolada num módulo só (`src/pmo/cliente.ts`).
- Bibliotecas empacotadas no build e servidas pelo próprio site (inclusive OCR e dados do português). Nenhum CDN em produção, nenhum script de terceiros.
- Content-Security-Policy: conexão só com o próprio site e `api.anthropic.com`.
- RFPs e propostas são confidenciais: nada é gravado em servidor; o dossiê (JSON) fica com o GP e nunca guarda a chave.
- A interface avisa que, nas etapas com o PMO, o conteúdo dos PDFs vai para a API do Claude. As etapas só com código não enviam nada.
- Conteúdo dos PMBOKs e do Rework entra na skill **resumido**, com fonte (livro, seção, página ou link); citações curtas só de definições.

## 6. Como trabalhar

- Ambiente de desenvolvimento: Windows + PowerShell (o Bash do Git também está disponível). Node e npm já instalados.
- Faça você mesmo tudo o que der (instalar, rodar testes, commits, PRs, publicação). Peça à responsável pelo projeto só o que só ela pode fazer (logins, permissões, arquivos fora da pasta, aprovações previstas), em passos curtos, e espere.
- Português do Brasil em toda a interface, documentos e commits.
- Mantenha `docs/andamento.md` sempre atualizado: fases concluídas, fase atual, decisões pendentes, próximo passo.
- Ao fim de cada fase: app rodando com o link, resumo curto (o que funciona, o que falta, o que você decidiu) e se vale abrir uma conversa nova.
