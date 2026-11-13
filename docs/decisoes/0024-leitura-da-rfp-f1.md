# 0024 — Leitura da RFP só com código (F1), primeira versão

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (detalha a seção 5, etapa 1, da especificação e as decisões 0009, 0013 e 0021)

## Contexto

A F1 implementa a etapa 1 só com código e sem chave: desmembrar a RFP para o GP decidir se participa e preparar a proposta sem perder exigência nem prazo. Esta decisão registra como cada passo foi feito, para ser revisto com o uso e com a fase P.

## Decisão

### Documento e mapa (passo 1)
- A RFP e os anexos em PDF separados são lidos juntos; cada item diz de qual documento veio ("RFP" ou "Anexo: arquivo") e a página.
- Cabeçalho e rodapé repetidos (a mesma linha em metade das páginas ou mais) viram espaços antes das buscas, mantendo as posições (do `rpCorpo` do Raio-X). O nome do órgão é procurado nas páginas originais, porque costuma estar no cabeçalho.
- **Seções:** título numerado em maiúsculas ("7. DA FASE DE HABILITAÇÃO", "XII – ESPECIFICAÇÃO"), cláusula ("CLÁUSULA QUARTA – SUBCONTRATAÇÃO") e anexo ("ANEXO I", "ANEXO “A”", ou "TERMO DE REFERÊNCIA" no alto da página). Página com três ou mais "ANEXO" é a lista de anexos, não o início de um. Linha de planilha de preço não é título.
- Cada seção recebe um **tema** pelo título (objeto, escopo, habilitação, pagamento, garantia…). As extrações procuram primeiro nas seções do tema e depois no documento inteiro.

### Extração (passos 2 a 9)
- **Quadro da capa:** rótulo em maiúsculas com o valor ao lado ou embaixo ("OBJETO:", "DATA DA SESSÃO PÚBLICA") é lido primeiro.
- **Identificação:** instrumento (como o documento se denomina), modalidade (pelo título, depois "na modalidade X", depois a primeira citada), contratante, objeto, processo, valor estimado (ou "orçamento sigiloso") e as normas citadas, contadas. O que o documento cita prevalece; a ferramenta não dá parecer jurídico.
- **Requisitos numerados:** produtos e entregáveis rotulados, perfis da equipe mínima (com a quantidade "1 (um) Coordenador" ou com a qualificação perto), quantidades nas seções de objeto e escopo (oficinas, participantes, horas-aula…) e local de execução. Números R01, R02… na ordem produtos, equipe, quantidades, local. **Requisitos técnicos e funcionais em texto corrido não são separados pelo código nesta versão:** o GP os inclui na tela.
- **Os números ficam no dossiê** quando o GP clica em "Analisar a RFP". A partir daí, requisito novo ganha o próximo número e o descartado não volta. A etapa 5 usa essa lista (os não descartados, com a descrição editada); sem a etapa 1, extrai os produtos da RFP como antes.
- **Prazos:** datas do certame classificadas pelo contexto da linha (e da linha de cima ou de baixo, para rótulos e tabelas de cronograma); "assinatura" e "publicação" só contam na própria linha. Datas de norma, de assinatura eletrônica e "Cidade, data" ficam fora. O limite de esclarecimento ("até 3 dias úteis antes da abertura") é **calculado pelo código** a partir da sessão, descontando só sábados e domingos; a tela pede para conferir feriados e a forma de contar. Prazos da execução: vigência, execução, validade da proposta, assinatura e início, com a contagem que o trecho traz (dias úteis, corridos ou "não informada no trecho"). Alerta: "já passou", "é hoje", "faltam N dias" (perto: até 7).
- **Julgamento:** critério, modo de disputa, pesos ou fórmula da nota e as linhas da tabela de pontuação (até 40).
- **Habilitação:** catálogo de 31 documentos (Lei 14.133, arts. 62 a 70, e o que a Lei 13.019 pede às OSCs). Item do catálogo que o código não acha não entra na lista; o checklist avisa que pode estar com outra redação.
- **Forma de apresentação e condições contratuais:** catálogo de temas. Quando dá, o código tira o valor: garantia em %, "não exigida", menor e maior multa, índice de reajuste, prazo de pagamento, subcontratação vedada ou permitida. O trecho vem sempre junto.
- **Partes interessadas:** contratante, quem conduz o certame, gestor e fiscal do contrato, público-alvo e os órgãos e áreas citados por nome próprio (até 15, pelo número de citações).

