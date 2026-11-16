# Placar da fase M1 — etapa 1 pelo método

Feito em 16/11/2026 pelo teste `tests/etapas/metodo-etapa-1.test.ts` (roda a cada `npm test`), com os editais públicos da SMPED (chamamento para termo de fomento, parceria) e da OEI (concorrência técnica e preço, licitação). Hoje = 16/11/2026.

## O que este placar mede (e o que não mede)

**Os gabaritos e a leitura gravada foram feitos pelo Claude Code, seguindo a skill PMO**, não por uma pessoa nem por uma leitura independente. Por isso o placar mede duas coisas: o **esqueleto do código** (o que vai no pedido ao PMO) contra esses gabaritos, e as **travas** (o código pegando citação falsa, número trocado, R inventado e conta do PMO). Ele **não mede a qualidade da leitura do PMO**: isso só com a chave e com um gabarito feito pela responsável (roteiro da etapa 5 em `roteiro-etapa-5-plano-real.md`; a comparação de modelos para a etapa 1 entra quando a chave chegar).

## Como se mede

- **Gabarito:** a leitura feita pelo PMO na estrutura do método, 50 itens nas seções 1 a 7 de cada edital (`tests/fixtures/gerados/rfp-smped/` e `rfp-oei/`, `gabarito-metodo-etapa-1.json`). Cada item tem página, trecho literal (todos achados pelo código na página) e de 1 a 3 "chaves", expressões que o item precisa ter.
- **Antes:** a análise da v0.8.3 (inventário), com os requisitos daquela versão.
- **Depois:** o esqueleto do código na estrutura nova, sem a leitura do PMO. Na M1, era o que a tela mostrava sem a chave; desde a decisão 0037, ele só vai no pedido ao PMO.
- **Item coberto:** algum item da saída tem a maioria das chaves do item do gabarito (2 de 3, 1 de 2). "Pleno": todas as chaves.
- **Item que passa no teste do método:** casa com algum item do gabarito. O que não casa é o que a saída mostra e o PMO não mostraria.
- **Número sem fonte:** número do texto de um item que não está no trecho, na tabela nem na página citada (contas do código ficam de fora: são conferidas pela regra que as fez).

## Resultado

Os números abaixo são a fonte dos que aparecem na decisão 0035, no CHANGELOG e no andamento.

| | SMPED antes | SMPED depois | OEI antes | OEI depois |
|---|---|---|---|---|
| Itens na tela | 122 | 40 cartões + 16 R | 183 | 39 cartões + 16 R |
| Passam no teste do método | 40 | 34 | 81 | 36 |
| Não passam | 82 | 6 | 102 | 3 |
| Gabarito coberto (maioria das chaves) | 15 de 50 | 28 de 50 | 30 de 50 | 35 de 50 |
| Gabarito coberto por inteiro | 5 | 12 | 9 | 20 |
| Números sem fonte | — | 0 | — | 0 |
| Citações da leitura não conferidas | — | 0 | — | 0 |

Cobertura por seção (itens do gabarito cobertos na seção certa):

| Seção | SMPED (gabarito / antes / depois) | OEI (gabarito / antes / depois) |
|---|---|---|
| 1. Em uma página | 9 / 5 / 5 | 8 / 6 / 5 |
| 2. O que fazer e entregar | 9 / 1 / 2 | 11 / 3 / 4 |
| 3. Prazos | 7 / 4 / 5 | 4 / 1 / 1 |
| 4. Dinheiro | 6 / 2 / 3 | 5 / 4 / 3 |
| 5. Julgamento | 4 / 0 / 3 | 6 / 4 / 5 |
| 6. Habilitação | 4 / 0 / 2 | 5 / 3 / 2 |
| 7. Pontos de atenção | 11 / 3 / 3 | 11 / 9 / 7 |

Na coluna "antes", a cobertura conta o item em qualquer seção (a v0.8.3 não tinha as seções do método).

"Passam" e "não passam" contam os **cartões**. Os requisitos R são linhas de uma tabela da seção 2 e ficam fora dessa conta: dos 16 R, 11 (SMPED) e 6 (OEI) não casam sozinhos com um item do gabarito, porque o gabarito junta num item o tema que o app separa em vários R (as obrigações de prestação de contas, por exemplo).

## Com a leitura do PMO (gravada)

- A leitura gravada vem do próprio gabarito, então ela não mede a qualidade do PMO de verdade: isso só com a chave (decisão 0035).
- O que ela mede são as travas, endurecidas depois da revisão independente:
  - todo item do PMO é Sugestão, com a marca "citação conferida" quando o código acha o trecho na página;
  - o número vale só se estiver no trecho conferido, na cláusula em volta dele (até 400 caracteres de cada lado) ou no esqueleto da mesma seção; a página inteira não vale mais;
  - soma, acumulado, "sobram" e contas parecidas deixam o item "conta feita pelo PMO".
