# 0039 — Skill PMO 0.3.0

- **Data:** 16/11/2026
- **Status:** proposta (mostrada à responsável antes de publicar; publica só com o ok dela)
- **Quem decidiu:** responsável pelo projeto (o conteúdo, pelas decisões 0034, 0035 e 0037 e pelo pedido de 16/11/2026); Claude Code (a redação)

## Contexto

Os métodos das etapas (decisão 0034) e a engenharia reversa (`docs/estudos/engenharia-reversa/`) pediram mudanças na skill que o código sozinho não leva ao PMO: os tipos de projeto e de plano, a proposta de parceria, a premissa crítica com gatilho e reajuste, o contrato como entrada da etapa 3, o caixa e as leituras das etapas 1 e 5.

## Decisão

1. **SKILL.md:**
   - seção da etapa 1 pelo método (8 seções, teste de cada item, PC1 a PC8 com a pergunta);
   - etapa 5 como leitura principal, sem "opcional" (decisões 0035 e 0037);
   - etapas 2 e 4 entregam o documento inteiro, e o resumo é só a capa;
   - tipos de projeto e de plano;
   - o contrato ou termo assinado prevalece na etapa 3.
2. **Ficha nova PROP-PARCERIA** (plano de trabalho da Lei 13.019: art. 22, metas, folha mês a mês, despesas por natureza, desembolso igual ao do edital):
   - entra no pedido da etapa 2 (`FICHAS_ETAPA_2`);
   - os custos indiretos podem entrar com memória de cálculo (art. 46), nunca como percentual sobre o total;
   - "taxa de administração" é para conferir no edital.
3. **Fichas e referências:**
   - **prop-preco:** o caso da operação contínua, os pontos por preço e o caixa;
   - **prop-equipe:** o quadro por função e faixa de meses;
   - **A4 e B6:** o caixa e as reservas em parceria;
   - **checklist:** gatilho ("a definir pelo GP") e reajuste de cada PC nos três lugares;
   - **experiencia.md:** frase de conformidade e exclusões de outro tipo de projeto como conflito.
4. **rework.md:** sai a regra "se divergirem, prevalece o PMBOK". Quando o Rework e o PMBOK divergem, **não há vencedor automático**:
   - mostrar as duas leituras;
   - ver qual serve a este contrato e a este porte (lei, edital e contrato sempre limitam);
   - sugerir com o motivo;
   - o GP decide.

## Consequências

- Os itens novos foram acrescentados no fim de cada ficha, sem renumerar. O app lê a versão da skill no cabeçalho do `SKILL.md`.
- O `SKILL.md` cita `doc: "contrato"` como fonte. O schema do app só passa a aceitá-la quando a etapa 3 ler o contrato (fase M3).
- A A4.12 e a B6.11 são conferidas por código na etapa 5. Elas ficam dispensáveis com "pagamento por produto" (o padrão) até existir a característica "parcelas de repasse" (decisão 0033, item 7; fase M5).
