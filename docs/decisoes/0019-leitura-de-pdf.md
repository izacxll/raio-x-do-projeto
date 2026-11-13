# 0019 — Leitura de PDF: bibliotecas, OCR local e estado de cada página

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** Claude Code, em nome da responsável pelo projeto

## Contexto

A camada de leitura (seção 6 da especificação) precisa ler texto por página, passar por OCR as páginas em imagem e avisar o que não pôde ser lido. Tudo servido pelo próprio site, por causa da Content-Security-Policy (decisões 0001 e 0003).

## Decisão

**Bibliotecas e versões** (fixadas sem `^`, todas publicadas há mais de duas semanas na data da instalação):

| Uso | Biblioteca | Licença |
|---|---|---|
| Texto, imagens e desenho da página | `pdfjs-dist` 6.4 | Apache-2.0 |
| OCR | `tesseract.js` 7 + `tesseract.js-core` 7 (só as variantes LSTM) | Apache-2.0 |
| Dados do português | `@tesseract.js-data/por`, modelo `4.0.0_best_int` (o mesmo do Raio-X) | Apache-2.0 |
| Fonte do PDF exportado | Arimo (`@expo-google-fonts/arimo`) | SIL OFL 1.1 |

A Arimo mudou de licença (era Apache-2.0, hoje é OFL 1.1). Continua livre para embutir; a decisão 0001 citava a licença antiga.

**Servido pelo próprio site:** `scripts/copiar-ativos-leitura.mjs` copia de `node_modules` para `public/vendor/` (fora do Git) o worker e o núcleo do OCR, os dados do português, os decodificadores em WebAssembly do pdf.js (JBIG2 e JPEG 2000, comuns em PDFs escaneados), as fontes padrão, os mapas de caracteres e a Arimo. O worker do pdf.js entra pelo próprio build. A CSP permite `'wasm-unsafe-eval'` (compilar WebAssembly) e nada de `eval`.

**Estado de cada página** (regra "não achado não é ausente", seção 2):

| Estado | Quando |
|---|---|
| Texto do PDF | 30 letras ou números ou mais na camada de texto |
| OCR | Menos que isso; o OCR leu 30 ou mais com confiança média de 45% ou mais |
| Não verificável | O OCR não achou texto, leu com confiança baixa ou falhou; o motivo fica registrado |

- Página com texto, mas com figura ou tabela grande em imagem, recebe o aviso "tem imagem: conferir no documento". O logotipo que se repete em metade das páginas não conta (regra do Raio-X).
- O texto é montado por linhas pela posição dos pedaços na página. Vão grande entre dois pedaços (coluna de tabela) vira tabulação, para a tabela não virar uma frase só.
- Carimbos de assinatura eletrônica são retirados do texto (regra do Raio-X).

**Reaproveitado do Raio-X** (copiado, com a origem anotada): detecção de imagem de conteúdo e do logotipo repetido, limpeza de carimbos, normalização para comparar trechos e o nome do arquivo a partir do nome do projeto.

**Fica para depois:** o leitor de tabela de preço em imagem do Raio-X (OCR por célula) entra quando a etapa que precisa dele for construída.

## Consequências

- Nenhuma requisição sai do site durante a leitura; o teste de fumaça confere isso no navegador.
- O primeiro OCR baixa cerca de 6 MB (núcleo e dados do português), do próprio site.
- O OCR roda num worker, sem travar a tela, uma página por vez, com progresso e botão de cancelar.
