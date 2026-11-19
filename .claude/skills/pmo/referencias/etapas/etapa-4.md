# Etapa 4 — Plano de Gerenciamento do Projeto

## Papel
**A saída é o plano inteiro, não um resumo.** Cada parte que a adaptação mantém sai redigida com o conteúdo mínimo da ficha, preenchido com o que os documentos dão e rotulado. O PGP é interno: não repete a proposta nem o plano de trabalho do cliente; acrescenta o que eles não têm (premissas críticas nos três lugares, caixa, regras de mudança, gestão da equipe, acompanhamento). Teste de cada parte: "se esta parte faltar, o projeto pode falhar ou o GP perde o controle de algo?"


## Entradas
- O TAP aprovado e o registro de premissas inicial (etapa 3), a proposta e o contrato.
- O dossiê: números R, compromissos C, premissas críticas confirmadas, porte e características decididos pelo GP.
- Os passos anteriores do plano (adaptação → escopo → cronograma → riscos → planos → execução), as fichas das partes marcadas e as contas do código.

## Saída
Seções 0 a 13, na ordem da decisão 0007:

0. O projeto em uma página (capa): objeto, valor, vigência, parcelas, equipe, metas, produtos.
1. Adaptação.
2. Ciclo de vida e abordagem.
3. Escopo.
4. Atividades.
5. Recursos.
6. Durações e cronograma.
7. Riscos.
8. Custos.
9. Atualização do registro de premissas.
10. Demais planos.
11. Linha de base da medição.
12. Documentos de execução.
13. Autoconferência e decisões do GP.

- **Adaptação primeiro, pelo tipo e pelo porte:** para cada um dos 18 componentes e dos 33 documentos, sugira **essencial, recomendado, fundido ou dispensável**, com justificativa de uma linha (seção "Quando dispensar" de cada ficha, `pmbok7.md` seção 3 e o tipo de projeto da seção 3 do núcleo). Nenhum projeto recebe as 51 partes por padrão. O GP marca o que gerar; o que ele dispensar não vira "ausente" na etapa 5.
- Cada parte segue a sua ficha. O **conteúdo mínimo** é a lista do que precisa estar, e os itens dispensáveis para as características do projeto ficam de fora, com o motivo.
- **Porte reduz documentos, não cobertura** (decisão 0044). Uma parte essencial cobre **todos** os itens do conteúdo mínimo da ficha que valem para o projeto, mesmo que em uma linha cada; o item que a condição de dispensa da ficha tira sai como `dispensado`, com a condição. Plano de 2 a 4 linhas para uma parte essencial é sinal de item esquecido.
- **Geração em blocos**, na ordem da decisão 0007, cada um com as fichas inteiras das suas partes e os artigos do Rework ligados a elas (`rework.md`): bloco 1, seções 0 a 3; bloco 2, seções 4 a 6; bloco 3, seções 7 a 9; bloco 4, seções 10 a 12. Cada bloco termina com a autoconferência item a item das suas partes (princípio 13). **Se a autoconferência achar item ausente, o pedido seguinte é só daquela parte**, não do bloco. A seção 13 é do código.
- **Prazos e calendário** (decisão 0045): mais de uma referência de início → diga qual conta para quê (A3.13); marco externo fixo → restrição de data, com as atividades presas a ele; campo em noites, fins de semana e feriados → calendário próprio, em dias corridos e turnos (B13.4 e B13.6); **dado que só existe depois de um evento** (por exemplo, os dados administrativos da edição em curso) → entra no cronograma depois do fim do evento, numa atividade própria de recebimento, ligada à premissa crítica de quem fornece o dado (em geral a PC1); nunca aparece como recebido antes de o evento terminar nem junto da coleta das edições anteriores.
- **Linha do tempo antes de fechar o cronograma** (seção 3): marco que não cabe na vigência vira risco no B27, com o caminho de reajuste no A11.13; o reajuste de cada premissa crítica cobre prazo e custo, não só escopo e metas (A11.12).
- **Compromissos C** (seção 3): cada C da proposta e do TAP tem destino numa parte e num item de ficha (B23.10); compromisso de método (protocolo de campo, dados pessoais) cai no A5.12, no A12.8 ou no A7.5.
- **Ciclo de vida e escopo:** fases com critério de saída verificável e quem decide a passagem (parcelas como portões, na operação contínua); toda entrega com aceite (conteúdo mínimo, prazo de análise do cliente, rodadas de ajuste); exclusões **do objeto** (o que é da rede, do contratante, dos municípios), nunca uma lista de outro tipo de projeto.
- **Valores, reservas, nomes, números dos gatilhos e cadência das reuniões e dos relatórios** são `decisao_gp`, com a sugestão ao lado. **Cadência é sempre do GP**, mesmo quando parece óbvia; só a frequência que um compromisso da proposta ou do contrato fixa (por exemplo, "acompanhamento semanal dos questionários válidos") vem dele, com a fonte ou o número C, e a base das horas de acompanhamento usa a mesma frequência do texto.
- **Premissas críticas em três lugares:** cada uma que se aplica ao projeto vai para o registro de premissas (B3.9), para o registro de riscos com resposta e **gatilho mensurável** (B27.13) e para o plano de mudanças, com o **reajuste** de escopo, prazo e metas se ela falhar: aditivo, prorrogação ou revisão de metas (A11.12). O plano de riscos diz como os gatilhos são acompanhados: quem, com que frequência, onde se reporta (A8.12). O gatilho tem número, que é decisão do GP; o `checklist.md` traz o gatilho e o reajuste de cada premissa. Matriz de riscos genérica, que cita o assunto sem premissa, gatilho e reajuste, não substitui isto.
- **Conferências do código** (você entrega os dados; ele faz a conta):
  - **caixa:** repasses ou faturamentos acumulados (percentual, data, condição) × custo acumulado, com a folga em cada parcela e o ponto mais apertado (ficha `a04`). Escreva a curva de custo mês a mês ou, se pessoal for a maior parte do custo, a rampa de equipe, dizendo que é aproximação;
  - **quadro de equipe × produtividade:** o mesmo da etapa 2, passo 10 (quadro por função e faixa de meses, volume previsto com a fonte, teto escrito); acima do teto é PC7 e decisão do GP antes da execução;
  - **marcos × vigência** e **parcelas × edital ou contrato** (ordem e percentual).
