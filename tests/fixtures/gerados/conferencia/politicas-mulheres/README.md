# Conferência — políticas públicas para mulheres

Fixture da etapa 5 (conferência do PGP), gerada a partir da RFP pública `tests/fixtures/rfps-publicas/pregao-eletronico-politicas-mulheres-barra-bonita-2026.pdf` (pregão eletrônico nº 90057/2026, Lei 14.133/2021, Município de Barra Bonita/SP: serviços técnicos em políticas públicas para mulheres).

Gerada pelo PMO (Claude Code, skill PMO 0.2.0) em 13/11/2026 para testar a etapa 5. Sem preço, sem nomes de pessoas (só papéis) e antes de qualquer edição de GP. Prazos e quantidades vêm da RFP; as datas do cronograma são contadas da assinatura (D+n).

## Arquivos

| Arquivo | O que é |
|---|---|
| `plano.md` | PGP limpo, como texto extraído de PDF (`=== Página N ===`, 25 páginas). Os 18 componentes (A1 a A18) e 14 documentos (B3, B5, B9, B10, B11, B15, B17, B18, B20, B23, B26, B27, B28, B31), cada um com título próprio e numerado, adaptados ao porte pequeno. |
| `tap.md` | TAP com os 12 elementos e o bloco de premissas (TAP-PR), 4 páginas. |
| `caracteristicas.json` | Características do projeto como o GP confirmaria. |
| `premissas.json` | Premissas críticas PC1 a PC8 e se cada uma se aplica. |
| `requisitos.json` | Os três produtos/serviços da RFP (R01 a R03), com página e trecho literal da RFP; a descrição é o nome usado no B17 do plano. |
| `erros-plantados.json` | 9 erros, um por combinação tipo (vago, conflituoso, ausente) × gravidade (grave, média, baixa). Cada um é uma troca exata (`de` → `para`) no `plano.md`; `de` aparece uma única vez, dentro da parte indicada. |

## Premissas críticas

- **Aplicam-se:** PC1 (dados da rede), PC3 (análise e aprovação), PC4 (data de início), PC6 (adesão dos órgãos da rede), PC7 (equipe × volume), PC8 (escopo e revisões). Estão no registro de premissas (B3), no registro dos riscos (B27, RK01 a RK06), no plano de mudanças (A11) e no plano de riscos (A8).
- **Não se aplicam:** PC2 (o TR não obriga o uso de sistema do contratante) e PC5 (vigência de 4 meses sem eleição municipal nem troca de gestão prevista).

## Cuidados para os erros de ausência

- O parágrafo das premissas críticas (A8.12) só aparece no A8, e a página seguinte (A9) não usa os termos dele.
- O risco da PC3 (RK02) só aparece no B27, e a página seguinte (B28) não usa os sinais da PC3.
- O produto "Capacitação do Conselho Municipal dos Direitos da Mulher" só aparece no B17 na linha removida, e a página seguinte (A2) não fala do Conselho.
