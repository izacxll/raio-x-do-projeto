# Regras da etapa 1 — rastro de cada saída

Cada linha é uma saída da análise à mão. **Evidência** descreve o tipo de trecho que a sustentou (exemplos disfarçados). **Regra** é o que transformou o trecho na saída. **Quem** diz se dá para ser código, se precisa do PMO, ou os dois.

## Em uma página

| Saída | Evidência | Regra | Quem | Skill |
|---|---|---|---|---|
| Regime e modalidade | Preâmbulo cita "Lei federal nº 13.019", "termo de colaboração", "chamamento público" | Termos do preâmbulo na tabela de regimes; muda o vocabulário de todas as seções | Código + GP confirma | `licitacoes.md` §1, §4 |
| Objeto | Primeira frase da seção cujo título diz "objeto" | Seção pelo título, não pela de "propósito" | Código | — |
| Quem pode participar | Lista alfabetada em "requisitos e impedimentos para a celebração" com tempo de CNPJ e de experiência | Itens com número + "anos" na seção de requisitos | Código | — |
| Tamanho | Seção de quantitativo: "pico de aproximadamente N famílias", "N profissionais de campo", "N supervisores e 1 coordenador" | Número + unidade (famílias, profissionais, municípios) **consolidados numa linha** | Código | `experiencia.md` §4 |
| Valor | "O valor total estimado do ajuste será de R$" | Primeiro valor monetário da seção de valor/orçamento | Código | — |
| Prazo | "vigência de N meses, sendo os 2 primeiros destinados à preparação" | Número + meses + divisão em fases + marco ("a partir da celebração") | Código | — |
| Como se ganha | Tabela de critérios com coluna de pontuação máxima e uma de economicidade | Ler colunas separadas; soma dos máximos = total; peso do preço destacado | Código | `prop-estrategia` .1, .2 |
| Situação | Tabela de etapas do certame com datas | Datas × hoje | Código | — |
| O que mais pesa (3 a 5) | Os pontos de atenção de maior impacto | Ordenar por: caixa > dependência do contratante > preço > prazo | PMO | `experiencia.md` §1 |

## Obrigações, prazos e dinheiro

| Saída | Evidência | Regra | Quem | Skill |
|---|---|---|---|---|
| Obrigações agrupadas | Frases "A OSC deverá", "se obriga a", tabela de atribuições por função | Sujeito = contratada/OSC + verbo de obrigação; agrupar por tema (equipe, equipamento, rotina, sistema, relatórios, contas, financeiro, governança, dados, comunicação) | Código classifica; PMO revisa o agrupamento | — |
| Vedações | "É vedado ao profissional..." | "vedado", "não poderá" com sujeito contratada | Código | — |
| Metas | Tabela com cabeçalho meta / indicador / fórmula / fonte | Ler a tabela como registro; meta vira requisito tipo "meta" | Código | `licitacoes.md` §4 (art. 22) |
| Prazos do certame | Tabela de etapas; "antecedência mínima de 10 dias da data-limite" | Datas fixas + cálculo da data-limite de esclarecimento | Código | — |
| Prazos da execução | Vigência, parcelas "após N meses da assinatura", prestação de contas "até o 5º dia útil", "até 90 dias do término" | Número + unidade + marco; recorrentes numa linha | Código | — |
| Parcelas | "Valor da Nª parcela: (X% do valor total), transferido após N meses" | Regex por parcela; soma = 100% | Código | `prop-preco` .8 |
| Condição dos repasses | "parcelas subsequentes à primeira apenas serão liberadas após aprovação da prestação de contas"; "condicionada ao atingimento progressivo das metas" | "liberad" ou "condicionad" + "aprovação" ou "atingimento", sem prazo próximo → ponto de atenção PC3 | Código (padrão) + PMO (impacto) | `checklist.md` PC3; `experiencia.md` §1 |
| "Seleção não obriga a contratar" | "não obriga a administração" | Regex | Código | — |

## Pontos de atenção (o núcleo da etapa)

