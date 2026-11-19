# Etapa 3 — Termo de Abertura (TAP)

## Papel
O TAP parte do que foi **assinado**, não do que o edital pedia nem do que a etapa 2 sugeriu. Teste de cada item: "isto está assinado, ou é algo que o GP precisa decidir ou validar antes de começar?" O TAP cabe em duas páginas, mais o registro de premissas.

## Entradas
- O contrato ou termo assinado (opcional; quando existe, prevalece).
- A proposta final da FGV (PDF ou a da etapa 2 no dossiê) e a RFP.
- O dossiê das etapas 1 e 2: pontos de atenção, números R, compromissos C, premissas críticas, linha do tempo.
- As divergências e a conferência do TAP montadas pelo código.

## Saída
1. **Entradas e precedência** (ficha `tap`, bloco TAP-DV):
   - **contrato ou termo assinado** (entrada opcional): prevalece sobre a proposta e a RFP. Se ele torna a proposta ou o plano de trabalho "parte integrante", a proposta também vale como compromisso;
   - **proposta final da FGV:** o que a FGV prometeu (produtos, equipe, cronograma, preço e parcelas, premissas escritas);
   - **RFP:** o que o contratante exigiu; serve para achar divergências;
   - **dossiê das etapas 1 e 2:** pontos de atenção, premissas críticas e números R.
2. **Divergências primeiro**, porque o resto do TAP depende de qual versão vale:
   - **por código** (já vem pronto): valor (proposta × teto × contrato); parcelas ou medições (ordem, percentual, prazo); contagem dos meses (o mês 1 da proposta é o mês 1 da vigência? a soma dos períodos do cronograma cabe na vigência?); equipe (quantidade e **regra**: mínimo, referência ou limite); dimensionamento × produtividade; produtos que a proposta acrescentou;
   - **por você** (Sugestão): **frase de conformidade** da proposta ("em conformidade com o item X") que não confere com o item X; cláusulas de proteção da proposta × cláusulas do contrato; quem aprova e em que prazo; critério de conclusão da proposta × término do contrato; orçamento que parece não cobrir uma obrigação.

   Cada divergência tem uma linha: o ponto, o que diz cada documento (com página), a versão sugerida e o que fazer (confirmar por escrito, levar à reunião de abertura, consultar o jurídico). **Produto que a proposta acrescentou e a RFP não pedia é compromisso da proposta** (assinado quando há contrato; prometido enquanto não há): entra como entrega-chave, com critério de aceite.

   **Divergência que muda escopo, custo ou quem executa** (formato do produto, quem faz o campo, fonte dos dados) não se resolve no TAP (TAP-DV.7): o contrato prevalece; se ele não responde, o TAP adota a versão que **mais obriga a FGV** (em geral a RFP, quando a proposta estreitou; a proposta, quando acrescentou), marca a divergência como pendente com o contratante e só troca de versão com a resposta por escrito. Antes de abrir a divergência, confira se a própria RFP já responde (ex.: "levantados pela equipe da contratada").

   Texto de outro projeto copiado no TR (cláusula de outro objeto, de outra modalidade ou de outro contratante) não é "a versão que mais obriga": é conflito e vira pergunta ao contratante (TAP-DV.7, 0.3.2).
3. **Os 12 elementos** (ficha `tap`):
   - objetivos mensuráveis, cada um com seu critério de sucesso; use as metas e indicadores do contrato; se não houver métrica, a métrica é sugestão;
   - requisitos de alto nível ligados aos números R;
   - limites, incluindo as exclusões da proposta, as vedações da RFP e o que é do contratante;
   - risco geral, num parágrafo, resumido das brechas, das divergências e das premissas críticas que se aplicam;
   - marcos tirados do cronograma da proposta, **dentro** da vigência (se não couber, é divergência);
   - antes de fechar os marcos, a linha do tempo da seção 3 (TAP6.4); aceite em análise → ajuste → nova análise → termo definitivo (TAP9.5); abordagem que reduz o que um R pede e pergunta de preço que não foi feita no esclarecimento viram divergência (TAP-DV.8 e TAP-DV.9);
   - partes interessadas-chave;
   - requisitos de aprovação e critérios de término, ligados às cláusulas de aceite, prestação de contas e rescisão do contrato;
   - GP designado, patrocinador e recursos pré-aprovados: só redação sugerida, como `decisao_gp`.
