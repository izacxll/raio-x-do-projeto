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
| `etapas/` | As cinco etapas: documentos pedidos, o que a ferramenta faz, saídas. `1-rfp/`: a análise da RFP (junta os passos 1 a 11) e a revisão do GP. `2-proposta/`: ponto de partida, pedidos ao PMO, cronograma (PERT, caminho crítico, prazos), preço, conferência final e os itens do PMO com a revisão do GP. `3-tap/`: entrada (a proposta do dossiê como documento), divergências RFP × proposta, o que vem dos documentos, pedidos ao PMO, itens e pendências, conferência do TAP. `4-pgp/`: entrada (TAP e proposta como documentos), passos na ordem da decisão 0007, pedidos, itens, contas (cronograma, marcos, custos, rastreabilidade) e a autoconferência. `documento-virtual.ts`: documento gerado na ferramenta como documento "lido". `5-conferencia/`: a leitura opcional do PMO com as travas do código | F0, F1, F2, F3, F4, F5b |
| `leitura/` | PDF página a página (pdf.js), OCR (Tesseract.js), imagens na página, estado de cada página | F0 |
| `texto/` | Normalização para comparar trechos, limpeza de carimbos, nome de arquivo; datas no texto e contas de prazo (dias úteis), frase em volta de uma posição, cabeçalho repetido | F0, F1 |
| `dossie/` | Esquema do dossiê (zod), salvar e abrir, estado do app (zustand) | F0 |
| `exportacao/` | Modelo neutro de documento e os montadores DOCX, PDF e XLSX | F0 |
| `interface/` | Telas, componentes, estilos, tokens e o logo | F0 |
| `extracao/` | Requisitos (produtos rotulados) e prazo total da RFP. `rfp/`: mapa da RFP, quadro da capa, identificação, requisitos (equipe, quantidades, local), prazos do certame e da execução, julgamento, habilitação, temas (apresentação e condições contratuais) e partes interessadas | F5, F1 |
| `regras/` | Busca com página e trecho, mapa do PGP, vago, conflituoso, ausente, conferência; brechas da RFP com a pergunta de esclarecimento (`brechas-rfp.ts`) | F5, F1 |
| `config/` | Modelo, esforço e limites de cada passo do PMO (`modelo.ts`) e tabela de preços (`precos.ts`) | F2 |
| `demonstracao/` | Modo demonstração (decisão 0027): respostas gravadas do PMO para a RFP pública da OEI, empacotadas no build, e a preparação das etapas anteriores | F2 |
| `pmo/` | Único módulo que chama a API (`cliente.ts`); itens do PMO com a conferência, comuns às etapas (`itens.ts`); chave só no `sessionStorage` (`chave.ts`); montagem do pedido com a skill e o texto dos documentos (`montagem.ts`); schemas Zod de cada passo (`schemas/`); custo à vista (`custo.ts`); conferência de citações (`citacoes.ts`) e de redação e números sem fonte (`redacao.ts`) | F2 |

## Fluxo de uma etapa (seção 5.0 da especificação)

1. **Escolher a etapa** na tela inicial (`/`).
2. **Enviar os documentos** (`/#/etapa/N`). A tela diz o que é obrigatório e o que é opcional. Ou abrir um dossiê salvo.
3. **Leitura:** `src/leitura/navegador.ts` abre o PDF com o pdf.js e entrega a `lerDocumento` (`src/leitura/ler-documento.ts`). Página com menos de 30 letras e números vai para o OCR, num worker. Cada página sai com um de três estados: texto do PDF, OCR ou não verificável (decisão 0019).
4. **Resultado** na tela, com o rótulo e a página de cada item. Na F0, o resultado é o mapa da leitura.
5. **Revisão do GP:** cada item tem estado (pendente, aceito, editado, descartado). Entra com as etapas.
6. **Exportar:** o conteúdo vira um `DocumentoExportavel` (`src/exportacao/modelo.ts`), e cada montador gera o seu formato. As bibliotecas são carregadas só na hora do download.
7. **Salvar o dossiê.**

## Etapas com o PMO (etapa 2, decisão 0025; etapa 3, decisão 0028; etapa 4, decisão 0029)

1. O código monta o **ponto de partida** a partir da etapa 1 (ou roda a leitura da RFP, se ela não foi feita).
2. Cada passo do PMO (estratégia → conteúdo → EAP) é um pedido à API: a skill e o texto dos documentos vão com cache; depois vai o pedido do passo. A resposta é JSON estruturado, validado pelo schema.
3. O código confere cada item: citação na página indicada, redação condicional, números sem fonte.
4. O GP decide no meio (abordagem, premissas críticas) e revisa cada item; o código faz as contas (cronograma, prazos, preço) e a conferência final.
5. O uso de cada chamada (tokens e valor) fica no dossiê.
6. Na etapa 3, o código compara a RFP e a proposta (PDF final do GP ou a proposta da etapa 2, que vira um documento com uma "página" por seção), traz o que vem dos documentos e confere o TAP; o PMO redige os 12 elementos e o registro de premissas. Os componentes de passo e de item do PMO são comuns (`interface/componentes/passo-pmo.tsx`, `item-pmo.tsx`).
7. Na etapa 4, seis pedidos ao PMO na ordem da decisão 0007; as fichas vão no pedido de cada passo (o prefixo com a skill e os documentos fica no cache). O código monta as tabelas de cronograma, marcos, custos, designações e rastreabilidade, desenha a EAP e a rede em SVG e roda a autoconferência: o plano gerado, como documento "lido", passa por `conferirPlano` (etapa 5), com o que o GP dispensou marcado como dispensado.
8. Na etapa 5, a leitura do PMO é opcional (decisão 0030): o código confere as citações, procura no plano inteiro o que o PMO diz estar ausente (e rebaixa se achar) e aplica a gravidade e a categoria pela parte.
9. **Demonstração** (decisão 0027): com o dossiê marcado, cada passo carrega a resposta gravada em `tests/fixtures/gerados/<etapa>-oei/`, validada pelo mesmo schema, sem chamar a API.

## Dossiê

Um JSON (`<projeto>.dossie.json`, decisão 0010) com tudo o que foi lido, sugerido e decidido:

- `formato`, `versaoFormato`: identificam o arquivo e permitem migrar formatos antigos;
- `versaoApp`, `versaoSkill`: as versões que geraram o conteúdo;
- `projeto`: nome;
- `documentos`: cada PDF lido, com o papel (RFP, anexo, proposta, TAP, PGP) e o texto de cada página, com o estado e o motivo;
- `itens`: os itens rotulados (do documento, sugestão, decisão do GP), com estado de revisão e origem (documento, página, trecho);
- `analiseRfp`, `conferencia`, `proposta`: o que cada etapa produziu e o que o GP decidiu (a proposta guarda também o uso da API).

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
| Fumaça no navegador, sobre o build, com a CSP ativa (inclui o OCR e a etapa 2 com a API simulada) | `tests/fumaca/` | `npm run build && npm run test:fumaca` |
| Etapa 2 sem chave: API simulada no formato de streaming e respostas do PMO geradas no Claude Code | `tests/pmo/`, `tests/etapas/proposta.test.ts`, `tests/ajudantes/api-simulada.ts` | `npm test` |
| Comparação de modelos com a chave (gasta crédito) | `tests/pmo/comparacao-modelos.test.ts` | `npm run comparar-modelos` |
