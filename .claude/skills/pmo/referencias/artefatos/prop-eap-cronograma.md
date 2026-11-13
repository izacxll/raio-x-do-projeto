---
codigo: PROP-EAP
nome: EAP e estimativas de duração da proposta
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["EAP", "estrutura analítica do projeto", "plano de trabalho", "cronograma", "cronograma físico", "cronograma de execução", "WBS"]
versao: 0.2.0
---

# PROP-EAP — EAP e estimativas de duração da proposta

## Para que serve
O PMO monta a EAP por produto e estima as durações em três pontos, com a base de cada estimativa. **O código** monta as datas e o caminho crítico, inclui os tempos de aprovação do cliente e confere tudo contra os prazos da RFP (SKILL.md, etapa 2, passo 5; princípio 6). A EAP decompõe entregas, não atividades (PMBOK 6, 5.4, p. 157, PDF 193); as durações saem do esforço e dos recursos (6.4, p. 196–197, PDF 232–233).

## Conteúdo mínimo
- **PROP-EAP.1** EAP hierárquica com código único, com o segundo nível espelhando os produtos do TR e um ramo de gerenciamento do projeto
  - fonte: PMBOK 6, 5.4, p. 157–161 (PDF 193–197); ficha A13 (A13.3, A13.5, A13.6)
  - sinais: "EAP" | numeração hierárquica (1, 1.1, 1.1.1) | "gerenciamento do projeto" | "Produto 1"
  - confere: código
  - dispensa: nunca
- **PROP-EAP.2** Componentes da EAP são entregas nomeadas como substantivos; atividades ficam abaixo dos pacotes
  - fonte: PMBOK 6, 5.4, p. 157 (PDF 193); Rework RW-036
  - sinais: rótulos substantivos ("Relatório de diagnóstico"); verbo no infinitivo indica atividade
  - confere: só PMO
  - dispensa: nunca
- **PROP-EAP.3** Cada atividade ou pacote com duração em três pontos (otimista, mais provável, pessimista) e a unidade, sem a média
  - fonte: PMBOK 6, 6.4, p. 201 (PDF 237); Rework RW-057; SKILL.md, seção 4 (formato da estimativa)
  - sinais: "otimista" | "mais provável" | "pessimista" | "dias úteis" | campos otimista, mais_provavel e pessimista
  - confere: código
  - dispensa: nunca
- **PROP-EAP.4** Base de cada estimativa: método (análoga, paramétrica, opinião), premissas, restrições e riscos considerados
  - fonte: PMBOK 6, bases das estimativas, p. 204 (PDF 240); 6.4, p. 200–202 (PDF 236–238)
  - sinais: "base" | "análoga" | "paramétrica" | "premissa" | campo base preenchido
  - confere: código
  - dispensa: nunca
- **PROP-EAP.5** Pessimista que reflete os riscos reais (retrabalho, demora de dados, campo), não um acréscimo fixo
  - fonte: Rework RW-057 (subestimar o pessimista é o erro mais comum); PMBOK 6, 6.4, p. 201 (PDF 237)
  - sinais: base do pessimista cita risco, brecha ou premissa crítica
  - confere: só PMO
  - dispensa: nunca
- **PROP-EAP.6** Tempo de análise e aprovação do contratante como atividade própria depois de cada produto, com a duração do edital ou sugerida
  - fonte: PMBOK 6, 12.1, TR, p. 478 (PDF 514); `checklist.md` PC3; `experiencia.md` §1; PROP-SOW.9
  - sinais: "análise do contratante" | "aprovação" | atividade do contratante ligada a cada produto
  - confere: código
  - dispensa: nunca
- **PROP-EAP.7** Dependências entre atividades, inclusive as externas (dados do contratante, terceiros), como marcos de entrada
  - fonte: PMBOK 6, 6.3, p. 187 (PDF 223); `checklist.md` PC1 e PC6; Rework RW-033 (dependências do cliente com data)
  - sinais: "predecessora" | "depende de" | "marco" | "recebimento dos dados"
  - confere: código
  - dispensa: nunca
- **PROP-EAP.8** Prazos contados da ordem de serviço ou da assinatura, e os prazos e marcos da RFP passados ao código, com página
  - fonte: `checklist.md` PC4 (CE15); `experiencia.md` §2; especificação da etapa 2, passo 5
  - sinais: "a partir da ordem de serviço" | "dias após a assinatura" | prazo da RFP com página
  - confere: código
  - dispensa: nunca
