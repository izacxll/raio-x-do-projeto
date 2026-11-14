# Guia do gerente

Como usar o Raio-X do Projeto: **https://izacxll.github.io/raio-x-do-projeto/**. A ferramenta prepara minutas e aponta problemas; quem decide é sempre o gerente do projeto (GP).

## O que cada etiqueta quer dizer

- **Do documento, p. N:** tirado da RFP, da proposta, do TAP ou do PGP, com a página e o trecho. Abra o trecho para conferir.
- **Sugestão:** o que a ferramenta propõe, em redação condicional. Pode ser aceita, editada ou descartada.
- **Decisão do GP:** só você preenche (participar ou não, abordagem, valor-hora, nomes da equipe, reserva, preço final…).
- **"não localizado pelo código — conferir no documento":** o código não achou; não quer dizer que o documento não traga.
- **"citação não conferida":** o PMO citou um trecho que o código não achou na página indicada. Não vale como fato até você conferir.

Enquanto houver item pendente, os documentos exportados saem com o cabeçalho **"Minuta — sugestões geradas por ferramenta, sujeitas à validação do Gerente do Projeto"**.

## Sem chave da API

Nada sai do navegador.

- **Etapa 1 — Leitura da RFP:** envie a RFP (e os anexos, se vierem em PDFs separados) e clique em "Analisar a RFP". Revise os requisitos (R01, R02…): os números seguem até a conferência do plano. Decida se participa. Baixe a análise, a lista de requisitos e prazos, o checklist de habilitação e as perguntas de esclarecimento.
- **Etapa 5 — Conferência do PGP:** envie o PGP (e, se tiver, o TAP e a RFP), confirme o mapa do plano e as características do projeto e clique em "Conferir o plano". Se a etapa 4 foi feita no mesmo dossiê, o que você dispensou nela já vem marcado como dispensado.

## Demonstração, sem a chave

Nas etapas 2, 3 e 4, o botão **"Ver demonstração"** abre uma concorrência pública (OEI) com as respostas do PMO gravadas. Nada é enviado à API e não há custo. Cada passo do PMO vira "Carregar a resposta gravada"; as decisões do GP, a conferência das citações, o cronograma, o preço e as saídas funcionam como no uso real.

- A faixa laranja "Demonstração com respostas gravadas, sem chamada à IA" fica no alto de todas as telas enquanto o projeto for de demonstração, e o mesmo aviso vai no cabeçalho de todo documento exportado.
- As respostas gravadas partem da abordagem B: com outra escolha, a demonstração pede para escolher a B antes do conteúdo técnico.
- "Sair da demonstração" (na faixa) fecha o projeto de demonstração.

## Com a chave da API

### A chave
1. O login do claude.ai **não** é a chave. Peça uma chave da API ao administrador do Claude da FGV (organização da FGV no Claude Console).
2. Na etapa 2, em "Conectar ao Claude", cole a chave e clique em "Usar esta chave" e em "Testar".
3. A chave fica só nesta aba do navegador e some quando ela é fechada. Use o app numa aba só dele e clique em **"Esquecer a chave"** ao terminar. A chave nunca vai para o dossiê nem para os arquivos.

Nas etapas com o PMO, o texto dos PDFs vai para a API do Claude, pela sua chave, na organização da FGV. O app só envia quando você clica em "Pedir ao PMO", e mostra antes quanto deve custar.

### Etapa 2 — Proposta
1. **Documentos:** a RFP e os anexos, ou o dossiê da etapa 1 (melhor: os requisitos e as brechas já revisados por você seguem para a proposta).
2. **Ponto de partida:** o que o código tirou da RFP (requisitos, critério de julgamento, modelo obrigatório, limite de páginas, valor estimado, prazos, brechas).
3. **Estratégia (PMO):** como o contratante vai avaliar, onde estão os pontos e 2 ou 3 abordagens técnicas com prós e contras. **Escolha uma abordagem** e marque as premissas críticas que se aplicam ao projeto.
4. **Conteúdo técnico (PMO):** as seções da proposta, o escopo (produtos, critérios de aceite, prazos), exclusões, premissas com a consequência, restrições e obrigações do contratante. Revise item a item.
5. **EAP, estimativas e equipe (PMO):** atividades com estimativa em três pontos, perfis e horas. O código monta o cronograma e o caminho crítico. Informe o **início previsto** e os **dias de aprovação** de cada produto pelo contratante: o código confere o prazo total e o de cada produto contra a RFP.
6. **Preço:** preencha o valor-hora de cada perfil, as despesas, os percentuais de custos indiretos e de tributos e a reserva. O código faz as contas e compara com o valor estimado do edital. O preço final é seu.
7. **Conferência final:** a matriz de atendimento liga cada requisito e cada quesito de pontuação ao ponto da minuta que o atende; o checklist de envio traz os prazos e os documentos exigidos.
8. **Exportar:** proposta técnica (DOCX e PDF), planilha de preço (XLSX), matriz de atendimento e checklist de envio (XLSX) e perguntas de esclarecimento (DOCX).

