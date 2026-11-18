---
name: revisao-segunda-instancia
description: Conferir uma saída de etapa (do Raio-X ou de outro trabalho) com um agente separado que não viu o raciocínio, por rubrica fixa, e aplicar os achados com checagem.
---

# Revisão por segunda instância

Revisão em camadas, do mais barato ao mais caro: teste (código ou gabarito) → rubrica + segundo agente → GP (humano). Cada camada recebe só o que a anterior deixou passar. Esta skill cuida da camada do meio. As camadas e os papéis estão em `docs/papeis.md`.

## 1. Montar o pedido isolado

- O revisor recebe só: o documento-fonte (com páginas), as decisões já tomadas, a saída a conferir, o esqueleto do código (números R e C, contas) e a rubrica. Nunca o raciocínio de quem fez nem conversas anteriores.
- No Raio-X, o pedido já vem pronto do vigia (`etapa-N-segunda-<passo>-*.md`, na pasta `pedidos/` do caso, fora do Git): use-o, não escreva outro. No app, a chamada da segunda instância monta o mesmo pedido (`src/pmo/segunda-instancia.ts`).
- Diga a rodada (1, 2, 3…) e, a partir da 2, peça para não repetir o que já está tratado de forma razoável nem abrir questão de estilo.

## 2. Rubrica (fixa)

No Raio-X, a régua é o pedido do passo, nem mais nem menos: item do método ou das fichas que o pedido não pediu não é falta (decisão 0059). Vale também para os números: R e C só os da lista que o pedido traz. Um R fora dela (descartado ou inexistente) não é cobrado como falta nem como erro de número: na resposta, ele vira restrição ou observação. Erro que evita: dois revisores do mesmo passo divergirem sobre o mesmo R.

1. **Erro de fato:** afirmação que o documento não diz; número ou data sem fonte; trecho que não prova o item; rótulo "documento" em leitura ambígua.
2. **O que faltou:** obrigação, prazo, dependência do contratante ou de terceiros, conflito entre trechos distantes, premissa crítica não tratada, origem e período dos dados.
3. **Coerência entre etapas e com a conta do código:** o que a etapa anterior apontou chegou aqui? Marco que não cabe? Texto que diz "em sequência" e rede em paralelo?
4. **Rótulo e premissa errados;** decisão do GP preenchida como fato; nome de pessoa.
5. **Gravidade:** alta só se muda escopo, prazo, preço, caixa, aceite ou quem executa; média; baixa.

Saída em JSON: `{achados:[{id,tipo,gravidade,onde,texto,evidencias,sugestao}], conferido:[...]}`. No Raio-X, `tipo` é `erro_de_fato`, `faltou`, `incoerencia_entre_etapas` ou `rotulo_errado` (itens 1 a 4), como no schema do app (`src/pmo/schemas/segunda-instancia.ts`). Cada achado com evidência (página + trecho literal, ou id do item). "conferido" lista o que está certo. Sem elogio.

## 3. Lançar o agente

- Um agente por saída, em segundo plano. O prompt traz: papel (revisor independente), onde está o pedido, a rubrica resumida, as regras (não inventar números, não citar nomes de pessoas, gravidade alta só quando muda escopo, prazo, preço, caixa, aceite ou quem executa) e o caminho exato do JSON de saída, com o comando de validação.
- **Diga o caso certo e prenda o revisor a ele.** O prompt diz o caso pelo nome, manda ler só o arquivo do pedido (caminho exato), sem abrir pastas de outros casos, e dá dois ou três termos que a resposta certa deve conter (tirados do documento do caso). Se o conteúdo for de outro caso, o revisor para e avisa, sem gravar achados. No Raio-X, o topo do pedido da segunda instância já traz a identidade do caso (arquivos, objeto com página e termos): use esses termos. Erro que evita: com vários casos lado a lado, o revisor ler o pedido de outro TR e trazer achados que não são deste.
- **Revisores em paralelo, cada um na sua pasta.** Com mais de um revisor ao mesmo tempo, cada um grava os arquivos temporários numa pasta de trabalho própria, com o nome do caso, nunca numa pasta comum. Só o JSON de saída vai para o caminho exato do caso. Erro que evita: um revisor sobrescrever o arquivo temporário do outro e entregar a revisão de outro caso.
- Peça para conferir no placar ou na conta do código antes de afirmar algo sobre ela.
- Enquanto roda, siga com outro trabalho; não preveja o resultado.

## 4. Aplicar os achados (com checagem)

- **Antes de tudo, confira se os achados falam do caso certo:** os termos dados no prompt aparecem e as páginas citadas existem no documento do caso. Revisão de outro caso é descartada inteira e refeita; nenhum achado dela é aproveitado. Erro que evita: corrigir um caso com achados de outro TR.
- Antes de corrigir, confira cada achado sobre números ou contas na fonte (placar, caminho crítico, página). O revisor é o mesmo modelo e também erra: achado errado não vira correção.
- Corrija na mesma etapa, numa versão nova (nome de arquivo novo), com as citações reverificadas por script.
- Registre cada achado útil como lição (regra geral, sem dados do caso) e cada falso alarme na contagem da regra.

## 5. Limite de rodadas

- Rodada 1 → corrigir → rodada 2. Depois da rodada 2, quem decide é o GP: seguir (corrige e passa) ou mais uma rodada.
- Achado alto não segue sem correção ou sem "seguir" explícito do GP.
- No Raio-X, o vigia aplica este limite (decisões 0059 e 0060): achado médio também espera "corrigir" ou "seguir".

## 6. Confidencialidade

- O pedido e as respostas com conteúdo de documento ficam fora do Git. Lição que vai para skill ou código é escrita com exemplo disfarçado.
