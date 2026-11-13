# 0025 — Proposta com o PMO (F2), primeira versão, construída sem a chave

- **Data:** 13/11/2026
- **Status:** aceita (o teste com a chave e a comparação de modelos ficam pendentes)
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (detalha a seção 5, etapa 2, e as seções 6 e 8 da especificação, e as decisões 0002 e 0003)

## Contexto

A F2 implementa a etapa 2 (proposta), a tela da chave e a comparação de modelos. A responsável pelo projeto ainda não tem a chave da API e pediu para fazer primeiro tudo o que não depende dela. A F1 ainda espera o teste dela; por isso a F2 nasce da branch da F1 (`fase/f2-proposta` a partir de `fase/f1-leitura-rfp`), e o PR da F2 aponta para a branch da F1 até ela entrar na `main`.

## Decisão

### Como o PMO é chamado
- **Três passos do PMO**, com a decisão do GP no meio: (1) estratégia: como o contratante avalia, 2 ou 3 abordagens, destino das brechas da etapa 1, premissas críticas que parecem se aplicar; o GP escolhe a abordagem e confirma as premissas críticas; (2) conteúdo técnico da abordagem escolhida: estrutura (o modelo do edital, se houver), entendimento, metodologia, SOW com produtos, critérios de aceite e prazo de cada produto, exclusões, premissas com a consequência, restrições e obrigações do contratante; (3) EAP, estimativas em três pontos, perfis, horas por atividade, RACI, despesas, reservas e estratégias de preço, sem valores.
- **O que vai à API:** o `SKILL.md` e as referências da etapa 2 (seção 5 do `SKILL.md`: `licitacoes.md`, `checklist.md`, `experiencia.md`, a seção 4 do `rework.md` e as fichas `prop-*`, `a13`, `b08`, `b04`, `b18`; ~47 mil tokens) como instrução de sistema; o **texto extraído** da RFP e dos anexos, página a página ("=== Página N ==="), e não o PDF: assim cada citação do PMO pode ser procurada pelo código na página. Página sem texto legível vai marcada para não ser citada. Depois, o pedido do passo, com o ponto de partida da etapa 1.
- **Cache:** a skill e os documentos levam `cache_control` (5 minutos). O segundo e o terceiro passos, se pedidos em seguida, leem os dois do cache.
- **Documento grande:** acima de ~400 mil tokens estimados, o app não envia e pede para tirar anexos que não tratam do objeto.
- **Chamada:** SDK oficial `@anthropic-ai/sdk` 1.6.0 (fixado; publicado em 05/11/2026), direto do navegador (`dangerouslyAllowBrowser`), num módulo só (`src/pmo/cliente.ts`). Streaming, saída estruturada (`output_config.format`, JSON Schema gerado dos schemas Zod) e validação da resposta com o mesmo schema. Esforço explícito por passo (`high`; teste da chave `low`), sem `temperature` nem `tool_choice` forçado (dão erro nesses modelos). Novas tentativas do próprio SDK (429, 5xx, rede). Recusa por segurança: o pedido vai com o modelo de reserva da própria API (`fallbacks: "default"`); se a organização não tiver o recurso, o app tenta uma vez sem ele. O custo usa o modelo que de fato respondeu.
- **Erros em português**, cada um com o que fazer: chave recusada, créditos esgotados (falar com o administrador), permissão, limite de uso, sobrecarga, sem conexão, pedido grande demais, resposta cortada, recusa e formato inválido. A chave nunca aparece numa mensagem.

### Chave (decisão 0003)
- Tela "Conectar ao Claude" na etapa 2: explica que o login do claude.ai não é a chave e como pedir uma; campo de senha; "Testar" (chamada mínima); "só nesta sessão" marcada; "lembrar neste navegador" desativada, com o motivo; "Esquecer a chave" sempre visível.
- A chave fica no `sessionStorage` da aba, fora do estado do app. O teste de fumaça confere que ela não vai para o `localStorage`, o dossiê nem os arquivos exportados.

### O que o código confere no que o PMO devolve
- **Citação:** todo trecho é procurado na página indicada (literal, aproximado por sequências de 8 caracteres numa mesma janela, e por partes com "[...]"), copiando a conferência do Raio-X (`conferir`, `conferirPartes`, `cobertura`). Achado noutra página, vale a página achada. Item "do documento" sem citação achada sai como **"citação não conferida"** e nunca como fato; página ilegível deixa "não verificável".
- **Redação:** sugestão sem marca condicional ou com frase afirmativa ("deve-se", "é obrigatório"…) ganha o aviso "redação a conferir".
- **Números sem fonte:** valor em reais, percentual e quantidade com unidade (dias, meses, horas, oficinas…) que não estão nos documentos ganham o aviso "número sem fonte — conferir".

