# 0047 — Matriz de compromissos entre as etapas

- **Data:** 16/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto (pedido de 16/11/2026); Claude Code (a redação)

## Contexto

Hoje só os requisitos (R) são rastreados da RFP ao plano. No teste externo, o protocolo de campo e o tratamento dos dados pessoais estavam na proposta e sumiram do plano, e a conferência só percebeu porque comparou com a ficha, não com a proposta. Uma exclusão da proposta ("auditoria dos recursos") chegou a encostar num requisito do TR (levantar a origem dos recursos).

## Decisão

1. **Compromissos numerados:** na etapa 2, cada um destes recebe um número C (C01, C02…), como os R:
   - premissa escrita na proposta;
   - exclusão;
   - obrigação do contratante;
   - compromisso de método (protocolo, técnica, cuidado prometido: campo, dados pessoais, revisão, independência).
2. **Cada C tem destino** no TAP (premissa, limite, entrega-chave ou divergência) e no plano (parte e item da ficha). A matriz de rastreabilidade (B23) passa a ter os C ao lado dos R.
3. **C sem destino no plano é achado `ausente` na etapa 5**, com a evidência da proposta (página e trecho).
4. **Exclusão nunca tira requisito.** Cada exclusão é conferida contra os R. Exclusão que encosta num R diz o que continua dentro; se contradiz o TR, vira pergunta, não exclusão (PROP-SOW.12).
5. **Divergência que muda escopo, custo ou quem executa** (formato do produto, quem faz o campo, fonte dos dados) não se resolve no TAP. O contrato prevalece; sem resposta dele, o TAP adota a versão que **mais obriga a FGV** (em geral a RFP, quando a proposta estreitou; a proposta, quando acrescentou), marca a divergência como pendente com o contratante e só troca de versão com resposta por escrito. Antes de abrir a divergência, confere-se se a própria RFP já responde: no teste externo, a dúvida "quem faz o campo?" foi aberta nas cinco etapas, e o TR respondia duas vezes ("levantados pela equipe da contratada").

## Consequências

- `SKILL.md` (etapas 2 a 5); fichas `prop-sow` (.12 e .13), `tap` (TAP-DV.7 e TAP-PR.4), `b23` (B23.10); métodos das etapas 2 a 5.
- Código: numeração C na etapa 2, transporte para as etapas 3 e 4 e a busca na etapa 5, como os R. Na ordem das fases, cada etapa ganha a sua parte (M3 a M5).
