---
codigo: PROP-SOW
nome: Especificação do trabalho da proposta (produtos, aceite, premissas e exclusões)
tipo: parte da proposta
etapas: [2]
gravidade: não se aplica
categoria: não se aplica
sinonimos: ["escopo da proposta", "produtos", "entregáveis", "declaração de trabalho", "SOW", "premissas e exclusões", "obrigações da contratante"]
versao: 0.2.0
---

# PROP-SOW — Especificação do trabalho da proposta

## Para que serve
Fixa o que a FGV entrega, como cada produto será aceito, o que fica fora, sob que premissas e o que cabe ao contratante. Numa licitação, o escopo é o do TR: a proposta não o renegocia, mas torna explícito o que o TR deixa aberto (Rework RW-075 e RW-033, adaptação). O TR costuma trazer as tarefas, a data de envio para aprovação, os dados que o comprador fornece e o prazo de revisão (PMBOK 6, 12.1, p. 478, PDF 514); o que ele não traz vira premissa ou pergunta. Recebe parte dos destinos de PROP-ESTRATEGIA.8.

## Conteúdo mínimo
- **PROP-SOW.1** Quadro de produtos com o mesmo nome e número do TR: descrição, formato, quantidade ou volume e prazo
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); 12.1, ET, p. 477–478 (PDF 513–514); Rework RW-033 e RW-036
  - sinais: "Produto 1" | "P1" | "produtos" | "entregáveis" | tabela com colunas de produto, formato, quantidade e prazo
  - confere: código
  - dispensa: nunca
- **PROP-SOW.2** Critério de aceite para cada produto
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); Tab. 12-1, p. 481 (PDF 517); Rework RW-075
  - sinais: "critério de aceite" | "critérios de aceitação" | "será considerado aceito" | coluna de critério
  - confere: código
  - dispensa: nunca
- **PROP-SOW.3** Critérios verificáveis (conteúdo mínimo, formato, base usada); sem "a contento" e sem contrariar o TR
  - fonte: Rework RW-075 e RW-064; `checklist.md` PC3; PROP-SOW.2
  - sinais: quantidades e condições no critério; "a contento", "satisfatório", "qualidade profissional" indicam critério vago
  - confere: só PMO
  - dispensa: nunca
- **PROP-SOW.4** Rodadas de revisão por produto, com limite, quando o TR não as limita
  - fonte: `checklist.md` PC8; `experiencia.md` §7; Rework RW-030
  - sinais: "rodadas de revisão" | "até" | "versão preliminar" | "versão final"
  - confere: código
  - dispensa: nunca
- **PROP-SOW.5** Exclusões explícitas, em lista própria, incluindo o trabalho vizinho que o contratante pode supor incluído
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); Rework RW-033 e RW-075; `checklist.md` PC8; CTR2, CTR3 (exclusão ou obrigação do contratante)
  - sinais: "exclusões" | "não inclui" | "fora do escopo" | "não contempla"
  - confere: código
  - dispensa: nunca
- **PROP-SOW.6** Premissas numeradas, cada uma com a base (trecho do TR, resposta a esclarecimento, leitura adotada)
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); Rework RW-075 (premissa escrita para medir a mudança); `checklist.md`, vago (CP9) e leitura adotada (CTR7)
  - sinais: "premissas" | "P-01" | "pressupõe-se" | "considera-se" | página ou "esclarecimento" junto da premissa
  - confere: código
  - dispensa: nunca
- **PROP-SOW.7** Restrições do edital e do contrato (vigência, prazos, vedação de subcontratação, regras do contratante)
  - fonte: PMBOK 6, 5.3.3.1, p. 154 (PDF 190); `licitacoes.md` 2.8
  - sinais: "restrições" | "vigência" | "vedada" | "subcontratação" | "prazo"
  - confere: código
  - dispensa: nunca
- **PROP-SOW.8** Obrigações do contratante, cada uma com prazo: dados e documentos a fornecer, acessos, espaço, mobilização, indicação de interlocutor
  - fonte: PMBOK 6, 12.1, TR, p. 478 (PDF 514); Rework RW-033 (dependências com data) e RW-075; `checklist.md` CTR3 (obrigação do contratante), PC1 (CTR4), PC2 e PC6
  - sinais: "obrigações da contratante" | "caberá à contratante" | "fornecer" | "disponibilizar" | "em até" | tabela obrigação × prazo
  - confere: código
  - dispensa: nunca
- **PROP-SOW.9** Prazo de análise e aprovação do contratante para cada produto, com a consequência do atraso (prazo da FGV contado do recebimento; aprovação tácita só se o edital permitir)
  - fonte: PMBOK 6, 12.1, TR, p. 478 (PDF 514); `checklist.md` PC3; `licitacoes.md` 2.6; `experiencia.md` §1
  - sinais: "prazo de análise" | "aprovação" | "dias úteis" | "contados do recebimento" | "aprovação tácita"
  - confere: código
  - dispensa: nunca
