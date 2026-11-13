# 0002 — Modelo da API: Opus 5.5 provisório, escolha final na F2

- **Data:** 13/11/2026
- **Status:** provisória
- **Quem decidiu:** responsável pelo projeto

## Contexto

As etapas 2, 3 e 4 usam a API do Claude, com a chave de cada GP e os créditos da organização da FGV. O modelo e o esforço precisam ficar num arquivo só de configuração.

Referência consultada em 13/11/2026 (preços por milhão de tokens; reconferir em docs.claude.com na F2):

| Modelo | ID | Entrada | Saída | Leitura de cache | Contexto / saída máx. |
|---|---|---|---|---|---|
| Claude Opus 5.5 | `claude-opus-5-5` | US$ 4 | US$ 20 | US$ 0,20 | 1M / 128K |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | US$ 2 | US$ 10 | US$ 0,10 | 1M / 128K |

## Decisão

- **Padrão provisório: `claude-opus-5-5`**, em `src/config/modelo.ts`, com o esforço definido de forma explícita por etapa (o padrão desse modelo é `medium`).
- **Na F2**, o mesmo passo roda com o Opus 5.5 e com o Sonnet 5.5 na mesma RFP pública. Os dois resultados são mostrados lado a lado, com qualidade e custo real:
  - aderência à regra "sugerir, nunca afirmar";
  - números ou fatos sem fonte (tem de ser zero);
  - citações conferidas;
  - cobertura dos requisitos (R01, R02…);
  - tokens e valor de cada um.
- A responsável pelo projeto escolhe a partir disso, e esta decisão é atualizada.

## Consequências

- Trocar o modelo é uma linha de configuração; os preços ficam em `src/config/precos.ts`.
- No Opus 5.5 e no Sonnet 5.5, `tool_choice` forçado e `temperature` dão erro 400. O app usa saída estruturada (`output_config.format`) validada com Zod.
