# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem a decisão [0005](docs/decisoes/0005-branches-versoes-e-tags.md).

## [Não publicado]

### Características e reexportação no teste externo (decisão 0069)
- **`--caracteristicas`** na exportação das etapas 4 e 5 (ex.: `"campo=não,beneficiarios=não"`), com os mesmos valores da tela.
- **A correção parte da sugestão do código**, como na tela da etapa 4, e não mais do padrão conservador.
- **Regra de reexportação** (`scripts/decisoes-do-pedido.mjs`): quais decisões do GP cada pedido usa, para o vigia reexportar o passo atual quando uma delas muda.

### Revisores em paralelo e lista de R (decisão 0067)
- **Skill de revisão:** R e C só os da lista do pedido (R fora dela vira restrição ou observação); revisores em paralelo com pasta de trabalho própria.

### Revisor no caso certo (decisão 0066)
- **Skill de revisão:** o prompt do revisor diz o caso, o arquivo exato e dois ou três termos, e manda parar sem achados se o conteúdo for de outro caso; antes de aplicar, conferir se os achados falam do caso certo e descartar a revisão de outro caso.
- **Pedido da segunda instância** com a identidade do caso no topo: documentos, objeto da RFP com a página e termos do objeto.

### Correção: conferência do pedido externo com o SKILL.md por etapa (decisão 0064)
- A conferência do conteúdo do pedido (teste externo) aceita o SKILL.md recortado ("SKILL.md (etapa N)") e confere que ele é o da etapa certa; antes, recusava a exportação com "FALTA: SKILL.md".
- Teste na CI com a montagem real das cinco etapas e da segunda instância.

### Skill de revisão por segunda instância (decisão 0065)
- **Nova skill** `.claude/skills/revisao-segunda-instancia/`: pedido isolado, rubrica fixa, como lançar o revisor, aplicar os achados com checagem, limite de rodadas e confidencialidade.
- **A PMO e o `docs/papeis.md` apontam para ela**, sem repetir a rubrica; o pedido da segunda instância no app continua com a rubrica.
- **CLAUDE.md:** "Revisões de passo: usar `.claude/skills/revisao-segunda-instancia`".

### Tamanho do pedido sem perder conteúdo (decisão 0064)
- **SKILL.md por etapa:** o núcleo e só a seção da etapa; a segunda instância leva o recorte da etapa conferida.
- **Checklist:** depois da confirmação do GP, só as premissas críticas confirmadas e a tabela de onde aparecem.
- **Fichas sem as linhas de fonte** (ficam no repositório para auditoria).
- **Resultado:** de 14% a 55% menos tokens na instrução de sistema, conforme a etapa; o gabarito passou antes e depois.

### Skill PMO 0.3.3, revisão em camadas e gabarito (decisão 0063)
- **Revisão em camadas:** testes e gabarito → segunda instância com rubrica fixa → GP, com os limites escritos (o revisor erra; no máximo 2 rodadas; trava nova com contagem de alarmes falsos). Em `docs/papeis.md` e no SKILL.md.
- **Gabarito** (`tests/pmo/gabarito/`): achados confirmados por caso e etapa, na CI e sem a API; dois casos disfarçados.
- **Skill 0.3.3:** as lições do teste nas etapas 1, 2 e 3, cada uma com o erro que evita; compromisso da proposta "prometido" enquanto não há contrato.
- **Rubrica do pedido da segunda instância** alinhada à da skill.

### Três datas por produto e marco pela atividade da EAP (decisão 0062)
- **Linha do tempo e marcos do TAP:** primeira entrega, fim da inspeção do contratante e termo definitivo de cada produto; a conta não muda.
- **"Sem a aprovação do cliente"** só quando a EAP não tem as análises do contratante.
- **Marco do TAP:** conferido pela atividade da EAP que ele representa; "antes do campo" pela ordem da rede; sem a atividade, "não conferido".

### Compromissos de método no TAP, numeração e faixas (decisão 0061)
- **Todo compromisso de método recebe C,** inclusive o que vem com a ficha do campo e começa por "Compromisso de método".
- **Pedido do TAP:** leva os compromissos de método, com o destino esperado (descrição, entregas ou aceite); o destino é procurado também na aprovação.
- **Faixas pelo código:** a minuta mostra a faixa de cada tipo e aponta a faixa errada escrita pelo PMO; o pedido do conteúdo diz a ordem da numeração.
- **decisao_gp sempre com motivo,** escrito no pedido das quatro etapas.

### Rodadas da segunda instância com achado médio (decisão 0060)
- **Achado médio espera o GP:** com achado alto ou médio, o próximo passo só sai depois de "corrigir" ou "seguir".
- **Da rodada 2 em diante:** a reentrega com "seguir" ou "corrigir" segue direto para o próximo passo, com a versão nova, sem rodada nova, e fica registrada ("GP seguiu com correção").
- **Regra no Git, com teste:** `scripts/rodadas-da-segunda-instancia.mjs`; o resumo da conferência conta os médios.

### Segunda instância com o pedido do passo e rodadas (decisão 0059)
- **Pedido da segunda instância:** leva o pedido do passo conferido, com o esqueleto do código (números R e C, contas e datas). A régua é o que esse pedido exige, nem mais nem menos.
- **Rodadas:** cada conferência do passo é uma rodada, que fica no dossiê e aparece na tela e no `conferencia-*.md` do teste externo.
- **Conferência do pedido:** confere que o pedido do passo foi junto.

### "Citação a conferir" como aviso e segunda instância da etapa 1 (decisão 0058)
- **Menos alarme falso:** a data vale também por extenso e o termo-chave é procurado em todos os trechos do item. Números e datas do esqueleto (ou de "conta do código") ficam de fora, e o e-mail ou o telefone contam quando o item fala deles.
- **Aviso, não erro:** a "citação não prova" vira o aviso "citação a conferir". Não conta entre os fatos sem citação nem muda a situação da conferência.
- **Citação fraca:** toda palavra conta, inclusive a de uma letra.
- **Segunda instância da etapa 1:** o script exige `--dossie`.
- **Dados do caso:** o nome do departamento do caso foi trocado por um inventado no comentário, no teste e na decisão 0054.

### Travas do teste externo, linha do tempo e segunda instância (decisão 0057)
- **Travas novas:**
  - **EAP:** "não cabe antes do marco", que vira divergência do TAP; "reentrega sem nova conferência"; "esforço não estimado"; atividade "antes da assinatura" com predecessora posterior.
  - **TAP:** marco "antes de [data]" ou "dentro da vigência" sem confirmação da conta vira divergência obrigatória.
  - **Estratégia:** só é critério pontuado o perfil cujo trecho diz "pontuação".
  - **Etapas 1 a 4:** "citação não prova" quando o trecho não traz o termo-chave do item.
- **Passo refeito sem a resposta anterior:** o pedido e o esqueleto partem só dos passos anteriores (proposta e PGP); no teste externo, importar um passo descarta os seguintes.
- **Linha do tempo:** os pedidos da EAP, do TAP e do cronograma levam a linha do tempo do código, e a resposta traz `conferenciaDosMarcos`, conferida contra a conta do código.
- **Segunda instância:**
  - em cada passo das etapas 1 a 5, uma chamada separada, com só a skill, os documentos e a resposta, devolve erro de fato, o que faltou, incoerência entre etapas e rótulo errado, com gravidade;
  - o GP vê o resultado antes de aprovar;
  - no teste externo, o passo é `segunda-<passo>` e a importação grava `conferencia-*.md`.
- **Datas:** data de portaria, decreto, lei, assinatura ou fecho do documento não é situação, prazo nem marco.

