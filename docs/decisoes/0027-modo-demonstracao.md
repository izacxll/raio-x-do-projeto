# 0027 — Modo demonstração, com as respostas gravadas do PMO

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido); detalhes pelo Claude Code, em nome dela

## Contexto

A responsável vai apresentar o app sem a chave da API. As etapas com o PMO (2, 3 e 4) não fazem nada sem ela. Já existem respostas do PMO gravadas para a RFP pública da OEI (`tests/fixtures/gerados/proposta-oei/`), geradas no Claude Code seguindo a skill, usadas nos testes.

## Decisão

- **Botão "Ver demonstração"** nas etapas com o PMO (a etapa 2 agora; a 3 e a 4 quando existirem). Ele fecha o projeto atual (com confirmação, se houver mudança não salva), baixa a RFP pública da OEI do próprio site (copiada de `tests/fixtures/rfps-publicas/` para `public/vendor/demonstracao/` antes do dev e do build, fora do Git) e a lê com a leitura de verdade.
- **Nenhuma chamada à API** no modo demonstração, mesmo com a chave conectada. Cada passo do PMO vira "Carregar a resposta gravada": a resposta sai de `tests/fixtures/gerados/<etapa>-oei/<passo>.json`, empacotada no build e validada pelo mesmo schema da resposta da API. Sem custo e sem registro de uso.
- **O resto do fluxo é o de verdade:** conferência das citações na página, redação, números sem fonte, cronograma, preço com os valores do GP, matriz de atendimento, revisão item a item e saídas.
- **As decisões do GP continuam do GP.** As respostas gravadas partem de escolhas fixas (abordagem B; premissas críticas PC1, PC3, PC6 e PC8 nas etapas seguintes). Com outra abordagem, o app não mostra o conteúdo da B como se fosse da escolhida: pede para escolher a B.
- **Aviso sempre visível:** a faixa "Demonstração com respostas gravadas, sem chamada à IA" fica no alto de todas as telas enquanto o dossiê for de demonstração, com "Sair da demonstração". O dossiê guarda `demonstracao: true` (campo novo e opcional; o formato continua na versão 1) e todo documento exportado leva o mesmo aviso no cabeçalho (DOCX, PDF e XLSX).
- Nas etapas 3 e 4, a demonstração já entra com as etapas anteriores gravadas (a proposta, e o TAP na etapa 4), como se o GP tivesse passado por elas.
- Sai como **v0.5.1** (correção depois da F2, decisão 0026), com o merge depois do ok da responsável. Até lá, a prévia das fases seguintes (que nascem desta branch) já mostra a demonstração.

## Consequências

- O site publicado passa a servir um PDF público de teste (~1 MB), baixado só quando o GP clica em "Ver demonstração".
- Toda resposta gravada nova (etapas 3 e 4) também serve aos testes: o código confere que todas as citações são achadas no PDF.
