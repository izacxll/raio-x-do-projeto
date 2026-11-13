# Premissas críticas comuns

Versão 0.2.0 (decisão 0021).

**O que é uma premissa crítica:** algo que o plano assume que vai acontecer e que, se não acontecer, obriga a refazer escopo, prazo e metas. Não é uma lista de riscos à parte: **cada premissa crítica que se aplica ao projeto tem de estar escrita no próprio plano.**

**Origem:** a taxonomia V29 do Raio-X do Plano de Trabalho (24 riscos), levantada na pesquisa com a gestão de projetos da FGV Projetos. A maioria daqueles riscos é premissa. Este arquivo é a versão revisada, só para o Raio-X do Projeto; a V29 original não muda. Os códigos V29 ficam entre parênteses para a ligação com a pesquisa. A PC2 é nova e não tem código V29.

## Onde cada premissa crítica aparece

| Etapa | Onde | Item de conteúdo mínimo |
|---|---|---|
| 2 — proposta | Premissas do SOW, escritas com a consequência e, quando couber, como obrigação do contratante com prazo | PROP-SOW.11 |
| 3 — TAP | Premissas de alto nível, com a consequência | TAP-PR.2 |
| 4 — plano | Registro de premissas, com responsável por validar | B3.9 |
| 4 — plano | Registro de riscos, com resposta e gatilho | B27.13 |
| 4 — plano | Plano de mudanças: como reajustar escopo, prazo e metas se ela falhar | A11.12 |
| 4 — plano | Plano de riscos: como as premissas críticas são tratadas | A8.12 (grave) |
| 5 — conferência | A premissa crítica que se aplica ao projeto e não está no plano é **ausente** | — |

**Se aplica ao projeto:** o código pré-marca as premissas pelos **sinais de aplicação** na RFP, no TAP e no plano; o GP confirma na tela das características do projeto. Premissa marcada "não se aplica" pelo GP não vira ausente. Na dúvida, a pré-marcação é "se aplica", para o GP decidir. O PMO, nas etapas 2 a 4, faz a mesma pergunta: esta premissa vale para este projeto?

**Lembretes que valem para todas:**
- **Premissa escrita é verificável:** diz o que se assume, de quem depende, até quando e o que acontece se falhar. "Conta-se com a colaboração do contratante" não é premissa crítica escrita; é vago.
- **Regra de ausência:** o documento não registrar algo não prova que não exista. Antes de dizer que falta, procura-se no plano inteiro. O que o código não acha fica "não localizado pelo código — conferir no documento".
- **Redação condicional** ("sugere-se", "recomenda-se avaliar"), sempre com o trecho e a página que motivam a sugestão.
- **Sem números inventados:** prazos de aprovação, datas de início e volumes que o documento não traz ficam "a definir pelo GP".

## Formato de cada premissa

Cada premissa tem um bloco com campos fixos, lidos pelo código da etapa 5:
- **assume:** o que o plano assume;
- **aplica-se:** quando a premissa vale para o projeto;
- **sinais de aplicação:** termos na RFP, no TAP ou no plano que indicam que ela vale (`|` separa os termos);
- **sinais no plano:** termos que indicam que o plano a tratou (achar o sinal não prova que está bem tratada, só que existe);
- **se não se confirmar:** o efeito em escopo, prazo, metas e custo;
- **onde no plano:** os itens de conteúdo mínimo em que ela tem de aparecer;
- **confere:** `código` para a presença; `só PMO` para a qualidade.

---

## As 8 premissas críticas

| Código | Premissa crítica | V29 |
|---|---|---|
| PC1 | Dados e informações do cliente ou de outros órgãos chegam no prazo e na qualidade combinados | CTR4, CP13, TB24 |
| PC2 | Sistemas e ferramentas que não são da FGV funcionam | nova |
| PC3 | O cliente aprova e decide no prazo, com critério claro e com quem tenha capacidade técnica de avaliar as entregas | CTR1, CTR5, CE16 |
| PC4 | O projeto começa na data prevista | CE15 |
| PC5 | As prioridades e os interlocutores do cliente se mantêm | CE17 |
| PC6 | Parceiros, órgãos e participantes fazem a sua parte | CP13, TB23, TC20 |
| PC7 | A equipe prevista dá conta do volume | CP10, CP11 |
| PC8 | O escopo não cresce sem aditivo | CTR6 |

