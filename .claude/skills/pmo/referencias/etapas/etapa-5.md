# Etapa 5 — Leitura do PMO na conferência (F5b)

## Papel
**É a leitura principal da etapa, não um extra** (decisões 0035 e 0037). "Conferir o plano" roda a conferência por código e a sua leitura numa ação só, e o resultado só aparece com a leitura. Antes, o código monta o esqueleto: tipo de plano confirmado pelo GP, mapa das partes, comparações numéricas e de datas (valor, parcelas, vigência, equipe, metas, quadro × produtividade), frase de conformidade sobre valor e parcelas, PC5 pela conta da eleição, presença dos itens do núcleo ou da adaptação e o que está em ordem. Depois, confere cada citação sua, cada número e cada prazo, e procura de novo, na parte que você apontar, o que você disser que falta.

## Entradas
- O plano a conferir (PGP interno ou plano de trabalho, tipo confirmado pelo GP), com o mapa das partes e as dispensas.
- O contrato, o TAP e a RFP, quando existem.
- Os achados do código (candidatos, com o id), as premissas críticas que se aplicam e as características do projeto.

## Saída
- **Teste de cada achado:** "se o gerente não corrigir isto, o projeto corre um risco concreto na execução?" Se não corre, não é achado. **Precisão antes de cobertura:** num plano típico, 10 a 25 achados; num plano correto, quase nada.
- **A régua é a do tipo de plano** (seção 3). Parte que não se aplica ao tipo de plano, ou que o GP dispensou na adaptação, nunca vira achado. A dispensa que só o plano declara (lista "Partes dispensadas pelo GP", sem a adaptação no dossiê) é candidata: diga se ela cabe pelas condições da ficha (`cabe` ou `nao_cabe`, com o motivo). Se não couber, a parte volta a ser conferida, e os achados do código para ela vêm no mesmo pedido.
- **O que é da sua leitura**, porque depende de interpretação:
  - **premissa crítica escrita como premissa ou só citada:** a PC que se aplica só conta como tratada se estiver escrita como premissa (o que se assume, de quem depende, consequência) e nos três lugares (B3, B27, A11). Assunto citado numa matriz de riscos é "assunto citado, sem premissa escrita". Sem registro de premissas, é **um** achado `ausente`, com uma linha por PC aplicável;
  - **frase de conformidade que não confere:** "em conformidade com o item X" quando o plano diz outra coisa que o item X é `conflituoso`. O código compara valor e parcelas; você cobre o que é texto (metas, equipe, prazos de aprovação, obrigações);
  - **exclusões de outro tipo de projeto:** lista de exclusões sem relação com o objeto (obra, arquitetura, seguros num projeto social) é texto de outro documento: `conflituoso`, não `ausente`. Diga também quais exclusões do objeto faltam;
  - **orçamento × obrigação:** linha de despesa que parece não cobrir uma obrigação do edital (equipamento exigido para toda a equipe), como sugestão;
  - **vagos que pesam:** só quando o trecho fala de obrigação, prazo ou entrega de alguém, sobretudo aprovação do contratante sem prazo. Não marque texto padrão de LGPD e confidencialidade, "oportunamente" com referência a item do edital, descrição de atividade nem "deste edital" num plano que responde ao edital. ("a definir": ver as armadilhas);
  - os itens "só PMO" do conteúdo mínimo das fichas das partes presentes;
  - **os cruzamentos X1 a X6** (seção 3), agora entre o plano e o contrato, o TAP e a RFP; o que diverge é `conflituoso`. (antes, ver as armadilhas);
  - **compromissos C sem destino:** premissa, exclusão, obrigação do contratante ou compromisso de método da proposta que não chegou ao plano é `ausente`, com a página e o trecho da proposta.
- **A ordem da régua:** primeiro o que o plano deve à RFP, ao contrato e ao TAP (requisitos R, compromissos C, cruzamentos); depois o conteúdo mínimo das fichas. **Item que a condição de dispensa da ficha tira para este projeto nunca é achado** (ex.: em porte pequeno, A3.10, A4.6, A8.5, A10.2, B27.11): o PMBOK é guia, não checklist, e projeto pequeno não pode sair todo vermelho.
- **Cada achado tem tipo e evidência:**
  - o tipo é `vago`, `conflituoso` ou `ausente` (incompleto é ausente de um item dentro de uma parte presente: mostre a parte com a página e o item que falta);
  - a evidência vem dos dois lados (documento, página, trecho literal);
  - acompanha uma sugestão de ajuste em redação condicional.
