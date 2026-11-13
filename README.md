# Raio-X do Projeto

Ferramenta web para **gerentes de projeto da FGV Projetos**. Apoia o ciclo que vai da leitura de uma solicitação de proposta até a conferência do Plano de Gerenciamento do Projeto:

1. **Leitura da RFP** — desmembra o edital ou chamamento: requisitos numerados, prazos, julgamento, habilitação, condições contratuais, brechas e perguntas de esclarecimento.
2. **Proposta** — minuta da proposta técnica e de preço que responde à RFP.
3. **Termo de Abertura (TAP)** — os 12 elementos do termo, a partir da RFP e da proposta.
4. **Plano de Gerenciamento (PGP)** — o plano adaptado ao porte e ao tipo do projeto.
5. **Conferência do PGP** — aponta o que está vago, conflituoso ou ausente, com categoria e gravidade.

A ferramenta **prepara minutas e aponta problemas; quem decide é sempre o gerente do projeto.** Todo conteúdo vem rotulado como *Do documento* (com página e trecho), *Sugestão* ou *Decisão do GP*, e nada é inventado: o que o documento não informa aparece como "a definir pelo GP".

> **Situação:** em construção. Veja em que fase o projeto está em [`docs/andamento.md`](docs/andamento.md).

## Como usar (quando publicado)

O app roda no navegador, publicado no GitHub Pages. Os PDFs são lidos na sua própria máquina.

- **Sem chave da API:** leitura dos PDFs, etapa 1 (leitura da RFP) e etapa 5 (conferência do PGP). Nada é enviado para fora do navegador.
- **Com a chave da API:** etapas 2, 3 e 4, que usam a inteligência do PMO (Claude). A chave é pedida ao administrador do Claude da FGV, que a cria no Claude Console; o login do claude.ai não serve. A chave fica só no seu navegador, durante a sessão, e o conteúdo dos PDFs dessas etapas é enviado à API do Claude pela organização da FGV.
- O trabalho é salvo num arquivo de **dossiê** (JSON), que você guarda e reabre quando quiser. O dossiê nunca guarda a chave.

O guia completo estará em [`docs/guia-do-gerente.md`](docs/guia-do-gerente.md).

## Como rodar localmente

*Disponível a partir da fase F0 (esqueleto do app).*

## Onde fica cada coisa

| Pasta ou arquivo | O que tem |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Regras de trabalho do projeto: princípios, código × PMO, repositório e segurança |
| [`docs/andamento.md`](docs/andamento.md) | Fase atual, decisões pendentes e próximo passo |
| [`docs/decisoes/`](docs/decisoes/) | Uma decisão por arquivo |
| `.claude/skills/pmo/` | Skill PMO: a inteligência das etapas 2, 3 e 4 (fase S) |
| `src/` | Código do app (a partir da F0) |
| `tests/` | Testes e documentos públicos de teste (a partir da F0) |
| `referencias/` | Material de referência e documentos confidenciais — **fora do Git** |

## Licença

Ainda não definida. A escolha é da FGV.
