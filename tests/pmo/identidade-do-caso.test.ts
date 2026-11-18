// Identidade do caso no topo do pedido da segunda instância (decisão 0066): o revisor confere que leu o caso certo.
import { describe, expect, it } from "vitest";
import { prepararDocumento } from "../../src/extracao/rfp/item";
import { identidadeDoCaso, identidadeEmTexto, termosDoObjeto } from "../../src/pmo/identidade-do-caso";
import { pedidoSegundaInstancia } from "../../src/pmo/segunda-instancia";
import { documentoLido } from "../etapas/rfp-ajudantes";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const docDe = (textos: string[]) => {
  const d = documentoLido(textos);
  return prepararDocumento(d.id, "RFP", d.paginas);
};

describe("termos do objeto", () => {
  it("pula as palavras de todo edital e fica com as do caso, na ordem do objeto", () => {
    const objeto =
      "Empresa especializada, contratada para serviço técnico, no mapeamento de nascentes e recuperação de matas ciliares";
    expect(termosDoObjeto(objeto, [docDe([objeto])])).toEqual(["mapeamento", "nascentes", "recuperação"]);
  });

  it("junta a palavra partida na linha e para no valor do quadro da capa", () => {
    const objeto =
      "Serviços de cadastra- mento de feirantes. VALOR TOTAL DA CONTRATAÇÃO R$ 1.000,00 (um milhão)";
    expect(termosDoObjeto(objeto, [docDe(["cadastramento de feirantes", objeto])])).toEqual([
      "cadastramento",
      "feirantes",
    ]);
  });

  it("só vale termo que o texto da RFP traz, palavra inteira e sem acento", () => {
    const objeto = "Apoio à regularização fundiária de assentamentos";
    expect(termosDoObjeto(objeto, [docDe(["regularizacao fundiaria", "sem o resto"])])).toEqual([
      "regularização",
      "fundiária",
    ]);
  });

  it("na contratação direta, pula o nome da contratada e para no título seguinte", () => {
    const objeto =
      "OBJETO – a Fundação Getúlio Vargas, contratada sem licitação, fará o Estudo de Impacto Hídrico de barragens. JUSTIFICATIVA A população";
    expect(termosDoObjeto(objeto, [docDe([objeto])])).toEqual(["impacto", "hídrico", "barragens"]);
    expect(
      termosDoObjeto("Contratar pessoa jurídica para o diagnóstico. JUSTIFICATIVA populacional", [
        docDe(["diagnostico populacional"]),
      ]),
    ).toEqual(["diagnóstico"]);
  });
});

describe("identidade do caso", () => {
  it("sem RFP no dossiê, só os arquivos", () => {
    const d = { ...documentoLido(["Plano de trabalho"]), papel: "pgp" as const, nomeArquivo: "plano.pdf" };
    const id = identidadeDoCaso([d], "Projeto disfarçado");
    expect(id).toEqual({
      projeto: "Projeto disfarçado",
      arquivos: [{ papel: "pgp", nome: "plano.pdf", paginas: 1 }],
      termos: [],
    });
    expect(identidadeEmTexto(id)).not.toMatch(/Objeto|Termos/);
  });

  it("numa RFP pública: o objeto com a página e termos que separam dois casos", async () => {
    const a = identidadeDoCaso([
      await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf"),
    ]);
    const b = identidadeDoCaso([
      await lerRfpPublica("pregao-eletronico-politicas-mulheres-barra-bonita-2026.pdf"),
    ]);
    expect(a.objeto?.pagina).toBe(1);
    expect(a.termos).toEqual(["subsídios", "fortalecimento", "sistema"]);
    expect(b.termos).toEqual(["mulheres", "enfrentando", "violência"]);
    expect(a.termos.filter((t) => b.termos.includes(t))).toEqual([]);
  }, 60000);

  it("vai no topo do pedido, antes do papel do revisor, com a ordem de parar se for outro caso", () => {
    const id = identidadeDoCaso([documentoLido(["1. OBJETO\nRecuperação de nascentes no território."])]);
    const p = pedidoSegundaInstancia(3, "tap", {}, "pedido", { identidade: id });
    const topo = p.indexOf("## Caso desta conferência");
    expect(topo).toBeGreaterThan(0);
    expect(topo).toBeLessThan(p.indexOf("Você é a segunda instância"));
    expect(p).toMatch(/Documento: rfp\.pdf \(rfp, 1 página\)/);
    expect(p).toMatch(/caso errado/);
    expect(pedidoSegundaInstancia(3, "tap", {}, "pedido")).not.toMatch(/Caso desta conferência/);
  });
});
