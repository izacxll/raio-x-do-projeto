# Rework — práticas, modelos e erros comuns
Versão 0.1.0 (rascunho da fase S). Fonte: biblioteca do Rework (resources.rework.com/libraries), lida em 13/11/2026; 93 artigos. Se o Rework e o PMBOK divergirem, prevalece o PMBOK.

## Como a skill usa o Rework

- **PMBOK é a base; o Rework é a camada prática**: como montar os artefatos, que modelos usar, onde costumam falhar. O detalhe de cada artefato está na sua ficha (`artefatos/`), que cita os artigos; este arquivo é o mapa.
- **Os textos são de mercado privado** (software, venda entre empresas). Toda prática passa pelo filtro do contrato público, com escopo, prazo e valor fixados. Prática que supõe liberdade que o contratante não dá (negociar preço, mudar escopo, parar o projeto) vale só para a gestão interna da FGV, ou não vale.
- **Números dos artigos** (percentuais, pesquisas) são ilustração e não entram nos documentos como fato.
- **Base legal não vem daqui**: fica só em `licitacoes.md`. Onde se lê "aditivo" ou "rito do edital", conferir lá.
- **Uso por etapa**: a seção 4 vai nas chamadas da proposta (etapa 2); as demais apoiam TAP, PGP e leitura do PMO, sempre pela ficha.
- **Remissões**: "RW-NNN (link)" na primeira menção; depois, só o código.

## 1. Planejamento e governança

### 1.1 TAP e abertura
**Acrescenta.** O TAP é curto, vem antes do plano e não leva tarefas. A restrição tripla ajuda a declarar qual lado é rígido: no contrato público, prazo e valor; o ajuste fica no detalhamento do escopo. Há duas partidas: a interna, antes, e a externa, que valida interlocutores, fluxo de aprovação e prazos de análise do contratante. Objetivo qualitativo + resultado-chave com data, separando meta do projeto (produtos aceitos) de meta da política (que a consultoria não controla sozinha).

**Erros.** TAP escrito depois do plano; objetivos sem métrica; sem "fora do escopo"; sem assinatura do patrocinador; mudança de escopo aprovada sem mexer em prazo e custo; qualidade como amortecedor escondido; partida sem patrocinador, exclusões e papéis.

