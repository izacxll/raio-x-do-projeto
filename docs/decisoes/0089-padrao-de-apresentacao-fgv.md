# 0089 — Resultado da etapa no padrão dos documentos da FGV Projetos

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

O resultado de cada etapa ainda parecia registro do sistema:
- cada linha começava com "○ [Decisão do GP]" ou "○◊ [Sugestão]";
- os tópicos saíam em blocos de texto corrido;
- termos internos do app ("placar", "segunda instância", "código", ids de itens) estavam no corpo.

A responsável mandou uma proposta real da FGV como referência visual. Ela é confidencial e não entra no Git: só a forma foi usada, junto com `docs/identidade-visual.md` e o logo.

## Decisão

1. **Página e marca:**
   - cabeçalho com o logo da FGV Projetos à direita;
   - rodapé centralizado em azul, com o nome do documento e "página n / total";
   - capa com o título do estudo (o nome sugerido a partir do objeto, sem o instrumento), o contratante, a etapa e a data;
   - os números-chave da etapa na capa, em blocos grandes e azuis, com uma linha de explicação;
   - depois da capa, o sumário com as páginas.
2. **Tipografia:**
   - seções numeradas em caixa alta, no azul-escuro da identidade;
   - subtítulos em azul;
   - parágrafos justificados;
   - marcador quadrado azul.
3. **Rótulos fora da linha, visíveis por seção** (CLAUDE.md, seção 1, na forma pedida pela responsável):
   - "Do documento" vira a referência discreta "(TR, p. 4)" no fim da frase;
   - as sugestões do PMO ficam em texto normal, com uma nota no início da seção ("conteúdo sugerido pelo PMO, salvo quando a frase traz a referência ao documento");
   - as decisões do GP vão para o quadro "Para o GP decidir", no início da seção, com o impacto;
   - na capa, só as 5 primeiras decisões.
4. **Marcas e avisos no anexo de revisão:** as marcas ○ e ◊ e os avisos da conferência saem do corpo e vão para o "Anexo A — Revisão do GP", numa lista por seção.
5. **Termos internos só no anexo técnico:**
   - as seções do funcionamento do app (placar, segunda instância, seções do código, situação da minuta) vão para o "Anexo B";
   - no corpo, "código" vira "ferramenta", "dossiê" vira "arquivo do projeto", e os ids entre parênteses saem.
6. **Tabelas no padrão:** cabeçalho azul-marinho, faixa azul-clara por grupo e legenda "Tabela N.M – título" centralizada em azul. Quadros novos:
   - equipe (perfil, requisito do TR, papel, horas, situação);
   - produtos (conteúdo, critério de aceite, prazo);
   - cronograma em barras por mês, a partir das datas da conta;
   - premissas críticas (B3, B27, A11 e situação);
   - riscos com o responsável.

   Na ficha da RFP, o que o documento não traz (as duas leituras concordando) fica "não informado no TR", em vermelho.
7. **Proporção na etapa 4:** o corpo traz os planos em resumo (o que cada plano estabelece, quantos itens e quantas decisões do GP). O plano inteiro e os registros vão para o anexo.
8. **No app:** a capa da tela ganha os números em destaque e o quadro "Para o GP decidir", e um botão baixa o resultado da etapa em Word nesse padrão.

O documento de cada etapa que o app já exportava (proposta, TAP, PGP etc.) continua como estava. O padrão vale para o resultado da etapa.

## Ajustes pedidos antes do merge (18/11/2026)

1. **Plurais:**
   - o texto que o GP lê usa singular ou plural pela quantidade ("1 decisão", "6 decisões"), sem "(s)", "(ões)" nem "(is)";
   - o placar e a conferência gravados na pasta do caso passam por uma correção final no resultado.
   - Os textos dos pedidos ao PMO ficam como estão: quem os lê é o modelo.
2. **Impacto:** o quadro "Para o GP decidir" só mostra o impacto quando a decisão mexe em caixa ou preço, prazo, aceite ou quem executa. Sem dimensão clara, não aparece "outro".
3. **Capa:**
   - 3 ou 4 blocos grandes, azuis e centralizados: duração, entregas, valor ou horas e, quando a etapa tem, o veredito;
   - o veredito é a recomendação de participar na etapa 1 e o veredito sugerido na etapa 5;
   - os outros números ficam na tabela, que não repete o que já está num bloco.
4. **Fila do GP:** em uma linha curta ("6 decisões · 1 a conferir · 55 em lote"), com o prazo na linha "Decidir".

## Correções da revisão de código alta

- **Tabelas do corpo:**
  - a coluna do rótulo fica: é o rótulo visível de cada linha;
  - a coluna do estado sai, e cada linha pendente ou com marca vai ao anexo de revisão.
- **Etapa 4:** as pendências do plano que foi ao anexo técnico também entram no anexo de revisão.
- **Item com aviso:** fica no corpo com um sinal curto ("citação não conferida", "valor não conferido", "não localizado pela ferramenta — conferir no documento"), para não se ler como fato.
- **Citação sem página:** fica "não verificável", sem o nome de um documento que a linha não diz.
- **Decisões:** só a decisão ainda pendente vai ao quadro; a revisada fica no texto como "Decisão do GP".
- **Termos internos:** a troca de "código" por "ferramenta" não vale para o trecho do documento, para nome de lei ("Código Civil") nem para unidades como "(m2)".
- **Word baixado da tela:**
  - é minuta enquanto algum documento da etapa tiver item sem revisão;
  - não fala em teste externo;
  - um erro na geração aparece na tela.
- **Quadros:**
  - o cronograma em barras não conta a aprovação duas vezes;
  - a premissa crítica que a ferramenta não acha num dos três lugares fica "não localizada — conferir no plano", não "falta";
  - o que o GP descartou não conta.
- **Título:** o nome dado pelo GP fica como está. Um nome sugerido traz na capa "título sugerido a partir do objeto, a confirmar pelo GP".

## Medição (os 10 documentos do teste externo, fora do Git; páginas no Word)

| Etapa | Antes (decisão 0085): total / antes do anexo | Agora: total / antes dos anexos (inclui capa e sumário) |
|---|---|---|
| 1 | 16 / 13 e 16 / 13 | 14 / 11 e 15 / 11 |
| 2 | 22 / 14 e 20 / 13 | 30 / 17 e 27 / 16 |
| 3 | 25 / 15 e 25 / 17 | 28 / 15 e 28 / 17 |
| 4 | 73 / 16 e 66 / 15 | 74 / 6 e 68 / 6 |
| 5 | 5 / 4 e 5 / 4 | 7 / 6 e 7 / 6 |

O que o gestor lê antes dos anexos cai na etapa 4 (de 15 para 6 páginas) e na etapa 1. Ele sobe um pouco nas etapas 2 e 5, por causa da capa, do sumário e dos quadros novos (equipe, produtos, cronograma).

## Consequências

- O DOCX sai com o sumário marcado para atualizar: o Word atualiza as páginas ao abrir.
- A leitura da linha depende do formato das linhas de item ("[Rótulo] texto (avisos)"). Uma linha fora desse formato fica como texto corrido.
