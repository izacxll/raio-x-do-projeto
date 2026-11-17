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

## 3. Estrutura da saída (nesta ordem, decisão 0007)

A saída é o **plano inteiro**, não um resumo. Cada parte que a adaptação mantém sai com o conteúdo mínimo da ficha, preenchido com o que os documentos dão e marcado Do documento, Sugestão ou Decisão do GP.

| # | Seção | Partes |
|---|---|---|
| 0 | O projeto em uma página | Objeto, valor, vigência, parcelas, equipe, metas, produtos |
| 1 | Adaptação | As 51 partes: essencial, recomendada, fundida ou dispensável, com o motivo da ficha |
| 2 | Ciclo de vida e abordagem | A17 (A18 fundido): fases com critério de saída, quem decide a passagem, ato formal; parcelas como portões |
| 3 | Escopo | B22 (requisitos R), B17 (aceite por entrega, limites de volume, exclusões), EAP com dicionário (A13), B23, A1 (A2 fundido) |
| 4 | Atividades | B2 com B1: predecessora, dependência externa, marco |
| 5 | Recursos | B26 (rampa), B24, B18 (RACI, um A por linha), A6, B12, B25, B32 |
| 6 | Durações e cronograma | B8/B4 (três pontos só onde há incerteza, com a base), B16 (predecessoras e caminho crítico), B11/B15 (marcos; entrega ≠ aprovação), B13, B29, A14, A3 |
| 7 | Riscos | A8 (escalas, reservas, A8.12) e B27 (causa → efeito, P, I, resposta, gatilho, dono, PC) |
| 8 | Custos | B6 (composição com análise), reservas, A15 e caixa, A4 |
| 9 | Premissas | B3 atualizado a partir do TAP, com risco e reajuste por linha |
| 10 | Demais planos | A5 e B20, A7 e B14, A9, A10 e B31, A11 (A12 fundido) com a tabela PC → reajuste |
| 11 | Medição | A16: planejado × real, limites, plano de exceção |
| 12 | Documentos da execução | Só modelos (colunas e frequência) |
| 13 | Autoconferência e decisões do GP | Regras da etapa 5 sobre a adaptação; lista numerada do que o GP decide |

## 4. Regras de cada seção

### 4.1 Adaptação pelo tipo de projeto
A ferramenta reconhece o tipo pelo contrato e pela proposta e sugere a adaptação:

| Tipo | Essencial | Normalmente dispensável |
|---|---|---|
| Consultoria por produtos encadeados | EAP por produto, cronograma com dependências e caminho crítico, aceite, custos por horas, riscos, mudanças | Rampa de equipe grande, caixa mês a mês (se o pagamento é por produto aceito, o caixa vira "produto × aceite") |
| Operação contínua (campo, atendimento, equipe grande paga por parcela ou posto) | Rampa de equipe, caixa (parcela × custo), metas como métricas, premissas, mudanças, comunicação interna, substituição de pessoal | Valor agregado completo (substituído por planejado × real de metas, caixa e equipe); três pontos em atividades repetitivas |
| Híbrido | Os dois blocos, na medida de cada parte | O que nenhum dos dois usa |

**O porte vale junto com o tipo**, pela seção "Quando dispensar" de cada ficha. Em porte médio ou grande: as estimativas de duração (B8) não se dispensam; a rede (B16) é recomendada, ao menos como tabela de predecessoras com as dependências externas como marcos; os calendários (B13) são recomendados quando há campo; a configuração (A12) se funde ao plano de mudanças, mas não se omite.

Cada linha da adaptação traz o motivo em uma frase, com a regra da ficha. O que o GP dispensar fica no dossiê e não vira "ausente" na etapa 5.

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
- **Dado que só existe depois de um evento** (por exemplo, os dados administrativos da edição em curso de um evento): entra no cronograma depois do fim do evento, numa atividade própria de recebimento, ligada à premissa crítica de quem fornece o dado (em geral a PC1, dados e acessos do contratante). Não aparece como recebido antes de o evento terminar, nem junto da coleta de dados das edições anteriores.

