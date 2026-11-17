# Roteiro: a etapa 5 sobre um plano real, na sua máquina

Para medir a etapa 5 contra o seu gabarito de um plano real, sem que nada do plano entre no repositório. O roteiro faz a conferência por código e, com a chave, a leitura do PMO conferida pelo código. Ele grava **só números**: contagens por tipo, gravidade, parte, regra e situação, tokens e custo. Nenhum trecho, título ou texto do plano sai dele.

Os PDFs, o seu gabarito e o resumo ficam **fora da pasta do projeto**. O script recusa caminhos dentro dela.

## Antes, uma vez

1. A chave num arquivo fora do projeto (passo a passo em [`../tecnico/07-configuracao.md`](../tecnico/07-configuracao.md#chave-da-api-nos-scripts-locais-powershell)). Sem a chave, o roteiro roda só a conferência por código.
2. Uma pasta de trabalho fora do projeto, por exemplo `C:\raio-x-casos\`, com o plano em PDF (e, se tiver, o termo e o edital).
3. **Opcional, o seu gabarito em números:** um arquivo `gabarito.json` na mesma pasta, com um item por achado que você considera certo (só o tipo e a parte do plano, sem texto):

   ```json
   [
     { "tipo": "ausente", "parte": "B3" },
     { "tipo": "conflituoso", "parte": "A4" },
     { "tipo": "vago", "parte": "B17" }
   ]
   ```

   Tipos: `vago`, `conflituoso`, `ausente`. Partes: `A1` a `A18` e `B1` a `B33`, como no relatório da etapa 5.

## Rodar (PowerShell, na pasta do projeto)

```powershell
Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
$env:RAIO_X_ARQUIVO_CHAVE = "$env:USERPROFILE\.raio-x\chave-api.txt"   # sem esta linha: só a conferência por código
$env:RAIO_X_PLANO = "C:\raio-x-casos\plano.pdf"
$env:RAIO_X_RFP = "C:\raio-x-casos\edital.pdf"                          # opcional
$env:RAIO_X_TAP = "C:\raio-x-casos\termo.pdf"                           # opcional (o termo ou o TAP)
$env:RAIO_X_TIPO_PLANO = "plano-trabalho"                               # ou "pgp"
$env:RAIO_X_GABARITO = "C:\raio-x-casos\gabarito.json"                  # opcional
$env:RAIO_X_SAIDA = "C:\raio-x-casos\resumo-etapa-5.json"               # opcional
npm run conferir-plano-real
```

Outras variáveis opcionais:
- `RAIO_X_PCS = "PC1,PC3,PC5"`: as premissas críticas que se aplicam (sem ela, todas, como na tela);
- `RAIO_X_MODELO = "claude-sonnet-5-5"`: outro modelo (o padrão é o do app);
- `RAIO_X_CARACTERISTICAS = '{"porte":"médio","pagamento":"de outra forma"}'`: as características do projeto, com os mesmos valores da tela (porte: pequeno, médio ou grande; pagamento: por produto, por medição ou de outra forma; e as demais). Sem ela, as padrão da tela.

O custo de uma leitura fica na faixa da decisão 0035 (cerca de US$ 0,20 a 0,75 por plano); o valor real sai no resumo.

## O que sai

O arquivo de resumo (por padrão em `%USERPROFILE%\.raio-x\`) e a mesma coisa na tela:

- páginas lidas e páginas ilegíveis;
- o mapa: partes presentes, dispensadas e que não existem;
- **código:** achados por tipo, gravidade, tipo × gravidade, parte e regra;
- **PMO:** achados por situação (válido, rebaixado porque o código achou no plano, citação não conferida), tipo, gravidade e parte; quantos repetem o código; tokens e custo;
- **com o gabarito:** acertos, precisão (acertos ÷ achados) e cobertura (acertos ÷ gabarito) do código, do PMO e dos dois juntos. Um acerto é um item do gabarito com o mesmo tipo e a mesma parte de um achado.

O resumo pode ser colado numa conversa ou num documento: ele não tem conteúdo do plano. Os PDFs e o gabarito continuam só com você.
