# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem a decisão [0005](docs/decisoes/0005-branches-versoes-e-tags.md).

## [Não publicado]

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
