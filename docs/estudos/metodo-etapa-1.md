# Método da etapa 1 — leitura da RFP

Escrito pela responsável pelo projeto, a partir de uma análise feita à mão, item por item, de um chamamento real de 63 páginas (fora do Git) e do edital público da SMPED. Este arquivo diz **para que serve a etapa 1** e **como a saída deve ser montada**. Ele prevalece sobre o que a etapa faz hoje.

## 1. Para que serve

A etapa 1 deixa o gerente ciente, em poucos minutos, de **o que a RFP pede e o que espera de quem vai executar**, para ele:

1. decidir se a FGV participa;
2. saber o que a FGV assume se participar;
3. levar para a proposta o que precisa estar nela (inclusive as premissas críticas).

**Teste de cada item:** "isto muda uma decisão do gerente ou algo que a FGV terá de fazer, entregar, cumprir ou pagar?" Se não muda, o item não entra.

Hoje a saída é um inventário do documento (todas as leis, todos os órgãos, cada número solto, cada linha da tabela de pontuação, a leitura página a página). Num chamamento real de 63 páginas, isso deu 107 itens e deixou de fora o que mais pesava: as condições de repasse, as dependências do contratante e o que a equipe teria de fazer.

## 2. Estrutura da saída (nesta ordem)

A ordem é a da decisão do gerente. Cada item tem página. A meta é caber em **30 a 50 itens**, com a seção 1 lida em 2 minutos.

| # | Seção | Pergunta que responde |
|---|---|---|
| 1 | Em uma página | O que é, quem pode participar, tamanho, prazo, valor, como se ganha, situação (datas × hoje) e os 3 a 5 pontos que mais pesam |
| 2 | O que a contratada teria de fazer e entregar | Obrigações agrupadas por tema; metas e indicadores; o que é vedado |
| 3 | Prazos e marcos | Linha do tempo do certame (datas) e da execução (contada do marco: assinatura, ordem de serviço); obrigações recorrentes; prazos de encerramento |
| 4 | Dinheiro | Teto, cronograma de desembolso ou medição, condição de cada pagamento, o que retém ou glosa, contrapartida, "não obriga a contratar" |
| 5 | Como é julgado e o que entregar | Critérios com o máximo de cada um e o que dá a nota máxima; eliminação; desempate; checklist do que vai na proposta |
| 6 | Habilitação | Checklist curto, linha a linha da lista de documentos; quem entrega e em que prazo |
| 7 | Pontos de atenção | Brechas e dependências, cada uma com a premissa crítica (PC1–PC8) e a pergunta de esclarecimento |
| 8 | O que não se aplica a esta modalidade | Agrupado e recolhido (ex.: em parceria, garantia, reajuste e sessão pública) |

## 3. Regras de cada seção

### 3.1 Em uma página
- Objeto: primeira frase da seção cujo título diz "objeto".
- Regime e modalidade: licitação (Lei 14.133 e outras) ou parceria (Lei 13.019: termo de colaboração ou fomento). A modalidade muda o vocabulário de todo o resto.
- Tamanho: quantitativos de equipe, beneficiários, municípios, produtos. **Consolidar**, não listar cada número.
- Situação: datas do certame comparadas com hoje ("o prazo já passou", "faltam N dias").
- Os 3 a 5 pontos que mais pesam saem da seção 7, em ordem de impacto: caixa, dependência do contratante, preço, prazo.

### 3.2 O que a contratada teria de fazer
- Fonte: frases cujo sujeito é a contratada, a OSC ou a parceira, com verbo de obrigação ("deverá", "obriga-se", "compete à", "cabe à", "é responsável por"), e cláusulas "obrigações da contratada/OSC".
- **Agrupar por tema:** equipe (quantidade, proporção, perfil, substituição), equipamentos, rotina de trabalho, sistemas do contratante, relatórios, prestação de contas, gestão financeira, governança, dados pessoais e comunicação.
- Números do mesmo tema viram **uma linha** com faixa ("4 percursos de 20 a 37 visitas"), não um requisito por número.
- Metas e indicadores: ler o quadro de metas coluna por coluna (meta, indicador, fórmula, fonte). Em chamamento sem "produtos", as metas **são** os requisitos.
- Vedações ("é vedado", "não poderá") numa linha própria.
- Os números R continuam, mas cada R é uma obrigação ou entrega, não um número solto do texto.

