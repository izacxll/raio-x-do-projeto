# 0043 — Estudo sensível: independência técnica

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (ok de 16/11/2026); Claude Code (a redação)

## Contexto

O TR municipal de contratação direta (estudo de impacto de evento) justificava a contratação pela criação de uma Comissão de Estudo na Câmara, com intenção de CPI sobre os mesmos eventos. O resultado do estudo seria lido por lados em disputa. A skill não tinha item de independência técnica, e os itens que tratam do assunto (A7.5, A10.6) podiam ser dispensados em porte pequeno.

## Decisão

1. **Sinais** de estudo sensível: "CPI", "Comissão Parlamentar", "Comissão de Estudo", "denúncia", "representação", "Tribunal de Contas" junto de avaliação, impacto ou gestão de recursos. "Câmara" sozinha não é sinal, porque muitas contratantes são Câmaras Municipais.
2. **Característica nova do projeto:** `estudo sensível` · `estudo comum`. O GP confirma na tela das características; o padrão conservador é `estudo sensível`. O código sugere só pelos sinais fortes ("CPI", "Comissão Parlamentar", "Comissão de Estudo", "denúncia") junto de impacto, avaliação ou recursos, na mesma página. "Tribunal de Contas" e "representação" ficam só para a leitura do PMO, porque aparecem em quase todo edital (certidões, cláusulas padrão).
3. **Não vira premissa crítica** (a V29 revisada não muda). Vira itens nas fichas:
   - **PROP-METODOLOGIA.11:** como os resultados são validados e o que acontece se alguém discordar (o método aprovado é a régua);
   - **A5.13:** resultado aceito só muda por erro técnico registrado;
   - **A7.5:** quem libera informação confidencial, inclusive resultado preliminar;
   - **A10.6:** parte que pode se opor (órgão de controle, comissão), que deixa de ser dispensável em estudo sensível.

## Consequências

- `_modelo.md` e `src/dominio/caracteristicas.ts` ganham as duas expressões; a tela das características ganha uma linha.
- A dispensa de A7.5 e de A10.6 passa a considerar `estudo comum`.
- O código da etapa 1 passa a apontar os sinais como ponto de atenção sem premissa (decisão 0048).
