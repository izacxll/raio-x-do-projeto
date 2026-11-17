# 0052 — Achado do código é candidato até o veredito do PMO

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), a partir do teste externo do TR municipal de contratação direta (estudo de impacto de evento)

## Contexto

Na conferência (etapa 5) do plano do teste, o código deu 18 achados, e a leitura do PMO mostrou que 17 não se sustentavam:
- 9 vinham de partes que o GP tinha dispensado: o script de teste não as levava ao mapa, como o app leva;
- 7 eram itens que o plano tem com outra redação: a busca procura o termo exato da ficha;
- 1 era uma regra errada: texto de outro documento contado no registro de questões, que descreve o problema do edital.

Os 18 entravam no total como achados, e o pedido dizia ao PMO para não repeti-los. Nada no fluxo deixava o PMO dizer que um achado do código não se sustenta.

A busca do ausente do PMO tinha o problema inverso. O código procurava os termos no plano inteiro e achava o termo justamente no trecho que o PMO citava como evidência. Com isso, rebaixava achados que se sustentavam.

## Decisão

1. **Achado do código é candidato até o veredito do PMO.** Vale para todos os achados do código: ausente, vago e conflituoso. O pedido da etapa 5 lista cada um com o id e pede um veredito:
   - `sustenta`: o achado vale;
   - `falso`: o plano tem o conteúdo, com o trecho (doc "pgp", página e trecho literal);
   - `nao_se_aplica`: não vale para este projeto, com o motivo;
   - `regra_errada`: a regra do código errou, com a causa.

   Só os confirmados como `sustenta` contam no total. Os outros aparecem à parte, com o veredito, na tela, no relatório e no placar. O GP pode rever.
2. **O código confere o veredito.**
   - No `falso`, o trecho é procurado na página. Se não for achado, fica "citação não conferida". Se estiver fora da parte apontada, o código avisa.
   - O `nao_se_aplica` e o `regra_errada` exigem o motivo.
   - Veredito incompleto, ou achado sem veredito, fica "candidato sem veredito" e não conta.
   - Veredito com id fora da lista é ignorado e aparece no placar.
3. **Dispensa declarada só no plano é candidata.**
   - A dispensa que o GP fez na etapa 4 do app vale direto.
   - A que só o plano declara, na lista "Partes dispensadas pelo GP" (plano que chega sem a etapa 4 no dossiê), vai ao PMO. Ele diz se ela cabe pelas condições da ficha: `cabe` ou `nao_cabe`, com o motivo.
   - Se não couber, a parte volta a ser conferida. Os achados do código para ela vão no mesmo pedido, como condicionais, e o PMO dá veredito também a eles.
4. **A busca do ausente do PMO fica restrita a três condições:**
   - procura só na parte apontada (e, se ela foi dispensada, nas partes que a justificativa diz que absorvem o conteúdo);
   - descarta os trechos que o próprio achado cita como evidência;
   - quando o PMO manda `termosProcurados`, usa só esses. Os sinais do item da ficha valem quando ele não manda termos.
5. **Por enquanto, as instruções do veredito vão só no texto do pedido.** Elas entram na skill PMO na próxima versão, junto com o #52.

## Consequências

- No teste, os dois ausentes do PMO que o código tinha rebaixado (despesas fora da linha de base; informação ao respondente) passam a ser aceitos. Os achados do código caem de 18 para 9, porque saem os das partes dispensadas.
- O schema da leitura (`RespostaLeitura`) ganha `vereditos` e `dispensas`, os dois com padrão vazio.
- Uma resposta antiga, sem vereditos, deixa todos os achados do código como candidatos sem veredito, fora do total.
- A resposta gravada da demonstração traz um veredito para cada achado do código do plano inventado, escrito pelo Claude Code, a revisar pelo PMO.
- O app e o script de teste montam o mapa, os candidatos e os condicionais pelas mesmas funções (`mapaInicialDaConferencia` e `conferirComCandidatos`).
