# PMBOK 6 — áreas de conhecimento, processos, entradas e saídas
Versão 0.2.0. Fonte: PMI, Guia PMBOK, 6ª ed., em português. Páginas: impressa (PDF).

Convenções:
- `p. 75 (111)` = página impressa 75, página 111 do PDF. Em todo o livro, PDF = impressa + 36.
- A1–A18 = componentes do plano; B1–B33 = documentos do projeto. A numeração segue a Tabela 4-1, p. 89 (125), e a Tabela 1-2 da Parte 2, p. 559 (595). Lista completa na seção 4.
- TAP1–TAP12 = elementos do termo de abertura (4.1.3.1, p. 81 (117)), listados na seção 1.
- Grupos: I = iniciação, P = planejamento, E = execução, M = monitoramento e controle, F = encerramento.
- Texto resumido e reorganizado. Aspas só em definições curtas do livro. `[inferência]` marca conclusão de leitura, não texto do livro.

## Como a skill usa o PMBOK 6

Este arquivo é o mapa geral: que processo produz cada parte do plano, quem a usa e o que se adapta. O conteúdo item a item de cada artefato fica nas fichas de `artefatos/`. Os nomes oficiais dos artefatos vêm daqui, e a seção 6 traz as variantes da tradução: "declaração" e "especificação" do escopo (B17); "EGP" para PMO; "termo de nomeação da equipe" para *team charter* (B32); "designações", "atribuições" e "alocações" da equipe (B18). O PMBOK 6 é descritivo, não prescritivo. As listas de entradas e saídas são exemplos, não requisitos (Parte 2, 1.11, p. 558 (594)). Por isso o conferidor cobra **coerência entre as partes escolhidas**, não a presença dos 18 componentes e dos 33 documentos.

## 1. Conceitos de base

- **Projeto:** "esforço temporário empreendido para criar um produto, serviço ou resultado único" (1.2.1, p. 4 (40)). Temporário = início e fim definidos, não necessariamente curto. Também termina por motivo legal ou de conveniência (p. 5 (41)). O valor de negócio inclui serviço e benefício públicos (p. 7 (43)).
- **Adaptação (*tailoring*):** escolher processos, entradas, ferramentas, técnicas, saídas e fases adequados ao projeto, considerando governança, cultura e se o cliente é interno ou externo (1.2.5, p. 28 (64)). O Guia não é metodologia (p. 2 (38)).
- **Ciclo de vida do projeto [A17]:** a série de fases do início ao término. As fases podem ser sequenciais, iterativas ou sobrepostas. Estrutura genérica: início, organização e preparação, execução do trabalho, término. É independente do ciclo de vida do produto (1.2.4.1, p. 18–19 (54–55)).
- **Atributos de fase** (1.2.4.2, p. 20 (56)): nome, número, duração, requisitos de recursos, critérios de entrada e critérios de saída.
- **Abordagem de desenvolvimento [A18]:** preditiva (cascata), iterativa, incremental, adaptativa (ágil) ou híbrida. Quem escolhe é a equipe de gerenciamento (p. 19 (55)). Fases diferentes de um mesmo projeto podem usar ciclos diferentes (X3.1, p. 666 (702)).
- **Revisão de fase** (1.2.4.3, p. 21 (57)): compara o desempenho com business case, TAP, plano e plano de benefícios, e decide prosseguir (com ou sem alterações), terminar, continuar ou repetir a fase. Outros nomes: análise de estágio, ponto de corte. No início de cada fase, revêm-se TAP, documentos de negócios, critérios de sucesso e partes interessadas (Parte 2, p. 562 (598)).
- **Grupos de processos não são fases;** todos podem ocorrer dentro de cada fase (p. 23 (59); p. 555 (591)). Um processo roda uma vez ou em pontos predefinidos, periodicamente ou continuamente (p. 22 (58)).
- **Ambiente:**
  - FAE (2.2, p. 37–39 (73–75)): condições fora do controle da equipe, como cultura, restrições de contratação, clima político, leis e padrões governamentais.
  - APO (2.3, p. 39–41 (75–77)): processos e procedimentos (em geral do EGP, que o projeto não altera) e bases de conhecimento (que o projeto atualiza).
  - Autoridade do GP (Tabela 2-1, p. 47 (83)): pouca ou nenhuma na funcional e na matriz fraca; moderada a alta na matriz forte; alta a quase total na orientada a projetos.
- **EGP (PMO):** "Uma estrutura de gerenciamento que padroniza os processos de governança relacionados com o projeto" (glossário, p. 708 (744)). Tipos (2.4.4.3, p. 48 (84)): de suporte (modelos, treinamento, lições; controle baixo), de controle (exige conformidade com metodologia e modelos; médio) e diretivo (gerencia os projetos; alto). Pode auditar a conformidade e encerrar projetos (p. 49 (85)).
- **Gerente do projeto** (3.2, p. 52 (88)): designado pela organização executora para liderar a equipe. Pode atuar antes da iniciação e depois, nos benefícios (p. 51 (87)), e ser consultor externo temporário (p. 55 (91)). Triângulo de Talentos: técnica, liderança, estratégia e negócios (3.4, p. 56 (92)). A integração não pode ser delegada (p. 72 (108)).
- **Documentos de negócios** (1.2.6, p. 29–33 (65–69)): business case (necessidade, análise da situação com opções como "não fazer nada", recomendação, avaliação dos benefícios) e plano de gerenciamento de benefícios (benefícios-alvo, prazo, proprietário, indicadores, premissas, riscos). São anteriores ao projeto e **não são documentos do projeto**; o GP pode recomendar mudanças, não alterá-los (p. 78 (114)).
- **TAP:** "documento emitido pelo patrocinador do projeto que autoriza formalmente a sua existência" (1.2.6.3, p. 34 (70)). Não é contrato, porque não envolve troca de dinheiro. Em projeto externo, o contrato é o acordo preferido, e o TAP pode servir de acordo interno. O GP deve ser designado cedo, sempre antes do planejamento (4.1, p. 77 (113)). Elementos (4.1.3.1, p. 81 (117)):
  - TAP1 finalidade; TAP2 objetivos mensuráveis e critérios de sucesso; TAP3 requisitos de alto nível;
  - TAP4 descrição, limites e entregas-chave; TAP5 risco geral; TAP6 resumo do cronograma de marcos;
  - TAP7 recursos financeiros pré-aprovados; TAP8 partes interessadas-chave;
  - TAP9 requisitos de aprovação (o que é sucesso, quem decide, quem autoriza o encerramento); TAP10 critérios de término ou cancelamento;
  - TAP11 GP designado, responsabilidade e nível de autoridade; TAP12 nome e autoridade do patrocinador.
