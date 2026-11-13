---
codigo: A15
nome: Linha de base dos custos
tipo: componente do plano
etapas: [4, 5]
gravidade: média
categoria: custo
sinonimos: ["baseline de custos", "orçamento aprovado", "orçamento de referência", "orçamento do projeto", "cronograma de desembolso", "curva S", "linha de base de custo"]
versao: 0.2.0
---

# A15 — Linha de base dos custos

## Para que serve
É "a versão aprovada do orçamento do projeto ao longo do tempo, excluindo quaisquer reservas gerenciais" (PMBOK 6, 7.3.3.1, p. 254, PDF 290). Sai de 7.3 e serve de régua para comparar planejado e real (7.4). A reserva de contingência fica **dentro**; a gerencial fica **fora**, e as duas somadas à linha de base formam o orçamento do projeto (Fig. 7-8, p. 255, PDF 291).

## Conteúdo mínimo
- **A15.1** Identificada como versão aprovada: número, data e quem aprovou
  - fonte: PMBOK 6, 7.3.3.1, p. 254 (PDF 290); glossário, p. 715 (PDF 751); Rework RW-029 (https://resources.rework.com/libraries/project-management/project-baseline)
  - sinais: "linha de base" | "baseline" | "versão aprovada" | "aprovado em" | "aprovado por" | quadro de versão com data
  - confere: código
  - dispensa: nunca
- **A15.2** Distribuída no tempo: valor por período e acumulado (curva S)
  - fonte: PMBOK 6, 7.3.3.1, p. 254–255 (PDF 290–291), Fig. 7-9; PMBOK 7, 2.4.2.4, p. 62 (PDF 157)
  - sinais: "curva S" | "acumulado" | "por mês" | "mês 1" | tabela com colunas de períodos
  - confere: código
  - dispensa: nunca
- **A15.3** Agregada pela EAP: valores por pacote ou produto, somados em contas de controle até o total
  - fonte: PMBOK 6, 7.3, p. 252 (PDF 288); Fig. 7-8, p. 255 (PDF 291)
  - sinais: "por produto" | "por pacote" | "conta de controle" | "subtotal" | códigos da EAP
  - confere: código
  - dispensa: nunca
- **A15.4** Reserva de contingência dentro da linha de base, em linha própria e ligada aos riscos do B27; valor é Decisão do GP
  - fonte: PMBOK 6, 7.2, p. 245 (PDF 281); 7.3, p. 248 (PDF 284); glossário, p. 722 (PDF 758)
  - sinais: "reserva de contingência" | "contingência" | "provisão para contingências" | referência a riscos do registro
  - confere: código
  - dispensa: nunca
- **A15.5** Reserva gerencial fora da linha de base, mostrada à parte no orçamento do projeto (ou declarada inexistente por decisão do GP)
  - fonte: PMBOK 6, 7.3, p. 252 (PDF 288); 7.3.3.1, p. 254 (PDF 290); PMBOK 7, 2.4.2.4, p. 63 (PDF 158)
  - sinais: "reserva gerencial" | "reserva de gerenciamento" | "orçamento do projeto" | "fora da linha de base" | "sem reserva gerencial"
  - confere: código
  - dispensa: nunca
- **A15.6** Total da linha de base (ONT) igual à soma das partes e comparado com o valor da proposta ou do contrato (conta feita pelo código)
  - fonte: PMBOK 6, 7.4, p. 261 e 267 (PDF 297 e 303); decisão 0009 (contas que não fecham); SKILL.md, princípio 6
  - sinais: "total" | "ONT" | "orçamento no término" | "valor global" | valores em reais
  - confere: código
  - dispensa: nunca
- **A15.7** Distribuição no tempo coerente com o cronograma (A14/B15): o gasto de cada período segue as datas das atividades
  - fonte: PMBOK 6, 7.3.1, p. 250 (PDF 286); 7.3.3.1, p. 254 (PDF 290)
  - sinais: meses da tabela de custos dentro do período do cronograma | "conforme cronograma"
  - confere: só PMO
  - dispensa: nunca
- **A15.8** Requisitos de financiamento por período e cronograma de desembolso do contratante, com o intervalo até a primeira parcela
  - fonte: PMBOK 6, 7.3, p. 253 e 256 (PDF 289 e 292); `licitacoes.md` 2.6; `checklist.md` PC3
  - sinais: "cronograma de desembolso" | "físico-financeiro" | "parcela" | "requisitos de recursos financeiros" | "fluxo de caixa"
  - confere: código
  - dispensa: nunca
- **A15.9** Definição de custo declarada (só diretos, ou com indiretos e taxa de administração), a mesma usada no acompanhamento
  - fonte: PMBOK 6, 7.3.1, p. 250 (PDF 286); 7.4, p. 261 (PDF 297)
  - sinais: "custos diretos" | "custos indiretos" | "taxa de administração" | "BDI" | "tributos"
  - confere: código
  - dispensa: nunca
- **A15.10** Regra de mudança: só por controle integrado de mudanças; uso da reserva gerencial entra por mudança aprovada
  - fonte: PMBOK 6, 7.3, p. 252 (PDF 288); 7.4, p. 259 (PDF 295); Rework RW-029
  - sinais: "controle de mudanças" | "solicitação de mudança" | "aditivo" | "apostila" | "nova linha de base"
  - confere: código
  - dispensa: nunca

## Perguntas de qualidade
- A contingência aparece separada e ligada a riscos, ou está diluída nas horas? (PMBOK 6, p. 245, PDF 281)
- Há duas referências distintas: o cronograma físico-financeiro do contrato (externo) e o custo interno da FGV? Qual delas é a linha de base deste plano? (Rework RW-029, observação do leitor)
- O desembolso do contratante e a curva de gastos mostram quanto a FGV financia antes de receber? Quem calcula é o código (PC3; SKILL.md, princípio 6).
- A data da linha de base está amarrada à assinatura ou à ordem de serviço? (PC4)

## Erros comuns
- Reserva gerencial dentro da linha de base, o que mascara o desempenho (PMBOK 6, p. 252, PDF 288; glossário, p. 722, PDF 758).
- Linha de base "elástica", ajustada ao realizado sem mudança aprovada (Rework RW-029; RW-015).
- Total sem distribuição no tempo: não há o que comparar mês a mês (PMBOK 6, p. 254, PDF 290).
- Valores que não fecham com a planilha da proposta (decisão 0009).

## Quando dispensar a parte inteira
Não se dispensa: o PGP tem no mínimo as linhas de base de escopo, tempo e custo (PMBOK 6, 4.2, p. 83, PDF 119). Em porte pequeno, pode ser uma tabela por produto e por mês com a linha de contingência, junto ao A4.
Linha para a tela: "Linha de base dos custos em tabela simples, junto com o plano de custos: porte pequeno (PMBOK 6, p. 83 e 231)."

## Ligações
- **Vem de:** 7.3, com A4, A6, A13, B4, B6, B15 e B27 (pmbok6.md); acordos (custos de terceiros; p. 251, PDF 287); proposta de preço e cronograma físico-financeiro do contrato.
- **Vai para:** 7.4 (comparação), 4.6 (mudanças), 11.2, 11.4 e 11.5; A16 (com A13 e A14); B7 (ONT de referência); A11. Pode ser atualizada por 8.2 e 9.3 (Parte 2; pmbok6.md).

## Modelo de redação
```
Versão [n], aprovada em [data] por [a definir pelo GP]; data de referência: [assinatura/ordem de serviço].
Definição de custo: [só diretos / com indiretos e taxa], conforme [regra da FGV ou do edital].

| Produto/pacote | Mês 1 | Mês 2 | ... | Total |
| P1 ...         |       |       |     |       |
| Contingência (riscos R-xx do B27) | [decisão do GP] |
| Linha de base (ONT)               | [soma feita pelo código] |
| Reserva gerencial (fora da LB)    | [decisão do GP ou "não adotada"] |
| Orçamento do projeto              | [soma feita pelo código] |

Desembolso do contratante: [parcelas e eventos, cláusula e página].
Mudança: só por solicitação aprovada (A11); aditivo ou apostila quando afetar o contrato.
```

## Fontes
- PMBOK 6: 4.2, p. 83 (PDF 119); 7.2, p. 245 (PDF 281); 7.3, p. 248–256 (PDF 284–292); 7.4, p. 259–267 (PDF 295–303); glossário, p. 715 e 722 (PDF 751 e 758).
- PMBOK 7: 2.4.2.4, p. 62–63 (PDF 157–158); glossário, p. 246 (PDF 341).
- Rework: RW-029 (link no item); RW-015 (https://resources.rework.com/libraries/project-management/earned-value-management).
- `licitacoes.md` 2.6; `checklist.md` (PC3, PC4); decisão 0009.
