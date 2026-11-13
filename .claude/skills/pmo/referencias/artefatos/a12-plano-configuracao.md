---
codigo: A12
nome: Plano de gerenciamento de configuração
tipo: componente do plano
etapas: [4, 5]
gravidade: grave
categoria: trabalho do projeto
sinonimos: ["plano de configuração", "gerenciamento de configuração", "gestão de configuração", "controle de versões", "controle de versão", "gestão documental", "gestão de documentos"]
versao: 0.2.0
---

# A12 — Plano de gerenciamento de configuração

## Para que serve
Diz quais itens do projeto ficam sob controle de configuração e como as informações sobre eles são registradas e atualizadas, para o produto continuar consistente (PMBOK 6, 4.2.3.1, p. 88, PDF 124; glossário, p. 719, PDF 755). Na consultoria, cuida das **versões dos produtos e dos documentos**: qual versão foi entregue, qual foi aprovada e onde ela está. O controle de mudanças (A11) decide; a configuração guarda e rastreia (4.6, p. 118, PDF 154).

## Conteúdo mínimo
- **A12.1** Lista dos itens sob controle de configuração: produtos do contrato e documentos do projeto que terão versão controlada
  - fonte: PMBOK 6, 4.6, p. 115–116 (PDF 151–152); glossário, p. 719 (PDF 755)
  - sinais: "itens de configuração" | "documentos controlados" | "sob controle de versão" | lista de produtos e documentos controlados
  - confere: código
  - dispensa: nunca
- **A12.2** Regra de identificação: numeração de versões, nome dos arquivos e data
  - fonte: PMBOK 6, 4.6, p. 118 (PDF 154), identificação dos itens
  - sinais: "versão" | "v1.0" | "v0.1" | "nomenclatura" | "padrão de nomes" | "controle de versão"
  - confere: código
  - dispensa: nunca
- **A12.3** Estados de cada versão de produto ligados ao aceite: preliminar, submetida ao contratante, ajustada, aprovada
  - fonte: PMBOK 6, 4.3, p. 95 (PDF 131), versões das entregas; 4.7, p. 125 (PDF 161), entregas aceitas
  - sinais: "versão preliminar" | "versão para análise" | "versão final" | "versão aprovada" | "minuta"
  - confere: código
  - dispensa: nunca
- **A12.4** Mudança em item de configuração só por solicitação aprovada, a partir da primeira versão concluída da entrega
  - fonte: PMBOK 6, 4.3, p. 95 (PDF 131) e 4.6, p. 115 (PDF 151)
  - sinais: "solicitação de mudança" | "versão de referência" | "linha de base" | remissão ao plano de mudanças
  - confere: código
  - dispensa: nunca
- **A12.5** Registro do status de cada item: versão vigente, histórico de versões e mudanças incorporadas
  - fonte: PMBOK 6, 4.6, p. 118 (PDF 154)
  - sinais: "histórico de versões" | "controle de revisões" | "versão vigente" | tabela com versão, data, autor e alteração
  - confere: código
  - dispensa: porte pequeno
- **A12.6** Verificação e auditoria: conferir que a versão entregue é a aprovada e que as mudanças aprovadas entraram
  - fonte: PMBOK 6, 4.6, p. 118–119 (PDF 154–155)
  - sinais: "auditoria de configuração" | "verificação de versão" | "conferência antes da entrega"
  - confere: código
  - dispensa: porte pequeno
- **A12.7** Repositório e acesso: onde ficam as versões, quem edita, quem só lê e por quanto tempo se guardam
  - fonte: PMBOK 6, 4.3, p. 95 (PDF 131), sistema de configuração no SIGP; 4.4, p. 102 (PDF 138), retenção e segurança de dados; `checklist.md` CP14
  - sinais: "repositório" | "pasta compartilhada" | "SharePoint" | "Teams" | "permissão de acesso" | "retenção"
  - confere: código
  - dispensa: nunca
- **A12.8** Proteção dos dados pessoais e sigilosos nos itens controlados: quem acessa bases e entrevistas, anonimização
  - fonte: PMBOK 6, 4.4, p. 101–102 (PDF 137–138), confidencialidade; `checklist.md` CP14
  - sinais: "LGPD" | "dados pessoais" | "anonimização" | "acesso restrito" | "confidencialidade" | "termo de sigilo"
  - confere: código
  - dispensa: sem dados pessoais
