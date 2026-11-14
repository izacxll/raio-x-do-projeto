// Etapa 3 (TAP): entrada, divergências RFP × proposta, o que vem dos documentos, as respostas gravadas do PMO para a
// RFP pública da OEI (tests/fixtures/gerados/tap-oei/) e a conferência do TAP pelo código.
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { propostaGravada } from "../../src/demonstracao/preparar";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import type { DocumentoLido, Dossie, TapDossie } from "../../src/dossie/esquema";
import { conferirTap } from "../../src/etapas/3-tap/conferencia-tap";
import { compararRfpEProposta, diasDoTexto, pedeDecisao } from "../../src/etapas/3-tap/divergencias";
import { dadosDosDocumentos } from "../../src/etapas/3-tap/do-documento";
import { montarEntradaTap, valorNaProposta, type EntradaTap } from "../../src/etapas/3-tap/entrada";
import { pedidoPremissas, pedidoTap } from "../../src/etapas/3-tap/pedidos";
import { contarPendentesTap, itensDaEtapa3, tapInicial } from "../../src/etapas/3-tap/tap";
import { avaliarItens, type ItemProposta } from "../../src/etapas/2-proposta/proposta";
import { RespostaPremissas, RespostaTap } from "../../src/pmo/schemas/tap";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const ler = (n: string) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/gerados/tap-oei/${n}.json`, import.meta.url), "utf-8"),
  ) as unknown;
const HOJE = new Date(2026, 10, 13);

const pagina = (numero: number, texto: string) => ({
  numero,
  origem: "texto" as const,
  texto,
  caracteres: texto.length,
});

const propostaPdf = (paginas: ReturnType<typeof pagina>[]): DocumentoLido => ({
  id: "p",
  papel: "proposta",
  nomeArquivo: "proposta-final.pdf",
  tamanhoBytes: 1,
  totalPaginas: paginas.length,
  lidoEm: "",
  paginas,
});

let rfp: DocumentoLido;
let dossie: Dossie;
let entrada: EntradaTap;

beforeAll(async () => {
  rfp = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
  dossie = { ...criarDossieVazio(HOJE), documentos: [rfp], proposta: await propostaGravada() };
  entrada = montarEntradaTap(dossie, HOJE);
}, 120000);

const comPreco = (preco: number): Dossie => ({
  ...dossie,
  proposta: { ...dossie.proposta!, parametros: { ...dossie.proposta!.parametros, precoFinal: preco } },
});

describe("entrada da etapa 3", () => {
  it("sem PDF da proposta, usa a proposta da etapa 2 como documento, uma página por seção", () => {
    expect(entrada.fonte).toBe("dossie");
    expect(entrada.proposta?.papel).toBe("proposta");
    expect(entrada.proposta?.paginas[6]?.texto).toContain("Escopo do trabalho (SOW)");
    expect(entrada.dados?.produtos.map((p) => p.id)).toEqual(["P1", "P2", "P3", "P4", "P5"]);
    expect(entrada.documentos).toHaveLength(2);
  });

  it("com o PDF final do GP, ele vale no lugar do dossiê", () => {
    const pdf = propostaPdf([pagina(1, "Proposta. Valor global da proposta: R$ 480.000,00.")]);
    const e = montarEntradaTap({ ...dossie, documentos: [rfp, pdf] }, HOJE);
    expect(e.fonte).toBe("pdf");
    expect(e.dados).toBeUndefined();
    expect(valorNaProposta(pdf)).toMatchObject({ valor: 480000, pagina: 1 });
  });

  it("sem proposta nenhuma, não há divergências", () => {
    const e = montarEntradaTap({ ...criarDossieVazio(HOJE), documentos: [rfp] }, HOJE);
    expect(e.fonte).toBe("nenhuma");
    expect(compararRfpEProposta(e)).toEqual([]);
  });
});

describe("divergências RFP × proposta (código)", () => {
  it("os nove requisitos de produto e equipe da OEI estão ligados na proposta gravada", () => {
    const d = compararRfpEProposta(entrada);
    const req = d.filter((x) => x.requisito);
    expect(req.map((x) => x.requisito)).toEqual([
      "R01",
      "R02",
      "R03",
      "R04",
      "R05",
      "R06",
      "R07",
      "R08",
      "R09",
    ]);
    expect(req.every((x) => x.situacao === "igual")).toBe(true);
    expect(d.find((x) => x.id === "prazo")?.situacao).toBe("igual");
  });

  it("valor: o estimado da RFP contra o preço final do GP", () => {
    expect(entrada.ponto.valorEstimado?.texto).toBe("R$ 500.000,00");
    expect(compararRfpEProposta(entrada).find((x) => x.id === "valor")?.situacao).toBe("nao-conferido");
    const v = compararRfpEProposta(montarEntradaTap(comPreco(450000), HOJE)).find((x) => x.id === "valor")!;
    expect(v.situacao).toBe("diferente");
    expect(v.observacao).toMatch(/abaixo do valor estimado/);
    expect(pedeDecisao(v)).toBe(true);
  });

  it("proposta em PDF: requisito que o código não acha fica 'não localizado', nunca ausente", () => {
    const pdf = propostaPdf([
      pagina(1, "Atendemos ao R01 com o plano de trabalho. Prazo de execução de 10 meses."),
      pagina(2, "Produto 2: dois cadernos temáticos sobre direitos de crianças e adolescentes."),
    ]);
    const d = compararRfpEProposta(montarEntradaTap({ ...dossie, documentos: [rfp, pdf] }, HOJE));
    expect(d.find((x) => x.id === "produto:R01")?.situacao).toBe("igual");
    expect(d.find((x) => x.id === "produto:R02")?.proposta.onde).toBe("proposta, p. 2");
    const r06 = d.find((x) => x.id === "equipe:R06")!;
    expect(r06.situacao).toBe("so-na-rfp");
    expect(r06.proposta.texto).toMatch(/não localizado na proposta pelo código/);
    const prazo = d.find((x) => x.id === "prazo")!;
    expect(prazo.situacao).toBe("diferente");
    expect(prazo.proposta.texto).toBe("10 meses");
  });

  it("dias de um texto de prazo", () => {
    expect(diasDoTexto("até 30 dias após a assinatura")).toBe(30);
    expect(diasDoTexto("12 meses")).toBe(360);
    expect(diasDoTexto("na assinatura")).toBeUndefined();
  });
});

describe("o que vem dos documentos (código)", () => {
  it("contratante, objeto, prazo, produtos, marcos calculados, aceite e extinção, com a página", () => {
    const dados = dadosDosDocumentos(entrada);
    const id = (x: string) => dados.find((d) => d.id === x);
    expect(id("objeto")?.onde).toBe("RFP, p. 1");
    expect(id("prazo")?.texto).toBe("12 meses");
    expect(id("produto:R05")?.elemento).toBe("TAP.4");
    expect(id("marco:P2")?.origem).toBe("calculado");
    expect(id("aceite")?.onde).toBe("RFP, p. 24");
    expect(id("extincao")?.onde).toBe("RFP, p. 53");
  });
});

describe("respostas gravadas do PMO na etapa 3 (OEI)", () => {
  const tap = RespostaTap.parse(ler("tap"));
  const premissas = RespostaPremissas.parse(ler("premissas"));
  const t: TapDossie = {
    ...tapInicial(),
    tap: { resposta: tap, modelo: "teste", em: "" },
    premissas: { resposta: premissas, modelo: "teste", em: "" },
  };

  it("toda citação é achada pelo código, na RFP e na proposta do dossiê; sem número sem fonte", () => {
    const itens = itensDaEtapa3(t, entrada.documentos);
    const naoAchadas = itens.flatMap((i) =>
      i.conferencia.citacoes
        .map((c, k) => ({ id: i.id, trecho: i.item.fontes[k]?.trecho, estado: c.estado }))
        .filter((c) => c.estado === "nao-conferida"),
    );
    expect(naoAchadas).toEqual([]);
    const av = avaliarItens(itens as ItemProposta[], entrada.ponto.requisitos);
    expect(av.numerosSemFonte).toBe(0);
    expect(av.fatosSemCitacao).toBe(0);
    expect(av.aderencia).toBe(1);
  });

  it("conferência do TAP: elementos, requisitos e premissas críticas em ordem; o P2 fora do prazo é apontado", () => {
    const itens = itensDaEtapa3(t, entrada.documentos);
    const v = conferirTap(entrada, t, itens, dossie.proposta!.premissasAplicaveis);
    const de = (id: string) => v.find((x) => x.id === id)!;
    expect(v.filter((x) => x.id.startsWith("elemento:")).every((x) => x.situacao === "ok")).toBe(true);
    expect(de("requisitos").situacao).toBe("ok");
    expect(de("citacoes").situacao).toBe("ok");
    expect(de("premissas-criticas").situacao).toBe("ok");
    expect(de("marcos").situacao).toBe("atencao");
    expect(de("marcos").texto).toMatch(/P2/);
    expect(de("valor").situacao).toBe("nao-conferido");
  });

  it("premissa crítica confirmada sem linha no registro é apontada", () => {
    const itens = itensDaEtapa3(t, entrada.documentos);
    const v = conferirTap(entrada, t, itens, { PC2: true });
    expect(v.find((x) => x.id === "premissas-criticas")?.texto).toMatch(/PC2/);
  });

  it("recursos do TAP diferentes do valor da proposta são apontados", () => {
    const e = montarEntradaTap(comPreco(450000), HOJE);
    const itens = itensDaEtapa3(t, e.documentos);
    const conf = (recursos: string) =>
      conferirTap(e, { ...t, decisoes: { recursos } }, itens, {}).find((x) => x.id === "valor")?.situacao;
    expect(conf("R$ 450.000,00")).toBe("ok");
    expect(conf("R$ 500.000,00")).toBe("atencao");
  });

  it("pendências: itens, divergências sem decisão e a aprovação do TAP", () => {
    const itens = itensDaEtapa3(t, entrada.documentos);
    const divs = compararRfpEProposta(entrada);
    expect(contarPendentesTap(t, itens, divs)).toBe(itens.length + 1);
    const revisoes = Object.fromEntries(itens.map((i) => [i.id, { estado: "aceito" as const }]));
    const aprovado = { ...t, revisoes, decisoes: { aprovadoPor: "GP", aprovadoEm: "2026-11-20" } };
    expect(contarPendentesTap(aprovado, itens, divs)).toBe(0);
  });

  it("os pedidos levam as divergências, o que vem dos documentos e as premissas críticas", () => {
    const divs = compararRfpEProposta(entrada);
    const p = pedidoTap(entrada, dadosDosDocumentos(entrada), divs, {}, { PC3: true });
    expect(p).toContain("produto:R01");
    expect(p).toContain("PC3");
    expect(p).toContain("cada página é uma seção da minuta");
    expect(pedidoPremissas(entrada, tap, { PC6: true })).toContain("PC6");
  });
});
