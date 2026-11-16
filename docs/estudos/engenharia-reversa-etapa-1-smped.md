# Engenharia reversa da etapa 1 — chamamento para termo de fomento (SMPED/SP)

Feito em 16/11/2026, com o edital público de `tests/fixtures/rfps-publicas/chamamento-publico-termo-fomento-smped-sp-2025.pdf`.

## 1. Gabarito

O PMO (Claude Code seguindo a skill PMO 0.2.0, sem a chave da API) fez a análise da etapa 1 que este edital deveria ter. Está em `tests/fixtures/gerados/rfp-smped/gabarito-etapa-1.json`:

- 104 itens em 8 seções (identificação, requisitos, prazos, julgamento, habilitação, condições, partes e brechas);
- cada item com rótulo, página e trecho literal;
- 12 brechas com a pergunta de esclarecimento sugerida;
- 4 trechos que **não** são brecha;
- sem nomes de pessoas: o gestor da parceria aparece como "servidora designada".

O teste `tests/etapas/gabarito-etapa-1.test.ts` confere, com o próprio código do app (`conferirCitacao`), que todas as 100 citações estão na página indicada.

## 2. Comparação

O mesmo teste classifica cada item do gabarito contra a saída do app: **acerto**, **parcial** ou **falta**. A coluna da v0.8.0 saiu do mesmo teste rodado no código da tag; é a versão do PDF anexado ao pedido.

| Seção | Itens | Acertos v0.8.0 | Acertos v0.8.2 | Parciais | Faltas |
|---|---|---|---|---|---|
| Identificação | 9 | 3 | 5 | 2 | 2 |
| Requisitos | 20 | 0 | 6 | 1 | 13 |
| Prazos | 19 | 1 | 6 | 1 | 12 |
| Julgamento | 5 | 0 | 2 | 0 | 3 |
| Habilitação | 19 | 8\* | 8 | 1 | 10 |
| Condições | 12 | 1 | 3 | 1 | 8 |
| Partes | 8 | 4 | 4 | 2 | 2 |
| Brechas | 12 | 0 | 0 | 0 | 12 |
| **Total** | **104** | **17** | **34** | **8** | **62** |

\* Na v0.8.0, a "Fazenda Municipal" contava como achada, mas apontava a cláusula 3.3.10 da minuta, não a Tabela 04. O acerto real era 16.

v0.8.2 é a v0.8.1 mais esta correção, em que o objeto passou a ser o 2.1.

### O que o app achou que não devia (falsos positivos)

| Na v0.8.0 | Situação na v0.8.2 |
|---|---|
| R01 era o campo em branco "Local de realização:" do Anexo I | corrigido |
| PcD apontava a justificativa; registro em conselho apontava o código CRC do carimbo SEI; responsável técnico apontava o formulário; atestado apontava a minuta | corrigido |
| Critério de julgamento "não localizado" e 40 linhas misturadas de pontuação | corrigido |
| Brechas no foro, no gestor e no propósito (1.1) | corrigido |
| "Se necessário" no título da etapa 7.4, que tem o prazo no 7.4.1 | corrigido (o gabarito diz que não é brecha) |
| Garantia, reajuste e matriz de riscos "não localizado" | "não se aplica a esta modalidade" |
| "Confidencialidade e LGPD" achada em "Dados Pessoais" do modelo de currículo | **continua** |
| "Agência XX" (campo da minuta) como órgão citado | **continua** |
| "Conselho Municipal da Pessoa" (nome cortado) | **continua** |

## 3. Origem de cada erro

Dos 70 itens que não acertam, **59 uma regra de código resolveria** e **11 só uma leitura com IA**. A regra de cada item está no teste (campo `como`). Agrupadas:

### (a) Regras de código, por ganho

1. **Ler a lista "DOCUMENTAÇÃO OBRIGATÓRIA" linha a linha** (10 itens de habilitação). Cada linha numerada da tabela vira um documento; o catálogo de 31 documentos só dá o grupo. É a regra de maior ganho.
2. **Obrigações da parceira na minuta viram requisitos de execução** (5 itens: gratuidade, entrega do conteúdo, formulários, marca do fomento, três orçamentos). Os itens sob "Compete à PARCEIRA" ou "Obrigações da contratada" entram como requisitos.
3. **Prazos da minuta** como prazos da execução (7 itens: extrato, prestação de contas, alteração, guarda, denúncia). Também:
   - prazos em horas;
   - validade de documentos;
   - regularização;
   - análise da documentação;
   - não juntar prazos de responsáveis diferentes.
4. **Brechas por padrão** (8 itens):
   - "denunciação da lide" e "polo passivo";
   - "a juízo da Administração";
   - "não obriga a Administração" sem valor global;
   - a mesma norma com anos diferentes;
   - "não suspendem os prazos";
   - "a serem definidos pela";
   - prazo contado de um marco sem data, que vira pergunta;
   - início móvel pela publicação do extrato.
5. **Julgamento:** critérios eliminatórios, desempate e causas de eliminação (3 itens).
6. **Identificação e condições:**
   - dotação orçamentária;
   - forma de envio;
   - contratante pelo preâmbulo ("A Prefeitura, por intermédio da Secretaria");
   - valor marcado como "teto por projeto";
   - parcela única;
   - conta e poupança;
   - contrapartida;
   - glosa;
   - bens remanescentes;
   - LGPD só com LGPD, 13.709 ou "proteção de dados".
7. **Partes:** "Comissão de…" e "Chefia de Gabinete"; o nome do órgão vai até a sigla; gestor já designado na minuta.

### (b) Só a leitura com IA (11 itens)

- **Requisitos em texto corrido** (4): propósito que vincula o projeto (1.1), conteúdo mínimo das ações (1.3), originalidade (1.5.1), complementaridade (1.6). Uma regra "o projeto deverá…" traria tanto ruído quanto acerto.
- **Brechas que pedem cruzar trechos distantes** (4):
  - repasse em parcela única × empenho proporcional aos meses;
  - critério aberto de "evidente continuidade";
  - declaração exigida na participação e ausente da lista;
  - "estimativa realizada" que o documento não traz.
- **Equivalência de figuras** (3):
  - a prestação de contas final como o análogo do aceite;
  - contratação de terceiros sem a palavra "subcontratação";
  - despesas admitidas e vedadas espalhadas no edital e na minuta.

### Leitura

As regras ainda dão mais que a IA neste edital. Um sprint de regras (itens 1 a 7) levaria o acerto de 33% (34 de 104) para perto de 85% a 90% neste edital, sem chave e sem custo. O que sobra para a IA é pouco em número, mas inclui as brechas que mais pesam na decisão de participar (a contradição do repasse, a originalidade). Por isso a proposta da decisão 0032 deixa a leitura do PMO como camada **opcional**, por cima das regras.