- **A12.9** Nível de controle escolhido e justificado pelo porte e pelo tipo de entrega
  - fonte: PMBOK 6, 4.2, p. 85 (PDF 121)
  - sinais: "nível de controle" | "simplificado" | parágrafo que justifica o detalhe do controle
  - confere: só PMO
  - dispensa: nunca

## Perguntas de qualidade
- Os produtos com várias rodadas de revisão têm versão numerada e registro do que mudou entre uma e outra? (PC8)
- A versão citada no termo de aceite é identificável sem ambiguidade? (vago, CTR7; PC3)
- Base de beneficiários, microdados e gravações de entrevista têm acesso restrito e responsável? (A12.8, CP14)
- Documentos do PGP (cronograma, registro de riscos) também têm versão e data? (PMBOK 6, p. 85, PDF 121)
- O plano define quais documentos ficam sob controle formal de mudanças e quais não? (PMBOK 6, p. 85, PDF 121)

## Erros comuns
- Confundir configuração com controle de mudanças: o primeiro cuida das especificações e versões; o segundo, de aprovar ou rejeitar (PMBOK 6, p. 118, PDF 154).
- Entregar ao contratante versão diferente da aprovada, ou perder qual versão foi aceita (inferência a partir de p. 118–119, PDF 154–155).
- Dados pessoais em pasta aberta à equipe toda (A12.8, CP14).

## Quando dispensar a parte inteira
Pode ser fundida, não omitida, quando o projeto tem poucas entregas e sem versões sucessivas: vira um parágrafo no A11 ou no A5 com a regra de nomes, o repositório e o acesso. O PMBOK manda decidir o nível de configuração com opinião especializada (PMBOK 6, p. 85, PDF 121); a skill sugere dispensar em porte pequeno salvo entregas com versões (pmbok7.md, seção 3, item 3, [aplicação]). Com dados pessoais, o A12.8 fica mesmo assim.
Linha para a tela: "Configuração num parágrafo do plano de mudanças (nomes, repositório, acesso): porte pequeno, sem versões sucessivas (PMBOK 6, p. 85)."

## Ligações
- **Vem de:** 4.2 (nasce lá pelo X1.5; PMBOK 6, p. 642, PDF 678); A5 (padrões dos documentos); A1 e A13 (lista de entregas); políticas de segurança e retenção da organização (APO, p. 102, PDF 138); cláusulas de sigilo e LGPD do TR.
- **Vai para:** 4.6 e 5.6 (entradas), 12.2 (Parte 2; pmbok6.md, tabela); A11 (o que está sob controle formal); B5; aceite das entregas (A5, B17).
- Requisitos da RFP sobre "versões", "formato de entrega", "sigilo" ou "LGPD" caem aqui (número R).

## Modelo de redação
```
1. Itens controlados: Item | Tipo (produto/documento) | Responsável | Onde fica
2. Versões: sugere-se v0.x para minutas internas, v1.0 para a versão submetida e v1.x para ajustes; aprovada = versão citada no aceite. Regra de nome: [a definir pelo GP].
3. Histórico: Versão | Data | Autor | O que mudou | Mudança aprovada (nº no B5)
4. Mudança em item já entregue: só via A11.
5. Conferência antes de cada entrega: [responsável a definir pelo GP].
6. Repositório: [a definir pelo GP]; acesso de edição e de leitura por papel; retenção conforme política.
7. Dados pessoais (se houver): acesso restrito a [papéis], anonimização, descarte.
```

## Fontes
- PMBOK 6: 4.2, p. 85 e 88 (PDF 121 e 124); 4.3, p. 95 (PDF 131); 4.4, p. 101–102 (PDF 137–138); 4.6, p. 115–119 (PDF 151–155); 4.7, p. 125 (PDF 161); X1.5, p. 642 (PDF 678); glossário, p. 719 (PDF 755).
- PMBOK 7: não lista o plano de configuração entre os artefatos (Guia 4.6, p. 184–192, PDF 279–287; ver pmbok7.md, seção 4).
- `checklist.md` (CTR7, PC3, PC8, CP14); `pmbok7.md` seção 3.