- Com a leitura gravada, a tela fica com 50 cartões + 16 R (SMPED) e 51 cartões + 16 R (OEI). As travas marcaram 13 e 16 itens: contas do próprio PMO (datas a partir de hoje, dias que sobram da vigência, percentuais acumulados) e números tirados de outra página sem citá-la. É o que se espera: o GP confere esses itens antes de aceitar.
- Erros plantados: citação inventada; número trocado (R$ 250.000); números pequenos e comuns ("45 dias", "12 parcelas de 8%", "7 profissionais e 3 produtos"); R que não existe (R99); conta do PMO ("faltam 413 dias", "somam 55% (25% + 30%)"); item "Do documento" sem fonte; item marcado "decisão do GP" pelo PMO. As travas pegaram todos, e nenhum item do PMO aparece como "Do documento" nem como "Decisão do GP".

## O que o esqueleto ainda não pega (fica para a leitura do PMO)

- Cruzar trechos distantes: na SMPED, a "parcela única" (6.7.8 e 8.6) contra o repasse mensal do Quadro 11 da minuta.
- Obrigações escritas no meio de uma frase sobre outro assunto (os formulários de satisfação da SMPED, 6.6).
- A ordem de impacto fina dos pontos de atenção e o "por que pesa" escrito para o caso.
- As datas que o documento não traz (a publicação do edital da SMPED): o código diz que são contadas de marcos sem data e pede para conferir.

## Para a responsável conferir antes do merge (10 itens)

Cinco itens de cada gabarito, de seções diferentes. Para cada um, abra o PDF na página indicada (`tests/fixtures/rfps-publicas/`) e veja se o resumo está certo e se falta algo que pese. Um erro aqui quer dizer que o gabarito, e portanto o placar, precisa ser revisto.

| Edital | Item | O que o gabarito diz | Páginas |
|---|---|---|---|
| SMPED | UP-06 Valor | Até R$ 200.000,00 de repasse por projeto; o valor exato sai do projeto e fica no termo. O documento não declara o valor global do chamamento. Liberação integral em parcela única (itens 6.7.8 e 8.6); a minuta tem outra leitura (AT-01). | 1, 8 |
| SMPED | DI-02 Cronograma de desembolso | Parcela única de 100%, prazo não informado. Ressalva: a cláusula 2.3 da minuta manda pagar pelo Quadro 11 (repasse mês a mês) e o item 8.2 fala em empenho proporcional aos meses do exercício. | 5, 12 |
| SMPED | JU-02 Eliminação e desempate | Eliminada: nota abaixo de 40; desacordo com o edital; valor incompatível; IRREGULAR em A, B ou C; documento falso. Desempate: F, depois E, I, D e L; por fim, sorteio. | 5, 9 |
| SMPED | AT-01 Repasse com duas leituras | Parcela única (6.7.8 e 8.6) × pagamento pelo Quadro 11, mês a mês (cláusula 2.3 da minuta), e empenho proporcional (8.2). | 8, 17 |
| SMPED | AT-11 Proteções da contratada | Prorrogação de ofício pelo atraso do repasse (13.3); despesas compensadas quando o recurso chegar (8.12 e 2.12); meta em parte pode ser justificada (7.4.1); a Administração não interfere na seleção da equipe (2.11); sem juros de mora depois dos 150 dias de análise (7.12.2). | 24, 8, 20, 18 |
| OEI | UP-06 Como se ganha | Técnica e preço, 70% e 30%: PF = (IT × 7) + (IP × 3). Técnica até 100 (empresa 20, metodologia 50, equipe-chave 30); abaixo de 50, desclassificada. Habilitação só do 1º classificado. | 37, 36 |
| OEI | FE-05 Produto 5 — Guia | Entrega em até 300 dias da assinatura; 30% do valor; conteúdo mínimo do guia; aceite por ateste e aprovação. | 20 |
| OEI | DI-02 Desembolso por produto | 5% (D+30), 20% (D+75), 20% (D+135), 25% (D+210), 30% (D+300); acumulado 5, 25, 45, 70 e 100%. | 21, 10 |
| OEI | JU-04 Quesito 3 — Equipe-chave | Coordenador(a) 10 pontos (perfil mínimo 4; doutorado 2; anos adicionais até 2; produção até 2); três especialistas com 7, 7 e 6; só pontua o que vier com comprovante. | 32, 36 |
| OEI | AT-05 Produtos em cascata | Todos os prazos contam da assinatura; o Produto 4 consolida os cadernos e o guia parte dele; sobram cerca de 65 dias entre D+300 e o fim da vigência; prorrogação: o TR veda a automática, a minuta prorroga até a conclusão. | 20, 23, 53 |
