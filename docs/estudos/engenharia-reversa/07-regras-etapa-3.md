# Regras da etapa 3 — rastro de cada saída

| Saída | Evidência | Regra | Quem | Skill |
|---|---|---|---|---|
| Precedência | Contrato: "plano de trabalho, parte integrante e indissociável deste ajuste" | Contrato prevalece; se a proposta é parte integrante, ela também obriga | Código (regex da cláusula) | — |
| Divergência de parcelas | Edital e proposta com as duas primeiras parcelas trocadas (ex.: 20% e 30% × 30% e 20%), e a proposta dizendo "em conformidade com o item X do edital" | Comparar parcela a parcela; frase de conformidade que não confere é divergência à parte | Código | TAP7.2 |
| Divergência de produtos | Edital sem produtos (só metas e relatório trimestral); proposta com produtos numerados | Produto da proposta ausente da RFP = compromisso assinado → entrega-chave com aceite | Código (lista × lista) | TAP4.2 |
| Divergência de equipe | Edital: "inferior ao mínimo"; proposta: "limite de contratação de N" | Mesma quantidade com regra diferente (mínimo × limite) | Código (modais) + PMO | — |
| Contagem dos meses | Edital: meses de preparação + meses de execução; proposta: atendimento desde o mês 1 e cronograma em trimestres que somam mais meses que a vigência | Soma dos períodos do cronograma × vigência; mês 1 da proposta × mês 1 da vigência | Código | TAP6.2 |
| Término | Proposta: "conclusão a partir da entrega de todos os produtos e da quitação de todas as parcelas"; contrato: vigência e prestação final | Critério de conclusão da proposta × término do contrato | PMO | TAP10.1 |
| Proteção × cláusula | Proposta: "fato alheio não deve implicar glosa"; contrato: "parcelas só após aprovação" | Cláusulas que tratam do mesmo evento com efeitos diferentes | PMO | — |
| Quem aprova | Proposta: "a secretaria deverá destacar uma pessoa ou equipe [...] pela aprovação de documentos"; contrato: gestor designado | Sem prazo nos dois → TAP9.4 "não informado" | Código (ausência de prazo) | TAP9.2, TAP9.4 |
| Orçamento × obrigação | Edital: equipamento para toda a equipe; proposta: linha de informática muito baixa | Obrigação com custo × linha de despesa | PMO | PROP-MATRIZ .10 |
| Finalidade e resultado | Contrato (objeto) + edital (resultados esperados) | Benefício público, não só produtos | Código (objeto) + PMO (resultado) | TAP1.1, TAP1.2 |
| Objetivos e critérios | Metas do contrato | Metas viram objetivos; aceite e contas aprovadas como sugestão | Código + PMO | TAP2.1, TAP2.2 |
| Marcos | Contrato, proposta, dependências do contratante | Cada marco é resultado concluído com evento de referência; entram os que dependem do contratante (lista recebida, sistema liberado) | Código (datas) + PMO (marcos externos) | TAP6.1, TAP6.3 |
| Recursos | Valor do contrato; composição de custo | Igual ao contrato; pré-aprovação interna: GP | Código + GP | TAP7.1, TAP7.2 |
| Partes e quem decide | Contrato: gestor, comissão de monitoramento, signatários | Quem decide do lado do contratante | Código | TAP8.2; B31.2 |
| Término, suspensão, cancelamento | Cláusulas de vigência, prestação de contas, denúncia, rescisão, suspensão de repasse | Três listas separadas | Código | TAP10.1, TAP10.2 |
| GP, autoridade, patrocinador | — | Só redação sugerida; Decisão do GP | PMO + GP | TAP11, TAP12 |
| Registro de premissas | Premissas que a proposta escreveu (dimensionamento) + PC que faltam | Primeiro as escritas (Do documento), depois as PC (Sugestão); situação "aberta"; quem valida e até quando | Código + PMO | B3.1 a B3.9; TAP-PR.2 |

> [!NOTE] Inferido — validar com a responsável pelo projeto
> A especificação prevê como entrada só a RFP e a proposta. A análise usou o contrato assinado, e ele mudou o resultado (precedência, parcelas, gestor). Sugere-se incluí-lo como entrada opcional com prioridade.

## Regras novas (decisão 0047)

Evidência dos testes externos de 16/11/2026 (leituras gravadas externas, fora do Git): o edital da SMPED e um TR municipal de contratação direta (estudo de impacto de evento). Exemplos disfarçados.

| Saída | Evidência | Regra | Quem | Skill |
|---|---|---|---|---|
| Divergência que muda escopo ou custo | Formato do produto (PPT × relatório); quem faz o campo; fonte dos dados | Contrato prevalece; sem resposta, a versão que mais obriga a FGV, pendente com o contratante | PMO | TAP-DV.7 |
| Divergência que a RFP já responde | Dúvida "quem faz o campo?" aberta, e o TR dizia "equipe da contratada" | Conferir a RFP antes de abrir divergência | PMO | TAP-DV.7 |
| Compromissos C com destino | Premissas e exclusões da proposta | Cada C vira premissa, limite, entrega-chave ou divergência | Código confere presença; PMO escreve | TAP-PR.4 |
| Critério de sucesso que não cabe | "Metodologia aceita antes do início do evento", com estimativas maiores que a janela | Critério preso a data só entra se couber no cronograma | Código (janela) | decisão 0045 |
