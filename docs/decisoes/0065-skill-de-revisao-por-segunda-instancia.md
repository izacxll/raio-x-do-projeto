# 0065 — Skill de revisão por segunda instância

- **Data:** 18/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (18/11/2026)

## Contexto

A revisão de cada passo por uma segunda instância (decisões 0057 a 0060 e 0063) estava descrita em dois lugares, no SKILL.md da PMO e em `docs/papeis.md`, e não dizia como lançar o revisor fora do app. O Claude da conversa usa uma skill própria para lançar o revisor independente em cada passo.

## Decisão

1. **A skill entra no repositório:** `.claude/skills/revisao-segunda-instancia/SKILL.md`. Ela diz como montar o pedido isolado, traz a rubrica fixa e a gravidade, e explica como lançar o agente, como aplicar os achados com checagem, qual é o limite de rodadas e a regra de confidencialidade. O conteúdo é genérico e pode ficar público.
2. **A PMO e o `docs/papeis.md` apontam para ela** e não repetem a rubrica nem os limites. No app, o pedido da segunda instância continua trazendo a rubrica, porque a chamada recebe só o SKILL.md da PMO.
3. **CLAUDE.md:** "Revisões de passo: usar `.claude/skills/revisao-segunda-instancia`".

## Consequências

- A rubrica tem uma fonte para o Claude Code (a skill) e uma cópia operacional no pedido do app (`src/pmo/segunda-instancia.ts`). Mudou a rubrica, mudam as duas.
- A regra da trava nova com a contagem de alarmes falsos fica na camada dos testes, em `docs/papeis.md`.