### Contas do código
- **Cronograma:** duração esperada PERT ((o + 4m + p) ÷ 6, arredondada para cima, em dias úteis), rede com ida e volta, folga e caminho crítico. O tempo de aprovação de cada produto é **decisão do GP** (sem ele, o cronograma sai sem a aprovação, avisado). Datas a partir do início que o GP informa; dias úteis descontam só sábados e domingos (conferir feriados).
- **Prazo total:** contra a vigência ou o prazo de execução da etapa 1 (meses × 30 e anos × 365, conversão avisada); sem a data de início, a conta em dias corridos é aproximada (5 dias úteis por semana) e diz isso.
- **Prazo de cada produto:** o PMO traz o prazo do produto com a fonte; o código só o usa se a citação for achada e o número estiver no trecho. O prazo é de **entrega**: a aprovação do cliente vem depois e não conta. Contagem não informada é tratada como dias corridos (a leitura mais apertada), com aviso.
- **Preço:** horas (PERT) × valor-hora de cada perfil + despesas + custos indiretos (%) + reserva, com tributos **por dentro** (preço = subtotal ÷ (1 − tributos)). Valor-hora, despesas, percentuais, reserva, preço final e nomes são decisão do GP; sem eles, os valores ficam "a definir pelo GP". Conferência com o valor estimado do edital: acima dele, aviso para conferir o edital; abaixo de 75%, aviso da presunção de inexequibilidade em obras e serviços de engenharia (Lei 14.133, art. 59, § 4º) e de que nos demais vale o critério do edital.
- **Conferência final:** matriz de atendimento (cada requisito R e cada quesito de pontuação ligado à seção, produto, atividade, perfil ou parte do SOW que o atende; o que o código não liga fica "não localizado na minuta — conferir"), limite de páginas (estimativa de 3 mil caracteres por página), checklist de envio (entrega, esclarecimento, validade, modelo, planilha, apresentação, habilitação).

### Revisão, dossiê e saídas
- Todo item do PMO tem estado (pendente, aceito, editado, descartado), guardado no dossiê por um id estável (`estrategia:…`, `conteudo:…`, `eap:…`). Pedir um passo de novo substitui a resposta, com confirmação.
- O dossiê ganha o campo `proposta` (modelo, respostas validadas, abordagem escolhida, premissas críticas confirmadas, revisões, parâmetros do GP e o uso de cada chamada: tokens e valor). O formato continua na versão 1 (campo novo e opcional).
- **Saídas:** proposta técnica (DOCX e PDF), planilha de preço (XLSX), matriz de atendimento e checklist de envio (XLSX) e perguntas de esclarecimento (DOCX: as da estratégia e as brechas da etapa 1 que não ganharam outro destino). Cada trecho leva o rótulo. Cabeçalho de minuta enquanto houver pendência.

### Custo à vista
- Antes de cada passo: tokens estimados (4 caracteres por token) e o valor na primeira chamada e na seguinte dentro de 5 minutos (com cache). Depois: tokens reais (entrada, cache escrito, cache lido, saída) e valor, por chamada e no total da proposta. Preços em `src/config/precos.ts` (Opus 5.5: US$ 4 / 20 por milhão; Sonnet 5.5: US$ 2 / 10; consulta de 13/11/2026).

### Testes sem a chave
- Respostas do PMO para a RFP pública da OEI geradas no Claude Code (`tests/fixtures/gerados/proposta-oei/`), com citações literais: o teste confere que o código acha todas, que não há número sem fonte e que a cobertura dos requisitos é total.
- API simulada no formato de streaming da Messages API, nos testes de unidade (fetch trocado) e na fumaça do navegador (rota do Playwright), com a Content-Security-Policy ativa.

### Comparação de modelos (decisão 0002)
- `npm run comparar-modelos` roda os três passos com o Opus 5.5 e com o Sonnet 5.5 na RFP da OEI, com a mesma escolha fixa de abordagem, e grava as respostas e um `resumo.md` lado a lado em `tests/fixtures/gerados/comparacao-modelos/`: aderência da redação condicional, números sem fonte, citações conferidas, cobertura dos requisitos, tokens, valor e tempo. Custo estimado: US$ 2 a 3 por rodada. Só roda com a chave e com o script (ter a chave no ambiente não basta para um `npm test` gastar crédito).

### Versão
A F2 fecha com a tag **v0.5.0**.

## Consequências
- O primeiro teste com a chave real pode pedir ajuste do schema (a API transforma o JSON Schema) ou dos limites de saída; o módulo do cliente é o único lugar a mudar.
- Ficam para depois: a planilha de preço **no formato do próprio edital** (hoje a planilha do app aponta a do edital para transpor), a estrutura de uma proposta antiga da FGV (`referencias/modelos/`, quando houver), o vocabulário de dispensa ampliado com as características da proposta (decisão 0016) e a leitura, pelo código, da tabela de prazos por produto da RFP (hoje vem do PMO, conferida pela citação).
