# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem a decisão [0005](docs/decisoes/0005-branches-versoes-e-tags.md).

## [Não publicado]

### F4 — plano de gerenciamento com o PMO (versão 0.7.0, construída sem a chave; teste com a chave pendente)
- **Etapa 4 na tela:** documentos usados (o TAP da etapa 3 ou o PDF aprovado; a proposta, opcional), premissas críticas, conexão com o Claude e o custo à vista.
- **Seis passos do PMO, na ordem da decisão 0007:** adaptação, ciclo de vida e abordagem; escopo; atividades, recursos e cronograma; riscos, custos e premissas; demais planos; medição e documentos de execução. As fichas das partes vão no pedido de cada passo (o prefixo fica no cache), e só as que o GP marcou.
- **Adaptação decidida pelo GP:** as 51 partes com a sugestão do PMO (essencial, recomendado, dispensável) e a justificativa; o GP marca o que gerar e escolhe a abordagem.
- **Contas do código:** matriz de rastreabilidade RFP → TAP → EAP → cronograma; cronograma com rede e caminho crítico; marcos conferidos com o TAP; designações com os nomes do GP; custos (horas × valor-hora do GP), linha de base com a contingência e orçamento com a reserva gerencial, conferidos com o TAP ou a proposta.
- **Autoconferência:** o plano gerado passa pelas regras da etapa 5; o que o GP dispensou não conta como ausente; os trechos "a definir pelo GP" aparecem à parte como decisões pendentes; características do projeto sugeridas pelo código e confirmadas pelo GP.
- **Saídas:** plano (DOCX e PDF), registros, cronograma e matrizes (XLSX), EAP e diagrama de rede (SVG) e o pacote .zip com o índice das partes.
- **Etapa 5:** usa o que o GP dispensou na etapa 4 (entra como "dispensada"), as características e as premissas críticas de lá; o requisito também é achado no plano pelo número R e pelo rótulo "Produto N".
- **Redação:** "se… então…" conta como condicional (risco escrito como condição). Os parágrafos exportados mostram os números R de cada item.
- **Demonstração** também na etapa 4, com a proposta, o TAP e o plano gravados.
- A análise da RFP fica guardada (mesmos documentos, mesmo dia): as telas das etapas 2 a 4 deixam de refazê-la a cada mudança. A fumaça roda com dois processos.
- Testes sem chave: respostas do PMO gravadas para a OEI com todas as citações achadas; contas; autoconferência; saídas; fumaça da demonstração com o pacote .zip.
- Decisão 0029. Versão do app: 0.7.0.

### F3 — termo de abertura com o PMO (versão 0.6.0, construída sem a chave; teste com a chave pendente)
- **Etapa 3 na tela:** proposta usada (o PDF final do GP ou a proposta da etapa 2 no dossiê, que vira um documento com uma "página" por seção, para as citações serem conferidas), premissas críticas, conexão com o Claude e o custo à vista.
- **Divergências RFP × proposta (código):** requisito a requisito (produtos e equipe), prazo e valor; o que o código não acha fica "não localizado na proposta — conferir". O GP decide o que vale (RFP, proposta ou outra redação).
- **O que vem dos documentos (código):** contratante, objeto, vigência, produtos, valor da proposta, entrega de cada produto no cronograma da proposta, aceite, extinção e partes, com a página.
- **Dois passos do PMO:** os 12 elementos do TAP (objetivos com critério de sucesso, marcos com prazo contado de um evento, partes com papel e decisão) e o registro de premissas inicial (tipo, origem, premissa crítica, consequência, de quem depende, como validar). Campos que só o GP preenche: recursos, gerente e autoridade, patrocinador e a aprovação.
- **Conferência do TAP (código):** elementos com conteúdo, requisitos com número R e todos os R cobertos, marcos dentro do prazo da RFP (inclusive a entrega de cada produto), recursos iguais ao valor da proposta, citações conferidas e premissas críticas no registro com a consequência.
- **Saídas:** termo de abertura (DOCX e PDF) e registro de premissas (XLSX), com minuta enquanto houver pendência.
- **Demonstração** também na etapa 3, com a proposta e o TAP gravados.
- **Etapa 1:** o valor estimado também é achado em "os recursos… estimados em R$".
- Componentes comuns de passo e de item do PMO (a etapa 2 passa a usar o item comum). Tabelas de texto longo quebram linha (sem rolagem horizontal).
- Testes sem chave: respostas do PMO gravadas para a OEI com todas as citações achadas pelo código; divergências com proposta do dossiê e em PDF; conferência; saídas; fumaça na demonstração e com a API simulada.
- Decisão 0028. Versão do app: 0.6.0.