- **Medidas de sucesso** (1.2.6.4, p. 34–35 (70–71)): o que é sucesso, como medir, o que pode afetá-lo. Exemplos: VPL, ROI, TIR, termos do contrato, governança, satisfação. Cumprir escopo, prazo e custo não garante sucesso para o negócio.
- **Plano de gerenciamento do projeto:** "o documento que descreve como ele será executado, monitorado e controlado" (p. 34 (70)). Reúne planos auxiliares, linhas de base e descrição do ciclo de vida (p. 558 (594)) e tem, no mínimo, linhas de base de escopo, tempo e custo (4.2, p. 83 (119)). Aprovado, vira linha de base e só muda por 4.6 (p. 83 (119); p. 565 (601)). A11, A12, A16, A17, A18 e as "revisões de gerenciamento" (fora dos 18) nascem em 4.2 (X1.5, p. 642 (678)).
- **Mudança × atualização:** a mudança altera um item sob controle formal ("qualquer entrega formalmente controlada", componente ou documento); a atualização altera um item "que não está sob controle de mudança formal" (glossário, p. 716 (752) e p. 700 (736)).

## 2. Grupos de processos × áreas de conhecimento

São 49 processos: 2 de iniciação, 24 de planejamento, 10 de execução, 12 de monitoramento e controle e 1 de encerramento (Tabela 1-4, p. 25 (61); Parte 2, Tabela 1-1, p. 556 (592)). Nomes conferidos no índice do livro.

| Nº | Processo | Grupo | Área | Início: p. (PDF) |
|---|---|---|---|---|
| 4.1 | Desenvolver o Termo de Abertura do Projeto | I | Integração | 75 (111) |
| 4.2 | Desenvolver o Plano de Gerenciamento do Projeto | P | Integração | 82 (118) |
| 4.3 | Orientar e Gerenciar o Trabalho do Projeto | E | Integração | 90 (126) |
| 4.4 | Gerenciar o Conhecimento do Projeto | E | Integração | 98 (134) |
| 4.5 | Monitorar e Controlar o Trabalho do Projeto | M | Integração | 105 (141) |
| 4.6 | Realizar o Controle Integrado de Mudanças | M | Integração | 113 (149) |
| 4.7 | Encerrar o Projeto ou Fase | F | Integração | 121 (157) |
| 5.1 | Planejar o Gerenciamento do Escopo | P | Escopo | 134 (170) |
| 5.2 | Coletar os Requisitos | P | Escopo | 138 (174) |
| 5.3 | Definir o Escopo | P | Escopo | 150 (186) |
| 5.4 | Criar a EAP | P | Escopo | 156 (192) |
| 5.5 | Validar o Escopo | M | Escopo | 163 (199) |
| 5.6 | Controlar o Escopo | M | Escopo | 167 (203) |
| 6.1 | Planejar o Gerenciamento do Cronograma | P | Cronograma | 179 (215) |
| 6.2 | Definir as Atividades | P | Cronograma | 183 (219) |
| 6.3 | Sequenciar as Atividades | P | Cronograma | 187 (223) |
| 6.4 | Estimar as Durações das Atividades | P | Cronograma | 195 (231) |
| 6.5 | Desenvolver o Cronograma | P | Cronograma | 205 (241) |
| 6.6 | Controlar o Cronograma | M | Cronograma | 222 (258) |
| 7.1 | Planejar o Gerenciamento dos Custos | P | Custos | 235 (271) |
| 7.2 | Estimar os Custos | P | Custos | 240 (276) |
| 7.3 | Determinar o Orçamento | P | Custos | 248 (284) |
| 7.4 | Controlar os Custos | M | Custos | 257 (293) |
| 8.1 | Planejar o Gerenciamento da Qualidade | P | Qualidade | 277 (313) |
| 8.2 | Gerenciar a Qualidade | E | Qualidade | 288 (324) |
| 8.3 | Controlar a Qualidade | M | Qualidade | 298 (334) |
| 9.1 | Planejar o Gerenciamento dos Recursos | P | Recursos | 312 (348) |
| 9.2 | Estimar os Recursos das Atividades | P | Recursos | 320 (356) |
| 9.3 | Adquirir Recursos | E | Recursos | 328 (364) |
| 9.4 | Desenvolver a Equipe | E | Recursos | 336 (372) |
| 9.5 | Gerenciar a Equipe | E | Recursos | 345 (381) |
| 9.6 | Controlar os Recursos | M | Recursos | 352 (388) |
| 10.1 | Planejar o Gerenciamento das Comunicações | P | Comunicações | 366 (402) |
| 10.2 | Gerenciar as Comunicações | E | Comunicações | 379 (415) |
| 10.3 | Monitorar as Comunicações | M | Comunicações | 388 (424) |
| 11.1 | Planejar o Gerenciamento dos Riscos | P | Riscos | 401 (437) |
| 11.2 | Identificar os Riscos | P | Riscos | 409 (445) |
| 11.3 | Realizar a Análise Qualitativa dos Riscos | P | Riscos | 419 (455) |
| 11.4 | Realizar a Análise Quantitativa dos Riscos | P | Riscos | 428 (464) |
| 11.5 | Planejar as Respostas aos Riscos | P | Riscos | 437 (473) |
| 11.6 | Implementar Respostas aos Riscos | E | Riscos | 449 (485) |
| 11.7 | Monitorar os Riscos | M | Riscos | 453 (489) |
| 12.1 | Planejar o Gerenciamento das Aquisições | P | Aquisições | 466 (502) |
| 12.2 | Conduzir as Aquisições | E | Aquisições | 482 (518) |
| 12.3 | Controlar as Aquisições | M | Aquisições | 492 (528) |
| 13.1 | Identificar as Partes Interessadas | I | Partes interessadas | 507 (543) |
| 13.2 | Planejar o Engajamento das Partes Interessadas | P | Partes interessadas | 516 (552) |
| 13.3 | Gerenciar o Engajamento das Partes Interessadas | E | Partes interessadas | 523 (559) |
| 13.4 | Monitorar o Engajamento das Partes Interessadas | M | Partes interessadas | 530 (566) |

A Parte 2 (O Padrão) numera os mesmos processos por grupo: 2.1–2.2, 3.1–3.24, 4.1–4.10, 5.1–5.12 e 6.1. Exemplos: 3.5 = 5.4; 4.8 = 11.6; 6.1 = 4.7 (p. 563–634 (599–670)).

## 3. Processos por área

Em cada processo: o que faz → saídas principais. As páginas de início estão na seção 2.

