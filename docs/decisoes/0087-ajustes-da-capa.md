# 0087 — Ajustes da capa de decisão

- **Data:** 18/11/2026
- **Status:** aceita (pedido da responsável em 18/11/2026, depois de ver a capa)
- **Quem decidiu:** responsável pelo projeto, com a redação do Claude Code

## Contexto

A primeira versão da capa (decisão 0085) dizia "não localizado pelo código" mesmo quando a leitura do PMO confirmava que o documento não traz o dado. Ela também tinha outros problemas:
- contava marcos "fora do prazo" quando o TAP não dava prazo nenhum;
- mostrava os riscos pela causa cortada;
- dava gravidade baixa a um conflito entre partes que muda a régua de prazo, quando a segunda instância do teste deu média.

## Decisão

1. **Etapa 1:** o alerta afirma "O TR não traz prazo nem valor: perguntar antes do preço" só quando as duas leituras concordam:
   - o código procurou e não achou o campo;
   - o PMO diz, na seção "em uma página", que o documento não traz aquele campo (o verbo de ausência perto do termo do campo) e não dá número dele.

   A confirmação é campo a campo: o campo que só o código não achou continua "não localizado pelo código — conferir no documento". "TR" só quando o instrumento é o termo de referência; senão, "documento". O alerta termina com "conferir no documento".
2. **Etapa 4:** os marcos saem "sem régua" só quando o código tem os marcos do TAP e nenhum dá prazo em dias. Sem os marcos do TAP (TAP em PDF, sem TAP ou marcos descartados), eles ficam "não localizados pelo código": não achado não é ausente.
3. **Riscos** (alertas e quadro): numa linha, o evento e o efeito, sem a causa cortada. Valem as duas formas:
   - a do registro: "Causa: … Evento: … Efeito: …", com as marcas em maiúscula e no começo de palavra;
   - a da ficha B27: "Por …, pode ocorrer …, afetando …".
4. **Etapa 5:** achado conflituoso cujo **título** fala de régua de prazo (teto, referência, limite, prazo ou vigência) e traz, na mesma frase, um prazo em meses, dias, semanas ou anos (também "6 (seis) meses" e por extenso) fica no mínimo **média**, qualquer que seja a parte. O motivo aparece ao lado da gravidade na tela e no relatório. No teste, a regra fixa da parte (A17) dava baixa. O veredito sugerido do plano do caso fiscal passa de "apto" a "apto com ressalvas".

## Consequências

- A regra 4 vale para os achados da leitura do PMO. Os conflitos do código têm regras próprias e não mudam.
- Em aberto: a tela da leitura do PMO não tem o seletor de gravidade, só "procede ou não". Se o GP discordar da média, hoje a saída é "não procede". O seletor fica para o bloco 2 do pente fino.
