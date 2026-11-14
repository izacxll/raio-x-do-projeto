# Decisões

Uma decisão por arquivo, numerada em ordem. Cada uma registra o contexto, o que foi decidido, as consequências e quem decidiu. Decisão substituída não é apagada: ganha o status "substituída por NNNN".

| Nº | Decisão | Status |
|---|---|---|
| [0001](0001-stack.md) | Stack: TypeScript + React + Vite, estática no GitHub Pages | aceita |
| [0002](0002-modelo-padrao.md) | Modelo da API: Opus 5.5 provisório, escolha final na F2 | provisória |
| [0003](0003-chave-da-api.md) | Chave só em `sessionStorage`; "lembrar neste navegador" desativado | aceita |
| [0004](0004-padrao-de-nomes.md) | Padrão de nomes no código | aceita |
| [0005](0005-branches-versoes-e-tags.md) | Branches, versões e tags por fase | aceita |
| [0006](0006-ficha-do-tap.md) | Ficha do TAP num arquivo só, com 12 seções | aceita |
| [0007](0007-ordem-da-etapa-4.md) | Ordem de geração das partes do PGP (etapa 4) | aceita |
| [0008](0008-tabela-de-categoria.md) | Tabela fixa de categoria dos achados (etapa 5) | aceita |
| [0009](0009-regras-do-raio-x-nos-tres-tipos.md) | Regras do Raio-X traduzidas em vago, conflituoso e ausente | aceita |
| [0010](0010-saidas-e-dossie-fora-do-git.md) | Saídas do app e dossiê fora do Git; extensão `.dossie.json` | aceita |
| [0011](0011-nome-do-b32.md) | Nome do B32: "Termo de nomeação da equipe" (team charter), com sinônimos | aceita |
| [0012](0012-logo-da-fgv-projetos.md) | Logo da FGV Projetos: único arquivo de `referencias/` que entra no Git | aceita |
| [0013](0013-base-do-ausente-e-leitura-do-pmo.md) | Base do "ausente" em três níveis; leitura opcional do PMO na etapa 5 (F5b) | aceita |
| [0014](0014-leitura-das-fontes-da-skill.md) | Leitura das fontes da skill: texto extraído, notas e índices fora do Git | aceita |
| [0015](0015-formato-das-fichas.md) | Formato fixo das fichas de artefato (conteúdo mínimo legível pelo código) | aceita |
| [0016](0016-codigos-dos-itens-das-fichas.md) | Códigos dos itens das fichas (TAP1.1, TAP-PR, PROP-SOW.1, RK01) e pendências do vocabulário | aceita |
| [0017](0017-f0-antes-da-fase-p.md) | F0 antes da fase P; as tags das duas trocam de lugar | aceita |
| [0018](0018-publicacao-e-previa-da-fase.md) | Publicação no GitHub Pages e prévia da fase antes do merge | aceita |
| [0019](0019-leitura-de-pdf.md) | Leitura de PDF: bibliotecas, OCR local e estado de cada página | aceita |
| [0020](0020-rfps-publicas-sem-mostrar-a-lista.md) | RFPs públicas de teste entram no Git sem a lista ser mostrada antes | aceita |
| [0021](0021-riscos-da-v29-viram-premissas-criticas.md) | Riscos da V29 viram premissas críticas do plano (PC1 a PC8); skill PMO 0.2.0 | aceita |
| [0022](0022-regras-da-conferencia-f5.md) | Regras da conferência por código (F5), primeira versão; F5 com a tag v0.3.0 | aceita |
| [0023](0023-f5-publicada-antes-do-teste.md) | F5 e skill 0.2.0 publicadas antes do teste da responsável (só esta fase) | aceita |
| [0024](0024-leitura-da-rfp-f1.md) | Leitura da RFP só com código (F1): mapa, extração, prazos calculados, brechas com pergunta, revisão do GP | aceita |
| [0025](0025-proposta-com-o-pmo-f2.md) | Proposta com o PMO (F2), construída sem a chave: três passos do PMO, conferência do que ele devolve, contas do código, tela da chave, comparação de modelos | aceita (teste com a chave pendente) |
| [0026](0026-f1-e-f2-publicadas-antes-do-teste.md) | F1 e F2 publicadas antes do teste da responsável; ordem F3, F4 e F5b e as tags v0.6.0, v0.7.0 e v0.8.0 | aceita |
| [0027](0027-modo-demonstracao.md) | Modo demonstração: botão "Ver demonstração" com as respostas gravadas do PMO para a RFP pública da OEI, sem chamada à API; aviso na tela e nos exportados | aceita |
| [0028](0028-termo-de-abertura-f3.md) | Termo de abertura com o PMO (F3), construído sem a chave: proposta do dossiê como documento, divergências RFP × proposta, o que vem dos documentos, 12 elementos e registro de premissas, conferência do TAP | aceita (teste com a chave pendente) |

Modelo para uma nova decisão:

```markdown
# NNNN — Título

- **Data:** dd/mm/aaaa
- **Status:** proposta | aceita | provisória | substituída por NNNN
- **Quem decidiu:** responsável pelo projeto | Claude Code, em nome da responsável

## Contexto
## Decisão
## Consequências
```