## [0.5.1] — 13/11/2026

### Modo demonstração (decisão 0027)
- **"Ver demonstração"** na etapa 2: abre a concorrência pública da OEI com as respostas do PMO gravadas, sem chamar a API e sem custo. Cada passo do PMO vira "Carregar a resposta gravada"; a conferência das citações, o cronograma, o preço, a revisão e as saídas funcionam como no uso real.
- Aviso sempre visível, "Demonstração com respostas gravadas, sem chamada à IA", no alto de todas as telas e no cabeçalho de todo documento exportado (DOCX, PDF e XLSX). O dossiê guarda o modo.
- As respostas gravadas partem da abordagem B: com outra escolha, o app pede a B antes do conteúdo técnico, em vez de mostrar o conteúdo da B como se fosse da escolhida.
- Testes: as respostas gravadas passam pelo schema da API; o aviso vai no cabeçalho; fumaça da demonstração no navegador sem nenhuma chamada externa.
- Decisão 0027. Versão do app: 0.5.1.

## [0.5.0] — 13/11/2026

### F2 — proposta com o PMO (publicada antes do teste da responsável e sem o teste com a chave, decisão 0026)
- **Conectar ao Claude:** campo da chave, "Testar" (chamada mínima), "só nesta sessão", "lembrar neste navegador" desativado com o motivo e "Esquecer a chave" sempre visível. A chave fica só no `sessionStorage` da aba; nunca vai para o dossiê, para os exportados nem para registros.
- **Etapa 2 na tela:** ponto de partida (código, da etapa 1), três passos do PMO (estratégia e abordagens; conteúdo técnico e SOW; EAP, estimativas e equipe) com o custo estimado antes e o uso real depois, escolha da abordagem e das premissas críticas pelo GP, revisão item a item.
- **Conferência do que o PMO devolve:** citação procurada na página indicada (literal, aproximada e por partes, copiada do Raio-X), "citação não conferida" quando não acha, aviso de redação afirmativa e de número sem fonte.
- **Contas do código:** cronograma PERT com rede, folga e caminho crítico, tempo de aprovação do cliente (decisão do GP), prazo total e prazo de entrega de cada produto contra a RFP; preço de baixo para cima com os valores do GP (tributos por dentro) e conferência com o valor estimado; matriz de atendimento; limite de páginas; checklist de envio.
- **Saídas:** proposta técnica (DOCX e PDF), planilha de preço (XLSX), matriz de atendimento e checklist de envio (XLSX), perguntas de esclarecimento (DOCX).
- **Cliente da API:** SDK oficial 1.6.0, streaming, saída estruturada validada por Zod, cache da skill e dos documentos, esforço por passo, modelo de reserva da própria API em caso de recusa, erros em português.
- **Comparação de modelos** (decisão 0002): `npm run comparar-modelos`, pronta para rodar com a chave.
- Testes sem chave: API simulada (unidade e fumaça no navegador) e respostas do PMO geradas no Claude Code para a RFP pública da OEI, com todas as citações achadas pelo código.
- Guia do gerente (`docs/guia-do-gerente.md`). Decisão 0025. Versão do app: 0.5.0.

## [0.4.0] — 13/11/2026

### F1 — leitura da RFP só com código (publicada antes do teste da responsável, decisão 0026)
- **Etapa 1 na tela:** "Analisar a RFP" lê a RFP e os anexos e organiza o resultado como a análise final: pontos de atenção, identificação, mapa do documento, requisitos, prazos, julgamento, habilitação, forma de apresentação, condições contratuais, partes interessadas e vagos e brechas. Cada item com o rótulo, o documento, a página e o trecho.
- **Mapa:** seções numeradas, cláusulas e anexos (inclusive "ANEXO “A”" e o termo de referência sem a palavra "anexo"), com páginas, a separação corpo × anexos e o tema de cada seção. Cabeçalho e rodapé repetidos ficam fora das buscas.
- **Requisitos numerados** (R01, R02…): produtos, equipe mínima, quantidades e local. O número fica fixo no dossiê, segue para a conferência (etapa 5) e nunca é reaproveitado; o GP edita, descarta e inclui.
- **Prazos:** datas do certame pelo contexto (inclusive tabela de cronograma), limite de esclarecimento e impugnação **calculado pelo código** a partir da sessão (dias úteis, conferir feriados), prazos da execução com a forma de contagem e alerta do que está perto.
- **Julgamento** (critério, modo de disputa, pesos, tabela de pontuação), **habilitação** (catálogo de 31 documentos), **apresentação** e **condições contratuais** com o valor tirado por código (garantia, multas, reajuste, pagamento, subcontratação) e **partes interessadas**.
- **Vagos e brechas:** regras do Raio-X aplicadas à RFP (CTR4, CTR5, CP13, CE15, vedação de subcontratação × campo, CE17), mais prazo com valores diferentes, sessão com datas diferentes, custo de logística a cargo da contratada sem quantidade e os 10 padrões de vago. Cada uma com a pergunta de esclarecimento sugerida e os três estados (achado, não identificado, não verificável).
- **Revisão do GP** item a item (pendente, aceito, editado, descartado), "aceitar os pendentes da seção" e a **decisão de participar**, que só o GP preenche.
- **Saídas:** Análise da RFP (DOCX e PDF), Requisitos e prazos (XLSX), Checklist de habilitação (XLSX) e Perguntas de esclarecimento (DOCX). Cabeçalho de minuta enquanto houver item pendente.
- **Etapa 5:** usa os requisitos da etapa 1 quando existem; perfil de equipe é procurado no plano inteiro; quantidade e local ficam "não conferido pelo código".
- **Correção:** o vago "se necessário" não casa mais com "torna-se necessária" (etapas 1 e 5).
- Testes: cada regra de brecha com um caso que acha e outro que não acha, a análise de um edital de teste, quatro RFPs públicas (inclusive a escaneada e a de 126 páginas), o número do requisito da etapa 1 até a conferência, a redação das sugestões e a fumaça da etapa 1 no navegador.
- Decisão 0024. Versão do app: 0.4.0.

