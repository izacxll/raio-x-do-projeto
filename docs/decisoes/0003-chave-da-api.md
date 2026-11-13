# 0003 — Chave só em `sessionStorage`; "lembrar neste navegador" desativado

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto

## Contexto

Cada GP cola a própria chave da API, que fica só no navegador. A especificação previa duas opções: "só nesta sessão" (`sessionStorage`, padrão) e "lembrar neste navegador" (`localStorage`).

No GitHub Pages, todos os sites de uma mesma conta compartilham a mesma origem (`<conta>.github.io`). O que um site grava em `localStorage` pode ser lido por qualquer outro site da mesma conta. Conferido com o GitHub CLI em 13/11/2026: **a conta tem outros 5 sites no Pages.**

## Decisão

- **Só existe a opção "só nesta sessão"** (`sessionStorage`).
- **"Lembrar neste navegador" fica desativado** até o app ter endereço próprio. A tela mostra a opção desabilitada, com o motivo.
- O botão "Esquecer a chave" fica sempre visível.
- A chave nunca vai para o código, o repositório, o dossiê, os documentos exportados ou os logs.

## Risco que sobra

O `sessionStorage` é por aba e por origem. Se o GP abrir outro site da mesma conta **na mesma aba**, esse site consegue ler a chave. Por isso a tela orienta a usar o app numa aba própria e a esquecer a chave ao terminar.

## Saídas para o futuro

Qualquer uma delas dá ao app uma origem só dele. Com isso, "lembrar neste navegador" pode voltar, com o aviso:

1. **Mover o repositório para uma organização do GitHub só dele.** O site ganha o endereço `<organizacao>.github.io`, sem precisar de domínio.
2. **Domínio próprio** apontado para o GitHub Pages.

## Consequências

- O GP cola a chave de novo a cada sessão do navegador.
- A Content-Security-Policy (conexão só com o próprio site e com `api.anthropic.com`) e a ausência de scripts de terceiros continuam valendo nas duas situações.
