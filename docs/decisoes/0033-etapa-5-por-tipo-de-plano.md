# 0033 — Etapa 5 por tipo de plano, premissas críticas nos três lugares e conflitos com o edital

- **Data:** 16/11/2026
- **Status:** aceita em 16/11/2026, com os ajustes abaixo (muda a base da etapa 5, decisões 0013, 0021 e 0022)
- **Quem decidiu:** responsável pelo projeto, sobre a proposta do Claude Code a partir do teste dela

## Contexto

A responsável testou a etapa 5 com um caso real, que não entra no repositório (fase P). O caso: um plano de trabalho de parceria (Lei 13.019/2014) de 64 páginas, com o termo e o chamamento.

Ela conferiu os 84 achados com a skill PMO:

| Resultado | Achados |
|---|---|
| Se sustentam | 12 (3 dos 19 graves) |
| Falsos | 29 |
| Não se aplicam | 36 |
| De regra errada | 7 |

**Correção da responsável (16/11/2026, decisão 0034):** eram 12, não 13. O achado "exclusões ausentes" não se sustenta, porque o plano tinha lista de exclusões. O problema real era outro: a lista era de outro tipo de projeto (texto de outro documento), que o método da etapa 5 trata como conflito.

Faltaram os problemas mais importantes: premissas críticas sem registro, o cronograma de desembolso invertido e a eleição dentro da vigência.

A causa principal é uma só: a etapa 5 mede **todo** documento contra os 51 componentes do PGP. Um plano de trabalho para o cliente não é um PGP interno.

Há também uma falha de regra. Hoje basta um sinal da premissa crítica em qualquer lugar do plano para ela contar como tratada. A checagem por lugar (B3, B27, A11) é pulada quando a parte não existe no plano (`src/regras/conferencia.ts`, "o achado é o da parte").

**Critério de aceite da responsável:** num plano de trabalho real, pelo menos metade dos graves se sustenta.

## Proposta

### 1. Dois tipos de plano, reconhecidos pelo código e confirmados pelo GP

- **PGP interno:** como hoje, com os 51 componentes e documentos e a adaptação.
- **Plano de trabalho ou proposta para o cliente:** sinais no título e na estrutura:
  - "plano de trabalho";
  - quadro de metas e indicadores;
  - cronograma de desembolso;
  - Lei 13.019, termo de fomento ou de colaboração;
  - "proposta técnica".

  O GP confirma na tela do mapa. Para este tipo, a base do "ausente" passa a ser:
  1. **O que a lei ou o edital pedem.** Na parceria, o art. 22 da Lei 13.019 como está no `licitacoes.md`: diagnóstico e nexo com as metas; metas e atividades; receitas e despesas; forma de execução; parâmetros de aferição das metas. Na licitação, o que o edital ou o TR pedem para a proposta técnica (o modelo obrigatório, quando houver).
  2. **Os requisitos, as metas e os indicadores da RFP** (os números R da etapa 1; ver o item 6).
  3. **As premissas críticas que o GP confirmou** (item 2).
  4. **Um núcleo do PMBOK** que todo plano precisa ter, cada item como ficha curta de conteúdo mínimo:
     - escopo com exclusões;
     - produtos ou metas com critério de aceite;
     - cronograma;
     - equipe com regra de substituição;
     - riscos;
     - mudanças (aditivo ou apostila, art. 57 da Lei 13.019);
     - comunicação e relatórios.
- **O resto** (os 51 menos o núcleo) sai como **"não se aplica a este tipo de plano"**: agrupado, fora da contagem e num anexo do relatório.

### 2. Premissas críticas só contam nos três lugares

- A PC que se aplica só conta como tratada se estiver:
  - escrita **como premissa**, com vocabulário de premissa perto do sinal ("premissa", "pressupõe", "assume-se", "condicionado a", "depende de", "caso não");
  - **em B3.9** (registro de premissas), **B27.13** (risco com resposta e gatilho) e **A11.12** (reajuste de escopo, prazo e metas);
  - com o A8.12 dizendo como as premissas críticas são tratadas.
- Num plano de trabalho, os três lugares viram as seções equivalentes que o mapa achar (premissas, matriz de riscos, alterações). Se não houver seção de premissas, a PC é **ausente no registro de premissas**, nunca "tratada".
- O relatório mostra, por PC, uma linha com os três lugares (está / falta) e a página.
- O sinal fora dos três lugares, mas no tema certo, vira um achado só: "assunto citado, sem premissa escrita".

  Exemplo inventado: "o registro das visitas será feito exclusivamente no sistema do contratante", com as metas medidas nesse sistema, e a matriz falando de "erro de registro pela equipe". É PC2 ausente, com o trecho como evidência.

### 3. PC5 pré-marcada por código

Se o contratante é público e a vigência (do plano, do termo ou do edital) cruza outubro de ano eleitoral do nível dele, a PC5 vem **pré-marcada** com a conta à vista:

- municipal: 2028, 2032…;
- estadual e federal: 2026, 2030…

O GP pode desmarcar. É a regra CE17 da etapa 1 trazida para a etapa 5; o nível vem da abertura do documento, como lá.

### 4. Conflitos novos (código)

