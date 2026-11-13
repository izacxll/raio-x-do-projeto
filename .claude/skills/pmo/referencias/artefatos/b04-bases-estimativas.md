---
codigo: B4
nome: Bases das estimativas
tipo: documento do projeto
etapas: [2, 4, 5]
gravidade: baixa
categoria: planejamento
sinonimos: ["bases das estimativas", "base das estimativas", "base da estimativa", "memória de cálculo", "memorial de cálculo", "premissas de dimensionamento", "premissas das estimativas", "justificativa das estimativas"]
versao: 0.2.0
---

# B4 — Bases das estimativas

## Para que serve
Explica como cada estimativa de duração (B8) e de custo (B6) foi obtida: método, dados, premissas, restrições, faixa e confiança (PMBOK 6, 6.4.3.2, p. 204, PDF 240; 7.2.3.2, p. 247, PDF 283; glossário, p. 701, PDF 737). O volume varia, mas a documentação deve deixar claro de onde vem cada número. É o que defende o prazo e o preço quando uma premissa cai (Rework RW-040, observação do leitor).

## Conteúdo mínimo
- **B4.1** Método de cada estimativa: análoga, paramétrica, três pontos, "bottom-up" ou opinião especializada
  - fonte: PMBOK 6, 6.4.3.2, p. 204 (PDF 240); 6.4, p. 200–202 (PDF 236–238); 7.2.3.2, p. 247 (PDF 283)
  - sinais: "análoga" | "paramétrica" | "três pontos" | "bottom-up" | "opinião especializada" | "método de estimativa"
  - confere: código
  - dispensa: nunca
