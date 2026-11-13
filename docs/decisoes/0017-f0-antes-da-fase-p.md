# 0017 — F0 antes da fase P; as tags das duas trocam de lugar

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (ordem das fases); Claude Code, em nome dela (troca das tags)

## Contexto

O plano previa a fase P (prova de conceito com um caso real) antes da F0 (esqueleto do app). A F0 não depende do resultado da P: a P calibra a skill PMO e as regras da F5 e da F1, e nenhuma das duas está na F0. A responsável pelo projeto quer ver a cara do app no GitHub Pages logo.

## Decisão

1. **A F0 vem antes da P.** A ordem passa a ser: Fundação → S → **F0 → P** → F5 → F1 → F2 → F5b → F3 → F4 → MVP.
2. **As tags acompanham a ordem em que as fases terminam**, para que as versões continuem crescentes no tempo:
   - F0 — esqueleto: **v0.2.0** (antes, v0.3.0);
   - P — prova de conceito: **v0.3.0** (antes, v0.2.0).
   - As demais tags não mudam.

## Consequências

- A tabela de versões da decisão 0005 foi atualizada com a troca.
- A P continua sem código do app. Ela pode usar o app da F0 para ler os PDFs do caso, mas o que for gerado a partir deles continua fora do Git.
- Nada do que a P calibrar (skill, regras da F5 e da F1) foi adiantado na F0.
