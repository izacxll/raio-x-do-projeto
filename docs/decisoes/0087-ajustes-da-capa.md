# 0087 — Ajustes da capa de decisão

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026, depois de ver a capa)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

A primeira versão da capa (decisão 0085) dizia "não localizado pelo código" mesmo quando a leitura do PMO confirmava que o documento não traz o dado. Ela também tinha outros problemas:
- contava marcos "fora do prazo" quando o TAP não dava prazo nenhum;
- mostrava os riscos pela causa cortada;
- dava gravidade baixa a um conflito entre partes que muda a régua de prazo, quando a segunda instância do teste deu média.

## Decisão

1. **Etapa 1:** quando o código não acha o prazo ou o valor e a leitura do PMO diz que o documento não traz, o alerta afirma: "O TR não traz prazo nem valor: perguntar antes do preço", dizendo que as duas leituras concordam. Quando só o código não achou, continua "não localizado pelo código — conferir no documento".
2. **Etapa 4:** sem prazo em dias para nenhum marco no TAP, os marcos saem "sem régua", e não "0 fora do prazo".
3. **Riscos** (alertas e quadro): numa linha, o evento e o efeito do registro B27 ("evento → efeito"), sem a causa cortada.
4. **Etapa 5:** achado conflituoso cujo texto fala de régua de prazo (teto, referência, limite, prazo ou vigência) e traz um prazo em meses, dias, semanas ou anos fica no mínimo **média**, qualquer que seja a parte. No teste, a regra fixa da parte (A17) dava baixa. O veredito sugerido do plano do caso fiscal passa de "apto" a "apto com ressalvas".

## Consequências

- A regra 4 vale para os achados da leitura do PMO. Os conflitos do código têm regras próprias e não mudam.
