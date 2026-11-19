// A leitura do PMO da etapa 5 fica no dossiê salvo (o vigia importava e o arquivo saía sem ela; o resultado da etapa 5
// ficava vazio). Ida e volta pelo arquivo, com o plano inventado e a leitura gravada da OEI.
import { describe, expect, it } from "vitest";
import { planoGravado, respostaGravada } from "../ajudantes/gravadas";
import { criarDossieVazio, lerDossie, serializarDossie } from "../../src/dossie/arquivo";
import { Dossie as EsquemaDossie } from "../../src/dossie/esquema";
import { CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { PARTES_PGP } from "../../src/dominio/skill";
import { mapaInicialDaConferencia } from "../../src/etapas/5-conferencia/dispensas";
import { comLeituraDaEtapa5 } from "../../src/etapas/5-conferencia/leitura-no-dossie";
import { resultadoDaEtapa5 } from "../../src/etapas/5-conferencia/resultado";
import { RespostaLeitura } from "../../src/pmo/schemas/leitura";
import { proporMapa } from "../../src/regras/mapa-pgp";

const HOJE = new Date(2026, 10, 19);

describe("leitura da etapa 5 no dossiê", () => {
  it("o dossiê salvo e relido guarda a leitura e o plano ligado, e a etapa 5 tem resultado", async () => {
    const plano = planoGravado();
    const resposta = await respostaGravada(5, "leitura", RespostaLeitura);
    const dossie = EsquemaDossie.parse({ ...criarDossieVazio(HOJE), documentos: [plano] });
    expect(resultadoDaEtapa5(dossie)).toBeUndefined();
    const mapa = mapaInicialDaConferencia(proporMapa(plano.paginas, PARTES_PGP), plano.paginas, PARTES_PGP);
    const com = comLeituraDaEtapa5(
      dossie,
      { caracteristicas: CARACTERISTICAS_PADRAO, mapa, premissasAplicaveis: {} },
      plano.id,
      { resposta, modelo: "teste", em: HOJE.toISOString() },
    );
    const relido = lerDossie(serializarDossie(com, HOJE), "caso.dossie.json");
    expect(relido.ok).toBe(true);
    if (!relido.ok) return;
    expect(relido.dossie.conferencia?.leituraPmo?.em).toBe(HOJE.toISOString());
    expect(relido.dossie.conferencia?.pgpId).toBe(plano.id);
    expect(resultadoDaEtapa5(relido.dossie)).toBeDefined();
  });

  it("a leitura nova tira as decisões do GP sobre a leitura anterior e mantém o mapa", async () => {
    const plano = planoGravado();
    const resposta = await respostaGravada(5, "leitura", RespostaLeitura);
    const mapa = mapaInicialDaConferencia(proporMapa(plano.paginas, PARTES_PGP), plano.paginas, PARTES_PGP);
    const base = { caracteristicas: CARACTERISTICAS_PADRAO, mapa, premissasAplicaveis: {} };
    const primeira = comLeituraDaEtapa5(
      EsquemaDossie.parse({ ...criarDossieVazio(HOJE), documentos: [plano] }),
      base,
      plano.id,
      { resposta, modelo: "teste", em: "2026-11-18T10:00:00.000Z" },
    );
    const comDecisao = {
      ...primeira,
      conferencia: {
        ...primeira.conferencia!,
        decisoes: { "pmo:a1": { procede: "nao" }, "A8:ausente:A8.12": { procede: "sim" } },
      },
    } as typeof primeira;
    const leituraNova = { resposta, modelo: "teste", em: HOJE.toISOString() };
    const segunda = comLeituraDaEtapa5(comDecisao, { ...base, mapa: [] }, plano.id, leituraNova);
    // a decisão sobre a leitura anterior sai; a sobre o achado do código fica
    expect(segunda.conferencia?.decisoes).toEqual({ "A8:ausente:A8.12": { procede: "sim" } });
    expect(segunda.conferencia?.mapa).toEqual(mapa);
    // outro plano: o mapa volta ao do plano novo e as decisões saem, como a tela faz
    const outro = comLeituraDaEtapa5(comDecisao, { ...base, mapa: [] }, "outro-plano", leituraNova);
    expect(outro.conferencia?.mapa).toEqual([]);
    expect(outro.conferencia?.decisoes).toEqual({});
    expect(outro.conferencia?.pgpId).toBe("outro-plano");
  });
});
