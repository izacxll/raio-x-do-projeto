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
   - a frase "o registro completo fica só na planilha de registros do plano (XLSX)", com o nome exato de cada aba (a da tabela do código e a dos itens do PMO);
   - as notas do código sobre o registro, inteiras: conferências, data fixa vencida, premissa repetida, citação não conferida;
   - uma tabela-resumo:
     - **registro com tabela do código:** as 5 primeiras linhas, com os riscos de impacto alto primeiro e a linha de total, se houver. Quando o registro também tem itens do PMO, uma nota diz que o texto das linhas vem da resposta do PMO (Sugestão) e que o rótulo e a revisão do GP estão na planilha;
     - **registro só com itens do PMO:** os 5 primeiros itens. O texto é encurtado; o rótulo, as marcas e os avisos de conferência ficam sempre;
   - quantas linhas ou itens há ao todo.

   A primeira seção do plano diz que, neste porte, os registros estão completos só na planilha. O índice do pacote diz o mesmo.
2. **Planilha, em todos os portes.** Ganha:
   - as tabelas do código de todos os registros gerados, e não só as de uma lista fixa (o B9, com as questões, ficava de fora);
   - uma aba por registro com os itens do PMO ("Bn itens do PMO", nome curto que o limite de 31 caracteres do Excel não corta), com rótulo, texto e revisão do GP.

   Antes, a planilha só tinha parte das tabelas do código: o registro escrito pelo PMO estava só no Word.
3. **O que continua lendo o plano completo:**
   - a autoconferência da etapa 4;
   - o plano como documento da etapa 5.

   O resumo é só da apresentação: a conferência nunca vê um registro cortado. Se o GP conferir na etapa 5 o PDF do plano do porte pequeno, o código acha a marca "o registro completo fica só na planilha" na seção do registro. O que ele não localizar nesse registro fica "não verificável — conferir na planilha", nunca "ausente" (não achado não é ausente). Vale para o conteúdo mínimo do registro e para o que o código procura dentro dele: a premissa crítica no B3 e no B27, o perfil de equipe e o requisito de escopo. No porte pequeno, o B17 (requisitos) e o B18, o B26 e o B6 (equipe) saem fundidos e em resumo; o requisito de escopo ou o perfil de equipe que o código não acha fica "não verificável" se um deles está só na planilha. A premissa crítica que não aparece em parte nenhuma do plano continua ausente, porque o A8 e o A11 estão inteiros; o B3 e o B27 em resumo saem das partes desse achado, e a descrição diz que lá ela não pôde ser conferida. Regra geral, com teste: resumir o plano nunca cria um ausente que o plano completo não tem.
4. **Estimativa de páginas e resultado da etapa:** usam o plano como ele sai, então o porte pequeno conta o resumo.
5. **Porte médio e grande:** sem mudança. No resultado da etapa, os registros continuam no anexo (decisão 0085).

## Medição (os dois casos do teste externo, com as respostas já gravadas; fora do Git)

Páginas estimadas do plano, com as partes do porte (decisão 0091):

| Caso | Registros inteiros | Com o resumo | Corpo |
|---|---|---|---|
| TR de contratação direta (porte pequeno, 18 partes) | ~49 | ~29 | ~13 nos dois |
| TR fiscal (porte médio, 33 partes) | ~55 | ~55 (sem mudança) | ~14 |

## Consequências

- O plano do porte pequeno cabe perto do limite de 15 páginas no corpo e cai quase pela metade no total. Quem precisa do registro inteiro abre a planilha.
- A planilha passa a ser a fonte completa dos registros em todos os portes.
- Falta decidir se o porte médio também passa a ter o resumo, depois do terceiro TR.