**Artigos.** RW-002 (https://resources.rework.com/libraries/project-management/project-charter); RW-007 (https://resources.rework.com/libraries/project-management/triple-constraint); RW-020 (https://resources.rework.com/libraries/project-management/project-kickoff-meeting); RW-114 (https://resources.rework.com/libraries/productivity/set-tiered-goals-and-metrics); RW-001 (https://resources.rework.com/libraries/project-management/project-planning).

### 1.2 Escopo e requisitos
**Acrescenta.** Entrega é substantivo verificável e só conta quando aceita; "pronto" (revisão FGV) e "aceito" (contratante) são estados distintos no cronograma. O "fora do escopo" é a defesa contra o aumento de escopo, que no setor público nasce em reuniões e oficinas. A rastreabilidade liga cada exigência do TR ao produto, à seção que a atende e ao aceite. MoSCoW prioriza demandas adicionais dentro do produto (os "Won't" ficam registrados); a definição de preparado impede começar sem os insumos do contratante; o SIPOC mostra a fronteira.

**Erros.** Entregas como atividades; critério de aceite vago ou escrito depois; banho de ouro como qualidade; pedido "pequeno" absorvido sem decisão; requisito que não se verifica; matriz feita uma vez; tudo "Must"; DoR que vira portão ou veto.

**Artigos.** RW-003 (https://resources.rework.com/libraries/project-management/project-scope-statement); RW-030 (https://resources.rework.com/libraries/project-management/scope-creep); RW-031 (https://resources.rework.com/libraries/project-management/requirements-traceability-matrix); RW-036 (https://resources.rework.com/libraries/project-management/project-deliverables); RW-063 (https://resources.rework.com/libraries/project-management/moscow-prioritization); RW-066 (https://resources.rework.com/libraries/project-management/definition-of-ready); RW-067 (https://resources.rework.com/libraries/project-management/product-backlog); RW-104 (https://resources.rework.com/libraries/process-management/sipoc-diagram).

### 1.3 Cronograma
**Acrescenta.** Dependências do contratante (dados, agendas, aprovação) entram como atividades com duração e data prometida, para o atraso dele ficar rastreável. Suavizar antes de nivelar, porque a data do produto é contratual. Paralelismo troca tempo por risco de retrabalho; compressão sai da margem. Da corrente crítica, só a ideia de um pulmão explícito antes de cada entrega. Ondas sucessivas, só internamente. Contra a lei de Parkinson, marcos intermediários e rodadas de revisão limitadas.

**Erros.** Ignorar dependências externas; usar dependência para representar falta de recurso; nivelar data contratual sem pedido formal; comprimir fora do caminho crítico; gastar a folga no início; "ondas" como desculpa para não planejar; encurtar prazos sem combinar com quem faz.

**Artigos.** RW-009 (https://resources.rework.com/libraries/project-management/resource-leveling-vs-smoothing); RW-016 (https://resources.rework.com/libraries/project-management/fast-tracking-vs-crashing); RW-024 (https://resources.rework.com/libraries/project-management/critical-chain-project-management); RW-025 (https://resources.rework.com/libraries/project-management/milestone-chart); RW-027 (https://resources.rework.com/libraries/project-management/task-dependencies); RW-037 (https://resources.rework.com/libraries/project-management/rolling-wave-planning); RW-113 (https://resources.rework.com/libraries/productivity/parkinsons-law). Rede, Gantt e folga na seção 2.

### 1.4 Custos e valor agregado
**Acrescenta.** Estimativa é faixa com premissas, não número único. O cone de incerteza lembra que a proposta é cotada no ponto mais largo: escrever as premissas e prever uma etapa inicial de detalhamento. Separar estimativa interna de preço proposto. Com pagamento por produto aceito, o valor agregado pode ser o valor contratual dos produtos aprovados (0/100 por produto) contra horas e despesas reais, o que mostra cedo o consumo da margem.

**Erros.** Ancorar no primeiro número ouvido; omitir indiretos e esforço de revisão; estimativa pontual otimista; absorver mudanças em silêncio; espremer a faixa para agradar; refazer a linha de base para esconder variação; acompanhar só o gasto.

**Artigos.** RW-014 (https://resources.rework.com/libraries/project-management/project-cost-estimation); RW-015 (https://resources.rework.com/libraries/project-management/earned-value-management); RW-040 (https://resources.rework.com/libraries/project-management/cone-of-uncertainty); RW-078 (seção 4).

### 1.5 Riscos
**Acrescenta.** Registro só vale se revisto. O RAID junta riscos, premissas, questões e dependências, e as premissas da proposta alimentam as linhas de premissa. A matriz precisa de âncoras; no setor público, o impacto se ancora também em consequência contratual (glosa, multa, rejeição de produto, apontamento de controle). "Transferir" é limitado pela alocação de riscos do contrato. Pré-mortem antes de fixar preço e prazo. Monte Carlo testa a viabilidade do prazo do edital; em projeto médio, três pontos bastam.

**Erros.** Registro feito na partida e esquecido; descrição vaga; dono "a equipe"; tudo alto, ou tudo no meio da grade; resposta "monitorar de perto"; confundir risco com questão; ignorar oportunidades; P50 tratado como seguro.

**Artigos.** RW-004 (https://resources.rework.com/libraries/project-management/raid-log); RW-005 (https://resources.rework.com/libraries/project-management/risk-register); RW-011 (https://resources.rework.com/libraries/project-management/project-risk-management); RW-012 (https://resources.rework.com/libraries/project-management/risk-matrix); RW-013 (https://resources.rework.com/libraries/project-management/monte-carlo-simulation); RW-042 (https://resources.rework.com/libraries/project-management/pre-mortem).

### 1.6 Partes interessadas e comunicação
**Acrescenta.** Classificar pelo comportamento, não pelo cargo, incluindo resistentes e informais. "Manter satisfeito" inclui órgãos de controle, procuradoria e ordenador de despesa; beneficiários em "manter informado". O plano de comunicação é governança (quem, o quê, canal, frequência, responsável), com canal formal (gestor e fiscal, ofício, ata) separado do técnico; decisão do contratante nunca fica só em mensagem. O status diz se está no rumo, quão grave é o desvio e o que se pede; o relatório ao contratante difere do interno. Toda reunião tem objetivo, pauta, decisor e ata.

**Erros.** Análise feita uma vez; lista sem ações; um canal para tudo; comunicação só de ida; "teatro de status"; relatório sem pedidos; reunião por hábito, sem decisor nem ações.

**Artigos.** RW-006 (https://resources.rework.com/libraries/project-management/stakeholder-analysis-matrix); RW-021 (https://resources.rework.com/libraries/project-management/communication-plan); RW-022 (https://resources.rework.com/libraries/project-management/project-status-report); RW-108 (https://resources.rework.com/libraries/process-management/nominal-group-technique); RW-109 (https://resources.rework.com/libraries/productivity/pointless-meetings); RW-110 (https://resources.rework.com/libraries/productivity/async-communication-best-practices); RW-111 (https://resources.rework.com/libraries/productivity/remote-work-productivity).

### 1.7 Mudanças e linhas de base
**Acrescenta.** Linha de base só existe aprovada. A proposta aceita e o cronograma físico-financeiro são a linha de base externa; convém uma interna (esforço e custo FGV). O controle separa o que o GP resolve do que exige formalização contratual, e registra por escrito todo pedido do contratante. Em valor fixo, a saída usual é trocar escopo dentro do objeto, formalizado. Rejeições também se registram.

**Erros.** Linha de base antes de o escopo estabilizar; "linha de base elástica" (ajustar o plano ao realizado sem pedido); decisão de boca; sem avaliação de impacto; aprovador errado; não atualizar plano e cronograma; misturar questão com pedido de mudança.

**Artigos.** RW-028 (https://resources.rework.com/libraries/project-management/change-control-process); RW-029 (https://resources.rework.com/libraries/project-management/project-baseline); RW-032 (https://resources.rework.com/libraries/project-management/integrated-change-control).

### 1.8 Encerramento e lições
**Acrescenta.** "Entregue" não é "encerrado": o encerramento é tarefa própria (aceite formal, arquivo com dono, recebimento definitivo, último pagamento), e o atestado de capacidade técnica alimenta propostas futuras. Lição vale pela aplicação: registrar ao fim de cada produto e consultar na proposta e no TAP de contratos parecidos. A causa-raiz dá forma a questões e lições.

**Erros.** Liberar a equipe sem aceite; perder documentos com a saída de pessoas; lições só no fim; só o negativo; linguagem genérica; "erro humano" como causa final; ação sem dono.

**Artigos.** RW-035 (https://resources.rework.com/libraries/project-management/project-closure); RW-023 (https://resources.rework.com/libraries/project-management/lessons-learned); RW-115 (https://resources.rework.com/libraries/productivity/measurement-continuous-improvement); RW-069 e RW-106 (seções 3 e 5).

### 1.9 Governança e adaptação
**Acrescenta.** Governança proporcional ao porte; kit mínimo: TAP, plano, riscos, status. Portfólio e portões servem à decisão interna de concorrer e à alocação entre contratos; contrato assinado raramente se "para". Contrato com várias frentes funciona como programa: benefício no TAP, sucesso medido pelos produtos aceitos. O PMBOK é referência, não checklist.

**Erros.** Burocracia no lugar de governança; medir templates preenchidos em vez de entregas; julgar o programa só pelo status das partes.

**Artigos.** RW-017 (https://resources.rework.com/libraries/project-management/project-management-office-pmo); RW-018 (https://resources.rework.com/libraries/project-management/project-portfolio-management); RW-019 (https://resources.rework.com/libraries/project-management/program-vs-project-management); RW-034 (https://resources.rework.com/libraries/project-management/pmbok-guide).

## 2. Ferramentas gerais

| Ferramenta | O que acrescenta | Erros comuns | Artigos |
|---|---|---|---|
| EAP e pacote de trabalho | Nível 2 = produtos do TR, mesmos nomes e números; regra dos 100% testa a cobertura do edital; pacote tem um dono, custo e aceite. | Verbos em vez de entregas; trabalho órfão; sobreposição; Gantt sem EAP. | RW-053 (https://resources.rework.com/libraries/project-management/work-breakdown-structure); RW-038 (https://resources.rework.com/libraries/project-management/work-package) |
| Gantt e marcos | Produtos como marcos, com "entregue" e "aprovado" separados; análise do contratante como dependência com folga; marco tem duração zero. | Desatualizado; falsa precisão; centenas de tarefas; marco com nome vago. | RW-050 (https://resources.rework.com/libraries/project-management/what-is-a-gantt-chart); RW-025 |
| Rede, PERT e caminho crítico | Rede antes do cronograma; o caminho crítico costuma passar por aprovações e dados de terceiros; atenção às convergências. | Rede como enfeite; tudo crítico; laços; ignorar recursos e incerteza. | RW-055 (https://resources.rework.com/libraries/project-management/network-diagram); RW-051 (https://resources.rework.com/libraries/project-management/what-is-a-pert-chart); RW-052 (https://resources.rework.com/libraries/project-management/critical-path-method) |
| Folga | Seguro que se consome; registrar a folga até o fim da vigência; folga negativa vira questão e pedido formal. | Folga como tempo livre; total × livre confundidas; gastar cedo. | RW-056 (https://resources.rework.com/libraries/project-management/float-and-slack) |
| Três pontos | Base escrita (B4) das horas e da reserva embutida no preço; vale para custos de campo. A skill dá O, M e P; o código calcula. | Pessimista subestimado ou inflado; os dois artigos divergem na ordem de colher os valores (a ficha B08 decide). | RW-057 (https://resources.rework.com/libraries/project-management/three-point-estimation); RW-051 |
| RACI e variantes | Uma linha por produto, um só "A"; contratante como "A" ou "C" do aceite; DACI para decisões do contratante; bater com as obrigações do contrato. | Vários "A"; todas as células cheias; C × I; montar sozinho. Nomes são `decisao_gp`. | RW-049 (https://resources.rework.com/libraries/project-management/what-is-raci-matrix); RW-058 (https://resources.rework.com/libraries/project-management/raci-vs-rasci-vs-daci); RW-059 (https://resources.rework.com/libraries/project-management/raci-template-examples) |
| Alocação e capacidade | Alocar a 70–80%; checar capacidade antes do edital, com horas de reunião e revisão; equipe-chave contratual limita trocas. | Alocação a 100%; dedicação plena de quem tem vários projetos. | RW-008 (https://resources.rework.com/libraries/project-management/resource-allocation); RW-010 (https://resources.rework.com/libraries/project-management/capacity-planning) |

## 3. Abordagens ágeis e híbridas: só o que serve a projetos híbridos

**Acrescenta.** O padrão aderente ao contrato público é "plano preditivo, execução iterativa": produtos, prazos e valor fixos; dentro de cada produto, versões e oficinas de validação. Híbrido é decisão por frente (o que se planeja antes, o que se descobre), registrada com o porquê e quando rever, formato bom para A18. A cadência segue o ritmo de decisão do órgão. Aproveitável:
- **Ciclo e portões:** atos formais (assinatura, ordem de serviço, recebimento definitivo) e o aceite de cada produto como portões; gestão por exceção.
- **Kanban** dentro do produto, com coluna "aguardando contratante"; não substitui os marcos.
- **Timeboxing** em oficinas e revisões internas; o que se corta nunca é item do TR.
- **Aceite e pronto:** 3 a 8 critérios verificáveis por produto, sem contrariar o TR; definição de pronto em níveis (seção, produto, entrega).
- **Cerimônias:** reunião curta da equipe, oficina de revisão de versão (distinta do aceite contratual) e retrospectiva interna por produto.
- **Burnup** de produtos aprovados contra o total, com cada degrau ligado a um pedido registrado.
- **Modelo em V:** cada especificação com sua verificação; "atende ao TR" × "resolve o problema da política".

**Não se aplica.** Escopo que muda livremente, backlog do contrato inteiro, revisão de sprint como aceite formal.

**Erros.** Ágil de fachada; "sprints" sem autoridade sobre o escopo; dois sistemas de relatório; "híbrido" para fugir da decisão sobre o que é fixo; complexidade híbrida em projeto pequeno; retrospectiva sem ação.

**Artigos.** RW-041 (https://resources.rework.com/libraries/project-management/hybrid-project-management); RW-047 (https://resources.rework.com/libraries/project-management/waterfall-methodology-project-management); RW-060 (https://resources.rework.com/libraries/project-management/what-is-agile-methodology); RW-061 (https://resources.rework.com/libraries/project-management/agile-vs-waterfall); RW-062 (https://resources.rework.com/libraries/project-management/disciplined-agile); RW-054 (https://resources.rework.com/libraries/project-management/project-life-cycle); RW-026 (https://resources.rework.com/libraries/project-management/prince2-methodology); RW-039 (https://resources.rework.com/libraries/project-management/stage-gate-process); RW-048 (https://resources.rework.com/libraries/project-management/what-is-kanban); RW-044 (https://resources.rework.com/libraries/project-management/timeboxing); RW-045 (https://resources.rework.com/libraries/project-management/v-model); RW-064 (https://resources.rework.com/libraries/project-management/acceptance-criteria); RW-065 (https://resources.rework.com/libraries/project-management/definition-of-done); RW-068 (https://resources.rework.com/libraries/project-management/burnup-chart); RW-069 (https://resources.rework.com/libraries/project-management/sprint-retrospective); RW-070 (https://resources.rework.com/libraries/project-management/agile-ceremonies).

## 4. Proposta (etapa 2)

Os artigos de "Deal Closing" são material de venda entre empresas. **Numa licitação o edital manda**: estrutura, formato, remuneração, planilha, validade, pagamento e minuta de contrato vêm dele. Aproveita-se o que melhora clareza, precisão e decisão interna; descarta-se o que supõe negociar com o comprador. Em contratação direta ou chamamento há mais margem, mas a skill sempre sugere e o GP decide.

### 4.1 Estrutura e redação (`prop-estrutura`, `prop-estrategia`, `prop-entendimento`, `prop-metodologia`)
**Acrescenta.** A proposta existe para provocar uma decisão e gira em torno do problema do contratante, não da FGV. Sem modelo obrigatório, uma sequência útil: sumário executivo (escrito por último, 1–2 páginas); entendimento do desafio com as palavras do TR; solução como ponte entre a situação atual e a desejada, organizada pelos requisitos; plano com fases, dependências e recursos dos dois lados; qualificações escolhidas pelo que importa a este comprador. A forma conta: hierarquia, quadros, metodologia e cronograma em diagrama, poucos destaques para o que pontua, revisão da forma além do conteúdo. Revisão interna por frentes (técnica, preço, jurídico) antes do envio.

**Erros.** Texto genérico em que só muda o nome do cliente; lista de serviços que não responde ao problema; prometer o que não se cumpre; blocos de texto, formatação irregular, erros de digitação.

**NÃO se aplica numa licitação.** Apresentação ao vivo ao comitê, acompanhamento após o envio e rastreamento de leitura (o contato segue os canais formais de esclarecimento e impugnação); retorno sobre investimento como argumento de venda; ordem própria quando há modelo obrigatório; identidade visual quando o julgamento é sem identificação; nada que fira limite de páginas, fonte ou formato.

**Artigos.** RW-071 (https://resources.rework.com/libraries/deal-closing/proposal-development); RW-072 (https://resources.rework.com/libraries/deal-closing/proposal-design). Metodologia: RW-102, 103, 105, 106, 108 (seção 5).

### 4.2 SOW: produtos, aceite, premissas e exclusões (`prop-sow`)
**Acrescenta.** Na consultoria pública, o "SOW" é o TR mais o plano de trabalho da proposta. A proposta não renegocia o escopo, mas explicita o que o TR deixa aberto. Lista de conferência das lacunas do TR, cada item ligado à disputa que previne:
- produtos quantificados (formato, volume, prazo);
- marcos e dependências entre produtos;
- obrigações do contratante (dados, acessos, interlocutores, prazos de análise);
- aceite objetivo, com prazo de análise, documento e tratamento da recusa;
- premissas escritas, para medir a mudança contra elas;
- via de mudança.
Folgas para demora de decisão, rodadas de revisão e feriados.

**Erros.** Entregas com várias leituras; aceite subjetivo ("a contento"); prazos sem marcos; premissas não escritas; obrigações do contratante ausentes; prazos que ignoram as dependências do cliente.

**NÃO se aplica numa licitação.** Negociar o SOW (escopo, prazos e pagamento vêm do edital); preço de mudanças fixado na proposta; mudança fora do rito contratual (`licitacoes.md`).

**Artigos.** RW-075 (https://resources.rework.com/libraries/deal-closing/sow-creation); RW-033 (https://resources.rework.com/libraries/project-management/statement-of-work); RW-036; RW-064; RW-030.

### 4.3 Preço e planilha (`prop-preco`, `prop-matriz-atendimento`)
**Acrescenta.** A proposta responde "por que esta solução"; a planilha, "quanto custa"; as duas precisam bater. Conferência da planilha: identificação, itens com nome compreensível, quantidades e unidades, unitários e totais, tributos, validade, remissão ao edital, o que não está incluído e cabe ao contratante; nova versão a cada alteração e revisão dupla das contas. Internamente: estrutura de custos, margem-alvo e preço mínimo exequível, para decidir participar e para a alçada caso o rito preveja negociação. Perguntar qual unidade de valor o contratante enxerga (produto, etapa aceita) e alinhar o desembolso a ela quando o edital permitir.

**Erros.** Erro de conta (pode desclassificar); informação incompleta; dados do órgão errados; preço sem ligação com o esforço da EAP; copiar preço de concorrente ou de contrato antigo.

**NÃO se aplica numa licitação.** Toda a negociação entre empresas: âncora alta para dar desconto; opção-isca, níveis de pacote, preço por resultado; desconto em troca de prazo, volume ou referência; descontos em linha; validade escolhida pelo proponente. A proposta é firme, exequível e compatível com o orçamento estimado, no modelo do edital, e o critério de julgamento define o peso do preço. A única negociação é a do rito do certame, por iniciativa do órgão (`licitacoes.md`). Contas e preço final são do código e do GP.

**Artigos.** RW-076 (https://resources.rework.com/libraries/deal-closing/quote-generation); RW-073 (https://resources.rework.com/libraries/deal-closing/pricing-strategies); RW-074 (https://resources.rework.com/libraries/deal-closing/pricing-negotiation); RW-014.

### 4.4 Condições contratuais e pagamento (`prop-estrategia`, `prop-preco`, checklist 3 e 4)
**Acrescenta.** Condição contratual é alocação de risco e pesa tanto quanto o preço. Ler a minuta do edital por cinco grupos: comerciais (prazo de pagamento, reajuste); desempenho (níveis de serviço, garantia de resultado fora do próprio controle); risco (responsabilidade sem teto, multas, indenizações, seguros); relacionamento (governança, equipe dedicada); saída (extinção, titularidade dos produtos e direitos autorais, sigilo, guarda de dados). Para cada risco: pedir esclarecimento, impugnar, aceitar com reserva no preço ou não participar. O que seria "inegociável" numa venda privada vira critério interno de participar. Do pagamento, só a estrutura por marcos se aplica (após entrega e aceite, conforme o cronograma físico-financeiro); daí estimar o capital de giro que a FGV banca até o primeiro pagamento, com o prazo de aceite.

**Erros.** Aceitar a minuta sem ler o que foge do usual; avaliar só o preço e não o pacote; acordo verbal sem registro; cláusula jurídica sem o jurídico.

**NÃO se aplica numa licitação.** Negociar condições (a minuta é do órgão, que tem prerrogativas próprias); trocar condição por desconto; pagamento antecipado, sinal, desconto por pagamento rápido ou prêmio por prazo; análise de crédito do cliente; renovação e reajuste propostos pelo fornecedor. Base legal só em `licitacoes.md`.

**Artigos.** RW-077 (https://resources.rework.com/libraries/deal-closing/terms-negotiation); RW-078 (https://resources.rework.com/libraries/deal-closing/payment-terms).

### 4.5 EAP, estimativas e equipe (`prop-eap-cronograma`, `prop-equipe`)
Ver seção 2 (RW-053, 057, 049, 010), mais pré-mortem (RW-042) e cone de incerteza (RW-040).

## 5. Processos e produtividade da equipe

**Acrescenta.** Muitos projetos da FGV têm como produto o processo do órgão; estes artigos dão roteiro à metodologia e às rotinas internas.
- **Mapeamento atual × futuro:** observar quem executa, não só gestores; validar o atual antes de desenhar o futuro (duas rodadas de validação ao dimensionar); notação do TR; plano de transição; o futuro pode depender de mudança normativa.
- **SIPOC** do próprio projeto na proposta; na execução, primeira oficina.
- **POP:** quando manual é produto, dá método e critério de aceite (validação com servidores, teste de uso).
- **PDCA:** lógica do piloto (testar pequeno, medir contra meta prévia, escalar).
- **Garantia × controle:** modelos e revisão por pares × revisão de cada produto e aceite; devoluções analisadas em conjunto.
- **Causa-raiz e grupo nominal:** para questões, lições e oficinas com níveis hierárquicos diferentes.
- **Priorização** (valor × esforço, RICE, Eisenhower): para recomendações de política e triagem do dia a dia; obrigação contratual é restrição, nunca opção.

**Erros.** Mapa feito a partir de documentos; solução antes de acordar o atual; POP longo e nunca testado; qualidade "saudável no papel"; revisão só por quem produziu; parar em "erro humano"; oficina com chefia falando primeiro; ajustar nota para favorecer o preferido.

**Artigos.** RW-101 (https://resources.rework.com/libraries/process-management/standard-operating-procedure); RW-102 (https://resources.rework.com/libraries/process-management/business-process-mapping); RW-103 (https://resources.rework.com/libraries/process-management/current-vs-future-state-map); RW-105 (https://resources.rework.com/libraries/process-management/what-is-pdca); RW-106 (https://resources.rework.com/libraries/process-management/root-cause-analysis); RW-107 (https://resources.rework.com/libraries/process-management/qa-vs-qc); RW-112 (https://resources.rework.com/libraries/productivity/the-eisenhower-matrix); RW-043 (https://resources.rework.com/libraries/project-management/rice-prioritization); RW-046 (https://resources.rework.com/libraries/project-management/value-vs-effort-matrix); RW-104 e RW-108 (seções 1.2 e 1.6).

## 6. Quadro de cobertura: artigos × artefatos

Fonte: coluna "Ficha" do `_indice.md`, somada às "Fontes" das fichas de `artefatos/` (busca por "RW-", 13/11/2026). "Coberto" = ao menos um artigo. Asterisco (\*) = ficha ainda não escrita; a coluna vem só do índice.

| Artefato | Artigos do Rework | Situação |
|---|---|---|
| A1 Escopo (plano) | RW-029, 030, 036, 037, 104 | coberto |
| A2 Requisitos (plano) | RW-030, 031, 063, 066, 067 | coberto |
| A3 Cronograma (plano) | RW-009, 016, 024, 027, 037, 052, 056, 113 | coberto |
| A4 Custos (plano) | RW-014, 015, 022, 040, 078 | coberto |
| A5 Qualidade (plano) | RW-045, 064, 065, 105, 107 | coberto |
| A6 Recursos (plano) | RW-008, 010, 111 | coberto |
| A7 Comunicações (plano)\* | RW-020, 021, 070, 109, 110, 111 | coberto |
| A8 Riscos (plano) | RW-004, 005, 011, 012, 013, 042 | coberto |
| A9 Aquisições (plano) | — | sem artigo |
| A10 Engajamento das partes | RW-006, 108 | coberto |
| A11 Mudanças (plano) | RW-028, 032 | coberto |
| A12 Configuração (plano) | — | sem artigo |
| A13 Linha de base do escopo | RW-029, 036, 038, 053 | coberto |
| A14 Linha de base do cronograma | RW-009, 029, 037 | coberto |
| A15 Linha de base dos custos | RW-015, 029 | coberto |
| A16 Linha de base da medição | RW-015, 029, 068, 114, 115 | coberto |
| A17 Ciclo de vida | RW-026, 037, 039, 054 | coberto |
| A18 Abordagem de desenvolvimento | RW-026, 041, 044, 047, 048, 060, 061, 062 | coberto |
| B1 Atributos das atividades | RW-027, 038 | coberto |
| B2 Lista de atividades | RW-027, 037, 038, 051, 053 | coberto |
| B3 Registro de premissas | RW-003, 004 | coberto |
| B4 Bases das estimativas | RW-014, 040, 057 | coberto |
| B5 Registro das mudanças | RW-028, 032 | coberto |
| B6 Estimativas de custos | RW-014, 040, 057 | coberto |
| B7 Previsões de custos | RW-015, 022 | coberto |
| B8 Estimativas de duração | RW-013, 024, 040, 051, 057, 113 | coberto |
| B9 Registro das questões | RW-004, 032, 054, 106 | coberto |
| B10 Lições aprendidas | RW-023, 026, 069, 105, 106, 115 | coberto |
| B11 Lista de marcos | RW-025 | coberto |
| B12 Recursos físicos | RW-008 | coberto |
| B13 Calendários do projeto | — | sem artigo |
| B14 Comunicações do projeto\* | RW-022 | coberto |
| B15 Cronograma | RW-009, 016, 024, 025, 027, 050, 052, 056 | coberto |
| B16 Diagrama de rede | RW-027, 051, 052, 055, 056 | coberto |
| B17 Especificação do escopo | RW-003, 030, 033, 036, 064, 104 | coberto |
| B18 Designações da equipe | RW-008, 049, 058, 059 | coberto |
| B19 Medições de controle da qualidade | RW-045, 107 | coberto |
| B20 Métricas da qualidade | RW-064, 065 | coberto |
| B21 Relatório de qualidade | RW-022, 107 | coberto |
| B22 Documentação dos requisitos | RW-030, 031, 063, 067 | coberto |
| B23 Matriz de rastreabilidade | RW-030, 031 | coberto |
| B24 Estrutura analítica dos recursos | — | sem artigo |
| B25 Calendários dos recursos\* | — | sem artigo |
| B26 Requisitos de recursos | RW-010 | coberto |
| B27 Registro dos riscos | RW-004, 005, 011, 012 | coberto |
| B28 Relatório de riscos | RW-013, 022 | coberto |
| B29 Dados do cronograma | — | sem artigo |
| B30 Previsões do cronograma | RW-013, 015 | coberto |
| B31 Registro das partes interessadas | RW-006 | coberto |
| B32 Termo de nomeação da equipe\* | — | sem artigo |
| B33 Documentos de teste e avaliação | RW-045, 064, 107 | coberto |
| TAP | RW-002, 006, 007, 020, 025, 035, 114 | coberto |
| PROP-ESTRATEGIA | RW-071, 073, 074, 077 | coberto |
| PROP-ESTRUTURA | RW-071, 072 | coberto |
| PROP-ENTENDIMENTO | RW-071, 075 | coberto |
| PROP-METODOLOGIA | RW-036, 071, 075 | coberto |
| PROP-SOW | RW-030, 033, 036, 064, 075, 078 | coberto |
| PROP-EAP-CRONOGRAMA | RW-014, 033, 036, 053, 057 | coberto |
| PROP-EQUIPE | RW-036, 049 | coberto |
| PROP-PRECO | RW-014, 071, 073, 074, 076, 078 | coberto |
| PROP-MATRIZ-ATENDIMENTO | RW-072, 076 | coberto |

**Observações.** Ligados só a GERAL, CHK ou EXP no índice: RW-001, 017, 018, 019, 034, 043, 046, 101, 102, 103, 112. Os resumos de RW-102, 103, 105, 106 e 108 sugerem uso na metodologia da proposta, mas não estão na ficha `prop-metodologia`.

**Resumo.** 61 artefatos: 54 cobertos e 7 sem artigo (**A9, A12, B13, B24, B25, B29, B32**). Nesses sete, a ficha se apoia só no PMBOK e na experiência (`experiencia.md`).
