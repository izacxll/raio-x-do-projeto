# 0035 — O PMO faz a leitura; o código monta o esqueleto e confere

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto, sobre a proposta do Claude Code
- **Muda:** o CLAUDE.md, seção 2 ("etapas 1 e 5 inteiras só com código"), e as decisões 0013, 0030 e 0032 no que diziam ser opcional

## Contexto

Na fase M1 (etapa 1 pelo método, decisão 0034), as regras de código foram refeitas na estrutura do método e medidas contra gabaritos de dois editais públicos, feitos pelo Claude Code seguindo a skill PMO (não são uma leitura independente; ver a seção "Como se testa sem a chave"). Números do placar final da M1 (`docs/estudos/placar-m1-etapa-1.md`, a fonte deles):

| | SMPED (parceria) | OEI (licitação) |
|---|---|---|
| Itens na tela | 122 → 40 cartões + 16 R | 183 → 39 cartões + 16 R |
| Cartões que não passam no teste do método | 82 → 6 | 102 → 3 |
| Gabarito coberto (maioria das chaves do item) | 15 → 28 de 50 | 30 → 35 de 50 |
| Gabarito coberto por inteiro | 5 → 12 | 9 → 20 |
| Números sem fonte | 0 | 0 |

O código tirou o ruído e acerta o que é mecânico (páginas, números, datas, soma das parcelas, documentos linha a linha, o padrão de cada premissa crítica). O que falta é leitura: cruzar trechos distantes (a "parcela única" de um item contra o repasse mensal de um quadro), dizer por que um ponto pesa e em que ordem, resumir uma obrigação como o gerente lê. Mais regra não chega lá; viraria uma pilha de exceções por edital.

## Decisão

1. **Em todas as etapas, o PMO faz a leitura**, na estrutura do método da etapa (`docs/estudos/metodo-etapa-<n>.md`).
2. **O código monta o esqueleto antes** e manda junto no pedido: páginas, números, datas, contas, o que as regras acharam e os números R. O PMO parte dele e não repete o que já está certo.
3. **O código confere tudo depois**, com as travas que já existem (decisões 0030 e 0032):
   - toda citação é procurada na página indicada; se não acha, o item fica "citação não conferida" e nunca aparece como fato;
   - todo número e todo prazo citado é relido no trecho; se não está lá, o item fica "valor não conferido";
   - nenhum número R, valor ou prazo é criado pelo PMO: requisito novo é sugestão até o GP aceitar;
   - as contas continuam do código (CLAUDE.md, seção 2);
   - categoria e gravidade (etapa 5) continuam por regra fixa.
4. **Tudo o que vem do PMO é Sugestão**, com a etiqueta "leitura do PMO"; o que o código conferiu no documento continua "Do documento", com a página.
5. **Sem chave**, as etapas 1 e 5 mostram o esqueleto do código, com o aviso **"leitura parcial por código"**. As etapas 2, 3 e 4 continuam pedindo a chave (ou o modo demonstração).
6. **Custo à vista** antes de cada pedido e uso real depois, como hoje. Estimativa da decisão 0032: cerca de US$ 0,20 a 0,45 por edital na etapa 1 (até US$ 0,75 num edital longo com anexos); a etapa 5 fica na mesma faixa.
7. **Envio de conteúdo:** a tela avisa, em todas as etapas, que o texto dos PDFs vai para a API do Claude quando o GP pede a leitura (CLAUDE.md, seção 5).

## Como se testa sem a chave

- Leituras gravadas, feitas no Claude Code seguindo a skill, para os editais públicos de teste (as da etapa 1 partem dos gabaritos da SMPED e da OEI). Servem também ao modo demonstração (decisão 0027).
- O placar de cada fase mede duas coisas, separadas:
  - **o esqueleto do código** contra o gabarito (o que a tela mostra sem chave);
  - **as travas** sobre a leitura gravada e sobre leituras com erros plantados (citação falsa, número trocado, R inventado, item repetido).
- A qualidade da leitura do PMO de verdade só se mede com a chave: a comparação de modelos (decisão 0002) passa a incluir a etapa 1.

## Consequências

- O CLAUDE.md, seção 2, passa a dizer: "o PMO lê, o código monta e confere"; a frase "etapas 1 e 5 funcionam inteiras só com código" sai.
- A tabela código × PMO ganha a leitura das etapas 1 e 5 na coluna do PMO.
- O sprint de regras da decisão 0032 continua, mas com outro alvo: as regras servem ao esqueleto (o que o PMO recebe) e à conferência (o que o código confere depois), não a substituir a leitura.
- As fases M1 a M5 (decisão 0034) seguem a ordem combinada, já neste desenho.
