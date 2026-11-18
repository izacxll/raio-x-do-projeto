# 0068 — TAP revisado na segunda instância das premissas

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026), entre três opções: só nas premissas, em todos os passos ou nenhum bloco

## Contexto

No teste externo, a segunda instância do registro de premissas apontou duas contradições com o TAP que já estavam corrigidas. O dossiê tinha o TAP final, o que seguiu com o "seguir" do GP, mas o pedido das premissas leva do TAP só os limites e o risco geral. Para conferir a coerência, o revisor foi buscar o TAP em outro arquivo da pasta e achou a versão da última conferência, antes da correção.

Mandar o passo anterior inteiro em todas as segundas instâncias custaria de 5 mil a 21 mil tokens a mais por chamada. A revisão de código também mostrou que a resposta bruta do passo não serve: ela ignora o que o GP editou e descartou, e recriaria o falso alarme.

## Decisão

1. **Só a segunda instância do registro de premissas recebe o TAP como o GP o deixou:** os itens do TAP, por elemento, cada um com o rótulo (do documento, sugestão, decisão do GP), com o texto editado e sem os descartados. Item que o GP ainda não revisou vai marcado como pendente. Junto vão as decisões do GP no TAP: recursos, gerente, autoridade, patrocinador e o que vale em cada divergência. Não vão a aprovação nem o próprio registro de premissas, que é o que está sendo conferido. O título do bloco traz a versão, e o texto avisa que versões anteriores e conferências antigas não valem.
2. **O pedido das premissas também leva os limites e o risco geral revisados**, e não os da resposta bruta. Assim o pedido do passo e o bloco não mostram dois TAPs diferentes. Quando o GP descarta todos, o pedido diz isso, e não "TAP ainda sem limites".
3. **A rubrica diz que só conta o que está no pedido:** incoerência com uma versão que não veio nele não é achado.
4. **A conferência guardada fica velha quando o TAP revisado muda**, e a nova conferência sobe de rodada. A conferência guarda a versão do TAP que recebeu: a data e uma impressão do bloco. A versão muda quando o GP revisa, edita ou descarta um item ou toma uma decisão no TAP; aprovar o TAP não a muda. A tela diz se o que mudou foi a resposta ou o TAP. Na importação do teste externo, a versão é lida do pedido exportado, e não do dossiê no momento da importação. A conferência guardada antes desta decisão continua valendo.
5. **Skill de revisão, seção 1:** o passo anterior, quando vai, vai na versão final; incoerência só com o que está no pedido.

## Consequências

- Nos dois casos do teste externo, o pedido da segunda instância das premissas sobe ~6 mil tokens (de ~8,8 mil para ~14,4 mil e de ~10,3 mil para ~16,1 mil). Os outros passos não mudam.
- No teste externo, o vigia não reexporta o pedido quando o GP revisa itens do TAP, porque lá o TAP não é revisado item a item: ele só muda por uma resposta nova, que tem fluxo próprio.
- Os outros passos continuam levando resumos do anterior no próprio pedido. Se aparecer o mesmo falso alarme em outro passo, a regra se estende a ele.
