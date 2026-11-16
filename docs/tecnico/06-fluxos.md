# 06 — Fluxos críticos

Os cinco caminhos que mais pesam no app, de ponta a ponta, com as funções que cada passo chama.

## 1. Leitura de um PDF

A página com menos de 30 letras e números vai para o OCR. Cada página sai com um de três estados: texto, OCR ou não verificável (decisão 0019).

```mermaid
sequenceDiagram
  actor GP
  participant Tela as Tela da etapa
  participant Nav as leitura/navegador.ts
  participant PDF as pdf.js (worker)
  participant OCR as Tesseract.js (worker)
  participant Store as dossie/store.ts
  GP->>Tela: escolhe o PDF
  Tela->>Nav: lerPdfNoNavegador(arquivo)
  Nav->>PDF: abre o documento
  loop cada página
    Nav->>PDF: texto da página
    alt menos de 30 letras e números
      Nav->>OCR: reconhecer a imagem (português)
      OCR-->>Nav: texto e confiança
    end
  end
  Nav-->>Tela: DocumentoLido (páginas com estado)
  Tela->>Store: guardarDocumento
```

## 2. Etapa 1 — leitura da RFP (o código monta o esqueleto; o PMO lê; o código confere)

A análise é pura e refeita do texto; o que fica no dossiê são os números R, a leitura do PMO (quando pedida) e as decisões do GP (decisões 0035 e 0036).

```mermaid
sequenceDiagram
  actor GP
  participant Tela as interface/telas/analise-rfp.tsx
  participant A as etapas/1-rfp/analisar-rfp.ts
  participant L as etapas/1-rfp/leitura.ts
  participant P as etapas/1-rfp/leitura-pmo.ts
  participant API as API do Claude
  participant Store as dossie/store.ts
  GP->>Tela: Analisar a RFP
  Tela->>A: analisarRfp(documentos, hoje)
  A-->>Tela: itens, requisitos, obrigações, dinheiro, pontos de atenção
  Tela->>L: montarLeituraRfp (8 seções do método)
  L-->>Tela: esqueleto ("leitura parcial por código")
  Tela->>Store: guardarAnaliseRfp (R01… fixos, revisões)
  opt com a chave
    GP->>Tela: Pedir ao PMO (custo à vista)
    Tela->>API: método da etapa 1 + esqueleto + texto da RFP
    API-->>Tela: leitura nas 8 seções (JSON)
    Tela->>P: conferirLeituraRfp (citação, número, R, conta do PMO)
    P-->>Tela: itens do PMO como Sugestão, com as travas
  end
  GP->>Tela: aceita, edita ou descarta; inclui R a partir do PMO
  GP->>Tela: exporta (DOCX, PDF, XLSX)
```

A parceria da Lei 13.019 é reconhecida pela abertura do documento. Com ela, o que é só de licitação sai como "não se aplica a esta modalidade" (`src/extracao/rfp/parceria.ts`, decisão 0031).

## 3. Passo do PMO (etapas 2, 3 e 4; o mesmo desenho das etapas 1 e 5)

```mermaid
sequenceDiagram
  actor GP
  participant Tela as Tela da etapa
  participant Ped as etapas/N/pedidos.ts
  participant Cus as pmo/custo.ts
  participant Cli as pmo/cliente.ts
  participant API as API do Claude
  participant Conf as pmo/citacoes.ts e redacao.ts
  participant Store as dossie/store.ts
  Tela->>Ped: monta o pedido do passo
  Ped-->>Tela: skill (sistema) + documentos + pedido
  Tela->>Cus: estimarCusto
  Cus-->>GP: custo estimado à vista
  GP->>Tela: confirma
  Tela->>Cli: chamarPmo(schema)
  Cli->>API: messages.stream (cache na skill e nos documentos)
  API-->>Cli: JSON estruturado
  Cli-->>Tela: resposta validada pelo zod e uso
  Tela->>Conf: conferirCitacao, redação condicional, números sem fonte
  Conf-->>Tela: itens marcados (conferida, não conferida…)
  Tela->>Store: guarda a resposta, o modelo e o uso
  GP->>Tela: decide (abordagem, premissas) e revisa cada item
```

As contas ficam com o código:

- cronograma PERT e caminho crítico (`src/etapas/2-proposta/cronograma.ts`);
- preço (`preco.ts`);
- custos e marcos do PGP (`src/etapas/4-pgp/calculos.ts`).

## 4. Etapa 5 — conferência do plano (a leitura do PMO é a principal; sem chave, só o código)

```mermaid
sequenceDiagram
  actor GP
  participant Tela as interface/telas/conferencia.tsx
  participant Mapa as regras/mapa-pgp.ts
  participant Conf as regras/conferencia.ts
  participant Leit as etapas/5-conferencia/leitura-pmo.ts
  participant API as API do Claude
  GP->>Tela: envia o PGP (e TAP, RFP)
  Tela->>Mapa: proporMapa (51 partes pelos títulos)
  Mapa-->>Tela: partes com página e situação
  GP->>Tela: confirma o mapa, as características e as premissas
  Tela->>Conf: conferirPlano
  Conf-->>Tela: achados vago, conflituoso e ausente, com gravidade e categoria
  opt com a chave
    GP->>Tela: pede a leitura do PMO
    Tela->>Leit: pedidoLeitura
    Leit->>API: plano, TAP, RFP e o que o código achou
    API-->>Leit: achados sugeridos
    Leit->>Conf: conferirLeitura (citação, ausente procurado no plano)
  end
  GP->>Tela: procede ou não, em cada achado
```

## 5. Exportação

```mermaid
sequenceDiagram
  actor GP
  participant Tela as Tela da etapa
  participant Rel as exportacao/relatorio-*.ts
  participant Exp as exportacao/exportar.ts
  participant Fmt as docx.ts, pdf.ts ou xlsx.ts
  GP->>Tela: escolhe o documento e o formato
  Tela->>Rel: montarX(dossie, análise)
  Rel-->>Tela: DocumentoExportavel (seções, tabelas, minuta)
  Tela->>Exp: exportar(doc, formato)
  Exp->>Fmt: import() do montador
  Fmt-->>Exp: Blob
  Exp-->>GP: download
```

O cabeçalho de minuta fica enquanto houver item pendente. No PDF, as colunas ganham a largura da palavra mais longa, e a página vai para paisagem quando as tabelas não cabem (`src/exportacao/larguras.ts`).

## Referências no código

- `src/leitura/navegador.ts`, `src/leitura/ler-documento.ts`
- `src/etapas/1-rfp/analisar-rfp.ts`, `src/extracao/rfp/`, `src/regras/brechas-rfp.ts`, `src/extracao/rfp/parceria.ts`
- `src/etapas/2-proposta/pedidos.ts`, `src/pmo/custo.ts`, `src/pmo/cliente.ts`, `src/pmo/citacoes.ts`, `src/pmo/redacao.ts`
- `src/etapas/2-proposta/cronograma.ts`, `src/etapas/2-proposta/preco.ts`, `src/etapas/4-pgp/calculos.ts`
- `src/regras/mapa-pgp.ts`, `src/regras/conferencia.ts`, `src/etapas/5-conferencia/leitura-pmo.ts`
- `src/exportacao/exportar.ts`, `src/exportacao/relatorio-rfp.ts`, `src/exportacao/larguras.ts`
