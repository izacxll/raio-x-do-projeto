---
codigo: B26
nome: Requisitos de recursos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: equipe
sinonimos: ["requisitos de recursos", "necessidades de recursos", "dimensionamento da equipe", "alocação de horas", "matriz de horas", "quadro de horas", "estimativa de recursos", "histograma de recursos"]
versao: 0.2.0
---

# B26 — Requisitos de recursos

## Para que serve
Mostra "Os tipos e quantidades de recursos exigidos para cada atividade de um pacote de trabalho" (PMBOK 6, glossário, p. 722, PDF 758), somados por pacote, por ramo da EAP e para o projeto (9.2.3.1, p. 325, PDF 361). Nos projetos da FGV, é a matriz de horas por perfil, que nasce na proposta (PROP-EQUIPE.3) e vira base das durações (6.4) e dos custos (7.2).

## Conteúdo mínimo
- **B26.1** Tipo de recurso de cada atividade ou pacote de trabalho (perfil da equipe, material, equipamento)
  - fonte: PMBOK 6, 9.2.3.1, p. 325 (PDF 361)
  - sinais: tabela atividade ou código da EAP × perfil | "perfil" | "recurso"
  - confere: código
  - dispensa: nunca
- **B26.2** Quantidade de cada tipo por atividade: horas de cada perfil, unidades de material ou equipamento
  - fonte: PMBOK 6, 9.2.3.1, p. 325 (PDF 361); glossário, p. 722 (PDF 758)
  - sinais: "horas" | "h" | "quantidade" | números nas células da matriz
  - confere: código
  - dispensa: nunca
- **B26.3** Agregação por pacote, por ramo da EAP e para o projeto; os totais são do código
  - fonte: PMBOK 6, 9.2.3.1, p. 325 (PDF 361); 9.2.2.2 (bottom-up), p. 324 (PDF 360)
  - sinais: "total" | "subtotal" | linha de soma por produto ou fase
  - confere: código
  - dispensa: nunca
- **B26.4** Premissas sobre os tipos, a disponibilidade e as quantidades, levadas ao registro de premissas (B3)
  - fonte: PMBOK 6, 9.2.3.1, p. 325 (PDF 361); 9.2.3.4, p. 327 (PDF 363)
  - sinais: "premissa" | "disponibilidade" | "dedicação" | "tempo parcial" | remissão ao B3
  - confere: código
  - dispensa: nunca
- **B26.5** Premissa de produtividade explícita onde a carga depende de volume (entrevistas por dia, municípios por equipe)
  - fonte: PMBOK 6, 9.2.2.4 (paramétrica), p. 324 (PDF 360); `checklist.md` PC7 (CP11); `experiencia.md` §4
  - sinais: "por dia" | "por técnico" | "produtividade" | "por equipe"
  - confere: código
  - dispensa: nunca
- **B26.6** Distribuição das horas no tempo (mês ou fase), para mostrar o pico de carga
  - fonte: `checklist.md` PC7 (CP11); `experiencia.md` §4; Rework RW-010 (https://resources.rework.com/libraries/project-management/capacity-planning)
  - sinais: colunas por mês ou fase | "histograma" | "pico"
  - confere: código
  - dispensa: nunca
- **B26.7** Recursos físicos e despesas de campo requeridos: veículos, diárias, material de coleta
  - fonte: PMBOK 6, 9.2.3.1, p. 325 (PDF 361) e 9.6.1.2, p. 355 (PDF 391)
  - sinais: "veículo" | "diárias" | "deslocamento" | "tablet" | "material de campo"
  - confere: código
  - dispensa: sem campo
- **B26.8** Horas da coordenação e das interações com o contratante (reuniões, revisões, ajustes de produto) incluídas
  - fonte: `checklist.md` PC7 (CP10); Rework RW-010 (adaptação do leitor); `experiencia.md` §4
  - sinais: linha de "gestão" | "coordenação" | "reuniões" | "revisões" na matriz
  - confere: só PMO
  - dispensa: nunca
- **B26.9** Coerência com a equipe e as horas da proposta e com a equipe mínima do edital; diferença explicada
  - fonte: PMBOK 6, 9.3, p. 330 (PDF 366) (substituto não pode violar requisito obrigatório); `licitacoes.md` 2.2; PROP-EQUIPE.1 e .3
  - sinais: mesmos perfis da proposta | "equipe mínima" | justificativa de mudança
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- A equipe dá conta do volume em cada frente e em cada mês, e não só na média? (PC7)
- Algum perfil tem duas cargas que crescem por variáveis diferentes, dimensionado por uma só? (`experiencia.md` §4)
- O tempo de deslocamento entrou nas horas da equipe de campo? (`experiencia.md` §5)
- A estimativa é bottom-up onde a EAP permite, ou análoga só onde o detalhe falta? (PMBOK 6, p. 324, PDF 360)
- Cada premissa de produtividade tem base no B4? (B4.3 e B4.4)

## Erros comuns
- Horas sem premissa de produtividade, o que impede a conta equipe × volume (PC7).
- Dimensionamento pela média, escondendo o pico (`experiencia.md` §4).
- Esquecer as horas de reuniões com o contratante e de revisão de produtos (Rework RW-010, adaptação do leitor).
- Planejar a 100% de utilização (Rework RW-010).

## Quando dispensar a parte inteira
Não se dispensa: as durações (6.4) e os custos (7.2) dependem dele (PMBOK 6, p. 322, PDF 358). O detalhe varia com a área de aplicação (p. 325, PDF 361): em porte pequeno, pode ser a própria matriz de horas da proposta, revista, e absorver a EAR (B24).
Linha para a tela: "Requisitos de recursos na matriz de horas da proposta, revista: porte pequeno (PMBOK 6, p. 325)."

## Ligações
- **Vem de:** 9.2, com A6, A13, B1, B2, B3, B6, B25 e B27 (p. 322–324, PDF 358–360); PROP-EQUIPE (matriz de horas e premissas de produtividade).
- **Vai para:** B1 (requisitos de recursos de cada atividade, p. 327, PDF 363); B8 e B15 (6.4 e 6.5); B6 (7.2); 9.3 (o que adquirir); A9 (o que contratar fora); B25 (pico × horas disponíveis); B4 (base). Atualizado em 9.3 e depois do nivelamento (6.5).

## Modelo de redação
```
| Código EAP | Atividade | Perfil A (h) | Perfil B (h) | ... | Recursos físicos | Premissa |
Totais por produto, por fase e do projeto: código.
Distribuição mensal: | Perfil | Mês 1 | Mês 2 | ... |   (pico: o código aponta)
Premissas de produtividade: [n por dia por técnico — da proposta, doc, p.; ou a definir pelo GP].
Coordenação e interação com o contratante: [horas por mês — a definir pelo GP].
Diferenças em relação à proposta: [perfil, motivo].
```

## Fontes
- PMBOK 6: 9.2, p. 320–327 (PDF 356–363); 9.3, p. 330 (PDF 366); 9.6, p. 355 (PDF 391); glossário, p. 722 (PDF 758).
- Rework: RW-010 (link no item B26.6).
- `checklist.md` PC7; `experiencia.md` §4 e §5; `licitacoes.md` 2.2; ficha `prop-equipe`.
