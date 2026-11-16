# Regras da etapa 5 — rastro de cada saída

| Saída | Evidência | Regra | Quem | Skill |
|---|---|---|---|---|
| Tipo de plano | Título "proposta de prestação de serviços"; cronograma de desembolso; quadro de metas; habilitação dentro do plano | Plano de trabalho para o cliente × PGP interno | Código + GP confirma | decisão 0033 |
| Régua | Tipo de plano | Plano de trabalho: art. 22 + conteúdo mínimo do edital + metas + PC + núcleo; PGP: adaptação da etapa 4 | Código | `licitacoes.md` §4 |
| Sem registro de premissas (grave) | Nenhuma ocorrência de "premissa"; matriz de riscos sem gatilho; mudança genérica | **Um** achado, com uma linha por PC aplicável e os três lugares (falta / assunto citado / parcial) | Código (presença) + PMO (escrita como premissa?) | `checklist.md`; B3.9, B27.13, A11.12 |
| PC5 aplicável | Contratante público; vigência que cruza outubro de ano eleitoral do nível dele | Conta de datas | Código | PC5 |
| "Assunto citado" × "tratada" | Matriz cita "erro de registro no sistema" (falha da própria equipe) | Assunto da PC presente, mas o evento não é o da PC (o sistema do contratante falhar) | PMO | `experiencia.md` §6 (causa mal atribuída) |
| Parcelas × edital (grave) | Plano e edital com as duas primeiras parcelas trocadas, e o plano dizendo "em conformidade com o item X do edital" | Comparação parcela a parcela + frase de conformidade | Código | — |
| Duração × vigência | Trimestres do cronograma que somam mais meses que a vigência | Soma dos períodos do cronograma | Código | B15 |
| Equipe: limite × mínimo | "limite de contratação" × "inferior ao mínimo" | Modais diferentes para a mesma quantidade | Código + PMO | — |
| Exclusões de outro projeto | Lista exclui "estudos de arquitetura, engenharia, seguros" num projeto social | Vocabulário da lista sem relação com o objeto; faltam as exclusões do objeto | PMO (código pode medir sobreposição de vocabulário) | `experiencia.md` §7 (texto reaproveitado); CP8 |
| Orçamento × obrigação | Linha de informática muito baixa × tablet para toda a equipe | Obrigação com custo × linha | PMO | — |
| Mudanças incompletas (grave) | "comunicadas e documentadas por correspondência oficial" | Parte presente sem o item A11.9 (aditivo ou apostila) | Código (procura "aditivo", "apostila") | A11.9 |
| Substituição ausente (grave) | Nenhuma ocorrência; rotatividade como risco | Item A6.7 ausente; gravidade pela parte A6 | Código | A6.7 |
| Aceite ausente | Produtos com conteúdo, sem critério de aceite | Item B17.3 | Código | B17.3 |
| Escalonamento ausente | — | Item B9.9 / A7.7 | Código | A7.7 |
| Vagos que pesam | "ajustes quando necessários e pertinentes"; "destacar uma pessoa ou equipe [...] pela aprovação", sem prazo | Vago só na obrigação, prazo ou entrega de alguém (decisão 0031), sobretudo aprovação sem prazo | Código | CTR7; PC3 |
| Não é vago | "oportunamente, conforme o item X do edital"; texto padrão de LGPD; "quando necessário" em descrição de atividade | Exceções da decisão 0031 e do PR #43 | Código | — |
| O que está em ordem | Comparações que passaram (valor, vigência, metas, equipe, itens do art. 22) | Listar o resultado "confere" com os dois trechos | Código | — |
| Não se aplica | Partes do PGP num plano de trabalho | Anexo, fora da contagem | Código | decisão 0033 |

## Placar desta análise
- Gabarito: 12 achados (4 graves); o app antes das correções: 84 (19 graves), dos quais 3 graves se sustentavam.
- Dos 12, o app não achou 7: as PC sem registro (além da PC8), parcelas trocadas, cronograma maior que a vigência, limite × mínimo, exclusões de outro projeto, mudanças sem aditivo, aprovação sem prazo.

> [!NOTE] Inferido — validar com a responsável pelo projeto
> A gravidade de C3 (equipe: limite × mínimo) e de C5 (orçamento × obrigação) foi atribuída por julgamento. Pela regra fixa da parte, C3 poderia ser grave (A6) e C5 média (B6). Sugere-se fixar a regra para conflitos que envolvem mais de uma parte.
