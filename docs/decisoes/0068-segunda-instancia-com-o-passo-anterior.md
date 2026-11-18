# 0068 — TAP revisado na segunda instância das premissas

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026), entre três opções: só nas premissas, em todos os passos ou nenhum bloco

## Contexto

No teste externo, a segunda instância do registro de premissas apontou duas contradições com o TAP que já estavam corrigidas. O dossiê tinha o TAP final, o que seguiu com o "seguir" do GP, mas o pedido das premissas leva do TAP só os limites e o risco geral. Para conferir a coerência, o revisor foi buscar o TAP em outro arquivo da pasta e achou a versão da última conferência, antes da correção.

Mandar o passo anterior inteiro em todas as segundas instâncias custaria de 5 mil a 21 mil tokens a mais por chamada. A revisão de código também mostrou que a resposta bruta do passo não serve: ela ignora o que o GP editou e descartou, e recriaria o falso alarme.

## Decisão

1. **Só a segunda instância do registro de premissas recebe o TAP**, como o GP o deixou: os itens do TAP, por elemento, com o texto que o GP editou e sem os descartados. Vão só os itens, sem pendências, aprovação ou o próprio registro de premissas, que é o que está sendo conferido. O bloco traz a data da versão e avisa que versões anteriores e conferências antigas não valem.
2. **O pedido das premissas também leva os limites e o risco geral revisados**, e não os da resposta bruta. Assim o pedido do passo e o bloco não mostram dois TAPs diferentes.
3. **A rubrica diz que só conta o que está no pedido:** incoerência com uma versão que não veio nele não é achado.
4. **A conferência guardada fica velha quando o TAP revisado muda**, e a nova conferência sobe de rodada. A conferência guarda a versão do TAP que recebeu: a data e uma impressão do texto dos itens. Editar ou descartar um item muda a versão, mas aceitar sem editar ou aprovar o TAP não muda. A tela diz se o que mudou foi a resposta ou o TAP. Vale na tela e na importação do teste externo. A conferência guardada antes desta decisão continua valendo.
5. **Skill de revisão, seção 1:** o passo anterior, quando vai, vai na versão final; incoerência só com o que está no pedido.

## Consequências

- Nos dois casos do teste externo, o pedido da segunda instância das premissas sobe ~5 mil tokens (de ~8,8 mil para ~13,5 mil e de ~10,3 mil para ~15,3 mil). Os outros passos não mudam.
- Os outros passos continuam levando resumos do anterior no próprio pedido. Se aparecer o mesmo falso alarme em outro passo, a regra se estende a ele.