## [0.3.0] — 13/11/2026

### F5 — conferência do PGP só com código (publicada antes do teste da responsável, decisão 0023)
- **Etapa 5 na tela:** mapa do PGP (as 51 partes localizadas por título ou por conteúdo, confirmadas pelo GP: presente, dispensada ou fora do plano), características do projeto, premissas críticas (pré-marcadas, com o sinal achado nos documentos), requisitos da RFP (extraídos pelo código ou incluídos pelo GP, com número fixo).
- **Conferência:** vago (10 padrões de texto), conflituoso (texto de outro documento; prazo total × RFP × TAP), ausente (partes, conteúdo mínimo das fichas, premissas críticas no A8/B3/B27/A11, requisitos na especificação do escopo). Gravidade pela parte do PGP; categoria pela regra fixa da decisão 0008. Página ilegível deixa a verificação "não verificável", nunca "ausente".
- **Decisão do GP** em cada achado (procede ou não, troca de gravidade, justificativa), guardada no dossiê.
- **Exportação:** relatório de conformidade (DOCX e PDF, com minuta enquanto houver achado pendente) e lista de achados (XLSX).
- A skill é lida pelo app no build (fichas e premissas críticas): fonte única com o Claude Code.
- Fixture gerada pelo PMO a partir de uma RFP pública, com 9 erros plantados (vago, conflituoso e ausente em cada gravidade): todos achados, e o plano limpo não é acusado nessas regras.
- Decisões 0022 (regras da conferência) e 0023 (publicação antes do teste).
- Versão do app: 0.3.0.

### Skill PMO 0.2.0 — premissas críticas (decisão 0021)
- `checklist.md` reescrito como **premissas críticas comuns** PC1 a PC8: o que o plano assume, quando se aplica, sinais de aplicação, sinais no plano, o que acontece se não se confirmar e onde tem de estar. A PC2 (sistemas e ferramentas que não são da FGV) é nova.
- Itens novos de conteúdo mínimo: A8.12 (tratamento das premissas críticas; grave), B3.9, B27.13, A11.12, PROP-SOW.11 e TAP-PR.2.
- O que não vira premissa: CTR7 e CP9 (vago), CP8 (conflituoso), CTR2 e CTR3 (etapa 1 e proposta), CP12 e CP14 (conteúdo mínimo dos planos). Saem TC18, TC19, TC21 e TC22 e as perguntas "só se houver campo" e "só se houver beneficiários".
- `SKILL.md` 0.2.0 (princípio 11) e todas as fichas com as citações do checklist antigo trocadas pelos códigos PC, pelo tipo do problema de texto ou pelo item de conteúdo mínimo.
- `CLAUDE.md`, seção 3: os riscos da V29 entram como premissas críticas dentro do plano.

## [0.2.0] — 13/11/2026

### Fase F0 — esqueleto do app (aprovada)