- **O que montar o plano por inteiro revela** (escreva como premissa ou como decisão do GP): leitura dos meses, quando o quadro de equipe tem menos meses que a vigência (mobilização antes do campo); jornada por beneficiário maior que o tempo de campo (a meta é de atendimento no período; prever a transição); parcelas em ordem ou percentual diferente do edital; reservas em parceria (ficha `a04`, item das reservas).
- **Acompanhamento pelo tipo:** metas × caixa × equipe numa operação contínua; valor agregado ou avanço físico × custo numa consultoria por produtos.
- Documentos que só ganham conteúdo na execução saem como modelo inicial, com estrutura e só as primeiras entradas tiradas dos documentos, **sem inventar acontecimentos**.
- **Estudo sensível** (núcleo, seção 3): resultado aceito só muda por erro técnico registrado (A5.13); quem libera resultado preliminar (A7.5); a parte que pode se opor (A10.6). Nenhum dos três se dispensa por porte.
- **Formato dos compromissos:** `"compromissos": [{ "codigo": "C01", "tipo": "premissa" | "exclusao" | "obrigacao_contratante" | "metodo", "texto": "...", "destino": "TAP-PR | TAP4.3 | A5.12 ..." }]`. (quando o schema do passo pede)

## Definição de pronto
Critério de aceite do método (`docs/estudos/metodo-etapa-4.md`, que prevalece):
- O plano sai inteiro (seções 0 a 13); nenhuma parte mantida pela adaptação fica só descrita.
- O quadro de equipe conferido contra a produtividade e o cronograma contra a vigência; o caixa com a folga em cada parcela e o ponto mais apertado.
- Toda premissa crítica aplicável nos três lugares, com gatilho mensurável; toda entrega com aceite; todo marco dentro da vigência.
- Operação contínua sem diagrama de rede nem valor agregado por padrão; consultoria por produtos com eles.
- A autoconferência pela etapa 5 não acusa o que a adaptação dispensou; nenhum item de ficha de parte essencial sem marca; todo compromisso C com destino (B23).
- Mais de uma referência de início: o plano diz qual conta para quê; campo em noites, fins de semana e feriados com calendário próprio.

