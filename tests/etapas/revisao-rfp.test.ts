// Revisão do GP na etapa 1 e o número do requisito seguindo da etapa 1 até a conferência (etapa 5).
import { describe, expect, it } from "vitest";
import { criarDossieVazio, lerDossie, serializarDossie } from "../../src/dossie/arquivo";
import { CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import {
  analiseInicial,
  contarPendentes,
  ehRevisavel,
  incluirRequisito,
  itensFinais,
  requisitosValidos,
} from "../../src/etapas/1-rfp/revisao";
import {
  montarAnaliseRfp,
  montarChecklistHabilitacao,
  montarPerguntas,
  montarRequisitosEPrazos,
} from "../../src/exportacao/relatorio-rfp";
import { conferirPlano } from "../../src/regras/conferencia";
import { confirmacaoInicial, proporMapa } from "../../src/regras/mapa-pgp";
import { documentoLido, pagina } from "./rfp-ajudantes";

const RFP = documentoLido([
  "EDITAL DE PREGÃO ELETRÔNICO Nº 1/2027\nProduto 1 – Diagnóstico do território\nProduto 2 – Relatório final consolidado\nOs serviços dependem do envio dos dados pela Secretaria.\n1. DO OBJETO\nA contratada apresentará relatórios oportunamente.",
]);
const analise = analisarRfp([RFP], new Date(2027, 0, 10));

describe("revisão da análise da RFP", () => {
  it("os números dos requisitos ficam fixos: o novo ganha o próximo e o descartado não volta", () => {
    let a = analiseInicial(analise);
    expect(a.requisitos.map((r) => r.numero)).toEqual(["R01", "R02"]);
    a = { ...a, revisoes: { ...a.revisoes, "requisito:R02": { estado: "descartado" } } };
    a = incluirRequisito(a, "Requisito técnico", "Sistema acessível em navegador");
    expect(a.requisitos.map((r) => r.numero)).toEqual(["R01", "R02", "R03"]);
    expect(requisitosValidos(a).map((r) => r.numero)).toEqual(["R01", "R03"]);
    a = incluirRequisito(a, "", "Outro");
    expect(a.requisitos.at(-1)?.numero).toBe("R04");
  });

  it("a descrição editada pelo GP é a que segue", () => {
    const a = analiseInicial(analise);
    const editada = {
      ...a,
      revisoes: { "requisito:R01": { estado: "editado" as const, textoEditado: "Diagnóstico revisado" } },
    };
    expect(requisitosValidos(editada)[0]?.descricao).toBe("Diagnóstico revisado");
  });

  it("cabeçalho de minuta até o GP revisar todos os itens", () => {
    const a = analiseInicial(analise);
    const dossie = { ...criarDossieVazio(), documentos: [RFP], analiseRfp: a };
    expect(montarAnaliseRfp(dossie, analise).minuta).toBe(true);
    const todos = itensFinais(analise, a).filter(ehRevisavel);
    const revisado = {
      ...a,
      revisoes: Object.fromEntries(todos.map((i) => [i.id, { estado: "aceito" as const }])),
    };
    expect(contarPendentes(itensFinais(analise, revisado), revisado.revisoes)).toBe(0);
    const d2 = { ...dossie, analiseRfp: revisado };
    expect(montarAnaliseRfp(d2, analise).minuta).toBe(false);
    expect(montarRequisitosEPrazos(d2, analise).minuta).toBe(false);
    expect(montarPerguntas(d2, analise).minuta).toBe(false);
    expect(montarChecklistHabilitacao(d2, analise).secoes[0]?.titulo).toBe("Habilitação");
  });

  it("pergunta descartada não vai para o documento de perguntas", () => {
    const a = analiseInicial(analise);
    const brechas = analise.itens.filter((i) => i.secao === "brechas");
    expect(brechas.length).toBeGreaterThan(0);
    const descartadas = {
      ...a,
      revisoes: Object.fromEntries(brechas.map((i) => [i.id, { estado: "descartado" as const }])),
    };
    const doc = montarPerguntas({ ...criarDossieVazio(), analiseRfp: descartadas }, analise);
    expect(doc.secoes[0]?.paragrafos).toEqual(["Nenhuma pergunta mantida pelo GP."]);
  });

  it("o dossiê guarda a análise e reabre igual, sem chave", () => {
    const dossie = { ...criarDossieVazio(), analiseRfp: incluirRequisito(analiseInicial(analise), "X", "Y") };
    const texto = serializarDossie(dossie);
    const lido = lerDossie(texto, "p.dossie.json");
    expect(lido.ok && lido.dossie.analiseRfp?.requisitos.map((r) => r.numero)).toEqual(["R01", "R02", "R03"]);
    expect(texto).not.toMatch(/sk-ant-/);
  });
});

describe("o requisito segue da etapa 1 até a conferência", () => {
  it("R02 da etapa 1 é o R02 da conferência do plano", () => {
    const a = analiseInicial(analise);
    const pgp = [
      pagina(1, "1. Especificação do escopo\nProduto 1 – Diagnóstico do território, entregue no mês 2."),
      pagina(2, "2. Cronograma\nMarco 1: entrega do diagnóstico."),
    ];
    const mapa = confirmacaoInicial(proporMapa(pgp, PARTES_PGP));
    const r = conferirPlano({
      pgp,
      partes: PARTES_PGP,
      premissas: PREMISSAS_CRITICAS,
      mapa,
      caracteristicas: CARACTERISTICAS_PADRAO,
      premissasAplicaveis: {},
      requisitos: requisitosValidos(a),
    });
    expect(r.verificacoes.find((v) => v.alvo === "R01")?.estado).toBe("ok");
    const r02 = r.achados.find((x) => x.id.includes("R02"));
    expect(r02?.titulo).toMatch(/^R02 \(Produto 2\) não localizado pelo código/);
  });
});