- **PROP-SOW.10** Pagamento e mudanças como o edital define: parcela por produto aceito, se for o caso, e mudança só por aditivo
  - fonte: PMBOK 6, 12.3, p. 494 (PDF 530); `licitacoes.md` 2.6 e 2.7; Rework RW-078, adaptação
  - sinais: "cronograma de desembolso" | "parcela" | "após o aceite" | "aditivo"
  - confere: só PMO
  - dispensa: nunca
- **PROP-SOW.11** Premissas críticas que se aplicam ao projeto (PC1 a PC8), escritas com a consequência se não se confirmarem (efeito em prazo, escopo, metas ou preço)
  - fonte: decisão 0021; `checklist.md` (PC1 a PC8)
  - sinais: "premissa" junto de "caso não" | "se não" | "hipótese de" | "fica condicionad" | "os prazos passam a contar"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- Cada produto do TR está no quadro, sem produto a mais nem a menos? (PMBOK 6, p. 154; regra dos 100% em A13)
- O fiscal consegue conferir cada critério sem interpretar? (PC3)
- Toda obrigação do contratante tem prazo, e a proposta diz o que acontece com o prazo da FGV se ele atrasar? (PC1, CTR4; Rework RW-075)
- Cada premissa tem base, e a ambígua foi também mandada como pergunta? (vago: CP9 e CTR7)
- Alguma exclusão contradiz o TR? Se sim, vira pergunta ou impugnação, não exclusão. (`licitacoes.md`, "Como usar")
- O que o PMBOK põe com o comprador (mudança regulatória, mudança de política do comprador) aparece como premissa? (PMBOK 6, p. 463, PDF 499)

## Erros comuns
- Produto escrito como atividade ("realizar oficinas") (Rework RW-036).
- Sem lista de exclusões; "entre outros" com preço fixo (Rework RW-033; PC8).
- Obrigações do cliente não escritas, e o prazo da FGV contado de um evento sem data (Rework RW-075; PC1, CTR4; obrigação do contratante, CTR3).
- Premissa não escrita que quebra quando a realidade muda (Rework RW-075).
- Tentar renegociar escopo, prazo ou pagamento do edital na proposta (Rework RW-075, adaptação).

## Quando dispensar a parte inteira
Não se dispensa: é a base para dizer o que está dentro e fora (PMBOK 6, p. 154). Em porte pequeno, cabe numa tabela de produtos com critério, seguida das listas de exclusões, premissas e obrigações do contratante.
Linha para a tela: "SOW em tabela única com listas curtas: porte pequeno."

## Ligações
- **Vem de:** TR (produtos, prazos, aceite, pagamento); PROP-ESTRATEGIA.8 (destinos premissa e exclusão); PROP-METODOLOGIA; etapa 1 (requisitos R e brechas).
- **Vai para:** PROP-EAP (produtos viram ramos; prazos de aprovação entram na rede); PROP-PRECO; PROP-MATRIZ; TAP4 e TAP9; B3; B17 e A13 na etapa 4.

## Modelo de redação
```
1. Produtos: | Nº (TR) | Produto | Descrição | Formato | Quantidade | Prazo | Critério de aceite | R |
   Revisões: até [n, a definir pelo GP] rodadas por produto.
2. Fora do escopo: [lista]. Cabe ao contratante: [lista].
3. Premissas: | Nº | Premissa | Base (doc, p., trecho ou esclarecimento) | Origem (brecha ou premissa crítica PCn) |
4. Restrições: [vigência, vedações, regras do edital] (doc, p.).
5. Obrigações do contratante: | Obrigação | Prazo | Efeito do atraso no prazo da FGV |
6. Aprovação: análise em [prazo do edital ou sugestão a definir pelo GP]; aceite conforme [doc, p.].
7. Pagamento e mudanças: conforme edital [doc, p.]; mudanças por aditivo.
```

## Fontes
- PMBOK 6: 5.3.3.1, p. 154 (PDF 190); 12.1, p. 463, 477–478 e 481 (PDF 499, 513–514 e 517); 12.3, p. 494 (PDF 530).
- Rework: RW-030 (https://resources.rework.com/libraries/project-management/scope-creep); RW-033 (https://resources.rework.com/libraries/project-management/statement-of-work); RW-036 (https://resources.rework.com/libraries/project-management/project-deliverables); RW-064 (https://resources.rework.com/libraries/project-management/acceptance-criteria); RW-075 (https://resources.rework.com/libraries/deal-closing/sow-creation); RW-078 (https://resources.rework.com/libraries/deal-closing/payment-terms).
- `licitacoes.md`, "Como usar", 2.6, 2.7 e 2.8; `checklist.md` (PC1 a PC8; vago: CTR7, CP9; CTR2, CTR3); `experiencia.md` §1 e §7.