### Skill PMO 0.3.2 (com a 0.3.0 e a 0.3.1, que entram na main junto)
- **19 regras do teste externo,** só acréscimo, cada uma com o "erro que evita" num exemplo disfarçado:
  - **SKILL.md:** cada etapa do zero, sem reaproveitar a resposta anterior do mesmo passo (princípio 14); "documento" só quando o trecho prova a frase (princípio 15); compromissos de método também são C, com destino no TAP; linha do tempo antes de fechar EAP, TAP e cronograma; conferência por uma segunda instância antes da próxima etapa; texto de outro projeto copiado no TR é conflito.
  - **Proposta:** PROP-EAP.13 a .18 (linha do tempo; campo e atividade do cliente sem esperar aceite que o TR não pede; aceite em análise → ajuste → nova análise → termo definitivo; fonte externa de dados com atividade própria; restrição com prazo do TR na EAP; prazos de terceiros como estimativa); PROP-SOW.14 (origem e período de cada dado); PROP-ESTRATEGIA.13 e .14 (só pontua o que o TR diz que pontua; pergunta que muda o preço vai no esclarecimento); PROP-EQUIPE.12 a .15 (campo com quantidades antes do preço; gargalo de perfil como PC7; responsável com a competência certa; horas como estimativa); PROP-METODOLOGIA.12 (amostra por cotas em estudo sensível). PROP-ESTRATEGIA.12 e PROP-SOW.12: abordagem que reduz o que um R pede contraria o TR.
  - **TAP:** TAP6.4 (linha do tempo), TAP9.5 (ordem do aceite), TAP-DV.8 (abordagem que reduz um R), TAP-DV.9 (pergunta de preço que não foi feita); TAP-DV.7: texto de outro projeto não é "a versão que mais obriga".
  - **Plano:** A5.14 (ordem do aceite), A11.12 (o reajuste cobre prazo e custo), A11.13 (marco que não cabe na vigência), B3.10 (restrição com prazo do TR), B18.11 (competência do responsável); PC1 (origem e período do dado; fonte externa) e PC7 (mesmo perfil em atividades paralelas) no `checklist.md`; duas lições novas no `experiencia.md`.
  - Os itens novos das fichas são "só PMO": a conferência por código da etapa 5 não muda.
- Decisão 0056.
- Versão 0.3.2 em todos os arquivos da skill.

### Correções do teste externo pelas etapas 1 a 4 (decisão 0055)
- **Rework nos pedidos:** cada etapa que leva fichas leva os temas do `rework.md` dos artigos citados nelas (etapa 2: a seção 4 e os temas que faltavam; etapa 3; etapa 4, no texto de sistema). A conferência do pedido (`.conteudo.md`) marca FALTA quando algum artigo citado vai sem resumo e explica por que o método só vai no pedido da etapa 1.
- **Compromissos de método também são C** (fichas PROP-METODOLOGIA.9 a .11), com o número que o PMO deu quando ele o escreveu; os outros nos números livres, sem colidir com a minuta.
- **Trava "valor não conferido":** ids de itens do PMO ("(a1)", "a2, a3") e números de norma ("Lei 14.133") não contam como valor.
- **Ponto de partida:** "capacidade de pagamento" (CAPAG) não é cláusula de pagamento; sigla de órgão com a UF ("SEPLAG-RJ") vira o contratante provável; a portaria de nomeação de quem assina não é legislação.
- **TAP:** a divergência da equipe-chave compara a lista inteira de perfis da proposta com a da RFP e aponta o que falta.
- **Matriz de atendimento:** uma seção responde a vários critérios (lista com ponto e vírgula, ou a seção de equipe para os perfis); o pedido do conteúdo avisa o PMO.
- **Pedidos externos:** `--modalidade` (decisão 0054); "medio" sem acento vale no `--porte`; na estratégia, só as premissas críticas "sim" (ou as de `--pcs`) ficam confirmadas; `.conteudo.md` ao lado de cada pedido, com o que foi dentro e a comparação com a tabela da seção 5.

### Requisitos como entregas e modalidade não identificada (decisão 0054)
- **Cada R é uma entrega ou obrigação de quem executa.** A equipe-chave vira um requisito só, com a lista dos perfis, lida até o título da seção seguinte, mesmo passando de página. Sem produtos numerados, entram os itens do objeto em algarismos romanos, o levantamento (com a análise comparativa) e os produtos que uma seção "Dos produtos" nomeia. A entrega em meio digital e o sigilo com a cessão dos produtos entram no fim da lista. Tipo novo de requisito: atividade exigida.
- **Modalidade não identificada:** sem edital, critério, sessão nem artigo de inexigibilidade ou dispensa, o código não supõe licitação. A tela da etapa 1 pede a escolha do GP, a etapa 2 não pede a estratégia sem ela e o PMO escreve as seções 5, 6 e 8 com as alternativas.
- **Etapa 1:** a data da portaria do signatário não é prazo de recurso; o tamanho conta os perfis da equipe-chave; o registro em conselho de um perfil não é habilitação da empresa; o "entre outros" em texto padrão de sigilo não é vago.
- **Etapa 5:** cada perfil da equipe-chave é procurado no plano.
- As respostas gravadas da OEI foram renumeradas para a equipe-chave num R só.

### Sem modo de demonstração (decisão 0053)
- **A apresentação do app é feita com a skill PMO na conversa; o site não tem modo de demonstração.** Saem o botão "Ver demonstração", a faixa do topo, os textos sobre a demonstração na tela e nos relatórios, o aviso no cabeçalho dos exportados, o campo `demonstracao` do dossiê (um dossiê antigo abre sem ele) e a cópia do PDF da OEI para o build.
- **As respostas gravadas da OEI ficam só como material dos testes**, fora do build: os de unidade as leem do disco (`tests/ajudantes/gravadas.ts`); os de fumaça as servem pela rota do Playwright, com uma chave falsa (`tests/fumaca/pmo-simulado.ts`). A fumaça da etapa 4 passa pelas etapas 2 e 3 no mesmo dossiê; a da etapa 5 confirma os achados do código pelo veredito simulado. Os 77 vereditos da leitura gravada da etapa 5 continuam marcados como escritos pelo Claude Code, a revisar pelo PMO.
- Decisão 0027 substituída pela 0053.

