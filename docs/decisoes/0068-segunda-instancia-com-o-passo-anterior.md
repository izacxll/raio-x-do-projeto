# 0068 — TAP revisado na segunda instância das premissas

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026), entre três opções: só nas premissas, em todos os passos ou nenhum bloco

## Contexto

No teste externo, a segunda instância do registro de premissas apontou duas contradições com o TAP que já estavam corrigidas. O dossiê tinha o TAP final, o que seguiu com o "seguir" do GP, mas o pedido das premissas leva do TAP só os limites e o risco geral. Para conferir a coerência, o revisor foi buscar o TAP em outro arquivo da pasta e achou a versão da última conferência, antes da correção.

Mandar o passo anterior inteiro em todas as segundas instâncias custaria de 5 mil a 21 mil tokens a mais por chamada. A revisão de código também mostrou que a resposta bruta do passo não serve: ela ignora o que o GP editou e descartou, e recriaria o falso alarme.

## Decisão

1. **Só a segunda instância do registro de premissas recebe o TAP**, como o app o exporta: com o texto que o GP editou, sem os itens descartados e sem o próprio registro de premissas, que é o que está sendo conferido. O bloco traz a data da versão e avisa que versões anteriores e conferências antigas não valem.
2. **A rubrica diz que só conta o que está no pedido:** incoerência com uma versão que não veio nele não é achado.
3. **A conferência guardada fica velha quando o TAP revisado muda.** Ela guarda a versão do TAP que recebeu: a data e uma impressão do texto, porque editar ou descartar um item não muda a data. A conferência guardada antes desta decisão continua valendo.
4. **Skill de revisão, seção 1:** o passo anterior, quando vai, vai na versão final; incoerência só com o que está no pedido.

## Consequências

- Nos casos do teste externo, o pedido da segunda instância das premissas passa de ~8,8 mil para ~18,4 mil tokens (o total da chamada, de ~29,8 mil para ~39,4 mil). Os outros passos não mudam.
- Os outros passos continuam levando resumos do anterior no próprio pedido. Se aparecer o mesmo falso alarme em outro passo, a regra se estende a ele.
