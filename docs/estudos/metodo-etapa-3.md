# Método da etapa 3 — Termo de Abertura do Projeto (TAP)

Escrito pela responsável pelo projeto, a partir de um TAP feito à mão para um caso real de parceria (fora do Git), com o edital, a proposta da FGV e o termo assinado. Complementa a seção da etapa 3 da especificação e os métodos das etapas 1 e 2. Prevalece sobre o que a etapa faz hoje.

## 1. Para que serve

O TAP autoriza o projeto na FGV e faz todos entenderem do mesmo jeito **o que foi vendido e assinado**: o que entregar, como se mede o sucesso, até quando, por quanto e quem decide. Ele parte do que foi **assinado**, não do que o edital pedia nem do que a etapa 2 sugeriu.

**Teste de cada item:** "isto está assinado, ou é algo que o GP precisa decidir ou validar antes de começar?" O resto não entra. O TAP cabe em duas páginas, mais o registro de premissas.

## 2. Entradas e precedência

| Documento | Papel |
|---|---|
| Contrato ou termo assinado | Prevalece. Se ele torna a proposta ou o plano de trabalho "parte integrante", a proposta também vale como compromisso |
| Proposta final da FGV | O que a FGV prometeu: produtos, equipe, cronograma, preço e parcelas, premissas escritas |
| RFP | O que o contratante exigiu; serve para achar divergências |
| Dossiê das etapas 1 e 2 | Pontos de atenção, premissas críticas e número R de cada requisito |

A especificação prevê só a RFP e a proposta. **Inclua o contrato ou termo assinado como entrada opcional, com prioridade sobre os dois.**

## 3. Estrutura da saída (nesta ordem)

| # | Seção | Pergunta que responde |
|---|---|---|
| 1 | Divergências para o GP decidir | Onde RFP, proposta e contrato não dizem a mesma coisa, e qual versão a ferramenta sugere |
| 2 | Os 12 elementos | Uma tabela: elemento, conteúdo e origem (Do documento com página, Sugestão ou Decisão do GP) |
| 3 | Registro de premissas inicial | As premissas que a proposta já assume e as premissas críticas que faltam, com quem valida |
| 4 | Conferência e decisões do GP | O que o código conferiu, o que falhou e o que o GP decide |

As divergências vêm **primeiro**, porque o resto do TAP depende de qual versão vale.

## 4. Regras de cada seção

### 4.1 Divergências
Comparar, nesta ordem:
- **por código:** valor (proposta × teto × contrato); parcelas ou medições (ordem, percentual, prazo); vigência × cronograma da proposta (meses, trimestres, fases: a soma cabe na vigência?); contagem dos meses (o mês 1 da proposta é o mês 1 da vigência?); equipe (quantidade e regra: mínimo, referência ou limite); produtos (a RFP pede? a proposta acrescenta?);
- **por texto (Sugestão):** frase da proposta que diz "em conformidade com o item X" e não está; cláusulas de proteção da proposta × cláusulas do contrato; quem aprova e em que prazo; critério de conclusão da proposta × término do contrato; orçamento que parece não cobrir uma obrigação (ex.: equipamento exigido para toda a equipe × valor da linha de despesa).

Cada divergência tem uma linha: ponto, o que diz cada documento (com página), sugestão de versão e o que fazer (confirmar por escrito, levar à reunião de abertura, consultar o jurídico).

**Produto que a proposta acrescenta e a RFP não pedia é compromisso assinado:** entra como entrega-chave e precisa de critério de aceite.

### 4.2 Os 12 elementos
- Finalidade, requisitos, recursos, marcos, partes interessadas e término vêm **dos documentos**, com página.
- Objetivos: cada um com critério de sucesso mensurável. Use as metas e indicadores do contrato quando existirem; senão, sugira a métrica e marque como Sugestão.
- Limites: as exclusões da proposta, as vedações da RFP e o que é do contratante.
- Risco geral: um parágrafo, a partir dos pontos de atenção da etapa 1 e das divergências.
- Marcos: do cronograma da proposta, **dentro** da vigência; se não couber, é divergência.
- Requisitos de aprovação: quem avalia (gestor, comissão de monitoramento, fiscal), quem dá o aceite, quem autoriza o encerramento, ligados às cláusulas do contrato.
- Término e cancelamento: vigência, prorrogação (pedida e de ofício), prestação de contas final, devolução de saldo e de dados, denúncia e rescisão.
- GP, autoridade e patrocinador: **Decisão do GP**. A ferramenta só sugere a redação da autoridade (o que o GP decide sozinho e o que sobe ao patrocinador).

### 4.3 Registro de premissas
- Primeiro, as premissas que a **proposta já escreveu** (dimensionamento, ritmo, produtividade), Do documento.
- Depois, cada premissa crítica (PC1–PC8) que se aplica e a proposta **não escreveu**, como Sugestão.
- Restrições do contrato (vigência, valor, sistemas obrigatórios, vedações, dados).
- Coluna de quem valida (Decisão do GP), com sugestão: o contratante valida as que dependem dele.
- Esse registro é a entrada do registro de premissas (B3) da etapa 4.

### 4.4 Conferência (código)
- 12 elementos preenchidos ou "a definir pelo GP";
- valor e parcelas iguais ao contrato, somando 100%;
- marcos dentro da vigência;
- toda entrega-chave com critério de aceite;
- toda premissa crítica aplicável no registro;
- toda divergência com versão escolhida.
O que falha aparece com o motivo (ex.: "11 trimestres somam 33 meses numa vigência de 32").

## 5. O que não entra
- Texto de contexto, justificativa longa ou histórico do contratante.
- A metodologia inteira: ela fica na proposta e no plano.
- Nomes de pessoas preenchidos pela ferramenta (GP, patrocinador, gestor do contratante).
- Itens da RFP que o contrato mudou.

## 6. Código × PMO
- **Código:** as divergências numéricas e de data, os campos Do documento, a conferência.
- **PMO:** as divergências de texto, os objetivos e critérios de sucesso, os limites, o risco geral, as premissas críticas que faltam e a redação da autoridade.

## 7. Critério de aceite
- O gerente lê as divergências e sabe o que decidir antes de começar.
- Todo número do TAP bate com o contrato.
- Toda entrega-chave tem aceite; todo marco cabe na vigência.
- Toda premissa crítica aplicável está no registro, com quem valida.
- Nenhum nome ou número inventado.
