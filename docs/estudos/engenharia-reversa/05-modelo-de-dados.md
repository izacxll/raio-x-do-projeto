# Modelo de dados da análise

As entidades que a análise produziu e ligou. Todo item exibido é um `ITEM_ROTULADO` (Do documento, Sugestão ou Decisão do GP) com pelo menos um `TRECHO` quando é "Do documento".

```mermaid
erDiagram
    DOCUMENTO ||--o{ PAGINA : tem
    PAGINA ||--o{ TRECHO : contem
    DOCUMENTO {
        string papel "rfp, proposta, contrato, plano"
        string tipo "licitacao, parceria, pgp, plano_de_trabalho"
    }
    ITEM_ROTULADO }o--o{ TRECHO : cita
    ITEM_ROTULADO {
        string rotulo "documento, sugestao, decisao_gp"
        string secao "secao do metodo da etapa"
        string ficha "ex.: PROP-SOW.9, TAP6.3, B27.13"
    }
    REQUISITO ||--|| ITEM_ROTULADO : e
    REQUISITO {
        string numero "R01..."
        string tipo "obrigacao, entrega, meta, condicao"
    }
    PONTO_ATENCAO ||--|| ITEM_ROTULADO : e
    PONTO_ATENCAO }o--o| PREMISSA_CRITICA : gera
    PONTO_ATENCAO {
        string base "PC, CTR, experiencia"
        string destino "pergunta, premissa, folga, reserva, exclusao"
    }
    PREMISSA_CRITICA {
        string codigo "PC1..PC8"
        bool aplica
        bool em_B3
        bool em_B27_com_gatilho
        bool em_A11_com_reajuste
    }
    DIVERGENCIA ||--|{ TRECHO : compara
    DIVERGENCIA {
        string ponto "valor, parcelas, duracao, equipe, produtos, termino"
        string versao_escolhida "decisao_gp"
    }
    ACHADO ||--|{ TRECHO : prova
    ACHADO }o--o| PREMISSA_CRITICA : sobre
    ACHADO {
        string tipo "vago, conflituoso, ausente"
        string gravidade "regra fixa"
        string parte "A1..B33 ou nucleo"
    }
```

## Regras de ligação observadas

- Um ponto de atenção da etapa 1 que se aplica a uma PC **gera** a premissa crítica; na etapa 2 ele recebe um destino; na etapa 3 entra no B3; na etapa 4 ganha os três lugares; na etapa 5 é conferido. O identificador da PC é o mesmo em todas as etapas.
- Uma divergência só existe entre **dois ou mais trechos** de documentos diferentes (ou de seções diferentes do mesmo documento, no caso da frase de conformidade).
- Um achado "ausente" não tem trecho do plano; tem o trecho que **exige** o item (RFP, contrato, ficha) e a lista de onde se procurou.
- "O que está em ordem" é uma lista de comparações que passaram, com os dois trechos. É o mesmo registro da comparação, com resultado "confere".
