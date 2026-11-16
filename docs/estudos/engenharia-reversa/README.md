# Engenharia reversa das análises das etapas 1 a 5

Este conjunto descreve, **como foi feito**, o caminho que levou das entradas (edital, proposta, contrato, plano) aos resultados das cinco etapas numa análise feita à mão, com a skill PMO, de um caso real de parceria (Lei 13.019). O caso real fica fora do Git; aqui os exemplos são disfarçados ou do edital público da SMPED.

O objetivo é transformar esse caminho em código e em pedidos ao PMO: cada saída tem a evidência que a sustenta, a regra que a produziu e quem executa a regra (código ou PMO).

Convenção da skill de engenharia reversa: o que não pôde ser confirmado na própria análise está marcado como `> [!NOTE] Inferido — validar com a responsável pelo projeto`.

| Arquivo | Conteúdo |
|---|---|
| [01-visao-geral.md](01-visao-geral.md) | Propósito de cada etapa, entradas e saídas, e o que mudou em relação ao app |
| [02-arquitetura.md](02-arquitetura.md) | As camadas da análise, o fluxo de dados entre as etapas e as fontes da skill PMO usadas em cada uma |
| [05-modelo-de-dados.md](05-modelo-de-dados.md) | As entidades que a análise produz e liga (requisito, ponto de atenção, premissa, divergência, achado) |
| [06-fluxos.md](06-fluxos.md) | Um diagrama de sequência por etapa |
| [07-regras-etapa-1.md](07-regras-etapa-1.md) a [07-regras-etapa-5.md](07-regras-etapa-5.md) | Rastro de cada saída: evidência → regra → código ou PMO → referência da skill |
| [09-pontos-de-atencao.md](09-pontos-de-atencao.md) | Erros encontrados e corrigidos durante a análise, tensões com a especificação e itens a validar |

Os métodos de cada etapa (`docs/estudos/metodo-etapa-1.md` a `metodo-etapa-5.md`) dizem **o que** a saída deve ser. Este conjunto diz **como chegar nela**. Onde divergirem, vale este conjunto, que foi feito depois da revisão com a skill PMO.

## Referências na análise
- Skill PMO 0.2.0: `SKILL.md`, `referencias/checklist.md`, `referencias/experiencia.md`, `referencias/licitacoes.md` (seção 4), fichas `prop-*`, `tap`, `b03`, `b31`, `a06`, `a07`, `a08`, `a11`, `a12`, `a16`, `b08`, `b13`, `b16`, `b17`, `b27`, `b29`.
- Especificação, seção 5 (etapas 1 a 5) e anexos A a C.
- Decisões 0008, 0009, 0013, 0021, 0031, 0032 e 0033.
