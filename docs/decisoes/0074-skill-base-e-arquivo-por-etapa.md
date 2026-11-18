# 0074 — Uma skill PMO base e um arquivo por etapa

- **Data:** 18/11/2026
- **Status:** aceita e implementada (ok da responsável em 18/11/2026; a migração da skill está na decisão 0083)
- **Quem decidiu:** Claude Code, a pedido da responsável (fechamento da rodada 3, item 8)

## Contexto

O `SKILL.md` da PMO junta princípios, regras gerais e as cinco etapas. Desde a decisão 0064, o código manda ao PMO só o núcleo e a seção da etapa em curso, recortando o arquivo pelos títulos. Cada rodada de teste acrescentou uma lista "Regras da 0.3.x" na etapa (0.3.2, 0.3.3, 0.3.4), e a rubrica da segunda instância é uma só para todas as etapas. A pergunta: separar em uma skill por etapa?

## Opções

| | Uma skill por etapa (cinco skills) | Skill base + um arquivo por etapa (sugestão da responsável) | Como está (um SKILL.md recortado por título) |
|---|---|---|---|
| Princípios e rótulos | copiados em cinco lugares; divergem na primeira correção | num lugar só (o `SKILL.md` base) | num lugar só |
| Recorte do pedido | natural | natural: núcleo + `etapa-N.md` | por expressão regular sobre os títulos; frágil a título renomeado |
| Rubrica da segunda instância | por etapa | por etapa, no arquivo da etapa | uma só |
| Lições por rodada | espalhadas | em "armadilhas", por tema | listas por versão que crescem |
| App (`?raw`, fonte única) | cinco importações e cinco versões | uma skill, seis arquivos | um arquivo |
| Custo | igual ao de hoje | igual ou menor (sem repetição entre as listas) | cresce a cada rodada |

## Recomendação

**A sugestão da responsável, com quatro ajustes:**

1. **Uma skill PMO, não cinco.** O `SKILL.md` fica com o papel, os princípios, os rótulos, as regras gerais da seção 3 que valem para mais de uma etapa e o formato de saída. Cinco skills duplicariam os princípios e eles divergiriam.
2. **Um arquivo por etapa dentro da skill**, em `.claude/skills/pmo/referencias/etapas/etapa-N.md` (e não em `referencias/` da raiz, que fica fora do Git). Cada arquivo com seis seções fixas:
   - **papel** na etapa (o teste de cada item);
   - **entradas** (documentos, esqueleto do código, decisões do GP, a saída da etapa anterior);
   - **saída** (a estrutura e o schema do passo);
   - **definição de pronto** (entrega completa: o critério de aceite do método da etapa, item a item, e a autoconferência);
   - **armadilhas**, vindas das lições, agrupadas por tema e sem a versão em que entraram (as listas "Regras da 0.3.x" viram uma lista só, sem repetição; cada armadilha com o erro que evita);
   - **rubrica da segunda instância da etapa** (o que o revisor procura além da rubrica geral, por exemplo, na etapa 4, a conferência da rede e das três marcas da premissa crítica).
3. **O método continua mandando.** `docs/estudos/metodo-etapa-N.md` é a referência da responsável e prevalece. O arquivo da etapa é a versão operacional para o PMO: cita os itens do método pelo número e não os copia. Um teste da CI confere que cada arquivo tem as seis seções e que todo item do critério de aceite do método aparece na "definição de pronto".
4. **Subagente só onde a execução independente ajuda:** a segunda instância (já é uma chamada separada, decisão 0071) e a revisão de código de nível alto (`.claude/agents/revisor-codigo.md`). A geração das etapas é sequencial e depende do contexto do passo anterior: fica na skill.

## Como migrar (se aprovado), em PRs pequenos

1. Mover cada "### Etapa N" do `SKILL.md` para `etapa-N.md`, **sem mudar uma regra**. `skillDaEtapa(n)` passa a juntar o núcleo e o arquivo da etapa. Teste: o texto que vai ao PMO em cada etapa é o mesmo de antes (só os títulos mudam), e o gabarito passa.
2. Juntar as listas "Regras da 0.3.x" em "armadilhas" por tema, tirando as repetições. O gabarito passa antes e depois.
3. Escrever a "definição de pronto" a partir do critério de aceite de cada método, com o teste da CI.
4. Levar a rubrica da etapa ao pedido da segunda instância (`pedidoSegundaInstancia` e `pedidoDaRodadaSeguinte`), nas duas pontas.
5. Atualizar a conferência do conteúdo do pedido (o "SKILL.md (etapa N)" vira núcleo + arquivo da etapa).

## Consequências

- O pedido de cada etapa não cresce; deve diminuir no passo 2.
- Um lugar para cada coisa: princípio no núcleo, regra da etapa no arquivo dela, lição em "armadilhas".
- Até a migração, nada muda: a 0.3.4 (decisão 0073) segue no formato atual.