### Correções do esqueleto da etapa 1 e autoconferência (decisões 0048 e 0049)
- **Testes externos da skill** (SMPED e um TR municipal de contratação direta), guardados fora do Git como leituras gravadas externas (decisão 0049).
- **SMPED:** habilitação com os itens 7 e 8 e sem as alíneas de exemplo; "Diário Oficial" não é obrigação diária; eliminação com as alíneas; requisitos não cortados em "Decreto Municipal nº"; público-alvo e "poderá ser executado" fora dos R.
- **Contratação direta:** modalidade declarada em qualquer página, objeto pelo título "1. OBJETO: …", seção "Como é escolhida", hipótese legal, documentos como pergunta e "não se aplica" próprio; terceira opção no tipo de contrato da etapa 2.
- **Parcelas em valor no texto**, com percentual e soma × valor global por código; produtos com número do item na frente; quantidade com erro de digitação; frase que não corta em "Av. Dr."; recurso contra sanção fora do certame.
- **Cruzamentos X1 a X6** no esqueleto e no pedido ao PMO; prazo sem termo inicial; sinal de estudo sensível.
- **Citação fraca:** citação conferida com menos de 6 palavras ganha a trava.
- **Autoconferência** nos esquemas das etapas 1 a 4, validador e o teste que reprova; na etapa 4, item sem marca devolve só a sua parte ao PMO.
- **Cronograma com data fixa:** a atividade com restrição de data conta em dias corridos e começa na data de início da janela (evento em fim de semana); a folga das predecessoras aparece em dias corridos até essa data.
- **TAP:** marco com data (o início do projeto) não conta como prazo além da vigência; entregas com data quando há início (o do GP ou a data fixa do documento, a confirmar pelo GP) e aviso de marco sem data quando não há; gestor e fiscal só com o papel, sem o nome.
- **Aceite pela nota fiscal:** sem cláusula de recebimento, o código mostra que o aceite é a aprovação da nota fiscal por quem fiscaliza (sem prazo e sem recebimento provisório e definitivo); a contratada (FGV) sai dos órgãos citados.
- **R fora da lista:** requisito de alto nível do TAP com um R descartado na etapa 1 é apontado na conferência e vai marcado no pedido do escopo da etapa 4.
- **Pedidos externos:** o porte e as premissas críticas passados na primeira exportação ficam no dossiê de origem.
- **Plano (etapa 4):** cronograma com o início do documento quando o GP não informou (a confirmar pelo GP); datas da janela fixa em dd/mm/aaaa; sem folga até a data fixa, o alerta vai também no registro de premissas (B3, PC3 e PC6).
- **RACI:** o código confere um só A por atividade e perfil da equipe na lista; o contratante aparece com os seus papéis, fora da equipe.
- **Horas a definir pelo GP:** aparecem como tal na tabela de custos e no total, e o custo não fecha com zero no lugar delas.
- **Feriados no cronograma (decisão 0051):** nacionais pela lei e municipais informados pelo GP, nas etapas 2, 3 e 4.
- **Pacote da EAP em cada atividade (decisão 0051):** obrigatório no cronograma da etapa 4; atividade sem pacote, pacote inexistente, de outro produto e pacote sem atividade são apontados.
- **Análise do contratante (decisão 0051):** a atividade que é a própria análise dura o tempo de aprovação do GP, sem somar por cima.
- **Etapa 4:** contingência dos riscos que pedem reserva no B6 e no A15 como "a definir pelo GP"; premissa do PMO que repete o registro inicial sai do B3; parte ainda não gerada não é cobrada na autoconferência.
- **Testes sem as datas do caso:** os testes e comentários do cronograma usam datas neutras (decisão 0049).
- **Compromissos numerados (decisão 0047):** premissas, obrigações do contratante, exclusões e limites de volume da proposta recebem um número C (C01…) na etapa 2; o TAP mostra o destino de cada um (citado pelo PMO, provável ou sem destino) e os pedidos da etapa 3 pedem o C no item que o leva.
- **Autoconferência da etapa 3 por passo:** o TAP cobra os seus itens; o registro de premissas, só TAP-PR e B3.
- **B3 da etapa 4 com o registro inicial:** o que o passo de riscos traz da RFP, da proposta ou do TAP sai; ficam as premissas de estimativa.
- **Gestor e fiscal no pedido do TAP:** só o papel; o nome é do GP confirmar no contrato.
- **Compromissos no plano:** a matriz (B23) mostra cada C com o destino no TAP e no plano (o item que cita o número, no campo ou no texto).
- **Pedidos da etapa 4:** as partes do passo que o GP dispensou aparecem com o motivo, e nenhum pedido pede texto, exemplo ou indicador de parte dispensada (A16 e valor agregado, A12, A4).
- **Escopo da etapa 4:** o pedido leva as exclusões e os limites de volume (C) para a B17 (B17.5 e B17.7), com o C no item.
- **Registro das questões (B9) montado pelo código:** uma QU por ponto da etapa 1 com pergunta e por divergência do TAP sem decisão do GP, com a origem; o PMO completa; a conferência aponta questão sem origem e origem sem questão.
- **Vago:** "a definir pelo GP" e item de decisão do GP não são vago (viram a verificação de decisões pendentes); expressão do documento citada entre aspas não é vago.
- **Autoconferência da etapa 4:** item marcado pelo PMO vale quando o código confere o id (existe, está na parte e não foi descartado).
- **Pedido externo da etapa 5 com `--plano dossie`:** o PGP da etapa 4 montado pelo app, gravado também em DOCX.
- **Etapa 5 com o TAP do dossiê:** sem TAP em PDF, a conferência usa o TAP da etapa 3 (como a etapa 4).
- **Busca dos sinais com singular e plural** ("feriados municipais" acha "feriado municipal").
- **Autoconferência:** item presente só pela marca do PMO sai como verificação própria ("presente pela marca do PMO, redação a conferir"), com a lista.
- **Brechas do código juntadas ao ponto da leitura** também com o número do item na frente do trecho e pela página citada com o mesmo assunto; cada brecha entra num ponto só, e a questão do B9 leva as duas origens.
- **Conferência do B9:** cada QU se liga ao item que começa por "QU-nn —" (citação em outro item é referência cruzada, não registro); questão nova com fonte aparece como tal; o status é lido, e status diferente de "aberta" vale com referência que o código acha no plano (C, item, atividade, risco, pacote ou outra QU); "resolvida" com registro pendente ganha aviso.
- **Etapa 5, partes dispensadas:** o mapa inicial leva as partes que o GP dispensou na etapa 4 e as que o próprio plano declara na lista "Partes dispensadas pelo GP" (a da etapa 4 vale sobre a do plano); o app e o script de teste usam a mesma função, e a conferência não procura itens de parte dispensada.
- **Etapa 5, busca do ausente do PMO:** só na parte apontada (e, se ela foi dispensada, nas partes que absorvem o conteúdo, pela justificativa), sem os trechos que o próprio achado cita como evidência; com os termos que o PMO mandou, só eles (os sinais do item da ficha valem quando ele não manda termos). A tela e o placar dizem onde o código procurou.
- **Etapa 5, achado do código é candidato até o veredito do PMO (decisão 0052):** o pedido lista cada achado do código (ausente, vago e conflituoso) com o id e pede um veredito (sustenta, falso com o trecho, não se aplica ou regra errada, com o motivo); só o "sustenta" conta no total, e os outros aparecem à parte na tela, no relatório e no placar. A dispensa que só o plano declara é candidata (cabe ou não cabe); se não couber, a parte volta à conferência, com os achados dela no mesmo pedido. A resposta gravada da demonstração traz os vereditos, **escritos pelo Claude Code, a revisar pelo PMO** (como os gabaritos feitos pelo próprio código; marcado no arquivo e no README dos gerados).
- **Pedidos externos:** a análise à mão fica em `<resposta>.notas.md`, ao lado do placar, que a importação não toca.
- **Método da etapa 4:** dado que só existe depois de um evento entra no cronograma depois do fim do evento, numa atividade própria, ligada à premissa crítica de quem fornece.

### Fase M3 — etapa 3 pelo método (decisão 0041)
- **Testar sem a chave:** `npm run exportar-pedido` grava, fora do Git, o pedido de um passo do PMO exatamente como iria à API (sistema, mensagem com os PDFs e o esqueleto, schema), para o Claude do claude.ai responder; `npm run importar-resposta` valida a resposta, grava no dossiê, roda as travas e mede contra o gabarito numa seção "leitura independente". Por ora, a etapa 1.
- **Contrato ou termo assinado como entrada da etapa 3**, com prioridade sobre a proposta e a RFP: o código lê dele o valor, a vigência, as parcelas, a cláusula de parte integrante e quem acompanha.
- **Divergências primeiro**, entre RFP, proposta e contrato: valor, parcelas parcela a parcela, frase de conformidade, duração × vigência, equipe com regra diferente e quadro × produtividade, cada uma com a versão sugerida e o que fazer; o GP pode escolher "vale o contrato". Divergências de texto pela leitura do PMO.
- **Conferência do TAP pelo método:** valor e parcelas iguais ao contrato, marcos dentro da vigência, entregas com aceite, divergências decididas.
- **Contratos inventados** para teste (SMPED e OEI) e as leituras gravadas da OEI no formato da M3; a demonstração da etapa 3 abre com o contrato. Não há gabarito da etapa 3: o placar dela vem do teste às cegas, com os contratos que a responsável vai mandar.