| Comparação | Como |
|---|---|
| Cronograma de desembolso do plano × do edital ou termo | Parcela por parcela: ordem, percentual e prazo. Achado conflituoso grave se diverge, mesmo com "em conformidade com o item X" |
| Vigência do edital ou termo × cronograma do plano | Meses ou trimestres do cronograma contra a vigência |
| Valor total | Plano × edital ou termo (teto) |
| Metas e indicadores do edital × quadro de metas do plano | Cada meta ou indicador da etapa 1 (item 6) procurado no quadro; diverge ou falta |

### 5. Falsos positivos a corrigir

- **Mapa:** proposta "título localizado" ou "conteúdo sem título próprio" nunca começa como "não está no plano". A causa está a confirmar no código, com teste.
- **Aquisições:** contratação de pessoal (CLT, seleção de agentes) não é plano de aquisições (ficha A9; ver os ajustes).
- **Sinais equivalentes:**
  - "relatórios trimestrais" conta como lista de relatórios;
  - "equipe responsável" conta como lista da equipe;
  - "quadro de metas e indicadores" conta como métricas;
  - "composição do custo" conta como estimativa de custos.

  As fichas ganham esses sinônimos.
- **Convenções do próprio app** ("a definir pelo GP", "R01", "ID", "duração 0", "código EAP") não são procuradas em plano de outra pessoa.
- Item marcado "a comparação é do código" é feito só por comparação, nunca por busca de palavra.
- **Vagos:** não marcar:
  - texto padrão (cláusulas de LGPD e de confidencialidade);
  - "oportunamente" com referência a item do edital;
  - descrição de atividade ("acesso a microcrédito, quando necessário");
  - "deste edital" num plano que responde ao edital (não é texto de outro documento).

  Vale a mesma regra geral da decisão 0031: o vago pesa na obrigação, no prazo ou na entrega de quem executa.

### 6. Metas como requisitos (etapa 1)

Em chamamento sem "produtos", o código extrai metas, indicadores e atividades obrigatórias como requisitos numerados, com o tipo novo "meta". É o que alimenta o item 4.

### 7. Características

Na parceria, o pagamento é por **parcelas de repasse**, um valor novo da característica "pagamento", não "por produto". As fichas que dispensam por pagamento passam a reconhecê-lo.

### 8. Relatório em ordem de importância

1. Premissas críticas.
2. Conflitos.
3. Ausentes do núcleo.
4. Vagos.

Os "não se aplica a este tipo de plano" vão num anexo. A gravidade continua por regra fixa (decisão 0008), agora pela parte do núcleo.

### Testes

- Só exemplos inventados: um plano de trabalho de parceria escrito pelo PMO para o edital público da SMPED, com erros plantados:
  - parcelas invertidas;
  - PC2 só na matriz de riscos;
  - vigência que cruza outubro de 2028;
  - metas que não batem;
  - convenções do app;
  - contratação de pessoal.
- Nada do caso real entra no repositório.
- O critério de aceite vira teste no plano inventado: pelo menos metade dos graves vem de erro plantado.
- O caso real fica para a responsável conferir na fase P.

## Consequências

- Muda a base do "ausente" da decisão 0013 para planos de trabalho; o PGP interno segue como está.
- A skill ganha fichas curtas do núcleo, o art. 22 como lista conferível e os sinônimos novos. Isso exige revisão da responsável (skill 0.3.0).
- Ordem sugerida, em fases curtas:
  1. 5 e 8 (falsos positivos e ordem do relatório; correções sem mudança de base);
  2. 2 e 3 (premissas);
  3. 1 e 7 (tipo de plano);
  4. 6 e 4 (metas e conflitos).

  Cada fase com o teste do plano inventado antes e depois.

## Ajustes da responsável (16/11/2026)

- **Aquisições é a ficha A9**, não a A12 (a A12 é configuração). Contratação de pessoal (CLT, seleção de agentes) não marca o plano de aquisições como presente.
- **Plano sem registro de premissas:** gera **um** achado grave ("o plano não tem registro de premissas"), com uma linha por PC e os três lugares. Só pré-marca PC com evidência no documento (a PC5 pela conta da eleição).
- **Núcleo de mudanças da parceria:** art. 57 (aditivo ou apostila) e art. 55 (prorrogação de ofício quando a administração atrasa o repasse).
- **Teste de precisão, não só de recall:** além do plano com erros plantados, um plano de trabalho correto tem de sair quase limpo. Os falsos positivos são medidos nos dois.
- **Antes da apresentação de 16/11:** a primeira fase (itens 5 e 8) e uma versão simples do tipo de plano. A versão simples é um seletor no mapa ("PGP completo" ou "plano de trabalho/proposta"). No plano de trabalho, as partes só do PGP interno vêm dispensadas com "não se aplica a plano de trabalho", e o GP pode reverter. São elas:
  - configuração (A12);
  - linhas de base (A13 a A16);
  - calendários (B13, B25);
  - previsões (B7, B30);
  - lições aprendidas (B10);
  - dados do cronograma (B29);
  - termo de nomeação (B32);
  - documentos de teste (B33).
- **Ordem das fases depois da apresentação:**
  1. 2 e 3 (premissas);
  2. 1 e 7 (tipo de plano completo, com o art. 22, o núcleo e o anexo);
  3. 6 e 4 (metas e conflitos).
