# 0015 — Formato das fichas de artefato da skill PMO

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto (detalha a decisão 0013)

## Contexto

A decisão 0013 pede que o conteúdo mínimo de cada ficha seja uma lista numerada de itens. Cada item traz fonte, sinais no texto, quem confere e quando dispensar. A mesma ficha é lida pelo PMO (para escrever) e pelo código da etapa 5 (para conferir), então o formato precisa ser previsível.

## Decisão

- O modelo completo está em `.claude/skills/pmo/referencias/artefatos/_modelo.md`.
- **Arquivo:** `<codigo>-<nome>.md` (`a07-plano-comunicacoes.md`, `b27-registro-riscos.md`, `tap.md`, `prop-sow.md`).
- **Cabeçalho YAML:** código, nome do PMBOK 6, tipo, etapas, gravidade e categoria na conferência, sinônimos e versão.
- **Seções fixas:** para que serve; conteúdo mínimo; perguntas de qualidade; erros comuns; quando dispensar a parte inteira; ligações; modelo de redação; fontes.
- **Cada item do conteúdo mínimo** é um bloco com quatro linhas fixas: `fonte`, `sinais`, `confere` (`código` ou `só PMO`) e `dispensa` (`nunca` ou condições).
- As **condições de dispensa** usam um vocabulário fechado de características do projeto: porte, abordagem, fases, campo, beneficiários, subcontratação, dados pessoais, frentes, contratante e pagamento. A lista final é fechada na F5, junto com a tela em que o GP as confirma.

## Consequências

- Na F5, o código lê os blocos por padrão de texto. Um teste confere se toda ficha segue o modelo, e falha se algum item estiver sem fonte, sem `confere` ou sem `dispensa`.
- Mudar o formato depois exige atualizar o leitor da F5 e o teste.
