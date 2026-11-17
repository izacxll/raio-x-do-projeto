# 0036 — Etapa 1 pelo método (fase M1)

- **Data:** 16/11/2026
- **Status:** aceita (a estrutura da tela e dos exportados foi mostrada à responsável antes do commit; os requisitos R, conferidos com ela)
- **Quem decidiu:** Claude Code, em nome da responsável, dentro das decisões 0034 e 0035

## Contexto

A fase M1 aplica o método da etapa 1 (`docs/estudos/metodo-etapa-1.md`) com o desenho da decisão 0035: o PMO lê, o código monta o esqueleto e confere. Este registro guarda as escolhas de implementação que não estão no método.

## Decisão

1. **Leitura em 8 seções**, na tela e na "Análise da RFP" (DOCX e PDF), na ordem do método. As extrações antigas continuam (as etapas 2 a 5 usam os itens pelo id); a leitura é uma camada por cima (`src/etapas/1-rfp/leitura.ts`). O que não passa no teste do método fica fora e só aparece contado ("fora da leitura"): seções do mapa, normas além do regime, órgãos sem papel, faixas da pontuação.
2. **Regras novas do esqueleto** (sprint da decisão 0032, já para servir à leitura do PMO):
   - cláusulas numeradas com a seção do mapa e a marca de certame ou execução (`clausulas.ts`);
   - obrigações de quem executa, agrupadas por tema, com as vedações à parte e os subitens das listas "os seguintes documentos:" (`obrigacoes.ts`);
   - dinheiro: cronograma de desembolso com a soma conferida, parcela única, condição de cada pagamento (com ou sem prazo do contratante), glosa, contrapartida, despesas vedadas, "não obriga a contratar" (`dinheiro.ts`);
   - habilitação linha a linha da lista do edital e quem entrega (`documentacao.ts`);
   - pontos de atenção pelos padrões da tabela do método, cada um com a premissa crítica (PC1 a PC8), o motivo e a pergunta, um por padrão; proteções numa linha só (`premissas-rfp.ts`);
   - contas do código: situação das datas × hoje e caixa concentrado nas últimas parcelas.
3. **Requisitos R = entregas e obrigações específicas de quem executa:**
   - entram: produtos, equipe, local, condições do objeto e as obrigações com entrega concreta, prazo ou periodicidade (gratuidade, entrega final do conteúdo, divulgação, prestação de contas…);
   - saem: quantos projetos o chamamento seleciona, o limite por proponente e o prazo de execução (vão para as seções 1 e 3), e as obrigações genéricas ("observar a legislação", "executar satisfatoriamente o objeto"), que ficam no cartão do tema;
   - o que o código não pega, a leitura do PMO sugere; o item do PMO na seção 2 tem o botão "Incluir como requisito", e o número só nasce com o clique do GP (decisão 0032);
   - por ora, as etapas 2 a 4 recebem só as entregas: as obrigações vão à parte no ponto de partida, e as fases M2 a M4 as levam à proposta, ao TAP e ao plano. Na etapa 5, a obrigação fica "conferir no plano" até a M5.
4. **Leitura do PMO** (`leitura-pmo.ts`, schema `leitura-rfp.ts`): o pedido leva o método e o esqueleto; as travas conferem citação, número (contra o trecho, a página citada, o esqueleto e a data de hoje) e número R. A conta do código vale mais que a do PMO (o item do PMO com o mesmo assunto de uma conta do código sai). Item do PMO travado nunca aparece como "Do documento".
5. **Gabaritos e leitura gravada:** os gabaritos da SMPED e da OEI na estrutura do método (`tests/fixtures/gerados/rfp-smped/` e `rfp-oei/`, feitos pelo Claude Code seguindo a skill PMO, com todas as citações conferidas; não são uma leitura independente) e as leituras gravadas derivadas deles (`leitura-pmo.json`). A da OEI serve à demonstração, que agora também abre na etapa 1.
6. **Contagem da meta de 30 a 50:** conta os cartões; os requisitos R são linhas de uma tabela da seção 2 e aparecem em separado no placar.

7. **Ajustes da revisão independente** (19 achados, antes do PR):
   - **Todo item do PMO é Sugestão**, inclusive o que ele marcar como "decisão do GP"; a citação achada pelo código aparece como "citação conferida".
   - **Travas mais duras:** o número vale só no trecho conferido, na cláusula em volta dele ou no esqueleto da mesma seção; contagens também pedem fonte; trava nova "conta feita pelo PMO" (soma, acumulado, "sobram").
   - **Item do PMO que repete uma conta do código** vai para os recolhidos, nunca some.
   - **Cláusulas:**
     - o parágrafo fecha no ponto final;
     - o trecho mostrado é a frase em volta do que casou;
     - páginas de modelo (declaração, ficha, "(Nome do…)") ficam de fora;
     - certame reconhecido também pelo conteúdo (licitante, proposta, homologação);
     - cláusula que atravessa a página é juntada.
   - **Regras:**
     - a lista de obrigações acaba nas sanções;
     - parcela única só com repasse;
     - "não obriga" só sobre a contratação;
     - sem retenção de tributo como condição de pagamento;
     - sem devolução de garantia como glosa;
     - a PC1 da brecha não vale quando quem fornece é a contratada;
     - um ponto por premissa crítica;
     - sem "justificativa suficiente" solta nas proteções;
     - "ata" só como ata de eleição ou assembleia;
     - cláusulas-padrão (sigilo, reserva de cargos, assédio) não viram R;
     - nomes dos órgãos dos gabaritos tirados das regras.
   - **Tela:**
     - pedir de novo mostra o custo;
     - revisar um item não reconfere tudo;
     - aviso para dossiê revisado numa versão anterior;
     - o R incluído a partir do PMO guarda a página e o trecho conferidos, como obrigação;
     - a etapa 2 mostra as obrigações à parte;
     - seção 2 sem obrigação específica diz "não localizado pelo código".

## Consequências

- Placar em `docs/estudos/placar-m1-etapa-1.md`.
- A qualidade da leitura do PMO de verdade só se mede com a chave (decisão 0035): a leitura gravada vem do gabarito.
