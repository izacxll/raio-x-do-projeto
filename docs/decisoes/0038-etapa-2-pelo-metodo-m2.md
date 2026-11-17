# 0038 — Etapa 2 pelo método (fase M2)

- **Data:** 16/11/2026
- **Status:** aceita (escolhas de implementação dentro das decisões 0034, 0035 e 0037; a responsável confere no teste da fase)
- **Quem decidiu:** Claude Code, em nome da responsável

## Contexto

A fase M2 aplica o método da etapa 2 (`docs/estudos/metodo-etapa-2.md`, revisado em 16/11/2026) e o rastro de `docs/estudos/engenharia-reversa/07-regras-etapa-2.md`. A saída é a minuta redigida por inteiro, e não um resumo. O PMO redige; o código monta o esqueleto e confere.

## Decisão

1. **Tipo de contrato e de projeto como entrada** (decisão 0034). O código sugere o tipo pelo que a etapa 1 leu, e o GP confirma na tela; o tipo fica no dossiê:
   - licitação ou parceria;
   - produtos com número R pagos por entrega → consultoria por produtos;
   - parceria sem produtos, ou dois sinais de operação (turmas, atendimentos, equipe de campo, valor mensal) → operação contínua;
   - os dois → híbrido.
2. **A saída tem duas partes** (`src/etapas/2-proposta/minuta.ts`, na tela e na proposta técnica exportada):
   - **as 9 seções do método:** capa, estratégia, estrutura, escopo, premissas críticas, metas/equipe/cronograma, preço, matriz e checklist, decisões do GP;
   - **a minuta redigida**, na ordem do modelo do edital.
3. **O modelo do edital é lido por código** (`src/extracao/rfp/modelo-proposta.ts`):
   - os quadros do modelo obrigatório ("QUADRO 08 – …");
   - ou a lista de partes ("organizada na seguinte estrutura: a) …").
   O PMO devolve uma seção por parte do modelo, com o código dela. O código põe tudo na ordem e confere:
   - seção sem texto é **não redigida**;
   - seção que só descreve ("nesta seção, apresentar…") é **só descrita**.
   As duas viram alerta: o critério de aceite do método é "não há seção só descrita".
4. **Contas e conferências novas do código:**
   - **onde estão os pontos:** critérios de texto × de documento; os de documento viram a pergunta "a FGV tem?", que é decisão do GP;
   - **regra do preço:**
     - índice menor preço ÷ preço, com os pesos;
     - pontos por desconto;
     - menor preço;
     - sem preço, com os critérios que pesam o custo.
   - **tabela de pontos por preço:** no índice, em cenários da menor proposta, com a equivalência "1% de preço ≈ N pontos técnicos";
   - **quadro de equipe × produtividade** (`src/regras/produtividade.ts`): volume ÷ pessoas ÷ (meses × 21 dias úteis) contra o teto ou a média escritos no documento. Sem teto escrito, a conta sai "não conferida" e a régua é do GP. Vale para as etapas 2 a 5;
   - **duração × vigência** (`src/regras/vigencia.ts`): a soma dos meses das fases contra a vigência;
   - **caixa pelo acumulado** (`src/regras/caixa.ts`): as parcelas do edital × a curva de custo. Dá a folga de cada parcela até a véspera da seguinte, o ponto mais apertado e o primeiro mês negativo. A curva de custo vem, nesta ordem:
     1. da folha com os valores do GP;
     2. da rampa de pessoas do quadro (aproximação, dita na tela);
     3. de custo igual em todos os meses.
     Parcela sem prazo no edital fica fora da conta até o GP dar o mês.
   - **premissa crítica que se aplica e a minuta não escreve:** alerta.
5. **Preço pelo tipo de contrato:**
   - consultoria por produtos: horas × valor-hora, como antes;
   - operação contínua e parceria: a folha mês a mês (quadro do PMO × custo mensal de cada função, que é decisão do GP) mais as despesas por natureza, sem valor-hora e sem horas na EAP; custos indiretos só como despesa, com memória de cálculo, e taxa de administração conferida no edital e na norma local (decisão 0040). A planilha de preço exportada segue o tipo.
   A minuta usa o cronograma de parcelas do edital; mudar é decisão do GP, dita e justificada.
6. **Schemas do PMO** (campos novos, todos obrigatórios na API; dossiês e gravações antigas abrem com os campos vazios):
   - abordagem: `mudaOResultado`, `riscoPrincipal`;
   - conteúdo: `metodologia` (fases com meses), `metas`, `limitesVolume`, `riscos` (gatilho, dono, resposta, PC); premissa com `dependeDe`, `ateQuando` e `reajuste`;
   - EAP: `quadroEquipe` (função, quantidade, faixa de meses) e `volumes` (volume previsto, unidade, função que executa, fonte).
7. **Pedidos ao PMO:** cada pedido leva o esqueleto do código (o tipo, o modelo do edital na ordem, os pontos, o preço, as contas) e o teste de cada item do método. Na operação contínua, o pedido da EAP pede o quadro e os volumes, e não horas.
8. **Gabaritos e leituras gravadas** da SMPED e da OEI (`tests/fixtures/gerados/proposta-smped/` e `proposta-oei/`): foram feitos pelo Claude Code seguindo a skill, e não são uma leitura independente.
   - A OEI troca a gravação da demonstração.
   - A gravação antiga fica em `proposta-oei/antes-m2/`, para o placar "antes".

9. **Ajustes da revisão independente** (antes do PR):
   - **a revisão do GP vale na minuta e no anexo exportado:** item descartado sai, editado vale o texto dele, e o que falta revisar aparece "pendente";
   - **metas, limites de volume e riscos** entram na revisão do GP e na conta das pendências;
   - **"Do documento" só com a citação conferida** pelo código; o resto do PMO é Sugestão, e o exportado leva "citação não conferida" e "valor não conferido";
   - **contas do código** (folha, pontos por preço) e premissa sem trecho da etapa 1 saem como Sugestão, não como fato do documento;
   - **produtividade:**
     - só unidades de atividade de quem executa (visitas, atendimentos…), e não metas do programa ("até 200 famílias por mês");
     - nunca contra o teto de outra unidade;
     - pessoas médias no período (pessoas-mês ÷ meses);
   - **índice de preço:** a escala vem da fórmula do edital ("IP × 3"); sem ela, sai em % da nota de preço;
   - **modelo do edital:** "obrigatório" só quando o edital diz ("em conformidade com o modelo", "modelo do Anexo");
   - **campos do GP:**
     - o custo apagado sai do dossiê (antes, impedia salvar);
     - o mês da parcela fica na tela depois de preenchido;
     - "4500.00" é lido como decimal;
   - **nota mínima** só com "pontos" depois do número; "R$ 1,5 milhão" não é lido como R$ 1,50.

## Consequências

- Placar em `docs/estudos/placar-m2-etapa-2.md`, com 10 itens para a responsável conferir antes do merge.
- A skill PMO 0.3.0 (PR próprio) leva à skill a ficha da proposta de parceria e o caso de operação contínua em `prop-preco`. Até ela, as instruções novas vão nos pedidos.
- A etapa 3 (fase M3) passa a receber o tipo confirmado e a minuta na estrutura nova.
