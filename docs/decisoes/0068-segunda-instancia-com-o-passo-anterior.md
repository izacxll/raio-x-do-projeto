# 0068 — Segunda instância com a versão final do passo anterior

- **Data:** 18/11/2026
- **Status:** proposta (aguarda a responsável pelo custo em tokens)
- **Quem decidiu:** a decidir pela responsável pelo projeto

## Contexto

No teste externo, a segunda instância do registro de premissas apontou duas contradições com o TAP que já estavam corrigidas. O dossiê tinha o TAP final, o que seguiu com o "seguir" do GP, mas o pedido das premissas leva do TAP só os limites e o risco geral. Para conferir a coerência, o revisor foi buscar o TAP em outro arquivo da pasta e achou a versão da última conferência, antes da correção.

## Decisão

1. **O pedido da segunda instância leva a resposta do passo anterior da mesma etapa**, como está no dossiê, em JSON compacto, logo depois do pedido do passo. O bloco avisa que é a versão que vale e que versões anteriores, conferências antigas e outros arquivos não valem. Vale nas etapas 2 a 4, a partir do segundo passo de cada uma. No primeiro passo da etapa, o anterior já está nos documentos (proposta, TAP).
2. **Skill de revisão, seção 1:** o passo anterior vai na versão final e o revisor não procura outra.

## Consequências

- O custo sobe. Medido nos dois casos do teste externo: +5 mil tokens (conteúdo ← estratégia; escopo ← adaptação), +7 a 12 mil (EAP, premissas, cronograma, planos, execução) e +16 a 21 mil (riscos ← cronograma) por chamada da segunda instância.
- Os pedidos dos passos continuam com os resumos do passo anterior que já tinham. A segunda instância passa a conferir a coerência com a versão completa.
