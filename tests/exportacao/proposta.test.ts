// Saídas da etapa 2 montadas com as respostas de teste do PMO na RFP da OEI.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { beforeAll, describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import { Dossie as EsquemaDossie, type DocumentoLido, type Dossie } from "../../src/dossie/esquema";
import { montarPontoDePartida, type PontoDePartida } from "../../src/etapas/2-proposta/ponto-de-partida";
import { propostaInicial } from "../../src/etapas/2-proposta/proposta";
import { gerarDocx } from "../../src/exportacao/docx";
import {
  montarMatrizEChecklist,
  montarPerguntasProposta,
  montarPlanilhaPreco,
  montarPropostaTecnica,
} from "../../src/exportacao/relatorio-proposta";
import { RespostaConteudo, RespostaEap, RespostaEstrategia } from "../../src/pmo/schemas/proposta";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const ler = (n: string) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/gerados/proposta-oei/${n}.json`, import.meta.url), "utf-8"),
  ) as unknown;
const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;

let doc: DocumentoLido;
let ponto: PontoDePartida;
let dossie: Dossie;

beforeAll(async () => {
  doc = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
  ponto = montarPontoDePartida([doc], undefined, new Date(2026, 10, 13));
  const conteudo = RespostaConteudo.parse(ler("conteudo"));
  // um item "do documento" com citação falsa, plantado: tem de sair como "citação não conferida"
  conteudo.restricoes.push({
    id: "falsa",
    texto: "A contratante aprova cada produto em até 10 dias úteis.",
    rotulo: "documento",
    motivo: "",
    fontes: [
      { doc: "rfp", pagina: 21, trecho: "A contratante aprovará cada produto em até 10 (dez) dias úteis." },
    ],
    alternativas: [],
    requisitos: [],
    ficha: "",
  });
  dossie = criarDossieVazio();
  dossie.projeto.nome = "Teste OEI";
  dossie.documentos.push(doc);
  dossie.proposta = {
    ...propostaInicial(),
    estrategia: { resposta: RespostaEstrategia.parse(ler("estrategia")), modelo: "claude-opus-5-5", em: "" },
    abordagem: { id: "B" },
    conteudo: { resposta: conteudo, modelo: "claude-opus-5-5", em: "" },
    eap: { resposta: RespostaEap.parse(ler("eap")), modelo: "claude-opus-5-5", em: "" },
  };
}, 120000);

describe("saídas da etapa 2", () => {
  it("o dossiê com a proposta passa pelo esquema (salvar e abrir)", () => {
    const relido = EsquemaDossie.parse(JSON.parse(JSON.stringify(dossie)));
    expect(relido.proposta?.abordagem?.id).toBe("B");
    expect(relido.proposta?.eap?.resposta.atividades).toHaveLength(12);
  });

  it("proposta técnica: rótulo em cada trecho, citação falsa marcada, minuta e nomes a definir", async () => {
    const p = montarPropostaTecnica(dossie, ponto, [doc]);
    expect(p.minuta).toBe(true);
    const texto = JSON.stringify(p.secoes);
    expect(texto).toContain(
      "[Do documento — citação não conferida] A contratante aprova cada produto em até 10 dias úteis.",
    );
    expect(texto).toMatch(/\[Do documento, p\. 21\] Os serviços são prestados/);
    expect(texto).toContain("[Decisão do GP] B — Pesquisa documental com escuta de profissionais da rede");
    expect(texto).toContain("[Decisão do GP] a definir pelo GP");
    expect(texto).toMatch(/Cronograma executivo \(calculado pelo código\)/);
    const blob = await gerarDocx(p, logoBuffer);
    const xml = strFromU8(
      unzipSync(new Uint8Array(await blob.arrayBuffer()))["word/document.xml"] as Uint8Array,
    );
    expect(xml).toContain("Minuta");
    expect(xml).toContain("Compreensão do objeto");
  });

  it("planilha de preço sem a tabela do GP: nenhum valor inventado", () => {
    const p = montarPlanilhaPreco(dossie, ponto, [doc]);
    const texto = JSON.stringify(p.secoes);
    expect(texto).not.toMatch(/R\$\s*\d/);
    expect(texto).toContain("a definir pelo GP");
    expect(texto).toMatch(/Falta preencher: valor-hora/);
  });

  it("planilha de preço com os valores do GP fecha a conta", () => {
    const comValores: Dossie = {
      ...dossie,
      proposta: {
        ...dossie.proposta!,
        parametros: {
          ...dossie.proposta!.parametros,
          valoresHora: { coord: 100, "esp-pp": 100, "esp-as": 100, "esp-cont": 100, editorial: 100 },
          despesas: [{ descricao: "viagens", valor: 1000 }],
          indiretosPct: 0,
          tributosPct: 0,
          reserva: 0,
        },
      },
    };
    const texto = JSON.stringify(montarPlanilhaPreco(comValores, ponto, [doc]).secoes);
    expect(texto).toMatch(/Preço calculado","R\$\s*\d/);
    expect(texto).not.toMatch(/Falta preencher/);
  });

  it("matriz de atendimento e checklist de envio", () => {
    const m = montarMatrizEChecklist(dossie, ponto, [doc]);
    const linhas = m.secoes[0]?.tabela?.linhas ?? [];
    expect(linhas.find((l) => l[0] === "R05")?.[5]).toBe("atendido");
    expect(m.secoes[1]?.tabela?.linhas.some((l) => l[0] === "Prazo de entrega da proposta")).toBe(true);
  });

  it("perguntas juntam a estratégia e as brechas da etapa 1, sem repetir", () => {
    const p = montarPerguntasProposta(dossie, ponto, [doc]);
    const perguntas = p.secoes[1]?.paragrafos ?? [];
    expect(perguntas[0]).toMatch(/escuta direta de crianças/);
    // a brecha da p. 19 já tem destino na estratégia: não sai de novo
    expect(perguntas.filter((x) => x.includes("Quando aplicável, deverão ser previstos"))).toHaveLength(0);
    expect(perguntas.length).toBe(1 + ponto.brechas.length - 1);
  });
});
