# 0056 — Skill PMO 0.3.2: as regras do teste externo

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), a partir do teste externo pelas etapas 1 a 4 (um TR de diagnóstico fiscal e um TR de contratação direta)

## Contexto

O teste externo, feito como o app faz, mostrou erros que a skill 0.3.1 não evitava. O cronograma fechava sem a análise do cliente, e o marco anterior a um evento fixo deixava de caber. Uma abordagem que reduzia um R aparecia como opção equivalente às outras. Perfis exigidos só como mínimo eram tratados como critério pontuado. Horas e prazos de terceiros saíam rotulados como documento. Faltavam a origem e o período dos dados. Texto de outro projeto, copiado no TR, era adotado como "a versão que mais obriga".

A 0.3.0 e a 0.3.1 (#52) não chegaram à main: a base delas ficou para trás depois dos merges das correções do código.

## Decisão

1. **Acrescentar 19 regras à skill, sem cortar nada do que já existe.** Cada regra fica no lugar indicado pela responsável, com a frase da regra e o "erro que evita", num exemplo disfarçado, sem nome de cliente.
   - **SKILL.md:**
     - princípio 14: cada etapa é feita do zero, sem reaproveitar a resposta anterior do mesmo passo;
     - princípio 15: o rótulo "documento" só vale quando o trecho prova a frase;
     - compromissos de método também são C, com destino no TAP;
     - linha do tempo antes de fechar a EAP, o TAP e o cronograma;
     - conferência por uma segunda instância antes da próxima etapa;
     - texto de outro projeto no TR é conflito.
   - **Fichas:**
     - PROP-EAP.13 a .18;
     - PROP-SOW.14;
     - PROP-ESTRATEGIA.13 e .14;
     - PROP-EQUIPE.12 a .15;
     - PROP-METODOLOGIA.12;
     - TAP6.4, TAP9.5, TAP-DV.8 e TAP-DV.9;
     - A5.14, A11.13, B3.10 e B18.11;
     - extensões de PROP-ESTRATEGIA.12, PROP-SOW.12, TAP-DV.7 e A11.12.
   - **`checklist.md`:** PC1 (origem e período do dado; fonte externa) e PC7 (mesmo perfil em atividades paralelas).
   - **`experiencia.md`:** duas lições novas.
2. **Os itens novos das fichas são "só PMO"** e usam só o vocabulário das características em "dispensa". A conferência por código da etapa 5 não muda.
3. **A 0.3.2 entra na main junto com a 0.3.0 e a 0.3.1,** num branch novo sobre a main, que substitui o #52. Merge autorizado com CI verde e varredura limpa.

## Consequências

- O teste externo é refeito com a 0.3.2: o TR fiscal a partir da etapa 2 (minuta, abordagem B), e o TR de contratação direta a partir da etapa 4 (adaptação).
- A regra da segunda instância está só na skill. Ligá-la a uma conferência do app antes da etapa seguinte é trabalho de código, a combinar.
- A leitura gravada da etapa 5 ganhou o veredito do achado B23.10 (vindo da 0.3.0), escrito pelo Claude Code e a revisar pelo PMO.