### Fase M2 — etapa 2 pelo método (decisão 0038)
- **A minuta redigida por inteiro**, na ordem do modelo do edital (quadros do modelo obrigatório ou a lista de partes), com a capa e as 9 seções do método: estratégia, estrutura, escopo, premissas críticas, metas/equipe/cronograma, preço, matriz e checklist, decisões do GP. Seção não redigida ou só descrita é alerta.
- **Tipo de contrato e de projeto** sugerido pelo código e confirmado pelo GP; o preço segue o tipo: consultoria por produtos com horas × valor-hora; operação contínua e parceria com a folha mês a mês e as despesas por natureza, sem valor-hora; custos indiretos só com memória de cálculo e taxa de administração conferida no edital e na norma local (decisão 0040; também na planilha exportada).
- **Contas novas do código:** pontos de texto × de documento ("a FGV tem?"), regra do preço e tabela de pontos por preço (com a equivalência em pontos técnicos), caixa pelo acumulado com a folga de cada parcela, quadro de equipe × produtividade (volume ÷ pessoas ÷ 21 dias úteis × teto escrito) e duração × vigência.
- **Pedidos ao PMO** com o esqueleto do código e o teste de cada item; campos novos nos schemas (abordagem que muda o resultado, metodologia por fase, metas, riscos com gatilho, premissa com dependência, prazo e reajuste, quadro de equipe e volumes). Dossiês antigos abrem com os campos vazios.
- **Gabaritos e leituras gravadas** da SMPED e da OEI na estrutura do método, e placar (`docs/estudos/placar-m2-etapa-2.md`).

### Skill PMO 0.3.1 (sobre a 0.3.0, ainda não publicada; mostrada à responsável antes de publicar)
- **Etapa 5, veredito do PMO** (decisão 0052): achado do código é candidato até o veredito (sustenta, falso com o trecho, não se aplica, regra errada com a causa); a dispensa que só o plano declara é candidata (cabe ou não cabe); a busca do ausente do PMO vale na parte apontada, sem a evidência do achado.
- **Etapa 4, cronograma:** dado que só existe depois de um evento entra depois do fim do evento, numa atividade própria de recebimento, ligada à premissa crítica de quem fornece.
- **Sinais das fichas** para o que os planos escrevem com outra redação (A9.6, A10.1, A17.4, A17.6, A18.2, B5.1, B12.4, B25.7, B27.1, B31.7), a partir do teste de um TR municipal de contratação direta; termos genéricos, sem nada do caso.
- **`experiencia.md`:** o "até quando" da premissa crítica sai do cronograma e é o gatilho do risco; linha de base dos custos com as despesas diretas; pesquisa com o público com informação ao respondente e regra de guarda; status inicial do registro de questões igual ao de cada questão.
- Versão 0.3.1 em todos os arquivos da skill.

### Skill PMO 0.3.0 (mostrada à responsável antes de publicar)
- **Etapa 1 na skill**, pelo método: as 8 seções, o teste de cada item, o que não entra e, em cada ponto de atenção, a premissa crítica (PC1 a PC8) e a pergunta de esclarecimento.
- **Etapa 5 como leitura principal** (decisões 0035 e 0037): nenhuma etapa analisa sem a conexão; o código monta o esqueleto e confere depois citações, números e números R.
- **Etapas 2 e 4 entregam o documento inteiro:** a minuta redigida seção por seção e o PGP nas seções 0 a 13; o resumo é só a capa. O quadro de equipe × produtividade (volume ÷ pessoas ÷ 21 dias úteis contra o teto escrito) é conta do código, e a skill diz o que o PMO entrega para ela (quadro por função e faixa de meses, volume e teto com a fonte; PROP-EQUIPE.11).
- **Tipos de projeto e de plano** (consultoria por produtos, operação contínua, híbrido; licitação ou parceria; PGP interno ou plano de trabalho): o que muda no vocabulário, no preço, na adaptação (`pmbok7.md`, seção 3) e na régua da etapa 5.
- **Ficha nova `prop-parceria`** (PROP-PARCERIA.1 a .13): plano de trabalho da Lei 13.019 com o art. 22, metas e parâmetros do edital, folha mês a mês, despesas por natureza, sem valor-hora nem taxa de administração, cronograma de desembolso igual ao do edital e caixa. A ficha `prop-preco` ganha a operação contínua (PROP-PRECO.12 a .14). São 62 fichas.
- **Premissas críticas com gatilho e reajuste** nos três lugares (B3, B27 e A11): o número do gatilho é decisão do GP; o reajuste segue o caminho do contrato (aditivo, prorrogação, revisão de metas).
- **Contrato ou termo assinado na etapa 3**, prevalecendo sobre a proposta e a RFP, com as divergências primeiro (bloco TAP-DV e TAP-PR.3).
- **Caixa nos custos** (A4.12 e B6.11: acumulado de repasse ou faturamento × custo, folga por parcela, ponto mais apertado) e reservas em parceria (A4.13).
- **Conflitos novos na etapa 5:** frase de conformidade que não confere com o item citado e exclusões de outro tipo de projeto (`experiencia.md`).
- **Fontes que divergem:** sai "prevalece o PMBOK" do `rework.md`; não há vencedor automático, e o PMO sugere a leitura que serve ao contrato e ao porte, com o motivo.
- Itens novos foram acrescentados no fim de cada ficha; nenhum código de item mudou.
- **Testes externos de 16/11/2026** (decisões 0042 a 0047), a partir de duas leituras gravadas externas (SMPED e um TR municipal de contratação direta):
  - **chave de modalidade** no começo da etapa 1: licitação, contratação direta ou parceria; na contratação direta, a escolha se sustenta na notória especialização **no objeto**, na justificativa de preço e nos documentos do art. 72 (PROP-ESTRATEGIA.1 e .11);
  - **estudo sensível** (CPI, comissão, denúncia): característica nova `estudo sensível` · `estudo comum`, sugerida pelo código e confirmada pelo GP; régua metodológica (PROP-METODOLOGIA.11), resultado aceito só muda por erro registrado (A5.13), resultado preliminar no A7.5, e o A10.6 não se dispensa em estudo sensível;
  - **autoconferência em todas as etapas** (presente, dispensado com motivo ou Decisão do GP); na etapa 4, porte reduz documentos, não cobertura, e "ausente" não é estado final; geração em quatro blocos, regenerando só a parte com item ausente;
  - **prazos e calendário:** qual referência de início vale para quê (A3.13), marco externo fixo e janela até ele (PROP-EAP.11), premissa que muda a predecessora (PROP-EAP.12), prazo sem termo inicial como vago, turnos do campo mesmo em porte pequeno (B13.6), evento de faturamento como o texto diz (A4.9), substituição na inexigibilidade (A6.7), exemplo da janela na PC4;
  - **cruzamentos obrigatórios** X1 a X6 nas etapas 1 e 5 (pagamento, início × vigência × marcos, quem executa × vedações, contatos repetidos, valor × parcelas, prazos de um mesmo marco);
  - **compromissos numerados** (C01…) da proposta até o plano: exclusão nunca tira requisito (PROP-SOW.12 e .13), divergência que muda escopo ou custo fica pendente com a versão que mais obriga a FGV (TAP-DV.7), destino no TAP (TAP-PR.4) e no plano (B23.10); C sem destino é ausente na etapa 5;
  - **abordagem que contraria a RFP** sai marcada, com o trecho, e vira pergunta de esclarecimento ou ajuste da minuta na contratação direta (PROP-ESTRATEGIA.12, decisão 0050);
  - métodos das etapas 1 a 5 atualizados (os das etapas 1 e 5 deixam de chamar a leitura do PMO de "opcional"; o da 4 deixa de pedir "poucas linhas" por plano) e o rastro das regras novas na engenharia reversa.

### Documentação — métodos revisados e engenharia reversa das cinco etapas
- **Métodos das etapas 1 a 5 substituídos** pela versão revisada pela responsável pelo projeto. Saem os detalhes que identificavam o caso real (número de páginas, meses do cronograma e da vigência, duração da jornada); também na decisão 0033 e na 0034.
- **O que muda nos métodos:**
  - etapas 2 e 4: a saída é o documento inteiro (a minuta redigida seção por seção; o PGP com as seções 0 a 13 da decisão 0007), e o resumo é só a capa;
  - nova conferência por código, quadro de equipe × produtividade (etapas 2 a 5);
  - etapa 4: adaptação por porte e tipo, três pontos só nas entregas de conhecimento e reservas em parceria (seção 4.7).
