---
codigo: A2
nome: Plano de gerenciamento dos requisitos
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: escopo
sinonimos: ["plano de requisitos", "plano de gerenciamento de requisitos", "gerenciamento dos requisitos", "gestão de requisitos", "gestão dos requisitos", "plano de análise de negócio"]
versao: 0.1.0
---

# A2 — Plano de gerenciamento dos requisitos

## Para que serve
Descreve "como os requisitos serão analisados, documentados e gerenciados" (PMBOK 6, glossário, p. 719, PDF 755); algumas organizações o chamam de plano de análise de negócio (5.1.3.2, p. 137, PDF 173). No app, os requisitos da RFP chegam numerados da etapa 1 (R01, R02…): o plano diz como esses números são mantidos, priorizados, rastreados (B23), validados e alterados. A lista em si fica no B22.

## Conteúdo mínimo
- **A2.1** Fontes dos requisitos e como serão levantados e documentados: TR ou edital, proposta, contrato, normas, oficinas com o contratante
  - fonte: PMBOK 6, 5.2, p. 140–143 (PDF 176–179)
  - sinais: "levantamento de requisitos" | "termo de referência" | "edital" | "contrato" | "oficina" | "entrevista"
  - confere: código
  - dispensa: nunca
- **A2.2** Identificação: os requisitos mantêm o número da etapa 1 (R01, R02…), sem renumerar; requisito novo só ganha número quando aceito
  - fonte: PMBOK 6, 5.2, p. 148 (PDF 184) (identificador único); PMBOK 7, 2.6, p. 82–83 (PDF 177–178); SKILL.md, princípio 9
  - sinais: "R01" | "R02" | "numeração dos requisitos" | "identificador do requisito"
  - confere: código
  - dispensa: nunca
