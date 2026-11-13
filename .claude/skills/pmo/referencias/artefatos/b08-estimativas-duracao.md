---
codigo: B8
nome: Estimativas de duração
tipo: documento do projeto
etapas: [2, 4, 5]
gravidade: baixa
categoria: tempo
sinonimos: ["estimativas de duração", "estimativas de duração das atividades", "estimativa de duração", "durações", "estimativa de prazos", "estimativa de três pontos", "PERT"]
versao: 0.2.0
---

# B8 — Estimativas de duração

## Para que serve
São "avaliações quantitativas do número provável de períodos de tempo que serão necessários para completar uma atividade, uma fase ou um projeto" (PMBOK 6, 6.4.3.1, p. 203, PDF 239). Na skill, o PMO estima três pontos com a base (B4) de cada um; **o código calcula** valor esperado, faixa, datas e caminho crítico (SKILL.md, princípio 6 e seção 4).

## Conteúdo mínimo
- **B8.1** Duração de cada atividade em períodos, com a unidade do A3 (dias úteis, dias corridos, semanas)
  - fonte: PMBOK 6, 6.4.3.1, p. 203 (PDF 239); 6.1.3.1, p. 182 (PDF 218)
  - sinais: "duração" | "dias úteis" | "dias corridos" | "semanas" | coluna de duração por atividade
  - confere: código
  - dispensa: nunca
