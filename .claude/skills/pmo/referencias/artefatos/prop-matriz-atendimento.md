---
codigo: PROP-MATRIZ
nome: Matriz de atendimento e checklist de envio
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["matriz de atendimento", "quadro de atendimento ao edital", "matriz de conformidade", "checklist de envio", "lista de documentos", "declarações e anexos"]
versao: 0.1.0
---

# PROP-MATRIZ — Matriz de atendimento e checklist de envio

## Para que serve
Liga cada requisito (R01…) e cada critério de pontuação à página da proposta que o atende, e lista o que precisa ir junto: declarações, anexos, validade e envio no prazo. A avaliação confere se a proposta está completa e responde a todos os documentos da licitação e aos critérios (PMBOK 6, 12.2, p. 487, PDF 523). É a versão da proposta da matriz de rastreabilidade (PMBOK 6, 5.2.3.2, p. 148, PDF 184; ficha B23). A conferência final é do **código** (SKILL.md, etapa 2, passo 9).

## Conteúdo mínimo
- **PROP-MATRIZ.1** Uma linha por requisito R da etapa 1, com o mesmo número, ligada à seção e à página da proposta que o atende
  - fonte: PMBOK 6, 5.2.3.2, p. 148–149 (PDF 184–185); SKILL.md, princípio 9; especificação da etapa 2, passo 9
  - sinais: tabela com coluna "R" (R01, R02…) e coluna de página da proposta
  - confere: código
  - dispensa: nunca
- **PROP-MATRIZ.2** Uma linha por critério de pontuação, com pontos máximos, seção e página
  - fonte: PMBOK 6, 12.2, p. 487 (PDF 523); `licitacoes.md` 2.2
  - sinais: nome de cada critério da etapa 1 | "pontos" | página da proposta
  - confere: código
  - dispensa: nunca
- **PROP-MATRIZ.3** A página indicada de fato responde ao requisito ou critério, e não só o menciona
  - fonte: PMBOK 6, 12.2, p. 487 (PDF 523); ficha B23 (B23.6)
  - sinais: número R ou nome do critério presente na página indicada
  - confere: só PMO
  - dispensa: nunca
- **PROP-MATRIZ.4** Requisito não atendido ou atendido em parte aparece com o motivo e o destino (exclusão, premissa, pergunta de esclarecimento)
  - fonte: ficha B23 (B23.9); `checklist.md` (destinos); PROP-ESTRATEGIA.8
  - sinais: "não atendido" | "atendido parcialmente" | "pendente de esclarecimento" | célula de página vazia
  - confere: código
  - dispensa: nunca
- **PROP-MATRIZ.5** Declarações exigidas pelo edital listadas, cada uma com página do edital e situação
  - fonte: especificação da etapa 2, passo 9; PMBOK 6, 12.1, p. 470 (PDF 506) (requisitos contratuais e legais)
  - sinais: "declaração" | "modelo de declaração" | "anexo" | coluna de situação
  - confere: código
  - dispensa: nunca
- **PROP-MATRIZ.6** Anexos exigidos (atestados, currículos, documentos de habilitação) listados, com situação e responsável
  - fonte: especificação da etapa 2, passo 9; `licitacoes.md` 2.2 (art. 37, atestados)
  - sinais: "atestado" | "currículo" | "habilitação" | "anexo" | coluna de responsável
  - confere: código
  - dispensa: nunca
- **PROP-MATRIZ.7** Validade da proposta conforme o edital, com página
  - fonte: Rework RW-076, adaptação (validade vem do edital); especificação da etapa 2, passo 9
  - sinais: "validade da proposta" | "dias" | página da RFP
  - confere: código
  - dispensa: nunca
- **PROP-MATRIZ.8** Garantia de proposta, se o edital exigir: modalidade e valor como Decisão do GP
  - fonte: `licitacoes.md` 2.6 (art. 58, § 1º)
  - sinais: "garantia de proposta" | "seguro-garantia" | "caução"
  - confere: código
  - dispensa: nunca
- **PROP-MATRIZ.9** Checklist de envio: data e hora-limite, forma (plataforma, protocolo), arquivos, assinatura e limites de páginas e formato
  - fonte: especificação da etapa 2, passo 9; Rework RW-072, adaptação; PROP-ESTRUTURA.6 e .7
  - sinais: "prazo de entrega" | data e hora | "plataforma" | "assinatura digital" | lista marcável
  - confere: código
  - dispensa: nunca
- **PROP-MATRIZ.10** Proposta técnica e de preço coerentes: mesmos produtos, prazos e equipe
  - fonte: Rework RW-076 (revisão antes do envio); PMBOK 6, 12.2, p. 486 (PDF 522)
  - sinais: nomes e números de produto e prazos iguais nas duas peças
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- Algum requisito ficou sem página? O motivo está escrito, ou ele sumiu? (ficha B23)
- A matriz aponta para a evidência que pontua (atestado, currículo), e não só para o texto? (`licitacoes.md` 2.2)
- O prazo de esclarecimento já passou? Quais perguntas tiveram resposta, e a resposta mudou alguma página? (`licitacoes.md` 2.3)
- Quem confere as contas da planilha antes do envio? (Rework RW-076)
- A matriz vai como anexo, se o edital pedir, ou fica como controle interno? (especificação da etapa 2, saída)

## Erros comuns
- Renumerar requisitos ou perder algum entre a etapa 1 e a proposta (SKILL.md, princípio 9).
- Página da matriz desatualizada depois da última revisão do texto (ficha B23, erros comuns).
- Declaração ou anexo esquecido, que inabilita mesmo com boa técnica (especificação da etapa 2, passo 9).
- Validade diferente da do edital (Rework RW-076, adaptação).
- Envio perto da hora-limite, sem folga para falha da plataforma (especificação da etapa 2, passo 9).

## Quando dispensar a parte inteira
Não se dispensa: é a conferência final da etapa 2. Em porte pequeno ou contratação direta, pode ser só a lista de requisitos com página e o checklist de envio.
Linha para a tela: "Matriz curta, requisitos com página e checklist: porte pequeno."

## Ligações
- **Vem de:** etapa 1 (requisitos R, critérios, declarações, anexos, validade, prazos); todas as fichas `prop-*` (páginas).
- **Vai para:** conferência final do código; matriz de atendimento (XLSX); checklist de envio; TAP3 na etapa 3; B23 na etapa 4.

## Modelo de redação
```
1. Requisitos: | R | Requisito (resumo) | Origem (doc, p.) | Seção e página da proposta | Situação | Destino, se não atendido |
2. Critérios: | Critério | Pontos máx. | Seção | Páginas | Evidência (anexo) |
3. Declarações e anexos: | Item | Exigido em (doc, p.) | Responsável | Situação |
4. Validade: [n dias, doc, p.]. Garantia de proposta: [se exigida; decisão do GP].
5. Envio: prazo [data e hora, doc, p.]; forma [plataforma]; arquivos [lista]; assinatura [ ];
   páginas [n de limite]; perguntas de esclarecimento enviadas [lista e respostas].
```

## Fontes
- PMBOK 6: 5.2.3.2, p. 148–149 (PDF 184–185); 12.1, p. 470 (PDF 506); 12.2, p. 486–487 (PDF 522–523).
- Rework: RW-072 (https://resources.rework.com/libraries/deal-closing/proposal-design); RW-076 (https://resources.rework.com/libraries/deal-closing/quote-generation).
- `licitacoes.md` 2.2, 2.3 e 2.6; `checklist.md` (destinos); ficha B23; SKILL.md, etapa 2 e princípio 9; especificação da etapa 2, passo 9 e saída.