### Adicionado
- App em TypeScript + React + Vite, publicado no GitHub Pages: https://izacxll.github.io/raio-x-do-projeto/
- Identidade visual da apresentação: faixa em degradê, logo da FGV Projetos, trilho da etapa, rótulos de seção, títulos com sublinhado, cartões, grade leve no fundo. Tokens num arquivo só (`src/interface/estilos/tokens.css`), documentados em `docs/identidade-visual.md`.
- Tela inicial "Em que etapa do projeto você está?", com os cinco cartões de etapa e as colunas entra / a ferramenta sugere / sai.
- Tela de cada etapa no fluxo da seção 5.0: passos, documentos obrigatórios e opcionais, aviso de envio à API nas etapas com o PMO.
- Leitura de PDF no navegador: texto por página, montado por linhas (colunas de tabela separadas por tabulação), OCR em português nas páginas sem texto, estado de cada página (texto, OCR, não verificável) com o motivo, aviso de figura ou tabela em imagem. Tudo servido pelo próprio site (decisão 0019).
- Dossiê `.dossie.json`: salvar, abrir, validação pelo esquema, aviso de mudanças não salvas. Nunca guarda a chave.
- Exportação do relatório de leitura em DOCX, PDF e XLSX, com logo, cabeçalho de minuta e versões do app e da skill.
- Content-Security-Policy no site publicado (só o próprio site e `api.anthropic.com`).
- CI: verificação do repositório público (decisão 0010), lint, formatação, testes, build e testes de fumaça no Chromium.
- 8 RFPs públicas de teste em `tests/fixtures/rfps-publicas/`, com fonte e data (inclui uma escaneada e uma de 126 páginas).
- `docs/arquitetura.md`, `docs/identidade-visual.md`.
- Decisões 0017 (F0 antes da P), 0018 (publicação e prévia da fase), 0019 (leitura de PDF) e 0020 (RFPs públicas sem mostrar a lista).

### Alterado
- Ordem das fases: a F0 vem antes da P, e as tags trocam (F0 = v0.2.0, P = v0.3.0; decisão 0005 atualizada).
- `CLAUDE.md`: as RFPs públicas de teste não precisam mais da lista mostrada antes do commit.
- Ajustes da revisão: a tela não mostra mais nomes de fases ("Em construção: a análise chega na próxima versão"); a etapa 1 lista as quatro saídas da especificação (análise, lista de requisitos e quadro de prazos, checklist de habilitação, perguntas de esclarecimento); o "entra:" dos cartões de etapa fica no rodapé. Um teste de fumaça barra termos internos na tela.

## [0.1.0] — 13/11/2026

### Fase S — skill PMO 0.1.0 (aprovada)
- `SKILL.md`: papel, princípios ("sugerir, nunca afirmar"), passo a passo das etapas 2, 3, 4 e 5 (F5b), formato de saída e o que carregar em cada etapa.
- Referências:
  - `pmbok6.md`, `pmbok7.md`, `rework.md`;
  - `licitacoes.md` (valores de 2026);
  - `checklist.md` (12 perguntas, 24 riscos da V29);
  - `experiencia.md`.
- 61 fichas em `artefatos/`, com 608 itens de conteúdo mínimo, cada um com fonte, sinais, quem confere e quando dispensar:
  - o TAP;
  - os 18 componentes e os 33 documentos do PGP;
  - as 9 partes da proposta.
- Decisões 0014 (leitura das fontes), 0015 (formato das fichas) e 0016 (códigos dos itens).

### Corrigido
- `.gitignore`: o padrão `referencias/` passa a valer só para a pasta da raiz (`/referencias/`). Antes, ele também excluía a pasta `.claude/skills/pmo/referencias/` da skill, que precisa ir para o Git.

### Fundação

### Adicionado
- `CLAUDE.md` com os princípios inegociáveis, a divisão código × PMO, a distinção entre brechas do Raio-X e riscos do projeto, as regras do repositório e as de segurança.
- `docs/andamento.md` com as fases, as decisões pendentes e o próximo passo.
- Decisões 0001 a 0013 em `docs/decisoes/`:
  - 0010: saídas do app e extensão `.dossie.json`;
  - 0011: nome do B32;
  - 0012: logo da FGV Projetos;
  - 0013: base do "ausente" em três níveis e leitura opcional do PMO na etapa 5, numa fase nova (F5b), com as tags da F3 e da F4 deslocadas na 0005.
- README inicial, modelos de issue (erro e melhoria) e de pull request.
- `.gitattributes` com fim de linha LF.
- Rótulos no GitHub: `etapa-1` a `etapa-5`, `pmo`, `regras`, `leitura`, `exportacao`, `documentacao`.

### Alterado
- `.gitignore`:
  - PDF liberado só em `tests/fixtures/rfps-publicas/`;
  - DOCX, XLSX, ZIP e `.dossie.json` liberados só em `tests/fixtures/gerados/`;
  - DOC e XLS sempre fora;
  - passa a ignorar build, relatórios de teste e `.claude/settings.local.json`.