### 3.3 Prazos
- Duas linhas do tempo: **certame** (datas fixas) e **execução** (meses ou dias contados de um marco).
- Calcular o que o texto dá por regra: "antecedência mínima de N dias da data-limite" vira data.
- Obrigações recorrentes (mensal, trimestral, anual) numa linha cada.
- Marcar "esclarecimentos não suspendem os prazos" quando o texto disser.

### 3.4 Dinheiro
- Teto ou valor estimado; o que é por item, por projeto ou global.
- Cronograma de desembolso ou de medição: parcela, percentual e prazo, numa tabela.
- **A condição de cada pagamento** é o item mais importante: "após aprovação de", "condicionada ao atingimento de", "mediante aceite". Sem prazo, vai também para a seção 7.
- Glosas, retenções, saldo descontado, despesas vedadas, contrapartida e "a seleção não obriga a contratar".

### 3.5 Julgamento e entrega
- Tabela de critérios lida **coluna por coluna**: critério, máximo, o que dá a nota máxima. Nunca uma linha por faixa de pontuação.
- Peso do preço (ou do desconto) destacado, com a regra.
- Causas de eliminação e desempate.
- Checklist do que vai na proposta: conteúdo mínimo exigido, modelos, anexos e declarações, forma e canal de envio.

### 3.6 Habilitação
- Linha a linha da lista de documentos do edital. Em parceria, a lista fica na "fase de celebração" ou na "comprovação das exigências".
- Quem entrega (todos ou só o mais bem classificado) e em que prazo.
- O que a FGV precisa conferir sobre si mesma (enquadramento exigido, tempo de existência, experiência).

### 3.7 Pontos de atenção
Cada ponto tem: o que o texto diz, por que pesa, a premissa crítica (PC1–PC8 do `checklist.md`), a pergunta sugerida e a página. Padrões que o código consegue achar:

| Padrão no texto | Premissa |
|---|---|
| "a ser fornecido pela", "disponibilizado pela", "lista enviada pela" sem prazo | PC1 |
| "sistema do contratante", "de forma exclusiva e obrigatória", metas medidas em sistema de terceiro | PC2 |
| "após aprovação", "validação", "a critério da" sem prazo; pagamento condicionado a aprovação | PC3 |
| prazos contados de marco sem data; contratação progressiva | PC4 |
| contratante público com vigência que cruza outubro de ano eleitoral do nível dele | PC5 |
| resultado que depende de adesão de beneficiários ou de outros órgãos | PC6 |
| equipe de referência, proporções, produtividade mínima, volume estimado pelo contratante | PC7 |
| "entre outros", "demais atividades", alteração só por aditivo, jornada maior que a vigência | PC8 |

Também entram, sem premissa: pressão de preço (peso do desconto, eliminação por valor incompatível), "esclarecimentos não suspendem prazos" e restrições operacionais (ex.: dados pessoais não podem sair do país). E as **proteções** que o texto dá à contratada (prorrogação de ofício se o contratante atrasar o pagamento, justificativas aceitas para meta não cumprida), numa linha no fim.

### 3.8 O que não entra
- **Legislação:** só o regime (a lei e o decreto que regem a contratação) e as normas que definem o trabalho (as citadas no objeto, na metodologia ou com "conforme"). As outras viram uma linha: "outras N normas citadas".
- **Órgãos:** só os que têm papel (contrata, fiscaliza, valida, julga, paga). Citação de passagem, bibliografia e tribunais citados em cláusula padrão ficam de fora.
- **Números soltos** fora de obrigação, meta, prazo ou valor.
- **Linhas de faixa** da tabela de pontuação.
- **Itens de outra modalidade:** em parceria não há sessão pública, planilha de preços, garantia, reajuste nem multa. Isso fica na seção 8, recolhido.
- **A leitura página a página.** Só um aviso se alguma página não pôde ser lida.

## 4. Código × PMO
- **Código:** seções 1 a 6 e 8 quase inteiras, e os padrões da seção 7.
- **PMO (leitura opcional, decisão 0032):** ordenar os pontos de atenção por impacto, cruzar trechos distantes (ex.: jornada de 30 meses dentro de 30 meses de execução; repasse em parcela única num item e proporcional em outro) e achar obrigações escritas em texto corrido.

## 5. Critério de aceite
- O gerente lê a seção 1 e sabe o que é, quanto, quanto tempo, como se ganha e o que mais pesa.
- Cada item passa no teste da seção 1 deste método.
- 30 a 50 itens num edital típico; nenhum item sem página.
- No gabarito da SMPED e num segundo edital, a nova saída cobre as 8 seções e reduz os itens que não passam no teste.
