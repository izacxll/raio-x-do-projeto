# Caminho dos dados

Uma página para a comissão: o que sai do computador do gerente, para onde vai, o que fica guardado e o que nunca entra no repositório.

## Em uma frase

Os PDFs são lidos no navegador do gerente. O texto só vai à API da Anthropic quando o gerente pede a análise de uma etapa: o app mostra antes o aviso e o custo estimado, e depois o uso real. Nada é gravado num servidor da FGV ou do projeto. O trabalho fica num arquivo (o dossiê) que só o gerente guarda.

## O caminho, passo a passo

| Passo | Onde acontece | O que sai do computador |
|---|---|---|
| Ler os PDFs (texto, tabelas, OCR) | no navegador do gerente | nada |
| Contas, datas, números R e C, conferência das citações | no navegador (código) | nada |
| Análise do PMO de uma etapa | API da Anthropic (`api.anthropic.com`) | o texto dos documentos da etapa, a skill e o pedido do passo, só quando o gerente pede |
| Guardar o trabalho | arquivo `<projeto>.dossie.json`, salvo pelo gerente | nada (o arquivo fica com ele) |
| Exportar (Word, PDF, Excel) | no navegador | nada |

## O que fica guardado, e onde

- **No navegador:**
  - a chave da API fica só na sessão do navegador (`sessionStorage`) e some ao fechar a aba;
  - "Lembrar neste navegador" está desativado (decisão 0003);
  - o botão "Esquecer a chave" está sempre visível.
- **No dossiê:** o trabalho da etapa (respostas do PMO, revisões do gerente, uso de tokens). A chave nunca entra nele, nem nos documentos exportados nem nos registros.
- **Na Anthropic:** o que a API recebeu e respondeu, pela política da Anthropic (abaixo).
- **No repositório (público):** só o código, os testes com editais públicos e os exemplos inventados. Nenhuma RFP privada, proposta, TAP ou plano escrito por pessoas da FGV entra no Git (seção 4 do CLAUDE.md). Antes de cada publicação, uma varredura automática barra:
  - trechos de seis palavras iguais aos dos documentos dos casos;
  - nomes;
  - chaves.

## Política da Anthropic para a API (consultada em 18/11/2026)

- **Treino:** os dados de clientes comerciais da API não são usados para treinar modelos sem permissão expressa ("Retained data is never used for model training without your express permission", documentação da API).
- **Retenção padrão:** entradas e saídas da API são apagadas em até 30 dias depois de recebidas ou geradas ("automatically delete inputs and outputs on our backend within 30 days of receipt or generation", política de retenção comercial). As exceções são:
  - conteúdo sinalizado pelos sistemas automáticos de segurança, que pode ficar até 2 anos;
  - obrigação legal.
- **Retenção zero (ZDR):** num acordo de retenção zero, a Anthropic não guarda as entradas e as saídas depois de devolver a resposta. O acordo é pedido pela organização. Alguns modelos novos ("Covered Models") exigem 30 dias de retenção e ficam fora da retenção zero.
- **Cache de prompt** (que o app usa para baratear os passos seguintes): compatível com a retenção zero, segundo a tabela da documentação.

Fontes:
- [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) (documentação da API)
- [How long do you store my organization's data?](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-personal-data) (política de retenção comercial)

Os textos dessas páginas mudam. O que vale para a FGV é o contrato da organização da FGV no Claude Console: conferir com o jurídico e com TI se cabe pedir a retenção zero.

## Proteções técnicas do site

- **Content-Security-Policy:** o navegador só deixa o site se conectar a ele mesmo e a `https://api.anthropic.com`. Nenhum script de terceiros, nenhum CDN, nenhum formulário que envie dados para fora (`vite.config.ts`).
- **Bibliotecas servidas pelo próprio site:** OCR, leitura de PDF e dados do português.
- **Chamada à API isolada num módulo só** (`src/pmo/cliente.ts`), com a chave de cada gerente, da organização da FGV no Claude Console.

## O que a comissão pode pedir para conferir

- A política no próprio site publicado (a `<meta>` de Content-Security-Policy na página).
- A varredura antes de cada publicação e o CI, que falha se aparecer arquivo proibido ou texto com cara de chave.
- O histórico do repositório: nenhum documento dos casos (decisões 0010 e 0020).
