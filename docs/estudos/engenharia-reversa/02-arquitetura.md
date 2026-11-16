# Arquitetura da análise

A análise foi feita em seis camadas, na mesma ordem em todas as etapas. A camada 2 (tipo) e a camada 5 (conferência por código) são as que o app de hoje não tem ou faz fora de ordem.

```mermaid
graph TB
    subgraph Entrada
        DOC[PDFs: RFP, proposta, contrato, plano]
        DOS[Dossiê das etapas anteriores]
    end
    subgraph Codigo1[Código: leitura]
        LER[Texto por página e mapa de seções]
    end
    subgraph Tipo[Código + confirmação do GP]
        TIPO[Tipo do documento e do projeto]
    end
    subgraph Codigo2[Código: extração e comparação]
        EXT[Extração estruturada por seção]
        CMP[Comparações e contas]
    end
    subgraph PMO[PMO: interpretação, opcional com chave]
        INT[Pontos de atenção, redação, destino, adaptação]
    end
    subgraph Codigo3[Código: conferência]
        CONF[Citação na página, números e datas relidos]
    end
    subgraph Saida
        OUT[Saída rotulada na estrutura do método]
        GP[Decisões do GP]
    end
    DOC --> LER --> TIPO --> EXT --> CMP --> INT --> CONF --> OUT --> GP
    DOS --> EXT
    TIPO -.régua.-> CMP
    TIPO -.régua.-> INT
```

## Dependências entre as etapas

O que cada etapa entrega à seguinte, pelo dossiê. As setas tracejadas mostram onde a análise usou um item de uma etapa anterior que não é a imediata.

```mermaid
graph LR
    E1[Etapa 1 RFP] -->|requisitos R, pontos de atenção com PC, prazos, dinheiro, julgamento| E2[Etapa 2 Proposta]
    E2 -->|premissas escritas, exclusões, produtos, equipe, preço, parcelas| E3[Etapa 3 TAP]
    E3 -->|divergências decididas, registro de premissas B3, marcos, aceite| E4[Etapa 4 PGP]
    E4 -->|adaptação e partes dispensadas, premissas nos 3 lugares| E5[Etapa 5 Conferência]
    E1 -.pontos de atenção.-> E3
    E1 -.metas e parcelas do edital.-> E5
    CT[Contrato assinado] -->|prevalece| E3
    CT -.valor, vigência, cláusulas.-> E5
```

## Fontes da skill PMO usadas em cada etapa

| Etapa | Referências que mudaram o resultado |
|---|---|
| 1 | `checklist.md` (sinais de aplicação das PC; CTR7 duas leituras; CTR2, CTR3); `experiencia.md` §1, §3, §4, §5, §6, §7; `licitacoes.md` §1 e §4 |
| 2 | Fichas `prop-estrategia` (.8 destino de cada brecha), `prop-sow` (.2 a .11), `prop-metodologia` (.7 campo, .8 mobilização, .10 qualidade), `prop-equipe` (.4 produtividade, .7 RACI), `prop-preco` (.3, .4, .6, .8), `prop-matriz-atendimento` (.7, .10) |
| 3 | Ficha `tap` (TAP1.2, TAP6.3, TAP9.4, TAP10.2, TAP12.2), `b03` (.6, .7, .8), `b31` |
| 4 | `pmbok7.md` (adaptação); fichas `a06`, `a07`, `a08`, `a11`, `a12`, `a16`, `b08`, `b13`, `b16`, `b17`, `b27`, `b29` (seções "Conteúdo mínimo" e "Quando dispensar") |
| 5 | `checklist.md` (três lugares); `experiencia.md` §7 (texto reaproveitado); fichas das partes do núcleo; decisões 0008 e 0009 (gravidade) |

> [!NOTE] Inferido — validar com a responsável pelo projeto
> A camada "tipo" aparece como etapa explícita nesta análise. A especificação a deixa implícita (decisão 0033 a introduz só na etapa 5). Sugere-se que ela vire um módulo comum às cinco etapas.