- **PROP-EAP.9** Folgas de cronograma vindas dos destinos de risco identificadas como tal, com o motivo
  - fonte: PMBOK 6, 6.4, análise de reservas, p. 202 (PDF 238); 11.5, p. 443 (PDF 479); PROP-ESTRATEGIA.8
  - sinais: "folga" | "reserva de cronograma" | "contingência" | origem do risco
  - confere: código
  - dispensa: nunca
- **PROP-EAP.10** Deslocamento e logística de campo nas durações, por território
  - fonte: `experiencia.md` §5
  - sinais: "deslocamento" | "viagem" | "território" | base que cita distância ou logística
  - confere: código
  - dispensa: sem campo

## Perguntas de qualidade
- Somando os filhos chega-se ao produto, sem trabalho órfão? (PMBOK 6, p. 161; ficha A13)
- Quem estimou conhece o trabalho? A base diz de onde veio o número? (PMBOK 6, p. 196 e 204)
- Algum prazo de produto conta de um evento sem data ("após a aprovação" sem prazo)? (PC3 e PC4)
- O período de execução cruza eleição ou troca de gestão do nível do contratante? Se sim, isso entra como premissa ou folga. (PC5, CE17)
- O PMO deixou de afirmar que o prazo "é curto" e passou a conta ao código? (SKILL.md, princípio 6; `checklist.md` PC4, limite do PMO)

## Erros comuns
- EAP de atividades, ou sem ramo de gerenciamento (PMBOK 6, p. 157 e 161).
- Estimativa pontual otimista, sem base (Rework RW-057; RW-014).
- Cronograma sem os tempos de aprovação do cliente (`experiencia.md` §1).
- Datas fixas misturadas com prazos relativos, sem rede que mostre o conflito (`experiencia.md` §2).
- O PMO calculando média, datas ou caminho crítico (SKILL.md, princípio 6).

## Quando dispensar a parte inteira
Não se dispensa: a EAP sustenta o preço e o cronograma. Em porte pequeno, basta uma tabela de produtos e pacotes com as três durações e a base.
Linha para a tela: "EAP em tabela com durações em três pontos: porte pequeno."

## Ligações
- **Vem de:** PROP-SOW (produtos, prazos de aprovação, obrigações); PROP-METODOLOGIA (fases); PROP-ESTRATEGIA.8 (folgas); etapa 1 (prazos da RFP).
- **Vai para:** código (datas, caminho crítico, conferência de prazos); PROP-EQUIPE (horas por atividade); PROP-PRECO; TAP6; A13, B8, B4 e B15 na etapa 4.

## Modelo de redação
```
EAP: 1 Gerenciamento do projeto — 1.1 Plano de trabalho; 1.2 Relatórios
     2 Produto 1 [nome do TR] — 2.1 [pacote]; 2.2 Análise e aprovação do contratante
| Código | Atividade/pacote | Predecessoras | Otimista | Mais provável | Pessimista | Unidade | Base | Responsável |
| 2.2 | Análise do contratante | 2.1 | [edital ou sugestão] | ... | ... | dias úteis | [doc, p.] | Contratante |
Início: a partir de [ordem de serviço/assinatura]; prazos da RFP: [doc, p.].
Folgas: | Atividade | Motivo (brecha ou premissa crítica PCn) |   Datas e caminho crítico: código.
```

## Fontes
- PMBOK 6: 5.4, p. 157–161 (PDF 193–197); 6.3, p. 187 (PDF 223); 6.4, p. 196–202 (PDF 232–238); bases das estimativas, p. 204 (PDF 240); 11.5, p. 443 (PDF 479); 12.1, p. 478 (PDF 514).
- Rework: RW-014 (https://resources.rework.com/libraries/project-management/project-cost-estimation); RW-033 (https://resources.rework.com/libraries/project-management/statement-of-work); RW-036 (https://resources.rework.com/libraries/project-management/project-deliverables); RW-057 (https://resources.rework.com/libraries/project-management/three-point-estimation).
- `checklist.md` PC1, PC3, PC4, PC5 e PC6; `experiencia.md` §1, §2, §5; ficha A13; SKILL.md, etapa 2 e princípio 6.
