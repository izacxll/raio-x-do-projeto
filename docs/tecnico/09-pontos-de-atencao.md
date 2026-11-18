# 09 — Pontos de atenção

Dívidas técnicas, riscos e itens a validar, cada um com a evidência no código. A situação é a de 16/11/2026, com a `main` na v0.8.1.

## Arquitetura e código

1. **Ciclos entre pastas** (`03-dependencias.md`):
   - `etapas` ↔ `exportacao`;
   - `extracao` ↔ `regras`;
   - `exportacao` ↔ `interface`;
   - `dossie` ↔ `pmo/schemas`.

   Não quebram a execução, mas impedem testar ou trocar uma camada sozinha. Caminhos possíveis:
   - mover `regras/busca.ts` para `texto/`;
   - passar a cor e o logo como parâmetro dos montadores;
   - levar os schemas das respostas para uma pasta neutra.
2. **Telas grandes:** `src/interface/telas/proposta.tsx` (1.097 linhas), `pgp.tsx` (772) e `conferencia.tsx` (685) misturam estado, regras de tela e apresentação.
3. **Ids que dependem da posição no texto.** Alguns itens da etapa 1 têm a página e a posição no id, por exemplo `julgamento:pontuacao:<página>:<posição>` em `src/extracao/rfp/julgamento.ts`. A revisão do GP fica ligada ao id (`src/etapas/1-rfp/revisao.ts`): se a extração mudar entre versões, a revisão daquele item se perde ao reabrir o dossiê.
4. **Dossiê na versão de formato 1** (`VERSAO_FORMATO_DOSSIE`). O app recusa formato mais novo. Hoje não existe código de migração: campos novos entram como opcionais.

## Regras e extração

5. **Extração por expressões regulares.** A cobertura depende da redação do edital. No gabarito da etapa 1 do chamamento da SMPED, o app acerta 34 de 104 itens. Dos 70 que não acerta:
   - 59 uma regra resolveria;
   - 11 só uma leitura com IA (PR #14; o estudo foi substituído pelos gabaritos do método da etapa 1, em `tests/fixtures/gerados/rfp-*/gabarito-metodo-etapa-1.json`).
6. **Dias úteis sem feriados.** Os prazos calculados descontam só sábados e domingos, e a nota pede para conferir feriados (`src/extracao/rfp/prazos.ts`).
7. **Etapa 5 com base única.** Todo plano é medido contra as 51 partes do PGP. A premissa crítica conta como tratada com um sinal em qualquer lugar do plano. A checagem nos lugares B3, B27 e A11 é pulada quando a parte não existe no plano (`src/regras/conferencia.ts`, bloco "premissas críticas"). O teste da responsável com um plano de trabalho real teve 13 de 84 achados sustentados. A proposta de correção é a decisão 0033, no PR #14, que aguarda o ok.
8. **Larguras do PDF estimadas.** A largura de cada palavra é estimada por classe de caractere, não medida na fonte (`src/exportacao/larguras.ts`). Palavra acima do teto (endereço de site, nome de arquivo) ainda pode quebrar.

## Segurança

9. **Chave da API no navegador** (decisão 0003). As proteções:
   - `sessionStorage` só da aba;
   - erros sem a chave (`semChave`);
   - CSP com conexão só para `api.anthropic.com`;
   - nenhum script de terceiros.

   Um XSS no próprio site exporia a chave da sessão. O desenho isola a chamada num módulo só (`src/pmo/cliente.ts`), para trocar por um servidor intermediário no futuro.
10. **`style-src 'unsafe-inline'`** na CSP (`vite.config.ts`). Os scripts continuam sem `unsafe-inline` e sem `eval`.

    > [!NOTE] Inferido — validar com a equipe
    > O código não diz por que os estilos inline foram liberados. Vale conferir se a regra ainda é necessária, por exemplo retirando-a e rodando a fumaça.

## Operação

11. **Preços digitados à mão** (`src/config/precos.ts`, consultados em 13/11/2026). A estimativa de custo mostrada ao GP fica errada se a tabela da API mudar.
12. **Testes com a chave ainda não feitos.** Faltam o teste real das etapas 2, 3 e 4, a leitura do PMO na etapa 5 e a comparação Opus × Sonnet (`docs/andamento.md`). A rodada real está na branch `correcao/rodada-real-com-chave`, fora da `main`.

> [!NOTE] Inferido — validar com a equipe
> O desempenho com editais muito longos não foi medido: tempo de leitura, OCR de muitas páginas e memória da aba. O teste mais longo é o pregão da CAPES (126 páginas), que passa na fumaça. Não há teste de carga além dele.

## Referências no código

- `src/extracao/rfp/julgamento.ts`, `src/extracao/rfp/prazos.ts`, `src/etapas/1-rfp/revisao.ts`
- `src/regras/conferencia.ts`, `src/regras/busca.ts`
- `src/exportacao/larguras.ts`, `src/interface/tokens.ts`
- `src/interface/telas/proposta.tsx`, `pgp.tsx`, `conferencia.tsx`
- `src/dossie/esquema.ts` (`VERSAO_FORMATO_DOSSIE`)
- `src/pmo/cliente.ts`, `src/pmo/chave.ts`, `vite.config.ts`, `src/config/precos.ts`
- `docs/andamento.md`, `docs/decisoes/0003-chave-da-api.md`, `docs/decisoes/0033-etapa-5-por-tipo-de-plano.md` (no PR #14)
