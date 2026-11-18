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

No Raio-X, a régua é o pedido do passo, nem mais nem menos: item do método ou das fichas que o pedido não pediu não é falta (decisão 0059).

1. **Erro de fato:** afirmação que o documento não diz; número ou data sem fonte; trecho que não prova o item; rótulo "documento" em leitura ambígua.
2. **O que faltou:** obrigação, prazo, dependência do contratante ou de terceiros, conflito entre trechos distantes, premissa crítica não tratada, origem e período dos dados.
3. **Coerência entre etapas e com a conta do código:** o que a etapa anterior apontou chegou aqui? Marco que não cabe? Texto que diz "em sequência" e rede em paralelo?
4. **Rótulo e premissa errados;** decisão do GP preenchida como fato; nome de pessoa.
5. **Gravidade:** alta só se muda escopo, prazo, preço, caixa, aceite ou quem executa; média; baixa.

Saída em JSON: `{achados:[{id,tipo,gravidade,onde,texto,evidencias,sugestao}], conferido:[...]}`. No Raio-X, `tipo` é `erro_de_fato`, `faltou`, `incoerencia_entre_etapas` ou `rotulo_errado` (itens 1 a 4), como no schema do app (`src/pmo/schemas/segunda-instancia.ts`). Cada achado com evidência (página + trecho literal, ou id do item). "conferido" lista o que está certo. Sem elogio.

## 3. Lançar o agente

- Um agente por saída, em segundo plano. O prompt traz: papel (revisor independente), onde está o pedido, a rubrica resumida, as regras (não inventar números, não citar nomes de pessoas, gravidade alta só quando muda escopo, prazo, preço, caixa, aceite ou quem executa) e o caminho exato do JSON de saída, com o comando de validação.
- Peça para conferir no placar ou na conta do código antes de afirmar algo sobre ela.
- Enquanto roda, siga com outro trabalho; não preveja o resultado.

## 4. Aplicar os achados (com checagem)

- Antes de corrigir, confira cada achado sobre números ou contas na fonte (placar, caminho crítico, página). O revisor é o mesmo modelo e também erra: achado errado não vira correção.
- Corrija na mesma etapa, numa versão nova (nome de arquivo novo), com as citações reverificadas por script.
- Registre cada achado útil como lição (regra geral, sem dados do caso) e cada falso alarme na contagem da regra.

## 5. Limite de rodadas

- Rodada 1 → corrigir → rodada 2. Depois da rodada 2, quem decide é o GP: seguir (corrige e passa) ou mais uma rodada.
- Achado alto não segue sem correção ou sem "seguir" explícito do GP.
- No Raio-X, o vigia aplica este limite (decisões 0059 e 0060): achado médio também espera "corrigir" ou "seguir".

## 6. Confidencialidade

- O pedido e as respostas com conteúdo de documento ficam fora do Git. Lição que vai para skill ou código é escrita com exemplo disfarçado.
