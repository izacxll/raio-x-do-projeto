# 0031 — Parceria com OSC (termo de fomento ou de colaboração) na leitura da RFP; correção v0.8.1

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (os sete pontos do teste da etapa 1 com um chamamento público para termo de fomento) e Claude Code, em nome dela (como cada ponto foi feito)

## Contexto

O teste da etapa 1 com um chamamento público municipal para termo de fomento (Lei 13.019/2014), publicado e incluído em `tests/fixtures/rfps-publicas/`, deu resultado fraco: as regras da F1 (decisão 0024) supunham licitação. Saiu um requisito só (um campo em branco do formulário do Plano de Trabalho), faltaram os prazos contados de marcos sem data, a tabela de critérios saiu misturada com a coluna de níveis, a habilitação apontou trechos fora da lista de documentos, garantia e reajuste saíram como "não localizado" e o PDF exportado quebrava palavras nas colunas estreitas.

## Decisão

### Modalidade
- O código reconhece a **parceria com organização da sociedade civil** pela abertura do documento (três primeiras páginas): "termo de fomento", "termo de colaboração" ou "acordo de cooperação", ou a Lei 13.019/2014 citada sem modalidade de licitação (pregão, concorrência…). A identificação ganha o item "Tipo de parceria".
- Na parceria: a **"fase de celebração"** é tema de habilitação no mapa; o **Plano de Trabalho no modelo do edital** é o modelo de proposta; a seção **"Das sanções"** conta como penalidades, com as sanções citadas (advertência, suspensão, impedimento, inidoneidade, multa) lidas por código.
- **Garantia de execução, reajuste, matriz de riscos e sessão pública**, quando não achados, saem com a nova situação **"não se aplica a esta modalidade — conferir no documento"**, não "não localizado". Se o documento os trouxer, saem como achados. A situação nova não alimenta os pontos de atenção, a proposta nem o TAP (como "não localizado").

### Requisitos
- **Campo de formulário em branco** ("Local de realização:  Horários:", "(DDD)", "R$ (extenso)") não é exigência: o código o ignora.
- Novo tipo de requisito, **"Condição do objeto"** (no dossiê, `condicao`): público-alvo, limite por proponente, prazo de execução, forma de execução (presencial, a distância, remota) e acessibilidade obrigatória, procurados nas seções de objeto e escopo. Condição com a mesma frase de um requisito já listado não entra de novo. "Projetos" e "propostas" entram nas unidades de quantidade ("até 15 projetos").
- Na etapa 5, a condição do objeto fica "não conferida pelo código" (como quantidade e local): depende de leitura.

### Prazos
- "Vigorará pelo período de N meses" é vigência; "desenvolvido no período de N meses" é prazo de execução.
- **Prazos do certame contados de um marco sem data** ("em até 30 dias corridos após a publicação do edital", "25 dias úteis contados do fim do prazo de inscrição", "5 dias úteis contados da publicação da decisão", "5 dias úteis após a publicação" para os documentos): só no corpo do documento (os anexos, como a minuta, têm os prazos da execução), classificados pela frase (recursos, resultado, envio de documentos, entrega das propostas). O código não calcula a data, porque o marco não tem data.
- Esclarecimento "com antecedência mínima de N dias úteis da data limite para envio" também é lido.
- A regra CE17, quando acha o prazo de execução mas não há data fixa do certame, diz isso (e onde está o prazo), em vez de "prazo de execução em número".

### Julgamento
- **Tabela de critérios com coluna de níveis** (REGULAR, PARCIAL, IRREGULAR e similares): o código separa as duas colunas que o leitor de PDF cola na mesma linha, junta as linhas de cada critério (letra entre parênteses), põe o nível solto no critério certo (o da linha de baixo só quando o atual já tem aquele nível) e tira do critério o pedaço do texto do nível que veio colado. Cada critério vira um item com a maior pontuação e os níveis.
- **Pontuação máxima** do documento conferida com a soma das máximas (conta do código); **pontuação mínima** ("inferior a 40 pontos") lida.
- "A avaliação e a pontuação serão feitas com base nos critérios de julgamento" é o critério **"Pontuação por critérios"**.

### Habilitação
- **Com seção de habilitação ou participação no mapa, só vale o trecho dentro dela** (da linha do título até o título seguinte, não a página inteira). Sem seção no mapa, o documento inteiro, com aviso.
- A regularidade municipal reconhece "tributos mobiliários" e "débitos municipais"; a declaração de reserva de cargos para pessoa com deficiência exige "reserva de cargos" (não qualquer menção a pessoa com deficiência).
- Numa lista numerada sem ponto final entre os itens, o trecho começa no número do item que tem o documento.

### Brechas
- "Eventualmente" na cláusula de foro e "entre outras" nas atribuições da própria administração (gestor, fiscal, comissão…) não são marcados: não abrem escopo nem prazo de quem executa.

### PDF exportado
- Cada coluna tem no mínimo a largura da sua palavra mais longa (título em negrito incluído; endereço de site e nome de arquivo muito longos podem quebrar); o resto é dividido pelos pesos. As larguras são de conteúdo: a margem interna da célula fica por fora. Se as tabelas não cabem em retrato, o documento vai para paisagem; por fim, fonte 8.
- Rótulos curtos na tabela ("Documento", "Sugestão", "Decisão do GP"). Origem e trecho numa coluna só. O trecho que repete o conteúdo vira "(o trecho é o conteúdo)"; o mesmo trecho da linha de cima vira "(mesmo trecho da linha de cima)"; a mesma observação em linhas seguidas sai só na primeira.

## Consequências

- Os editais de licitação continuam com as regras anteriores; as respostas gravadas do PMO (OEI) continuam valendo, com os mesmos números R.
- Dossiês antigos continuam válidos (o tipo `condicao` só se soma aos anteriores). Análise refeita no edital de teste numera os requisitos de outro jeito; a do dossiê, já salva, não muda.
- O "eventualmente" do item 1.1 do edital de teste (incorporação futura pela rede pública) continua marcado como vago: fica para a responsável dizer se a regra deve ir além do foro.
- Testes: `tests/etapas/chamamento-termo-fomento.test.ts`, um bloco por ponto, com o edital de teste.
