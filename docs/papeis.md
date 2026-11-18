# Papéis e revisão em camadas

## North star

**O GP decide rápido e com segurança se a FGV participa e como executa, a partir do documento.** Tudo o que o app faz serve a essa decisão: o que não muda uma decisão do GP, nem algo que a FGV terá de fazer, entregar, cumprir ou pagar, não entra.

## Quem faz o quê

| Papel | Faz | Não faz |
|---|---|---|
| **PMO** (a API do Claude, com a skill `.claude/skills/pmo/`) | **Sugere:** lê os documentos, redige cada etapa na estrutura do método, aponta o que pesa e por quê | Não calcula, não decide, não afirma o que o documento não diz |
| **Código** (`src/`) | **Lê, confere e calcula:** texto por página, números, datas, contas, citações; monta o esqueleto que vai no pedido; confere cada citação, número e prazo que o PMO devolve | Não interpreta o que depende de leitura |
| **Segunda instância** (outra chamada do PMO, com a rubrica fixa) | **Revisa** a resposta do passo contra os documentos, o esqueleto e o que o pedido exige | Não recebe o raciocínio de quem fez; não reescreve a resposta |
| **GP** | **Decide:** aceita, edita ou descarta cada item; escolhe a abordagem; preenche o que só ele preenche; decide seguir ou mais uma rodada | — |

## Revisão em camadas

Cada passo passa por três camadas, nesta ordem. Cada camada só recebe o que a anterior deixou passar.

1. **Testes e gabarito (código).** Os testes automáticos e o gabarito (`tests/pmo/gabarito/`) rodam na CI, sem a API: o gabarito guarda os achados confirmados de cada caso, por etapa, e achado que some deixa o teste vermelho.
2. **Segunda instância, com a rubrica fixa** (SKILL.md, seção 3, "Revisão em camadas"): erro de fato; o que faltou; incoerência entre etapas e com a conta do código; rótulo ou premissa errados. Gravidade alta só quando muda escopo, prazo, preço, caixa, aceite ou quem executa.
3. **GP.** Decide o que corrigir e o que seguir.

**Limites:**

- **O revisor erra.** A segunda instância é o mesmo modelo. Achado dela sobre número ou conta é conferido no placar do código antes de virar correção.
- **No máximo 2 rodadas por passo.** Depois, o GP decide: seguir ou mais uma rodada. Achado médio também espera a decisão (decisões 0059 e 0060).
- **Trava nova conta os alarmes falsos.** Ela entra com a contagem de alarmes falsos e de acertos num caso; se der mais alarme falso que acerto, vira aviso.

## Protocolo de teste

O teste ponta a ponta passa pelas 5 etapas, com a segunda instância em cada passo e no máximo 2 rodadas por passo; depois, decide o GP (seguir ou mais uma rodada). Os casos ficam fora do Git (`referencias/estudos-externos/`, decisão 0049); no Git, só o que é público ou disfarçado (gabarito, testes, decisões).
