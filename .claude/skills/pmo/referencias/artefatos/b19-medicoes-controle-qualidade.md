---
codigo: B19
nome: Medições de controle da qualidade
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: medição
sinonimos: ["medições da qualidade", "registro de controle da qualidade", "resultados das revisões", "registro de revisões", "folha de verificação", "controle de qualidade dos produtos"]
versao: 0.1.0
---

# B19 — Medições de controle da qualidade

## Para que serve
São "Os resultados documentados das atividades de controle de qualidade" (PMBOK 6, glossário, p. 715, PDF 751), registrados no formato definido no plano da qualidade (8.3.3.1, p. 305, PDF 341). Sai de 8.3 e volta para 8.2. **Só ganha conteúdo na execução:** no PGP sai como modelo inicial, sem resultados inventados (decisão 0007, passo 12).

## Conteúdo mínimo
- **B19.1** Identificação do produto ou entrega verificada, com a versão
  - fonte: PMBOK 6, 8.3.3.1, p. 305 (PDF 341); 8.3.1, p. 301 (PDF 337)
  - sinais: tabela com colunas de produto e versão | "versão" | "produto"
  - confere: código
  - dispensa: nunca
- **B19.2** Data da verificação e quem verificou (revisor diferente do autor)
  - fonte: PMBOK 6, 8.3.3.1, p. 305 (PDF 341); Rework RW-107 (https://resources.rework.com/libraries/process-management/qa-vs-qc)
  - sinais: "data" | "revisor" | "verificado por" | "revisado por"
  - confere: código
  - dispensa: nunca
- **B19.3** Resultado por critério ou métrica: conforme ou não conforme, ou valor medido contra a meta
  - fonte: PMBOK 6, 8.2.1, p. 291 (PDF 327); 8.3.2, p. 302 (PDF 338); 8.3.3.1, p. 305 (PDF 341)
  - sinais: "conforme" | "não conforme" | "atende" | "não atende" | "resultado"
  - confere: código
  - dispensa: nunca
- **B19.4** Não conformidades e o encaminhamento de cada uma (correção, questão no B9, solicitação de mudança)
  - fonte: PMBOK 6, 8.3.3, p. 305–306 (PDF 341–342)
  - sinais: "não conformidade" | "correção" | "retrabalho" | "questão" | "solicitação de mudança"
  - confere: código
  - dispensa: nunca
- **B19.5** Resultado da análise do contratante: rodada, data, parecer, motivo da devolução
  - fonte: PMBOK 6, 5.5, p. 164 (PDF 200); `licitacoes.md` 2.6; checklist 4
  - sinais: "parecer" | "aceite" | "devolução" | "rodada" | "recebimento provisório" | "recebimento definitivo"
  - confere: código
  - dispensa: nunca
- **B19.6** Formato igual ao definido no A5 e campos que permitem somar os resultados (por tipo de problema)
  - fonte: PMBOK 6, 8.3.3.1, p. 305 (PDF 341); 8.3.2, p. 302 (PDF 338); Rework RW-107
  - sinais: remissão ao A5 | coluna de tipo ou categoria do problema
  - confere: só PMO
  - dispensa: porte pequeno
- **B19.7** No PGP, modelo sem resultados inventados: campos vazios ou "a preencher na execução"
  - fonte: decisão 0007, passo 12; SKILL.md, etapa 4
  - sinais: "a preencher" | "modelo" | campos em branco
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- O registro mostra quantas rodadas cada produto levou até o aceite? (checklist 5)
- Os campos permitem ver o padrão das devoluções, e não só cada caso? (Rework RW-107)
- O modelo separa a verificação interna (FGV) da análise do contratante? (Rework RW-045, verificação × validação)
- O modelo está vazio de resultados, como deve? (SKILL.md, princípio 2)

## Erros comuns
- Registrar só "aprovado", sem critério nem revisor (PMBOK 6, p. 305, PDF 341).
- Relatórios de não conformidade fechados um a um e nunca somados (Rework RW-107).
- Modelo inicial com linhas de exemplo que parecem acontecimentos reais (decisão 0007, passo 12).

## Quando dispensar a parte inteira
Em porte pequeno, costuma bastar uma coluna "revisão e aceite" (data, revisor, resultado, rodada) na lista de produtos ou na lista de verificação do B33; o PMBOK 7 manda evitar artefato que duplica esforço (seção 4, p. 155, PDF 250).
Linha para a tela: "Medições como colunas da lista de produtos: porte pequeno (PMBOK 7, p. 155)."

## Ligações
- **Vem de:** 8.3, com A5, B20, B33, entregas e dados de desempenho (p. 300–301, PDF 336–337).
- **Vai para:** 8.2 (análise e melhoria); 4.7 (encerramento; Parte 2, pmbok6.md); B21 (resumo); B9 e B10; 5.5 (entregas verificadas seguem para o aceite).

## Modelo de redação
```
Medições de controle da qualidade — modelo inicial (a preencher na execução)
| Produto | Versão | Data | Revisor (não o autor) | Critério/métrica (B20) | Resultado | Não conformidade | Encaminhamento |
|         |        |      |                       |                        |           |                  |                |

Análise do contratante:
| Produto | Rodada | Data de envio | Data do parecer | Resultado | Motivo da devolução | Tipo do problema |
|         |        |               |                 |           |                     |                  |
```

## Fontes
- PMBOK 6: 5.5, p. 164 (PDF 200); 8.2.1, p. 291 (PDF 327); 8.3, p. 300–306 (PDF 336–342); glossário, p. 715 (PDF 751).
- PMBOK 7: seção 4, p. 155 (PDF 250).
- Rework: RW-107 (link no item); RW-045 (https://resources.rework.com/libraries/project-management/v-model).
- Decisão 0007; `licitacoes.md` 2.6; `checklist.md` (4, 5).
