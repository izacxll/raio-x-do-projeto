# 0066 — Revisor no caso certo

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026)

## Contexto

No teste externo, com dois casos lado a lado, um revisor da segunda instância leu o pedido de outro caso e trouxe achados de outro TR. Nada no prompt nem no pedido dizia qual era o caso, e nada mandava conferir isso antes de achar.

## Decisão

1. **Skill de revisão, seção 3 (lançar o agente):** o prompt diz o caso pelo nome, manda ler só o arquivo do pedido (caminho exato), sem abrir pastas de outros casos, e dá dois ou três termos que a resposta certa deve conter. Se o conteúdo for de outro caso, o revisor para e avisa, sem gravar achados.
2. **Skill de revisão, seção 4 (aplicar os achados):** antes de tudo, conferir se os achados falam do caso certo (os termos e as páginas citadas, que precisam existir no documento). Revisão de outro caso é descartada inteira e refeita.
3. **Código:** o pedido da segunda instância traz no topo a identidade do caso (`src/pmo/identidade-do-caso.ts`): o projeto, os documentos com as páginas, o objeto da RFP com a página (do documento) e até três termos do objeto. Os termos são as primeiras palavras do objeto que não são de todo edital e que o texto da RFP traz. Se algo não for deste caso, o revisor responde sem achados e com "caso errado" em conferido.

## Consequências

- Nas 9 RFPs públicas de teste, os termos separam os casos (por exemplo, "subsídios, fortalecimento, sistema" e "mulheres, enfrentando, violência"). Na RFP escaneada, sem objeto legível, vão só os arquivos.
- Nos dois TRs do teste externo, a primeira versão escolhia palavras de todo TR ("contratar pessoa jurídica") e, na contratação direta, o nome da contratada. A lista de palavras de todo edital passou a incluir essas palavras e o nome da FGV, e a frase do objeto para no título seguinte. Com isso, os dois casos ficaram com termos do assunto de cada um.
- A lista saiu dos objetos dessas RFPs e TRs. Termo genérico que aparecer num caso novo entra nela.
- O bloco custa poucas dezenas de tokens por pedido.