- **A2.3** Processo e critério de priorização (obrigatório pelo TR × acrescido ou desejável; MoSCoW ou escala simples)
  - fonte: PMBOK 6, 5.1.3.2, p. 137 (PDF 173); Rework RW-063 (https://resources.rework.com/libraries/project-management/moscow-prioritization)
  - sinais: "priorização" | "prioridade" | "obrigatório" | "desejável" | "MoSCoW" | "essencial"
  - confere: código
  - dispensa: porte pequeno
- **A2.4** Mudança nos requisitos: como é pedida, como o impacto é analisado e registrado, e quem tem autoridade para aprovar (A11; aditivo, se alterar o contrato)
  - fonte: PMBOK 6, 5.1.3.2, p. 137 (PDF 173); `licitacoes.md` 2.7 (Lei 14.133/2021, arts. 124 e 125)
  - sinais: "mudança de requisito" | "análise de impacto" | "nível de autorização" | "alçada" | "aditivo" | "plano de mudanças"
  - confere: código
  - dispensa: nunca
- **A2.5** Validação: como se demonstra que cada requisito foi atendido e quem confere
  - fonte: PMBOK 6, 5.5, p. 165 (PDF 201); 5.6, p. 169 (PDF 205); PMBOK 7, 2.6, p. 82–83 (PDF 177–178)
  - sinais: "validação dos requisitos" | "verificação" | "evidência de atendimento" | "atendimento ao requisito" | "método de validação"
  - confere: código
  - dispensa: nunca
- **A2.6** Estrutura da rastreabilidade: que atributos e ligações a matriz (B23) terá
  - fonte: PMBOK 6, 5.1.3.2, p. 137 (PDF 173); Rework RW-031 (https://resources.rework.com/libraries/project-management/requirements-traceability-matrix)
  - sinais: "rastreabilidade" | "matriz de rastreabilidade" | "atributos" | "colunas da matriz"
  - confere: código
  - dispensa: porte pequeno
- **A2.7** Métricas dos requisitos, cada uma com a justificativa (por exemplo, parcela de requisitos atendidos e aceitos)
  - fonte: PMBOK 6, 5.1.3.2, p. 137 (PDF 173); 5.5, p. 165 (PDF 201)
  - sinais: "métrica" | "indicador" | "requisitos atendidos" | "percentual de requisitos" | "não conformidades"
  - confere: código
  - dispensa: porte pequeno
- **A2.8** Quem responde pelos requisitos e como o andamento deles é acompanhado e relatado
  - fonte: PMBOK 6, 5.1.3.2, p. 137 (PDF 173); PMBOK 7, 2.6, p. 83 (PDF 178)
  - sinais: "responsável pelos requisitos" | "acompanhamento dos requisitos" | "situação dos requisitos" | "relatório de status"
  - confere: código
  - dispensa: nunca
- **A2.9** Requisito com mais de uma leitura ou em conflito: pergunta ao contratante, leitura adotada como premissa (B3) e questão aberta (B9) até a confirmação
  - fonte: PMBOK 6, 5.2, p. 147 (PDF 183) (não ambíguos antes da linha de base); PMBOK 7, 2.6, p. 82–83 (PDF 177–178); `checklist.md` 1
  - sinais: "esclarecimento" | "leitura adotada" | "interpretação" | "registro de premissas" | "questão"
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O plano usa os números R da etapa 1, ou criou outra numeração que quebra o encadeamento RFP → TAP → PGP? (SKILL.md, princípio 9)
- Quem pode aceitar um requisito novo vindo de oficina ou de pedido do contratante, e o que acontece se ele exceder o contrato? (checklist 5; Rework RW-030)
- Os obrigatórios do TR estão separados das demandas acrescidas? O obrigatório do TR não se troca sem aditivo (Rework RW-063, observação do leitor).
- Há modo de resolver requisito ambíguo antes de fixar a linha de base? (PMBOK 6, p. 147; checklist 1)
- A validação aponta a evidência de cada requisito (seção do produto, ata, lista de presença), e não só "aprovação do produto"?
- Os requisitos são instáveis? Então o plano prevê técnica mais enxuta ou iterativa até estabilizarem (PMBOK 6, p. 133, PDF 169).

## Erros comuns
- Renumerar os requisitos a cada documento; requisito do TR que some entre o TAP e o PGP (SKILL.md, princípio 9).
- Tratar toda demanda nova como requisito do contrato, sem passar pela mudança (Rework RW-030; RW-067, observação do leitor).
- Tudo "obrigatório", sem margem (Rework RW-063).
- Requisito vago, impossível de testar (Rework RW-031).
- Plano de requisitos de software (módulos, casos de teste) copiado para consultoria sem ajuste (checklist 2, CP8).

## Quando dispensar a parte inteira
O PMBOK 6 não fala em simplificar este plano, mas lembra que as listas de componentes são exemplos (Parte 2, p. 558, PDF 594). Como o app já numera os requisitos e o B23 os rastreia, em porte pequeno o A2 pode ser fundido com o A1 numa seção "Escopo e requisitos" (A2.1, A2.2, A2.4, A2.5, A2.8, A2.9). Em abordagem adaptativa, o backlog faz o papel da lista e o plano diz como ele é priorizado e refinado (PMBOK 6, p. 133, PDF 169; Rework RW-067).
Linha para a tela: "Requisitos junto com o escopo, usando os números R da RFP: porte pequeno (PMBOK 6, Parte 2, p. 558)."

## Ligações
- **Vem de:** 5.1, com TAP (TAP3; p. 135, PDF 171), A5, A17 e A18; etapa 1 (lista R01…, com página); proposta (matriz de atendimento, se houver); A10 (participação na coleta; p. 140, PDF 176).
- **Vai para:** 5.2 (B22, B23), 5.5 e 5.6; 8.1 (A5); 11.2 (riscos ligados a requisitos); 12.2 e 12.3; A11.
- Todos os R passam por aqui; os que pedem matriz, relatório de atendimento ou comprovação têm a validação em A2.5.

## Modelo de redação
```
1. Fontes: TR [item, p.], proposta, contrato; requisitos numerados R01… na leitura da RFP.
2. Requisito novo: registrado como sugestão, sem número R até o aceite de [GP; contratante, se alterar o contrato].
3. Prioridade: obrigatório (TR) | acrescido aceito | desejável. Critério: a definir pelo GP.
4. Mudança: pedido escrito → análise de impacto → decisão de [alçada a definir pelo GP] → A11 ou aditivo.
5. Validação: | R | Evidência de atendimento | Quem confere | Quando |
6. Rastreabilidade (B23): R, origem, objetivo, produto/EAP, validação, situação.
7. Métricas: [ex.: requisitos aceitos / total], no relatório de status.
8. Leitura divergente: pergunta ao contratante; leitura adotada no B3; questão no B9.
```

## Fontes
- PMBOK 6: 5.1.3.2, p. 137 (PDF 173); 5.2, p. 140–148 (PDF 176–184); 5.5, p. 165 (PDF 201); 5.6, p. 169 (PDF 205); p. 133 (PDF 169); Parte 2, p. 558 (PDF 594); glossário, p. 719 (PDF 755).
- PMBOK 7: 2.6, p. 82–83 (PDF 177–178); plano dos requisitos, p. 186 (PDF 281).
- Rework: RW-030 (https://resources.rework.com/libraries/project-management/scope-creep); RW-031 e RW-063 (links nos itens); RW-067 (https://resources.rework.com/libraries/project-management/product-backlog).
- SKILL.md, princípio 9; `checklist.md` (1, 2, 5); `licitacoes.md` 2.7.
