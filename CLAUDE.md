# CLAUDE.md — Raio-X do Projeto

App web para gerentes de projeto (GP) da FGV Projetos. Apoia o ciclo **RFP → proposta → TAP → PGP → conferência do PGP**.

**Toda conversa nova começa lendo este arquivo e `docs/andamento.md`.** Antes de mexer numa etapa, leia o **método dela** em `docs/estudos/metodo-etapa-<n>.md` (decisão 0034): para que serve, o teste de cada item, a estrutura da saída, o que não entra e o critério de aceite. Junto, o arquivo da etapa na skill PMO, `.claude/skills/pmo/referencias/etapas/etapa-<n>.md` (decisões 0074 e 0083): papel, entradas, saída, definição de pronto, armadilhas e rubrica da segunda instância. O método prevalece sobre o que a etapa faz hoje e sobre a especificação onde os dois divergem. A especificação completa está em `referencias/prompt-claude-code-raio-x-do-projeto.md` (fora do Git): leia a seção da etapa junto com o método. As decisões já tomadas estão em `docs/decisoes/`.

**Leitura e decisão, não inventário.** Cada etapa entrega ao gerente o que muda uma decisão dele ou algo que a FGV terá de fazer, entregar, cumprir ou pagar, na ordem da decisão. A régua depende do **tipo de contrato e de projeto** (consultoria por produtos, operação contínua ou híbrido; licitação ou parceria) e, na etapa 5, do **tipo de plano** (PGP interno ou plano de trabalho para o cliente).

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

**O PMO lê; o código monta o esqueleto e confere** (decisão 0035). O que é mecânico (páginas, números, datas, contas, citações) é sempre do código: previsível, gratuito, testável.

| Camada | Faz | Onde |
|---|---|---|
| Código | ler PDF (texto por página, OCR, tabelas), extrair, contar, comparar, calcular; montar o **esqueleto** que vai no pedido ao PMO; **conferir** cada citação, número e prazo que o PMO devolve; montar documentos | `src/leitura`, `src/texto`, `src/extracao`, `src/regras`, `src/exportacao` |
| PMO (API do Claude, chave do GP) | a **leitura** de cada etapa, na estrutura do método: o que pesa e por quê, cruzamento de trechos, estratégia, abordagens, conteúdo técnico, EAP, estimativas, redação do TAP e do PGP, conferência do plano | `src/pmo` + `.claude/skills/pmo/` |

- Em todas as etapas, o PMO faz a leitura a partir do esqueleto do código, e o código confere depois: citação procurada na página ("citação não conferida" se não acha), número e prazo relidos no trecho ("valor não conferido"), nenhum R, valor ou prazo criado pelo PMO. Tudo do PMO é Sugestão.
- **Nenhuma etapa analisa sem a conexão com o Claude** (decisão 0037): sem chave, nada é analisado. O site não tem modo de demonstração; a apresentação do app é feita com a skill PMO na conversa (decisão 0053). As respostas gravadas da OEI são só material dos testes automáticos, fora do build. O esqueleto do código vai no pedido e nunca aparece sozinho como resultado. A leitura dos PDFs continua no navegador; o texto só vai à API quando o GP pede a análise, com o aviso e o custo estimado antes e o uso real depois.
- Etapa 5 (decisões 0013, 0033 e 0034):
  - **Base do "ausente" pelo tipo de plano:** num plano de trabalho ou proposta para o cliente, o que a lei e o edital pedem, os requisitos e metas da RFP, as premissas críticas e o núcleo (escopo com exclusões, aceite, cronograma, equipe com substituição, riscos, mudanças, comunicação); o resto vai para "não se aplica a este tipo de plano". Num PGP interno: (a) requisitos da RFP e elementos do TAP; (b) partes do PGP que o GP não dispensou; (c) conteúdo mínimo de cada parte, que vem das fichas da skill com itens numerados (A7.1…) e diz, item a item, se o código confere ou só o PMO.
  - **Leitura do PMO** (F5b; principal desde a decisão 0035): todo achado dela é Sugestão. A citação é conferida por código e o "ausente" só vale depois da busca do código na parte apontada, sem a evidência do próprio achado. Categoria e gravidade continuam por regra fixa.
  - **Achado do código é candidato até o veredito do PMO** (decisão 0052): sustenta, falso (com o trecho), não se aplica ou regra errada; só o "sustenta" conta no total. A dispensa que só o plano declara também é candidata; a da etapa 4 vale direto.
  - **Proporcionalidade:** o PMBOK é guia, não checklist; projeto pequeno não pode sair todo vermelho.
