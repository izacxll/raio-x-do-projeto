# 0058 — "Citação não prova" vira aviso, com menos alarme falso

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026), a partir da rodada 3 do teste externo, etapa 1

## Contexto

Na etapa 1 da rodada 3, a trava "citação não prova" (decisão 0057) disparou 10 vezes, e 8 eram alarmes falsos:
- a data do item em dd/mm/aaaa estava por extenso no trecho;
- o item falava de e-mail, e o trecho trazia o endereço;
- o termo estava noutro trecho do mesmo item ou numa forma vizinha ("serviços/equipamentos");
- números calculados pelo código ("34 dias úteis", a data de fim da vigência) contavam como termo-chave.

A "citação fraca" marcou um trecho de 6 palavras como se tivesse menos, porque a contagem ignorava as palavras de uma letra.

O vigia também parou na etapa 1: exportava o pedido da segunda instância a partir do PDF, sem o dossiê onde a resposta tinha sido importada.

## Decisão

1. **Termo-chave:**
   - é o número com unidade, a data (numérica ou por extenso) ou a periodicidade, pelo radical;
   - o que está entre aspas deixa de ser obrigatório;
   - sem termo-chave, vale uma palavra longa do item pelo radical, ou o endereço de e-mail ou o telefone quando o item fala deles.
2. **Procura:** o termo-chave é procurado em todos os trechos do item.
3. **Números do código:** número ou data que está no esqueleto do código, ou num trecho do item marcado "conta do código", não é termo-chave. Se todos os termos-chave do item vêm do código, não há o que o trecho prove.
4. **Aviso, não erro:**
   - na etapa 1, deixa de ser trava e vira o aviso "citação a conferir", que o placar lista à parte;
   - nas etapas 2 a 4, não conta entre os fatos sem citação, não muda a situação da conferência do TAP e mantém a página no rótulo;
   - continua visível ao lado do item, para o GP.
5. **Citação fraca:** toda palavra conta, inclusive a de uma letra.
6. **Segunda instância da etapa 1:** o script recusa o pedido sem `--dossie`, e o vigia passa o dossiê da cadeia.

## Consequências

- Na rodada 3, etapa 1, sobra um aviso (a justificativa de notória especialização, cujo trecho não sustenta a frase) e nenhuma trava.
- A regra 19 da skill passa a citar a chamada da segunda instância do app só depois do teste, junto com as outras lições.
