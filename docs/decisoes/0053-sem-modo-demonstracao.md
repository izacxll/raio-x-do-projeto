# 0053 — Sem modo de demonstração no site

- **Data:** 17/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (17/11/2026)
- **Substitui:** a decisão 0027 (modo demonstração) e, na decisão 0037, a demonstração como alternativa à conexão

## Contexto

O modo demonstração (decisão 0027) existia para apresentar o app sem a chave da API. Ele mostrava as respostas do PMO gravadas para a RFP pública da OEI, em todas as etapas, e na etapa 5 um plano inventado com erros plantados. Na prática, a apresentação passou a ser feita com a skill PMO na conversa. A demonstração ficou como um segundo caminho que o GP pode confundir com o uso real. Ela também levava ao site as respostas gravadas, o PDF da OEI e um aviso no cabeçalho de todos os exportados.

## Decisão

1. **A apresentação do app é feita com a skill PMO na conversa; o site não tem modo de demonstração.**
2. **No site saem:**
   - o botão "Ver demonstração" de todas as etapas;
   - a faixa amarela do topo;
   - os textos que falavam da demonstração na tela e nos relatórios;
   - o aviso no cabeçalho dos exportados;
   - o campo `demonstracao` do dossiê (um dossiê antigo com o campo abre sem ele);
   - a cópia do PDF da OEI para o build.
3. **Sem a conexão com o Claude, nada é analisado** (decisão 0037): a única opção é conectar a chave.
4. **As respostas gravadas da OEI ficam só como material dos testes automáticos**, fora do build do site:
   - os testes de unidade as leem do disco (`tests/ajudantes/gravadas.ts`);
   - os testes de fumaça as servem pela rota do Playwright, com uma chave falsa, como se fossem a API (`tests/fumaca/pmo-simulado.ts`).
5. **Os 77 vereditos da leitura gravada da etapa 5** continuam marcados como escritos pelo Claude Code, a revisar pelo PMO (decisão 0052).

## Consequências

- **Fumaça sem demonstração:**
  - a etapa 1 lê a RFP da OEI e analisa com o PMO simulado;
  - a etapa 4 passa pelas etapas 2 e 3 no mesmo dossiê, também com o PMO simulado;
  - a etapa 5 confere um edital público como plano, e o PMO simulado confirma os achados do código listados no pedido;
  - saem os testes de demonstração das etapas 2 e 3, porque os testes com a API simulada já cobrem as duas.
- **O build** não leva nenhuma resposta gravada nem o PDF da OEI.
