---
codigo: A14
nome: Linha de base do cronograma
tipo: componente do plano
etapas: [4, 5]
gravidade: média
categoria: tempo
sinonimos: ["baseline do cronograma", "cronograma aprovado", "cronograma de referência", "cronograma físico", "cronograma físico-financeiro", "linha de base de prazo"]
versao: 0.1.0
---

# A14 — Linha de base do cronograma

## Para que serve
É "a versão aprovada de um modelo de cronograma que pode ser mudada somente mediante procedimentos de controle de mudanças formais" (PMBOK 6, 6.5.3.1, p. 217, PDF 253). Serve de referência para comparar planejado e real (6.6). Inclui a reserva de contingência e deixa a gerencial de fora (p. 202, PDF 238). Rascunho não é linha de base: ela só existe depois da aprovação (Rework RW-029).

## Conteúdo mínimo
- **A14.1** Identificada como versão aprovada: número da versão, data e quem aprovou
  - fonte: PMBOK 6, 6.5.3.1, p. 217 (PDF 253); glossário, p. 715 (PDF 751); PMBOK 7, glossário, p. 246 (PDF 341); Rework RW-029 (https://resources.rework.com/libraries/project-management/project-baseline)
  - sinais: "linha de base" | "baseline" | "versão aprovada" | "aprovado em" | "aprovado por" | quadro de versão com data
  - confere: código
  - dispensa: nunca
- **A14.2** Datas de início e de término de linha de base para cada atividade ou pacote de trabalho
  - fonte: PMBOK 6, 6.5.3.1, p. 217 (PDF 253)
  - sinais: "início" | "término" | "início LB" | "término LB" | tabela ou Gantt com as duas datas por linha
  - confere: código
  - dispensa: nunca
- **A14.3** Contém as datas de entrega e os marcos significativos, inclusive os contratuais
  - fonte: PMBOK 6, 6.2, p. 186 (PDF 222); 6.5.3.1, p. 217 (PDF 253)
  - sinais: "marco" | "entrega do produto" | "produto 1" | losangos | "duração zero"
  - confere: código
  - dispensa: nunca
- **A14.4** Contingência de cronograma dentro da linha de base e identificada; reserva gerencial fora dela
  - fonte: PMBOK 6, 6.4, p. 202 (PDF 238); glossário, p. 722 (PDF 758); PMBOK 7, 2.8, p. 127 (PDF 222)
  - sinais: "contingência" | "reserva de cronograma" | "reserva gerencial" | "reserva de gerenciamento" | linha própria de reserva
  - confere: código
  - dispensa: nunca
- **A14.5** Data de referência da linha de base (assinatura, ordem de serviço ou aprovação do plano)
  - fonte: Rework RW-029 (passo 4 e observação do leitor); checklist 9; experiencia.md §2
  - sinais: "ordem de serviço" | "data de assinatura" | "data da linha de base" | "a partir de"
  - confere: código
  - dispensa: nunca
- **A14.6** Coerente com os prazos da RFP ou do contrato e com os marcos do TAP (a comparação é do código)
  - fonte: PMBOK 6, 6.1, p. 180 (PDF 216) (TAP como entrada); experiencia.md §2; Rework RW-029 (observação do leitor)
  - sinais: "prazo contratual" | "conforme o termo de referência" | "cronograma do contrato" | marcos com as mesmas datas do TAP
  - confere: código
  - dispensa: nunca
- **A14.7** Conferida antes de aprovar: conflitos lógicos resolvidos e datas confrontadas com os calendários dos recursos
  - fonte: PMBOK 6, 6.5, p. 207 (PDF 243); Rework RW-009 (https://resources.rework.com/libraries/project-management/resource-leveling-vs-smoothing)
  - sinais: "nivelamento" | "conflito de recursos" | "calendário dos recursos" | "revisado com a equipe"
  - confere: só PMO
  - dispensa: nunca
- **A14.8** Regra de mudança: só por controle integrado de mudanças, com aditivo ou apostila quando mexe em prazo contratual
  - fonte: PMBOK 6, 6.6, p. 223 e 229 (PDF 259 e 265); `licitacoes.md` 2.7; Rework RW-029
  - sinais: "controle de mudanças" | "solicitação de mudança" | "aditivo" | "apostilamento" | "nova linha de base" | "rebaseline"
  - confere: código
  - dispensa: nunca
- **A14.9** Forma de comparar planejado e real (colunas de linha de base, real e variação)
  - fonte: PMBOK 6, 6.5.3.1, p. 217 (PDF 253); 6.6, p. 228 (PDF 264); PMBOK 7, 2.7.2, p. 100 (PDF 195)
  - sinais: "planejado × realizado" | "variação" | "real" | "desvio" | "VPR" | "IDP"
  - confere: código
  - dispensa: porte pequeno
- **A14.10** Com ondas sucessivas: onda atual em detalhe, ondas futuras em pacotes de planejamento e data final do contrato como restrição fixa
  - fonte: PMBOK 6, 6.2, p. 185 (PDF 221); glossário, pacote de planejamento, p. 717 (PDF 753); Rework RW-037 (https://resources.rework.com/libraries/project-management/rolling-wave-planning)
  - sinais: "onda" | "ondas sucessivas" | "pacote de planejamento" | "detalhamento posterior"
  - confere: código
  - dispensa: porte pequeno ou uma fase

## Perguntas de qualidade
- A linha de base tem data e aprovação, ou é um rascunho com o nome de linha de base? (Rework RW-029)
- A contingência aparece como linha própria, e a reserva gerencial ficou de fora? (PMBOK 6, p. 202, PDF 238)
- As datas estão contadas de um evento que tem data? O que acontece se a assinatura atrasar? (checklist 9; experiencia.md §2)
- O plano diz que mudar data de produto exige pedido formal ao contratante? (`licitacoes.md` 2.7)
- O cronograma anexo ao contrato é a linha de base externa; há também uma interna, com o esforço da FGV? (Rework RW-029, observação do leitor)

## Erros comuns
- Ajustar a linha de base ao realizado sem pedido de mudança ("linha de base elástica"), o que apaga a medição da variação (Rework RW-029).
- Fixar a linha de base antes de o escopo estabilizar (Rework RW-029).
- Aprovar sem conferir conflitos lógicos e de recursos (PMBOK 6, p. 207, PDF 243).
- Pôr a reserva gerencial dentro da linha de base, ou não identificar a contingência (PMBOK 6, p. 202, PDF 238).
- Nivelar movendo um produto contratual sem aprovação (Rework RW-009).

## Quando dispensar a parte inteira
Não se dispensa quando há prazos contratuais, o caso de todo projeto da FGV. Em porte pequeno, pode ser o próprio B15 aprovado, marcado como linha de base, com versão, data e aprovador.
Linha para a tela: "Linha de base = cronograma aprovado, sem documento à parte: porte pequeno (PMBOK 6, p. 217)."

## Ligações
- **Vem de:** 6.5, com B15, B16, B13, B25 e B27 (reservas; p. 208, PDF 244); A3 (regras); TAP.6 (marcos); prazos da RFP e do contrato.
- **Vai para:** 6.6 (comparação), 4.6 (mudanças), 11.2 e 11.4 (riscos); A16 (com A13 e A15); A11 (fluxo de mudança com o cliente). Atualizada por 6.2 e 11.5.
- Requisitos que pedem "cronograma físico" ou "cronograma físico-financeiro" caem aqui e no B15.

## Modelo de redação
```
Linha de base do cronograma — versão [n], aprovada em [data a definir] por [a definir pelo GP]
Data de referência: [assinatura/ordem de serviço]; datas contadas em [dias úteis/corridos].
Tabela: ID | Atividade ou produto | Início LB | Término LB | Marco (s/n) | Prazo da RFP (pág.)
Contingência de cronograma: [onde fica; tamanho a definir pelo GP]. Reserva gerencial: fora da linha de base.
Mudanças: por solicitação no controle integrado; prazo contratual só com [aditivo/apostila].
```

## Fontes
- PMBOK 6: 6.1, p. 180 (PDF 216); 6.2, p. 185–186 (PDF 221–222); 6.4, p. 202 (PDF 238); 6.5, p. 207–208 e 217 (PDF 243–244 e 253); 6.6, p. 223–229 (PDF 259–265); glossário, p. 715, 717 e 722 (PDF 751, 753 e 758).
- PMBOK 7: 2.7.2, p. 100 (PDF 195); 2.8, p. 127 (PDF 222); glossário, p. 246 (PDF 341).
- Rework: RW-009, RW-029, RW-037 (links nos itens).
- `licitacoes.md` 2.7; `checklist.md` 9; `experiencia.md` §2.
