// Demonstração da etapa 5 (decisão 0037): o plano de trabalho inventado, com erros plantados, e a resposta gravada
// do PMO, conferida pelo código como no uso real.
import { describe, expect, it } from "vitest";
import { planoDaDemonstracao, respostaGravada } from "../../src/demonstracao/demonstracao";
import { CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import { conferirLeitura } from "../../src/etapas/5-conferencia/leitura-pmo";
import { conferirVereditos } from "../../src/etapas/5-conferencia/candidatos";
import { RespostaLeitura } from "../../src/pmo/schemas/leitura";
import { conferirPlano } from "../../src/regras/conferencia";
import { aplicarTipoPlano, confirmacaoInicial, proporMapa } from "../../src/regras/mapa-pgp";
import { lerRfpPublica } from "../ajudantes/rfp-publica";
import { extrairRequisitos } from "../../src/extracao/requisitos";
import { semRevisoesDoPmo } from "../../src/pmo/itens";

describe("demonstração da etapa 5", () => {
  it("a leitura gravada passa no schema e cada citação é achada no plano inventado ou no edital", async () => {
    const plano = await planoDaDemonstracao();
    const rfp = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
    const leitura = await respostaGravada(5, "leitura", RespostaLeitura);
    const proposta = proporMapa(plano.paginas, PARTES_PGP);
    const mapa = aplicarTipoPlano(confirmacaoInicial(proposta), "plano-trabalho", proposta);
    const codigo = conferirPlano({
      pgp: plano.paginas,
      rfp: rfp.paginas,
      partes: PARTES_PGP,
      premissas: PREMISSAS_CRITICAS,
      mapa,
      caracteristicas: CARACTERISTICAS_PADRAO,
      premissasAplicaveis: Object.fromEntries(PREMISSAS_CRITICAS.map((p) => [p.codigo, true])),
      requisitos: [],
      tipoPlano: "plano-trabalho",
    });
    const conferidos = conferirLeitura(leitura, { pgp: plano, rfp }, codigo.achados);
    expect(plano.papel).toBe("pgp");
    expect(conferidos).toHaveLength(7);
    // nenhuma citação inventada e nenhum ausente que o código ache no plano
    expect(conferidos.map((a) => a.situacao)).toEqual(Array(7).fill("valido"));
    const naoConferidas = conferidos.flatMap((a) =>
      a.citacoes.flatMap((c, k) =>
        c.estado === "conferida" || c.estado === "aproximada" ? [] : [`${a.id}: ${a.evidencias[k]?.trecho}`],
      ),
    );
    expect(naoConferidas).toEqual([]);
  }, 60_000);

  it("como na tela: requisitos da RFP e o tipo de plano padrão não mudam a conferência das citações", async () => {
    const plano = await planoDaDemonstracao();
    const rfp = await lerRfpPublica("concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf");
    const leitura = await respostaGravada(5, "leitura", RespostaLeitura);
    const proposta = proporMapa(plano.paginas, PARTES_PGP);
    const codigo = conferirPlano({
      pgp: plano.paginas,
      rfp: rfp.paginas,
      partes: PARTES_PGP,
      premissas: PREMISSAS_CRITICAS,
      mapa: confirmacaoInicial(proposta),
      caracteristicas: CARACTERISTICAS_PADRAO,
      premissasAplicaveis: Object.fromEntries(PREMISSAS_CRITICAS.map((p) => [p.codigo, true])),
      requisitos: extrairRequisitos(rfp.paginas),
    });
    const conferidos = conferirLeitura(leitura, { pgp: plano, rfp }, codigo.achados);
    expect(conferidos.every((a) => a.situacao === "valido")).toBe(true);
    // decisão 0052: cada achado do código tem veredito; o "falso" traz o trecho, achado na página
    const v = conferirVereditos(leitura, codigo.achados, new Map(), confirmacaoInicial(proposta), [
      plano,
      rfp,
    ]);
    expect(v.candidatos.filter((c) => c.situacao === "sem-veredito").map((c) => c.achado.id)).toEqual([]);
    expect(
      v.candidatos.filter((c) => c.avisos.length).map((c) => `${c.achado.id}: ${c.avisos.join("; ")}`),
    ).toEqual([]);
    expect(v.contam.length).toBeGreaterThan(0);
    expect(v.desconhecidos.length).toBeGreaterThan(0); // os ids que só existem no modo plano de trabalho
  }, 60_000);

  it("uma leitura nova não herda as revisões nem as decisões da anterior", () => {
    expect(
      semRevisoesDoPmo({ "pmo:L1": { estado: "aceito" }, "requisito:R01": { estado: "aceito" } }),
    ).toEqual({ "requisito:R01": { estado: "aceito" } });
  });
});
