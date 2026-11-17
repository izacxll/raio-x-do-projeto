# Regras da etapa 2 — rastro de cada saída

| Saída | Evidência | Regra | Quem | Skill |
|---|---|---|---|---|
| Onde estão os pontos | Tabela de critérios da etapa 1 | Separar pontos de **texto** (o avaliador lê) de pontos de **documento** (atestado, tempo de experiência, auditoria); os de documento viram pergunta "a FGV tem?" | Código separa por palavras do critério ("comprovação", "atestado", "anos"); PMO revisa | PROP-ESTRATEGIA .2, .3 |
| Desempate | "o desempate será feito com base na maior pontuação no critério 1, depois 7, depois 3" | Regex da cláusula de desempate | Código | PROP-ESTRATEGIA .1 |
| 2 a 3 abordagens | Regra de equipe mínima × produtividade superior com demonstração; peso do desconto | Abordagens que **mudam o resultado** (equipe, desconto, subcontratar), não só a redação; cada uma com prós, contras e risco principal | PMO; GP escolhe | PROP-ESTRATEGIA .4 a .7 |
| Estrutura da proposta | Anexo "modelo de plano de trabalho" + conteúdo mínimo da proposta ("as propostas deverão conter, no mínimo") | Modelo obrigatório seguido na ordem; cada critério ligado a uma seção | Código monta o esqueleto; PMO escreve | PROP-ESTRUTURA .1, .3, .4 |
| O que a contratada faz | Obrigações da etapa 1 agrupadas | Herdar da etapa 1 | Código | PROP-SOW .1 |
| Exclusões | Vedações do edital + o que é do contratante + volume e vigência | Vedações viram exclusões; o "trabalho vizinho" que o contratante pode supor incluído também | PMO | PROP-SOW .5; B17.6 |
| Obrigações do contratante com prazo | Pontos de atenção PC1, PC2, PC3, PC6 | Cada dependência vira obrigação com prazo "a definir pelo GP" | Código lista; PMO redige | PROP-SOW .8, .9 |
| Premissas críticas escritas | Pontos que se aplicam a PC1 a PC8 | O que se assume, de quem depende, até quando, consequência, reajuste; usar as proteções do próprio edital com a página | PMO | PROP-SOW .11; `checklist.md` |
| Destino de cada ponto da etapa 1 | Os pontos de atenção | Ambiguidade → pergunta; obrigação do contratante → premissa com prazo; incerteza aceita → folga ou reserva; restrição → SOW | PMO (código pré-classifica pelo tipo do ponto) | PROP-ESTRATEGIA .8, .9, .10 |
| Metas | Tabela de metas do edital | Copiar, sem acrescentar metas | Código | PROP-ENTENDIMENTO .5, .6 |
| Equipe no pico | Proporções e quantitativo do edital | Calcular pelas proporções | Código | PROP-EQUIPE .1 |
| Premissa de produtividade | Visitas por família e duração da visita na norma citada | Produtividade explícita (visitas/dia, tempo) como Decisão do GP; conta equipe × volume no código | Código + GP | PROP-EQUIPE .4 |
| Campo e mobilização | Muitos municípios, segurança, conectividade; adesão voluntária | Campo nas durações e no preço; quem mobiliza | PMO | PROP-METODOLOGIA .7, .8; PROP-EAP .10 |
| RACI com o contratante | Atividades da metodologia e quem valida | Um só "A" por linha; o contratante como A nas validações | PMO | PROP-EQUIPE .7 |
| Estrutura do preço | Tipo de contrato (etapa 1) | Consultoria por produto: horas × valor-hora. Parceria com equipe: folha mensal × meses + despesas por natureza; custos indiretos com memória de cálculo, taxa de administração conferida no edital e na norma local (decisão 0040). Por item: planilha do edital | Código pelo tipo | PROP-PRECO .1, .3, .7 |
| Pontos por desconto | Regra de economicidade | Tabela desconto → valor → pontos | Código | PROP-PRECO .9 |
| Caixa | Parcelas (percentual, prazo, condição) × curva de custo | Acumulado de repasse − acumulado de custo, por parcela; ponto de menor folga | Código (precisa da curva do GP) | PROP-PRECO .8 |
| Despesas de campo | Municípios, tablets, internet, capacitação, rotatividade | Lista de despesas a não esquecer, por território | PMO | PROP-PRECO .3, .4 |
| Reserva | Destinos "reserva" dos pontos de atenção | Uma linha por origem; forma e valor: GP | PMO + GP | PROP-PRECO .6 |
| Minuta redigida | Modelo do edital; conteúdo mínimo | Cada seção sai escrita (entendimento, metodologia por fase, SOW, EAP, equipe, metas, riscos, preço), não descrita; o resumo é só a capa | PMO escreve; código monta o esqueleto e confere | PROP-ENTENDIMENTO, PROP-METODOLOGIA, PROP-SOW, PROP-EAP, PROP-EQUIPE, PROP-PRECO |
| Quadro × produtividade | Quadro de equipe e de visitas; teto de visitas por dia | Visitas ÷ pessoas ÷ dias úteis ≤ teto; senão, alerta | Código | PROP-EQUIPE .4 |
| Cronograma × vigência | Trimestres ou fases do cronograma | Soma ≤ vigência | Código | PROP-EAP |
| Matriz e checklist | Conteúdo mínimo, critérios, anexos, declarações | Cada exigência ligada a uma seção; validade "não informada" quando o edital não diz | Código | PROP-MATRIZ .1 a .10 |

> [!NOTE] Inferido — validar com a responsável pelo projeto
> A estrutura de preço para parceria (folha mensal em vez de horas × valor-hora) é adaptação desta análise. A ficha `prop-preco` (PROP-PRECO.1) fala em horas × valor-hora. Sugere-se acrescentar à ficha o caso de operação contínua.

## Regras novas (decisões 0042 a 0047)

Evidência dos testes externos de 16/11/2026 (leituras gravadas externas, fora do Git): o edital da SMPED e um TR municipal de contratação direta (estudo de impacto de evento). Exemplos disfarçados.

| Saída | Evidência | Regra | Quem | Skill |
|---|---|---|---|---|
| Estratégia na contratação direta | Não há critério de julgamento | Sustentar o art. 72: especialização no objeto, justificativa de preço, documentos | PMO | `prop-estrategia` .1, .11 |
| Exclusão × requisito | Exclusão "auditoria dos recursos" × requisito do TR de levantar a origem dos recursos | Exclusão nunca tira requisito; diz o que continua dentro | PMO | PROP-SOW.12 |
| Compromissos C | Protocolo de campo e dados pessoais na proposta, ausentes no plano | Numerar premissas, exclusões, obrigações do contratante e método | Código numera; PMO escreve | PROP-SOW.13; decisão 0047 |
| Premissa × predecessora | Premissa que tira os gastos de um evento da pesquisa do outro; cronograma com o produto em paralelo ao campo | A predecessora muda com a premissa | PMO | PROP-EAP.12 |
| Régua metodológica | Estudo lido numa CPI | Método aprovado como critério; resultado aceito só muda por erro registrado | PMO | PROP-METODOLOGIA.11 |