### PC1 — Dados e informações do cliente ou de outros órgãos chegam no prazo e na qualidade combinados (CTR4, CP13, TB24)

- **assume:** bases de dados, documentos, listas de beneficiários, cadastros e informações que o trabalho usa chegam do contratante ou de outro órgão na data e no formato combinados, atualizados e completos.
- **aplica-se:** quando algum produto ou atividade depende de dado, documento ou cadastro que a FGV não produz.
- **sinais de aplicação:** "base de dados" | "dados fornecidos" | "a contratante fornecerá" | "disponibilização" | "cadastro" | "lista de beneficiários" | "microdados" | "informações do órgão" | "dados secundários" | "após o recebimento"
- **sinais no plano:** "prazo para envio dos dados" | "dados até" | "recebimento dos dados" | "qualidade dos dados" | "saneamento" | "data de atualização" | "premissa" junto de "dados"
- **se não se confirmar:**
  - **prazo:** o produto que depende do dado atrasa; se o prazo da FGV não for contado do recebimento, o atraso do cliente vira atraso da FGV (CTR4);
  - **escopo:** cadastro desatualizado exige saneamento que não estava previsto (TB24);
  - **metas:** amostra, cobertura ou indicador calculado sobre dado incompleto perde validade;
  - **custo:** horas de coleta ou tratamento extras.
- **onde no plano:** B3.9, B27.13, A11.12, A8.12; na proposta, PROP-SOW.8 (obrigação do contratante com prazo) e PROP-SOW.11; no TAP, TAP-PR.2.
- **confere:** código (presença); só PMO (se o prazo e a qualidade estão definidos)
- **Exemplo de redação:** "Premissa: a base de [dados do contratante] é entregue até [data a definir pelo GP], atualizada há no máximo [prazo a definir pelo GP]. Se não for, os prazos dos produtos [n] passam a contar do recebimento, e o saneamento é tratado como mudança (A11)."

### PC2 — Sistemas e ferramentas que não são da FGV funcionam (nova)

- **assume:** sistema do contratante que a equipe é obrigada a usar, plataforma de terceiro, ambiente de acesso ou ferramenta indicada no edital está disponível, estável e com os acessos liberados a tempo.
- **aplica-se:** quando o edital, o TR ou o plano obriga o uso de sistema, plataforma ou ferramenta que não é da FGV, ou quando a entrega é registrada num sistema do contratante.
- **sinais de aplicação:** "sistema do contratante" | "sistema da contratante" | "plataforma" | "por meio do sistema" | "inserção no sistema" | "acesso ao sistema" | "login" | "ambiente" | "ferramenta indicada" | "sistema oficial"
- **sinais no plano:** "acesso ao sistema" | "indisponibilidade" | "instabilidade" | "credenciais" | "liberação de acesso" | "contingência" junto de "sistema" | "premissa" junto de "sistema"
- **se não se confirmar:**
  - **prazo:** atividade parada enquanto o sistema não funciona ou o acesso não sai;
  - **escopo:** trabalho manual ou registro duplicado para contornar o sistema;
  - **metas:** registros que não entram no sistema não contam para a meta medida por ele;
  - **custo:** horas extras de retrabalho e suporte.
- **onde no plano:** B3.9, B27.13, A11.12, A8.12; na proposta, PROP-SOW.8 (acessos como obrigação do contratante) e PROP-SOW.11; no TAP, TAP-PR.2.
- **confere:** código (presença); só PMO (se há contingência viável)
- **Exemplo de redação:** "Premissa: o sistema de gestão do contratante fica disponível e a equipe recebe os acessos até [data a definir pelo GP]. Indisponibilidade de mais de [prazo a definir pelo GP] suspende a contagem dos prazos afetados."

