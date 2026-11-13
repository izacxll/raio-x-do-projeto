# Modelo de ficha de artefato

Toda ficha em `artefatos/` segue este modelo (decisões 0013 e 0015). O mesmo arquivo serve a dois leitores:
- **ao PMO**, para escrever a parte nas etapas 2, 3 e 4;
- **ao código da etapa 5**, que lê o conteúdo mínimo para conferir o plano.

Por isso, o **conteúdo mínimo** tem formato fixo.

## Nome do arquivo

`<codigo>-<nome-em-kebab-case>.md`, por exemplo `a07-plano-comunicacoes.md`, `b27-registro-riscos.md`, `tap.md`, `prop-sow.md`. Os códigos de componente e documento levam dois dígitos (a01…a18, b01…b33) para a lista ficar em ordem.

## Cabeçalho (YAML)

```yaml
---
codigo: A7                      # A1–A18, B1–B33, TAP, PROP-<parte>
nome: Plano de gerenciamento das comunicações   # nome exato do PMBOK 6 em português
tipo: componente do plano       # componente do plano | documento do projeto | termo de abertura | parte da proposta
etapas: [4, 5]                  # etapas que usam a ficha
gravidade: grave                # na conferência (etapa 5): grave | média | baixa | não se aplica
categoria: partes interessadas  # decisão 0008
sinonimos: ["plano de comunicação", "matriz de comunicação"]   # títulos que o mapa do PGP reconhece
versao: 0.2.0
---
```

## Seções, nesta ordem

```markdown
# A7 — Plano de gerenciamento das comunicações

## Para que serve
2 a 4 linhas, com a fonte.

## Conteúdo mínimo
- **A7.1** <o que precisa estar no artefato, numa frase curta>
  - fonte: PMBOK 6, 10.1.3.1, p. 377 (PDF 413)
  - sinais: "reunião" | "comitê" | "semanal" | "quinzenal" | "mensal" | tabela com colunas de público, frequência e responsável
  - confere: código
  - dispensa: nunca
- **A7.2** ...

## Perguntas de qualidade
Perguntas que o PMO faz ao escrever e que a leitura do PMO (F5b) faz ao conferir. Ligadas às premissas críticas quando couber: "(PC3)".

## Erros comuns
Do PMBOK, do Rework e da experiência, cada um com a fonte.

## Quando dispensar a parte inteira
Condições de porte e tipo em que a parte pode ser dispensada ou fundida com outra, com a justificativa de uma linha que a tela de adaptação mostra.

## Ligações
De onde vem (processos, outras partes, RFP, TAP) e para onde vai. Requisitos (R01…) e elementos do TAP que costumam cair aqui.

## Modelo de redação
Estrutura sugerida (títulos e tabelas) para o PMO preencher, em redação condicional. Sem números inventados: o que o documento não traz fica "a definir pelo GP".

## Fontes
Lista completa: livro, seção e página; links do Rework (com o código RW-NNN); `experiencia.md`.
```

## Regras do conteúdo mínimo

- **Um item = uma coisa verificável.** "Reuniões com o cliente com cadência e responsável" é um item; "boa comunicação" não é.
- **fonte:** PMBOK 6 e 7 em primeiro lugar, com seção e página (impressa e do PDF). O Rework (link e código RW) e a experiência entram como complemento. Item sem fonte não entra.
- **sinais:** termos entre aspas separados por `|`, ou descrição curta de uma estrutura (tabela com tais colunas, datas, nomes de papéis). São os indícios que o código procura; achar o sinal não prova que o item está bem feito, só que existe.
- **confere:** `código` quando os sinais bastam para dizer se o item está lá; `só PMO` quando depende de interpretação (por exemplo, "o critério de aceite é mensurável").
- **dispensa:** `nunca`, ou condições escritas com as **características do projeto** abaixo, combinadas com "e" e "ou". Exemplos: `porte pequeno`; `sem campo`; `abordagem adaptativa`. Item dispensável para o projeto não vira ausente: aparece como "dispensável neste projeto", com o motivo.

## Características do projeto (vocabulário das condições de dispensa)

Confirmadas pelo GP na tela do mapa do PGP (etapa 5) ou na adaptação (etapa 4). Lista inicial, a fechar na F5.

**Em `dispensa`, use só as expressões da coluna da direita, escritas exatamente assim**, combinadas com "e" e "ou" (por exemplo, `porte pequeno e sem campo`, `porte pequeno ou porte médio`). O código da F5 lê essas expressões literalmente.

| Característica | Expressões permitidas em `dispensa` |
|---|---|
| porte | `porte pequeno` · `porte médio` · `porte grande` |
| abordagem | `abordagem preditiva` · `abordagem adaptativa` · `abordagem híbrida` |
| fases | `uma fase` · `várias fases` |
| campo | `com campo` · `sem campo` |
| beneficiários | `com beneficiários` · `sem beneficiários` |
| subcontratação | `subcontratação permitida` · `subcontratação vedada` · `subcontratação não informada` |
| dados pessoais | `com dados pessoais` · `sem dados pessoais` |
| frentes | `uma frente` · `várias frentes` |
| contratante | `contratante público` · `contratante privado` |
| pagamento | `pagamento por produto` · `pagamento por medição` · `pagamento de outra forma` |