### 4.4 Premissas críticas nos três lugares
- Uma linha por PC aplicável, com quatro colunas: B3 (premissa, com o ID do registro do TAP), B27 (gatilho mensurável → resposta), A11 (como se reajusta: aditivo, prorrogação, revisão de metas) e quem valida.
- Gatilhos com número (dias de atraso, percentual da lista, folga de caixa, famílias por agente). O número é Decisão do GP.
- A8: uma frase sobre como os gatilhos são acompanhados (quem, com que frequência, onde se reporta).
- **Matriz de riscos genérica não substitui isto.** Uma matriz que cita o assunto sem premissa, gatilho e reajuste conta como "assunto citado, sem premissa escrita".

### 4.5 Os outros planos
**Porte reduz documentos, não cobertura** (decisão 0044): cada plano mantido cobre todos os itens do conteúdo mínimo da sua ficha que valem para o projeto, uma linha por item basta; o item que a condição de dispensa da ficha tira sai como dispensado, com a condição. "Ausente" não é estado final: item ausente obriga a gerar o conteúdo ou a marcá-lo como dispensado ou Decisão do GP. A geração vai em quatro blocos (seções 0 a 3, 4 a 6, 7 a 9, 10 a 12), cada um com a autoconferência das suas partes; se um bloco acha item ausente, regenera-se só aquela parte. Sempre: mudanças (fluxo, aditivo ou apostila, prazos de pedido); comunicações (com o cliente **e** interna); qualidade (métricas ligadas às metas ou aos critérios de aceite); recursos (substituição e retenção); dados pessoais quando houver.

### 4.6 Acompanhamento
- Indicadores mensais que mostram se o projeto vai bem **para o tipo**: metas × caixa × equipe numa operação contínua; valor agregado ou avanço físico × custo numa consultoria por produto.
- Documentos da execução só como modelo (estrutura e escalonamento), sem inventar acontecimentos.
- Autoconferência pelas regras da etapa 5, já com a adaptação: não acusar o que foi dispensado.

### 4.7 O que montar o plano por inteiro revela (regras novas)
- **Produtividade × quadro:** visitas (ou atendimentos) previstos ÷ pessoas ÷ dias úteis comparado ao teto escrito na proposta. Se passar, é premissa crítica (PC7) e decisão do GP antes da execução.
- **Leitura dos meses:** quando o quadro de equipe tem menos meses que a vigência, dizer como os meses se alinham (mobilização antes do campo) e registrar como premissa.
- **Jornada × vigência:** se o percurso de um beneficiário é maior que o tempo de campo, a meta é de atendimento no período; registrar e prever a transição.
- **Parcelas:** comparar a ordem e o percentual com o edital; diferença é decisão do GP, e o caixa mostra o efeito.
- **Reservas em parceria:** o repasse só paga o plano de trabalho; contingência é margem de prazo e remanejamento; reserva gerencial, se houver, é da FGV. Saldo é descontado do repasse seguinte.
- **Exclusões:** lista de outro tipo de projeto não serve; escrever as do objeto (o que é da rede, do contratante, dos municípios).

## 5. O que não entra
- Partes dispensadas pela adaptação (ficam listadas, com o motivo).
- Texto que repete a proposta ou o plano de trabalho do cliente.
- Números de gatilho, reservas ou nomes preenchidos pela ferramenta.
- Documentos da execução com conteúdo inventado.

## 6. Código × PMO
- **Código:** reconhecimento do tipo (com confirmação do GP), rampa, caixa, marcos × vigência, janela até marco fixo, autoconferência e o teste que reprova item sem marca.
- **PMO:** adaptação com o motivo, critérios de saída, aceite, premissas com gatilho e resposta, conteúdo dos planos.

## 7. Critério de aceite
- O plano sai inteiro (seções 0 a 13); nenhuma parte mantida pela adaptação fica só descrita.
- O quadro de equipe é conferido contra a produtividade e o cronograma contra a vigência.
- O plano de um projeto de operação contínua não tem diagrama de rede nem valor agregado por padrão; o de uma consultoria por produtos tem.
- Toda PC aplicável nos três lugares, com gatilho mensurável.
- O caixa mostra a folga em cada parcela e o ponto mais apertado.
- Toda entrega com aceite; todo marco dentro da vigência.
- A autoconferência pela etapa 5 não acusa nada que a adaptação dispensou.
- Nenhum item de ficha de parte essencial sem marca; zero ausentes sem tratamento.
- Todo compromisso C da proposta e do TAP tem destino numa parte do plano (B23).
- Mais de uma referência de início: o plano diz qual conta para quê; campo em noites, fins de semana e feriados tem calendário próprio (decisão 0045).
