# 0079 — Skill PMO 0.3.5

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

A etapa 5 do teste externo (rodada 3) deixou as lições 201 a 206 (fora do Git). As 201 e 202 viraram código na decisão 0076; a 204, na 0078; a 206, na 0077. O que muda o comportamento do PMO vai para a skill, em regra geral e com exemplos inventados.

## Decisão

1. **Etapa 5, vereditos (201 e 205):**
   - `falso` só quando a evidência cobre o item inteiro da ficha, não só o tema; quando cobre em parte, é `sustenta`, dizendo a parte que falta;
   - item que é resultado da execução (conclusões, lições, medições) é `nao_se_aplica` no plano inicial;
   - no plano do app, o código já procura o item que a autoconferência da etapa 4 aponta, e o candidato que sobra pede leitura atenta.
2. **Etapa 5, vago (202):** "a definir" com marco nomeado, com a questão aberta ou com o acontecimento que o resolve não é vago; "em conjunto" e "no decorrer" continuam.
3. **Etapa 5, conflituoso (203):** antes do `conflituoso`, procurar a regra no plano inteiro. O que falta amarrar é refino, de gravidade baixa.
4. **Etapa 4, régua (204):** a correção de uma duração ou de um limite num passo vai às partes geradas antes, ou vira divergência dita; o código avisa (decisão 0078).
5. **206** (segunda instância da etapa 5) fica na decisão 0077 e na skill de revisão, não na PMO.

## Consequências

- O `SKILL.md` cresce cerca de 2 mil caracteres (~500 tokens), quase tudo na seção da etapa 5.
- O gabarito e os testes passam.