### 4. Integração (cap. 4, p. 69 (105))
Identifica, combina, unifica e coordena as demais áreas. É responsabilidade do GP e não pode ser delegada (p. 72 (108)).
- **4.1** autoriza o projeto. Só tem entradas externas: documentos de negócios, acordos, FAE e APO. → **TAP, B3**.
- **4.2** consolida planos auxiliares e linhas de base. → **plano**; nascem aqui A11, A12, A16, A17 e A18 (X1.5). Reunião de início: uma por fase em projeto multifase (p. 86 (122)).
- **4.3** executa o trabalho e as mudanças aprovadas. → entregas, dados de desempenho, **B9** (nasce aqui), solicitações de mudança.
- **4.4** reutiliza e cria conhecimento. → **B10** (nasce aqui). Dois equívocos comuns: achar que basta documentar e achar que lições se coletam só no fim (p. 100 (136)).
- **4.5** compara o realizado com o plano e faz previsões. → relatórios de desempenho do trabalho; atualiza B7, B9, B10, B27 e B30.
- **4.6** aprova, adia ou rejeita mudanças. → solicitações aprovadas; atualiza **B5**. O CCM decide; o cliente pode ter de aprovar depois do CCM (p. 115–117 (151–153)).
- **4.7** encerra o projeto, uma fase ou um contrato. → transição do produto, relatório final, B10 e APO. Não atualiza o plano. Usa B9 e B28 para confirmar que não há questões nem riscos pendentes (p. 124–125 (160–161)).
- **Regras verificáveis:**
  - linha de base só muda por 4.6, a partir da última, sem reescrever o passado (p. 120 (156));
  - toda mudança fica por escrito, e o plano diz quem aprova, adia ou rejeita (p. 115 (151));
  - mudança que afeta linha de base traz custo, datas, recursos e riscos (p. 117 (153));
  - o plano segue as regras do programa, como o limiar de custo que leva a mudança ao CCM (p. 83 (119));
  - no encerramento antecipado, documentar os motivos (p. 123 (159)).
- **Adaptação** (p. 74 (110); X5.1, p. 679 (715)): ciclo de vida; abordagem; processos conforme cultura e complexidade; conhecimento; mudanças; governança (comitês, relatórios de status); lições; quando relatar benefícios.
- **Ágil** (p. 74 (110); X3.3, p. 669–671 (705–707)): a equipe detalha o planejamento; o TAP é revalidado a cada ciclo; a retrospectiva é a principal ferramenta de conhecimento; um único backlog concentra trabalho e mudanças; encerrar cedo pode ser "realização antecipada de benefícios".

### 5. Escopo (cap. 5, p. 129 (165))
Garante que o projeto contenha todo o trabalho necessário, e só ele.
- **5.1** → **A1, A2**. Usa A5, A17 e A18.
- **5.2** levanta e documenta os requisitos. → **B22, B23**. Fontes: TAP, acordos, business case, solicitações de propostas e documentação regulatória (p. 141–143 (177–179)).
- **5.3** seleciona os requisitos finais e descreve o projeto e o produto. → **B17**; atualiza B3, B22, B23 e B31 (p. 151 (187)).
- **5.4** decompõe as entregas. → **A13** = B17 aprovada + EAP + dicionário da EAP.
- **5.5** formaliza a aceitação das entregas pelo cliente ou patrocinador. → entregas aceitas (vão para 4.7); as rejeitadas viram solicitações de mudança. Validar trata da aceitação; controlar a qualidade trata da correção (p. 164 (200)).
- **5.6** acompanha o escopo e as mudanças. Algum controle de mudanças é obrigatório em todo projeto (p. 168 (204)).
- **Regras verificáveis:**
  - **regra dos 100%:** a EAP cobre todo o trabalho, inclusive o de gerenciamento; o que está embaixo soma o que está em cima, sem omissão nem trabalho extra (p. 161 (197));
  - os componentes da EAP são entregas, não atividades (p. 157 (193)); os de baixo são necessários e suficientes para o de cima;
  - cada pacote de trabalho tem identificador único e pertence a uma só conta de controle (p. 161 (197));
  - decompor demais é armadilha; entregas distantes ficam para ondas sucessivas; profundidades diferentes entre ramos são normais (p. 160 (196));
  - B17 traz critérios de aceitação e exclusões explícitas (p. 154 (190));
  - o TAP fica em alto nível e B17 detalha (Tabela 5-1, p. 155 (191)).
- **Adaptação** (p. 133 (169); X5.2): sistemas de requisitos e reuso; políticas de validação e controle; abordagem; estabilidade dos requisitos; auditoria.
- **Ágil** (p. 131 e 133 (167 e 169)): menos definição inicial e mais descoberta; requisitos no backlog; 5.2 a 5.6 se repetem por iteração; o backlog substitui a linha de base do escopo; épicos se decompõem em histórias (p. 160 (196)).

### 6. Cronograma (cap. 6, p. 173 (209))
Garante o término pontual. Em projetos pequenos, 6.2 a 6.5 podem ser um só processo (p. 175 (211)).
- **6.1** → **A3**.
- **6.2** decompõe os pacotes de trabalho em atividades. → **B2, B1, B11**.
- **6.3** monta a rede de dependências. → **B16**. Relações TI, TT, II e IT (TI é a mais comum, IT é rara). Dependências obrigatórias ou arbitradas, externas ou internas (p. 189–192 (225–228)).
- **6.4** estima durações: análoga, paramétrica, três pontos, bottom-up, análise de reservas. → **B8, B4**. Usa B26, B24, B18, B25 e B27 (p. 198–199 (234–235)).
- **6.5** calcula o cronograma: caminho crítico, nivelamento, cenários "E-se", Monte Carlo, compressão. → **A14, B15, B29, B13**.
- **6.6** controla o cronograma. → **B30** e informações de desempenho.
- **Regras verificáveis:**
  - toda atividade, menos a primeira e a última, tem ao menos uma predecessora e uma sucessora (p. 188 (224));
  - sem ciclos e sem duas relações no mesmo par (p. 190 (226)); dependências arbitradas documentadas (p. 191 (227));
  - **marcos têm duração zero** e são marcados obrigatórios (por exemplo, contratuais) ou opcionais (p. 186 (222));
  - antecipações e esperas não substituem a lógica nem entram nas durações (p. 193 e 203 (229 e 239));
  - B4 registra método, premissas, restrições, faixa, nível de confiança e riscos considerados (p. 204 (240));
  - B15 traz, no mínimo, início e término planejados de cada atividade e é preliminar até as alocações de recursos serem confirmadas (p. 217 (253));
  - **reserva de contingência dentro da linha de base, reserva gerencial fora** (p. 202 (238));
  - antes de aprovar a linha de base, conferir conflitos lógicos e nivelamento contra os calendários (p. 207 (243));
  - a compressão (*crashing*) só funciona no caminho crítico e aumenta custo e risco; o paralelismo (*fast tracking*) aumenta risco e retrabalho (p. 215 (251)).
- **Adaptação** (p. 178 (214); X5.3): ciclo de vida; disponibilidade e produtividade dos recursos; complexidade, incerteza, novidade e forma de acompanhamento (valor agregado, % completo, semáforo); tecnologia.
- **Ágil** (p. 177–178 (213–214); 216 (252); 224 (260)): backlog iterativo e cronograma sob demanda (Kanban); plano de grandes entregas de 3 a 6 meses (visão → roteiro → lançamento → iterações → tarefas); burndown; velocidade; iterações de 2 semanas ou 1 mês.