### PC3 — O cliente aprova e decide no prazo, com critério claro e com quem tenha capacidade técnica de avaliar as entregas (CTR1, CTR5, CE16)

- **assume:** o contratante tem instância de decisão definida, analisa cada produto em prazo conhecido, aceita por critério verificável e tem quem avalie tecnicamente as entregas. Inclui a limitação declarada do contratante (como não ter corpo técnico na área), que pesa justamente por ser verdadeira (CTR1).
- **aplica-se:** sempre que há produto sujeito a aprovação ou decisão do contratante (quase todo projeto). O GP pode marcar "não se aplica" com o motivo.
- **sinais de aplicação:** "aprovação" | "aceite" | "análise da contratante" | "parecer" | "validação" | "a critério da contratante" | "após aprovação" | "fiscal do contrato" | "gestor do contrato" | "comitê"
- **sinais no plano:** "prazo de análise" | "prazo para aprovação" | "aprovação tácita" | "critério de aceite" | "instância de decisão" | "quem aprova" | "ponto focal" | "dias úteis para análise"
- **se não se confirmar:**
  - **prazo:** a aprovação lenta empurra os produtos seguintes, que dependem do anterior; o caminho crítico estoura (CE16);
  - **escopo:** critério aberto gera rodadas de revisão sem fim (liga com PC8);
  - **custo:** parcela presa ao aceite atrasa o caixa; se o período sem pagamento for longo, pesa no custo financeiro (CTR5);
  - **metas:** produto aprovado por quem não avalia tecnicamente pode ser contestado depois.
- **onde no plano:** B3.9, B27.13, A11.12, A8.12; na proposta, PROP-SOW.9 e PROP-SOW.11; no TAP, TAP9 (requisitos de aprovação), TAP8 (quem decide) e TAP-PR.2.
- **confere:** código (presença); só PMO (se o critério é mensurável e o prazo é coerente com o cronograma)
- **Leia como o plano liga o pagamento:** se a nota é emitida contra a entrega, atraso no aceite não bloqueia o pagamento, a menos que o documento diga o contrário.
- **Exemplo de redação:** "Premissa: o contratante analisa cada produto em até [prazo a definir pelo GP], pela instância [a definir pelo GP], com o critério de aceite do produto. Atraso na análise desloca os produtos dependentes pelo mesmo número de dias (A11)."

### PC4 — O projeto começa na data prevista (CE15)

- **assume:** a assinatura, a ordem de serviço ou a reunião de abertura acontece na data que o cronograma usa.
- **aplica-se:** quando há prazo final fixo, data de entrega presa a evento externo ou marcos contados de datas diferentes. Na dúvida, sempre.
- **sinais de aplicação:** "a partir da assinatura" | "ordem de serviço" | "data de início" | "vigência" | "prazo de execução" | "até [data]" | data fixa de entrega
- **sinais no plano:** "data de início" | "contados da ordem de serviço" | "D+" | "dias contados" | "se o início atrasar" | "premissa" junto de "início"
- **se não se confirmar:**
  - **prazo:** o atraso é absorvido pelas etapas seguintes quando o prazo final é mantido; produtos contados de marcos diferentes ficam incoerentes;
  - **escopo:** com prazo final fixo, cabe menos trabalho no tempo que sobra;
  - **metas:** atividade sazonal (calendário escolar, safra, ano fiscal) pode perder a janela;
  - **custo:** equipe mobilizada sem poder trabalhar.
