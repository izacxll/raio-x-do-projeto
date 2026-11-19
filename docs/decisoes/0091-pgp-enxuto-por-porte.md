# 0091 — PGP enxuto por porte

- **Data:** 19/11/2026
- **Status:** aceita (bloco 3 do pente fino, pedido da responsável em 19/11/2026)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

O método da etapa 4 já dizia que nenhum projeto recebe as 51 partes por padrão. Na prática, a sugestão do que gerar era "tudo o que o PMO não marcou como dispensável". Nos dois casos do teste externo, o plano saiu com 44 partes e cerca de 55 a 60 páginas, inclusive no caso de porte pequeno.

O `pmbok7.md` da skill já trazia a régua:
- plano detalhado é ineficiente em projeto menor (Guia 2.4.9, p. 67);
- no porte pequeno, A1 a A5 e A8 são seções curtas de um PGP único;
- B1, B16, B24, B25 e B29 são dispensáveis;
- B7 e B30 servem a projetos preditivos muito grandes (Guia, p. 104).

Faltava o código aplicar essa régua.

## Decisão

1. **Limites por porte** (partes geradas; páginas do plano, sem os registros em planilha). Os números do médio e do grande são proposta inicial; a responsável pode ajustar.

   | Porte | Partes | Páginas |
   |---|---|---|
   | pequeno | 10 a 15 | até 15 |
   | médio | 16 a 30 | até 30 |
   | grande | 31 a 51 | até 50 |

2. **O que gerar pelo porte** (a sugestão inicial; o GP muda na tabela):
   - **pequeno:** o núcleo de 14 partes, um PGP único:
     - A17 ciclo de vida, A13 escopo com aceite, A3 cronograma, A6 recursos, A8 riscos, A4 custos, A5 qualidade, A7 comunicações, A11 mudanças;
     - B31 partes interessadas, B27 riscos, B3 premissas, B9 questões e A16 medição;
     - mais A9, quando a subcontratação é permitida (15 partes).
   - **médio:** o que o PMO marcou como essencial. O recomendado vai fundido quando a hospedeira dele é gerada.
   - **grande:** como era: tudo o que o PMO não marcou como dispensável.
3. **Para onde vai cada parte que não se gera.** Porte reduz partes, não a cobertura (decisão 0044).
   - **Fundida numa hospedeira:** a parte escrita pelo PMO se funde numa parte do mesmo passo. O pedido manda a ficha dela junto com a da hospedeira, a hospedeira cobre o conteúdo mínimo dela (uma linha por item que vale) e a autoconferência espera os itens dela. Exemplos:
     - A1, A2, B17, B22 e B23 vão no A13;
     - A18 vai no A17;
     - A12 vai no A11;
     - A10 vai no B31.

     As tabelas do código (marcos, cronograma, custos, RACI, rastreabilidade) saem dentro da seção da hospedeira.
   - **Dispensada:** com o motivo do porte (B1, B7, B16, B24, B25, B29, B30 e B33 no porte pequeno) ou com a justificativa do PMO.
   - O plano, o índice do pacote, a tela da adaptação e a etapa 5 dizem "fundida em A13" ou "dispensada: motivo". Na etapa 5, a parte fundida não conta como ausente.
4. **Tamanho do plano:**
   - O código estima as páginas sem abrir o Word, pelos caracteres do texto e das tabelas. A fórmula foi calibrada com os dois planos do teste externo.
   - A capa da etapa 4 mostra as partes e as páginas contra o limite do porte e alerta quando passa.
   - Cada pedido da etapa 4 traz o orçamento: "o plano inteiro em até N páginas, cerca de X página por parte; uma linha por item da ficha".

## Medição (os dois casos do teste externo, com as respostas já gravadas; fora do Git)

| Caso | Antes: partes / seções / páginas estimadas | Depois |
|---|---|---|
| Contratação direta (porte pequeno) | 44 / 48 / ~55 | 14 / 24 / ~51 |
| TR fiscal (porte médio) | 44 / 48 / ~59 | 32 / 36 / ~58 |

O número de partes cai, mas as páginas quase não mudam com as respostas já gravadas: o PMO escreveu as 44 partes por inteiro, e o conteúdo das fundidas só mudou de seção. A queda de páginas depende de o PMO escrever de novo com o orçamento do pedido. A medida de verdade vem da próxima rodada do teste externo.

Os pedidos da etapa 4 ficam do mesmo tamanho: a ficha da parte fundida continua indo, junto com a da hospedeira.

## Consequências

- O método da etapa 4 (seção 4.1) passa a dizer a régua do porte.
- A skill (`etapas/etapa-4.md` e `pmbok7.md`) não muda neste PR. A régua vai no pedido, porque mudança na skill espera a aprovação da responsável.
- A etapa 5 trata a parte fundida como fora do mapa, com a hospedeira na justificativa. Ela ainda não procura os itens da fundida na hospedeira; isso fica para depois, se o teste mostrar falta.