- Todas as contas são feitas por código, nunca pelo modelo.
- Textos das etapas por código (sugestões, perguntas, pontos de atenção) saem de **modelos de texto** escritos junto de cada regra, em redação condicional.
- Quando o PMO achar algo que o código não achou, avalie se uma regra pegaria e proponha a regra.
- A skill PMO (`.claude/skills/pmo/`) é **fonte única**: usada pelo Claude Code e importada no build do app (`?raw`).

## 3. Brechas do Raio-X ≠ riscos do projeto; riscos da V29 = premissas críticas

O Raio-X do Plano de Trabalho (código em `referencias/raio-x/`, fora do Git) aponta os problemas que **o próprio texto** cria: o que está escrito errado, o que ficou em aberto, o que transfere responsabilidade para a FGV. Isso são **brechas**. O **registro de riscos do PGP** (etapa 4) é outra coisa. Não misture os dois.

- Não altere o Raio-X original. Reaproveite copiando, com `// origem: App-final-4.jsx, <função>, linha N`.
- Não mude metodologia, taxonomia V29, códigos ou prompts do Raio-X sem aprovação explícita. A V29 continua como está no Raio-X do Plano de Trabalho.
- **Riscos da V29 viram premissas críticas, dentro do plano** (decisão 0021). No Raio-X do Projeto, a V29 revisada é o `checklist.md` da skill: 8 premissas críticas comuns (PC1 a PC8), e não uma lista de riscos à parte.
  - Cada premissa crítica que se aplica ao projeto aparece no plano em três lugares: registro de premissas (B3), registro de riscos com resposta e gatilho (B27) e plano de mudanças, com o modo de reajustar escopo, prazo e metas (A11). O plano de riscos (A8) diz como elas são tratadas; a falta conta como grave. Na proposta e no TAP, ela já sai escrita, com a consequência.
  - Na etapa 5, a premissa crítica que se aplica e não está no plano é **ausente**. O GP confirma quais se aplicam.
  - Não viram premissa: duas leituras (CTR7) e premissa sem base (CP9) são **vago**; texto de outro projeto (CP8) é **conflituoso**; o que o edital empurra para a FGV (CTR2, CTR3) vai para a etapa 1 (pergunta de esclarecimento) e para a proposta (exclusão ou obrigação do contratante); gestão (CP12) e sigilo/LGPD (CP14) são conteúdo mínimo das fichas dos planos. TC18, TC19, TC21 e TC22 saem.
  - Exemplos no repositório não citam projeto nem sistema real.
- Na etapa 5, os achados usam só **vago, conflituoso e ausente** e a gravidade pela parte do plano (decisões 0008 e 0009); ao lado deles, a seção "O que está em ordem" aparece sempre (método da etapa 5).

## 4. Regras do repositório