### 7. Custos (cap. 7, p. 231 (267))
Planejar, estimar, orçar, financiar e controlar para terminar dentro do orçamento. Em projetos pequenos, 7.2 e 7.3 podem ser um só processo (p. 231 (267)).
- **7.1** → **A4**. Usa TAP7, A3 e A8.
- **7.2** → **B6, B4**. Usa A5, A13, B15, B26 e B27.
- **7.3** agrega as estimativas e fixa a reserva gerencial. → **A15** e requisitos de recursos financeiros do projeto (sem código; vão para 7.4).
- **7.4** controla os custos com valor agregado e IDPT. → **B7** e informações de desempenho.
- **Regras verificáveis:**
  - a reserva de contingência fica identificada na documentação dos custos (p. 245 (281));
  - a reserva gerencial fica fora da linha de base e dentro do orçamento; usá-la exige mudança aprovada (p. 252 (288));
  - a linha de base é distribuída no tempo (curva S) (p. 254–255 (290–291));
  - aumentar o orçamento só por 4.6 (p. 259 (295));
  - VP, VA e CR seguem a mesma definição de custo (só diretos ou todos) (p. 261 (297));
  - o custo pode ser estimado em horas de pessoal (p. 241 (277));
  - gastos acima do limite de financiamento pedem reprogramação (p. 253 (289));
  - acompanhar o gasto sem olhar o trabalho feito vale pouco (p. 259 (295)).
- **Adaptação** (p. 234 (270); X5.4): repositório financeiro; políticas de estimativa e orçamento; uso de valor agregado; ágil; auditoria.
- **Ágil** (p. 234 (270)): estimativa rápida e de alto nível da mão de obra; detalhe só para horizontes curtos; com orçamento fixo, ajustam-se escopo e cronograma.

### 8. Qualidade (cap. 8, p. 271 (307))
Aplica a política de qualidade da organização ao projeto e às entregas. Os requisitos definidos em 8.1 viram instrumentos de teste em 8.2, aplicados em 8.3 (p. 272 (308)).
- **8.1** → **A5, B20**. Atualiza A8 e A13; o dicionário da EAP recebe os requisitos de qualidade.
- **8.2** → **B21, B33**. É mais amplo que a garantia da qualidade (p. 289 (325)).
- **8.3** → **B19** e entregas verificadas (vão para 5.5).
- **Regras verificáveis:**
  - qualidade não é grau: qualidade abaixo do requisito é sempre problema; grau baixo pode não ser (p. 274 (310));
  - prevenir é melhor que inspecionar (p. 274 (310));
  - o custo da qualidade soma conformidade (prevenção, avaliação) e não conformidade (falhas internas e externas) (Fig. 8-5, p. 283 (319));
  - tolerância vem do requisito; limite de controle é estatístico (p. 274 e 304 (310 e 340));
  - a lista de verificação incorpora os critérios de aceitação da linha de base do escopo (p. 292 (328));
  - a forma como se definem os critérios de aceitação mexe muito no custo (p. 279 (315)).
- **Adaptação** (p. 276 (312); X5.5): políticas e auditoria; padrões e restrições legais ou regulatórias; melhoria contínua; colaboração com fornecedores.
- **Ágil** (p. 276, 290, 300 (312, 326, 336)): revisões frequentes, não concentradas no fim; retrospectivas; lotes pequenos; todos gerenciam e controlam a qualidade.

### 9. Recursos (cap. 9, p. 307 (343))
Cuida dos recursos de equipe (pessoas) e dos físicos (equipamentos, materiais, instalações).
- **9.1** → **A6, B32**. Usa organograma, EAP e RACI como técnicas. A6 pode ser dividido em equipe e recursos físicos (p. 318 (354)).
- **9.2** → **B26, B4, B24**. Anda junto com 7.2.
- **9.3** obtém e designa os recursos. → **B12, B18, B25**. Pré-designação acontece quando a proposta competitiva já nomeava pessoas, quando o projeto depende de um especialista específico ou quando o TAP já designou alguém (p. 333 (369)).
- **9.4** → avaliações de desempenho da equipe (sem código).
- **9.5** acompanha e conduz a equipe. → solicitações de mudança; atualiza A6, A14, A15, B9 e B18.
- **9.6** trata só dos recursos físicos; as pessoas ficam em 9.5 (p. 353 (389)).
- **Regras verificáveis:**
  - cada pacote de trabalho tem um responsável definido (p. 316 (352));
  - na RACI, uma só pessoa responde em última instância (o "A") por tarefa (p. 317 (353));
  - a autoridade de cada um acompanha a sua responsabilidade (p. 318 (354));
  - **B32 não traz nomes.** Os nomes ficam em B18, no diretório, nos organogramas e nos cronogramas (p. 334 (370));
  - B32 é feito pela equipe, ou com a contribuição dela, e revisto periodicamente (p. 320 (356));
  - indisponibilidade de recurso é documentada no cronograma, orçamento e riscos; substituto não pode violar requisito jurídico ou regulatório (p. 330 (366)).
- **Adaptação** (p. 311 (347); X5.6): diversidade; localização; recursos do setor; dedicação integral ou parcial; desenvolvimento da equipe; ciclo de vida.
- **Ágil** (p. 311–312 (347–348)): equipes auto-organizáveis; planejamento de recursos menos previsível; suprimento rápido e métodos enxutos.

### 10. Comunicações (cap. 10, p. 359 (395))
Faz a informação chegar a quem precisa, na hora certa. "Comunicação" é o ato; "comunicações" são os artefatos (X1, p. 647 (683)).
- **10.1** → **A7**. Atualiza A10, B15 e B31.
- **10.2** → **B14**. Os relatórios de desempenho vêm de 4.5; 10.2 produz os ad hoc, apresentações e similares (p. 385 (421)).
- **10.3** confere se a comunicação teve efeito. → informações de desempenho; pode reabrir 10.1 e 10.2.
- **Regras verificáveis:**
  - A7 é revisto a cada fase e quando muda a comunidade de partes interessadas; armazenamento, recuperação e descarte da informação ficam documentados (p. 367 (403));
  - A7 diz quem autoriza a liberação de informação confidencial (p. 377 (413));
  - três métodos: interativo, ativo e passivo (p. 374 (410)).
- **Adaptação** (p. 365 (401); X5.7): partes internas ou externas; localização; tecnologia; idioma; repositório de conhecimento.
- **Ágil** (p. 365 (401)): comunicar mais e mais rápido; equipe no mesmo local quando possível; artefatos publicados com transparência; revisões frequentes.

