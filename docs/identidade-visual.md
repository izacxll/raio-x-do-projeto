# Identidade visual

A cara do app segue a apresentação do Raio-X do Projeto (fora do Git, em `referencias/identidade/`). O app é ferramenta, não apresentação: usa a identidade, mas sem animações de zoom, sem as bolinhas da visão geral e sem a varredura do fundo. Precisa funcionar bem em notebook e ser fácil de ler por horas.

## Onde ficam os tokens

**Um arquivo só:** [`src/interface/estilos/tokens.css`](../src/interface/estilos/tokens.css). Cores, fonte, tamanhos de texto, espaços e formas ficam ali, como variáveis CSS.

- A interface usa só `var(--...)`. O ESLint recusa cor escrita direto no código (`#RRGGBB`) e um teste procura cores soltas em CSS e TSX.
- A exportação (DOCX, XLSX e PDF) não enxerga variáveis CSS. Ela lê as cores do mesmo `tokens.css` por [`src/interface/tokens.ts`](../src/interface/tokens.ts) (`cor("navy")` devolve `003A79`). Por isso cada cor fica numa linha no formato `--nome: #RRGGBB;`.

## Cores

| Token | Valor | Uso |
|---|---|---|
| `--navy950` | `#002D4D` | Trilho lateral, textos de maior destaque |
| `--navy` | `#003A79` | Títulos, botão cheio, etiqueta "Do documento", cabeçalho das tabelas |
| `--navy700` | `#0C63AA` | Rótulos de seção, tipo "vago" |
| `--blue` | `#008BC9` | Destaque do título, setas, foco, progresso, tipo "conflituoso" |
| `--celeste` | `#73BFE8` | Texto sobre o trilho escuro |
| `--paper` | `#E6EDF5` | Fundo da página |
| `--white` | `#FFFFFF` | Cartões |
| `--bd` | `#B9C7D8` | Borda dos cartões e das tabelas exportadas |
| `--txt` | `#3F4A57` | Texto corrido |
| `--ink` | `#5C5B5F` | Texto secundário, gravidade baixa |
| `--vinho` | `#9B0A51` | Gravidade grave, "Obrigatório", cabeçalho de minuta |
| `--laranja` | `#E29200` | Gravidade média, etapa 5, borda de "Decisão do GP" |
| `--laranja-claro` | `#FDF1D8` | Fundo de "Decisão do GP" e das páginas não verificáveis |
| `--laranja-txt` | `#633806` | Texto sobre laranja-claro |
| `--soft`, `--mist`, `--line`, `--line4` | | Fundos e linhas leves |

**Faixa em degradê:** de `#008BC9` a `#003A79` (`--grad`), no topo da página e no sublinhado dos títulos.

## Fonte

`"Gotham", Arial, sans-serif`. A Gotham é paga e o repositório é público: **os arquivos dela nunca entram no Git.** Ela aparece só para quem a tem instalada; os outros veem Arial. No PDF exportado entra a Arimo (SIL OFL 1.1), que tem as mesmas medidas da Arial.

Tamanhos de texto: nada abaixo de 12 px (rótulos em maiúsculas espaçadas); texto corrido em 15 px.

## Componentes

| Elemento | Onde |
|---|---|
| Faixa em degradê no topo (4 px) | `.faixa-topo` |
| Logo da FGV Projetos no cabeçalho (copiado como está, decisão 0012) | `src/interface/ativos/logo-fgv-projetos.jpg` |
| Trilho escuro à esquerda, com o número e o nome da etapa | `.trilho` |
| Rótulo de seção em maiúsculas espaçadas, com o quadradinho colorido | `.rotulo-secao` |
| Título com o sublinhado em degradê | `.titulo` |
| Cartão branco, com borda de cor à esquerda | `.cartao`, `.cartao--borda` |
| Cartões de etapa ligados por setas (tela inicial) | `.cartao-etapa` |
| Grade técnica bem leve no fundo, fixa | `body` |

## Etiquetas

| Etiqueta | Aparência | Classe |
|---|---|---|
| Do documento (com a página) | azul-marinho cheio, texto branco | `.etiqueta--documento` |
| Sugestão | branco, borda azul | `.etiqueta--sugestao` |
| Decisão do GP | laranja-claro, borda laranja | `.etiqueta--decisao-gp` |
| Grave | vinho | `.etiqueta--grave` |
| Média | laranja | `.etiqueta--media` |
| Baixa | cinza | `.etiqueta--baixa` |

Os três tipos da etapa 5 usam tons de azul: vago (`--tipo-vago`), conflituoso (`--tipo-conflituoso`) e ausente (`--tipo-ausente`).

## Documentos exportados

- Logo da FGV Projetos no cabeçalho.
- Enquanto houver item pendente, o cabeçalho traz, em vinho: **"Minuta — sugestões geradas por ferramenta, sujeitas à validação do Gerente do Projeto"**.
- Rodapé com a versão do app, a versão da skill PMO e a data.
- Títulos em azul-marinho, tabelas com cabeçalho azul-marinho e bordas `--bd`, texto em `--txt`, fonte Arial (DOCX e XLSX) ou Arimo (PDF).
