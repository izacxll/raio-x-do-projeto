# Gabarito dos testes ponta a ponta

Primeira camada da revisão (`docs/papeis.md`): os achados **confirmados** de cada caso, por etapa, que o app tem de continuar achando. Roda na CI, sem a API (`tests/pmo/gabarito.test.ts`). **Achado que some deixa o teste vermelho.**

## Regras

- **Caso público:** RFP publicada oficialmente, com a fonte (link) e a data do download no arquivo do caso, como em `tests/fixtures/rfps-publicas/`.
- **Caso não confirmado como público:** só **disfarçado**. Nada de órgão, município, evento, pessoa ou trecho literal do documento real; os números e as datas são inventados e as entradas são montadas à mão. O caso real fica fora do Git (`referencias/estudos-externos/`, decisão 0049).
- **Só entra achado confirmado:** pelo GP no teste, ou pela correção que o código recebeu por causa dele.
- Cada achado diz se **tem de aparecer** (`"aparece": true`) ou se é um **alarme falso que não pode voltar** (`"aparece": false`).

## Formato (`<caso>.json`)

```json
{
  "caso": "estudo-de-evento-disfarcado",
  "publico": false,
  "fonte": null,
  "data": null,
  "descricao": "…",
  "achados": [
    {
      "id": "EV-3-01",
      "etapa": 3,
      "camada": "codigo",
      "o_que": "o que tem de aparecer (ou não), em palavras",
      "padrao": "expressão regular procurada na saída",
      "aparece": false,
      "secao": "onde aparece (placar, seção, verificação)",
      "gravidade": "alta | media | baixa",
      "pagina": null,
      "verificador": "marcos-tap",
      "entrada": {}
    }
  ]
}
```

- **`camada: "codigo"`:** o `verificador` roda a regra do código sobre a `entrada` (inventada) e procura o `padrao` na saída. Os verificadores estão no topo de `tests/pmo/gabarito.test.ts`.
- **`camada: "pmo"`:** o achado é da leitura do PMO. Ele é conferido contra uma **resposta gravada** (`"resposta": "respostas/<caso>/<arquivo>.json"`, opcionalmente só no `"campo"` dado). Sem a resposta gravada, o teste fica pendente (`todo`), à espera de uma rodada com um caso público ou disfarçado.
- **`pagina`:** a página do documento disfarçado ou público, quando houver; `null` quando a entrada é montada à mão.

## Como acrescentar

1. Confirme o achado no teste (GP ou correção do código).
2. Escreva a entrada disfarçada ou aponte a página do caso público.
3. Rode `npx vitest run tests/pmo/gabarito.test.ts` antes e depois da mudança que o achado protege.
