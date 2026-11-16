# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem a decisão [0005](docs/decisoes/0005-branches-versoes-e-tags.md).

## [Não publicado]

### Documentação — métodos revisados e engenharia reversa das cinco etapas
- **Métodos das etapas 1 a 5 substituídos** pela versão revisada pela responsável pelo projeto. Saem os detalhes que identificavam o caso real (número de páginas, meses do cronograma e da vigência, duração da jornada); também na decisão 0033 e na 0034.
- **O que muda nos métodos:**
  - etapas 2 e 4: a saída é o documento inteiro (a minuta redigida seção por seção; o PGP com as seções 0 a 13 da decisão 0007), e o resumo é só a capa;
  - nova conferência por código, quadro de equipe × produtividade (etapas 2 a 5);
  - etapa 4: adaptação por porte e tipo, três pontos só nas entregas de conhecimento e reservas em parceria (seção 4.7).
- **Engenharia reversa das cinco etapas** (`docs/estudos/engenharia-reversa/`): o rastro de cada saída da análise à mão (saída → evidência → regra → código ou PMO → item da skill), com os fluxos, o modelo de dados e os pontos a validar.

### Fase M1 — etapa 1 pelo método (decisões 0034, 0035 e 0036)
- **Leitura da RFP em 8 seções,** na ordem da decisão do gerente, na tela e na "Análise da RFP" (DOCX e PDF): em uma página; o que a contratada teria de fazer e entregar; prazos; dinheiro; julgamento e o que vai na proposta; habilitação; pontos de atenção; o que não se aplica à modalidade. Saem o mapa página a página, as normas além do regime, os órgãos sem papel e as faixas da pontuação (contados em "fora da leitura").
- **O PMO lê; o código monta e confere:** botão "Pedir ao PMO" na etapa 1, com o custo antes e o aviso de envio. A leitura parte do esqueleto do código, e o código confere cada citação, número e número R ("citação não conferida", "valor não conferido"). Sem a chave, a tela mostra o esqueleto com o aviso "leitura parcial por código". Demonstração também na etapa 1.
- **Regras novas do esqueleto:** obrigações de quem executa por tema; cronograma de desembolso com a soma conferida e a condição de cada pagamento; glosa, contrapartida e "não obriga a contratar"; habilitação linha a linha da lista do edital e quem entrega; pontos de atenção com a premissa crítica (PC1 a PC8) e a pergunta; proteções da contratada; situação das datas × hoje e caixa concentrado nas últimas parcelas.
- **Requisitos R = entregas e obrigações específicas de quem executa.** Saem dos R o número de projetos selecionados, o limite por proponente e o prazo de execução. Obrigação lida pelo PMO vira R só quando o GP inclui.
- **Exportados:** checklist de habilitação linha a linha; perguntas com a premissa crítica de cada ponto; requisitos e prazos na lista nova.
- **Gabaritos da SMPED e da OEI** na estrutura do método e **placar** antes e depois (`docs/estudos/placar-m1-etapa-1.md`): itens que não passam no teste caíram de 82 para 6 (SMPED) e de 102 para 2 (OEI); gabarito coberto de 15 para 28 e de 30 para 36 de 50; zero número sem fonte.

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