| Saída | Evidência (disfarçada) | Regra | Quem | Skill |
|---|---|---|---|---|
| Duas leituras numa regra que elimina | Anexo: "Recomenda-se a proporção de 1 supervisor para cada 15"; corpo: "será eliminada proposta com número de profissionais inferior ao mínimo" | A mesma grandeza aparece com força modal diferente ("recomenda-se" × "mínimo") e um item cita o outro | Código acha a referência cruzada e os modais; PMO confirma | `checklist.md` CTR7 |
| Período com duas leituras | Meta: "ao longo dos N meses de contrato"; vigência de N + 2 meses | Mesma unidade (meses) com valores diferentes para o "contrato" | Código: ampliar a regra prazo-divergente para sinônimos (vigência, contrato, execução, programa) | CTR7 |
| Dependência de lista do contratante | "recebimento da lista de famílias pré-selecionadas pela secretaria" | Sinal de aplicação da PC1 ("lista", "cadastro") sem prazo | Código | `checklist.md` PC1 (TB24) |
| Sistema do contratante | "utilizar, de forma exclusiva e obrigatória, o sistema fornecido pela secretaria"; metas "monitoradas pelo registro no sistema" | Sinal PC2 + "exclusiva e obrigatória" + meta medida no sistema → peso maior | Código | PC2 |
| Condição do território | "internet ilimitada e com abrangência nos territórios" | Condição que o método supõe existir | PMO | `experiencia.md` §3 |
| Validação sem prazo | "submetida à análise e validação" sem prazo | Sinal PC3 sem número de dias na frase | Código | PC3 (CE16) |
| Adesão e mobilização | "convidará a família a aderir voluntariamente"; busca ativa a cargo da contratada | Sinal PC6 ("adesão"); a pergunta "quem divulga?" | Código (sinal) + PMO (pergunta) | PC6; `experiencia.md` §6 |
| Função com duas cargas | Tabela de atribuições: supervisor acompanha agentes **e** articula a rede local; 1 coordenador para dezenas de cidades | Uma função dimensionada por uma variável e carregada por duas | PMO | `experiencia.md` §4 |
| Deslocamento fora da conta | Muitos municípios + número de visitas por família, sem tempo de deslocamento | Campo + vários municípios + produtividade sem deslocamento | PMO (código pode sinalizar a combinação) | `experiencia.md` §5 |
| Norma que define o trabalho fora do edital | "conforme a Resolução nº X" repetido na metodologia, sem anexo | Norma citada várias vezes na seção de metodologia e não anexada | Código | `experiencia.md` §7 |
| Vigência × eleição | Contratante público; vigência a partir da celebração que cruza outubro de ano eleitoral do nível dele | Conta de datas | Código | PC5 |
| Peso do preço | Economicidade vale 20 de 100; "valor incompatível" elimina | Peso do critério de preço + causa de eliminação | Código | CTR2 |
| Esclarecimento não suspende | "não suspendem os prazos" | Regex | Código | — |
| Dados no país | "vedada a transferência de dados para fora do território" | Regex | Código | CP14 |
| Alteração só por aditivo | "mediante termo aditivo" | Regex | Código | PC8; art. 57 |

## O que ficou de fora (regras de exclusão)

| Exclusão | Regra | Quem |
|---|---|---|
| Leis | Só o regime (preâmbulo) e as normas citadas no objeto ou na metodologia; o resto vira "outras N normas citadas" | Código |
| Órgãos | Só quem tem papel: verbos contratar, fiscalizar, validar, julgar, pagar | Código |
| Números soltos | Número fora de obrigação, meta, prazo ou valor | Código |
| Linhas de faixa da pontuação | Só máximo e o que dá a nota máxima | Código |
| Itens de outra modalidade | Em parceria: sessão pública, planilha de preços, garantia, reajuste, multa → "não se aplica" | Código, pelo tipo |
| Leitura página a página | Só o aviso de página ilegível | Código |

> [!NOTE] Inferido — validar com a responsável pelo projeto
> A ordem de impacto dos pontos (caixa > dependência > preço > prazo) foi julgamento da análise, não regra da skill. Sugere-se confirmar antes de virar código.

## Regras novas (decisões 0042 a 0046)

Evidência dos testes externos de 16/11/2026 (leituras gravadas externas, fora do Git): o edital da SMPED e um TR municipal de contratação direta (estudo de impacto de evento). Exemplos disfarçados.

| Saída | Evidência | Regra | Quem | Skill |
|---|---|---|---|---|
| Chave de modalidade | Seção da modalidade que declara inexigibilidade com base no art. 74, III | Três caminhos (licitação, contratação direta, parceria); troca as seções 5, 6 e 8 | Código + GP confirma | SKILL.md §3 (Modalidade); decisão 0042 |
| O que sustenta a contratação direta | Justificativa de notória especialização que descreve áreas que não são o objeto | Texto de outro projeto é conflituoso e vira pergunta | PMO | `prop-estrategia` .11; CP8 |
| TR montado da proposta | Obrigação da contratada introduzida por "conforme objeto da proposta" | Perguntas viram ajustes na minuta antes da assinatura | PMO | SKILL.md §3 |
| Prazo sem termo inicial | "no prazo de N dias" para repassar informações ao contratante, sem dizer de quando | Duas leituras ("em até" × "com antecedência"): vago, com pergunta | Código sinaliza; PMO escreve as leituras | decisão 0045 |
| Janela até marco fixo | Início em data fixa; campo preso a um evento com data | Dias úteis entre o início e o marco × atividades que precisam acabar antes | Código (conta); PMO (quais atividades) | PROP-EAP.11; A3.13 |
| Cruzamentos X1 a X6 | "Parcela única" num item × desembolso mensal num quadro; dois e-mails para a mesma finalidade; vigência × fim do evento | Lista fixa, registrada como feita ou não se aplica | Código lista e conta; PMO compara | SKILL.md §3; decisão 0046 |
| Quem executa × vedação | Dados de campo "levantados pela equipe da contratada" × a vedação do art. 74, § 4º | Conferir se a RFP já responde antes de perguntar; a dúvida que sobra é a de aplicadores temporários | PMO | X3; A6.7 |
| Estudo sensível | Justificativa que cita comissão do Legislativo com intenção de CPI sobre o objeto do estudo | Sinal forte de disputa junto de impacto ou recursos, na mesma página | Código sugere; GP confirma | decisão 0043 |
