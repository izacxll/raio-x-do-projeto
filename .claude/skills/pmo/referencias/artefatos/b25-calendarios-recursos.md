---
codigo: B25
nome: Calendários dos recursos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: equipe
sinonimos: ["calendário dos recursos", "calendários dos recursos", "disponibilidade da equipe", "disponibilidade dos recursos", "dedicação da equipe", "capacidade da equipe", "mapa de alocação", "histograma de alocação"]
versao: 0.2.0
---

# B25 — Calendários dos recursos

## Para que serve
Diz quando cada recurso está disponível e por quanto tempo: "Um calendário que identifica os dias úteis e turnos em que cada recurso específico encontra-se disponível" (PMBOK 6, glossário, p. 701, PDF 737; 9.3.3.3, p. 334, PDF 370). Um cronograma confiável depende dele (p. 331, PDF 367). Nos projetos da FGV, serve sobretudo para **conferir o pico de carga contra as horas disponíveis** (PC7). O calendário do projeto como um todo é o B13.

## Conteúdo mínimo
- **B25.1** Disponibilidade de cada recurso (pessoa ou perfil, equipamento) por período: quando entra e por quanto tempo fica
  - fonte: PMBOK 6, 9.3.3.3, p. 334 (PDF 370)
  - sinais: tabela recurso × mês ou semana | "disponível" | "entrada" | "saída"
  - confere: código
  - dispensa: nunca
- **B25.2** Horas disponíveis por mês para o projeto, com a dedicação (integral ou parcial)
  - fonte: PMBOK 6, cap. 9, adaptação, p. 311 (PDF 347); Rework RW-010 (https://resources.rework.com/libraries/project-management/capacity-planning)
  - sinais: "horas disponíveis" | "dedicação" | "tempo parcial" | "%" | "h/mês"
  - confere: código
  - dispensa: nunca
- **B25.3** Ausências e compromissos conhecidos: férias, feriados, outros projetos
  - fonte: PMBOK 6, 9.3.1.2, p. 331 (PDF 367); Rework RW-010
  - sinais: "férias" | "recesso" | "outros projetos" | "indisponível"
  - confere: código
  - dispensa: nunca
- **B25.4** Pico de carga conferido contra as horas disponíveis, por perfil e por mês; a conta é do código
  - fonte: `checklist.md` PC7; `experiencia.md` §4; PMBOK 6, p. 331 (PDF 367); Rework RW-008 (https://resources.rework.com/libraries/project-management/resource-allocation)
  - sinais: demanda (B26 por mês) e capacidade (B25.2) para o mesmo perfil e período | "pico" | "superalocação"
  - confere: código
  - dispensa: nunca
- **B25.5** Premissa de utilização abaixo de 100%, escrita e levada ao B3
  - fonte: Rework RW-008; Rework RW-010; PMBOK 6, 9.2.3.4, p. 327 (PDF 363) (disponibilidade vai ao registro de premissas)
  - sinais: "utilização" | "horas produtivas" | "margem" | "premissa"
  - confere: código
  - dispensa: nunca
- **B25.6** Resposta prevista para superalocação: nivelamento, redistribuição, reforço ou revisão de prazo
  - fonte: PMBOK 6, 6.5.2.3, p. 211–212 (PDF 247–248); Rework RW-008; Rework RW-010
  - sinais: "nivelamento" | "estabilização" | "redistribuir" | "reforço"
  - confere: código
  - dispensa: porte pequeno
- **B25.7** Local e calendário local da equipe de campo (feriados municipais, sazonalidade, fuso)
  - fonte: PMBOK 6, 9.3.1.2, p. 331 (PDF 367) e 9.3.3.3, p. 334 (PDF 370)
  - sinais: "feriado municipal" | "localização" | "fuso" | "período chuvoso" | "calendário de campo"
  - confere: código
  - dispensa: sem campo
- **B25.8** Atualização progressiva e coerência com o cronograma (B15) e com as designações (B18)
  - fonte: PMBOK 6, 9.3.3.3, p. 334 (PDF 370); 6.5, p. 217 (PDF 253) (cronograma preliminar até confirmar as alocações)
  - sinais: "atualizado" | "versão" | remissão ao B15 ou ao B18
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- A equipe dá conta do pico, e não só da média? Em que mês e em que perfil a demanda passa da capacidade? (PC7; `experiencia.md` §4)
- A coordenação tem horas no mês em que as frentes correm em paralelo? (PC7; A7.8 e A7.9, CP12)
- Profissional que atua em outros projetos teve as horas descontadas? (Rework RW-008 e RW-010)
- O calendário de campo considera feriados locais, clima e deslocamento? (B13.7)
- Quando o contrato atrasa, o pico se desloca para um período em que a equipe não está disponível? (PC4)

## Erros comuns
- Dimensionar pela média e esconder o pico (`experiencia.md` §4).
- Planejar a 100% de utilização, sem válvula (Rework RW-008 e RW-010).
- Supor que quem está em vários projetos tem capacidade plena neste (Rework RW-008).
- Repetir no B25 o calendário do projeto (B13) sem dizer a disponibilidade de cada recurso (PMBOK 6, p. 334, PDF 370).

## Quando dispensar a parte inteira
Não se dispensa a conferência do pico (PC7). O calendário pode ficar no nível do projeto, e não da atividade (PMBOK 6, p. 334, PDF 370). Em porte pequeno, pode virar duas colunas no B18 (período e horas por mês) mais a conferência do pico feita pelo código.
Linha para a tela: "Calendário dos recursos como colunas de período e horas no B18: porte pequeno (PMBOK 6, p. 334)."

## Ligações
- **Vem de:** 9.3 (saída), com A6, B26 e B15 (p. 330–331, PDF 366–367); proposta (dedicação de cada perfil); B13 (dias de trabalho do projeto).
- **Vai para:** 6.4 e 6.5 (durações e datas); 9.2 (quando o processo se repete); 9.4 (quando a equipe pode treinar, p. 339, PDF 375); 11.5; 6.6 (controle). Atualizado em 9.4.
- Conta do pico: B26 (demanda por mês) contra B25 (horas disponíveis), feita pelo código.

## Modelo de redação
```
| Perfil / pessoa | Dedicação | Mês 1 (h disp.) | Mês 2 | ... | Ausências conhecidas | Local |
Utilização considerada: [a definir pelo GP; o Rework cita 70–80% para trabalho intelectual].
Pico: demanda (B26) × horas disponíveis, por perfil e mês: código.
Se a demanda passar da capacidade: sugere-se [nivelar / redistribuir / reforçar / rever prazo] — decisão do GP.
Calendário de campo: [feriados locais, sazonalidade — B13].
```

## Fontes
- PMBOK 6: cap. 9, p. 311 (PDF 347); 9.2.3.4, p. 327 (PDF 363); 9.3, p. 330–334 (PDF 366–370); 9.4, p. 339 (PDF 375); 6.5, p. 211–212 e 217 (PDF 247–248 e 253); glossário, p. 701 (PDF 737).
- Rework: RW-008 e RW-010 (links nos itens).
- `checklist.md` (PC4, PC7; A7.8 e A7.9, CP12); `experiencia.md` §4; ficha `b13-calendarios-projeto`.