- **Chave da API nos scripts lida de um arquivo fora do repositório** (`RAIO_X_ARQUIVO_CHAVE`), nunca de `ANTHROPIC_API_KEY`, que faz o Claude Code cobrar o uso dele nessa chave. O script recusa arquivo dentro do projeto e avisa se a variável antiga estiver definida. Passo a passo no PowerShell em `docs/tecnico/07-configuracao.md`.
- **Roteiro da etapa 5 sobre um plano real** (`npm run conferir-plano-real`, `docs/estudos/roteiro-etapa-5-plano-real.md`): roda na máquina da responsável, com os PDFs fora do repositório, e grava só números (por tipo, gravidade, parte e situação; com o gabarito dela, acertos, precisão e cobertura).
- **Documentação coerente com a decisão 0035 e a M1:** README (o que cada etapa faz hoje, com e sem a chave), guia do gerente (etapa 1 nas 8 seções e "Pedir ao PMO"; etapa 5 com a leitura do PMO como principal), arquitetura e `docs/tecnico/` 01, 02, 04 e 06 sem "etapas 1 e 5 só com código"; andamento enxuto, fase P encerrada.
- **Mesmos números do placar em todo lugar:** a decisão 0035 e o CHANGELOG da M1 passam a usar os de `placar-m1-etapa-1.md`. O placar diz que os gabaritos foram feitos pelo Claude Code (mede o esqueleto e as travas, não a leitura do PMO) e traz 10 itens para a responsável conferir antes do merge.
- **Decisão 0037: nenhuma etapa analisa sem a conexão com o Claude.** Nas etapas 1 e 5, a tela pede a conexão antes de "Analisar a RFP" e de "Conferir o plano"; sem chave, as opções são conectar ou ver a demonstração. Sai o aviso "leitura parcial por código": o esqueleto do código vai no pedido e o resultado só aparece com a leitura do PMO, conferida pelo código. Na etapa 5, a conferência por código e a leitura do PMO viram uma ação só.
- **Demonstração da etapa 5:** um plano de trabalho inventado sobre o edital público da OEI, com erros plantados, e a resposta gravada do PMO, conferida pelo código como no uso real.
- **Engenharia reversa das cinco etapas** (`docs/estudos/engenharia-reversa/`): o rastro de cada saída da análise à mão (saída → evidência → regra → código ou PMO → item da skill), com os fluxos, o modelo de dados e os pontos a validar.

### Fase M1 — etapa 1 pelo método (decisões 0034, 0035 e 0036)
- **Leitura da RFP em 8 seções,** na ordem da decisão do gerente, na tela e na "Análise da RFP" (DOCX e PDF): em uma página; o que a contratada teria de fazer e entregar; prazos; dinheiro; julgamento e o que vai na proposta; habilitação; pontos de atenção; o que não se aplica à modalidade. Saem o mapa página a página, as normas além do regime, os órgãos sem papel e as faixas da pontuação (contados em "fora da leitura").
- **O PMO lê; o código monta e confere:** botão "Pedir ao PMO" na etapa 1, com o custo antes e o aviso de envio. A leitura parte do esqueleto do código, e o código confere cada citação, número e número R ("citação não conferida", "valor não conferido"). Sem a chave, a tela mostra o esqueleto com o aviso "leitura parcial por código". Demonstração também na etapa 1.
- **Regras novas do esqueleto:** obrigações de quem executa por tema; cronograma de desembolso com a soma conferida e a condição de cada pagamento; glosa, contrapartida e "não obriga a contratar"; habilitação linha a linha da lista do edital e quem entrega; pontos de atenção com a premissa crítica (PC1 a PC8) e a pergunta; proteções da contratada; situação das datas × hoje e caixa concentrado nas últimas parcelas.
- **Requisitos R = entregas e obrigações específicas de quem executa.** Saem dos R o número de projetos selecionados, o limite por proponente e o prazo de execução. Obrigação lida pelo PMO vira R só quando o GP inclui.
- **Exportados:** checklist de habilitação linha a linha; perguntas com a premissa crítica de cada ponto; requisitos e prazos na lista nova.
- **Gabaritos da SMPED e da OEI** na estrutura do método e **placar** antes e depois (`docs/estudos/placar-m1-etapa-1.md`): cartões que não passam no teste caíram de 82 para 6 (SMPED) e de 102 para 3 (OEI); gabarito coberto de 15 para 28 e de 30 para 35 de 50; zero número sem fonte. Os gabaritos foram feitos pelo Claude Code: o placar mede o esqueleto do código e as travas, não a leitura do PMO.

### Documentação — métodos das etapas
- **Métodos das etapas 1 a 5** (`docs/estudos/metodo-etapa-1.md` a `metodo-etapa-5.md`), escritos pela responsável pelo projeto a partir da análise à mão de um caso real de parceria (fora do Git). Passam a valer pela decisão 0034: teste de cada item, saída na ordem da decisão do gerente e régua pelo tipo de contrato, de projeto e de plano. Aplicação em cinco fases, uma por etapa (M1 a M5).
- **CLAUDE.md** aponta para os métodos; a etapa 1 também tem a leitura opcional do PMO (decisão 0032); a base do "ausente" da etapa 5 depende do tipo de plano.
- **Decisão 0035:** o PMO faz a leitura em todas as etapas; o código monta o esqueleto e confere cada citação, número e prazo. Sem chave, as etapas 1 e 5 mostram o esqueleto com o aviso "leitura parcial por código". CLAUDE.md, seção 2, ajustado.
- **Decisão 0033 corrigida:** no caso real, 12 dos 84 achados se sustentaram, não 13 ("exclusões ausentes" era falso; a lista era de outro tipo de projeto).

## [0.8.3] — 16/11/2026

### Etapa 5 e telas — primeira fase da decisão 0033 (prévia de 16/11/2026)
- **Tipo de plano no mapa** ("PGP completo" ou "plano de trabalho/proposta"). No plano de trabalho, configuração, linhas de base, calendários, previsões, lições aprendidas, documentos de teste, dados do cronograma e termo de nomeação vêm dispensados ("não se aplica a plano de trabalho"), e o GP pode reverter.
- **Falsos positivos da conferência:**
  - trocado o plano na caixa, o mapa volta à proposta do código, menos as partes dispensadas (antes, "título localizado" podia aparecer como "não está no plano"); dossiê antigo fica como o GP deixou;
  - contratação de pessoal não marca o plano de aquisições (A9);
  - convenções da ferramenta ("R01", "ID", "duração 0", "código EAP") não são procuradas em plano de outra pessoa (no plano gerado pela etapa 4, continuam valendo);
  - item "a comparação é do código" não é busca de palavra;
  - sinônimos do plano de trabalho valem nos itens certos (A7.10, B18.1, B20.1, B6.1 e B6.2): "relatórios trimestrais", "equipe responsável", "quadro de metas e indicadores", "composição do custo";
  - vagos olhando só a frase: sem texto padrão de LGPD e sigilo, sem "oportunamente" que adia o prazo para o item do edital e sem descrição de atividade para o público (compromisso de quem executa continua vago);
  - "deste edital" no plano de trabalho não é texto de outro documento.
- **Relatório em ordem de importância:** premissas críticas, conflitos, ausentes e vagos.
- **Aviso de caixa:** um arquivo que parece de outra caixa (proposta na do PGP, termo de referência na do TAP) ganha um aviso com a caixa sugerida; capa que cita o pregão e modelo de anexo não enganam. Quem decide é o GP.
- **Caixas da etapa 5:** "Plano (PGP ou plano de trabalho)" e "TAP ou termo assinado".
- **Revisão independente** (um subagente que não viu o trabalho, com a skill PMO) antes do PR; o que ela achou está na descrição do PR.
- **Leitura mais enxuta:** sai a tabela "Resultado da leitura" e o relatório de leitura. Cada arquivo tem uma linha com as páginas lidas e o aviso só quando alguma página falha.
- **"Salvar para continuar depois"** no lugar de "Salvar projeto", com a explicação: arquivo do app, para reabrir aqui; para ler, use os relatórios.
- Decisões 0032 e 0033 aceitas, com os ajustes da responsável registrados.


