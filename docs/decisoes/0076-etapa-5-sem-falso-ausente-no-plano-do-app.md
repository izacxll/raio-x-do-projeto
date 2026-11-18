# 0076 — Etapa 5 sem falso "ausente" e falso "vago" no plano do app

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido de 18/11/2026), com as regras escritas pelo Claude Code

## Contexto

Na etapa 5 do teste externo, a conferência leu o plano que o próprio app gerou na etapa 4. Os achados do código foram todos falsos alarmes:
- no caso de contratação direta, 12 candidatos e nenhum se sustentou (8 falsos, 4 de regra errada);
- no caso fiscal, 20 candidatos e nenhum se sustentou (16 falsos, 3 de regra errada, 1 que não se aplica).

O conteúdo estava no plano, com outras palavras. As causas foram cinco:
1. item que a autoconferência da etapa 4 marcou "presente", escrito sem os termos da ficha;
2. o identificador de risco no formato do app ("rk01 · contratual");
3. A11.1 num plano que diz quem decide e dispensa o comitê formal pelo porte;
4. A14.10 (ondas sucessivas) num plano preditivo;
5. "a definir" que diz quando ou onde se define, ou que está ligado a uma questão aberta.

## Decisão

1. **Marca "presente" da etapa 4.** Antes de dar um item do conteúdo mínimo como ausente, o código procura no plano o texto do item que a autoconferência apontou em "onde" (o texto final, sem os descartados): um trecho de oito palavras do começo e um do meio. Achou, o item fica "presente pela marca do PMO, redação a conferir". Não achou, continua ausente. Vale na tela da etapa 5 e na exportação do teste externo, quando o dossiê tem a etapa 4.
2. **Formato do app:** o B27.1 aceita o identificador "xx01 · categoria". O A11.1 aceita o plano que dispensa o comitê ("sem comitê", "dispensa o comitê") e diz quem decide ou aprova.
3. **Item condicional:** a dispensa do A14.10 na ficha passa a incluir "abordagem preditiva".
4. **"a definir" que não é vago:**
   - seguido de quando ou onde ("antes do campo", "no P1 e no treinamento", "até a reunião");
   - com a questão aberta no mesmo item (QU-09) ou com o acontecimento que o resolve ("quando o esclarecimento for respondido");
   - ligado a uma questão do registro de questões do plano por três palavras-chave ou mais.
   "O formato é a definir", sozinho, continua vago.

## Consequências

- Gabarito de regressão com os dois planos reais (fora do Git): reimportada a etapa 5 com o código novo, os 32 candidatos falsos não reaparecem, e o achado válido do PMO de cada caso continua.
- No Git, os testes usam exemplos inventados, inclusive o contrário: marca "presente" sem o texto no plano continua ausente; risco sem identificador, mudança sem quem decide e "a definir" sem quando continuam achados. Os testes de erros plantados seguem verdes.
- A regra de busca por termos continua valendo para plano de fora (sem a etapa 4 no dossiê).
