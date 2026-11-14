# Saídas geradas a partir das RFPs públicas

Aqui ficam exemplos do que a ferramenta gera a partir das RFPs de `../rfps-publicas/`, **antes de qualquer edição de um GP**, sem valores de preço e sem nomes de pessoas (decisão 0010). Servem de exemplo e de base para comparar versões da skill PMO.

É a única pasta do repositório onde DOCX, XLSX, ZIP e `.dossie.json` podem entrar. Cada arquivo novo é conferido antes do commit.

- `conferencia/<caso>/`: planos e TAPs gerados pelo PMO para testar a etapa 5, com erros plantados (texto com marcadores de página, sem PDF).
- `proposta-oei/`: as três respostas do PMO da etapa 2 (estratégia, conteúdo técnico, EAP e equipe) para a concorrência da OEI, geradas no Claude Code seguindo a skill, sem a chave da API. As citações são literais e o teste confere que o código acha todas. Sem preço e sem nomes.
- `tap-oei/`: as duas respostas do PMO da etapa 3 (os 12 elementos e o registro de premissas) para a mesma concorrência, a partir da proposta gravada (abordagem B). Citam a RFP e a proposta do dossiê (uma "página" por seção); o teste confere que o código acha todas. Servem também ao modo demonstração (decisão 0027).
- `pgp-oei/`: as seis respostas do PMO da etapa 4 (adaptação; escopo; atividades, recursos e cronograma; riscos, custos e premissas; demais planos; medição e documentos de execução) para a mesma concorrência, a partir da proposta e do TAP gravados. As atividades, perfis, horas e RACI partem da EAP da etapa 2, com o pacote de gerenciamento. O teste confere que o código acha todas as citações e que a autoconferência não acusa o que foi dispensado. Servem também ao modo demonstração.
- `comparacao-modelos/`: aparece quando `npm run comparar-modelos` roda com a chave (decisão 0025): as respostas do Opus 5.5 e do Sonnet 5.5 para a mesma RFP e o `resumo.md` lado a lado.
