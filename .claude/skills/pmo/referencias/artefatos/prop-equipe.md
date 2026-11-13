---
codigo: PROP-EQUIPE
nome: Equipe técnica, horas e responsabilidades da proposta
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["equipe técnica", "equipe-chave", "composição da equipe", "perfis profissionais", "alocação de horas", "matriz RACI", "quadro de pessoal"]
versao: 0.2.0
---

# PROP-EQUIPE — Equipe técnica, horas e responsabilidades

## Para que serve
Mostra quem faz o trabalho, com que perfil, quantas horas em cada atividade da EAP e com que responsabilidade. Qualificação, disponibilidade e competência do pessoal principal são critério típico de seleção (PMBOK 6, 12.1, p. 478–479, PDF 514–515). As horas alimentam o preço de baixo para cima (PROP-PRECO). **Nomes e currículos são Decisão do GP.** Profissional pontuado deve participar de fato da execução (`licitacoes.md` 2.2, art. 38).

## Conteúdo mínimo
- **PROP-EQUIPE.1** Perfis mínimos exigidos pelo edital (formação, experiência, registro), cada um com página e trecho
  - fonte: PMBOK 6, 12.1, p. 478–479 (PDF 514–515); `licitacoes.md` 2.2 (art. 37)
  - sinais: "equipe mínima" | "perfil" | "formação" | "experiência mínima" | página da RFP
  - confere: código
  - dispensa: nunca
- **PROP-EQUIPE.2** Perfis sugeridos além do mínimo, como sugestão, com o motivo (frente, técnica, território)
  - fonte: PMBOK 6, 9.2, p. 320 e 324 (PDF 356 e 360); SKILL.md, etapa 2, passo 6
  - sinais: "perfil sugerido" | "sugere-se" | motivo ao lado do perfil
  - confere: código
  - dispensa: nunca
- **PROP-EQUIPE.3** Horas de cada perfil por atividade ou pacote da EAP, numa matriz; os totais são do código
  - fonte: PMBOK 6, 9.2, bottom-up, p. 324 (PDF 360); requisitos de recursos, p. 325 (PDF 361); `checklist.md` PC7
  - sinais: tabela perfil × código da EAP com horas | "horas" | "h"
  - confere: código
  - dispensa: nunca
- **PROP-EQUIPE.4** Premissa de produtividade explícita onde a carga depende de volume (entrevistas por dia, municípios por equipe), para o código fazer a conta equipe × volume
  - fonte: `checklist.md` PC7 (CP11); `experiencia.md` §4; PMBOK 6, 6.4, p. 200–201 (PDF 236–237) (paramétrica)
  - sinais: "por dia" | "por técnico" | "produtividade" | "premissa"
  - confere: código
  - dispensa: nunca
- **PROP-EQUIPE.5** Distribuição das horas acompanha o pico do trabalho, e a coordenação tem horas para as frentes e os interlocutores
  - fonte: `checklist.md` PC7 (CP10, CP11); `experiencia.md` §4
  - sinais: horas que variam por fase ou mês; horas de coordenação por frente
  - confere: só PMO
  - dispensa: nunca
- **PROP-EQUIPE.6** Um responsável por frente e por produto
  - fonte: `checklist.md` PC7 (CP10); Rework RW-036 (dono único por entrega)
  - sinais: "responsável" | "coordenador da frente" | coluna de responsável por produto
  - confere: código
  - dispensa: nunca
- **PROP-EQUIPE.7** Matriz RACI por produto ou fase, com o contratante, e um só "A" por linha
  - fonte: PMBOK 6, 9.1, p. 317 (PDF 353); Rework RW-049
  - sinais: "RACI" | "R" | "A" | "C" | "I" | tabela atividade × papel, com coluna do contratante
  - confere: código
  - dispensa: porte pequeno
- **PROP-EQUIPE.8** Nomes e currículos como Decisão do GP: campo pendente, sem nome preenchido pelo PMO
  - fonte: SKILL.md, princípio 1; especificação da etapa 2 (decisões do GP)
  - sinais: "a definir pelo GP" | "decisão do GP" | campo de nome vazio
  - confere: código
  - dispensa: nunca
