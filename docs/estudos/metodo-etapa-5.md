# Método da etapa 5 — conferência do plano

Escrito pela responsável pelo projeto, a partir de uma conferência feita à mão de um plano de trabalho real (fora do Git), contra o termo assinado e o edital. Complementa a especificação, as decisões 0013, 0022 e 0033 e o método da etapa 4. Prevalece sobre o que a etapa faz hoje.

## 1. Para que serve

A etapa 5 diz ao gerente, **antes da execução**, o que no plano pode fazer o projeto falhar: o que contradiz o contrato ou o edital, o que falta do que todo plano precisa ter e o que está escrito de um jeito que não dá para cobrar. E diz o que está em ordem, para ele confiar no resto.

**Teste de cada achado:** "se o gerente não corrigir isto, o projeto corre um risco concreto na execução?" Se não corre, não é achado.

**Precisão antes de cobertura:** 12 achados certos valem mais que 84 com ruído. No caso real, o app deu 84 achados (19 graves, 3 deles certos) e deixou passar os mais importantes; a conferência à mão deu 12 (4 graves).

## 2. A régua depende do tipo de plano

| Tipo (o código reconhece, o GP confirma) | Base do "ausente" |
|---|---|
| Plano de trabalho ou proposta para o cliente | O que a lei e o edital pedem (na parceria, art. 22 da Lei 13.019; na licitação, o conteúdo da proposta técnica); metas e requisitos da RFP; premissas críticas; o **núcleo**: escopo com exclusões, aceite, cronograma, equipe com substituição, riscos, mudanças com aditivo, comunicação e escalonamento |
| PGP interno | A adaptação feita na etapa 4 (por tipo de projeto), com o conteúdo mínimo das fichas só das partes que ficaram |

Tudo o que a régua não pede vai para "não se aplica a este tipo de plano", num anexo, fora da contagem.

## 3. Estrutura da saída (nesta ordem)

| # | Seção | O que mostra |
|---|---|---|
| 1 | Resultado em uma página | Total por tipo e gravidade; os graves, um por linha, com a página |
| 2 | Premissas críticas | **Um** achado grave se não há registro de premissas, com uma linha por PC aplicável: em quais dos três lugares está (B3, B27, A11) e em quais falta |
| 3 | Conflitos | Plano × contrato × edital × o próprio plano, com o que diz cada lado e a página |
| 4 | Ausentes e vagos | Do núcleo (ou da adaptação), e os vagos que pesam na obrigação de alguém |
| 5 | O que está em ordem | O que foi conferido e passou, item por item |
| 6 | Não se aplica | Anexo, agrupado |

## 4. Regras

### 4.1 Premissas críticas
- Aplica-se: pelos sinais de aplicação do `checklist.md` **e** por regra calculada (PC5: contratante público com vigência que cruza outubro de ano eleitoral do nível dele).
- Tratada: só se estiver escrita **como premissa** (o que se assume, de quem depende, consequência) e nos três lugares. Assunto citado numa matriz de riscos é "assunto citado, sem premissa escrita", não "tratada".
- Achou trecho que protege a FGV (ex.: "fato alheio não implica glosa")? Mostrar como cobertura parcial, com a página.

### 4.2 Conflitos (código, por comparação)
- Valor do plano × contrato × teto.
- Parcelas ou medições: ordem, percentual, prazo. **Frase de conformidade** ("em conformidade com o item X") que não confere com o item X é conflito grave.
- Duração: soma de trimestres, meses ou fases × vigência.
- Equipe: quantidade e **regra** (mínimo, referência, limite).
- Dimensionamento × produtividade: volume previsto no quadro ÷ equipe ÷ dias úteis contra o teto que o próprio plano escreve. Passar do teto é achado grave (a meta não fecha).
- Metas e indicadores do plano × do edital.
- Exclusões que não têm relação com o objeto (outro tipo de projeto: obra, arquitetura, seguros num projeto social) são **texto de outro documento**. Comparar o vocabulário da lista com o do objeto; na dúvida, Sugestão da leitura do PMO.
- Orçamento que parece não cobrir uma obrigação do edital (equipamento exigido para toda a equipe × valor da linha): só pela leitura do PMO, como Sugestão.

### 4.3 Ausentes e incompletos
- Só do núcleo ou da adaptação.
- **Incompleto** é ausente de um item do conteúdo mínimo dentro de uma parte presente (ex.: regra de mudança sem aditivo nem apostila). Mostrar a parte presente com a página e o item que falta.
- Antes de dizer que falta, procurar no plano inteiro, com sinônimos **só** dos itens fixos (decisão do PR #43).
- Parte dispensada pelo GP na etapa 4 não é procurada. A dispensa que só o plano declara (lista "Partes dispensadas pelo GP", sem a etapa 4 no dossiê) é candidata: o PMO diz se cabe pelas condições da ficha; se não couber, a parte volta a ser conferida (decisão 0052).
- O ausente que o PMO aponta é procurado pelo código só na parte apontada (ou nas que absorvem a parte dispensada), sem os trechos que o próprio achado cita como evidência, e só com os termos que o PMO mandou (decisão 0052).

### 4.4 Vagos
- Só quando o trecho fala de obrigação, prazo ou entrega de alguém (decisão 0031), e principalmente quando deixa a aprovação do contratante sem prazo.
- Não marcar: texto padrão de LGPD e confidencialidade; "oportunamente" com referência a item do edital; descrição de atividade; "deste edital" num plano que responde ao edital.

### 4.5 O que está em ordem
Listar o que foi conferido e passou: itens da lei e do edital presentes, metas iguais, valor e vigência iguais ao contrato, equipe igual, partes presentes. É o que dá confiança no resto.

## 5. Gravidade
Pela regra fixa (decisões 0008 e 0009), pela parte do plano. Ajustes deste método:
- falta de registro de premissas com PC aplicável: **um** achado grave, não um por PC;
- frase de conformidade falsa sobre valor ou parcelas: grave;
- parte que não se aplica ao tipo de plano: nunca vira achado.

## 6. Código × PMO
**Achado do código é candidato até o veredito do PMO** (decisão 0052). O PMO dá um veredito para cada achado do código (ausente, vago e conflituoso): sustenta, falso (com o trecho do plano), não se aplica (com o motivo) ou regra errada (com a causa). Só os confirmados como "sustenta" contam no total; os outros aparecem à parte, com o veredito. O código confere o veredito: o trecho do "falso" é procurado na página, e veredito incompleto ou ausente deixa o achado como "candidato sem veredito", fora do total.
- **Código:** tipo de plano (com confirmação), comparações numéricas e de datas, frase de conformidade, presença das partes e itens do núcleo, PC5 pela eleição, o que está em ordem.
- **PMO (leitura opcional, F5b):** premissa escrita como premissa ou só citada, exclusões de outro tipo de projeto, orçamento × obrigação, vagos em texto corrido.

## 7. Critério de aceite
- Num plano de trabalho real, pelo menos metade dos graves se sustenta (critério da responsável), e num plano correto quase nada aparece.
- Nenhum achado de parte que não se aplica ao tipo de plano.
- A seção "O que está em ordem" aparece sempre.
- Num plano de tamanho típico, 10 a 25 achados.