## Armadilhas
Marca de cada lição (decisão 0094): **[geral]** vale para qualquer projeto (lei, método, conta ou dois casos ou mais); **[geral, visto num caso]** decorre da lei ou da conta, mas até agora apareceu num caso só; **[um caso]** nasceu de um caso e vale quando a mesma condição aparece de novo, nunca como regra para todo projeto.
- **Cronograma:**
  - [geral, visto num caso] **"Cabe" na conta não basta** quando a etapa anterior disse que o marco não é executável (data do documento já vencida): a conferência dos marcos herda o "não cabe" (o código diz "não confirmável") e leva o marco ao B27 e ao A11.13; os marcos que usam o mesmo início dizem que a conta vale só como intervalo, e a vigência também não é confirmável. Erro que evita: "cabe" para a pesquisa num festival cuja data impressa já tinha passado, porque a conta partia do início do documento.
  - [geral, visto num caso] **Marco sem régua diz "sem régua"** (documento sem prazo nem vigência): o motivo diz a referência usada (a duração que a proposta promete) e o dia útil de cada termo definitivo pela conta do código, com a análise do cliente e a premissa do ciclo de aceite; o "cabe" com folga curta diz de que durações do contratante depende. Nunca o mesmo texto para todos os marcos. Erro que evita: seis marcos com "cabe, não há limite".
  - [geral] **Atividade criada na correção entra na rede no lugar certo:** encerramento, devolução e descarte de dados só depois do aceite do último produto (termo definitivo), nunca depois da entrega; pacote de encerramento tem atividade. A correção também se confere na rede. Erro que evita: o descarte dos microdados começava antes do termo definitivo do último relatório.
  - [geral] **Correção de régua varre as partes geradas antes**: quando um passo muda o que uma duração ou um limite significa ("os 6 meses são só referência, não teto"), as partes dos passos anteriores que a usam (ciclo de vida A17, fases, critérios de saída) mudam junto, ou a mudança vira divergência dita. O código avisa quando a mesma duração é "teto" num passo e "referência" noutro (decisão 0078). Erro que evita: o cronograma corrigiu a régua da duração, e o ciclo de vida, gerado antes, continuou chamando-a de teto; só a etapa 5 viu.
  - [geral] **"Em sequência" no texto confere com a rede:** o ajuste de um produto não cai sobre a produção do seguinte no caminho crítico; "só depois dos aceites" vale para a redação final, e os preliminares podem começar antes. Esforço contínuo de duração 0 é ponto na conta (diga que as horas valem para o contrato todo); o texto não afirma pico de carga que o código não calculou; perfil com horas numa atividade aparece na RACI dela. Erro que evita: o texto dizia "um relatório depois do outro", e a rede punha o ajuste do primeiro em cima da redação do segundo.
- **Riscos:**
  - [geral] **Cada fonte do risco geral do TAP vira um risco** no B27: o risco geral é a lista de entrada. Questionamento da contratação direta (justificativa fraca) é risco contratual, não só de imagem. Erro que evita: das cinco fontes do risco geral, duas ficaram sem risco próprio.
  - [geral, visto num caso] **Sanção por atraso e aviso prévio** do documento viram risco com gatilho **antes** da data (a antecedência e a comprovação que o documento pede), não depois do atraso. Erro que evita: gatilho "produto atrasado", quando o documento exigia aviso com antecedência.
  - [geral, visto num caso] **Texto de outra modalidade copiado no pagamento** ("nota quitada", "condições do edital" numa contratação direta) é risco de caixa, além de divergência; a exposição se mede pelo pior cenário da sequência do documento. **Reajuste conta da data do orçamento estimado**, não da vigência; sem a data, é pergunta. **Apostila só nos casos que o documento lista** (impedimento, paralisação, suspensão, reajuste): tratar atraso do contratante como impedimento é pedido de minuta, não regra. Correção de um fato varre todos os itens que o repetem. Erro que evita: a resposta "pedir apostila" para atraso na entrega de dados, que o documento não listava, e o ano do reajuste contado da assinatura.
  - [geral] **A premissa nova não repete o registro inicial, nem com outras palavras:** confira no placar o que "sai do B3" e o aviso de premissa parecida antes de escrever; o passo de riscos só acrescenta o que nasce das estimativas. Erro que evita: o prazo de análise do contratante estava no registro inicial e voltou, reescrito, como premissa de estimativa.
  - [geral] **Gatilho e resposta sem números que o documento não dá** ("uma semana antes", "cinco dias"): antecedência e limites são `decisao_gp`. Efeito de atraso em marco com folga diz "atraso maior que a folga". Erro que evita: prazos inventados nos gatilhos viraram regra do plano.
  - [geral] **Marca "presente" exige o conteúdo:** situação e data de revisão em cada risco e premissa (B27.9, B3.6), residual nos riscos de alta prioridade (B27.10); risco novo ligado a premissa crítica entra também na lista do A8.12; equipe-chave nomeada e pontuada vira risco (comprovação e substituição). Erro que evita: B27.9 marcado presente sem nenhuma data de revisão.
