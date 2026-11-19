# Andamento

Atualizado em 19/11/2026. Teste externo da rodada 3 fechado nos dois casos (etapas 1 a 5). Pente fino para a comissão: os seis blocos feitos. Os blocos 3, 4 e 5 estão em PRs abertos, à espera do ok da responsável.

## Onde estamos

**Pente fino para a comissão (18/11/2026).** A responsável pediu um pente fino a partir de duas revisões independentes do teste externo (fora do Git), com esta ordem: formato do resultado, decisões do GP e material da comissão; depois custo, qualidade da IA e proporcionalidade.
- **Bloco 1, formato do resultado (na `main`):**
  - capa de decisão, quadros, corpo e anexo (0084);
  - capa e quadros de cada etapa (0085);
  - recomendação de participar como sugestão (0086).
  - ajustes da capa (0087) e resultado no padrão da FGV Projetos (0089, #98, na `main`);
  - resumo de uma linha na capa, "43/44" na etapa 5 e a leitura do PMO da etapa 5 gravada no dossiê pelo vigia (0090, #99).
- **Bloco 2, decisões do GP (#96, decisão 0088):** fila de pendências por impacto, com a decisão do GP e o item com aviso nunca em lote, e o que mudou na correção.
- **Bloco 3, gestão:**
  - PGP enxuto por porte (0091, #100): de 10 a 15 partes no pequeno, com o destino do conteúdo dispensado e o limite de páginas por porte. Medido: de 44 para 18 partes num caso e de 44 para 33 no outro. O corpo fica em cerca de 15 páginas; o total quase não muda, porque o volume está nos registros B;
  - riscos ligados a resposta, reserva e marco, e a contingência derivada dos riscos marcados (0092, #101, empilhado no #100).
- **Bloco 4, qualidade da IA:**
  - travas (0093, #102): alarme falso medido por trava. A "redação a conferir" ficou mantida, porque erra menos do que acerta; foi ajustada e ganhou a checagem de rótulo misto;
  - lições da skill marcadas como regra geral ou de um caso só (0094, #103, skill: espera aprovação);
  - revisor em outro modelo: [`estudos/revisor-em-outro-modelo.md`](estudos/revisor-em-outro-modelo.md).
- **Bloco 5, custo (0095, #104):** cache de 1 hora no prefixo estável, com o custo por projeto completo no painel da comissão, em dólar e em reais.
- **Bloco 6, material da comissão (#97):** `docs/comissao/`.

**Rodada 3 do teste externo, etapa 4 fechada (18/11/2026).** Os dois casos (o TR fiscal e o TR de contratação direta) passaram por adaptação, escopo, cronograma, riscos, planos e execução, cada passo com duas rodadas de segunda instância e "seguir". As lições ficam fora do Git. O fechamento virou cinco PRs:
- **0070, placar e pedidos:** data fixa vencida "não confirmável"; aviso de encerramento antes do último aceite; vago que só reproduz o documento sai; premissa nova parecida com o registro inicial vira aviso; regra das QU no topo do pedido de execução; A2.8 era regra estreita; tokens de cada pedido no placar.
- **0071, segunda instância mais barata e igual nas duas pontas:** rodada 2 só com os achados anteriores, o que mudou e as páginas citadas (no caso fiscal, de ~55 mil para ~15 mil tokens); sem rodada 2 quando a 1 só tem achados baixos; modelo da rodada 2 à escolha do GP; o app passa a mandar os achados da rodada anterior.
- **0072, resultado da etapa para apresentação:** um DOCX por etapa e por caso, fora do Git (gerados os das etapas 1 a 4 dos dois casos).
- **0073, skill PMO 0.3.4** (aceita): as lições da etapa 4.
- **0074, arquitetura** (aceita; a migração vem em PRs pequenos depois do teste): skill base + um arquivo por etapa; subagente só na segunda instância e na revisão de código alta (`.claude/agents/revisor-codigo.md`).

A pasta do teste foi atualizada para a `main` com o vigia novo (linha de estado no `STATUS.md`, resultado da etapa quando ela fecha, terceiro caso esperando o TR na pasta `tr-terceiro`).

**Os métodos das etapas valem (decisão 0034).** A responsável escreveu um método por etapa (`docs/estudos/metodo-etapa-1.md` a `metodo-etapa-5.md`), a partir da análise à mão de um caso real de parceria (fora do Git). O que vale de cada etapa para o PMO está em `.claude/skills/pmo/referencias/etapas/etapa-N.md` (decisão 0083; o rastro antigo, `07-regras`, fica no histórico do Git, commit `4054c80`). O método prevalece sobre o que a etapa faz hoje: leitura e decisão para o gerente, não inventário, com a régua pelo tipo de contrato, de projeto e de plano.

**O PMO lê; o código monta e confere (decisão 0035).** Em todas as etapas, o PMO lê a partir do esqueleto do código, e o código confere cada citação, número e prazo. **Nenhuma etapa analisa sem a conexão com o Claude (decisão 0037):** sem a chave, as opções são conectar ou ver a demonstração, que existe em todas as etapas (na 5, com um plano inventado com erros plantados). O esqueleto do código vai no pedido e não aparece sozinho.

**Fases M1 e M2 (etapas 1 e 2 pelo método)** estão na `main` (decisões 0036 e 0038). Os placares delas ficam no histórico do Git (commit `2ac4708`; decisão 0075).

**PR #46:** métodos revisados (sem os detalhes que identificavam o caso real) e a engenharia reversa das cinco etapas; a chave dos scripts lida de um arquivo fora do repositório (`RAIO_X_ARQUIVO_CHAVE`, nunca `ANTHROPIC_API_KEY`); documentação coerente com a 0035 e a M1; o roteiro da etapa 5 com um plano real; a decisão 0037 (conexão antes de analisar, demonstração da etapa 5).

**Correções da etapa 1 e autoconferência (decisões 0048 e 0049), branch `correcao/etapa-1-esqueleto` em cima da M3:** os erros do esqueleto que os testes externos da skill acharam na SMPED e num TR municipal de contratação direta; a contratação direta no código; os cruzamentos X1 a X6; a citação fraca; a autoconferência nos esquemas das etapas 1 a 4 e o teste que reprova. As leituras externas ficam fora do Git (`referencias/estudos-externos/`). Junto, na skill 0.3.0 (PR #52): decisões 0042 a 0047. O CI do PR #54 (M3) está verde desde 16/11: a falha antiga era um espaço irregular (BOM literal num regex) e as respostas gravadas do TAP da OEI que faltavam no commit, corrigidos no próprio #54.

**Correções da etapa 5 (decisão 0052), PR #57 em cima do #55:** partes dispensadas no mapa da etapa 5, busca do ausente do PMO na parte apontada e achado do código como candidato até o veredito do PMO. Com ele, o teste externo do TR municipal de contratação direta fica **encerrado** (etapas 1 a 5); o resumo e as pendências ficam fora do Git, em `referencias/estudos-externos/`. Os 77 vereditos da demonstração da etapa 5 foram escritos pelo Claude Code, a revisar pelo PMO.

**Na main (17/11/2026), por squash:** #44 (M0), #45 (M1), #46 (métodos revisados), #53 (M2), #54 (M3), #55 (correções da etapa 1 e autoconferência, com os trechos do caso trocados por equivalentes neutros) e #57 (correções da etapa 5, decisão 0052).

**Sem modo de demonstração (decisão 0053), PR próprio sobre a main:** a apresentação do app é feita com a skill PMO na conversa; as respostas gravadas da OEI ficam só como material dos testes (fumaça com o PMO simulado pela rota do Playwright).

**Skill PMO 0.3.2 na main (#61, decisão 0056):** as mudanças da 0.3.0 e da 0.3.1 (o #52 foi fechado como substituído) e as 19 regras do teste externo, só acréscimo, cada uma com o "erro que evita". Os itens novos das fichas são "só PMO".

**Travas, linha do tempo e segunda instância (decisão 0057, na main pelo #62; ajustes da decisão 0058: "citação a conferir" como aviso e segunda instância da etapa 1; decisão 0059: a segunda instância leva o pedido do passo, com o esqueleto, e conta as rodadas; decisão 0060: achado médio também espera o GP e, da rodada 2 em diante, a reentrega não abre rodada nova):**
- as travas que o teste mostrou (EAP, TAP, critério pontuado, citação que não prova, data de ato);
- o passo refeito sem a resposta anterior;
- a linha do tempo nos pedidos da EAP, do TAP e do cronograma, com `conferenciaDosMarcos` conferida pela conta do código;
- a segunda instância depois de cada resposta (a ligação da regra 19 da skill).

**Skill PMO 0.3.3 e revisão em camadas (decisão 0063):** as lições do teste ponta a ponta (etapas 1 a 3, dois TRs), a rubrica fixa da segunda instância, `docs/papeis.md` e o gabarito em `tests/pmo/gabarito/` (2 casos disfarçados; os achados da leitura do PMO esperam respostas gravadas).

**Teste externo novo:** TR de um diagnóstico fiscal estadual e, como controle, um TR de contratação direta, fora do Git em `referencias/estudos-externos/` (decisão 0049). Ele recomeça do zero com a skill 0.3.2 e a decisão 0057; as respostas antigas das etapas 1 a 3 ficam em `rodada-2/`. O vigia exporta um passo de cada vez, na ordem do app, com a segunda instância depois de cada resposta.

**Teste externo atualizado para a main em 18/11/2026 (autorizado pela GP):** a pasta do teste passou para a main com os #65 a #71 (skill 0.3.3, pedido menor). Só o passo atual dos dois casos foi reexportado (etapa 3, premissas); as respostas já gravadas ficaram como estavam. O pedido das premissas caiu de ~50,8 mil para ~41,6 mil tokens no TR fiscal e de ~57,7 mil para ~47,4 mil no TR de contratação direta. **Falso alarme conhecido, não corrigir:**
- no TR de contratação direta, o protocolo de campo passou a ter número C (decisão 0061), e os compromissos de método e os limites de volume mudaram de número;
- o TAP já respondido cita os números antigos, então o placar do TAP pode mostrar um C sem destino e Cs citados com o sentido trocado nessa faixa.
O #71 corrigiu a conferência do pedido externo, que recusava o SKILL.md recortado por etapa.

## Fases

| Fase | O que é | Situação | Tag |
|---|---|---|---|
| Fundação, S, F0 | Organização, skill PMO 0.1.0, esqueleto do app | concluídas (PRs #1 a #3) | v0.1.0, v0.2.0 |
| F5, F1, F2 | Conferência do PGP, leitura da RFP e proposta | concluídas (PRs #5 a #7) | v0.3.0 a v0.5.0 |
| Demonstração, F3, F4, F5b | Respostas gravadas, TAP, PGP e leitura do PMO na etapa 5 | concluídas (PRs #8 a #11) | v0.5.1 a v0.8.0 |
| Correções | Termo de fomento (0031), nome do projeto, falsos positivos da etapa 5 (0033, fase 1) | concluídas (PRs #13, #14, #43) | v0.8.1 a v0.8.3 |
| P | Prova de conceito com o caso real | **encerrada**: substituída pela análise à mão da responsável, que deu os métodos (decisão 0034) | — |
| M0 | Métodos em vigor (0034) e o PMO lê, o código confere (0035) | PR #44 | — |
| M1 | Etapa 1 pelo método | PR #45; teste da responsável pendente | v0.9.0 |
| — | Métodos revisados, chave em arquivo, documentação, roteiro da etapa 5, decisão 0037 | PR #46 | — |
| M2 | Etapa 2 pelo método | PR aberto; teste da responsável pendente | v0.10.0 |
| M3 | Etapa 3 pelo método (contrato como entrada) | a fazer | v0.11.0 |
| M4 | Etapa 4 pelo método (adaptação por porte e tipo) | a fazer | v0.12.0 |
| M5 | Etapa 5 pelo método (régua pelo tipo de plano; fases restantes da 0033) | a fazer | v0.13.0 |
| Skill 0.3.0 | Tipos de projeto e de plano, etapa 1 no SKILL.md, etapa 5 como leitura principal, proposta de parceria, PC com gatilho e reajuste, contrato, caixa (decisão 0039) | PR #51 (rascunho), mostrado antes de publicar | — |
| MVP | Critérios de aceite da seção 14 | a fazer | v1.0.0 |

O que cada fase M ainda precisa cobrir está nas issues de cada uma (rótulos `etapa-2` a `etapa-5`).

## Decisões pendentes

- **Modelo padrão da API:** Opus 5.5 é provisório; a escolha sai da comparação (`npm run comparar-modelos`, decisões 0002 e 0025), que espera a chave.
- **Ordem de impacto dos pontos de atenção** (caixa > dependência do contratante > preço > prazo): julgamento da análise, a confirmar pela responsável. Veio da engenharia reversa (o arquivo foi removido pela decisão 0075).
- **Gravidade dos conflitos que envolvem mais de uma parte** do plano (etapa 5) e **gatilhos com número** como campos obrigatórios da etapa 4: a validar na M4 e na M5.
- **A camada "tipo" (tipo de projeto, de contrato e de plano) vira um módulo comum às cinco etapas?** Hoje cada etapa reconhece o tipo por conta própria. Veio da engenharia reversa (decisão 0075).
- **Pente fino (19/11/2026):**
  - merge dos PRs #99 a #104;
  - aprovar a skill 0.3.8 (#103);
  - no porte pequeno, levar os registros B só para a planilha, para o total de páginas cair;
  - revisor da segunda instância: manter o de hoje, trocar pelo Sonnet 5.5 ou rodar os dois em paralelo na próxima rodada;
  - reimportar a leitura da etapa 5 nas pastas dos dois casos, para o dossiê ter a leitura do PMO.

## Próximo passo

0. **Rodada 3, depois do fechamento (18/11/2026):** os PRs #77 a #81 estão na `main`, e a pasta do teste foi atualizada para ela (vigia com a rodada 2 compacta e o resultado da etapa). A responsável conduz a etapa 5 dos dois casos e põe o terceiro TR na pasta `tr-terceiro`. Depois do teste: a migração da decisão 0074 (skill base + `etapa-N.md`), em PRs pequenos.

1. **Claude Code:** merge da decisão 0057 (autorizado, com CI verde e varredura limpa); religar o vigia e reexportar a etapa 1 dos dois TRs, do zero.
2. **Responsável pelo projeto:** conduzir o teste externo a partir da etapa 1 (pedidos do PMO e da segunda instância).
3. **Histórico do Git:** a responsável decidiu não reescrever a `main` (16/11/2026). Os arquivos atuais e o site estão sem os detalhes do caso real.

**Com a chave da API** (pedir ao administrador do Claude da FGV, no Claude Console). A chave fica num arquivo fora do projeto; passo a passo no PowerShell em [`tecnico/07-configuracao.md`](tecnico/07-configuracao.md#chave-da-api-nos-scripts-locais-powershell). Nunca defina `ANTHROPIC_API_KEY` no terminal: com ela, o Claude Code passa a cobrar o uso dele nessa chave.

```powershell
Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
$env:RAIO_X_ARQUIVO_CHAVE = "$env:USERPROFILE\.raio-x\chave-api.txt"
npm run comparar-modelos     # cerca de US$ 2 a 3; resultado em tests/fixtures/gerados/comparacao-modelos/resumo.md
```

Na tela, nunca citar fases do plano: para o GP, o que falta é "em construção".

**Lembretes técnicos:**
- O Poppler (`pdftotext`, `pdfinfo`) não está no PATH do Git Bash; use o caminho completo ou a leitura do próprio app (`npm test` lê as RFPs de teste em Node).
- `npm run dev` e `npm run build` copiam antes os arquivos de leitura para `public/vendor/` (fora do Git).
- O `vite preview` 8 devolve 404 para scripts pedidos pelo navegador; os testes de fumaça usam `tests/fumaca/servidor.mjs`.