- **onde no plano:** B3.9, B27.13, A11.12, A8.12; cronograma em dias contados do início (B15); na proposta, PROP-SOW.11; no TAP, TAP6 (marcos) e TAP-PR.2.
- **confere:** código (presença); só PMO (se o reajuste proposto é viável)
- **Limite do PMO:** o PMO não avalia se o prazo total "é suficiente". O código calcula datas e folgas; o PMO aponta o que depende de datas (marco sem data, prazo contado de evento sem data).
- **Exemplo de redação:** "Premissa: o projeto começa em [data a definir pelo GP]. Os prazos são contados em dias a partir da ordem de serviço; se o início atrasar, sugere-se reajustar as datas dos produtos ou, com prazo final fixo, renegociar o escopo (A11)."

### PC5 — As prioridades e os interlocutores do cliente se mantêm (CE17)

- **assume:** a gestão do contratante, as prioridades do programa e os interlocutores que validam o trabalho continuam os mesmos durante a execução.
- **aplica-se:** quando o período de execução cruza eleição do nível do contratante, fim de mandato, troca de gestão prevista ou reestruturação anunciada; ou quando o contratante é público e o projeto dura mais de um ano. O GP confirma.
- **sinais de aplicação:** "eleição" | "transição de governo" | "nova gestão" | "mandato" | "período eleitoral" | "reestruturação" | vigência que cruza outubro de ano eleitoral
- **sinais no plano:** "período eleitoral" | "transição" | "troca de interlocutores" | "nova gestão" | "revalidação" | "premissa" junto de "gestão"
- **se não se confirmar:**
  - **escopo:** a nova gestão muda prioridades e pede outro produto;
  - **prazo:** decisões param no período eleitoral ou de transição;
  - **metas:** indicadores pensados para o programa anterior perdem sentido;
  - **custo:** retrabalho de produtos já aprovados.
- **onde no plano:** B3.9, B27.13, A11.12, A8.12; plano de engajamento (A10) com a revalidação dos interlocutores; na proposta, PROP-SOW.11; no TAP, TAP-PR.2.
- **confere:** código (presença); só PMO (se há marco de revalidação)
- **Exemplo de redação:** "Premissa: os interlocutores e as prioridades do contratante se mantêm até [marco a definir pelo GP]. Se houver troca de gestão, sugere-se uma reunião de revalidação do escopo e das metas antes do produto seguinte (A11)."

### PC6 — Parceiros, órgãos e participantes fazem a sua parte (CP13, TB23, TC20)

- **assume:** outros órgãos, prefeituras, parceiros locais, organizações do território e participantes cumprem o que o método supõe: adesão, mobilização, cessão de espaço, apoio local, resposta a convites, presença nas atividades. Inclui quem já atua no território e pode ler o projeto como concorrência (TC20).
- **aplica-se:** quando o resultado depende de quem não é a FGV nem o contratante: adesão de participantes, apoio de outros órgãos ou de parceiros locais.
- **sinais de aplicação:** "com o apoio de" | "em articulação com" | "parceiros locais" | "prefeituras" | "adesão" | "mobilização" | "participantes" | "beneficiários" | "cessão" | "sem ônus" | "rede de serviços" | "território"
- **sinais no plano:** "quem mobiliza" | "estratégia de mobilização" | "taxa de adesão" | "termo de compromisso" | "carta de apoio" | "alternativa" | "meta condicionada" | "premissa" junto de "adesão" ou "parceiro"
- **se não se confirmar:**
  - **metas:** a meta de participação ou de cobertura não é atingida;
  - **prazo:** atividades esperam a adesão ou o apoio;
  - **escopo:** a FGV assume mobilização que não estava no escopo;
  - **custo:** mais deslocamento, mais rodadas de convite.
- **Atenção à causa mal atribuída:** atribuir baixa adesão à "desconfiança das famílias" quando ninguém tem a obrigação de divulgar o programa. A causa estrutural (quem mobiliza) é o que vai para o plano.
- **onde no plano:** B3.9, B27.13, A11.12, A8.12; partes interessadas (B31) e engajamento (A10); atividades de mobilização na EAP; na proposta, PROP-SOW.8 (o que cabe ao contratante) e PROP-SOW.11; no TAP, TAP8 e TAP-PR.2.
- **confere:** código (presença); só PMO (se a meta está condicionada e a mobilização tem responsável)
- **Exemplo de redação:** "Premissa: [órgão parceiro] apoia [atividade] e os participantes aderem na proporção de [a definir pelo GP]. A meta de [indicador] fica condicionada a essa adesão; abaixo de [limite a definir pelo GP], sugere-se rever a meta ou a estratégia de mobilização (A11)."