- **Público.** Tudo que entra no Git (inclusive o histórico) fica visível. Antes de cada commit, confira o que vai entrar (`git diff --cached --stat`).
- **Branches:** a `main` está sempre funcionando. Cada fase em `fase/<id>-<nome>`; correções em `correcao/<nome>`. Tudo entra por pull request com descrição. **Nunca commit direto na `main`.** Ao fim de cada fase: PR → teste e ok da responsável pelo projeto → merge, tag e release (decisão 0005).
- **Commits** pequenos, em português: `tipo(escopo): descrição` (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`).
- **CHANGELOG** atualizado em todo PR. Tag e release ao fim de cada fase.
- **Rótulos:** `etapa-1` a `etapa-5`, `pmo`, `regras`, `leitura`, `exportacao`, `documentacao`.
- **Nomes** (decisão 0004): domínio em português, sem acento nos identificadores; funções em camelCase com verbo; tipos e componentes em PascalCase; arquivos em kebab-case.
- **Decisões:** toda decisão tomada pela responsável pelo projeto ou por você em nome dela vira um arquivo em `docs/decisoes/`.
- **Documentos de teste:** público pode, confidencial nunca.
  - RFPs publicadas oficialmente → `tests/fixtures/rfps-publicas/`, com fonte (link) e data do download no README da pasta. Não é preciso mostrar a lista antes de comitar (decisão 0020).
  - Saídas geradas a partir delas, antes de qualquer edição de GP e sem preço nem nomes → `tests/fixtures/gerados/`.
  - **Nunca no Git:** RFP privada não publicada; documentos escritos por pessoas da FGV (TAPs, planos, o caso da prova de conceito); versões finais do GP; qualquer documento interno. Ficam em `referencias/`, assim como o que for gerado a partir deles.
  - O caso real da prova de conceito nunca é identificado no Git: em `docs/` ele é só "um caso real de política pública".
- **Nada indevido no Git** (decisão 0010):
  - build, `node_modules` e chaves;
  - PDF fora de `tests/fixtures/rfps-publicas/`;
  - DOCX, XLSX, ZIP e dossiê (`.dossie.json`) fora de `tests/fixtures/gerados/`;
  - DOC e XLS em lugar nenhum.
  
  A partir da F0, o CI falha se aparecer qualquer um desses ou texto com cara de chave.
- **Licença:** nenhuma até a FGV decidir. Não adicione.
- A fonte Gotham é paga: nunca inclua os arquivos dela.
- O logo da FGV Projetos vem da responsável pelo projeto (`referencias/identidade/`). Nunca invente um. Ele é copiado para `src/interface/ativos/` e é o **único arquivo de `referencias/` que entra no Git** (decisão 0012).

## 5. Segurança e confidencialidade

- Cada GP usa a própria chave da API (organização da FGV no Claude Console). A chave fica **só no navegador** de quem usa: nunca no código, no repositório, no dossiê, nos exportados ou em logs.
- Chave em `sessionStorage` ("só nesta sessão"). "Lembrar neste navegador" está **desativado** por causa da origem compartilhada do GitHub Pages (decisão 0003). Botão "Esquecer a chave" sempre visível.
- Chamada direta do navegador à API (SDK com `dangerouslyAllowBrowser: true`), isolada num módulo só (`src/pmo/cliente.ts`).
- Bibliotecas empacotadas no build e servidas pelo próprio site (inclusive OCR e dados do português). Nenhum CDN em produção, nenhum script de terceiros.
- Content-Security-Policy: conexão só com o próprio site e `api.anthropic.com`.
- RFPs e propostas são confidenciais: nada é gravado em servidor; o dossiê (`<projeto>.dossie.json`) fica com o GP e nunca guarda a chave.
- A interface avisa que, nas etapas com o PMO, o conteúdo dos PDFs vai para a API do Claude. As etapas só com código não enviam nada.
- Conteúdo dos PMBOKs e do Rework entra na skill **resumido**, com fonte (livro, seção, página ou link); citações curtas só de definições.

## 6. Como trabalhar

- **Papéis e revisão:** [docs/papeis.md](docs/papeis.md) traz o objetivo (o GP decide rápido e com segurança a partir do documento) e quem decide o quê. A revisão tem três camadas, nesta ordem: testes e gabarito (`tests/pmo/gabarito/`), depois a segunda instância com a rubrica, depois o GP.
- Revisões de passo: usar `.claude/skills/revisao-segunda-instancia`.
- **Revisão de código:** o subagente `.claude/agents/revisor-codigo.md`, nível `low` em todo commit de código e `high` antes do merge de PR que mexe em exportação, importação, vigia, segurança ou pedidos. Ele só lê e reporta; não repete o que a CI e os hooks já fazem.
- **Protocolo de teste:** as 5 etapas, com a segunda instância em cada passo e no máximo 2 rodadas; depois, o GP decide se segue ou pede mais uma rodada (decisões 0059 e 0060).
- Ambiente de desenvolvimento: Windows + PowerShell (o Bash do Git também está disponível). Node e npm já instalados.
- Faça você mesmo tudo o que der (instalar, rodar testes, commits, PRs, publicação). Peça à responsável pelo projeto só o que só ela pode fazer (logins, permissões, arquivos fora da pasta, aprovações previstas), em passos curtos, e espere.
- Português do Brasil em toda a interface, documentos e commits.
- Mantenha `docs/andamento.md` sempre atualizado: fases concluídas, fase atual, decisões pendentes, próximo passo.
- Ao fim de cada fase: app rodando com o link, resumo curto (o que funciona, o que falta, o que você decidiu) e se vale abrir uma conversa nova.
