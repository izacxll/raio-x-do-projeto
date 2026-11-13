# 0022 — Regras da conferência por código (F5), primeira versão

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (detalha as decisões 0008, 0009, 0013 e 0021)

## Contexto

A F5 implementa a etapa 5 só com código. As decisões anteriores dizem o quê (três tipos, gravidade pela parte, categoria por regra fixa, base do "ausente" em três níveis, premissas críticas). Esta decisão registra o como, para ser revisto com a prova de conceito.

## Decisão

### Mapa do PGP
- **Título:** linha curta (até 110 caracteres), fora do sumário, que começa (depois da numeração) pelo nome da parte ou por um sinônimo da ficha, e em que o nome ocupa pelo menos metade da linha. A primeira ocorrência de cada parte manda. A parte vai do título até a página do título seguinte.
- **Conteúdo sem título:** sem título, mas com pelo menos metade dos itens conferíveis achados no plano, a parte é proposta como presente, "junto de outra parte", e procurada no plano inteiro.
- **O GP confirma** cada parte como presente (com ou sem páginas), dispensada (com justificativa) ou "não está no plano". Só a última vira ausente.

### Conteúdo mínimo (nível c)
- Item conferido por código: procurado primeiro nas páginas da parte; se não estiver ali, no plano inteiro ("localizado fora da parte: conferir se é o lugar certo"); só é ausente se não estiver em lugar nenhum.
- Sinais: termo entre aspas; `"A" junto de "B"` exige os dois na mesma página; trechos que "indicam" falha não são sinal de presença; sinais sem aspas (tabela, coluna) e itens "só PMO" ficam "não conferido pelo código".
- Termo com 6 letras ou mais aceita continuação ("condicionad" acha "condicionada"); termo curto exige palavra inteira.
- **Exceção:** o A8.12 (tratamento das premissas críticas no plano de riscos) só conta dentro do A8; achado em outra parte não supre o item.
- Item dispensável pelas características do projeto: "dispensável neste projeto", com o motivo.

### Não achado não é ausente
- O título de todo ausente diz "não localizado pelo código — conferir no documento". Nunca "não informado no documento".
- Se o plano tem página sem texto legível, nenhuma verificação vira ausente: todas ficam "não verificável", com as páginas.

### Premissas críticas (decisão 0021)
- A tela pré-marca todas como "se aplica" e mostra o sinal de aplicação que o código achou na RFP, no TAP ou no plano; o GP desmarca as que não se aplicam.
- Premissa que se aplica e não aparece no plano: um ausente com as partes A8, B3, B27 e A11; a A8 (grave) decide.
- Premissa que aparece no plano mas falta no B3, no B27 ou no A11 (quando a parte tem páginas): ausente naquela parte.

### Requisitos da RFP (nível a)
- Nesta versão, o código extrai só produtos e entregáveis rotulados ("Produto 1 – …"). O GP inclui na tela o que o código não achou; o número nunca é reaproveitado.
- O requisito é procurado na especificação do escopo (B17; sem ela, A13; sem ela, A1). Se estiver no plano mas fora dela, é ausente na parte do escopo, com a página onde aparece. Categoria: escopo (regra 1).

### Vago e conflituoso
- **Vago:** 10 padrões de texto (`src/regras/vago.ts`), cada um com o modelo de texto da sugestão.
- **Conflituoso:** texto de outro documento colado no plano ("neste Termo de Referência", "a licitante"; CP8) e prazo total do plano diferente do da RFP ou do TAP (categoria tempo, regra 1).
- Trecho fora de todas as partes do mapa (capa, apresentação): parte "—", gravidade baixa, categoria planejamento.

### Regras da decisão 0009 que ficam para depois
Escopo × exclusões, termos de outro tipo de contrato, teto por pessoa × volume, data fixa com início móvel, vedação de subcontratação × campo, prazo estimado × multa, mesmo marco com datas diferentes, campo sem linha de custo, eleição no período e valores por extenso. Entram nas próximas versões, cada uma com um caso que acha e outro que não acha.

### Versão
A fase P foi adiada pela responsável pelo projeto. A F5 fecha com a tag **v0.3.0**, a próxima livre; a P recebe a tag seguinte quando for feita.

## Consequências
- O relatório mostra quantos itens o código não pôde conferir (interpretação, estrutura ou página ilegível), para o GP saber o limite da conferência.
- A leitura do PMO (F5b) cobre os itens "só PMO" e o que depende de interpretação.
