# Método da etapa 4 — Plano de Gerenciamento do Projeto (PGP)

Escrito pela responsável pelo projeto, a partir de um plano feito à mão para um caso real de parceria (fora do Git). Complementa a seção da etapa 4 da especificação e os métodos das etapas 1 a 3. Prevalece sobre o que a etapa faz hoje.

## 1. Para que serve

O PGP é o plano **interno** que diz como a FGV vai executar, acompanhar e encerrar o que foi assinado. Ele não repete a proposta nem o plano de trabalho entregue ao cliente. Acrescenta o que eles não têm: as premissas críticas nos três lugares, o caixa, as regras de mudança, a gestão da equipe e o acompanhamento.

**Teste de cada parte:** "se esta parte faltar, o projeto pode falhar ou o GP perde o controle de algo?" Se não, ela é dispensada na adaptação, com o motivo.

**Proporcionalidade:** o tamanho do plano segue o porte e o tipo do projeto. Nenhum projeto recebe as 51 partes por padrão.

## 2. Entradas
- TAP aprovado: divergências já decididas, os 12 elementos e o registro de premissas inicial (que vira o B3).
- Proposta final e contrato: rampa de equipe, composição de custo, parcelas ou medições, produtos.
- Dossiê das etapas 1 a 3.

## 3. Estrutura da saída (nesta ordem)

| # | Seção | Pergunta que responde |
|---|---|---|
| 1 | Adaptação | Quais partes são essenciais, recomendadas ou dispensáveis **para este tipo de projeto**, com o motivo |
| 2 | Ciclo de vida, escopo e aceite | Fases com critério de saída; EAP; aceite de cada entrega; exclusões |
| 3 | Cronograma, equipe e caixa | Marcos; rampa de equipe; repasse ou faturamento × custo acumulado |
| 4 | Premissas críticas nos três lugares | Cada PC aplicável em B3, B27 (gatilho e resposta) e A11 (reajuste), com A8 dizendo como são acompanhadas |
| 5 | Os outros planos | Os recomendados, cada um com o conteúdo mínimo que importa |
| 6 | Acompanhamento, autoconferência e decisões | Indicadores mensais, documentos da execução, conferência pelas regras da etapa 5, decisões do GP |

## 4. Regras de cada seção

### 4.1 Adaptação pelo tipo de projeto
A ferramenta reconhece o tipo pelo contrato e pela proposta e sugere a adaptação:

| Tipo | Essencial | Normalmente dispensável |
|---|---|---|
| Consultoria por produtos encadeados | EAP por produto, cronograma com dependências e caminho crítico, aceite, custos por horas, riscos, mudanças | Rampa de equipe grande, caixa mês a mês (se o pagamento é por produto aceito, o caixa vira "produto × aceite") |
| Operação contínua (campo, atendimento, equipe grande paga por parcela ou posto) | Rampa de equipe, caixa (parcela × custo), metas como métricas, premissas, mudanças, comunicação interna, substituição de pessoal | Diagrama de rede, caminho crítico, durações em três pontos, valor agregado, calendários, previsões como documentos próprios |
| Híbrido | Os dois blocos, na medida de cada parte | O que nenhum dos dois usa |

Cada linha da adaptação traz o motivo em uma frase. O que o GP dispensar fica no dossiê e não vira "ausente" na etapa 5.

### 4.2 Ciclo de vida, escopo e aceite
- Fases com **critério de saída** verificável (o que precisa estar pronto, aceito ou recebido).
- EAP: produtos (um pacote por produto) e, se houver, operação contínua (por frente de trabalho).
- Toda entrega com aceite: conteúdo mínimo, prazo de análise do cliente, número de rodadas de ajuste. Prazo que o contrato não dá é "a definir pelo GP" e vira premissa (PC3).
- Exclusões do TAP repetidas no escopo.

### 4.3 Cronograma, equipe e caixa (código)
- Marcos do TAP, dentro da vigência.
- Rampa de equipe a partir da proposta (ou dos parâmetros do edital), mês a mês ou por trimestre.
- **Caixa:** repasses ou faturamentos acumulados (percentual, data, condição) × custo acumulado. Se não houver custo mensal, aproximar pela rampa de equipe quando pessoal for a maior parte do custo, e dizer que é aproximação. Mostrar a folga em cada parcela e o ponto de menor folga.
- O caixa liga com a PC3 (aprovação que segura pagamento) e com a regra de prorrogação do contrato.

### 4.4 Premissas críticas nos três lugares
- Uma linha por PC aplicável, com quatro colunas: B3 (premissa, com o ID do registro do TAP), B27 (gatilho mensurável → resposta), A11 (como se reajusta: aditivo, prorrogação, revisão de metas) e quem valida.
- Gatilhos com número (dias de atraso, percentual da lista, folga de caixa, famílias por agente). O número é Decisão do GP.
- A8: uma frase sobre como os gatilhos são acompanhados (quem, com que frequência, onde se reporta).
- **Matriz de riscos genérica não substitui isto.** Uma matriz que cita o assunto sem premissa, gatilho e reajuste conta como "assunto citado, sem premissa escrita".

### 4.5 Os outros planos
Cada plano recomendado em poucas linhas, com o conteúdo mínimo das fichas da skill que importa para o tipo de projeto. Sempre: mudanças (fluxo, aditivo ou apostila, prazos de pedido); comunicações (com o cliente **e** interna); qualidade (métricas ligadas às metas ou aos critérios de aceite); recursos (substituição e retenção); dados pessoais quando houver.

### 4.6 Acompanhamento
- Indicadores mensais que mostram se o projeto vai bem **para o tipo**: metas × caixa × equipe numa operação contínua; valor agregado ou avanço físico × custo numa consultoria por produto.
- Documentos da execução só como modelo (estrutura e escalonamento), sem inventar acontecimentos.
- Autoconferência pelas regras da etapa 5, já com a adaptação: não acusar o que foi dispensado.

## 5. O que não entra
- Partes dispensadas pela adaptação (ficam listadas, com o motivo).
- Texto que repete a proposta ou o plano de trabalho do cliente.
- Números de gatilho, reservas ou nomes preenchidos pela ferramenta.
- Documentos da execução com conteúdo inventado.

## 6. Código × PMO
- **Código:** reconhecimento do tipo (com confirmação do GP), rampa, caixa, marcos × vigência, autoconferência.
- **PMO:** adaptação com o motivo, critérios de saída, aceite, premissas com gatilho e resposta, conteúdo dos planos.

## 7. Critério de aceite
- O plano de um projeto de operação contínua não tem diagrama de rede nem valor agregado por padrão; o de uma consultoria por produtos tem.
- Toda PC aplicável nos três lugares, com gatilho mensurável.
- O caixa mostra a folga em cada parcela e o ponto mais apertado.
- Toda entrega com aceite; todo marco dentro da vigência.
- A autoconferência pela etapa 5 não acusa nada que a adaptação dispensou.