### 11. Riscos (cap. 11, p. 395 (431))
Trata o risco em dois níveis: o individual (evento ou condição incerta) e o geral (efeito do conjunto das incertezas) (p. 397 (433)).
- **11.1** → **A8**. Usa todos os componentes do plano e B31. Começa na concepção e deve estar pronto no início (p. 402 (438)).
- **11.2** → **B27, B28**.
- **11.3** prioriza, designa o responsável de cada risco e manda os riscos de baixa prioridade para uma lista de observação. Atualiza B27 e B28.
- **11.4** quantifica o risco geral; atualiza B28. Não é obrigatória: serve a projetos grandes, complexos, estratégicos ou quando o contrato exige (p. 429 (465)).
- **11.5** escolhe as respostas. → solicitações de mudança; atualiza A3–A6, A9, A13–A15, B7, B15 e B18 (p. 447–448 (483–484)). É o processo de planejamento que mais altera o plano (p. 591 (627)).
- **11.6** executa as respostas; atualiza B9, B18, B27 e B28.
- **11.7** monitora respostas, riscos novos, premissas e reservas (p. 454 (490)); pode atualizar qualquer componente.
- **Regras verificáveis:**
  - **critérios de uma boa resposta:** adequada à relevância do risco, com custo eficaz, realista, acordada pelas partes, com responsável designado (p. 439 (475));
  - a reserva de contingência traz as condições de uso, e os planos de contingência têm gatilhos (p. 439 e 445 (475 e 481));
  - riscos secundários e residuais ficam registrados (p. 439 e 448 (475 e 484));
  - cada resposta tem orçamento, atividade no cronograma e pessoa (p. 447–448 (483–484));
  - escalar só vale se o nível de cima aceitar (p. 442 (478));
  - as premissas que justificam probabilidade e impacto ficam registradas (p. 423 (459));
  - B28 trata do risco geral, não só da lista (p. 418 (454));
  - problema comum: respostas documentadas e nunca executadas (p. 450 (486)).
- **Estratégias** (p. 442–446 (478–482)):
  - ameaças: escalar, prevenir, transferir, mitigar, aceitar (ativa, com reserva; passiva, só revisão);
  - oportunidades: escalar, explorar, compartilhar, melhorar, aceitar;
  - risco geral: prevenir (no limite, cancelar o projeto), explorar, transferir ou compartilhar, mitigar ou melhorar, aceitar.
- **Adaptação** (p. 400 (436); X5.8, p. 683 (719)): porte, complexidade, importância estratégica e abordagem. As decisões de adaptação ficam registradas em A8. **É a única área em que o livro autoriza um processo simplificado ou reduzido** para projeto pequeno ou simples.
- **Ágil** (p. 400 (436)): os riscos pesam na escolha do conteúdo de cada iteração e são tratados em cada uma; os requisitos são repriorizados conforme a exposição.

### 12. Aquisições (cap. 12, p. 459 (495))
Comprar de fora da equipe. O texto é escrito do lado do comprador. Para o vendedor, que é o caso da FGV, a ET e o contrato viram as entradas principais do projeto (p. 462 (498)).
- **12.1** → **A9**, estratégia da aquisição, documentos de licitação, ET, critérios para seleção de fontes, decisões de fazer ou comprar e estimativas independentes. Nenhum desses, fora A9, está na Tabela 1-2 (p. 592 (628)).
- **12.2** → vendedores selecionados e **acordos**.
- **12.3** → aquisições encerradas. O processo "Encerrar as aquisições" da 5ª edição deixou de existir; a parte administrativa foi para 4.7 (X1, p. 649 (685)).
- **Regras verificáveis:**
  - o GP em geral não assina contratos (p. 460 (496)); a negociação é conduzida por quem assina (p. 488 (524));
  - o que não está no contrato não pode ser exigido (p. 461 (497));
  - é boa prática pôr o método de avaliação nos documentos de aquisição (p. 473 (509)) e pedir o preço separado da proposta técnica (p. 486 (522));
  - pagar por entrega controla melhor do que pagar por hora (p. 494 (530));
  - mudança contratual é feita por escrito e aprovada antes de implementada (p. 496 (532));
  - encerrar exige entregas aceitas, nenhuma reivindicação ou fatura em aberto e pagamentos finais feitos (p. 499 (535)).
- **Tipos de contrato** (p. 471–472 (507–508)): preço fixo (PFG, PFRI, PFAEP), custos reembolsáveis (CMRF, CMRI, CMRC) e tempo e material (T&M).
- **Métodos de seleção** (p. 473–474 (509–510)): menor custo; apenas qualificações; qualidade (proposta técnica); qualidade e custos; fonte única; orçamento fixo.
- **Adaptação** (p. 465 (501); X5.9): uma aquisição ou várias; localização; governança e ambiente regulatório, inclusive auditoria de contratos; oferta de contratados.
- **Ágil** (p. 465 (501)): o vendedor pode ampliar a equipe com risco compartilhado; o acordo mestre (MSA) cobre a relação, e o trabalho adaptativo vai num apêndice.

### 13. Partes interessadas (cap. 13, p. 503 (539))
Identificar, analisar expectativas e engajar.
- **13.1** → **B31**. Ocorre antes ou junto com o TAP e se repete a cada fase. Modelos de mapeamento: poder/interesse, cubo, saliência e direções de influência (p. 512–513 (548–549)).
- **13.2** → **A10**, e só ele. Usa a matriz de engajamento com o nível atual (C) e o desejado (D) de cada parte: desinformado, resistente, neutro, apoiador, líder (p. 521–522 (557–558)).
- **13.3** engaja as partes. → solicitações de mudança; atualiza A7, A10, B5, B9, B10 e B31. As regras básicas vêm do B32 (p. 528 (564)).
- **13.4** acompanha o engajamento. → informações de desempenho; o essencial é fechar a lacuna entre C e D.
- **Regras verificáveis:**
  - a satisfação das partes interessadas é objetivo do projeto (p. 505 (541));
  - a identificação e A10 são revistos a cada fase, quando partes entram ou saem e quando a organização muda (p. 505 e 518 (541 e 554));
  - o que se sabe sobre poder e interesse é premissa e vai para B3 (p. 515 (551));
  - no PMBOK 6, A10 tem um único item de conteúdo: as estratégias de engajamento (p. 522 (558)).
- **Adaptação** (p. 506 (542); X5.10): diversidade das partes; complexidade das relações; tecnologias disponíveis.
- **Ágil** (p. 506 (542)): engajamento direto, sem camadas; criação conjunta; "transparência agressiva".

## 4. De onde vem e para onde vai cada parte do plano

A tabela vem dos quadros de entradas e saídas da Parte 2 (p. 563–635 (599–671)), cujas listas o livro chama de exemplos. "Usado em" junta os processos que listam o item como entrada. O livro não traz uma tabela pronta.
- Recebem o plano inteiro: 11.1, 4.3, 4.4, 4.5 e 4.7.
- Podem atualizar qualquer componente: 4.3, 4.4, 4.5, 4.6 e 11.7.