O custo de cada chamada (tokens e valor estimado em dólar) fica na tabela "Uso da API nesta proposta" e no dossiê.

### Etapa 3 — Termo de abertura (TAP)
1. Envie a RFP. A proposta vem da etapa 2, se ela foi feita no mesmo dossiê; se você editou a proposta fora da ferramenta, envie o PDF da versão final: ele passa a valer.
2. Confira as **premissas críticas** (vêm confirmadas da etapa 2).
3. **Divergências RFP × proposta:** o código compara requisito a requisito (produtos e equipe), o prazo e o valor. Onde houver diferença, escolha o que vale: a RFP, a proposta ou outra redação.
4. **O que vem dos documentos:** contratante, objeto, vigência, produtos, a entrega de cada produto no cronograma da proposta, aceite e extinção, com a página.
5. Peça ao PMO **os 12 elementos do TAP** e revise item a item. Preencha os campos que só você preenche: recursos financeiros, gerente e nível de autoridade, patrocinador.
6. Peça o **registro de premissas inicial** e revise.
7. Veja a **conferência do TAP** (código): elementos vazios, requisitos sem número, marcos fora do prazo, valor diferente do da proposta, citações não conferidas, premissas críticas sem consequência.
8. Registre a **aprovação** (quem e quando) e baixe o TAP (DOCX ou PDF) e o registro de premissas (XLSX). Enquanto houver pendência, os arquivos saem como minuta.

### Etapa 4 — Plano de gerenciamento (PGP)
1. Envie a RFP. O TAP vem da etapa 3, se ela foi feita no mesmo dossiê; se ele foi aprovado com mudanças fora da ferramenta, envie o PDF do TAP aprovado. A proposta é opcional.
2. Confira as **premissas críticas**: cada uma que se aplica vai para o registro de premissas, o registro de riscos e o plano de mudanças.
3. Peça a **adaptação** ao PMO. Ele sugere, para cada uma das 51 partes, se é essencial, recomendada ou dispensável. **Você marca o que gerar** e escolhe a abordagem. O que você dispensar não é apontado como ausente na conferência do plano (etapa 5).
4. Peça os passos seguintes, na ordem: **escopo** (com a matriz de rastreabilidade feita pelo código), **atividades, recursos e cronograma** (informe o início e o tempo de aprovação de cada produto; o código calcula o cronograma, o caminho crítico e os marcos, e confere com o TAP), **riscos, custos e premissas** (informe o valor-hora de cada perfil e as reservas), **demais planos** e **medição e documentos de execução**. Revise item a item.
5. **Autoconferência:** confirme as características do projeto e clique em "Conferir o plano gerado". As regras da etapa 5 apontam o que está vago, conflituoso ou ausente; os trechos "a definir pelo GP" aparecem à parte, como decisões que só você preenche.
6. Baixe o plano (DOCX ou PDF), os registros (XLSX), a EAP e o diagrama de rede (SVG) ou o **pacote completo (.zip)**, com o índice das partes.

### Etapa 5 — Leitura do PMO (opcional, com a chave)
Depois da conferência por código, você pode pedir a leitura do PMO: ele aponta o que depende de interpretação (equipe pequena para o volume, critério de aceite que não dá para medir, premissa crítica mal escrita). Todo achado dele é sugestão: o código confere cada citação, procura no plano o que ele diz estar ausente (se achar, rebaixa e mostra onde) e dá a gravidade pela parte do plano. Você decide se cada um procede; eles saem numa seção própria do relatório.

## Dossiê

"Salvar projeto" baixa o `<projeto>.dossie.json` com tudo o que foi lido, sugerido e decidido. "Abrir projeto" retoma de onde parou. O dossiê não guarda a chave nem os PDFs (só o texto lido deles). Guarde-o com o mesmo cuidado da RFP.
