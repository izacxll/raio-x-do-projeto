---
codigo: A6
nome: Plano de gerenciamento dos recursos
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: equipe
sinonimos: ["plano de recursos", "plano de gerenciamento de recursos", "plano de gestão de recursos", "plano de gerenciamento da equipe", "plano de recursos humanos", "gestão da equipe", "plano de pessoal"]
versao: 0.1.0
---

# A6 — Plano de gerenciamento dos recursos

## Para que serve
Diz como os recursos de equipe e os físicos serão identificados, obtidos, organizados, acompanhados e liberados. O glossário o define como o componente que descreve "como recursos do projeto são adquiridos, alocados, monitorados e controlados" (PMBOK 6, p. 719, PDF 755). O esforço de gestão deve caber no tipo e na complexidade do projeto (9.1, p. 313, PDF 349). Nomes ficam no B18; combinados, no B32.

## Conteúdo mínimo
- **A6.1** Método para identificar e quantificar os recursos de equipe e físicos por atividade e agregá-los
  - fonte: PMBOK 6, 9.1.3.1, p. 318 (PDF 354); 9.2.1.1, p. 322 (PDF 358)
  - sinais: "identificação dos recursos" | "requisitos de recursos" | "estimativa de recursos" | "bottom-up" | "por atividade"
  - confere: código
  - dispensa: nunca
- **A6.2** Como a equipe e os recursos físicos serão obtidos: equipe própria, contratação, cessão do contratante, e equipe-chave já indicada na proposta
  - fonte: PMBOK 6, 9.1.3.1, p. 318 (PDF 354); 9.3, p. 329 e 333 (PDF 365 e 369)
  - sinais: "mobilização" | "contratação" | "equipe-chave" | "pré-designação" | "cedido"
  - confere: código
  - dispensa: nunca
- **A6.3** Papéis com responsabilidade, autoridade e competência exigida de cada um
  - fonte: PMBOK 6, 9.1.3.1, p. 318–319 (PDF 354–355)
  - sinais: "papéis e responsabilidades" | "autoridade" | "competência" | "atribuições" | tabela papel × responsabilidade
  - confere: código
  - dispensa: nunca
- **A6.4** Autoridade compatível com a responsabilidade: quem aceita entregas, decide método e responde a variações
  - fonte: PMBOK 6, 9.1.3.1, p. 318–319 (PDF 354–355)
  - sinais: papel com responsabilidade e o poder de decisão correspondente; "aprova" | "decide"
  - confere: só PMO
  - dispensa: nunca
- **A6.5** Organograma do projeto, com a interface com o contratante, no detalhe que o porte pede
  - fonte: PMBOK 6, 9.1.3.1, p. 319 (PDF 355); PMBOK 7, 2.2, p. 19 (PDF 114)
  - sinais: "organograma" | "estrutura do projeto" | "comitê" | "ponto focal" | diagrama hierárquico
  - confere: código
  - dispensa: nunca
- **A6.6** Cada pacote de trabalho ou produto com um responsável definido, por RACI ou coluna de responsável (o detalhe fica no B18)
  - fonte: PMBOK 6, 9.1.2.2, p. 316–317 (PDF 352–353); `checklist.md` 6 (CP10)
  - sinais: "RACI" | "matriz de responsabilidades" | "responsável" por produto | remissão ao B18
  - confere: código
  - dispensa: nunca
- **A6.7** Gestão da equipe ao longo do projeto: entrada, acompanhamento, liberação e regra de substituição de profissional
  - fonte: PMBOK 6, 9.1.3.1, p. 318 (PDF 354); 9.3, p. 330 (PDF 366); 9.5, p. 347 (PDF 383); `licitacoes.md` 2.2 (art. 38)
  - sinais: "desmobilização" | "liberação" | "substituição" | "anuência" | "qualificação equivalente"
  - confere: código
  - dispensa: nunca
- **A6.8** Treinamento e desenvolvimento da equipe (por exemplo, capacitação da equipe de campo)
  - fonte: PMBOK 6, 9.1.3.1, p. 319 (PDF 355); 9.4, p. 342 (PDF 378)
  - sinais: "treinamento" | "capacitação" | "nivelamento da equipe" | "desenvolvimento da equipe"
  - confere: código
  - dispensa: porte pequeno e sem campo
- **A6.9** Controle dos recursos físicos: como garantir, usar e liberar equipamentos, materiais e instalações
  - fonte: PMBOK 6, 9.1.3.1, p. 319 (PDF 355); 9.6, p. 353–354 (PDF 389–390)
  - sinais: "recursos físicos" | "equipamentos" | "controle de recursos" | "devolução" | "inventário"
  - confere: código
  - dispensa: porte pequeno e sem campo