| Código | Item | Produzido em | Usado em |
|---|---|---|---|
| A1 | Plano de gerenciamento do escopo | P 5.1 | P 5.2, 5.3, 5.4, 6.1, 12.1 · E 12.2 · M 5.5, 5.6 |
| A2 | Plano de gerenciamento dos requisitos | P 5.1 | P 5.2, 8.1, 11.2 · E 12.2 · M 5.5, 5.6, 12.3 |
| A3 | Plano de gerenciamento do cronograma | P 6.1 | P 6.2–6.5, 7.1, 11.2 · M 6.6 |
| A4 | Plano de gerenciamento dos custos | P 7.1 | P 7.2, 7.3, 11.2 · M 7.4 |
| A5 | Plano de gerenciamento da qualidade | P 8.1 | P 5.1, 7.2, 9.1, 11.2, 12.1 · E 8.2 · M 8.3 |
| A6 | Plano de gerenciamento dos recursos | P 9.1 | P 7.3, 9.2, 10.1, 11.2, 11.5, 12.1, 13.2 · E 9.3–9.5, 10.2 · M 9.6, 10.3, 13.4 |
| A7 | Plano de gerenciamento das comunicações | P 10.1 | I 13.1 · P 13.2 · E 10.2, 12.2, 13.3 · M 10.3, 13.4 |
| A8 | Plano de gerenciamento dos riscos | P 11.1 | P 7.1, 8.1, 11.2–11.5, 13.2 · E 11.6, 12.2, 13.3 · M 11.7, 12.3 |
| A9 | Plano de gerenciamento das aquisições | P 12.1 | E 9.3, 12.2 · M 12.3 |
| A10 | Plano de engajamento das partes interessadas | P 13.2 | I 13.1 · P 5.2, 8.1, 10.1 · E 10.2, 13.3 · M 10.3, 13.4 |
| A11 | Plano de gerenciamento de mudanças | P 4.2 (X1.5) | E 13.3 · M 4.6, 5.6, 12.3 |
| A12 | Plano de gerenciamento de configuração | P 4.2 (X1.5) | E 12.2 · M 4.6, 5.6 |
| A13 | Linha de base do escopo | P 5.4 | P 6.2–6.5, 7.2, 7.3, 8.1, 9.1, 9.2, 11.2, 11.4, 12.1 · M 4.6, 5.5, 5.6, 6.6 |
| A14 | Linha de base do cronograma | P 6.5 | P 11.2, 11.4 · M 4.6, 6.6, 12.3 |
| A15 | Linha de base dos custos | P 7.3 | P 11.2, 11.4, 11.5 · E 9.3, 12.2 · M 4.6, 7.4 |
| A16 | Linha de base da medição do desempenho | P 4.2 (X1.5) | M 5.6, 6.6, 7.4 |
| A17 | Descrição do ciclo de vida do projeto | P 4.2 (X1.5) | P 5.1 |
| A18 | Abordagem de desenvolvimento | P 4.2 (X1.5) | P 5.1, 6.1 |
| B1 | Atributos das atividades | P 6.2 | P 6.3–6.5, 9.2 |
| B2 | Lista de atividades | P 6.2 | P 6.3–6.5, 9.2 |
| B3 | Registro de premissas | I 4.1 | P 5.2, 5.3, 6.3–6.5, 8.1, 9.2, 11.2–11.4, 13.2 · M 4.5, 12.3 · F 4.7 (atualizado por 17 processos) |
| B4 | Bases das estimativas | P 6.4, 7.2, 9.2 | P 6.5, 7.3, 11.4 · M 4.5, 4.6 · F 4.7 |
| B5 | Registro das mudanças | nenhum como saída própria; mantido em 4.6 | I 13.1 · P 13.2 · E 4.3, 10.2, 13.3 · F 4.7 |
| B6 | Estimativas de custos | P 7.2 | P 7.3, 9.2, 11.2, 11.4 |
| B7 | Previsões de custos | M 7.4 | P 11.4 · M 4.5 |
| B8 | Estimativas de duração | P 6.4 | P 6.5, 11.2, 11.4 |
| B9 | Registro das questões | E 4.3 | I 13.1 · P 11.2, 13.2 · E 9.5, 10.2, 13.3 · M 4.5, 9.6, 10.3, 11.7, 13.4 · F 4.7 |
| B10 | Registro das lições aprendidas | E 4.4 | quase todos os processos depois da iniciação (P 5.2, 6.4, 6.5, 7.2, 11.2, 11.5 e mais) |
| B11 | Lista de marcos | P 6.2 | P 6.3–6.5, 11.4, 12.1 · E 4.3 · M 4.5, 12.3 · F 4.7 |
| B12 | Designações de recursos físicos | E 9.3 | M 9.6 |
| B13 | Calendários do projeto | P 6.5 | M 6.6 |
| B14 | Comunicações do projeto | E 10.2 | E 4.3 · M 10.3, 13.4 · F 4.7 |
| B15 | Cronograma do projeto | P 6.5 | P 7.2, 7.3, 9.1, 11.5, 13.2 · E 4.3, 9.3, 9.4, 12.2 · M 6.6, 9.6 |
| B16 | Diagrama de rede do cronograma do projeto | P 6.3 | P 6.5 |
| B17 | Especificação do escopo do projeto | P 5.3 | P 5.4 (e integra A13) |
| B18 | Designações da equipe do projeto | E 9.3 | P 6.4, 6.5, 11.5, 12.1 · E 4.4, 9.4, 9.5 |
| B19 | Medições de controle da qualidade | M 8.3 | E 8.2 · F 4.7 |
| B20 | Métricas da qualidade | P 8.1 | E 8.2 · M 8.3 |
| B21 | Relatório de qualidade | E 8.2 | E 10.2 · M 4.5, 5.5, 12.3 · F 4.7 |
| B22 | Documentação dos requisitos | P 5.2 | I 13.1 · P 5.3, 5.4, 8.1, 9.1, 10.1, 11.2, 12.1 · E 12.2 · M 5.5, 5.6, 12.3 · F 4.7 |
| B23 | Matriz de rastreabilidade dos requisitos | P 5.2 | P 8.1, 12.1 · E 4.3 · M 4.6, 5.5, 5.6, 12.3 |
| B24 | Estrutura analítica dos recursos | P 9.2 | P 6.4 · E 4.4 · M 9.6 |
| B25 | Calendários dos recursos | E 9.3 | P 6.4, 6.5, 9.2, 11.5 · E 9.3, 9.4 · M 6.6 |
| B26 | Requisitos de recursos | P 9.2 | P 6.4, 6.5, 7.2, 11.2, 11.4, 12.1 · E 9.3 · M 9.6 |
| B27 | Registro dos riscos | P 11.2 | 13 dos 24 processos de planejamento (5.3, 6.4, 6.5, 7.2, 7.3, 8.1, 9.1, 9.2, 11.3–11.5, 12.1, 13.2) · E 4.3, 11.6, 12.2 · M 4.5, 9.6, 11.7, 12.3, 13.4 · F 4.7 |
| B28 | Relatório de riscos | P 11.2 | P 11.4, 11.5 · E 4.3, 8.2, 10.2, 11.6 · M 4.5, 4.6, 11.7 · F 4.7 |
| B29 | Dados do cronograma | P 6.5 | M 6.6 |
| B30 | Previsões do cronograma | M 6.6 | P 11.4 · M 4.5 |
| B31 | Registro das partes interessadas | I 13.1 | P 5.2, 8.1, 9.1, 10.1, 11.1–11.3, 11.5, 12.1, 13.2 · E 4.4, 9.3, 10.2, 12.2, 13.3 · M 12.3, 13.4 |
| B32 | Termo de nomeação da equipe | P 9.1 | E 9.4, 9.5 |
| B33 | Documentos de teste e avaliação | E 8.2 | M 8.3 |

