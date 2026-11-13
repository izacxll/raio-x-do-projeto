---
codigo: B6
nome: Estimativas de custos
tipo: documento do projeto
etapas: [4, 5]
gravidade: média
categoria: custo
sinonimos: ["estimativa de custos", "estimativa de custo", "orçamento detalhado", "planilha de custos", "memória de cálculo", "composição de custos", "custos por atividade", "planilha de preços"]
versao: 0.1.0
---

# B6 — Estimativas de custos

## Para que serve
É "uma avaliação quantitativa dos custos prováveis dos recursos necessários para completar a atividade" (PMBOK 6, 7.2, p. 241, PDF 277). Sai de 7.2 junto com as bases das estimativas (B4) e alimenta o orçamento (A15). No app, o custo de pessoal é horas × perfil × valor-hora, mais as despesas; o valor-hora é Decisão do GP e a conta é do código (SKILL.md, princípios 1 e 6).

## Conteúdo mínimo
- **B6.1** Custo de pessoal por atividade ou pacote: horas e perfil, com o valor-hora marcado como Decisão do GP
  - fonte: PMBOK 6, 7.2, p. 241 e 246 (PDF 277 e 282); Rework RW-014 (https://resources.rework.com/libraries/project-management/project-cost-estimation)
  - sinais: tabela com colunas de atividade, perfil, horas e valor-hora | "valor-hora" | "homem-hora" | "horas por perfil"
  - confere: código
  - dispensa: nunca
- **B6.2** Demais categorias de custo listadas: viagens, diárias, logística, materiais, serviços de terceiros, TI, eventos
  - fonte: PMBOK 6, 7.2.3.1, p. 246 (PDF 282); 7.2, p. 241 (PDF 277)
  - sinais: "despesas" | "viagens" | "passagens" | "diárias" | "hospedagem" | "serviços de terceiros" | "material"
  - confere: código
  - dispensa: nunca
- **B6.3** Toda atividade de campo da EAP tem linha de custo própria (deslocamento, diárias, logística, equipe local)
  - fonte: decisão 0009 (regra CP11-campo, ausente na parte B6); PMBOK 6, 7.2.3.1, p. 246 (PDF 282); checklist 11; `experiencia.md` §5
  - sinais: "campo" | "deslocamento" | "diárias" | "logística" ligados às atividades de campo da EAP
  - confere: código
  - dispensa: sem campo
- **B6.4** Contingência identificada, por risco ou por pacote, e ligada ao registro dos riscos (B27); valor é Decisão do GP
  - fonte: PMBOK 6, 7.2, p. 245 (PDF 281); 7.2.3.1, p. 246 (PDF 282); Rework RW-014 (passo 5)
  - sinais: "contingência" | "reserva de contingência" | referência a riscos do B27
  - confere: código
  - dispensa: nunca
- **B6.5** Indiretos e categorias especiais declarados como incluídos ou excluídos (taxa de administração, tributos, reajuste)
  - fonte: PMBOK 6, 7.2.3.1, p. 246 (PDF 282); 7.3.1, p. 250 (PDF 286); `licitacoes.md` 2.6 (reajuste)
  - sinais: "indiretos" | "taxa de administração" | "tributos" | "impostos" | "reajuste" | "inflação" | "BDI"
  - confere: código
  - dispensa: nunca
- **B6.6** Faixa de exatidão declarada e compatível com a fase (ordem de grandeza de −25% a +75%; definitiva de −5% a +10%)
  - fonte: PMBOK 6, 7.2, p. 241 (PDF 277); PMBOK 7, 2.4.2.2, p. 55–57 (PDF 150–152); Rework RW-040 (https://resources.rework.com/libraries/project-management/cone-of-uncertainty)
  - sinais: "exatidão" | "faixa" | "±" | "ordem de grandeza" | "definitiva" | "−25%" | "+75%"
  - confere: código
  - dispensa: porte pequeno
- **B6.7** Método indicado por linha ou bloco (bottom-up, análoga, paramétrica, três pontos), com remissão às bases (B4)
  - fonte: PMBOK 6, 7.2.2, p. 244–245 (PDF 280–281); 7.2.3.2, p. 247 (PDF 283)
  - sinais: "bottom-up" | "análoga" | "paramétrica" | "três pontos" | "base da estimativa"
  - confere: código
  - dispensa: nunca
- **B6.8** Horas coerentes com o cronograma e os requisitos de recursos: perfis e cargas batem com quem faz cada atividade e quando (pico, não média)
  - fonte: PMBOK 6, 7.2.1, p. 242 (PDF 278); checklist 6; `experiencia.md` §4
  - sinais: perfis do B6 iguais aos do B26 e do B18 | horas por mês
  - confere: só PMO
  - dispensa: nunca
- **B6.9** Custo da qualidade previsto: revisões, validações com o contratante e retrabalho esperado entram como horas ou despesas
  - fonte: PMBOK 6, 7.2, p. 245 (PDF 281); 8.1, p. 283 (PDF 319); Rework RW-014 (erros comuns)
  - sinais: "revisão" | "validação" | "oficina" | "retrabalho" | "controle de qualidade" como linhas de custo
  - confere: só PMO
  - dispensa: porte pequeno
- **B6.10** Alternativas consideradas quando relevantes (fazer × contratar, presencial × remoto)
  - fonte: PMBOK 6, 7.2, p. 241 (PDF 277)
  - sinais: "alternativa" | "subcontratação" | "remoto" | "presencial"
  - confere: só PMO
  - dispensa: porte pequeno

## Perguntas de qualidade
- A coordenação tem horas proporcionais às frentes e aos interlocutores, ou foi dimensionada por um número redondo? (checklist 6; `experiencia.md` §4)
- O tempo de deslocamento está nas horas e nas despesas? (checklist 11; `experiencia.md` §5)
- Cada número tem base (B4), ou há "estima-se" sem fonte? (checklist 2)
- A estimativa está separada do preço negociado, com a diferença registrada? (Rework RW-014)
- As horas da proposta (etapa 2) foram reaproveitadas e conferidas contra a EAP do plano?

## Erros comuns
- Atividade de campo sem linha de custo: achado "ausente" conhecido (decisão 0009, CP11-campo).
- Esquecer indiretos, integração e revisões (Rework RW-014).
- Estimativa pontual otimista, sem faixa (Rework RW-014; RW-040).
- Contingência embutida sem registro, impossível de acompanhar (PMBOK 6, p. 245, PDF 281). Na proposta, o edital pode impedir linha explícita (Rework RW-014, observação do leitor); no plano, ela fica visível.

## Quando dispensar a parte inteira
Não se dispensa: sem estimativa não há linha de base. Em porte pequeno, estimar e orçar podem ser um processo só (PMBOK 6, p. 231, PDF 267) e o B6 vira a tabela por produto do A15, com horas, perfis e despesas. Em abordagem adaptativa, estimativa de alto nível da mão de obra, detalhada só para o horizonte curto (p. 234, PDF 270).
Linha para a tela: "Estimativas na mesma tabela da linha de base: porte pequeno (PMBOK 6, p. 231)."

## Ligações
- **Vem de:** 7.2, com A4, A5, A13, B15, B26 e B27 (pmbok6.md); horas por perfil e despesas da proposta (etapa 2, equipe e preço); tabela de valor-hora do GP.
- **Vai para:** 7.3 (A15), 9.2 (B26), 11.2 e 11.4; B4 e B3 (premissas novas; p. 247, PDF 283); B27. Atualizada em 7.3 e 7.4.

## Modelo de redação
```
| Código EAP | Atividade/produto | Perfil | Horas (três pontos, se houver) | Valor-hora | Custo |
|            |                   |        |                                | [decisão do GP] | [código] |

| Despesa | Atividade | Quantidade | Valor unitário | Base |
| Diárias de campo | [atividade de campo] | [qtd] | [a definir pelo GP] | [B4] |

Contingência: [por risco R-xx do B27 / por pacote]; valor: decisão do GP.
Indiretos e tributos: [incluídos/excluídos], conforme [regra].
Exatidão: [faixa], porque [fase]. Método: [bottom-up/análoga/...] — bases no B4.
```

## Fontes
- PMBOK 6: 7.2, p. 240–247 (PDF 276–283); 7.3.1, p. 250 (PDF 286); 8.1, p. 283 (PDF 319); p. 231 e 234 (PDF 267 e 270).
- PMBOK 7: 2.4.2.2, p. 55–57 (PDF 150–152).
- Rework: RW-014, RW-040 (links nos itens); RW-057 (https://resources.rework.com/libraries/project-management/three-point-estimation).
- Decisão 0009; `licitacoes.md` 2.6; `checklist.md` (2, 6, 11); `experiencia.md` §4 e §5.