- **Você não dá categoria nem gravidade:** o código as aplica por regra fixa.
- **"Ausente" só depois de procurar no plano inteiro.** Em `termosProcurados`, ponha os termos que o código deve procurar: ele procura só esses, na parte apontada (e, se ela foi dispensada, nas partes que absorvem o conteúdo), sem os trechos que você cita como evidência, e rebaixa o achado se encontrar.
- **Achado do código é candidato até o seu veredito** (decisão 0052). O pedido lista os achados do código (ausente, vago e conflituoso) com o id. Não os repita entre os seus; dê um veredito para cada um:
  - `sustenta`: o achado vale;
  - `falso`: o plano tem o conteúdo, com outra redação ou em outro lugar; traga a evidência (doc `pgp`, página e trecho literal), de preferência na parte apontada. (o alcance da evidência: ver as armadilhas);
  - `nao_se_aplica`: o item não vale para este projeto (tipo de plano, porte, condição da ficha); diga por quê;
  - `regra_errada`: a regra do código errou; diga a causa (por exemplo, a palavra está num trecho que descreve o problema de outro documento), para a regra ser revista.

  Só os que você confirmar como `sustenta` contam no total; os outros aparecem à parte, com o seu veredito. Veredito sem a evidência (`falso`) ou sem o motivo (`nao_se_aplica`, `regra_errada`) não vale, e o achado fica como candidato.
- **Diga também o que está em ordem**, quando você conferiu algo e passou: a seção "O que está em ordem" aparece sempre.

- **Formato dos vereditos (decisão 0052):** `"vereditos": [{ "achado": "id do achado do código", "veredito": "sustenta" | "falso" | "nao_se_aplica" | "regra_errada", "evidencias": [{ "doc": "pgp", "pagina": n, "trecho": "..." }], "motivo": "..." }]` e `"dispensas": [{ "parte": "B28", "veredito": "cabe" | "nao_cabe", "motivo": "..." }]`. `evidencias` é obrigatório no `falso`; `motivo`, no `nao_se_aplica`, no `regra_errada` e no `nao_cabe`.
- **Formato dos cruzamentos:** `"cruzamentos": [{ "codigo": "X1", "estado": "feito" | "nao_se_aplica", "resultado": "confere | diverge: ... | em aberto: ...", "itens": ["id do item gerado, se houver"] }]`.

## Definição de pronto
Critério de aceite do método (`docs/estudos/metodo-etapa-5.md`, que prevalece):
- Num plano de trabalho real, pelo menos metade dos graves se sustenta, e num plano correto quase nada aparece; num plano típico, 10 a 25 achados.
- Nenhum achado de parte que não se aplica ao tipo de plano.
- A seção "O que está em ordem" aparece sempre.
- Os cruzamentos X1 a X6 registrados e os compromissos C procurados no plano.

## Armadilhas
Marca de cada lição (decisão 0094): **[geral]** vale para qualquer projeto (lei, método, conta ou dois casos ou mais); **[geral, visto num caso]** decorre da lei ou da conta, mas até agora apareceu num caso só; **[um caso]** nasceu de um caso e vale quando a mesma condição aparece de novo, nunca como regra para todo projeto.
- [geral] **`falso` só pelo item inteiro:** a evidência cobre o item inteiro da ficha, não só o tema; "processo de auditoria" não cobre "conclusões das auditorias". Se cobre em parte, o veredito é `sustenta`, dizendo a parte que falta. Item que é resultado da execução (conclusões, lições, medições) ainda não existe no plano inicial: é `nao_se_aplica`, não `falso`. No plano que o próprio app gerou, o código já procura o item que a autoconferência da etapa 4 aponta em "onde" (decisão 0076); o candidato que sobra merece leitura atenta, não `falso` automático.
- [geral] **Antes do `conflituoso`, procure a regra no plano inteiro:** o que parece contradição costuma estar previsto noutra parte, e o que falta é só amarrar uma coisa à outra; isso é refino, sugestão de gravidade baixa, não conflito. Erro que evita: um achado de "nova linha de base sem regra" quando o plano de mudanças já a previa; faltava só ligar a aprovação à confirmação da data.
- [geral] **"a definir" com marco nomeado** ("a definir antes do campo", "no primeiro produto", "até a reunião inicial"), com a questão aberta (QU-nn) ou com o acontecimento que o resolve não é vago; "a definir em conjunto" ou "no decorrer do projeto" continua vago.

## Rubrica da segunda instância
Além da rubrica geral, nesta etapa o revisor confere:
- é a **conferência leve** (decisão 0077): só os vereditos "falso" e "regra_errada" de achados do código e todas as premissas críticas que se aplicam, numa rodada;
- o trecho citado cobre o **item inteiro** da ficha, não só o tema; cobre em parte → `em_parte`, com a parte que falta (o achado volta a contar); não cobre → `derruba`; sem páginas para julgar → `sem_base`;
- a premissa crítica só é `tratada` escrita como premissa nos três lugares (B3, B27 com gatilho, A11 com reajuste); a que não aparece nas linhas enviadas é `nao_localizada`, nunca ausente.
