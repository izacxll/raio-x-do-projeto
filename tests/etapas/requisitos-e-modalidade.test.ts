// Decisão 0054: cada R é uma entrega ou obrigação de quem executa (a equipe-chave num R só, com a lista dos perfis),
// e o código não supõe licitação quando o documento não diz a modalidade. Termo de referência inventado, com a
// estrutura do teste externo (itens do objeto em algarismos romanos, levantamento, produtos nomeados, equipe que
// passa de página, entrega digital, sigilo), sem nenhum texto do caso.
import { describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { montarLeituraRfp } from "../../src/etapas/1-rfp/leitura";
import { pedidoLeituraRfp } from "../../src/etapas/1-rfp/leitura-pmo";
import { analiseInicial } from "../../src/etapas/1-rfp/revisao";
import { sugerirTipo } from "../../src/etapas/2-proposta/tipo";
import { documentoLido } from "./rfp-ajudantes";

const HOJE = new Date(2026, 10, 17);
const PAGINAS = [
  `TERMO DE REFERÊNCIA
OBJETO
Contratar empresa especializada para um estudo das contas públicas de um ente.
DESCRIÇÃO DO OBJETO
Os trabalhos do estudo compreenderão:
Mapear gargalos nos processos de arrecadação e de gasto.
Assim, busca-se uma consultoria para o estudo das contas do ente, devendo, para tanto:`,
  `I. Avaliação do saldo das contas do ente, com a evolução das receitas e
despesas do período;
II. Análise de indicadores de endividamento e de caixa;
III. Consolidar as análises num relatório final do estudo.
DETALHAMENTO DO OBJETO
I. Avaliação do saldo das contas
Texto que detalha o item, sem nova exigência.`,
  `Coleta de informações:
Levantamento e organização das normas e regras de planejamento do ente,
como:
a) Normas de planejamento;
b) Regras de execução do gasto;
Identificar sistemas usados no acompanhamento - Análise comparativa com outras experiências
(benchmarks).
DOS PRODUTOS
Relatório de Diagnóstico das Contas:
Documento que analisa os processos do ente e aponta melhorias.
• Relatório de Diagnóstico dos Sistemas: Analisa os sistemas usados no
acompanhamento das contas.
ENTREGA
Os produtos serão entregues em formato digital; o setor responsável fará a conferência.`,
  `Da equipe chave
Coordenador Geral
O coordenador indicado deve atender ao perfil
abaixo:
a) Graduação e pós-graduação em economia.
Analista Contábil
a) Formação acadêmica em Ciências Contábeis, com inscrição no
CRC.
Especialista em Riscos das Contas`,
  `a) Formação acadêmica em Economia, com especialização em riscos.
b) Experiência Prática: 5 anos em análise de riscos.
SIGILO E PROPRIEDADE
Os produtos serão do contratante, com cessão dos direitos patrimoniais sobre os produtos.
A contratada guardará sigilo sobre dados e informações, entre outros, a que tiver acesso no contrato.
Chefe do Departamento de Planejamento e Captação de Recursos
Portaria nº 10 de março de 2026`,
];

describe("requisitos como entregas e obrigações (decisão 0054)", () => {
  const a = analisarRfp([documentoLido(PAGINAS)], HOJE);
  const r = a.requisitosDoCodigo;

  it("os itens do objeto, o levantamento, os produtos nomeados, a equipe-chave, a entrega digital e o sigilo", () => {
    expect(r.map((x) => `${x.tipo}:${x.rotulo}`)).toEqual([
      "atividade:Item I do objeto",
      "atividade:Item II do objeto",
      "atividade:Item III do objeto",
      "atividade:Levantamento e análise comparativa",
      "produto:Relatório de Diagnóstico das Contas",
      "produto:Relatório de Diagnóstico dos Sistemas",
      "equipe:Equipe-chave (3 perfis)",
      "obrigacao:Entrega em meio digital",
      "obrigacao:Sigilo e cessão dos produtos",
    ]);
    expect(r.map((x) => x.numero)).toEqual(r.map((_, i) => `R${String(i + 1).padStart(2, "0")}`));
  });

  it("os itens do objeto só uma vez: o detalhamento que repete o item I não vira R", () => {
    expect(r.filter((x) => /saldo das contas/.test(x.descricao))).toHaveLength(1);
    expect(r[0]?.descricao).toMatch(/evolução das receitas e despesas do período$/);
  });

  it("a equipe-chave é um R só, com os perfis, inclusive o que passa de página", () => {
    const equipe = r.find((x) => x.tipo === "equipe")!;
    expect(equipe.perfis).toEqual([
      "Coordenador Geral",
      "Analista Contábil",
      "Especialista em Riscos das Contas",
    ]);
    const tamanho = montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE).itens.find(
      (i) => i.id === "leitura:tamanho",
    );
    expect(tamanho?.texto).toMatch(/equipe de 3 perfis citados/);
    expect(a.itens.find((i) => i.id === "atencao:equipe")?.texto).toMatch(/^3 perfis citados/);
  });

  it("o registro no conselho exigido de um perfil não é documento de habilitação da empresa", () => {
    expect(a.itens.find((i) => i.id === "habilitacao:registro-conselho")).toBeUndefined();
  });

  it("a data da portaria do signatário ('Captação de Recursos') não é prazo de recurso", () => {
    const l = montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE);
    expect(JSON.stringify(l.itens)).not.toMatch(/Recursos: 10\/03\/2026/);
  });

  it("'entre outros' na cláusula padrão de sigilo não vira vago", () => {
    expect(a.itens.filter((i) => i.id.startsWith("brechas:vago:entre-outros"))).toEqual([]);
  });
});

describe("modalidade não identificada (decisão 0054)", () => {
  const a = analisarRfp([documentoLido(PAGINAS)], HOJE);

  it("sem edital, critério, sessão nem artigo de inexigibilidade ou dispensa: não supõe licitação", () => {
    const l = montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE);
    expect(l.modalidade).toBe("nao-identificada");
    expect(l.itens.find((i) => i.id === "leitura:regime")?.texto).toMatch(
      /não identificada .* confirmar com o GP/,
    );
    expect(l.itens.find((i) => i.id === "leitura:modalidade:alternativas")?.secao).toBe("julgamento");
    const pedido = pedidoLeituraRfp(l, HOJE);
    expect(pedido).toMatch(/Modalidade: não identificada no documento — confirmar com o GP/);
    expect(pedido).toMatch(/seções 5 .*, 6 .* e 8 .* com as alternativas/);
    expect(pedido).not.toMatch(/Modalidade reconhecida pelo código: licitacao/);
  });

  it("a escolha do GP vale na leitura e na etapa 2; sem ela, a etapa 2 marca a modalidade como não identificada", () => {
    const comEscolha = { ...analiseInicial(a, HOJE), modalidade: "contratacao-direta" as const };
    expect(montarLeituraRfp(a, comEscolha, HOJE).modalidade).toBe("contratacao-direta");
    expect(sugerirTipo(a, a.requisitosDoCodigo).modalidadeNaoIdentificada).toBe(true);
    expect(sugerirTipo(a, a.requisitosDoCodigo, "contratacao-direta").contrato).toBe("contratacao-direta");
    expect(sugerirTipo(a, a.requisitosDoCodigo, "licitacao").modalidadeNaoIdentificada).toBeUndefined();
  });
});