- **Planos:**
  - [um caso] **Aceite à parte do que o campo usa** (cotas, critério de questionário válido) quando o produto de método só é aprovado depois do início do campo: a pendência do TAP chega ao plano da qualidade, ligada à fiscalização do documento. Erro que evita: o campo usava cotas de um produto ainda em análise.
  - [geral] **Toda pendência de minuta tem caminho no A11.12 para o "não":** o que vale e quando vira mudança. **O reajuste de cada premissa crítica cobre todas as partes dela** (prazo, dado substituto com aceite, caixa), e "quem decide" separa o ajuste interno (GP) do aditivo (contratante e patrocinador da FGV). Escreva com os termos do conteúdo mínimo (comitê de controle de mudanças, aprova, adia, rejeita, autoridade), que o código procura. Erro que evita: o A11.12 só falava em prazo para uma premissa que também mexia no caixa.
  - [geral, visto num caso] **O revisor de um produto não tem horas nele:** ao trocar o revisor, confira na EAP (horas e RACI) todos os coautores. Erro que evita: o revisor da conta central do diagnóstico era quem a produzia.
  - [um caso] **Apoio externo num contrato com sigilo** e acesso só pela equipe nomeada depende de autorização escrita do contratante; sem ela, muda quem executa. **Itens de configuração separam o que é cedido** ao contratante do que é método preexistente da FGV, enquanto a cessão está pendente. A inspeção que confere "especificações oferecidas pela contratada" faz de cada promessa da proposta um critério de aceite. Lei sem artigo, quando o documento não traz, vai como "conferir com o jurídico". Erro que evita: o plano previa um revisor externo num contrato que só admitia a equipe nomeada.
  - [geral] Toda parte interessada nova ganha estratégia no A10; risco citado por id é o risco certo, e atividade criada no cronograma do plano é citada com o passo de origem. Guarda e descarte de dados deixados ao GP não viram `documento`. Erro que evita: o plano de engajamento citava um risco de caixa com o id de um risco de campo.
- **Execução:**
  - [geral] **Leia o pedido inteiro antes de escrever.** O registro de questões (B9) usa as QU-nn do código: **um item por QU, com o mesmo número, sem renumerar, juntar nem resumir.** Questão ligada a outra fica com o próprio número e fecha com a sua resposta (ligar não é responder); o responsável separa quem conduz (GP) de quem responde (contratante, jurídico); a prioridade segue a regra escrita no próprio registro; ação interna do GP tem data-alvo "antes do envio da proposta". Erro que evita: as questões renumeradas e resumidas perderam a ligação com a etapa 1 e o TAP.
  - [geral] **Marca "presente" exige conteúdo** (situação, data de revisão, responsável). Indicador tem responsável (na fonte, se o schema não tem o campo); meta ou medição que usa uma régua ainda não aprovada diz qual vale até a aprovação; toda conta central do diagnóstico tem indicador ligado ao R. A lição inicial não dá como ocorrido o que está pendente. Erro que evita: a meta de válidos usava as cotas de um produto ainda não aprovado, sem dizer qual valia antes.
  - [geral] **Citação com menos de 6 palavras é fraca para o código:** use o trecho com a frase vizinha. Erro que evita: citações curtas marcadas como fracas e itens rebaixados.
- **Da análise à mão:**
  - [geral] Riscos em escala de três níveis, responsável por papel, causa e efeito separados, e as oportunidades.

## Rubrica da segunda instância
Além da rubrica geral, nesta etapa o revisor confere:
- cada parte mantida cobre o conteúdo mínimo da ficha (porte reduz documentos, não cobertura) e cada marca "presente" tem o conteúdo;
- as premissas críticas nos três lugares (B3, B27 com gatilho, A11 com o reajuste de todas as partes);
- a rede do plano (que vem no pedido): "em sequência" nas predecessoras, encerramento e descarte depois do último aceite, a régua corrigida levada às partes anteriores;
- os R e os C só da lista do pedido; as QU-nn sem renumerar; `documento` só com o trecho que prova a frase.