### Vagos e brechas (passo 10)
Brechas do texto, não riscos do projeto (CLAUDE.md, seção 3). Cada uma traz uma pergunta de esclarecimento por modelo de texto, sempre como pedido ("Solicita-se…").

| Regra | Tipo | Origem |
|---|---|---|
| CTR4 · prazo da contratada contado de obrigação do contratante | transfere responsabilidade | Raio-X, `regrasRisco`. Ajuste: a palavra em comum tem de estar no objeto, não no marco; pagamento contado da nota fiscal não conta |
| CTR5 · aprovação sem prazo | em aberto | Raio-X |
| CP13 · dependência sem prazo | em aberto | Raio-X |
| CE15 · data fixa com início móvel | em aberto | Raio-X. Ajuste: data anterior ao certame não conta |
| CTR2 · vedação de subcontratação × atividade de campo | transfere responsabilidade | Raio-X (`regrasRiscoTR`) |
| CE17 · período × eleição | em aberto | Raio-X; o início mais cedo é a data do certame |
| o mesmo prazo com valores diferentes | contraditório | nova |
| a sessão com datas diferentes | contraditório | nova |
| custo de logística ou insumo a cargo da contratada, sem quantidade | transfere responsabilidade | nova (CTR2/CTR3 da decisão 0021: o que o edital empurra para a FGV) |
| vago (10 padrões de `src/regras/vago.ts`) | vago | os da etapa 5, só nas seções de objeto, escopo, obrigações, pagamento, recebimento, prazos, fiscalização, propriedade, dados e subcontratação; até 3 páginas por padrão |

- Os códigos V29 aparecem só como referência; a taxonomia e as regras do Raio-X não mudam.
- Cada regra tem os três estados (achado, não identificado, não verificável) e um caso de teste que acha e outro que não acha.
- O padrão vago "se necessário" deixou de casar com "torna-se necessária" (vale também para a etapa 5).

### Pontos de atenção (passo 11)
Resumo do que pesa na decisão de participar, copiado dos itens com a origem: prazo de esclarecimento e data do certame com o alerta, valor, critério, equipe exigida, atestado, vistoria, garantia, multas, subcontratação, brechas por tipo e páginas ilegíveis. Sempre com a nota "Insumo para a decisão de participar. Quem decide é o GP."

### Revisão do GP e saídas
- Todo item, menos o mapa, tem estado (pendente, aceito, editado, descartado), guardado no dossiê pelo id. Há "Aceitar os pendentes desta seção".
- Participar ou não é **Decisão do GP** (a decidir, participar, não participar), com justificativa; a ferramenta nunca preenche.
- Saídas: Análise da RFP (DOCX e PDF), Requisitos e prazos (XLSX), Checklist de habilitação (XLSX) e Perguntas de esclarecimento (DOCX, sem as descartadas). Cabeçalho de minuta enquanto houver item pendente.

### Versão
A F1 fecha com a tag **v0.4.0**, a próxima livre (mesma lógica da decisão 0022).

## Consequências
- O relatório mostra o resultado de cada regra e os itens não localizados, para o GP saber o limite da leitura.
- Na etapa 5, perfis de equipe são procurados no plano inteiro (ausente no plano de recursos ou nas designações da equipe); quantidade e local ficam "não conferido pelo código".
- Ficam para as próximas versões: requisitos técnicos e funcionais em texto corrido, feriados nacionais na conta de dias úteis, leitura de tabelas de produtos com código próprio (ex.: "PML-REL-01") e a leitura do PMO como opção na etapa 1, se a fase P mostrar que vale.
