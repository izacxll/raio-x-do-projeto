# 0064 — Tamanho do pedido sem perder conteúdo

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), com a skill 0.3.3

## Contexto

O pedido ao PMO levava em toda etapa o `SKILL.md` inteiro (as cinco etapas, o histórico das versões, o uso no Claude Code), o `checklist.md` inteiro (as oito premissas críticas e as tabelas históricas da V29) e as fichas com as linhas de fonte, que servem à auditoria e não à leitura. Cada corte só entra se o gabarito passar antes e depois.

## Decisão

1. **Cache de prompt:** continua como estava. A skill e as referências, que são fixas, vão no começo, como instrução de sistema e marcadas para cache; os documentos do caso vêm depois, também em cache; o pedido do passo vai no fim.
2. **SKILL.md por etapa:**
   - entram o núcleo (papel, princípios, as regras gerais da seção 3 que valem para a etapa, pelo título, e o formato de saída) e só a seção da etapa em curso;
   - saem o histórico das versões, "O que carregar", "Uso no Claude Code" e o mapa das referências;
   - a segunda instância recebe o recorte da etapa conferida.
   O arquivo inteiro continua na skill.
3. **Checklist pelas premissas críticas confirmadas:**
   - a partir dos passos que vêm depois da confirmação do GP (conteúdo e EAP da etapa 2; etapas 3, 4 e 5), entram só as PCs confirmadas e a tabela de onde cada uma aparece;
   - a etapa 1 e a estratégia da etapa 2, em que o PMO sugere quais se aplicam, levam o checklist inteiro;
   - sem nenhuma PC confirmada, também vai inteiro.
4. **Fichas sem as linhas de fonte:**
   - saem só as linhas "fonte", que ficam no repositório para a auditoria;
   - ficam o item, os sinais, quem confere e a dispensa;
   - os temas do Rework continuam calculados pela ficha inteira.

## Consequências

Tokens de entrada da instrução de sistema (estimativa de 4 caracteres por token, skill 0.3.3, 3 PCs confirmadas):

| Pedido | Antes | Depois |
|---|---|---|
| Etapa 1 | 30.640 | 21.230 (−31%) |
| Etapa 2, estratégia | 68.668 | 55.848 (−19%) |
| Etapa 2, conteúdo e EAP | 68.668 | 51.438 (−25%) |
| Etapa 3 | 38.726 | 23.155 (−40%) |
| Etapa 4 (sistema) | 45.983 | 31.544 (−31%) |
| Etapa 4, fichas de 7 partes no pedido | 14.645 | 12.539 (−14%) |
| Etapa 5 | 26.556 | 12.061 (−55%) |
| Segunda instância (etapa 2) | 16.880 | 8.323 (−51%) |

O texto dos documentos do caso não muda. O gabarito passou antes e depois dos cortes.
