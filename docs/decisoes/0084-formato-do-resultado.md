# 0084 — Formato do resultado de cada etapa: capa, quadros, corpo e anexo

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026, a partir de duas revisões independentes do teste externo)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

O que o gestor recebe não estava pronto para ele usar:
- cada documento de resultado abria com o processo (como ler, placar, segunda instância);
- o texto "pendente de revisão do GP" e "redação a conferir" se repetia em cada item (cerca de 380 e 270 vezes na etapa 4);
- o prefixo do relatório se repetia em cada seção;
- a etapa 5 dizia que o resultado não estava no dossiê;
- o nome sugerido do projeto podia sair como "Contratar pessoa jurídica…";
- o rodapé não dizia o modelo.

Páginas medidas no Word antes desta decisão (dois casos do teste externo, fora do Git): etapa 1, 14 e 14; etapa 2, 17 e 20; etapa 3, 24 e 24; etapa 4, 66 e 72; etapa 5, 1 e 1.

## Decisão

1. **Quatro partes, sempre nesta ordem, cada uma começando numa página:**
   - a **capa de decisão** (página 1);
   - os **quadros** (o resultado da etapa em forma visual);
   - o **corpo** (só o que é útil ao gestor);
   - o **anexo** (o processo: placar, segunda instância, rodadas, tokens e as seções do código), para auditoria.
   O modelo do documento (`src/exportacao/modelo.ts`) ganha a parte de cada seção, os alertas (alto e médio, em faixa colorida) e os números-chave; o DOCX e o PDF montam as partes nessa ordem.
2. **Marcas no lugar do texto repetido:** ○ para o item pendente de revisão do GP e ◊ para a sugestão com redação a conferir, no começo do item. A legenda, com a contagem, sai uma vez, na capa (ou no começo, quando o documento não tem capa). Os avisos raros (número sem fonte, citação a conferir) continuam por extenso.
3. **Resultado da etapa no teste externo:** o resultado vem primeiro, sem o prefixo do relatório em cada seção; as seções "(código)" vão para o anexo; na etapa 3, as premissas ficam só no registro de premissas; na etapa 5, o relatório de conformidade é calculado como na tela (`src/etapas/5-conferencia/resultado.ts`). Sem a leitura do PMO, a etapa 5 diz isso (decisão 0037).
4. **Rodapé:** versão do app, versão da skill, **modelo** da leitura da etapa e data, em todo documento exportado.
5. **Nome sugerido:** sai também "Contratar pessoa jurídica (empresa, instituição, consultoria)… para".

A capa de decisão e os quadros de cada etapa vêm na decisão seguinte; a recomendação de participar ou não (etapa 1), noutra.

## Consequências

- A tela continua com as etiquetas de cada item (já são visuais); a mudança é nos documentos exportados.
- O XLSX não muda: ele traz as tabelas, sem partes nem marcas (a coluna de estado continua "Pendente").
- A marca da redação a conferir é ◊, e não △: o △ não existe na fonte do PDF (Arimo).
- O modelo do rodapé é o guardado em cada passo da etapa, não o do seletor (que vale para as próximas chamadas).
- `resultadoDaEtapa5` repete o cálculo da tela da etapa 5; a tela continua com o dela, porque trabalha sobre o estado que o GP ainda não gravou. Mudança numa precisa ir à outra.
