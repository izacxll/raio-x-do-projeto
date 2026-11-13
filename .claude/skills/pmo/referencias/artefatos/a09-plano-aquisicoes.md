---
codigo: A9
nome: Plano de gerenciamento das aquisições
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: trabalho do projeto
sinonimos: ["plano de aquisições", "plano de contratações", "plano de compras", "gestão de aquisições", "subcontratações", "contratação de terceiros", "gestão de fornecedores"]
versao: 0.2.0
---

# A9 — Plano de gerenciamento das aquisições

## Para que serve
Descreve "como a equipe do projeto adquirirá produtos e serviços fora da organização executora" (PMBOK 6, glossário, p. 719, PDF 755). Aqui a executora é a FGV, contratada: o plano trata do que ela compra ou subcontrata para cumprir o contrato (o vendedor pode comprar de subcontratados, p. 462, PDF 498), dentro do que o edital e o contrato permitem.

## Conteúdo mínimo
- **A9.1** O que será adquirido fora (decisões de fazer ou comprar), com o motivo
  - fonte: PMBOK 6, 12.1, p. 466 (PDF 502), fatores na p. 473 (PDF 509); 12.1.3.6, p. 479 (PDF 515)
  - sinais: "subcontratação" | "contratação de terceiros" | "aquisição" | "fornecedor" | "fazer ou comprar" | lista de itens a contratar
  - confere: código
  - dispensa: nunca
- **A9.2** Coerência com a regra de subcontratação do edital ou do contrato: o que pode, até que limite, com que anuência
  - fonte: `licitacoes.md` 2.8 (Lei 14.133/2021, art. 122 e § 2º) e 2.4 (art. 74, § 4º); PMBOK 6, 12.2, p. 489 (PDF 525)
  - sinais: "subcontratação" | "vedada" | "permitida" | "limite" | "anuência" | "autorização do contratante"
  - confere: só PMO
  - dispensa: nunca
- **A9.3** Tipo de contrato e forma de pagamento de cada aquisição
  - fonte: PMBOK 6, 12.1.3.2, p. 476 (PDF 512); tipos, p. 471–472 (PDF 507–508)
  - sinais: "preço fixo" | "preço global" | "por produto" | "por hora" | "tempo e material" | "forma de pagamento"
  - confere: código
  - dispensa: porte pequeno
- **A9.4** Especificação do trabalho de cada aquisição: escopo, quantidade, prazo, local e critério de aceitação
  - fonte: PMBOK 6, 12.1.3.4, p. 477–478 (PDF 513–514); Tab. 12-1, p. 481 (PDF 517)
  - sinais: "especificação do trabalho" | "termo de referência" | "escopo do fornecedor" | "critérios de aceitação"
  - confere: código
  - dispensa: porte pequeno
- **A9.5** Critérios e forma de seleção dos fornecedores, inclusive pré-qualificados, se houver
  - fonte: PMBOK 6, 12.1.3.5, p. 478–479 (PDF 514–515); 12.1.3.1, p. 475 (PDF 511)
  - sinais: "critérios de seleção" | "cotação" | "seleção de fornecedores" | "pré-qualificados" | "cadastro de fornecedores"
  - confere: código
  - dispensa: porte pequeno
- **A9.6** Cronograma das aquisições, integrado ao do projeto: contratar antes da atividade que depende do fornecedor
  - fonte: PMBOK 6, 12.1.3.1, p. 475 (PDF 511); 12.1, p. 468 (PDF 504)
  - sinais: "cronograma das aquisições" | "prazo de contratação" | "data de contratação" | marco de contratação no cronograma
  - confere: código
  - dispensa: nunca
- **A9.7** Papéis e autoridade: quem conduz, quem aprova e quem assina (compras, jurídico, GP)
  - fonte: PMBOK 6, 12.1.3.1, p. 475 (PDF 511); p. 460 e 468 (PDF 496 e 504)
  - sinais: "responsável pela contratação" | "jurídico" | "área de compras" | "suprimentos" | "assinatura"
  - confere: código
  - dispensa: nunca
- **A9.8** Restrições e premissas das aquisições (prazos internos de contratação, oferta de fornecedores no território)
  - fonte: PMBOK 6, 12.1.3.1, p. 475 (PDF 511); X5.9, p. 683 (PDF 719)
  - sinais: "premissa" | "restrição" | "disponibilidade de fornecedores" | "prazo interno"
  - confere: só PMO
  - dispensa: porte pequeno
- **A9.9** Riscos das aquisições ligados ao registro (B27), com garantias ou seguros quando cabíveis
  - fonte: PMBOK 6, 12.1.3.1, p. 475 (PDF 511); p. 470 e 485 (PDF 506 e 521)
  - sinais: "garantia" | "seguro" | "multa" | "penalidade" | "fornecedor único"
  - confere: só PMO
  - dispensa: porte pequeno