4. **Premissas** (bloco `TAP-PR` da ficha `tap` e ficha `b03`): primeiro as premissas que a proposta **já escreveu** (dimensionamento, ritmo, produtividade), como `documento`; depois cada premissa crítica que se aplica e a proposta **não escreveu**, como `sugestao`, com a consequência (TAP-PR.2); depois as restrições do contrato. Cada linha diz quem valida (`decisao_gp`, com sugestão: o contratante valida as que dependem dele). Esse registro é a entrada do B3 da etapa 4.
5. **Compromissos e critérios que cabem:** cada compromisso C da proposta recebe destino no TAP (premissa, limite, entrega-chave ou divergência). Critério de sucesso preso a data (ex.: "metodologia aprovada antes do evento") só entra se couber no cronograma: o código confere contra a janela até o marco; se não couber, é divergência.
- **Formato dos compromissos:** `"compromissos": [{ "codigo": "C01", "tipo": "premissa" | "exclusao" | "obrigacao_contratante" | "metodo", "texto": "...", "destino": "TAP-PR | TAP4.3 | A5.12 ..." }]`. (quando o schema do passo pede)

## Definição de pronto
Critério de aceite do método (`docs/estudos/metodo-etapa-3.md`, que prevalece):
- O gerente lê as divergências e sabe o que decidir antes de começar.
- Todo número do TAP bate com o contrato; nenhum nome ou número inventado.
- Toda entrega-chave tem aceite; todo marco cabe na vigência (o vencimento das datas à parte).
- Toda premissa crítica aplicável está no registro, com quem valida; todo compromisso C tem destino no TAP.
- **Antes de sair:** a autoconferência dos itens da ficha `tap` (princípio 13).

## Armadilhas
Marca de cada lição (decisão 0094): **[geral]** vale para qualquer projeto (lei, método, conta ou dois casos ou mais); **[geral, visto num caso]** decorre da lei ou da conta, mas até agora apareceu num caso só; **[um caso]** nasceu de um caso e vale quando a mesma condição aparece de novo, nunca como regra para todo projeto.
- [geral] **Documento antigo:** a primeira pergunta é se o contrato já foi assinado ou divulgado; se foi, ele vira a entrada do TAP. Erro que evita: o TAP foi montado sobre um TR do ano anterior quando o extrato do contrato já estava publicado.
- [geral] **Divergência que muda escopo, custo ou quem executa:** vale a versão que mais obriga a contratada (normalmente o documento do contratante) até a resposta escrita. **O que a proposta pediu é pedido, não versão adotada:** aceite, cessão, rodadas, limites de volume, fonte de dados, "avaliado só por documento". Erro que evita: o TAP adotou como regra o número de rodadas de ajuste que a proposta só tinha pedido.
- [geral] **Proposta com duas durações** (soma das fases × EAP) e documento sem vigência: é divergência, porque não há régua assinada. Erro que evita: o TAP disse "cabe na vigência" medindo contra uma duração que só a proposta escrevia, e de dois jeitos.
- [geral, visto num caso] **"Cabe na vigência" não basta:** o produto que define o método (cotas, critério de válido) é aprovado antes do marco que o usa. Erro que evita: a metodologia só seria aprovada depois de o campo começar.
- [geral, visto num caso] **A conferência dos marcos separa a conta do código do vencimento das datas:** "não cabe pela conta" e "a data do documento já passou" são achados diferentes. Erro que evita: um marco saiu "não cabe" só porque a data impressa no TR estava vencida.
- [geral] **"Responsável pela fiscalização" sem dizer quem** vira pergunta. Erro que evita: o aceite ficou sem dono no TAP.
- [geral] **Término:** diga se o último pagamento cabe na vigência; o encerramento inclui a devolução dos dados do contratante e a guarda ou o descarte dos microdados. Erro que evita: o termo definitivo do último produto caía depois do fim da vigência, e o TAP não disse.
- [geral] **Compromisso da proposta é "prometido", não "assinado",** enquanto não há contrato. Erro que evita: o TAP chamou de "assinado" o que só a proposta dizia.
- [geral] **`decisao_gp` na autoconferência sempre com motivo** (sem motivo, a marca conta como incompleta). Erro que evita: marcas sem motivo contaram como incompletas e reprovaram a autoconferência.

## Rubrica da segunda instância
Além da rubrica geral, nesta etapa o revisor confere:
- a precedência (contrato, proposta, RFP) e, na divergência que muda escopo, custo ou quem executa, a versão que mais obriga até a resposta escrita;
- os números do TAP contra o contrato e a proposta; o compromisso só da proposta como "prometido";
- os marcos pela conta do código, com o vencimento das datas separado do "não cabe";
- cada C com destino, cada premissa com quem valida, e nenhuma decisão do GP preenchida como fato.
