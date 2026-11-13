# 0026 — F1 e F2 publicadas antes do teste; ordem F3, F4 e F5b

- **Data:** 13/11/2026
- **Status:** aceita
- **Quem decidiu:** responsável pelo projeto

## Contexto

A decisão 0005 prevê, ao fim de cada fase: PR → teste e ok da responsável pelo projeto → merge, tag e release. A F1 (PR #6) e a F2 (PR #7) estavam prontas, com o CI verde, esperando o teste. A responsável pediu para fazer o merge agora, como na decisão 0023, e para seguir com a F3 e a F4 antes da F5b.

## Decisão

- Merge da F1 e depois da F2 na `main`, com as tags **v0.4.0** e **v0.5.0** e as releases, sem o teste prévio da responsável. A F2 continua sem o teste com a chave e sem a comparação de modelos (decisão 0002).
- O que o teste encontrar entra por `correcao/<nome>` e sai como v0.4.x ou v0.5.x.
- Ordem das próximas fases: **F3 (TAP)**, **F4 (PGP)** e, se houver tempo, **F5b** (leitura do PMO na conferência). Cada uma no esquema da F2: tudo o que não depende da chave construído e testado com a API simulada; respostas do PMO gravadas para a RFP pública da OEI; o que precisa da chave fica para o fim da fase.
- Não é preciso parar entre a F3 e a F4: cada fase abre o próprio PR, com a prévia publicada, e a seguinte começa em seguida.
- Tags pela nova ordem: F3 = **v0.6.0**, F4 = **v0.7.0**, F5b = **v0.8.0**. A tabela da decisão 0005 fica com essa ordem.

## Consequências

- A `main` passa a ter as etapas 1 e 2; a etapa 2 só funciona de verdade com a chave (ou no modo demonstração, decisão 0027).
- As releases v0.4.0 e v0.5.0 dizem que as fases foram publicadas antes do teste da responsável.
