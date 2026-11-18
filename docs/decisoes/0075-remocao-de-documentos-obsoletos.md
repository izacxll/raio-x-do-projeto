# 0075 — Remoção da documentação obsoleta da engenharia reversa

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026), a partir do inventário feito pelo Claude Code

## Contexto

`docs/estudos/` guardava, além dos métodos das etapas, o material da engenharia reversa feita antes das fases M (a análise à mão de um caso real e a comparação do app antigo da etapa 1) e os placares das fases M1 e M2. A skill PMO, os pedidos do vigia, as decisões e a documentação técnica (`docs/tecnico/`) substituíram quase tudo. O inventário conferiu, arquivo a arquivo, quem ainda citava cada um e se havia conteúdo que não existia em outro lugar.

## Decisão

1. **Removidos:**
   - da pasta `engenharia-reversa/`: `01-visao-geral.md`, `02-arquitetura.md`, `05-modelo-de-dados.md`, `06-fluxos.md`, `09-pontos-de-atencao.md` e `README.md`. O conteúdo deles está em `docs/tecnico/`, em `docs/arquitetura.md`, nos métodos e na skill;
   - `engenharia-reversa-etapa-1-smped.md`, substituído pelos gabaritos do método da etapa 1;
   - `placar-m1-etapa-1.md` e `placar-m2-etapa-2.md`, os números das fases M1 e M2.
2. **Antes de remover, o `09-pontos-de-atencao.md` foi conferido item a item:**
   - as quatro lições (sinônimos de exclusão, adaptação por porte e tipo, caixa acumulado, referências da etapa) já estão nas fichas, no `experiencia.md` e no `SKILL.md`;
   - as cinco tensões com a especificação foram resolvidas pelas decisões 0033, 0039 a 0041, 0044 e 0054;
   - das pendências, a ordem de impacto, a gravidade dos conflitos entre partes e os gatilhos com número já estavam em "Decisões pendentes" do `docs/andamento.md`. A única que faltava, se a camada "tipo" vira um módulo comum às cinco etapas, foi para lá.
3. **Ficam:**
   - os métodos (`metodo-etapa-1.md` a `-5.md`), que prevalecem (decisões 0034 e 0074);
   - o roteiro da etapa 5 com um plano real, usado por `npm run conferir-plano-real`;
   - os `engenharia-reversa/07-regras-etapa-N.md`, até o PR da migração da decisão 0074, que leva o conteúdo deles aos arquivos de cada etapa.
4. **Referências:**
   - nas decisões e no README dos gerados, o caminho fica com "removido pela decisão 0075; histórico no Git, commit `2ac4708`" (o último commit da `main` com os arquivos);
   - na documentação viva, o caminho aponta para o que substituiu;
   - o CHANGELOG não muda, porque registra o que aconteceu em cada versão.
5. **Sem reescrever o histórico.** Nada em `referencias/` foi tocado.

## Consequências

- `docs/estudos/` fica com os métodos, o rastro por etapa (até a migração) e o roteiro da etapa 5.
- Para ler um arquivo removido: `git show 2ac4708:docs/estudos/<arquivo>`.
- `dist/` já estava fora do Git (`.gitignore`). `referencias/exemplos/.keep` nunca esteve no Git; a responsável o apaga na máquina dela.