## [0.8.2] — 16/11/2026

### Correção — nome do projeto e engenharia reversa da etapa 1
- **Nome do projeto sugerido** a partir do instrumento e do objeto da RFP, como sugestão editável na etapa 1 ("Usar como nome do projeto"). Sem nome do GP, os documentos exportados saem com a sugestão e o aviso "a confirmar pelo GP", em vez de "Projeto sem nome".
- **Objeto:** a seção cujo título diz "objeto" vale mais que a de propósito (no chamamento da SMPED, o 2.1 em vez do 1.1).
- **Gabarito do PMO** da etapa 1 para o chamamento da SMPED (`tests/fixtures/gerados/rfp-smped/`), com todas as citações conferidas pelo código e a comparação item por item com o app: 34 acertos, 8 parciais e 62 faltas em 104; dos 70 erros, 59 são de regra e 11 pedem leitura com IA (`docs/estudos/`).
- **Propostas** (aprovadas pela responsável com ajustes, registrados nas decisões): leitura opcional do PMO na etapa 1 (decisão 0032) e etapa 5 por tipo de plano, com premissas críticas nos três lugares e conflitos com o edital (decisão 0033).

### Documentação
- Documentação técnica do app como está no código (v0.8.1), em `docs/tecnico/`. São nove documentos com diagramas: visão geral, arquitetura, dependências (com os ciclos entre pastas), integrações, modelo de dados (o dossiê), fluxos, configuração, build e publicação, e pontos de atenção. Índice novo em `docs/README.md`; `docs/arquitetura.md` e o README passam a apontar para ela.

## [0.8.1] — 16/11/2026

### Correção — etapa 1 com chamamento público para termo de fomento (Lei 13.019/2014)
- **Parceria reconhecida:** termo de fomento, de colaboração ou acordo de cooperação na abertura do documento vira o item "Tipo de parceria". Nela, garantia, reajuste, matriz de riscos e sessão pública saem como "não se aplica a esta modalidade — conferir no documento", não "não localizado"; a fase de celebração conta como habilitação; o Plano de Trabalho é o modelo de proposta; as sanções contam como penalidades.
- **Requisitos:** campo de formulário em branco é ignorado; novo tipo "Condição do objeto" (público-alvo, limite por proponente, prazo e forma de execução, acessibilidade); "projetos" e "propostas" como quantidade.
- **Prazos:** "vigorará por N meses" e "desenvolvido no período de N meses"; prazos do certame contados de um marco sem data (entrega, resultado, recursos, envio dos documentos), só no corpo; esclarecimento "com antecedência mínima de N dias úteis". A CE17 diz que falta a data do certame quando o prazo de execução foi achado.
- **Julgamento:** tabela de critérios com coluna REGULAR/PARCIAL/IRREGULAR lida em duas colunas, um item por critério com a pontuação máxima; pontuação máxima conferida com a soma e pontuação mínima; "pontuação por critérios" como critério de julgamento.
- **Habilitação:** com seção de habilitação no mapa, só vale o trecho dentro dela; tributos mobiliários contam como Fazenda Municipal; reserva de cargos exige a expressão; o trecho começa no item da lista.
- **Brechas:** palavra vaga só vira brecha quando o trecho fala de obrigação, prazo ou entrega de quem executa, não de algo que a administração talvez faça; sem "eventualmente" no foro nem "entre outras" nas atribuições da administração.
- **PDF exportado:** colunas com a largura mínima da palavra mais longa (paisagem quando não cabe), rótulos curtos, origem e trecho numa coluna, trechos e observações repetidos cortados.
- Edital de teste em `tests/fixtures/rfps-publicas/` (fonte e data no README) e testes de cada ponto. Decisão 0031. Versão do app: 0.8.1.

### Documentação
- README: situação do projeto (as cinco etapas construídas, v0.8.0, e o modo demonstração sem a chave) e um espaço antes de vírgula.

## [0.8.0] — 13/11/2026

### F5b — leitura opcional do PMO na conferência (construída sem a chave; teste com a chave pendente)
- **Etapa 5:** depois da conferência por código, o GP pode pedir a leitura do PMO, com o custo antes e o uso depois. Vão o plano, o TAP e a RFP, o que o código já apontou e só o conteúdo mínimo e as perguntas de qualidade das partes presentes.
- **Travas em código:** todo achado do PMO é sugestão ("leitura do PMO"); citação procurada na página ("citação não conferida" quando não acha); ausente procurado no plano inteiro e rebaixado se o código achar, mostrando onde; gravidade e categoria pela parte do plano; achado que o código já apontou é marcado.
- **Decisão do GP** em cada achado do PMO; seção "Leitura do PMO (sugestões)" no relatório e aba na lista de achados; minuta até o GP decidir.
- Testes sem chave: leitura gravada para o plano de teste da etapa 5 (vagos com citação, ausente rebaixado, ausente que vale, citação falsa); fumaça com a API simulada.
- Decisão 0030. Versão do app: 0.8.0.

## [0.7.0] — 13/11/2026

### F4 — plano de gerenciamento com o PMO (construída sem a chave; teste com a chave pendente)
- **Etapa 4 na tela:** documentos usados (o TAP da etapa 3 ou o PDF aprovado; a proposta, opcional), premissas críticas, conexão com o Claude e o custo à vista.
- **Seis passos do PMO, na ordem da decisão 0007:** adaptação, ciclo de vida e abordagem; escopo; atividades, recursos e cronograma; riscos, custos e premissas; demais planos; medição e documentos de execução. As fichas das partes vão no pedido de cada passo (o prefixo fica no cache), e só as que o GP marcou.
- **Adaptação decidida pelo GP:** as 51 partes com a sugestão do PMO (essencial, recomendado, dispensável) e a justificativa; o GP marca o que gerar e escolhe a abordagem.
- **Contas do código:** matriz de rastreabilidade RFP → TAP → EAP → cronograma; cronograma com rede e caminho crítico; marcos conferidos com o TAP; designações com os nomes do GP; custos (horas × valor-hora do GP), linha de base com a contingência e orçamento com a reserva gerencial, conferidos com o TAP ou a proposta.
- **Autoconferência:** o plano gerado passa pelas regras da etapa 5; o que o GP dispensou não conta como ausente; os trechos "a definir pelo GP" aparecem à parte como decisões pendentes; características do projeto sugeridas pelo código e confirmadas pelo GP.
- **Saídas:** plano (DOCX e PDF), registros, cronograma e matrizes (XLSX), EAP e diagrama de rede (SVG) e o pacote .zip com o índice das partes.
- **Etapa 5:** usa o que o GP dispensou na etapa 4 (entra como "dispensada"), as características e as premissas críticas de lá; o requisito também é achado no plano pelo número R e pelo rótulo "Produto N".
- **Redação:** "se… então…" conta como condicional (risco escrito como condição). Os parágrafos exportados mostram os números R de cada item.
- **Demonstração** também na etapa 4, com a proposta, o TAP e o plano gravados.
- A análise da RFP fica guardada (mesmos documentos, mesmo dia): as telas das etapas 2 a 4 deixam de refazê-la a cada mudança. A fumaça roda com dois processos.
- Testes sem chave: respostas do PMO gravadas para a OEI com todas as citações achadas; contas; autoconferência; saídas; fumaça da demonstração com o pacote .zip.
- Decisão 0029. Versão do app: 0.7.0.

## [0.6.0] — 13/11/2026

