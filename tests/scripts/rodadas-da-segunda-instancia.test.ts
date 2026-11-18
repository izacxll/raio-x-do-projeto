import { describe, expect, it } from "vitest";
import {
  depoisDaConferencia,
  depoisDaResposta,
  lerConferencia,
  // @ts-expect-error: script em JavaScript puro, sem tipos
} from "../../scripts/rodadas-da-segunda-instancia.mjs";

const nomes = { chave: "2:eap", conferencia: "conferencia-x.md", resposta: "resposta-x.json" };
const nada = { seguir: false, corrigir: false, maisUmaRodada: false, decisaoNova: false };

interface Conf {
  rodada: number;
  altas: number;
  medias: number;
}

/**
 * Simula o vigia num passo: cada evento é a conferência importada (com os achados da rodada) ou uma resposta do passo
 * salva pelo GP (versão nova ou a mesma). Conta as rodadas criadas e guarda a versão com que o próximo passo saiu.
 */
function simular(
  eventos: (
    | { tipo: "conferencia"; altas: number; medias: number }
    | { tipo: "resposta"; versao: number }
    | { tipo: "decisao"; lista: "seguir" | "corrigir" }
  )[],
) {
  const decisao = { ...nada };
  let conf: Conf | undefined;
  let versao = 0;
  let conferida = -1;
  let rodadas = 0;
  const proximo: number[] = [];
  const registros: string[] = [];
  const paradas: string[] = [];
  for (const ev of eventos) {
    if (ev.tipo === "decisao") {
      decisao[ev.lista] = true;
      continue;
    }
    if (ev.tipo === "conferencia") {
      conf = { rodada: rodadas, altas: ev.altas, medias: ev.medias };
      const r = depoisDaConferencia(conf, decisao, nomes);
      if (r.acao === "proximo") proximo.push(versao);
      if (r.registro) registros.push(r.registro);
      if (r.acao === "parar") paradas.push(r.motivo);
      continue;
    }
    const mudou = ev.versao !== conferida;
    versao = ev.versao;
    const r = depoisDaResposta(conf, mudou, decisao, nomes);
    if (r.acao === "conferir") {
      rodadas++;
      conferida = versao;
    }
    if (r.acao === "proximo") proximo.push(versao);
    if (r.registro) registros.push(r.registro);
    if (r.acao === "parar") paradas.push(r.motivo);
  }
  return { rodadas, proximo, registros, paradas };
}

describe("rodadas da segunda instância no teste externo (decisão 0060)", () => {
  it("lê a rodada, os altos e os médios do conferencia-*.md, no formato novo e no antigo", () => {
    expect(
      lerConferencia("# Segunda instância — etapa 2, passo eap, rodada 2\n\nAchados: 3 (alta: 0, média: 2)."),
    ).toEqual({
      rodada: 2,
      altas: 0,
      medias: 2,
    });
    const antigo =
      "# Segunda instância — etapa 2, passo eap, rodada 1\n\nAchados: 3 (alta: 1).\n\n## Achados\n- **alta** · x\n- **média** · y\n- **baixa** · z";
    expect(lerConferencia(antigo)).toEqual({ rodada: 1, altas: 1, medias: 1 });
  });

  it("com achado médio, não exporta o próximo passo sem a decisão do GP", () => {
    const r = depoisDaConferencia({ rodada: 1, altas: 0, medias: 2 }, nada, nomes);
    expect(r.acao).toBe("parar");
    expect(r.motivo).toMatch(/corrigir/);
    expect(r.motivo).toMatch(/seguir/);
    // só achados baixos: segue
    expect(depoisDaConferencia({ rodada: 1, altas: 0, medias: 0 }, nada, nomes).acao).toBe("proximo");
  });

  it("rodada 2 só com médios → reentrega com seguir → o próximo sai com a versão nova, sem rodada nova", () => {
    const s = simular([
      { tipo: "resposta", versao: 1 },
      { tipo: "conferencia", altas: 1, medias: 2 },
      { tipo: "resposta", versao: 2 },
      { tipo: "conferencia", altas: 0, medias: 2 },
      { tipo: "decisao", lista: "seguir" },
      { tipo: "resposta", versao: 3 },
    ]);
    expect(s.rodadas).toBe(2);
    expect(s.proximo).toEqual([3]);
    expect(s.registros.at(-1)).toMatch(/GP seguiu com correção/);
    // a rodada 1 (alto) e a rodada 2 (médios, antes do "seguir") pararam e esperaram o GP
    expect(s.paradas).toHaveLength(2);
  });

  it("com corrigir na rodada 2, a reentrega reexporta o próximo passo com a versão nova", () => {
    const r = depoisDaResposta({ rodada: 2, altas: 0, medias: 1 }, true, { ...nada, corrigir: true }, nomes);
    expect(r.acao).toBe("proximo");
    expect(r.registro).toMatch(/GP seguiu com correção/);
  });

  it("rodadas evitadas: correções só de texto depois de cada rodada com médios não abrem a 3ª e a 4ª rodada", () => {
    // o caso do teste: quatro reentregas, cada uma só com achados médios na conferência anterior; o GP corrige sempre
    const eventos = [
      { tipo: "resposta" as const, versao: 1 },
      { tipo: "conferencia" as const, altas: 0, medias: 3 },
      { tipo: "resposta" as const, versao: 2 },
      { tipo: "conferencia" as const, altas: 0, medias: 2 },
      { tipo: "decisao" as const, lista: "corrigir" as const },
      { tipo: "resposta" as const, versao: 3 },
      { tipo: "resposta" as const, versao: 4 },
    ];
    const s = simular(eventos);
    // antes: cada reentrega abria uma conferência (4 rodadas); agora, 2: as rodadas 3 e 4 eram alarme falso
    expect(s.rodadas).toBe(2);
    expect(4 - s.rodadas).toBe(2);
    expect(s.proximo).toEqual([3, 4]);
  });

  it("não cria alarme nem pula decisão: achado alto da rodada 2 sem decisão para; mais uma rodada só com decisão nova", () => {
    const conf = { rodada: 2, altas: 1, medias: 0 };
    expect(depoisDaResposta(conf, true, nada, nomes).acao).toBe("parar");
    expect(depoisDaResposta(conf, true, { ...nada, maisUmaRodada: true }, nomes).acao).toBe("parar");
    expect(
      depoisDaResposta(conf, true, { ...nada, maisUmaRodada: true, decisaoNova: true }, nomes).acao,
    ).toBe("conferir");
    // rodada 1 corrigida vai à rodada 2
    expect(depoisDaResposta({ rodada: 1, altas: 0, medias: 2 }, true, nada, nomes).acao).toBe("conferir");
    // seguir sem mudar a resposta: segue com a versão conferida
    const sem = depoisDaResposta({ rodada: 1, altas: 0, medias: 2 }, false, { ...nada, seguir: true }, nomes);
    expect(sem.acao).toBe("proximo");
    expect(sem.registro).toMatch(/sem corrigir/);
  });
});
