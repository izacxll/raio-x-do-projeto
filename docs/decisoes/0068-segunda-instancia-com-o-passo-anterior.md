# 0068 — TAP revisado na segunda instância das premissas

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026), entre três opções: só nas premissas, em todos os passos ou nenhum bloco

## Contexto

No teste externo, a segunda instância do registro de premissas apontou duas contradições com o TAP que já estavam corrigidas. O dossiê tinha o TAP final, o que seguiu com o "seguir" do GP, mas o pedido das premissas leva do TAP só os limites e o risco geral. Para conferir a coerência, o revisor foi buscar o TAP em outro arquivo da pasta e achou a versão da última conferência, antes da correção.

Mandar o passo anterior inteiro em todas as segundas instâncias custaria de 5 mil a 21 mil tokens a mais por chamada. A revisão de código também mostrou que a resposta bruta do passo não serve: ela ignora o que o GP editou e descartou, e recriaria o falso alarme.

## Decisão

1. **Só a segunda instância do registro de premissas recebe o TAP como o GP o deixou:** os itens do TAP, por elemento, com o texto editado e sem os descartados. Cada item leva o mesmo rótulo da tela: do documento com a página, "citação não conferida" quando o código não achou o trecho, sugestão ou decisão do GP. Os itens vêm já conferidos contra os documentos (na tela, os da tela do TAP). Junto vão os campos que só o GP preenche: recursos, gerente, autoridade e patrocinador. Não vão a aprovação, o próprio registro de premissas (que é o conferido) nem a marca de "pendente": no teste externo, todo item fica pendente e a marca esvaziaria a conferência. As decisões nas divergências também ficam de fora, porque só com o id interno o revisor não tem o que conferir. O título do bloco traz a versão, e o texto avisa que versões anteriores e conferências antigas não valem.
2. **O pedido das premissas também leva os limites e o risco geral revisados**, e não os da resposta bruta. Assim o pedido do passo e o bloco não mostram dois TAPs diferentes. Quando o GP descarta todos, o pedido diz isso, e não "TAP ainda sem limites".
3. **A rubrica diz que só conta o que está no pedido:** incoerência com uma versão que não veio nele não é achado.
4. **A conferência guardada fica velha quando o TAP revisado muda**, e a nova conferência sobe de rodada. A conferência guarda a versão do TAP que recebeu: a data e uma impressão do bloco. A versão muda quando o GP edita ou descarta um item ou preenche um campo dele; aceitar sem editar e aprovar o TAP não a mudam. A tela diz se o que mudou foi a resposta, o TAP ou se o TAP saiu do dossiê. Na importação do teste externo, a versão é lida do pedido exportado, ao lado da resposta, e não do dossiê no momento da importação; sem o pedido, a importação avisa. A conferência guardada antes desta decisão continua valendo.
5. **Skill de revisão, seção 1:** o passo anterior, quando vai, vai na versão final; incoerência só com o que está no pedido.

## Consequências

- Nos dois casos do teste externo, o pedido da segunda instância das premissas sobe ~5 mil tokens (de ~8,8 mil para ~13,9 mil e de ~10,3 mil para ~15,7 mil). Os outros passos não mudam.
- No teste externo, o vigia não reexporta o pedido quando o GP revisa itens do TAP, porque lá o TAP não é revisado item a item: ele só muda por uma resposta nova, que tem fluxo próprio.
- Os outros passos continuam levando resumos do anterior no próprio pedido. Se aparecer o mesmo falso alarme em outro passo, a regra se estende a ele.
