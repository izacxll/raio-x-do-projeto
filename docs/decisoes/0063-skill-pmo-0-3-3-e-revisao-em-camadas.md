# 0063 — Skill PMO 0.3.3, revisão em camadas e gabarito

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), depois das etapas 1 a 3 do teste ponta a ponta da rodada 3 (dois TRs)

## Contexto

O teste ponta a ponta da rodada 3 (skill 0.3.2, etapas 1 a 3) mostrou que:

- a revisão não tinha ordem nem limite: a segunda instância, que é o mesmo modelo, apontou um erro numa conta do código que estava certa, e a "correção" foi aplicada; correções só de texto abriram quatro rodadas;
- as lições de cada caso ficavam só na conversa, sem um teste que as guardasse;
- a leitura do PMO errou de novo em pontos que a skill não dizia (listas de conteúdo, documento vencido, obrigação exata, origem e período de cada dado, a versão que mais obriga, compromisso prometido × assinado).

## Decisão

1. **Revisão em camadas, nesta ordem:**
   - testes e gabarito (código);
   - segunda instância, com a rubrica fixa;
   - GP.
   Cada camada só recebe o que a anterior deixou passar. Está no SKILL.md (seção 3) e em `docs/papeis.md`, com o objetivo do app e os papéis: o PMO sugere; o código lê, confere e calcula; a segunda instância revisa; o GP decide.
2. **Rubrica fixa da segunda instância** (SKILL.md e pedido do app):
   - os tipos: erro de fato; o que faltou; incoerência entre etapas e com a conta do código; rótulo ou premissa errados, decisão do GP como fato, nome de pessoa;
   - gravidade alta só quando muda escopo, prazo, preço, caixa, aceite ou quem executa;
   - o revisor não recebe o raciocínio de quem fez.
3. **Limites escritos:**
   - o revisor erra: achado sobre número ou conta é conferido no placar antes de virar correção;
   - no máximo 2 rodadas, e depois o GP decide;
   - trava nova entra com a contagem de alarmes falsos, e vira aviso se der mais alarme falso que acerto.
4. **Gabarito** (`tests/pmo/gabarito/`):
   - os achados confirmados, por caso e etapa, com o que tem de aparecer, a seção, a gravidade e a página;
   - caso público, com a fonte e a data; caso não confirmado como público, só disfarçado;
   - roda na CI, sem a API. Achado do código roda a regra sobre a entrada; achado do PMO é conferido contra a resposta gravada e fica pendente enquanto ela não existe.
5. **Skill 0.3.3:** as lições do teste nas etapas 1, 2 e 3, cada uma com o erro que evita e exemplos disfarçados. O compromisso da proposta é "prometido" enquanto não há contrato, também no pedido e no placar do TAP.

## Consequências

- O gabarito começa com 2 casos disfarçados: 12 achados do código, conferidos na CI, e 16 achados da leitura do PMO, pendentes até haver respostas gravadas de um caso público ou disfarçado.
- A rubrica do pedido da segunda instância muda: um achado que só "afirma como fato o que o documento não diz", sem mudar escopo, prazo, preço, caixa, aceite ou quem executa, deixa de ser alto.
- A redução do tamanho do pedido (cache, SKILL.md por etapa, checklist só com as premissas críticas confirmadas, fichas sem as linhas de fonte) vai num PR próprio, medido e com o gabarito passando antes e depois.
