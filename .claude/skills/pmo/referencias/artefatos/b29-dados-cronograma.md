---
codigo: B29
nome: Dados do cronograma
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: tempo
sinonimos: ["dados do cronograma", "premissas do cronograma", "memória do cronograma", "base de dados do cronograma", "modelo do cronograma", "histograma de recursos", "cenários do cronograma"]
versao: 0.2.0
---

# B29 — Dados do cronograma

## Para que serve
É "o conjunto de informações usadas para descrever e controlar o cronograma" (PMBOK 6, 6.5.3.3, p. 220, PDF 256): os dados que entram no modelo e o que o acompanha (premissas, recursos por período, cenários, reservas). O cronograma (B15) é a saída do modelo; os dados são o que permite refazê-lo e controlá-lo (p. 175–176, PDF 211–212). Na skill, é o pacote que o código usa para calcular.

## Conteúdo mínimo
- **B29.1** Marcos, atividades e atributos do modelo, consolidados ou referenciados (B11, B2, B1)
  - fonte: PMBOK 6, 6.5.3.3, p. 220 (PDF 256)
  - sinais: "marcos" | "atividades" | "atributos" | referência a B11, B2 ou B1 | tabela de atividades com marcos
  - confere: código
  - dispensa: nunca
- **B29.2** Premissas e restrições do cronograma documentadas (data de início suposta, prazos de análise, disponibilidade de dados e de pessoas)
  - fonte: PMBOK 6, 6.5.3.3, p. 220 (PDF 256); experiencia.md §2; `checklist.md` PC4
  - sinais: "premissas do cronograma" | "restrições" | "data de início prevista" | "a partir da ordem de serviço" | "prazo de análise"
  - confere: código
  - dispensa: nunca
- **B29.3** Requisitos de recursos por período (histograma ou tabela pessoas × mês)
  - fonte: PMBOK 6, 6.5.3.3, p. 220 (PDF 256); experiencia.md §4; `checklist.md` PC7
  - sinais: "histograma" | "recursos por mês" | "alocação mensal" | tabela de perfis × períodos
  - confere: código
  - dispensa: porte pequeno
- **B29.4** Cronogramas alternativos: melhor e pior caso, nivelado ou não, com ou sem datas impostas
  - fonte: PMBOK 6, 6.5.3.3, p. 220 (PDF 256); 6.5, p. 213 (PDF 249) (cenário "E-se")
  - sinais: "cenário" | "otimista" | "pessimista" | "nivelado" | "alternativo" | "E-se"
  - confere: código
  - dispensa: porte pequeno ou porte médio
- **B29.5** Reservas de cronograma aplicadas: onde estão (valor é decisão do GP)
  - fonte: PMBOK 6, 6.5.3.3, p. 220 (PDF 256); 6.4, p. 202 (PDF 238)
  - sinais: "reserva de cronograma" | "contingência" | "pulmão" | "buffer" | "folga"
  - confere: código
  - dispensa: nunca
- **B29.6** Projeção de fluxo de caixa ou de faturamento ligada às datas de entrega e aceite dos produtos
  - fonte: PMBOK 6, 6.5.3.3, p. 220 (PDF 256); experiencia.md §1 (pagamento por produto)
  - sinais: "fluxo de caixa" | "desembolso" | "faturamento" | "cronograma físico-financeiro" | "parcela"
  - confere: código
  - dispensa: porte pequeno
- **B29.7** Cronograma de pedidos e entregas de aquisições (subcontratados, serviços de campo, materiais)
  - fonte: PMBOK 6, 6.5.3.3, p. 220 (PDF 256); 6.5, p. 208 (PDF 244) (acordos)
  - sinais: "contratação de" | "entrega do fornecedor" | "cronograma de aquisições" | "pedido"
  - confere: código
  - dispensa: porte pequeno ou subcontratação vedada
- **B29.8** Versão do modelo e data dos dados (data de status) registradas
  - fonte: PMBOK 6, Fig. 6-21, p. 219 (PDF 255); 6.6, p. 230 (PDF 266) (atualização dos dados)
  - sinais: "versão" | "data dos dados" | "data de status" | "atualizado em"
  - confere: código
  - dispensa: nunca