- **B4.2** Origem dos dados: projeto semelhante, métrica de produtividade ou quem estimou
  - fonte: PMBOK 6, 6.4, p. 197 e 200 (PDF 233 e 236); Rework RW-057 (https://resources.rework.com/libraries/project-management/three-point-estimation)
  - sinais: "histórico" | "projeto anterior" | "projeto semelhante" | "produtividade" | "estimado por" | "equipe técnica"
  - confere: código
  - dispensa: nunca
- **B4.3** Premissas de cada estimativa escritas (produtividade, disponibilidade, nível de habilidade) e levadas ao registro de premissas (B3)
  - fonte: PMBOK 6, 6.4.3.2, p. 204 (PDF 240); 7.2.3.2, p. 247 (PDF 283); `checklist.md` (vago, CP9)
  - sinais: "premissa" | "considera-se" | "pressupõe-se" | código da premissa (P01)
  - confere: código
  - dispensa: nunca
- **B4.4** Conta equipe × volume mostrada nas estimativas paramétricas: quantidade a produzir, produtividade por pessoa e período, número de pessoas (a conta é do código)
  - fonte: PMBOK 6, 6.4, p. 200–201 (PDF 236–237); experiencia.md §4; `checklist.md` PC7
  - sinais: "por dia" | "por pessoa" | "por técnico" | "quantidade" | "unidades" | tabela de volume × produtividade
  - confere: código
  - dispensa: porte pequeno
- **B4.5** Restrições conhecidas que limitam a estimativa (prazo do edital, equipe mínima exigida, calendário do contratante)
  - fonte: PMBOK 6, 6.4.3.2, p. 204 (PDF 240); 7.2.3.2, p. 247 (PDF 283)
  - sinais: "restrição" | "prazo máximo" | "equipe mínima" | "termo de referência" | "edital"
  - confere: código
  - dispensa: nunca
- **B4.6** Faixa possível da estimativa (± % ou otimista–pessimista)
  - fonte: PMBOK 6, 6.4.3.2, p. 204 (PDF 240); 7.2.3.2, p. 247 (PDF 283); PMBOK 7, 2.4.2.2, p. 55–57 (PDF 150–152); Rework RW-040 (https://resources.rework.com/libraries/project-management/cone-of-uncertainty)
  - sinais: "±" | "faixa" | "intervalo" | "otimista" | "pessimista" | "de … a …"
  - confere: código
  - dispensa: nunca
- **B4.7** Nível de confiança ou classe da estimativa, coerente com a fase do documento (proposta mais larga, plano mais estreita)
  - fonte: PMBOK 6, 6.4.3.2, p. 204 (PDF 240); 7.2, p. 241 (PDF 277); PMBOK 7, 2.4.2.2, p. 55–57 (PDF 150–152); Rework RW-040
  - sinais: "nível de confiança" | "ordem de grandeza" | "definitiva" | "preliminar" | "P80" | "% de probabilidade"
  - confere: código
  - dispensa: porte pequeno
- **B4.8** Riscos individuais que influenciam a estimativa, com o código do risco no B27
  - fonte: PMBOK 6, 6.4.3.2, p. 204 (PDF 240); 7.2.3.2, p. 247 (PDF 283)
  - sinais: "risco" | "riscos considerados" | código do risco (R-01, RK01) | "contingência"
  - confere: código
  - dispensa: porte pequeno
- **B4.9** Deslocamento, diárias e logística de campo considerados nas premissas de duração e de custo
  - fonte: experiencia.md §5; PMBOK 6, 7.2, p. 241 (PDF 277) (estimar todos os recursos cobrados)
  - sinais: "deslocamento" | "viagem" | "diária" | "logística" | "tempo de viagem" | "por município"
  - confere: código
  - dispensa: sem campo
- **B4.10** Custos: o que entra e o que fica de fora (indiretos, despesas, impostos), conforme a planilha do edital
  - fonte: PMBOK 6, 7.3, p. 250 (PDF 286); 7.2.3.2, p. 247 (PDF 283); SKILL.md, etapa 2 (planilha de preços); Rework RW-014 (observação do leitor)
  - sinais: "custos indiretos" | "incluído" | "excluído" | "despesas reembolsáveis" | "BDI" | "encargos"
  - confere: código
  - dispensa: nunca
- **B4.11** A base permite a quem não estimou refazer o número só com o que está escrito; nenhum número redondo sem memória
  - fonte: PMBOK 6, 6.4.3.2, p. 204 (PDF 240) (entendimento claro e completo); `checklist.md` (vago, CP9); experiencia.md §7
  - sinais: número sem método nem premissa ao lado | "aproximadamente" | "estima-se" sem fonte
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Cada número tem método, dado e premissa ao lado, ou é número redondo sem memória? (vago, CP9)
- A produtividade suposta é realista para o território e a equipe? O pico de trabalho foi olhado, ou só a média? (PC7; experiencia.md §4)
- A faixa declarada é compatível com o momento? Estimativa de proposta não deve parecer definitiva (PMBOK 6, p. 241, PDF 277; Rework RW-040).
- As premissas críticas (dados do contratante, data de início, prazo de análise) estão no B3 e, se sem base, viram risco no B27? (PC1, PC3 e PC4)
- Se há campo: deslocamento e diárias estão nas premissas de prazo e de preço?

## Erros comuns
- Premissa sem base: "estima-se" sem fonte, número redondo, método escolhido por hábito (vago, CP9; experiencia.md §7).
- Dimensionar pela média e esconder o pico de trabalho (experiencia.md §4).
- Número dito sem a faixa vira promessa; espremer a faixa para agradar quem aprova (Rework RW-040).
- Ancorar no primeiro valor que o patrocinador ouviu; misturar estimativa com preço negociado sem registrar a diferença (Rework RW-014, https://resources.rework.com/libraries/project-management/project-cost-estimation).
- Método preciso demais para uma fase em que quase nada está decidido (Rework RW-040).

## Quando dispensar a parte inteira
Não se dispensa: toda estimativa precisa de base (PMBOK 6, p. 204 e 247; PMBOK 7, p. 55–57). Em porte pequeno, a base pode ser uma coluna "base" ao lado de cada estimativa no B8 e no B6, mais uma lista curta de premissas no B3, sem documento separado.
Linha para a tela: "Bases como coluna das estimativas: porte pequeno (PMBOK 6, p. 204 e 247)."

## Ligações
- **Vem de:** 6.4 (durações), 7.2 (custos) e 9.2 (recursos); B26, B18, B25, B27, B3; proposta (memória de cálculo da etapa 2).
- **Vai para:** 6.5, 7.3 e 11.4; 4.5 e 4.6 (rever estimativas quando o desempenho contraria a base); 4.7; atualizado em 6.6 e 7.4.
- **Irmãos:** B8 (cada estimativa aponta para a sua base), B6, B3 (premissas), A3.3 e A4 (exatidão aceita).

## Modelo de redação
```
Bases das estimativas — versão [n]
Tabela: Estimativa (B8/B6, ID) | Método | Dados e fonte | Premissas (B3) | Restrições
        | Faixa | Confiança/classe | Riscos (B27)
Volume × produtividade (paramétricas): [quantidade, produtividade, pessoas] → conta do código.
Campo: deslocamento [premissa por território ou a definir pelo GP].
Custos: incluídos [quais]; excluídos [quais], conforme [planilha do edital, página].
O que o documento não informa: "não informado no documento — a definir pelo GP".
```

## Fontes
- PMBOK 6: 6.4, p. 197, 200–202 e 204 (PDF 233, 236–238 e 240); 7.2, p. 241 e 247 (PDF 277 e 283); 7.3, p. 250 (PDF 286); glossário, p. 701 (PDF 737).
- PMBOK 7: 2.4.2.2, p. 55–57 (PDF 150–152); glossário, p. 237 (PDF 332).
- Rework: RW-014, RW-040, RW-057 (links nos itens e nos erros).
- `checklist.md` (PC1, PC3, PC4, PC7; vago, CP9); `experiencia.md` §4, §5 e §7; SKILL.md, etapa 2.
