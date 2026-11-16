# Fluxos das cinco análises

Um diagrama por etapa, na ordem em que a análise foi feita de verdade. "Código" é o que pode ser regra determinística; "PMO" é o que exigiu interpretação com a skill.

## Etapa 1 — leitura da RFP

```mermaid
sequenceDiagram
    participant GP
    participant C as Código
    participant P as PMO
    participant S as Skill PMO
    GP->>C: envia RFP e anexos
    C->>C: texto por página, mapa de seções e anexos
    C->>S: termos do preâmbulo na tabela de regimes (licitacoes.md §1)
    C->>GP: tipo sugerido (licitação ou parceria) para confirmar
    C->>C: extrai por seção: objeto, elegibilidade, quantitativos, valor, vigência, datas, julgamento, parcelas, metas, obrigações
    C->>C: contas: limite de esclarecimento, soma dos pontos, pontos por desconto
    C->>S: sinais de aplicação das PC (checklist.md)
    C->>C: padrões de brecha: condição sem prazo, duas leituras, prazo divergente, vigência × eleição
    P->>S: experiencia.md: condição do território, duas cargas, deslocamento, mobilização
    P->>C: pontos de atenção com base e pergunta
    C->>C: confere cada citação na página
    C->>GP: saída nas 8 seções, pontos ordenados por impacto
    GP->>C: participar? quais perguntas enviar?
```

## Etapa 2 — proposta

```mermaid
sequenceDiagram
    participant GP
    participant C as Código
    participant P as PMO
    participant S as Skill PMO
    C->>C: lê o dossiê da etapa 1 e o tipo de contrato
    C->>GP: tabela de pontos por preço e critérios de documento (a FGV tem?)
    P->>S: prop-estrategia: onde estão os pontos, 2 a 3 abordagens
    GP->>P: escolhe a abordagem
    P->>S: prop-estrutura: modelo do edital seção a seção
    P->>S: prop-sow: escopo, exclusões, obrigações do contratante com prazo, premissas PC
    P->>S: prop-estrategia.8: destino de cada ponto da etapa 1
    P->>S: prop-metodologia, prop-equipe: campo, produtividade, RACI
    C->>C: equipe pelas proporções, rampa, datas
    C->>C: preço pela estrutura do tipo de contrato, caixa parcela × custo
    C->>C: matriz de atendimento, checklist de envio
    C->>GP: minuta rotulada e lista de decisões
```

## Etapa 3 — TAP

```mermaid
sequenceDiagram
    participant GP
    participant C as Código
    participant P as PMO
    participant S as Skill PMO
    GP->>C: contrato assinado, proposta final, RFP
    C->>C: contrato prevalece, proposta é parte integrante?
    C->>C: divergências numéricas: valor, parcelas, duração × vigência, contagem dos meses, equipe, produtos
    P->>C: divergências de texto: conformidade declarada, proteção × cláusula, quem aprova, término
    C->>GP: divergências com a versão sugerida
    GP->>C: escolhe a versão de cada uma
    P->>S: ficha tap: 12 elementos com origem
    P->>S: b03: premissas da proposta + PC que faltam, com quem valida
    C->>C: conferência do TAP: valor, parcelas, marcos na vigência, aceite, PC no registro
    C->>GP: TAP e registro de premissas
```

## Etapa 4 — PGP

```mermaid
sequenceDiagram
    participant GP
    participant C as Código
    participant P as PMO
    participant S as Skill PMO
    C->>C: tipo de projeto (produtos encadeados ou operação contínua) e porte
    P->>S: Quando dispensar de cada ficha, por porte e tipo
    C->>GP: adaptação: essencial, recomendado, fundido, dispensável
    GP->>C: confirma a adaptação
    P->>S: a17, b17: fases com critério de saída, aceite, limites de volume
    C->>C: rampa de equipe, marcos, caixa acumulado e folga por parcela
    P->>S: checklist.md + b03, b27, a11, a08: cada PC nos três lugares, gatilho e reajuste
    P->>S: a06, a07, a08, a11: conteúdo mínimo dos planos que ficaram
    C->>C: autoconferência pelas regras da etapa 5, respeitando a adaptação
    C->>GP: plano e decisões (gatilhos, reservas, cadência, nomes)
```

## Etapa 5 — conferência

```mermaid
sequenceDiagram
    participant GP
    participant C as Código
    participant P as PMO
    participant S as Skill PMO
    GP->>C: plano, contrato, RFP
    C->>GP: tipo de plano (PGP ou plano de trabalho) para confirmar
    C->>C: régua: art. 22 + edital + núcleo (plano de trabalho) ou adaptação da etapa 4 (PGP)
    C->>C: comparações: valor, parcelas, frase de conformidade, duração, equipe, metas
    C->>S: checklist.md: PC aplicáveis (sinais + PC5 calculada) e três lugares
    C->>C: núcleo presente? procurar no plano inteiro com sinônimos fixos
    P->>S: experiencia.md §7: exclusões de outro tipo de projeto, premissa citada × escrita
    C->>C: gravidade pela regra fixa, um achado só para sem registro de premissas
    C->>GP: resultado em uma página, achados, o que está em ordem, anexo do que não se aplica
```
