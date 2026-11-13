---
codigo: PROP-ESTRUTURA
nome: Estrutura da proposta técnica
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["estrutura da proposta", "sumário da proposta", "modelo de proposta", "índice", "roteiro da proposta técnica"]
versao: 0.1.0
---

# PROP-ESTRUTURA — Estrutura da proposta técnica

## Para que serve
Define o esqueleto da minuta: as seções, a ordem e os limites de forma. O avaliador confere se a proposta responde por inteiro aos documentos da licitação e aos critérios (PMBOK 6, 12.2, p. 487, PDF 523); por isso a estrutura espelha o edital. Com modelo obrigatório, ele é seguido à risca; sem ele, vale a estrutura de uma proposta antiga da FGV em `referencias/modelos/` (só a estrutura), ou a desta ficha.

## Conteúdo mínimo
- **PROP-ESTRUTURA.1** Se o edital tem modelo obrigatório de proposta, as seções seguem os títulos e a ordem dele, com a página do modelo citada
  - fonte: `licitacoes.md`, "Como usar" (o edital manda); PMBOK 6, 12.1, documentos de licitação, p. 477 (PDF 513); Rework RW-072, adaptação
  - sinais: "modelo de proposta" | "anexo" | títulos iguais aos do modelo, na mesma ordem
  - confere: código
  - dispensa: nunca
- **PROP-ESTRUTURA.2** Sem modelo, a estrutura usada é dita (proposta antiga da FGV ou estrutura da skill)
  - fonte: especificação da etapa 2, passo 3; Rework RW-071
  - sinais: "estrutura adotada" | "não há modelo obrigatório"
  - confere: código
  - dispensa: nunca
- **PROP-ESTRUTURA.3** Uma seção para cada critério de pontuação técnica, com o nome do critério no título ou na abertura
  - fonte: `licitacoes.md` 2.2 ("Na proposta"); PMBOK 6, "lado do vendedor", p. 479 (PDF 515)
  - sinais: nome de cada critério da etapa 1 em título de seção
  - confere: código
  - dispensa: nunca
- **PROP-ESTRUTURA.4** Cada seção de critério responde ao que o critério pede, na ordem e com as palavras do edital, e aponta a evidência (atestado, currículo, anexo)
  - fonte: PMBOK 6, 12.2, p. 487 (PDF 523); Rework RW-071 (customização real)
  - sinais: "atende ao critério" | "conforme item" | remissão a anexo
  - confere: só PMO
  - dispensa: nunca
- **PROP-ESTRUTURA.5** Proposta de preço em documento separado da técnica, quando o edital assim pede
  - fonte: PMBOK 6, 12.2, p. 486 (PDF 522); Rework RW-072, adaptação
  - sinais: "proposta de preço" | "proposta comercial" | "envelope" | ausência de valores em R$ na proposta técnica
  - confere: código
  - dispensa: nunca
- **PROP-ESTRUTURA.6** Limite de páginas do edital respeitado, por seção e no total
  - fonte: especificação da etapa 2, passos 1 e 9; Rework RW-072, adaptação
  - sinais: número de páginas da minuta × limite da etapa 1
  - confere: código
  - dispensa: nunca
- **PROP-ESTRUTURA.7** Regras de formato do edital (fonte, corpo, margens, arquivo, assinatura, identificação) listadas e seguidas
  - fonte: Rework RW-072, adaptação; especificação da etapa 2, passo 1
  - sinais: "fonte" | "tamanho" | "margem" | "PDF" | "assinatura" | lista de regras de formato
  - confere: código
  - dispensa: nunca
- **PROP-ESTRUTURA.8** Julgamento sem identificação, se o edital exigir: nenhum nome, logo ou dado que identifique a FGV
  - fonte: Rework RW-072, adaptação
  - sinais: "sem identificação" | "julgamento cego"; nome ou logo da FGV no texto
  - confere: código
  - dispensa: nunca
- **PROP-ESTRUTURA.9** Sumário executivo curto que responde ao problema do contratante, se o modelo permitir
  - fonte: Rework RW-071 e RW-072
  - sinais: "sumário executivo" | "resumo" | "apresentação"
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- O avaliador acha, em menos de um minuto, a seção que responde a cada critério? (Rework RW-072, teste de leitura rápida)
- Alguma seção da estrutura da skill entra em conflito com o modelo do edital? Se sim, o modelo vence. (`licitacoes.md`)
- A proposta técnica traz algum valor de preço que o edital manda pôr só na de preço? (PMBOK 6, p. 486)
- Diagramas e tabelas ajudam o avaliador (fluxo da metodologia, cronograma), sem passar do limite de páginas? (Rework RW-072)
- Há texto de outra proposta, com nome de outro órgão ou outro edital? (checklist 2, CP8)

## Erros comuns
- Estrutura própria "mais bonita" no lugar do modelo obrigatório (Rework RW-072, adaptação; `licitacoes.md`).
- Critério de pontuação respondido de forma espalhada, sem seção que o avaliador encontre (`licitacoes.md` 2.2).
- Passar do limite de páginas ou ignorar regra de formato (Rework RW-072, adaptação).
- Modelo genérico que só troca o nome do cliente (Rework RW-071 e RW-072).
- Identificar a proponente em julgamento cego (Rework RW-072, adaptação).

## Quando dispensar a parte inteira
Não se dispensa: toda proposta tem estrutura. Em porte pequeno ou contratação direta sem modelo, basta a estrutura curta da skill (entendimento, metodologia, produtos e cronograma, equipe).
Linha para a tela: "Estrutura curta da skill: sem modelo obrigatório e porte pequeno."

## Ligações
- **Vem de:** etapa 1 (modelo obrigatório, critérios de pontuação, limites de páginas e de formato); PROP-ESTRATEGIA (critérios e pesos).
- **Vai para:** todas as fichas `prop-*` (cada uma ocupa uma ou mais seções); PROP-MATRIZ (página de cada critério); conferência final do código.

## Modelo de redação
```
Com modelo obrigatório: títulos e ordem do modelo [doc, p.]; em cada seção, o conteúdo da ficha correspondente.
Sem modelo (estrutura da skill):
  1. Sumário executivo
  2. Entendimento do contexto e do problema; objetivos          (PROP-ENTENDIMENTO)
  3. Abordagem e metodologia                                    (PROP-METODOLOGIA)
  4. Produtos, critérios de aceite, premissas, exclusões
     e obrigações do contratante                                (PROP-SOW)
  5. Plano de trabalho: EAP e cronograma                        (PROP-EAP)
  6. Equipe e responsabilidades                                 (PROP-EQUIPE)
  7. Experiência da instituição (atestados)
  8. Anexos e declarações                                       (PROP-MATRIZ)
  Seção por critério: | Critério | Pontos máx. | Seção | Páginas |
Limites: [n] páginas (doc, p.); fonte [ ]; arquivo [ ]; identificação [ ].
Preço: documento à parte (PROP-PRECO).
```

## Fontes
- PMBOK 6: 12.1, p. 477 (PDF 513); 12.2, p. 486–487 (PDF 522–523); "lado do vendedor" (notas), p. 479 (PDF 515).
- Rework: RW-071 (https://resources.rework.com/libraries/deal-closing/proposal-development); RW-072 (https://resources.rework.com/libraries/deal-closing/proposal-design).
- `licitacoes.md`, "Como usar" e 2.2; `checklist.md` 2; especificação da etapa 2, passos 1, 3 e 9.
