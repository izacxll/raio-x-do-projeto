---
codigo: B20
nome: Métricas da qualidade
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: medição
sinonimos: ["métricas de qualidade", "indicadores de qualidade", "indicadores da qualidade", "métricas", "definição de pronto", "padrões de aceitação"]
versao: 0.2.0
---

# B20 — Métricas da qualidade

## Para que serve
Uma métrica é "A descrição de um atributo do projeto ou do produto e como medi-lo" (PMBOK 6, glossário, p. 716, PDF 752). O B20 diz qual atributo será medido e como o controle da qualidade vai conferir a conformidade (8.1.3.2, p. 287, PDF 323). Sai de 8.1 com o A5 e é usado em 8.2 e 8.3.

## Conteúdo mínimo
- **B20.1** Cada métrica nomeia o atributo medido, do produto ou do projeto
  - fonte: PMBOK 6, 8.1.3.2, p. 287 (PDF 323)
  - sinais: tabela de métricas com coluna de atributo | "métrica" | "indicador de qualidade"
  - confere: código
  - dispensa: nunca
- **B20.2** Forma de medir: fórmula ou regra de contagem, com unidade
  - fonte: PMBOK 6, 8.1.3.2, p. 287 (PDF 323); PMBOK 7, 2.7, p. 93 (PDF 188)
  - sinais: "fórmula" | "unidade" | "%" | "número de" | "por produto"
  - confere: código
  - dispensa: nunca
- **B20.3** Meta ou tolerância de cada métrica, tirada do requisito; se a RFP não fixa, "a definir pelo GP"
  - fonte: PMBOK 6, p. 274 (PDF 310); 8.3, p. 304 (PDF 340); PMBOK 7, 2.4.8, p. 66 (PDF 161)
  - sinais: "meta" | "tolerância" | "mínimo" | "máximo" | "limite" | "a definir pelo GP"
  - confere: código
  - dispensa: nunca
- **B20.4** Como e quando é verificada: quem confere, em que momento e com que instrumento
  - fonte: PMBOK 6, 8.1.3.2, p. 287 (PDF 323); 8.3.1, p. 300 (PDF 336)
  - sinais: "verificação" | "responsável" | "frequência" | "a cada entrega" | "lista de verificação"
  - confere: código
  - dispensa: nunca
- **B20.5** Cada métrica ligada a um critério de aceite, a um requisito (R) ou a um objetivo do TAP
  - fonte: PMBOK 7, 2.7.1, p. 97 (PDF 192); PMBOK 6, 8.1, p. 280 (PDF 316)
  - sinais: "R01" | "critério de aceite" | "TAP" | coluna de requisito ou objetivo
  - confere: código
  - dispensa: nunca
- **B20.6** Métricas úteis para decidir: específicas, alcançáveis, oportunas, sem métrica de vaidade
  - fonte: PMBOK 7, 2.7.1, p. 97 (PDF 192); 2.7.4, p. 111–112 (PDF 206–207); glossário, p. 247 (PDF 342)
  - sinais: meta com prazo | ação prevista se a meta falhar
  - confere: só PMO
  - dispensa: nunca
- **B20.7** Conjunto equilibrado: métricas do produto (aceite na primeira submissão, rodadas, devoluções) e do processo (produtos no prazo, satisfação do contratante)
  - fonte: PMBOK 6, 8.1.3.2, p. 287 (PDF 323), exemplos do livro; PMBOK 7, 2.7.2, p. 98 (PDF 193)
  - sinais: "no prazo" | "primeira submissão" | "rodadas de revisão" | "devoluções" | "satisfação"
  - confere: só PMO
  - dispensa: porte pequeno
- **B20.8** Definição de pronto por produto: lista de itens verificáveis que todo produto cumpre antes de ir ao contratante
  - fonte: PMBOK 7, 2.6.2, p. 85 (PDF 180); Rework RW-065 (https://resources.rework.com/libraries/project-management/definition-of-done)
  - sinais: "definição de pronto" | "pronto para entrega" | lista de verificação do produto
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- A meta vem da RFP (com página) ou é sugestão? Se for sugestão, está marcada e com valor "a definir pelo GP"? (SKILL.md, princípios 1 e 2)
- A métrica muda algum comportamento ou decisão, ou só enfeita o relatório? (PMBOK 7, p. 111–112, PDF 206–207)
- Há métrica que mostre problema cedo (rodadas de revisão por produto), e não só no aceite final? (PMBOK 7, p. 95–96, PDF 190–191)
- Critérios de aceite (um produto) e definição de pronto (todos os produtos) estão distintos? (Rework RW-064 e RW-065)

## Erros comuns
- Métrica sem forma de verificação ou sem meta (PMBOK 6, p. 287, PDF 323).
- Confundir tolerância (do requisito) com limite de controle (estatístico) (PMBOK 6, p. 274 e 304, PDF 310 e 340).
- Métrica de produção que induz comportamento ruim (efeito Hawthorne) (PMBOK 7, p. 111, PDF 206).
- Definição de pronto longa demais, que ninguém usa (Rework RW-065).

## Quando dispensar a parte inteira
Pode ser fundido ao A5 em porte pequeno: uma coluna de métrica e meta na tabela de critérios de aceite basta. O plano da qualidade pode ser formal ou informal (PMBOK 6, p. 286, PDF 322), e o PMBOK 7 pede medir só o que importa (2.4.8, p. 66, PDF 161).
Linha para a tela: "Métricas dentro do plano da qualidade: porte pequeno (PMBOK 6, p. 286; PMBOK 7, p. 66)."

## Ligações
- **Vem de:** 8.1, com A5, B22, B23 e TAP2; critérios de aceite da RFP e da proposta.
- **Vai para:** 8.2 (cenários de teste e melhorias; p. 291, PDF 327) e 8.3 (análise de desempenho; p. 300, PDF 336); B33 (instrumentos); B19 (resultados); A16 (indicadores de qualidade no painel).

## Modelo de redação
```
| Métrica | Atributo | Fórmula/regra | Meta ou tolerância | Origem (R, TAP, página) ou sugestão | Quem verifica | Quando |
| Aceite na primeira submissão | produto | produtos aceitos sem devolução ÷ entregues | [a definir pelo GP] | sugestão | coordenação | a cada aceite |
| Produtos no prazo | processo | produtos entregues até a data da A14 ÷ previstos | [a definir pelo GP] | [R, se houver] | GP | mensal |

Definição de pronto (todo produto): [revisão técnica por par; fontes citadas; dados conferidos;
formato do contratante; revisão de linguagem; aprovação interna].
```

## Fontes
- PMBOK 6: 8.1, p. 280 e 286–287 (PDF 316 e 322–323); 8.2, p. 291 (PDF 327); 8.3, p. 300 e 304 (PDF 336 e 340); p. 274 (PDF 310); glossário, p. 716 (PDF 752).
- PMBOK 7: 2.4.8, p. 66 (PDF 161); 2.6.2, p. 85 (PDF 180); 2.7, p. 93–112 (PDF 188–207); glossário, p. 247 (PDF 342).
- Rework: RW-065 (link no item); RW-064 (https://resources.rework.com/libraries/project-management/acceptance-criteria).