**Sem código, nos mesmos quadros:** o TAP sai de 4.1 e entra em 13.1, 4.2, 5.2, 5.3, 4.7 e em todos os "Planejar o gerenciamento…"; os acordos vêm de fora (4.1) ou saem de 12.2; os requisitos de recursos financeiros vão de 7.3 para 7.4; o pacote de 12.1 entra em 11.2, 12.2, 12.3 e 4.7. Cadeias: entregas 4.3 → 8.3 (verificadas) → 5.5 (aceitas) → 4.7; desempenho: dados (4.3) → informações (controle) → relatórios (4.5); mudanças: tudo vai para 4.6, e as aprovadas seguem para 4.3, 8.3 e 12.3.

**Só nascem na execução ou no controle** (p. 595 (631) e quadros): B9, B10, B12, B14, B18, B19, B21, B25, B33, B7 e B30, embora o planejamento já use alguns. **B5 nunca é saída específica**, contra a regra do X1.3; tratar 4.6 como origem. [inferência das notas] Num plano feito na proposta, B18 e B25 entram como premissa.

**Ciclos** [síntese das notas a partir dos quadros; o livro não dá ordem de produção]:
- custos ↔ recursos (7.2 usa B26; 9.2 usa B6); cronograma ↔ recursos (6.4 e 6.5 usam B18 e B25; 9.1 usa B15); escopo ↔ qualidade (5.1 usa A5; 8.1 usa A13); riscos ↔ tudo (11.1 usa o plano inteiro; 11.5 altera as linhas de base);
- usados antes de existir: 6.2 atualiza A14 e A15; 13.1 atualiza A2, A8 e B27; 11.4 usa B7 e B30. O livro assume iteração (p. 565 (601));
- a ordem da decisão 0007 segue isso: recursos antes das durações (6.4 usa 9.2) e riscos antes dos custos (a contingência sai de B27).

**Checagens de coerência:** todo artefato tem origem e uso (X1.3, p. 640–641 (676–677)); A13 pressupõe B17 aprovada, EAP e dicionário; A14, A3 e B15; A15, A4, B6 e B4 (em geral B15 e B27); A16 só existe com A13–A15 e valor agregado; sem ele, compara-se custo planejado com real (p. 262 (298)).

## 5. Fórmulas

**Três pontos.** Valores: tO (otimista), tM (mais provável), tP (pessimista).
- Duração, forma do livro: **tE = (tO + tM + tP) / 3**, a distribuição triangular (6.4.2.4, p. 201 (237)). É usada quando faltam dados históricos ou quando os dados vêm de opinião. O cap. 6 não traz a beta.
- Custos (7.2.2.5, p. 244–245 (280–281)): triangular **cE = (cO + cM + cP) / 3** e beta **cE = (cO + 4cM + cP) / 6**.
- Na skill, o PMO informa os três valores e a base, e o código calcula (SKILL.md, princípio 6).
- Paramétrica: quantidade × produtividade (1.000 m a 25 m/h = 40 h, p. 200–201 (236–237)).

**Faixas de exatidão das estimativas** (7.2, p. 241 (277)):
ordem de grandeza **−25% a +75%**; definitiva **−5% a +10%** (o "—" impresso é sinal de menos). A exatidão declarada deve combinar com a fase do documento (proposta, TAP, plano).

**Composição do orçamento** (Fig. 7-8, p. 255 (291)): atividades + contingência → pacotes de trabalho + contingência → contas de controle → soma = **linha de base dos custos (A15)**; A15 + reserva gerencial = **orçamento do projeto**. A15 é "a versão aprovada do orçamento do projeto ao longo do tempo, excluindo quaisquer reservas gerenciais" (7.3.3.1, p. 254 (290)).

**Valor agregado** (7.4, p. 261–267 (297–303); Tabela 7-1, p. 267 (303)). Siglas do livro em português, com o inglês entre parênteses:

| Sigla | Nome no livro | Fórmula | Leitura |
|---|---|---|---|
| VP (PV) | valor planejado | — | orçamento autorizado do trabalho agendado, sem reserva gerencial |
| VA (EV) | valor agregado | soma do VP do trabalho concluído | não passa do VP do componente |
| CR (AC) | custo real | — | custo do trabalho feito até a data dos dados |
| ONT (BAC) | orçamento no término | — | valor total planejado (linha de base dos custos) |
| VC (CV) | variação de custos | VA − CR | > 0 abaixo do custo; < 0 acima |
| VPR (SV) | variação de prazos | VA − VP | > 0 adiantado; < 0 atrasado; vale 0 no fim do projeto |
| VNT (VAC) | variação no término | ONT − ENT | > 0 abaixo do custo; < 0 acima |
| IDC (CPI) | índice de desempenho de custos | VA / CR | < 1,0 custo acima do previsto; o livro o considera o índice mais crítico |
| IDP (SPI) | índice de desempenho de prazos | VA / VP | < 1,0 atrasado; conferir também o caminho crítico |
| ENT (EAC) | estimativa no término | CR + EPT bottom-up (plano inicial não vale mais; a forma mais comum) · ONT / IDC (IDC constante) · CR + (ONT − VA) (ritmo orçado) · CR + [(ONT − VA) / (IDC × IDP)] (prazo e custo pesam) | — |
| EPT (ETC) | estimativa para terminar | ENT − CR · ou reestimativa bottom-up | — |
| IDPT (TCPI) | índice de desempenho para término | (ONT − VA) / (ONT − CR) para cumprir o ONT · (ONT − VA) / (ENT − CR) para cumprir a ENT | > 1,0 mais difícil; < 1,0 mais fácil |

- Prazo agregado (PA) e tempo real (TR): variação de prazos = PA − TR; IDP = PA / TR (p. 233 (269)).
- ENT pelo ritmo orçado só se a premissa de melhora for coerente com a análise de riscos (p. 264–265 (300–301)).