- **A9.10** Requisitos repassados ao fornecedor: sigilo, dados pessoais, propriedade intelectual
  - fonte: PMBOK 6, 12.1, p. 470 (PDF 506); `checklist.md` CP14
  - sinais: "confidencialidade" | "sigilo" | "LGPD" | "dados pessoais" | "propriedade intelectual"
  - confere: código
  - dispensa: porte pequeno e sem dados pessoais
- **A9.11** Controle do fornecedor: indicadores, aceite das entregas, pagamento contra entrega e mudanças por escrito
  - fonte: PMBOK 6, 12.1.3.1, p. 475 (PDF 511); 12.3, p. 494 e 498 (PDF 530 e 534)
  - sinais: "desempenho do fornecedor" | "indicadores" | "aceite" | "inspeção" | "pagamento contra entrega"
  - confere: código
  - dispensa: porte pequeno
- **A9.12** Encerramento de cada contrato: entregas aceitas, pagamentos feitos, nada pendente
  - fonte: PMBOK 6, 12.3, p. 499 (PDF 535)
  - sinais: "encerramento do contrato" | "termo de encerramento" | "aceite final" | "pendências"
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- Se o edital veda ou limita a subcontratação (ou a contratação é por inexigibilidade, art. 74, § 4º), a execução depende dela? Vedação com atividade de campo é brecha conhecida (pergunta de esclarecimento e exclusão ou obrigação do contratante, CTR2; `licitacoes.md` 2.4 e 2.8).
- Profissional pontuado na proposta técnica continua na execução, sem troca por subcontratado? (`licitacoes.md` 2.2, art. 38)
- O contrato com o fornecedor traz tudo o que se vai cobrar dele? O que não está no contrato não pode ser exigido (PMBOK 6, p. 461, PDF 497).
- Fornecedor único ou plataforma imposta tem alternativa e prazo? (PC2)
- O custo das aquisições e da gestão dos fornecedores está na linha de base dos custos? (PMBOK 6, p. 484, PDF 520)

## Erros comuns
- Plano que conta com subcontratação vedada ou acima do limite do edital (`licitacoes.md` 2.8; CTR2).
- Contratação de terceiros fora do cronograma; o atraso de um fornecedor se propaga para os outros (PMBOK 6, p. 500, PDF 536).
- Mudança combinada verbalmente com o fornecedor: deve ser escrita e aprovada antes (PMBOK 6, p. 494 e 496, PDF 530 e 532).
- Não dizer quem tem autoridade para contratar; em geral não é o GP (PMBOK 6, p. 460, PDF 496).
- Detalhe desproporcional ao valor e ao risco da compra (PMBOK 6, p. 477, PDF 513).

## Quando dispensar a parte inteira
O processo 12.1 decide primeiro **se** é preciso adquirir (PMBOK 6, p. 466, PDF 502), e o plano pode ser formal ou informal, detalhado ou amplo (p. 475, PDF 511); com poucas aquisições simples, as saídas podem ser combinadas (p. 481, PDF 517). Sem subcontratação nem compras relevantes, o plano se reduz a uma linha com essa decisão e, se houver, a regra do edital sobre subcontratação.
Linha para a tela: "Sem subcontratação nem compras relevantes: registrar a decisão de não adquirir (PMBOK 6, 12.1, p. 466)."

## Ligações
- **Vem de:** 12.1, com TAP, A1, A5, A6, A13, B11, B18, B22, B23, B26, B27 e B31; edital e minuta (subcontratação, garantias); proposta (equipe pontuada).
- **Vai para:** 9.3, 12.2 e 12.3; B15 (marcos de contratação); A15 (orçamento das aquisições; p. 484, PDF 520); B27 (riscos das aquisições); B31 (fornecedores contratados; p. 496, PDF 532); A10 (engajamento dos contratados; p. 519, PDF 555). Atualizado por 11.5 (respostas a riscos; p. 447, PDF 483).

## Modelo de redação
```
1. Subcontratação: [permitida até ... / vedada / não informada no documento], com a página do edital.
2. Itens a adquirir: Item | Motivo | Tipo de contrato e pagamento | Seleção | Data-limite de contratação | Atividade dependente | Responsável
3. Papéis: condução [a definir pelo GP]; aprovação e assinatura [área competente da FGV].
4. Requisitos ao fornecedor: escopo e aceite, sigilo, dados pessoais, propriedade intelectual.
5. Controle e encerramento: aceite, pagamento contra entrega, mudanças por escrito, encerramento.
6. Riscos das aquisições: IDs no B27.
```

## Fontes
- PMBOK 6: 12.1, p. 460–481 (PDF 496–517); 12.2, p. 484–489 (PDF 520–525); 12.3, p. 494–500 (PDF 530–536); 11.5, p. 447 (PDF 483); 13.2, p. 519 (PDF 555); X5.9, p. 683 (PDF 719); glossário, p. 719 (PDF 755).
- `licitacoes.md` 2.2, 2.4 e 2.8; `checklist.md` (CTR2, PC2, CP14).