- **B29.9** Dados completos para refazer o cálculo: toda atividade com duração, predecessoras e calendário
  - fonte: PMBOK 6, p. 175–176 (PDF 211–212) (o modelo nasce dos dados); 6.5, p. 207 (PDF 243); SKILL.md, princípio 6
  - sinais: atividade sem duração, sem predecessora ou sem calendário | "a definir" em colunas da rede
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- A data de início suposta está escrita como premissa, com o efeito de um atraso na assinatura? (experiencia.md §2; PC4)
- O histograma mostra o pico de trabalho, ou distribui horas iguais todos os meses? (experiencia.md §4)
- O fluxo de faturamento depende do aceite? Um atraso de aprovação vira atraso de caixa (experiencia.md §1).
- O cenário pessimista usa os pessimistas do B8, e não um percentual arbitrário? A conta é do código.
- As premissas do cronograma estão também no B3?

## Erros comuns
- Premissas do cronograma só implícitas nas datas; quando a data de início muda, ninguém sabe o que recalcular (PMBOK 6, p. 220, PDF 256; experiencia.md §2).
- Recursos pela média, sem histograma, escondendo o pico (experiencia.md §4).
- Modelo que não se refaz: datas digitadas à mão, sem durações nem dependências (PMBOK 6, p. 175–176, PDF 211–212).
- Fluxo de caixa montado pela data de entrega, quando o pagamento depende do aceite (experiencia.md §1).

## Quando dispensar a parte inteira
Em porte pequeno, os dados do cronograma podem ficar no próprio cronograma (B15) e no registro de premissas (B3): atividades, marcos e premissas são o mínimo do PMBOK (p. 220, PDF 256), e os detalhes de apoio (histograma, cenários, fluxo de caixa) são opcionais. O PMBOK admite fazer 6.2 a 6.5 como um só processo em projeto pequeno (p. 175, PDF 211).
Linha para a tela: "Dados do cronograma no cronograma e nas premissas: porte pequeno (PMBOK 6, p. 175 e 220)."

## Ligações
- **Vem de:** 6.5, com B1, B2, B11, B16, B8, B4, B3, B18, B25, B26 e B27; acordos com fornecedores (p. 208, PDF 244).
- **Vai para:** 6.6 (controle; atualizado com novos diagramas ou novo cronograma-alvo, p. 230, PDF 266); B15 (saída do modelo); A14 (o modelo aprovado); A4/A15 (fluxo de caixa); B30 (previsões partem destes dados).

## Modelo de redação
```
Dados do cronograma — versão [n]; data dos dados [a definir pelo GP]
1. Atividades, marcos e atributos: ver B2, B11 e B1 (ou anexo do modelo).
2. Premissas do cronograma: data de início [evento]; prazo de análise do contratante
   [do contrato ou a definir pelo GP]; disponibilidade de dados [de quem; quando].
3. Recursos por período: perfil × mês [horas do B26; conta do código].
4. Cenários: base, pessimista (pessimistas do B8) [datas calculadas pelo código].
5. Reservas aplicadas: [onde; valor decisão do GP].
6. Fluxo de faturamento por produto: [regra de pagamento do contrato, página].
7. Aquisições: [o que; quando contratar; quando entregar].
```

## Fontes
- PMBOK 6: p. 175–176 (PDF 211–212); 6.4, p. 202 (PDF 238); 6.5, p. 207–208, 213 e 220 (PDF 243–244, 249 e 256); Fig. 6-21, p. 219 (PDF 255); 6.6, p. 230 (PDF 266); glossário, p. 705 (PDF 741).
- PMBOK 7: não traz os dados do cronograma entre os artefatos (lista, p. 184–192, PDF 279–287); usa o cronograma do projeto (p. 188, PDF 283).
- `checklist.md` (PC4, PC7); `experiencia.md` §1, §2 e §4; SKILL.md, princípio 6.