- **B8.2** Três pontos por atividade: otimista, mais provável e pessimista
  - fonte: PMBOK 6, 6.4, p. 201 (PDF 237); Rework RW-057 (https://resources.rework.com/libraries/project-management/three-point-estimation); SKILL.md, seção 4
  - sinais: "otimista" | "mais provável" | "pessimista" | "tO" | "tM" | "tP" | três colunas de duração
  - confere: código
  - dispensa: porte pequeno
- **B8.3** Cada estimativa aponta para a sua base (método, dado, premissa) no B4
  - fonte: PMBOK 6, 6.4.3.2, p. 204 (PDF 240); 6.4, p. 197 (PDF 233); SKILL.md, seção 4 (campo "base")
  - sinais: "base" | "método" | "conforme" | referência ao B4 ou à premissa (P01)
  - confere: código
  - dispensa: nunca
- **B8.4** O pessimista reflete o que pode dar errado (rodada extra de revisão, dado atrasado, retrabalho), não um acréscimo simbólico
  - fonte: PMBOK 6, 6.4, p. 201 (PDF 237); Rework RW-057, RW-051 (https://resources.rework.com/libraries/project-management/what-is-a-pert-chart) e RW-013 (https://resources.rework.com/libraries/project-management/monte-carlo-simulation)
  - sinais: pessimista igual ou muito próximo do mais provável em todas as linhas
  - confere: só PMO
  - dispensa: porte pequeno
- **B8.5** Estimativas sem esperas nem antecipações; a análise do contratante é atividade própria, não somada à duração da redação
  - fonte: PMBOK 6, 6.4.3.1, p. 203 (PDF 239); 6.3, p. 193 (PDF 229); `checklist.md` PC3
  - sinais: "incluindo aprovação" | "com análise" dentro da mesma linha | duração que soma produção e espera
  - confere: só PMO
  - dispensa: nunca
- **B8.6** Contingência, se houver, identificada à parte e não escondida no mais provável
  - fonte: PMBOK 6, 6.4, p. 202 (PDF 238); 6.4.3.1, p. 203 (PDF 239); Rework RW-024 (https://resources.rework.com/libraries/project-management/critical-chain-project-management) e RW-113 (https://resources.rework.com/libraries/productivity/parkinsons-law)
  - sinais: "contingência" | "reserva de cronograma" | "folga" | linha de reserva separada
  - confere: código
  - dispensa: nunca
- **B8.7** Fórmula registrada (triangular ou PERT/beta) e valor esperado e faixa calculados pelo código, nunca escritos pelo PMO
  - fonte: PMBOK 6, 6.4, p. 201 (PDF 237); Rework RW-057 (passo 3: registrar a fórmula); SKILL.md, princípio 6
  - sinais: "triangular" | "PERT" | "beta" | "tE" | "(O + 4M + P) / 6" | "(O + M + P) / 3"
  - confere: código
  - dispensa: porte pequeno
- **B8.8** Duração coerente com os recursos designados e a produtividade suposta; mais gente não reduz o prazo na mesma proporção
  - fonte: PMBOK 6, 6.4, p. 196–197 (PDF 232–233); experiencia.md §4; `checklist.md` PC7
  - sinais: duração sem perfil nem quantidade de pessoas | "com equipe reforçada"
  - confere: só PMO
  - dispensa: nunca
- **B8.9** Faixa ou probabilidade comunicada nas atividades críticas ou incertas
  - fonte: PMBOK 6, 6.4.3.1, p. 203 (PDF 239) (± ou % de chance); PMBOK 7, 2.4.2.2, p. 57 (PDF 152)
  - sinais: "±" | "% de probabilidade" | "faixa" | "P80" | "intervalo"
  - confere: código
  - dispensa: porte pequeno
- **B8.10** Atividade incerta demais dividida em partes antes de estimar
  - fonte: PMBOK 6, 6.4, p. 202 (PDF 238) ("bottom-up"); Rework RW-051 (pessimista acima de três vezes o otimista)
  - sinais: distância muito grande entre otimista e pessimista numa mesma linha
  - confere: só PMO
  - dispensa: porte pequeno
- **B8.11** Estimado por quem conhece o trabalho, com a equipe envolvida
  - fonte: PMBOK 6, 6.4, p. 197 (PDF 233); Rework RW-057 (passo 2)
  - sinais: "estimado por" | "validado com a equipe" | "oficina de estimativa"
  - confere: só PMO
  - dispensa: porte pequeno

## Perguntas de qualidade
- O mais provável considera disponibilidade realista, interrupções e dependências, como pede o PMBOK (p. 201, PDF 237)?
- Volume × equipe × produtividade sustenta a duração, inclusive no pico? A conta é do código (PC7; experiencia.md §4).
- Deslocamento e sazonalidade entraram nas durações de campo?
- A análise do contratante tem duração própria, do contrato ou a definir pelo GP? (PC3)
- **Ordem de colher os três pontos.** O Rework diverge: o RW-057 pede o mais provável primeiro; o RW-051, otimista e pessimista primeiro. Ambos querem evitar ancoragem; registre no B4 a ordem usada.

## Erros comuns
- Pessimista subestimado; segundo o RW-013, equipes subestimam o pior caso em cerca de duas vezes (Rework RW-057, RW-051, RW-013).
- PMO escrevendo a média ou "o prazo é curto": a conta é do código (SKILL.md, princípio 6).
- Folga embutida em cada atividade, consumida pela lei de Parkinson (PMBOK 6, p. 197, PDF 233; Rework RW-113).
- Dobrar a equipe esperando metade do prazo (PMBOK 6, p. 197, PDF 233).
- Estimativa única de proposta virando compromisso sem a faixa (Rework RW-040, https://resources.rework.com/libraries/project-management/cone-of-uncertainty).

## Quando dispensar a parte inteira
Não se dispensa: sem duração não há cronograma (PMBOK 6, p. 207, PDF 243). Na conferência de plano de porte pequeno, uma duração única por atividade com a base ao lado é aceitável (PMBOK 6, p. 175, PDF 211; Rework RW-057 dispensa três pontos em tarefa curta e conhecida). O PMO da skill, ao escrever, sempre dá os três pontos (SKILL.md, seção 4).
Linha para a tela: "Durações como coluna do cronograma, com a base: porte pequeno (PMBOK 6, p. 175 e 203)."

## Ligações
- **Vem de:** 6.4, com B1, B2, B3, B10, B11, B18, B24–B27 (p. 198–199, PDF 234–235); A3.2 e A3.3 (unidade, exatidão); A13.
- **Vai para:** 6.5 (B16, B15, B29), 11.2 e 11.4 (simulação); B1 (duração por atividade); B4 (base de cada estimativa); B3 (premissas novas).

## Modelo de redação
```
Estimativas de duração — unidade: [dias úteis/corridos, do A3]
Por atividade, o PMO entrega (SKILL.md, seção 4):
{ "otimista": n, "mais_provavel": n, "pessimista": n, "unidade": "dias úteis",
  "base": "método; dado; premissa (B4/B3)" }
Valores que o documento não sustenta: "não informado no documento — a definir pelo GP".
Fórmula a registrar (o código calcula, o PMO não escreve o resultado):
- triangular, tE = (tO + tM + tP) / 3: PMBOK 6, 6.4, p. 201 (PDF 237), única dada
  para duração no cap. 6; indicada quando faltam dados históricos.
- PERT/beta, tE = (tO + 4tM + tP) / 6, desvio = (tP − tO) / 6: Rework RW-051 e RW-057.
  O PMBOK 6 traz a beta só para custos (7.2, p. 244–245, PDF 280–281).
Análise do contratante: atividade à parte. Contingência: linha à parte (valor do GP).
```

## Fontes
- PMBOK 6: 6.1.3.1, p. 182 (PDF 218); 6.3, p. 193 (PDF 229); 6.4, p. 196–204 (PDF 232–240); 6.5, p. 207 (PDF 243); 7.2, p. 244–245 (PDF 280–281); p. 175 (PDF 211).
- PMBOK 7: 2.4.2.2, p. 55–57 (PDF 150–152).
- Rework: RW-013, RW-024, RW-040, RW-051, RW-057, RW-113 (links nos itens e nos erros).
- `checklist.md` (PC3, PC7); `experiencia.md` §4; SKILL.md, princípio 6 e seção 4.
