# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem a decisão [0005](docs/decisoes/0005-branches-versoes-e-tags.md).

## [Não publicado]

### F5 — conferência do PGP só com código (em teste)
- **Etapa 5 na tela:** mapa do PGP (as 51 partes localizadas por título ou por conteúdo, confirmadas pelo GP: presente, dispensada ou fora do plano), características do projeto, premissas críticas (pré-marcadas, com o sinal achado nos documentos), requisitos da RFP (extraídos pelo código ou incluídos pelo GP, com número fixo).
- **Conferência:** vago (10 padrões de texto), conflituoso (texto de outro documento; prazo total × RFP × TAP), ausente (partes, conteúdo mínimo das fichas, premissas críticas no A8/B3/B27/A11, requisitos na especificação do escopo). Gravidade pela parte do PGP; categoria pela regra fixa da decisão 0008. Página ilegível deixa a verificação "não verificável", nunca "ausente".
- **Decisão do GP** em cada achado (procede ou não, troca de gravidade, justificativa), guardada no dossiê.
- **Exportação:** relatório de conformidade (DOCX e PDF, com minuta enquanto houver achado pendente) e lista de achados (XLSX).
- A skill é lida pelo app no build (fichas e premissas críticas): fonte única com o Claude Code.
- Fixture gerada pelo PMO a partir de uma RFP pública, com 9 erros plantados (vago, conflituoso e ausente em cada gravidade): todos achados, e o plano limpo não é acusado nessas regras.
- Decisão 0022.

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