### F3 — termo de abertura com o PMO (construída sem a chave; teste com a chave pendente)
- **Etapa 3 na tela:** proposta usada (o PDF final do GP ou a proposta da etapa 2 no dossiê, que vira um documento com uma "página" por seção, para as citações serem conferidas), premissas críticas, conexão com o Claude e o custo à vista.
- **Divergências RFP × proposta (código):** requisito a requisito (produtos e equipe), prazo e valor; o que o código não acha fica "não localizado na proposta — conferir". O GP decide o que vale (RFP, proposta ou outra redação).
- **O que vem dos documentos (código):** contratante, objeto, vigência, produtos, valor da proposta, entrega de cada produto no cronograma da proposta, aceite, extinção e partes, com a página.
- **Dois passos do PMO:** os 12 elementos do TAP (objetivos com critério de sucesso, marcos com prazo contado de um evento, partes com papel e decisão) e o registro de premissas inicial (tipo, origem, premissa crítica, consequência, de quem depende, como validar). Campos que só o GP preenche: recursos, gerente e autoridade, patrocinador e a aprovação.
- **Conferência do TAP (código):** elementos com conteúdo, requisitos com número R e todos os R cobertos, marcos dentro do prazo da RFP (inclusive a entrega de cada produto), recursos iguais ao valor da proposta, citações conferidas e premissas críticas no registro com a consequência.
- **Saídas:** termo de abertura (DOCX e PDF) e registro de premissas (XLSX), com minuta enquanto houver pendência.
- **Demonstração** também na etapa 3, com a proposta e o TAP gravados.
- **Etapa 1:** o valor estimado também é achado em "os recursos… estimados em R$".
- Componentes comuns de passo e de item do PMO (a etapa 2 passa a usar o item comum). Tabelas de texto longo quebram linha (sem rolagem horizontal).
- Testes sem chave: respostas do PMO gravadas para a OEI com todas as citações achadas pelo código; divergências com proposta do dossiê e em PDF; conferência; saídas; fumaça na demonstração e com a API simulada.
- Decisão 0028. Versão do app: 0.6.0.

## [0.5.1] — 13/11/2026

### Modo demonstração (decisão 0027)
- **"Ver demonstração"** na etapa 2: abre a concorrência pública da OEI com as respostas do PMO gravadas, sem chamar a API e sem custo. Cada passo do PMO vira "Carregar a resposta gravada"; a conferência das citações, o cronograma, o preço, a revisão e as saídas funcionam como no uso real.
- Aviso sempre visível, "Demonstração com respostas gravadas, sem chamada à IA", no alto de todas as telas e no cabeçalho de todo documento exportado (DOCX, PDF e XLSX). O dossiê guarda o modo.
- As respostas gravadas partem da abordagem B: com outra escolha, o app pede a B antes do conteúdo técnico, em vez de mostrar o conteúdo da B como se fosse da escolhida.
- Testes: as respostas gravadas passam pelo schema da API; o aviso vai no cabeçalho; fumaça da demonstração no navegador sem nenhuma chamada externa.
- Decisão 0027. Versão do app: 0.5.1.

## [0.5.0] — 13/11/2026

### F2 — proposta com o PMO (publicada antes do teste da responsável e sem o teste com a chave, decisão 0026)
- **Conectar ao Claude:** campo da chave, "Testar" (chamada mínima), "só nesta sessão", "lembrar neste navegador" desativado com o motivo e "Esquecer a chave" sempre visível. A chave fica só no `sessionStorage` da aba; nunca vai para o dossiê, para os exportados nem para registros.
- **Etapa 2 na tela:** ponto de partida (código, da etapa 1), três passos do PMO (estratégia e abordagens; conteúdo técnico e SOW; EAP, estimativas e equipe) com o custo estimado antes e o uso real depois, escolha da abordagem e das premissas críticas pelo GP, revisão item a item.
- **Conferência do que o PMO devolve:** citação procurada na página indicada (literal, aproximada e por partes, copiada do Raio-X), "citação não conferida" quando não acha, aviso de redação afirmativa e de número sem fonte.
- **Contas do código:** cronograma PERT com rede, folga e caminho crítico, tempo de aprovação do cliente (decisão do GP), prazo total e prazo de entrega de cada produto contra a RFP; preço de baixo para cima com os valores do GP (tributos por dentro) e conferência com o valor estimado; matriz de atendimento; limite de páginas; checklist de envio.
- **Saídas:** proposta técnica (DOCX e PDF), planilha de preço (XLSX), matriz de atendimento e checklist de envio (XLSX), perguntas de esclarecimento (DOCX).
- **Cliente da API:** SDK oficial 1.6.0, streaming, saída estruturada validada por Zod, cache da skill e dos documentos, esforço por passo, modelo de reserva da própria API em caso de recusa, erros em português.
- **Comparação de modelos** (decisão 0002): `npm run comparar-modelos`, pronta para rodar com a chave.
- Testes sem chave: API simulada (unidade e fumaça no navegador) e respostas do PMO geradas no Claude Code para a RFP pública da OEI, com todas as citações achadas pelo código.
- Guia do gerente (`docs/guia-do-gerente.md`). Decisão 0025. Versão do app: 0.5.0.

## [0.4.0] — 13/11/2026

### F1 — leitura da RFP só com código (publicada antes do teste da responsável, decisão 0026)
- **Etapa 1 na tela:** "Analisar a RFP" lê a RFP e os anexos e organiza o resultado como a análise final: pontos de atenção, identificação, mapa do documento, requisitos, prazos, julgamento, habilitação, forma de apresentação, condições contratuais, partes interessadas e vagos e brechas. Cada item com o rótulo, o documento, a página e o trecho.
- **Mapa:** seções numeradas, cláusulas e anexos (inclusive "ANEXO “A”" e o termo de referência sem a palavra "anexo"), com páginas, a separação corpo × anexos e o tema de cada seção. Cabeçalho e rodapé repetidos ficam fora das buscas.
- **Requisitos numerados** (R01, R02…): produtos, equipe mínima, quantidades e local. O número fica fixo no dossiê, segue para a conferência (etapa 5) e nunca é reaproveitado; o GP edita, descarta e inclui.
- **Prazos:** datas do certame pelo contexto (inclusive tabela de cronograma), limite de esclarecimento e impugnação **calculado pelo código** a partir da sessão (dias úteis, conferir feriados), prazos da execução com a forma de contagem e alerta do que está perto.
- **Julgamento** (critério, modo de disputa, pesos, tabela de pontuação), **habilitação** (catálogo de 31 documentos), **apresentação** e **condições contratuais** com o valor tirado por código (garantia, multas, reajuste, pagamento, subcontratação) e **partes interessadas**.
- **Vagos e brechas:** regras do Raio-X aplicadas à RFP (CTR4, CTR5, CP13, CE15, vedação de subcontratação × campo, CE17), mais prazo com valores diferentes, sessão com datas diferentes, custo de logística a cargo da contratada sem quantidade e os 10 padrões de vago. Cada uma com a pergunta de esclarecimento sugerida e os três estados (achado, não identificado, não verificável).
- **Revisão do GP** item a item (pendente, aceito, editado, descartado), "aceitar os pendentes da seção" e a **decisão de participar**, que só o GP preenche.
- **Saídas:** Análise da RFP (DOCX e PDF), Requisitos e prazos (XLSX), Checklist de habilitação (XLSX) e Perguntas de esclarecimento (DOCX). Cabeçalho de minuta enquanto houver item pendente.
- **Etapa 5:** usa os requisitos da etapa 1 quando existem; perfil de equipe é procurado no plano inteiro; quantidade e local ficam "não conferido pelo código".
- **Correção:** o vago "se necessário" não casa mais com "torna-se necessária" (etapas 1 e 5).
- Testes: cada regra de brecha com um caso que acha e outro que não acha, a análise de um edital de teste, quatro RFPs públicas (inclusive a escaneada e a de 126 páginas), o número do requisito da etapa 1 até a conferência, a redação das sugestões e a fumaça da etapa 1 no navegador.
- Decisão 0024. Versão do app: 0.4.0.