- **A6.10** Reconhecimento e critérios de avaliação do desempenho da equipe
  - fonte: PMBOK 6, 9.1.3.1, p. 319 (PDF 355); 9.4, p. 339 (PDF 375)
  - sinais: "reconhecimento" | "avaliação de desempenho" | "feedback"
  - confere: código
  - dispensa: porte pequeno
- **A6.11** Acompanhamento da carga: comparação periódica de horas previstas e realizadas e tratamento da sobrecarga
  - fonte: PMBOK 6, 9.5, p. 345–346 (PDF 381–382); Rework RW-008 (https://resources.rework.com/libraries/project-management/resource-allocation); Rework RW-010 (https://resources.rework.com/libraries/project-management/capacity-planning)
  - sinais: "horas realizadas" | "previsto × realizado" | "superalocação" | "sobrecarga" | "carga"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- A coordenação tem horas e autoridade para o número de frentes e de interlocutores do contratante? (checklist 6; `experiencia.md` §4)
- O plano diz quem, do lado do cliente, decide e aceita? A interface aparece no organograma? (checklist 7)
- Equipe pontuada na proposta continua no plano, e a substituição exige qualificação equivalente e anuência? (`licitacoes.md` 2.2; PMBOK 6, p. 330, PDF 366)
- Se houver campo, a equipe local é compatível com a regra de subcontratação? (checklist 3 e 11; `experiencia.md` §5)
- Equipe distribuída ou mista tem mecanismo de integração? (PMBOK 7, p. 19, PDF 114; B32.9)

## Erros comuns
- Só organograma ou lista de nomes, sem autoridade definida (PMBOK 7, 2.2, sinais do domínio da equipe).
- Responsabilidade sem autoridade correspondente (PMBOK 6, p. 318–319).
- Alocar pessoas a 100% e tratar o plano inicial como fixo (Rework RW-008).
- Horas iguais todo mês enquanto o trabalho se concentra em poucas fases (`experiencia.md` §4).
- Expansão por ondas ou lotes sem crescimento da gestão (checklist 6).

## Quando dispensar a parte inteira
Não se dispensa. O PMBOK permite dividir o plano em equipe e recursos físicos (p. 318, PDF 354) e pôr designações em outros planos (p. 316, PDF 352). Em porte pequeno, pode virar uma seção "Equipe e recursos" junto com B18 e B32 (PMBOK 7, 3.2, p. 133, PDF 228).
Linha para a tela: "Recursos numa seção única, com designações e combinados da equipe: porte pequeno (PMBOK 6, p. 316 e 318)."

## Ligações
- **Vem de:** 9.1, com TAP (TAP7 recursos pré-aprovados, TAP8 partes-chave), plano da qualidade, linha de base do escopo (A13), B15, B22, B27, B31 (p. 314–315, PDF 350–351); PROP-EQUIPE (perfis, horas, RACI).
- **Vai para:** B26, B24 e B4 (9.2); B18, B12 e B25 (9.3); B32; A7 (p. 368, PDF 404); A4 e A15; B3 e B27 (disponibilidade, p. 320, PDF 356).
- Requisitos da RFP sobre equipe mínima, dedicação e substituição caem aqui (número R).

## Modelo de redação
```
1. Identificação dos recursos: sugere-se estimar por [atividade/produto], a partir da EAP (B26).
2. Obtenção: equipe-chave da proposta [doc, p.]; demais perfis [contratação/equipe própria — a definir pelo GP].
3. Papéis: | Papel | Responsabilidades | Autoridade (decide/aprova) | Competência exigida |
4. Organograma: GP, frentes, interface com o contratante [gestor/fiscal].
5. Responsáveis por produto: ver B18 (RACI).
6. Entrada, liberação e substituição: [regra do contrato, doc, p.; ou a definir pelo GP].
7. Treinamento: [capacitação de campo, se houver].
8. Recursos físicos: [equipamentos e devolução, ou "infraestrutura institucional"].
9. Reconhecimento e avaliação: [política da FGV — a definir pelo GP].
10. Acompanhamento da carga: previsto × realizado, frequência [a definir pelo GP].
```

## Fontes
- PMBOK 6: 9.1, p. 312–320 (PDF 348–356); 9.2, p. 322 (PDF 358); 9.3, p. 329–333 (PDF 365–369); 9.4, p. 339 e 342 (PDF 375 e 378); 9.5, p. 345–347 (PDF 381–383); 9.6, p. 353–354 (PDF 389–390); glossário, p. 719 (PDF 755).
- PMBOK 7: 2.2 Equipe, p. 16–31 (PDF 111–126); 3.2, p. 133 (PDF 228).
- Rework: RW-008 e RW-010 (links no item A6.11).
- `checklist.md` 3, 6, 7 e 11; `experiencia.md` §4 e §5; `licitacoes.md` 2.2.
