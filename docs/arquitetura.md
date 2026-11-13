# Arquitetura

O Raio-X do Projeto é uma aplicação estática (TypeScript + React + Vite), publicada no GitHub Pages. Tudo roda no navegador do GP: os PDFs nunca vão para um servidor próprio. Só as etapas com o PMO (2, 3 e 4, a partir da F2) enviam conteúdo, direto do navegador para a API do Claude, com a chave do GP.

## Código × PMO

| Camada | Faz | Onde |
|---|---|---|
| Código | ler PDF, extrair, contar, comparar, conferir, calcular, montar documentos | `src/leitura`, `src/texto`, `src/extracao`, `src/regras`, `src/exportacao` |
| PMO (API do Claude, chave do GP) | criar ou interpretar: estratégia, conteúdo técnico, EAP, estimativas, redação do TAP e do PGP | `src/pmo` + `.claude/skills/pmo/` |

As etapas 1 e 5 rodam só com código e sem chave.

## Pastas de `src/`

| Pasta | O que tem | Desde |
|---|---|---|
| `dominio/` | A skill lida no build: fichas (partes do PGP, conteúdo mínimo, gravidade, categoria), premissas críticas e características do projeto | F5 |
| `etapas/` | As cinco etapas: documentos pedidos, o que a ferramenta faz, saídas. Cada etapa terá aqui a sua pasta | F0 |
| `leitura/` | PDF página a página (pdf.js), OCR (Tesseract.js), imagens na página, estado de cada página | F0 |
| `texto/` | Normalização para comparar trechos, limpeza de carimbos, nome de arquivo | F0 |
| `dossie/` | Esquema do dossiê (zod), salvar e abrir, estado do app (zustand) | F0 |
| `exportacao/` | Modelo neutro de documento e os montadores DOCX, PDF e XLSX | F0 |
| `interface/` | Telas, componentes, estilos, tokens e o logo | F0 |
| `extracao/` | Requisitos (produtos rotulados) e prazo total da RFP | F5 |
| `regras/` | Busca com página e trecho, mapa do PGP, vago, conflituoso, ausente, conferência | F5 |
| `pmo/` | Chamada à API (`cliente.ts`), chave, montagem com a skill, schemas | F2 |

## Fluxo de uma etapa (seção 5.0 da especificação)

1. **Escolher a etapa** na tela inicial (`/`).
2. **Enviar os documentos** (`/#/etapa/N`). A tela diz o que é obrigatório e o que é opcional. Ou abrir um dossiê salvo.
3. **Leitura:** `src/leitura/navegador.ts` abre o PDF com o pdf.js e entrega a `lerDocumento` (`src/leitura/ler-documento.ts`). Página com menos de 30 letras e números vai para o OCR, num worker. Cada página sai com um de três estados: texto do PDF, OCR ou não verificável (decisão 0019).
4. **Resultado** na tela, com o rótulo e a página de cada item. Na F0, o resultado é o mapa da leitura.
5. **Revisão do GP:** cada item tem estado (pendente, aceito, editado, descartado). Entra com as etapas.
6. **Exportar:** o conteúdo vira um `DocumentoExportavel` (`src/exportacao/modelo.ts`), e cada montador gera o seu formato. As bibliotecas são carregadas só na hora do download.
7. **Salvar o dossiê.**

## Dossiê

Um JSON (`<projeto>.dossie.json`, decisão 0010) com tudo o que foi lido, sugerido e decidido:

- `formato`, `versaoFormato`: identificam o arquivo e permitem migrar formatos antigos;
- `versaoApp`, `versaoSkill`: as versões que geraram o conteúdo;
- `projeto`: nome;
- `documentos`: cada PDF lido, com o papel (RFP, anexo, proposta, TAP, PGP) e o texto de cada página, com o estado e o motivo;
- `itens`: os itens rotulados (do documento, sugestão, decisão do GP), com estado de revisão e origem (documento, página, trecho).

O dossiê guarda o texto, não o PDF. **Nunca guarda a chave da API:** o esquema não tem campo para ela, e o que não está no esquema é descartado ao salvar e ao abrir.

## Segurança

- Content-Security-Policy numa `<meta>` do `index.html` publicado (o Pages não deixa configurar cabeçalhos): conexão só com o próprio site e com `api.anthropic.com`; scripts só do próprio site; WebAssembly permitido, `eval` não.
- Nenhum CDN: o worker e o núcleo do OCR, os dados do português, os auxiliares do pdf.js e a fonte do PDF são copiados de `node_modules` para `public/vendor/` antes de cada build (`scripts/copiar-ativos-leitura.mjs`).
- `scripts/verificar-repositorio.mjs` roda no CI e barra PDF, DOCX, XLSX, ZIP e dossiê fora das pastas permitidas, DOC e XLS, arquivos de `referencias/` e texto com cara de chave.

## Testes

| Tipo | Onde | Roda com |
|---|---|---|
| Unidade e integração (Node) | `tests/**/*.test.ts` | `npm test` |
| Leitura das RFPs públicas de teste | `tests/leitura/rfps-publicas.test.ts` | `npm test` |
| Fumaça no navegador, sobre o build, com a CSP ativa (inclui o OCR) | `tests/fumaca/` | `npm run build && npm run test:fumaca` |