### PC7 — A equipe prevista dá conta do volume (CP10, CP11)

- **assume:** a equipe dimensionada, com as horas e os perfis previstos, dá conta do volume, da complexidade e do território de cada frente, e cada frente tem responsável.
- **aplica-se:** sempre (todo projeto tem equipe dimensionada para um volume).
- **sinais de aplicação:** "equipe" | "horas" | "dedicação" | "perfil" | "coordenador" | "quantidade" | "volume" | "metas" | "frentes"
- **sinais no plano:** "horas por atividade" | "dimensionamento" | "pico" | "capacidade" | "responsável pela frente" | "se o volume exceder" | "premissa" junto de "equipe" ou "volume"
- **se não se confirmar:**
  - **prazo:** atraso concentrado nos meses de pico (horas iguais todo mês e trabalho pesado em poucos meses);
  - **metas:** volume prometido não é entregue com a qualidade combinada;
  - **custo:** horas extras ou reforço de equipe sem previsão;
  - **escopo:** frente sem responsável fica para trás (CP10).
- **onde no plano:** B3.9, B27.13, A11.12, A8.12; requisitos de recursos (B26), designações (B18), RACI; na proposta, PROP-SOW.11 e o quadro de equipe; no TAP, TAP-PR.2.
- **confere:** código (presença); a conta equipe × volume é do código; só PMO (se o dimensionamento cobre cada frente)
- **Exemplo de redação:** "Premissa: a equipe de [perfis] com [horas a definir pelo GP] atende ao volume de [quantidade do TR]. Se o volume exceder [limite a definir pelo GP], sugere-se tratar como mudança de escopo ou reforço de equipe (A11)."

### PC8 — O escopo não cresce sem aditivo (CTR6)

- **assume:** o escopo fica no que o contrato diz: revisões limitadas por produto, demandas extras tratadas como mudança e, no contrato público, como aditivo.
- **aplica-se:** sempre que há preço fixo ou produtos sujeitos a revisão (quase todo projeto). O GP pode marcar "não se aplica" com o motivo.
- **sinais de aplicação:** "entre outros" | "e demais atividades necessárias" | "quantas revisões forem necessárias" | "apoio" | "sempre que solicitado" | "a critério da contratante" | "preço global" | "valor fixo"
- **sinais no plano:** "rodadas de revisão" | "limite de revisões" | "fora do escopo" | "exclusões" | "termo aditivo" | "solicitação de mudança" | "premissa" junto de "escopo"
- **se não se confirmar:**
  - **escopo e custo:** trabalho a mais pelo mesmo preço;
  - **prazo:** revisões sem limite seguram a aprovação e o produto seguinte;
  - **metas:** esforço desviado para demandas fora do objeto.
- **onde no plano:** B3.9, B27.13, A11.12, A8.12; especificação do escopo com exclusões (B17); na proposta, PROP-SOW.4, PROP-SOW.5 e PROP-SOW.11; no TAP, TAP4 (limites) e TAP-PR.2.
- **confere:** código (presença); só PMO (se o limite é claro)
- **Exemplo de redação:** "Premissa: cada produto tem até [número a definir pelo GP] rodadas de revisão. Pedido além disso, ou produto novo, é tratado como solicitação de mudança e, se alterar o contrato, como termo aditivo (A11)."

---

## O que não é premissa crítica