- **PROP-EQUIPE.9** Cada profissional pontuado aparece com papel e horas na execução, e não só no currículo
  - fonte: `licitacoes.md` 2.2 (art. 38) e 2.4 (art. 74, § 4º, na inexigibilidade)
  - sinais: perfil pontuado presente na matriz de horas e na RACI
  - confere: código
  - dispensa: nunca
- **PROP-EQUIPE.10** Equipe de campo ou local compatível com a regra de subcontratação do edital
  - fonte: `licitacoes.md` 2.8 (art. 122); `checklist.md` (CTR2: exclusão ou obrigação do contratante); `experiencia.md` §5
  - sinais: "subcontratação" | "equipe local" | "vedada" | "permitida"
  - confere: só PMO
  - dispensa: sem campo

## Perguntas de qualidade
- A equipe dá conta do volume em cada frente e em cada mês, e não só na média? (PC7; `experiencia.md` §4)
- A coordenação cresce se o projeto cresce por ondas ou lotes? (PC7)
- Algum perfil tem duas cargas que crescem por motivos diferentes (supervisor que também articula municípios)? (`experiencia.md` §4)
- Há separação de equipes quando a mesma frente orienta e avalia? (PROP-METODOLOGIA.9, CP14)
- O profissional apresentado para pontuar terá disponibilidade real no período? (`licitacoes.md` 2.2; PMBOK 6, p. 478–479)

## Erros comuns
- Horas iguais todo mês enquanto o trabalho se concentra em poucas fases (`experiencia.md` §4).
- Coordenação com poucas horas diante de muitas frentes (PC7).
- Profissional pontuado que não aparece na execução (`licitacoes.md` 2.2).
- RACI sem o contratante, ou com mais de um "A" por linha (PMBOK 6, p. 317; Rework RW-049).
- Campo com equipe local quando o edital veda subcontratação (pergunta de esclarecimento, CTR2).

## Quando dispensar a parte inteira
Não se dispensa: horas por perfil são a base do preço. Em porte pequeno, a RACI pode virar uma coluna de responsável no quadro de produtos.
Linha para a tela: "Equipe em quadro de horas, com responsável por produto: porte pequeno."

## Ligações
- **Vem de:** edital (equipe mínima, critérios de pontuação de pessoal); PROP-EAP (atividades); PROP-METODOLOGIA (técnicas e campo).
- **Vai para:** PROP-PRECO (horas × perfil × valor-hora); PROP-MATRIZ (critério de pessoal ligado à página); TAP7 e TAP8; A6, B26 e B18 na etapa 4.

## Modelo de redação
```
1. Perfis: | Perfil | Exigido ou sugerido | Requisitos (doc, p.) | Pontuado? | Nome (decisão do GP) |
2. Horas: | Código EAP | Atividade | Perfil A | Perfil B | ... |   Totais: código.
   Premissas de produtividade: [n por dia, a definir pelo GP ou da base].
3. Responsáveis: | Frente/produto | Responsável (perfil) |
4. RACI: | Produto/fase | Coordenação | Perfil A | Contratante | ... |
5. Campo: [equipe própria ou local, conforme a regra de subcontratação, doc, p.].
```

## Fontes
- PMBOK 6: 6.4, p. 200–201 (PDF 236–237); 9.1, p. 317 (PDF 353); 9.2, p. 320, 324 e 325 (PDF 356, 360 e 361); 12.1, p. 478–479 (PDF 514–515).
- Rework: RW-036 (https://resources.rework.com/libraries/project-management/project-deliverables); RW-049 (https://resources.rework.com/libraries/project-management/what-is-raci-matrix).
- `licitacoes.md` 2.2, 2.4 e 2.8; `checklist.md` (PC7; CTR2; CP14); `experiencia.md` §4 e §5; SKILL.md, princípio 1 e etapa 2.
