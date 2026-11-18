# 0032 — Leitura opcional do PMO na etapa 1

- **Data:** 16/11/2026
- **Status:** aceita em 16/11/2026, com os ajustes abaixo (muda o princípio "etapa 1 só com código")
- **Quem decidiu:** responsável pelo projeto, sobre a proposta do Claude Code

## Contexto

A engenharia reversa com o chamamento da SMPED (`docs/estudos/engenharia-reversa-etapa-1-smped.md`, removido pela decisão 0075; histórico no Git, commit `2ac4708`) mostrou o seguinte:

- 59 dos 70 erros do app são de regra de código;
- 11 só uma leitura resolve: requisitos em texto corrido e brechas que pedem cruzar trechos distantes, como a contradição do repasse ou a originalidade.

Hoje a etapa 1 é só código e sem chave (CLAUDE.md, seção 2). A F5b já fez o mesmo desenho na etapa 5 (decisão 0030): o PMO lê, o código confere e tudo sai como sugestão.

## Proposta

### O que não muda

- Sem chave, a etapa 1 continua só com código, igual a hoje.
- O código continua mandando nos números R, nos prazos calculados e nas datas. A ordem é: primeiro o sprint de regras da seção 3 do estudo, depois esta camada.

### Leitura do PMO (opcional, com custo à vista)

1. **Quando:** depois da análise por código, um botão "Pedir a leitura do PMO", com o custo estimado antes e o uso real depois (como nas etapas 2 a 5).
2. **O que vai:**
   - o `SKILL.md`, `licitacoes.md`, `checklist.md` e `experiencia.md`, no prefixo com cache;
   - o texto da RFP página a página;
   - um resumo do que o código já achou, para o PMO não repetir.
3. **O que o PMO devolve** (schema Zod novo, `src/pmo/schemas/leitura-rfp.ts`), só o que o código não achou ou achou errado:
   - requisitos em texto corrido;
   - brechas que cruzam trechos;
   - equivalências (o que faz o papel de aceite ou de subcontratação);
   - itens que o código pegou no lugar errado;
   - cada item com página e trecho literal.
4. **Travas em código** (as da F5b):
   - toda citação é procurada na página; se não acha, o item fica "citação não conferida" e não conta como fato;
   - todo prazo e todo valor citado é relido no trecho pelo código; se o número do PMO não está no trecho, o item fica "valor não conferido";
   - o que o código já achou e o PMO repete é marcado como repetido e não duplica;
   - nenhum item do PMO ganha número R sozinho: requisito do PMO é sugestão até o GP aceitar, e aí ganha o próximo número;
   - brecha do PMO segue a regra da decisão 0031 (obrigação, prazo ou entrega de quem executa).
5. **Tudo sai como Sugestão**, com a etiqueta "leitura do PMO". Na exportação, numa seção à parte, como na F5b.
6. **Aviso de envio:** a tela avisa que o texto da RFP vai para a API do Claude (CLAUDE.md, seção 5).

### Custo por edital

Pelo estimador do app (4 caracteres por token e os preços de `src/config/precos.ts`, consultados em 13/11/2026). Uma chamada; o prefixo da skill (cerca de 15 mil tokens) vai com cache.

| Edital | Texto | Entrada | Saída | Opus 5.5 | Sonnet 5.5 |
|---|---|---|---|---|---|
| Chamamento SMPED (25 p.) | ~27 mil tokens | ~45 mil | ~10 mil | ~US$ 0,40 | ~US$ 0,20 |
| Típico (40 a 80 p.) | 30 a 40 mil | 50 a 60 mil | ~10 mil | US$ 0,40 a 0,45 | US$ 0,20 a 0,23 |
| Longo com anexos (CAPES, 126 p.) | ~110 mil | ~130 mil | ~12 mil | ~US$ 0,75 | ~US$ 0,38 |

O texto é o tamanho do `pdftotext` dividido por 4, uma estimativa conservadora. A saída depende do que o código deixou de achar: depois do sprint de regras, ela cai.

### Testes sem chave

Como na F2 a F5b:

- uma leitura gravada para o edital da SMPED, gerada no Claude Code seguindo a skill;
- o teste confere que as travas pegam uma citação falsa, um valor trocado e um item repetido;
- o gabarito de `tests/fixtures/gerados/rfp-smped/` mede quanto a leitura acrescenta.

## Consequências

- Muda o princípio "etapa 1 só com código" para "etapa 1 com código, e leitura do PMO opcional". O CLAUDE.md (seção 2) e a decisão 0013 precisam dizer isso.
- A etapa 1 continua funcionando sem chave, inteira.
- Ordem sugerida: primeiro o sprint de regras (v0.8.x, sem mudança de princípio), depois esta fase (F1b), com a comparação do gabarito antes e depois.

## Ajustes da responsável (16/11/2026)

- **Catálogo antes do sprint:** o catálogo das regras das etapas 1 e 5 em `docs/regras-etapas-1-e-5.md`. Para cada regra:
  - o que confere;
  - os termos procurados;
  - em que parte;
  - se é busca de palavra ou comparação;
  - o que gera, e com que gravidade;
  - o arquivo e a linha.

  Fica marcada "a revisar" a regra que cai nos padrões do teste da responsável: convenções do app, sinal em qualquer lugar, termos genéricos, ou sem distinguir licitação de parceria nem PGP de plano de trabalho. O PR do catálogo não muda nenhuma regra: a responsável revisa antes, com a skill PMO.
- **Sprint de regras:**
  - começa pelas três de maior ganho: documentação linha a linha, obrigações da parceira e prazos da minuta;
  - cada regra nova roda nos 9 editais, sem piorar nenhum;
  - um segundo gabarito, com a RFP da OEI;
  - nada de implementar as 59 de uma vez.
- **Leitura do PMO:** estudar o google/langextract e usar a ideia, não a biblioteca:
  - exemplos no pedido, a partir dos gabaritos;
  - citação ligada ao trecho;
  - leitura em várias passadas para editais longos.
