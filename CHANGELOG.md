# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem a decisão [0005](docs/decisoes/0005-branches-versoes-e-tags.md).

## [Não publicado]

### Adicionado
- `CLAUDE.md` com os princípios inegociáveis, a divisão código × PMO, a distinção entre brechas do Raio-X e riscos do projeto, as regras do repositório e as de segurança.
- `docs/andamento.md` com as fases, as decisões pendentes e o próximo passo.
- Decisões 0001 a 0009 em `docs/decisoes/`.
- README inicial, modelos de issue (erro e melhoria) e de pull request.
- `.gitattributes` com fim de linha LF.
- Rótulos no GitHub: `etapa-1` a `etapa-5`, `pmo`, `regras`, `leitura`, `exportacao`, `documentacao`.

### Alterado
- `.gitignore`: libera PDFs só em `tests/fixtures/rfps-publicas/` e passa a ignorar build, relatórios de teste e `.claude/settings.local.json`.
