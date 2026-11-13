---
codigo: B12
nome: Designações de recursos físicos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: trabalho do projeto
sinonimos: ["designações de recursos físicos", "recursos físicos", "recursos materiais", "equipamentos e materiais", "infraestrutura do projeto", "lista de equipamentos", "logística de campo"]
versao: 0.2.0
---

# B12 — Designações de recursos físicos

## Para que serve
Registra os materiais, equipamentos, suprimentos, locais e outros recursos físicos que o projeto vai usar, com a utilização esperada (PMBOK 6, 9.3.3.1, p. 333, PDF 369). Software, licenças e ambientes também contam como recursos físicos (PMBOK 7, 2.4.5, p. 65, PDF 160). É dinâmico: muda com a disponibilidade, o projeto e o ambiente (9.6, p. 358, PDF 394). Nos projetos da FGV pesa sobretudo no campo (veículos, tablets, kits, salas para oficinas).

## Conteúdo mínimo
- **B12.1** Lista dos recursos físicos: equipamentos, materiais, instalações, software e licenças
  - fonte: PMBOK 6, 9.3.3.1, p. 333 (PDF 369); PMBOK 7, 2.4.5, p. 65 (PDF 160)
  - sinais: "equipamento" | "material" | "instalação" | "sala" | "licença" | "veículo" | "tablet"
  - confere: código
  - dispensa: nunca
- **B12.2** Tipo e quantidade de cada recurso
  - fonte: PMBOK 6, 9.3.3.1, p. 333 (PDF 369); 9.6.1.2, p. 354 (PDF 390)
  - sinais: coluna de quantidade | "unidades" | "tipo"
  - confere: código
  - dispensa: nunca
- **B12.3** Local de uso (sede, município, dependência do contratante)
  - fonte: PMBOK 6, 9.3.3.1, p. 333 (PDF 369); 9.6.1.2, p. 354 (PDF 390)
  - sinais: "local" | "município" | "sede" | coluna de localização
  - confere: código
  - dispensa: nunca
- **B12.4** Utilização esperada: em que atividade e em que período cada recurso é usado
  - fonte: PMBOK 6, 9.3.3.1, p. 333 (PDF 369)
  - sinais: "período de uso" | código da atividade | datas ou meses
  - confere: código
  - dispensa: nunca
- **B12.5** Origem: próprio da FGV, alugado ou contratado, ou fornecido pelo contratante; o que vem do contratante vira premissa com prazo no B3
  - fonte: PMBOK 6, 9.6.1.2, p. 354 (PDF 390) (interno ou terceirizado); `checklist.md` PC6
  - sinais: "próprio" | "alugado" | "terceirizado" | "fornecido pelo contratante" | "cessão"
  - confere: código
  - dispensa: nunca
- **B12.6** Responsável pela guarda, pela devolução e pela liberação quando o recurso deixa de ser necessário
  - fonte: PMBOK 6, 9.6, p. 353 (PDF 389)
  - sinais: "responsável pela guarda" | "devolução" | "liberação" | "termo de responsabilidade"
  - confere: código
  - dispensa: porte pequeno e sem campo
- **B12.7** Regra de atualização quando a disponibilidade ou a necessidade muda
  - fonte: PMBOK 6, 9.6.3, p. 358 (PDF 394)
  - sinais: "atualizado" | "revisão" | "versão"
  - confere: código
  - dispensa: porte pequeno

## Perguntas de qualidade
- O que o método supõe existir no território (sala, conectividade, rede de serviços) está garantido por alguém, com prazo? (PC6)
- Equipamento ou fornecedor único sem alternativa vira risco no B27? (PC6; PMBOK 6, p. 310, PDF 346)
- Os recursos físicos de campo entraram no preço e nas despesas por território? (PROP-PRECO)
- Equipamento de coleta com dados pessoais tem regra de guarda e devolução? (A6.9; B32)

## Erros comuns
- Contar com "cessão sem ônus" ou "apoio das prefeituras" sem prazo nem compromisso (PC6).
- Equipamento crítico indisponível ou material de baixa qualidade, citados pelo PMBOK como fonte de risco (p. 310, PDF 346).
- Lista feita uma vez e não atualizada (PMBOK 6, p. 358, PDF 394).

## Quando dispensar a parte inteira
O PMBOK permite separar o plano de recursos em equipe e recursos físicos (p. 318, PDF 354), o que mostra que a parte física pode ser pequena. Em projeto sem campo, que só usa a infraestrutura institucional, pode virar uma linha no A6 (PMBOK 7, 3.2, p. 133, PDF 228).
Linha para a tela: "Recursos físicos numa linha do A6: sem campo e só infraestrutura institucional."

## Ligações
- **Vem de:** 9.3, com A6, A9 (o que vem de fora), B26 e B15 (quando cada recurso é preciso) (p. 330–331, PDF 366–367).
- **Vai para:** 9.6 (controlar os recursos), que o atualiza; B3 (premissas de cessão e disponibilidade); B27 (riscos de fornecimento); A4 e B6 (custo); B9 (falta ou atraso de recurso, p. 354, PDF 390).

## Modelo de redação
```
| Recurso | Tipo | Qtd. | Local | Atividade / período | Origem | Responsável pela guarda |
Recursos fornecidos pelo contratante: [lista, doc, p.] → premissas no B3, com prazo.
Atualização: [quando muda a disponibilidade; frequência a definir pelo GP].
```

## Fontes
- PMBOK 6: 9.1.3.1, p. 318 (PDF 354); 9.3.3.1, p. 333 (PDF 369); 9.6, p. 353–358 (PDF 389–394); cap. 9, p. 310 (PDF 346).
- PMBOK 7: 2.4.5, p. 65 (PDF 160); 3.2, p. 133 (PDF 228).
- `checklist.md` PC6; ficha `prop-preco`.