**Erros do livro nas fórmulas:**
- *Correção:* a Tabela 7-1 escreve "IDTP" nas equações; o certo é **IDPT** (p. 267 (303)).
- *Correção:* a definição do IDP está truncada na Tabela 7-1 e no glossário (p. 714 (750)); leia **IDP = VA / VP**. Na Tabela 7-1, a leitura do IDP foi copiada da do IDC e fala em custo; o IDP trata de prazo (> 1,0 adiantado).
- *Correção:* decimais "1.0" (padrão inglês) = 1,0; "EPT = ReestimaR" = reestimar de baixo para cima.
- *Correção:* no glossário, o "caminho de ida" calcularia o "início mais tarde" (p. 701 (737)); o certo é início e término mais cedo.
- *Atenção:* a p. 246 (282) põe a reserva gerencial nas estimativas de custos; o resto do capítulo a fixa em 7.3, fora da linha de base. "LMD" (p. 722 (758)) e "PMB" (p. 714 (750)) são a mesma A16.

**Riscos e cronograma.**
- VME de uma alternativa = soma de probabilidade × resultado dos cenários (Fig. 11-15: 0,6 × 70 + 0,4 × 10 = 46, p. 435 (471)). O rótulo "VME (antes de custos)" é inconsistente: os valores já descontam o investimento.
- Eficácia de custo de uma resposta = mudança no nível de impacto / custo de implementação (p. 446 (482)).
- Caminho crítico: "a sequência de atividades que representa o caminho mais longo de um projeto" (p. 210 (246)); folga total em geral zero.

## 6. Vocabulário e variantes da tradução

Para o mapa do PGP reconhecer as duas formas. Termo oficial (Tabela 4-1) → variantes encontradas no livro.

| Código ou termo | Variantes no livro | Onde |
|---|---|---|
| B17 especificação do escopo do projeto | **declaração do escopo do projeto** (título de 5.3.3.1 e definição de A13) | p. 154–155 (190–191); glossário p. 709 e 715 (745 e 751) |
| B32 termo de nomeação da equipe | *team charter*; regras básicas (*ground rules*) ficam nele | glossário p. 725 e 721 (761 e 757) |
| B18 designações da equipe do projeto | atribuições; alocações | p. 101, 198, 208, 440 (137, 234, 244, 476) |
| A16 linha de base da medição do desempenho | medição do desempenho de linha de base; LMD; PMB | p. 88 (124); p. 254 (290); glossário p. 714 (750) |
| A17 descrição do ciclo de vida do projeto | "Descrito do ciclo de vida" (erro); ciclo de vida do projeto | Tabela 4-1, p. 89 (125); p. 88 (124) |
| A11 plano de gerenciamento de mudanças | plano de gerenciamento das mudanças | 4.6, 5.6 |
| A10 plano de engajamento das partes interessadas | plano de gerenciamento das partes interessadas (nome da 5ª ed.; erro em 10.3.3.3) | p. 393 (429) |
| B4, B6, B8, B13, B21, B25 | singular ou plural: "base das estimativas", "estimativa de custos", "estimativas de duração das atividades", "calendário do projeto/dos recursos", "relatórios de qualidade" | títulos 6.4.3.2 e 9.2.3.2; Tabela 4-1; glossário p. 701 e 709 (737 e 745) |
| B24 estrutura analítica dos recursos | "EAR", sigla que o glossário reserva para a dos **riscos** | glossário p. 696 e 710 (732 e 746) |
| EGP | PMO, escritório de projetos | glossário p. 708 (744) |
| CCM (comitê de controle de mudanças) | CCB | glossário p. 696 e 702 (732 e 738) |
| MCC (método do caminho crítico) | CPM; "COM" (erro) | glossário p. 696 e 716 (732 e 752) |
| plano de gerenciamento de benefícios | plano de realização de benefícios | X4.1, p. 673 (709) |
| reserva gerencial | reserva de gerenciamento | p. 405 (441) |
| reserva de contingência | provisões para contingências; reserva de cronograma; *buffer* remete a reserva | p. 245, 202 (281, 238); glossário p. 701 (737) |
| aquisições encerradas (saída de 12.3) | "Encerrar as aquisições" (nas figuras) | p. 499 (535) |
| 11.6 Implementar Respostas aos Riscos | Implementar Respostas a Riscos | p. 395, 449 (431, 485) |
| tempo e material (T&M) | tempo e materiais; tempo e meios | p. 472 (508) |
| documentos de licitação | documentos de aquisições, usados como sinônimo | p. 485 (521) |
| organograma do projeto | "matriz do projeto" (*Project Organization Chart*) | glossário p. 715 (751) |
| abordagem preditiva | "preventiva" (X5.1); "método de previsão" (glossário) | p. 679 (715); p. 698 (734) |

**Distinções que a tradução confunde:**
- ET (especificação do trabalho das aquisições, em inglês SOW) **não é** a especificação do escopo (B17). TR (termos de referência) não tem verbete no glossário (p. 478 (514)). SDP, SDI e SDC = RFP, RFI e RFQ (glossário p. 724 (760)).
- Questão é condição atual; risco é incerto e futuro (glossário p. 720 e 723 (756 e 759)).
- Na RACI, "responsável" serve tanto para o R (execução) quanto para o A (aprovação). A regra "uma pessoa por tarefa" vale para o A (p. 317 (353)).
- "Proximidade" aparece duas vezes nos parâmetros de risco: prazo até o impacto e importância percebida. Escrever "proximidade (prazo)" e "importância percebida" (p. 424 (460)).
- Inspeção = revisão = revisão por pares = auditoria = homologação (*walkthrough*) (p. 166 e 303 (202 e 339)).
- Erros pontuais: no glossário, os títulos "EAP" e "componente da EAP" estão trocados (definição da EAP na p. 702 (738)); a definição do grupo de planejamento repete a de iniciação (p. 23 (59); use a da p. 565 (601)); as Figs. 12-1 e 12-2 dizem "documentos do projeto" onde deveria ser documentos de negócios (p. 460 e 466 (496 e 502)); os níveis de engajamento oscilam em gênero ("neutra", "lidera") e devem ser normalizados (p. 521 (557)).

**Nomes da 5ª edição** (X1, p. 645–650 (681–686)); num plano, valem nota de atualização, não erro de conteúdo [inferência das notas]: gerenciamento do tempo → cronograma; garantia da qualidade → gerenciar a qualidade; recursos humanos → recursos; mobilizar a equipe → adquirir recursos; controlar comunicações e riscos → monitorar; encerrar as aquisições → extinto; plano de gerenciamento das partes interessadas → plano de engajamento.

**Inglês** (glossário, p. 698–726 (734–762)): TAP = project charter; B17 = project scope statement; EAP = WBS; B3/B5/B9 = assumption/change/issue log; B10 = lessons learned register; B27/B28 = risk register/report; B31 = stakeholder register; antecipação/espera = lead/lag; compressão/paralelismo = crashing/fast tracking; ondas sucessivas = rolling wave; distorção de escopo = scope creep; gráfico de evolução regressiva = burndown; lista de pendências = backlog.
