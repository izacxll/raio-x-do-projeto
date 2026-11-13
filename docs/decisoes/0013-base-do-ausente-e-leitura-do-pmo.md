# 0013 — Base do "ausente" na etapa 5 e leitura opcional do PMO

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (o mecanismo de proporcionalidade, na seção 2, foi detalhado pelo Claude Code em nome dela)

## Contexto

Para apontar o que está **ausente** no PGP, a conferência precisa de uma base do que deveria estar no plano. Há uma limitação: as regras de código pegam menos do que uma leitura com interpretação. A especificação já previa um botão opcional "Pedir a leitura do PMO", que só seria implementado com o ok da responsável pelo projeto. Esta decisão dá esse ok e define quando o botão entra.

## Decisão

### 1. Três níveis de base para o "ausente"

| Nível | O que deveria estar no plano | De onde vem |
|---|---|---|
| (a) | O que a RFP e o TAP exigem: os requisitos (R01, R02…) e os 12 elementos do TAP | Etapa 1 e TAP |
| (b) | As partes do PGP (18 componentes e 33 documentos) que o GP não dispensou | Mapa do PGP e adaptação (dossiê da etapa 4 ou marcação na tela) |
| (c) | O **conteúdo mínimo** de cada parte | Fichas da skill PMO: PMBOK 6 e 7 em primeiro lugar; Rework e experiência como complemento |

### 2. Conteúdo mínimo das fichas (escrito na fase S)

- Em cada ficha de `artefatos/`, o conteúdo mínimo é uma **lista de itens curtos e numerados** pelo código da parte: A7.1, A7.2… para os componentes, B27.1… para os documentos, TAP.1… para os elementos do TAP e PROP.x… para as partes da proposta.
- Cada item traz:
  1. **fonte:** livro, seção e página, ou link do Rework;
  2. **sinais no texto:** palavras, expressões ou estruturas (tabela, matriz, datas) que mostram que o item está lá;
  3. **quem confere:** "código" (os sinais bastam) ou "só PMO" (depende de interpretação);
  4. **quando pode ser dispensado:** condições ligadas ao porte e ao tipo do projeto.
- **O PMBOK é guia, não checklist: projeto pequeno não pode sair todo vermelho.**
  - As condições de dispensa usam características que o GP confirma na tela do mapa do PGP: porte, trabalho de campo, beneficiários, subcontratação permitida e outras que a skill definir.
  - Item dispensável para o projeto não vira ausente: aparece como "dispensável neste projeto", com o motivo.

### 3. Na F5 (só código)

- O código confere os níveis (a) e (b) e, no nível (c), só os itens marcados como "código".
- Itens "só PMO" não viram achado do código. Ficam listados como "não conferido pelo código — depende de interpretação".
- Vale a regra de sempre: o item só é ausente depois da busca no plano inteiro, com sinônimos. Página sem texto legível deixa o item "não verificável".

### 4. Leitura do PMO na etapa 5 (depois da F2)

Entra quando o cliente da API e a tela da chave existirem, numa fase própria logo depois da F2 (F5b, decisão 0005).

- **Opcional**, acionada pelo GP, com **estimativa de custo antes** e uso real depois.
- O PMO lê PGP, TAP e RFP e aponta o vago, o conflituoso e o ausente que dependem de interpretação. Exemplos: equipe pequena demais para o volume; critério de aceite que não dá para medir; plano de riscos que não conversa com o cronograma. Também confere os itens "só PMO" do conteúdo mínimo.
- **Travas, todas em código:**
  - Todo achado do PMO é **Sugestão**, marcado como "leitura do PMO".
  - O código confere o trecho citado na página indicada. Se não encontrar, o achado fica "citação não conferida" e não conta como fato.
  - "Ausente" do PMO só vale depois de o código procurar o item no plano inteiro. É o aviso de ausência do Raio-X (`avisosDeAusencia`): se o texto traz o item, o achado é rebaixado e mostra onde o item está.
  - Categoria e gravidade continuam por regra fixa (decisão 0008 e gravidade pela parte do PGP), nunca pelo PMO.
- **Sem chave, a etapa 5 continua funcionando só com código.**

### 5. Na prova de conceito (fase P)

A conferência dos dois planos é feita duas vezes: só com as regras de código e com a leitura do PMO. O relatório mostra quanto o PMO acrescenta (achados a mais, por tipo e gravidade), quanto erra e quais achados do PMO poderiam virar regra de código.

## Consequências

- As fichas da fase S ficam maiores e mais estruturadas: o conteúdo mínimo serve ao mesmo tempo ao PMO (para escrever) e ao código (para conferir).
- A etapa 5 ganha uma fase a mais (F5b), e as tags das fases seguintes mudam (decisão 0005).
- Quando a leitura do PMO achar algo que o código não acha, avalia-se se uma regra pegaria. Assim o código cresce com o uso.