## [0.3.0] — 13/11/2026

### F5 — conferência do PGP só com código (publicada antes do teste da responsável, decisão 0023)
- **Etapa 5 na tela:** mapa do PGP (as 51 partes localizadas por título ou por conteúdo, confirmadas pelo GP: presente, dispensada ou fora do plano), características do projeto, premissas críticas (pré-marcadas, com o sinal achado nos documentos), requisitos da RFP (extraídos pelo código ou incluídos pelo GP, com número fixo).
- **Conferência:** vago (10 padrões de texto), conflituoso (texto de outro documento; prazo total × RFP × TAP), ausente (partes, conteúdo mínimo das fichas, premissas críticas no A8/B3/B27/A11, requisitos na especificação do escopo). Gravidade pela parte do PGP; categoria pela regra fixa da decisão 0008. Página ilegível deixa a verificação "não verificável", nunca "ausente".
- **Decisão do GP** em cada achado (procede ou não, troca de gravidade, justificativa), guardada no dossiê.
- **Exportação:** relatório de conformidade (DOCX e PDF, com minuta enquanto houver achado pendente) e lista de achados (XLSX).
- A skill é lida pelo app no build (fichas e premissas críticas): fonte única com o Claude Code.
- Fixture gerada pelo PMO a partir de uma RFP pública, com 9 erros plantados (vago, conflituoso e ausente em cada gravidade): todos achados, e o plano limpo não é acusado nessas regras.
- Decisões 0022 (regras da conferência) e 0023 (publicação antes do teste).
- Versão do app: 0.3.0.

### Skill PMO 0.2.0 — premissas críticas (decisão 0021)
- `checklist.md` reescrito como **premissas críticas comuns** PC1 a PC8: o que o plano assume, quando se aplica, sinais de aplicação, sinais no plano, o que acontece se não se confirmar e onde tem de estar. A PC2 (sistemas e ferramentas que não são da FGV) é nova.
- Itens novos de conteúdo mínimo: A8.12 (tratamento das premissas críticas; grave), B3.9, B27.13, A11.12, PROP-SOW.11 e TAP-PR.2.
- O que não vira premissa: CTR7 e CP9 (vago), CP8 (conflituoso), CTR2 e CTR3 (etapa 1 e proposta), CP12 e CP14 (conteúdo mínimo dos planos). Saem TC18, TC19, TC21 e TC22 e as perguntas "só se houver campo" e "só se houver beneficiários".
- `SKILL.md` 0.2.0 (princípio 11) e todas as fichas com as citações do checklist antigo trocadas pelos códigos PC, pelo tipo do problema de texto ou pelo item de conteúdo mínimo.
- `CLAUDE.md`, seção 3: os riscos da V29 entram como premissas críticas dentro do plano.

## [0.2.0] — 13/11/2026

### Fase F0 — esqueleto do app (aprovada)

### Adicionado
- App em TypeScript + React + Vite, publicado no GitHub Pages: https://izacxll.github.io/raio-x-do-projeto/
- Identidade visual da apresentação: faixa em degradê, logo da FGV Projetos, trilho da etapa, rótulos de seção, títulos com sublinhado, cartões, grade leve no fundo. Tokens num arquivo só (`src/interface/estilos/tokens.css`), documentados em `docs/identidade-visual.md`.
- Tela inicial "Em que etapa do projeto você está?", com os cinco cartões de etapa e as colunas entra / a ferramenta sugere / sai.
- Tela de cada etapa no fluxo da seção 5.0: passos, documentos obrigatórios e opcionais, aviso de envio à API nas etapas com o PMO.
- Leitura de PDF no navegador: texto por página, montado por linhas (colunas de tabela separadas por tabulação), OCR em português nas páginas sem texto, estado de cada página (texto, OCR, não verificável) com o motivo, aviso de figura ou tabela em imagem. Tudo servido pelo próprio site (decisão 0019).
- Dossiê `.dossie.json`: salvar, abrir, validação pelo esquema, aviso de mudanças não salvas. Nunca guarda a chave.
- Exportação do relatório de leitura em DOCX, PDF e XLSX, com logo, cabeçalho de minuta e versões do app e da skill.
- Content-Security-Policy no site publicado (só o próprio site e `api.anthropic.com`).
- CI: verificação do repositório público (decisão 0010), lint, formatação, testes, build e testes de fumaça no Chromium.
- 8 RFPs públicas de teste em `tests/fixtures/rfps-publicas/`, com fonte e data (inclui uma escaneada e uma de 126 páginas).
- `docs/arquitetura.md`, `docs/identidade-visual.md`.
- Decisões 0017 (F0 antes da P), 0018 (publicação e prévia da fase), 0019 (leitura de PDF) e 0020 (RFPs públicas sem mostrar a lista).

### Alterado
- Ordem das fases: a F0 vem antes da P, e as tags trocam (F0 = v0.2.0, P = v0.3.0; decisão 0005 atualizada).
- `CLAUDE.md`: as RFPs públicas de teste não precisam mais da lista mostrada antes do commit.
- Ajustes da revisão: a tela não mostra mais nomes de fases ("Em construção: a análise chega na próxima versão"); a etapa 1 lista as quatro saídas da especificação (análise, lista de requisitos e quadro de prazos, checklist de habilitação, perguntas de esclarecimento); o "entra:" dos cartões de etapa fica no rodapé. Um teste de fumaça barra termos internos na tela.

## [0.1.0] — 13/11/2026

### Fase S — skill PMO 0.1.0 (aprovada)
- `SKILL.md`: papel, princípios ("sugerir, nunca afirmar"), passo a passo das etapas 2, 3, 4 e 5 (F5b), formato de saída e o que carregar em cada etapa.
- Referências:
  - `pmbok6.md`, `pmbok7.md`, `rework.md`;
  - `licitacoes.md` (valores de 2026);
  - `checklist.md` (12 perguntas, 24 riscos da V29);
  - `experiencia.md`.
- 61 fichas em `artefatos/`, com 608 itens de conteúdo mínimo, cada um com fonte, sinais, quem confere e quando dispensar:
  - o TAP;
  - os 18 componentes e os 33 documentos do PGP;
  - as 9 partes da proposta.
- Decisões 0014 (leitura das fontes), 0015 (formato das fichas) e 0016 (códigos dos itens).

### Corrigido
- `.gitignore`: o padrão `referencias/` passa a valer só para a pasta da raiz (`/referencias/`). Antes, ele também excluía a pasta `.claude/skills/pmo/referencias/` da skill, que precisa ir para o Git.

### Fundação

### Adicionado
- `CLAUDE.md` com os princípios inegociáveis, a divisão código × PMO, a distinção entre brechas do Raio-X e riscos do projeto, as regras do repositório e as de segurança.
- `docs/andamento.md` com as fases, as decisões pendentes e o próximo passo.
- Decisões 0001 a 0013 em `docs/decisoes/`:
  - 0010: saídas do app e extensão `.dossie.json`;
  - 0011: nome do B32;
  - 0012: logo da FGV Projetos;
  - 0013: base do "ausente" em três níveis e leitura opcional do PMO na etapa 5, numa fase nova (F5b), com as tags da F3 e da F4 deslocadas na 0005.
- README inicial, modelos de issue (erro e melhoria) e de pull request.
- `.gitattributes` com fim de linha LF.
- Rótulos no GitHub: `etapa-1` a `etapa-5`, `pmo`, `regras`, `leitura`, `exportacao`, `documentacao`.

### Alterado
- `.gitignore`:
  - PDF liberado só em `tests/fixtures/rfps-publicas/`;
  - DOCX, XLSX, ZIP e `.dossie.json` liberados só em `tests/fixtures/gerados/`;
  - DOC e XLS sempre fora;
  - passa a ignorar build, relatórios de teste e `.claude/settings.local.json`.
