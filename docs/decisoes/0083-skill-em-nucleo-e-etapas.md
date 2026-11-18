# 0083 — Skill PMO em núcleo e arquivos por etapa (migração da 0074)

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026, depois do teste dos dois casos)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

A decisão 0074 aprovou a arquitetura "skill base + um arquivo por etapa", com a migração em PRs pequenos depois do teste. O `SKILL.md` tinha crescido com uma seção por etapa e as regras de cada versão (0.3.1 a 0.3.5) misturadas a elas; o rastro da análise à mão ficava em `docs/estudos/engenharia-reversa/07-regras-etapa-N.md`, fora da skill e sem uso no pedido.

## Decisão

1. **Cinco arquivos novos**, `.claude/skills/pmo/referencias/etapas/etapa-1.md` a `etapa-5.md`, cada um com seis seções:
   - **papel:** o que a etapa faz para o gerente;
   - **entradas:** documentos, dossiê, esqueleto do código e decisões do GP;
   - **saída:** as regras de cada parte e o formato próprio da etapa (cruzamentos, compromissos, vereditos);
   - **definição de pronto:** o critério de aceite do método (`docs/estudos/metodo-etapa-N.md`, que continua sendo a regra e prevalece) e o "antes de sair";
   - **armadilhas:** as lições das rodadas 1 a 3, sem o rótulo da versão, com exemplos inventados, e o que ainda valia do rastro `07-regras`;
   - **rubrica da segunda instância:** o que o revisor confere nesta etapa, além da rubrica geral. Na etapa 5, é a conferência leve da decisão 0077.
2. **O `SKILL.md` vira o núcleo** do que vale para todas as etapas: papel, princípios, tipo de projeto e modalidade, estudo sensível, as regras gerais da seção 3 (cada uma vai só às etapas do título), revisão em camadas e formato de saída. A seção de cada etapa sai e fica um ponteiro.
   - O que só uma etapa usa foi para o arquivo dela: os formatos próprios e os itens do estudo sensível.
   - O "tipo de plano" virou subseção das etapas 2 (o plano de trabalho da parceria), 4 e 5.
   - Os "erros que evitam" repetidos foram encurtados.
3. **O pedido** (`skillDaEtapa`, decisão 0064) passa a montar o núcleo recortado mais o `etapa-N.md` da etapa. A segunda instância usa o mesmo recorte, e o pedido dela manda conferir a rubrica da etapa dentro do que o pedido do passo exige.
4. **A skill `revisao-segunda-instancia`** usa a rubrica do `etapa-N.md` junto com a geral.
5. **Saem do repositório os `docs/estudos/engenharia-reversa/07-regras-etapa-N.md`**, com a linha do `CLAUDE.md` que mandava lê-los. O histórico fica no Git (commit `4054c80`).
6. **Skill 0.3.6.**

## Tokens do recorte da skill por etapa (estimativa do app)

| Etapa | Antes | Depois |
|---|---|---|
| 1 | 7.246 | 7.190 |
| 2 | 8.100 | 7.920 |
| 3 | 6.859 | 6.358 |
| 4 | 8.703 | 8.621 |
| 5 | 6.869 | 6.761 |

Nenhum pedido cresce, e nenhuma regra saiu: o que estava na seção da etapa está no arquivo dela.

## Regressão

- **Frase a frase:** cada frase do `SKILL.md` antigo foi procurada no núcleo e nos arquivos das etapas. Só ficaram sem par os rótulos de versão, os títulos antigos e os trechos condensados de propósito (princípios 14 e 15, compromissos de método, revisão em camadas), sem regra a menos.
- **Os dois casos do teste externo (cópias fora do Git):** os 46 pedidos das etapas 2 a 5 (passos e segundas instâncias) foram exportados de novo com a skill nova. Em todos, a conferência do conteúdo do pedido não acusa falta, e a skill vai com o arquivo da etapa certa.
- **Gabaritos e testes:** a suíte passa. O código que confere as respostas (achados, placares, alarmes falsos da decisão 0076) não mudou neste PR.
- **Revisão de código alta** (subagente revisor): os achados foram corrigidos. O formato dos compromissos voltou às etapas 3 e 4, a tabela do tipo de plano vai também à etapa 2, a etapa 5 tem o formato dos cruzamentos completo e as armadilhas preenchidas, e as fichas apontam para `etapas/etapa-N.md`.

## Consequências

- Uma lição nova de uma etapa vai para as armadilhas do arquivo dela, sem mexer no núcleo nem no pedido das outras etapas.
- A ordem de merge: depois do #86 (skill 0.3.5), de onde parte, e do #87 (segunda instância leve da etapa 5), a que a rubrica da etapa 5 se refere.
