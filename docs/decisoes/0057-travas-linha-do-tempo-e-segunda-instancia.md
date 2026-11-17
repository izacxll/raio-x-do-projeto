# 0057 — Travas do teste externo, linha do tempo e segunda instância

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), a partir do teste externo pelas etapas 1 a 4 (itens 10, 12 e 13)

## Contexto

O teste externo mostrou erros de raciocínio que o app deixou passar sem aviso:
- o cronograma fechava sem contar a análise do cliente, e um marco fixo deixava de caber;
- havia reentrega sem nova análise;
- atividade de campo saía sem horas;
- perfil exigido como mínimo era tratado como critério pontuado;
- item "do documento" vinha com trecho que não provava a frase.

A skill 0.3.2 escreveu as regras (decisão 0056), mas o código não as conferia. Faltava também ligar a regra 19 da skill: cada etapa conferida por uma segunda instância antes da próxima.

Uma data de portaria do signatário ("Portaria nº 12 de março de 2026") ainda podia ser lida como situação ou prazo.

## Decisão

1. **Travas novas no código** (item 10):
   - **EAP:**
     - atividade presa a data fixa cujas predecessoras terminam depois do início do marco, contando a aprovação do cliente quando o GP informou o tempo dela, é marcada "não cabe antes do marco" e vira divergência do TAP;
     - sem o tempo de aprovação, a conta avisa que está sem ele.
   - **EAP:** atividade de ajuste depois da análise do contratante, sem nova análise depois, recebe o aviso "reentrega sem nova conferência".
   - **EAP:** atividade de campo ou de produto com 0 hora para todos os perfis recebe o aviso "esforço não estimado". Hora em branco (null) é decisão do GP, não zero.
   - **EAP:** atividade "antes da assinatura" com predecessora posterior à assinatura recebe um aviso.
   - **TAP:** marco "antes de [data]" ou "dentro da vigência" que a conta do cronograma não confirma é divergência obrigatória. Se o TAP já a registrou, fica como registrada.
   - **Estratégia e matriz:** só é critério pontuado o perfil cujo trecho diz "pontuação" ou "pontos"; o resto é perfil mínimo.
   - **Etapas 1 a 4:**
     - item "documento" cujo trecho conferido não traz o termo-chave do item recebe o aviso "citação não prova";
     - termo-chave é o número com unidade, a data, a periodicidade pelo radical ("trimestral", "trimestrais") ou o que está entre aspas;
     - sem nenhum deles, vale uma palavra longa do item;
     - na etapa 1, o número trocado continua como "valor não conferido".
2. **O app segue o raciocínio da skill 0.3.2** (item 12):
   - **Etapa refeita sem a resposta anterior:**
     - o pedido e o esqueleto de um passo refeito saem sem a resposta anterior dele e sem as dos passos seguintes, na proposta e no PGP;
     - no teste externo, importar um passo descarta os passos seguintes da mesma etapa.
   - **Linha do tempo:**
     - os pedidos da EAP, do TAP e do cronograma levam a linha do tempo do código: início, cada entrega com e sem a análise do cliente, marcos fixos e fim da vigência, com a conta de cada marco;
     - a resposta traz `conferenciaDosMarcos` (cada marco: cabe ou não cabe, e o motivo);
     - o código confere contra a conta dele, e vale a conta do código.
   - **Segunda instância:**
     - depois de cada resposta, uma chamada separada ao Claude, com só a SKILL.md, os documentos e a resposta, devolve achados de quatro tipos: erro de fato, o que faltou, incoerência entre etapas e rótulo errado. Cada achado tem gravidade (alta, média ou baixa), onde está, evidência e sugestão;
     - o código confere as evidências;
     - o GP vê o resultado antes de aprovar, e a tela avisa enquanto a resposta não foi conferida. A chamada é um botão, com o custo estimado antes; nunca é automática;
     - no teste externo, o passo é `segunda-<passo>`, e a importação grava `conferencia-*.md`;
     - o vigia para (PARADO.md) se houver achado de gravidade alta;
     - esta é a ligação da regra 19 da skill.
3. **Data de ato ou de assinatura** (item 13):
   - data de portaria, decreto, lei, carimbo de assinatura ou fecho do documento não é situação, prazo nem marco;
   - a regra vale nas datas do certame, no evento com data fixa (CE15), nos períodos fixos e no início fixo (X2).

## Consequências

- `conferenciaDosMarcos` entra com `[]` nas respostas antigas. A tela avisa quando o PMO não devolveu a conferência.
- A leitura gravada do PGP da OEI tem um item (B31) que a trava "citação não prova" pega: o trecho fala das reuniões, não de quem valida os produtos. O teste registra isso.
- A skill não muda nesta decisão. A regra 19 já diz que, no app, o GP revisa antes da etapa seguinte. Se a responsável quiser, a próxima versão da skill pode citar a chamada da segunda instância.
- O teste externo recomeça do zero, com a skill 0.3.2: as respostas antigas das etapas 1 a 3 ficam guardadas numa subpasta "rodada-2", fora do Git.
