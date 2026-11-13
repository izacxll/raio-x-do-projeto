// Etapa 1 sobre um edital escrito para o teste: cada passo acha o que está lá, com página e trecho, e o que
// não está fica "não localizado pelo código", nunca "não informado no documento".
import { describe, expect, it } from "vitest";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { documentoLido } from "./rfp-ajudantes";

const EDITAL = [
  `PREFEITURA MUNICIPAL DE EXEMPLO
EDITAL DE PREGÃO ELETRÔNICO Nº 12/2027
Processo Administrativo nº 1234/2027
OBJETO:
Contratação de consultoria para elaboração do plano municipal de cultura.
VALOR TOTAL DA CONTRATAÇÃO:
R$ 150.000,00 (cento e cinquenta mil reais).
DATA DA SESSÃO PÚBLICA:
Dia 26/03/2027 às 09:00 horas (horário de Brasília).
CRITÉRIO DE JULGAMENTO:
Menor preço global.
1. DO OBJETO
1.1. O objeto da presente licitação é a contratação de consultoria, nos termos da Lei nº 14.133/2021.`,
  `2. DA HABILITAÇÃO
2.1. Serão exigidos: prova de regularidade relativa ao FGTS; certidão negativa de débitos trabalhistas;
atestado de capacidade técnica de serviço similar; balanço patrimonial do último exercício.
3. DA IMPUGNAÇÃO AO EDITAL E DO PEDIDO DE ESCLARECIMENTO
3.1. Até 3 (três) dias úteis antes da data fixada para a abertura da sessão pública, qualquer pessoa poderá pedir esclarecimentos.`,
  `ANEXO I - TERMO DE REFERÊNCIA
1. ESPECIFICAÇÃO DOS SERVIÇOS
Produto 1 – Diagnóstico cultural do município
Produto 2 – Plano municipal de cultura
Serão realizadas 6 (seis) oficinas com a comunidade.
Equipe técnica mínima:
a) 1 (um) Coordenador geral, com graduação e experiência de 5 anos.
2. DA VIGÊNCIA
O prazo de vigência do contrato é de 8 (oito) meses, contados da assinatura.
3. DO PAGAMENTO
O pagamento será efetuado em até 30 (trinta) dias corridos após o aceite de cada produto.
4. DA GARANTIA
Será exigida garantia de execução de 5% (cinco por cento) do valor do contrato.
5. DAS SANÇÕES
Multa de 0,5% por dia de atraso, até o limite de 10% do valor do contrato.
É vedada a subcontratação.`,
];

const analise = analisarRfp([documentoLido(EDITAL)], new Date(2027, 2, 20));
const item = (id: string) => analise.itens.find((i) => i.id === id);

describe("análise da RFP sobre um edital de teste", () => {
  it("identificação: instrumento, modalidade, contratante, objeto, processo, valor e lei", () => {
    expect(item("identificacao:modalidade")?.texto).toBe("Pregão eletrônico");
    expect(item("identificacao:contratante")?.texto).toMatch(/PREFEITURA MUNICIPAL DE EXEMPLO/);
    expect(item("identificacao:objeto")?.texto).toMatch(/plano municipal de cultura/);
    expect(item("identificacao:processo")?.texto).toBe("1234/2027");
    expect(item("identificacao:valor")?.texto).toBe("R$ 150.000,00");
    expect(
      analise.itens.some((i) => i.nome === "Legislação citada" && /Lei 14\.133\/2021/.test(i.texto)),
    ).toBe(true);
  });

  it("mapa: seções com página e o anexo separado do corpo", () => {
    expect(analise.mapa.inicioAnexos.get("rfp-teste")).toBe(3);
    const hab = analise.mapa.secoes.find((s) => s.tema === "habilitacao");
    expect(hab?.pagina).toBe(2);
  });

  it("prazos: sessão, limite de esclarecimento calculado e alerta, vigência", () => {
    const sessao = analise.itens.find((i) => i.id.startsWith("prazos:certame:sessao"));
    expect(sessao?.texto).toBe("26/03/2027 às 09:00");
    expect(sessao?.campos?.Alerta).toBe("faltam 6 dias corridos");
    const limite = analise.itens.find((i) => i.id.startsWith("prazos:esclarecimento"));
    // sexta 26/03 − 3 dias úteis = terça 23/03
    expect(limite?.texto).toMatch(/23\/03\/2027 \(calculado pelo código\)/);
    expect(limite?.situacao).toBe("calculado");
    expect(analise.itens.some((i) => i.nome === "Vigência" && i.texto === "8 meses")).toBe(true);
  });

  it("julgamento, habilitação e condições contratuais, com o valor tirado por código", () => {
    expect(item("julgamento:criterio")?.texto).toMatch(/^Menor preço/);
    for (const id of ["fgts", "cndt", "atestado", "balanco"])
      expect(item(`habilitacao:${id}`)?.origem?.pagina).toBe(2);
    expect(item("condicoes:garantia-execucao")?.texto).toMatch(/^5%/);
    expect(item("condicoes:penalidades")?.texto).toMatch(/de 0,5% a 10%/);
    expect(item("condicoes:subcontratacao")?.texto).toMatch(/vedada/);
    expect(item("condicoes:pagamento")?.texto).toMatch(/30 dias corridos/);
  });

  it("requisitos numerados: produtos, equipe e quantidades", () => {
    const r = analise.requisitosDoCodigo;
    expect(r.map((x) => x.numero)).toEqual(r.map((_, i) => `R${String(i + 1).padStart(2, "0")}`));
    expect(r.filter((x) => x.tipo === "produto").map((x) => x.rotulo)).toEqual(["Produto 1", "Produto 2"]);
    expect(r.some((x) => x.tipo === "equipe" && /Coordenador geral/.test(x.rotulo))).toBe(true);
    expect(r.some((x) => x.tipo === "quantidade" && /6 oficinas/.test(x.rotulo))).toBe(true);
    for (const x of r) expect(x.pagina).toBeGreaterThan(0);
  });

  it("pontos de atenção trazem o que pesa na decisão, sem decidir", () => {
    const atencao = analise.itens.filter((i) => i.secao === "atencao");
    expect(atencao.map((i) => i.nome)).toEqual(
      expect.arrayContaining([
        "Prazo para pedir esclarecimento",
        "Garantia de execução",
        "Penalidades",
        "Equipe exigida",
      ]),
    );
    for (const i of atencao) expect(i.nota).toMatch(/Quem decide é o GP/);
  });

  it("todo item do documento tem página e trecho; o que falta é 'não localizado pelo código'", () => {
    for (const i of analise.itens) {
      if (i.situacao === "localizado" && i.rotulo === "documento") {
        expect(i.origem?.pagina, i.id).toBeGreaterThan(0);
        expect(i.origem?.trecho, i.id).toBeTruthy();
      }
      expect(i.texto).not.toMatch(/não informado no documento/);
    }
    expect(item("condicoes:matriz-riscos")?.texto).toBe("não localizado pelo código — conferir no documento");
  });
});

describe("RFP com páginas sem texto legível", () => {
  it("o que o código não acha fica não verificável, nunca não informado", () => {
    const a = analisarRfp([documentoLido(["", ""], [1, 2])]);
    const semAchado = a.itens.filter((i) => i.situacao !== "localizado");
    expect(semAchado.length).toBeGreaterThan(5);
    for (const i of semAchado) {
      expect(i.situacao).toBe("nao-verificavel");
      expect(i.texto).not.toMatch(/não informado/);
    }
    expect(a.itens.find((i) => i.id === "atencao:ilegiveis")?.texto).toMatch(/p\. 1, 2/);
  });
});
