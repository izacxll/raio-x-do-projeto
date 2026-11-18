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

1. **Testes e gabarito (código).** Os testes automáticos e o gabarito (`tests/pmo/gabarito/`) rodam na CI, sem a API: o gabarito guarda os achados confirmados de cada caso, por etapa, e achado que some deixa o teste vermelho. Trava nova do código entra com a contagem de alarmes falsos e de acertos num caso; se der mais alarme falso que acerto, vira aviso.
2. **Segunda instância, com a rubrica fixa:** a skill `revisao-segunda-instancia` (`.claude/skills/revisao-segunda-instancia/SKILL.md`) diz como montar o pedido isolado, a rubrica, a gravidade, como aplicar os achados e o limite de rodadas.
3. **GP.** Decide o que corrigir e o que seguir.

## Paridade entre o app e o teste externo

O teste externo só vale como calibração se as duas pontas fizerem a mesma coisa. Conferido no código em 18/11/2026 (decisão 0071):

| | App | Teste externo (vigia) |
|---|---|---|
| Chamada separada | sim: `chamarPmo` com o passo "segunda-instancia", sem o histórico do passo conferido | sim: um agente novo por pedido, que lê só o arquivo do pedido |
| O que recebe | a skill recortada da etapa (`sistemaDaSegundaInstancia`), os documentos e o pedido; nunca o raciocínio de quem fez | o mesmo, exportado pelo mesmo código (`montarPedidoDaSegunda`) |
| Rubrica | a do pedido (`pedidoSegundaInstancia`), a mesma da skill `revisao-segunda-instancia` | a mesma (é o mesmo pedido) |
| Identidade do caso | no topo do pedido (decisão 0066) | a mesma |
| Rodada 2 em diante | achados da rodada anterior, o que mudou e as páginas citadas (`pedidoDaRodadaSeguinte`); "conferir a resposta inteira" manda tudo, com os achados anteriores | o mesmo; `--completa` manda tudo |
| Modelo da rodada 2 | o GP escolhe na tela (o da etapa ou o Sonnet, mais barato) | o GP grava "modeloRodada2" nas decisões; o cabeçalho do pedido diz o modelo |
| Rodada 1 só com baixos | a tela sugere seguir com a correção; o GP decide | o vigia segue com a correção, sem rodada 2 (configurável com "rodada2ComBaixos") |
| Etapa 5 | segunda instância leve (decisão 0077): só os vereditos "falso" e "regra_errada" de achados do código, as páginas citadas e todas as premissas críticas que se aplicam; uma rodada, Sonnet por padrão; a revisão volta ao total | o mesmo pedido (`pedidoSegundaEtapa5`), no passo `segunda-leitura`, só quando há o que conferir |

Antes da decisão 0071, o app não mandava ao revisor os achados da rodada 1; no teste externo, eles iam à mão. Agora vão nas duas pontas.

## Protocolo de teste

O teste ponta a ponta passa pelas 5 etapas, com a segunda instância em cada passo e no máximo 2 rodadas por passo; depois, decide o GP (seguir ou mais uma rodada). Os casos ficam fora do Git (`referencias/estudos-externos/`, decisão 0049); no Git, só o que é público ou disfarçado (gabarito, testes, decisões).
