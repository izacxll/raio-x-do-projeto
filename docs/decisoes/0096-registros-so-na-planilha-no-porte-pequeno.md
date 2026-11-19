# 0096 — No porte pequeno, os registros ficam só na planilha; no Word, uma tabela-resumo de cada

- **Data:** 19/11/2026
- **Status:** aceita (decisão da responsável, 19/11/2026, depois da medição da decisão 0091)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

A medição da decisão 0091 mostrou dois pontos:
- o porte reduz as partes do plano, mas quase não reduz as páginas;
- o corpo já estava dentro do limite, e o volume vinha dos registros B (riscos, premissas, partes interessadas, RACI, rastreabilidade), que também saem na planilha.

A responsável decidiu:
- **Porte pequeno:** os registros B ficam só na planilha. No Word, cada registro vira uma tabela-resumo, com a indicação da planilha.
- **Porte médio:** os registros ficam no anexo, por enquanto.

## Decisão

1. **Plano (DOCX e PDF) no porte pequeno.** Cada registro gerado ou fundido sai numa seção só, com:
   - "Parte Bn do plano." e, se for o caso, onde foi fundido;
   - a frase "o registro completo fica só na planilha de registros do plano (XLSX), aba "…"", com o nome exato da aba;
   - uma tabela-resumo:
     - **registro com tabela do código:** as 5 primeiras linhas, com os riscos de impacto alto primeiro;
     - **registro só com itens do PMO:** os 5 primeiros itens, com rótulo e marca, em resumo;
   - quantas linhas ou itens há ao todo.

   A primeira seção do plano diz que, neste porte, os registros estão completos só na planilha. O índice do pacote diz o mesmo.
2. **Planilha, em todos os portes.** Ganha uma aba por registro com os itens do PMO ("Bn Nome — itens"), com rótulo, texto e revisão do GP. Antes, a planilha só tinha as tabelas do código: o registro escrito pelo PMO estava só no Word.
3. **O que continua lendo o plano completo:**
   - a autoconferência da etapa 4;
   - o plano como documento da etapa 5.

   O resumo é só da apresentação: a conferência nunca vê um registro cortado. Se o GP conferir na etapa 5 o PDF do plano do porte pequeno, o código acha a marca "o registro completo fica só na planilha" na seção do registro. O que ele não localizar nesse registro fica "não verificável — conferir na planilha", nunca "ausente" (não achado não é ausente).
4. **Estimativa de páginas e resultado da etapa:** usam o plano como ele sai, então o porte pequeno conta o resumo.
5. **Porte médio e grande:** sem mudança. No resultado da etapa, os registros continuam no anexo (decisão 0085).

## Medição (os dois casos do teste externo, com as respostas já gravadas; fora do Git)

Páginas estimadas do plano, com as partes do porte (decisão 0091):

| Caso | Registros inteiros | Com o resumo | Corpo |
|---|---|---|---|
| TR de contratação direta (porte pequeno, 18 partes) | ~49 | ~28 | ~13 nos dois |
| TR fiscal (porte médio, 33 partes) | ~55 | ~55 (sem mudança) | ~14 |

## Consequências

- O plano do porte pequeno cabe perto do limite de 15 páginas no corpo e cai quase pela metade no total. Quem precisa do registro inteiro abre a planilha.
- A planilha passa a ser a fonte completa dos registros em todos os portes.
- Falta decidir se o porte médio também passa a ter o resumo, depois do terceiro TR.
