# 0018 — Publicação no GitHub Pages e prévia da fase antes do merge

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto

## Contexto

A decisão 0005 manda testar cada fase antes do merge na `main`, e a responsável pelo projeto pediu o link do GitHub Pages ao fim da F0. Só a `main` publica automaticamente; esperar o merge para ter o link inverteria a ordem "testar → aprovar → merge".

## Decisão

- **Endereço:** `https://izacxll.github.io/raio-x-do-projeto/`, publicado pelo GitHub Actions (`.github/workflows/publicar.yml`), com a fonte do Pages em "GitHub Actions".
- **Publicação normal:** a cada push na `main` (isto é, a cada merge de PR).
- **Prévia da fase:** o mesmo workflow pode ser disparado à mão (`workflow_dispatch`) na branch da fase. O ambiente `github-pages` aceita, além da `main`, as branches `fase/*`. O link de teste é o mesmo endereço.
- **Depois do merge,** a publicação da `main` substitui a prévia.
- O workflow roda a verificação do repositório (decisão 0010) antes do build.

## Consequências

- Enquanto uma prévia está no ar, o endereço mostra a versão da branch da fase, não a da `main`. Como só existe um usuário de teste por vez (a responsável pelo projeto) e o app não guarda nada em servidor, isso não tem efeito colateral.
- Correções (`correcao/*`) não ganham prévia; se precisarem, a regra do ambiente pode ser ampliada.