| V29 | Tratamento |
|---|---|
| CTR7 — trecho com mais de uma leitura | Problema do próprio texto: **vago** (etapa 5). Na etapa 1, pergunta de esclarecimento; na proposta, a leitura adotada vira premissa comum (PROP-SOW.6) |
| CP9 — premissa do plano sem base | Problema do texto: **vago** |
| CP8 — texto reaproveitado de outro projeto | Problema do texto: **conflituoso** |
| CTR2 — exigência do contrato que cria o risco | Etapa 1, como pergunta de esclarecimento; proposta, como exclusão ou obrigação do contratante |
| CTR3 — atividade sem responsável | Etapa 1, como pergunta de esclarecimento; proposta, como exclusão ou obrigação do contratante (PROP-SOW.5 e PROP-SOW.8) |
| CP12 — gestão não definida desde o início | Conteúdo mínimo do plano de comunicações: A7.8 (reuniões com o cliente) e A7.9 (reuniões internas) |
| CP14 — sigilo, dados pessoais e independência técnica | Conteúdo mínimo: A12.8, A7.5, A9.10 e PROP-METODOLOGIA.9 |
| TC18, TC19, TC21, TC22 | Saem desta versão |
| TC20, TB23, TB24 | Absorvidos em PC6 (TC20, TB23) e PC1 (TB24) |

**Brecha não é premissa nem risco do projeto:** brecha é o problema que o próprio texto cria. Uma brecha pode **gerar** uma premissa crítica (o TR não dá prazo de aprovação → PC3 escrita na proposta), mas a brecha em si se resolve com esclarecimento, exclusão ou correção do texto.

## Cobertura dos 24 riscos da V29

| Código | Risco | Destino nesta versão |
|---|---|---|
| CTR1 | Premissa do contratante que não se confirma | PC3 |
| CTR2 | Exigência do contrato que cria o risco | Etapa 1 e proposta |
| CTR3 | Atividade sem responsável | Etapa 1 e proposta |
| CTR4 | Obrigação do cliente cobrada da contratada | PC1 |
| CTR5 | Aprovação e pagamento sem regras claras | PC3 |
| CTR6 | Escopo que cresce sem limite | PC8 |
| CTR7 | Trecho com mais de uma leitura | Vago |
| CP8 | Texto reaproveitado sem ajuste | Conflituoso |
| CP9 | Premissa do plano sem base | Vago |
| CP10 | Equipe sem responsáveis e atribuições claras | PC7 |
| CP11 | Equipe insuficiente para o volume | PC7 |
| CP12 | Gestão não definida desde o início | A7.8, A7.9 |
| CP13 | Dependência de terceiros | PC1 (dados), PC6 (apoio e adesão) |
| CP14 | Sigilo e independência técnica | A12.8, A7.5, A9.10, PROP-METODOLOGIA.9 |
| CE15 | Contratação atrasada e cronograma comprimido | PC4 |
| CE16 | Decisão do cliente lenta ou sem responsável | PC3 |
| CE17 | Mudança de prioridades pelo contexto político | PC5 |
| TC18 | Território e deslocamento | Sai |
| TC19 | Comunicação longa ou a distância | Sai |
| TC20 | Resistência de quem já atua no território | PC6 |
| TC21 | Adversidade climática | Sai |
| TC22 | Acidente ou violência com a equipe ou o público | Sai |
| TB23 | Resultado depende da participação de terceiros | PC6 |
| TB24 | Cadastro de beneficiários desatualizado | PC1 |

## Correspondência com as 12 perguntas da versão 0.1.0

Para quem conhece a versão anterior: pergunta 1 → vago (CTR7); 2 → PC3 (CTR1), conflituoso (CP8), vago (CP9); 3 → etapa 1 e proposta (CTR2, CTR3), PC1 (CTR4); 4 → PC3; 5 → PC8; 6 → PC7; 7 → A7.8 e A7.9 (CP12), PC3 (CE16); 8 → PC1 e PC6; 9 → PC4 e PC5; 10 → A12.8 e afins (CP14); 11 → sai, salvo TC20 → PC6; 12 → PC6 e PC1.
