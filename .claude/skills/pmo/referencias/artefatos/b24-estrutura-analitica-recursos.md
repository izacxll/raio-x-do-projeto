---
codigo: B24
nome: Estrutura analítica dos recursos
tipo: documento do projeto
etapas: [4, 5]
gravidade: baixa
categoria: equipe
sinonimos: ["estrutura analítica dos recursos", "EAR", "RBS", "árvore de recursos", "hierarquia de recursos", "categorias de recursos", "catálogo de perfis"]
versao: 0.1.0
---

# B24 — Estrutura analítica dos recursos

## Para que serve
É "Uma representação hierárquica dos recursos, por categoria e tipo" (PMBOK 6, glossário, p. 710, PDF 746). Organiza os perfis e os recursos físicos para estimar, adquirir e acompanhar, e pode ser usada junto com a EAP (9.1.2.2, p. 316, PDF 352; 9.2.3.3, p. 326, PDF 362). Na FGV, é o catálogo de perfis que a matriz de horas (B26) e a planilha de preço usam.

## Conteúdo mínimo
- **B24.1** Primeiro nível por categoria: pessoal, material, equipamento, suprimentos, serviços contratados
  - fonte: PMBOK 6, 9.2.3.3, p. 326 (PDF 362)
  - sinais: "estrutura analítica dos recursos" | "EAR" | "pessoal" | "mão de obra" | "material" | "equipamento"
  - confere: código
  - dispensa: nunca
- **B24.2** Tipos dentro de cada categoria: perfil, nível de habilidade ou senioridade, registro ou certificação exigidos
  - fonte: PMBOK 6, 9.2.3.3, p. 326–327 (PDF 362–363)
  - sinais: "sênior" | "pleno" | "júnior" | "nível" | "registro" | "certificação" | "formação"
  - confere: código
  - dispensa: nunca
- **B24.3** Mesmos nomes de perfil em B24, B26, B18, na proposta e na planilha de preço
  - fonte: PMBOK 6, 9.2, p. 322 (PDF 358) (estimativa de recursos coordenada com a de custos); PROP-EQUIPE.1
  - sinais: perfis idênticos entre as tabelas
  - confere: só PMO
  - dispensa: nunca
- **B24.4** Distinção entre equipe própria, subcontratada e cedida pelo contratante
  - fonte: PMBOK 6, 9.3, p. 329 (PDF 365) (recursos internos e externos); 9.1.2.2, p. 317 (PDF 353); `licitacoes.md` 2.8
  - sinais: "equipe própria" | "subcontratada" | "terceirizada" | "cedido pelo contratante" | "interno" | "externo"
  - confere: código
  - dispensa: subcontratação vedada
- **B24.5** Recursos físicos e materiais de campo na árvore (veículos, equipamentos de coleta, kits)
  - fonte: PMBOK 6, 9.2.3.3, p. 326 (PDF 362); PMBOK 7, 2.4.5, p. 65 (PDF 160)
  - sinais: "veículo" | "tablet" | "equipamento de coleta" | "kit" | "licença"
  - confere: código
  - dispensa: sem campo
- **B24.6** Detalhe que para no nível útil para estimar e acompanhar, sem descer a itens irrelevantes
  - fonte: PMBOK 6, 9.1.2.2, p. 316 (PDF 352); PMBOK 7, 3.2, p. 133 (PDF 228)
  - sinais: dois ou três níveis; tipos ligáveis às atividades da EAP
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Cada perfil exigido pelo edital aparece como tipo, com a formação e o registro pedidos? (PROP-EQUIPE.1)
- Os níveis de senioridade batem com os valores-hora da planilha (decisão do GP)? (PROP-PRECO)
- A árvore separa quem é da FGV, quem é subcontratado e quem é do cliente, para a RACI e as aquisições? (A9; checklist 3)
- Se houver campo, os recursos físicos estão listados, ou ficou só o pessoal? (checklist 11)

## Erros comuns
- EAR só com pessoal, sem os recursos físicos de campo; o próprio livro oscila: a p. 316 (PDF 352) fala só em recursos físicos e a p. 326 (PDF 362) inclui pessoal e equipamentos.
- Nomes de perfil diferentes entre a matriz de horas e a planilha de preço, o que quebra a conferência de custos (PMBOK 6, p. 322, PDF 358).
- Detalhe demais, que ninguém mantém (PMBOK 7, p. 133, PDF 228).

## Quando dispensar a parte inteira
O PMBOK 6 não diz como simplificar a EAR. Pela regra geral de adaptação (PMBOK 7, 3.2, p. 133, PDF 228) e por `experiencia.md` §9, em porte pequeno a EAR pode virar a lista de perfis no cabeçalho da matriz de horas (B26), sem árvore à parte.
Linha para a tela: "EAR como lista de perfis na matriz de horas: porte pequeno (PMBOK 7, p. 133)."

## Ligações
- **Vem de:** 9.1 (orienta a categorização) e 9.2 (documento concluído), com A6 e B26 (p. 316 e 326, PDF 352 e 362); PROP-EQUIPE (perfis).
- **Vai para:** 6.4 (durações); 9.3 (registra o que foi adquirido); 9.6 (referência para repor ou readquirir); B6 e A4 (custo por tipo); A9 (o que vem de fora).

## Modelo de redação
```
Projeto
├─ Pessoal
│  ├─ [Perfil A] — nível [sênior/pleno] — formação/registro [doc, p.]
│  └─ [Perfil B] — ...
├─ Serviços contratados   (se a subcontratação for permitida)
├─ Equipamentos           (se houver campo)
└─ Materiais e suprimentos
Origem de cada tipo: própria | subcontratada | cedida pelo contratante.
```

## Fontes
- PMBOK 6: 9.1.2.2, p. 316–317 (PDF 352–353); 9.2, p. 322 (PDF 358); 9.2.3.3, p. 326–327 (PDF 362–363); 9.3, p. 329 (PDF 365); glossário, p. 710 (PDF 746).
- PMBOK 7: 2.4.5, p. 65 (PDF 160); 3.2, p. 133 (PDF 228).
- `checklist.md` 3 e 11; `experiencia.md` §9; `licitacoes.md` 2.8; fichas `prop-equipe` e `prop-preco`.
